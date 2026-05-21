<?php

namespace App\CustomTasks;

use App\Models\Portefeuille;
use App\Models\Transactions;
use App\Models\Remboursementcredit;
use App\Models\InteretsCourusSuivi;
use App\Models\Comptes;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\SendNotification;

class GestionInteretsPostEcheance
{
    protected $dateSystem;
    protected $tauxDuJour;     // taux de change du jour (si nécessaire)
    protected $sendNotification;

    public function __construct($dateSystem, $tauxDuJour)
    {
        $this->dateSystem = $dateSystem;
        $this->tauxDuJour = $tauxDuJour;
        $this->sendNotification = app(SendNotification::class);
    }

    /**
     * Point d'entrée principal : traite tous les crédits post-échéance
     */
    public function execute()
    {
        $credits = $this->recupererCreditsPostEcheance();
        foreach ($credits as $credit) {
            $this->traiterCreditPostEcheance($credit);
        }
    }

    /**
     * Récupère les crédits dont l'échéance est dépassée et le capital restant > 0
     */
    protected function recupererCreditsPostEcheance()
    {
        return Portefeuille::where('Cloture', 0)
            ->where('Octroye', 1)
            ->where('DateEcheance', '<', $this->dateSystem)
            ->whereRaw('MontantAccorde - (
                SELECT COALESCE(SUM(CapitalPaye), 0)
                FROM remboursementcredits
                WHERE NumDossie = portefeuilles.NumDossier
            ) > 0')
            ->get();
    }

    /**
     * Traite un crédit : calcule les intérêts courus, tente le prélèvement
     */
    protected function traiterCreditPostEcheance($credit)
    {
        $suivi = InteretsCourusSuivi::firstOrNew(['NumDossier' => $credit->NumDossier]);
        $derniereDate = $suivi->DateDernierCalcul ?? $credit->DateEcheance;
        $capitalRestant = $this->getCapitalRestant($credit->NumDossier);

        // Si capital restant nul, on nettoie le suivi
        if ($capitalRestant <= 0) {
            if ($suivi->exists) $suivi->delete();
            return;
        }

        // Calcul du nombre de jours depuis le dernier calcul
        $nbJours = Carbon::parse($this->dateSystem)->diffInDays(Carbon::parse($derniereDate));
        if ($nbJours <= 0) return;

        // Conversion du taux (ex: "3,2" -> 0.032)
        $tauxMensuel = $this->convertirTaux($credit->TauxInteret);
        $tauxJournalier = $tauxMensuel / 30;  // ou divisez par 30,4167 si moyenne exacte

        // Intérêt couru sur la période
        $interetCouru = $capitalRestant * $tauxJournalier * $nbJours;

        // On ajoute l'intérêt non payé des périodes précédentes (si capitalisation souhaitée)
        $interetTotalDu = $interetCouru + $suivi->InteretCouruNonPaye;

        // Montant total à prélever = intérêts + (optionnel) une partie du capital
        // Ici nous ne prélevons que les intérêts, pas le capital, pour ne pas pénaliser le client.
        // Mais vous pouvez aussi prélever un % du capital.
        $montantTotalDu = $interetTotalDu;

        $soldeDisponible = $this->getSoldeEpargne($credit->NumCompteEpargne, $credit->CodeMonnaie);
        if ($soldeDisponible <= 0) {
            // Aucun paiement : on stocke l'intérêt couru
            $suivi->InteretCouruNonPaye = $interetTotalDu;
            $suivi->DateDernierCalcul = $this->dateSystem;
            $suivi->CapitalRestant = $capitalRestant;
            $suivi->save();
            return;
        }

        $montantAPrelever = min($montantTotalDu, $soldeDisponible);
        $interetPaye = $montantAPrelever; // tout est affecté aux intérêts d'abord

        // Enregistrement des écritures comptables
        $this->enregistrerPaiementInterets($credit, $interetPaye);

        // Mise à jour du suivi
        $nouvelInteretNonPaye = $interetTotalDu - $interetPaye;
        $suivi->InteretCouruNonPaye = $nouvelInteretNonPaye;
        $suivi->DateDernierCalcul = $this->dateSystem;
        $suivi->CapitalRestant = $capitalRestant;
        $suivi->save();

        // Notification au client
        if ($interetPaye > 0) {
            $this->sendNotification->sendNotificationRemboursementCredit(
                $credit->numAdherant, 
                $credit->CodeMonnaie, 
                $interetPaye, 
                "Intérêts post-échéance", 
                $montantAPrelever >= $montantTotalDu ? "complet" : "partiel"
            );
        }
    }

    /**
     * Convertit le taux stocké (ex: "3,2") en décimal (0.032)
     */
    protected function convertirTaux($tauxStr)
    {
        // Remplacer virgule par point
        $tauxStr = str_replace(',', '.', $tauxStr);
        $taux = (float) $tauxStr;
        return $taux / 100;
    }
    /**
     * Calcule le capital restant d'un crédit
     */
    protected function getCapitalRestant($numDossier)
    {
        $portefeuille = Portefeuille::where('NumDossier', $numDossier)->first();
        $totalCapitalPaye = Remboursementcredit::where('NumDossie', $numDossier)->sum('CapitalPaye');
        return $portefeuille->MontantAccorde - $totalCapitalPaye;
    }

    /**
     * Récupère le solde du compte épargne
     */
    protected function getSoldeEpargne($numCompte, $codeMonnaie)
    {
        $solde = Transactions::select(
            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeCDF"),
            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeUSD")
        )->where("NumCompte", $numCompte)->first();

        if ($codeMonnaie == 'USD') {
            return $solde->soldeUSD ?? 0;
        } else {
            return $solde->soldeCDF ?? 0;
        }
    }

    /**
     * Enregistre les écritures pour le paiement des intérêts post-échéance
     */
    protected function enregistrerPaiementInterets($credit, $montantInteret)
    {
        if ($montantInteret <= 0) return;

        $devise = ($credit->CodeMonnaie == 'USD') ? 1 : 2;
        $numTransaction = $this->generateTransactionNumber();

        // Déterminer le compte de produit financier (intérêts)
        // Exemple : 701000... pour USD/CDF. Vous pouvez utiliser une méthode similaire à getCompteDotationProvision.
        $compteProduit = $this->getCompteProduitFinancier($credit->CodeAgence, $credit->CodeMonnaie);

        // 1. Débit du compte épargne du client
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $credit->CodeAgence,
            "NumDossier" => $credit->NumDossier,
            "NumDemande" => "V0" . $numTransaction,
            "NumCompte" => $credit->NumCompteEpargne,
            "NumComptecp" => $compteProduit,
            "Debit" => $montantInteret,
            "Operant" => "AUTO",
            "Debitfc" => $devise == 2 ? $montantInteret : $montantInteret * $this->tauxDuJour,
            "Debitusd" => $devise == 1 ? $montantInteret : $montantInteret / $this->tauxDuJour,
            "NomUtilisateur" => "SYSTEM",
            "Libelle" => "Paiement intérêts post-échéance - Crédit " . $credit->NumDossier,
            "refCompteMembre" => $credit->numAdherant,
            "RefEcheance" => null,
        ]);

        // 2. Crédit du compte de produit financier
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $credit->CodeAgence,
            "NumDossier" => $credit->NumDossier,
            "NumDemande" => "V0" . $numTransaction,
            "NumCompte" => $compteProduit,
            "NumComptecp" => $credit->NumCompteEpargne,
            "Credit" => $montantInteret,
            "Operant" => "AUTO",
            "Creditfc" => $devise == 2 ? $montantInteret : $montantInteret * $this->tauxDuJour,
            "Creditusd" => $devise == 1 ? $montantInteret : $montantInteret / $this->tauxDuJour,
            "NomUtilisateur" => "SYSTEM",
            "Libelle" => "Paiement intérêts post-échéance - Crédit " . $credit->NumDossier,
            "refCompteMembre" => $credit->numAdherant,
            "RefEcheance" => null,
        ]);
    }

    /**
     * Obtient ou crée le compte de produits financiers pour une agence et une devise
     */
    protected function getCompteProduitFinancier($codeAgence, $codeMonnaie)
    {
        $codeAgencePad = str_pad($codeAgence, 2, '0', STR_PAD_LEFT);
        if ($codeMonnaie == 'USD') {
            $numCompte = "7010000000" . $codeAgencePad . "1";
            $nomCompte = "Produits financiers USD - Agence " . $codeAgence;
        } else {
            $numCompte = "7011000000" . $codeAgencePad . "2";
            $nomCompte = "Produits financiers CDF - Agence " . $codeAgence;
        }

        // Vérifier et créer si nécessaire (utilisez votre méthode ensureAccountExists)
        $this->ensureAccountExists($numCompte, $nomCompte, 'PRODUIT', $codeAgence, $codeMonnaie == 'USD' ? 1 : 2);
        return $numCompte;
    }

    /**
     * Crée un compte s'il n'existe pas déjà (copié depuis votre classe)
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
     * Génère un numéro de transaction unique
     */
    protected function generateTransactionNumber()
    {
        $id = DB::table('compteur_transactions')->insertGetId([
            'fakevalue' => '0000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return "AT00" . $id;
    }
}