<?php

namespace App\Http\Controllers;

use App\Models\Comptes;
use App\Models\Echeancier;
use App\Models\JourRetard;
use App\Models\Portefeuille;
use App\Models\Transactions;
use App\Models\TauxEtDateSystem;
use Illuminate\Support\Facades\DB;
use App\Models\CompteurTransaction;
use App\Models\Remboursementcredit;
use Illuminate\Http\Request;

class RemboursementManuel extends Controller
{
    public function RemboursementManuel(Request $request)
    {
        if (!isset($request->numDossier)) {
            return response()->json(["status" => 0, "msg" => "Aucun numéro de dossier trouvé."]);
        }
        // Récupérer les données du formulaire
        $donneesDuFormulaire = $request->all();
        $checkboxValues = $request->RemboursAnticipe;
        $remboursementAnticipe = $checkboxValues['RemboursementAnticipative'];
        // dd($remboursAnticipe["RemboursementAnticipative"]);
        if ($remboursementAnticipe) {

            //RECUPERE ICI LA DATE D'ECHEANCE DU CREDIT 
            $dateEcheanche = Portefeuille::where("NumDossier", $request->numDossier)->first()->DateEcheance;
            $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateEcheanche)
                ->where("portefeuilles.CodeMonnaie", "=", "CDF")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.NumDossier", "=", $request->numDossier)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
            //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

            $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateEcheanche)
                ->where("portefeuilles.CodeMonnaie", "=", "USD")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.NumDossier", "=", $request->numDossier)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
            // dd($dataGetCreditCDF, $dateEcheanche);
        } else {

            $dataSystem = TauxEtDateSystem::latest()->first();
            $tauxDuJour = $dataSystem->TauxEnFc;
            $dateSystem = $dataSystem->DateSystem;
            //SI L'UTILSATEUR N'A PAS COCHE LA CASE REMBOURSEMENT ANTICIPATIVE ON FAIS LE REMBOURSEMENT NORMAL
            $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateSystem)
                ->where("portefeuilles.CodeMonnaie", "=", "CDF")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.NumDossier", "=", $request->numDossier)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
            //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

            $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateSystem)
                ->where("portefeuilles.CodeMonnaie", "=", "USD")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.NumDossier", "=", $request->numDossier)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
        }
        //PERMET DE RECUPERER TOUS LES CREDIT QUI DOIVENT REMBOURSES
        $compteCreditAuxMembreCDF = "3210000000202";
        $compteCreditAuxMembreUSD = "3210000000201";
        //RECUPERE TOUT LES MEMBRES QUI ONT UN CREDIT EN CDF
        //RECUPERE LA DATE DU SYSTEME
        $dataSystem = TauxEtDateSystem::latest()->first();
        $tauxDuJour = $dataSystem->TauxEnFc;
        $dateSystem = $dataSystem->DateSystem;

        //UNE FOIS ON A CES CREDIT ON VA CREER UNE BOUCLE POUR LE PARCOURIR EN COMMENCANT PAR LE CDF
        if (count($dataGetCreditCDF) != 0) {

            for ($i = 0; $i < sizeof($dataGetCreditCDF); $i++) {
                $response[] = $dataGetCreditCDF[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditCDF) {
                if ($dataGetCreditCDF->CodeMonnaie == "CDF") {
                    //VERIFIE S'IL A DES CREDITS QUI SONT RESTES EN RETARD 
                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->first();
                    if ($checkJourRetard) {
                        $this->creditEnRetard($donneesDuFormulaire);
                    }
                    //RECUPERE LE SOLDE DU CLIENT
                    $soldeMembreCDF = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                    )->where("NumCompte", '=', $dataGetCreditCDF->NumCompteEpargne)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeMembre = $soldeMembreCDF->soldeMembreCDF;
                    //VERIFIE SI LE SOLDE DU CLIENT EST SUPERIEUR AU MONTANT A REMBOURSER
                    if ($soldeMembre >= $dataGetCreditCDF->CapAmmorti + $dataGetCreditCDF->Interet and !$checkJourRetard) {
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

                        //REMBOURSEMENT EN INTERET 


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

                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
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
                            "Libelle" => "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
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
                            "Libelle" => "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF pour la " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                        ]);
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
                        $this->ClotureTranche($dataGetCreditCDF->ReferenceEch, $dataGetCreditCDF->NumDossier);
                    } else {
                        //SINON ON APPEL LA FONCTION CREDIT EN RETARD
                        $this->creditEnRetard($donneesDuFormulaire);
                    }
                }
                //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
            }
        }


        //POUR LE REMBOURSEMENT EN USD
        if (count($dataGetCreditUSD) != 0) {
            for ($i = 0; $i < sizeof($dataGetCreditUSD); $i++) {
                $response[] = $dataGetCreditUSD[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditUSD) {
                if ($dataGetCreditUSD->CodeMonnaie == "USD") {

                    //VERIFIE S'IL Y'A DE CREDIT QUI SONT RESTES EN RETARD 
                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateRetard", "<=", $dataSystem->DateSystem)->first();
                    if ($checkJourRetard) {
                        $this->creditEnRetard($donneesDuFormulaire);
                    }
                    //RECUPERE LE SOLDE DU CLIENT
                    $soldeMembreUSD = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $dataGetCreditUSD->NumCompteEpargne)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeMembre = $soldeMembreUSD->soldeMembreUSD;
                    //VERIFIE SI LE SOLDE DU CLIENT EST SUPERIEUR AU MONTANT A REMBOURSER

                    if ($soldeMembre >= $dataGetCreditUSD->CapAmmorti + $dataGetCreditUSD->Interet  and !$checkJourRetard) {
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

                        // REMBOURSEMENT EN INTERET 

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

                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
                        //:://DEBITE LE COMPTE DU CLIENT DE CE MONTANT D'INTERET//:://

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
                            "Libelle" => "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
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
                            "Libelle" => "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD pour la " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                        ]);
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = "AT00" . $numOperation->id;
                        //ICI ON MET LE STATUT DE PAYEMENT A TRUE PCQ LE CLIENT N'EST PAS EN REATRD  
                        $this->ClotureTranche($dataGetCreditUSD->ReferenceEch, $dataGetCreditUSD->NumDossier);
                    } else {
                        //SINON ON APPEL LA FONCTION CREDIT EN RETARD
                        $this->creditEnRetard($donneesDuFormulaire);
                    }
                } else {
                    $this->creditEnRetard($donneesDuFormulaire);
                }

                //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
            }
        }
    }



    private function creditEnRetard($donneesDuFormulaire)
    {
        $numDossier = $donneesDuFormulaire['numDossier'];
        //Logique pour gérer les crédits en retard
        //RECUPERE LA DATE DU SYSTEME
        $dataSystem = TauxEtDateSystem::latest()->first();
        $tauxDuJour = $dataSystem->TauxEnFc;
        $dateSystem = $dataSystem->DateSystem;
        $remboursAnticipe = $donneesDuFormulaire['RemboursAnticipe'];
        $remboursAnticip = $remboursAnticipe["RemboursementAnticipative"];
        if ($remboursAnticip) {
            //RECUPERE ICI LA DATE D'ECHEANCE DU CREDIT 
            $dateEcheanche = Portefeuille::where("NumDossier", $numDossier)->first()->DateEcheance;
            $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateEcheanche)
                ->where("portefeuilles.CodeMonnaie", "=", "CDF")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.NumDossier", "=", $numDossier)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
            //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

            $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateEcheanche)
                ->where("portefeuilles.CodeMonnaie", "=", "USD")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.NumDossier", "=", $numDossier)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
        } else {
            $dataSystem = TauxEtDateSystem::latest()->first();
            $tauxDuJour = $dataSystem->TauxEnFc;
            $dateSystem = $dataSystem->DateSystem;
            //SI L'UTILSATEUR N'A PAS COCHE LA CASE REMBOURSEMENT ANTICIPATIVE ON FAIS LE REMBOURSEMENT NORMAL
            $dataGetCreditCDF = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateSystem)
                ->where("portefeuilles.CodeMonnaie", "=", "CDF")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.NumDossier", "=", $numDossier)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
            //RECUPERE TOUT LE MEMBRE QUI ONT UN CREDIT EN USD

            $dataGetCreditUSD = Portefeuille::where("portefeuilles.Cloture", "=", 0)
                ->where("portefeuilles.Octroye", "=", 1)
                ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->where("echeanciers.DateTranch", "<=", $dateSystem)
                ->where("portefeuilles.CodeMonnaie", "=", "USD")
                ->where("echeanciers.statutPayement", "=", 0)
                ->where("echeanciers.NumDossier", "=", $numDossier)
                ->where("echeanciers.posted", "=", 0)
                ->where("echeanciers.CapAmmorti", ">", 0)->get();
        }

        //UNE FOIS ON A CES CREDIT ON VA CREER UNE BOUCLE POUR LE PARCOURIR EN COMMENCANT PAR LE CDF
        if (count($dataGetCreditCDF) != 0) {

            for ($i = 0; $i < sizeof($dataGetCreditCDF); $i++) {
                $response[] = $dataGetCreditCDF[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditCDF) {
                if ($dataGetCreditCDF->CodeMonnaie == "CDF") {

                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    $compteCreditAuxMembreCDF = "3210000000202";
                    $compteCreditAuxMembreUSD = "3210000000201";
                    $codeMonnaie = 2;



                    //RECUPERE LE SOLDE DU CLIENT
                    $soldeMembreCDF = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                    )->where("NumCompte", '=', $dataGetCreditCDF->NumCompteEpargne)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeMembre = $soldeMembreCDF->soldeMembreCDF;
                    //PREMIERE VERIFICATION SI LE SOLDE DU CLIENT EST INFERIEUR AU CAP A PAYER 
                    if ($soldeMembre > 0) {
                        //ON SELECTIONNE LQ LIGNE POUR ENFIN LA METTRE A JOUR SI ELLE EXISTAIT DEJA
                        $checkRaw = Remboursementcredit::where("remboursementcredits.NumDossie", $dataGetCreditCDF->NumDossier)->where("remboursementcredits.DateTranche", $dataGetCreditCDF->DateTranch)->where("echeanciers.statutPayement", 0)->where("echeanciers.posted", 0)->join("echeanciers", "echeanciers.ReferenceEch", "=", "remboursementcredits.RefEcheance")->first();
                        // $checkRaw = Remboursementcredit::where("NumDossie", $dataGetCreditCDF->NumDossier)->where("DateTranche", $dataGetCreditCDF->DateTranch)->first();
                        if ($checkRaw) {
                            //ICI LA LOGIQUE SI IL AVAIT DEJA PAYER QUELQUE LE CAPITAL ET CA NE RESTE QUE l'INTERET
                            //première verification est ce que le montant qu'il avait remboursé est égal au montant de remboursement attendu ?
                            if ($checkRaw->CapitalPaye == $dataGetCreditCDF->CapAmmorti) {

                                //SI CETTE CONDITION EST VRAI CELA SIGNIFIE QUE CE L'INTERET QUI EST EN RETARD
                                //si l'interêt payé est 0 est que le solde est inferieur ou egale au montant à rembourser pour l'interet 
                                if ($soldeMembre <= $dataGetCreditCDF->Interet) {

                                    //SI LE SOLDE EST INFERIEUR A L'INTERET QU'ON ATTENT QUE LA PERSONNE PAYE
                                    if ($soldeMembre < $dataGetCreditCDF->Interet) {
                                        $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();

                                        if ($checkJourRetard) {
                                            $this->IncrementerJourRetard($dataGetCreditCDF->NumDossier, $dateSystem, $dataGetCreditCDF->NumCompteEpargne, $dataGetCreditCDF->NumCompteCredit);
                                        }

                                        //ON PASSE UNE ECRITURE POUR RECUPERER TOUT CE QUI EST DANS SON COMPTE POUR REMBOURSER L'INTERET
                                        $montantApayer = $soldeMembre;
                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->Interet,
                                            $montantApayer,
                                            $dataGetCreditCDF->numAdherant
                                        );

                                        //APRES CECI ON PASSE L'OPERATION POUR ENREGISTRER LA TRANSACTION
                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer,
                                            "Debitusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement partiel intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 2,
                                            "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditCDF->CompteInteret,
                                            "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer,
                                            "Creditusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement partiel intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);
                                    }
                                }
                                $checkEcheancier = Echeancier::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateTranch", $dataGetCreditCDF->DateTranche)->where("statutPayement", 0)->where("posted", 0)->first();
                                if ($checkEcheancier and ($soldeMembre > $dataGetCreditCDF->Interet or $soldeMembre == $dataGetCreditCDF->Interet)) {

                                    $montantApayer = $dataGetCreditCDF->Interet;
                                    $this->RemboursementCreditQueryInteretUpdate(
                                        $dataGetCreditCDF->ReferenceEch,
                                        $dataGetCreditCDF->NumCompteEpargne,
                                        $dataGetCreditCDF->NumCompteCredit,
                                        $dataGetCreditCDF->NumDossier,
                                        $dataGetCreditCDF->RefTypeCredit,
                                        $dataGetCreditCDF->NomCompte,
                                        $dataGetCreditCDF->DateTranch,
                                        $dataGetCreditCDF->Interet,
                                        $montantApayer,
                                        $dataGetCreditCDF->numAdherant
                                    );

                                    //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                    CompteurTransaction::create([
                                        'fakevalue' => "0000",
                                    ]);
                                    $numOperation = [];
                                    $numOperation = CompteurTransaction::latest()->first();
                                    $NumTransaction = "AT00" . $numOperation->id;
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
                                        "Debit" =>  $montantApayer,
                                        "Debitfc" =>  $montantApayer,
                                        "Debitusd" =>  $montantApayer / $tauxDuJour,
                                        "NomUtilisateur" => "AUTO",
                                        "Libelle" => "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                    ]);


                                    //CREDITE LE COMPTE INTERET
                                    Transactions::create([
                                        "NumTransaction" => $NumTransaction,
                                        "DateTransaction" => $dateSystem,
                                        "DateSaisie" => $dateSystem,
                                        "TypeTransaction" => "C",
                                        "CodeMonnaie" => 2,
                                        "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                        "NumDossier" => "DOS00" . $numOperation->id,
                                        "NumDemande" => "V00" . $numOperation->id,
                                        "NumCompte" => $dataGetCreditCDF->CompteInteret,
                                        "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                        "Credit" =>  $montantApayer,
                                        "Creditfc" =>  $montantApayer,
                                        "Creditusd" =>  $montantApayer / $tauxDuJour,
                                        "NomUtilisateur" => "AUTO",
                                        "Libelle" => "Remboursement intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                        "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                    ]);
                                    //PERMET DE CONSTATER LE REMBOURSEMENT ET CLOTURER CETTE TRANCHE
                                    // $this->ClotureTranche($dataGetCreditCDF->ReferenceEch, $dataGetCreditCDF->NumDossier);
                                    // $this->RepriseSurProvision(
                                    //     $NumTransaction,
                                    //     $dataGetCreditCDF->CodeAgence,
                                    //     $dataGetCreditCDF->NumCompteCredit,
                                    //     $codeMonnaie,
                                    //     $dataGetCreditCDF->NumDossier,
                                    //     $dateSystem,
                                    //     $tauxDuJour,
                                    //     $dataGetCreditCDF->numAdherant,
                                    //     $montantApayer

                                    // );
                                }
                                //SI IL AVAIT DEJA PAYE QUELQUE CHOSE EN INTERET MAIS CA N'A PAS ETE COMPLET 
                                if ($checkRaw->InteretPaye > 0) {
                                    $montantApayer = $dataGetCreditCDF->Interet - $checkRaw->InteretPaye;
                                    if ($soldeMembre <= $montantApayer) {
                                        $montantTotalInteret = $soldeMembre;

                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->Interet,
                                            $checkRaw->InteretPaye + $montantTotalInteret,
                                            $dataGetCreditCDF->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer,
                                            "Debitusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 2,
                                            "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditCDF->CompteInteret,
                                            "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                            "Credit" =>  $montantTotalInteret,
                                            "Creditfc" =>  $montantTotalInteret,
                                            "Creditusd" =>  $montantTotalInteret / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);
                                    }
                                    if ($soldeMembre > $montantApayer) {
                                        $montantTotalInteret = $dataGetCreditCDF->Interet - $checkRaw->InteretPaye;
                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->Interet,
                                            $montantTotalInteret + $checkRaw->InteretPaye,
                                            $dataGetCreditCDF->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
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
                                            "Debit" =>  $montantTotalInteret,
                                            "Debitfc" =>  $montantTotalInteret,
                                            "Debitusd" =>  $montantTotalInteret / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 2,
                                            "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditCDF->CompteInteret,
                                            "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                            "Credit" =>  $montantTotalInteret,
                                            "Creditfc" =>  $montantTotalInteret,
                                            "Creditusd" =>  $montantTotalInteret / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);
                                        //CONSTATE ICI LE REMBOURSEMENT ET CLOTURE LA TRANCHE
                                        // $this->ClotureTranche($dataGetCreditCDF->ReferenceEch, $dataGetCreditCDF->NumDossier);
                                        // $this->RepriseSurProvision(
                                        //     $NumTransaction,
                                        //     $dataGetCreditCDF->CodeAgence,
                                        //     $dataGetCreditCDF->NumCompteCredit,
                                        //     $codeMonnaie,
                                        //     $dataGetCreditCDF->NumDossier,
                                        //     $dateSystem,
                                        //     $tauxDuJour,
                                        //     $dataGetCreditCDF->numAdherant
                                        // );
                                    }
                                }
                            }
                            //SI IL A PAYE QUELQUE CHOSE EN CAPITAL MAIS QUE CA PAS ETE COMPLET

                            if ($checkRaw->CapitalPaye < $dataGetCreditCDF->CapAmmorti) {
                                //SI LE SOLDE DU MEMBRE EST INFERIEUR  AU MONTANT DE CAPITAL EN REMBOURSER CA SIGNIFIE QU'IL RESTE EN RETARD
                                $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();

                                if ($checkJourRetard) {
                                    $this->IncrementerJourRetard($dataGetCreditCDF->NumDossier, $dateSystem, $dataGetCreditCDF->NumCompteEpargne, $dataGetCreditCDF->NumCompteCredit);
                                }
                                //SI LE SOLDE DU MEMBRE EST INFERIEUR OU EGAL AU MONTANT DE CAPITAL EN REMBOURSER
                                // if ($soldeMembre > 0 and ($soldeMembre <= $checkRaw->CapitalPaye or  $soldeMembre < $dataGetCreditCDF->CapAmmorti)) {
                                if (($soldeMembre + $checkRaw->CapitalPaye + $checkRaw->InteretPaye) <= $dataGetCreditCDF->CapAmmorti + $dataGetCreditCDF->Interet) {

                                    //CECI SIGNIFIE QU'IL VA RESTER EN RETARD
                                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();

                                    if ($checkJourRetard) {

                                        $this->IncrementerJourRetard($dataGetCreditCDF->NumDossier, $dateSystem, $dataGetCreditCDF->NumCompteEpargne, $dataGetCreditCDF->NumCompteCredit);
                                    }

                                    $montantApayer = $dataGetCreditCDF->CapAmmorti - $checkRaw->CapitalPaye;
                                    $montantApayerInteret = $dataGetCreditCDF->Interet - $checkRaw->InteretPaye;
                                    if ($soldeMembre >= $dataGetCreditCDF->CapAmmorti - $checkRaw->CapitalPaye) {

                                        $this->RemboursementCreditQueryCapitalUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->CapAmmorti,
                                            $checkRaw->CapitalPaye + $montantApayer,
                                            $dataGetCreditCDF->numAdherant
                                        );

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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer,
                                            "Debitusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer,
                                            "Creditusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);

                                        //CREDITE SON COMPTE CREDIT

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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer,
                                            "Creditusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);
                                    }
                                    //SI LE SOLDE EST INFERIEUR AU CAPITAL QUI EST EN RETARD 
                                    if ($soldeMembre > 0 and $soldeMembre < $montantApayer) {

                                        $this->RemboursementCreditQueryCapitalUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->CapAmmorti,
                                            $checkRaw->CapitalPaye + $soldeMembre,
                                            $dataGetCreditCDF->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;

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
                                            "Debit" =>  $soldeMembre,
                                            "Debitfc" =>  $soldeMembre,
                                            "Debitusd" =>  $soldeMembre / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
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
                                            "Credit" =>  $soldeMembre,
                                            "Creditfc" =>  $soldeMembre,
                                            "Creditusd" =>  $soldeMembre / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);


                                        //CREDITE SON COMPTE CREDIT

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
                                            "Credit" =>  $soldeMembre,
                                            "Creditfc" =>  $soldeMembre,
                                            "Creditusd" =>  $soldeMembre / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);
                                        $paidAmount = $soldeMembre;
                                        //INTERET 
                                        //RECUPERE D'ABORD L'INTERET RESTANT 
                                        $soldeMembreCDF = Transactions::select(
                                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                                        )->where("NumCompte", '=', $dataGetCreditCDF->NumCompteEpargne)
                                            ->groupBy("NumCompte")
                                            ->first();
                                        $soldeMembre = $soldeMembreCDF->soldeMembreCDF;
                                        if ($soldeMembre > $dataGetCreditCDF->Interet - $checkRaw->InteretPaye) {
                                            $this->RemboursementCreditQueryInteretUpdate(
                                                $dataGetCreditCDF->ReferenceEch,
                                                $dataGetCreditCDF->NumCompteEpargne,
                                                $dataGetCreditCDF->NumCompteCredit,
                                                $dataGetCreditCDF->NumDossier,
                                                $dataGetCreditCDF->RefTypeCredit,
                                                $dataGetCreditCDF->NomCompte,
                                                $dataGetCreditCDF->DateTranch,
                                                $dataGetCreditCDF->Interet,
                                                $montantApayerInteret + $checkRaw->InteretPaye,
                                                $dataGetCreditCDF->numAdherant
                                            );
                                            //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                            CompteurTransaction::create([
                                                'fakevalue' => "0000",
                                            ]);
                                            $numOperation = [];
                                            $numOperation = CompteurTransaction::latest()->first();
                                            $NumTransaction = "AT00" . $numOperation->id;
                                            //DEBITE LE COMPTE DU CLIENT POUR L'INTERET 

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
                                                "NumComptecp" => $dataGetCreditCDF->CompteInteret,
                                                "Debit" =>  $montantApayerInteret,
                                                "Debitfc" =>  $montantApayerInteret,
                                                "Debitusd" =>  $montantApayerInteret / $tauxDuJour,
                                                "NomUtilisateur" => "AUTO",
                                                "Libelle" => " Remboursement complement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier . "intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                                "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                            ]);
                                            //CREDITE LE COMPTE INTERET 
                                            Transactions::create([
                                                "NumTransaction" => $NumTransaction,
                                                "DateTransaction" => $dateSystem,
                                                "DateSaisie" => $dateSystem,
                                                "TypeTransaction" => "C",
                                                "CodeMonnaie" => 2,
                                                "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                                "NumDossier" => "DOS00" . $numOperation->id,
                                                "NumDemande" => "V00" . $numOperation->id,
                                                "NumCompte" => $dataGetCreditCDF->CompteInteret,
                                                "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                                "Credit" =>  $montantApayerInteret,
                                                "Creditfc" =>  $montantApayerInteret,
                                                "Creditusd" =>  $montantApayerInteret / $tauxDuJour,
                                                "NomUtilisateur" => "AUTO",
                                                "Libelle" => "Remboursement complement intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                                "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                            ]);
                                        }

                                        $this->RepriseSurProvision(
                                            $dataGetCreditCDF->CodeAgence,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $codeMonnaie,
                                            $dataGetCreditCDF->NumDossier,
                                            $dateSystem,
                                            $tauxDuJour,
                                            $dataGetCreditCDF->numAdherant,
                                            $paidAmount,
                                            $checkRaw->CapitalPaye
                                        );
                                    }
                                }
                                //SI LE SOLDE EST SUPERIEUR AU CAPITAL QUE LE CLIENT DOIT PAYER
                                if (($soldeMembre + $checkRaw->CapitalPaye + $checkRaw->InteretPaye) > $dataGetCreditCDF->CapAmmorti + $dataGetCreditCDF->Interet) {

                                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();
                                    $montantApayer = $dataGetCreditCDF->CapAmmorti - $checkRaw->CapitalPaye;
                                    $montantApayerIntert = $dataGetCreditCDF->Interet - $checkRaw->InteretPaye;

                                    if ($soldeMembre >= $dataGetCreditCDF->CapAmmorti - $checkRaw->CapitalPaye) {
                                        $this->RemboursementCreditQueryCapitalUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->CapAmmorti,
                                            $checkRaw->CapitalPaye + $montantApayer,
                                            $dataGetCreditCDF->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer,
                                            "Debitusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => $checkRaw->CapitalPaye + $montantApayer == $dataGetCreditCDF->CapAmmorti ? " Remboursement complement" . " capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier : " Remboursement complement" . "capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer,
                                            "Creditusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => $checkRaw->CapitalPaye + $montantApayer == $dataGetCreditCDF->CapAmmorti ? " Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier : " Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);

                                        //CREDITE SON COMPTE CREDIT

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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer,
                                            "Creditusd" =>  $montantApayer / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => $checkRaw->CapitalPaye + $montantApayer == $dataGetCreditCDF->CapAmmorti ? " Remboursement complement" . " capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier : " Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);

                                        $this->RepriseSurProvision(
                                            $dataGetCreditCDF->CodeAgence,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $codeMonnaie,
                                            $dataGetCreditCDF->NumDossier,
                                            $dateSystem,
                                            $tauxDuJour,
                                            $dataGetCreditCDF->numAdherant,
                                            $montantApayer,
                                            $checkRaw->CapitalPaye
                                        );
                                    }
                                    //INTERET 
                                    if ($soldeMembre >= $dataGetCreditCDF->Interet - $checkRaw->InteretPaye) {
                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditCDF->ReferenceEch,
                                            $dataGetCreditCDF->NumCompteEpargne,
                                            $dataGetCreditCDF->NumCompteCredit,
                                            $dataGetCreditCDF->NumDossier,
                                            $dataGetCreditCDF->RefTypeCredit,
                                            $dataGetCreditCDF->NomCompte,
                                            $dataGetCreditCDF->DateTranch,
                                            $dataGetCreditCDF->Interet,
                                            $montantApayerIntert + $checkRaw->InteretPaye,
                                            $dataGetCreditCDF->numAdherant
                                        );
                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //DEBITE LE COMPTE DU CLIENT POUR L'INTERET 
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
                                            "NumComptecp" => $dataGetCreditCDF->CompteInteret,
                                            "Debit" =>   $montantApayerIntert,
                                            "Debitfc" =>  $montantApayerIntert,
                                            "Debitusd" =>   $montantApayerIntert / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => $checkRaw->InteretPaye +  $montantApayerIntert == $dataGetCreditCDF->Interet ? "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier : " Remboursement complement" . "intérêt de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET 
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 2,
                                            "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditCDF->CompteInteret,
                                            "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                            "Credit" =>   $montantApayerIntert,
                                            "Creditfc" =>   $montantApayerIntert,
                                            "Creditusd" =>   $montantApayerIntert / $tauxDuJour,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => $checkRaw->InteretPaye +  $montantApayerIntert == $dataGetCreditCDF->Interet ? "Remboursement intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier : " Remboursement complement" . "intérêt du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                            "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                        ]);
                                    }
                                    //REPRISE SUR P
                                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();
                                    $this->ClotureTranche($dataGetCreditCDF->ReferenceEch, $dataGetCreditCDF->NumDossier);
                                    $this->RepriseSurProvision(
                                        $dataGetCreditCDF->CodeAgence,
                                        $dataGetCreditCDF->NumCompteCredit,
                                        $codeMonnaie,
                                        $dataGetCreditCDF->NumDossier,
                                        $dateSystem,
                                        $tauxDuJour,
                                        $dataGetCreditCDF->numAdherant,
                                        $checkJourRetard->montantImpute,
                                        $checkRaw->CapitalPaye
                                    );
                                }

                                // }
                                //SI LE SOLDE EST SUPERIEUR AU CAPITAL AMORTI 
                                // if ($soldeMembre > $dataGetCreditCDF->CapAmmorti) {
                                //     $montantApayer = $dataGetCreditCDF->CapAmmorti - $checkRaw->CapitalPaye;
                                //     $montantTotal = $montantApayer + $checkRaw->CapitalPaye;
                                //     $this->RemboursementCreditQueryInteretUpdate(
                                //         $dataGetCreditCDF->ReferenceEch,
                                //         $dataGetCreditCDF->NumCompteEpargne,
                                //         $dataGetCreditCDF->NumCompteCredit,
                                //         $dataGetCreditCDF->NumDossier,
                                //         $dataGetCreditCDF->RefTypeCredit,
                                //         $dataGetCreditCDF->NomCompte,
                                //         $dataGetCreditCDF->DateTranch,
                                //         $dataGetCreditCDF->Interet,
                                //         $montantTotal,
                                //         $dataGetCreditCDF->numAdherant
                                //     );


                                //     //DEBITE LE COMPTE DU CLIENT 
                                //     Transactions::create([
                                //         "NumTransaction" => $NumTransaction,
                                //         "DateTransaction" => $dateSystem,
                                //         "DateSaisie" => $dateSystem,
                                //         "TypeTransaction" => "D",
                                //         "CodeMonnaie" => 2,
                                //         "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                //         "NumDossier" => "DOS00" . $numOperation->id,
                                //         "NumDemande" => "V00" . $numOperation->id,
                                //         "NumCompte" => $dataGetCreditCDF->NumCompteEpargne,
                                //         "NumComptecp" => $compteCreditAuxMembreCDF,
                                //         "Debit" =>  $montantTotal,
                                //         "Debitfc" =>  $montantTotal,
                                //         "Debitusd" =>  $montantTotal / $tauxDuJour,
                                //         "NomUtilisateur" => "AUTO",
                                //         "Libelle" => "Remboursement complement capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                //         "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                //     ]);


                                //     //CREDITE LE COMPTE CREDIT COMPTABLE 
                                //     Transactions::create([
                                //         "NumTransaction" => $NumTransaction,
                                //         "DateTransaction" => $dateSystem,
                                //         "DateSaisie" => $dateSystem,
                                //         "TypeTransaction" => "C",
                                //         "CodeMonnaie" => 2,
                                //         "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                //         "NumDossier" => "DOS00" . $numOperation->id,
                                //         "NumDemande" => "V00" . $numOperation->id,
                                //         "NumCompte" => $compteCreditAuxMembreCDF,
                                //         "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                //         "Credit" =>  $montantTotal,
                                //         "Creditfc" =>  $montantTotal,
                                //         "Creditusd" =>  $montantTotal / $tauxDuJour,
                                //         "NomUtilisateur" => "AUTO",
                                //         "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                //         "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                //     ]);

                                //     //CREDITE SON COMPTE CREDIT

                                //     Transactions::create([
                                //         "NumTransaction" => $NumTransaction,
                                //         "DateTransaction" => $dateSystem,
                                //         "DateSaisie" => $dateSystem,
                                //         "TypeTransaction" => "C",
                                //         "CodeMonnaie" => 2,
                                //         "CodeAgence" => $dataGetCreditCDF->CodeAgence,
                                //         "NumDossier" => "DOS00" . $numOperation->id,
                                //         "NumDemande" => "V00" . $numOperation->id,
                                //         "NumCompte" => $dataGetCreditCDF->NumCompteCredit,
                                //         "NumComptecp" => $dataGetCreditCDF->NumCompteEpargne,
                                //         "Credit" =>  $montantTotal,
                                //         "Creditfc" =>  $montantTotal,
                                //         "Creditusd" =>  $montantTotal / $tauxDuJour,
                                //         "NomUtilisateur" => "AUTO",
                                //         "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                //         "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                //     ]);
                                // }
                            }

                            //PERMET DE CLOTURER LA TRANCHE SI TOUT EST CORRECT 
                            if ($dataGetCreditCDF->CapAmmorti == $checkRaw->CapitalPaye and $dataGetCreditCDF->Interet == $checkRaw->InteretPaye) {
                                $this->ClotureTranche($dataGetCreditCDF->ReferenceEch, $dataGetCreditCDF->NumDossier);
                            }
                        } else {
                            //SINON ON FAIT CONSTATE ICI LE RETARD POUR LE PREMIER JOUR 

                            //ON CREE TOUT DE SUITE SON COMPTE 38 POUR LA PROVISION DE CREDIT EN RETARD

                            if ($dataGetCreditCDF->numAdherant < 10) {
                                $compteProvisionCDF = "380100000" . $dataGetCreditCDF->numAdherant . "202";
                                $compteCreanceLitigieuseCDF = "390100000" . $dataGetCreditCDF->numAdherant . "202";
                            } else if ($dataGetCreditCDF->numAdherant >= 10 && $dataGetCreditCDF->numAdherant < 100) {
                                $compteProvisionCDF = "38010000" . $dataGetCreditCDF->numAdherant . "202";
                                $compteCreanceLitigieuseCDF = "39010000" . $dataGetCreditCDF->numAdherant . "202";
                            } else if ($dataGetCreditCDF->NumAdherant >= 100 && $dataGetCreditCDF->numAdherant < 1000) {
                                $compteProvisionCDF = "3801000" . $dataGetCreditCDF->numAdherant . "202";
                                $compteCreanceLitigieuseCDF = "3901000" . $dataGetCreditCDF->numAdherant . "202";
                            } else if ($dataGetCreditCDF->NumAdherant >= 1000 && $dataGetCreditCDF->numAdherant < 10000) {
                                $compteProvisionCDF = "3801000" . $dataGetCreditCDF->numAdherant . "202";
                                $compteCreanceLitigieuseCDF = "390100" . $dataGetCreditCDF->numAdherant . "202";
                            }

                            $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditCDF->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();
                            if (!$checkJourRetard) {
                                JourRetard::create([
                                    "NumcompteEpargne" => $dataGetCreditCDF->NumCompteEpargne,
                                    "NumcompteCredit" => $dataGetCreditCDF->NumCompteCredit,
                                    "NumCompteCreanceLitigieuse" => $compteCreanceLitigieuseCDF,
                                    "CompteProvision" => $compteProvisionCDF,
                                    "NumDossier" => $dataGetCreditCDF->NumDossier,
                                    "NbrJrRetard" => 1,
                                    "DateRetard" => $dateSystem,


                                ]);
                                //PASSE LES ECRITURES DE PROVISION ET DE RECLASSEMENT
                                // $this->Reclassement(
                                //     $dataGetCreditCDF->CodeAgence,
                                //     $dataGetCreditCDF->NumCompteCredit,
                                //     $codeMonnaie,
                                //     $dataGetCreditCDF->NumDossier,
                                //     $dateSystem,
                                //     $dataGetCreditCDF->CapAmmorti,
                                //     $tauxDuJour,
                                //     $dataGetCreditCDF->numAdherant
                                // );
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
                                $capitalApayer = $soldeMembre;
                                //PERMET DE RECLASSER LE CREDIT 

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

                                //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                CompteurTransaction::create([
                                    'fakevalue' => "0000",
                                ]);
                                $numOperation = [];
                                $numOperation = CompteurTransaction::latest()->first();
                                $NumTransaction = "AT00" . $numOperation->id;

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
                                    "Debit" =>  $capitalApayer,
                                    "Debitfc" =>  $capitalApayer,
                                    "Debitusd" =>  $capitalApayer / $tauxDuJour,
                                    "NomUtilisateur" => "AUTO",
                                    "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
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
                                    "Credit" =>  $capitalApayer,
                                    "Creditfc" =>  $capitalApayer,
                                    "Creditusd" =>  $capitalApayer / $tauxDuJour,
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
                                    "Credit" =>  $capitalApayer,
                                    "Creditfc" =>  $capitalApayer,
                                    "Creditusd" =>  $capitalApayer / $tauxDuJour,
                                    "NomUtilisateur" => "AUTO",
                                    "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditCDF->MontantAccorde . " CDF  " . $dataGetCreditCDF->NbreJour . "e tranche tombée en date du " . $dataGetCreditCDF->DateTranch . " Numéro dossier " . $dataGetCreditCDF->NumDossier,
                                    "refCompteMembre" => $dataGetCreditCDF->numAdherant,
                                ]);
                                $this->Reclassement(
                                    $dataGetCreditCDF->CodeAgence,
                                    $dataGetCreditCDF->NumCompteCredit,
                                    $codeMonnaie,
                                    $dataGetCreditCDF->NumDossier,
                                    $dateSystem,
                                    $dataGetCreditCDF->CapAmmorti,
                                    $tauxDuJour,
                                    $dataGetCreditCDF->numAdherant,
                                    $capitalApayer
                                );
                            }
                            if ($soldeMembre == 0) {
                                $capitalApayer = 0;
                                $this->Reclassement(
                                    $dataGetCreditCDF->CodeAgence,
                                    $dataGetCreditCDF->NumCompteCredit,
                                    $codeMonnaie,
                                    $dataGetCreditCDF->NumDossier,
                                    $dateSystem,
                                    $dataGetCreditCDF->CapAmmorti,
                                    $tauxDuJour,
                                    $dataGetCreditCDF->numAdherant,
                                    $capitalApayer
                                );
                            }
                        }
                    }
                }
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
            }
        }

        //POUR LE USD 







        if (count($dataGetCreditUSD) != 0) {
            for ($i = 0; $i < sizeof($dataGetCreditUSD); $i++) {
                $response[] = $dataGetCreditUSD[$i];
            }
            //ICI LA LOGIQUE DE REMBOURSEMENT
            foreach ($response as $dataGetCreditUSD) {

                if ($dataGetCreditUSD->CodeMonnaie == "USD") {

                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    // $compteCreditAuxMembreUSD = "3210000000202";
                    $compteCreditAuxMembreUSD = "3210000000201";
                    $codeMonnaie = 1;


                    //RECUPERE LE SOLDE DU CLIENT
                    $soldeMembreUSD = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $dataGetCreditUSD->NumCompteEpargne)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeMembre = $soldeMembreUSD->soldeMembreUSD;
                    //PREMIERE VERIFICATION SI LE SOLDE DU CLIENT EST INFERIEUR AU CAP A PAYER 
                    if ($soldeMembre < $dataGetCreditUSD->CapAmmorti) {
                        //ON SELECTIONNE LQ LIGNE POUR ENFIN LA METTRE A JOUR SI ELLE EXISTAIT DEJA
                        $checkRaw = Remboursementcredit::where("remboursementcredits.NumDossie", $dataGetCreditUSD->NumDossier)->where("remboursementcredits.DateTranche", $dataGetCreditUSD->DateTranch)->where("echeanciers.statutPayement", 0)->where("echeanciers.posted", 0)->join("echeanciers", "echeanciers.ReferenceEch", "=", "remboursementcredits.RefEcheance")->first();
                        // $checkEcheancier = Echeancier::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateTranch", $dataGetCreditUSD->DateTranch)->where("statutPayement", 0)->where("posted", 0)->first();
                        if ($checkRaw) {
                            //ICI LA LOGIQUE SI IL AVAIT DEJA PAYER QUELQUE LE CAPITAL ET CA NE RESTE QUE l'INTERET
                            //première verification est ce que le montant qu'il avait remboursé est égal au montant de remboursement attendu ?
                            if ($checkRaw->CapitalPaye == $dataGetCreditUSD->CapAmmorti) {

                                //SI CETTE CONDITION EST VRAI CELA SIGNIFIE QUE CE L'INTERET QUI EST EN RETARD
                                //si l'interêt payé est 0 est que le solde est inferieur ou egale au montant à rembourser pour l'interet 
                                if ($soldeMembre <= $dataGetCreditUSD->Interet) {
                                    //SI LE SOLDE EST INFERIEUR A L'INTERET QU'ON ATTENT QUE LA PERSONNE PAYE
                                    if ($soldeMembre < $dataGetCreditUSD->Interet) {
                                        $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();

                                        if ($checkJourRetard) {
                                            $this->IncrementerJourRetard($dataGetCreditUSD->NumDossier, $dateSystem, $dataGetCreditUSD->NumCompteEpargne, $dataGetCreditUSD->NumCompteCredit);
                                        }

                                        //ON PASSE UNE ECRITURE POUR RECUPERER TOUT CE QUI EST DANS SON COMPTE POUR REMBOURSER L'INTERET
                                        $montantApayer = $soldeMembre;
                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->Interet,
                                            $montantApayer,
                                            $dataGetCreditUSD->numAdherant
                                        );
                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //APRES CECI ON PASSE L'OPERATION POUR ENREGISTRER LA TRANSACTION
                                        //DEBITE LE COMPTE DU CLIENT 
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer * $tauxDuJour,
                                            "Debitusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement partiel intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 1,
                                            "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditUSD->CompteInteret,
                                            "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer  * $tauxDuJour,
                                            "Creditusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement partiel intérêt du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                    }
                                }
                                $checkEcheancier = Echeancier::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateTranch", $dataGetCreditUSD->DateTranche)->where("statutPayement", 0)->where("posted", 0)->first();
                                if ($checkEcheancier and ($soldeMembre > $dataGetCreditUSD->Interet or $soldeMembre == $dataGetCreditUSD->Interet)) {

                                    $montantApayer = $dataGetCreditUSD->Interet;
                                    $this->RemboursementCreditQueryInteretUpdate(
                                        $dataGetCreditUSD->ReferenceEch,
                                        $dataGetCreditUSD->NumCompteEpargne,
                                        $dataGetCreditUSD->NumCompteCredit,
                                        $dataGetCreditUSD->NumDossier,
                                        $dataGetCreditUSD->RefTypeCredit,
                                        $dataGetCreditUSD->NomCompte,
                                        $dataGetCreditUSD->DateTranch,
                                        $dataGetCreditUSD->Interet,
                                        $montantApayer,
                                        $dataGetCreditUSD->numAdherant
                                    );

                                    //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                    CompteurTransaction::create([
                                        'fakevalue' => "0000",
                                    ]);
                                    $numOperation = [];
                                    $numOperation = CompteurTransaction::latest()->first();
                                    $NumTransaction = "AT00" . $numOperation->id;
                                    //DEBITE LE COMPTE DU CLIENT 
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
                                        "Debit" =>  $montantApayer,
                                        "Debitfc" =>  $montantApayer * $tauxDuJour,
                                        "Debitusd" =>  $montantApayer,
                                        "NomUtilisateur" => "AUTO",
                                        "Libelle" => "Remboursement intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                    ]);


                                    //CREDITE LE COMPTE INTERET
                                    Transactions::create([
                                        "NumTransaction" => $NumTransaction,
                                        "DateTransaction" => $dateSystem,
                                        "DateSaisie" => $dateSystem,
                                        "TypeTransaction" => "C",
                                        "CodeMonnaie" => 1,
                                        "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                        "NumDossier" => "DOS00" . $numOperation->id,
                                        "NumDemande" => "V00" . $numOperation->id,
                                        "NumCompte" => $dataGetCreditUSD->CompteInteret,
                                        "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                        "Credit" =>  $montantApayer,
                                        "Creditfc" =>  $montantApayer * $tauxDuJour,
                                        "Creditusd" =>  $montantApayer,
                                        "NomUtilisateur" => "AUTO",
                                        "Libelle" => "Remboursement intérêt du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                        "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                    ]);
                                    //PERMET DE CONSTATER LE REMBOURSEMENT ET CLOTURER CETTE TRANCHE
                                    // $this->ClotureTranche($dataGetCreditUSD->ReferenceEch, $dataGetCreditUSD->NumDossier);
                                    // $this->RepriseSurProvision(
                                    //     $NumTransaction,
                                    //     $dataGetCreditUSD->CodeAgence,
                                    //     $dataGetCreditUSD->NumCompteCredit,
                                    //     $codeMonnaie,
                                    //     $dataGetCreditUSD->NumDossier,
                                    //     $dateSystem,
                                    //     $tauxDuJour,
                                    //     $dataGetCreditUSD->numAdherant
                                    // );
                                }
                                //SI IL AVAIT DEJA PAYE QUELQUE CHOSE EN INTERET MAIS CA N'A PAS ETE COMPLET 
                                if ($checkRaw->InteretPaye > 0) {
                                    $montantApayer = $dataGetCreditUSD->Interet - $checkRaw->InteretPaye;
                                    if ($soldeMembre < $montantApayer) {
                                        $montantTotalInteret = $soldeMembre;

                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->Interet,
                                            $checkRaw->InteretPaye + $montantTotalInteret,
                                            $dataGetCreditUSD->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //DEBITE LE COMPTE DU CLIENT 
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer * $tauxDuJour,
                                            "Debitusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 1,
                                            "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditUSD->CompteInteret,
                                            "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                            "Credit" =>  $montantTotalInteret,
                                            "Creditfc" =>  $montantTotalInteret * $tauxDuJour,
                                            "Creditusd" =>  $montantTotalInteret,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);

                                        if ($checkJourRetard) {
                                            $this->IncrementerJourRetard($dataGetCreditUSD->NumDossier, $dateSystem, $dataGetCreditUSD->NumCompteEpargne, $dataGetCreditUSD->NumCompteCredit);
                                        }
                                    }
                                    if ($soldeMembre >= $montantApayer) {
                                        $montantTotalInteret = $dataGetCreditUSD->Interet - $checkRaw->InteretPaye;
                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->Interet,
                                            $montantTotalInteret + $checkRaw->InteretPaye,
                                            $dataGetCreditUSD->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //DEBITE LE COMPTE DU CLIENT 
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
                                            "Debit" =>  $montantTotalInteret,
                                            "Debitfc" =>  $montantTotalInteret * $tauxDuJour,
                                            "Debitusd" =>  $montantTotalInteret,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);


                                        //CREDITE LE COMPTE INTERET
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 1,
                                            "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditUSD->CompteInteret,
                                            "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                            "Credit" =>  $montantTotalInteret,
                                            "Creditfc" =>  $montantTotalInteret * $tauxDuJour,
                                            "Creditusd" =>  $montantTotalInteret,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement intérêt du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                        //CONSTATE ICI LE REMBOURSEMENT ET CLOTURE LA TRANCHE
                                        // $this->ClotureTranche($dataGetCreditUSD->ReferenceEch, $dataGetCreditUSD->NumDossier);
                                        // $this->RepriseSurProvision(
                                        //     $NumTransaction,
                                        //     $dataGetCreditUSD->CodeAgence,
                                        //     $dataGetCreditUSD->NumCompteCredit,
                                        //     $codeMonnaie,
                                        //     $dataGetCreditUSD->NumDossier,
                                        //     $dateSystem,
                                        //     $tauxDuJour,
                                        //     $dataGetCreditUSD->numAdherant
                                        // );
                                    }
                                }
                            }
                            //SI IL A PAYE QUELQUE CHOSE EN CAPITAL MAIS QUE CA PAS ETE COMPLET
                            if ($checkRaw->CapitalPaye < $dataGetCreditUSD->CapAmmorti) {
                                //SI LE SOLDE DU MEMBRE EST INFERIEUR  AU MONTANT DE CAPITAL EN REMBOURSER CA SIGNIFIE QU'IL RESTE EN RETARD
                                $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();

                                if ($checkJourRetard) {
                                    $this->IncrementerJourRetard($dataGetCreditUSD->NumDossier, $dateSystem, $dataGetCreditUSD->NumCompteEpargne, $dataGetCreditUSD->NumCompteCredit);
                                }
                                //SI LE SOLDE DU MEMBRE EST INFERIEUR OU EGAL AU MONTANT DE CAPITAL EN REMBOURSER
                                // if ($soldeMembre > 0 and ($soldeMembre <= $checkRaw->CapitalPaye or  $soldeMembre < $dataGetCreditUSD->CapAmmorti)) {
                                if (($soldeMembre + $checkRaw->CapitalPaye + $checkRaw->InteretPaye) <= $dataGetCreditUSD->CapAmmorti + $dataGetCreditUSD->Interet) {
                                    //CECI SIGNIFIE QU'IL VA RESTER EN RETARD
                                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();

                                    if ($checkJourRetard) {

                                        $this->IncrementerJourRetard($dataGetCreditUSD->NumDossier, $dateSystem, $dataGetCreditUSD->NumCompteEpargne, $dataGetCreditUSD->NumCompteCredit);
                                    }

                                    $montantApayer = $dataGetCreditUSD->CapAmmorti - $checkRaw->CapitalPaye;
                                    $montantApayerInteret = $dataGetCreditUSD->Interet - $checkRaw->InteretPaye;
                                    if ($soldeMembre >= $dataGetCreditUSD->CapAmmorti - $checkRaw->CapitalPaye) {
                                        $this->RemboursementCreditQueryCapitalUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->CapAmmorti,
                                            $checkRaw->CapitalPaye + $montantApayer,
                                            $dataGetCreditUSD->numAdherant
                                        );
                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;

                                        //DEBITE LE COMPTE DU CLIENT 
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer * $tauxDuJour,
                                            "Debitusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => " Remboursement complement" . "capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer * $tauxDuJour,
                                            "Creditusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => " Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);

                                        //CREDITE SON COMPTE CREDIT

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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer * $tauxDuJour,
                                            "Creditusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                    }


                                    //INTERET 
                                    if ($soldeMembre > $dataGetCreditUSD->Interet - $checkRaw->InteretPaye) {
                                        $this->RemboursementCreditQueryInteretUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->Interet,
                                            $montantApayerInteret + $checkRaw->InteretPaye,
                                            $dataGetCreditUSD->numAdherant
                                        );
                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //DEBITE LE COMPTE DU CLIENT POUR L'INTERET 
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
                                            "NumComptecp" => $dataGetCreditUSD->CompteInteret,
                                            "Debit" =>  $montantApayerInteret,
                                            "Debitfc" =>  $montantApayerInteret * $tauxDuJour,
                                            "Debitusd" =>  $montantApayerInteret,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => " Remboursement complement" . "intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                        //CREDITE LE COMPTE INTERET 
                                        Transactions::create([
                                            "NumTransaction" => $NumTransaction,
                                            "DateTransaction" => $dateSystem,
                                            "DateSaisie" => $dateSystem,
                                            "TypeTransaction" => "C",
                                            "CodeMonnaie" => 1,
                                            "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                            "NumDossier" => "DOS00" . $numOperation->id,
                                            "NumDemande" => "V00" . $numOperation->id,
                                            "NumCompte" => $dataGetCreditUSD->CompteInteret,
                                            "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                            "Credit" =>  $montantApayerInteret,
                                            "Creditfc" =>  $montantApayerInteret * $tauxDuJour,
                                            "Creditusd" =>  $montantApayerInteret,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => " Remboursement complement" . "intérêt du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                    }
                                    $this->RepriseSurProvision(
                                        $dataGetCreditUSD->CodeAgence,
                                        $dataGetCreditUSD->NumCompteCredit,
                                        $codeMonnaie,
                                        $dataGetCreditUSD->NumDossier,
                                        $dateSystem,
                                        $tauxDuJour,
                                        $dataGetCreditUSD->numAdherant,
                                        $montantApayer,
                                        $checkRaw->CapitalPaye
                                    );
                                }
                                //SI LE SOLDE EST SUPERIEUR AU CAPITAL QUE LE CLIENT DOIT PAYER
                                if (($soldeMembre + $checkRaw->CapitalPaye + $checkRaw->InteretPaye) > $dataGetCreditUSD->CapAmmorti + $dataGetCreditUSD->Interet) {

                                    $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();
                                    $montantApayer = $dataGetCreditUSD->CapAmmorti - $checkRaw->CapitalPaye;
                                    $montantApayerIntert = $dataGetCreditUSD->Interet - $checkRaw->InteretPaye;
                                    if ($soldeMembre >= $dataGetCreditUSD->CapAmmorti - $checkRaw->CapitalPaye) {

                                        $this->RemboursementCreditQueryCapitalUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->CapAmmorti,
                                            $checkRaw->CapitalPaye + $montantApayer,
                                            $dataGetCreditUSD->numAdherant
                                        );

                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //DEBITE LE COMPTE DU CLIENT 
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
                                            "Debit" =>  $montantApayer,
                                            "Debitfc" =>  $montantApayer * $tauxDuJour,
                                            "Debitusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer * $tauxDuJour,
                                            "Creditusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);

                                        //CREDITE SON COMPTE CREDIT

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
                                            "Credit" =>  $montantApayer,
                                            "Creditfc" =>  $montantApayer * $tauxDuJour,
                                            "Creditusd" =>  $montantApayer,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement" . "capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                    }
                                    //SI LE SOLDE EST INFERIEUR AU CAPITAL QUI EST EN RETARD 
                                    if ($soldeMembre > 0 and $soldeMembre < $montantApayer) {

                                        $this->RemboursementCreditQueryCapitalUpdate(
                                            $dataGetCreditUSD->ReferenceEch,
                                            $dataGetCreditUSD->NumCompteEpargne,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $dataGetCreditUSD->NumDossier,
                                            $dataGetCreditUSD->RefTypeCredit,
                                            $dataGetCreditUSD->NomCompte,
                                            $dataGetCreditUSD->DateTranch,
                                            $dataGetCreditUSD->CapAmmorti,
                                            $checkRaw->CapitalPaye + $soldeMembre,
                                            $dataGetCreditUSD->numAdherant
                                        );
                                        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                        CompteurTransaction::create([
                                            'fakevalue' => "0000",
                                        ]);
                                        $numOperation = [];
                                        $numOperation = CompteurTransaction::latest()->first();
                                        $NumTransaction = "AT00" . $numOperation->id;
                                        //DEBITE LE COMPTE DU CLIENT 
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
                                            "Debit" =>  $soldeMembre,
                                            "Debitfc" =>  $soldeMembre * $tauxDuJour,
                                            "Debitusd" =>  $soldeMembre,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
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
                                            "Credit" =>  $soldeMembre,
                                            "Creditfc" =>  $soldeMembre * $tauxDuJour,
                                            "Creditusd" =>  $soldeMembre,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);

                                        //CREDITE SON COMPTE CREDIT

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
                                            "Credit" =>  $soldeMembre,
                                            "Creditfc" =>  $soldeMembre * $tauxDuJour,
                                            "Creditusd" =>  $soldeMembre,
                                            "NomUtilisateur" => "AUTO",
                                            "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                            "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                        ]);
                                        $paidAmount = $soldeMembre;
                                        //INTERET 
                                        //RECUPERE D'ABORD L'INTERET RESTANT 
                                        $soldeMembreUSD = Transactions::select(
                                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                                        )->where("NumCompte", '=', $dataGetCreditUSD->NumCompteEpargne)
                                            ->groupBy("NumCompte")
                                            ->first();
                                        $soldeMembre = $soldeMembreUSD->soldeMembreUSD;
                                        if ($soldeMembre > $dataGetCreditUSD->Interet - $checkRaw->InteretPaye) {
                                            $this->RemboursementCreditQueryInteretUpdate(
                                                $dataGetCreditUSD->ReferenceEch,
                                                $dataGetCreditUSD->NumCompteEpargne,
                                                $dataGetCreditUSD->NumCompteCredit,
                                                $dataGetCreditUSD->NumDossier,
                                                $dataGetCreditUSD->RefTypeCredit,
                                                $dataGetCreditUSD->NomCompte,
                                                $dataGetCreditUSD->DateTranch,
                                                $dataGetCreditUSD->Interet,
                                                $montantApayerInteret + $checkRaw->InteretPaye,
                                                $dataGetCreditUSD->numAdherant
                                            );
                                            //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
                                            CompteurTransaction::create([
                                                'fakevalue' => "0000",
                                            ]);
                                            $numOperation = [];
                                            $numOperation = CompteurTransaction::latest()->first();
                                            $NumTransaction = "AT00" . $numOperation->id;
                                            //DEBITE LE COMPTE DU CLIENT POUR L'INTERET 

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
                                                "NumComptecp" => $dataGetCreditUSD->CompteInteret,
                                                "Debit" =>  $montantApayerInteret,
                                                "Debitfc" =>  $montantApayerInteret * $tauxDuJour,
                                                "Debitusd" =>  $montantApayerInteret,
                                                "NomUtilisateur" => "AUTO",
                                                "Libelle" => " Remboursement complement intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier . "intérêt de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                                "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                            ]);
                                            //CREDITE LE COMPTE INTERET 
                                            Transactions::create([
                                                "NumTransaction" => $NumTransaction,
                                                "DateTransaction" => $dateSystem,
                                                "DateSaisie" => $dateSystem,
                                                "TypeTransaction" => "C",
                                                "CodeMonnaie" => 1,
                                                "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                                "NumDossier" => "DOS00" . $numOperation->id,
                                                "NumDemande" => "V00" . $numOperation->id,
                                                "NumCompte" => $dataGetCreditUSD->CompteInteret,
                                                "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                                "Credit" =>  $montantApayerInteret,
                                                "Creditfc" =>  $montantApayerInteret * $tauxDuJour,
                                                "Creditusd" =>  $montantApayerInteret,
                                                "NomUtilisateur" => "AUTO",
                                                "Libelle" => "Remboursement complement intérêt du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                                "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                            ]);
                                        }
                                        $this->ClotureTranche($dataGetCreditUSD->ReferenceEch, $dataGetCreditUSD->NumDossier);
                                        $this->RepriseSurProvision(
                                            $dataGetCreditUSD->CodeAgence,
                                            $dataGetCreditUSD->NumCompteCredit,
                                            $codeMonnaie,
                                            $dataGetCreditUSD->NumDossier,
                                            $dateSystem,
                                            $tauxDuJour,
                                            $dataGetCreditUSD->numAdherant,
                                            $paidAmount,
                                            $checkRaw->CapitalPaye
                                        );
                                    }
                                    //REPRISE SUR P  
                                }
                                // }
                                //SI LE SOLDE EST SUPERIEUR AU CAPITAL AMORTI 
                                // if ($soldeMembre > $dataGetCreditUSD->CapAmmorti) {
                                //     $montantApayer = $dataGetCreditUSD->CapAmmorti - $checkRaw->CapitalPaye;
                                //     $montantTotal = $montantApayer + $checkRaw->CapitalPaye;
                                //     $this->RemboursementCreditQueryInteretUpdate(
                                //         $dataGetCreditUSD->ReferenceEch,
                                //         $dataGetCreditUSD->NumCompteEpargne,
                                //         $dataGetCreditUSD->NumCompteCredit,
                                //         $dataGetCreditUSD->NumDossier,
                                //         $dataGetCreditUSD->RefTypeCredit,
                                //         $dataGetCreditUSD->NomCompte,
                                //         $dataGetCreditUSD->DateTranch,
                                //         $dataGetCreditUSD->Interet,
                                //         $montantTotal,
                                //         $dataGetCreditUSD->numAdherant
                                //     );


                                //     //DEBITE LE COMPTE DU CLIENT 
                                //     Transactions::create([
                                //         "NumTransaction" => $NumTransaction,
                                //         "DateTransaction" => $dateSystem,
                                //         "DateSaisie" => $dateSystem,
                                //         "TypeTransaction" => "D",
                                //         "CodeMonnaie" => 1,
                                //         "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                //         "NumDossier" => "DOS00" . $numOperation->id,
                                //         "NumDemande" => "V00" . $numOperation->id,
                                //         "NumCompte" => $dataGetCreditUSD->NumCompteEpargne,
                                //         "NumComptecp" => $compteCreditAuxMembreUSD,
                                //         "Debit" =>  $montantTotal,
                                //         "Debitfc" =>  $montantTotal * $tauxDuJour,
                                //         "Debitusd" =>  $montantTotal,
                                //         "NomUtilisateur" => "AUTO",
                                //         "Libelle" => "Remboursement complement capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                //         "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                //     ]);


                                //     //CREDITE LE COMPTE CREDIT COMPTABLE 
                                //     Transactions::create([
                                //         "NumTransaction" => $NumTransaction,
                                //         "DateTransaction" => $dateSystem,
                                //         "DateSaisie" => $dateSystem,
                                //         "TypeTransaction" => "C",
                                //         "CodeMonnaie" => 1,
                                //         "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                //         "NumDossier" => "DOS00" . $numOperation->id,
                                //         "NumDemande" => "V00" . $numOperation->id,
                                //         "NumCompte" => $compteCreditAuxMembreUSD,
                                //         "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                //         "Credit" =>  $montantTotal,
                                //         "Creditfc" =>  $montantTotal * $tauxDuJour,
                                //         "Creditusd" =>  $montantTotal,
                                //         "NomUtilisateur" => "AUTO",
                                //         "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                //         "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                //     ]);

                                //     //CREDITE SON COMPTE CREDIT

                                //     Transactions::create([
                                //         "NumTransaction" => $NumTransaction,
                                //         "DateTransaction" => $dateSystem,
                                //         "DateSaisie" => $dateSystem,
                                //         "TypeTransaction" => "C",
                                //         "CodeMonnaie" => 1,
                                //         "CodeAgence" => $dataGetCreditUSD->CodeAgence,
                                //         "NumDossier" => "DOS00" . $numOperation->id,
                                //         "NumDemande" => "V00" . $numOperation->id,
                                //         "NumCompte" => $dataGetCreditUSD->NumCompteCredit,
                                //         "NumComptecp" => $dataGetCreditUSD->NumCompteEpargne,
                                //         "Credit" =>  $montantTotal,
                                //         "Creditfc" =>  $montantTotal * $tauxDuJour,
                                //         "Creditusd" =>  $montantTotal,
                                //         "NomUtilisateur" => "AUTO",
                                //         "Libelle" => "Remboursement complement capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                //         "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                //     ]);
                                // }
                            }


                            //PERMET DE CLOTURER LA TRANCHE SI TOUT EST CORRECT 
                            if ($dataGetCreditUSD->CapAmmorti == $checkRaw->CapitalPaye and $dataGetCreditUSD->Interet == $checkRaw->InteretPaye) {
                                $this->ClotureTranche($dataGetCreditUSD->ReferenceEch, $dataGetCreditUSD->NumDossier);
                            }
                        } else {
                            //SINON ON FAIT CONSTATE ICI LE RETARD POUR LE PREMIER JOUR 

                            //ON CREE TOUT DE SUITE SON COMPTE 38 POUR LA PROVISION DE CREDIT EN RETARD
                            if ($dataGetCreditUSD->numAdherant < 10) {
                                $compteProvisionUSD = "380000000" . $dataGetCreditUSD->numAdherant . "201";
                                $compteCreanceLitigieuseUSD = "390000000" . $dataGetCreditUSD->numAdherant . "201";
                            } else if ($dataGetCreditUSD->NumAdherant >= 10 && $dataGetCreditUSD->numAdherant < 100) {
                                $compteProvisionUSD = "38000000" . $dataGetCreditUSD->numAdherant . "201";
                                $compteCreanceLitigieuseUSD = "39000000" . $dataGetCreditUSD->numAdherant . "201";
                            } else if ($dataGetCreditUSD->NumAdherant >= 100 && $dataGetCreditUSD->numAdherant < 1000) {
                                $compteProvisionUSD = "3800000" . $dataGetCreditUSD->numAdherant . "201";
                                $compteCreanceLitigieuseUSD = "3900000" . $dataGetCreditUSD->numAdherant . "201";
                            } else if ($dataGetCreditUSD->NumAdherant >= 1000 && $dataGetCreditUSD->numAdherant < 10000) {
                                $compteProvisionUSD = "3800000" . $dataGetCreditUSD->numAdherant . "201";
                                $compteCreanceLitigieuseUSD = "390000" . $dataGetCreditUSD->numAdherant . "201";
                            }

                            $checkJourRetard = JourRetard::where("NumDossier", $dataGetCreditUSD->NumDossier)->where("DateRetard", "=", $dataSystem->DateSystem)->first();
                            if (!$checkJourRetard) {
                                JourRetard::create([
                                    "NumcompteEpargne" => $dataGetCreditUSD->NumCompteEpargne,
                                    "NumcompteCredit" => $dataGetCreditUSD->NumCompteCredit,
                                    "NumCompteCreanceLitigieuse" => $compteCreanceLitigieuseUSD,
                                    "CompteProvision" => $compteProvisionUSD,
                                    "NumDossier" => $dataGetCreditUSD->NumDossier,
                                    "NbrJrRetard" => 1,
                                    "DateRetard" => $dateSystem
                                ]);
                            }
                            //PASSE LES ECRITURES DE PROVISION ET DE RECLASSEMENT
                            // $this->Reclassement(
                            //     $dataGetCreditUSD->CodeAgence,
                            //     $dataGetCreditUSD->NumCompteCredit,
                            //     $codeMonnaie,
                            //     $dataGetCreditUSD->NumDossier,
                            //     $dateSystem,
                            //     $dataGetCreditUSD->CapAmmorti,
                            //     $tauxDuJour,
                            //     $dataGetCreditUSD->numAdherant
                            // );
                            //ON ENREGISTRE TOUT DE SUITE COMPTE DANS LA DATA BASE COMPTE PROVSION
                            //verifie d'abord si c comptes provision n'existe déjà pas
                            $checkCompteProvision = Comptes::where("NumCompte", $compteProvisionUSD)->first();
                            if (!$checkCompteProvision) {
                                Comptes::create([
                                    'CodeAgence' => $dataGetCreditUSD->CodeAgence,
                                    'NumCompte' => $compteProvisionUSD,
                                    'NomCompte' => $dataGetCreditUSD->NomCompte,
                                    'RefTypeCompte' => "3",
                                    'RefCadre' => "38",
                                    'RefGroupe' => "380",
                                    'RefSousGroupe' => "3800",
                                    'CodeMonnaie' => 1,
                                    'NumAdherant' => $dataGetCreditUSD->numAdherant,
                                ]);
                            }

                            //ON CREE LE COMPTE CREANCE LITIGIEUSE
                            //verifie d'abord si c comptes créance litigieuse n'existe déjà pas
                            $checkCompteCL = Comptes::where("NumCompte", $compteCreanceLitigieuseUSD)->first();
                            if (!$checkCompteCL) {
                                Comptes::create([
                                    'CodeAgence' => $dataGetCreditUSD->CodeAgence,
                                    'NumCompte' => $compteCreanceLitigieuseUSD,
                                    'NomCompte' => $dataGetCreditUSD->NomCompte,
                                    'RefTypeCompte' => "3",
                                    'RefCadre' => "39",
                                    'RefGroupe' => "390",
                                    'RefSousGroupe' => "3900",
                                    'CodeMonnaie' => 1,
                                    'NumAdherant' => $dataGetCreditUSD->numAdherant,
                                ]);
                            }

                            //ON VERIFIE ICI SI LE SOLDE DU MEMBRE CONTIENT QD MEME QUELQUE CHOSE POUR LE PRENDRE    

                            if ($soldeMembre > 0 and $soldeMembre <= $dataGetCreditUSD->CapAmmorti) {
                                //ON PREND LE CAPITAL CAR CELA SIGNIFIE QU'IL VA LUI RESTER QUELQUE CHOSE POUR L'INTERET        
                                $capitalApayer = $soldeMembre;

                                Remboursementcredit::create([
                                    "RefEcheance" => $dataGetCreditUSD->ReferenceEch,
                                    "NumCompte" => $dataGetCreditUSD->NumCompteEpargne,
                                    "NumCompteCredit" => $dataGetCreditUSD->NumCompteCredit,
                                    "NumDossie" => $dataGetCreditUSD->NumDossier,
                                    "RefTypCredit" => $dataGetCreditUSD->RefTypeCredit,
                                    "NomCompte" => $dataGetCreditUSD->NomCompte,
                                    "DateTranche" => $dataGetCreditUSD->DateTranch,
                                    "CapitalAmmortie" => $dataGetCreditUSD->CapAmmorti,
                                    "CapitalPaye"  =>  $capitalApayer,
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
                                //DEBITE LE COMPTE DU CLIENT 
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
                                    "Debit" =>  $capitalApayer,
                                    "Debitfc" =>  $capitalApayer * $tauxDuJour,
                                    "Debitusd" =>  $capitalApayer,
                                    "NomUtilisateur" => "AUTO",
                                    "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                    "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                ]);


                                //CREDITE LE CREDIT COMPTABLE 

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
                                    "Credit" =>  $capitalApayer,
                                    "Creditfc" =>  $capitalApayer * $tauxDuJour,
                                    "Creditusd" =>  $capitalApayer,
                                    "NomUtilisateur" => "AUTO",
                                    "Libelle" => "Remboursement partiel du capital du crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
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
                                    "Credit" =>  $capitalApayer,
                                    "Creditfc" =>  $capitalApayer * $tauxDuJour,
                                    "Creditusd" =>  $capitalApayer,
                                    "NomUtilisateur" => "AUTO",
                                    "Libelle" => "Remboursement partiel du capital de votre crédit pour le crédit de " . $dataGetCreditUSD->MontantAccorde . " USD  " . $dataGetCreditUSD->NbreJour . "e tranche tombée en date du " . $dataGetCreditUSD->DateTranch . " Numéro dossier " . $dataGetCreditUSD->NumDossier,
                                    "refCompteMembre" => $dataGetCreditUSD->numAdherant,
                                ]);

                                //PERMET DE RECLASSER LE CREDIT 
                                $this->Reclassement(
                                    $dataGetCreditUSD->CodeAgence,
                                    $dataGetCreditUSD->NumCompteCredit,
                                    $codeMonnaie,
                                    $dataGetCreditUSD->NumDossier,
                                    $dateSystem,
                                    $dataGetCreditUSD->CapAmmorti,
                                    $tauxDuJour,
                                    $dataGetCreditUSD->numAdherant,
                                    $capitalApayer
                                );
                            }
                            if ($soldeMembre == 0) {
                                $capitalApayer = 0;
                                $this->Reclassement(
                                    $dataGetCreditUSD->CodeAgence,
                                    $dataGetCreditUSD->NumCompteCredit,
                                    $codeMonnaie,
                                    $dataGetCreditUSD->NumDossier,
                                    $dateSystem,
                                    $dataGetCreditUSD->CapAmmorti,
                                    $tauxDuJour,
                                    $dataGetCreditUSD->numAdherant,
                                    $capitalApayer
                                );
                            }
                        }
                    }

                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                }
            }
        }
    }

    //CETTE FONCTION PERMET DE CONSTATER LE REMBOURSEMENT EN CAPITAL ET FAIT UNE INSERTION DANS LA TABLE REMBOURSEMENT
    // private function RemboursementCreditQueryCapital(
    //     $RefEcheance,
    //     $montantApayer,
    //     $NumCompte,
    //     $NumCompteCredit,
    //     $NumDossie,
    //     $RefTypCredit,
    //     $NomCompte,
    //     $DateTranche,
    //     $CapitalAmmortie,
    //     $InteretAmmorti,
    //     $CodeGuichet,
    //     $NumAdherent,
    // ) {
    //     Remboursementcredit::create([
    //         "RefEcheance" => $RefEcheance,
    //         "NumCompte" => $NumCompte,
    //         "NumCompteCredit" => $NumCompteCredit,
    //         "NumDossie" => $NumDossie,
    //         "RefTypCredit" => $RefTypCredit,
    //         "NomCompte" => $NomCompte,
    //         "DateTranche" => $DateTranche,
    //         "CapitalAmmortie" => $CapitalAmmortie,
    //         "CapitalPaye"  =>  $montantApayer,
    //         "InteretAmmorti" => $InteretAmmorti,
    //         "CodeGuichet" => $CodeGuichet,
    //         "NumAdherent" => $NumAdherent,
    //     ]);
    // }


    //CETTE FONCTION PERMET DE CONSTATER LE REMBOURSEMENT EN CAPITAL ET FAIT UNE MISE A JOUR DANS LA TABLE REMBOURSEMENT
    private function RemboursementCreditQueryCapitalUpdate(

        $RefEcheance,
        $NumCompte,
        $NumCompteCredit,
        $NumDossie,
        $RefTypCredit,
        $NomCompte,
        $DateTranche,
        $CapitalAmmortie,
        $CapitalPaye,
        $NumAdherent,
    ) {
        Remboursementcredit::where("NumDossie", $NumDossie)->where("DateTranche", $DateTranche)->update([
            "RefEcheance" => $RefEcheance,
            "NumCompte" => $NumCompte,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossie,
            "RefTypCredit" => $RefTypCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranche,
            "CapitalAmmortie" => $CapitalAmmortie,
            "CapitalPaye"  =>  $CapitalPaye,
            "NumAdherent" => $NumAdherent,
        ]);
    }

    //CETTE FONCTION PERMET DE CONSTATER LE REMBOURSEMENT EN Interet ET FAIT UNE INSERTION DANS LA TABLE REMBOURSEMENT
    // private function RemboursementCreditQueryInteret(
    //     $RefEcheance,
    //     $montantApayer,
    //     $NumCompte,
    //     $NumCompteCredit,
    //     $NumDossie,
    //     $RefTypCredit,
    //     $NomCompte,
    //     $DateTranche,
    //     $CapitalAmmortie,
    //     $InteretAmmorti,
    //     $InteretPaye,
    //     $CodeGuichet,
    //     $NumAdherent,
    // ) {
    //     Remboursementcredit::create([
    //         "RefEcheance" => $RefEcheance,
    //         "NumCompte" => $NumCompte,
    //         "NumCompteCredit" => $NumCompteCredit,
    //         "NumDossie" => $NumDossie,
    //         "RefTypCredit" => $RefTypCredit,
    //         "NomCompte" => $NomCompte,
    //         "DateTranche" => $DateTranche,
    //         "CapitalAmmortie" => $CapitalAmmortie,
    //         "InteretAmmorti" => $InteretAmmorti,
    //         "InteretPaye"  =>  $montantApayer,
    //         "CodeGuichet" => $CodeGuichet,
    //         "NumAdherent" => $NumAdherent,
    //     ]);
    // }


    //CETTE FONCTION PERMET DE CONSTATER LE REMBOURSEMENT EN INTERET ET FAIT UNE MISE A JOUR DANS LA TABLE REMBOURSEMENT
    private function RemboursementCreditQueryInteretUpdate(
        $RefEcheance,
        $NumCompte,
        $NumCompteCredit,
        $NumDossie,
        $RefTypCredit,
        $NomCompte,
        $DateTranche,
        $InteretAmmorti,
        $InteretPaye,
        $NumAdherent,
    ) {
        Remboursementcredit::where("NumDossie", $NumDossie)->where("DateTranche", $DateTranche)->update([
            "RefEcheance" => $RefEcheance,
            "NumCompte" => $NumCompte,
            "NumCompteCredit" => $NumCompteCredit,
            "NumDossie" => $NumDossie,
            "RefTypCredit" => $RefTypCredit,
            "NomCompte" => $NomCompte,
            "DateTranche" => $DateTranche,
            "InteretPaye"  =>  $InteretPaye,
            "InteretAmmorti" => $InteretAmmorti,
            "NumAdherent" => $NumAdherent,
        ]);
    }

    //CETTE FONCTION PERMET DE CONSTATER LE REMBOURSEMENT ET CLOTURER LA TRANCHE

    private function ClotureTranche($ReferenceEch)
    {
        Echeancier::where("echeanciers.ReferenceEch", "=", $ReferenceEch)
            ->update([
                "statutPayement" => "1",
                "posted" => "1",
            ]);
    }

    // public function TestFunction()
    // {
    //     $NumTransaction = "45215";
    //     $CodeAgence = "20";
    //     $compteCreditClient = "3201000007202";
    //     $devise = "2";
    //     $NumDossier = "ND0004";
    //     $dateSystem = "2024-07-06";
    //     $tauxDuJour = "2700";
    //     $refCompteMembre = "7";


    //     $this->RepriseSurProvision(
    //         $NumTransaction,
    //         $CodeAgence,
    //         $compteCreditClient,
    //         $devise,
    //         $NumDossier,
    //         $dateSystem,
    //         $tauxDuJour,
    //         $refCompteMembre
    //     );
    // }

    //CETTE FONCTION PERMET DE FAIRE LA PROVISION
    private function Reclassement(
        $CodeAgence,
        $compteCreditClient,
        $devise,
        $NumDossier,
        $dateSystem,
        $capitalApayer,
        $tauxDuJour,
        $refCompteMembre,
        $capitalPaye
    ) {
        $compteDotationAuProvisionCDF = "6901000000202";
        $compteDotationAuProvisionUSD = "6900000000201";
        $compteRepriseDeProvisionCDF = "7901000000202";
        $compteRepriseDeProvisionUSD = "7900000000201";
        $compteCreanceLitigeuseUSD = "3900000000201";
        $compteCreanceLitigeuseCDF = "3901000000202";
        $compteCreditAuxMembreCDF = "3210000000202";
        $compteCreditAuxMembreUSD = "3210000000201";
        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION

        //RECUPERE LE MONTANT LE CAPITAL DE CREDIT RESTANT 
        // $soldeRestant = Echeancier::select(
        //     DB::raw("SUM(echeanciers.CapAmmorti)-SUM(remboursementcredits.CapitalPaye) as soldeRestant"),
        //     )->leftJoin("remboursementcredits","echeanciers.NumDossier","=","remboursementcredits.NumDossie")
        //     ->where("remboursementcredits.NumDossie", '=', $NumDossier)
        //     ->groupBy("remboursementcredits.NumDossie")
        //     ->first();
        //  $SoldeCreditRestant=$soldeRestant->soldeRestant;


        // $soldeRestant = DB::select('SELECT SUM(transactions.Debitfc)-SUM(transactions.Creditfc) as soldeRestant from transactions where transactions.NumCompte="' . $compteCreditClient . '" and transactions.CodeMonnaie=2')[0];
        // $SoldeCreditRestantCDF = $soldeRestant->soldeRestant;

        // //SOLDE RESTANT USD
        // $soldeRestant = DB::select('SELECT SUM(transactions.Debitfc)-SUM(transactions.Creditfc) as soldeRestant from transactions where transactions.NumCompte="' . $compteCreditClient . '" and transactions.CodeMonnaie=1')[0];
        // $SoldeCreditRestantUSD = $soldeRestant->soldeRestant;
        $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
        $SoldeCreditRestantCDF = $soldeRestant->soldeRestant;
        //SOLDE RESTANT USD
        $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
        $SoldeCreditRestantUSD = $soldeRestant->soldeRestant;

        $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)
            ->where("NbrJrRetard", ">", 0)
            ->where("DateRetard", "=", $dateSystem)
            ->where("reclassement", 0)->first();
        $nbrJourRetard = $checknombreJrRetard;
        if ($nbrJourRetard) {
            if ($nbrJourRetard->NbrJrRetard <= 30 and $nbrJourRetard->provision1 == 0) {
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //DEBITE LE COMPTE 39 POUR RECLASSEMENT
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    "NumComptecp" => $compteCreditClient,
                    "Debit" =>  $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye,
                    "Debitfc" =>  $devise == 2 ? $SoldeCreditRestantCDF - $capitalPaye : $SoldeCreditRestantUSD - $capitalPaye * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $SoldeCreditRestantUSD - $capitalPaye . " USD dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Imputation de " . $SoldeCreditRestantCDF - $capitalPaye . " CDF dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                ]);

                //DEBITE SON COMPTE 39
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->NumCompteCreanceLitigieuse,
                    "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    "Debit" =>  $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye,
                    "Debitfc" =>  $devise == 2 ? $SoldeCreditRestantCDF - $capitalPaye : $SoldeCreditRestantUSD - $capitalPaye * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $SoldeCreditRestantUSD - $capitalPaye . " USD dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Imputation de " . $SoldeCreditRestantCDF - $capitalPaye . " CDF dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $refCompteMembre,
                ]);
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //CREDITE LE COMPTE CREDIT COMPTABLE
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteCreditAuxMembreCDF : $compteCreditAuxMembreUSD,
                    "NumComptecp" => $compteCreditClient,
                    "Credit" =>  $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye,
                    "Creditfc" =>  $devise == 2 ? $SoldeCreditRestantCDF - $capitalPaye : $SoldeCreditRestantUSD - $capitalPaye * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $SoldeCreditRestantUSD - $capitalPaye . " USD dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Imputation de " . $SoldeCreditRestantCDF - $capitalPaye . " CDF dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $refCompteMembre,
                ]);

                //CREDITE LE COMPTE CREDIT DU CLIENT
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $compteCreditClient,
                    "NumComptecp" => $devise == 2 ? $compteCreditAuxMembreCDF : $compteCreditAuxMembreUSD,
                    "Credit" =>  $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye,
                    "Creditfc" =>  $devise == 2 ? $SoldeCreditRestantCDF - $capitalPaye : $SoldeCreditRestantUSD - $capitalPaye * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? $SoldeCreditRestantUSD - $capitalPaye : $SoldeCreditRestantCDF - $capitalPaye / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $SoldeCreditRestantUSD - $capitalPaye . " USD dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Imputation de " . $SoldeCreditRestantCDF - $capitalPaye . " CDF dans la tranche de crédit en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $refCompteMembre,
                ]);
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //FAIT LA PROVISION  CREDITE 38
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Credit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 5 / 100 : ($SoldeCreditRestantCDF) * 5 / 100,
                    "Creditfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 5 / 100 : ($SoldeCreditRestantUSD) * 5 / 100 * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 5 / 100 : ($SoldeCreditRestantCDF) * 5 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Provision de 5% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Provision de 5% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //DEBITE 69 POUR DOTATION AUX PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Debit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 5 / 100 : ($SoldeCreditRestantCDF) * 5 / 100,
                    "Debitfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 5 / 100 : ($SoldeCreditRestantUSD) * 5 / 100 * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 5 / 100 : ($SoldeCreditRestantCDF) * 5 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Provision de 5% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Provision de 5% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                ]);

                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->where("NbrJrRetard", ">", 0)->where("DateRetard", "=", $dateSystem)->update([
                    "provision1" => 1,
                    "reclassement" => 1,
                    "montantRetard" => $capitalApayer,
                    "montantImpute" => $SoldeCreditRestantCDF - $capitalPaye,
                    "montantProvision" => ($SoldeCreditRestantCDF) * 5 / 100
                ]);
            }
            if ($nbrJourRetard->NbrJrRetard > 30 and $nbrJourRetard <= 60 and $nbrJourRetard->provision2 == 0) {
                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)
                    ->where("NbrJrRetard", ">", 0)
                    ->where("DateRetard", "=", $dateSystem)
                    ->where("reclassement", 1)->first();
                $nbrJourRetard = $checknombreJrRetard->NbrJrRetard;
                //ON FAIT D'ABORD UNE REPRISE SUR PROVISION POUR ANULER L'ANCIENNE PROVISION ET PASSER LA NOUVELLE 
                //ANNULE L'ANCIENNE PROVISION 38
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Debit" =>  $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision,
                    "Debitfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $SoldeCreditRestantUSD * $tauxDuJour,
                    "Debitusd" => $devise == 1 ? $SoldeCreditRestantUSD  : $SoldeCreditRestantCDF / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 5% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 5%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //CREDIT UN COMPTE DE PRODUIT POUR REPRISE SUR PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Credit" =>  $checknombreJrRetard->montantProvision,
                    "Creditfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision * $tauxDuJour,
                    "Creditusd" => $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 5% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 5%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 1 à 30 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteRepriseDeProvisionUSD,
                ]);

                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //FAIT LA PROVISION  CREDITE 38
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Credit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 25 / 100 : ($SoldeCreditRestantCDF) * 25 / 100,
                    "Creditfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 25 / 100 : ($SoldeCreditRestantUSD) * 25 / 100 * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 25 / 100 : ($SoldeCreditRestantCDF) * 25 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 25% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 25% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //DEBITE 69 POUR DOTATION AUX PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Debit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 25 / 100 : ($SoldeCreditRestantCDF) * 25 / 100,
                    "Debitfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 25 / 100 : ($SoldeCreditRestantUSD) * 25 / 100 * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 25 / 100 : ($SoldeCreditRestantCDF) * 25 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 25% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 25% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                ]);

                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->where("NbrJrRetard", ">", 0)->where("DateRetard", "=", $dateSystem)->update([
                    "provision2" => 1,
                    "montantRetard" => $nbrJourRetard->montantRetard + $capitalApayer,
                    "montantProvision" => ($SoldeCreditRestantCDF) * 25 / 100
                ]);
            }
            if ($nbrJourRetard->NbrJrRetard > 60 and $nbrJourRetard <= 90 and $nbrJourRetard->provision3 == 0) {

                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)
                    ->where("NbrJrRetard", ">", 0)
                    ->where("DateRetard", "=", $dateSystem)
                    ->where("reclassement", 1)->first();
                $nbrJourRetard = $checknombreJrRetard->NbrJrRetard;
                //ON FAIT D'ABORD UNE REPRISE SUR PROVISION POUR ANULER L'ANCIENNE PROVISION ET PASSER LA NOUVELLE 
                //ANNULE L'ANCIENNE PROVISION 38
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Debit" =>  $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision,
                    "Debitfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $SoldeCreditRestantUSD * $tauxDuJour,
                    "Debitusd" => $devise == 1 ? $SoldeCreditRestantUSD  : $SoldeCreditRestantCDF / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 25% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 25%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //CREDIT UN COMPTE DE PRODUIT POUR REPRISE SUR PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Credit" =>  $checknombreJrRetard->montantProvision,
                    "Creditfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision * $tauxDuJour,
                    "Creditusd" => $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 25% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 25%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 31 à 60 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteRepriseDeProvisionUSD,
                ]);

                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //FAIT LA PROVISION  CREDITE 38
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Credit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 50 / 100 : ($SoldeCreditRestantCDF) * 50 / 100,
                    "Creditfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 50 / 100 : ($SoldeCreditRestantUSD) * 50 / 100 * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 50 / 100 : ($SoldeCreditRestantCDF) * 50 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 50% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 50% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //DEBITE 69 POUR DOTATION AUX PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Debit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 50 / 100 : ($SoldeCreditRestantCDF) * 50 / 100,
                    "Debitfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 50 / 100 : ($SoldeCreditRestantUSD) * 50 / 100 * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 50 / 100 : ($SoldeCreditRestantCDF) * 50 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 50% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 50% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                ]);

                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->where("NbrJrRetard", ">", 0)->where("DateRetard", "=", $dateSystem)->update([
                    "provision3" => 1,
                    "montantRetard" => $nbrJourRetard->montantRetard + $capitalApayer,
                    "montantProvision" => ($SoldeCreditRestantCDF) * 50 / 100
                ]);
            }
            if ($nbrJourRetard->NbrJrRetard > 90 and $nbrJourRetard <= 180 and $nbrJourRetard->provision4 == 0) {

                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)
                    ->where("NbrJrRetard", ">", 0)
                    ->where("DateRetard", "=", $dateSystem)
                    ->where("reclassement", 1)->first();
                $nbrJourRetard = $checknombreJrRetard->NbrJrRetard;
                //ON FAIT D'ABORD UNE REPRISE SUR PROVISION POUR ANULER L'ANCIENNE PROVISION ET PASSER LA NOUVELLE 
                //ANNULE L'ANCIENNE PROVISION 38
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Debit" =>  $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision,
                    "Debitfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $SoldeCreditRestantUSD * $tauxDuJour,
                    "Debitusd" => $devise == 1 ? $SoldeCreditRestantUSD  : $SoldeCreditRestantCDF / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 50% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 50%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //CREDIT UN COMPTE DE PRODUIT POUR REPRISE SUR PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Credit" =>  $checknombreJrRetard->montantProvision,
                    "Creditfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision * $tauxDuJour,
                    "Creditusd" => $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 50% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 50%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 61 à 90 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteRepriseDeProvisionUSD,
                ]);
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //FAIT LA PROVISION  CREDITE 38
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Credit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 75 / 100 : ($SoldeCreditRestantCDF) * 75 / 100,
                    "Creditfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 75 / 100 : ($SoldeCreditRestantUSD) * 75 / 100 * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 75 / 100 : ($SoldeCreditRestantCDF) * 75 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 75% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 75% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //DEBITE 69 POUR DOTATION AUX PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Debit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 75 / 100 : ($SoldeCreditRestantCDF) * 75 / 100,
                    "Debitfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 75 / 100 : ($SoldeCreditRestantUSD) * 75 / 100 * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 75 / 100 : ($SoldeCreditRestantCDF) * 75 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 75% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 75% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                ]);





                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->where("NbrJrRetard", ">", 0)->where("DateRetard", "=", $dateSystem)->update([
                    "provision4" => 1,
                    "montantRetard" => $nbrJourRetard->montantRetard + $capitalApayer,
                    "montantProvision" => ($SoldeCreditRestantCDF) * 75 / 100
                ]);
            }

            if ($nbrJourRetard->NbrJrRetard > 180 and $nbrJourRetard->provision5 == 0) {


                $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
                $SoldeCreditRestantCDF = $soldeRestant->soldeRestant;

                //SOLDE RESTANT USD
                $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
                $SoldeCreditRestantUSD = $soldeRestant->soldeRestant;


                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)
                    ->where("NbrJrRetard", ">", 0)
                    ->where("DateRetard", "=", $dateSystem)
                    ->where("reclassement", 1)->first();
                $nbrJourRetard = $checknombreJrRetard->NbrJrRetard;
                //ON FAIT D'ABORD UNE REPRISE SUR PROVISION POUR ANULER L'ANCIENNE PROVISION ET PASSER LA NOUVELLE 
                //ANNULE L'ANCIENNE PROVISION 38
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Debit" =>  $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision,
                    "Debitfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $SoldeCreditRestantUSD * $tauxDuJour,
                    "Debitusd" => $devise == 1 ? $SoldeCreditRestantUSD  : $SoldeCreditRestantCDF / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 75% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 75%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //CREDIT UN COMPTE DE PRODUIT POUR REPRISE SUR PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Credit" =>  $checknombreJrRetard->montantProvision,
                    "Creditfc" =>  $devise == 2 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision * $tauxDuJour,
                    "Creditusd" => $devise == 1 ? $checknombreJrRetard->montantProvision : $checknombreJrRetard->montantProvision / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Reprise sur provision de 75% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Reprise sur provision de 75%  sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de 91 à 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteRepriseDeProvisionUSD,
                ]);
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //FAIT LA PROVISION  CREDITE 38
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checknombreJrRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "Credit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 100 / 100 : ($SoldeCreditRestantCDF) * 100 / 100,
                    "Creditfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 100 / 100 : ($SoldeCreditRestantUSD) * 100 / 100 * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 100 / 100 : ($SoldeCreditRestantCDF) * 100 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 100% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de plus de 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 100% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de plus de 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $checknombreJrRetard->CompteProvision,
                ]);

                //DEBITE 69 POUR DOTATION AUX PROVISION
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                    "NumComptecp" => $checknombreJrRetard->CompteProvision,
                    "Debit" =>  $devise == 1 ? ($SoldeCreditRestantUSD) * 100 / 100 : ($SoldeCreditRestantCDF) * 100 / 100,
                    "Debitfc" =>  $devise == 2 ? ($SoldeCreditRestantCDF) * 100 / 100 : ($SoldeCreditRestantUSD) * 100 / 100 * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? ($SoldeCreditRestantUSD) * 100 / 100 : ($SoldeCreditRestantCDF) * 100 / 100 / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Complement provision de 100% sur l'encours de " . $SoldeCreditRestantUSD . " USD  en retard de plus de 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé" : "Complement provision de 100% sur l'encours de " . $SoldeCreditRestantCDF . " CDF  en retard de plus de 180 jrs dossier" . $NumDossier . " pour " . $capitalApayer . " impayé",
                    "refCompteMembre" => $devise == 2 ? $compteDotationAuProvisionCDF : $compteDotationAuProvisionUSD,
                ]);

                $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->where("NbrJrRetard", ">", 0)->where("DateRetard", "=", $dateSystem)->update([
                    "provision5" => 1,
                    "montantRetard" => $nbrJourRetard->montantRetard + $capitalApayer,
                    "montantProvision" => ($SoldeCreditRestantCDF) * 75 / 100
                ]);
            }
        }
    }

    //CETTE FONCTION PERMET D'INCREMENTER LE JOURS DE RETARD
    private function IncrementerJourRetard($NumDossier, $dateSystem, $NumCompteEpargne, $NumCompteCredit)
    {
        $checknombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->where("NbrJrRetard", ">", 0)->where("DateRetard", "!=", $dateSystem)->first();
        if ($checknombreJrRetard) {
            $nombreJrRetard = JourRetard::where("NumDossier", $NumDossier)->first();
            JourRetard::where("NumDossier", $NumDossier)->update([
                "NumcompteEpargne" => $NumCompteEpargne,
                "NumcompteCredit" => $NumCompteCredit,
                "NumDossier" => $NumDossier,
                "NbrJrRetard" => $nombreJrRetard->NbrJrRetard + 1,
                "DateRetard" => $dateSystem,
            ]);
        }
    }
    //CETTE FONCTION PERMET D'ENLEVER LE CREDIT EN RETARD EN CAS DE PAYEMENT
    // private function RepriseSurProvision(
    //     $CodeAgence,
    //     $compteCreditClient,
    //     $devise,
    //     $NumDossier,
    //     $dateSystem,
    //     $tauxDuJour,
    //     $refCompteMembre,
    //     $montantArembourser,
    //     $capitalpayer,
    // ) {
    //     $checkRetard = JourRetard::where("NumDossier", $NumDossier)->where("DateRetard", "=", $dateSystem)->where("NbrJrRetard", ">", 0)->where("provision1", 1)->first();
    //     //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
    //     // $compteDotationAuProvisionCDF = "6901000000202";
    //     // $compteDotationAuProvisionUSD = "6900000000201";
    //     $compteRepriseDeProvisionCDF = "7901000000202";
    //     $compteRepriseDeProvisionUSD = "7900000000201";
    //     $compteCreanceLitigeuseUSD = "3900000000201";
    //     $compteCreanceLitigeuseCDF = "3901000000202";
    //     $compteCreditAuxMembreCDF = "3210000000202";
    //     $compteCreditAuxMembreUSD = "3210000000201";
    //     if ($checkRetard) {
    //         // $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
    //         // $SoldeCreditRestantCDF = $soldeRestant->soldeRestant;
    //         // //SOLDE RESTANT USD
    //         // $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
    //         // $SoldeCreditRestantUSD = $soldeRestant->soldeRestant;
    //         $v1SansDecimale = (int)$montantArembourser + (int)$capitalpayer;
    //         $v2SansDecimale = (int)$checkRetard->montantRetard;
    //         //dd($v1SansDecimale, $v2SansDecimale);
    //         if ($v1SansDecimale === $v2SansDecimale) {
    //             //dd($checkRetard->montantRetardRembours . " " . $checkRetard->montantRetard);
    //             //SI LE MONTANT REMBOURSE EST DEJA EGALE OU LEGEREMENT SUPERIEUR AU MONTANT QUI ETAIT EN RETARD
    //             //CA SIGNIFIE QU'IL PLUS D'IMPAYE POUR CETTE TRANCHE ET DU COUP ON PASSE LES ECRITURE D'IMPUTATION POUR REMETTRE LE CREDIT DANS LE CREDIT SAIN
    //             //DEBITE LE COMPTE CREDIT COMPTABLE POUR REMETTRE LE MONTANT QUI ETAIT IMPUTE
    //             CompteurTransaction::create([
    //                 'fakevalue' => "0000",
    //             ]);
    //             $numOperation = [];
    //             $numOperation = CompteurTransaction::latest()->first();
    //             $NumTransaction = "AT00" . $numOperation->id;
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $devise == 2 ? $compteCreditAuxMembreCDF : $compteCreditAuxMembreUSD,
    //                 "NumComptecp" => $compteCreditClient,
    //                 "Debit" =>  $checkRetard->montantImpute + $montantArembourser,
    //                 "Debitfc" =>  $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
    //                 "Debitusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
    //                 "refCompteMembre" => $refCompteMembre,
    //             ]);


    //             //DEBITE LE COMPTE CREDIT DU CLIENT POUR REMETTRE LE MONTANT QUI ETAIT IMPUTE
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $compteCreditClient,
    //                 "NumComptecp" => $devise == 2 ? $compteCreditAuxMembreCDF : $compteCreditAuxMembreUSD,
    //                 "Debit" =>  $checkRetard->montantImpute + $montantArembourser,
    //                 "Debitfc" =>  $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
    //                 "Debitusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
    //                 "refCompteMembre" => $refCompteMembre,
    //             ]);
    //             CompteurTransaction::create([
    //                 'fakevalue' => "0000",
    //             ]);
    //             $numOperation = [];
    //             $numOperation = CompteurTransaction::latest()->first();
    //             $NumTransaction = "AT00" . $numOperation->id;
    //             //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "C",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
    //                 "NumComptecp" => $compteCreditClient,
    //                 "Credit" =>  $checkRetard->montantImpute + $montantArembourser,
    //                 "Creditfc" => $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
    //                 "Creditusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
    //                 "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
    //             ]);
    //             //39 du client
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "C",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
    //                 "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
    //                 "Credit" =>  $checkRetard->montantImpute + $montantArembourser,
    //                 "Creditfc" =>  $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
    //                 "Creditusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
    //                 "refCompteMembre" => $refCompteMembre,
    //             ]);


    //             //SECOND PROCESS
    //             //RECUPERE LE SOLDE DU COMPTE 38 DU CLIENT 

    //             // $soldeCompteProvison = DB::select('SELECT SUM(transactions.Credit)-SUM(transactions.Debit) as soldeProvison from transactions where transactions.NumCompte="' . $checkRetard->CompteProvision . '"')[0];
    //             // $SoldeProvision = $soldeCompteProvison->soldeProvison;
    //             CompteurTransaction::create([
    //                 'fakevalue' => "0000",
    //             ]);
    //             $numOperation = [];
    //             $numOperation = CompteurTransaction::latest()->first();
    //             $NumTransaction = "AT00" . $numOperation->id;
    //             //DEBITE 38
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $checkRetard->CompteProvision,
    //                 "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //                 "Debit" =>  $checkRetard->montantProvision,
    //                 "Debitfc" =>  $devise == 2 ? $checkRetard->montantProvision : $checkRetard->montantProvision * $tauxDuJour,
    //                 "Debitusd" => $devise == 1 ? $checkRetard->montantProvision : $checkRetard->montantProvision / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
    //                 "refCompteMembre" => $checkRetard->CompteProvision,
    //             ]);

    //             //CREDITE 79 POUR REPRISE SUR PROVISION

    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //                 "NumComptecp" => $checkRetard->CompteProvision,
    //                 "Debit" =>  $checkRetard->montantProvision,
    //                 "Debitfc" =>  $devise == 2 ? $checkRetard->montantProvision : $checkRetard->montantProvision * $tauxDuJour,
    //                 "Debitusd" => $devise == 1 ? $checkRetard->montantProvision : $checkRetard->montantProvision / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
    //                 "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //             ]);
    //             JourRetard::where("NumDossier", $NumDossier)->update([
    //                 "NbrJrRetard" => 0,
    //                 "provision1" => 0,
    //                 "provision2" => 0,
    //                 "provision3" => 0,
    //                 "provision4" => 0,
    //                 "provision5" => 0,
    //                 "montantRetard" => 0

    //                 // "montantRetardRembours"=>$checkRetard->montantRetardRembours+$montantArembourser,
    //                 // "montantImpute"=> $checkRetard->montantImpute-$montantArembourser,

    //             ]);
    //         }

    //         if ($v1SansDecimale < $v2SansDecimale) {
    //             // dd($montantArembourser);
    //             //SI C PAS LE CAS ON VA FAIRE UNE REPRISE SUR PROVISION DU MONTANT REMBOURSE COMPTABILITE
    //             CompteurTransaction::create([
    //                 'fakevalue' => "0000",
    //             ]);
    //             $numOperation = [];
    //             $numOperation = CompteurTransaction::latest()->first();
    //             $NumTransaction = "AT00" . $numOperation->id;
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //                 "NumComptecp" => $montantArembourser,
    //                 "Debit" =>  $montantArembourser,
    //                 "Debitfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
    //                 "Debitusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => "Reprise sur provision dossier" . $NumDossier,
    //                 "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //             ]);

    //             //38 CLIENT 

    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $checkRetard->CompteProvision,
    //                 "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //                 "Debit" => $montantArembourser,
    //                 "Debitfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
    //                 "Debitusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => "Reprise sur provision  dossier" . $NumDossier,
    //                 "refCompteMembre" => $checkRetard->CompteProvision,
    //             ]);

    //             //CREDITE 79 POUR REPRISE SUR PROVISION
    //             CompteurTransaction::create([
    //                 'fakevalue' => "0000",
    //             ]);
    //             $numOperation = [];
    //             $numOperation = CompteurTransaction::latest()->first();
    //             $NumTransaction = "AT00" . $numOperation->id;
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "D",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
    //                 "NumComptecp" => $checkRetard->CompteProvision,
    //                 "Debit" =>  $montantArembourser,
    //                 "Debitfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
    //                 "Debitusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
    //                 "refCompteMembre" => $checkRetard->CompteProvision,
    //             ]);

    //             //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "C",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
    //                 "NumComptecp" => $compteCreditClient,
    //                 "Credit" =>  $montantArembourser,
    //                 "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
    //                 "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
    //                 "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
    //             ]);
    //             //39 du client
    //             Transactions::create([
    //                 "NumTransaction" => $NumTransaction,
    //                 "DateTransaction" => $dateSystem,
    //                 "DateSaisie" => $dateSystem,
    //                 "TypeTransaction" => "C",
    //                 "CodeMonnaie" => $devise,
    //                 "CodeAgence" => $CodeAgence,
    //                 "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
    //                 "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
    //                 "Credit" =>   $montantArembourser,
    //                 "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
    //                 "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
    //                 "NomUtilisateur" => "AUTO",
    //                 "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
    //                 "refCompteMembre" => $refCompteMembre,
    //             ]);

    //             JourRetard::where("NumDossier", $NumDossier)->update([
    //                 "montantRetardRembours" => $checkRetard->montantRetardRembours + $montantArembourser,
    //                 "montantImpute" => $checkRetard->montantImpute - $montantArembourser,
    //             ]);
    //         }
    //     }
    // }
    private function RepriseSurProvision(
        $CodeAgence,
        $compteCreditClient,
        $devise,
        $NumDossier,
        $dateSystem,
        $tauxDuJour,
        $refCompteMembre,
        $montantArembourser,
        $capitalpayer,
    ) {
        $checkRetard = JourRetard::where("NumDossier", $NumDossier)->where("DateRetard", "=", $dateSystem)->where("NbrJrRetard", ">", 0)->where("provision1", 1)->first();
        //GENERE LE NUMERO AUTOMATIQUE DE L'OPERATION
        // $compteDotationAuProvisionCDF = "6901000000202";
        // $compteDotationAuProvisionUSD = "6900000000201";
        $compteRepriseDeProvisionCDF = "7901000000202";
        $compteRepriseDeProvisionUSD = "7900000000201";
        $compteCreanceLitigeuseUSD = "3900000000201";
        $compteCreanceLitigeuseCDF = "3901000000202";
        $compteCreditAuxMembreCDF = "3210000000202";
        $compteCreditAuxMembreUSD = "3210000000201";
        if ($checkRetard) {
            // $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
            // $SoldeCreditRestantCDF = $soldeRestant->soldeRestant;
            // //SOLDE RESTANT USD
            // $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $NumDossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
            // $SoldeCreditRestantUSD = $soldeRestant->soldeRestant;
            $v1SansDecimale = (int)$montantArembourser + (int)$capitalpayer;
            $v2SansDecimale = (int)$checkRetard->montantRetard;
            //dd($v1SansDecimale, $v2SansDecimale);
            if ($v1SansDecimale === $v2SansDecimale) {
                //dd($checkRetard->montantRetardRembours . " " . $checkRetard->montantRetard);
                //SI LE MONTANT REMBOURSE EST DEJA EGALE OU LEGEREMENT SUPERIEUR AU MONTANT QUI ETAIT EN RETARD
                //CA SIGNIFIE QU'IL PLUS D'IMPAYE POUR CETTE TRANCHE ET DU COUP ON PASSE LES ECRITURE D'IMPUTATION POUR REMETTRE LE CREDIT DANS LE CREDIT SAIN
                //DEBITE LE COMPTE CREDIT COMPTABLE POUR REMETTRE LE MONTANT QUI ETAIT IMPUTE
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteCreditAuxMembreCDF : $compteCreditAuxMembreUSD,
                    "NumComptecp" => $compteCreditClient,
                    "Debit" =>  $checkRetard->montantImpute + $montantArembourser,
                    "Debitfc" =>  $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
                    "refCompteMembre" => $refCompteMembre,
                ]);


                //DEBITE LE COMPTE CREDIT DU CLIENT POUR REMETTRE LE MONTANT QUI ETAIT IMPUTE
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $compteCreditClient,
                    "NumComptecp" => $devise == 2 ? $compteCreditAuxMembreCDF : $compteCreditAuxMembreUSD,
                    "Debit" =>  $checkRetard->montantImpute + $montantArembourser,
                    "Debitfc" =>  $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
                    "Debitusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
                    "refCompteMembre" => $refCompteMembre,
                ]);
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    "NumComptecp" => $compteCreditClient,
                    "Credit" =>  $checkRetard->montantImpute + $montantArembourser,
                    "Creditfc" => $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
                    "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                ]);
                //39 du client
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
                    "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    "Credit" =>  $checkRetard->montantImpute + $montantArembourser,
                    "Creditfc" =>  $devise == 2 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser * ($tauxDuJour),
                    "Creditusd" => $devise == 1 ? $checkRetard->montantImpute + $montantArembourser : $checkRetard->montantImpute + $montantArembourser / ($tauxDuJour),
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => $devise == 1 ? "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " USD dans la tranche de crédit sain dossier" . $NumDossier : "Imputation de " . $checkRetard->montantImpute + $montantArembourser . " CDF dans la tranche de crédit sain dossier" . $NumDossier,
                    "refCompteMembre" => $refCompteMembre,
                ]);


                //SECOND PROCESS
                //RECUPERE LE SOLDE DU COMPTE 38 DU CLIENT 

                // $soldeCompteProvison = DB::select('SELECT SUM(transactions.Credit)-SUM(transactions.Debit) as soldeProvison from transactions where transactions.NumCompte="' . $checkRetard->CompteProvision . '"')[0];
                // $SoldeProvision = $soldeCompteProvison->soldeProvison;
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = "AT00" . $numOperation->id;
                //DEBITE 38
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $checkRetard->CompteProvision,
                    "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    "Debit" =>  $checkRetard->montantProvision,
                    "Debitfc" =>  $devise == 2 ? $checkRetard->montantProvision : $checkRetard->montantProvision * $tauxDuJour,
                    "Debitusd" => $devise == 1 ? $checkRetard->montantProvision : $checkRetard->montantProvision / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                    "refCompteMembre" => $checkRetard->CompteProvision,
                ]);

                //CREDITE 79 POUR REPRISE SUR PROVISION

                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" => $dateSystem,
                    "DateSaisie" => $dateSystem,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => $devise,
                    "CodeAgence" => $CodeAgence,
                    "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    "NumComptecp" => $checkRetard->CompteProvision,
                    "Credit" =>  $checkRetard->montantProvision,
                    "Creditfc" =>  $devise == 2 ? $checkRetard->montantProvision : $checkRetard->montantProvision * $tauxDuJour,
                    "Creditusd" => $devise == 1 ? $checkRetard->montantProvision : $checkRetard->montantProvision / $tauxDuJour,
                    "NomUtilisateur" => "AUTO",
                    "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                    "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                ]);
                JourRetard::where("NumDossier", $NumDossier)->delete();
                // JourRetard::where("NumDossier", $NumDossier)->update([
                //     "NbrJrRetard" => 0,
                //     "provision1" => 0,
                //     "provision2" => 0,
                //     "provision3" => 0,
                //     "provision4" => 0,
                //     "provision5" => 0,
                //     "montantRetard" => 0
                //     // "montantRetardRembours"=>$checkRetard->montantRetardRembours+$montantArembourser,
                //     // "montantImpute"=> $checkRetard->montantImpute-$montantArembourser,

                // ]);
            }

            if ($v1SansDecimale < $v2SansDecimale) {
                // dd($montantArembourser);
                //SI C PAS LE CAS ON VA FAIRE UNE REPRISE SUR PROVISION DU MONTANT REMBOURSE COMPTABILITE
                if ($checkRetard->NbrJrRetard > 0 and  $checkRetard->NbrJrRetard <= 30) {
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => ($montantArembourser * 5) / 100,
                        "Debit" =>  $montantArembourser,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 5) / 100 : ($montantArembourser * 5) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 5) / 100 : ($montantArembourser * 5) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    ]);

                    //38 CLIENT 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->CompteProvision,
                        "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "Debit" => ($montantArembourser * 5) / 100,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 5) / 100 : ($montantArembourser * 5) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 5) / 100 : ($montantArembourser * 5) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDITE 79 POUR REPRISE SUR PROVISION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => $checkRetard->CompteProvision,
                        "Credit" => ($montantArembourser * 5) / 100,
                        "Creditfc" =>  $devise == 2 ? ($montantArembourser * 5) / 100 : ($montantArembourser * 5) / 100 * ($tauxDuJour),
                        "Creditusd" => $devise == 1 ? ($montantArembourser * 5) / 100 : ($montantArembourser * 5) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "NumComptecp" => $compteCreditClient,
                        "Credit" =>  $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    ]);
                    //39 du client
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
                        "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "Credit" =>   $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $refCompteMembre,
                    ]);

                    JourRetard::where("NumDossier", $NumDossier)->update([
                        "montantRetardRembours" => $checkRetard->montantRetardRembours + $montantArembourser,
                        "montantImpute" => $checkRetard->montantImpute - $montantArembourser,
                    ]);
                } else if ($checkRetard->NbrJrRetard > 30 and  $checkRetard->NbrJrRetard <= 60) {
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => ($montantArembourser * 25) / 100,
                        "Debit" =>  $montantArembourser,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 25) / 100 : ($montantArembourser * 25) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 25) / 100 : ($montantArembourser * 25) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    ]);

                    //38 CLIENT 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->CompteProvision,
                        "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "Debit" => ($montantArembourser * 25) / 100,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 25) / 100 : ($montantArembourser * 25) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 25) / 100 : ($montantArembourser * 25) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDITE 79 POUR REPRISE SUR PROVISION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => $checkRetard->CompteProvision,
                        "Credit" => ($montantArembourser * 25) / 100,
                        "Creditfc" =>  $devise == 2 ? ($montantArembourser * 25) / 100 : ($montantArembourser * 25) / 100 * ($tauxDuJour),
                        "Creditusd" => $devise == 1 ? ($montantArembourser * 25) / 100 : ($montantArembourser * 25) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "NumComptecp" => $compteCreditClient,
                        "Credit" =>  $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    ]);
                    //39 du client
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
                        "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "Credit" =>   $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $refCompteMembre,
                    ]);

                    JourRetard::where("NumDossier", $NumDossier)->update([
                        "montantRetardRembours" => $checkRetard->montantRetardRembours + $montantArembourser,
                        "montantImpute" => $checkRetard->montantImpute - $montantArembourser,
                    ]);
                } else if ($checkRetard->NbrJrRetard > 60 and  $checkRetard->NbrJrRetard <= 90) {
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => ($montantArembourser * 50) / 100,
                        "Debit" =>  $montantArembourser,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 50) / 100 : ($montantArembourser * 50) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 50) / 100 : ($montantArembourser * 50) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    ]);

                    //38 CLIENT 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->CompteProvision,
                        "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "Debit" => ($montantArembourser * 50) / 100,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 50) / 100 : ($montantArembourser * 50) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 50) / 100 : ($montantArembourser * 50) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDITE 79 POUR REPRISE SUR PROVISION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => $checkRetard->CompteProvision,
                        "Credit" => ($montantArembourser * 50) / 100,
                        "Creditfc" =>  $devise == 2 ? ($montantArembourser * 50) / 100 : ($montantArembourser * 50) / 100 * ($tauxDuJour),
                        "Creditusd" => $devise == 1 ? ($montantArembourser * 50) / 100 : ($montantArembourser * 50) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "NumComptecp" => $compteCreditClient,
                        "Credit" =>  $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    ]);
                    //39 du client
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
                        "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "Credit" =>   $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $refCompteMembre,
                    ]);

                    JourRetard::where("NumDossier", $NumDossier)->update([
                        "montantRetardRembours" => $checkRetard->montantRetardRembours + $montantArembourser,
                        "montantImpute" => $checkRetard->montantImpute - $montantArembourser,
                    ]);
                } else if ($checkRetard->NbrJrRetard > 90 and  $checkRetard->NbrJrRetard <= 180) {
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => ($montantArembourser * 75) / 100,
                        "Debit" =>  $montantArembourser,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 75) / 100 : ($montantArembourser * 75) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 75) / 100 : ($montantArembourser * 75) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    ]);

                    //38 CLIENT 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->CompteProvision,
                        "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "Debit" => ($montantArembourser * 75) / 100,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 75) / 100 : ($montantArembourser * 75) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 75) / 100 : ($montantArembourser * 75) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDITE 79 POUR REPRISE SUR PROVISION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => $checkRetard->CompteProvision,
                        "Credit" => ($montantArembourser * 75) / 100,
                        "Creditfc" =>  $devise == 2 ? ($montantArembourser * 75) / 100 : ($montantArembourser * 75) / 100 * ($tauxDuJour),
                        "Creditusd" => $devise == 1 ? ($montantArembourser * 75) / 100 : ($montantArembourser * 75) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "NumComptecp" => $compteCreditClient,
                        "Credit" =>  $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    ]);
                    //39 du client
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
                        "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "Credit" =>   $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $refCompteMembre,
                    ]);

                    JourRetard::where("NumDossier", $NumDossier)->update([
                        "montantRetardRembours" => $checkRetard->montantRetardRembours + $montantArembourser,
                        "montantImpute" => $checkRetard->montantImpute - $montantArembourser,
                    ]);
                } else if ($checkRetard->NbrJrRetard > 180) {
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => ($montantArembourser * 100) / 100,
                        "Debit" =>  $montantArembourser,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 100) / 100 : ($montantArembourser * 100) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 100) / 100 : ($montantArembourser * 100) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                    ]);

                    //38 CLIENT 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->CompteProvision,
                        "NumComptecp" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "Debit" => ($montantArembourser * 100) / 100,
                        "Debitfc" =>  $devise == 2 ? ($montantArembourser * 100) / 100 : ($montantArembourser * 100) / 100 * ($tauxDuJour),
                        "Debitusd" => $devise == 1 ? ($montantArembourser * 100) / 100 : ($montantArembourser * 100) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDITE 79 POUR REPRISE SUR PROVISION
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = "AT00" . $numOperation->id;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteRepriseDeProvisionCDF : $compteRepriseDeProvisionUSD,
                        "NumComptecp" => $checkRetard->CompteProvision,
                        "Credit" => ($montantArembourser * 100) / 100,
                        "Creditfc" =>  $devise == 2 ? ($montantArembourser * 100) / 100 : ($montantArembourser * 100) / 100 * ($tauxDuJour),
                        "Creditusd" => $devise == 1 ? ($montantArembourser * 100) / 100 : ($montantArembourser * 100) / 100 / ($tauxDuJour),
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => "Reprise sur provision crédit sain  dossier" . $NumDossier,
                        "refCompteMembre" => $checkRetard->CompteProvision,
                    ]);

                    //CREDIT 39 QUI ETAIT DEBITE LORS DE RECLASSEMENT COMPTABILITE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "NumComptecp" => $compteCreditClient,
                        "Credit" =>  $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                    ]);
                    //39 du client
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => $devise,
                        "CodeAgence" => $CodeAgence,
                        "NumCompte" => $checkRetard->NumCompteCreanceLitigieuse,
                        "NumComptecp" => $devise == 2 ? $compteCreanceLitigeuseCDF : $compteCreanceLitigeuseUSD,
                        "Credit" =>   $montantArembourser,
                        "Creditfc" =>  $devise == 2 ? $montantArembourser : $montantArembourser * $tauxDuJour,
                        "Creditusd" => $devise == 1 ? $montantArembourser : $montantArembourser / $tauxDuJour,
                        "NomUtilisateur" => "AUTO",
                        "Libelle" => $devise == 1 ? "Remboursement de  " . $montantArembourser . " USD dossier" . $NumDossier : "Remboursement de  " . $montantArembourser . " CDF  dossier" . $NumDossier,
                        "refCompteMembre" => $refCompteMembre,
                    ]);

                    JourRetard::where("NumDossier", $NumDossier)->update([
                        "montantRetardRembours" => $checkRetard->montantRetardRembours + $montantArembourser,
                        "montantImpute" => $checkRetard->montantImpute - $montantArembourser,
                    ]);
                }
            }
        }
    }
}
