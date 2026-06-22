<?php

namespace App\Http\Controllers;

use App\Constants\JournalType;
use App\Models\BatchPaiement;
use App\Models\BatchPaiementLigne;
use App\Models\Comptes;
use App\Models\Transactions;
use App\Models\TauxEtDateSystem;
use App\Models\CompteurTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\BatchPaiementImport;
use App\Jobs\ExecuterBatchPaiement;
use App\Services\SendNotification;

class BatchPaiementController extends Controller
{
    protected $sendNotification;

    public function __construct(SendNotification $sendNotification)
    {
        $this->sendNotification = $sendNotification;
        $this->middleware('auth');
    }

    public function getPaimentBatch()
    {
        return view("eco.pages.paiement-batch");
    }


    public function GestionBatchHomePage()
    {
        return view("eco.pages.gestion-batch");
    }
    

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Récupère le solde d'un compte (CDF ou USD) selon sa devise.
     */
    private function getSoldeCompte($numCompte, $codeMonnaie)
    {
        $debitCol = ($codeMonnaie == 1) ? 'Debitusd' : 'Debitfc';
        $creditCol = ($codeMonnaie == 1) ? 'Creditusd' : 'Creditfc';

        $solde = Transactions::where('NumCompte', $numCompte)
            ->where('CodeMonnaie', $codeMonnaie)
            ->select(DB::raw("SUM($creditCol) - SUM($debitCol) as solde"))
            ->value('solde');
        return $solde ?? 0;
    }

    /**
     * Vérifie que le solde d'un compte est suffisant.
     */
    private function verifierSoldeSuffisant($numCompte, $codeMonnaie, $montant)
    {
        $solde = $this->getSoldeCompte($numCompte, $codeMonnaie);
        return $solde >= $montant;
    }

    /**
     * Génère un numéro de transaction unique (format: BP + année + mois + jour + séquentiel).
     */
    private function genererNumTransaction()
    {
        CompteurTransaction::create(['fakevalue' => '0000']);
        $dernier = CompteurTransaction::latest()->first();
        return 'BP' . str_pad($dernier->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Génère la référence du batch (format: BATCH-2025-001).
     */
    private function genererReferenceBatch()
    {
        $annee = date('Y');
        $dernier = BatchPaiement::whereYear('created_at', $annee)
            ->orderBy('id', 'desc')
            ->first();
        if ($dernier) {
            $num = (int) substr($dernier->reference, -3) + 1;
        } else {
            $num = 1;
        }
        return 'BATCH-' . $annee . '-' . str_pad($num, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Calcule la devise à partir du numéro de compte (dernier chiffre).
     */
    private function determinerDeviseParCompte($numCompte)
    {
        if (substr($numCompte, -1) == '1') return 1; // USD
        if (substr($numCompte, -1) == '2') return 2; // CDF
        return null; // indéterminée
    }

    /**
     * Crée une transaction interne (débit d’un compte, crédit d’un autre).
     */
    private function creerTransactionInterne($compteDebit, $compteCredit, $montant, $devise, $libelle, $numDossier = null)
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $taux = $dataSystem->TauxEnFc;
        $numTransaction = $this->genererNumTransaction();

        $debitCol = ($devise == 1) ? 'Debitusd' : 'Debitfc';
        $creditCol = ($devise == 1) ? 'Creditusd' : 'Creditfc';

        // Débit
        Transactions::create([
            'NumTransaction' => $numTransaction,
            "RefJournal" => JournalType::PAIEMENT,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $taux,
            'TypeTransaction' => 'D',
            'CodeMonnaie' => $devise,
            'CodeAgence' => null, // à adapter si nécessaire
            'NumDossier' => $numDossier,
            'NumCompte' => $compteDebit,
            'NumComptecp' => $compteCredit,
            'Debit' => $montant,
            $debitCol => $montant,
            'NomUtilisateur' => auth()->user()->name,
            'Libelle' => $libelle,
        ]);

        // Crédit
        Transactions::create([
            'NumTransaction' => $numTransaction,
            "RefJournal" => JournalType::PAIEMENT,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $taux,
            'TypeTransaction' => 'C',
            'CodeMonnaie' => $devise,
            'CodeAgence' => null,
            'NumDossier' => $numDossier,
            'NumCompte' => $compteCredit,
            'NumComptecp' => $compteDebit,
            'Credit' => $montant,
            $creditCol => $montant,
            'NomUtilisateur' => auth()->user()->name,
            'Libelle' => $libelle,
        ]);

        return $numTransaction;
    }

    // ==================== WORKFLOW BATCH ====================

    /**
     * Étape 1: Upload et création du batch (brouillon).
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fichier' => 'required|file|mimes:xlsx,csv',
            // 'compte_id' => 'required|exists:comptes,RefCompte',
            'compte_num' => 'required|exists:comptes,NumCompte'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        // $comptePrincipal = Comptes::where('RefCompte', $request->compte_id)->first();
        $comptePrincipal = Comptes::where('NumCompte', $request->compte_num)->first();
        if (!$comptePrincipal) {
            return response()->json(['status' => 0, 'msg' => 'Compte principal introuvable']);
        }

        // Vérifier que le compte principal appartient à l'utilisateur (via agence)
        $userAgences = auth()->user()->agences()->pluck('code_agence')->toArray();
        if (!in_array($comptePrincipal->CodeAgence, $userAgences)) {
            return response()->json(['status' => 0, 'msg' => 'Ce compte ne vous appartient pas']);
        }

        // Sauvegarde du fichier
        $file = $request->file('fichier');
        $hash = hash_file('sha256', $file->path());
        $existing = BatchPaiement::where('hash_fichier', $hash)->first();
        if ($existing) {
            return response()->json(['status' => 0, 'msg' => 'Ce fichier a déjà été importé (batch ' . $existing->reference . ')']);
        }
        $path = $file->store('batchs', 'public');

        // Lecture et validation des lignes via Excel
        $import = new BatchPaiementImport();
        $rows = Excel::toArray($import, $file)[0];
        if (empty($rows)) {
            return response()->json(['status' => 0, 'msg' => 'Le fichier est vide']);
        }

        // Préparer les lignes avec validation métier
        $lignesValides = [];
        $totalMontant = 0;

        $compteDevise = $this->determinerDeviseParCompte($comptePrincipal->NumCompte);
        if (!$compteDevise) {
            return response()->json(['status' => 0, 'msg' => 'Impossible de déterminer la devise du compte principal']);
        }

        $rows = Excel::toArray($import, $file)[0];

        foreach ($rows as $row) {
            $compteBenef = $row['compte'] ?? null;
            $montant = (float) ($row['montant'] ?? 0);
            $reference = $row['reference'] ?? null;
            $nom = $row['nom'] ?? null;
            $telephone = $row['telephone'] ?? null;
            // ... le reste de la validation

            $valid = true;
            $message = null;

            if (empty($compteBenef) || $montant <= 0) {
                $valid = false;
                $message = 'Compte ou montant invalide';
            } else {
                // Vérifier que le compte bénéficiaire existe et est actif
                $beneficiaire = Comptes::where('NumCompte', $compteBenef)->first();
                if (!$beneficiaire) {
                    $valid = false;
                    $message = 'Compte bénéficiaire inexistant';
                } elseif ($beneficiaire->est_classe != 0) {
                    $valid = false;
                    $message = 'Ce n’est pas un compte de client';
                } else {
                    // Vérifier la devise (doit correspondre à celle du compte principal)
                    $deviseBenef = $this->determinerDeviseParCompte($compteBenef);
                    if ($deviseBenef != $compteDevise) {
                        $valid = false;
                        $message = 'Devise différente de celle du compte principal';
                    }
                }
            }

            $lignesValides[] = [
                'compte' => $compteBenef,
                'montant' => $montant,
                'reference' => $reference,
                'nom' => $nom,
                'telephone' => $telephone,
                'statut' => $valid ? 'en_attente' : 'echec',
                'message_erreur' => $message,
            ];
            if ($valid) {
                $totalMontant += $montant;
            }
        }

        // Vérifier le solde du compte principal
        $soldePrincipal = $this->getSoldeCompte($comptePrincipal->NumCompte, $compteDevise);

        if (abs($soldePrincipal) < $totalMontant) {
            return response()->json(['status' => 0, 'msg' => 'Solde insuffisant sur le compte principal']);
        }

        // Création du batch
        DB::beginTransaction();
        try {
            $batch = BatchPaiement::create([
                'reference' => $this->genererReferenceBatch(),
                'compte_id' => $comptePrincipal->RefCompte,
                'total_montant' => $totalMontant,
                'total_lignes' => count($rows),
                'statut' => 'brouillon',
                'cree_par' => auth()->id(),
                'fichier_original' => $path,
                'hash_fichier' => $hash,
                'observations' => $request->observations,
            ]);

            foreach ($lignesValides as $ligne) {
                BatchPaiementLigne::create([
                    'batch_id' => $batch->id,
                    'compte' => $ligne['compte'],
                    'telephone' => $ligne['telephone'],
                    'montant' => $ligne['montant'],
                    'reference' => $ligne['reference'],
                    'nom' => $ligne['nom'],
                    'statut' => $ligne['statut'],
                    'message_erreur' => $ligne['message_erreur'],
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 1,
                'msg' => 'Batch créé avec succès (brouillon)',
                'batch' => $batch,
                'previsualisation' => $this->getPrevisualisation($batch->id)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 0, 'msg' => 'Erreur lors de la création du batch: ' . $e->getMessage()]);
        }
    }

    /**
     * Étape 2: Prévisualisation d'un batch.
     */
    public function previsualisation($id)
    {
        $batch = BatchPaiement::with('lignes')->find($id);
        if (!$batch) {
            return response()->json(['status' => 0, 'msg' => 'Batch introuvable']);
        }
        return response()->json(['status' => 1, 'data' => $this->getPrevisualisation($id)]);
    }

    private function getPrevisualisation($batchId)
    {


        $batch = BatchPaiement::with('lignes')->find($batchId);

        if (!$batch->compte) {
            return response()->json(['status' => 0, 'msg' => 'Compte associé au batch introuvable']);
        }
        $lignesAttente = $batch->lignes->where('statut', 'en_attente');
        $lignesEchec = $batch->lignes->where('statut', 'echec');

        return [
            'batch' => $batch,
            'total_lignes' => $batch->total_lignes,
            'lignes_acceptees' => $lignesAttente->count(),
            'lignes_rejetees' => $lignesEchec->count(),
            'montant_total' => $batch->total_montant,
            'solde_compte' => $this->getSoldeCompte($batch->compte->NumCompte, $this->determinerDeviseParCompte($batch->compte->NumCompte)),
            'lignes' => $lignesAttente->values(),
            'rejets' => $lignesEchec->values(),
        ];
    }

    /**
     * Étape 3: Soumettre le batch à validation (changement de statut).
     */
    public function soumettreValidation($id)
    {
        $batch = BatchPaiement::find($id);
        if (!$batch) return response()->json(['status' => 0, 'msg' => 'Batch introuvable']);
        if ($batch->statut !== 'brouillon') {
            return response()->json(['status' => 0, 'msg' => 'Batch déjà soumis ou traité']);
        }
        $batch->statut = 'en_attente';
        $batch->save();

        // Optionnel: envoyer une notification au validateur
        return response()->json(['status' => 1, 'msg' => 'Batch soumis à validation']);
    }

    /**
     * Étape 4: Valider le batch (validation hiérarchique simple).
     */
    public function validerBatch($id, Request $request)
    {
        $batch = BatchPaiement::find($id);
        if (!$batch) return response()->json(['status' => 0, 'msg' => 'Batch introuvable']);
        if ($batch->statut !== 'en_attente') {
            return response()->json(['status' => 0, 'msg' => 'Batch non soumis à validation']);
        }

        // Ici, vous pouvez implémenter une règle de validation (ex: seul un manager peut valider)
        $user = auth()->user();
        // Exemple: vérifier que l'utilisateur a le rôle 'validateur'
        // if (!$user->hasRole('validateur')) { ... }

        $batch->statut = 'valide';
        $batch->valide_par = $user->id;
        $batch->save();

        return response()->json(['status' => 1, 'msg' => 'Batch validé avec succès']);
    }

    /**
     * Étape 5: Exécuter le batch (asynchrone).
     */
    public function executerBatch($id)
    {
        $batch = BatchPaiement::find($id);
        if (!$batch) return response()->json(['status' => 0, 'msg' => 'Batch introuvable']);
        if ($batch->statut !== 'valide') {
            return response()->json(['status' => 0, 'msg' => 'Le batch doit être validé avant exécution']);
        }

        $user = auth()->user();
        if ($user->admin !== 1) {
            return response()->json(['status' => 0, 'msg' => 'Seul un administrateur peut exécuter un batch']);
        }

        // Lancer le job en queue
        ExecuterBatchPaiement::dispatch($batch->id, auth()->id());
        // $batch->statut = 'en_cours';
        $batch->execute_par = auth()->id();
        $batch->save();

        return response()->json(['status' => 1, 'msg' => 'Batch en cours d’exécution']);
    }

    /**
     * Récupérer l'historique des batchs.
     */
    public function historique()
    {


        $batchs = BatchPaiement::with(['createur', 'validateur', 'executeur'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json(['status' => 1, 'data' => $batchs]);
    }

    /**
     * Détail d'un batch.
     */
    public function detail($id)
    {
        $batch = BatchPaiement::with(['lignes', 'compte', 'createur', 'validateur', 'executeur'])->find($id);
        if (!$batch) return response()->json(['status' => 0, 'msg' => 'Batch introuvable']);
        return response()->json(['status' => 1, 'data' => $batch]);
    }


    public function comptesDisponibles()
    {
        $user = auth()->user();
        $agenceIds = $user->agences()->pluck('code_agence')->toArray();
        $comptes = Comptes::whereIn('CodeAgence', $agenceIds)
            ->where('est_classe', 0)  // comptes individuels
            ->whereIn('RefCadre', ['42']) // ex: caisse (5) ou immobilisations (2)
            ->where('niveau', 5)
            ->orderBy('NumCompte')
            ->get(['RefCompte', 'NumCompte', 'NomCompte', 'CodeMonnaie']);
        // Ajouter le solde de chaque compte
        foreach ($comptes as $compte) {
            $solde = $this->getSoldeCompte($compte->NumCompte, $compte->CodeMonnaie);
            $compte->solde = abs($solde);
        }
        return response()->json(['status' => 1, 'data' => $comptes]);
    }


    public function preview(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fichier' => 'required|file|mimes:xlsx,csv',
            'compte_num' => 'required|exists:comptes,NumCompte',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $comptePrincipal = Comptes::where('NumCompte', $request->compte_num)->first();
        if (!$comptePrincipal) {
            return response()->json(['status' => 0, 'msg' => 'Compte principal introuvable']);
        }
        $devise = $this->determinerDeviseParCompte($comptePrincipal->NumCompte);
        $file = $request->file('fichier');
        $import = new BatchPaiementImport();
        $rows = Excel::toArray($import, $file)[0];

        $lignes = [];
        foreach ($rows as $row) {
            $compteBenef = $row['compte'] ?? null;
            $montant = (float) ($row['montant'] ?? 0);
            $reference = $row['reference'] ?? null;
            $nom = $row['nom'] ?? null;
            $telephone = $row['telephone'] ?? null;
            $matricule = $row['matricule'] ?? null; // si présent

            // Validation
            $valid = true;
            $message = null;
            if (empty($compteBenef) || $montant <= 0) {
                $valid = false;
                $message = 'Compte ou montant invalide';
            } else {
                $beneficiaire = Comptes::where('NumCompte', $compteBenef)->first();
                if (!$beneficiaire) {
                    $valid = false;
                    $message = 'Compte bénéficiaire inexistant';
                } elseif ($beneficiaire->est_classe != 0) {
                    $valid = false;
                    $message = 'Ce n’est pas un compte client';
                } else {
                    $deviseBenef = $this->determinerDeviseParCompte($compteBenef);
                    if ($deviseBenef != $devise) {
                        $valid = false;
                        $message = 'Devise différente de celle du compte principal';
                    }
                }
            }

            $lignes[] = [
                'matricule' => $matricule,
                'nom' => $nom,
                'compte' => $compteBenef,
                'telephone' => $telephone,
                'montant' => $montant,
                'reference' => $reference,
                'statut' => $valid ? 'en_attente' : 'echec',
                'message_erreur' => $message,
            ];
        }

        $totalMontant = collect($lignes)->where('statut', 'en_attente')->sum('montant');
        return response()->json([
            'status' => 1,
            'data' => [
                'lignes' => $lignes,
                'total_lignes' => count($rows),
                'lignes_acceptees' => collect($lignes)->where('statut', 'en_attente')->count(),
                'lignes_rejetees' => collect($lignes)->where('statut', 'echec')->count(),
                'montant_total' => $totalMontant,
                'solde_compte' => $this->getSoldeCompte($comptePrincipal->NumCompte, $devise),
            ]
        ]);
    }



    public function historiqueAdmin(Request $request)
    {
        $query = BatchPaiement::with(['createur', 'validateur', 'executeur', 'compte'])
            ->orderBy('created_at', 'desc');

        if (auth()->user()->admin !== 1) {
            $query->where('cree_par', auth()->id());
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // $batches = $query->get(); // ← retourne une collection, pas une pagination
        $batches = $query->paginate(100); // 20 par page
        return response()->json(['status' => 1, 'data' => $batches]);
    }

    public function detailAdmin($id)
    {
        $batch = BatchPaiement::with(['lignes', 'compte', 'createur', 'validateur', 'executeur'])
            ->find($id);

        if (!$batch) {
            return response()->json(['status' => 0, 'msg' => 'Batch introuvable']);
        }

        // Sécurité : seul l'admin ou le créateur peut voir le batch
        if (auth()->user()->admin !== 1 && $batch->cree_par !== auth()->id()) {
            return response()->json(['status' => 0, 'msg' => 'Accès non autorisé']);
        }

        return response()->json(['status' => 1, 'data' => $batch]);
    }


    public function rejeter(Request $request, $id)
    {
        // 1. Valider les données entrantes
        $request->validate([
            'motif' => 'required|string|max:255',
        ]);

        // 2. Démarrer une transaction (optionnel, mais conseillé)
        DB::beginTransaction();

        try {
            // 3. Récupérer le batch
            $batch = BatchPaiement::find($id);
            if (!$batch) {
                return response()->json([
                    'status' => 0,
                    'msg' => 'Batch introuvable'
                ], 404);
            }

            // 4. Vérifier si le batch peut être rejeté (ex: statut = "en_attente" ou "en_cours")
            if (!in_array($batch->statut, ['en_attente', 'en_cours'])) {
                return response()->json([
                    'status' => 0,
                    'msg' => 'Ce batch ne peut pas être rejeté (statut actuel : ' . $batch->statut . ')'
                ], 422);
            }

            // 5. Mettre à jour le batch
            $batch->statut = 'rejete';
            $batch->observations = $request->motif;
            $batch->date_execution = now();
            // optionnel : enregistrer l'utilisateur qui a rejeté
            // $batch->rejete_par = auth()->id();
            $batch->save();

            // 6. (Optionnel) Ajouter une trace dans un log ou une table d'historique
            // Historique::create([...]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'msg' => 'Batch rejeté avec succès'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'msg' => 'Erreur lors du rejet : ' . $e->getMessage()
            ], 500);
        }
    }
}
