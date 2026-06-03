<?php

namespace App\CustomTasks;

use App\Models\Portefeuille;
use App\Models\Echeancier;
use App\Models\Transactions;
use App\Models\Remboursementcredit;
use App\Models\Comptes;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\SendNotification;

class GestionInteretsRetard
{
    protected $dateSystem;
    protected $tauxDuJour;                 // taux de change du jour
    protected $tauxPenaliteJournalier;     // 0.01% par jour = 0.0001
    protected $delaiAvantPenalite;         // jours de grâce avant application
    protected $sendNotification;

    /**
     * Constructeur
     * @param string $dateSystem Date système (Y-m-d)
     * @param float $tauxDuJour Taux de change du jour
     * @param int $delaiAvantPenalite Jours de grâce (ex: 15)
     */
    public function __construct($dateSystem, $tauxDuJour, $delaiAvantPenalite = 0)
    {
        $this->dateSystem = $dateSystem;
        $this->tauxDuJour = $tauxDuJour;
        
        // Taux de pénalité : 0.1% par jour = 0.1 en décimal
        $this->tauxPenaliteJournalier = 0.001;
        
        // Délai de grâce avant application des pénalités
        $this->delaiAvantPenalite = $delaiAvantPenalite;
        
        $this->sendNotification = app(SendNotification::class);
    }

    /**
     * Point d'entrée principal : calcule et applique les pénalités pour tous les crédits en retard
     */
    public function execute()
    {
        $creditsEnRetard = $this->recupererCreditsEnRetard();
        foreach ($creditsEnRetard as $credit) {
            $this->traiterPenalitesCredit($credit);
        }
    }

    /**
     * Récupère les crédits ayant au moins une échéance en retard impayée
     */
    protected function recupererCreditsEnRetard()
    {
        $today = $this->dateSystem;
        
        return Portefeuille::where('Cloture', 0)
            ->where('Octroye', 1)
            ->where('Radie', 0)
            ->whereExists(function ($query) use ($today) {
                $query->select(DB::raw(1))
                    ->from('echeanciers')
                    ->whereColumn('echeanciers.NumDossier', 'portefeuilles.NumDossier')
                    ->where('echeanciers.DateTranch', '<', $today)
                    ->where('echeanciers.Reechelonne', 0)
                    ->where(function ($q) {
                        $q->whereRaw('echeanciers.CapAmmorti - COALESCE((
                            SELECT SUM(CapitalPaye) FROM remboursementcredits 
                            WHERE RefEcheance = echeanciers.ReferenceEch
                        ), 0) > 0')
                        ->orWhereRaw('echeanciers.Interet - COALESCE((
                            SELECT SUM(InteretPaye) FROM remboursementcredits 
                            WHERE RefEcheance = echeanciers.ReferenceEch
                        ), 0) > 0');
                    });
            })
            ->get();
    }

    /**
     * Traite les pénalités pour un crédit
     */
    protected function traiterPenalitesCredit($credit)
    {
        // Récupérer l'historique des pénalités
        $suiviPenalites = DB::table('penalites_suivi')
            ->where('NumDossier', $credit->NumDossier)
            ->first();
        
        $derniereDateCalcul = $suiviPenalites->DateDernierCalcul ?? $credit->DateEcheance;
        
        // Calculer le nombre de jours depuis le dernier calcul
        $nbJours = Carbon::parse($this->dateSystem)->diffInDays(Carbon::parse($derniereDateCalcul));
        
        if ($nbJours <= 0) {
            return;
        }
        
        // Calculer le montant total échu impayé (capital + intérêts)
        $montantEchuImpaye = $this->calculerMontantEchuImpaye($credit->NumDossier);
        
        if ($montantEchuImpaye <= 0) {
            $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0);
            return;
        }
        
        // Récupérer le nombre de jours de retard effectif
        $joursRetard = $this->calculerJoursRetardCredit($credit->NumDossier);
        
        // Appliquer le délai de grâce
        $joursPenalisables = max(0, $joursRetard - $this->delaiAvantPenalite);
        
        if ($joursPenalisables <= 0) {
            $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0);
            return;
        }
        
        // Calculer la pénalité
        $penalite = $montantEchuImpaye * $this->tauxPenaliteJournalier * $joursPenalisables;
        $penalite = round($penalite, 2);
        
        if ($penalite <= 0) {
            return;
        }
        
        // Enregistrer l'écriture comptable
        $this->enregistrerPenalite($credit, $penalite);
        
        // Mettre à jour le suivi
        $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, $penalite);
        
        // Notification au client
        $this->sendNotification->sendNotificationRemboursementCredit(
            $credit->numAdherant,
            $credit->CodeMonnaie,
            $penalite,
            "Pénalités de retard",
            "partiel"
        );
    }

    /**
     * Calcule le montant total échu impayé (capital + intérêts restants)
     */
    protected function calculerMontantEchuImpaye($numDossier)
    {
        $today = $this->dateSystem;
        
        $echeances = Echeancier::where('NumDossier', $numDossier)
            ->where('DateTranch', '<', $today)
            ->where('Reechelonne', 0)
            ->get();
        
        $totalEchuImpaye = 0;
        foreach ($echeances as $echeance) {
            $capitalPaye = Remboursementcredit::where('RefEcheance', $echeance->ReferenceEch)
                ->sum('CapitalPaye') ?? 0;
            $interetPaye = Remboursementcredit::where('RefEcheance', $echeance->ReferenceEch)
                ->sum('InteretPaye') ?? 0;
            
            $capitalRestant = $echeance->CapAmmorti - $capitalPaye;
            $interetRestant = $echeance->Interet - $interetPaye;
            
            $totalEchuImpaye += max(0, $capitalRestant) + max(0, $interetRestant);
        }
        
        return $totalEchuImpaye;
    }

    /**
     * Calcule le nombre de jours de retard maximum pour un crédit
     */
    protected function calculerJoursRetardCredit($numDossier)
    {
        $today = $this->dateSystem;
        
        $result = Echeancier::where('NumDossier', $numDossier)
            ->where('DateTranch', '<', $today)
            ->where('Reechelonne', 0)
            ->where(function ($q) {
                $q->whereRaw('CapAmmorti - COALESCE((
                    SELECT SUM(CapitalPaye) FROM remboursementcredits 
                    WHERE RefEcheance = echeanciers.ReferenceEch
                ), 0) > 0')
                ->orWhereRaw('Interet - COALESCE((
                    SELECT SUM(InteretPaye) FROM remboursementcredits 
                    WHERE RefEcheance = echeanciers.ReferenceEch
                ), 0) > 0');
            })
            ->min('DateTranch');
        
        if (!$result) {
            return 0;
        }
        
        $diff = Carbon::parse($today)->diffInDays(Carbon::parse($result));
        return max(1, $diff);
    }

    /**
     * Met à jour le suivi des pénalités
     */
    protected function mettreAJourSuiviPenalites($numDossier, $dateDernierCalcul, $penaliteAjoutee = 0)
    {
        DB::table('penalites_suivi')->updateOrInsert(
            ['NumDossier' => $numDossier],
            [
                'DateDernierCalcul' => $dateDernierCalcul,
                'TotalPenalites' => DB::raw("COALESCE(TotalPenalites, 0) + $penaliteAjoutee"),
                'updated_at' => now()
            ]
        );
    }

    /**
     * Obtient ou crée le compte de pénalités pour une agence et une devise
     */
    protected function getComptePenalite($codeAgence, $codeMonnaie)
    {
        $codeAgencePad = str_pad($codeAgence, 2, '0', STR_PAD_LEFT);
        if ($codeMonnaie == 'USD') {
            $numCompte = "7120000000" . $codeAgencePad . "1";
            $nomCompte = "Pénalités de retard USD - Agence " . $codeAgence;
        } else {
            $numCompte = "7121000000" . $codeAgencePad . "2";
            $nomCompte = "Pénalités de retard CDF - Agence " . $codeAgence;
        }

        $this->ensureAccountExists($numCompte, $nomCompte, 'PRODUIT', $codeAgence, $codeMonnaie == 'USD' ? 1 : 2);
        return $numCompte;
    }

    /**
     * Crée un compte s'il n'existe pas déjà
     */
    private function ensureAccountExists($numCompte, $nomCompte, $nature, $codeAgence, $codeMonnaie)
    {
        if (!Comptes::where('NumCompte', $numCompte)->exists()) {
            $refTypeCompte = substr($numCompte, 0, 1);
            $refCadre = substr($numCompte, 0, 2);
            $refGroupe = substr($numCompte, 0, 3);
            $refSousGroupe = substr($numCompte, 0, 4);
            Comptes::create([
                'CodeAgence'    => $codeAgence,
                'NumCompte'     => $numCompte,
                'NomCompte'     => $nomCompte,
                'RefTypeCompte' => $refTypeCompte,
                'RefCadre'      => $refCadre,
                'RefGroupe'     => $refGroupe,
                'RefSousGroupe' => $refSousGroupe,
                'CodeMonnaie'   => $codeMonnaie,
                'DateOuverture' => date('Y-m-d'),
                'NumAdherant'   => null,
                'nature_compte' => $nature,
                'niveau'        => 5,
                'est_classe'    => 0,
                'compte_parent' => $refSousGroupe,
            ]);
        }
    }

    /**
     * Enregistre l'écriture comptable de pénalité
     */
    protected function enregistrerPenalite($credit, $montant)
    {
        if ($montant <= 0) return;
        
        $devise = ($credit->CodeMonnaie == 'USD') ? 1 : 2;
        $numTransaction = $this->generateTransactionNumber();
        $comptePenalite = $this->getComptePenalite($credit->CodeAgence, $credit->CodeMonnaie);
        
        // 1. Débit du compte épargne du client
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $credit->CodeAgence,
            "NumDossier" => $credit->NumDossier,
            "NumCompte" => $credit->NumCompteEpargne,
            "NumComptecp" => $comptePenalite,
            "Debit" => $montant,
            "Operant" => "SYSTEM",
            "Debitfc" => $devise == 2 ? $montant : $montant * $this->tauxDuJour,
            "Debitusd" => $devise == 1 ? $montant : $montant / $this->tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Pénalités de retard - Crédit " . $credit->NumDossier,
            "refCompteMembre" => $credit->numAdherant,
            "RefEcheance" => null,
        ]);
        
        // 2. Crédit du compte de pénalités
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $credit->CodeAgence,
            "NumDossier" => $credit->NumDossier,
            "NumCompte" => $comptePenalite,
            "NumComptecp" => $credit->NumCompteEpargne,
            "Credit" => $montant,
            "Operant" => "SYSTEM",
            "Creditfc" => $devise == 2 ? $montant : $montant * $this->tauxDuJour,
            "Creditusd" => $devise == 1 ? $montant : $montant / $this->tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Pénalités de retard - Crédit " . $credit->NumDossier,
            "refCompteMembre" => $credit->numAdherant,
            "RefEcheance" => null,
        ]);
    }

    /**
     * Génère un numéro de transaction unique
     */
    protected function generateTransactionNumber()
    {
        $id = DB::table('compteur_transactions')->insertGetId([
            'fakevalue' => '0000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return "PN00" . $id;
    }
}