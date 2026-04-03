<?php

namespace App\CustomTasks;


use App\Models\Comptes;
use App\Models\Echeancier;
use App\Models\JourRetard;
use App\Models\Portefeuille;
use App\Models\Transactions;
use App\Models\TauxEtDateSystem;
use Illuminate\Support\Facades\DB;
use App\Models\CompteurTransaction;
use App\Models\Remboursementcredit;
use Illuminate\Support\Facades\Log;


class ClotureJournee
{
    public function __construct()
    {
        // Initialisation de la classe
    }

    public function execute()
    {
        $this->remboursementCapital();
        $this->remboursementInteret();
        $this->creditEnRetard();
        // Appeler d'autres fonctions si nécessaire
        Log::info('La méthode execute() de ClotureJournee est appelée.');
    }

    private function remboursementCapital()
    {
        // Logique pour effectuer le remboursement du capital
        //PERMET DE RECUPERER TOUS LES CREDIT QUI DOIVENT REMBOURSES
        $compteCreditAuxMembreCDF = "3210000000202";
        $compteCreditAuxMembreUSD = "3210000000201";
        //RECUPERE TOUT LES MEMBRES QUI ONT UN CREDIT EN CDF
        //RECUPERE LA DATE DU SYSTEME
        $dataSystem = TauxEtDateSystem::latest()->first();
        $tauxDuJour = $dataSystem->TauxEnFc;
        $dateSystem = $dataSystem->DateSystem;
        $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->where("portefeuilles.Octroye", "=", 1)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.DateTranch", "<=", $dateSystem)
            ->where("portefeuilles.CodeMonnaie", "=", "CDF")
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0)->get();
        //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

        $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->where("portefeuilles.Octroye", "=", 1)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.DateTranch", "<=", $dateSystem)
            ->where("portefeuilles.CodeMonnaie", "=", "USD")
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0)->get();

        //UNE FOIS ON A CES CREDIT ON VA CREER UNE BOUCLE POUR LE PARCOURIR EN COMMENCANT PAR LE CDF
        if (count($dataGetCreditCDF) != 0) {

            for ($i = 0; $i < sizeof($dataGetCreditCDF); $i++) {
                $response[] = $dataGetCreditCDF[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditCDF) {
                //RECUPERE LE SOLDE DU CLIENT
                $soldeMembreCDF = Transactions::select(
                    DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                )->where("NumCompte", '=', $dataGetCreditCDF->NumCompteEpargne)
                    ->groupBy("NumCompte")
                    ->first();
                $soldeMembre = $soldeMembreCDF->soldeMembreCDF;
                //VERIFIE SI LE SOLDE DU CLIENT EST SUPERIEUR AU MONTANT A REMBOURSER
                if ($soldeMembre >= $dataGetCreditCDF->CapAmmorti) {
                    //ON FAIT ICI LE REMBOURSEMENT EN CAPITAL
                    Remboursementcredit::create([
                        "RefEcheance" => $dataGetCreditCDF->ReferenceEch,
                        "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                        "NumCompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                        "NumDossie" => $dataGetCreditCDF->NumDossier,
                        "RefTypCredit" => $dataGetCreditCDF->RefTypeCredit,
                        "NomCompte" => $dataGetCreditCDF->NomCompte,
                        "DateTranche" => $dataGetCreditCDF->DateTranch,
                        "CapitalAmmortie" => $dataGetCreditCDF->CapAmmorti,
                        "CapitalPaye"  =>  $dataGetCreditCDF->CapAmmorti,
                        "InteretAmmorti" => $dataGetCreditCDF->Interet,
                        "CodeGuichet" => $dataGetCreditCDF->CodeAgence,
                        "NumAdherent" => $dataGetCreditCDF->numAdherant,
                    ]);

                    //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    //RECUPERE LA DATE DU SYSTEME
                    $dataSystem = TauxEtDateSystem::latest()->first();
                    $tauxDuJour = $dataSystem->TauxEnFc;
                    $dateSystem = $dataSystem->DateSystem;

                    //DEBITE LE COMPTE EPARGNE DU CLIENT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                        "NumComptecp" => $compteCreditAuxMembreCDF,
                        "Debit" =>  $dataGetCreditCDF->CapAmmorti,
                        "Debitfc" =>  $dataGetCreditCDF->CapAmmorti,
                        "Debitusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                    ]);

                    //CREDITE LE COMPTE CREDIT COMPTABLE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $compteCreditAuxMembreCDF,
                        "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                        "Credit" =>  $dataGetCreditCDF->CapAmmorti,
                        "Creditfc" =>  $dataGetCreditCDF->CapAmmorti,
                        "Creditusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                    ]);


                    //CREDITE LE COMPTE CREDIT DU CLIENT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataGetCreditCDF->NumCompteCredit,
                        "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                        "Credit" =>  $dataGetCreditCDF->CapAmmorti,
                        "Creditfc" =>  $dataGetCreditCDF->CapAmmorti,
                        "Creditusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                    ]);
                } else {
                    //SINON ON APPEL LA FONCTION CREDIT EN RETARD
                    $this->creditEnRetard();
                }
            }
            //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
        }


        //POUR LE REMBOURSEMENT EN USD
        if (count($dataGetCreditUSD) != 0) {
            for ($i = 0; $i < sizeof($dataGetCreditUSD); $i++) {
                $response[] = $dataGetCreditUSD[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditUSD) {
                //RECUPERE LE SOLDE DU CLIENT
                $soldeMembreUSD = Transactions::select(
                    DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                )->where("NumCompte", '=', $dataGetCreditUSD->NumCompteEpargne)
                    ->groupBy("NumCompte")
                    ->first();
                $soldeMembre = $soldeMembreUSD->soldeMembreUSD;
                //VERIFIE SI LE SOLDE DU CLIENT EST SUPERIEUR AU MONTANT A REMBOURSER
                if ($soldeMembre >= $dataGetCreditUSD->CapAmmorti) {
                    //ON FAIT ICI LE REMBOURSEMENT EN CAPITAL
                    Remboursementcredit::create([
                        "RefEcheance" => $dataGetCreditUSD->ReferenceEch,
                        "NumCompte" => $dataGetCreditUSD->NumCompteEpargne,
                        "NumCompteCredit" => $dataGetCreditUSD->NumCompteCredit,
                        "NumDossie" => $dataGetCreditUSD->NumDossier,
                        "RefTypCredit" => $dataGetCreditUSD->RefTypeCredit,
                        "NomCompte" => $dataGetCreditUSD->NomCompte,
                        "DateTranche" => $dataGetCreditUSD->DateTranch,
                        "CapitalAmmortie" => $dataGetCreditUSD->CapAmmorti,
                        "CapitalPaye"  =>  $dataGetCreditUSD->CapAmmorti,
                        "InteretAmmorti" => $dataGetCreditUSD->Interet,
                        "CodeGuichet" => $dataGetCreditUSD->CodeAgence,
                        "NumAdherent" => $dataGetCreditUSD->numAdherant,
                    ]);

                    //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    //RECUPERE LA DATE DU SYSTEME
                    $dataSystem = TauxEtDateSystem::latest()->first();
                    $tauxDuJour = $dataSystem->TauxEnFc;
                    $dateSystem = $dataSystem->DateSystem;

                    //DEBITE LE COMPTE EPARGNE DU CLIENT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataGetCreditUSD->NumCompteEpargne,
                        "NumComptecp" => $compteCreditAuxMembreUSD,
                        "Debit" =>  $dataGetCreditUSD->CapAmmorti,
                        "Debitfc" => $dataGetCreditUSD->CapAmmorti * $tauxDuJour,
                        "Debitusd" =>  $dataGetCreditUSD->CapAmmorti,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                    ]);

                    //CREDITE LE COMPTE CREDIT COMPTABLE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $compteCreditAuxMembreUSD,
                        "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                        "Credit" =>  $dataGetCreditUSD->CapAmmorti,
                        "Creditfc" =>  $dataGetCreditUSD->CapAmmorti * $tauxDuJour,
                        "Creditusd" => $dataGetCreditUSD->CapAmmorti,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                    ]);


                    //CREDITE LE COMPTE CREDIT DU CLIENT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataGetCreditUSD->NumCompteCredit,
                        "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                        "Credit" =>  $dataGetCreditUSD->CapAmmorti,
                        "Creditfc" =>  $dataGetCreditUSD->CapAmmorti * $tauxDuJour,
                        "Creditusd" =>  $dataGetCreditUSD->CapAmmorti,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                    ]);
                } else {
                    //SINON ON APPEL LA FONCTION CREDIT EN RETARD
                    $this->creditEnRetard();
                }
            }
            //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
        }
    }

    private function remboursementInteret()
    {
        // Logique pour effectuer le remboursement des intérêts
        // Logique pour effectuer le remboursement du capital
        //PERMET DE RECUPERER TOUS LES CREDIT QUI DOIVENT REMBOURSES
        $compteCreditAuxMembreCDF = "3210000000202";
        $compteCreditAuxMembreUSD = "3210000000201";
        //RECUPERE TOUT LES MEMBRES QUI ONT UN CREDIT EN CDF
        //RECUPERE LA DATE DU SYSTEME
        $dataSystem = TauxEtDateSystem::latest()->first();
        $tauxDuJour = $dataSystem->TauxEnFc;
        $dateSystem = $dataSystem->DateSystem;
        $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->where("portefeuilles.Octroye", "=", 1)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.DateTranch", "<=", $dateSystem)
            ->where("portefeuilles.CodeMonnaie", "=", "CDF")
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0)->get();
        //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

        $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->where("portefeuilles.Octroye", "=", 1)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.DateTranch", "<=", $dateSystem)
            ->where("portefeuilles.CodeMonnaie", "=", "USD")
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0)->get();

        //UNE FOIS ON A CES CREDIT ON VA CREER UNE BOUCLE POUR LE PARCOURIR EN COMMENCANT PAR LE CDF
        if (count($dataGetCreditCDF) != 0) {

            for ($i = 0; $i < sizeof($dataGetCreditCDF); $i++) {
                $response[] = $dataGetCreditCDF[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditCDF) {
                //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //RECUPERE LA DATE DU SYSTEME
                $dataSystem = TauxEtDateSystem::latest()->first();
                $tauxDuJour = $dataSystem->TauxEnFc;
                $dateSystem = $dataSystem->DateSystem;
                //RECUPERE LE SOLDE DU CLIENT
                $soldeMembreCDF = Transactions::select(
                    DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                )->where("NumCompte", '=', $dataGetCreditCDF->NumCompteEpargne)
                    ->groupBy("NumCompte")
                    ->first();
                $soldeMembre = $soldeMembreCDF->soldeMembreCDF;
                //VERIFIE SI LE SOLDE DU CLIENT EST SUPERIEUR AU MONTANT A REMBOURSER DE L'INTERET
                if ($soldeMembre >= $dataGetCreditCDF->Interet) {
                    //VERIFIE D'ABORD SI LA LIGNE DE LA DATE CONCERNEE
                    $checkRaw = Remboursementcredit::where("NumDossie", $dataGetCreditCDF->NumDossier)->where("DateTranche", $dataGetCreditCDF->DateTranch)->first();
                    if ($checkRaw) {
                        //ON FAIT ICI LE REMBOURSEMENT EN INTERET METTANT A JOUR LA LIGNE
                        Remboursementcredit::where("NumDossie", $dataGetCreditCDF->NumDossier)->where("DateTranche", $dataGetCreditCDF->DateTranch)->update([
                            "RefEcheance" => $dataGetCreditCDF->ReferenceEch,
                            "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                            "NumCompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                            "NumDossie" => $dataGetCreditCDF->NumDossier,
                            "RefTypCredit" => $dataGetCreditCDF->RefTypeCredit,
                            "NomCompte" => $dataGetCreditCDF->NomCompte,
                            "DateTranche" => $dataGetCreditCDF->DateTranch,
                            "InteretAmmorti" => $dataGetCreditCDF->Interet,
                            "InteretPaye" => $dataGetCreditCDF->Interet,
                            "CodeGuichet" => $dataGetCreditCDF->CodeAgence,
                            "NumAdherent" => $dataGetCreditCDF->numAdherant,
                        ]);
                    } else {
                        //SINON ON FAIT UNE INSERTION
                        Remboursementcredit::create([
                            "RefEcheance" => $dataGetCreditCDF->ReferenceEch,
                            "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                            "NumCompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                            "NumDossie" => $dataGetCreditCDF->NumDossier,
                            "RefTypCredit" => $dataGetCreditCDF->RefTypeCredit,
                            "NomCompte" => $dataGetCreditCDF->NomCompte,
                            "DateTranche" => $dataGetCreditCDF->DateTranch,
                            "InteretAmmorti" => $dataGetCreditCDF->Interet,
                            "InteretPaye" => $dataGetCreditCDF->Interet,
                            "CodeGuichet" => $dataGetCreditCDF->CodeAgence,
                            "NumAdherent" => $dataGetCreditCDF->numAdherant,
                        ]);
                    }
                    //PUIS ON PASSE L'ECRITURE DE REMBOURSEMENT
                    //:://DEBITE LE DU CLIENT DE CE MONTANT D'INTERET//:://
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" =>   $dataGetCreditCDF->NumCompteEpargne,
                        "NumComptecp" => $dataGetCreditCDF->CompteInteret,
                        "Debit" =>  $dataGetCreditCDF->Interet,
                        "Debitfc" =>  $dataGetCreditCDF->Interet,
                        "Debitusd" =>  $dataGetCreditCDF->Interet / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement intérêt du votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                    ]);


                    //PUIS ON CREDITE LE COMPTE INTERET

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" =>  $dataGetCreditCDF->CompteInteret,
                        "NumComptecp" =>  $dataGetCreditCDF->NumCompteEpargne,
                        "Credit" =>  $dataGetCreditCDF->Interet,
                        "Creditfc" =>  $dataGetCreditCDF->Interet,
                        "Creditusd" =>  $dataGetCreditCDF->Interet / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement intérêt du votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                    ]);
                    //ICI ON MET LE STATUT DE PAYEMENT A TRUE PCQ LE CLIENT N'EST PAS EN REATRD  
                    Echeancier::where("echeanciers.ReferenceEch", "=", $dataGetCreditCDF->ReferenceEch)
                        ->update([
                            "statutPayement" => "1",
                            "posted" => "1",
                        ]);
                } else {
                    //SINON ON APPEL LA FONCTION CREDIT EN RETARD
                    $this->creditEnRetard();
                }
            }
        }
        //FIN REMBOURSEMENT INTERET EN FC


        //DEBUT REMBOURSEMENT INTERET EN USD
        if (count($dataGetCreditUSD) != 0) {
            for ($i = 0; $i < sizeof($dataGetCreditUSD); $i++) {
                $response[] = $dataGetCreditUSD[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditUSD) {
                //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //RECUPERE LA DATE DU SYSTEME
                $dataSystem = TauxEtDateSystem::latest()->first();
                $tauxDuJour = $dataSystem->TauxEnFc;
                $dateSystem = $dataSystem->DateSystem;
                //RECUPERE LE SOLDE DU CLIENT
                $soldeMembreUSD = Transactions::select(
                    DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                )->where("NumCompte", '=', $dataGetCreditUSD->NumCompteEpargne)
                    ->groupBy("NumCompte")
                    ->first();
                $soldeMembre = $soldeMembreUSD->soldeMembreUSD;
                //VERIFIE SI LE SOLDE DU CLIENT EST SUPERIEUR AU MONTANT A REMBOURSER DE L'INTERET
                if ($soldeMembre >= $dataGetCreditUSD->Interet) {
                    //VERIFIE D'ABORD SI LA LIGNE DE LA DATE CONCERNEE
                    $checkRaw = Remboursementcredit::where("NumDossie", $dataGetCreditUSD->NumDossier)->where("DateTranche", $dataGetCreditUSD->DateTranch)->first();
                    if ($checkRaw) {
                        //ON FAIT ICI LE REMBOURSEMENT EN INTERET METTANT A JOUR LA LIGNE
                        Remboursementcredit::where("NumDossie", $dataGetCreditUSD->NumDossier)->where("DateTranche", $dataGetCreditUSD->DateTranch)->update([
                            "RefEcheance" => $dataGetCreditUSD->ReferenceEch,
                            "NumCompte" => $dataGetCreditUSD->NumCompteEpargne,
                            "NumCompteCredit" => $dataGetCreditUSD->NumCompteCredit,
                            "NumDossie" => $dataGetCreditUSD->NumDossier,
                            "RefTypCredit" => $dataGetCreditUSD->RefTypeCredit,
                            "NomCompte" => $dataGetCreditUSD->NomCompte,
                            "DateTranche" => $dataGetCreditUSD->DateTranch,
                            "CapitalAmmortie" => $dataGetCreditUSD->CapAmmorti,
                            "InteretAmmorti" => $dataGetCreditUSD->Interet,
                            "InteretPaye" => $dataGetCreditUSD->Interet,
                            "CodeGuichet" => $dataGetCreditUSD->CodeAgence,
                            "NumAdherent" => $dataGetCreditUSD->numAdherant,
                        ]);
                    } else {
                        //SINON ON FAIT UNE INSERTION
                        Remboursementcredit::create([
                            "RefEcheance" => $dataGetCreditUSD->ReferenceEch,
                            "NumCompte" => $dataGetCreditUSD->NumCompteEpargne,
                            "NumCompteCredit" => $dataGetCreditUSD->NumCompteCredit,
                            "NumDossie" => $dataGetCreditUSD->NumDossier,
                            "RefTypCredit" => $dataGetCreditUSD->RefTypeCredit,
                            "NomCompte" => $dataGetCreditUSD->NomCompte,
                            "DateTranche" => $dataGetCreditUSD->DateTranch,
                            "CapitalAmmortie" => $dataGetCreditUSD->CapAmmorti,
                            "InteretAmmorti" => $dataGetCreditUSD->Interet,
                            "InteretPaye" => $dataGetCreditUSD->Interet,
                            "CodeGuichet" => $dataGetCreditUSD->CodeAgence,
                            "NumAdherent" => $dataGetCreditUSD->numAdherant,
                        ]);
                    }
                    //PUIS ON PASSE L'ECRITURE DE REMBOURSEMENT
                    //:://DEBITE LE DU CLIENT DE CE MONTANT D'INTERET//:://
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" =>   $dataGetCreditUSD->NumCompteEpargne,
                        "NumComptecp" => $dataGetCreditUSD->CompteInteret,
                        "Debit" =>  $dataGetCreditUSD->Interet,
                        "Debitfc" =>  $dataGetCreditUSD->Interet * $tauxDuJour,
                        "Debitusd" =>  $dataGetCreditUSD->Interet,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement intérêt du votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                    ]);


                    //PUIS ON CREDITE LE COMPTE INTERET

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" =>  $dataGetCreditUSD->CompteInteret,
                        "NumComptecp" =>  $dataGetCreditUSD->NumCompteEpargne,
                        "Credit" =>  $dataGetCreditUSD->Interet,
                        "Creditfc" =>  $dataGetCreditUSD->Interet * $tauxDuJour,
                        "Creditusd" =>  $dataGetCreditUSD->Interet,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Remboursement intérêt du votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                    ]);
                    //ICI ON MET LE STATUT DE PAYEMENT A TRUE PCQ LE CLIENT N'EST PAS EN REATRD  
                    Echeancier::where("echeanciers.ReferenceEch", "=", $dataGetCreditUSD->ReferenceEch)
                        ->update([
                            "statutPayement" => "1",
                            "posted" => "1",
                        ]);
                } else {
                    //SINON ON APPEL LA FONCTION CREDIT EN RETARD
                    $this->creditEnRetard();
                }
            }
        }
    }

    private function creditEnRetard()
    {
        //Logique pour gérer les crédits en retard
        //RECUPERE LA DATE DU SYSTEME
        $dataSystem = TauxEtDateSystem::latest()->first();
        $tauxDuJour = $dataSystem->TauxEnFc;
        $dateSystem = $dataSystem->DateSystem;
        $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->where("portefeuilles.Octroye", "=", 1)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.DateTranch", "<=", $dateSystem)
            ->where("portefeuilles.CodeMonnaie", "=", "CDF")
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0)->get();
        //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

        $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
            ->where("portefeuilles.Octroye", "=", 1)
            ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
            ->where("echeanciers.DateTranch", "<=", $dateSystem)
            ->where("portefeuilles.CodeMonnaie", "=", "USD")
            ->where("echeanciers.statutPayement", "=", 0)
            ->where("echeanciers.posted", "=", 0)
            ->where("echeanciers.CapAmmorti", ">", 0)->get();

        //UNE FOIS ON A CES CREDIT ON VA CREER UNE BOUCLE POUR LE PARCOURIR EN COMMENCANT PAR LE CDF
        if (count($dataGetCreditCDF) != 0) {

            for ($i = 0; $i < sizeof($dataGetCreditCDF); $i++) {
                $response[] = $dataGetCreditCDF[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditCDF) {
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                $compteCreditAuxMembreCDF = "3210000000202";
                $compteCreditAuxMembreUSD = "3210000000201";
                $compteDotationAuProvisionCDF = "6901000000202";
                $compteDotationAuProvisionUSD = "6900000000201";
                $compteRepriseDeProvisionCDF = "7901000000202";
                $compteRepriseDeProvisionUSD = "7900000000201";
                $compteCreanceLitigeuseUSD = "3900000000201";
                $compteCreanceLitigeuseCDF = "3901000000202";
                //RECUPERE LE SOLDE DU CLIENT
                $soldeMembreCDF = Transactions::select(
                    DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                )->where("NumCompte", '=', $dataGetCreditCDF->NumCompteEpargne)
                    ->groupBy("NumCompte")
                    ->first();
                $soldeMembre = $soldeMembreCDF->soldeMembreCDF;
                //PREMIERE VERIFICATION SI LE SOLDE DU CLIENT EST INFERIEUR AU CAP A PAYER 
                if ($soldeMembre < $dataGetCreditCDF->CapAmmorti) {
                    //ON SELECTIONNE LQ LIGNE POUR ENFIN LA METTRE A JOUR SI ELLE EXISTAIT DEJA
                    $checkRaw = Remboursementcredit::where("NumDossie", $dataGetCreditCDF->NumDossier)->where("DateTranche", $dataGetCreditCDF->DateTranch)->first();
                    if ($checkRaw) {
                        //ICI LA LOGIQUE SI IL AVAIT DEJA PAYER QUELQUE CHOSE SUR LE CAPITAL
                        //première verification est ce que le montant qu'il avait remboursé est égal au montant de remboursement attendu ?
                        if ($checkRaw->CapitalPaye == $dataGetCreditCDF->CapAmmorti) {
                            //SI CETTE CONDITION EST VRAI CELA SIGNIFIE QUE CE L'INTERET QUI EST EN RETARD
                            //si l'interêt payé est 0 est que le solde est inferieur ou egale au montant à rembourser pour l'interet 
                            if ($checkRaw->CapitalPaye == 0 and $soldeMembre <= $dataGetCreditCDF->Interet) {
                                //ON PASSE UNE ECRITURE POUR RECUPERER TOUT CE QUI EST DANS SON COMPTE POUR REMBOURSER L'INTERET



                            }
                        }
                        //ON FAIT ICI LE REMBOURSEMENT EN INTERET METTANT A JOUR LA LIGNE
                        Remboursementcredit::where("NumDossie", $dataGetCreditCDF->NumDossier)->where("DateTranche", $dataGetCreditCDF->DateTranch)->update([
                            "RefEcheance" => $dataGetCreditCDF->ReferenceEch,
                            "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                            "NumCompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                            "NumDossie" => $dataGetCreditCDF->NumDossier,
                            "RefTypCredit" => $dataGetCreditCDF->RefTypeCredit,
                            "NomCompte" => $dataGetCreditCDF->NomCompte,
                            "DateTranche" => $dataGetCreditCDF->DateTranch,
                            "InteretAmmorti" => $dataGetCreditCDF->Interet,
                            "InteretPaye" => $dataGetCreditCDF->Interet,
                            "CodeGuichet" => $dataGetCreditCDF->CodeAgence,
                            "NumAdherent" => $dataGetCreditCDF->numAdherant,
                        ]);
                    } else {
                        //SINON ON FAIT CONSTATE ICI LE RETARD POUR LA PREMIER JOUR 
                        JourRetard::create([
                            "NumcompteEpargne" => $dataGetCreditCDF->NumCompteEpargne,
                            "NumcompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                            "NumDossier" => $dataGetCreditCDF->NumDossier,
                            "NbrJrRetard" => 1,
                        ]);

                        //ON CREE TOUT DE SUITE SON COMPTE 38 POUR LA PROVISION DE CREDIT EN RETARD
                        if ($dataGetCreditCDF->NumAdherant < 10) {
                            $compteProvisionCDF = "380100000" . $dataGetCreditCDF->NumAdherant . "202";
                            $compteCreanceLitigieuseCDF = "390100000" . $dataGetCreditCDF->NumAdherant . "202";
                        } else if ($dataGetCreditCDF->NumAdherant >= 10 && $dataGetCreditCDF->NumAdherant < 100) {
                            $compteProvisionCDF = "38010000" . $dataGetCreditCDF->NumAdherant . "202";
                            $compteCreanceLitigieuseCDF = "39010000" . $dataGetCreditCDF->NumAdherant . "202";
                        } else if ($dataGetCreditCDF->NumAdherant >= 100 && $dataGetCreditCDF->NumAdherant < 1000) {
                            $compteProvisionCDF = "3801000" . $dataGetCreditCDF->NumAdherant . "202";
                            $compteCreanceLitigieuseCDF = "3901000" . $dataGetCreditCDF->NumAdherant . "202";
                        } else if ($dataGetCreditCDF->NumAdherant >= 1000 && $dataGetCreditCDF->NumAdherant < 10000) {
                            $compteProvisionCDF = "3801000" . $dataGetCreditCDF->NumAdherant . "202";
                            $compteCreanceLitigieuseCDF = "390100" . $dataGetCreditCDF->NumAdherant . "202";
                        }

                        //ON ENREGISTRE TOUT DE SUITE COMPTE DANS LA DATA BASE COMPTE PROVSION
                        //verifie d'abord si c comptes provision n'existe déjà pas
                        $checkCompteProvision = Comptes::where("NumCompte", $compteProvisionCDF)->first();
                        if (!$checkCompteProvision) {
                            Comptes::create([
                                'CodeAgence' => $dataGetCreditCDF->CodeAgence,
                                'NumCompte' => $compteProvisionCDF,
                                'NomCompte' => $dataGetCreditCDF->NomCompte,
                                'RefTypeCompte' => "3",
                                'RefCadre' => "38",
                                'RefGroupe' => "380",
                                'RefSousGroupe' => "3801",
                                'CodeMonnaie' => 2,
                                'NumAdherant' => $dataGetCreditCDF->numAdherant,
                            ]);
                        }

                        //ON CREE LE COMPTE CREANCE LITIGIEUSE
                        //verifie d'abord si c comptes créance litigieuse n'existe déjà pas
                        $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseCDF)->first();
                        if (!$checkCompteCL) {
                            Comptes::create([
                                'CodeAgence' => $dataGetCreditCDF->CodeAgence,
                                'NumCompte' => $compteCreanceLitigieuseCDF,
                                'NomCompte' => $dataGetCreditCDF->NomCompte,
                                'RefTypeCompte' => "3",
                                'RefCadre' => "39",
                                'RefGroupe' => "390",
                                'RefSousGroupe' => "3901",
                                'CodeMonnaie' => 2,
                                'NumAdherant' => $dataGetCreditCDF->numAdherant,
                            ]);
                        }

                        //ON VERIFIE ICI SI LE SOLDE DU MEMBRE CONTIENT QD MEME QUELQUE CHOSE POUR LE PRENDRE    
                        if ($soldeMembre > 0 and $soldeMembre <= $dataGetCreditCDF->CapAmmorti) {
                            //ON PREND LE CAPITAL CAR CELA SIGNIFIE QU'IL VA LUI RESTER QUELQUE CHOSE POUR L'INTERET        
                            $capitalApayer = $dataGetCreditCDF->CapAmmorti - $soldeMembre;
                            Remboursementcredit::create([
                                "RefEcheance" => $dataGetCreditCDF->ReferenceEch,
                                "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                                "NumCompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                                "NumDossie" => $dataGetCreditCDF->NumDossier,
                                "RefTypCredit" => $dataGetCreditCDF->RefTypeCredit,
                                "NomCompte" => $dataGetCreditCDF->NomCompte,
                                "DateTranche" => $dataGetCreditCDF->DateTranch,
                                "CapitalAmmortie" => $dataGetCreditCDF->CapAmmorti,
                                "CapitalPaye"  =>  $capitalApayer,
                                "InteretAmmorti" => $dataGetCreditCDF->Interet,
                                "CodeGuichet" => $dataGetCreditCDF->CodeAgence,
                                "NumAdherent" => $dataGetCreditCDF->numAdherant,
                            ]);
                            //DEBITE LE COMPTE DU CLIENT 
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => $dateSystem,
                                "TypeTransaction" => "D",
                                "CodeMonnaie" => 2,
                                "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                                "NumComptecp" => $compteCreditAuxMembreCDF,
                                "Debit" =>  $dataGetCreditCDF->CapAmmorti,
                                "Debitfc" =>  $dataGetCreditCDF->CapAmmorti,
                                "Debitusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                            ]);


                            //CREDITE LE CREDIT COMPTABLE 

                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => $dateSystem,
                                "TypeTransaction" => "C",
                                "CodeMonnaie" => 2,
                                "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $compteCreditAuxMembreCDF,
                                "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                "Credit" =>  $dataGetCreditCDF->CapAmmorti,
                                "Creditfc" =>  $dataGetCreditCDF->CapAmmorti,
                                "Creditusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Remboursement partiel du capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                            ]);

                            //CREDITE LE COMPTE CREDIT DU CLIENT
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => $dateSystem,
                                "TypeTransaction" => "C",
                                "CodeMonnaie" => 2,
                                "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $dataGetCreditCDF->NumCompteCredit,
                                "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                "Credit" =>  $dataGetCreditCDF->CapAmmorti,
                                "Creditfc" =>  $dataGetCreditCDF->CapAmmorti,
                                "Creditusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                            ]);




                            //PUIS PASSE L'ECRITURE DE PROVISION
                            $montantProvision = ($dataGetCreditCDF->CapitalRestant * 5) / 100;
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dateSystem,
                                "DateSaisie" => $dateSystem,
                                "TypeTransaction" => "C",
                                "CodeMonnaie" => 2,
                                "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $compteProvisionCDF,
                                "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                "Credit" =>  $dataGetCreditCDF->CapAmmorti,
                                "Creditfc" =>  $dataGetCreditCDF->CapAmmorti,
                                "Creditusd" =>  $dataGetCreditCDF->CapAmmorti / $tauxDuJour,
                                "NomUtilisateur" => "AUTO",
                                "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                            ]);
                        }
                    }
                }
            }
        }
    }

    private function RemboursementCreditQuery(
        $RefEcheance,
        $montantApayer,
        $NumCompte,
        $NumCompteCredit,
        $NumDossie,
        $RefTypCredit,
        $NomCompte,
        $DateTranche,
        $CapitalAmmortie,
        $InteretAmmorti,
        $CodeGuichet,
        $NumAdherent,
    ) {
        Remboursementcredit::create([
            "RefEcheance" => $RefEcheance,
            "NumCompte" => $NumCompte,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossie,
            "RefTypCredit" => $RefTypCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranche,
            "CapitalAmmortie" => $CapitalAmmortie,
            "CapitalPaye"  =>  $montantApayer,
            "InteretAmmorti" => $InteretAmmorti,
            "CodeGuichet" => $CodeGuichet,
            "NumAdherent" => $NumAdherent,
        ]);
    }


    //CETTE FONCTION PERMET D'ENREGISTRER LES OPERATIONS DE REMBOURSEMENT DANS LA DATA BASE
    private function RemboursQuery(
        $NumTransaction,
        $DateTransaction,
        $DateSaisie,
        $TypeTransaction,
        $CodeMonnaie,
        $CodeAgence,
        $NumDossier,
        $NumDemande,
        $NumCompte,
        $NumComptecp,
        $Debit,
        $Debitfc,
        $Debitusd,
        $Credit,
        $Creditfc,
        $Creditusd,
        $NomUtilisateur,
        $Libelle,
        $refCompteMembre,
    ) {
        //DEBITE LE COMPTE DU CLIENT 
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $DateTransaction,
            "DateSaisie" => $DateSaisie,
            "TypeTransaction" => $TypeTransaction,
            "CodeMonnaie" => $CodeMonnaie,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumDemande" => $NumDemande,
            "NumCompte" => $NumCompte,
            "NumComptecp" => $NumComptecp,
            "Debit" =>  $Debit,
            "Debitfc" =>  $Debitfc,
            "Debitusd" =>  $Debitusd,
            "NomUtilisateur" => $NomUtilisateur,
            "Libelle" => $Libelle
        ]);
        //CREDITE LE CREDIT COMPTABLE 
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $DateTransaction,
            "DateSaisie" => $DateSaisie,
            "TypeTransaction" => $TypeTransaction,
            "CodeMonnaie" => $CodeMonnaie,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumDemande" => $NumDemande,
            "NumCompte" => $NumCompte,
            "NumComptecp" => $NumComptecp,
            "Credit" =>  $Credit,
            "Creditfc" =>  $Creditfc,
            "Creditusd" =>  $Creditusd,
            "NomUtilisateur" => $NomUtilisateur,
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre
        ]);
        //CREDITE LE COMPTE CREDIT DU CLIENT
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $DateTransaction,
            "DateSaisie" => $DateSaisie,
            "TypeTransaction" => $TypeTransaction,
            "CodeMonnaie" => $CodeMonnaie,
            "CodeAgence" => $CodeAgence,
            "NumDossier" => $NumDossier,
            "NumDemande" => $NumDemande,
            "NumCompte" => $NumCompte,
            "NumComptecp" => $NumComptecp,
            "Credit" =>  $Credit,
            "Creditfc" =>  $Creditfc,
            "Creditusd" =>  $Creditusd,
            "NomUtilisateur" => $NomUtilisateur,
            "Libelle" => $Libelle,
            "refCompteMembre" => $refCompteMembre,
        ]);
    }





    // SELECT echeanciers.NumDossier, SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard, SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard FROM echeanciers LEFT JOIN remboursementcredits ON echeanciers.ReferenceEch = remboursementcredits.RefEcheance WHERE echeanciers.RetardPayement = 1 GROUP BY echeanciers.NumDossier;
}
