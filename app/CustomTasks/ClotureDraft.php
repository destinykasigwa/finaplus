<?php

namespace App\CustomTasks;

use App\Models\Comptes;
use App\Models\Echeancier;
// use App\Models\t_cloture;
use App\Models\JourRetard;
use App\Models\Portefeuille;
use App\Models\Transactions;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\TauxEtDateSystem;
use App\Services\SendNotification;
use Illuminate\Support\Facades\DB;
use App\Models\CompteurTransaction;
use App\Models\PorteFeuilleConfing;
use App\Models\Remboursementcredit;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\TransactionsController;


class ClotureJourneeCopy

{
    // ============================================
    // PROPRIÉTÉS DE LA CLASSE
    // ============================================
    
    /** @var string|null Date système utilisée pour les traitements */
    protected $dateSystem;
    
    /** @var float|null Taux de change du jour pour les conversions FC/USD */
    protected $tauxDuJour;
    
    /** @var string Compte comptable crédit aux membres en CDF */
    protected $compteCreditAuxMembreCDF;
    
    /** @var string Compte comptable crédit aux membres en USD */
    protected $compteCreditAuxMembreUSD;
    
    /** @var string Compte de dotation aux provisions en CDF */
    protected $compteDotationAuProvisionCDF;
    
    /** @var string Compte de dotation aux provisions en USD */
    protected $compteDotationAuProvisionUSD;
    
    /** @var string Compte de reprise sur provisions en CDF */
    protected $compteRepriseDeProvisionCDF;
    
    /** @var string Compte de reprise sur provisions en USD */
    protected $compteRepriseDeProvisionUSD;
    
    /** @var string Compte de créances litigieuses en USD */
    protected $compteCreanceLitigeuseUSD;
    
    /** @var string Compte de créances litigieuses en CDF */
    protected $compteCreanceLitigeuseCDF;
    
    /** @var string Compte de provisions en CDF */
    protected $compteProvisionCDF;
    
    /** @var string Compte de provisions en USD */
    protected $compteProvisionUSD;
    
    /** @var float|null Montant saisi pour un remboursement manuel */
    protected $montantRemboursementManuel;
    
    /** @var bool|null Indique si le remboursement est anticipé */
    protected $remboursAnticipe;
    
    /** @var string|null Numéro de dossier du crédit traité */
    protected $numDossier;

    // protected $compteProvisionCDF1A30Jr;
    // protected $compteProvisionCDF31A60Jr;
    // protected $compteProvisionCDF61A90Jr;
    // protected $compteProvisionCDF91A180Jr;
    // protected $compteProvisionCDF180Et180Jr;
    
    /** @var PorteFeuilleConfing|null Configuration des portefeuilles */
    protected $accountsConfig;
    
    /** @var SendNotification Service d'envoi de notifications */
    protected $sendNotification;


    /**
     * CONSTRUCTEUR - Initialise la classe avec les paramètres de la requête
     * 
     * @param Request $request Requête HTTP contenant les paramètres de remboursement
     */
    public function __construct(Request $request)
    {
        // Récupération des dernières valeurs de configuration depuis la base de données
        $latestTauxEtDateSystem = TauxEtDateSystem::latest()->first();
        $porteFeuilleConfig = PorteFeuilleConfing::first();
        
        // Initialisation de la date système (commentée à l'origine, remplacée par date du jour)
        // $this->dateSystem = $latestTauxEtDateSystem ? $latestTauxEtDateSystem->DateSystem : null;
        $this->dateSystem = date("Y-m-d");
        
        // Récupération du taux du jour s'il existe
        $this->tauxDuJour = $latestTauxEtDateSystem ? $latestTauxEtDateSystem->TauxEnFc : null;
        
        // Configuration des portefeuilles
        $this->accountsConfig = $porteFeuilleConfig;
        
        // Initialisation des comptes comptables (numéros de comptes généraux)
        $this->compteDotationAuProvisionCDF = "6901000000202";
        $this->compteDotationAuProvisionUSD = "6900000000201";
        $this->compteRepriseDeProvisionCDF = "7901000000202";
        $this->compteRepriseDeProvisionUSD = "7900000000201";
        $this->compteCreanceLitigeuseUSD = "3900000000201";
        $this->compteCreanceLitigeuseCDF = "3901000000202";
        $this->compteCreditAuxMembreCDF = "3210000000202";
        $this->compteCreditAuxMembreUSD = "3210000000201";
        $this->compteProvisionCDF = "3801000000202";
        $this->compteProvisionUSD = "3800000000201";
        
        // Récupération des paramètres de la requête
        $this->montantRemboursementManuel = $request->montantRemboursementManuel;
        $this->remboursAnticipe = $request->remboursAnticipe;
        $this->numDossier = $request->numDossier;
        
        // Initialisation du service de notification
        $this->sendNotification = app(SendNotification::class);
        
        // $this->compteProvisionCDF1A30Jr = "3800";
        // $this->compteProvisionCDF31A60Jr = "3801";
        // $this->compteProvisionCDF61A90Jr = "3802";
        // $this->compteProvisionCDF91A180Jr = "3803";
        // $this->compteProvisionCDF180Et180Jr = "3804";
    }

    /**
     * POINT D'ENTRÉE PRINCIPAL
     * Déclenche le processus complet de clôture de journée
     * 
     * @return void
     */
    public function execute()
    {
        // Étape 1 : Traiter les remboursements à échéance
        $this->traiterRemboursementsAEcheance();
        
        // Étape 2 : Traiter les remboursements en retard
        $this->traiterRemboursementsEnRetard();
        
        // Étape 3 : Gérer les provisions (commentée à l'origine)
        // $this->gererProvisions();
    }
    
    /**
     * 1. Traite les remboursements arrivés à échéance
     * 
     * @return void
     */
    public function traiterRemboursementsAEcheance()
    {
        // Récupération des crédits dont l'échéance est arrivée
        $creditsAEcheance = $this->recupererCreditsAEcheance();
        
        foreach ($creditsAEcheance as $credit) {
            // Récupération des attributs du crédit
            $NumCompte = $credit->NumCompteEpargne;
            $CodeMonnaie = $credit->CodeMonnaie == "USD" ? 1 : 2;
            $soldeMembre = $this->checkSoldeMembre($CodeMonnaie, $NumCompte);
            $CapAmmorti = $credit->CapAmmorti;
            $interetApayer = $credit->Interet;
            $MontantTotalApayer = $CapAmmorti + $interetApayer;
            
            // Vérification si le membre est en retard
            $checkRetard = $this->checkRetardMembre(
                $credit->NumDossier,
                $credit->DateTranch
            );
            
            /* SI LE SOLDE DU CLIENT EST SUPÉRIEUR OU ÉGAL AU MONTANT
            DU CRÉDIT QU'IL DOIT REMBOURSER ET QU'IL N'EST PAS EN 
            RETARD DE REMBOURSEMENT */
            if ($soldeMembre >= $MontantTotalApayer and !$checkRetard) {
                // Cas normal : paiement complet des intérêts puis du capital
                $this->appliquerPaiementInteretPuisCapital($credit);
            } else {
                // Cas défaut : activation des provisions et constatation du retard
                $this->gererProvisions();
                $this->constateRetard($credit->ReferenceEch);
                // $this->traiterRemboursementsEnRetard();
            }
        }
    }

    /**
     * 2. Traite les remboursements en retard
     * 
     * @return void
     */
    public function traiterRemboursementsEnRetard()
    {
        $creditsEnRetard = $this->recupererCreditsEnRetard();

        foreach ($creditsEnRetard as $creditRet) {
            $this->mettreAJourRetard($creditRet);
        }
    }

    /**
     * 3. Gère les provisions pour les crédits en retard
     * 
     * @return void
     */
    protected function gererProvisions()
    {
        $creditsAvecProvisions = $this->recupererCreditsAvecProvisions();

        foreach ($creditsAvecProvisions as $credit) {
            $this->gererProvisionPourRetard($credit);
        }
    }

    // ============================================
    // MÉTHODES UTILITAIRES DE RÉCUPÉRATION
    // ============================================
    
    /**
     * Récupère les crédits à l'échéance selon le contexte (anticipé, manuel, normal)
     * 
     * @return \Illuminate\Support\Collection
     */
    protected function recupererCreditsAEcheance()
    {
        info("value " . $this->remboursAnticipe);

        // CAS 1 : REMBOURSEMENT ANTICIPÉ
        if ($this->remboursAnticipe == true and !is_null($this->numDossier)) {
            // Récupération de la date d'échéance du crédit
            $dateEcheanche = Portefeuille::where("NumDossier", $this->numDossier)->first()->DateEcheance;
            return Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateEcheanche)
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.NumDossier", "=", $this->numDossier)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
        }
        
        // CAS 2 : REMBOURSEMENT MANUEL AVEC MONTANT SPÉCIFIQUE
        else if ($this->remboursAnticipe == false and !is_null($this->numDossier) and !is_null($this->montantRemboursementManuel)) {
            return Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $this->dateSystem)
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.NumDossier", "=", $this->numDossier)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
        }
        
        // CAS 3 : REMBOURSEMENT NORMAL
        else {
            return Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $this->dateSystem)
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
        }
    }

    /**
     * Applique les paiements sur les intérêts puis sur le capital
     * 
     * @param mixed $credit Données du crédit
     * @return void
     */
    public function appliquerPaiementInteretPuisCapital($credit)
    {
        // Paiement des intérêts en premier
        $this->payerInterets($credit);
        // Puis paiement du capital
        $this->payerCapital($credit);
    }
    
    /**
     * Paiement des intérêts d'un crédit
     * 
     * @param mixed $credit Données du crédit
     * @return void
     */
    public function payerInterets($credit)
    {
        info("ok " . $credit->CodeMonnaie);
        
        // Construction du libellé de la transaction
        $libelle = "Remboursement intérêt du crédit de "
            . $credit->MontantAccorde . "  pour la "
            . $credit->NbreJour . "e tranche tombée en date du "
            . $credit->DateTranch . " Numéro dossier "
            . $credit->NumDossier;
            
        // Insertion de la transaction de paiement d'intérêts
        $this->insertInTransactionInteret(
            $credit->Interet,
            $credit->CodeMonnaie,
            $this->dateSystem,
            $credit->CodeAgence,
            $credit->NumCompteEpargne,
            $credit->CompteInteret,
            $this->tauxDuJour,
            $credit->numAdherant,
            $libelle,
            $credit->Gestionnaire,
        );
        
        // Mise à jour du statut de la transaction
        $this->CheckTransactionStatus();
        
        // Envoi d'une notification au client
        $this->sendNotification->sendNotificationRemboursementCredit($credit->numAdherant, $credit->CodeMonnaie, $credit->Interet, "Interet", "");
    }

    /**
     * Paiement du capital d'un crédit
     * 
     * @param mixed $credit Données du crédit
     * @return void
     */
    protected function payerCapital($credit)
    {
        // Construction du libellé
        $libelle = "Remboursement capital du crédit de "
            . $credit->MontantAccorde . "  pour la "
            . $credit->NbreJour . "e tranche tombée en date du "
            . $credit->DateTranch . " Numéro dossier "
            . $credit->NumDossier;
            
        // Insertion de la transaction de paiement du capital
        $this->insertInTransactionCapital(
            $credit->CapAmmorti,
            $credit->CodeMonnaie,
            $this->dateSystem,
            $credit->CodeAgence,
            $credit->NumCompteEpargne,
            $credit->NumCompteCredit,
            $this->tauxDuJour,
            $credit->numAdherant,
            $libelle,
            $credit->Gestionnaire,
        );
        
        // Enregistrement dans la table des remboursements
        $this->RenseignePayement(
            $credit->ReferenceEch,
            $credit->NumCompteEpargne,
            $credit->NumCompteCredit,
            $credit->NumDossier,
            $credit->RefTypeCredit,
            $credit->NomCompte,
            $credit->DateTranch,
            $credit->Interet,
            $credit->CapAmmorti,
            $credit->CodeAgence,
            $credit->numAdherant,
        );
        
        // Clôture de la tranche d'échéancier
        $this->ClotureTranche($credit->ReferenceEch);

        // Envoi d'une notification au client
        $this->sendNotification->sendNotificationRemboursementCredit($credit->numAdherant, $credit->CodeMonnaie, $credit->CapAmmorti, "Capital", "");
    }

    /**
     * Récupère les crédits en retard
     * 
     * @return \Illuminate\Support\Collection
     */
    protected function recupererCreditsEnRetard()
    {
        // Traitement préalable des provisions
        $creditsAvecProvisions = $this->recupererCreditsAvecProvisions();

        foreach ($creditsAvecProvisions as $credit) {
            $this->gererProvisionPourRetard($credit);
        }

        // Construction de la requête selon le contexte
        if (!is_null($this->numDossier) and !is_null($this->montantRemboursementManuel) and $this->montantRemboursementManuel > 0) {
            // Récupération spécifique pour un dossier
            return Echeancier::join('portefeuilles', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
                ->where('portefeuilles.NumDossier', $this->numDossier)
                ->where('echeanciers.RetardPayement', 1)
                ->get(['echeanciers.*', 'portefeuilles.*']);
        } else {
            // Récupération de tous les crédits en retard
            return Echeancier::join('portefeuilles', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
                ->where('echeanciers.RetardPayement', 1)
                ->get(['echeanciers.*', 'portefeuilles.*']);
        }
    }
    
    /**
     * Met à jour les informations pour un crédit en retard
     * 
     * @param mixed $creditRet Données du crédit en retard
     * @return void
     */
    protected function mettreAJourRetard($creditRet)
    {
        // Enregistrement du paiement en retard
        $this->RenseignePayementEnRetard(
            $creditRet->ReferenceEch,
            $creditRet->NumCompteEpargne,
            $creditRet->NumCompteCredit,
            $creditRet->NumDossier,
            $creditRet->RefTypeCredit,
            $creditRet->NomCompte,
            $creditRet->DateTranch,
            $creditRet->Interet,
            $creditRet->CapAmmorti,
            $creditRet->CodeAgence,
            $creditRet->numAdherant,
        );

        info($creditRet->NumDossier);
        
        // Création des comptes si nécessaire
        $this->createAccountLogic(
            $creditRet->numAdherant,
            $creditRet->CodeMonnaie,
            $creditRet->CodeAgence,
            $creditRet->NomCompte,
            $creditRet->NumCompteCredit
        );
        
        // Remboursement des intérêts en retard
        $this->remboursementInteretRetard($creditRet);
        
        // Remboursement du capital en retard
        $this->remboursementCapitalRetard($creditRet);
        
        // Clôture du système (commentée)
        // $this->clotureSysteme($this->dateSystem);
    }
    
    // ============================================
    // REMBOURSEMENT DES INTÉRÊTS EN RETARD
    // ============================================
    
    /**
     * Gère le remboursement des intérêts en retard
     * 
     * @param mixed $creditRet Données du crédit en retard
     * @return void
     */
    public function remboursementInteretRetard($creditRet)
    {
        $NumCompte = $creditRet->NumCompteEpargne;
        $CodeMonnaie = $creditRet->CodeMonnaie == "USD" ? 1 : 2;
        $soldeMembre = $this->checkSoldeMembre($CodeMonnaie, $NumCompte);
        
        $checkRetard = $this->checkRetardMembre(
            $creditRet->NumDossier,
            $creditRet->DateTranch
        );

        if ($checkRetard) {
            if ($soldeMembre > 0) {
                // Vérification d'un remboursement partiel existant
                $creditEnRetard = Remboursementcredit::where("RefEcheance", $creditRet->ReferenceEch)->first();
                
                // CAS : Paiement partiel des intérêts déjà effectué
                if ($creditEnRetard->InteretPaye < $creditRet->Interet) {
                    if ($creditEnRetard->InteretPaye > 0) {
                        $interetRestant = $creditRet->Interet - $creditEnRetard->InteretPaye;
                        
                        // Sous-cas selon le solde disponible
                        if ($soldeMembre > $interetRestant and round($interetRestant, 2) > 0) {
                            // Remboursement complet du complément d'intérêts
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;

                            $this->insertInTransactionInteret(
                                round($interetRestant, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();

                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->InteretPaye + $interetRestant, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );

                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetRestant, 2), "Interet", "complement");
                            
                        } else if ($soldeMembre == $interetRestant) {
                            // Remboursement égal au complément
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                                
                            $this->insertInTransactionInteret(
                                round($interetRestant, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();

                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->InteretPaye + $interetRestant, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetRestant, 2), "Interet", "complement");
                            
                        } else if ($soldeMembre < $interetRestant) {
                            // Remboursement partiel seulement
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                                
                            $this->insertInTransactionInteret(
                                round($soldeMembre, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );

                            $this->CheckTransactionStatus();

                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->InteretPaye + $soldeMembre, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );

                            // Incrémentation des jours de retard
                            $this->IncrementerJourRetard(
                                $creditRet->NumDossier,
                                $this->dateSystem,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit
                            );
                            
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($soldeMembre, 2), "Interet", "complement");
                        }
                    } 
                    // CAS : Aucun intérêt payé pour l'instant
                    else if ($creditEnRetard->InteretPaye == 0) {
                        $interetApayer = $creditRet->Interet;
                        
                        if ($soldeMembre > $interetApayer) {
                            // Paiement complet des intérêts
                            $libelle = "Remboursement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;

                            $this->insertInTransactionInteret(
                                round($interetApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();
                            
                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->InteretPaye + $interetApayer, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );

                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetApayer, 2), "Interet", "");
                            
                        } else if ($soldeMembre == $interetApayer) {
                            // Paiement égal aux intérêts
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                                
                            $this->insertInTransactionInteret(
                                round($interetApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();

                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($interetApayer, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetApayer, 2), "Interet", "complement");
                            
                        } else if ($soldeMembre > 0 and $soldeMembre < $interetApayer) {
                            // Paiement partiel des intérêts
                            $libelle = "Remboursement partiel intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                                
                            $this->insertInTransactionInteret(
                                round($soldeMembre, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();

                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->InteretPaye + $soldeMembre, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            // Incrémentation des jours de retard
                            $this->IncrementerJourRetard(
                                $creditRet->NumDossier,
                                $this->dateSystem,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit
                            );

                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($soldeMembre, 2), "Interet", "partiel");
                        }
                    }
                }
            } else {
                // Solde insuffisant ou nul
                info("le solde du crédit interet section " . $creditRet->numAdherant . " est 0 ou meme inferieur à 0");
            }
        }
    }

    /**
     * Gère le remboursement du capital en retard
     * 
     * @param mixed $creditRet Données du crédit en retard
     * @return void
     */
    public function remboursementCapitalRetard($creditRet)
    {
        $NumCompte = $creditRet->NumCompteEpargne;
        $CodeMonnaie = $creditRet->CodeMonnaie == "USD" ? 1 : 2;
        $soldeMembre = $this->checkSoldeMembre($CodeMonnaie, $NumCompte);
        
        // Récupération du capital total en retard
        $getCapitaRetard = Echeancier::selectRaw('
            echeanciers.NumDossier,
           SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
           SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
       ')
            ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
            ->where('echeanciers.RetardPayement', 1)
            ->where('echeanciers.NumDossier', $creditRet->NumDossier)
            ->groupBy('echeanciers.NumDossier')
            ->first();
            
        $capitalEnRetard = $getCapitaRetard->sommeCapitalRetard;
        
        // Détermination du type de remboursement
        if ($soldeMembre >= $capitalEnRetard) {
            $typeRemboursement = "complet";
        } else {
            $typeRemboursement = "partiel";
        }
        
        $checkRetard = $this->checkRetardMembre(
            $creditRet->NumDossier,
            $creditRet->DateTranch
        );
        
        if ($checkRetard) {
            if ($soldeMembre > 0) {
                $creditEnRetard = Remboursementcredit::where("RefEcheance", $creditRet->ReferenceEch)->first();
                
                // CAS : Paiement partiel du capital déjà effectué
                if ($creditEnRetard->CapitalPaye < $creditRet->CapAmmorti) {
                    if ($creditEnRetard->CapitalPaye > 0) {
                        $CapitalRestant = $creditRet->CapAmmorti - $creditEnRetard->CapitalPaye;
                        
                        if ($soldeMembre > $CapitalRestant) {
                            // Remboursement complet du complément
                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->CapitalPaye + $CapitalRestant, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            $this->gererProvisions();

                            $this->insertInTransactionRepriseProvision(
                                round($CapitalRestant, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $this->tauxDuJour,
                                $typeRemboursement,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NbreJour,
                                $creditRet->DateTranch,
                                $creditRet->MontantAccorde,
                                $creditRet->NumDossier,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();
                            $this->ClotureTranche($creditRet->ReferenceEch);
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($soldeMembre, 2), "Capital", "");
                            
                        } else if ($soldeMembre == $CapitalRestant) {
                            // Remboursement égal au complément
                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->CapitalPaye + $CapitalRestant, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            $this->gererProvisions();

                            $this->insertInTransactionRepriseProvision(
                                round($CapitalRestant, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $this->tauxDuJour,
                                $typeRemboursement,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NbreJour,
                                $creditRet->DateTranch,
                                $creditRet->MontantAccorde,
                                $creditRet->NumDossier,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();
                            $this->ClotureTranche($creditRet->ReferenceEch);
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($CapitalRestant, 2), "Capital", "");
                            
                        } else if ($soldeMembre < $CapitalRestant) {
                            // Remboursement partiel
                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->CapitalPaye + $soldeMembre, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );

                            $this->gererProvisions();

                            $this->IncrementerJourRetard(
                                $creditRet->NumDossier,
                                $this->dateSystem,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit
                            );
                            
                            $this->insertInTransactionRepriseProvision(
                                round($soldeMembre, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $this->tauxDuJour,
                                $typeRemboursement,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NbreJour,
                                $creditRet->DateTranch,
                                $creditRet->MontantAccorde,
                                $creditRet->NumDossier,
                                $creditRet->Gestionnaire,
                            );

                            $this->CheckTransactionStatus();
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($soldeMembre, 2), "Capital", "");
                        }
                    } 
                    // CAS : Aucun capital payé pour l'instant
                    else if ($creditEnRetard->CapitalPaye == 0) {
                        $capitalApayer = $creditRet->CapAmmorti;
                        
                        if ($soldeMembre > $capitalApayer) {
                            // Paiement complet
                            $libelle = "Remboursement capital du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                                
                            $this->insertInTransactionCapital(
                                round($capitalApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $libelle,
                                $creditRet->Gestionnaire,
                            );

                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->CapitalPaye + $capitalApayer, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );

                            $this->insertInTransactionRepriseProvision(
                                round($capitalApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $this->tauxDuJour,
                                $typeRemboursement,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NbreJour,
                                $creditRet->DateTranch,
                                $creditRet->MontantAccorde,
                                $creditRet->NumDossier,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();
                            $this->ClotureTranche($creditRet->ReferenceEch);
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($capitalApayer, 2), "Capital", "");
                            
                        } else if ($soldeMembre == $capitalApayer) {
                            // Paiement égal
                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($capitalApayer, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            $this->gererProvisions();
                            
                            $this->insertInTransactionRepriseProvision(
                                round($capitalApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $this->tauxDuJour,
                                $typeRemboursement,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NbreJour,
                                $creditRet->DateTranch,
                                $creditRet->MontantAccorde,
                                $creditRet->NumDossier,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();
                            $this->ClotureTranche($creditRet->ReferenceEch);
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($capitalApayer, 2), "Capital", "");
                            
                        } else if ($soldeMembre > 0 and $soldeMembre < $capitalApayer) {
                            // Paiement partiel
                            $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                                $creditRet->ReferenceEch,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit,
                                $creditRet->NumDossier,
                                $creditRet->RefTypeCredit,
                                $creditRet->NomCompte,
                                $creditRet->DateTranch,
                                round($creditEnRetard->CapitalPaye + $soldeMembre, 2),
                                $creditRet->CodeAgence,
                                $creditRet->numAdherant,
                            );
                            
                            $this->gererProvisions();
                            
                            $this->IncrementerJourRetard(
                                $creditRet->NumDossier,
                                $this->dateSystem,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit
                            );
                            
                            $this->insertInTransactionRepriseProvision(
                                round($soldeMembre, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $this->tauxDuJour,
                                $typeRemboursement,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NbreJour,
                                $creditRet->DateTranch,
                                $creditRet->MontantAccorde,
                                $creditRet->NumDossier,
                                $creditRet->Gestionnaire,
                            );
                            
                            $this->CheckTransactionStatus();
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($soldeMembre, 2), "Capital", "");
                        }
                    }
                }
            } else {
                info("le solde du crédit capital section: " . $creditRet->numAdherant . " est 0 ou meme inferieur à 0");
                $this->gererProvisions();
                $this->IncrementerJourRetard(
                    $creditRet->NumDossier,
                    $this->dateSystem,
                    $creditRet->NumCompteEpargne,
                    $creditRet->NumCompteCredit
                );
            }
        }
    }

    // ============================================
    // GESTION DES PROVISIONS
    // ============================================
    
    /**
     * Récupère les crédits avec provisions
     * 
     * @return \Illuminate\Support\Collection
     */
    protected function recupererCreditsAvecProvisions()
    {
        return Portefeuille::join('jour_retards', DB::raw('TRIM(jour_retards.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
            ->where('jour_retards.NbrJrRetard', '>', 0)
            ->get(['portefeuilles.*', 'jour_retards.*']);
    }

    /**
     * Gère la provision pour un crédit récemment tombé en retard
     * 
     * @param mixed $creditProv Données du crédit
     * @return void
     */
    protected function gererProvisionPourRetard($creditProv)
    {
        $record = JourRetard::where("NumDossier", $creditProv->NumDossier)->first();
        
        if ($record) {
            // Vérifie si la DateRetard est différente de la date actuelle
            if ($record->DateRetard !== $this->dateSystem) {
                $this->provisionCreditRetard($creditProv);
            }
        }
    }

    /**
     * Calcule et applique la provision selon le nombre de jours de retard
     * 
     * @param mixed $creditProv Données du crédit
     * @return void
     */
    public function provisionCreditRetard($creditProv)
    {
        // Récupération du solde restant du crédit
        $soldeRestant = Echeancier::selectRaw('
                     echeanciers.NumDossier,
                    SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS InteretRetard,
                    SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS soldeRestant
                ')
            ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
            ->where('echeanciers.posted', '=!', 1)
            ->where('echeanciers.statutPayement', '=!', 1)
            ->where('echeanciers.NumDossier', $creditProv->NumDossier)
            ->groupBy('echeanciers.NumDossier')
            ->first();
            
        $SoldeCreditRestant = $soldeRestant->soldeRestant;

        // Récupération du capital en retard
        $capitaRetard = Echeancier::selectRaw('
            echeanciers.NumDossier,
           SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
           SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
       ')
            ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
            ->where('echeanciers.RetardPayement', 1)
            ->where('echeanciers.NumDossier', $creditProv->NumDossier)
            ->groupBy('echeanciers.NumDossier')
            ->first();

        // Récupération du capital déjà payé
        $capitaDejaPaye = Echeancier::selectRaw('
            echeanciers.NumDossier,
           SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretDejaPaye,
           SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalDejaPaye
       ')
            ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
            ->where('echeanciers.statutPayement', 1)
            ->where('echeanciers.NumDossier', $creditProv->NumDossier)
            ->groupBy('echeanciers.NumDossier')
            ->first();
            
        if ($capitaDejaPaye) {
            $sommeCapitalDejaPaye = floor($capitaDejaPaye->sommeCapitalDejaPaye * 100) / 100;
        } else {
            $sommeCapitalDejaPaye = 0;
        }
        
        $capitalApayer = $capitaRetard->sommeCapitalRetard;
        
        // Application de la provision selon la tranche de retard
        if ($creditProv->NbrJrRetard <= 30 and $creditProv->provision1 == 0) {
            // Provision 5% - 1 à 30 jours
            $this->insertInTransactionProvision(
                $sommeCapitalDejaPaye,
                $creditProv->CodeMonnaie,
                $this->dateSystem,
                $creditProv->CodeAgence,
                $creditProv->NumCompteCredit,
                $creditProv->numAdherant,
                $SoldeCreditRestant,
                $this->tauxDuJour,
                $creditProv->NomCompte,
                $capitalApayer,
                $creditProv->NumDossier,
                "5%",
                5,
                "1 à 30jrs",
                $creditProv->Gestionnaire,
            );
            $this->CheckTransactionStatus();

            JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                "provision1" => 1,
            ]);
        } else if ($creditProv->NbrJrRetard > 30 and $creditProv->NbrJrRetard <= 60 and $creditProv->provision2 == 0) {
            // Provision 10% - 31 à 60 jours
            $this->annulProvision(
                $creditProv->CodeMonnaie,
                $creditProv->CodeAgence,
                $creditProv->numAdherant,
                1,
                $capitalApayer,
                $this->tauxDuJour,
                $SoldeCreditRestant,
                $creditProv->NumDossier,
                "5%",
                "1 à 30jrs",
                $creditProv->Gestionnaire,
            );

            $this->insertInTransactionProvision(
                $sommeCapitalDejaPaye,
                $creditProv->CodeMonnaie,
                $this->dateSystem,
                $creditProv->CodeAgence,
                $creditProv->NumCompteCredit,
                $creditProv->numAdherant,
                $SoldeCreditRestant,
                $this->tauxDuJour,
                $creditProv->NomCompte,
                $capitalApayer,
                $creditProv->NumDossier,
                "10%",
                10,
                "31 à 60jrs",
                $creditProv->Gestionnaire,
            );

            $this->CheckTransactionStatus();

            JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                "provision2" => 1,
            ]);
        } else if ($creditProv->NbrJrRetard > 60 and $creditProv->NbrJrRetard <= 90 and $creditProv->provision3 == 0) {
            // Provision 25% - 61 à 90 jours
            $this->annulProvision(
                $creditProv->CodeMonnaie,
                $creditProv->CodeAgence,
                $creditProv->numAdherant,
                2,
                $capitalApayer,
                $this->tauxDuJour,
                $SoldeCreditRestant,
                $creditProv->NumDossier,
                "10%",
                "31 à 60jrs",
                $creditProv->Gestionnaire,
            );

            $this->insertInTransactionProvision(
                $sommeCapitalDejaPaye,
                $creditProv->CodeMonnaie,
                $this->dateSystem,
                $creditProv->CodeAgence,
                $creditProv->NumCompteCredit,
                $creditProv->numAdherant,
                $SoldeCreditRestant,
                $this->tauxDuJour,
                $creditProv->NomCompte,
                $capitalApayer,
                $creditProv->NumDossier,
                "25%",
                25,
                "61 à 90jrs",
                $creditProv->Gestionnaire,
            );

            $this->CheckTransactionStatus();

            JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                "provision3" => 1,
            ]);
        } else if ($creditProv->NbrJrRetard > 90 and $creditProv->NbrJrRetard <= 180 and $creditProv->provision4 == 0) {
            // Provision 75% - 91 à 180 jours
            $this->annulProvision(
                $creditProv->CodeMonnaie,
                $creditProv->CodeAgence,
                $creditProv->numAdherant,
                3,
                $capitalApayer,
                $this->tauxDuJour,
                $SoldeCreditRestant,
                $creditProv->NumDossier,
                "25%",
                "61 à 90jrs",
                $creditProv->Gestionnaire,
            );

            $this->insertInTransactionProvision(
                $sommeCapitalDejaPaye,
                $creditProv->CodeMonnaie,
                $this->dateSystem,
                $creditProv->CodeAgence,
                $creditProv->NumCompteCredit,
                $creditProv->numAdherant,
                $SoldeCreditRestant,
                $this->tauxDuJour,
                $creditProv->NomCompte,
                $capitalApayer,
                $creditProv->NumDossier,
                "75%",
                75,
                "91 à 180jrs",
                $creditProv->Gestionnaire,
            );

            $this->CheckTransactionStatus();

            JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                "provision4" => 1,
            ]);
        } else if ($creditProv->NbrJrRetard > 180 and $creditProv->provision5 == 0) {
            // Provision 100% - plus de 180 jours
            $this->annulProvision(
                $creditProv->CodeMonnaie,
                $creditProv->CodeAgence,
                $creditProv->numAdherant,
                4,
                $capitalApayer,
                $this->tauxDuJour,
                $SoldeCreditRestant,
                $creditProv->NumDossier,
                "75%",
                "91 à 180jrs",
                $creditProv->Gestionnaire,
            );
            
            $this->insertInTransactionProvision(
                $sommeCapitalDejaPaye,
                $creditProv->CodeMonnaie,
                $this->dateSystem,
                $creditProv->CodeAgence,
                $creditProv->NumCompteCredit,
                $creditProv->numAdherant,
                $SoldeCreditRestant,
                $this->tauxDuJour,
                $creditProv->NomCompte,
                $capitalApayer,
                $creditProv->NumDossier,
                "100%",
                100,
                "plus de 180jrs",
                $creditProv->Gestionnaire,
            );

            $this->CheckTransactionStatus();

            JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                "provision5" => 1,
            ]);
        }
    }

    // ============================================
    // TRANSACTIONS COMPTABLES
    // ============================================
    
    /**
     * Insère une transaction de paiement d'intérêts
     */
    protected function insertInTransactionInteret(
        $montantInteret,
        $codeMonnaie,
        $dateSystem,
        $CodeAgence,
        $NumCompteEpargne,
        $NumCompteInteret,
        $tauxDuJour,
        $refCompteMembre,
        $Libelle,
        $Gestionnaire,
    ) {
        // Génération du numéro automatique de l'opération
        CompteurTransaction::create([
            'fakevalue' => "0000",
        ]);
        $numOperation = CompteurTransaction::latest()->first();
        $NumTransaction = "AT00" . $numOperation->id;
        
        // Détermination de la devise
        if ($codeMonnaie == "USD") {
            $devise = 1; // USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; // CDF
        }
        
        // Débit du compte du client (intérêts)
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => "DOS00" . $numOperation->id,
            "NumDemande" => "V00" . $numOperation->id,
            "NumCompte" => $NumCompteEpargne,
            "NumComptecp" => $NumCompteInteret,
            "Debit" => $montantInteret,
            "Operant" => $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantInteret : $montantInteret * $tauxDuJour,
            "Debitusd" => $devise == 1 ? $montantInteret : $montantInteret / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
        ]);
        
        // Crédit du compte intérêts
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => "DOS00" . $numOperation->id,
            "NumDemande" => "V00" . $numOperation->id,
            "NumCompte" => $NumCompteInteret,
            "NumComptecp" => $NumCompteEpargne,
            "Credit" => $montantInteret,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? $montantInteret : $montantInteret * $tauxDuJour,
            "Creditusd" => $devise == 1 ? $montantInteret : $montantInteret / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
        ]);
    }

    /**
     * Insère une transaction de paiement du capital
     */
    protected function insertInTransactionCapital(
        $montantCapital,
        $codeMonnaie,
        $dateSystem,
        $CodeAgence,
        $NumCompteEpargne,
        $NumCompteCredit,
        $tauxDuJour,
        $refCompteMembre,
        $Libelle,
        $Gestionnaire,
    ) {
        // Génération du numéro automatique de l'opération
        CompteurTransaction::create([
            'fakevalue' => "0000",
        ]);
        $numOperation = CompteurTransaction::latest()->first();
        $NumTransaction = "AT00" . $numOperation->id;
        
        if ($codeMonnaie == "USD") {
            $devise = 1; // USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; // CDF
        }
        
        // Débit du compte épargne du client
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => "DOS00" . $numOperation->id,
            "NumDemande" => "V00" . $numOperation->id,
            "NumCompte" => $NumCompteEpargne,
            "NumComptecp" => $NumCompteCredit,
            "Debit" => $montantCapital,
            "Operant" => $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantCapital : $montantCapital * $tauxDuJour,
            "Debitusd" => $devise == 1 ? $montantCapital : $montantCapital / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
        ]);

        // Crédit du compte crédit du membre
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => "DOS00" . $numOperation->id,
            "NumDemande" => "V00" . $numOperation->id,
            "NumCompte" => $NumCompteCredit,
            "NumComptecp" => $NumCompteEpargne,
            "Credit" => $montantCapital,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? $montantCapital : $montantCapital * $tauxDuJour,
            "Creditusd" => $devise == 1 ? $montantCapital : $montantCapital / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
        ]);

        // Crédit du compte comptabilité
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => "DOS00" . $numOperation->id,
            "NumDemande" => "V00" . $numOperation->id,
            "NumCompte" => $devise == 1 ? $this->compteCreditAuxMembreUSD : $this->compteCreditAuxMembreCDF,
            "NumComptecp" => $NumCompteCredit,
            "Credit" => $montantCapital,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? $montantCapital : $montantCapital * $tauxDuJour,
            "Creditusd" => $devise == 1 ? $montantCapital : $montantCapital / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
        ]);
    }

    /**
     * Calcule et retourne le solde d'un membre
     */
    public function checkSoldeMembre($codeMonnaie, $NumCompte)
    {
        // Si le montant manuel est défini et supérieur à 0, on l'utilise
        if (!is_null($this->montantRemboursementManuel) && $this->montantRemboursementManuel > 0 && !$this->remboursAnticipe) {
            return $this->montantRemboursementManuel;
        }

        $soldeMembre = Transactions::select(
            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
        )->where("NumCompte", '=', $NumCompte)
            ->groupBy("NumCompte")
            ->first();
            
        if ($codeMonnaie == 1) {
            return $soldeMembre->soldeMembreUSD;
        } else {
            return $soldeMembre->soldeMembreCDF;
        }
    }

    /**
     * Vérifie si le client n'est pas en retard pour la tranche en cours
     */
    public function checkRetardMembre($NumDossier, $dateTombeeTranche)
    {
        $data = Echeancier::where("NumDossier", $NumDossier)
            ->where("DateTranch", $dateTombeeTranche)->first();
            
        if ($data->RetardPayement == 1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Enregistre dans la table REMBOURSEMENT pour signaler le paiement
     */
    public function RenseignePayement(
        $ReferenceEch,
        $NumCompteEpargne,
        $NumCompteCredit,
        $NumDossier,
        $RefTypeCredit,
        $NomCompte,
        $DateTranch,
        $InteretAmmorti,
        $CapAmmorti,
        $CodeAgence,
        $numAdherant
    ) {
        Remboursementcredit::create([
            "RefEcheance" => $ReferenceEch,
            "NumCompte" => $NumCompteEpargne,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossier,
            "RefTypCredit" => $RefTypeCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranch,
            "InteretAmmorti" => $InteretAmmorti,
            "InteretPaye" => $InteretAmmorti,
            "CapitalAmmortie" => $CapAmmorti,
            "CapitalPaye" => $CapAmmorti,
            "CodeGuichet" => $CodeAgence,
            "NumAdherent" => $numAdherant,
        ]);
    }

    /**
     * Met à jour la table REMBOURSEMENT pour un paiement partiel d'intérêts
     */
    public function RenseignePayementPourPaiementQuiEtaitEnMoitieInteret(
        $ReferenceEch,
        $NumCompteEpargne,
        $NumCompteCredit,
        $NumDossier,
        $RefTypeCredit,
        $NomCompte,
        $DateTranch,
        $InteretAmmorti,
        $CodeAgence,
        $numAdherant
    ) {
        Remboursementcredit::where("RefEcheance", $ReferenceEch)->update([
            "RefEcheance" => $ReferenceEch,
            "NumCompte" => $NumCompteEpargne,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossier,
            "RefTypCredit" => $RefTypeCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranch,
            "InteretAmmorti" => $InteretAmmorti,
            "InteretPaye" => $InteretAmmorti,
            "CodeGuichet" => $CodeAgence,
            "NumAdherent" => $numAdherant,
        ]);
    }

    /**
     * Met à jour la table REMBOURSEMENT pour un paiement partiel du capital
     */
    public function RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
        $ReferenceEch,
        $NumCompteEpargne,
        $NumCompteCredit,
        $NumDossier,
        $RefTypeCredit,
        $NomCompte,
        $DateTranch,
        $CapAmmorti,
        $CodeAgence,
        $numAdherant
    ) {
        Remboursementcredit::where("RefEcheance", $ReferenceEch)->update([
            "RefEcheance" => $ReferenceEch,
            "NumCompte" => $NumCompteEpargne,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossier,
            "RefTypCredit" => $RefTypeCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranch,
            "CapitalAmmortie" => $CapAmmorti,
            "CapitalPaye" => $CapAmmorti,
            "CodeGuichet" => $CodeAgence,
            "NumAdherent" => $numAdherant,
        ]);
    }

    /**
     * Enregistre dans la table REMBOURSEMENT pour signaler un crédit en retard
     */
    public function RenseignePayementEnRetard(
        $ReferenceEch,
        $NumCompteEpargne,
        $NumCompteCredit,
        $NumDossier,
        $RefTypeCredit,
        $NomCompte,
        $DateTranch,
        $InteretAmmorti,
        $CapAmmorti,
        $CodeAgence,
        $numAdherant
    ) {
        $checkRowExist = Remboursementcredit::where("RefEcheance", $ReferenceEch)->first();
        
        if (!$checkRowExist) {
            Remboursementcredit::create([
                "RefEcheance" => $ReferenceEch,
                "NumCompte" => $NumCompteEpargne,
                "NumCompteCredit" => $NumCompteCredit,
                "NumDossie" => $NumDossier,
                "RefTypCredit" => $RefTypeCredit,
                "NomCompte" => $NomCompte,
                "DateTranche" => $DateTranch,
                "InteretAmmorti" => $InteretAmmorti,
                "CapitalAmmortie" => $CapAmmorti,
                "CodeGuichet" => $CodeAgence,
                "NumAdherent" => $numAdherant,
            ]);
        }
    }

    /**
     * Clôture une tranche d'échéancier
     */
    private function ClotureTranche($ReferenceEch)
    {
        Echeancier::where("echeanciers.ReferenceEch", "=", $ReferenceEch)
            ->update([
                "statutPayement" => "1",
                "posted" => "1",
                "RetardPayement" => 0
            ]);
    }

    /**
     * Constate qu'un crédit vient d'être en retard
     */
    private function constateRetard($ReferenceEch)
    {
        Echeancier::where("echeanciers.ReferenceEch", "=", $ReferenceEch)
            ->update([
                "RetardPayement" => "1",
            ]);
    }

    /**
     * Annule les jours de retard
     */
    public function AnnuleJourRetard($NumDossier)
    {
        JourRetard::where("NumDossier", $NumDossier)->update([
            "NbrJrRetard" => 0,
        ]);
    }

    /**
     * Incrémente le compteur de jours de retard
     */
    private function IncrementerJourRetard($NumDossier, $dateSystem, $NumCompteEpargne, $NumCompteCredit)
    {
        try {
            $record = JourRetard::where("NumDossier", $NumDossier)->first();
            $getMonnaie = Portefeuille::where("NumDossier", $NumDossier)->first();
            $CodeMonnaie = $getMonnaie->CodeMonnaie;
            $refCompteMembre = $getMonnaie->numAdherant;
            
            if ($record) {
                // Vérifie si la DateRetard est différente de la date actuelle
                if ($record->DateRetard !== $dateSystem) {
                    $record->update([
                        "NumcompteEpargne" => $NumCompteEpargne,
                        "NumcompteCredit" => $NumCompteCredit,
                        "NbrJrRetard" => $record->NbrJrRetard + 1,
                        "DateRetard" => $dateSystem,
                    ]);
                }
            } else {
                // Détermination de la devise
                if ($CodeMonnaie == "USD") {
                    $devise = 1; // USD
                } else if ($CodeMonnaie == "CDF") {
                    $devise = 2; // CDF
                }

                // Génération des numéros de compte selon le membre
                $compteCreanceLitigieuseCDF = "";
                $compteProvisionCDF = "";
                $compteCreanceLitigieuseUSD = "";
                $compteProvisionUSD = "";

                if ($devise == 2) {
                    // Construction des comptes CDF
                    if ($refCompteMembre < 10) {
                        $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . "202";
                    } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                        $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . "202";
                    } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                        $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "3901000" . $refCompteMembre . "202";
                    } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                        $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "390100" . $refCompteMembre . "202";
                    } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                        $compteProvisionCDF = "38010" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "39010" . $refCompteMembre . "202";
                    } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                        $compteProvisionCDF = "3801" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . "202";
                    } else {
                        $compteProvisionCDF = "3801" . $refCompteMembre . "202";
                        $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . "202";
                    }
                } else if ($devise == 1) {
                    // Construction des comptes USD
                    if ($refCompteMembre < 10) {
                        $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . "201";
                    } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                        $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . "201";
                    } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                        $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "3900000" . $refCompteMembre . "201";
                    } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                        $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "390000" . $refCompteMembre . "201";
                    } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                        $compteProvisionUSD = "38000" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "39000" . $refCompteMembre . "201";
                    } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                        $compteProvisionUSD = "3800" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . "201";
                    } else {
                        $compteProvisionUSD = "3800" . $refCompteMembre . "201";
                        $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . "201";
                    }
                }
                
                $dateMinusOneDay = Carbon::parse($dateSystem)->subDay();
                $dateMinusOneday = $dateMinusOneDay->toDateString();
                
                // Création du nouvel enregistrement
                JourRetard::create([
                    "NumcompteEpargne" => $NumCompteEpargne,
                    "NumcompteCredit" => $NumCompteCredit,
                    "CompteProvision" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
                    "NumCompteCreanceLitigieuse" => $devise == 2 ? $compteCreanceLitigieuseCDF : $compteCreanceLitigieuseUSD,
                    "NumDossier" => $NumDossier,
                    "NbrJrRetard" => 1,
                    "DateRetard" => $dateMinusOneday,
                ]);

                // Vérification et création du compte crédit si nécessaire
                $checkIfAccountExist = Comptes::where("NumCompte", $NumCompteCredit)->first();
                if (!$checkIfAccountExist) {
                    Comptes::create([
                        'CodeAgence' => $getMonnaie->CodeAgence,
                        'NumCompte' => $NumCompteCredit,
                        'NomCompte' => $getMonnaie->NomCompte,
                        'RefTypeCompte' => "3",
                        'RefCadre' => "32",
                        'RefGroupe' => "320",
                        'RefSousGroupe' => $devise == 2 ? "3201" : "3200",
                        'CodeMonnaie' => $devise == 2 ? 2 : 1,
                        'NumAdherant' => $refCompteMembre,
                        'nature_compte' => "ACTIF",
                        'niveau' => "5",
                        'est_classe' => null,
                        'compte_parent' => $devise == 2 ? "3201" : "3200",
                    ]);
                }
            }
        } catch (\Illuminate\Database\QueryException $e) {
            dd($e->getMessage());
        }
    }

    /**
     * Gère le remboursement manuel
     */
    public function RemboursementManuel(Request $request)
    {
        // Vérification si le crédit n'est pas en retard
        $checkRetard = JourRetard::where("NumDossier", $this->numDossier)->where("NbrJrRetard", ">", 0)->first();

        if (!$checkRetard) {
            $data = Portefeuille::where("NumDossier", $this->numDossier)->first();
            $CodeMonnaie = $data->CodeMonnaie;
            $NumCompteEpargne = $data->NumCompteEpargne;

            $this->checkSoldeMembre($CodeMonnaie, $NumCompteEpargne);

            $soldeMembreCompteEpargn = Transactions::select(
                DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
            )->where("NumCompte", '=', $NumCompteEpargne)
                ->groupBy("NumCompte")
                ->first();
                
            if ($CodeMonnaie == "USD") {
                $soldeCE = $soldeMembreCompteEpargn->soldeMembreUSD;
            } else {
                $soldeCE = $soldeMembreCompteEpargn->soldeMembreCDF;
            }
            
            info("solde compte" . $soldeCE);
            
            if (!is_null(($this->montantRemboursementManuel) && $this->montantRemboursementManuel > 0) or ($this->remboursAnticipe == true)) {
                if ($soldeCE > 0 and $soldeCE >= $this->montantRemboursementManuel) {
                    info("Remboursement manuel en cours...");
                    $clotureJournee = new ClotureJourneeCopy($request);
                    $clotureJournee->execute();
                    return response()->json([
                        'status' => 1,
                        'msg' => 'Remboursement manuel traité avec succès',
                    ]);
                } else {
                    return response()->json([
                        'status' => 0,
                        'msg' => 'Le solde du compte est insuffisant le solde est de : ' . ($soldeCE . $CodeMonnaie == "USD" ? " USD" : " CDF"),
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'msg' => 'Certaines informations requises ne sont pas rensignées!',
                ]);
            }
        } else {
            return response()->json([
                'status' => 0,
                'msg' => "Le remboursement manuel n'est pas autorisé pour les crédits en retard",
            ]);
        }
    }

    /**
     * Crée les comptes nécessaires (logique)
     */
    public function createAccountLogic(
        $refCompteMembre,
        $codeMonnaie,
        $CodeAgence,
        $NomCompte,
        $NumCompteCreditCustomer
    ) {
        if ($codeMonnaie == "USD") {
            $devise = 1; // USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; // CDF
        }

        $compteCreanceLitigieuseCDF = "";
        $compteProvisionCDF = "";
        $compteCreanceLitigieuseUSD = "";
        $compteProvisionUSD = "";

        if ($devise == 2) {
            // Construction comptes CDF
            if ($refCompteMembre < 10) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "3901000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "390100" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionCDF = "38010" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "39010" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionCDF = "3801" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . "202";
            } else {
                $compteProvisionCDF = "3801" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . "202";
            }

            $checkCompteProvision = Comptes::where("NumCompte", $compteProvisionCDF)->first();
            if (!$checkCompteProvision && $compteProvisionCDF !== null && $compteProvisionCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteProvisionCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "38",
                    'RefGroupe' => "380",
                    'RefSousGroupe' => "3801",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "PASSIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3801",
                ]);
            }

            // Vérification et création du compte crédit client
            $checkCompteCreditCustomer = Comptes::where("NumCompte", $NumCompteCreditCustomer)->first();
            if (!$checkCompteCreditCustomer) {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $NumCompteCreditCustomer,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "32",
                    'RefGroupe' => "320",
                    'RefSousGroupe' => "3201",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3201",
                ]);
            }
            
            // Création du compte créance litigieuse
            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseCDF)->first();
            if (!$checkCompteCL && $compteCreanceLitigieuseCDF !== null && $compteCreanceLitigieuseCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteCreanceLitigieuseCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "39",
                    'RefGroupe' => "390",
                    'RefSousGroupe' => "3901",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3901",
                ]);
            }
        } else if ($devise == 1) {
            // Construction comptes USD
            if ($refCompteMembre < 10) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "3900000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "390000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionUSD = "38000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "39000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionUSD = "3800" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . "201";
            } else {
                $compteProvisionUSD = "3800" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . "201";
            }

            $checkCompteProvision = Comptes::where("NumCompte", $compteProvisionUSD)->first();
            if (!$checkCompteProvision && $compteProvisionUSD !== null && $compteProvisionUSD !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteProvisionUSD,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "38",
                    'RefGroupe' => "380",
                    'RefSousGroupe' => "3800",
                    'CodeMonnaie' => 1,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "PASSIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3800",
                ]);
            }

            // Création du compte créance litigieuse
            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseUSD)->first();
            if (!$checkCompteCL && $compteCreanceLitigieuseUSD !== null && $compteCreanceLitigieuseUSD !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteCreanceLitigieuseUSD,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "39",
                    'RefGroupe' => "390",
                    'RefSousGroupe' => "3900",
                    'CodeMonnaie' => 1,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3900",
                ]);
            }

            // Vérification et création du compte crédit client
            $checkCompteCreditCustomer = Comptes::where("NumCompte", $NumCompteCreditCustomer)->first();
            if (!$checkCompteCreditCustomer) {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $NumCompteCreditCustomer,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "32",
                    'RefGroupe' => "320",
                    'RefSousGroupe' => "3200",
                    'CodeMonnaie' => 1,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3200",
                ]);
            }
        }
    }

    /**
     * Vérifie le statut des transactions pour les comptes de résultat
     */
    public function CheckTransactionStatus()
    {
        $numcompte = "";
        
        // Récupération de la dernière transaction sur comptes de résultat
        $lastTransaction = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            ->whereBetween('comptes.RefTypeCompte', [6, 7])
            ->orderBy('transactions.RefTransaction', 'desc')
            ->select('transactions.*')
            ->first();
            
        if ($lastTransaction->CodeMonnaie == 2) {
            $numcompte = "871";
        } else {
            $numcompte = "870";
        }
        
        if ($lastTransaction) {
            $account = Comptes::where('NumCompte', $lastTransaction->NumCompte)->first();
            Log::info('Fetched account data', ['account' => $account]);

            if ($account && in_array($account->RefTypeCompte, [6, 7])) {
                Log::info('Account exists and RefTypeCompte is in [6, 7]', ['RefTypeCompte' => $account->RefTypeCompte]);

                $newTransaction = $lastTransaction->replicate(['RefTransaction']);
                $newTransaction->NumCompte = $numcompte;

                if ($lastTransaction->CodeMonnaie == 1) {
                    $newTransaction->Debitusd = $lastTransaction->Debitusd;
                    $newTransaction->Creditusd = $lastTransaction->Creditusd;
                } elseif ($lastTransaction->CodeMonnaie == 2) {
                    $newTransaction->Debitfc = $lastTransaction->Debitfc;
                    $newTransaction->Creditfc = $lastTransaction->Creditfc;
                }

                $newTransaction->save();
                Log::info('Transaction duplicated successfully', ['transaction_id' => $newTransaction->id]);
            } else {
                Log::error('Account not found or RefTypeCompte not in [6, 7]', ['transaction_id' => $lastTransaction->id, 'NumCompte' => $lastTransaction->NumCompte]);
                return 'Account not found or RefTypeCompte not in [6, 7].';
            }
        } else {
            Log::error('No transaction found');
            return 'No transaction found.';
        }
    }
    
    // ============================================
    // MÉTHODES DE PROVISION (SUITE)
    // ============================================
    
    
        /**
     * Insère une transaction de provision pour les crédits en retard
     * Gère la création des comptes individuels et les écritures comptables de provision
     * 
     * @param float $capitalPaye Capital déjà payé
     * @param string $codeMonnaie USD ou CDF
     * @param string $dateSystem Date du traitement
     * @param string $CodeAgence Code de l'agence
     * @param string $NumCompteCreditCustomer Compte crédit du client
     * @param int $refCompteMembre Référence du membre
     * @param float $SoldeCreditRestant Solde restant du crédit
     * @param float $tauxDuJour Taux de change du jour
     * @param string $NomCompte Nom du compte
     * @param float $capitalApayer Capital à payer
     * @param string $NumDossier Numéro du dossier
     * @param string $provisionTranche Libellé de la tranche de provision
     * @param int $provisionPourcentage Pourcentage de provision (5,10,25,75,100)
     * @param string $provisionRang Période du retard (ex: "1 à 30jrs")
     * @param string $Gestionnaire Code du gestionnaire
     * @return void
     */
    protected function insertInTransactionProvision(
        $capitalPaye,
        $codeMonnaie,
        $dateSystem,
        $CodeAgence,
        $NumCompteCreditCustomer,
        $refCompteMembre,
        $SoldeCreditRestant,
        $tauxDuJour,
        $NomCompte,
        $capitalApayer,
        $NumDossier,
        $provisionTranche,
        $provisionPourcentage,
        $provisionRang,
        $Gestionnaire,
    ) {
        // Détermination de la devise (1=USD, 2=CDF)
        if ($codeMonnaie == "USD") {
            $devise = 1; // USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; // CDF
        }

        // ============================================
        // CRÉATION DES COMPTES INDIVIDUELS SELON LA DEVISE
        // ============================================
        
        $compteCreanceLitigieuseCDF = "";
        $compteProvisionCDF = "";
        $compteCreanceLitigieuseUSD = "";
        $compteProvisionUSD = "";

        if ($devise == 2) {
            // Construction des numéros de compte en CDF en fonction de l'ID du membre
            if ($refCompteMembre < 10) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "3901000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "390100" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionCDF = "38010" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "39010" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionCDF = "3801" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . "202";
            } else {
                $compteProvisionCDF = "3801" . $refCompteMembre . "202";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . "202";
            }

            // Création du compte de provision CDF s'il n'existe pas
            $checkCompteProvision = Comptes::where("NumCompte", $compteProvisionCDF)->first();
            if (!$checkCompteProvision && $compteProvisionCDF !== null && $compteProvisionCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteProvisionCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "38",
                    'RefGroupe' => "380",
                    'RefSousGroupe' => "3801",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "PASSIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3801",
                ]);

                // Mise à jour de la table jour_retard avec le compte de provision
                $checkCompteProvi = JourRetard::where("CompteProvision", $compteProvisionCDF)->first();
            }

            // Vérification et création du compte crédit client si inexistant
            $checkCompteCreditCustomer = Comptes::where("NumCompte", $NumCompteCreditCustomer)->first();
            if (!$checkCompteCreditCustomer) {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $NumCompteCreditCustomer,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "32",
                    'RefGroupe' => "320",
                    'RefSousGroupe' => $devise == 2 ? "3201" : "3200",
                    'CodeMonnaie' => $devise == 1 ? 1 : 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => $devise == 2 ? "3201" : "3200",
                ]);
            }
            
            // Création du compte créance litigieuse CDF
            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseCDF)->first();
            if (!$checkCompteCL && $compteCreanceLitigieuseCDF !== null && $compteCreanceLitigieuseCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteCreanceLitigieuseCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "39",
                    'RefGroupe' => "390",
                    'RefSousGroupe' => "3901",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3901",
                ]);
            }
            
            // Mise à jour de la table jour_retard avec le compte de provision
            $checkCompteProvi = JourRetard::where("CompteProvision", $compteProvisionCDF)->first();
            if (!$checkCompteProvi) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "CompteProvision" => $compteProvisionCDF
                ]);
            }

            // Mise à jour de la table jour_retard avec le compte créance litigieuse
            $checkCompteNumCompteCL = JourRetard::where("NumCompteCreanceLitigieuse", $compteCreanceLitigieuseCDF)->first();
            if (!$checkCompteNumCompteCL) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "NumCompteCreanceLitigieuse" => $compteCreanceLitigieuseCDF
                ]);
            }
        } else if ($devise == 1) {
            // Construction des numéros de compte en USD
            if ($refCompteMembre < 10) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "3900000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "390000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionUSD = "38000" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "39000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionUSD = "3800" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . "201";
            } else {
                $compteProvisionUSD = "3800" . $refCompteMembre . "201";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . "201";
            }

            // Création du compte de provision USD
            $checkCompteProvision = Comptes::where("NumCompte", $compteProvisionUSD)->first();
            if (!$checkCompteProvision && $compteProvisionUSD !== null && $compteProvisionUSD !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteProvisionUSD,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "38",
                    'RefGroupe' => "380",
                    'RefSousGroupe' => "3800",
                    'CodeMonnaie' => 1,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "PASSIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3800",
                ]);
            }

            // Création du compte créance litigieuse USD
            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseUSD)->first();
            if (!$checkCompteProvision && $compteCreanceLitigieuseCDF !== null && $compteCreanceLitigieuseCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteCreanceLitigieuseCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "39",
                    'RefGroupe' => "390",
                    'RefSousGroupe' => "3900",
                    'CodeMonnaie' => 1,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => null,
                    'compte_parent' => "3900",
                ]);
            }

            // Mise à jour de la table jour_retard avec le compte de provision
            $checkCompteProvi = JourRetard::where("CompteProvision", $compteProvisionUSD)->first();
            if (!$checkCompteProvi) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "CompteProvision" => $compteProvisionUSD
                ]);
            }

            // Mise à jour de la table jour_retard avec le compte créance litigieuse
            $checkCompteNumCompteCL = JourRetard::where("NumCompteCreanceLitigieuse", $compteCreanceLitigieuseUSD)->first();
            if (!$checkCompteNumCompteCL) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "NumCompteCreanceLitigieuse" => $compteCreanceLitigieuseUSD
                ]);
            }
        }
        
        // ============================================
        // ÉCRITURES COMPTABLES POUR LA PROVISION
        // ============================================
        
        if ($provisionPourcentage == 5) { // PREMIER RETARD - Constatation du crédit en retard
            // Génération du numéro de transaction
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = "AT00" . $numOperation->id;
            
            /* DÉBUT - Constatation crédit en retard */
            // DÉBIT du compte 39 (créance litigieuse) - comptabilité générale
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => date("Y-m-d"),
                "TypeTransaction" => "D",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $devise == 2 ? $this->compteCreanceLitigeuseCDF : $this->compteCreanceLitigeuseUSD,
                "NumComptecp" => $devise == 2 ? $this->compteCreditAuxMembreCDF : $this->compteCreditAuxMembreUSD,
                "Debit" => $SoldeCreditRestant - $capitalPaye,
                "Operant" => $Gestionnaire,
                "Debitfc" => $devise == 2 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) * ($tauxDuJour),
                "Debitusd" => $devise == 1 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) / ($tauxDuJour),
                "NomUtilisateur" => "AUTO",
                "Libelle" => "Imputation de " . $SoldeCreditRestant - $capitalPaye . "  dans la tranche de crédit en retard de 1 à 30 jrs dossier " . $NumDossier . " pour " . $capitalApayer . " impayé",
                "refCompteMembre" => $refCompteMembre,
            ]);

            // DÉBIT du compte 39 (créance litigieuse) - compte client
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => $dateSystem,
                "TypeTransaction" => "D",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumCompte" => $devise == 2 ? $compteCreanceLitigieuseCDF : $compteCreanceLitigieuseUSD,
                "NumComptecp" => $NumCompteCreditCustomer,
                "Debit" => $SoldeCreditRestant - $capitalPaye,
                "Operant" => $Gestionnaire,
                "Debitfc" => $devise == 2 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) * ($tauxDuJour),
                "Debitusd" => $devise == 1 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) / ($tauxDuJour),
                "NomUtilisateur" => "AUTO",
                "Libelle" => "Imputation de " . $SoldeCreditRestant - $capitalPaye . "  dans la tranche de crédit en retard de 1 à 30 jrs dossier " . $NumDossier . " pour " . $capitalApayer . " impayé",
                "refCompteMembre" => $refCompteMembre,
            ]);

            // Nouvelle transaction pour le crédit
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = "AT00" . $numOperation->id;

            // CRÉDIT du compte crédit comptable
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => $dateSystem,
                "TypeTransaction" => "C",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumCompte" => $devise == 2 ? $this->compteCreditAuxMembreCDF : $this->compteCreditAuxMembreUSD,
                "NumComptecp" => $devise == 2 ? $compteCreanceLitigieuseCDF : $compteCreanceLitigieuseUSD,
                "Credit" => $devise == 1 ? $SoldeCreditRestant - $capitalPaye : $SoldeCreditRestant - $capitalPaye,
                "Operant" => $Gestionnaire,
                "Creditfc" => $devise == 2 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) * ($tauxDuJour),
                "Creditusd" => $devise == 1 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) / $tauxDuJour,
                "NomUtilisateur" => "AUTO",
                "Libelle" => "Imputation de " . $SoldeCreditRestant - $capitalPaye . "  dans la tranche de crédit en retard de 1 à 30 jrs dossier " . $NumDossier . " pour " . $capitalApayer . " impayé",
                "refCompteMembre" => $refCompteMembre,
            ]);

            // CRÉDIT du compte crédit du client
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => $dateSystem,
                "TypeTransaction" => "C",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumCompte" => $NumCompteCreditCustomer,
                "NumComptecp" => $devise == 2 ? $this->compteCreditAuxMembreCDF : $this->compteCreditAuxMembreUSD,
                "Credit" => $devise == 1 ? $SoldeCreditRestant - $capitalPaye : $SoldeCreditRestant - $capitalPaye,
                "Operant" => $Gestionnaire,
                "Creditfc" => $devise == 2 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) * ($tauxDuJour),
                "Creditusd" => $devise == 1 ? $SoldeCreditRestant - $capitalPaye : ($SoldeCreditRestant - $capitalPaye) / ($tauxDuJour),
                "NomUtilisateur" => "AUTO",
                "Libelle" => "Imputation de " . $SoldeCreditRestant - $capitalPaye . "  dans la tranche de crédit en retard de 1 à 30 jrs dossier " . $NumDossier . " pour " . $capitalApayer . " impayé",
                "refCompteMembre" => $refCompteMembre,
            ]);
            /* FIN - Constatation crédit en retard */
        }

        /* DÉBUT - Constatation PROVISION */
        // Génération d'une nouvelle transaction pour la provision
        CompteurTransaction::create([
            'fakevalue' => "0000",
        ]);
        $numOperation = [];
        $numOperation = CompteurTransaction::latest()->first();
        $NumTransaction = "AT00" . $numOperation->id;

        // DÉBIT du compte 69 (Dotation aux provisions)
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumCompte" => $devise == 2 ? $this->compteDotationAuProvisionCDF : $this->compteDotationAuProvisionUSD,
            "NumComptecp" => $compteProvisionCDF,
            "Debit" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100,
            "Operant" => $Gestionnaire,
            "Debitfc" => $devise == 2 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 * ($tauxDuJour),
            "Debitusd" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 / ($tauxDuJour),
            "NomUtilisateur" => "AUTO",
            "Libelle" => ($provisionPourcentage == 5 ? "Provision" : "Complement provision")
                . " de " . $provisionTranche
                . " sur l'encours de " . $SoldeCreditRestant
                . " en retard de " . $provisionRang
                . " dossier " . $NumDossier
                . " pour " . $capitalApayer . " impayé",
            "refCompteMembre" => $refCompteMembre,
        ]);

        // CRÉDIT du compte 38 (Provisions) - comptabilité générale
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumCompte" => $devise == 2 ? $this->compteProvisionCDF : $this->compteProvisionUSD,
            "NumComptecp" => $devise == 2 ? $this->compteDotationAuProvisionCDF : $this->compteDotationAuProvisionUSD,
            "Credit" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 * ($tauxDuJour),
            "Creditusd" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 / ($tauxDuJour),
            "NomUtilisateur" => "AUTO",
            "Libelle" => ($provisionPourcentage == 5 ? "Provision" : "Complement provision")
                . " de " . $provisionTranche
                . " sur l'encours de " . $SoldeCreditRestant
                . " en retard de " . $provisionRang
                . " dossier " . $NumDossier
                . " pour " . $capitalApayer . " impayé",
            "refCompteMembre" => $refCompteMembre,
            "refCompteMembre" => $refCompteMembre,
        ]);

        // CRÉDIT du compte 38 (Provisions) - compte client
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumCompte" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
            "NumComptecp" => $devise == 2 ? $this->compteDotationAuProvisionCDF : $this->compteDotationAuProvisionUSD,
            "Credit" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 * ($tauxDuJour),
            "Creditusd" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 / ($tauxDuJour),
            "NomUtilisateur" => "AUTO",
            "Libelle" => ($provisionPourcentage == 5 ? "Provision" : "Complement provision")
                . " de " . $provisionTranche
                . " sur l'encours de " . $SoldeCreditRestant
                . " en retard de " . $provisionRang
                . " dossier " . $NumDossier
                . " pour " . $capitalApayer . " impayé",
            "refCompteMembre" => $refCompteMembre,
            "refCompteMembre" => $refCompteMembre,
        ]);

        /* FIN - Constatation PROVISION */
    }


        /**
     * Annule une provision existante pour la remplacer par une nouvelle
     * Cette méthode est appelée quand le retard passe dans une tranche supérieure
     * 
     * @param string $codeMonnaie USD ou CDF
     * @param string $CodeAgence Code de l'agence
     * @param int $refCompteMembre Référence du membre
     * @param int $provisionTranche Tranche de provision à annuler (1,2,3,4,5)
     * @param float $montantRetard Montant en retard
     * @param float $tauxDuJour Taux de change du jour
     * @param float $SoldeCreditRestant Solde restant du crédit
     * @param string $NumDossier Numéro du dossier
     * @param string $ProvisionPourcentage Pourcentage de la provision à annuler
     * @param string $ProvisionDuree Libellé de la durée de provision
     * @param string $Gestionnaire Code du gestionnaire
     * @return void
     */
    protected function annulProvision(
        $codeMonnaie,
        $CodeAgence,
        $refCompteMembre,
        $provisionTranche,
        $montantRetard,
        $tauxDuJour,
        $SoldeCreditRestant,
        $NumDossier,
        $ProvisionPourcentage,
        $ProvisionDuree,
        $Gestionnaire,
    ) {
        // Calcul du montant de la provision selon la tranche
        if ($provisionTranche == 1) {
            $montantProvision = $SoldeCreditRestant * 5 / 100;
        } else if ($provisionTranche == 2) {
            $montantProvision = $SoldeCreditRestant * 10 / 100;
        } else if ($provisionTranche == 3) {
            $montantProvision = $SoldeCreditRestant * 25 / 100;
        } else if ($provisionTranche == 4) {
            $montantProvision = $SoldeCreditRestant * 75 / 100;
        } else if ($provisionTranche == 5) {
            $montantProvision = $SoldeCreditRestant * 100 / 100;
        }

        // Détermination de la devise
        if ($codeMonnaie == "USD") {
            $devise = 1; // USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; // CDF
        }
        
        // Construction du numéro de compte de provision selon la devise et l'ID membre
        if ($devise == 2) {
            if ($refCompteMembre < 10) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionCDF = "38010" . $refCompteMembre . "202";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionCDF = "3801" . $refCompteMembre . "202";
            } else {
                $compteProvisionCDF = "3801" . $refCompteMembre . "202";
            }
        } else if ($devise == 1) {
            if ($refCompteMembre < 10) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionUSD = "38000" . $refCompteMembre . "201";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionUSD = "3800" . $refCompteMembre . "201";
            } else {
                $compteProvisionUSD = "3800" . $refCompteMembre . "201";
            }
        }
        
        // ============================================
        // ÉCRITURES COMPTABLES POUR L'ANNULATION DE PROVISION
        // ============================================
        
        // Génération du numéro de transaction
        CompteurTransaction::create([
            'fakevalue' => "0000",
        ]);

        $numOperation = [];
        $numOperation = CompteurTransaction::latest()->first();
        $NumTransaction = "AT00" . $numOperation->id;

        // DÉBIT du compte 38 (Provisions) pour annuler l'ancienne provision
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumCompte" => $devise == 1 ? $compteProvisionUSD : $compteProvisionCDF,
            "NumComptecp" => $devise == 2 ? $this->compteDotationAuProvisionCDF : $this->compteDotationAuProvisionUSD,
            "Debit" => $montantProvision,
            "Operant" => $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantProvision : $montantProvision * $tauxDuJour,
            "Debitusd" => $devise == 1 ? $montantProvision : $montantProvision / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision de " . $ProvisionPourcentage . " sur l'encours de " . $SoldeCreditRestant . "  en retard de " . $ProvisionDuree . " dossier " . $NumDossier . " pour " . $montantRetard . " impayé",
            "refCompteMembre" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
        ]);

        // DÉBIT du compte 38 (Provisions) - comptabilité générale
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumCompte" => $devise == 1 ? $this->compteProvisionUSD : $this->compteProvisionCDF,
            "NumComptecp" => $devise == 2 ? $this->compteDotationAuProvisionCDF : $this->compteDotationAuProvisionUSD,
            "Debit" => $montantProvision,
            "Operant" => $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantProvision : $montantProvision * $tauxDuJour,
            "Debitusd" => $devise == 1 ? $montantProvision : $montantProvision / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision de " . $ProvisionPourcentage . " sur l'encours de " . $SoldeCreditRestant . "  en retard de " . $ProvisionDuree . "  dossier " . $NumDossier . " pour " . $montantRetard . " impayé",
            "refCompteMembre" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
        ]);

        // CRÉDIT du compte 79 (Reprise sur provisions) - compte de produit
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumCompte" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
            "NumComptecp" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
            "Credit" => $montantProvision,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? $montantProvision : $montantProvision * $tauxDuJour,
            "Creditusd" => $devise == 1 ? $montantProvision : $montantProvision / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision de " . $ProvisionPourcentage . " sur l'encours de " . $SoldeCreditRestant . " en retard de " . $ProvisionDuree . " dossier " . $NumDossier . " pour " . $montantRetard . " impayé",
            "refCompteMembre" => $devise == 2 ? $this->compteDotationAuProvisionCDF : $this->compteRepriseDeProvisionUSD,
        ]);
    }




        /**
     * Insère une transaction de reprise de provision lors d'un remboursement
     * Cette méthode est appelée quand un client rembourse tout ou partie d'un crédit en retard
     * Elle gère la reprise de provision et la sortie du statut de créance litigieuse
     * 
     * @param float $capitalPaye Montant du capital remboursé
     * @param string $codeMonnaie USD ou CDF
     * @param string $dateSystem Date du traitement
     * @param string $CodeAgence Code de l'agence
     * @param float $tauxDuJour Taux de change du jour
     * @param string $typeRemboursement "partiel" ou "complet"
     * @param string $compteEpargneCustomer Compte épargne du client
     * @param int $trancheNumber Numéro de la tranche
     * @param string $dateTranche Date de la tranche
     * @param float $MontantAccorde Montant total du crédit accordé
     * @param string $NumDossier Numéro du dossier
     * @param string $Gestionnaire Code du gestionnaire
     * @return void
     */
    protected function insertInTransactionRepriseProvision(
        $capitalPaye,
        $codeMonnaie,
        $dateSystem,
        $CodeAgence,
        $tauxDuJour,
        $typeRemboursement,
        $compteEpargneCustomer,
        $trancheNumber,
        $dateTranche,
        $MontantAccorde,
        $NumDossier,
        $Gestionnaire,
    ) {
        // Détermination de la devise
        if ($codeMonnaie == "USD") {
            $devise = 1; // USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; // CDF
        }

        // Récupération des informations de retard depuis la table jour_retard
        $getCompteJourRetard = JourRetard::where("NumDossier", $NumDossier)->where("provision1", "!=", 0)->first();
        
        if ($getCompteJourRetard) {
            $compteProvisionCustomer = $getCompteJourRetard->CompteProvision;
            $compteCreanceLitigieuseCustomer = $getCompteJourRetard->NumCompteCreanceLitigieuse;
            $NumCompteCreditCustomer = $getCompteJourRetard->NumcompteCredit;
            
            if ($getCompteJourRetard->NbrJrRetard > 0) {
                // ============================================
                // DÉTERMINATION DE LA MATURITÉ DE PROVISION
                // ============================================
                
                $provisionMatirute = 0;
                if (
                    $getCompteJourRetard->provision1 == 1
                    and $getCompteJourRetard->provision2 == 0
                    and $getCompteJourRetard->provision3 == 0
                    and $getCompteJourRetard->provision4 == 0
                    and $getCompteJourRetard->provision5 == 0
                ) {
                    $provisionMatirute = 5;      // Provision à 5%
                } else if (
                    $getCompteJourRetard->provision1 == 1
                    and $getCompteJourRetard->provision2 == 1
                    and $getCompteJourRetard->provision3 == 0
                    and $getCompteJourRetard->provision4 == 0
                    and $getCompteJourRetard->provision5 == 0
                ) {
                    $provisionMatirute = 10;     // Provision à 10%
                } else if (
                    $getCompteJourRetard->provision1 == 1
                    and $getCompteJourRetard->provision2 == 1
                    and $getCompteJourRetard->provision3 == 1
                    and $getCompteJourRetard->provision4 == 0
                    and $getCompteJourRetard->provision5 == 0
                ) {
                    $provisionMatirute = 25;     // Provision à 25%
                } else if (
                    $getCompteJourRetard->provision1 == 1
                    and $getCompteJourRetard->provision2 == 1
                    and $getCompteJourRetard->provision3 == 1
                    and $getCompteJourRetard->provision4 == 1
                    and $getCompteJourRetard->provision5 == 0
                ) {
                    $provisionMatirute = 75;     // Provision à 75%
                } else if (
                    $getCompteJourRetard->provision1 == 1
                    and $getCompteJourRetard->provision2 == 1
                    and $getCompteJourRetard->provision3 == 1
                    and $getCompteJourRetard->provision4 == 1
                    and $getCompteJourRetard->provision5 == 1
                ) {
                    $provisionMatirute = 100;    // Provision à 100%
                }
                
                // Traitement selon le montant remboursé
                if (round($capitalPaye, 2) > 0) {
                    // ============================================
                    // CAS REMBOURSEMENT PARTIEL
                    // ============================================
                    
                    if ($typeRemboursement == "partiel") {
                        // Génération du numéro de transaction
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
                        
                        $montantReprise = $capitalPaye * $provisionMatirute / 100;
                        
                        /* Remboursement partiel - Reprise de provision 38 vers 79 */
                        
                        // Calcul du solde de la provision du client
                        $soldeMembreProv = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $compteProvisionCustomer)
                            ->groupBy("NumCompte")
                            ->first();
                            
                        if ($soldeMembreProv->soldeMembreCDF or $soldeMembreProv->soldeMembreUSD > 0) {
                            // DÉBIT du compte 38 (Provisions) - comptabilité générale
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => date("Y-m-d"),
                                "TypeTransaction" => "D",
                                "CodeMonnaie" => $devise,
                                "CodeAgence" => $CodeAgence,
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $devise == 2 ? $this->compteProvisionCDF : $this->compteProvisionUSD,
                                "NumComptecp" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
                                "Debit" => $montantReprise,
                                "Operant" => $Gestionnaire,
                                "Debitfc" => $devise == 2 ? $montantReprise : $montantReprise * ($tauxDuJour),
                                "Debitusd" => $devise == 1 ? $montantReprise : $montantReprise / ($tauxDuJour),
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Reprise sur provision dossier " . $NumDossier,
                            ]);

                            // DÉBIT du compte 38 (Provisions) - compte client
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => date("Y-m-d"),
                                "TypeTransaction" => "D",
                                "CodeMonnaie" => $devise,
                                "CodeAgence" => $CodeAgence,
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $compteProvisionCustomer,
                                "NumComptecp" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
                                "Debit" => $montantReprise,
                                "Operant" => $Gestionnaire,
                                "Debitfc" => $devise == 2 ? $montantReprise : $montantReprise * ($tauxDuJour),
                                "Debitusd" => $devise == 1 ? $montantReprise : $montantReprise / ($tauxDuJour),
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Reprise sur provision dossier " . $NumDossier,
                            ]);

                            // CRÉDIT du compte 79 (Reprise sur provisions)
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => $dateSystem,
                                "TypeTransaction" => "C",
                                "CodeMonnaie" => $devise,
                                "CodeAgence" => $CodeAgence,
                                "NumCompte" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
                                "NumComptecp" => $devise == 2 ? $this->compteProvisionCDF : $this->compteProvisionUSD,
                                "Credit" => $montantReprise,
                                "Operant" => $Gestionnaire,
                                "Creditfc" => $devise == 2 ? $montantReprise : $montantReprise * ($tauxDuJour),
                                "Creditusd" => $devise == 1 ? $montantReprise : $montantReprise / ($tauxDuJour),
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Reprise sur provision dossier " . $NumDossier,
                            ]);
                        }
                        
                        // Nouvelle transaction pour le remboursement partiel
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;

                        // CRÉDIT du compte 39 (Créance litigieuse) - comptabilité générale
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $devise == 2 ? $this->compteCreanceLitigeuseCDF : $this->compteCreanceLitigeuseUSD,
                            "NumComptecp" => $compteEpargneCustomer,
                            "Credit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement partiel de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);

                        // CRÉDIT du compte 39 (Créance litigieuse) - compte client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $compteCreanceLitigieuseCustomer,
                            "NumComptecp" => $compteEpargneCustomer,
                            "Credit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement partiel de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);
                        
                        // DÉBIT du compte épargne du client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $compteEpargneCustomer,
                            "NumComptecp" => $compteCreanceLitigieuseCustomer,
                            "Debit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Debitusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement partiel capital de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);

                        // CRÉDIT du compte crédit du client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $NumCompteCreditCustomer,
                            "NumComptecp" => $compteCreanceLitigieuseCustomer,
                            "Credit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement partiel capital de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);
                    } 
                    // ============================================
                    // CAS REMBOURSEMENT COMPLET
                    // ============================================
                    else if ($typeRemboursement == "complet") {
                        // Vérification de l'existence du compte de provision
                        $checkCompteExist = Transactions::where("NumCompte", $compteProvisionCustomer)->first();
                        if (!$checkCompteExist) {
                            Transactions::create([
                                "DateTransaction" => $this->dateSystem,
                                "CodeMonnaie" => $devise == 1 ? 1 : 2,
                                "NumCompte" => $compteProvisionCustomer,
                                "Debit" => 0,
                                "Debit$" => 0,
                                "Debitfc" => 0,
                                "is_system" => 1,
                            ]);
                        }
                        
                        // Calcul du solde de la provision
                        $soldeMembreProv = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $compteProvisionCustomer)
                            ->groupBy("NumCompte")
                            ->first();

                        if ($devise == 1) {
                            $soldeProvision = $soldeMembreProv->soldeMembreUSD;
                        } else {
                            $soldeProvision = $soldeMembreProv->soldeMembreCDF;
                        }

                        // Génération du numéro de transaction
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;

                        /* Remboursement complet - Reprise de provision 38 vers 79 */
                        
                        // DÉBIT du compte 38 (Provisions) - comptabilité générale
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => date("Y-m-d"),
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumDossier" => "DOS00" . $numOperation->id,
                            "NumDemande" => "V00" . $numOperation->id,
                            "NumCompte" => $devise == 2 ? $this->compteProvisionCDF : $this->compteProvisionUSD,
                            "NumComptecp" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
                            "Debit" => $soldeProvision,
                            "Operant" => $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $soldeProvision : $soldeProvision * ($tauxDuJour),
                            "Debitusd" => $devise == 1 ? $soldeProvision : $soldeProvision / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Reprise sur provision crédit sain dossier " . $NumDossier,
                        ]);

                        // DÉBIT du compte 38 (Provisions) - compte client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => date("Y-m-d"),
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumDossier" => "DOS00" . $numOperation->id,
                            "NumDemande" => "V00" . $numOperation->id,
                            "NumCompte" => $compteProvisionCustomer,
                            "NumComptecp" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
                            "Debit" => $soldeProvision,
                            "Operant" => $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $soldeProvision : $soldeProvision * ($tauxDuJour),
                            "Debitusd" => $devise == 1 ? $soldeProvision : $soldeProvision / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Reprise sur provision crédit sain dossier " . $NumDossier,
                        ]);

                        // CRÉDIT du compte 79 (Reprise sur provisions)
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $devise == 2 ? $this->compteRepriseDeProvisionCDF : $this->compteRepriseDeProvisionUSD,
                            "NumComptecp" => $devise == 2 ? $this->compteProvisionCDF : $this->compteProvisionUSD,
                            "Credit" => $soldeProvision,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $soldeProvision : $soldeProvision * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $soldeProvision : $soldeProvision / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Reprise sur provision crédit sain dossier " . $NumDossier,
                        ]);

                        // Nouvelle transaction pour le remboursement complet
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
                        
                        // CRÉDIT du compte 39 (Créance litigieuse) - comptabilité générale
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $devise == 2 ? $this->compteCreanceLitigeuseCDF : $this->compteCreanceLitigeuseUSD,
                            "NumComptecp" => $compteEpargneCustomer,
                            "Credit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);

                        // DÉBIT du compte épargne du client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $compteEpargneCustomer,
                            "NumComptecp" => $compteCreanceLitigieuseCustomer,
                            "Debit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Debitusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);

                        // CRÉDIT du compte crédit du client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $NumCompteCreditCustomer,
                            "NumComptecp" => $compteCreanceLitigieuseCustomer,
                            "Credit" => $capitalPaye,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Remboursement de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                        ]);

                        // ============================================
                        // IMPUTATION POUR REMETTRE LE CRÉDIT DANS LE CRÉDIT SAIN
                        // ============================================
                        
                        // Vérification de l'existence du compte créance litigieuse
                        $checkCompteExist = Transactions::where("NumCompte", $compteCreanceLitigieuseCustomer)->first();
                        if (!$checkCompteExist) {
                            Transactions::create([
                                "DateTransaction" => $this->dateSystem,
                                "CodeMonnaie" => $devise == 1 ? 1 : 2,
                                "NumCompte" => $compteCreanceLitigieuseCustomer,
                                "Debit" => 0,
                                "Debit$" => 0,
                                "Debitfc" => 0,
                                "is_system" => 1,
                            ]);
                        }
                        
                        // Calcul du solde de la créance litigieuse
                        $soldeMembreProv = Transactions::select(
                            DB::raw("SUM(Debitfc)-SUM(Creditfc) as soldeMembreCDF"),
                            DB::raw("SUM(Debitusd)-SUM(Creditusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $compteCreanceLitigieuseCustomer)
                            ->groupBy("NumCompte")
                            ->first();

                        if ($devise == 1) {
                            $soldeCreanceL = $soldeMembreProv->soldeMembreUSD;
                        } else {
                            $soldeCreanceL = $soldeMembreProv->soldeMembreCDF;
                        }

                        // Nouvelle transaction pour l'imputation
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
                        
                        // DÉBIT du compte crédit comptabilité
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $devise == 2 ? $this->compteCreditAuxMembreCDF : $this->compteCreditAuxMembreUSD,
                            "NumComptecp" => $devise == 2 ? $this->compteCreanceLitigeuseCDF : $this->compteCreanceLitigeuseUSD,
                            "Debit" => $soldeCreanceL,
                            "Operant" => $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $soldeCreanceL : $soldeCreanceL * ($tauxDuJour),
                            "Debitusd" => $devise == 1 ? $soldeCreanceL : $soldeCreanceL / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Imputation de " . $soldeCreanceL . ($devise == 1 ? "USD" : "CDF") . " dans la tranche des crédits sain dossier " . $NumDossier,
                        ]);

                        // DÉBIT du compte crédit du client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $NumCompteCreditCustomer,
                            "NumComptecp" => $devise == 2 ? $this->compteCreanceLitigeuseCDF : $this->compteCreanceLitigeuseUSD,
                            "Debit" => $soldeCreanceL,
                            "Operant" => $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $soldeCreanceL : $soldeCreanceL * ($tauxDuJour),
                            "Debitusd" => $devise == 1 ? $soldeCreanceL : $soldeCreanceL / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Imputation de " . $soldeCreanceL . ($devise == 1 ? "USD" : "CDF") . " dans la tranche des crédits sain dossier " . $NumDossier,
                        ]);

                        // CRÉDIT du compte 39 (Créance litigieuse) - comptabilité générale
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $devise == 2 ? $this->compteCreanceLitigeuseCDF : $this->compteCreanceLitigeuseUSD,
                            "NumComptecp" => $devise == 2 ? $this->compteCreditAuxMembreCDF : $this->compteCreditAuxMembreUSD,
                            "Credit" => $soldeCreanceL,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $soldeCreanceL : $soldeCreanceL * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $soldeCreanceL : $soldeCreanceL / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Imputation de " . $soldeCreanceL . ($devise == 1 ? "USD" : "CDF") . " dans la tranche des crédits sain dossier " . $NumDossier,
                        ]);

                        // CRÉDIT du compte 39 (Créance litigieuse) - compte client
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumCompte" => $compteCreanceLitigieuseCustomer,
                            "NumComptecp" => $devise == 2 ? $this->compteCreditAuxMembreCDF : $this->compteCreditAuxMembreUSD,
                            "Credit" => $soldeCreanceL,
                            "Operant" => $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $soldeCreanceL : $soldeCreanceL * ($tauxDuJour),
                            "Creditusd" => $devise == 1 ? $soldeCreanceL : $soldeCreanceL / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Imputation de " . $soldeCreanceL . ($devise == 1 ? "USD" : "CDF") . " dans la tranche des crédits sain dossier " . $NumDossier,
                        ]);

                        // Annulation des jours de retard
                        $this->AnnuleJourRetard($NumDossier);
                    }
                }
            }
        }
    }











  
}
