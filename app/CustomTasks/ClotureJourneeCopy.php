<?php

namespace App\CustomTasks;

use App\Constants\JournalType;
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
use App\Models\EpargneAdhesionModel;

class ClotureJourneeCopy

{
    // Déclaration des propriétés
    protected $dateSystem;
    protected $tauxDuJour;
    protected $compteCreditAuxMembreCDF;
    protected $compteCreditAuxMembreUSD;
    protected $compteDotationAuProvisionCDF;
    protected $compteDotationAuProvisionUSD;
    protected $compteRepriseDeProvisionCDF;
    protected $compteRepriseDeProvisionUSD;
    protected $compteCreanceLitigeuseUSD;
    protected $compteCreanceLitigeuseCDF;
    protected $compteProvisionCDF;
    protected $compteProvisionUSD;
    // protected $montantRemboursementManuel;
    protected $remboursAnticipe;
    protected $numDossier;
    protected $gestionPostEcheance;
    protected $gestionPenalites;

    // protected $compteProvisionCDF1A30Jr;
    // protected $compteProvisionCDF31A60Jr;
    // protected $compteProvisionCDF61A90Jr;
    // protected $compteProvisionCDF91A180Jr;
    // protected $compteProvisionCDF180Et180Jr;
    protected $accountsConfig;
    protected $sendNotification;


    // Ajout d'une propriété pour suivre les erreurs
    protected $hasError = false;
    protected $errorMessage = null;
    protected $errorCode = null;
    protected $soldeMinimumUSD;
    protected $soldeMinimumCDF;


    public function __construct(Request $request)
    {
        // Récupération des dernières valeurs de la base de données et initialisation des propriétés
        $latestTauxEtDateSystem = TauxEtDateSystem::latest()->first();
        $porteFeuilleConfig = PorteFeuilleConfing::first();
        // $this->dateSystem = $latestTauxEtDateSystem ? $latestTauxEtDateSystem->DateSystem : null;
        $this->dateSystem = date("Y-m-d");
        $this->tauxDuJour = $latestTauxEtDateSystem ? $latestTauxEtDateSystem->TauxEnFc : null;
        $this->accountsConfig = $porteFeuilleConfig;
        $this->remboursAnticipe = $request->remboursAnticipe;
        $this->numDossier = $request->numDossier;
        $this->sendNotification = app(SendNotification::class);
        $this->gestionPostEcheance = new GestionInteretsPostEcheance($this->dateSystem, $this->tauxDuJour);
        // 🔥 Ajout : instanciation de la classe de pénalités
        $delaiAvantPenalite = 30; // À configurer selon votre politique (peut venir d'une config)
        $this->gestionPenalites = new GestionInteretsRetard($this->dateSystem, $this->tauxDuJour, $delaiAvantPenalite);
        //PARAMETRE SOLDE MINIMUM
        $params = EpargneAdhesionModel::first();
        $this->soldeMinimumUSD = $params ? (float)($params->solde_minimum_usd ?? 0) : 0;
        $this->soldeMinimumCDF = $params ? (float)($params->solde_minimum_cdf ?? 0) : 0;
    }

    /**
     * Gère la clôture de la journée.
     */
    public function execute()
    {

        DB::beginTransaction();
        try {
            $this->validateRequiredData();



            Log::info("Début de l'exécution de la clôture", [
                'date_system' => $this->dateSystem,
                'taux_du_jour' => $this->tauxDuJour
            ]);

            // Vérification pour le remboursement manuel ou anticipé d'un crédit spécifique
            if (!is_null($this->numDossier)) {
                $portefeuille = Portefeuille::where("NumDossier", $this->numDossier)->first();

                $this->checkAndStopOnError(
                    !$portefeuille,
                    "Aucun crédit trouvé avec le numéro de dossier: {$this->numDossier}",
                    "ERR_DOSSIER_001"
                );

                // Si le crédit est clôturé, on n'exécute rien
                if ($portefeuille && $portefeuille->Cloture == 1) {
                    info("Le crédit avec le dossier " . $this->numDossier . " est clôturé. Aucun traitement effectué.");
                    return;
                }
            }



            // $lock = DB::table('cloture_lock')->first();
            // if ($lock && $lock->last_cloture_date == $this->dateSystem) {
            //     throw new \Exception("Une clôture a déjà été exécutée aujourd'hui.");
            // }
            // DB::table('cloture_lock')->updateOrInsert(
            //     ['id' => 1],
            //     ['last_cloture_date' => $this->dateSystem, 'updated_at' => now()]
            // );

            $this->traiterRemboursementsAEcheance();
            $this->traiterRemboursementsEnRetard();

            $this->gestionPenalites->execute();      // 👈 pénalités en premier
            $this->gestionPostEcheance->execute();   // 👈 intérêts post-échéance ensuite
            DB::commit();

            Log::info("Exécution de la clôture terminée avec succès");
        } catch (\Exception $e) {
            Log::error("Erreur lors de l'exécution de la clôture", [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Afficher un message clair à l'utilisateur
            if (app()->runningInConsole()) {
                echo "\n🔴 ERREUR CRITIQUE: Le processus a été arrêté\n";
                echo "📝 Détail: " . $e->getMessage() . "\n";
                echo "📊 Code: " . $e->getCode() . "\n";
            } else {
                // Pour une API/Web
                throw new \Exception("Erreur système: " . $e->getMessage(), $e->getCode());
            }

            // Relancer l'exception pour arrêter complètement
            throw $e;
        }
    }

    /**
     * Vérifie s'il y a une erreur et arrête l'exécution
     */
    protected function checkAndStopOnError($condition, $errorMessage, $errorCode = null)
    {
        if ($condition) {
            $this->hasError = true;
            $this->errorMessage = $errorMessage;
            $this->errorCode = $errorCode;

            // Log de l'erreur
            Log::error("ERREUR CRITIQUE - Code: {$errorCode} - Message: {$errorMessage}");

            // Afficher un message à l'écran (si en environnement web)
            if (app()->runningInConsole()) {
                echo "\n❌ ERREUR: {$errorMessage}\n";
                if ($errorCode) echo "Code: {$errorCode}\n";
            } else {
                session()->flash('error', "Erreur: {$errorMessage}");
            }

            // Lancer une exception pour arrêter l'exécution
            $code = (is_numeric($errorCode) && $errorCode !== null) ? (int) $errorCode : 500;
            throw new \Exception($errorMessage, $code);
        }
    }

    /**
     * Vérifie les données requises avant exécution
     */
    protected function validateRequiredData()
    {
        // Vérification des données système
        $this->checkAndStopOnError(
            is_null($this->dateSystem),
            "La date système n'est pas configurée correctement",
            "ERR_DATE_001"
        );

        $this->checkAndStopOnError(
            is_null($this->tauxDuJour),
            "Le taux du jour n'est pas configuré correctement",
            "ERR_TAUX_001"
        );

        $this->checkAndStopOnError(
            is_null($this->accountsConfig),
            "La configuration des portefeuilles n'est pas disponible",
            "ERR_CONFIG_001"
        );
    }

    /**
     * Vérifie les données d'un crédit avant traitement
     */
    protected function validateCreditData($credit, $context = "général")
    {
        $requiredFields = [
            'NumDossier' => 'Numéro de dossier',
            'NumCompteEpargne' => 'Compte épargne',
            'CodeMonnaie' => 'Code monnaie',
            'CodeAgence' => 'Code agence',
            'numAdherant' => 'Numéro adhérent'
        ];

        foreach ($requiredFields as $field => $label) {
            $this->checkAndStopOnError(
                !isset($credit->$field) || is_null($credit->$field) || $credit->$field === '',
                "Donnée manquante pour le crédit {$credit->NumDossier} - {$label} non défini (contexte: {$context})",
                "ERR_DATA_{$field}"
            );
        }
    }

    /**
     * Vérifie que le solde du membre est valide
     */
    protected function validateSoldeMembre($solde, $montantNecessaire, $numDossier)
    {
        $this->checkAndStopOnError(
            is_null($solde),
            "Impossible de récupérer le solde du membre pour le dossier {$numDossier}",
            "ERR_SOLDE_001"
        );

        $this->checkAndStopOnError(
            $solde < 0,
            "Solde négatif détecté pour le dossier {$numDossier}: {$solde}",
            "ERR_SOLDE_002"
        );
    }

    /**
     * Crée un compte s'il n'existe pas déjà.
     * @param string $numCompte
     * @param string $nomCompte
     * @param string $nature (CHARGE ou PRODUIT)
     * @param string $codeAgence
     * @param int $codeMonnaie (1 = USD, 2 = CDF)
     */
    private function ensureAccountExists($numCompte, $nomCompte, $nature, $codeAgence, $codeMonnaie)
    {
        if (!Comptes::where('NumCompte', $numCompte)->exists()) {
            // Déduire les références hiérarchiques à partir du numéro
            $refTypeCompte = substr($numCompte, 0, 1);   // 6 ou 7
            $refCadre = substr($numCompte, 0, 2);       // 69 ou 79
            $refGroupe = substr($numCompte, 0, 3);      // 690 ou 790
            $refSousGroupe = substr($numCompte, 0, 4);  // 6901 ou 7901

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
     * Génère le compte de dotation aux provisions (69) pour une agence et un code devise.
     * @param string $codeAgence
     * @param int $codeMonnaie (1 = USD, 2 = CDF)
     * @return string
     */

    /**
     * Obtient (ou crée) le compte de dotation aux provisions (69) pour une agence et une devise.
     * @param string $codeAgence
     * @param int $codeMonnaie (1 = USD, 2 = CDF)
     * @return string
     */
    private function getCompteDotationProvision($codeAgence, $codeMonnaie)
    {
        $codeAgencePad = str_pad($codeAgence, 2, '0', STR_PAD_LEFT);
        // Normalisation : accepter entier ou string
        if (is_string($codeMonnaie)) {
            $codeMonnaie = $codeMonnaie === 'USD' ? 1 : 2;
        }
        if ($codeMonnaie == 1) {
            $numCompte = "6900000000" . $codeAgencePad . "1";
            $nomCompte = "Dotation aux provisions USD - Agence " . $codeAgence;
            $nature = 'CHARGE';
        } else {
            $numCompte = "6901000000" . $codeAgencePad . "2";
            $nomCompte = "Dotation aux provisions CDF - Agence " . $codeAgence;
            $nature = 'CHARGE';
        }
        $this->ensureAccountExists($numCompte, $nomCompte, $nature, $codeAgence, $codeMonnaie);
        return $numCompte;
    }

    /**
     * Obtient (ou crée) le compte de reprise de provisions (79) pour une agence et une devise.
     * @param string $codeAgence
     * @param int $codeMonnaie (1 = USD, 2 = CDF)
     * @return string
     */
    private function getCompteRepriseProvision($codeAgence, $codeMonnaie)
    {
        // Normalisation : accepter entier ou string
        if (is_string($codeMonnaie)) {
            $codeMonnaie = $codeMonnaie === 'USD' ? 1 : 2;
        }
        $codeAgencePad = str_pad($codeAgence, 2, '0', STR_PAD_LEFT);
        if ($codeMonnaie == 1) {
            $numCompte = "7900000000" . $codeAgencePad . "1";
            $nomCompte = "Reprise sur provisions USD - Agence " . $codeAgence;
            $nature = 'PRODUIT';
        } else {
            $numCompte = "7901000000" . $codeAgencePad . "2";
            $nomCompte = "Reprise sur provisions CDF - Agence " . $codeAgence;
            $nature = 'PRODUIT';
        }
        $this->ensureAccountExists($numCompte, $nomCompte, $nature, $codeAgence, $codeMonnaie);
        return $numCompte;
    }


    protected function getSoldeMinimum($codeMonnaie)
{
    return $codeMonnaie == 1 ? $this->soldeMinimumUSD : $this->soldeMinimumCDF;
}


    /**
     * 1. Traiter les remboursements à l'échéance.
     */
    public function traiterRemboursementsAEcheance()
    {
        try {
            $creditsAEcheance = $this->recupererCreditsAEcheance();
            //dd($creditsAEcheance->count(), $creditsAEcheance->toArray());

            $this->checkAndStopOnError(
                $creditsAEcheance === false,
                "Erreur lors de la récupération des crédits à échéance",
                "ERR_QUERY_001"
            );
            foreach ($creditsAEcheance as $credit) {
                // Validation des données du crédit
                $this->validateCreditData($credit, "traitement_échéance");

                // Vérification supplémentaire pour s'assurer que le crédit n'est pas clôturé
                if ($credit->Cloture == 1) {
                    continue; // Passer au crédit suivant
                }
                //ATTRIBUTES
                $NumCompte = $credit->NumCompteEpargne;
                $CodeMonnaie = $credit->CodeMonnaie == "USD" ? 1 : 2;
                $soldeMembre = $this->checkSoldeMembrePASSIF($CodeMonnaie, $NumCompte);
                $CapAmmorti = $credit->CapAmmorti;
                $interetApayer = $credit->Interet;
                $MontantTotalApayer = $CapAmmorti + $interetApayer;


                $this->checkAndStopOnError(
                    $CapAmmorti < 0 || $interetApayer < 0,
                    "Montants négatifs détectés pour le dossier {$credit->NumDossier}: Capital={$CapAmmorti}, Intérêt={$interetApayer}",
                    "ERR_MONTANT_001"
                );

                //RETOURNE true SI LE MEMBRE EST EN RETARD false SI SON CREDIT EST SAIN
                $checkRetard = $this->calculerJoursRetard(
                    $credit->NumDossier,
                );
                /*  SI LE SOLDE DU CLIENT EST SUPERIEUR OU EGAL AU MONTANT
            DE CREDIT QUI'IL DOIT REMBOURSER EST QUE IL N'EST PAS A 
            RETARD DE REMBOURSEMENT */

                if ($soldeMembre >= $MontantTotalApayer and !$checkRetard) {
                    $this->appliquerPaiementInteretPuisCapital($credit);
                    //SI LE SOLDE DU COMPTE EST INFERIEUR A L'INTERET QU'IL DOIT PAYER + CAPITAL
                } else {
                    //dd($soldeMembre);
                    $this->gererProvisions();
                    $this->constateRetard($credit->ReferenceEch);
                    // $this->traiterRemboursementsEnRetard();
                }
            }
        } catch (\Exception $e) {
            $this->checkAndStopOnError(true, "Erreur dans traiterRemboursementsAEcheance: " . $e->getMessage(), "ERR_TRANCHE_001");
        }
    }

    /**
     * 2. Traiter les remboursements en retard.
     */
    public function traiterRemboursementsEnRetard()
    {
        $creditsEnRetard = $this->recupererCreditsEnRetard();

        foreach ($creditsEnRetard as $creditRet) {
            // Vérification pour les crédits en retard
            // Récupérer le portefeuille associé pour vérifier Cloture
            $portefeuille = Portefeuille::where("NumDossier", $creditRet->NumDossier)->first();

            // Si le crédit est clôturé, on passe au suivant
            if ($portefeuille && $portefeuille->Cloture == 1) {
                info("Crédit en retard avec dossier " . $creditRet->NumDossier . " est clôturé. Traitement ignoré.");
                continue;
            }


            $this->mettreAJourRetard($creditRet);
        }
    }

    /**
     * 3. Gérer les provisions pour les crédits en retard.
     */
    protected function gererProvisions()
    {

        $creditsAvecProvisions = $this->recupererCreditsAvecProvisions();

        foreach ($creditsAvecProvisions as $credit) {
            $this->gererProvisionPourRetard($credit);
        }
    }

    // protected function recupererCreditsAEcheance()
    // {
    //     info("value " . $this->remboursAnticipe);

    //     // Base de la requête avec vérification de Cloture = 0
    //     $baseQuery = Portefeuille::where("portefeuilles.Cloture", "=", 0)
    //         ->lockForUpdate() // 👈 ajout
    //         ->where("portefeuilles.Octroye", "=", 1)
    //         ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
    //         ->where("echeanciers.statutPayement", "=", 0)
    //         ->where("echeanciers.posted", "=", 0)
    //         ->where("echeanciers.CapAmmorti", ">", 0);

    //     //REMBOURSEMENT ANTICIPE
    //     if ($this->remboursAnticipe == true and !is_null($this->numDossier)) {
    //         //RECUPERE ICI LA DATE D'ECHEANCE DU CREDIT 
    //         $dateEcheanche = Portefeuille::where("NumDossier", $this->numDossier)->first()->DateEcheance;
    //         return $baseQuery->where("echeanciers.DateTranch", "<=", $dateEcheanche)
    //             ->where("echeanciers.NumDossier", "=", $this->numDossier)
    //             ->get();

    //         //REMBOURSEMENT VISANT EN RECUPERER SEULEMENT LE MONTANT SAISIE PAR L'UTILISATEUR
    //     } else if ($this->remboursAnticipe == false and !is_null($this->numDossier) and !is_null($this->montantRemboursementManuel)) {
    //         return $baseQuery->where("echeanciers.DateTranch", "<=", $this->dateSystem)
    //             ->where("echeanciers.NumDossier", "=", $this->numDossier)
    //             ->get();
    //     } else {

    //         return $baseQuery->where("echeanciers.DateTranch", "<=", $this->dateSystem)
    //             ->get();
    //     }
    // }

    protected function recupererCreditsAEcheance()
    {
        $baseQuery = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->lockForUpdate()
            ->where("portefeuilles.Octroye", "=", 1)
            ->where("portefeuilles.Radie", "=", 0)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.Reechelonne", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0);

        // Remboursement anticipé : on prend toutes les échéances jusqu'à la date d'échéance finale
        if ($this->remboursAnticipe == true && !is_null($this->numDossier)) {
            $dateEcheance = Portefeuille::where("NumDossier", $this->numDossier)->first()->DateEcheance;
            return $baseQuery->where("echeanciers.DateTranch", "<=", $dateEcheance)
                ->where("echeanciers.NumDossier", "=", $this->numDossier)
                ->get();
        }

        // Cas normal : toutes les échéances échues (DateTranch <= aujourd'hui)
        return $baseQuery->where("echeanciers.DateTranch", "<=", $this->dateSystem)
            ->when(!is_null($this->numDossier), function ($q) {
                return $q->where("echeanciers.NumDossier", "=", $this->numDossier);
            })
            ->get();
    }

    /**
     * Applique les paiements sur les intérêts puis sur le capital.
     */
    public function appliquerPaiementInteretPuisCapital($credit)
    {
        // Logique de calcul pour les intérêts
        $this->payerInterets($credit);

        // Logique de calcul pour le capital
        $this->payerCapital($credit);
    }
    public function payerInterets($credit)
    {
        info("ok " . $credit->CodeMonnaie);
        // Implémentez le paiement des intérêts
        //REMBOURSEMENT EN INTERET DEBITE LE COMPTE DU CLIENT
        $libelle = "Remboursement intérêt du crédit de "
            . $credit->MontantAccorde . "  pour la "
            . $credit->NbreJour . "e tranche tombée en date du "
            . $credit->DateTranch . " Numéro dossier "
            . $credit->NumDossier;
        $this->insertInTransactionInteret(
            // $credit->MontantAccorde,
            $credit->Interet,
            $credit->CodeMonnaie,
            $this->dateSystem,
            $credit->CodeAgence,
            $credit->NumCompteEpargne,
            $credit->CompteInteret,
            $this->tauxDuJour,
            $credit->numAdherant,
            // $credit->NbreJour,
            // $credit->DateTranch,
            $credit->NumDossier,
            $libelle,
            $credit->Gestionnaire,
            $credit->ReferenceEch
        );
        // $this->CheckTransactionStatus();
        //ENVOIE UN MESSAGE AU CLIENT INTERET COMPLET
        $this->sendNotification->sendNotificationRemboursementCredit($credit->numAdherant, $credit->CodeMonnaie, $credit->Interet, "Interet", "");
    }

    protected function payerCapital($credit)
    {

        // Définition des variables dynamiques
        $libelle = "Remboursement capital du crédit de "
            . $credit->MontantAccorde . "  pour la "
            . $credit->NbreJour . "e tranche tombée en date du "
            . $credit->DateTranch . " Numéro dossier "
            . $credit->NumDossier;
        //REMBOURSEMENT EN CAPITAL
        $numTransaction = $this->insertInTransactionCapital(
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
            $credit->NumDossier,
            $credit->ReferenceEch
        );
        //RENSEIGNE LE PAYEMENT DANS LA TABLE REMBOURSEMENT
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
            $numTransaction
        );
        //RENSEIGNE LE REMBOURSEMENT 
        $this->ClotureTranche($credit->ReferenceEch);

        //ENVOIE UN MESSAGE AU CLIENT CAPITAL COMPLET
        $this->sendNotification->sendNotificationRemboursementCredit($credit->numAdherant, $credit->CodeMonnaie, $credit->CapAmmorti, "Capital", "");
    }

    /**
     * Récupère les crédits en retard.
     */
    protected function recupererCreditsEnRetard()
    {
        // On joint avec portefeuilles pour avoir accès à Cloture
        // $query = Echeancier::join('portefeuilles', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
        //     ->where('echeanciers.RetardPayement', 1)
        //     ->where('portefeuilles.Cloture', '=', 0); // Vérification que le crédit n'est pas clôturé

        $today = $this->dateSystem;
        $query = Echeancier::join('portefeuilles', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
            ->where('portefeuilles.Cloture', '=', 0)
            ->where("portefeuilles.Radie", "=", 0)
            ->where("echeanciers.Reechelonne", "=", 0)
            ->lockForUpdate()
            ->whereDate('echeanciers.DateTranch', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereRaw('(echeanciers.CapAmmorti - (SELECT COALESCE(SUM(CapitalPaye),0) FROM remboursementcredits 
                        WHERE RefEcheance = echeanciers.ReferenceEch AND DateTranche <= ?)) > 0', [$today])
                    ->orWhereRaw('(echeanciers.Interet - (SELECT COALESCE(SUM(InteretPaye),0) FROM remboursementcredits 
                        WHERE RefEcheance = echeanciers.ReferenceEch AND DateTranche <= ?)) > 0', [$today]);
            });

        if ($this->remboursAnticipe == true && !is_null($this->numDossier)) {
            // Cas d'un remboursement manuel pour un dossier spécifique
            return $query->where('portefeuilles.NumDossier', $this->numDossier)
                ->get(['echeanciers.*', 'portefeuilles.*']);
        } else {
            // Cas général : tous les crédits en retard
            return $query->get(['echeanciers.*', 'portefeuilles.*']);
        }
    }
    /**
     * Met à jour les informations pour un crédit en retard.
     */
    protected function mettreAJourRetard($creditRet)
    {

        // Implémentez la gestion des crédits en retard
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
        //CREE LE COMPTE S'IL N'EXISTE PAS 
        $this->createAccountLogic(
            $creditRet->numAdherant,
            $creditRet->CodeMonnaie,
            $creditRet->CodeAgence,
            $creditRet->NomCompte,
            $creditRet->NumCompteCredit
        );
        //REMBOURSEMENT INTERET EN RETARD
        $this->remboursementInteretRetard($creditRet);
        //REMBOURSEMENT CAPITAL EN RETARD
        $this->remboursementCapitalRetard($creditRet);
        //CLOTURE LE SYSTEME
        // $this->clotureSysteme($this->dateSystem);
    }
    //PERMET DE FAIRE LE REMBOURSEMENT D'INTERET EN RETARD
    public function remboursementInteretRetard($creditRet)
    {

        $NumCompte = $creditRet->NumCompteEpargne;
        $CodeMonnaie = $creditRet->CodeMonnaie == "USD" ? 1 : 2;
        $soldeMembre = $this->checkSoldeMembrePASSIF($CodeMonnaie, $NumCompte);

        // $CapAmmorti = $creditRet->CapAmmorti;
        // $interetApayer = $creditRet->Interet;
        // $CapDejaPaye = $creditRet->CapitalPaye;
        // $interetDejaPaye = $creditRet->InteretPaye;
        // $TotMontantDejaPaye = $CapDejaPaye + $interetDejaPaye;
        // $MontantTotalApayer = $CapAmmorti + $interetApayer;
        // $MontantRestantApayer = $MontantTotalApayer - $TotMontantDejaPaye;
        $checkRetard = $this->calculerJoursRetard(
            $creditRet->NumDossier,
        );


        if ($checkRetard) {
            if ($soldeMembre > 0) {
                //VERIFIE SI LE CLIENT A EU FAIRE UN REMBOURSEMENT PARTIEL OU PAS
                $creditEnRetard = Remboursementcredit::where("RefEcheance", $creditRet->ReferenceEch)->first();
                if ($creditEnRetard->InteretPaye < $creditRet->Interet) { //SI L'INTERET QUE LA PERSONNE DEVRAIT PAYER NE PAS TOUJOURS COMPLET
                    if ($creditEnRetard->InteretPaye > 0) {
                        $interetRestant = $creditRet->Interet - $creditEnRetard->InteretPaye;
                        //VERIFIE LE SOLDE S'IL EST SUPERIEUR AU MONTANT D'INTERET RESTANT 
                        if ($soldeMembre > $interetRestant and round($interetRestant, 2) > 0) {
                            info("interet restant " . $creditRet->Interet);
                            // PASSE ICI UNE ECRITURE POUR RECUPERER LE COMPLEMENT D'INTERET
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;

                            $numTransaction = $this->insertInTransactionInteret(
                                round($interetRestant, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $creditRet->NumDossier,
                                $libelle,
                                $creditRet->Gestionnaire,
                                $creditRet->ReferenceEch
                            );
                            //PERMET DE METTRE A JOUR LE RESULTAT NET
                            // $this->CheckTransactionStatus();


                            // MET A JOUR LA TABLE REMBOURSEMENT
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
                                $numTransaction

                            );

                            //ENVOIE UN MESSAGE AU CLIENT
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetRestant, 2), "Interet", "complement");
                        } else if ($soldeMembre == $interetRestant) { // SI LE SOLDE EST EGALE A L'INTERET RESTANT
                            //PASSE ICI UNE ECRITURE POUR RECUPERER LE COMPLEMENT D'INTERET
                            // PASSE ICI UNE ECRITURE POUR RECUPERER LE COMPLEMENT D'INTERET
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                            $numTransaction = $this->insertInTransactionInteret(
                                round($interetRestant, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $creditRet->NumDossier,
                                $libelle,
                                $creditRet->Gestionnaire,
                                $creditRet->ReferenceEch
                            );
                            //PERMET DE METTRE A JOUR LE RESULTAT NET
                            // $this->CheckTransactionStatus();

                            // MET A JOUR LA TABLE REMBOURSEMENT
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
                                $numTransaction
                            );
                            //ENVOIE UN MESSAGE AU CLIENT
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetRestant, 2), "Interet", "complement");
                        } else if ($soldeMembre < $interetRestant) { // SI LE SOLDE DU MEMBRE EST INFERIEUR AU SOLDE IL VA RESTER EN RETARD 
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                            $numTransaction =  $this->insertInTransactionInteret(
                                round($soldeMembre, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $creditRet->NumDossier,
                                $libelle,
                                $creditRet->Gestionnaire,
                                $creditRet->ReferenceEch
                            );

                            //PERMET DE METTRE A JOUR LE RESULTAT NET
                            // $this->CheckTransactionStatus();

                            // MET A JOUR LA TABLE REMBOURSEMENT
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
                                $numTransaction
                            );

                            //RENSEIGNE LE RETARD EN INTERET
                            // $this->renseigneMontantRetard($creditRet->ReferenceEch, $creditRet->NumDossier, $soldeMembre, 0);
                            //FONCTION D'INCREMENTER LE JOUR RETARD ICI 
                            $this->IncrementerJourRetard(
                                $creditRet->NumDossier,
                                $this->dateSystem,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit
                            );
                            //ENVOIE UN MESSAGE AU CLIENT
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($soldeMembre, 2), "Interet", "complement");
                        }
                    } else if ($creditEnRetard->InteretPaye == 0) {
                        //SI L'INTERET DEJA REMBOURSE EST EGAL ZERO CELA SIGNIFIE QU'AUCUN REMBOURS EN INTERET N'EST ENCORE FAIT
                        $interetApayer = $creditRet->Interet;
                        //VERIFIE LE SOLDE S'IL EST SUPERIEUR AU MONTANT D'INTERET RESTANT 
                        if ($soldeMembre > $interetApayer) {
                            // PASSE ICI UNE ECRITURE POUR RECUPERER LE COMPLEMENT D'INTERET
                            $libelle = "Remboursement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;

                            $numTransaction =  $this->insertInTransactionInteret(
                                round($interetApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $creditRet->NumDossier,
                                $libelle,
                                $creditRet->Gestionnaire,
                                $creditRet->ReferenceEch
                            );
                            //PERMET DE METTRE A JOUR LE RESULTAT NET
                            // $this->CheckTransactionStatus();
                            // MET A JOUR LA TABLE REMBOURSEMENT
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
                                $numTransaction
                            );

                            //ENVOIE UN MESSAGE AU CLIENT
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie, round($interetApayer, 2), "Interet", "");
                            // PASSE ICI UNE ECRITURE POUR RECUPERER L'INTERET
                        } else if ($soldeMembre == $interetApayer) { // SI LE SOLDE EST EGALE A L'INTERET RESTANT
                            //PASSE ICI UNE ECRITURE POUR RECUPERER LE COMPLEMENT D'INTERET
                            $libelle = "Remboursement complement intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                            $numTransaction =  $this->insertInTransactionInteret(
                                round($interetApayer, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $creditRet->NumDossier,
                                $libelle,
                                $creditRet->Gestionnaire,
                                $creditRet->ReferenceEch
                            );
                            //PERMET DE METTRE A JOUR LE RESULTAT NET
                            // $this->CheckTransactionStatus();

                            // MET A JOUR LA TABLE REMBOURSEMENT
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
                                $numTransaction
                            );
                            //ENVOIE UN MESSAGE AU CLIENT
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie,  round($interetApayer, 2), "Interet", "complement");
                        } else if (round($soldeMembre, 2) > 0 and round($soldeMembre, 2) < round($interetApayer, 2)) { // SI LE SOLDE DU MEMBRE EST INFERIEUR AU SOLDE IL VA RESTER EN RETARD 
                            $libelle = "Remboursement partiel intérêt du crédit de "
                                . $creditRet->MontantAccorde . "  pour la "
                                . $creditRet->NbreJour . "e tranche tombée en date du "
                                . $creditRet->DateTranch . " Numéro dossier "
                                . $creditRet->NumDossier;
                            $numTransaction = $this->insertInTransactionInteret(
                                round($soldeMembre, 2),
                                $creditRet->CodeMonnaie,
                                $this->dateSystem,
                                $creditRet->CodeAgence,
                                $creditRet->NumCompteEpargne,
                                $creditRet->CompteInteret,
                                $this->tauxDuJour,
                                $creditRet->numAdherant,
                                $creditRet->NumDossier,
                                $libelle,
                                $creditRet->Gestionnaire,
                                $creditRet->ReferenceEch
                            );
                            //PERMET DE METTRE A JOUR LE RESULTAT NET
                            // $this->CheckTransactionStatus();

                            // MET A JOUR LA TABLE REMBOURSEMENT
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
                                $numTransaction
                            );
                            //RENSEIGNE LE RETARD EN INTERET
                            // $this->renseigneMontantRetard($creditRet->ReferenceEch, $creditRet->NumDossier, $soldeMembre, 0);
                            //FONCTION D'INCREMENTER LE JOUR RETARD ICI 
                            $this->IncrementerJourRetard(
                                $creditRet->NumDossier,
                                $this->dateSystem,
                                $creditRet->NumCompteEpargne,
                                $creditRet->NumCompteCredit
                            );

                            //ENVOIE UN MESSAGE AU CLIENT
                            $this->sendNotification->sendNotificationRemboursementCredit($creditRet->numAdherant, $creditRet->CodeMonnaie,  round($soldeMembre, 2), "Interet", "partiel");
                        }
                    }
                }
            } else {
                info("le solde du crédit interet section " . $creditRet->numAdherant . " est 0 ou meme inferieur à 0");
                //FONCTION D'INCREMENTER LE JOUR RETARD ICI ON POURRAI IMPLEMENTER ICI AUSSI LA LOGIQUE DE PROVISION
                //RENSEIGNE LE RETARD EN INTERET
                // $this->renseigneMontantRetard($creditRet->ReferenceEch, $creditRet->NumDossier, $creditRet->Interet, 0);
                //FONCTION D'INCREMENTER LE JOUR RETARD ICI 
                $this->gererProvisionPourRetard($creditRet);
                // $this->IncrementerJourRetard(
                //     $creditRet->NumDossier,
                //     $this->dateSystem,
                //     $creditRet->NumCompteEpargne,
                //     $creditRet->NumCompteCredit
                // );
            }
        }
    }



    //PERMET DE FAIRE LE REMBOURSEMENT DE CAPITAL EN RETARD

    public function remboursementCapitalRetard($creditRet)
    {
        $NumCompte = $creditRet->NumCompteEpargne;
        $CodeMonnaie = $creditRet->CodeMonnaie == "USD" ? 1 : 2;
        $soldeMembre = $this->checkSoldeMembrePASSIF($CodeMonnaie, $NumCompte);

        //     $getCapitaRetard = Echeancier::selectRaw('
        //     echeanciers.NumDossier,
        //     SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
        //     SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
        // ')
        //         ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
        //         ->where('echeanciers.RetardPayement', 1)
        //         ->where('echeanciers.NumDossier', $creditRet->NumDossier)
        //         ->groupBy('echeanciers.NumDossier')
        //         ->first();

        $today = $this->dateSystem;
        $getCapitaRetard = Echeancier::selectRaw('
                echeanciers.NumDossier,
                SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
                SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
                                                          ')
            ->leftJoin('remboursementcredits', function ($join) use ($today) {
                $join->on('echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                    ->whereDate('remboursementcredits.DateTranche', '<=', $today);
            })
            ->where('echeanciers.NumDossier', $creditRet->NumDossier)
            ->where("echeanciers.Reechelonne", "=", 0)
            ->whereDate('echeanciers.DateTranch', '<=', $today)   // ← on ne prend que les échéances échues
            ->groupBy('echeanciers.NumDossier')
            ->first();

        $capitalEnRetard =  $getCapitaRetard ? $getCapitaRetard->sommeCapitalRetard : 0;

        if ($soldeMembre >= $capitalEnRetard) {
            $typeRemboursement = "complet";
        } else {
            $typeRemboursement = "partiel";
        }

        $checkRetard = $this->calculerJoursRetard($creditRet->NumDossier);
        if (!$checkRetard) {
            return;
        }
        // Déterminer si c'est un premier retard (provision à 5% ou pas encore provisionné)
        // $jourRetardInfo = JourRetard::where("NumDossier", $creditRet->NumDossier)->first();
        // $provisionLevel = $this->checkRangeFonction($creditRet->NumDossier); // retourne 5,10,25,75,100 ou null
        // $isFirstDelay = ($provisionLevel === 5) || ($jourRetardInfo && $jourRetardInfo->NbrJrRetard > 0 && $jourRetardInfo->provision1 == 1);

        if ($soldeMembre > 0) {

            $creditEnRetard = Remboursementcredit::where("RefEcheance", $creditRet->ReferenceEch)->first();
            if (!$creditEnRetard) {
                // Sécurité : si pas d'enregistrement, on le crée vide (normalement déjà fait)
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
                    $creditRet->numAdherant
                );
                $creditEnRetard = Remboursementcredit::where("RefEcheance", $creditRet->ReferenceEch)->first();
            }


            if ($creditEnRetard->CapitalPaye < $creditRet->CapAmmorti) {
                if ($creditEnRetard->CapitalPaye > 0) {
                    $CapitalRestant = $creditRet->CapAmmorti - $creditEnRetard->CapitalPaye;
                    $libelle = "Remboursement complémentaire capital du crédit de " . $creditRet->MontantAccorde . " pour la "
                        . $creditRet->NbreJour . "e tranche du " . $creditRet->DateTranch . " dossier " . $creditRet->NumDossier;
                    if ($soldeMembre > $CapitalRestant) {
                        $montantRembourse = $CapitalRestant;
                        $numTransaction = $this->insertInTransactionCapital(
                            round($montantRembourse, 2),
                            $creditRet->CodeMonnaie,
                            $this->dateSystem,
                            $creditRet->CodeAgence,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $this->tauxDuJour,
                            $creditRet->numAdherant,
                            $libelle,
                            $creditRet->Gestionnaire,
                            $creditRet->NumDossier,
                            $creditRet->ReferenceEch
                        );
                        // Appel systématique à la reprise de provision
                        if ($montantRembourse > 0) {
                            $this->insertInTransactionRepriseProvision(
                                round($montantRembourse, 2),
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
                                $creditRet->ReferenceEch
                            );
                        }
                        $this->gererProvisions();
                        $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
                        $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                            $creditRet->ReferenceEch,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $creditRet->NumDossier,
                            $creditRet->RefTypeCredit,
                            $creditRet->NomCompte,
                            $creditRet->DateTranch,
                            round($creditEnRetard->CapitalPaye + $montantRembourse, 2),
                            $creditRet->CodeAgence,
                            $creditRet->numAdherant,
                            $numTransaction
                        );
                        $this->ClotureTranche($creditRet->ReferenceEch);
                        $this->sendNotification->sendNotificationRemboursementCredit(
                            $creditRet->numAdherant,
                            $creditRet->CodeMonnaie,
                            round($montantRembourse, 2),
                            "Capital",
                            ""
                        );
                    } elseif ($soldeMembre == $CapitalRestant) {
                        $libelle = "Remboursement complémentaire capital du crédit de " . $creditRet->MontantAccorde . " pour la "
                            . $creditRet->NbreJour . "e tranche du " . $creditRet->DateTranch . " dossier " . $creditRet->NumDossier;
                        $montantRembourse = $CapitalRestant;
                        $numTransaction = $this->insertInTransactionCapital(
                            round($montantRembourse, 2),
                            $creditRet->CodeMonnaie,
                            $this->dateSystem,
                            $creditRet->CodeAgence,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $this->tauxDuJour,
                            $creditRet->numAdherant,
                            $libelle,
                            $creditRet->Gestionnaire,
                            $creditRet->NumDossier,
                            $creditRet->ReferenceEch
                        );
                        if ($montantRembourse > 0) {
                            $this->insertInTransactionRepriseProvision(
                                round($montantRembourse, 2),
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
                                $creditRet->ReferenceEch
                            );
                        }
                        $this->gererProvisions();
                        $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
                        $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                            $creditRet->ReferenceEch,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $creditRet->NumDossier,
                            $creditRet->RefTypeCredit,
                            $creditRet->NomCompte,
                            $creditRet->DateTranch,
                            round($creditEnRetard->CapitalPaye + $montantRembourse, 2),
                            $creditRet->CodeAgence,
                            $creditRet->numAdherant,
                            $numTransaction
                        );
                        $this->ClotureTranche($creditRet->ReferenceEch);
                        $this->sendNotification->sendNotificationRemboursementCredit(
                            $creditRet->numAdherant,
                            $creditRet->CodeMonnaie,
                            round($montantRembourse, 2),
                            "Capital",
                            ""
                        );
                    } elseif ($soldeMembre < $CapitalRestant) {
                        $montantRembourse = $soldeMembre;
                        $numTransaction = $this->insertInTransactionCapital(
                            round($montantRembourse, 2),
                            $creditRet->CodeMonnaie,
                            $this->dateSystem,
                            $creditRet->CodeAgence,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $this->tauxDuJour,
                            $creditRet->numAdherant,
                            "Remboursement partiel capital",
                            $creditRet->Gestionnaire,
                            $creditRet->NumDossier,
                            $creditRet->ReferenceEch
                        );
                        if ($montantRembourse > 0) {
                            $this->insertInTransactionRepriseProvision(
                                round($montantRembourse, 2),
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
                                $creditRet->ReferenceEch
                            );
                        }
                        $this->gererProvisions();
                        $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
                        $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                            $creditRet->ReferenceEch,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $creditRet->NumDossier,
                            $creditRet->RefTypeCredit,
                            $creditRet->NomCompte,
                            $creditRet->DateTranch,
                            round($creditEnRetard->CapitalPaye + $montantRembourse, 2),
                            $creditRet->CodeAgence,
                            $creditRet->numAdherant,
                            $numTransaction
                        );
                        $this->sendNotification->sendNotificationRemboursementCredit(
                            $creditRet->numAdherant,
                            $creditRet->CodeMonnaie,
                            round($montantRembourse, 2),
                            "Capital",
                            "partiel"
                        );
                    }
                } else { // $creditEnRetard->CapitalPaye == 0
                    $capitalApayer = $creditRet->CapAmmorti;
                    if ($soldeMembre > $capitalApayer) {
                        $montantRembourse = $capitalApayer;
                        $libelle = "Remboursement capital du crédit de " . $creditRet->MontantAccorde . " pour la "
                            . $creditRet->NbreJour . "e tranche du " . $creditRet->DateTranch . " dossier " . $creditRet->NumDossier;

                        $numTransaction = $this->insertInTransactionCapital(
                            round($montantRembourse, 2),
                            $creditRet->CodeMonnaie,
                            $this->dateSystem,
                            $creditRet->CodeAgence,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $this->tauxDuJour,
                            $creditRet->numAdherant,
                            $libelle,
                            $creditRet->Gestionnaire,
                            $creditRet->NumDossier,
                            $creditRet->ReferenceEch
                        );

                        // ✅ Reprise de provision (obligatoire)
                        if ($montantRembourse > 0) {
                            $this->insertInTransactionRepriseProvision(
                                round($montantRembourse, 2),
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
                                $creditRet->ReferenceEch
                            );
                        }

                        $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                            $creditRet->ReferenceEch,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $creditRet->NumDossier,
                            $creditRet->RefTypeCredit,
                            $creditRet->NomCompte,
                            $creditRet->DateTranch,
                            round($creditEnRetard->CapitalPaye + $montantRembourse, 2),
                            $creditRet->CodeAgence,
                            $creditRet->numAdherant,
                            $numTransaction
                        );

                        $this->gererProvisions();
                        $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
                        $this->ClotureTranche($creditRet->ReferenceEch);
                        $this->sendNotification->sendNotificationRemboursementCredit(
                            $creditRet->numAdherant,
                            $creditRet->CodeMonnaie,
                            round($montantRembourse, 2),
                            "Capital",
                            ""
                        );
                    } elseif ($soldeMembre == $capitalApayer) {
                        $montantRembourse = $capitalApayer;
                        $libelle = "Remboursement capital du crédit de " . $creditRet->MontantAccorde . " pour la "
                            . $creditRet->NbreJour . "e tranche du " . $creditRet->DateTranch . " dossier " . $creditRet->NumDossier;

                        $numTransaction = $this->insertInTransactionCapital(
                            round($montantRembourse, 2),
                            $creditRet->CodeMonnaie,
                            $this->dateSystem,
                            $creditRet->CodeAgence,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $this->tauxDuJour,
                            $creditRet->numAdherant,
                            $libelle,
                            $creditRet->Gestionnaire,
                            $creditRet->NumDossier,
                            $creditRet->ReferenceEch
                        );

                        if ($montantRembourse > 0) {
                            $this->insertInTransactionRepriseProvision(
                                round($montantRembourse, 2),
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
                                $creditRet->ReferenceEch
                            );
                        }

                        $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                            $creditRet->ReferenceEch,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $creditRet->NumDossier,
                            $creditRet->RefTypeCredit,
                            $creditRet->NomCompte,
                            $creditRet->DateTranch,
                            round($montantRembourse, 2),
                            $creditRet->CodeAgence,
                            $creditRet->numAdherant,
                            $numTransaction
                        );

                        $this->gererProvisions();
                        $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
                        $this->ClotureTranche($creditRet->ReferenceEch);
                        $this->sendNotification->sendNotificationRemboursementCredit(
                            $creditRet->numAdherant,
                            $creditRet->CodeMonnaie,
                            round($montantRembourse, 2),
                            "Capital",
                            ""
                        );
                    } elseif ($soldeMembre > 0 && $soldeMembre < $capitalApayer) {
                        $montantRembourse = $soldeMembre;
                        $libelle = "Remboursement partiel capital du crédit de " . $creditRet->MontantAccorde . " pour la "
                            . $creditRet->NbreJour . "e tranche du " . $creditRet->DateTranch . " dossier " . $creditRet->NumDossier;

                        $numTransaction = $this->insertInTransactionCapital(
                            round($montantRembourse, 2),
                            $creditRet->CodeMonnaie,
                            $this->dateSystem,
                            $creditRet->CodeAgence,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $this->tauxDuJour,
                            $creditRet->numAdherant,
                            $libelle,
                            $creditRet->Gestionnaire,
                            $creditRet->NumDossier,
                            $creditRet->ReferenceEch
                        );

                        if ($montantRembourse > 0) {
                            $this->insertInTransactionRepriseProvision(
                                round($montantRembourse, 2),
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
                                $creditRet->ReferenceEch
                            );
                        }

                        $this->RenseignePayementPourPaiementQuiEtaitEnMoitieCapital(
                            $creditRet->ReferenceEch,
                            $creditRet->NumCompteEpargne,
                            $creditRet->NumCompteCredit,
                            $creditRet->NumDossier,
                            $creditRet->RefTypeCredit,
                            $creditRet->NomCompte,
                            $creditRet->DateTranch,
                            round($creditEnRetard->CapitalPaye + $montantRembourse, 2),
                            $creditRet->CodeAgence,
                            $creditRet->numAdherant,
                            $numTransaction
                        );

                        $this->gererProvisions();
                        $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
                        $this->sendNotification->sendNotificationRemboursementCredit(
                            $creditRet->numAdherant,
                            $creditRet->CodeMonnaie,
                            round($montantRembourse, 2),
                            "Capital",
                            "partiel"
                        );
                    }
                }
            }
        } else {

            info("le solde du crédit capital section: " . $creditRet->numAdherant . " est 0 ou inférieur à 0");
            $this->gererProvisions();
            $this->IncrementerJourRetard($creditRet->NumDossier, $this->dateSystem, $creditRet->NumCompteEpargne, $creditRet->NumCompteCredit);
        }
    }

    /**
     * Récupère les crédits avec provisions.
     */
    protected function recupererCreditsAvecProvisions()
    {

        // return Echeancier::join('portefeuilles', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
        //     ->join('jour_retards', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(jour_retards.NumDossier)'))
        //     ->where('echeanciers.RetardPayement', 1)
        //     ->get(['echeanciers.*', 'portefeuilles.*', 'jour_retards.*']);

        // return Echeancier::join('portefeuilles', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
        //     ->join('jour_retards', DB::raw('TRIM(echeanciers.NumDossier)'), '=', DB::raw('TRIM(jour_retards.NumDossier)'))
        //     ->where('echeanciers.RetardPayement', 1)
        //     ->get(['echeanciers.*', 'portefeuilles.*', 'jour_retards.*']);

        // return Portefeuille::join('jour_retards', DB::raw('TRIM(jour_retards.NumDossier)'), '=', DB::raw('TRIM(portefeuilles.NumDossier)'))
        //     ->where('jour_retards.NbrJrRetard', '>', 0)
        //     ->get(['portefeuilles.*', 'jour_retards.*']);

        $today = $this->dateSystem;
        return Portefeuille::where('Cloture', 0)
            ->where('Octroye', 1)
            ->whereExists(function ($query) use ($today) {
                $query->select(DB::raw(1))
                    ->from('echeanciers')
                    ->whereColumn('echeanciers.NumDossier', 'portefeuilles.NumDossier')
                    ->where('echeanciers.DateTranch', '<=', $today)
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
            ->with(['echeanciers' => function ($q) use ($today) {
                $q->where('DateTranch', '<=', $today)
                    ->where(function ($q2) {
                        $q2->whereRaw('CapAmmorti - COALESCE((
                      SELECT SUM(CapitalPaye) FROM remboursementcredits 
                      WHERE RefEcheance = echeanciers.ReferenceEch
                  ), 0) > 0')
                            ->orWhereRaw('Interet - COALESCE((
                      SELECT SUM(InteretPaye) FROM remboursementcredits 
                      WHERE RefEcheance = echeanciers.ReferenceEch
                  ), 0) > 0');
                    });
            }])
            ->get()

            ->map(function ($portefeuille) use ($today) {
                // Calcul du nombre de jours de retard (max parmi les échéances impayées)
                $maxRetard = $portefeuille->echeanciers->max(function ($echeance) use ($today) {
                    return max(0, Carbon::parse($today)->diffInDays(Carbon::parse($echeance->DateTranch)));
                });


                $portefeuille->NbrJrRetard = $maxRetard;


                return $portefeuille;
            });
    }

    /**
     * Gère la provision pour les crédits récemment tombés en retard.
     */
    protected function gererProvisionPourRetard($creditProv)
    {


        // Ajout d'une vérification pour éviter les appels infinis
        static $processingDossiers = [];

        $dossierKey = $creditProv->NumDossier;

        // Si on est déjà en train de traiter ce dossier, on sort pour éviter la récursion
        if (isset($processingDossiers[$dossierKey])) {
            return;
        }
        $processingDossiers[$dossierKey] = true;
        // Implémentez la logique pour provisionner ou annuler les provisions
        $record = JourRetard::where("NumDossier", $creditProv->NumDossier)->first();
        if (!$record) {
            // Appelle la logique de création des comptes 39 et 38
            $this->IncrementerJourRetard($creditProv->NumDossier, $this->dateSystem, $creditProv->NumCompteEpargne, $creditProv->NumCompteCredit);
            $record = JourRetard::where("NumDossier", $creditProv->NumDossier)->first();
        }
        //info("record " . $record);
        if ($record) {
            // Vérifie si la DateRetard est différente de la date actuelle
            if ($record->DateRetard !== $this->dateSystem) {

                $this->provisionCreditRetard($creditProv);
            }
        }
        // $this->provision31A60Jours($creditProv);
        // $this->provision61A90Jours($creditProv);
        // $this->provision91A180Jours($creditProv);
        // $this->provisionPlusDe180Jours($creditProv);
    }


    /**
     * Calcule le nombre de jours de retard pour un dossier
     * @param string $numDossier
     * @return int
     */

    protected function calculerJoursRetard($numDossier)
    {
        $today = $this->dateSystem;

        $result = Echeancier::where('NumDossier', $numDossier)
            ->where('DateTranch', '<=', $today)
            ->where("echeanciers.Reechelonne", "=", 0)
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
        // Si l'échéance est aujourd'hui et impayée, on retourne 1 (premier jour de retard)
        return ($diff == 0) ? 1 : max(0, $diff);
    }

    //PROVISION DE CREDIT
    public function provisionCreditRetard($creditProv)
    {
        // Calcul dynamique du nombre de jours de retard
        $jours = $this->calculerJoursRetard($creditProv->NumDossier);

        if ($jours <= 0) {
            return; // seulement si la date d'échéance est dans le futur
        }
        $today = $this->dateSystem;
        // $codeMonnaie = $creditProv->CodeMonnaie == "CDF" ? 2 : 1;
        // $getCompte = Portefeuille::where("NumDossier", $creditProv->NumDossier)->first();
        // $soldeRestant = $this->checkSoldeMembreACTIF($codeMonnaie, $getCompte->NumCompteCredit, $creditProv->NumDossier);

        // $SoldeCreditRestant = $soldeRestant;

        // 🔥 NOUVEAU : Calcul du capital restant total (toutes échéances, pas seulement échues)
        $totalCapitalRestant = Echeancier::selectRaw('
    SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS totalRestant
')
            ->leftJoin('remboursementcredits', function ($join) use ($today) {
                $join->on('echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                    ->whereDate('remboursementcredits.DateTranche', '<=', $today);
            })
            ->where('echeanciers.NumDossier', $creditProv->NumDossier)
            ->where("echeanciers.Reechelonne", "=", 0)
            ->first();

        $SoldeCreditRestant = $totalCapitalRestant ? $totalCapitalRestant->totalRestant : 0;
        if ($SoldeCreditRestant <= 0) {
            return;
        }

        $capitaRetard = Echeancier::selectRaw('
        echeanciers.NumDossier,
        SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
        SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
    ')
            ->leftJoin('remboursementcredits', function ($join) use ($today) {
                $join->on('echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                    ->whereDate('remboursementcredits.DateTranche', '<=', $today);
            })
            ->whereDate('echeanciers.DateTranch', '<=', $today)
            ->where('echeanciers.NumDossier', $creditProv->NumDossier)
            ->where("echeanciers.Reechelonne", "=", 0)
            ->groupBy('echeanciers.NumDossier')
            ->first();


        $capitaDejaPaye =  Echeancier::selectRaw('
            echeanciers.NumDossier,
           SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretDejaPaye,
           SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalDejaPaye
       ')
            ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
            // ->where('echeanciers.statutPayement', 1)
            ->where('echeanciers.NumDossier', $creditProv->NumDossier)
            ->where("echeanciers.Reechelonne", "=", 0)
            ->groupBy('echeanciers.NumDossier')
            ->first();
        if ($capitaDejaPaye) {
            $sommeCapitalDejaPaye = floor($capitaDejaPaye->sommeCapitalDejaPaye * 100) / 100;
        } else {
            $sommeCapitalDejaPaye = 0;
        }

        $capitalApayer = $capitaRetard ? $capitaRetard->sommeCapitalRetard : 0;

        if ($capitalApayer > 0) {

            $getProvision = JourRetard::where("NumDossier", $creditProv->NumDossier)->first();
            if ($jours <= 30 and $getProvision->provision1 == 0) {
                //
                $this->insertInTransactionProvision(
                    abs($sommeCapitalDejaPaye),
                    $creditProv->CodeMonnaie,
                    $this->dateSystem,
                    $creditProv->CodeAgence,
                    $creditProv->NumCompteCredit,
                    $creditProv->numAdherant,
                    abs($SoldeCreditRestant),
                    $this->tauxDuJour,
                    $creditProv->NomCompte,
                    abs($capitalApayer),
                    $creditProv->NumDossier,
                    "5%",
                    5,
                    "1 à 30jrs",
                    $creditProv->Gestionnaire,
                    $creditProv->RefEcheance
                );
                // $this->CheckTransactionStatus();

                JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                    "provision1" => 1,
                ]);
            } else if ($jours > 30 and $jours <= 60 and $getProvision->provision2 == 0) {
                //ANNULE D'ABORD l'ANCIENNE PROVISION

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
                    $creditProv->NumCompteCredit,
                    $creditProv->RefEcheance
                );

                $this->insertInTransactionProvision(
                    abs($sommeCapitalDejaPaye),
                    $creditProv->CodeMonnaie,
                    $this->dateSystem,
                    $creditProv->CodeAgence,
                    $creditProv->NumCompteCredit,
                    $creditProv->numAdherant,
                    abs($SoldeCreditRestant),
                    $this->tauxDuJour,
                    $creditProv->NomCompte,
                    abs($capitalApayer),
                    $creditProv->NumDossier,
                    "10%",
                    10,
                    "31 à 60jrs",
                    $creditProv->Gestionnaire,
                    $creditProv->RefEcheance
                );

                // $this->CheckTransactionStatus();

                JourRetard::where("NumDossier", $getProvision->NumDossier)->update([
                    "provision2" => 1,
                ]);
            } else if ($jours > 60 and $jours <= 90 and $getProvision->provision3 == 0) {
                //ANNULE D'ABORD l'ANCIENNE PROVISION

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
                    $creditProv->NumCompteCredit,
                    $creditProv->RefEcheance
                );

                $this->insertInTransactionProvision(
                    abs($sommeCapitalDejaPaye),
                    $creditProv->CodeMonnaie,
                    $this->dateSystem,
                    $creditProv->CodeAgence,
                    $creditProv->NumCompteCredit,
                    $creditProv->numAdherant,
                    abs($SoldeCreditRestant),
                    $this->tauxDuJour,
                    $creditProv->NomCompte,
                    abs($capitalApayer),
                    $creditProv->NumDossier,
                    "25%",
                    25,
                    "61 à 90jrs",
                    $creditProv->Gestionnaire,
                    $creditProv->RefEcheance
                );

                // $this->CheckTransactionStatus();

                JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                    "provision3" => 1,
                ]);
            } else if ($jours > 90 and $jours <= 180 and $getProvision->provision4 == 0) {
                //ANNULE D'ABORD l'ANCIENNE PROVISION
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
                    $creditProv->NumCompteCredit,
                    $creditProv->RefEcheance
                );


                $this->insertInTransactionProvision(
                    abs($sommeCapitalDejaPaye),
                    $creditProv->CodeMonnaie,
                    $this->dateSystem,
                    $creditProv->CodeAgence,
                    $creditProv->NumCompteCredit,
                    $creditProv->numAdherant,
                    abs($SoldeCreditRestant),
                    $this->tauxDuJour,
                    $creditProv->NomCompte,
                    abs($capitalApayer),
                    $creditProv->NumDossier,
                    "75%",
                    75,
                    "91 à 180jrs",
                    $creditProv->Gestionnaire,
                    $creditProv->RefEcheance
                );

                // $this->CheckTransactionStatus();

                JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                    "provision4" => 1,
                ]);
            } else if ($jours > 180 and $getProvision->provision5 == 0) {
                // //ANNULE D'ABORD l'ANCIENNE PROVISION

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
                    $creditProv->NumCompteCredit,
                    $creditProv->RefEcheance
                );
                $this->insertInTransactionProvision(
                    abs($sommeCapitalDejaPaye),
                    $creditProv->CodeMonnaie,
                    $this->dateSystem,
                    $creditProv->CodeAgence,
                    $creditProv->NumCompteCredit,
                    $creditProv->numAdherant,
                    abs($SoldeCreditRestant),
                    $this->tauxDuJour,
                    $creditProv->NomCompte,
                    abs($capitalApayer),
                    $creditProv->NumDossier,
                    "100%",
                    100,
                    "plus de 180jrs",
                    $creditProv->Gestionnaire,
                    $creditProv->RefEcheance
                );

                // $this->CheckTransactionStatus();

                JourRetard::where("NumDossier", $creditProv->NumDossier)->update([
                    "provision5" => 1,
                ]);
            }
        }
    }
    // //PROVISION DE 31 0 A 60 jour 
    // public function provision31A60Jours($creditProv) {}

    // //PROVISION DE 61 0 A 90 jour 
    // public function provision61A90Jours($creditProv) {}

    // //PROVISION DE 91 0 A 180 jour 
    // public function provision91A180Jours($creditProv) {}

    // //PROVISION plus de 180 jour 
    // public function provisionPlusDe180Jours($creditProv) {}
    //CETTE FONCTION PERMET DE FAIRE UNE INSERTION DANS LA TABLE TRANSACTION POUR LE PAIEMENT DES INTERET ET DEBITE LE COMPTE DU CLIENT DES INTERETS
    protected function insertInTransactionInteret(
        // $MontantCapAccorde,
        $montantInteret,
        $codeMonnaie,
        $dateSystem,
        $CodeAgence,
        $NumCompteEpargne,
        $NumCompteInteret,
        $tauxDuJour,
        $refCompteMembre,
        // $NbreTranche,
        // $dateTombeeTranche,
        $NumDossier,
        $Libelle,
        $Gestionnaire,
        $RefEcheance
    ) {


        $montant = round($montantInteret, 2);

        if ($montant <= 0) {
            return null;
        }
        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
        $NumTransaction = $this->generateTransactionNumber();
        info("code monnaie " . $codeMonnaie);
        if ($codeMonnaie == "USD") {
            $devise = 1; //USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; //CDF
        }
        // info($devise);
        //DEBITE LE COMPTE DU CLIENT DE l'INTERET
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::REMBOURSEMENT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumDemande" => "V0" . $NumTransaction,
            "NumCompte" => $NumCompteEpargne,
            "NumComptecp" => $NumCompteInteret,
            "Debit" =>  $montantInteret,
            "Operant" =>  $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantInteret : $montantInteret * $tauxDuJour,
            "Debitusd" =>  $devise == 1 ? $montantInteret : $montantInteret / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);
        // CREDITE LE COMPTE INTERET
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::REMBOURSEMENT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumDemande" => "V0" . $NumTransaction,
            "NumCompte" =>   $NumCompteInteret,
            "NumComptecp" => $NumCompteEpargne,
            "Credit" =>  $montantInteret,
            "Operant" =>  $Gestionnaire,
            "Creditfc" => $devise == 2 ? $montantInteret : $montantInteret * $tauxDuJour,
            "Creditusd" =>  $devise == 1 ? $montantInteret : $montantInteret / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);


        return $NumTransaction;
    }



    //CETTE FONCTION PERMET DE FAIRE UNE INSERTION DANS LA TABLE TRANSACTION POUR LE PAIEMENT DU CAPITAL 
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
        $NumDossier,
        $RefEcheance
    ) {



        $montant = round($montantCapital, 2);

        if ($montant <= 0) {
            return null;
        }
        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
        $NumTransaction = $this->generateTransactionNumber();
        if ($codeMonnaie == "USD") {
            $devise = 1; //USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; //CDF
        }


        //DEBITE LE COMPTE  EPARGNE DU CLIENT
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::REMBOURSEMENT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => date("Y-m-d"),
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumDemande" => "V0" . $NumTransaction,
            "NumCompte" =>   $NumCompteEpargne,
            "NumComptecp" => $NumCompteCredit,
            "Debit" =>  $montantCapital,
            "Operant" =>  $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantCapital : $montantCapital * $tauxDuJour,
            "Debitusd" =>  $devise == 1 ? $montantCapital : $montantCapital / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);



        $NumCompte39 = $NumCompte39
            ?? JourRetard::where("NumDossier", $NumDossier)
            ->value('NumCompteCreanceLitigieuse');

        $chekSolde39 = $NumCompte39
            ? $this->checkSoldeMembreACTIF($devise, $NumCompte39, $NumDossier)
            : 0;
        if ($chekSolde39 > 0) {
            //CREDITE LE COMPTE CREDIT DU MEMBRE 
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "RefJournal" => JournalType::REMBOURSEMENT,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => date("Y-m-d"),
                "TypeTransaction" => "C",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumDossier" => $NumDossier,
                "NumDemande" => "V0" . $NumTransaction,
                "NumCompte" =>   $NumCompte39,
                "NumComptecp" => $NumCompteEpargne,
                "Credit" =>  $montantCapital,
                "Operant" =>  $Gestionnaire,
                "Creditfc" => $devise == 2 ? $montantCapital : $montantCapital * $tauxDuJour,
                "Creditusd" =>  $devise == 1 ? $montantCapital : $montantCapital / $tauxDuJour,
                "NomUtilisateur" => "AUTO",
                "Libelle" => $Libelle,
                "refCompteMembre" => $refCompteMembre,
                "RefEcheance" => $RefEcheance
            ]);
        } else {
            //CREDITE LE COMPTE CREDIT DU MEMBRE 
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "RefJournal" => JournalType::REMBOURSEMENT,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => date("Y-m-d"),
                "TypeTransaction" => "C",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumDossier" => $NumDossier,
                "NumDemande" => "V0" . $NumTransaction,
                "NumCompte" =>   $NumCompteCredit,
                "NumComptecp" => $NumCompteEpargne,
                "Credit" =>  $montantCapital,
                "Operant" =>  $Gestionnaire,
                "Creditfc" => $devise == 2 ? $montantCapital : $montantCapital * $tauxDuJour,
                "Creditusd" =>  $devise == 1 ? $montantCapital : $montantCapital / $tauxDuJour,
                "NomUtilisateur" => "AUTO",
                "Libelle" => $Libelle,
                "refCompteMembre" => $refCompteMembre,
                "RefEcheance" => $RefEcheance
            ]);
        }
        return $NumTransaction;
    }


    //PROVISION LOGIC FONCTION TO INSERT DATA

    //CETTE FONCTION PERMET DE FAIRE UNE INSERTION DANS LA TABLE TRANSACTION POUR LE PAIEMENT DU CAPITAL 
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
        $RefEcheance
    ) {



        if ($capitalApayer <= 0) {
            return null; // 🔴 bloque ici une fois pour toutes
        }
        if ($codeMonnaie == "USD") {
            $devise = 1; //USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; //CDF
        }

        //info("info! " . $SoldeCreditRestant);

        //CREATE ACCOUNT LOGIQUE

        $compteCreanceLitigieuseCDF = "";
        $compteProvisionCDF = "";
        $compteCreanceLitigieuseUSD = "";
        $compteProvisionUSD = "";

        if ($devise == 2) {
            if ($refCompteMembre < 10) {
                $compteProvisionCDF = "380100000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "390100000" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "3901000" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "390100" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionCDF = "38010" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "39010" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionCDF = "3801" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . $CodeAgence . "2";
            } else {
                $compteProvisionCDF = "3801" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . $CodeAgence . "2";
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
                    'RefSousGroupe' => "3800",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "PASSIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3800",
                ]);

                //MET A JOUR LA TABLE JOUR RETARD POUR RENSEIGNER LE COMPTE DE PROVISUON
                $checkCompteProvi = JourRetard::where("CompteProvision", $compteProvisionCDF)->first();
            }

            //VERIFIE SI COMPTE CREDIT DU CLIENT EXISTE SINON LE CREE 
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
                    'CodeMonnaie' =>  $devise == 1 ? 1 : 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3200",
                ]);
            }
            //ON CREE LE COMPTE CREANCE LITIGIEUSE
            //verifie d'abord si c comptes créance litigieuse n'existe déjà pas
            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseCDF)->first();
            if (!$checkCompteCL && $compteCreanceLitigieuseCDF !== null && $compteCreanceLitigieuseCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteCreanceLitigieuseCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "39",
                    'RefGroupe' => "390",
                    'RefSousGroupe' => "3900",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3900",
                ]);
            }
            //MET A JOUR LA TABLE JOUR RETARD POUR RENSEIGNER LE COMPTE DE PROVISUON
            $checkCompteProvi = JourRetard::where("CompteProvision", $compteProvisionCDF)->first();
            if (!$checkCompteProvi) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "CompteProvision" => $compteProvisionCDF
                ]);
            }


            //MET A JOUR LA TABLE JOUR RETARD POUR RENSEIGNER LE COMPTE DE CREANCE LITIGIEUSE
            $checkCompteNumCompteCL = JourRetard::where("NumCompteCreanceLitigieuse", $compteCreanceLitigieuseCDF)->first();
            if (!$checkCompteNumCompteCL) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "NumCompteCreanceLitigieuse" => $compteCreanceLitigieuseCDF
                ]);
            }
        } else if ($devise == 1) {

            if ($refCompteMembre < 10) {
                $compteProvisionUSD = "380000000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "390000000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "3900000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "390000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionUSD = "38000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "39000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionUSD = "3800" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . $CodeAgence . "1";
            } else {
                $compteProvisionUSD = "3800" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . $CodeAgence . "1";
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
                    'est_classe' => 0,
                    'compte_parent' => "3800",

                ]);
            }

            //ON CREE LE COMPTE CREANCE LITIGIEUSE
            //verifie d'abord si c comptes créance litigieuse n'existe déjà pas
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
                    'est_classe' => 0,
                    'compte_parent' => "3900",
                ]);
            }

            //MET A JOUR LA TABLE JOUR RETARD POUR RENSEIGNER LE COMPTE DE PROVISUON
            $checkCompteProvi = JourRetard::where("CompteProvision", $compteProvisionUSD)->first();
            if (!$checkCompteProvi) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "CompteProvision" => $compteProvisionUSD
                ]);
            }

            //MET A JOUR LA TABLE JOUR RETARD POUR RENSEIGNER LE COMPTE DE CREANCE LITIGIEUSE
            $checkCompteNumCompteCL = JourRetard::where("NumCompteCreanceLitigieuse", $compteCreanceLitigieuseUSD)->first();
            if (!$checkCompteNumCompteCL) {
                JourRetard::where("NumDossier", $NumDossier)->update([
                    "NumCompteCreanceLitigieuse" => $compteCreanceLitigieuseUSD
                ]);
            }
        }
        if ($provisionPourcentage == 5) { // SI C LA PREMIERE FOIS QUE LE COMPTE TOMBE EN RETARD 
            //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
            $NumTransaction = $this->generateTransactionNumber();

            /* DEBUT Constatation crédit en retard */
            //DEBITE SON COMPTE 39
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "RefJournal" => JournalType::CREDIT,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => $dateSystem,
                "TypeTransaction" => "D",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumDossier" => $NumDossier,
                "NumCompte" =>   $devise == 2 ? $compteCreanceLitigieuseCDF : $compteCreanceLitigieuseUSD,
                "NumComptecp" => $NumCompteCreditCustomer,
                "Debit" =>  $SoldeCreditRestant,
                "Operant" =>  $Gestionnaire,
                "Debitfc" => $devise == 2 ? $SoldeCreditRestant : ($SoldeCreditRestant) * ($tauxDuJour),
                "Debitusd" =>  $devise == 1 ? $SoldeCreditRestant : ($SoldeCreditRestant) / ($tauxDuJour),
                "NomUtilisateur" => "AUTO",
                "Libelle" => "Imputation de " . $SoldeCreditRestant . "  dans la tranche de crédit en retard de 1 à 30 jrs dossier " . $NumDossier . " pour " . $capitalApayer . " impayé",
                "refCompteMembre" => $refCompteMembre,
                "RefEcheance" => $RefEcheance
            ]);
            info("Voici le solde restant qui doit être imputé: " . $SoldeCreditRestant);
            //CREDITE LE COMPTE CREDIT DU CLIENT
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "RefJournal" => JournalType::CREDIT,
                "DateTransaction" => $dateSystem,
                "DateSaisie" => $dateSystem,
                "TypeTransaction" => "C",
                "CodeMonnaie" => $devise,
                "CodeAgence" => $CodeAgence,
                "NumDossier" => $NumDossier,
                "NumCompte" => $NumCompteCreditCustomer,
                "NumComptecp" => $devise == 2 ? $compteCreanceLitigieuseCDF : $compteCreanceLitigieuseUSD,
                "Credit" => $SoldeCreditRestant,
                "Operant" =>  $Gestionnaire,
                "Creditfc" =>  $devise == 2 ? $SoldeCreditRestant : ($SoldeCreditRestant) * ($tauxDuJour),
                "Creditusd" => $devise == 1 ? $SoldeCreditRestant : ($SoldeCreditRestant) / ($tauxDuJour),
                "NomUtilisateur" => "AUTO",
                "Libelle" => "Imputation de " . $SoldeCreditRestant . "  dans la tranche de crédit en retard de 1 à 30 jrs dossier " . $NumDossier . " pour " . $capitalApayer . " impayé",
                "refCompteMembre" => $refCompteMembre,
                "RefEcheance" => $RefEcheance
            ]);
            /* FIN Constatation crédit en retard */
        }


        /* DEBUT Constatation PROVISION */
        $NumTransaction = $this->generateTransactionNumber();
        $compteDotation = $this->getCompteDotationProvision($CodeAgence, $codeMonnaie);
        //DEBITE 69 POUR DOTATION AUX PROVISION
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::CREDIT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumCompte" => $compteDotation,
            "NumComptecp" => $compteProvisionCDF,
            "Debit" =>  $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100,
            "Operant" =>  $Gestionnaire,
            "Debitfc" =>  $devise == 2 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 * ($tauxDuJour),
            "Debitusd" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 / ($tauxDuJour),
            "NomUtilisateur" => "AUTO",
            "Libelle" => ($provisionPourcentage == 5 ? "Provision" : "Complement provision")
                . " de " . $provisionTranche
                . " sur l'encours de " . $SoldeCreditRestant
                . " en retard de " . $provisionRang
                . " dossier " . $NumDossier
                . " pour " . $capitalApayer . " impayé",
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);


        //FAIT LA PROVISION  CREDITE 38 DU CLIENT
        $compteDotation = $this->getCompteDotationProvision($CodeAgence, $codeMonnaie);
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::CREDIT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumCompte" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
            "NumComptecp" => $compteDotation,
            "Credit" =>  $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100,
            "Operant" =>  $Gestionnaire,
            "Creditfc" =>  $devise == 2 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 * ($tauxDuJour),
            "Creditusd" => $devise == 1 ? ($SoldeCreditRestant) * $provisionPourcentage / 100 : ($SoldeCreditRestant) * $provisionPourcentage / 100 / ($tauxDuJour),
            "NomUtilisateur" => "AUTO",
            "Libelle" => ($provisionPourcentage == 5 ? "Provision" : "Complement provision")
                . " de " . $provisionTranche
                . " sur l'encours de " . $SoldeCreditRestant
                . " en retard de " . $provisionRang
                . " dossier " . $NumDossier
                . " pour " . $capitalApayer . " impayé",
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);


        /* FIN Constatation PROVISION */


        return $NumTransaction;
    }


    //CETE FONCTION PERMET D'ANNUELER UN PROVISION POUR PASSER LA NOUVELLE 

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
        $NumcompteCredit,
        $RefEcheance

    ) {

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

        $getCompteProvisionCustumer = JourRetard::where("NumDossier", $NumDossier)->first();
        if (!$getCompteProvisionCustumer) {
            return null; // Aucune provision à annuler, on sort sans erreur
        }
        $compteProvisionCustomer = $getCompteProvisionCustumer->CompteProvision;
        // Conversion au début de annulProvision
        if ($codeMonnaie == "USD") {
            $codeMonnaie = 1;
        } else if ($codeMonnaie == "CDF") {
            $codeMonnaie = 2;
        } else {
            $codeMonnaie = $codeMonnaie;
        }

        // Dans les Transactions::create, remplacer 'CodeMonnaie' => $codeMonnaie par 'CodeMonnaie' => $codeMonnaieNum
        //ANNULE L'ANCIENNE PROVISION 38
        // COMPTE DU CLIENT 38
        $NumTransaction = $this->generateTransactionNumber();
        $compteReprise = $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie);
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::CREDIT,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $codeMonnaie,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumCompte" => $compteProvisionCustomer,
            "NumComptecp" => $compteReprise,
            "Debit" =>  $montantProvision,
            "Operant" =>  $Gestionnaire,
            "Debitfc" =>  $codeMonnaie == 2 ? $montantProvision : $montantProvision * $tauxDuJour,
            "Debitusd" => $codeMonnaie == 1 ? $montantProvision  : $montantProvision / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision de " . $ProvisionPourcentage . " sur l'encours de " . $SoldeCreditRestant . "  en retard de " . $ProvisionDuree . " dossier " . $NumDossier . " pour " . $montantRetard . " impayé",
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);


        //CREDITE UN COMPTE DE PRODUIT POUR REPRISE SUR PROVISION 
        $compteReprise = $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie);
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "RefJournal" => JournalType::CREDIT,
            "DateTransaction" => $this->dateSystem,
            "DateSaisie" => $this->dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $codeMonnaie,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumCompte" => $compteReprise,
            "NumComptecp" => $compteProvisionCustomer,
            "Credit" =>  $montantProvision,
            "Operant" =>  $Gestionnaire,
            "Creditfc" =>  $codeMonnaie == 2 ? $montantProvision : $montantProvision * $tauxDuJour,
            "Creditusd" => $codeMonnaie == 1 ? $montantProvision : $montantProvision / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision de " . $ProvisionPourcentage . " sur l'encours de " . $SoldeCreditRestant . " en retard de " . $ProvisionDuree . " dossier " . $NumDossier . " pour " . $montantRetard . " impayé",
            "refCompteMembre" => $refCompteMembre,
            "RefEcheance" => $RefEcheance
        ]);


        return $NumTransaction;
    }

    //CETTE FONCTION PERMET DE FAIRE UNE INSERTION DANS LA TABLE TRANSACTION POUR LE PAIEMENT DU CAPITAL 
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
        $RefEcheance
    ) {


        $montant = round($capitalPaye, 2);

        if ($montant <= 0) {
            return null; // 🔴 bloque définitivement ici
        }

        // Initialisation
        $NumTransaction = null;
        if ($codeMonnaie == "USD") {
            $devise = 1; //USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; //CDF
        }

        $getCompteJourRetard = JourRetard::where("NumDossier", $NumDossier)->where("provision1", "!=", 0)->first();
        if (!$getCompteJourRetard) {
            // Aucune provision posée, rien à reprendre
            return null;
        }
        if ($getCompteJourRetard) {

            $compteProvisionCustomer = $getCompteJourRetard->CompteProvision;
            $compteCreanceLitigieuseCustomer = $getCompteJourRetard->NumCompteCreanceLitigieuse;
            $NumCompteCreditCustomer = $getCompteJourRetard->NumcompteCredit;
            // Déterminer le pourcentage de provision actif (basé uniquement sur les flags)
            $provisionMatirute = 0;

            if ($getCompteJourRetard->provision1 == 1) {
                if ($getCompteJourRetard->provision2 == 1) {
                    if ($getCompteJourRetard->provision3 == 1) {
                        if ($getCompteJourRetard->provision4 == 1) {
                            if ($getCompteJourRetard->provision5 == 1) {
                                $provisionMatirute = 100;
                            } else {
                                $provisionMatirute = 75;
                            }
                        } else {
                            $provisionMatirute = 25;
                        }
                    } else {
                        $provisionMatirute = 10;
                    }
                } else {
                    $provisionMatirute = 5;
                }
            }

            if ($provisionMatirute == 0) {
                return null; // Aucune provision à reprendre
            }

            //RECUPERE LA SOMME DU CREDIT EN RETARD
            // info("check1..." . $capitalPaye);
            if (round($capitalPaye, 2) > 0) {
                // info("check2..." . $capitalPaye);
                // info("maturité..." . $getCompteJourRetard->provision1);

                if ($typeRemboursement == "partiel") {
                    //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                    $NumTransaction = $this->generateTransactionNumber();
                    $montantReprise = $capitalPaye * $provisionMatirute / 100;
                    info("montantReprise :" . $montantReprise);
                    info("provisionMatirute :" . $provisionMatirute);
                    /* Remboursement en moitié ou en totalité 38 à 79 */

                    $soldeMembreProv = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $compteProvisionCustomer)
                        ->groupBy("NumCompte")
                        ->first();
                    if ($devise == 1) {
                        $soldeProvision = $soldeMembreProv->soldeMembreUSD ?? 0;
                    } else {
                        $soldeProvision = $soldeMembreProv->soldeMembreCDF ?? 0;
                    }

                    if ($soldeProvision <= 0) {
                        return null; // rien à reprendre
                    }
                    if ($soldeProvision > 0) {
                        //DEBITE LE COMPTE  38 DU CLIENT
                        $compteReprise = $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie);
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "RefJournal" => JournalType::CREDIT,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => date("Y-m-d"),
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumDossier" => $NumDossier,
                            "NumDemande" => "V0" . $NumTransaction,
                            "NumCompte" =>   $compteProvisionCustomer,
                            "NumComptecp" => $compteReprise,
                            "Debit" => $montantReprise,
                            "Operant" =>  $Gestionnaire,
                            "Debitfc" => $devise == 2 ? $montantReprise : $montantReprise * ($tauxDuJour),
                            "Debitusd" =>  $devise == 1 ? $montantReprise : $montantReprise / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Reprise sur provision dossier " . $NumDossier,
                            "RefEcheance" => $RefEcheance
                        ]);

                        //CREDITE LE COMPTE 79
                        $compteReprise = $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie);
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "RefJournal" => JournalType::CREDIT,
                            "DateTransaction" => $dateSystem,
                            "DateSaisie" => $dateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => $devise,
                            "CodeAgence" => $CodeAgence,
                            "NumDossier" => $NumDossier,
                            "NumCompte" =>   $compteReprise,
                            "NumComptecp" => $devise == 2 ? $compteProvisionCustomer : $compteProvisionCustomer,
                            "Credit" => $montantReprise,
                            "Operant" =>  $Gestionnaire,
                            "Creditfc" => $devise == 2 ? $montantReprise : $montantReprise * ($tauxDuJour),
                            "Creditusd" =>  $devise == 1 ? $montantReprise : $montantReprise / ($tauxDuJour),
                            "NomUtilisateur" => "AUTO",
                            "Libelle" => "Reprise sur provision dossier " . $NumDossier,
                            "RefEcheance" => $RefEcheance
                        ]);
                    }
                    $NumTransaction = $this->generateTransactionNumber();

                    //DEBITE LE COMPTE DU CLIENT DE CE MONTANT
                    // Transactions::create([
                    //     "NumTransaction" => $NumTransaction,
                    //     "DateTransaction" => $dateSystem,
                    //     "DateSaisie" => $dateSystem,
                    //     "TypeTransaction" => "D",
                    //     "CodeMonnaie" => $devise,
                    //     "CodeAgence" => $CodeAgence,
                    //     "NumDossier" => $NumDossier,
                    //     "NumCompte" => $compteEpargneCustomer,
                    //     "NumComptecp" => $provisionMatirute == 5 ? $NumCompteCreditCustomer : $compteCreanceLitigieuseCustomer,
                    //     "Debit" => $capitalPaye,
                    //     "Operant" =>  $Gestionnaire,
                    //     "Debitfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                    //     "Debitusd" =>  $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                    //     "NomUtilisateur" => "AUTO",
                    //     "Libelle" => "Remboursement partiel capital de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                    //     "RefEcheance" => $RefEcheance
                    // ]);


                    // //ICI ON VERIFIE SI LE COMPTE DU CLIENT 39 A UN SOLDE SI OUI  DONC IL ETAIT DEJA EN RETARD on CREDITE 39
                    // $solde39 = $this->checkSoldeMembreACTIF($devise, $compteCreanceLitigieuseCustomer, $NumDossier);
                    // if ($solde39 > 0) {
                    //     Transactions::create([
                    //         "NumTransaction" => $NumTransaction,
                    //         "DateTransaction" => $dateSystem,
                    //         "DateSaisie" => $dateSystem,
                    //         "TypeTransaction" => "C",
                    //         "CodeMonnaie" => $devise,
                    //         "CodeAgence" => $CodeAgence,
                    //         "NumDossier" => $NumDossier,
                    //         "NumCompte" => $compteCreanceLitigieuseCustomer,
                    //         "NumComptecp" => $compteEpargneCustomer,
                    //         "Credit" => $capitalPaye,
                    //         "Operant" =>  $Gestionnaire,
                    //         "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                    //         "Creditusd" =>  $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                    //         "NomUtilisateur" => "AUTO",
                    //         "Libelle" => "Remboursement partiel de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                    //         "RefEcheance" => $RefEcheance

                    //     ]);

                    //     //SINON CREDITE 32 DU CLIENT MONTANT PARTIEL REMBOURSEMENT
                    // } else {

                    //     Transactions::create([
                    //         "NumTransaction" => $NumTransaction,
                    //         "DateTransaction" => $dateSystem,
                    //         "DateSaisie" => $dateSystem,
                    //         "TypeTransaction" => "C",
                    //         "CodeMonnaie" => $devise,
                    //         "CodeAgence" => $CodeAgence,
                    //         "NumDossier" => $NumDossier,
                    //         "NumCompte" => $NumCompteCreditCustomer,
                    //         "NumComptecp" => $compteEpargneCustomer,
                    //         "Credit" => $capitalPaye,
                    //         "Operant" =>  $Gestionnaire,
                    //         "Creditfc" => $devise == 2 ? $capitalPaye : $capitalPaye * ($tauxDuJour),
                    //         "Creditusd" =>  $devise == 1 ? $capitalPaye : $capitalPaye / ($tauxDuJour),
                    //         "NomUtilisateur" => "AUTO",
                    //         "Libelle" => "Remboursement partiel de " . $capitalPaye . ($devise == 1 ? "USD " : "CDF ") . $trancheNumber . " e tranche tombée le " . $dateTranche . " sur votre crédit de " . $MontantAccorde . " dossier " . $NumDossier,
                    //         "RefEcheance" => $RefEcheance
                    //     ]);
                    // }
                } else if ($typeRemboursement == "complet") {

                    //SI LE MONTANT A REMBOURSER COUVRE LE MONTANT EN RETARD
                    $checkCompteExist = Transactions::where("NumCompte", $compteProvisionCustomer)->first();
                    if (!$checkCompteExist) {
                        Transactions::create([
                            "DateTransaction" => $this->dateSystem,
                            "CodeMonnaie" => $devise == 1 ? 1 : 2,
                            "NumDossier" => $NumDossier,
                            "NumCompte" => $compteProvisionCustomer,
                            "Debit"  => 0,
                            "Debit$"  => 0,
                            "Debitfc" => 0,
                            "is_system" => 1,
                        ]);
                    }
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

                    if ($soldeProvision <= 0) {
                        return null;
                    }

                    //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                    $NumTransaction = $this->generateTransactionNumber();

                    /* Remboursement en moitié ou en totalité 38 à 79 */

                    //DEBITE LE COMPTE  38 DU CLIENT
                    $compteReprise = $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie);
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => date("Y-m-d"),
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumDossier" => $NumDossier,
                        "NumDemande" => "V0" . $NumTransaction,
                        "NumCompte" =>   $compteProvisionCustomer,
                        "NumComptecp" => $compteReprise,
                        "Debit" => $soldeProvision,
                        "Operant" =>  $Gestionnaire,
                        "Debitfc" => $devise == 2 ? $soldeProvision : $soldeProvision * ($tauxDuJour),
                        "Debitusd" =>  $devise == 1 ? $soldeProvision : $soldeProvision / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain dossier " . $NumDossier,
                        "RefEcheance" => $RefEcheance
                    ]);



                    //CREDITE LE COMPTE 79
                    $compteReprise = $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie);
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumDossier" => $NumDossier,
                        "NumCompte" =>   $compteReprise,
                        "NumComptecp" => $devise == 2 ? $compteProvisionCustomer : $compteProvisionCustomer,
                        "Credit" => $soldeProvision,
                        "Operant" =>  $Gestionnaire,
                        "Creditfc" => $devise == 2 ? $soldeProvision : $soldeProvision * ($tauxDuJour),
                        "Creditusd" =>  $devise == 1 ? $soldeProvision : $soldeProvision / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain dossier " . $NumDossier,
                        "RefEcheance" => $RefEcheance
                    ]);

                    //SI LE MONTANT A REMBOURSER COUVRE LE MONTANT EN RETARD
                    $checkCompteExist = Transactions::where("NumCompte", $compteCreanceLitigieuseCustomer)->first();
                    if (!$checkCompteExist) {
                        if (!$checkCompteExist) {
                            Transactions::create([
                                "DateTransaction" => $this->dateSystem,
                                "CodeMonnaie" => $devise == 1 ? 1 : 2,
                                "NumDossier" => $NumDossier,
                                "NumCompte" => $compteCreanceLitigieuseCustomer,
                                "Debit"  => 0,
                                "Debit$"  => 0,
                                "Debitfc" => 0,
                                "is_system" => 1,
                            ]);
                        }
                    }

                    $soldeMembreProv = Transactions::select(
                        DB::raw("SUM(Debitfc)-SUM(Creditfc) as soldeMembreCDF"),
                        DB::raw("SUM(Debitusd)-SUM(Creditusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $compteCreanceLitigieuseCustomer)
                        ->where("NumDossier", '=', $NumDossier)
                        ->groupBy("NumCompte")
                        ->first();

                    if ($devise == 1) {
                        $soldeCreanceL = $soldeMembreProv->soldeMembreUSD;
                    } else {
                        $soldeCreanceL = $soldeMembreProv->soldeMembreCDF;
                    }


                    $NumTransaction = $this->generateTransactionNumber();


                    //DEBITE LE COMPTE CREDIT DU CLIENT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumDossier" => $NumDossier,
                        "NumCompte" =>   $NumCompteCreditCustomer,
                        "NumComptecp" => $compteCreanceLitigieuseCustomer,
                        "Debit" => $soldeCreanceL,
                        "Operant" =>  $Gestionnaire,
                        "Debitfc" => $devise == 2 ? $soldeCreanceL : $soldeCreanceL * ($tauxDuJour),
                        "Debitusd" =>  $devise == 1 ? $soldeCreanceL : $soldeCreanceL / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Imputation de " . $soldeCreanceL . ($devise == 1 ? "USD" : "CDF") . " dans la tranche des crédits sain dossier " . $NumDossier,
                        "RefEcheance" => $RefEcheance
                    ]);



                    //CREDITE 39 CLIENT

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumDossier" => $NumDossier,
                        "NumCompte" =>   $compteCreanceLitigieuseCustomer,
                        "NumComptecp" => $NumCompteCreditCustomer,
                        "Credit" => $soldeCreanceL,
                        "Operant" =>  $Gestionnaire,
                        "Creditfc" => $devise == 2 ? $soldeCreanceL : $soldeCreanceL * ($tauxDuJour),
                        "Creditusd" =>  $devise == 1 ? $soldeCreanceL : $soldeCreanceL / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Imputation de " . $soldeCreanceL . ($devise == 1 ? "USD" : "CDF") . " dans la tranche des crédits sain dossier " . $NumDossier,
                        "RefEcheance" => $RefEcheance
                    ]);

                    //ANNULE JOUR RETARD 

                    $this->AnnuleJourRetard($NumDossier);
                }
            }
        }

        return $NumTransaction;
    }





    public function checkSoldeMembrePASSIF($codeMonnaie, $NumCompte)
    {
        try {
            // Si le montant manuel est défini et supérieur à 0, on l'utilise
            // if (!is_null($this->montantRemboursementManuel) && $this->montantRemboursementManuel > 0 && !$this->remboursAnticipe) {
            //     $this->checkAndStopOnError(
            //         $this->montantRemboursementManuel <= 0,
            //         "Montant de remboursement manuel invalide: {$this->montantRemboursementManuel}",
            //         "ERR_MONTANT_MANUEL_001"
            //     );
            //     return $this->montantRemboursementManuel;
            // }

            $soldeMembre = Transactions::select(
                DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
            )->where("NumCompte", '=', $NumCompte)
                ->groupBy("NumCompte")
                ->first();


            // ✅ Protection : si aucun résultat, retourner 0
            if (!$soldeMembre) {
                return 0;
            }

            $this->checkAndStopOnError(
                !$soldeMembre,
                "Impossible de récupérer les transactions pour le compte {$NumCompte}",
                "ERR_TRANSACTIONS_001"
            );

            if ($codeMonnaie == 1) {
                $solde = $soldeMembre->soldeMembreUSD ?? 0;
            } else {
                $solde = $soldeMembre->soldeMembreCDF ?? 0;
            }

            return $solde;
        } catch (\Exception $e) {
            $this->checkAndStopOnError(true, "Erreur dans checkSoldeMembrePASSIF: " . $e->getMessage(), "ERR_SOLDE_003");
        }
    }



    //CETE FONCTION VA PERMETTRE A SELECTIONNEE LE SOLDE DU MEMBRE
    public function checkSoldeMembreACTIF($codeMonnaie, $NumCompte, $NumDossier)
    {
        try {
            // Si le montant manuel est défini et supérieur à 0, on l'utilise
            // if (!is_null($this->montantRemboursementManuel) && $this->montantRemboursementManuel > 0 && !$this->remboursAnticipe) {
            //     return $this->montantRemboursementManuel;
            // }
            // dd($this->montantRemboursementManuel);

            $soldeMembre = Transactions::select(
                DB::raw("SUM(Debitfc)-SUM(Creditfc) as soldeMembreCDF"),
                DB::raw("SUM(Debitusd)-SUM(Creditusd) as soldeMembreUSD"),
            )->where("NumCompte", '=', $NumCompte)
                ->where("NumDossier", '=', $NumDossier)
                ->groupBy("NumCompte")
                ->first();

            // ✅ Protection : si aucun résultat, retourner 0
            if (!$soldeMembre) {
                return 0;
            }
            $this->checkAndStopOnError(
                !$soldeMembre,
                "Impossible de récupérer les transactions pour le compte {$NumCompte}",
                "ERR_TRANSACTIONS_001"
            );
            if ($codeMonnaie == 1) {
                info("soldeUSD: " . $soldeMembre->soldeMembreUSD);
                $solde = $soldeMembre->soldeMembreUSD;
                return $solde;
            } else {
                $solde = $soldeMembre->soldeMembreCDF;
                info("soldeCDF: " . $soldeMembre->soldeMembreCDF);
                return $solde;
            }
        } catch (\Exception $e) {
            $this->checkAndStopOnError(true, "Erreur dans checkSoldeMembrePASSIF: " . $e->getMessage(), "ERR_SOLDE_003");
        }
    }



    //CETTE FONCTION PERMET D'ENREGISTRER DANS LA TABLE REMBOURSEMENT POUR SIGNALE LE PAIEMENT 
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
        $numAdherant,
        $NumTransaction = null
    ) {

        $getCodeAgence = Portefeuille::where("NumDossier", $NumDossier)->first();
        $codeAgence = $getCodeAgence ? $getCodeAgence->CodeAgence : null;
        Remboursementcredit::create([
            "RefEcheance" => $ReferenceEch,
            "CodeAgence" => $codeAgence,
            "NumCompte" => $NumCompteEpargne,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossier,
            "RefTypCredit" => $RefTypeCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranch,
            "InteretAmmorti" => $InteretAmmorti,
            "InteretPaye" => $InteretAmmorti,
            "CapitalAmmortie" => $CapAmmorti,
            "CapitalPaye"  =>  $CapAmmorti,
            "CodeGuichet" => $CodeAgence,
            "NumAdherent" => $numAdherant,
            "NumTransaction" => $NumTransaction

        ]);
    }


    //CETTE FONCTION PERMET DE METTRE A JOUR LA TABLE REMBOURSEMENT POUR UN PAIEMENT QUI C'ETAIT FAIT EN MOTIE


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
        $numAdherant,
        $NumTransaction = null
    ) {
        Remboursementcredit::updateOrCreate(
            ['RefEcheance' => $ReferenceEch],
            [
                "RefEcheance"     => $ReferenceEch,
                "NumCompte"       => $NumCompteEpargne,
                "NumCompteCredit" => $NumCompteCredit,
                "NumDossie"       => $NumDossier,
                "RefTypCredit"    => $RefTypeCredit,
                "NomCompte"       => $NomCompte,
                "DateTranche"     => $DateTranch,
                "InteretAmmorti"  => $InteretAmmorti,
                "InteretPaye"     => $InteretAmmorti,
                "CodeGuichet"     => $CodeAgence,
                "NumAdherent"     => $numAdherant,
                "NumTransaction"  => $NumTransaction,
            ]
        );
    }




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
        $numAdherant,
        $NumTransaction = null
    ) {
        Remboursementcredit::updateOrCreate(
            ['RefEcheance' => $ReferenceEch],
            [
                "RefEcheance"      => $ReferenceEch,
                "NumCompte"        => $NumCompteEpargne,
                "NumCompteCredit"  => $NumCompteCredit,
                "NumDossie"        => $NumDossier,
                "RefTypCredit"     => $RefTypeCredit,
                "NomCompte"        => $NomCompte,
                "DateTranche"      => $DateTranch,
                "CapitalAmmortie"  => $CapAmmorti,
                "CapitalPaye"      => $CapAmmorti,
                "CodeGuichet"      => $CodeAgence,
                "NumAdherent"      => $numAdherant,
                "NumTransaction"   => $NumTransaction,
            ]
        );
    }


    //CETTE FONCTION PERMET D'ENREGISTRER DANS LA TABLE REMBOURSEMENT POUR SIGNALE QUE LE CREDIT VIENT DE TOMBER EN RETARD
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
        $numAdherant,
        $NumTransaction = null   // nouveau
    ) {
        $checkRowExist = Remboursementcredit::where("RefEcheance", $ReferenceEch)->first();
        if (!$checkRowExist) {
            $getCodeAgence = Portefeuille::where("NumDossier", $NumDossier)->first();
            $codeAgence = $getCodeAgence ? $getCodeAgence->CodeAgence : null;
            Remboursementcredit::create([
                "RefEcheance" => $ReferenceEch,
                "CodeAgence" => $codeAgence,
                "NumCompte" => $NumCompteEpargne,
                "NumCompteCredit" => $NumCompteCredit,
                "NumDossie" => $NumDossier,
                "RefTypCredit" => $RefTypeCredit,
                "NomCompte" => $NomCompte,
                "DateTranche" => $DateTranch,
                "InteretAmmorti" => $InteretAmmorti,
                // "InteretPaye" => $InteretAmmorti,
                "CapitalAmmortie" => $CapAmmorti,
                // "CapitalPaye"  =>  $CapAmmorti,
                "CodeGuichet" => $CodeAgence,
                "NumAdherent" => $numAdherant,
                "NumTransaction" => $NumTransaction,
            ]);
        }
    }


    //CETTE FONCTION PERMET DE CONSTATER LE REMBOURSEMENT ET CLOTURER LA TRANCHE

    private function ClotureTranche($ReferenceEch)
    {
        Echeancier::where("echeanciers.ReferenceEch", "=", $ReferenceEch)
            ->update([
                "statutPayement" => "1",
                "posted" => "1",
                "RetardPayement" => 0
            ]);
    }


    //PERMET DE CONSTATER QUE LE CREDIT VIENT D'ETRE EN RETARD 


    private function constateRetard($ReferenceEch)
    {
        Echeancier::where("echeanciers.ReferenceEch", "=", $ReferenceEch)
            ->update([
                "RetardPayement" => "1",
            ]);
    }

    //PERMET D'ANNULLER LES JOUR DE RETARD
    public function AnnuleJourRetard($NumDossier)
    {
        JourRetard::where("NumDossier", $NumDossier)->update([
            "NbrJrRetard" => 0,
            "provision1" => 0,
            "provision2" => 0,
            "provision3" => 0,
            "provision4" => 0,
            "provision5" => 0,
        ]);
    }

    //CETTE FONCTION PERMET D'INCREMENTER LE JOURS DE RETARD
    private function IncrementerJourRetard($NumDossier, $dateSystem, $NumCompteEpargne, $NumCompteCredit)
    {
        try {
            $record = JourRetard::where("NumDossier", $NumDossier)->first();
            $getMonnaie = Portefeuille::where("NumDossier", $NumDossier)->first();
            $CodeMonnaie = $getMonnaie->CodeMonnaie;
            $refCompteMembre = $getMonnaie->numAdherant;
            $CodeAgence = $getMonnaie->CodeAgence;
            if ($record) {
                // Vérifie si la DateRetard est différente de la date actuelle
                if ($record->DateRetard !== $dateSystem) {
                    // Incrémente uniquement si la date est différente
                    $record->update([
                        "NumcompteEpargne" => $NumCompteEpargne,
                        "NumcompteCredit" => $NumCompteCredit,
                        "NbrJrRetard" => $record->NbrJrRetard + 1,
                        "DateRetard" => $dateSystem,
                    ]);
                }
            } else {

                if ($CodeMonnaie == "USD") {
                    $devise = 1; //USD
                } else if ($CodeMonnaie == "CDF") {
                    $devise = 2; //CDF
                }

                //info("info! " . $SoldeCreditRestant);

                //CREATE ACCOUNT LOGIQUE

                $compteCreanceLitigieuseCDF = "";
                $compteProvisionCDF = "";
                $compteCreanceLitigieuseUSD = "";
                $compteProvisionUSD = "";

                if ($devise == 2) {
                    if ($refCompteMembre < 10) {
                        $compteProvisionCDF = "380100000" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "390100000" . $refCompteMembre . $CodeAgence . "2";
                    } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                        $compteProvisionCDF = "38010000" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . $CodeAgence . "2";
                    } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                        $compteProvisionCDF = "3801000" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "3901000" . $refCompteMembre . $CodeAgence . "2";
                    } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                        $compteProvisionCDF = "3801000" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "390100" . $refCompteMembre . $CodeAgence . "2";
                    } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                        $compteProvisionCDF = "38010" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "39010" . $refCompteMembre . $CodeAgence . "2";
                    } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                        $compteProvisionCDF = "3801" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . $CodeAgence . "2";
                    } else {
                        $compteProvisionCDF = "3801" . $refCompteMembre . $CodeAgence . "2";
                        $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . $CodeAgence . "2";
                    }
                } else if ($devise == 1) {

                    if ($refCompteMembre < 10) {
                        $compteProvisionUSD = "380000000" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "390000000" . $refCompteMembre . $CodeAgence . "1";
                    } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                        $compteProvisionUSD = "38000000" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . $CodeAgence . "1";
                    } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                        $compteProvisionUSD = "3800000" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "3900000" . $refCompteMembre . $CodeAgence . "1";
                    } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                        $compteProvisionUSD = "3800000" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "390000" . $refCompteMembre . $CodeAgence . "1";
                    } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                        $compteProvisionUSD = "38000" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "39000" . $refCompteMembre . $CodeAgence . "1";
                    } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                        $compteProvisionUSD = "3800" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . $CodeAgence . "1";
                    } else {
                        $compteProvisionUSD = "3800" . $refCompteMembre . $CodeAgence . "1";
                        $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . $CodeAgence . "1";
                    }
                }
                $dateMinusOneDay = Carbon::parse($dateSystem)->subDay();
                $dateMinusOneday = $dateMinusOneDay->toDateString();
                // Crée un nouvel enregistrement si aucun n'existe

                JourRetard::create([
                    "CodeAgence" => $CodeAgence,
                    "NumcompteEpargne" => $NumCompteEpargne,
                    "NumcompteCredit" => $NumCompteCredit,
                    "CompteProvision" => $devise == 2 ? $compteProvisionCDF : $compteProvisionUSD,
                    "NumCompteCreanceLitigieuse" => $devise == 2 ? $compteCreanceLitigieuseCDF : $compteCreanceLitigieuseUSD,
                    "NumDossier" => $NumDossier,
                    "NbrJrRetard" => 1,
                    "DateRetard" => $dateMinusOneday,
                    //"provision1" => 1
                ]);


                //VERIFIE SI LE Compte CREDIT EXISTE SINON LE CREE
                $checkIfAccountExist = Comptes::where("NumCompte", $NumCompteCredit)->first();
                if (!$checkIfAccountExist) {
                    Comptes::create([
                        'CodeAgence' => $getMonnaie->CodeAgence,
                        'NumCompte' => $NumCompteCredit,
                        'NomCompte' => $getMonnaie->NomCompte,
                        'RefTypeCompte' => "3",
                        'RefCadre' => "32",
                        'RefGroupe' =>  "320",
                        'RefSousGroupe' => "3200",
                        'CodeMonnaie' => $devise == 2 ?  2 : 1,
                        'NumAdherant' => $refCompteMembre,
                        'nature_compte' => "ACTIF",
                        'niveau' => "5",
                        'est_classe' => 0,
                        'compte_parent' => "3200",
                    ]);
                }
            }
        } catch (\Illuminate\Database\QueryException $e) {
            // Gestion de l'exception
            dd($e->getMessage());
        }
    }


    protected function insertInTransactionRepriseProvisionSansDebitClient(
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
        $RefEcheance
    ) {
        $montant = round($capitalPaye, 2);
        if ($montant <= 0) return null;

        $devise = ($codeMonnaie == "USD") ? 1 : 2;

        $getCompteJourRetard = JourRetard::where("NumDossier", $NumDossier)->where("provision1", "!=", 0)->first();
        if (!$getCompteJourRetard) return null;

        $compteProvisionCustomer = $getCompteJourRetard->CompteProvision;

        // Déterminer le pourcentage de provision actif
        $provisionMatirute = 0;
        if ($getCompteJourRetard->provision1 == 1) {
            if ($getCompteJourRetard->provision2 == 1) {
                if ($getCompteJourRetard->provision3 == 1) {
                    if ($getCompteJourRetard->provision4 == 1) {
                        if ($getCompteJourRetard->provision5 == 1) $provisionMatirute = 100;
                        else $provisionMatirute = 75;
                    } else $provisionMatirute = 25;
                } else $provisionMatirute = 10;
            } else $provisionMatirute = 5;
        }
        if ($provisionMatirute == 0) return null;

        $montantReprise = $montant * $provisionMatirute / 100;

        // Écritures de reprise de provision (uniquement)
        $numTransaction = $this->generateTransactionNumber();

        // Débit du compte de provision (38)
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "RefJournal" => JournalType::CREDIT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "D",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumCompte" => $compteProvisionCustomer,
            "NumComptecp" => $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie),
            "Debit" => $montantReprise,
            "Operant" => $Gestionnaire,
            "Debitfc" => $devise == 2 ? $montantReprise : $montantReprise * $tauxDuJour,
            "Debitusd" => $devise == 1 ? $montantReprise : $montantReprise / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision (manuel) dossier " . $NumDossier,
            "RefEcheance" => $RefEcheance
        ]);

        // Crédit du compte de reprise (79)
        Transactions::create([
            "NumTransaction" => $numTransaction,
            "RefJournal" => JournalType::CREDIT,
            "DateTransaction" => $dateSystem,
            "DateSaisie" => $dateSystem,
            "TypeTransaction" => "C",
            "CodeMonnaie" => $devise,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumCompte" => $this->getCompteRepriseProvision($CodeAgence, $codeMonnaie),
            "NumComptecp" => $compteProvisionCustomer,
            "Credit" => $montantReprise,
            "Operant" => $Gestionnaire,
            "Creditfc" => $devise == 2 ? $montantReprise : $montantReprise * $tauxDuJour,
            "Creditusd" => $devise == 1 ? $montantReprise : $montantReprise / $tauxDuJour,
            "NomUtilisateur" => "AUTO",
            "Libelle" => "Reprise sur provision (manuel) dossier " . $NumDossier,
            "RefEcheance" => $RefEcheance
        ]);

        return $numTransaction;
    }


    /**
     * Remboursement manuel du capital (sans vérification du solde client)
     * @param float $montant
     * @param string $numDossier
     * @param bool $anticipe (true = inclut les échéances futures)
     * @return array
     * @throws \Exception
     */
    public function remboursementManuelCapital($montant, $numDossier, $anticipe = false)
    {


        DB::beginTransaction();
        try {
            $portefeuille = Portefeuille::where('NumDossier', $numDossier)->lockForUpdate()->first();


            if (!$portefeuille) throw new \Exception("Dossier introuvable.");
            if ($portefeuille->Cloture == 1) throw new \Exception("Crédit déjà clôturé.");
            // Vérification du solde réel
            $codeMonnaie = ($portefeuille->CodeMonnaie == 'USD') ? 1 : 2;
            $soldeReel = $this->checkSoldeMembrePASSIF($codeMonnaie, $portefeuille->NumCompteEpargne);
            if ($soldeReel < $montant) {
                throw new \Exception("Solde insuffisant. Votre solde est de " . number_format($soldeReel, 2) . " " . $portefeuille->CodeMonnaie);
            }

            // Récupérer les échéances non encore totalement remboursées en capital
            $echeances = Echeancier::where('NumDossier', $numDossier)
                ->where('CapAmmorti', '>', 0)
                ->where("echeanciers.Reechelonne", "=", 0)
                ->whereRaw('CapAmmorti - COALESCE((
                SELECT SUM(CapitalPaye) FROM remboursementcredits 
                WHERE RefEcheance = echeanciers.ReferenceEch
            ), 0) > 0')
                ->orderBy('DateTranch', 'asc');

            if (!$anticipe) {
                $echeances->where('DateTranch', '<=', $this->dateSystem);
            }

            $echeances = $echeances->get();

            if ($echeances->isEmpty()) {
                throw new \Exception("Aucun capital dû à rembourser.");
            }

            $montantRestant = $montant;
            $totalRembourse = 0;
            $echeancesModifiees = [];
            $echeances = $echeances->unique('ReferenceEch');
            foreach ($echeances as $echeance) {
                if ($montantRestant <= 0) break;
                $capitalDejaPaye = Remboursementcredit::where('RefEcheance', $echeance->ReferenceEch)->value('CapitalPaye') ?? 0;
                $capitalRestant = $echeance->CapAmmorti - $capitalDejaPaye;
                $aRembourser = min($montantRestant, $capitalRestant);
                if ($aRembourser <= 0) continue;

                // Mettre à jour la table remboursementcredits
                $remb = Remboursementcredit::firstOrNew(['RefEcheance' => $echeance->ReferenceEch]);
                $remb->RefEcheance = $echeance->ReferenceEch;
                $remb->CodeAgence = $portefeuille->CodeAgence;
                $remb->NumCompte = $portefeuille->NumCompteEpargne;
                $remb->NumCompteCredit = $portefeuille->NumCompteCredit;
                $remb->NumDossie = $numDossier;
                $remb->RefTypCredit = $portefeuille->RefTypeCredit;
                $remb->NomCompte = $portefeuille->NomCompte;
                $remb->DateTranche = $echeance->DateTranch;
                $remb->InteretAmmorti = $echeance->Interet;
                $remb->InteretPaye = $remb->InteretPaye ?? 0;
                $remb->CapitalAmmortie = $echeance->CapAmmorti;
                $remb->CapitalPaye = ($remb->CapitalPaye ?? 0) + $aRembourser;
                $remb->CodeGuichet = $portefeuille->CodeAgence;
                $remb->NumAdherent = $portefeuille->numAdherant;
                $remb->save();

                $montantRestant -= $aRembourser;
                $totalRembourse += $aRembourser;
                $echeancesModifiees[] = $echeance->ReferenceEch;

                // Si l'échéance est totalement soldée (capital + intérêts), on la ferme
                if ($remb->CapitalPaye >= $echeance->CapAmmorti && $remb->InteretPaye >= $echeance->Interet) {
                    Echeancier::where('ReferenceEch', $echeance->ReferenceEch)
                        ->update(['statutPayement' => 1, 'posted' => 1, 'RetardPayement' => 0]);
                }
            }

            if ($totalRembourse <= 0) {
                throw new \Exception("Aucun capital remboursé.");
            }

            // Générer une seule écriture comptable pour le total remboursé
            $libelle = "Remboursement manuel capital de " . number_format($totalRembourse, 2) . " - Dossier " . $numDossier;

            $numTransaction = $this->insertInTransactionCapital(
                $totalRembourse,
                $portefeuille->CodeMonnaie,
                $this->dateSystem,
                $portefeuille->CodeAgence,
                $portefeuille->NumCompteEpargne,
                $portefeuille->NumCompteCredit,
                $this->tauxDuJour,
                $portefeuille->numAdherant,
                $libelle,
                'SYSTEM',
                $numDossier,
                null
            );
            // Reprise de provision (sans débit client)
            if ($totalRembourse > 0) {

                $this->insertInTransactionRepriseProvisionSansDebitClient(
                    $totalRembourse,
                    $portefeuille->CodeMonnaie,
                    $this->dateSystem,
                    $portefeuille->CodeAgence,
                    $this->tauxDuJour,
                    'partiel',
                    $portefeuille->NumCompteEpargne,
                    0,
                    $this->dateSystem,
                    $portefeuille->MontantAccorde,
                    $numDossier,
                    'SYSTEM',
                    null
                );
            }
            // Mettre à jour le numéro de transaction dans les remboursementcredits
            foreach ($echeancesModifiees as $refEch) {
                Remboursementcredit::where('RefEcheance', $refEch)
                    ->whereNull('NumTransaction')
                    ->update(['NumTransaction' => $numTransaction]);
            }

            // Gérer la reprise de provision si le crédit était en retard
            // $jourRetard = JourRetard::where('NumDossier', $numDossier)->first();
            // if ($jourRetard && ($jourRetard->provision1 || $jourRetard->provision2 || $jourRetard->provision3 || $jourRetard->provision4 || $jourRetard->provision5)) {
            //     $this->insertInTransactionRepriseProvision(
            //         $totalRembourse,
            //         $portefeuille->CodeMonnaie,
            //         $this->dateSystem,
            //         $portefeuille->CodeAgence,
            //         $this->tauxDuJour,
            //         'partiel',
            //         $portefeuille->NumCompteEpargne,
            //         0,
            //         $this->dateSystem,
            //         $portefeuille->MontantAccorde,
            //         $numDossier,
            //         'SYSTEM',
            //         null
            //     );
            // }
            // Recalculer les retards et provisions pour le dossier (met à jour le flag de retard)
            $this->recalculerRetardEtProvisions($numDossier);


            DB::commit();
            return [
                'success' => true,
                'montant_rembourse' => $totalRembourse,
                'num_transaction' => $numTransaction
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }



    /**
     * Remboursement manuel des intérêts (sans vérification du solde client)
     * @param float $montant
     * @param string $numDossier
     * @param bool $anticipe (true = inclut les échéances futures)
     * @return array
     * @throws \Exception
     */
    // public function remboursementManuelInteret($montant, $numDossier, $anticipe = false)
    // {


    //     DB::beginTransaction();
    //     try {

    //         $portefeuille = Portefeuille::where('NumDossier', $numDossier)->lockForUpdate()->first();
    //         if (!$portefeuille) throw new \Exception("Dossier introuvable.");
    //         if ($portefeuille->Cloture == 1) throw new \Exception("Crédit déjà clôturé.");

    //         // Vérification du solde réel
    //         $codeMonnaie = ($portefeuille->CodeMonnaie == 'USD') ? 1 : 2;
    //         $soldeReel = $this->checkSoldeMembrePASSIF($codeMonnaie, $portefeuille->NumCompteEpargne);
    //         if ($soldeReel < $montant) {
    //             throw new \Exception("Solde insuffisant. Votre solde est de " . number_format($soldeReel, 2) . " " . $portefeuille->CodeMonnaie);
    //         }



    //         // Récupérer les échéances non encore totalement remboursées en intérêts
    //         $echeances = Echeancier::where('NumDossier', $numDossier)
    //             ->where('Interet', '>', 0)
    //             ->where("echeanciers.Reechelonne", "=", 0)
    //             ->whereRaw('Interet - COALESCE((
    //             SELECT SUM(InteretPaye) FROM remboursementcredits 
    //             WHERE RefEcheance = echeanciers.ReferenceEch
    //         ), 0) > 0')
    //             ->orderBy('DateTranch', 'asc');

    //         if (!$anticipe) {
    //             $echeances->where('DateTranch', '<=', $this->dateSystem);
    //         }
    //         $echeances = $echeances->get();

    //         if ($echeances->isEmpty()) {
    //             throw new \Exception("Aucun intérêt dû à rembourser.");
    //         }

    //         $montantRestant = $montant;
    //         $totalRembourse = 0;
    //         $echeancesModifiees = [];

    //         foreach ($echeances as $echeance) {
    //             if ($montantRestant <= 0) break;
    //             $interetDejaPaye = Remboursementcredit::where('RefEcheance', $echeance->ReferenceEch)->value('InteretPaye') ?? 0;
    //             $interetRestant = $echeance->Interet - $interetDejaPaye;
    //             $aRembourser = min($montantRestant, $interetRestant);
    //             if ($aRembourser <= 0) continue;

    //             $remb = Remboursementcredit::firstOrNew(['RefEcheance' => $echeance->ReferenceEch]);
    //             $remb->RefEcheance = $echeance->ReferenceEch;
    //             $remb->CodeAgence = $portefeuille->CodeAgence;
    //             $remb->NumCompte = $portefeuille->NumCompteEpargne;
    //             $remb->NumCompteCredit = $portefeuille->NumCompteCredit;
    //             $remb->NumDossie = $numDossier;
    //             $remb->RefTypCredit = $portefeuille->RefTypeCredit;
    //             $remb->NomCompte = $portefeuille->NomCompte;
    //             $remb->DateTranche = $echeance->DateTranch;
    //             $remb->InteretAmmorti = $echeance->Interet;
    //             $remb->InteretPaye = ($remb->InteretPaye ?? 0) + $aRembourser;
    //             $remb->CapitalAmmortie = $echeance->CapAmmorti;
    //             $remb->CapitalPaye = $remb->CapitalPaye ?? 0;
    //             $remb->CodeGuichet = $portefeuille->CodeAgence;
    //             $remb->NumAdherent = $portefeuille->numAdherant;
    //             $remb->save();

    //             $montantRestant -= $aRembourser;
    //             $totalRembourse += $aRembourser;
    //             $echeancesModifiees[] = $echeance->ReferenceEch;

    //             // Si l'échéance est totalement soldée (capital + intérêts), on la ferme
    //             if ($remb->CapitalPaye >= $echeance->CapAmmorti && $remb->InteretPaye >= $echeance->Interet) {
    //                 Echeancier::where('ReferenceEch', $echeance->ReferenceEch)
    //                     ->update(['statutPayement' => 1, 'posted' => 1, 'RetardPayement' => 0]);
    //             }
    //         }

    //         if ($totalRembourse <= 0) {
    //             throw new \Exception("Aucun intérêt remboursé.");
    //         }

    //         // Générer une seule écriture comptable pour le total remboursé
    //         $libelle = "Remboursement manuel intérêts de " . number_format($totalRembourse, 2) . " - Dossier " . $numDossier;
    //         $numTransaction = $this->insertInTransactionInteret(
    //             $totalRembourse,
    //             $portefeuille->CodeMonnaie,
    //             $this->dateSystem,
    //             $portefeuille->CodeAgence,
    //             $portefeuille->NumCompteEpargne,
    //             $portefeuille->CompteInteret,
    //             $this->tauxDuJour,
    //             $portefeuille->numAdherant,
    //             $numDossier,
    //             $libelle,
    //             'SYSTEM',
    //             null
    //         );

    //         // Mettre à jour le numéro de transaction dans les remboursementcredits
    //         foreach ($echeancesModifiees as $refEch) {
    //             Remboursementcredit::where('RefEcheance', $refEch)
    //                 ->whereNull('NumTransaction')
    //                 ->update(['NumTransaction' => $numTransaction]);
    //         }

    //         // Recalculer les retards et provisions (au cas où)
    //         $this->recalculerRetardEtProvisions($numDossier);

    //         DB::commit();
    //         return [
    //             'success' => true,
    //             'montant_rembourse' => $totalRembourse,
    //             'num_transaction' => $numTransaction
    //         ];
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         throw $e;
    //     }
    // }

    // Remboursement manuel des intérêts (avec prise en compte des intérêts post-échéance)
    public function remboursementManuelInteret($montant, $numDossier, $anticipe = false)
    {
        DB::beginTransaction();
        try {
            $portefeuille = Portefeuille::where('NumDossier', $numDossier)->lockForUpdate()->first();
            if (!$portefeuille) throw new \Exception("Dossier introuvable.");
            if ($portefeuille->Cloture == 1) throw new \Exception("Crédit déjà clôturé.");

            $codeMonnaie = ($portefeuille->CodeMonnaie == 'USD') ? 1 : 2;
            $soldeReel = $this->checkSoldeMembrePASSIF($codeMonnaie, $portefeuille->NumCompteEpargne);
            if ($soldeReel < $montant) {
                throw new \Exception("Solde insuffisant. Votre solde est de " . number_format($soldeReel, 2) . " " . $portefeuille->CodeMonnaie);
            }

            $montantRestant = $montant;
            $totalRembourse = 0;
            $echeancesModifiees = [];

            // 1. PRIORITÉ : Intérêts post-échéance
            $interetPostEcheance = DB::table('interets_courus_suivi')
                ->where('NumDossier', $numDossier)
                ->value('InteretCouruNonPaye') ?? 0;

            if ($montantRestant > 0 && $interetPostEcheance > 0) {
                $aRembourser = min($montantRestant, $interetPostEcheance);

                $credit = (object) [
                    'NumDossier' => $numDossier,
                    'CodeMonnaie' => $portefeuille->CodeMonnaie,
                    'CodeAgence' => $portefeuille->CodeAgence,
                    'NumCompteEpargne' => $portefeuille->NumCompteEpargne,
                    'numAdherant' => $portefeuille->numAdherant,
                ];

                $this->gestionPostEcheance->enregistrerPaiementInterets($credit, $aRembourser);

                DB::table('interets_courus_suivi')
                    ->where('NumDossier', $numDossier)
                    ->update([
                        'InteretCouruNonPaye' => DB::raw("InteretCouruNonPaye - $aRembourser"),
                        'updated_at' => now()
                    ]);
                $montantRestant -= $aRembourser;
                $totalRembourse += $aRembourser;
            }

            // 2. Intérêts planifiés (échéancier)
            if ($montantRestant > 0) {
                $echeances = Echeancier::where('NumDossier', $numDossier)
                    ->where('Interet', '>', 0)
                    ->where("echeanciers.Reechelonne", "=", 0)
                    ->whereRaw('Interet - COALESCE((
                    SELECT SUM(InteretPaye) FROM remboursementcredits 
                    WHERE RefEcheance = echeanciers.ReferenceEch
                ), 0) > 0')
                    ->orderBy('DateTranch', 'asc');

                if (!$anticipe) {
                    $echeances->where('DateTranch', '<=', $this->dateSystem);
                }
                $echeances = $echeances->get();

                if ($echeances->isEmpty() && $totalRembourse == 0) {
                    throw new \Exception("Aucun intérêt dû à rembourser.");
                }

                foreach ($echeances as $echeance) {
                    if ($montantRestant <= 0) break;
                    $interetDejaPaye = Remboursementcredit::where('RefEcheance', $echeance->ReferenceEch)->value('InteretPaye') ?? 0;
                    $interetRestant = $echeance->Interet - $interetDejaPaye;
                    $aRembourser = min($montantRestant, $interetRestant);
                    if ($aRembourser <= 0) continue;

                    // Mise à jour de remboursementcredits (détail par échéance)
                    $remb = Remboursementcredit::firstOrNew(['RefEcheance' => $echeance->ReferenceEch]);
                    $remb->RefEcheance = $echeance->ReferenceEch;
                    $remb->CodeAgence = $portefeuille->CodeAgence;
                    $remb->NumCompte = $portefeuille->NumCompteEpargne;
                    $remb->NumCompteCredit = $portefeuille->NumCompteCredit;
                    $remb->NumDossie = $numDossier;
                    $remb->RefTypCredit = $portefeuille->RefTypeCredit;
                    $remb->NomCompte = $portefeuille->NomCompte;
                    $remb->DateTranche = $echeance->DateTranch;
                    $remb->InteretAmmorti = $echeance->Interet;
                    $remb->InteretPaye = ($remb->InteretPaye ?? 0) + $aRembourser;
                    $remb->CapitalAmmortie = $echeance->CapAmmorti;
                    $remb->CapitalPaye = $remb->CapitalPaye ?? 0;
                    $remb->CodeGuichet = $portefeuille->CodeAgence;
                    $remb->NumAdherent = $portefeuille->numAdherant;
                    $remb->save();

                    $montantRestant -= $aRembourser;
                    $totalRembourse += $aRembourser;
                    $echeancesModifiees[] = $echeance->ReferenceEch;

                    if ($remb->CapitalPaye >= $echeance->CapAmmorti && $remb->InteretPaye >= $echeance->Interet) {
                        Echeancier::where('ReferenceEch', $echeance->ReferenceEch)
                            ->update(['statutPayement' => 1, 'posted' => 1, 'RetardPayement' => 0]);
                    }
                }
            }

            if ($totalRembourse <= 0) {
                throw new \Exception("Aucun intérêt remboursé.");
            }

            // 3. ÉCRITURE COMPTABLE UNIQUE pour le total des intérêts planifiés
            $libelle = "Remboursement manuel intérêts de " . number_format($totalRembourse, 2) . " - Dossier " . $numDossier;
            $numTransaction = $this->insertInTransactionInteret(
                $totalRembourse,
                $portefeuille->CodeMonnaie,
                $this->dateSystem,
                $portefeuille->CodeAgence,
                $portefeuille->NumCompteEpargne,
                $portefeuille->CompteInteret,
                $this->tauxDuJour,
                $portefeuille->numAdherant,
                $numDossier,
                $libelle,
                'SYSTEM',
                null  // RefEcheance = null (pas lié à une échéance spécifique)
            );

            // Mettre à jour les remboursementcredits avec ce numéro de transaction
            foreach ($echeancesModifiees as $refEch) {
                Remboursementcredit::where('RefEcheance', $refEch)
                    ->update(['NumTransaction' => $numTransaction]);
            }

            $this->recalculerRetardEtProvisions($numDossier);

            DB::commit();
            return [
                'success' => true,
                'montant_rembourse' => $totalRembourse,
                'num_transaction' => $numTransaction
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }





    /**
     * Remboursement anticipé total (utilise le solde réel du client)
     * @param string $numDossier
     * @return array
     * @throws \Exception
     */
    public function remboursementAnticipe($numDossier)
    {

        $portefeuille = Portefeuille::where('NumDossier', $numDossier)->first();
        if (!$portefeuille) {
            throw new \Exception("Dossier introuvable.");
        }
        if ($portefeuille->Cloture == 1) {
            throw new \Exception("Crédit déjà clôturé.");
        }

        // Vérifier le solde réel du client (basé sur les transactions)
        $codeMonnaie = ($portefeuille->CodeMonnaie == 'USD') ? 1 : 2;
        $solde = $this->checkSoldeMembrePASSIF($codeMonnaie, $portefeuille->NumCompteEpargne);
        if ($solde <= 0) {
            throw new \Exception("Solde insuffisant pour un remboursement anticipé.");
        }

        // Créer une requête fictive pour déclencher la clôture en mode anticipé
        $request = new \Illuminate\Http\Request();
        $request->merge([
            'numDossier' => $numDossier,
            'remboursAnticipe' => true,
            'montantRemboursementManuel' => null,
        ]);

        $cloture = new self($request);
        $cloture->execute();
        return [
            'success' => true,
            'message' => 'Remboursement anticipé effectué avec succès.'
        ];
    }






    //CREATE ACCOUNT LOGIC
    public function createAccountLogic(
        $refCompteMembre,
        $codeMonnaie,
        $CodeAgence,
        $NomCompte,
        $NumCompteCreditCustomer
        // $typeCredit = null  // nouveau paramètre, ex: "Crédit Express à CT"
    ) {
        if ($codeMonnaie == "USD") {
            $devise = 1; //USD
        } else if ($codeMonnaie == "CDF") {
            $devise = 2; //CDF
        }

        //info("info! " . $SoldeCreditRestant);

        //CREATE ACCOUNT LOGIQUE


        // Déterminer la nature du crédit (CT ou MT) à partir du libellé
        // $refCadreCredit = "32"; // par défaut CT
        // if ($typeCredit && preg_match('/\bMT\b/i', $typeCredit)) {
        //     $refCadreCredit = "31"; // Moyen terme
        // } elseif ($typeCredit && preg_match('/\bCT\b/i', $typeCredit)) {
        //     $refCadreCredit = "32"; // Court terme (défaut)
        // }

        $compteCreanceLitigieuseCDF = "";
        $compteProvisionCDF = "";
        $compteCreanceLitigieuseUSD = "";
        $compteProvisionUSD = "";

        if ($devise == 2) {
            if ($refCompteMembre < 10) {
                $compteProvisionCDF = "380100000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "390100000" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionCDF = "38010000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "39010000" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "3901000" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionCDF = "3801000" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "390100" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionCDF = "38010" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "39010" . $refCompteMembre . $CodeAgence . "2";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionCDF = "3801" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . $CodeAgence . "2";
            } else {
                $compteProvisionCDF = "3801" . $refCompteMembre . $CodeAgence . "2";
                $compteCreanceLitigieuseCDF = "3901" . $refCompteMembre . $CodeAgence . "2";
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
                    'RefSousGroupe' => "3800",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "PASSIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3800",
                ]);
            }

            //VERIFIE SI COMPTE CREDIT DU CLIENT EXISTE SINON LE CREE 
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
                    'CodeMonnaie' =>  2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3200",
                ]);
            }
            //ON CREE LE COMPTE CREANCE LITIGIEUSE
            //verifie d'abord si c comptes créance litigieuse n'existe déjà pas
            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseCDF)->first();
            if (!$checkCompteCL && $compteCreanceLitigieuseCDF !== null && $compteCreanceLitigieuseCDF !== '') {
                Comptes::create([
                    'CodeAgence' => $CodeAgence,
                    'NumCompte' => $compteCreanceLitigieuseCDF,
                    'NomCompte' => $NomCompte,
                    'RefTypeCompte' => "3",
                    'RefCadre' => "39",
                    'RefGroupe' => "390",
                    'RefSousGroupe' => "3900",
                    'CodeMonnaie' => 2,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3900",
                ]);
            }
        } else if ($devise == 1) {

            if ($refCompteMembre < 10) {
                $compteProvisionUSD = "380000000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "390000000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 10 && $refCompteMembre < 100) {
                $compteProvisionUSD = "38000000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "39000000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 100 && $refCompteMembre < 1000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "3900000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 1000 && $refCompteMembre < 10000) {
                $compteProvisionUSD = "3800000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "390000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 10000 && $refCompteMembre < 100000) {
                $compteProvisionUSD = "38000" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "39000" . $refCompteMembre . $CodeAgence . "1";
            } else if ($refCompteMembre >= 100000 && $refCompteMembre < 1000000) {
                $compteProvisionUSD = "3800" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . $CodeAgence . "1";
            } else {
                $compteProvisionUSD = "3800" . $refCompteMembre . $CodeAgence . "1";
                $compteCreanceLitigieuseUSD = "3900" . $refCompteMembre . $CodeAgence . "1";
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
                    'est_classe' => 0,
                    'compte_parent' => "3800",

                ]);
            }

            //ON CREE LE COMPTE CREANCE LITIGIEUSE
            //verifie d'abord si c comptes créance litigieuse n'existe déjà pas
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
                    'est_classe' => 0,
                    'compte_parent' => "3900",

                ]);
            }

            //VERIFIE SI COMPTE CREDIT DU CLIENT EXISTE SINON LE CREE 
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
                    'CodeMonnaie' =>  1,
                    'NumAdherant' => $refCompteMembre,
                    'nature_compte' => "ACTIF",
                    'niveau' => "5",
                    'est_classe' => 0,
                    'compte_parent' => "3200",
                ]);
            }
        }
    }
    //PERMET DE VERIFIER QUELLE FONCTION EST PRIORITAIRE QUE L'AUTRE ENTRE GERER PROVISON ET REPRISE
    /**
     * Détermine le pourcentage de provision en fonction des flags de provision
     * 
     * @param string $NumDossier
     * @return int|null
     */
    private function checkRangeFonction($NumDossier)
    {
        try {
            if (empty($NumDossier)) {
                return null;
            }

            // Récupérer directement les champs nécessaires
            $jourRetard = JourRetard::where("NumDossier", $NumDossier)
                ->select('provision1', 'provision2', 'provision3', 'provision4', 'provision5')
                ->first();

            if (!$jourRetard) {
                return null;
            }

            // Utilisation d'un switch avec conditions
            if ($jourRetard->provision1 == 1) {
                if ($jourRetard->provision2 == 1) {
                    if ($jourRetard->provision3 == 1) {
                        if ($jourRetard->provision4 == 1) {
                            if ($jourRetard->provision5 == 1) {
                                return 100;
                            }
                            return 75;
                        }
                        return 25;
                    }


                    return 10;
                }
                return 5;
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Erreur: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Génère un numéro de transaction unique de façon atomique
     * @return string
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

    /**
     * Retrouve la référence d'échéance à partir d'un numéro de transaction
     * @param string $numTransaction
     * @return string|null
     */
    protected function getEcheanceFromTransactionNumber($numTransaction)
    {
        $trans = Transactions::where('NumTransaction', $numTransaction)->first();
        return $trans ? $trans->RefEcheance : null;
    }

    /**
     * Annule un remboursement à partir d'un numéro de transaction (capital ou intérêt)
     * Par défaut annule tout le remboursement (capital + intérêts + frais) de l'échéance concernée.
     * @param string $referenceTransaction
     * @param string $motif
     * @param string $type 'full', 'capital', 'interet'
     * @return bool
     * @throws \Exception
     */
    public function annulerRemboursementParReference($referenceTransaction, $motif = 'Annulation manuelle', $type = 'full')
    {
        $refEcheance = $this->getEcheanceFromTransactionNumber($referenceTransaction);
        if (!$refEcheance) {
            throw new \Exception("Aucune échéance trouvée pour ce numéro de transaction.");
        }

        if ($type == 'full') {
            return $this->annulerRemboursementComplet($refEcheance, $motif);
        } else {
            return $this->annulerPartieRemboursement($refEcheance, $type, $motif);
        }
    }

    /**
     * Annule complètement un remboursement (capital + intérêts + frais) pour une échéance donnée.
     * @param string $refEcheance
     * @param string $motif
     * @return bool
     * @throws \Exception
     */


    /**
     * Annule une partie (capital ou intérêt) d'un remboursement à partir d'un numéro de transaction.
     * Le numéro de transaction doit correspondre à une écriture (capital ou intérêt) existante.
     * 
     * @param string $referenceTransaction Ex: "AT0012"
     * @param string $motif
     * @return bool
     * @throws \Exception
     */
    public function annulerRemboursementPartielParReference($referenceTransaction, $motif = 'Annulation manuelle')
    {
        // 1. Récupérer l'écriture originale à partir du numéro de transaction
        $transaction = Transactions::where('NumTransaction', $referenceTransaction)->first();
        if (!$transaction) {
            throw new \Exception("Aucune transaction trouvée avec ce numéro : $referenceTransaction");
        }


        // 🔥 Détection d'un remboursement manuel global
        if ($transaction->RefEcheance === null && strpos($referenceTransaction, 'AT') === 0) {
            throw new \Exception(
                "Ce type de remboursement (manuel global) ne peut pas être annulé automatiquement. " .
                    "Veuillez contacter l'administrateur pour procéder à l'annulation manuelle."
            );
        }

        // 2. Vérifier qu'elle est liée à une échéance
        $refEcheance = $transaction->RefEcheance;
        if (!$refEcheance) {
            throw new \Exception("Cette transaction n'est liée à aucune échéance (RefEcheance manquante).");
        }

        // 3. Déterminer le type (capital ou intérêt) à partir du libellé
        $libelle = strtolower($transaction->Libelle);
        if (strpos($libelle, 'capital') !== false) {
            $type = 'capital';
        } elseif (strpos($libelle, 'intérêt') !== false || strpos($libelle, 'interet') !== false) {
            $type = 'interet';
        } else {
            // Si le libellé ne contient ni capital ni intérêt, on peut annuler toute l'échéance
            // ou lever une exception. Par défaut, on annule toute l'échéance.
            return $this->annulerRemboursementComplet($refEcheance, $motif);
        }

        // 4. Annuler uniquement la partie correspondante
        return $this->annulerPartieRemboursement($refEcheance, $type, $motif);
    }

    public function annulerRemboursementComplet($refEcheance, $motif = 'Annulation manuelle')
    {
        DB::beginTransaction();
        try {
            $remboursement = Remboursementcredit::where('RefEcheance', $refEcheance)->first();
            if (!$remboursement) {
                throw new \Exception("Aucun remboursement trouvé pour cette échéance.");
            }

            // Récupérer toutes les écritures originales de cette échéance
            $originals = Transactions::where('RefEcheance', $refEcheance)->get();
            if ($originals->isEmpty()) {
                throw new \Exception("Aucune écriture trouvée pour cette échéance.");
            }

            // Créer les écritures d'annulation pour chaque ligne originale
            foreach ($originals as $orig) {
                $this->createAnnulationWriting($orig, $motif);
            }

            // Remettre à zéro les montants dans Remboursementcredits
            $remboursement->CapitalPaye = 0;
            $remboursement->InteretPaye = 0;
            $remboursement->save();


            $this->mettreAJourStatutEcheance($refEcheance);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Annulation complète échouée", ['ref' => $refEcheance, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Met à jour le statut de l'échéance en fonction des montants réellement payés.
     * @param string $refEcheance
     */
    protected function mettreAJourStatutEcheance($refEcheance)
    {
        $echeance = Echeancier::where('ReferenceEch', $refEcheance)->first();
        if (!$echeance) {
            return;
        }

        $remboursement = Remboursementcredit::where('RefEcheance', $refEcheance)->first();
        if (!$remboursement) {
            return;
        }

        $capitalDu = $echeance->CapAmmorti;
        $interetDu = $echeance->Interet;
        $capitalPaye = $remboursement->CapitalPaye;
        $interetPaye = $remboursement->InteretPaye;

        // L'échéance est totalement payée si les deux montants payés atteignent au moins le dû
        $estTotalementPaye = ($capitalPaye >= $capitalDu && $interetPaye >= $interetDu);

        if (!$estTotalementPaye) {
            $retard = ($echeance->DateTranch < $this->dateSystem) ? 1 : 0;
            Echeancier::where('ReferenceEch', $refEcheance)->update([
                'statutPayement' => 0,
                'posted' => 0,
                'RetardPayement' => $retard
            ]);
        }
        // Si totalement payé, on ne touche pas à statutPayement (il reste à 1 ou 2)

        // Recalcul des retards et provisions pour le dossier
        $this->recalculerRetardEtProvisions($echeance->NumDossier);
    }

    /**
     * Annule partiellement un remboursement (uniquement capital ou uniquement intérêts)
     * pour une échéance donnée.
     * @param string $refEcheance
     * @param string $type 'capital' ou 'interet'
     * @param string $motif
     * @return bool
     * @throws \Exception
     */
    public function annulerPartieRemboursement($refEcheance, $type, $motif = 'Annulation manuelle')
    {
        DB::beginTransaction();
        try {
            $remboursement = Remboursementcredit::where('RefEcheance', $refEcheance)->first();
            if (!$remboursement) {
                throw new \Exception("Aucun remboursement trouvé pour cette échéance.");
            }

            $typeLower = strtolower($type);
            if ($typeLower == 'capital') {
                $montantActuel = $remboursement->CapitalPaye;
                $champ = 'CapitalPaye';
                $searchLibelles = ['capital'];
            } elseif ($typeLower == 'interet') {
                $montantActuel = $remboursement->InteretPaye;
                $champ = 'InteretPaye';
                $searchLibelles = ['intérêt', 'interet'];
            } else {
                throw new \Exception("Type d'annulation invalide. Utilisez 'capital' ou 'interet'.");
            }

            if ($montantActuel == 0) {
                throw new \Exception("Le montant à annuler est déjà nul pour le type '$type'.");
            }

            // Récupérer les écritures correspondant au type (capital ou intérêt)
            $originals = Transactions::where('RefEcheance', $refEcheance)
                ->where(function ($query) use ($searchLibelles) {
                    foreach ($searchLibelles as $lib) {
                        $query->orWhere('Libelle', 'like', '%' . $lib . '%');
                    }
                })
                ->get();

            if ($originals->isEmpty()) {
                throw new \Exception("Aucune écriture trouvée pour le type '$type' sur cette échéance.");
            }

            // Créer les écritures d'annulation pour ces lignes
            foreach ($originals as $orig) {
                $this->createAnnulationWriting($orig, $motif);
            }

            // Mettre à zéro le champ correspondant dans Remboursementcredits
            $remboursement->$champ = 0;
            $remboursement->save();

            // Mise à jour automatique du statut de l'échéance
            $this->mettreAJourStatutEcheance($refEcheance);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Annulation partielle échouée", ['ref' => $refEcheance, 'type' => $type, 'error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Crée une écriture inverse (annulation) à partir d'une transaction originale.
     * Génère un nouveau numéro de transaction pour l'annulation.
     * @param Transactions $original
     * @param string $motif
     * @return Transactions
     */
    protected function createAnnulationWriting($original, $motif)
    {
        $newNumTransaction = $this->generateTransactionNumber();
        // Récupérer la date système
        $dateSysteme = TauxEtDateSystem::latest()->first()->DateSystem ?? now();


        $new = new Transactions();
        $new->NumTransaction = $newNumTransaction;
        $new->RefEcheance = $original->RefEcheance; // conserve le lien
        $new->DateTransaction = $dateSysteme;
        $new->DateSaisie = $dateSysteme;
        $new->TypeTransaction = ($original->TypeTransaction == 'D') ? 'C' : 'D';
        $new->CodeMonnaie = $original->CodeMonnaie;
        $new->CodeAgence = $original->CodeAgence;
        $new->NumDossier = $original->NumDossier;
        $new->NumDemande = $original->NumDemande;
        $new->NumCompte = $original->NumCompte;
        $new->NumComptecp = $original->NumComptecp;
        $new->Operant = $original->Operant;
        $new->NomUtilisateur = auth()->user()->name ?? 'SYSTEM';
        $new->Libelle = "ANNULATION - $motif - " . $original->Libelle;
        $new->extourner = 0; // si vous avez ce champ

        // Initialiser les montants à zéro
        $new->Debit = 0;
        $new->Credit = 0;
        $new->Debitfc = 0;
        $new->Creditfc = 0;
        $new->Debitusd = 0;
        $new->Creditusd = 0;

        $taux = $this->tauxDuJour ?? 1;

        if ($original->TypeTransaction == 'D') {
            // Original était débit, l'annulation est crédit
            $montant = $original->Debit;
            $new->Credit = $montant;
            if ($original->CodeMonnaie == 1) {
                $new->Creditusd = $montant;
                $new->Creditfc = $montant * $taux;
            } else {
                $new->Creditfc = $montant;
                $new->Creditusd = $montant / $taux;
            }
        } else {
            // Original était crédit, l'annulation est débit
            $montant = $original->Credit;
            $new->Debit = $montant;
            if ($original->CodeMonnaie == 1) {
                $new->Debitusd = $montant;
                $new->Debitfc = $montant * $taux;
            } else {
                $new->Debitfc = $montant;
                $new->Debitusd = $montant / $taux;
            }
        }

        $new->save();
        return $new;
    }

    /**
     * Recalcule les jours de retard et les provisions pour un dossier après annulation
     */
    protected function recalculerRetardEtProvisions($numDossier)
    {
        $jours = $this->calculerJoursRetard($numDossier);
        Log::info("DEBUG - Dossier: $numDossier, Jours: $jours, provision1: " . ($jourRetard->provision1 ?? 'null'));


        $jourRetard = JourRetard::firstOrNew(['NumDossier' => $numDossier]);
        $jourRetard->DateRetard = $this->dateSystem;
        $jourRetard->NbrJrRetard = $jours; // optionnel, pour compatibilité
        $jourRetard->save();
        if ($jours <= 0) {
            Log::info("DEBUG - ENTRÉE bloc crédit sain");
            // 🔥 Le crédit est redevenu sain : on annule toutes les provisions
            if ($jourRetard->provision1 || $jourRetard->provision2 || $jourRetard->provision3 || $jourRetard->provision4 || $jourRetard->provision5) {
                // Calculer le solde actuel du compte 38 (provision)
                $compteProvision = $jourRetard->CompteProvision;
                if ($compteProvision) {
                    $devise = (Portefeuille::where('NumDossier', $numDossier)->value('CodeMonnaie') == 'USD') ? 1 : 2;
                    $soldeProvision = $this->checkSoldeMembrePASSIF($devise, $compteProvision);
                    Log::info("DEBUG - Compte provision: $compteProvision, Solde: $soldeProvision");
                    if ($soldeProvision > 0) {
                        Log::info("DEBUG - Appel reprise provision pour montant: $soldeProvision");
                        // Appeler la reprise totale de provision (sans débit client)
                        $this->insertInTransactionRepriseProvision(
                            $soldeProvision,
                            Portefeuille::where('NumDossier', $numDossier)->value('CodeMonnaie'),
                            $this->dateSystem,
                            $jourRetard->CodeAgence,
                            $this->tauxDuJour,
                            'complet',
                            $jourRetard->NumcompteEpargne,
                            0,
                            $this->dateSystem,
                            Portefeuille::where('NumDossier', $numDossier)->value('MontantAccorde'),
                            $numDossier,
                            'SYSTEM',
                            null
                        );
                    }
                }
            }
            // Plus de retard : on nettoie les flags
            $jourRetard->provision1 = 0;
            $jourRetard->provision2 = 0;
            $jourRetard->provision3 = 0;
            $jourRetard->provision4 = 0;
            $jourRetard->provision5 = 0;
            $jourRetard->save();
        } else {
            // Recalculer les provisions (les flags seront mis à jour par provisionCreditRetard)
            $portefeuille = Portefeuille::where('NumDossier', $numDossier)->first();
            if ($portefeuille) {
                $this->provisionCreditRetard($portefeuille);
            }
        }
    }





    /**
     * Annule toutes les provisions et reclassement 39 -> 32 pour un dossier clôturé
     * @param string $numDossier
     * @return void
     */
    public function annulerProvisionEtReclasser($numDossier)
    {
        $jourRetard = JourRetard::where('NumDossier', $numDossier)->first();
        if (!$jourRetard) return;

        // Capital restant = total capital - total remboursé
        $totalCapital = Echeancier::where('NumDossier', $numDossier)->sum('CapAmmorti');
        $totalRembourse = Remboursementcredit::where('NumDossie', $numDossier)->sum('CapitalPaye');
        $capitalRestant = $totalCapital - $totalRembourse;

        $aProvision = $jourRetard->provision1 || $jourRetard->provision2 || $jourRetard->provision3 || $jourRetard->provision4 || $jourRetard->provision5;

        if ($capitalRestant > 0 && $aProvision) {
            $this->insertInTransactionRepriseProvision(
                $capitalRestant,
                Portefeuille::where('NumDossier', $numDossier)->value('CodeMonnaie'),
                $this->dateSystem,
                $jourRetard->CodeAgence,
                $this->tauxDuJour,
                'complet',
                $jourRetard->NumcompteEpargne,
                0,
                $this->dateSystem,
                Portefeuille::where('NumDossier', $numDossier)->value('MontantAccorde'),
                $numDossier,
                'SYSTEM',
                null
            );
        }

        // Reclassement du compte 39 vers 32 (s'il y a un solde)
        $compte39 = $jourRetard->NumCompteCreanceLitigieuse;
        $compte32 = $jourRetard->NumcompteCredit;
        if ($compte39 && $compte32) {
            $devise = (Portefeuille::where('NumDossier', $numDossier)->value('CodeMonnaie') == 'USD') ? 1 : 2;
            $solde39 = $this->checkSoldeMembreACTIF($devise, $compte39, $numDossier);
            // if ($solde39 > 0) {
            //     $numTransaction = $this->generateTransactionNumber();
            //     // Débit du compte 32 (crédit client)
            //     Transactions::create([
            //         "NumTransaction" => $numTransaction,
            //         "DateTransaction" => $this->dateSystem,
            //         "DateSaisie" => $this->dateSystem,
            //         "TypeTransaction" => "D",
            //         "CodeMonnaie" => $devise,
            //         "CodeAgence" => $jourRetard->CodeAgence,
            //         "NumDossier" => $numDossier,
            //         "NumCompte" => $compte32,
            //         "NumComptecp" => $compte39,
            //         "Debit" => $solde39,
            //         "Operant" => "SYSTEM",
            //         "Debitfc" => $devise == 2 ? $solde39 : $solde39 * $this->tauxDuJour,
            //         "Debitusd" => $devise == 1 ? $solde39 : $solde39 / $this->tauxDuJour,
            //         "NomUtilisateur" => "SYSTEM",
            //         "Libelle" => "Reclassement capital restant (clôture crédit) - dossier " . $numDossier,
            //         "refCompteMembre" => $jourRetard->NumAdherent,
            //         "RefEcheance" => null,
            //     ]);
            //     // Crédit du compte 39
            //     Transactions::create([
            //         "NumTransaction" => $numTransaction,
            //         "DateTransaction" => $this->dateSystem,
            //         "DateSaisie" => $this->dateSystem,
            //         "TypeTransaction" => "C",
            //         "CodeMonnaie" => $devise,
            //         "CodeAgence" => $jourRetard->CodeAgence,
            //         "NumDossier" => $numDossier,
            //         "NumCompte" => $compte39,
            //         "NumComptecp" => $compte32,
            //         "Credit" => $solde39,
            //         "Operant" => "SYSTEM",
            //         "Creditfc" => $devise == 2 ? $solde39 : $solde39 * $this->tauxDuJour,
            //         "Creditusd" => $devise == 1 ? $solde39 : $solde39 / $this->tauxDuJour,
            //         "NomUtilisateur" => "SYSTEM",
            //         "Libelle" => "Reclassement capital restant (clôture crédit) - dossier " . $numDossier,
            //         "refCompteMembre" => $jourRetard->NumAdherent,
            //         "RefEcheance" => null,
            //     ]);
            // }
            // Si le solde du compte 39 est nul ou négatif, on calcule le capital restant réel via les échéanciers
            // if ($solde39 <= 0) {
            //     $totalCapital = Echeancier::where('NumDossier', $numDossier)
            //         ->where('Reechelonne', 0)
            //         ->sum('CapAmmorti');

            //     $totalRembourse = Remboursementcredit::whereIn('RefEcheance', function ($q) use ($numDossier) {
            //         $q->select('ReferenceEch')
            //             ->from('echeanciers')
            //             ->where('NumDossier', $numDossier)
            //             ->where('Reechelonne', 0);
            //     })->sum('CapitalPaye');

            //     $solde39 = $totalCapital - $totalRembourse;
            //     // dd($solde39);
            // }
            if ($solde39 > 0) {
                $numTransaction = $this->generateTransactionNumber();
                // Débit du compte 32 (crédit client)
                Transactions::create([
                    "NumTransaction" => $numTransaction,
                    "RefJournal" => JournalType::CREDIT,
                    "DateTransaction" => $this->dateSystem,
                    "DateSaisie" => $this->dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $jourRetard->CodeAgence,
                    "NumDossier" => $numDossier,
                    "NumCompte" => $compte32,
                    "NumComptecp" => $compte39,
                    "Debit" => $solde39,
                    "Operant" => "SYSTEM",
                    "Debitfc" => $devise == 2 ? $solde39 : $solde39 * $this->tauxDuJour,
                    "Debitusd" => $devise == 1 ? $solde39 : $solde39 / $this->tauxDuJour,
                    "NomUtilisateur" => "SYSTEM",
                    "Libelle" => "Reclassement capital restant dû du crédit - dossier " . $numDossier,
                    "refCompteMembre" => $jourRetard->NumAdherent,
                    "RefEcheance" => null,
                ]);
                // Crédit du compte 39
                Transactions::create([
                    "NumTransaction" => $numTransaction,
                    "RefJournal" => JournalType::CREDIT,
                    "DateTransaction" => $this->dateSystem,
                    "DateSaisie" => $this->dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $jourRetard->CodeAgence,
                    "NumDossier" => $numDossier,
                    "NumCompte" => $compte39,
                    "NumComptecp" => $compte32,
                    "Credit" => $solde39,
                    "Operant" => "SYSTEM",
                    "Creditfc" => $devise == 2 ? $solde39 : $solde39 * $this->tauxDuJour,
                    "Creditusd" => $devise == 1 ? $solde39 : $solde39 / $this->tauxDuJour,
                    "NomUtilisateur" => "SYSTEM",
                    "Libelle" => "Reclassement capital restant dû du crédit - dossier " . $numDossier,
                    "refCompteMembre" => $jourRetard->NumAdherent,
                    "RefEcheance" => null,
                ]);
            }
        }

        // Nettoyage des flags de provision et jours de retard
        $jourRetard->update([
            'provision1' => 0,
            'provision2' => 0,
            'provision3' => 0,
            'provision4' => 0,
            'provision5' => 0,
            'NbrJrRetard' => 0,
            'DateRetard' => $this->dateSystem,
        ]);
    }
}
