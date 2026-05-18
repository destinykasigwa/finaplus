<?php

namespace App\Http\Controllers;

use App\Models\Agences;
use App\Models\Immobilisation;
use App\Models\TypeImmobilisation;
use App\Models\Comptes;
use App\Models\CompteurTransaction;
use App\Models\Immobilisations;
use App\Models\TauxEtDateSystem;
use App\Models\Transactions;
use App\Models\TypesImmobilistations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImmobilisationController extends Controller
{
    public function __construct()
    {
        $this->middleware("auth");
    }
    public function getImmoHomePage()
    {
        return view("eco.pages.enregistrement-imo");
    }
    public function getTypes()
    {
        return response()->json(['status' => 1, 'data' => TypesImmobilistations::all()]);
    }

    // Comptes d'immobilisations (classe 2)
    public function getComptesImmobilisations()
    {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence sélectionnée']);
        }

        $comptes = Comptes::where('niveau', 5)
            ->where('est_classe', 0)
            ->where('RefCadre', 'LIKE', '22%')
            ->where('CodeMonnaie', 1)
            ->where('CodeAgence', $codeAgence)   // ← filtre agence
            ->orderBy('NumCompte')
            ->get(['NumCompte', 'NomCompte']);
        return response()->json(['status' => 1, 'data' => $comptes]);
    }

    public function getComptesAmortissements()
    {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence sélectionnée']);
        }

        $comptes = Comptes::where('niveau', 5)
            ->where('est_classe', 0)
            ->where('RefCadre', '28')
            ->where('CodeMonnaie', 1)
            ->where('CodeAgence', $codeAgence)   // ← filtre agence
            ->orderBy('NumCompte')
            ->get(['NumCompte', 'NomCompte']);
        return response()->json(['status' => 1, 'data' => $comptes]);
    }

    public function creerImmobilisation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // 'code_immo' => 'required|unique:immobilisations',
            'nom_immo' => 'required|string',
            'date_acquisition' => 'required|date',
            'valeur_acquisition' => 'required|numeric|min:0',
            'type_immo' => 'required|exists:types_immobilisations,id',
            'duree_amortissement_ans' => 'required|integer|min:1',
            'taux_amortissement' => 'required|numeric|min:0',
            'methode_amortissement' => 'in:lineaire,degresif',
            'valeur_residuelle' => 'numeric|min:0',
            'compte_comptable_immo' => 'required|exists:comptes,NumCompte',
            'compte_comptable_amortissement' => 'required|exists:comptes,NumCompte',
            'code_agence' => 'required',
            'service_affectation' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        // 1. Génération automatique du code_immo
        $annee = date('Y');
        $prefix = 'IMO-' . $annee . '-';
        $dernier = Immobilisations::where('code_immo', 'like', $prefix . '%')
            ->orderBy('code_immo', 'desc')
            ->first();
        if ($dernier) {
            $lastNum = (int) substr($dernier->code_immo, -3);
            $newNum = $lastNum + 1;
        } else {
            $newNum = 1;
        }
        $codeImmo = $prefix . str_pad($newNum, 3, '0', STR_PAD_LEFT);

        // 2. Génération automatique du compte d'amortissement si absent
        $compteAmort = $request->compte_comptable_amortissement;
        if (empty($compteAmort) && !empty($request->compte_comptable_immo)) {
            $immoAccount = $request->compte_comptable_immo;
            $compteAmort = '28' . substr($immoAccount, 2);
        }

        $vnc = $request->valeur_acquisition - $request->valeur_residuelle;

        $immo = Immobilisations::create([
            'code_immo' => $codeImmo,
            'nom_immo' => $request->nom_immo,
            'date_acquisition' => $request->date_acquisition,
            'valeur_acquisition' => $request->valeur_acquisition,
            'duree_amortissement_ans' => $request->duree_amortissement_ans,
            'methode_amortissement' => $request->methode_amortissement,
            'taux_amortissement' => $request->taux_amortissement,
            'valeur_residuelle' => $request->valeur_residuelle ?? 0,
            'compte_comptable_immo' => $request->compte_comptable_immo,
            'compte_comptable_amortissement' => $compteAmort,
            'amortissement_cumule' => 0,
            'valeur_nette_comptable' => $vnc,
            'code_agence' => $request->code_agence,
            'service_affectation' => $request->service_affectation,

        ]);

        return response()->json(['status' => 1, 'msg' => 'Immobilisation enregistrée', 'data' => $immo]);
    }


    public function listeImmobilisations()
    {
        $user = auth()->user();
        $agences = $user->agences()->pluck('code_agence')->toArray();
        $immos = Immobilisations::whereIn('code_agence', $agences)->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 1, 'data' => $immos]);
    }

    public function modifierImmobilisation(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'code_immo' => 'required|unique:immobilisations,code_immo,' . $id,
            'nom_immo' => 'required',
            'date_acquisition' => 'required|date',
            'valeur_acquisition' => 'required|numeric|min:0',
            'type_immo' => 'required|exists:types_immobilisations,id',
            'duree_amortissement_ans' => 'required|integer|min:1',
            'taux_amortissement' => 'required|numeric|min:0',
            'valeur_residuelle' => 'numeric|min:0',
            'compte_comptable_immo' => 'required',
            'compte_comptable_amortissement' => 'required',
            'code_agence' => 'required',
            'service_affectation' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $immo = Immobilisations::find($id);
        if (!$immo) return response()->json(['status' => 0, 'msg' => 'Immobilisation introuvable']);

        $vnc = $request->valeur_acquisition - $request->valeur_residuelle;

        $immo->update([
            'code_immo' => $request->code_immo,
            'nom_immo' => $request->nom_immo,
            'date_acquisition' => $request->date_acquisition,
            'valeur_acquisition' => $request->valeur_acquisition,
            'duree_amortissement_ans' => $request->duree_amortissement_ans,
            'methode_amortissement' => $request->methode_amortissement,
            'taux_amortissement' => $request->taux_amortissement,
            'valeur_residuelle' => $request->valeur_residuelle,
            'compte_comptable_immo' => $request->compte_comptable_immo,
            'compte_comptable_amortissement' => $request->compte_comptable_amortissement,
            'valeur_nette_comptable' => $vnc,
            'code_agence' => $request->code_agence,
            'service_affectation' => $request->service_affectation,
        ]);

        return response()->json(['status' => 1, 'msg' => 'Immobilisation modifiée']);
    }

    public function supprimerImmobilisation($id)
    {
        $immo = Immobilisations::find($id);
        if (!$immo) return response()->json(['status' => 0, 'msg' => 'Immobilisation introuvable']);
        $immo->delete();
        return response()->json(['status' => 1, 'msg' => 'Supprimée']);
    }




    /**
     * Calcule et enregistre les amortissements mensuels pour toutes les immobilisations
     * (à exécuter via cron ou commande planifiée chaque mois)
     */
    public function calculerAmortissementMensuel($codeAgence = null)
    {

        // Récupérer les agences concernées
        if ($codeAgence) {
            $agences = Agences::where('code_agence', $codeAgence)->get();
        } else {
            $agences = Agences::all();
        }

        foreach ($agences as $agence) {
            // Récupérer les immobilisations de cette agence
            $immobilisations = Immobilisations::where('code_agence', $agence->code_agence)->get();

            foreach ($immobilisations as $immo) {
                // Déterminer la devise (CDF ou USD)
                $devise = (substr($immo->compte_comptable_immo, -1) == '2') ? 'CDF' : 'USD';
                $compteCharge = ($devise == 'CDF') ? $agence->compte_charge_amortissement_cdf : $agence->compte_charge_amortissement_usd;
                if (!$compteCharge) continue;

                // Calcul du montant mensuel
                $montantMensuel = $this->calculerMontantAmortissementMensuel($immo);
                if ($montantMensuel <= 0) continue;

                // Base amortissable
                $baseAmortissable = $immo->valeur_acquisition - $immo->valeur_residuelle;
                if ($immo->amortissement_cumule + $montantMensuel > $baseAmortissable) {
                    $montantMensuel = $baseAmortissable - $immo->amortissement_cumule;
                    if ($montantMensuel <= 0) continue;
                }

                // Générer l'écriture comptable
                $this->genererEcritureAmortissement($immo, $montantMensuel, $compteCharge);

                // Mettre à jour l'immobilisation
                $immo->amortissement_cumule += $montantMensuel;
                $immo->valeur_nette_comptable = $baseAmortissable - $immo->amortissement_cumule;
                $immo->save();
                return response()->json(["status" => 1]);
            }
        }
    }

    /**
     * Calcule le montant d'amortissement mensuel pour une immobilisation
     */
    private function calculerMontantAmortissementMensuel($immo)
    {
        $base = $immo->valeur_acquisition - $immo->valeur_residuelle;
        if ($base <= 0) return 0;

        if ($immo->methode_amortissement == 'lineaire') {
            $annuel = $base * ($immo->taux_amortissement / 100);
            return round($annuel / 12, 2);
        } else {
            $coefficient = $this->getCoefficientDegressif($immo->duree_amortissement_ans);
            $tauxDegressif = $immo->taux_amortissement * $coefficient;
            $annuel = $immo->valeur_nette_comptable * ($tauxDegressif / 100);
            return round($annuel / 12, 2);
        }
    }



    /**
     * Coefficient dégressif selon la durée (OHADA)
     */
    private function getCoefficientDegressif($duree)
    {
        if ($duree <= 3) return 1.5;
        if ($duree <= 5) return 2;
        return 2.5;
    }

    /**
     * Génère l'écriture comptable d'amortissement
     */
    private function genererEcritureAmortissement($immo, $montant, $compteCharge)
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $devise = (substr($immo->compte_comptable_immo, -1) == '2') ? 2 : 1; // 2 = CDF, 1 = USD
        $taux = $dataSystem->TauxEnFc;

        // Générer un numéro de transaction unique
        CompteurTransaction::create(['fakevalue' => '0000']);
        $numOperation = CompteurTransaction::latest()->first();
        $numTransaction = "AM" . str_pad($numOperation->id, 6, '0', STR_PAD_LEFT);

        // 1. Débit du compte de charge (681)
        $dataCharge = [
            'NumTransaction' => $numTransaction,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $taux,
            'TypeTransaction' => 'D',
            'CodeMonnaie' => $devise,
            'CodeAgence' => $immo->code_agence,
            'NumDossier' => 'DOS' . $numOperation->id,
            'NumDemande' => 'V' . $numOperation->id,
            'NumCompte' => $compteCharge,
            'NumComptecp' => $immo->compte_comptable_amortissement,
            'NomUtilisateur' => 'SYSTEM',
            'Libelle' => "Dotation aux amortissements - {$immo->nom_immo} ({$immo->code_immo})",
        ];
        if ($devise == 2) { // CDF
            $dataCharge['Debit'] = $montant;
            $dataCharge['Debitfc'] = $montant;
            $dataCharge['Debitusd'] = $montant / $taux;
        } else { // USD
            $dataCharge['Debit'] = $montant;
            $dataCharge['Debitusd'] = $montant;
            $dataCharge['Debitfc'] = $montant * $taux;
        }
        Transactions::create($dataCharge);

        // 2. Crédit du compte d'amortissement cumulé (28)
        $dataAmort = [
            'NumTransaction' => $numTransaction,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $taux,
            'TypeTransaction' => 'C',
            'CodeMonnaie' => $devise,
            'CodeAgence' => $immo->code_agence,
            'NumDossier' => 'DOS' . $numOperation->id,
            'NumDemande' => 'V' . $numOperation->id,
            'NumCompte' => $immo->compte_comptable_amortissement,
            'NumComptecp' => $compteCharge,
            'NomUtilisateur' => 'SYSTEM',
            'Libelle' => "Dotation aux amortissements - {$immo->nom_immo} ({$immo->code_immo})",
        ];
        if ($devise == 2) { // CDF
            $dataAmort['Credit'] = $montant;
            $dataAmort['Creditfc'] = $montant;
            $dataAmort['Creditusd'] = $montant / $taux;
        } else { // USD
            $dataAmort['Credit'] = $montant;
            $dataAmort['Creditusd'] = $montant;
            $dataAmort['Creditfc'] = $montant * $taux;
        }
        Transactions::create($dataAmort);
    }


// private function calculerMontantAmortissementMensuel($immo)
// {
//     $base = $immo->valeur_acquisition - $immo->valeur_residuelle;
//     if ($base <= 0) return 0;

//     // Nombre de mois dans la première année (prorata)
//     $dateAcq = new \DateTime($immo->date_acquisition);
//     $now = new \DateTime();
//     $moisDansAnnee = 12; // par défaut, on prend 12 mois pleins
//     // Si c'est la première année et que l'acquisition n'est pas le 1er jour du mois
//     // vous pouvez calculer le nombre de mois restants dans l'année.

//     if ($immo->methode_amortissement == 'lineaire') {
//         $annuel = $base * ($immo->taux_amortissement / 100);
//         $mensuel = $annuel / 12;
//     } else { // dégressif
//         $coefficient = $this->getCoefficientDegressif($immo->duree_amortissement_ans);
//         $tauxDegressif = $immo->taux_amortissement * $coefficient;
//         $annuel = $immo->valeur_nette_comptable * ($tauxDegressif / 100);
//         $mensuel = $annuel / 12;
//     }

//     return round($mensuel, 2);
// }









    /**
     * Génère les comptes d'amortissement (28) pour toutes les agences et les deux devises.
     * À exécuter une seule fois (ex: après installation).
     */
    public function genererComptesAmortissement()
    {
        $categories = [
            '220'  => 'Immeubles d\'exploitation',
            '2230' => 'Matériel roulant',
            '2231' => 'Matériel informatique',
            '2232' => 'Matériel de bureau',
            '2233' => 'Autres matériels',
            '2234' => 'Mobilier de bureau',
            '2235' => 'Autres mobiliers',
        ];

        $agences = Agences::all();
        foreach ($agences as $agence) {
            $codeAgence = $agence->code_agence;
            foreach ($categories as $parent => $nom) {
                // Compte amortissement CDF (suffixe 2)
                $numCDF = '282' . substr($parent, -2) . $codeAgence . '2';
                if (!Comptes::where('NumCompte', $numCDF)->exists()) {
                    Comptes::create([
                        'CodeAgence'    => $codeAgence,
                        'NumCompte'     => $numCDF,
                        'NomCompte'     => $nom . ' (Amortissement CDF)',
                        'RefTypeCompte' => '2',
                        'RefCadre'      => '28',
                        'RefGroupe'     => '282',
                        'RefSousGroupe' => substr($numCDF, 0, 4),
                        'CodeMonnaie'   => 2,
                        'nature_compte' => 'ACTIF',
                        'niveau'        => 5,
                        'est_classe'    => 0,
                        'compte_parent' => $parent,
                    ]);
                }
                // Compte amortissement USD (suffixe 1)
                $numUSD = '282' . substr($parent, -2) . $codeAgence . '1';
                if (!Comptes::where('NumCompte', $numUSD)->exists()) {
                    Comptes::create([
                        'CodeAgence'    => $codeAgence,
                        'NumCompte'     => $numUSD,
                        'NomCompte'     => $nom . ' (Amortissement USD)',
                        'RefTypeCompte' => '2',
                        'RefCadre'      => '28',
                        'RefGroupe'     => '282',
                        'RefSousGroupe' => substr($numUSD, 0, 4),
                        'CodeMonnaie'   => 1,
                        'nature_compte' => 'ACTIF',
                        'niveau'        => 5,
                        'est_classe'    => 0,
                        'compte_parent' => $parent,
                    ]);
                }
            }
        }
    }


    //GET RAPPORT IMMO HOME PAGE 
    public function getRapportImmoHomage()
    {
        return view("eco.pages.rapport-immo");
    }


    // public function rapportImmobilisations()
    // {
    //     $user = auth()->user();
    //     $agences = $user->agences()->pluck('code_agence')->toArray();

    //     $immobilisations = Immobilisations::with('type')
    //         ->whereIn('code_agence', $agences)
    //         ->orderBy('created_at', 'desc')
    //         ->get();

    //     return response()->json(['status' => 1, 'data' => $immobilisations]);
    // }



    public function getCategories()
    {
        $categories = TypesImmobilistations::all(['id', 'nom_type']);
        return response()->json(['status' => 1, 'data' => $categories]);
    }


    public function getServices(Request $request)
    {
        $user = auth()->user();
        $agenceFilter = $request->agence_filter ?? 'current';
        $codeAgence = null;

        if ($agenceFilter === 'current') {
            $currentAgence = session('current_agence');
            $codeAgence = $currentAgence['code_agence'] ?? null;
        } elseif ($agenceFilter !== 'all') {
            $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
            $codeAgence = $agence ? $agence->code_agence : null;
        }

        $query = Immobilisations::whereNotNull('service_affectation');
        if ($codeAgence) {
            $query->where('code_agence', $codeAgence);
        }

        $services = $query->distinct()->pluck('service_affectation');
        return response()->json(['status' => 1, 'data' => $services]);
    }

    // public function getRapportImmobilisations(Request $request)
    // {
    //     $dateDebut = $request->date_debut;
    //     $dateFin = $request->date_fin;
    //     $devise = $request->devise;
    //     $categorie = $request->categorie;
    //     $service = $request->service;
    //     $agenceFilter = $request->agence_filter ?? 'current';

    //     // Récupération de l'agence (ou null pour toutes)
    //    $user = auth()->user();
    //     $agenceFilter = $request->agence_filter ?? 'current';
    //     $codeAgence = null;

    //     if ($agenceFilter === 'current') {
    //         $currentAgence = session('current_agence');
    //         $codeAgence = $currentAgence['code_agence'] ?? null;
    //     } elseif ($agenceFilter !== 'all') {
    //         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
    //         $codeAgence = $agence ? $agence->code_agence : null;
    //     }

    //     $query = Immobilisations::with('type')
    //         ->when($codeAgence, fn($q) => $q->where('code_agence', $codeAgence))
    //         ->when($categorie, fn($q) => $q->where('type_immo', $categorie))
    //         ->when($service, fn($q) => $q->where('service_affectation', $service))
    //         ->when($dateDebut && $dateFin, fn($q) => $q->whereBetween('date_acquisition', [$dateDebut, $dateFin]))
    //         ->orderBy('date_acquisition', 'desc');

    //     // Filtrage par devise via le compte comptable (dernier caractère)
    //     if ($devise === 'USD') {
    //         $query->where('compte_comptable_immo', 'like', '%1');
    //     } else {
    //         $query->where('compte_comptable_immo', 'like', '%2');
    //     }

    //     $immobilisations = $query->get();
   

    //     // Calcul des valeurs nettes si nécessaire (déjà stockées)
    //     return response()->json(['status' => 1, 'data' => $immobilisations]);
    // }

    public function getRapportImmobilisations(Request $request)
{
    $dateDebut = $request->date_debut;
    $dateFin = $request->date_fin;
    $devise = $request->devise;
    $categorie = $request->categorie;
    $service = $request->service;
    $agenceFilter = $request->agence_filter ?? 'current';

    $user = auth()->user();
    $codeAgence = null;

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
    } elseif ($agenceFilter !== 'all') {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        $codeAgence = $agence ? $agence->code_agence : null;
    }

    $query = Immobilisations::with('type');

    if ($codeAgence) {
        $query->where('code_agence', $codeAgence);
    }
    if ($categorie) {
        $query->where('type_immo', $categorie);
    }
    if ($service) {
        $query->where('service_affectation', $service);
    }
    if ($dateDebut && $dateFin) {
        $query->whereBetween('date_acquisition', [$dateDebut, $dateFin]);
    }
    if ($devise === 'USD') {
        $query->where('compte_comptable_immo', 'like', '%1');
    } else {
        $query->where('compte_comptable_immo', 'like', '%2');
    }

    $immobilisations = $query->orderBy('date_acquisition', 'desc')->get();

    // Debug : renvoyer aussi le nombre
    return response()->json([
        'status' => 1,
        'data' => $immobilisations,
        'debug_count' => $immobilisations->count()
    ]);
}
}
