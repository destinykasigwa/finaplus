<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Comptes;
use Twilio\Rest\Client;
use App\Models\SendedSMS;
use App\Models\Delestages;
use App\Models\SMSBanking;
use App\Models\Mandataires;
use App\Models\BilletageCDF;
use App\Models\BilletageUSD;
use App\Models\CompanyModel;
use App\Models\Transactions;
use Illuminate\Http\Request;
use App\Models\AdhesionMembre;
use App\Mail\TransactionsEmail;
use App\Models\Positionnements;
use function PHPSTORM_META\map;
use App\Models\CompteurDocument;
use App\Models\TauxEtDateSystem;
use App\Models\BilletageAppro_cdf;
use App\Models\BilletageAppro_usd;
use App\Services\SendNotification;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\CompteurTransaction;
use Illuminate\Support\Facades\Log;
use App\Models\EpargneAdhesionModel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Services\AfricaTalkingService;
use Illuminate\Support\Facades\Validator;

class TransactionsController extends Controller
{
    //
    //protected $africaTalking;

    protected $sendNotification;
    protected $numCompteCaissePrUSD;
    protected $numCompteCaissePrCDF;
    protected $compteVirementInterGuichetUSD;
    protected $compteVirementInterGuichetCDF;

    public function __construct()
    {
        $this->middleware("auth");
        $this->sendNotification = app(SendNotification::class);
        $this->numCompteCaissePrUSD = "570201";
        $this->numCompteCaissePrCDF = "570202";
        $this->compteVirementInterGuichetUSD = "590201";
        $this->compteVirementInterGuichetCDF = "590202";
    }


    //GET HOME DEPOSIT HOME PAGE
    public function getDepotEspeceHomePage()
    {
        return view("eco.pages.depot-espece");
    }

    //GET SEACHED ACCOUNT

    public function getSeachedAccount(Request $request)
    {
        if (isset($request->searched_account)) {
            $checkRowExist = Comptes::where("NumCompte", $request->searched_account)->orWhere("NumAdherant", $request->searched_account)->first();
            $numDocument = CompteurDocument::latest()->first();
            if ($checkRowExist) {
                $data = Comptes::where("NumCompte", $request->searched_account)->orWhere("NumAdherant", $request->searched_account)->get();
                $membreSignature =  AdhesionMembre::where("compte_abrege", $request->searched_account)->first();
                $madantairedata = Mandataires::where("refCompte", $request->searched_account)->get();
                // CompteurDocument::create([
                //     "fakenumber" => 000,
                // ]);
                return response()->json([
                    "status" => 1,
                    "data" => $data,
                    "membreSignature" => $membreSignature,
                    "numDocument" => $numDocument,
                    "madantairedata" => $madantairedata
                ]);
            } else {
                return response()->json(["status" => 0, "msg" => "Ce numero de compte n'existe pas."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun numéro de compte renseigné."]);
        }
    }

    public function getSeachedAccount2(Request $request)
    {
        if (isset($request->searched_account)) {
            $checkRowExist = Comptes::where("NumCompte", $request->searched_account)->orWhere("NumAdherant", $request->searched_account)->first();
            $numDocument = CompteurDocument::latest()->first();
            if ($checkRowExist) {
                $data = Comptes::where("NumCompte", $request->searched_account)->orWhere("NumAdherant", $request->searched_account)->where("RefGroupe", 330)->get();
                $membreSignature =  AdhesionMembre::where("compte_abrege", $request->searched_account)->first();
                $madantairedata = Mandataires::where("refCompte", $request->searched_account)->get();
                // CompteurDocument::create([
                //     "fakenumber" => 000,
                // ]);
                return response()->json([
                    "status" => 1,
                    "data" => $data,
                    "membreSignature" => $membreSignature,
                    "numDocument" => $numDocument,
                    "madantairedata" => $madantairedata
                ]);
            } else {
                return response()->json(["status" => 0, "msg" => "Ce numero de compte n'existe pas."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun numéro de compte renseigné."]);
        }
    }

    //RECUPERE UN NUMERO DE COMPTE SPECIFIQUE

    public function GetAccount(Request $request)
    {
        if (isset($request->NumCompte)) {
            $data = Comptes::where("NumCompte", $request->NumCompte)->first();
            //RECUPERE LES DATES PAR DEFAUT   
            $NewDate1  = date('Y') . '-01-01';
            $NewDate2 = date("Y-m-d");

            if ($data->CodeMonnaie == 2) {
                //RECUPERE LE SOLDE DU COMPTE CDF
                $soldeMembre = Transactions::select(
                    DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembre"),
                )->where("NumCompte", '=',  $request->NumCompte)
                    ->where("CodeMonnaie", '=',  2)
                    ->groupBy("NumCompte")
                    ->first();
            } else {
                //RECUPERE LE SOLDE DU COMPTE CDF
                $soldeMembre = Transactions::select(
                    DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembre"),
                )->where("NumCompte", '=',  $request->NumCompte)
                    ->where("CodeMonnaie", '=',  1)
                    ->groupBy("NumCompte")
                    ->first();
            }
            return response()->json([
                "status" => 1,
                "data" => $data,
                "defaultDateDebut" => $NewDate1,
                "defaultDateFin" => $NewDate2,
                "soldeCompte" => $soldeMembre,
            ]);
        } else {
            return response()->json(["status" => 0, "msg" => "Une erreur est survenue."]);
        }
    }
    //PERMET D'EFFECTUER UN DEPOT

    public function DepositEspece(Request $request)
    {
        $validator = validator::make($request->all(), [
            'devise' => 'required',
            'motifDepot' => 'required',
            'DeposantName' => 'required',
            // 'Montant' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }
        try {
            if ($request->devise == "CDF") {

                //RECUPERE LE COMPTE DU CAISSIER CONCERNE CDF
                $dataCompte = Comptes::where("NumAdherant", $request->NumAbrege)->orWhere("NumCompte", $request->NumAbrege)
                    ->where("CodeMonnaie", 2)->first();

                $NumCompte = $request->getNumCompte;
                if ($NumCompte) {
                    $numCompteCaissierCDF = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "2")->first();
                    $CompteCaissierCDF = $numCompteCaissierCDF->NumCompte;

                    $codeAgenceCaissier = $numCompteCaissierCDF->CodeAgence;

                    $NomCaissier = $numCompteCaissierCDF->NomCompte;
                    $dataSystem = TauxEtDateSystem::latest()->first();

                    //CHECK THERE IS A COMMISSION 

                    if (isset($request->Commission) and $request->Commission > 0) {
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                        //CREDITE LE COMPTE COMMISION CDF
                        $compteCommissionCDF = "7270000000202";
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "Taux" => 1,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => 2,
                            "CodeAgence" => $codeAgenceCaissier,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $compteCommissionCDF,
                            "NumComptecp" => $NumCompte,
                            "Credit"  => $request->Commission,
                            "Creditusd"  => $request->Commission / $dataSystem->TauxEnFc,
                            "Creditfc" => $request->Commission,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => "PRELEVEMENT DE COMMISSION SUR LE COMPTE " . $NumCompte . " par le caissier " . Auth::user()->name,
                            "refCompteMembre" => $compteCommissionCDF,
                        ]);

                        //DEBITE LE COMPTE DU MEMBRE DE LA COMMISSION
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "Taux" => 1,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => 2,
                            "CodeAgence" => $codeAgenceCaissier,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $NumCompte,
                            "NumComptecp" =>  $compteCommissionCDF,
                            "Debit"  => $request->Commission,
                            "Debitusd"  => $request->Commission / $dataSystem->TauxEnFc,
                            "Debitfc" => $request->Commission,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => "PRISE COMMISSION",
                        ]);
                        // Transactions::recalculateBalances($dataCompte->NumCompte, $dataSystem->DateSystem);
                        //PERMET DE DIPLIQUE LA LIGNE POUR METTRE A JOUR Résultat Net de l'exercice
                        // $this->CheckTransactionStatus(871);
                        if ($request->Montant == 0) {
                            return response()->json(["status" => 1, "msg" => "Opération bien enregistrée"]);
                        }
                    }
                    if ($request->Montant > 0) {
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                        //DEBITE LE COMPTE DU CAISSIER
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => 2,
                            "CodeAgence" => $codeAgenceCaissier,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $CompteCaissierCDF,
                            "NumComptecp" => $NumCompte,
                            "Operant" => $NomCaissier,
                            "Debit"  => $request->Montant,
                            "Debitusd"  => $request->Montant / $dataSystem->TauxEnFc,
                            "Debitfc" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifDepot,

                        ]);
                        //CREDITE LE COMPTE DU CLIENT
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => 2,
                            "CodeAgence" => $dataCompte->CodeAgence,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $NumCompte,
                            "NumComptecp" => $CompteCaissierCDF,
                            "Operant" => $request->DeposantName,
                            "Credit"  => $request->Montant,
                            "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                            "Creditfc" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifDepot,
                        ]);

                        //CREDIT  LE COMPTE COMPTABLE 33 EPARGNE
                        // $Ecompte_courant_cdf = EpargneAdhesionModel::first()->Ecompte_courant_cdf;
                        // Transactions::create([
                        //     "NumTransaction" => $NumTransaction,
                        //     "DateTransaction" => $dataSystem->DateSystem,
                        //     "DateSaisie" => $dataSystem->DateSystem,
                        //     "TypeTransaction" => "C",
                        //     "CodeMonnaie" => 2,
                        //     "CodeAgence" => $codeAgenceCaissier,
                        //     "NumDossier" => "DOS0" . $numOperation->id,
                        //     "NumDemande" => "V0" . $numOperation->id,
                        //     "NumCompte" => $Ecompte_courant_cdf,
                        //     "NumComptecp" => $dataCompte->NumCompte,
                        //     "Credit"  => $request->Montant,
                        //     "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        //     "Creditfc" => $request->Montant,
                        //     "NomUtilisateur" => Auth::user()->name,
                        //     "Libelle" => $request->motifDepot,
                        // ]);

                        //RENSEIGNE LE BILLETAGE
                        $lastInsertedId = Transactions::latest()->first();
                        //COMPLETE LE BILLETAGE

                        BilletageCDF::create([
                            "refOperation" => $lastInsertedId->NumTransaction,
                            "NumCompte" => $NumCompte,
                            "NomMembre" => $dataCompte->NomCompte,
                            "NumAbrege" => $request->NumAbrege,
                            "Beneficiaire" => $request->DeposantName,
                            "Motif" => $request->motifDepot,
                            "Devise" => $request->devise,
                            "vightMilleFranc" => $request->vightMille,
                            "dixMilleFranc" => $request->dixMille,
                            "cinqMilleFranc" => $request->cinqMille,
                            "milleFranc" => $request->milleFranc,
                            "cinqCentFranc" => $request->cinqCentFr,
                            "deuxCentFranc" => $request->deuxCentFranc,
                            "centFranc" => $request->centFranc,
                            "montantEntre" => $request->Montant,
                            "cinquanteFanc" => $request->cinquanteFanc,
                            "NomUtilisateur" => Auth::user()->name,
                            "DateTransaction" => $dataSystem->DateSystem
                        ]);

                        //SEND NOTIFICATION
                        $this->sendNotification->sendNotification($dataCompte->NumAdherant, $request->devise, $request->Montant, "C", $request->DeposantName);
                        return response()->json(["status" => 1, "msg" => "Opération bien enregistrée"]);
                    } else {
                        return response()->json([
                            'validate_error' => $validator->messages()
                        ]);
                    }
                } else {
                    return response()->json(["status" => 0, "msg" => "Le compte en franc pour ce client n'est pas activé" . $request->searched_account]);
                }
            } else if ($request->devise == "USD") {


                //RECUPERE LE COMPTE DU CAISSIER CONCERNE USD
                $dataCompte = Comptes::where("NumAdherant", $request->NumAbrege)->orWhere("NumCompte", $request->NumAbrege)
                    ->where("CodeMonnaie", 1)->first();
                $NumCompte = $request->getNumCompte;
                if ($NumCompte) {
                    $numCompteCaissierUSD = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "1")->first();
                    $CompteCaissierUSD = $numCompteCaissierUSD->NumCompte;
                    $codeAgenceCaissier = $numCompteCaissierUSD->CodeAgence;
                    $NomCaissier = $numCompteCaissierUSD->NomCompte;
                    $dataSystem = TauxEtDateSystem::latest()->first();


                    //CHECK THERE IS A COMMISSION 

                    if (isset($request->Commission) and $request->Commission > 0) {
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                        //CREDITE LE COMPTE COMMISION USD
                        $compteCommissionUSD = "7270000000201";
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "Taux" => 1,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => 1,
                            "CodeAgence" => "20",
                            "NumDossier" => "DOS00" . $numOperation->id,
                            "NumDemande" => "V00" . $numOperation->id,
                            "NumCompte" => $compteCommissionUSD,
                            "NumComptecp" => $NumCompte,
                            //   "Operant" => "COMPTE COMMISSION CDF",
                            "Credit"  => $request->Commission,
                            "Creditusd"  => $request->Commission,
                            "Creditfc" => $request->Commission * $dataSystem->TauxEnFc,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => "PRELEVEMENT DE COMMISSION SUR LE COMPTE " . $dataCompte->NumCompte . " par le caissier " . Auth::user()->name,
                            "refCompteMembre" => $compteCommissionUSD
                        ]);

                        //DEBITE LE COMPTE DU MEMBRE DE LA COMMISSION
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "Taux" => 1,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => 1,
                            "CodeAgence" => "20",
                            "NumDossier" => "DOS00" . $numOperation->id,
                            "NumDemande" => "V00" . $numOperation->id,
                            "NumCompte" => $NumCompte,
                            "NumComptecp" =>  $compteCommissionUSD,
                            "Debit"  => $request->Commission,
                            "Debitusd"  => $request->Commission,
                            "Debitfc" => $request->Commission * $dataSystem->TauxEnFc,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => "PRISE COMMISSION",
                        ]);
                    }
                    if ($request->Montant > 0) {
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                        //CREDITE LE COMPTE DU CLIENT
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => 1,
                            "CodeAgence" => $dataCompte->CodeAgence,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $NumCompte,
                            "NumComptecp" => $CompteCaissierUSD,
                            "Operant" => $request->DeposantName,
                            "Credit"  => $request->Montant,
                            "Creditusd"  => $request->Montant,
                            "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifDepot,
                        ]);
                        //DEBITE LE COMPTE DU CAISSIER
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => 1,
                            "CodeAgence" => $codeAgenceCaissier,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $CompteCaissierUSD,
                            "NumComptecp" => $NumCompte,
                            "Operant" => $NomCaissier,
                            "Debit"  => $request->Montant,
                            "Debitusd"  => $request->Montant,
                            "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifDepot,
                        ]);
                        //CREDIT  LE COMPTE COMPTABLE 33 EPARGNE
                        // $Ecompte_courant_usd = EpargneAdhesionModel::first()->Ecompte_courant_usd;
                        // Transactions::create([
                        //     "NumTransaction" => $NumTransaction,
                        //     "DateTransaction" => $dataSystem->DateSystem,
                        //     "DateSaisie" => $dataSystem->DateSystem,
                        //     "TypeTransaction" => "C",
                        //     "CodeMonnaie" => 1,
                        //     "CodeAgence" => $codeAgenceCaissier,
                        //     "NumDossier" => "DOS0" . $numOperation->id,
                        //     "NumDemande" => "V0" . $numOperation->id,
                        //     "NumCompte" => $Ecompte_courant_usd,
                        //     "NumComptecp" => $dataCompte->NumCompte,
                        //     "Credit"  => $request->Montant,
                        //     "Creditusd"  => $request->Montant,
                        //     "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                        //     "NomUtilisateur" => Auth::user()->name,
                        //     "Libelle" => $request->motifDepot,
                        // ]);

                        //RECUPERE LE DERNIER ID DU L'OPERATION INSEREE
                        $lastInsertedId = Transactions::latest()->first();
                        //RENSEIGNE LE BILLETAGE

                        BilletageUSD::create([
                            "refOperation" => $lastInsertedId->NumTransaction,
                            "NumCompte" => $NumCompte,
                            "NomMembre" => $dataCompte->NomCompte,
                            "NumAbrege" => $request->NumAbrege,
                            "Beneficiaire" => $request->DeposantName,
                            "Motif" => $request->motifDepot,
                            "Devise" => $request->devise,
                            "centDollars" => $request->hundred,
                            "cinquanteDollars" => $request->fitfty,
                            "vightDollars" => $request->twenty,
                            "dixDollars" => $request->ten,
                            "cinqDollars" => $request->five,
                            "unDollars" => $request->oneDollar,
                            "montantEntre" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "DateTransaction" => $dataSystem->DateSystem
                        ]);

                        //SEND NOTIFICATION

                        $this->sendNotification->sendNotification($dataCompte->NumAdherant, $request->devise, $request->Montant, "C", $request->DeposantName);
                        return response()->json(["status" => 1, "msg" => "Opération bien enregistrée"]);
                    } else {
                        return response()->json([
                            'validate_error' => $validator->messages()
                        ]);
                    }
                } else {
                    return response()->json(["status" => 0, "msg" => "Le compte en franc pour ce client n'est pas activé" . $request->searched_account]);
                }
            }
        } catch (\Exception $e) {
            // Attraper les exceptions liées à la connexion ou autres erreurs

            return response()->json(["status" => 0, "msg" => "Erreur de connexion. Veuillez patienter et réessayer.", "error" => $e->getMessage()]);
        }
    }



    //GET VISA HOME PAGE 

    public function getVisaHomePage()
    {
        return view("eco.pages.visa");
    }


    //PERMET DE POSITIONNER UNE OPERATION DE RETRAIT

    public function Positionnement(Request $request)
    {
        if (isset($request->refCompte)) {
            $validator = validator::make($request->all(), [
                'devise' => 'required',
                'benecifiaire' => 'required',
                'Montant' => 'required',
                'typeDocument'  => 'required',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'validate_error' => $validator->messages()
                ]);
            }


            //VERIFIE SI LE COMPTE NE PAS PROTEGE
            $getCompteMembre = Comptes::where("NumAdherant", "=", $request->refCompte)->first();
            if ($getCompteMembre and $getCompteMembre->Protege == 1) {
                return response()->json(['status' => 0, 'msg' => "Ce compte est protegé vous ne pouvez pas y effectuer un retrait."]);
            }
            if ($request->devise == "CDF") {
                $dataSystem = TauxEtDateSystem::latest()->first();
                //RECUPERE LE NUMERO DE COMPTE DU CLIENT
                // $getCompte = Comptes::where("NumAdherant", $request->refCompte)->where("CodeMonnaie", 2)->first();
                $getCompte = Comptes::where(function ($query) use ($request) {
                    $query->where("NumAdherant", $request->refCompte)
                        ->orWhere("NumCompte", $request->refCompte);
                })
                    ->where("CodeMonnaie", 2)
                    ->first();

                if ($getCompte) {
                    //RECUPERE LE SOLDE 
                    $soldeMembreCDF = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                    )->where("NumCompte", '=', $getCompte->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                    //VERIFIE SI LE SOLDE EST INFERIEUR OU EGAL AU SOLDE QU'ON ESSAIE DE POSITIONNER
                    if ($request->Montant <= $soldeMembreCDF->soldeMembreCDF or $getCompte->RefTypeCompte == 4) {
                        Positionnements::create([
                            "NumCompte" => $getCompte->NumCompte,
                            "Montant" => $request->Montant,
                            "CodeMonnaie" => "CDF",
                            "CodeAgence" => $getCompte->CodeAgence,
                            "DateTransaction" =>  $dataSystem->DateSystem,
                            "Document" => $request->typeDocument,
                            "NumDocument" => $request->numDocument,
                            "NomCompte" => $getCompte->NomCompte,
                            "Retirant" => $request->benecifiaire == "autre" ? $request->other_benecifiaire : $request->benecifiaire,
                            // "Concerne" => "Retrait",
                            // "Adresse"  => $request->adresse,
                            "NumTel" => $request->telephone,
                            // "TypePieceIdentity" => $request->typepiece,
                            // "NumPieceIdentity" => $request->numpiece,
                            // "Proprietaire" => 1,
                            // "Mandataire" => 0,
                            "NomUtilisateur"  => Auth::user()->name,
                            "Autorisateur" => $request->montant > 100000 ? 1 : null,
                            "RefCompte" => $request->refCompte
                        ]);
                        //PERMET D'INCREMENTER LA TABLE POUR LE COMPTEUR DE DOSSIER
                        CompteurDocument::create([
                            "fakenumber" => 000,
                        ]);
                        return response()->json(['status' => 1, 'msg' => "Opération bien enregistrée.", 'validate_error' => $validator->messages()]);
                    } else {
                        return response()->json(['status' => 0, 'msg' => "Le solde du compte est insuffissant.", 'validate_error' => $validator->messages()]);
                    }
                    //ON ENREGISTRE L'OPERATION          
                } else {
                    return response()->json(['status' => 0, 'msg' => "Le compte en franc n'existe pas pour ce client vous devez d'abord le crée.", 'validate_error' => $validator->messages()]);
                }
            } else if ($request->devise == "USD") {
                $dataSystem = TauxEtDateSystem::latest()->first();
                //RECUPERE LE NUMERO DE COMPTE DU CLIENT
                $getCompte = Comptes::where(function ($query) use ($request) {
                    $query->where("NumAdherant", $request->refCompte)
                        ->orWhere("NumCompte", $request->refCompte);
                })
                    ->where("CodeMonnaie", 1)
                    ->first();
                // $getCompte = Comptes::where("NumAdherant", $request->refCompte)->where("CodeMonnaie", 1)->first();
                if ($getCompte) {
                    //RECUPERE LE SOLDE 
                    $soldeMembreUSD = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $getCompte->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                    //VERIFIE SI LE SOLDE EST INFERIEUR OU EGAL AU SOLDE QU'ON ESSAIE DE POSITIONNER
                    if ($request->Montant <= $soldeMembreUSD->soldeMembreUSD or $getCompte->RefTypeCompte == 4) {
                        Positionnements::create([
                            "NumCompte" => $getCompte->NumCompte,
                            "Montant" => $request->Montant,
                            "CodeMonnaie" => "USD",
                            "CodeAgence" => $getCompte->CodeAgence,
                            "DateTransaction" =>  $dataSystem->DateSystem,
                            "Document" => $request->typeDocument,
                            "NumDocument" => $request->numDocument,
                            "NomCompte" => $getCompte->NomCompte,
                            "Retirant" => $request->benecifiaire == "autre" ? $request->other_benecifiaire : $request->benecifiaire,
                            // "Concerne" => "Retrait",
                            // "Adresse"  => $request->adresse,
                            "NumTel" => $request->telephone,
                            // "TypePieceIdentity" => $request->typepiece,
                            // "NumPieceIdentity" => $request->numpiece,
                            // "Proprietaire" => 1,
                            // "Mandataire" => 0,
                            "NomUtilisateur"  => Auth::user()->name,
                            "Autorisateur" => $request->montant > 100000 ? 1 : null,
                            "RefCompte" => $request->refCompte
                        ]);
                        //PERMET D'INCREMENTER LA TABLE POUR LE COMPTEUR DE DOSSIER
                        CompteurDocument::create([
                            "fakenumber" => 000,
                        ]);
                        return response()->json(['status' => 1, 'msg' => "Opération bien enregistrée.", 'validate_error' => $validator->messages()]);
                    } else {
                        return response()->json(['status' => 0, 'msg' => "Le solde du compte est insuffissant.", 'validate_error' => $validator->messages()]);
                    }
                    //ON ENREGISTRE L'OPERATION          
                } else {
                    return response()->json(['status' => 0, 'msg' => "Le compte en franc n'existe pas pour ce client vous devez d'abord le crée.", 'validate_error' => $validator->messages()]);
                }
            }
        }
    }

    //GET RETRAIT ESPECE HOME PAGE

    public function getRetraitHomePage()
    {
        return view("eco.pages.retrait-espece");
    }

    //PERMET DE RECUPERER LES INFORMATIONS POSITIONNEES 

    public function GetDocumentP(Request $request)
    {
        if (isset($request->numDocument)) {

            //Verifie si le ducument n'existe pas 
            $check = Positionnements::where("NumDocument", $request->numDocument)->first();
            if (!$check) {
                return response()->json(["status" => 0, "msg" => "Ce document n'est pas encore positionné."]);
            }
            //VERIFIE SI LE DOCUMENT n'est pas encore servie
            $check2 = Positionnements::where("NumDocument", $request->numDocument)->where("Servie", 1)->first();
            if ($check2) {
                return response()->json(['status' => 0, "msg" => 'Ce document est déjà servi.']);
            }
            $data = Positionnements::where("NumDocument", $request->numDocument)->where("Servie", 0)->first();
            if ($data) {
                return response()->json(['status' => 1, "data" => $data]);
            }
        } else {
            return response()->json(['status' => 0, "data" => "Veuillez renseigner le numéro de document."]);
        }
    }

    //PERMET DE VALIDER UN RETRAI 

    public function saveRetraitEspece(Request $request)
    {

        if (isset($request->NumAbrege)) {

            //VERTIFIE SI LE BILLETATGE ENTREE PAR LE CAISSIER CORRESPOND AU BILLETAGE QU'IL POSSEDE DANS SA CAISSE
            if ($request->devise == "CDF") {

                //RECUPERE LA SOMME DE  BILLETAGE EN FRANC CONGOLAIS
                $date = TauxEtDateSystem::orderBy('id', 'desc')->first()->DateSystem;
                $billetageCDF = BilletageCDF::select(
                    DB::raw("SUM(vightMilleFranc)-SUM(vightMilleFrancSortie) as vightMilleFran"),
                    DB::raw("SUM(dixMilleFranc)-SUM(dixMilleFrancSortie) as dixMilleFran"),
                    DB::raw("SUM(cinqMilleFranc)-SUM(cinqMilleFrancSortie) as cinqMilleFran"),
                    DB::raw("SUM(milleFranc)-SUM(milleFrancSortie) as milleFran"),
                    DB::raw("SUM(cinqCentFranc)-SUM(cinqCentFrancSortie) as cinqCentFran"),
                    DB::raw("SUM(deuxCentFranc)-SUM(deuxCentFrancSortie) as deuxCentFran"),
                    DB::raw("SUM(centFranc)-SUM(centFrancSortie) as centFran"),
                    DB::raw("SUM(cinquanteFanc)-SUM(cinquanteFancSortie) as cinquanteFan"),
                )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $date)
                    ->groupBy("NomUtilisateur")
                    ->get();



                if ($billetageCDF->isEmpty()) {

                    return response()->json(['status' => 0, "msg" => "Vous devez d'abord effectuer un appro votre caisse en CDF semble n'est pas contenir de fonds !"]);
                } else {

                    if ($request->vightMille > $billetageCDF[0]->vightMilleFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 20.000f non disponible vous avez " . $billetageCDF[0]->vightMilleFran . " billets dans votre caisse"]);
                    } else if ($request->dixMille > $billetageCDF[0]->dixMilleFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 10.000f non disponible vous avez " . $billetageCDF[0]->dixMilleFran . " billets dans votre caisse"]);
                    } else if ($request->cinqMille > $billetageCDF[0]->cinqMilleFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 5000f non disponible vous avez " . $billetageCDF[0]->cinqMilleFran . " billets dans votre caisse"]);
                    } else if ($request->milleFranc > $billetageCDF[0]->milleFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 1000f non disponible vous avez " . $billetageCDF[0]->milleFran . " billets dans votre caisse"]);
                    } else if ($request->cinqCentFr > $billetageCDF[0]->cinqCentFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 500f non disponible vous avez " . $billetageCDF[0]->cinqCentFran . " billets dans votre caisse"]);
                    } else if ($request->deuxCentFranc > $billetageCDF[0]->deuxCentFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 200f non disponible vous avez " . $billetageCDF[0]->deuxCentFran . " billets dans votre caisse"]);
                    } else if ($request->centFranc > $billetageCDF[0]->centFran) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 100f non disponible vous avez " . $billetageCDF[0]->centFran . " billets dans votre caisse"]);
                    } else if ($request->cinquanteFanc > $billetageCDF[0]->cinquanteFan) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 50f non disponible vous avez " . $billetageCDF[0]->cinquanteFan . " billets dans votre caisse"]);
                    }


                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                    //RECUPERE LE COMPTE DU CAISSIER CONCERNE CDF
                    //$dataCompte = Comptes::where("NumAdherant", $request//->NumAbrege)
                    // ->where("CodeMonnaie", 2)->first();
                    $dataCompte = Comptes::where(function ($query) use ($request) {
                        $query->where('NumAdherant', $request->NumAbrege)
                            ->orWhere('NumCompte', $request->NumAbrege);
                    })
                        ->where('CodeMonnaie', 2)
                        ->first();

                    if ($dataCompte) {
                        $numCompteCaissierCDF = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "2")->first();
                        $CompteCaissierCDF = $numCompteCaissierCDF->NumCompte;
                        $codeAgenceCaissier = $numCompteCaissierCDF->CodeAgence;
                        $NomCaissier = $numCompteCaissierCDF->NomCompte;
                        $dataSystem = TauxEtDateSystem::latest()->first();

                        if (isset($request->Commission) and $request->Commission > 0) {
                            CompteurTransaction::create([
                                'fakevalue' => "0000",
                            ]);
                            $numOperation = [];
                            $numOperation = CompteurTransaction::latest()->first();
                            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                            //CREDITE LE COMPTE COMMISION USD
                            $compteCommissionCDF = "7270000000202";
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dataSystem->DateSystem,
                                "DateSaisie" => $dataSystem->DateSystem,
                                "Taux" => 1,
                                "TypeTransaction" => "C",
                                "CodeMonnaie" => 2,
                                "CodeAgence" => "20",
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $compteCommissionCDF,
                                "NumComptecp" => $dataCompte->NumCompte,
                                "Credit"  => $request->Commission,
                                "Creditusd"  => $request->Commission,
                                "Creditfc" => $request->Montant / $dataSystem->TauxEnFc,
                                "NomUtilisateur" => Auth::user()->name,
                                "Libelle" => "PRELEVEMENT DE COMMISSION SUR LE COMPTE " . $dataCompte->NumCompte . " par le caissier " . Auth::user()->name,
                                "refCompteMembre" => $compteCommissionCDF
                            ]);

                            //DEBITE LE COMPTE DU MEMBRE DE LA COMMISSION
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dataSystem->DateSystem,
                                "DateSaisie" => $dataSystem->DateSystem,
                                "Taux" => 1,
                                "TypeTransaction" => "D",
                                "CodeMonnaie" => 2,
                                "CodeAgence" => "20",
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $dataCompte->NumCompte,
                                "NumComptecp" =>  $compteCommissionCDF,
                                "Debit"  => $request->Commission,
                                "Debitusd"  => $request->Commission,
                                "Debitfc" => $request->Montant / $dataSystem->TauxEnFc,
                                "NomUtilisateur" => Auth::user()->name,
                                "Libelle" => "PRISE COMMISSION",
                            ]);
                        }



                        //RECUPERE LA LIGNE POUR L'OPERATION POSITIONNEE

                        $dataVisa = Positionnements::where("NumDocument", "=", $request->numDocument)->first();
                        //DEBITE LE COMPTE DU CLIENT 
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => 2,
                            "CodeAgence" => $dataCompte->CodeAgence,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $dataCompte->NumCompte,
                            "NumComptecp" => $CompteCaissierCDF,
                            "Operant" =>  $dataVisa->Retirant,
                            "Debit"  => $request->Montant,
                            "Debit"  => $request->Montant / $dataSystem->TauxEnFc,
                            "Debitfc" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifRetrait,
                        ]);
                        //CREDITE LE COMPTE DU CAISSIER
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => 2,
                            "CodeAgence" => $codeAgenceCaissier,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $CompteCaissierCDF,
                            "NumComptecp" => $dataCompte->NumCompte,
                            "Operant" => $NomCaissier,
                            "Credit"  => $request->Montant,
                            "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                            "Creditfc" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifRetrait,
                        ]);
                        //CREDIT  LE COMPTE COMPTABLE 33 EPARGNE
                        // $Ecompte_courant_cdf = EpargneAdhesionModel::first()->Ecompte_courant_cdf;
                        // Transactions::create([
                        //     "NumTransaction" => $NumTransaction,
                        //     "DateTransaction" => $dataSystem->DateSystem,
                        //     "DateSaisie" => $dataSystem->DateSystem,
                        //     "TypeTransaction" => "C",
                        //     "CodeMonnaie" => 2,
                        //     "CodeAgence" => $codeAgenceCaissier,
                        //     "NumDossier" => "DOS0" . $numOperation->id,
                        //     "NumDemande" => "V0" . $numOperation->id,
                        //     "NumCompte" => $Ecompte_courant_cdf,
                        //     "NumComptecp" => $dataCompte->NumCompte,
                        //     "Credit"  => $request->Montant,
                        //     "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        //     "Creditfc" => $request->Montant,
                        //     "NomUtilisateur" => Auth::user()->name,
                        //     "Libelle" => $request->motifRetrait,
                        // ]);

                        //RENSEIGNE LE BILLETAGE
                        $lastInsertedId = Transactions::latest()->first();
                        //COMPLETE LE BILLETAGE

                        BilletageCDF::create([
                            "refOperation" => $lastInsertedId->NumTransaction,
                            "NumCompte" => $dataCompte->NumCompte,
                            "NomMembre" => $dataCompte->NomCompte,
                            "NumAbrege" => $request->NumAbrege,
                            "Beneficiaire" => $dataVisa->Retirant,
                            "Motif" => $request->motifRetrait,
                            "Devise" => $request->devise,
                            "vightMilleFrancSortie" => $request->vightMille,
                            "dixMilleFrancSortie" => $request->dixMille,
                            "cinqMilleFrancSortie" => $request->cinqMille,
                            "milleFrancSortie" => $request->milleFranc,
                            "cinqCentFrancSortie" => $request->cinqCentFr,
                            "deuxCentFrancSortie" => $request->deuxCentFranc,
                            "centFrancSortie" => $request->centFranc,
                            "cinquanteFancSortie" => $request->cinquanteFanc,
                            "montantSortie" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "DateTransaction" => $dataSystem->DateSystem
                        ]);

                        //MET A JOUR LA TABLE POSITIONNEMENT
                        Positionnements::where("NumDocument", $request->numDocument)->update([
                            "Servie" => 1,
                        ]);
                        //SEND NOTIFICATION TO CUSTUMER
                        $this->sendNotification->sendNotification($dataCompte->NumAdherant, $request->devise, $request->Montant, "D", $dataVisa->Retirant);
                        return response()->json(['status' => 1, 'msg' => "Opération bien enregistrée."]);
                    } else {
                        return response()->json(['status' => 0, 'msg' => "Oooops! une erreur est survenue lors de l'éxécution de cette requête verifier bien que votre caisse est approvissionnée si l'erreur persiste veuillez contactez votre Administrateur système."]);
                    }
                }
            }

            if ($request->devise == "USD") {
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);

                //RECUPERE LA SOMME DE BILLETAGE USD
                $date = TauxEtDateSystem::orderBy('id', 'desc')->first()->DateSystem;
                $billetageUSD = BilletageUSD::select(
                    DB::raw("SUM(centDollars)-SUM(centDollarsSortie) as centDollar"),
                    DB::raw("SUM(cinquanteDollars)-SUM(cinquanteDollarsSortie) as cinquanteDollar"),
                    DB::raw("SUM(vightDollars)-SUM(vightDollarsSortie) as vightDollar"),
                    DB::raw("SUM(dixDollars)-SUM(dixDollarsSortie) as dixDollar"),
                    DB::raw("SUM(cinqDollars)-SUM(cinqDollarsSortie) as cinqDollar"),
                    DB::raw("SUM(unDollars)-SUM(unDollarsSortie) as unDollar"),
                )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $date)
                    ->groupBy("NomUtilisateur")
                    ->get();
                if (isset($billetageUSD[0])) {
                    if ($request->hundred > $billetageUSD[0]->centDollar) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 100$ non disponible vous avez " . $billetageUSD[0]->centDollar . " billets dans votre caisse"]);
                    } else if ($request->fitfty > $billetageUSD[0]->cinquanteDollar) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 50$ non disponible vous avez " . $billetageUSD[0]->cinquanteDollar . " billets dans votre caisse"]);
                    } else if ($request->twenty > $billetageUSD[0]->vightDollar) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 20$ non disponible vous avez " . $billetageUSD[0]->vightDollar . " billets dans votre caisse"]);
                    } else if ($request->ten > $billetageUSD[0]->dixDollar) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 10$ non disponible vous avez " . $billetageUSD[0]->dixDollar . " billets dans votre caisse"]);
                    } else if ($request->five > $billetageUSD[0]->cinqDollar) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 5$ non disponible vous avez " . $billetageUSD[0]->cinqDollar . " billets dans votre caisse"]);
                    } else if ($request->oneDollar > $billetageUSD[0]->unDollar) {
                        return response()->json(['status' => 0, 'msg' => "Oooops! Nombre de billet pour 1$ non disponible vous avez " . $billetageUSD[0]->unDollar . " billets dans votre caisse"]);
                    }


                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                    //RECUPERE LE COMPTE DU CAISSIER CONCERNE CDF
                    $dataCompte = Comptes::where(function ($query) use ($request) {
                        $query->where('NumAdherant', $request->NumAbrege)
                            ->orWhere('NumCompte', $request->NumAbrege);
                    })
                        ->where('CodeMonnaie', 1)
                        ->first();
                    if ($dataCompte) {
                        $numCompteCaissierUSD = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "1")->first();
                        $CompteCaissierUSD = $numCompteCaissierUSD->NumCompte;
                        $codeAgenceCaissier = $numCompteCaissierUSD->CodeAgence;
                        $NomCaissier = $numCompteCaissierUSD->NomCompte;
                        $dataSystem = TauxEtDateSystem::latest()->first();
                        //RECUPERE LA LIGNE POUR L'OPERATION POSITIONNEE

                        if (isset($request->Commission) and $request->Commission > 0) {
                            CompteurTransaction::create([
                                'fakevalue' => "0000",
                            ]);
                            $numOperation = [];
                            $numOperation = CompteurTransaction::latest()->first();
                            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                            //CREDITE LE COMPTE COMMISION USD
                            $compteCommissionUSD = "7270000000201";
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dataSystem->DateSystem,
                                "DateSaisie" => $dataSystem->DateSystem,
                                "Taux" => 1,
                                "TypeTransaction" => "C",
                                "CodeMonnaie" => 1,
                                "CodeAgence" => "20",
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $compteCommissionUSD,
                                "NumComptecp" => $dataCompte->NumCompte,
                                //   "Operant" => "COMPTE COMMISSION CDF",
                                "Credit"  => $request->Commission,
                                "Creditusd"  => $request->Commission,
                                "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                                "NomUtilisateur" => Auth::user()->name,
                                "Libelle" => "PRELEVEMENT DE COMMISSION SUR LE COMPTE " . $dataCompte->NumCompte . " par le caissier " . Auth::user()->name,
                                "refCompteMembre" => $compteCommissionUSD
                            ]);

                            //DEBITE LE COMPTE DU MEMBRE DE LA COMMISSION
                            Transactions::create([
                                "NumTransaction" => $NumTransaction,
                                "DateTransaction" => $dataSystem->DateSystem,
                                "DateSaisie" => $dataSystem->DateSystem,
                                "Taux" => 1,
                                "TypeTransaction" => "D",
                                "CodeMonnaie" => 1,
                                "CodeAgence" => "20",
                                "NumDossier" => "DOS00" . $numOperation->id,
                                "NumDemande" => "V00" . $numOperation->id,
                                "NumCompte" => $dataCompte->NumCompte,
                                "NumComptecp" =>  $compteCommissionUSD,
                                "Debit"  => $request->Commission,
                                "Debitusd"  => $request->Commission,
                                "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                                "NomUtilisateur" => Auth::user()->name,
                                "Libelle" => "PRISE COMMISSION",
                            ]);
                        }

                        $dataVisa = Positionnements::where("NumDocument", "=", $request->numDocument)->first();
                        //DEBITE LE COMPTE DU CLIENT 
                        CompteurTransaction::create([
                            'fakevalue' => "0000",
                        ]);
                        $numOperation = [];
                        $numOperation = CompteurTransaction::latest()->first();
                        $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" => 1,
                            "CodeAgence" => $dataCompte->CodeAgence,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $dataCompte->NumCompte,
                            "NumComptecp" => $CompteCaissierUSD,
                            "Operant" =>  $dataVisa->Retirant,
                            "Debit"  => $request->Montant,
                            "Debitusd"  => $request->Montant,
                            "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifRetrait,
                        ]);
                        //CREDITE LE COMPTE DU CAISSIER
                        Transactions::create([
                            "NumTransaction" => $NumTransaction,
                            "DateTransaction" => $dataSystem->DateSystem,
                            "DateSaisie" => $dataSystem->DateSystem,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" => 1,
                            "CodeAgence" => $codeAgenceCaissier,
                            "NumDossier" => "DOS0" . $numOperation->id,
                            "NumDemande" => "V0" . $numOperation->id,
                            "NumCompte" => $CompteCaissierUSD,
                            "NumComptecp" => $dataCompte->NumCompte,
                            "Operant" => $NomCaissier,
                            "Credit"  => $request->Montant,
                            "Creditusd"  => $request->Montant,
                            "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => $request->motifRetrait,
                        ]);
                        //CREDIT  LE COMPTE COMPTABLE 33 EPARGNE
                        // $Ecompte_courant_usd = EpargneAdhesionModel::first()->Ecompte_courant_usd;
                        // Transactions::create([
                        //     "NumTransaction" => $NumTransaction,
                        //     "DateTransaction" => $dataSystem->DateSystem,
                        //     "DateSaisie" => $dataSystem->DateSystem,
                        //     "TypeTransaction" => "C",
                        //     "CodeMonnaie" => 1,
                        //     "CodeAgence" => $codeAgenceCaissier,
                        //     "NumDossier" => "DOS0" . $numOperation->id,
                        //     "NumDemande" => "V0" . $numOperation->id,
                        //     "NumCompte" => $Ecompte_courant_usd,
                        //     "NumComptecp" => $dataCompte->NumCompte,
                        //     "Credit"  => $request->Montant,
                        //     "Creditusd"  => $request->Montant,
                        //     "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                        //     "NomUtilisateur" => Auth::user()->name,
                        //     "Libelle" => $request->motifRetrait,
                        // ]);

                        //RENSEIGNE LE BILLETAGE
                        $lastInsertedId = Transactions::latest()->first();
                        //COMPLETE LE BILLETAGE

                        BilletageUSD::create([
                            "refOperation" => $lastInsertedId->NumTransaction,
                            "NumCompte" => $dataCompte->NumCompte,
                            "NomMembre" => $dataCompte->NomCompte,
                            "NumAbrege" => $request->NumAbrege,
                            "Beneficiaire" => $dataVisa->Retirant,
                            "Motif" => $request->motifRetrait,
                            "Devise" => $request->devise,
                            "centDollarsSortie" => $request->hundred,
                            "cinquanteDollarsSortie" => $request->fitfty,
                            "vightDollarsSortie" => $request->twenty,
                            "dixDollarsSortie" => $request->ten,
                            "cinqDollarsSortie" => $request->five,
                            "unDollarsSortie" => $request->oneDollar,
                            "montantSortie" => $request->Montant,
                            "NomUtilisateur" => Auth::user()->name,
                            "DateTransaction" => $dataSystem->DateSystem
                        ]);
                        //MET A JOUR LA TABLE POSITIONNEMENT
                        Positionnements::where("NumDocument", $request->numDocument)->update([
                            "Servie" => 1,
                        ]);

                        //SEND NOTIFICATION TO CUSTOMER 

                        $this->sendNotification->sendNotification($dataCompte->NumAdherant, $request->devise, $request->Montant, "D", $dataVisa->Retirant);
                        return response()->json(['status' => 1, 'msg' => "Opération bien enregistrée."]);
                    }
                } else {
                    return response()->json(['status' => 0, 'msg' => "Oooops! une erreur est survenue lors de l'éxécution de cette requête verifier bien que votre caisse est approvissionnée si l'erreur persiste veuillez contactez votre Administrateur système."]);
                }
            }
        } else {
            return response()->json(['status' => 0, "msg" => "Erreur!."]);
        }
    }

    //PERMET D'ACCEDER A LA PAGE DE DELESTAGE 

    public function getDelestageHomePage()
    {
        return view("eco.pages.delestage");
    }

    //GET DELESTAGE INFORMATION

    public function getDelestageInfo()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();

        $billetageUSD = BilletageUSD::select(
            DB::raw("SUM(centDollars)-SUM(centDollarsSortie) as centDollars"),
            DB::raw("SUM(cinquanteDollars)-SUM(cinquanteDollarsSortie) as cinquanteDollars"),
            DB::raw("SUM(vightDollars)-SUM(vightDollarsSortie) as vightDollars"),
            DB::raw("SUM(dixDollars)-SUM(dixDollarsSortie) as dixDollars"),
            DB::raw("SUM(cinqDollars)-SUM(cinqDollarsSortie) as cinqDollars"),
            DB::raw("SUM(unDollars)-SUM(unDollarsSortie) as unDollars"),
            DB::raw("SUM(montantEntre)-SUM(montantSortie) as sommeMontantUSD"),
        )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $dataSystem->DateSystem)
            ->where("delested", "=", 0)
            ->groupBy("NomUtilisateur")
            ->get();

        // $getCommissionUSD = BilletageUsd::select(
        //     DB::raw("SUM(montantEntre)-SUM(montantSortie) as sommeCommissionUSD"),
        // )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $date)
        //     ->where("delested", "=", 0)
        //     ->where("is_commision", "=", 1)
        //     ->groupBy("NomUtilisateur")
        //     ->first();


        //RECUPERE LE BILLETAGE EN FRANC CONGOLAIS
        $billetageCDF = BilletageCDF::select(
            DB::raw("SUM(vightMilleFranc)-SUM(vightMilleFrancSortie) as vightMilleFranc"),
            DB::raw("SUM(dixMilleFranc)-SUM(dixMilleFrancSortie) as dixMilleFranc"),
            DB::raw("SUM(cinqMilleFranc)-SUM(cinqMilleFrancSortie) as cinqMilleFranc"),
            DB::raw("SUM(milleFranc)-SUM(milleFrancSortie) as milleFranc"),
            DB::raw("SUM(cinqCentFranc)-SUM(cinqCentFrancSortie) as cinqCentFranc"),
            DB::raw("SUM(deuxCentFranc)-SUM(deuxCentFrancSortie) as deuxCentFranc"),
            DB::raw("SUM(centFranc)-SUM(centFrancSortie) as centFranc"),
            DB::raw("SUM(cinquanteFanc)-SUM(cinquanteFancSortie) as cinquanteFanc"),
            DB::raw("SUM(montantEntre)-SUM(montantSortie) as sommeMontantCDF"),
        )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $dataSystem->DateSystem)
            ->where("delested", "=", 0)
            ->groupBy("NomUtilisateur")
            ->get();

        //RECUPERE LA COMMISSION PRISE

        // $getCommissionCDF = BilletageCdf::select(
        //     DB::raw("SUM(montantEntre)-SUM(montantSortie) as sommeCommissionCDF"),
        // )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $date)
        //     ->where("delested", "=", 0)
        //     ->where("is_commision", "=", 1)
        //     ->groupBy("NomUtilisateur")
        //     ->first();
        return response()->json([
            "status" => 1,
            "billetageUSD" => $billetageUSD,
            "billetageCDF" => $billetageCDF
        ]);
    }

    //VALIDATE DELESTAGE

    public function ValidateDelestage(Request $request)
    {

        if (isset($request->devise)) {
            if ($request->devise == "CDF") {
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
                //RECUPERE LE COMPTE DU CAISSIER CONCERNE CDF
                $numCompteCaissierCDF = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "2")->first();
                $CompteCaissierCDF = $numCompteCaissierCDF->NumCompte;

                //RECUPERE LE BILLETAGE EN FRANC CONGOLAIS
                $billetageCDF = BilletageCdf::select(
                    DB::raw("SUM(vightMilleFranc)-SUM(vightMilleFrancSortie) as vightMilleFranc"),
                    DB::raw("SUM(dixMilleFranc)-SUM(dixMilleFrancSortie) as dixMilleFranc"),
                    DB::raw("SUM(cinqMilleFranc)-SUM(cinqMilleFrancSortie) as cinqMilleFranc"),
                    DB::raw("SUM(milleFranc)-SUM(milleFrancSortie) as milleFranc"),
                    DB::raw("SUM(cinqCentFranc)-SUM(cinqCentFrancSortie) as cinqCentFranc"),
                    DB::raw("SUM(deuxCentFranc)-SUM(deuxCentFrancSortie) as deuxCentFranc"),
                    DB::raw("SUM(centFranc)-SUM(centFrancSortie) as centFranc"),
                    DB::raw("SUM(cinquanteFanc)-SUM(cinquanteFancSortie) as cinquanteFanc"),
                    DB::raw("SUM(montantEntre)-SUM(montantSortie) as sommeMontantCDF"),
                )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $dateSystem)
                    ->where("delested", "=", 0)
                    ->groupBy("NomUtilisateur")
                    ->first();
                //RENSEINE LE DELESTAGE
                BilletageCDF::where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $dateSystem)->update([
                    "delested" => 1
                ]);

                Delestages::create([
                    "Reference" => $NumTransaction,
                    "NumCompteCaissier" => $CompteCaissierCDF,
                    "vightMilleFranc" => $billetageCDF->vightMilleFranc,
                    "dixMilleFranc" => $billetageCDF->dixMilleFranc,
                    "cinqMilleFranc" => $billetageCDF->cinqMilleFranc,
                    "milleFranc" => $billetageCDF->milleFranc,
                    "cinqCentFranc" => $billetageCDF->cinqCentFranc,
                    "deuxCentFranc" => $billetageCDF->deuxCentFranc,
                    "centFranc" => $billetageCDF->centFranc,
                    "cinquanteFanc" => $billetageCDF->cinquanteFanc,
                    "montantCDF" => $billetageCDF->sommeMontantCDF,
                    "NomUtilisateur" => Auth::user()->name,
                    "NomDemandeur" => Auth::user()->name,
                    "DateTransaction" => $dateSystem,
                    "CodeMonnaie" => 2,
                ]);
                return response()->json([
                    "status" => 1,
                    "msg" => "Délestage effectuer avec succès",
                ]);
            } else if ($request->devise == "USD") {
                CompteurTransaction::create([
                    'fakevalue' => "0000",
                ]);
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
                $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
                //RECUPERE LE COMPTE DU CAISSIER CONCERNE CDF
                //RECUPERE LE COMPTE DU CAISSIER CONCERNE USD
                $numCompteCaissierUSD = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "1")->first();
                $CompteCaissierUSD = $numCompteCaissierUSD->NumCompte;

                //RECUPERE LE BILLETAGE EN DOLLARS
                $billetageUSD = BilletageUsd::select(
                    DB::raw("SUM(centDollars)-SUM(centDollarsSortie) as centDollars"),
                    DB::raw("SUM(cinquanteDollars)-SUM(cinquanteDollarsSortie) as cinquanteDollars"),
                    DB::raw("SUM(vightDollars)-SUM(vightDollarsSortie) as vightDollars"),
                    DB::raw("SUM(dixDollars)-SUM(dixDollarsSortie) as dixDollars"),
                    DB::raw("SUM(cinqDollars)-SUM(cinqDollarsSortie) as cinqDollars"),
                    DB::raw("SUM(unDollars)-SUM(unDollarsSortie) as unDollars"),
                    DB::raw("SUM(montantEntre)-SUM(montantSortie) as sommeMontantUSD"),
                )->where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $dateSystem)
                    ->where("delested", "=", 0)
                    ->groupBy("NomUtilisateur")
                    ->first();

                //RENSEINE LE DELESTAGE
                BilletageUSD::where("NomUtilisateur", "=", Auth::user()->name)->where("DateTransaction", "=", $dateSystem)->update([
                    "delested" => 1
                ]);

                Delestages::create([
                    "Reference" => $NumTransaction,
                    "NumCompteCaissier" => $CompteCaissierUSD,
                    "centDollars" => $billetageUSD->centDollars,
                    "cinquanteDollars" => $billetageUSD->cinquanteDollars,
                    "vightDollars" => $billetageUSD->vightDollars,
                    "dixDollars" => $billetageUSD->dixDollars,
                    "cinqDollars" => $billetageUSD->cinqDollars,
                    "unDollars" => $billetageUSD->unDollars,
                    "montantUSD" => $billetageUSD->sommeMontantUSD,
                    "NomUtilisateur" => Auth::user()->name,
                    "NomDemandeur" => Auth::user()->name,
                    "DateTransaction" => $dateSystem,
                    "CodeMonnaie" => 1,
                ]);

                return response()->json([
                    "status" => 1,
                    "msg" => "Délestage effectuer avec succès",
                ]);
            }
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Unknown error !",
            ]);
        }
    }


    //GET APPRO HOME PAGE 

    public function getApproHomePage()
    {
        return view("eco.pages.appro");
    }

    //GET ALL CAISSIERS 

    public function getAllCaissiers()
    {
        $data = Comptes::where("isCaissier", 1)->where("CodeMonnaie", 2)->where("isChefCaisse", 0)->get();
        $chefIfIsChefCaisse = Comptes::where("caissierId", Auth::user()->id)->where("isChefCaisse", 1)->first();
        return response()->json(["status" => 1, "data" => $data, "chefcaisse" => $chefIfIsChefCaisse]);
    }

    //SAVE APPRO

    public function SaveAppro(Request $request)
    {
        if (isset($request->devise) and isset($request->Montant) and isset($request->CaissierId)) {

            $dataCaissier = User::where("id", "=", $request->CaissierId)->first();

            if ($request->devise == "CDF") {
                $numCompteCaissePrCDF = $this->numCompteCaissePrCDF;
                $soldeComptePrincip = Transactions::select(
                    DB::raw("SUM(Debitfc)-SUM(Creditfc) as soldeCompte"),
                )->where("NumCompte", '=', $numCompteCaissePrCDF)
                    ->groupBy("NumCompte")
                    ->first();

                $montant = (int) $request->Montant;
                $solde = abs($soldeComptePrincip->soldeCompte);
                if ($solde >= $montant) {
                    $caissierEccount = Comptes::where("caissierId", $request->CaissierId)->where("CodeMonnaie", 2)->first();
                    //RECUPERE SUR LA TABLE USERS LE NOM QUI CORRESPOND A CE ID CDF
                    $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "D00" . $numOperation->id;
                    //RECUPERE LA DATE DU SYSTEME
                    BilletageAppro_cdf::create([
                        "Reference" => $NumTransaction,
                        "NumCompteCaissier" => $caissierEccount->NumCompte,
                        "vightMilleFranc" => $request->vightMille,
                        "dixMilleFranc" => $request->dixMille,
                        "cinqMilleFranc" => $request->cinqMille,
                        "milleFranc" => $request->milleFranc,
                        "cinqCentFranc" => $request->cinqCentFr,
                        "deuxCentFranc" => $request->deuxCentFranc,
                        "centFranc" => $request->centFranc,
                        "cinquanteFanc" => $request->cinquanteFanc,
                        "NomUtilisateur" => Auth::user()->name,
                        "NomDemandeur" => $dataCaissier->name,
                        "DateTransaction" =>   $dateSystem,
                        "montant" => $request->Montant
                    ]);

                    return response()->json(["status" => 1, "msg" => "Appro en attente de Validation"]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Le montant saisi est superieur au solde de la caisse principale son solde est: " . $soldeComptePrincip->soldeCompte]);
                }
            } else if ($request->devise == "USD") {

                $numCompteCaissePrUSD = $this->numCompteCaissePrUSD;
                $soldeComptePrincip = Transactions::select(
                    DB::raw("SUM(Debitusd)-SUM(Creditusd) as soldeCompte"),
                )->where("NumCompte", '=', $numCompteCaissePrUSD)
                    ->groupBy("NumCompte")
                    ->first();
                $montant = (int) $request->Montant;
                $solde = abs($soldeComptePrincip->soldeCompte);
                if ($solde >= $montant) {
                    $caissierEccount = Comptes::where("caissierId", $request->CaissierId)->where("CodeMonnaie", 1)->first();
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "D00" . $numOperation->id;
                    $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;


                    BilletageAppro_usd::create([
                        "Reference" => $NumTransaction,
                        "NumCompteCaissier" => $caissierEccount->NumCompte,
                        "centDollars" => $request->hundred,
                        "cinquanteDollars" => $request->fitfty,
                        "vightDollars" => $request->twenty,
                        "dixDollars" => $request->ten,
                        "cinqDollars" => $request->five,
                        "unDollars" => $request->oneDollar,
                        "NomUtilisateur" => Auth::user()->name,
                        "NomDemandeur" => $dataCaissier->name,
                        "DateTransaction" =>  $dateSystem,
                        "montant" => $request->Montant
                    ]);
                    return response()->json(["status" => 1, "msg" => "Appro en attente de Validation"]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Le montant saisi est superieur au solde de la caisse principale son solde est: " . $soldeComptePrincip->soldeCompte]);
                }
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Vous devez renseigner la devise, le caisier et le montant"]);
        }
    }

    //RECUPERE LES BILLETAGE LORS DE L'APPRO PAR UN CAISSIER 

    public function getApproInfo()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        //RECUPERE LE BILLETAGE EN FRANC
        $billetageCDF = BilletageAppro_cdf::where("NomDemandeur", "=", Auth::user()->name)->where("DateTransaction", "=", $dataSystem->DateSystem)
            ->where("received", "=", 0)
            ->first();
        //RECUPERE LE BILLETAGE EN DOLLARS
        $billetageUSD =  BilletageAppro_usd::where("NomDemandeur", "=", Auth::user()->name)->where("DateTransaction", "=", $dataSystem->DateSystem)
            ->where("received", "=", 0)
            ->first();
        return response()->json([
            "status" => 1,
            "billetageUSD" => $billetageUSD,
            "billetageCDF" => $billetageCDF
        ]);
    }

    //PERMET D'ACCEPTER L'APPRO PAR LE CAISSIER
    public function AcceptAppro(Request $request)
    {
        if (isset($request->devise)) {
            if ($request->devise == "CDF") {
                $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;

                $getApproRow = BilletageAppro_cdf::where("NomDemandeur", Auth::user()->name)->where("received", 0)->where("DateTransaction", $dateSystem)->first();
                $dataCaissier = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", 2)->first();
                $numCompteCaissierCDF = $dataCaissier->NumCompte;
                $tauxDuJour = TauxEtDateSystem::latest()->first()->TauxEnFc;
                $numCompteCaissePrCDF = $this->numCompteCaissePrCDF;
                $compteVirementInterGuichetCDF = $this->compteVirementInterGuichetCDF;

                //COMPTEUR DES OPERATIONS
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "D00" . $numOperation->id;
                //dd($getApproRow);
                //ECRITURE DE TRANSERT INTER GUICHET  DEBIT
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => 2,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $compteVirementInterGuichetCDF,
                    "NumComptecp" => $compteVirementInterGuichetCDF,
                    "Debit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Debitusd" => $getApproRow->montant / $tauxDuJour,
                    "Debitfc" => $getApproRow->montant,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);
                //CREDITE LE COMPTE DE VIREMENT INTER GUICHET
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => 2,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $compteVirementInterGuichetCDF,
                    "NumComptecp" => $compteVirementInterGuichetCDF,
                    "Credit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Creditusd" => $getApproRow->montant / $tauxDuJour,
                    "Creditfc" => $getApproRow->montant,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);
                //CREDITE LA CAISSE PRINCIPALE 
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => 2,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $numCompteCaissePrCDF,
                    "NumComptecp" => $numCompteCaissierCDF,
                    "Credit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Creditusd" => $getApproRow->montant / $tauxDuJour,
                    "Creditfc" => $getApproRow->montant,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);
                //DEBITE LA CAISSE DU CAISSIER 
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => 2,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $numCompteCaissierCDF,
                    "NumComptecp" => $numCompteCaissePrCDF,
                    "Debit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Debitusd" => $getApproRow->montant / $tauxDuJour,
                    "Debitfc" => $getApproRow->montant,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);


                //RENSEIGNE LE BILLETAGE
                BilletageCDF::create([
                    "refOperation" => $getApproRow->id,
                    "vightMilleFranc" => $getApproRow->vightMilleFranc,
                    "dixMilleFranc" => $getApproRow->dixMilleFranc,
                    "cinqMilleFranc" => $getApproRow->cinqMilleFranc,
                    "milleFranc" => $getApproRow->milleFranc,
                    "cinqCentFranc" => $getApproRow->cinqCentFranc,
                    "deuxCentFranc" => $getApproRow->deuxCentFranc,
                    "centFranc" => $getApproRow->centFranc,
                    "cinquanteFanc" => $getApproRow->cinquanteFanc,
                    "montantEntre" => $getApproRow->montant,
                    "NomUtilisateur" => $getApproRow->NomDemandeur,
                    "DateTransaction" => $getApproRow->DateTransaction,

                ]);

                //RENSEIGNE L'APPRO
                BilletageAppro_cdf::where("NomDemandeur", Auth::user()->name)->where("received", 0)->update([
                    "received" => 1
                ]);



                return response()->json([
                    "status" => 1,
                    "msg" => "Appro bien effectué."
                ]);
            } else if ($request->devise == "USD") {
                $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
                $getApproRow = BilletageAppro_usd::where("NomDemandeur", Auth::user()->name)->where("received", 0)->where("DateTransaction", $dateSystem)->first();
                $dataCaissier = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", 1)->first();
                $numCompteCaissierUSD = $dataCaissier->NumCompte;
                $tauxDuJour = TauxEtDateSystem::latest()->first()->TauxEnFc;
                $numCompteCaissePrUSD = $this->numCompteCaissePrUSD;
                $compteVirementInterGuichetUSD = $this->compteVirementInterGuichetUSD;

                //COMPTEUR DES OPERATIONS
                $numOperation = [];
                $numOperation = CompteurTransaction::latest()->first();
                $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "D00" . $numOperation->id;

                //ECRITURE DE TRANSERT INTER GUICHET  DEBIT
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => 1,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $compteVirementInterGuichetUSD,
                    "NumComptecp" => $compteVirementInterGuichetUSD,
                    "Debit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Debitusd" => $getApproRow->montant,
                    "Debitfc" => $getApproRow->montant * $tauxDuJour,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);

                //CREDITE LE COMPTE DE VIREMENT INTER GUICHET

                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => 1,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $compteVirementInterGuichetUSD,
                    "NumComptecp" => $compteVirementInterGuichetUSD,
                    "Credit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Creditusd" => $getApproRow->montant,
                    "Creditfc" => $getApproRow->montant * $tauxDuJour,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);
                //CREDITE LA CAISSE PRINCIPALE
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "D",
                    "CodeMonnaie" => 1,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $numCompteCaissePrUSD,
                    "NumComptecp" => $numCompteCaissierUSD,
                    "Credit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Creditusd" => $getApproRow->montant,
                    "Creditfc" => $getApproRow->montant * $tauxDuJour,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);
                //DEBITE LA CAISSE DU CAISSIER
                Transactions::create([
                    "NumTransaction" => $NumTransaction,
                    "DateTransaction" =>  $dateSystem,
                    "DateSaisie" =>  $dateSystem,
                    "Taux" => 1,
                    "TypeTransaction" => "C",
                    "CodeMonnaie" => 1,
                    "CodeAgence" => "20",
                    "NumDossier" => "DOS00" . $numOperation->id,
                    "NumDemande" => "V00" . $numOperation->id,
                    "NumCompte" => $numCompteCaissierUSD,
                    "NumComptecp" => $numCompteCaissePrUSD,
                    "Debit" => $getApproRow->montant,
                    "Operant" => $getApproRow->NomDemandeur,
                    "Debitusd" => $getApproRow->montant,
                    "Debitfc" => $getApproRow->montant * $tauxDuJour,
                    "NomUtilisateur" => Auth::user()->name,
                    "Libelle" => "Approvisionnement caisse secondaire de " . $getApproRow->NomDemandeur,
                ]);



                //RENSEIGNE LE BILLETAGE
                BilletageUSD::create([
                    "refOperation" => $getApproRow->id,
                    "centDollars" => $getApproRow->centDollars,
                    "cinquanteDollars" => $getApproRow->cinquanteDollars,
                    "vightDollars" => $getApproRow->vightDollars,
                    "dixDollars" => $getApproRow->dixDollars,
                    "cinqDollars" => $getApproRow->cinqDollars,
                    "unDollars" => $getApproRow->unDollars,
                    "montantEntre" => $getApproRow->montant,
                    "NomUtilisateur" => $getApproRow->NomDemandeur,
                    "DateTransaction" => $getApproRow->DateTransaction
                ]);
                //RENSEIGNE L'APPRO
                BilletageAppro_usd::where("NomDemandeur", Auth::user()->name)->where("received", 0)->update([
                    "received" => 1
                ]);
                return response()->json([
                    "status" => 1,
                    "msg" => "Appro bien effectué."
                ]);
            }
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Veuillez sélectionnez la devise"
            ]);
        }
    }

    //GET ENTREE TRESOR HOME PAGE 

    public function getEntreeTHomePage()
    {
        return view("eco.pages.entreeT");
    }

    //RECUPERE LE DELESTAGE EFFECTUE PAR UN CAISSIER

    public function GetDelestedItem()
    {
        $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
        $data = Delestages::where("received", 0)->where("DateTransaction", $dateSystem)->get();
        $billetageUSD = Delestages::where("received", 0)->where("DateTransaction", $dateSystem)->where("montantUSD", ">", 0)->first();
        $billetageCDF = Delestages::where("received", 0)->where("DateTransaction", $dateSystem)->where("montantCDF", ">", 0)->first();
        return response()->json(["status" => 1, "data" => $data, "billetageCDF" => $billetageCDF, "billetageUSD" => $billetageUSD]);
    }

    //PERMET D'ACCEPETER LE DELESTAGE EN USD 

    public function AcceptDelestageUSD(Request $request)
    {
        $checkIfRowNotConfirmed = Delestages::where("received", 1)->where("id", $request->refDelestage)->first();
        if (!$checkIfRowNotConfirmed) {
            $data = Delestages::where("id", $request->refDelestage)->first();
            $tauxDuJour = TauxEtDateSystem::latest()->first()->TauxEnFc;
            $numCompteCaissePrUSD = $this->numCompteCaissePrUSD;
            $compteVirementInterGuichetUSD = $this->compteVirementInterGuichetUSD;
            $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
            //COMPTEUR DES OPERATIONS
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "D00" . $numOperation->id;
            //ECRITURE DE TRANSERT INTER GUICHET  DEBIT
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "D",
                "CodeMonnaie" => 1,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $compteVirementInterGuichetUSD,
                "NumComptecp" => $compteVirementInterGuichetUSD,
                "Debit" => $data->montantUSD,
                "Operant" => $data->NomDemandeur,
                "Debitusd" => $data->montantUSD,
                "Debitfc" => $data->montantUSD * $tauxDuJour,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Delestage caisse secondaire de " . $data->NomDemandeur,
            ]);

            //CREDITE LE COMPTE DE VIREMENT INTER GUICHET

            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "C",
                "CodeMonnaie" => 1,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $compteVirementInterGuichetUSD,
                "NumComptecp" => $compteVirementInterGuichetUSD,
                "Credit" => $data->montantUSD,
                "Operant" => $data->NomDemandeur,
                "Creditusd" => $data->montant,
                "Creditfc" => $data->montantUSD * $tauxDuJour,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Delestage caisse secondaire de " . $data->NomDemandeur,
            ]);

            //DEBITE LE COMPTE DE LA CAISSE PRINCIPALE
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "D",
                "CodeMonnaie" => 1,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $numCompteCaissePrUSD,
                "NumComptecp" => $data->NumCompteCaissier,
                "Debit" => $data->montantUSD,
                "Operant" => $data->NomDemandeur,
                "Debitusd" => $data->montantUSD,
                "Debitfc" => $data->montantUSD * $tauxDuJour,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Entrée Tresor par " . $data->NomDemandeur,
            ]);

            //ON CREDITE LE COMPTE DU CAISSIER CONCERNE 
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "C",
                "CodeMonnaie" => 1,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $data->NumCompteCaissier,
                "NumComptecp" => $numCompteCaissePrUSD,
                "Credit" => $data->montantUSD,
                "Operant" => $data->NomDemandeur,
                "Creditusd" => $data->montantUSD,
                "Creditfc" => $data->montantUSD * $tauxDuJour,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Delestage caisse secondaire de " . $data->NomDemandeur,
            ]);
            //ON RENSEIGNE LE DELESTAGE
            Delestages::where("id", $request->refDelestage)->update([
                "received" => 1,
            ]);
            //CONFIRME LE DELESTAGE AU PRET DU CAISSIER 
            BilletageUSD::where("NomUtilisateur", $data->NomDemandeur)
                ->where("DateTransaction", $dateSystem)
                ->where("delested", 0)->update([
                    "delested" => 0
                ]);
            return response()->json(["status" => 1, "msg" => "Vous avez confirmez ce delestage avec succès."]);
        } else {
            return response()->json(["status" => 0, "msg" => "Ce delestage a été déjà confirmé"]);
        }
    }


    //PERMET D'ACCEPETER LE DELESTAGE EN CDF
    public function AcceptDelestageCDF(Request $request)
    {
        $checkIfRowNotConfirmed = Delestages::where("received", 1)->where("id", $request->refDelestage)->first();
        if (!$checkIfRowNotConfirmed) {
            $data = Delestages::where("id", $request->refDelestage)->first();
            $tauxDuJour = TauxEtDateSystem::latest()->first()->TauxEnFc;
            $numCompteCaissePrCDF = $this->numCompteCaissePrCDF;
            $compteVirementInterGuichetCDF = $this->compteVirementInterGuichetCDF;
            $dateSystem = TauxEtDateSystem::latest()->first()->DateSystem;
            //COMPTEUR DES OPERATIONS
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "D00" . $numOperation->id;
            //ECRITURE DE TRANSERT INTER GUICHET  DEBIT
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "D",
                "CodeMonnaie" => 2,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $compteVirementInterGuichetCDF,
                "NumComptecp" => $compteVirementInterGuichetCDF,
                "Debit" => $data->montantCDF,
                "Operant" => $data->NomDemandeur,
                "Debitusd" => $data->montantCDF / $tauxDuJour,
                "Debitfc" => $data->montantCDF,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Delestage caisse secondaire de " . $data->NomDemandeur,
            ]);

            //CREDITE LE COMPTE DE VIREMENT INTER GUICHET

            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "C",
                "CodeMonnaie" => 2,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $compteVirementInterGuichetCDF,
                "NumComptecp" => $compteVirementInterGuichetCDF,
                "Credit" => $data->montantCDF,
                "Operant" => $data->NomDemandeur,
                "Creditusd" => $data->montantCDF / $tauxDuJour,
                "Creditfc" => $data->montantCDF,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Delestage caisse secondaire de " . $data->NomDemandeur,
            ]);

            //DEBITE LE COMPTE DE LA CAISSE PRINCIPALE
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "D",
                "CodeMonnaie" => 2,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $numCompteCaissePrCDF,
                "NumComptecp" => $data->NumCompteCaissier,
                "Debit" => $data->montantCDF,
                "Operant" => $data->NomDemandeur,
                "Debitusd" => $data->montantCDF / $tauxDuJour,
                "Debitfc" => $data->montantCDF,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Entrée Tresor par " . $data->NomDemandeur,
            ]);

            //ON CREDITE LE COMPTE DU CAISSIER CONCERNE 
            Transactions::create([
                "NumTransaction" => $NumTransaction,
                "DateTransaction" =>  $dateSystem,
                "DateSaisie" =>  $dateSystem,
                "Taux" => 1,
                "TypeTransaction" => "C",
                "CodeMonnaie" => 2,
                "CodeAgence" => "20",
                "NumDossier" => "DOS00" . $numOperation->id,
                "NumDemande" => "V00" . $numOperation->id,
                "NumCompte" => $data->NumCompteCaissier,
                "NumComptecp" => $numCompteCaissePrCDF,
                "Credit" => $data->montantCDF,
                "Operant" => $data->NomDemandeur,
                "Creditusd" => $data->montantCDF / $tauxDuJour,
                "Creditfc" => $data->montantCDF,
                "NomUtilisateur" => Auth::user()->name,
                "Libelle" => "Delestage caisse secondaire de " . $data->NomDemandeur,
            ]);
            //ON RENSEIGNE LE DELESTAGE
            Delestages::where("id", $request->refDelestage)->update([
                "received" => 1,
            ]);
            //CONFIRME LE DELESTAGE AU PRET DU CAISSIER 
            BilletageCDF::where("NomUtilisateur", $data->NomDemandeur)
                ->where("DateTransaction", $dateSystem)
                ->where("delested", 0)->update([
                    "delested" => 0
                ]);
            return response()->json(["status" => 1, "msg" => "Vous avez confirmez ce delestage avec succès."]);
        } else {
            return response()->json(["status" => 0, "msg" => "Ce delestage a été déjà confirmé"]);
        }
    }

    //PERME DE SUPPRIMER UN DELESTAGE EN USD 

    public function RemoveDelestageItemUSD($id)
    {
        if (isset($id)) {
            Delestages::where("id", $id)->delete();
            return response()->json(["status" => 1]);
        } else {
            return response()->json(["status" => 0, "msg" => "Erreur"]);
        }
    }
    //PERME DE SUPPRIMER UN DELESTAGE EN CDF
    public function RemoveDelestageItemCDF($id)
    {
        if (isset($id)) {
            Delestages::where("id", $id)->delete();
            return response()->json(["status" => 1]);
        } else {
            return response()->json(["status" => 0, "msg" => "Erreur"]);
        }
    }

    public function getReleveHomePage()
    {
        return view("eco.pages.releve");
    }

    //GET SEACHED ACCOUNT BY NAME 
    public function getSearchedAccountByName(Request $request)
    {

        if (isset($request->searched_account_by_name)) {
            $item = $request->searched_account_by_name;
            $checkRowExist = Comptes::where("NomCompte", "LIKE", '%' . $item . '%')->get();
            if (count($checkRowExist) != 0) {
                $data = Comptes::where("NomCompte", "LIKE", '%' . $item . '%')->get();
                return response()->json([
                    "status" => 1,
                    "data" => $data,
                ]);
            } else {
                return response()->json(["status" => 0, "msg" => "Aucun enregistrement trouvé."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun nom de compte renseigné."]);
        }
    }

    //PERMET D'AFFICHER LE RELEVE 

    public function getReleveInfo(Request $request)
    {
        // return response()->json($request->all());
        if (isset($request->NumCompte)) {
            $checkDevise = Comptes::where("NumCompte", $request->NumCompte)->first();
            if ($checkDevise->CodeMonnaie == 2) {
                if ($checkDevise->RefCadre == 32 or $checkDevise->RefCadre == 31) {


                    //         $data = DB::select('SELECT transactions.RefTransaction,transactions.NumTransaction,transactions.DateTransaction,transactions.Libelle,transactions.Debitfc,transactions.Creditfc,comptes.NomCompte,comptes.CodeMonnaie, @cumul := @cumul + transactions.Debitfc-transactions.Creditfc 
                    // AS solde FROM ( SELECT @cumul := 0 ) AS C, transactions 
                    // INNER JOIN comptes ON transactions.NumCompte=comptes.NumCompte 
                    //  WHERE (transactions.NumCompte="' . $request->NumCompte . '" AND transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '") AND (transactions.Credit!=0 OR transactions.Debit!=0)
                    // ORDER BY transactions.DateTransaction,transactions.RefTransaction');
                    //         $dataSoldeReport = Transactions::select(
                    //             DB::raw("COALESCE(SUM(Creditfc)-SUM(Debitfc),0) as soldeReport"),
                    //         )->where("NumCompte", "=", $request->NumCompte)
                    //             ->where('transactions.DateTransaction', "<", $request->DateDebut)
                    //             ->groupBy("NumCompte")
                    //             ->first();
                    // Initialisation du solde
                    DB::statement(DB::raw('SET @cumul := 0'));
                    // Requête principale pour calculer le solde
                    $data = DB::select('
                        SELECT 
                            t.RefTransaction,
                            t.NumTransaction,
                            t.DateTransaction,
                            t.Libelle,
                            t.Debitfc,
                            t.Creditfc,
                            c.NomCompte,
                            c.CodeMonnaie,
                            @cumul := @cumul + t.Debitfc - t.Creditfc AS solde
                        FROM transactions t
                        INNER JOIN comptes c ON t.NumCompte = c.NumCompte
                        WHERE 
                            t.NumCompte = :numCompte 
                            AND t.DateTransaction BETWEEN :dateDebut AND :dateFin
                            AND (t.Creditfc != 0 OR t.Debitfc != 0)
                        ORDER BY 
                            t.DateTransaction, t.RefTransaction
                    ', [
                        'numCompte' => $request->NumCompte,
                        'dateDebut' => $request->DateDebut,
                        'dateFin' => $request->DateFin
                    ]);
                    // Calcul du solde reporté
                    $dataSoldeReport = Transactions::select(
                        DB::raw("COALESCE(SUM(Creditfc) - SUM(Debitfc), 0) as soldeReport")
                    )
                        ->where("NumCompte", "=", $request->NumCompte)
                        ->where('DateTransaction', "<", $request->DateDebut)
                        ->groupBy("NumCompte")
                        ->first();

                    $soldeInfo = Transactions::select(
                        DB::raw("COALESCE(SUM(transactions.Creditfc)-SUM(transactions.Debitfc),0) as soldeDispo"),
                        DB::raw("SUM(transactions.Creditfc) as TotalCredit"),
                        DB::raw("SUM(transactions.Debitfc) as TotalDebit"),
                    )->join("comptes", "transactions.NumCompte", "=", "comptes.NumCompte")
                        ->where("transactions.NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<=", $request->DateFin)
                        ->groupBy("transactions.NumCompte")
                        ->first();
                    $getCompteInfo = Comptes::where("NumCompte", $request->NumCompte)
                        ->where("CodeMonnaie", 2)
                        ->first();
                    return response()->json([
                        "status" => 1,
                        "dataReleve" => $data,
                        "dataSoldeReport" => $dataSoldeReport ? $dataSoldeReport : 0,
                        "devise" => "CDF",
                        "soldeInfo" => $soldeInfo,
                        "getCompteInfo" => $getCompteInfo
                    ]);
                } else {

                    $data = DB::select('SELECT transactions.RefTransaction,transactions.NumTransaction,transactions.DateTransaction,transactions.Libelle,transactions.Debitfc,transactions.Creditfc,comptes.NomCompte,comptes.CodeMonnaie, @cumul := @cumul + transactions.Creditfc-transactions.Debitfc 
            AS solde FROM ( SELECT @cumul := 0 ) AS C, transactions 
            INNER JOIN comptes ON transactions.NumCompte=comptes.NumCompte 
             WHERE (transactions.NumCompte="' . $request->NumCompte . '" AND transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '") AND (transactions.Credit!=0 OR transactions.Debit!=0)
            ORDER BY transactions.DateTransaction,transactions.RefTransaction');
                    $dataSoldeReport = Transactions::select(
                        DB::raw("COALESCE(SUM(Creditfc)-SUM(Debitfc),0) as soldeReport"),
                    )->where("NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<", $request->DateDebut)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeInfo = Transactions::select(
                        DB::raw("COALESCE(SUM(transactions.Creditfc)-SUM(transactions.Debitfc),0) as soldeDispo"),
                        DB::raw("SUM(transactions.Creditfc) as TotalCredit"),
                        DB::raw("SUM(transactions.Debitfc) as TotalDebit"),
                    )->join("comptes", "transactions.NumCompte", "=", "comptes.NumCompte")
                        ->where("transactions.NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<=", $request->DateFin)
                        ->groupBy("transactions.NumCompte")
                        ->first();
                    $getCompteInfo = Comptes::where("NumCompte", $request->NumCompte)
                        ->where("CodeMonnaie", 2)
                        ->first();
                    return response()->json([
                        "status" => 1,
                        "dataReleve" => $data,
                        "dataSoldeReport" => $dataSoldeReport ? $dataSoldeReport : 0,
                        "devise" => "CDF",
                        "soldeInfo" => $soldeInfo,
                        "getCompteInfo" => $getCompteInfo
                    ]);
                }
            } else if ($checkDevise->CodeMonnaie == 1) {

                if ($checkDevise->RefCadre == 32 or $checkDevise->RefCadre == 31) {

                    $data = DB::select('SELECT transactions.RefTransaction,transactions.NumTransaction,transactions.DateTransaction,transactions.Libelle,transactions.Debitusd,transactions.Creditusd,comptes.NomCompte,comptes.CodeMonnaie, @cumul := @cumul + transactions.Debitusd-transactions.Creditusd
                    AS solde FROM ( SELECT @cumul := 0 ) AS C, transactions 
                    INNER JOIN comptes ON transactions.NumCompte=comptes.NumCompte 
                     WHERE (transactions.NumCompte="' . $request->NumCompte . '" AND transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '") AND (transactions.Credit!=0 OR transactions.Debit!=0)
                    ORDER BY transactions.DateTransaction,transactions.RefTransaction');
                    $dataSoldeReport = Transactions::select(
                        DB::raw("COALESCE(SUM(Creditusd)-SUM(Debitusd),0) as soldeReport"),
                    )->where("NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<", $request->DateDebut)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeInfo = Transactions::select(
                        DB::raw("COALESCE(SUM(transactions.Creditusd)-SUM(transactions.Debitusd),0) as soldeDispo"),
                        DB::raw("SUM(transactions.Creditusd) as TotalCredit"),
                        DB::raw("SUM(transactions.Debitusd) as TotalDebit"),
                    )->join("comptes", "transactions.NumCompte", "=", "comptes.NumCompte")
                        ->where("transactions.NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<=", $request->DateFin)
                        ->groupBy("transactions.NumCompte")
                        ->first();
                    $getCompteInfo = Comptes::where("NumCompte", $request->NumCompte)
                        ->where("CodeMonnaie", 1)
                        ->first();
                    return response()->json([
                        "status" => 1,
                        "dataReleve" => $data,
                        "dataSoldeReport" => $dataSoldeReport ? $dataSoldeReport : 0,
                        "devise" => "USD",
                        "soldeInfo" => $soldeInfo,
                        "getCompteInfo" => $getCompteInfo
                    ]);
                } else {
                    $data = DB::select('SELECT transactions.RefTransaction,transactions.NumTransaction,transactions.DateTransaction,transactions.Libelle,transactions.Debitusd,transactions.Creditusd,comptes.NomCompte,comptes.CodeMonnaie, @cumul := @cumul + transactions.Creditusd-transactions.Debitusd
            AS solde FROM ( SELECT @cumul := 0 ) AS C, transactions 
            INNER JOIN comptes ON transactions.NumCompte=comptes.NumCompte 
             WHERE (transactions.NumCompte="' . $request->NumCompte . '" AND transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '") AND (transactions.Credit!=0 OR transactions.Debit!=0)
            ORDER BY transactions.DateTransaction,transactions.RefTransaction');
                    $dataSoldeReport = Transactions::select(
                        DB::raw("COALESCE(SUM(Creditusd)-SUM(Debitusd),0) as soldeReport"),
                    )->where("NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<", $request->DateDebut)
                        ->groupBy("NumCompte")
                        ->first();
                    $soldeInfo = Transactions::select(
                        DB::raw("COALESCE(SUM(transactions.Creditusd)-SUM(transactions.Debitusd),0) as soldeDispo"),
                        DB::raw("SUM(transactions.Creditusd) as TotalCredit"),
                        DB::raw("SUM(transactions.Debitusd) as TotalDebit"),
                    )->join("comptes", "transactions.NumCompte", "=", "comptes.NumCompte")
                        ->where("transactions.NumCompte", "=", $request->NumCompte)
                        ->where('transactions.DateTransaction', "<=", $request->DateFin)
                        ->groupBy("transactions.NumCompte")
                        ->first();
                    $getCompteInfo = Comptes::where("NumCompte", $request->NumCompte)
                        ->where("CodeMonnaie", 1)
                        ->first();
                    return response()->json([
                        "status" => 1,
                        "dataReleve" => $data,
                        "dataSoldeReport" => $dataSoldeReport ? $dataSoldeReport : 0,
                        "devise" => "USD",
                        "soldeInfo" => $soldeInfo,
                        "getCompteInfo" => $getCompteInfo
                    ]);
                }
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun compte trouvé."]);
        }
    }

    public function getSuspensHomePage()
    {
        return view("eco.pages.suspens");
    }

    //PERMET D'ENREGISTRER UN SUSPENS 

    public function addNewSuspensDeposit(Request $request)
    {
        $validator = validator::make($request->all(), [
            'devise' => 'required',
            'motifDepot' => 'required',
            'DeposantName' => 'required',
            'Montant' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }

        if ($request->devise == "CDF") {
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
            $dataSystem = TauxEtDateSystem::latest()->first();
            $dateDuJour = $dataSystem->DateSystem;
            $dateTransaction = date('Y-m-d', strtotime($dateDuJour . ' +1 day'));
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;
            //RECUPERE LE COMPTE DU CAISSIER CONCERNE CDF
            $dataCompte = Comptes::where("NumAdherant", $request->NumAbrege)
                ->where("CodeMonnaie", 2)->first();
            if ($dataCompte) {
                $numCompteCaissierCDF = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "2")->first();
                $CompteCaissierCDF = $numCompteCaissierCDF->NumCompte;
                $codeAgenceCaissier = $numCompteCaissierCDF->CodeAgence;
                $NomCaissier = $numCompteCaissierCDF->NomCompte;

                if ($request->Montant > 0) {
                    //DEBITE LE COMPTE DU CAISSIER
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateTransaction,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $codeAgenceCaissier,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $CompteCaissierCDF,
                        "NumComptecp" => $dataCompte->NumCompte,
                        "Operant" => $NomCaissier,
                        "Debit"  => $request->Montant,
                        "Debitusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Debitfc" => $request->Montant,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->motifDepot,
                        "isSuspens" => 1
                    ]);
                    //CREDITE LE COMPTE DU CLIENT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateTransaction,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataCompte->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataCompte->NumCompte,
                        "NumComptecp" => $CompteCaissierCDF,
                        "Operant" => $request->DeposantName,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Creditfc" => $request->Montant,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->motifDepot,
                        "isSuspens" => 1
                    ]);

                    //CREDIT  LE COMPTE COMPTABLE 33 EPARGNE
                    $Ecompte_courant_cdf = EpargneAdhesionModel::first()->Ecompte_courant_cdf;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateTransaction,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $codeAgenceCaissier,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $Ecompte_courant_cdf,
                        "NumComptecp" => $dataCompte->NumCompte,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Creditfc" => $request->Montant,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->motifDepot,
                        "isSuspens" => 1
                    ]);

                    //RENSEIGNE LE BILLETAGE
                    $lastInsertedId = Transactions::latest()->first();
                    //COMPLETE LE BILLETAGE

                    BilletageCDF::create([
                        "refOperation" => $lastInsertedId->NumTransaction,
                        "NumCompte" => $dataCompte->NumCompte,
                        "NomMembre" => $dataCompte->NomCompte,
                        "NumAbrege" => $request->NumAbrege,
                        "Beneficiaire" => $request->DeposantName,
                        "Motif" => $request->motifDepot,
                        "Devise" => $request->devise,
                        "vightMilleFranc" => $request->vightMille,
                        "dixMilleFranc" => $request->dixMille,
                        "cinqMilleFranc" => $request->cinqMille,
                        "milleFranc" => $request->milleFranc,
                        "cinqCentFranc" => $request->cinqCentFr,
                        "deuxCentFranc" => $request->deuxCentFranc,
                        "centFranc" => $request->centFranc,
                        "montantEntre" => $request->Montant,
                        "cinquanteFanc" => $request->cinquanteFanc,
                        "NomUtilisateur" => Auth::user()->name,
                        "DateTransaction" => $dateTransaction
                    ]);


                    return response()->json(["status" => 1, "msg" => "Opération bien enregistrée"]);
                } else {
                    return response()->json([
                        'validate_error' => $validator->messages()
                    ]);
                }
            } else {
                return response()->json(["status" => 0, "msg" => "Le compte en franc pour ce client n'est pas activé" . $request->searched_account]);
            }
        } else if ($request->devise == "USD") {
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;

            //RECUPERE LE COMPTE DU CAISSIER CONCERNE USD
            $dataCompte = Comptes::where("NumAdherant", $request->NumAbrege)
                ->where("CodeMonnaie", 1)->first();
            if ($dataCompte) {
                $numCompteCaissierUSD = Comptes::where("caissierId", "=", Auth::user()->id)->where("CodeMonnaie", "=", "1")->first();
                $CompteCaissierUSD = $numCompteCaissierUSD->NumCompte;
                $codeAgenceCaissier = $numCompteCaissierUSD->CodeAgence;
                $NomCaissier = $numCompteCaissierUSD->NomCompte;
                $dataSystem = TauxEtDateSystem::latest()->first();
                if ($request->Montant > 0) {
                    //CREDITE LE COMPTE DU CLIENT
                    $dateDuJour = $dataSystem->DateSystem;
                    $dateTransaction = date('Y-m-d', strtotime($dateDuJour . ' +1 day'));
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateTransaction,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataCompte->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataCompte->NumCompte,
                        "NumComptecp" => $CompteCaissierUSD,
                        "Operant" => $request->DeposantName,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant,
                        "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->motifDepot,
                        "isSuspens" => 1
                    ]);
                    //DEBITE LE COMPTE DU CAISSIER
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateTransaction,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $codeAgenceCaissier,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $CompteCaissierUSD,
                        "NumComptecp" => $dataCompte->NumCompte,
                        "Operant" => $NomCaissier,
                        "Debit"  => $request->Montant,
                        "Debitusd"  => $request->Montant,
                        "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->motifDepot,
                        "isSuspens" => 1
                    ]);
                    //CREDIT  LE COMPTE COMPTABLE 33 EPARGNE
                    $Ecompte_courant_usd = EpargneAdhesionModel::first()->Ecompte_courant_usd;
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" => $dateTransaction,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $codeAgenceCaissier,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $Ecompte_courant_usd,
                        "NumComptecp" => $dataCompte->NumCompte,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant,
                        "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->motifDepot,
                        "isSuspens" => 1
                    ]);

                    //RECUPERE LE DERNIER ID DU L'OPERATION INSEREE
                    $lastInsertedId = Transactions::latest()->first();
                    //RENSEIGNE LE BILLETAGE

                    BilletageUSD::create([
                        "refOperation" => $lastInsertedId->NumTransaction,
                        "NumCompte" => $dataCompte->NumCompte,
                        "NomMembre" => $dataCompte->NomCompte,
                        "NumAbrege" => $request->NumAbrege,
                        "Beneficiaire" => $request->DeposantName,
                        "Motif" => $request->motifDepot,
                        "Devise" => $request->devise,
                        "centDollars" => $request->hundred,
                        "cinquanteDollars" => $request->fitfty,
                        "vightDollars" => $request->twenty,
                        "dixDollars" => $request->ten,
                        "cinqDollars" => $request->five,
                        "unDollars" => $request->oneDollar,
                        "montantEntre" => $request->Montant,
                        "NomUtilisateur" => Auth::user()->name,
                        "DateTransaction" => $dateTransaction,

                    ]);
                    return response()->json(["status" => 1, "msg" => "Opération bien enregistrée"]);
                } else {
                    return response()->json([
                        'validate_error' => $validator->messages()
                    ]);
                }
            } else {
                return response()->json(["status" => 0, "msg" => "Le compte en franc pour ce client n'est pas activé" . $request->searched_account]);
            }
        }
    }

    //GET DEBITER HOME PAGE 

    public function getDebiterHomePage()
    {
        return view("eco.pages.debiter");
    }

    //RECUPERE LES INFORMATIONS POUR UN COMPTE A DEBITER 
    public function getDataForDebitAccount(Request $request)
    {
        if (isset($request->compte_a_debiter)) {
            //RECUPERE LE COMPTE DANS LA DB
            $checkData = Comptes::where("NumCompte", $request->compte_a_debiter)->orWhere("NumAdherant", $request->compte_a_debiter)->first();
            if ($checkData) {
                $data = Comptes::where('NumCompte', $request->compte_a_debiter)
                    ->orWhere('NumAdherant', $request->compte_a_debiter)
                    ->orderByRaw("NumCompte = '{$request->compte_a_debiter}' DESC")
                    ->first();
                // $data = Comptes::where("NumCompte", $request->compte_a_debiter)->orWhere("NumAdherant", $request->compte_a_debiter)->first();
                //ON RECUPERE LE SOLDE DU COMPTE 
                if ($data->CodeMonnaie == 2) {
                    $soldeCompte = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeCompte"),
                    )->where("NumCompte", '=', $data->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                } elseif ($data->CodeMonnaie == 1) {
                    $soldeCompte = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeCompte"),
                    )->where("NumCompte", '=', $data->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                }
                return response()->json([
                    "status" => 1,
                    "dataDebit" => $data,
                    "soldeCompteDebit" => $soldeCompte
                ]);
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Aucun numéro de compte trouvé"
                ]);
            }
        }
    }

    //RECUPERE LES INFORMATIONS POUR UN COMPTE A DEBITER 
    public function getDataForCreditAccount(Request $request)
    {
        if (isset($request->compte_a_crediter)) {
            //RECUPERE LE COMPTE DANS LA DB
            $checkData = Comptes::where("NumCompte", $request->compte_a_crediter)->orWhere("NumAdherant", $request->compte_a_crediter)->first();
            if ($checkData) {
                // // Recherche d'abord par NumCompte
                // $data = Comptes::where('NumCompte', $request->compte_a_crediter)->first();

                // // Si aucun résultat n'est trouvé, rechercher par NumAdherant
                // if (!$data) {
                //     $data = Comptes::where('NumAdherant', $request->compte_a_crediter)->first();
                // }
                $data = Comptes::where('NumCompte', $request->compte_a_crediter)
                    ->orWhere('NumAdherant', $request->compte_a_crediter)
                    ->orderByRaw("NumCompte = '{$request->compte_a_crediter}' DESC")
                    ->first();
                //ON RECUPERE LE SOLDE DU COMPTE 
                if ($data->CodeMonnaie == 2) {
                    $soldeCompte = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeCompte"),
                    )->where("NumCompte", '=', $data->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                } elseif ($data->CodeMonnaie == 1) {
                    $soldeCompte = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeCompte"),
                    )->where("NumCompte", '=', $data->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                }
                return response()->json([
                    "status" => 1,
                    "dataCredit" => $data,
                    "soldeCompteCredit" => $soldeCompte
                ]);
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Aucun numéro de compte trouvé"
                ]);
            }
        }
    }

    //SAVE DEBIT
    public function saveDebit(Request $request)
    {

        if (isset($request->compte_a_debiter) and isset($request->compte_a_crediter)) {

            if ($request->devise == 2) {
                $dataDebit = Comptes::where(function ($query) use ($request) {
                    $query->where('NumCompte', $request->compte_a_debiter)
                        ->where('CodeMonnaie', 2);
                })->orWhere(function ($query) use ($request) {
                    $query->where('NumAdherant', $request->compte_a_debiter)
                        ->where('CodeMonnaie', 2);
                })->orderByRaw("NumCompte = '{$request->compte_a_debiter}' DESC")
                    ->first();

                $dataCredit = Comptes::where(function ($query) use ($request) {
                    $query->where('NumCompte', $request->compte_a_crediter)
                        ->where('CodeMonnaie', 2);
                })->orWhere(function ($query) use ($request) {
                    $query->where('NumAdherant', $request->compte_a_crediter)
                        ->where('CodeMonnaie', 2);
                })->orderByRaw("NumCompte = '{$request->compte_a_crediter}' DESC")
                    ->first();

                if ($dataDebit->CodeMonnaie == 2 and $dataCredit->CodeMonnaie == 2) {
                    //VERIFIE LE SOLDE 
                    // $soldeCompteDebit = Transactions::select(
                    //     DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeCompte"),
                    // )->where("NumCompte", '=', $dataDebit->NumCompte)
                    //     ->groupBy("NumCompte")
                    //     ->first();

                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant and $dataDebit->RefGroupe == 330) {
                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant) {
                    //DEBITE LE COMPTE 
                    $dataSystem = TauxEtDateSystem::latest()->first();
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataDebit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataDebit->NumCompte,
                        "NumComptecp" =>  $dataCredit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Debit"  => $request->Montant,
                        "Debitusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Debitfc" => $request->Montant,
                        // "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                        "isVirement" => $request->isVirement ? 1 : 0
                    ]);

                    //ON CREDITE LE COMPTE 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompte,
                        "NumComptecp" =>  $dataDebit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Creditfc" => $request->Montant,
                        // "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                        "isVirement" => $request->isVirement ? 1 : 0
                    ]);
                    // $this->CheckTransactionStatus(871);
                    // $this->CheckTransactionStatus2(851);

                    //CETTE LOGIQUE PERMET D'ENVOYER UN MESSAGE AU CLIENT LORSQUE LE COMPTE MOUVEMENTER SONT DES COMPTES EPARGNE
                    $dataRefCompteClientDebit = Transactions::where("NumCompte", $request->compte_a_debiter)->orWhere("refCompteMembre", $request->compte_a_debiter)
                        ->where("NumCompte", "like", "33%")->first();
                    $dataRefCompteClientCredit = Transactions::where("NumCompte", $request->compte_a_crediter)->orWhere("refCompteMembre", $request->compte_a_crediter)
                        ->where("NumCompte", "like", "33%")
                        ->first();
                    if ($dataRefCompteClientDebit) {
                        if ($dataRefCompteClientDebit->CodeMonnaie == 1) {
                            $devise = "USD"; //USD
                            $this->sendNotification->sendNotificationComptabilite($dataRefCompteClientDebit->refCompteMembre, $devise, $request->Montant, $dataRefCompteClientDebit->TypeTransaction, $request->Libelle);
                        } else if ($dataRefCompteClientDebit->CodeMonnaie == 2) {
                            $devise = "CDF"; //CDF
                            $this->sendNotification->sendNotificationComptabilite($dataRefCompteClientDebit->refCompteMembre, $devise, $request->Montant, $dataRefCompteClientDebit->TypeTransaction, $request->Libelle);
                        }
                    }
                    if ($dataRefCompteClientCredit) {
                        if ($dataRefCompteClientCredit->CodeMonnaie == 1) {
                            $devise = "USD"; //USD
                            $this->sendNotification->sendNotificationComptabilite($dataRefCompteClientCredit->refCompteMembre, $devise, $request->Montant, $dataRefCompteClientCredit->TypeTransaction, $request->Libelle);
                        } else if ($dataRefCompteClientCredit->CodeMonnaie == 2) {
                            $devise = "CDF"; //CDF
                            $this->sendNotification->sendNotificationComptabilite($dataRefCompteClientCredit->refCompteMembre, $devise, $request->Montant, $dataRefCompteClientCredit->TypeTransaction, $request->Libelle);
                        }
                    }

                    return response()->json([
                        "status" => 1,
                        "msg" => "Opération bien enregistrée."
                    ]);
                    // } else {
                    //     return response()->json([
                    //         "status" => 0,
                    //         "msg" => "Le solde du compte à débiter est inferieur au montant saisi."
                    //     ]);
                    // }
                } else {
                    return response()->json([
                        "status" => 0,
                        "msg" => "Les devises pour ces deux comptes sont differentes."
                    ]);
                }
            } else if ($request->devise == 1) {
                $dataDebit = Comptes::where(function ($query) use ($request) {
                    $query->where('NumCompte', $request->compte_a_debiter)
                        ->where('CodeMonnaie', 1);
                })->orWhere(function ($query) use ($request) {
                    $query->where('NumAdherant', $request->compte_a_debiter)
                        ->where('CodeMonnaie', 1);
                })->orderByRaw("NumCompte = '{$request->compte_a_debiter}' DESC")
                    ->first();

                // $dataCredit = Comptes::where(function ($query) use ($request) {
                //     $query->where('NumCompte', $request->compte_a_crediter)
                //         ->where('CodeMonnaie', 1);
                // })->orWhere(function ($query) use ($request) {
                //     $query->where('NumAdherant', $request->compte_a_crediter)
                //         ->where('CodeMonnaie', 1);
                // })->orderByRaw("NumCompte = '{$request->compte_a_crediter}' DESC")
                //     ->first();

                // Recherche d'abord par NumCompte avec CodeMonnaie = 1
                $dataDebit = Comptes::where('NumCompte', $request->compte_a_debiter)
                    ->where('CodeMonnaie', 1)
                    ->first();

                // Si aucun résultat n'est trouvé, rechercher par NumAdherant avec CodeMonnaie = 1
                if (!$dataDebit) {
                    $dataDebit = Comptes::where('NumAdherant', $request->compte_a_debiter)
                        ->where('CodeMonnaie', 1)
                        ->first();
                }


                // Recherche d'abord par NumCompte avec CodeMonnaie = 1
                $dataCredit = Comptes::where('NumCompte', $request->compte_a_crediter)
                    ->where('CodeMonnaie', 1)
                    ->first();

                // Si aucun résultat n'est trouvé, rechercher par NumAdherant avec CodeMonnaie = 2
                if (!$dataCredit) {
                    $dataCredit = Comptes::where('NumAdherant', $request->compte_a_crediter)
                        ->where('CodeMonnaie', 1)
                        ->first();
                }

                if ($dataDebit->CodeMonnaie == 1 and $dataCredit->CodeMonnaie == 1) {
                    // if($dataDebit)
                    //VERIFIE LE SOLDE 
                    $soldeCompteDebit = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeCompte"),
                    )->where("NumCompte", '=', $dataDebit->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();
                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant and $dataDebit->RefGroupe == 330) {
                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant) {
                    //DEBITE LE COMPTE 
                    $dataSystem = TauxEtDateSystem::latest()->first();
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataDebit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataDebit->NumCompte,
                        "NumComptecp" =>  $dataCredit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Debit"  => $request->Montant,
                        "Debitusd"  => $request->Montant,
                        "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                        "isVirement" => $request->isVirement ? 1 : 0
                    ]);

                    //ON CREDITE LE COMPTE 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompte,
                        "NumComptecp" =>  $dataDebit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant,
                        "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                        "isVirement" => $request->isVirement ? 1 : 0
                    ]);

                    // $this->CheckTransactionStatus(870);
                    // $this->CheckTransactionStatus2(851);

                    return response()->json([
                        "status" => 1,
                        "msg" => "Opération bien enregistrée."
                    ]);
                    // } else {
                    //     return response()->json([
                    //         "status" => 0,
                    //         "msg" => "Le solde du compte à débiter est inferieur au montant saisi."
                    //     ]);
                    // }
                } else {
                    return response()->json([
                        "status" => 0,
                        "msg" => "Les devises pour ces deux comptes sont differentes."
                    ]);
                }
            }
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Veuillez renseigner le compte à débiter et le compte à créditer."
            ]);
        }
    }
    //CETE FONCTION PERMET DE DIMPLUQUER UNE OPERATION POUR INCREMENTE OU DECREMENTE LE RESULTAT A CHAQUE FOIS QU'UN COMPTE DE CHARGE EST TOUCHE
    // public function CheckTransactionStatus($numcompte)
    // {
    //     // Récupérer la dernière ligne insérée dans la table transactions
    //     $lastTransaction = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //         ->whereBetween('comptes.RefTypeCompte', [6, 7])
    //         ->orderBy('transactions.RefTransaction', 'desc')
    //         ->select('transactions.*') // Select only the columns from transactions
    //         ->first();

    //     // Vérifier si une transaction a été trouvée
    //     if ($lastTransaction) {
    //         // Récupérer le compte associé
    //         $account = Comptes::where('NumCompte', $lastTransaction->NumCompte)->first();

    //         // Log fetched account data
    //         Log::info('Fetched account data', ['account' => $account]);

    //         // Vérifier si le compte existe et que RefTypeCompte est 6 ou 7
    //         if ($account && in_array($account->RefTypeCompte, [6, 7])) {
    //             Log::info('Account exists and RefTypeCompte is in [6, 7]', ['RefTypeCompte' => $account->RefTypeCompte]);

    //             // Répliquer la transaction sans l'ID pour le premier compte
    //             $newTransaction = $lastTransaction->replicate(['RefTransaction']); // Ne pas répliquer l'ID
    //             $newTransaction->NumCompte = $numcompte; // S'assurer que c'est le bon format pour NumCompte

    //             // Appliquer la logique pour CodeMonnaie
    //             if ($lastTransaction->CodeMonnaie == 1) {
    //                 $newTransaction->Debitusd = $lastTransaction->Debitusd;
    //                 $newTransaction->Creditusd = $lastTransaction->Creditusd;
    //             } elseif ($lastTransaction->CodeMonnaie == 2) {
    //                 $newTransaction->Debitfc = $lastTransaction->Debitfc;
    //                 $newTransaction->Creditfc = $lastTransaction->Creditfc;
    //             }

    //             // Sauvegarder la nouvelle transaction
    //             $newTransaction->save();

    //             Log::info('Transaction duplicated successfully', ['transaction_id' => $newTransaction->id]);
    //             // return 'Transaction duplicated successfully.';
    //             //$this->CheckTransactionStatus(871, 851);
    //         } else {
    //             Log::error('Account not found or RefTypeCompte not in [6, 7]', ['transaction_id' => $lastTransaction->id, 'NumCompte' => $lastTransaction->NumCompte]);
    //             return 'Account not found or RefTypeCompte not in [6, 7].';
    //         }
    //     } else {
    //         Log::error('No transaction found');
    //         return 'No transaction found.';
    //     }
    // }

    //CETE FONCTION PERMET DE DIMPLUQUER UNE OPERATION POUR INCREMENTE OU DECREMENTE LE RESULTAT A CHAQUE FOIS QU'UN COMPTE DE CHARGE EST TOUCHE
    // public function CheckTransactionStatus2($numcompte)
    // {
    //     // Récupérer la dernière ligne insérée dans la table transactions
    //     $lastTransaction = Transactions::orderBy('RefTransaction', 'desc')->first();

    //     // Vérifier si une transaction a été trouvée
    //     if ($lastTransaction) {
    //         // Récupérer le compte associé
    //         $account = Comptes::where('NumCompte', $lastTransaction->NumCompte)->first();

    //         // Log fetched account data
    //         Log::info('Fetched account data', ['account' => $account]);

    //         // Vérifier si le compte existe et que RefTypeCompte est 6 ou 7
    //         if ($account && in_array($account->RefTypeCompte, [6, 7])) {
    //             Log::info('Account exists and RefTypeCompte is in [6, 7]', ['RefTypeCompte' => $account->RefTypeCompte]);

    //             // Répliquer la transaction sans l'ID
    //             $newTransaction = $lastTransaction->replicate(['RefTransaction']); // Ne pas répliquer l'ID
    //             $newTransaction->NumCompte = $numcompte; // S'assurer que c'est le bon format pour NumCompte

    //             // Appliquer la logique pour CodeMonnaie
    //             if ($lastTransaction->CodeMonnaie == 1) {
    //                 $newTransaction->Debitusd = $lastTransaction->Debitusd;
    //                 $newTransaction->Creditusd = $lastTransaction->Creditusd;
    //             } elseif ($lastTransaction->CodeMonnaie == 2) {
    //                 $newTransaction->Debitfc = $lastTransaction->Debitfc;
    //                 $newTransaction->Creditfc = $lastTransaction->Creditfc;
    //             }

    //             // Sauvegarder la nouvelle transaction
    //             $newTransaction->save();

    //             Log::info('Transaction duplicated successfully', ['transaction_id' => $newTransaction->id]);

    //             return 'Transaction duplicated successfully.';
    //         } else {
    //             Log::error('Account not found or RefTypeCompte not in [6, 7]', ['transaction_id' => $lastTransaction->id, 'NumCompte' => $lastTransaction->NumCompte]);
    //             return 'Account not found or RefTypeCompte not in [6, 7].';
    //         }
    //     } else {
    //         Log::error('No transaction found');
    //         return 'No transaction found.';
    //     }
    // }



    //GET CREDITER HOME PAGE

    public function getCrediterHomePage()
    {
        return view("eco.pages.crediter");
    }
    public function saveCredit(Request $request)
    {
        if (isset($request->compte_a_debiter) and isset($request->compte_a_crediter)) {
            if ($request->devise == 2) {
                $dataDebit = Comptes::where("NumCompte", $request->compte_a_debiter)->orWhere("NumAdherant", $request->compte_a_debiter)->where("CodeMonnaie", 2)->first();
                $dataCredit = Comptes::where("NumCompte", $request->compte_a_crediter)->orWhere("NumAdherant", $request->compte_a_crediter)->where("CodeMonnaie", 2)->first();
                if ($dataDebit->CodeMonnaie == 1 and $dataCredit->CodeMonnaie == 1) {
                    //VERIFIE LE SOLDE 
                    $soldeCompteDebit = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeCompte"),
                    )->where("NumCompte", '=', $dataDebit->NumCompte)
                        ->groupBy("NumCompte")
                        ->first();

                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant and $dataDebit->RefGroupe == 330) {
                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant) {
                    //DEBITE LE COMPTE 
                    $dataSystem = TauxEtDateSystem::latest()->first();
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataDebit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataDebit->NumCompte,
                        "NumComptecp" =>  $dataCredit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Debit"  => $request->Montant,
                        "Debitusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Debitfc" => $request->Montant,
                        // "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                    ]);

                    //ON CREDITE LE COMPTE 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompte,
                        "NumComptecp" =>  $dataDebit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant / $dataSystem->TauxEnFc,
                        "Creditfc" => $request->Montant,
                        // "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                    ]);
                    // $this->CheckTransactionStatus(871);
                    return response()->json([
                        "status" => 1,
                        "msg" => "Opération bien enregistrée."
                    ]);
                    // } else {
                    //     return response()->json([
                    //         "status" => 0,
                    //         "msg" => "Le solde du compte à débiter est inferieur au montant saisi."
                    //     ]);
                    // }
                } else {
                    return response()->json([
                        "status" => 0,
                        "msg" => "Les deux comptes doivent avoir la même devise."
                    ]);
                }
            } else if ($request->devise == 1) {
                $dataDebit = Comptes::where("NumCompte", $request->compte_a_debiter)->orWhere("NumAdherant", $request->compte_a_debiter)->where("CodeMonnaie", 2)->first();
                $dataCredit = Comptes::where("NumCompte", $request->compte_a_crediter)->orWhere("NumAdherant", $request->compte_a_crediter)->where("CodeMonnaie", 2)->first();
                if ($dataDebit->CodeMonnaie == 1 and $dataCredit->CodeMonnaie == 1) {
                    //VERIFIE LE SOLDE 
                    // $soldeCompteDebit = Transactions::select(
                    //     DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeCompte"),
                    // )->where("NumCompte", '=', $dataDebit->NumCompte)
                    //     ->groupBy("NumCompte")
                    //     ->first();
                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant and $dataDebit->RefGroupe == 330) {
                    // if ($soldeCompteDebit->soldeCompte >= $request->Montant) {
                    //DEBITE LE COMPTE 
                    $dataSystem = TauxEtDateSystem::latest()->first();
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "00" . $numOperation->id;

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataDebit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataDebit->NumCompte,
                        "NumComptecp" =>  $dataCredit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Debit"  => $request->Montant,
                        "Debitusd"  => $request->Montant,
                        "Debitfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                    ]);

                    //ON CREDITE LE COMPTE 

                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "DateTransaction" =>  $dataSystem->DateSystem,
                        "DateSaisie" => $dataSystem->DateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => "DOS0" . $numOperation->id,
                        "NumDemande" => "V0" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompte,
                        "NumComptecp" =>  $dataDebit->NumCompte,
                        "Operant" => Auth::user()->name,
                        "Credit"  => $request->Montant,
                        "Creditusd"  => $request->Montant,
                        "Creditfc" => $request->Montant * $dataSystem->TauxEnFc,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => $request->Libelle,
                    ]);
                    // $this->CheckTransactionStatus(870);
                    return response()->json([
                        "status" => 1,
                        "msg" => "Opération bien enregistrée."
                    ]);
                    // } else {
                    //     return response()->json([
                    //         "status" => 0,
                    //         "msg" => "Le solde du compte à débiter est inferieur au montant saisi."
                    //     ]);
                    // }
                } else {
                    return response()->json([
                        "status" => 0,
                        "msg" => "Les deux comptes doivent avoir la même devise."
                    ]);
                }
            }
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Veuillez renseigner le compte à débiter et le compte à créditer."
            ]);
        }
    }

    //PERMET D'EXTOURNER UNE OPERATION 

    public function extourneOperation($reference)
    {
        $data = Transactions::where("NumTransaction", "=", $reference)->first();
        $dataRefCompteClient = Transactions::where("NumTransaction", $reference)
            ->where("NumCompte", "like", "33%")
            ->first();

        if ($data) {
            if ($data->extourner != 1) {
                if ($data->NomUtilisateur == "AUTO") {
                    return response()->json(["status" => 0, "msg" => "Vous n'êtes pas autorisé à extourner une écriture automatique."]);
                }
                $data = Transactions::where("NumTransaction", "=", $reference)->get();
                for ($i = 0; $i < sizeof($data); $i++) {
                    if ($data[$i]->TypeTransaction == "C") {
                        //ON PASSE UNE ECRITURE CONTRAIRE CAD ON DEBITE LE COMPTE

                        Transactions::create([
                            "NumTransaction" => $data[$i]->NumTransaction,
                            "DateTransaction" => $data[$i]->DateTransaction,
                            "DateSaisie" => $data[$i]->DateSaisie,
                            "Taux" => 1,
                            "TypeTransaction" => "D",
                            "CodeMonnaie" =>  $data[$i]->CodeMonnaie,
                            "CodeAgence" => "20",
                            "NumDossier" => $data[$i]->NumDossier,
                            "NumDemande" => $data[$i]->NumDemande,
                            "NumCompte" => $data[$i]->NumCompte,
                            "NumComptecp" => $data[$i]->NumComptecp,
                            "Operant" => $data[$i]->Operant,
                            "Debit"  => $data[$i]->Credit,
                            "Debitusd"  => $data[$i]->Credit,
                            "Debitfc" => $data[$i]->Creditfc,
                            // "NomUtilisateur" => $data[$i]->NomUtilisateur,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => "Extournée: " . $data[$i]->Libelle,

                        ]);
                        if ($data[$i]->CodeMonnaie == 1) {
                            //CORRIGE LE BILLETAGE
                            BilletageUsd::where("refOperation", $data[$i]->RéfTransaction)->delete();
                        } else if ($data[$i]->CodeMonnaie == 2) {
                            //CORRIGE LE BILLETAGE
                            BilletageCdf::where("refOperation", $data[$i]->RéfTransaction)->delete();
                        }

                        Transactions::where("NumTransaction", "=", $data[$i]->NumTransaction)->update([
                            "extourner" => 1
                        ]);
                    } else if ($data[$i]->TypeTransaction == "D") {
                        //SI C UN DEBIT ON PASSE UNE ECRITURE CONTRAIRE CAD UN CREDIT
                        Transactions::create([
                            "NumTransaction" => $data[$i]->NumTransaction,
                            "DateTransaction" => $data[$i]->DateTransaction,
                            "DateSaisie" => $data[$i]->DateSaisie,
                            "Taux" => 1,
                            "TypeTransaction" => "C",
                            "CodeMonnaie" =>  $data[$i]->CodeMonnaie,
                            "CodeAgence" => "20",
                            "NumDossier" => $data[$i]->NumDossier,
                            "NumDemande" => $data[$i]->NumDemande,
                            "NumCompte" => $data[$i]->NumCompte,
                            "NumComptecp" => $data[$i]->NumComptecp,
                            "Operant" => $data[$i]->Operant,
                            "Credit"  => $data[$i]->Debit,
                            "Creditusd"  => $data[$i]->Debit,
                            "Creditfc" => $data[$i]->Debitfc,
                            // "NomUtilisateur" => $data[$i]->NomUtilisateur,
                            "NomUtilisateur" => Auth::user()->name,
                            "Libelle" => "Extournée: " . $data[$i]->Libelle,
                        ]);
                        if ($data[$i]->CodeMonnaie == 1) {
                            //CORRIGE LE BILLETAGE
                            BilletageUsd::where("refOperation", $reference)->delete();
                        } else if ($data[$i]->CodeMonnaie == 2) {
                            //CORRIGE LE BILLETAGE
                            BilletageCdf::where("refOperation", $reference)->delete();
                        }
                        Transactions::where("NumTransaction", "=", $data[$i]->NumTransaction)->update([
                            "extourner" => 1
                        ]);
                    }
                }
                //SEND NOTIFICATION
                if ($dataRefCompteClient) {
                    if ($dataRefCompteClient->CodeMonnaie == 1) {
                        $devise = "USD"; //USD
                    } else if ($dataRefCompteClient->CodeMonnaie == 2) {
                        $devise = "CDF"; //CDF
                    }
                    $this->sendNotification->sendNotificationExtourneOp($dataRefCompteClient->refCompteMembre, $devise, ($dataRefCompteClient->TypeTransaction == "D" ? $dataRefCompteClient->Debit : $dataRefCompteClient->Credit), $dataRefCompteClient->TypeTransaction);
                }

                // END SEND NOTIFICATION
                return response()->json(["status" => 1, "msg" => "Extourne bien effectuée"]);
                // return response()->json(["status" => 1, "data" => $data]);
            } else {
                return response()->json(["status" => 0, "msg" => "Cette opération est déjà extournée."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Référence non trouvée."]);
        }
    }

    //OBTIENT LES OPERATION JOURNALIERES DU COMPTABLE
    public function getDailyOperation()
    {

        $date = TauxEtDateSystem::orderBy('id', 'desc')->first()->DateSystem;
        //data = DB::select('SELECT * FROM transactions WHERE transactions.NomUtilisateur="' . Auth::user()->name . '" AND  transactions.DateTransaction="' . $date . '" GROUP BY transactions.NumTransaction LIMIT 20');
        $data = Transactions::where("transactions.NomUtilisateur", "=", Auth::user()->name)
            ->where("transactions.DateTransaction", "=", $date)
            ->where("comptes.isBilanAccount", "!=", 1)
            ->whereNotIn('comptes.NumCompte', [871, 851, 870, 850]) // Utiliser whereNotIn pour exclure plusieurs valeurs
            ->join("comptes", "transactions.NumCompte", "=", "comptes.NumCompte")
            ->selectRaw("transactions.NumTransaction,transactions.Creditfc,transactions.Debitfc,transactions.Creditusd,transactions.Debitusd,transactions.Libelle,transactions.Credit,transactions.Debit,transactions.TypeTransaction,transactions.NumCompte,transactions.CodeMonnaie")
            ->groupBy(

                "transactions.NumTransaction",
                "transactions.NumCompte",
                "transactions.Credit",
                "transactions.Debit",
                "transactions.Creditfc",
                "transactions.Debitfc",
                "transactions.Creditusd",
                "transactions.Debitusd",
                "transactions.Libelle",
                "transactions.TypeTransaction",
                "transactions.CodeMonnaie"
            )

            ->orderBy("transactions.NumTransaction", "desc")
            ->limit("20", "desc")
            ->get();
        return response()->json(["status" => 1, "data" => $data]);
    }


    //PERMET DE TROUVER UNE OPERATION RECHERCHEE MOYENNANT SA REFERENCE
    public function getSearchedOperation($reference)
    {
        $data = Transactions::where("NumTransaction", "=", $reference)->first();

        if ($data) {
            $data = Transactions::where("transactions.NumTransaction", "=", $reference)
                ->selectRaw(
                    "transactions.NumTransaction,
                         MAX(transactions.Creditfc) as Creditfc,
                         MAX(transactions.Debitfc) as Debitfc,
                         MAX(transactions.Creditusd) as Creditusd,
                         MAX(transactions.Debitusd) as Debitusd,
                         MAX(transactions.Libelle) as Libelle,
                         MAX(transactions.Credit) as Credit,
                         MAX(transactions.Debit) as Debit,
                         MAX(transactions.TypeTransaction) as TypeTransaction,
                         MAX(transactions.NumCompte) as NumCompte, 
                         MAX(transactions.CodeMonnaie) as CodeMonnaie"
                )
                ->join("comptes", "transactions.NumCompte", "=", "comptes.NumCompte")
                ->where("comptes.isBilanAccount", "!=", 1)
                ->groupBy("transactions.NumTransaction")
                ->get(); // Use first() to get only one record

            return response()->json(["status" => 1, "data" => $data]);
        } else {
            return response()->json(["status" => 0, "msg" => "L'opération correspondante à la référence recherchée n'a pas été trouvée."]);
        }
    }
    //GET COMMISSION CONFIG
    public function getCommissionConfig()
    {
        $data = EpargneAdhesionModel::first()->show_commission_pannel;
        return response()->json(["status" => 1, "data" => $data]);
    }








    // function recalculateBalances()
    // {
    //     $accounts = DB::table('comptes')->select('NumCompte')->get();

    //     foreach ($accounts as $account) {
    //         // Initialize the balance
    //         $balance = 0;
    //         // Fetch all transactions for the account, ordered by date and reference
    //         $transactions = Transactions::where('NumCompte', $account->NumCompte)
    //             ->orderBy('DateTransaction')
    //             ->orderBy('RefTransaction')
    //             ->get();

    //         foreach ($transactions as $transaction) {
    //             $balance += $transaction->Debitfc - $transaction->Creditfc;
    //             // Update the transaction with the new balance
    //             $transaction->solde = $balance;
    //             $transaction->save();
    //         }
    //     }

    //     Log::info('Recalculation of balances completed successfully.');
    // }
}
