<?php

namespace App\CustomTasks;

use App\Constants\JournalType;
use App\Models\Portefeuille;
use App\Models\Echeancier;
use App\Models\Transactions;
use App\Models\Remboursementcredit;
use App\Models\Comptes;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\SendNotification;
use Illuminate\Support\Facades\Log;

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
    // protected function traiterPenalitesCredit($credit)
    // {
    //     // Récupérer l'historique des pénalités
    //     $suiviPenalites = DB::table('penalites_suivi')
    //         ->where('NumDossier', $credit->NumDossier)
    //         ->first();



    //     $derniereDateCalcul = $suiviPenalites->DateDernierCalcul ?? $credit->DateEcheance;

    //     // Calculer le nombre de jours depuis le dernier calcul
    //     $nbJours = Carbon::parse($this->dateSystem)->diffInDays(Carbon::parse($derniereDateCalcul));
    //      //dd($nbJours);
    //     if ($nbJours <= 0) {
    //         return;
    //     }

    //     // Calculer le montant total échu impayé (capital + intérêts)
    //     $montantEchuImpaye = $this->calculerMontantEchuImpaye($credit->NumDossier);
    //     //\Log::info("Crédit {$credit->NumDossier} - Montant échu impayé : $montantEchuImpaye");

    //     if ($montantEchuImpaye <= 0) {
    //         $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0);
    //         return;
    //     }

    //     // Récupérer le nombre de jours de retard effectif
    //     $joursRetard = $this->calculerJoursRetardCredit($credit->NumDossier);

    //     // Appliquer le délai de grâce
    //     $joursPenalisables = max(0, $joursRetard - $this->delaiAvantPenalite);

    //     if ($joursPenalisables <= 0) {
    //         $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0);
    //         return;
    //     }

    //     //

    //     // Calculer la pénalité
    //     $penalite = $montantEchuImpaye * $this->tauxPenaliteJournalier * $joursPenalisables;
    //     $penalite = round($penalite, 2);

    //     if ($penalite <= 0) {
    //         return;
    //     }

    //     // Enregistrer l'écriture comptable
    //     $this->enregistrerPenalite($credit, $penalite);

    //     // Mettre à jour le suivi
    //     $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, $penalite);

    //     // Notification au client
    //     // $this->sendNotification->sendNotificationRemboursementCredit(
    //     //     $credit->numAdherant,
    //     //     $credit->CodeMonnaie,
    //     //     $penalite,
    //     //     "Pénalités de retard",
    //     //     "partiel"
    //     // );

    //     Log::info("Crédit {$credit->NumDossier} - joursRetard: $joursRetard, joursPenalisables: $joursPenalisables, montantEchuImpaye: $montantEchuImpaye, penalite: $penalite");
    // }

    // protected function traiterPenalitesCredit($credit)
    // {
    //     // Récupérer le suivi existant
    //     $suivi = DB::table('penalites_suivi')
    //         ->where('NumDossier', $credit->NumDossier)
    //         ->first();

    //     // Date du dernier calcul et solde restant actuel des pénalités dues
    //     $derniereDateCalcul = $suivi->DateDernierCalcul ?? $credit->DateEcheance;
    //     $soldeRestant = $suivi->TotalPenalites ?? 0; // Ce champ représente le solde restant dû

    //     // Nombre de jours depuis le dernier calcul
    //     $nbJours = Carbon::parse($this->dateSystem)->diffInDays(Carbon::parse($derniereDateCalcul));
    //     if ($nbJours <= 0) {
    //         // Aucun nouveau jour, on ne fait rien (on ne met pas à jour la date)
    //         return;
    //     }

    //     // Montant échu impayé (capital + intérêts) à ce jour
    //     $montantEchuImpaye = $this->calculerMontantEchuImpaye($credit->NumDossier);
    //     if ($montantEchuImpaye <= 0) {
    //         // Plus de dette, on annule toutes les pénalités dues
    //         $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0, 'reset');
    //         return;
    //     }

    //     // Jours de retard effectif
    //     $joursRetard = $this->calculerJoursRetardCredit($credit->NumDossier);
    //     $joursPenalisables = max(0, $joursRetard - $this->delaiAvantPenalite);
    //     if ($joursPenalisables <= 0) {
    //         // Pas de jours pénalisables, on annule les pénalités dues
    //         $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0, 'reset');
    //         return;
    //     }

    //     // Pénalité totale théorique due pour tous les jours de retard jusqu'à aujourd'hui
    //     $penaliteTotaleTheorique = $montantEchuImpaye * $this->tauxPenaliteJournalier * $joursPenalisables;
    //     $penaliteTotaleTheorique = round($penaliteTotaleTheorique, 2);

    //     // Nouveaux jours de retard non encore ajoutés au solde restant
    //     $nouvelleDette = max(0, $penaliteTotaleTheorique - $soldeRestant);
    //     $soldeRestant += $nouvelleDette; // On ajoute les nouveaux jours à la dette

    //     // Vérifier le solde du compte épargne pour prélever
    //     $devise = ($credit->CodeMonnaie == 'USD') ? 1 : 2;
    //     $soldeClient = $this->getSoldeCompteEpargne($credit->NumCompteEpargne, $this->dateSystem, $devise);

    //     $montantPreleve = 0;
    //     if ($soldeClient > 0 && $soldeRestant > 0) {
    //         // On prélève le maximum possible (soit le solde client, soit le solde restant)
    //         $montantPreleve = min($soldeClient, $soldeRestant);
    //         // Enregistrer l'écriture comptable
    //         $this->enregistrerPenalite($credit, $montantPreleve);
    //         // Diminuer le solde restant du montant prélevé
    //         $soldeRestant -= $montantPreleve;
    //     }

    //     // Mettre à jour le suivi : nouvelle date et nouveau solde restant
    //     $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, $soldeRestant, 'set');

    //     // Logs
    //     Log::info("Crédit {$credit->NumDossier} - joursRetard: $joursRetard, joursPenalisables: $joursPenalisables, montantEchuImpaye: $montantEchuImpaye, pénalité théorique: $penaliteTotaleTheorique, solde restant avant prélèvement: " . ($soldeRestant + $montantPreleve) . ", prélevé: $montantPreleve, nouveau solde restant: $soldeRestant");
    // }

    protected function traiterPenalitesCredit($credit)
{
    $suivi = DB::table('penalites_suivi')
        ->where('NumDossier', $credit->NumDossier)
        ->first();

    $derniereDateCalcul = $suivi->DateDernierCalcul ?? $credit->DateEcheance;
    $soldeRestant = $suivi->TotalPenalites ?? 0;

    // 1. Ajout des nouveaux jours de retard
    $nbJours = Carbon::parse($this->dateSystem)->diffInDays(Carbon::parse($derniereDateCalcul));
    $dateMiseAJour = $derniereDateCalcul;

    $montantEchuImpaye = $this->calculerMontantEchuImpaye($credit->NumDossier);
    $joursRetard = $this->calculerJoursRetardCredit($credit->NumDossier);
    $joursPenalisables = max(0, $joursRetard - $this->delaiAvantPenalite);

    // Si pas de montant dû ou pas de jours pénilisables, on remet à zéro et on sort
    if ($montantEchuImpaye <= 0 || $joursPenalisables <= 0) {
        $this->mettreAJourSuiviPenalites($credit->NumDossier, $this->dateSystem, 0, 'reset');
        return;
    }

    // Calcul de la pénalité théorique totale
    $penaliteTotaleTheorique = $montantEchuImpaye * $this->tauxPenaliteJournalier * $joursPenalisables;
    $penaliteTotaleTheorique = round($penaliteTotaleTheorique, 2);

    // Si c'est le premier passage ou qu'il y a de nouveaux jours
    $premierPassage = (!$suivi || $suivi->TotalPenalites == 0);
    if ($premierPassage || $nbJours > 0) {
        $nouvelleDette = max(0, $penaliteTotaleTheorique - $soldeRestant);
        if ($nouvelleDette > 0) {
            $soldeRestant += $nouvelleDette;
            $dateMiseAJour = $this->dateSystem;
        }
    }

    // 2. Prélèvement (toujours effectué)
    $devise = ($credit->CodeMonnaie == 'USD') ? 1 : 2;
    $soldeClient = $this->getSoldeCompteEpargne($credit->NumCompteEpargne, $this->dateSystem, $devise);

    $montantPreleve = 0;
    if ($soldeClient > 0 && $soldeRestant > 0) {
        $montantPreleve = min($soldeClient, $soldeRestant);
        $this->enregistrerPenalite($credit, $montantPreleve);
        $soldeRestant -= $montantPreleve;
    }

    // 3. Mise à jour du suivi
    $this->mettreAJourSuiviPenalites($credit->NumDossier, $dateMiseAJour, $soldeRestant, 'set');

    Log::info("Crédit {$credit->NumDossier} - nbJours: $nbJours, soldeRestant: $soldeRestant, prélevé: $montantPreleve");
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
    // protected function mettreAJourSuiviPenalites($numDossier, $dateDernierCalcul, $penaliteAjoutee = 0)
    // {
    //     DB::table('penalites_suivi')->updateOrInsert(
    //         ['NumDossier' => $numDossier],
    //         [
    //             'DateDernierCalcul' => $dateDernierCalcul,
    //             'TotalPenalites' => DB::raw("COALESCE(TotalPenalites, 0) + $penaliteAjoutee"),
    //             'updated_at' => now()
    //         ]
    //     );
    // }

    //     protected function mettreAJourSuiviPenalites($numDossier, $dateDernierCalcul, $valeur, $mode = 'add')
    // {
    //     if ($mode == 'reset') {
    //         // On met le solde restant à 0
    //         $valeur = 0;
    //     } elseif ($mode == 'set') {
    //         // On remplace TotalPenalites par la valeur donnée (nouveau solde restant)
    //         $total = $valeur;
    //     } else {
    //         // Mode 'add' (ancien comportement) : on ajoute la valeur (pour compatibilité)
    //         $total = DB::raw("COALESCE(TotalPenalites, 0) + $valeur");
    //     }

    //     DB::table('penalites_suivi')->updateOrInsert(
    //         ['NumDossier' => $numDossier],
    //         [
    //             'DateDernierCalcul' => $dateDernierCalcul,
    //             'TotalPenalites' => $mode == 'set' ? $valeur : ($mode == 'reset' ? 0 : DB::raw("COALESCE(TotalPenalites, 0) + $valeur")),
    //             'updated_at' => now()
    //         ]
    //     );
    // }

    protected function mettreAJourSuiviPenalites($numDossier, $dateDernierCalcul, $valeur, $mode = 'add')
    {
        $data = [
            'DateDernierCalcul' => $dateDernierCalcul,
            'updated_at' => now()
        ];

        if ($mode == 'reset') {
            $data['TotalPenalites'] = 0;
        } elseif ($mode == 'set') {
            $data['TotalPenalites'] = $valeur;
        } else { // mode 'add' (par défaut)
            $data['TotalPenalites'] = DB::raw("COALESCE(TotalPenalites, 0) + $valeur");
        }

        DB::table('penalites_suivi')->updateOrInsert(
            ['NumDossier' => $numDossier],
            $data
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


    protected function getSoldeCompteEpargne($numCompte, $date, $devise)
    {
        if (!$numCompte) {
            return 0;
        }

        // Si devise = 1 (USD), utiliser Debitusd/Creditusd, sinon Debitfc/Creditfc
        $select = ($devise == 1)
            ? 'COALESCE(SUM(Creditusd - Debitusd), 0) as solde'
            : 'COALESCE(SUM(Creditfc - Debitfc), 0) as solde';

        $result = Transactions::where('NumCompte', $numCompte)
            ->where('DateTransaction', '<=', $date)
            ->selectRaw($select)
            ->first();
        Log::info("Calcul solde - compte: $numCompte, devise: $devise, date: $date, solde: " . ($result->solde ?? 0));

        return (float) ($result->solde ?? 0);
    }

    /**
     * Enregistre l'écriture comptable de pénalité
     */
    protected function enregistrerPenalite($credit, $montant)
    {
        if ($montant <= 0) return;
        $devise = ($credit->CodeMonnaie == 'USD') ? 1 : 2;

        $solde = $this->getSoldeCompteEpargne($credit->NumCompteEpargne, $this->dateSystem, $devise);

        if ($solde < $montant) {
            Log::warning("Tentative d'enregistrement d'une pénalité sans solde suffisant pour {$credit->NumDossier}");
            return;
        }



        $numTransaction = $this->generateTransactionNumber();
        $comptePenalite = $this->getComptePenalite($credit->CodeAgence, $credit->CodeMonnaie);

        // 1. Débit du compte épargne du client
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "RefJournal" => JournalType::CREDIT,
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
            "RefJournal" => JournalType::CREDIT,
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

        Log::info("Solde compte {$credit->NumCompteEpargne} (devise $devise) : $solde, montant à prélever : $montant");
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
