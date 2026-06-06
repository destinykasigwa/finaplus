<?php

namespace App\Http\Controllers;

use App\Constants\JournalType;
use App\Models\Agences;
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
    // public function clotureAnnuelle()
    // {
    //     $dataSystem = TauxEtDateSystem::latest()->first();
    //     $getExericeEncoursState = clotureExercice::where('AnneeExercice', date('Y', strtotime($dataSystem->DateSystem)))
    //         ->where("clotureState", 1)->first();
    //     if ($getExericeEncoursState) {
    //         return response()->json([
    //             "status" => 0,
    //             "msg" => "Cet exercice est déjà cloturé",
    //         ]);
    //     }
    //     try {
    //         //POUR LE CDF

    //         $soldeCompteProduitCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //             ->where('comptes.RefTypeCompte', 7)
    //             ->where('transactions.CodeMonnaie', 2)
    //             ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //             //->where('transactions.extourner', "!=", 1)
    //             ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as soldeCompteProduitCDF'))
    //             ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
    //             ->get();


    //         $soldeCompteChargeCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //             ->where('comptes.RefTypeCompte', 6)
    //             ->where('transactions.CodeMonnaie', 2)
    //             ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //             //->where('transactions.extourner', "!=", 1)
    //             ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) as soldeCompteChargeCDF'))
    //             ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
    //             ->get();



    //         //SOLDE CONSOLIDE COMPTES PRODUITS
    //         // $soldeConsolideProduitCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //         //     ->where('comptes.RefTypeCompte', 7)
    //         //     ->where('transactions.CodeMonnaie', 2)
    //         //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //         //     //->where('transactions.extourner', "!=", 1)
    //         //     ->select(DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as soldeCompteProduitCDF'))
    //         //     ->first();

    //         //SOLDE CONSOLIDE COMPTES CHARGE
    //         // $soldeConsolideChargeCDF = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //         //     ->where('comptes.RefTypeCompte', 6)
    //         //     ->where('transactions.CodeMonnaie', 2)
    //         //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //         //     //->where('transactions.extourner', "!=", 1)
    //         //     ->select(DB::raw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) as soldeCompteConsolideChargeCDF'))
    //         //     ->first();


    //         for ($i = 0; $i < sizeof($soldeCompteProduitCDF); $i++) {
    //             if ($soldeCompteProduitCDF[$i]->soldeCompteProduitCDF > 0) {
    //                 //APRES CECI ON DEBITE LES COMPTE PRODUITS
    //                 $this->InsertInTransaction(20, "D", $soldeCompteProduitCDF[$i]->NumCompte, 871, $soldeCompteProduitCDF[$i]->soldeCompteProduitCDF, 2);
    //             }
    //         }

    //         for ($i = 0; $i < sizeof($soldeCompteChargeCDF); $i++) {
    //             if ($soldeCompteChargeCDF[$i]->soldeCompteChargeCDF > 0) {
    //                 //APRES CECI ON CREDITE LES COMPTE CHARGE
    //                 $this->InsertInTransaction(20, "C", $soldeCompteChargeCDF[$i]->NumCompte, 871, $soldeCompteChargeCDF[$i]->soldeCompteChargeCDF, 2);
    //             }
    //         }


    //         //POUR LE USD
    //         $soldeCompteProduitUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //             ->where('comptes.RefTypeCompte', 7)
    //             ->where('transactions.CodeMonnaie', 1)
    //             ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //             //->where('transactions.extourner', "!=", 1)
    //             ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Creditusd) - SUM(transactions.Debitusd) as soldeCompteProduitUSD'))
    //             ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
    //             ->get();


    //         $soldeCompteChargeUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //             ->where('comptes.RefTypeCompte', 6)
    //             ->where('transactions.CodeMonnaie', 1)
    //             ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //             //->where('transactions.extourner', "!=", 1) 
    //             ->select('transactions.NumCompte', 'comptes.NomCompte', DB::raw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) as soldeCompteChargeUSD'))
    //             ->groupBy('transactions.NumCompte', 'comptes.NomCompte')
    //             ->get();



    //         //SOLDE CONSOLIDE COMPTES PRODUITS
    //         // $soldeConsolideProduitUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //         //     ->where('comptes.RefTypeCompte', 7)
    //         //     ->where('transactions.CodeMonnaie', 1)
    //         //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //         //     //->where('transactions.extourner', "!=", 1) 
    //         //     ->select(DB::raw('SUM(transactions.Creditusd) - SUM(transactions.Debitusd) as soldeCompteProduitUSD'))
    //         //     ->first();

    //         //SOLDE CONSOLIDE COMPTES CHARGE
    //         // $soldeConsolideChargeUSD = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
    //         //     ->where('comptes.RefTypeCompte', 6)
    //         //     ->where('transactions.CodeMonnaie', 1)
    //         //     ->where('transactions.DateTransaction', "<=", $dataSystem->DateSystem)
    //         //     //->where('transactions.extourner', "!=", 1)
    //         //     ->select(DB::raw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) as soldeCompteConsolideChargeUSD'))
    //         //     ->first();

    //         for ($i = 0; $i < sizeof($soldeCompteProduitUSD); $i++) {
    //             if ($soldeCompteProduitUSD[$i]->soldeCompteProduitUSD > 0) {
    //                 //APRES CECI ON DEBITE LES COMPTE PRODUITS
    //                 $this->InsertInTransaction(20, "D", $soldeCompteProduitUSD[$i]->NumCompte, 870, $soldeCompteProduitUSD[$i]->soldeCompteProduitUSD, 1);
    //             }
    //         }

    //         for ($i = 0; $i < sizeof($soldeCompteChargeUSD); $i++) {
    //             if ($soldeCompteChargeUSD[$i]->soldeCompteChargeUSD > 0) {
    //                 //APRES CECI ON CREDITE LES COMPTE CHARGE
    //                 $this->InsertInTransaction(20, "C", $soldeCompteChargeUSD[$i]->NumCompte, 870, $soldeCompteChargeUSD[$i]->soldeCompteChargeUSD, 1);
    //             }
    //         }
    //         //CLOTURE L'EXERCIE EN COURS
    //         $getRow = clotureExercice::where("AnneeExercice", date('Y', strtotime($dataSystem->DateSystem)))->first();
    //         if (!$getRow) {
    //             clotureExercice::create([
    //                 "AnneeExercice" => date('Y', strtotime($dataSystem->DateSystem)),
    //                 "clotureState" => 1
    //             ]);
    //         } else {
    //             clotureExercice::where("AnneeExercice", date('Y', strtotime($dataSystem->DateSystem)))->update([
    //                 "AnneeExercice" => date('Y', strtotime($dataSystem->DateSystem)),
    //                 "clotureState" => 1
    //             ]);
    //         }
    //         return response()->json([
    //             "status" => 1,
    //             "msg" => "Clotûre annuelle bien effectuée",
    //         ]);
    //     } catch (\Throwable $e) {
    //         //throw $th;
    //         return response()->json(["status" => 0, "msg" => "une erreur est survenu", "error" => $e->getMessage()]);
    //     }
    // }
    // public function InsertInTransaction($codeAgence, $typeTansaction, $NumCompte, $NumComptecp, $montant, $CodeMonnaie)
    // {
    //     CompteurTransaction::create([
    //         'fakevalue' => "0000",
    //     ]);
    //     $numOperation = [];
    //     $numOperation = CompteurTransaction::latest()->first();
    //     $NumTransaction =  "CA00" . $numOperation->id;
    //     $dataSystem = TauxEtDateSystem::latest()->first();
    //     Transactions::create([
    //         "NumTransaction" => $NumTransaction,
    //         "DateTransaction" => $dataSystem->DateSystem,
    //         "DateSaisie" => date("Y-m-d"),
    //         "Taux" => 1,
    //         "TypeTransaction" => $typeTansaction,
    //         "CodeMonnaie" => $CodeMonnaie,
    //         "CodeAgence" => $codeAgence,
    //         "NumDossier" => "DOS0" . $numOperation->id,
    //         "NumDemande" => "V0" . $numOperation->id,
    //         "NumCompte" => $NumCompte,
    //         "NumComptecp" =>  $NumComptecp,
    //         $typeTansaction == "D" ? "Debit" : "Credit"  => $montant,
    //         $typeTansaction == "D" ? "Debitusd" : "Creditusd"  => $CodeMonnaie == 2 ? $montant / $dataSystem->TauxEnFc : $montant,
    //         $typeTansaction == "D" ? "Debitfc" : "Creditfc" => $CodeMonnaie == 1 ? $montant * $dataSystem->TauxEnFc : $montant,
    //         "NomUtilisateur" => Auth::user()->name,
    //         "Libelle" => $NumCompte == "130202" || $NumCompte == "130201" ? "RESULTAT NET DE L'EXERCICE " . date('Y', strtotime($dataSystem->DateSystem)) : " SOLDE DE COMPTE POUR LA CLOTURE ANNUELLE " . date('Y', strtotime($dataSystem->DateSystem)),
    //     ]);
    // }

    public function clotureAnnuelle()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $annee = date('Y', strtotime($dataSystem->DateSystem));

        // Récupérer l'agence courante
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence de travail sélectionnée']);
        }

        // Récupérer les comptes de report à nouveau de cette agence
        $agence = Agences::where('code_agence', $codeAgence)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence introuvable']);
        }
        $compteReportCDF = $agence->repport_a_nouveau_cdf;
        $compteReportUSD = $agence->repport_a_nouveau_usd;
        if (!$compteReportCDF || !$compteReportUSD) {
            return response()->json(['status' => 0, 'msg' => 'Comptes de report à nouveau non définis pour cette agence']);
        }

        // Vérifier si l'exercice est déjà clôturé pour cette agence
        $cloture = clotureExercice::where('AnneeExercice', $annee)
            ->where('code_agence', $codeAgence)
            ->first();
        if ($cloture && $cloture->clotureState == 1) {
            return response()->json(['status' => 0, 'msg' => "L'exercice $annee est déjà clôturé pour cette agence."]);
        }

        try {
            // ========== CDF ==========
            $this->cloturerClassesPourAgenceDetaillee($codeAgence, 2, $compteReportCDF, $dataSystem);
            // ========== USD ==========
            $this->cloturerClassesPourAgenceDetaillee($codeAgence, 1, $compteReportUSD, $dataSystem);

            // Marquer la clôture
            if (!$cloture) {
                clotureExercice::create([
                    'AnneeExercice' => $annee,
                    'clotureState'  => 1,
                    'code_agence'   => $codeAgence,
                ]);
            } else {
                $cloture->update(['clotureState' => 1]);
            }

            return response()->json(['status' => 1, 'msg' => "Clôture annuelle effectuée pour l'agence $codeAgence."]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'msg' => 'Erreur : ' . $e->getMessage()]);
        }
    }

    /**
     * Solde tous les comptes de produits (classe 7) et de charges (classe 6)
     * d'une devise et d'une agence, en transférant le solde net vers le compte de report à nouveau.
     * Chaque compte est soldé individuellement (détail).
     */
    private function cloturerClassesPourAgenceDetaillee($codeAgence, $codeMonnaie, $compteReport, $dataSystem)
    {
        // 1. Récupérer les soldes individuels des comptes de produits (classe 7)
        $produits = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            ->where('comptes.RefTypeCompte', 7)
            ->where('transactions.CodeMonnaie', $codeMonnaie)
            ->where('transactions.CodeAgence', $codeAgence)
            ->where('transactions.DateTransaction', '<=', $dataSystem->DateSystem)
            ->select('transactions.NumCompte', DB::raw('SUM(transactions.Creditfc) - SUM(transactions.Debitfc) as solde'))
            ->groupBy('transactions.NumCompte')
            ->get();

        // 2. Récupérer les soldes individuels des comptes de charges (classe 6)
        $charges = Transactions::join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
            ->where('comptes.RefTypeCompte', 6)
            ->where('transactions.CodeMonnaie', $codeMonnaie)
            ->where('transactions.CodeAgence', $codeAgence)
            ->where('transactions.DateTransaction', '<=', $dataSystem->DateSystem)
            ->select('transactions.NumCompte', DB::raw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) as solde'))
            ->groupBy('transactions.NumCompte')
            ->get();

        // 3. Pour chaque compte produit, le débiter (car son solde est créditeur) et créditer le report à nouveau
        $totalProduits = 0;
        foreach ($produits as $prod) {
            if ($prod->solde != 0) {
                $totalProduits += $prod->solde;
                // Débit du compte produit
                $this->insertLigneClotureDetail($codeAgence, $codeMonnaie, $prod->NumCompte, $compteReport, $prod->solde, 'D', $dataSystem);
            }
        }

        // 4. Pour chaque compte charge, le créditer (car son solde est débiteur) et débiter le report à nouveau
        $totalCharges = 0;
        foreach ($charges as $ch) {
            if ($ch->solde != 0) {
                $totalCharges += $ch->solde;
                // Crédit du compte charge
                $this->insertLigneClotureDetail($codeAgence, $codeMonnaie, $ch->NumCompte, $compteReport, $ch->solde, 'C', $dataSystem);
            }
        }

        // Normalement, le report à nouveau a déjà été crédité/débité par les lignes ci-dessus.
        // Le solde net (produits - charges) sera naturellement dans le compte report.
        // Il n'y a pas besoin de ligne supplémentaire.
    }

    /**
     * Insère une ligne de transaction pour solder un compte (produit ou charge) vers le report à nouveau.
     * @param string $codeAgence
     * @param int $codeMonnaie (1=USD, 2=CDF)
     * @param string $numCompteSource (le compte 6 ou 7)
     * @param string $numCompteReport (compte 12 de l'agence)
     * @param float $montant (solde à solder, toujours positif)
     * @param string $type 'D' pour débiter le compte source (cas d'un produit), 'C' pour créditer le compte source (cas d'une charge)
     */
    private function insertLigneClotureDetail($codeAgence, $codeMonnaie, $numCompteSource, $numCompteReport, $montant, $type, $dataSystem)
    {
        CompteurTransaction::create(['fakevalue' => '0000']);
        $numOperation = CompteurTransaction::latest()->first();
        $numTransaction = "CA00" . $numOperation->id;

        $taux = $dataSystem->TauxEnFc;
        $debitCol = ($codeMonnaie == 1) ? 'Debitusd' : 'Debitfc';
        $creditCol = ($codeMonnaie == 1) ? 'Creditusd' : 'Creditfc';

        // Écriture sur le compte source (produit ou charge)
        $dataSource = [
            "NumTransaction" => $numTransaction,
             "RefJournal" => JournalType::AUXILIAIRE,
            "DateTransaction" => $dataSystem->DateSystem,
            "DateSaisie" => now(),
            "Taux" => 1,
            "TypeTransaction" => $type, // D pour débiter le produit, C pour créditer la charge
            "CodeMonnaie" => $codeMonnaie,
            "CodeAgence" => $codeAgence,
            "NumDossier" => "DOS0" . $numOperation->id,
            "NumDemande" => "V0" . $numOperation->id,
            "NumCompte" => $numCompteSource,
            "NumComptecp" => $numCompteReport,
            "NomUtilisateur" => Auth::user()->name,
            "Libelle" => "SOLDE DE COMPTE POUR LA CLOTURE ANNUELLE " . date('Y', strtotime($dataSystem->DateSystem)),
        ];

        if ($type == 'D') {
            $dataSource['Debit'] = $montant;
            $dataSource[$debitCol] = ($codeMonnaie == 1) ? $montant : $montant;
            $dataSource[$creditCol] = 0;
            $dataSource['Credit'] = 0;
        } else {
            $dataSource['Credit'] = $montant;
            $dataSource[$creditCol] = ($codeMonnaie == 1) ? $montant : $montant;
            $dataSource[$debitCol] = 0;
            $dataSource['Debit'] = 0;
        }
        Transactions::create($dataSource);

        // Écriture sur le compte report (contrepartie)
        $typeReport = ($type == 'D') ? 'C' : 'D'; // inverse
        $dataReport = [
            "NumTransaction" => $numTransaction,
            "RefJournal" => JournalType::AUXILIAIRE,
            "DateTransaction" => $dataSystem->DateSystem,
            "DateSaisie" => now(),
            "Taux" => 1,
            "TypeTransaction" => $typeReport,
            "CodeMonnaie" => $codeMonnaie,
            "CodeAgence" => $codeAgence,
            "NumDossier" => "DOS0" . $numOperation->id,
            "NumDemande" => "V0" . $numOperation->id,
            "NumCompte" => $numCompteReport,
            "NumComptecp" => $numCompteSource,
            "NomUtilisateur" => Auth::user()->name,
            "Libelle" => "RESULTAT NET DE L'EXERCICE " . date('Y', strtotime($dataSystem->DateSystem)),
        ];

        if ($typeReport == 'D') {
            $dataReport['Debit'] = $montant;
            $dataReport[$debitCol] = ($codeMonnaie == 1) ? $montant : $montant;
            $dataReport[$creditCol] = 0;
            $dataReport['Credit'] = 0;
        } else {
            $dataReport['Credit'] = $montant;
            $dataReport[$creditCol] = ($codeMonnaie == 1) ? $montant : $montant;
            $dataReport[$debitCol] = 0;
            $dataReport['Debit'] = 0;
        }
        Transactions::create($dataReport);
    }
}
