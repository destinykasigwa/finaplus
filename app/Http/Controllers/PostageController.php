<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Comptes;
use App\Models\ClosedDay;
use App\Rules\TomorrowDate;
use App\Models\Transactions;
use Illuminate\Http\Request;
use App\Models\clotureExercice;
use App\Models\TauxEtDateSystem;
use Illuminate\Support\Facades\DB;
use App\Models\CompteurTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PostageController extends Controller
{
    //
    public function __construct()
    {
        $this->middleware("auth");
    }

    //GET CLOTURE HOME PAGE 

    public function getClotureHomePage()
    {
        return view("eco.pages.cloture");
    }


    public function definrDateSysteme(Request $request)
    {
        // Création d'un validateur manuel
        $validator = Validator::make($request->all(), [
            'dateWork' => ['required', 'date', new TomorrowDate],
        ]);

        $selectedDate = Carbon::parse($request->dateWork); // Convertir la date sélectionnée en instance Carbon
        $today = Carbon::today(); // Obtenir la date actuelle sans l'heure
        $maxDate = $today->addDays(5); // Calculer la limite de 5 jours

        if ($selectedDate->gt($maxDate)) { // Vérifie si la date sélectionnée est après la limite
            return response()->json(["status" => 0, "msg" => "Vous avez sélectionné une date trop éloignée."]);
        }

        // Vérification si la validation échoue
        if ($validator->fails() and Auth::user()->admin == 0) {
            return response()->json([
                'status' => 0,
                'msg' => 'La date du sytème doit être la date encours +1 vous avez saisi une date incorecte.',
                'errors' => $validator->errors()
            ]);
        }




        $tauxDuJour =  TauxEtDateSystem::orderBy('id', 'desc')->first();
        $checkIfDateUsed =  TauxEtDateSystem::where('DateSystem', '=', $request->dateWork)->first();
        if ($checkIfDateUsed and Auth::user()->admin == 0) {
            return response()->json(["status" => 0, "msg" => "Impossible d'utiliser une date déjà clotûrée veuillez contacter votre administrateur système merci."]);
        }

        if (!isset($request->dateWork)) {
            return response()->json(["status" => 0, "msg" => "Veuillez definir la date du système pour valider."]);
        }
        if (isset($request->dateWork) and !isset($request->Taux)) {
            //ON RECUPERE LE DERNIER TAUX 
            $tauxDuJour =  TauxEtDateSystem::orderBy('id', 'desc')->first();

            TauxEtDateSystem::create([
                "DateSystem" => $request->dateWork,
                "TauxEnDollar" => $tauxDuJour->Dollar,
                "TauxEnFc" => $tauxDuJour->TauxEnFc,
            ]);
            // RENSEIGNE LA DATE DANS LA TABLE CLOSED DAY

            ClosedDay::create([
                "closed" => 1,
                "DateSysteme" => $request->dateWork,

            ]);

            return response()->json(["status" => 1, "msg" => "La date du sytème a été definie avec succès merci."]);
        } else {
            //ON RECUPERE LE DERNIER TAUX 
            $tauxDuJour =  TauxEtDateSystem::orderBy('id', 'desc')->first();
            TauxEtDateSystem::create([
                "DateSystem" => $request->dateWork,
                "TauxEnDollar" => $request->usd,
                "TauxEnFc" => $request->Taux,
            ]);

            // RENSEIGNE LA DATE DANS LA TABLE CLOSED DAY

            ClosedDay::create([
                "closed" => 1,
                "DateSysteme" => $request->dateWork,

            ]);

            // return response()->json(["success" => 0, "msg" => "Vous n'avez pas definie la date ou le taux."]);
        }
        return response()->json(["status" => 1, "msg" => "La date du sytème a été definie avec succès merci."]);
    }

    //PERMET D'OUVRIR LA JOURNE 

    //PERMET D'OUVRIR UNE NOUVELLE JOURNEE
    public function openNewday()
    {
        ClosedDay::where("closed", "=", 1)->update([
            "closed" => 0,
        ]);
        return response()->json(["status" => 1, "msg" => "Vous avez ouvert cette journée avec succès."]);
    }

    //PERMET DE CLOTURE L'ANNEE ENCOURS 
    public function clotureAnnuelle()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $getExericeEncoursState = clotureExercice::where('AnneeExercice', date('Y', strtotime($dataSystem->DateSystem)))
            ->where("clotureState", 1)->first();
        if ($getExericeEncoursState) {
            return response()->json([
                "status" => 0,
                "msg" => "Cet exercice est déjà cloturé",
            ]);
        }
        try {
            //POUR LE CDF

            $soldeCompteProduitCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 7)
                ->where('transactions.CodeMonnaie', 2)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1)
                ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as soldeCompteProduitCDF'))
                ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
                ->get();


            $soldeCompteChargeCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 6)
                ->where('transactions.CodeMonnaie', 2)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1)
                ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) as soldeCompteChargeCDF'))
                ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
                ->get();



            //SOLDE CONSOLIDE COMPTES PRODUITS
            $soldeConsolideProduitCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 7)
                ->where('transactions.CodeMonnaie', 2)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1)
                ->select(DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as soldeCompteProduitCDF'))
                ->first();

            //SOLDE CONSOLIDE COMPTES CHARGE
            $soldeConsolideChargeCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 6)
                ->where('transactions.CodeMonnaie', 2)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1)
                ->select(DB::raw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) as soldeCompteConsolideChargeCDF'))
                ->first();

            //RECUPERE D'ABORD LE SOLDE DU COMPTE 85 RESULTAT AVANT IMPOT 
            // $soldeCompteAvantImpotCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            //     ->where('comptes.RefCadre', 85)
            //     ->where('transactions.CodeMonnaie', 2)
            //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
            //     //->where('transactions.extourner', "!=", 1)
            //     ->select(DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as soldeCompteCDF'))
            //     ->first();

            //RECUPERE D'ABORD LE SOLDE DU COMPTE  87 RESULTAT NET DE L'EXERCICE
            // $soldeCompteResultatNetCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            //     ->where('comptes.RefCadre', 87)
            //     ->where('transactions.CodeMonnaie', 2)
            //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
            //     //->where('transactions.extourner', "!=", 1)
            //     ->select(DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as soldeCompteCDF'))
            //     ->first();



            //SOLDE D'ABORD CE COMPTE
            // $this->InsertInTransaction($soldeCompteAvantImpotCDF->CodeAgence, "D", 851, "130202", $soldeCompteAvantImpotCDF->soldeCompteCDF, 2);


            $resultatNetExerciceCDF = $soldeConsolideProduitCDF->soldeCompteProduitCDF - $soldeConsolideChargeCDF->soldeCompteConsolideChargeCDF;
            //CREDITE LE COMPTE RESULTAT NET L'EXERCICE
            $this->InsertInTransaction(20, "C", 871, "130202", $resultatNetExerciceCDF, 2);

            //SOLDE LE COMPTE RESULTAT NET L'EXERCICE EN LE DEBUTANT
            $resultatNetExerciceCDF = $soldeConsolideProduitCDF->soldeCompteProduitCDF - $soldeConsolideChargeCDF->soldeCompteConsolideChargeCDF;
            $this->InsertInTransaction(20, "D", 871, "130202", $resultatNetExerciceCDF, 2);

            //PUIS CREDITE LE COMPTE RESULTAT NET 
            $this->InsertInTransaction(20, "C", "130202", 871, $soldeConsolideProduitCDF->soldeCompteProduitCDF - $soldeConsolideChargeCDF->soldeCompteConsolideChargeCDF, 2);

            for ($i = 0; $i < sizeof($soldeCompteProduitCDF); $i++) {
                if ($soldeCompteProduitCDF[$i]->soldeCompteProduitCDF > 0) {
                    //APRES CECI ON DEBITE LES COMPTE PRODUITS
                    $this->InsertInTransaction(20, "D", $soldeCompteProduitCDF[$i]->NumCompte, 871, $soldeCompteProduitCDF[$i]->soldeCompteProduitCDF, 2);
                }
            }

            for ($i = 0; $i < sizeof($soldeCompteChargeCDF); $i++) {
                if ($soldeCompteChargeCDF[$i]->soldeCompteChargeCDF > 0) {
                    //APRES CECI ON CREDITE LES COMPTE CHARGE
                    $this->InsertInTransaction(20, "C", $soldeCompteChargeCDF[$i]->NumCompte, 871, $soldeCompteChargeCDF[$i]->soldeCompteChargeCDF, 2);
                }
            }


            //POUR LE USD
            $soldeCompteProduitUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 7)
                ->where('transactions.CodeMonnaie', 1)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1)
                ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Creditusd) - SUM(transactions.Debitusd) as soldeCompteProduitUSD'))
                ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
                ->get();


            $soldeCompteChargeUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 6)
                ->where('transactions.CodeMonnaie', 1)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1) 
                ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) as soldeCompteChargeUSD'))
                ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
                ->get();



            //SOLDE CONSOLIDE COMPTES PRODUITS
            $soldeConsolideProduitUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 7)
                ->where('transactions.CodeMonnaie', 1)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1) 
                ->select(DB::raw('SUM(transactions.Creditusd) - SUM(transactions.Debitusd) as soldeCompteProduitUSD'))
                ->first();

            //SOLDE CONSOLIDE COMPTES CHARGE
            $soldeConsolideChargeUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->where('comptes.RefTypeCompte', 6)
                ->where('transactions.CodeMonnaie', 1)
                ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
                //->where('transactions.extourner', "!=", 1)
                ->select(DB::raw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) as soldeCompteConsolideChargeUSD'))
                ->first();



            //RECUPERE D'ABORD LE SOLDE DU COMPTE 85 RESULTAT AVANT IMPOT 
            // $soldeCompteAvantImpotUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            //     ->where('comptes.RefCadre', 85)
            //     ->where('transactions.CodeMonnaie', 1)
            //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
            //     //->where('transactions.extourner', "!=", 1)
            //     ->select(DB::raw('SUM(transactions.Creditusd) - SUM(transactions.Debitusd) as soldeCompteUSD'))
            //     ->first();

            //RECUPERE D'ABORD LE SOLDE DU COMPTE  87 RESULTAT NET DE L'EXERCICE
            // $soldeCompteResultatNetUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            //     ->where('comptes.RefCadre', 87)
            //     ->where('transactions.CodeMonnaie', 1)
            //     //->where('transactions.extourner', "!=", 1)
            //     ->select(DB::raw('SUM(transactions.Creditusd) - SUM(transactions.Debitusd) as soldeCompteUSD'))
            //     ->first();


            //SOLDE D'ABORD CE COMPTE RESULTAT AVANT IMPOT 
            // $this->InsertInTransaction($soldeCompteAvantImpotUSD->CodeAgence, "D", 850, "130201", $soldeCompteAvantImpotUSD->soldeCompteUSD, 1);

            $resultatNetExerciceUSD = $soldeConsolideProduitUSD->soldeCompteProduitUSD - $soldeConsolideChargeUSD->soldeCompteConsolideChargeUSD;
            //CREDITE LE COMPTE RESULTAT NET L'EXERCICE 
            $this->InsertInTransaction(20, "C", 870, "130201", $resultatNetExerciceUSD, 1);
            //PUIS LE DEBITE 
            $this->InsertInTransaction(20, "D", 870, "130201", $resultatNetExerciceUSD, 1);

            //PUIS CREDITE LE COMPTE RESULTAT NET 
            $this->InsertInTransaction(20, "C", "130201", 870, $soldeConsolideProduitUSD->soldeCompteProduitUSD - $soldeConsolideChargeUSD->soldeCompteConsolideChargeUSD, 1);

            for ($i = 0; $i < sizeof($soldeCompteProduitUSD); $i++) {
                if ($soldeCompteProduitUSD[$i]->soldeCompteProduitUSD > 0) {
                    //APRES CECI ON DEBITE LES COMPTE PRODUITS
                    $this->InsertInTransaction(20, "D", $soldeCompteProduitUSD[$i]->NumCompte, 870, $soldeCompteProduitUSD[$i]->soldeCompteProduitUSD, 1);
                }
            }

            for ($i = 0; $i < sizeof($soldeCompteChargeUSD); $i++) {
                if ($soldeCompteChargeUSD[$i]->soldeCompteChargeUSD > 0) {
                    //APRES CECI ON CREDITE LES COMPTE CHARGE
                    $this->InsertInTransaction(20, "C", $soldeCompteChargeUSD[$i]->NumCompte, 870, $soldeCompteChargeUSD[$i]->soldeCompteChargeUSD, 1);
                }
            }
            //CLOTURE L'EXERCIE EN COURS
            $getRow = clotureExercice::where("AnneeExercice", date('Y', strtotime($dataSystem->DateSystem)))->first();
            if (!$getRow) {
                clotureExercice::create([
                    "AnneeExercice" => date('Y', strtotime($dataSystem->DateSystem)),
                    "clotureState" => 1
                ]);
            } else {
                clotureExercice::where("AnneeExercice", date('Y', strtotime($dataSystem->DateSystem)))->update([
                    "AnneeExercice" => date('Y', strtotime($dataSystem->DateSystem)),
                    "clotureState" => 1
                ]);
            }
            return response()->json([
                "status" => 1,
                "msg" => "Clotûre annuelle bien effectuée",
            ]);
        } catch (\Throwable $e) {
            //throw $th;
            return response()->json(["status" => 0, "msg" => "une erreur est survenu", "error" => $e->getMessage()]);
        }
    }




    public function InsertInTransaction($codeAgence, $typeTansaction, $NumCompte, $NumComptecp, $montant, $CodeMonnaie)
    {
        CompteurTransaction::create([
            'fakevalue' => "0000",
        ]);
        $numOperation = [];
        $numOperation = CompteurTransaction::latest()->first();
        $NumTransaction =  "CA00" . $numOperation->id;
        $dataSystem = TauxEtDateSystem::latest()->first();
        Transactions::create([
            "NumTransaction" => $NumTransaction,
            "DateTransaction" => $dataSystem->DateSystem,
            "DateSaisie" => date("Y-m-d"),
            "Taux" => 1,
            "TypeTransaction" => $typeTansaction,
            "CodeMonnaie" => $CodeMonnaie,
            "CodeAgence" => $codeAgence,
            "NumDossier" => "DOS0" . $numOperation->id,
            "NumDemande" => "V0" . $numOperation->id,
            "NumCompte" => $NumCompte,
            "NumComptecp" =>  $NumComptecp,
            $typeTansaction == "D" ? "Debit" : "Credit"  => $montant,
            $typeTansaction == "D" ? "Debitusd" : "Creditusd"  => $CodeMonnaie == 2 ? $montant / $dataSystem->TauxEnFc : $montant,
            $typeTansaction == "D" ? "Debitfc" : "Creditfc" => $CodeMonnaie == 1 ? $montant * $dataSystem->TauxEnFc : $montant,
            "NomUtilisateur" => Auth::user()->name,
            "Libelle" => $NumCompte == "130202" || $NumCompte == "130201" ? "RESULTAT NET DE L'EXERCICE " . date('Y', strtotime($dataSystem->DateSystem)) : " SOLDE DE COMPTE POUR LA CLOTURE ANNUELLE " . date('Y', strtotime($dataSystem->DateSystem)),
        ]);
    }
}
