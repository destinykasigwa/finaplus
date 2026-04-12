<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB};
use App\Models\{BilletageAppro_cdf, BilletageAppro_usd, BilletageCDF, BilletageUSD, CompanyModel, Comptes, Delestages, Echeancier, JourRetard, Portefeuille, TauxEtDateSystem, Transactions, User};
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportsController extends Controller
{
    //
    protected $comptePretAuMembreCDF;
    protected $comptePretAuMembreUSD;
    protected  $compteRetardCDF;
    protected   $compteRetardUSD;
    protected $reportService;
    public function __construct(ReportService $reportService)
    {

        $this->middleware("auth");
        $this->comptePretAuMembreCDF = "3210000000202";
        $this->comptePretAuMembreUSD = "3210000000201";
        $this->compteRetardCDF = "3901000000202";
        $this->compteRetardUSD = "3900000000201";
        $this->reportService = $reportService;
    }
    public function getReportHeaderSection()
    {
        $data = CompanyModel::first();
        return response()->json(["status" => 1, "data" => $data]);
    }

    //GET JOURNAL HOME PAGE 

    public function getJournalHomePage()
    {
        return view("eco.pages.journal");
    }


    //GET REPERTOIRE HOME PAGE 
    public function getRepertoireHomePage()
    {
        return view("eco.pages.repertoire");
    }
    //GET DEFAULT DATE
    //RECUPERE LES DATES PAR DEFAUT   
    public function getDefaultDate()
    {
        //   $date  = date("Y-m-d");
        //   $NewDate1=date('d-m-Y', strtotime($date.' - 1 DAY'));
        $NewDate1 = date("Y-m-d");
        $NewDate2 = date("Y-m-d");
        return response()->json(["status" => 1, "dateDebut" => $NewDate1, "dateFin" => $NewDate2]);
    }

    //GET JOURNAL DROP MENU
    public function getJournalDropMenu()
    {
        $data = DB::select("SELECT * FROM type_journal ORDER BY id");
        $users = User::get();
        return response()->json(["status" => 1, "data" => $data, "users" => $users]);
    }
    //GET SEARCHED JOURNAL

    public function getSearchedJournal(Request $request)
    {
        $checkboxValues = $request->AutresCriteres;
        // $userCheckbox = $checkboxValues['userCheckbox'];
        $SuspensTransactions = $checkboxValues['SuspensTransactions'];
        $givenCurrency = $checkboxValues['givenCurrency'];
        $GivenJournal = $checkboxValues['GivenJournal'];
        if (isset($request->UserName) and $SuspensTransactions == false) {
            $check_dataCDF = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 2 AND t1.NomUtilisateur = "' . $request->UserName . '"');
            $check_dataUSD = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 1 AND t1.NomUtilisateur = "' . $request->UserName . '"');

            if (count($check_dataCDF) != 0 or count($check_dataUSD) != 0) {

                $dataCDF = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 2 AND t1.NomUtilisateur = "' . $request->UserName . '"');
                $dataUSD = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 1 AND t1.NomUtilisateur = "' . $request->UserName . '"');

                $totUSD = DB::select('SELECT 
                SUM(subquery.Debitfc) AS TotalDebitfc, 
                SUM(subquery.Debitusd) AS TotalDebitusd, 
                SUM(subquery.Creditfc) AS TotalCreditfc, 
                SUM(subquery.Creditusd) AS TotalCreditusd
                FROM (
                    SELECT DISTINCT 
                        t1.NumTransaction, 
                        t1.DateTransaction, 
                        t1.CodeMonnaie, 
                        t1.NumCompte, 
                        t1.NumComptecp, 
                        t1.Debitfc, 
                        t1.Debitusd, 
                        t1.Creditfc, 
                        t1.Creditusd
                    FROM transactions t1
                    JOIN transactions t2 
                        ON t1.NumComptecp = t2.NumCompte
                    AND t1.NumCompte = t2.NumComptecp
                    AND t1.CodeMonnaie = t2.CodeMonnaie
                    AND t1.DateTransaction = t2.DateTransaction
                    AND t1.NumTransaction = t2.NumTransaction
                    WHERE t1.Debitfc = t2.Creditfc
                    AND t1.Debitusd = t2.Creditusd
                    AND t1.Creditfc = t2.Debitfc
                    AND t1.Creditusd = t2.Debitusd
                    AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"
                    AND t1.CodeMonnaie = 1
                    AND t1.NomUtilisateur = "' . $request->UserName . '"
                ) AS subquery')[0];


                $totCDF = DB::select('SELECT 
                SUM(subquery.Debitfc) AS TotalDebitfc, 
                SUM(subquery.Debitusd) AS TotalDebitusd, 
                SUM(subquery.Creditfc) AS TotalCreditfc, 
                SUM(subquery.Creditusd) AS TotalCreditusd
                FROM (
                SELECT DISTINCT 
                    t1.NumTransaction, 
                    t1.DateTransaction, 
                    t1.CodeMonnaie, 
                    t1.NumCompte, 
                    t1.NumComptecp, 
                    t1.Debitfc, 
                    t1.Debitusd, 
                    t1.Creditfc, 
                    t1.Creditusd
                FROM transactions t1
                JOIN transactions t2 
                    ON t1.NumComptecp = t2.NumCompte
                AND t1.NumCompte = t2.NumComptecp
                AND t1.CodeMonnaie = t2.CodeMonnaie
                AND t1.DateTransaction = t2.DateTransaction
                AND t1.NumTransaction = t2.NumTransaction
                WHERE t1.Debitfc = t2.Creditfc
                AND t1.Debitusd = t2.Creditusd
                AND t1.Creditfc = t2.Debitfc
                AND t1.Creditusd = t2.Debitusd
                AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"
                AND t1.CodeMonnaie = 2
                AND t1.NomUtilisateur = "' . $request->UserName . '"
                ) AS subquery')[0];
                // $totCreditCDF = DB::select('SELECT SUM(transactions.Creditfc) as totCreditCDF FROM transactions join comptes on transactions.NumCompte=comptes.NumCompte  WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.CodeMonnaie=2   AND comptes.isBilanAccount!=1  AND transactions.NomUtilisateur="' . $request->UserName . '"AND comptes.RefCadre NOT IN (59,87,85) ')[0];
                // $totDebitUSD = DB::select('SELECT SUM(transactions.Debitusd) as totDebitUSD FROM transactions join comptes on transactions.NumCompte=comptes.NumCompte  WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"   AND transactions.CodeMonnaie=1 AND comptes.isBilanAccount!=1  AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefCadre NOT IN (59,87,85) ')[0];
                // $totCreditUSD = DB::select('SELECT SUM(transactions.Creditusd) as totCreditUSD FROM transactions join comptes on transactions.NumCompte=comptes.NumCompte  WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"   AND transactions.CodeMonnaie=1  AND comptes.isBilanAccount!=1  AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefCadre NOT IN (59,87,85) ')[0];
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Pas de données trouver"
                ]);
            }
            return response()->json([
                "dataCDF" => $dataCDF,
                "dataUSD" => $dataUSD,
                "totCDF" => $totCDF,
                // "totCreditCDF" => $totCreditCDF,
                "totUSD" => $totUSD,
                // "totCreditUSD" => $totCreditUSD,

                "status" => 1
            ]);
        }
        if (isset($request->UserName) and $SuspensTransactions == true) {

            $check_dataCDF = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle,t1.typeTransaction, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 2 AND t1.NomUtilisateur = "' . $request->UserName . '" AND t1.typeTransaction="suspens"');
            $check_dataUSD = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle,t1.typeTransaction, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 1 AND t1.NomUtilisateur = "' . $request->UserName . '" AND t1.typeTransaction="suspens"');

            if (count($check_dataCDF) != 0 or count($check_dataUSD) != 0) {
                $dataCDF = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle,t1.typeTransaction, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 2 AND t1.NomUtilisateur = "' . $request->UserName . '" AND t1.typeTransaction="suspens"');
                $dataUSD = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle,t1.typeTransaction, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 1 AND t1.NomUtilisateur = "' . $request->UserName . '" AND t1.typeTransaction="suspens"');
                $totUSD = DB::select('SELECT 
                SUM(subquery.Debitfc) AS TotalDebitfc, 
                SUM(subquery.Debitusd) AS TotalDebitusd, 
                SUM(subquery.Creditfc) AS TotalCreditfc, 
                SUM(subquery.Creditusd) AS TotalCreditusd
                FROM (
                    SELECT DISTINCT 
                        t1.NumTransaction, 
                        t1.DateTransaction, 
                        t1.CodeMonnaie, 
                        t1.NumCompte, 
                        t1.NumComptecp, 
                        t1.Debitfc, 
                        t1.Debitusd, 
                        t1.Creditfc, 
                        t1.Creditusd
                    FROM transactions t1
                    JOIN transactions t2 
                        ON t1.NumComptecp = t2.NumCompte
                    AND t1.NumCompte = t2.NumComptecp
                    AND t1.CodeMonnaie = t2.CodeMonnaie
                    AND t1.DateTransaction = t2.DateTransaction
                    AND t1.NumTransaction = t2.NumTransaction
                    WHERE t1.Debitfc = t2.Creditfc
                    AND t1.Debitusd = t2.Creditusd
                    AND t1.Creditfc = t2.Debitfc
                    AND t1.Creditusd = t2.Debitusd
                    AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"
                    AND t1.CodeMonnaie = 1
                    AND t1.NomUtilisateur = "' . $request->UserName . '"
                    AND t1.typeTransaction="suspens"
                ) AS subquery')[0];


                $totCDF = DB::select('SELECT 
                SUM(subquery.Debitfc) AS TotalDebitfc, 
                SUM(subquery.Debitusd) AS TotalDebitusd, 
                SUM(subquery.Creditfc) AS TotalCreditfc, 
                SUM(subquery.Creditusd) AS TotalCreditusd
                FROM (
                SELECT DISTINCT 
                    t1.NumTransaction, 
                    t1.DateTransaction, 
                    t1.CodeMonnaie, 
                    t1.NumCompte, 
                    t1.NumComptecp, 
                    t1.Debitfc, 
                    t1.Debitusd, 
                    t1.Creditfc, 
                    t1.Creditusd
                FROM transactions t1
                JOIN transactions t2 
                    ON t1.NumComptecp = t2.NumCompte
                AND t1.NumCompte = t2.NumComptecp
                AND t1.CodeMonnaie = t2.CodeMonnaie
                AND t1.DateTransaction = t2.DateTransaction
                AND t1.NumTransaction = t2.NumTransaction
                WHERE t1.Debitfc = t2.Creditfc
                AND t1.Debitusd = t2.Creditusd
                AND t1.Creditfc = t2.Debitfc
                AND t1.Creditusd = t2.Debitusd
                AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"
                AND t1.CodeMonnaie = 2
                AND t1.NomUtilisateur = "' . $request->UserName . '"
                AND t1.typeTransaction="suspens"
                ) AS subquery')[0];
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Pas de données trouver"
                ]);
            }
            return response()->json([
                "dataCDF" => $dataCDF,
                "dataUSD" => $dataUSD,
                "totCDF" => $totCDF,
                // "totCreditCDF" => $totCreditCDF,
                "totUSD" => $totUSD,
                // "totCreditUSD" => $totCreditUSD,

                "status" => 1
            ]);
        }
        $check_dataCDF = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 2');
        $check_dataUSD = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 1');

        if (count($check_dataCDF) != 0 or count($check_dataUSD) != 0) {

            $dataCDF = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 2');
            $dataUSD = DB::select('SELECT DISTINCT t1.NumTransaction, t1.DateTransaction, t1.CodeMonnaie, t1.NumCompte, t1.NumComptecp, t1.Debitfc, t1.Debitusd, t1.Creditfc, t1.Creditusd, t1.Libelle, c1.NomCompte AS NomCompte FROM transactions t1 JOIN transactions t2 ON t1.NumComptecp = t2.NumCompte AND t1.NumCompte = t2.NumComptecp AND t1.CodeMonnaie = t2.CodeMonnaie AND t1.DateTransaction = t2.DateTransaction AND t1.NumTransaction = t2.NumTransaction JOIN comptes c1 ON t1.NumCompte = c1.NumCompte WHERE t1.Debitfc = t2.Creditfc AND t1.Debitusd = t2.Creditusd AND t1.Creditfc = t2.Debitfc AND t1.Creditusd = t2.Debitusd AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND t1.CodeMonnaie = 1');
            $totUSD = DB::select('SELECT 
                SUM(subquery.Debitfc) AS TotalDebitfc, 
                SUM(subquery.Debitusd) AS TotalDebitusd, 
                SUM(subquery.Creditfc) AS TotalCreditfc, 
                SUM(subquery.Creditusd) AS TotalCreditusd
                FROM (
                    SELECT DISTINCT 
                        t1.NumTransaction, 
                        t1.DateTransaction, 
                        t1.CodeMonnaie, 
                        t1.NumCompte, 
                        t1.NumComptecp, 
                        t1.Debitfc, 
                        t1.Debitusd, 
                        t1.Creditfc, 
                        t1.Creditusd
                    FROM transactions t1
                    JOIN transactions t2 
                        ON t1.NumComptecp = t2.NumCompte
                    AND t1.NumCompte = t2.NumComptecp
                    AND t1.CodeMonnaie = t2.CodeMonnaie
                    AND t1.DateTransaction = t2.DateTransaction
                    AND t1.NumTransaction = t2.NumTransaction
                    WHERE t1.Debitfc = t2.Creditfc
                    AND t1.Debitusd = t2.Creditusd
                    AND t1.Creditfc = t2.Debitfc
                    AND t1.Creditusd = t2.Debitusd
                    AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"
                    AND t1.CodeMonnaie = 1
                ) AS subquery')[0];


            $totCDF = DB::select('SELECT 
                SUM(subquery.Debitfc) AS TotalDebitfc, 
                SUM(subquery.Debitusd) AS TotalDebitusd, 
                SUM(subquery.Creditfc) AS TotalCreditfc, 
                SUM(subquery.Creditusd) AS TotalCreditusd
                FROM (
                SELECT DISTINCT 
                    t1.NumTransaction, 
                    t1.DateTransaction, 
                    t1.CodeMonnaie, 
                    t1.NumCompte, 
                    t1.NumComptecp, 
                    t1.Debitfc, 
                    t1.Debitusd, 
                    t1.Creditfc, 
                    t1.Creditusd
                FROM transactions t1
                JOIN transactions t2 
                    ON t1.NumComptecp = t2.NumCompte
                AND t1.NumCompte = t2.NumComptecp
                AND t1.CodeMonnaie = t2.CodeMonnaie
                AND t1.DateTransaction = t2.DateTransaction
                AND t1.NumTransaction = t2.NumTransaction
                WHERE t1.Debitfc = t2.Creditfc
                AND t1.Debitusd = t2.Creditusd
                AND t1.Creditfc = t2.Debitfc
                AND t1.Creditusd = t2.Debitusd
                AND t1.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"
                AND t1.CodeMonnaie = 2
                ) AS subquery')[0];
            // $totCreditCDF = DB::select('SELECT SUM(transactions.Creditfc) as totCreditCDF FROM transactions join comptes on transactions.NumCompte=comptes.NumCompte  WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.CodeMonnaie=2   AND comptes.isBilanAccount!=1  AND transactions.NomUtilisateur="' . $request->UserName . '"AND comptes.RefCadre NOT IN (59,87,85) ')[0];
            // $totDebitUSD = DB::select('SELECT SUM(transactions.Debitusd) as totDebitUSD FROM transactions join comptes on transactions.NumCompte=comptes.NumCompte  WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"   AND transactions.CodeMonnaie=1 AND comptes.isBilanAccount!=1  AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefCadre NOT IN (59,87,85) ')[0];
            // $totCreditUSD = DB::select('SELECT SUM(transactions.Creditusd) as totCreditUSD FROM transactions join comptes on transactions.NumCompte=comptes.NumCompte  WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"   AND transactions.CodeMonnaie=1  AND comptes.isBilanAccount!=1  AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefCadre NOT IN (59,87,85) ')[0];
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Pas de données trouver"
            ]);
        }
        return response()->json([
            "dataCDF" => $dataCDF,
            "dataUSD" => $dataUSD,
            "totCDF" => $totCDF,
            // "totCreditCDF" => $totCreditCDF,
            "totUSD" => $totUSD,
            // "totCreditUSD" => $totCreditUSD,

            "status" => 1
        ]);
    }

    public function getSearchedRepertoire(Request $request)
    {
        //dd($request->all());
        if (isset($request->UserName)) {

            $check_dataCDF = DB::select('SELECT  
            * FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.CodeMonnaie=2 AND comptes.RefSousGroupe=3301 AND transactions.NomUtilisateur="' . $request->UserName . '"  ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit');
            $check_dataUSD = DB::select('SELECT  
             * FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.CodeMonnaie=1 AND comptes.RefGroupe=3300 AND transactions.NomUtilisateur="' . $request->UserName . '"  ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit');
            // dd($check_dataCDF, $check_dataUSD);
            if (count($check_dataCDF) != 0 or count($check_dataUSD) != 0) {
                $dataCDF = DB::select('SELECT transactions.DateTransaction,transactions.NumTransaction,transactions.NumCompte,comptes.NomCompte,transactions.Libelle,transactions.Creditfc,transactions.Debitfc,transactions.Credit,transactions.Debit,transactions.Creditusd,transactions.Debitusd,transactions.CodeMonnaie  FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"  AND comptes.NumCompte NOT IN (871,870,851,850) AND  comptes.RefSousGroupe=3301 AND transactions.Numcompte!=3301 AND  transactions.CodeMonnaie=2 AND transactions.NomUtilisateur="' . $request->UserName . '" ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit DESC ');
                $dataUSD = DB::select('SELECT  transactions.DateTransaction,transactions.NumTransaction,transactions.NumCompte,comptes.NomCompte,transactions.Libelle,transactions.Credit,transactions.Debit,transactions.Creditusd,transactions.Debitusd,transactions.CodeMonnaie  FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND comptes.NumCompte NOT IN (871,870,851,850) AND comptes.RefSousGroupe=3300 AND transactions.CodeMonnaie=1 AND transactions.Numcompte!=3300 AND transactions.NomUtilisateur="' . $request->UserName . '" ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit DESC');
                $totDebitCDF = DB::select('SELECT SUM(transactions.Debitfc) as totDebitCDF FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.Numcompte!=3301 AND transactions.CodeMonnaie=2  AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefSousGroupe=3301 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                $totCreditCDF = DB::select('SELECT SUM(transactions.Creditfc) as totCreditCDF FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"  AND transactions.Numcompte!=3301 AND transactions.CodeMonnaie=2  AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefSousGroupe=3301 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                $totDebitUSD = DB::select('SELECT SUM(transactions.Debitusd) as totDebitUSD FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.Numcompte!=3300  AND transactions.CodeMonnaie=1 AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefSousGroupe=3300 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                $totCreditUSD = DB::select('SELECT SUM(transactions.Creditusd) as totCreditUSD FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"  AND transactions.Numcompte!=3300 AND transactions.CodeMonnaie=1 AND transactions.NomUtilisateur="' . $request->UserName . '" AND comptes.RefSousGroupe=3300 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Pas de données trouver"
                ]);
            }
            return response()->json([
                "dataCDF" => $dataCDF,
                "dataUSD" => $dataUSD,
                "totDebitCDF" => $totDebitCDF,
                "totCreditCDF" => $totCreditCDF,
                "totDebitUSD" => $totDebitUSD,
                "totCreditUSD" => $totCreditUSD,
                "status" => 1
            ]);
        } else {
            $check_dataCDF = DB::select('SELECT  
            * FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.CodeMonnaie=2 AND comptes.RefSousGroupe=3301 ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit');
            $check_dataUSD = DB::select('SELECT  
             * FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.CodeMonnaie=1 AND comptes.RefGroupe=3300 ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit');

            if (count($check_dataCDF) != 0 or count($check_dataUSD) != 0) {
                $dataCDF = DB::select('SELECT transactions.DateTransaction,transactions.NumTransaction,transactions.NumCompte,comptes.NomCompte,transactions.Libelle,transactions.Creditfc,transactions.Debitfc,transactions.Credit,transactions.Debit,transactions.Creditusd,transactions.Debitusd,transactions.CodeMonnaie,transactions.NomUtilisateur  FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"  AND comptes.NumCompte NOT IN (871,870,851,850) AND  comptes.RefSousGroupe=3301 AND transactions.Numcompte!=3301 AND  transactions.CodeMonnaie=2 ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit DESC ');
                $dataUSD = DB::select('SELECT  transactions.DateTransaction,transactions.NumTransaction,transactions.NumCompte,comptes.NomCompte,transactions.Libelle,transactions.Credit,transactions.Debit,transactions.Creditusd,transactions.Debitusd,transactions.CodeMonnaie,transactions.NomUtilisateur  FROM transactions JOIN comptes ON transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND comptes.NumCompte NOT IN (871,870,851,850) AND comptes.RefSousGroupe=3300 AND transactions.CodeMonnaie=1 AND transactions.Numcompte!=3300  ORDER BY transactions.NomUtilisateur,transactions.NumTransaction,transactions.Debit DESC');
                $totDebitCDF = DB::select('SELECT SUM(transactions.Debitfc) as totDebitCDF FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.Numcompte!=3301 AND transactions.CodeMonnaie=2  AND comptes.RefSousGroupe=3301 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                $totCreditCDF = DB::select('SELECT SUM(transactions.Creditfc) as totCreditCDF FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"  AND transactions.Numcompte!=3301 AND transactions.CodeMonnaie=2  AND comptes.RefSousGroupe=3301 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                $totDebitUSD = DB::select('SELECT SUM(transactions.Debitusd) as totDebitUSD FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '" AND transactions.Numcompte!=3300  AND transactions.CodeMonnaie=1 AND comptes.RefSousGroupe=3300 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                $totCreditUSD = DB::select('SELECT SUM(transactions.Creditusd) as totCreditUSD FROM transactions JOIN comptes  ON  transactions.NumCompte=comptes.NumCompte WHERE transactions.DateTransaction BETWEEN "' . $request->DateDebut . '" AND "' . $request->DateFin . '"  AND transactions.Numcompte!=3300 AND transactions.CodeMonnaie=1 AND comptes.RefSousGroupe=3300 AND comptes.NumCompte NOT IN (871,870,851,850)')[0];
                return response()->json([
                    "dataCDF" => $dataCDF,
                    "dataUSD" => $dataUSD,
                    "totDebitCDF" => $totDebitCDF,
                    "totCreditCDF" => $totCreditCDF,
                    "totDebitUSD" => $totDebitUSD,
                    "totCreditUSD" => $totCreditUSD,
                    "status" => 1
                ]);
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Pas de données trouver"
                ]);
            }
        }
        // else {
        //     return response()->json([
        //         "status" => 0,
        //         "msg" => "Veuillez sélectionnez un utilisateur!"
        //     ]);
        // }
    }

    //GET ECHEANCIER HOME PAGE 
    public function getEcheancierCreditHomePage()
    {
        return view("eco.pages.rapport-credit");
    }

    //PERMET D'AFFICHER L'ECHEANCIER ET UN TABLEAU D'AMMORTISSMENT

    public function getEcheancier(Request $request)

    {

        //VERIFIE SI L'UTILISATEUR SOUHAITE AFFICHE QUE TYPE DE RAPPORT
        if (isset($request->radioValue) and $request->radioValue == "echeancier") {
            //VERIFIE SI LE NUMERO DE DOSSIER EXISTE 
            if (isset($request->searched_num_dossier)) {
                $checkNumDossier = Echeancier::where("NumDossier", "=", $request->searched_num_dossier)->first();
                if ($checkNumDossier) {
                    $data = Portefeuille::where("portefeuilles.NumDossier", "=", $request->searched_num_dossier)
                        // ->where("echeanciers.CapAmmorti", ">", 0)
                        // ->orWhere("portefeuilles.NumCompteEpargne", "=", $request->NumCompteEpargne)
                        // ->orWhere("portefeuilles.NumCompteCredit", "=", $request->NumCompteCredit)
                        ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                        ->join('comptes', 'comptes.NumCompte', '=', 'portefeuilles.NumCompteEpargne')
                        // ->select('echeanciers.*')
                        ->get();

                    //RECUPERE LA SOMME DES INTERET A PAYER
                    $dataSommeInter = Echeancier::select(
                        DB::raw("SUM(echeanciers.Interet) as sommeInteret"),
                    )->where("echeanciers.NumDossier", "=", $request->searched_num_dossier)
                        // ->orWhere("portefeuilles.NumCompteEpargne", "=", $request->NumCompteEpargne)
                        // ->orWhere("portefeuilles.NumCompteCredit", "=", $request->NumCompteCredit)
                        ->join('portefeuilles', 'portefeuilles.NumDossier', '=', 'echeanciers.NumDossier')
                        ->first();
                    return response()->json(["status" => 1, "data" => $data, "msg" => "Resultat trouvé", "sommeInteret" => $dataSommeInter]);
                } else {
                    return response()->json([
                        "status" => 0,
                        "msg" => "Aucun écheancier n'est associé au numéro de dossier renseigné rassurez vous que vous avez entré un bon numéro de dossier ou que vous avez généré son écheancier merci !"
                    ]);
                }
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Vous devez renseigné le numero de dossier!"
                ]);
            }
        } else if (isset($request->radioValue) and $request->radioValue == "tableau_ammortiss") {
            if (isset($request->searched_num_dossier)) {
                $checkNumDossier = Echeancier::where("NumDossier", "=", $request->searched_num_dossier)->first();
                if ($checkNumDossier) {

                    $data = Portefeuille::where("portefeuilles.NumDossier", "=", $request->searched_num_dossier)
                        ->where("echeanciers.CapAmmorti", ">", 0)

                        // ->orWhere("portefeuilles.NumCompteEpargne", "=", $request->NumCompteEpargne)
                        // ->orWhere("portefeuilles.NumCompteCredit", "=", $request->NumCompteCredit)
                        ->leftJoin('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                        ->leftJoin('remboursementcredits', 'remboursementcredits.RefEcheance', '=', 'echeanciers.ReferenceEch')
                        //   ->select('echeanciers.*')
                        ->get();

                    //RECUPERE LA SOMME DES INTERET A PAYER
                    $dataSommeInter = Echeancier::select(
                        DB::raw("SUM(echeanciers.Interet) as sommeInteret"),
                    )->where("echeanciers.NumDossier", "=", $request->searched_num_dossier)
                        // ->orWhere("portefeuilles.NumCompteEpargne", "=", $request->NumCompteEpargne)
                        // ->orWhere("portefeuilles.NumCompteCredit", "=", $request->NumCompteCredit)
                        ->join('portefeuilles', 'portefeuilles.NumDossier', '=', 'echeanciers.NumDossier')
                        ->first();

                    //GET NAME 
                    $NomCompte = Portefeuille::where("NumDossier", $request->searched_num_dossier)->first();

                    //RECUPERE LE SOLDE RESTANT DU CREDIT
                    // $soldeRestant = DB::select('SELECT SUM(echeanciers.CapAmmorti) as soldeRestant from echeanciers where echeanciers.NumDossier="' . $request->searched_num_dossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier')[0];
                    // $SoldeCreditRestant = $soldeRestant->soldeRestant;

                    $soldeRestant =  Echeancier::selectRaw('
                     echeanciers.NumDossier,
                    SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS InteretRetard,
                    SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS soldeRestant
                ')
                        ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                        ->where('echeanciers.posted', '=!', 1)
                        ->where('echeanciers.statutPayement', '=!', 1)
                        ->where('echeanciers.NumDossier', $request->searched_num_dossier)
                        ->groupBy('echeanciers.NumDossier')
                        ->first();
                    $SoldeCreditRestant = $soldeRestant->soldeRestant;
                    // dd($soldeRestant);
                    //RECUPERE LE CAPITAL REMBOURSE
                    $capitalRembourse = DB::select('SELECT SUM(echeanciers.CapAmmorti) as capitalRembourse from echeanciers where echeanciers.NumDossier="' . $request->searched_num_dossier . '" and echeanciers.posted=1 and echeanciers.statutPayement=1 GROUP BY echeanciers.NumDossier');

                    $capitalRembours = $capitalRembourse[0]->capitalRembourse ?? 0; // Retourne 0 si aucun résultat
                    //RECUPERE LE SOLDE EN RETARD 
                    // $soldeEnRetard = JourRetard::where("NumDossier", $request->searched_num_dossier)->first();
                    // $soldeEnRetard = DB::select('SELECT SUM(echeanciers.MontantRetardInteret) as soldeIntRetard,SUM(echeanciers.MontantRetardCapital) soldeCapRetard from echeanciers where echeanciers.NumDossier="' . $request->searched_num_dossier . '" and echeanciers.RetardPayement=1 GROUP BY echeanciers.NumDossier')[0];

                    $soldeEnRetard =  Echeancier::selectRaw('
                     echeanciers.NumDossier,
                    SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
                    SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
                ')
                        ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                        ->where('echeanciers.RetardPayement', 1)
                        ->where('echeanciers.NumDossier', $request->searched_num_dossier)
                        ->groupBy('echeanciers.NumDossier')
                        ->first();
                    // dd($soldeEnRetard);
                    //RECUPERE L'INTERET DEJA REMBOURSE 
                    $InteretRembourse = DB::select('SELECT SUM(echeanciers.Interet) as intereRembourse from echeanciers where echeanciers.NumDossier="' . $request->searched_num_dossier . '" and echeanciers.posted=1 and echeanciers.statutPayement=1 GROUP BY echeanciers.NumDossier');
                    $InteretRembourse = $InteretRembourse[0] ?? 0; // Retourne 0 si aucun résultat
                    //RECUPERE L'INTERET L'INTERET RESTANT 
                    $InteretRestant = DB::select('SELECT SUM(echeanciers.Interet) as intereRestant from echeanciers where echeanciers.NumDossier="' . $request->searched_num_dossier . '" and echeanciers.posted=!1 and echeanciers.statutPayement=!1 GROUP BY echeanciers.NumDossier');
                    $InteretRestant = $InteretRestant[0] ?? 0; // Retourne 0 si aucun résultat
                    return response()->json([
                        "status" => 1,
                        "data_ammortissement" => $data,
                        "msg" => "Resultat trouvé",
                        "sommeInteret_ammort" => $dataSommeInter,
                        "NomCompte" => $NomCompte,
                        "soldeRestant" => $SoldeCreditRestant,
                        "soldeEnRetard" => $soldeEnRetard,
                        "capitalRembourse" => $capitalRembours,
                        "interetRembourse" => $InteretRembourse,
                        "interetRestant" => $InteretRestant
                    ]);
                } else {
                    return response()->json([
                        "status" => 0,
                        "msg" => "Aucun écheancier n'est associé au numéro de dossier renseigné rassurez vous que vous avez entré un bon numéro de dossier ou que vous avez généré son écheancier merci !"
                    ]);
                }
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Vous devez renseigné le numero de dossier!"
                ]);
            }
        } else if (isset($request->radioValue) and $request->radioValue == "balance_agee") {
            //
            if (isset($request->devise) and isset($request->selectedDate)) {

                if ($request->devise == "CDF") {
                    // $dataBalanceAgee = Portefeuille::where("portefeuilles.CodeMonnaie", "=", $request->devise)
                    //     ->join("comptes", "portefeuilles.NumCompteEpargne", "=", "comptes.NumCompte")
                    //     ->leftJoin("jour_retards", "portefeuilles.NumCompteEpargne", "=", "jour_retards.NumcompteEpargne")
                    //     ->orderBy("portefeuilles.NumDossier")->get();
                    $dataBalanceAgee = Portefeuille::where("portefeuilles.CodeMonnaie", "=", $request->devise)
                        ->where("portefeuilles.Octroye", 1)
                        ->where("portefeuilles.Cloture", "!=", 1)
                        ->join("comptes", "portefeuilles.NumCompteEpargne", "=", "comptes.NumCompte")
                        ->leftJoin("jour_retards", "portefeuilles.NumCompteEpargne", "=", "jour_retards.NumcompteEpargne")
                        ->leftJoin("echeanciers", "portefeuilles.NumDossier", "=", "echeanciers.NumDossier")
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where("Gestionnaire", $request->agent_credit_name);
                        })
                        ->selectRaw('
                         portefeuilles.NumDossier,
                         portefeuilles.NumCompteEpargne,
                         portefeuilles.CodeMonnaie,
                         portefeuilles.NumDossier,
                         portefeuilles.NumCompteCredit,
                         portefeuilles.NomCompte,
                         portefeuilles.DateOctroi,
                         portefeuilles.DateEcheance,
                         portefeuilles.MontantAccorde,
                         portefeuilles.Duree,
                         jour_retards.DateRetard,
                         jour_retards.NbrJrRetard,

                         SUM(CASE WHEN echeanciers.statutPayement = 1 AND echeanciers.posted = 1 THEN echeanciers.CapAmmorti ELSE 0 END) AS TotalCapitalRembourse,
                         SUM(CASE WHEN echeanciers.statutPayement = 1 AND echeanciers.posted = 1 THEN echeanciers.Interet ELSE 0 END) AS TotalInteretRembourse,
                         SUM(echeanciers.CapAmmorti) - SUM(CASE WHEN echeanciers.StatutPayement = 1 AND echeanciers.Posted = 1 THEN echeanciers.CapAmmorti ELSE 0 END) AS CapitalRestant,
                         SUM(echeanciers.Interet) - SUM(CASE WHEN echeanciers.StatutPayement = 1 AND echeanciers.Posted = 1 THEN echeanciers.Interet ELSE 0 END) AS InteretRestant
                                 ')
                        ->groupBy(
                            'portefeuilles.NumDossier',
                            'portefeuilles.NumCompteEpargne',
                            'portefeuilles.CodeMonnaie',
                            'portefeuilles.NumCompteCredit',
                            'portefeuilles.NomCompte',
                            'portefeuilles.DateOctroi',
                            'portefeuilles.DateEcheance',
                            'portefeuilles.MontantAccorde',
                            'portefeuilles.Duree',
                            'jour_retards.DateRetard',
                            'jour_retards.NbrJrRetard'
                        )
                        ->orderBy('portefeuilles.DateOctroi', 'desc')
                        ->get();

                    //SELECT p.NumDossier, p.NumCompteEpargne, p.CodeMonnaie, j.DateRetard, SUM(CASE WHEN e.statutPayement = 1 AND e.posted = 1 THEN e.CapAmmorti ELSE 0 END) AS TotalCapitalRembourse, SUM(CASE WHEN e.statutPayement = 1 AND e.posted = 1 THEN e.Interet ELSE 0 END) AS TotalInteretRembourse FROM portefeuilles p JOIN comptes c ON p.NumCompteEpargne = c.NumCompte LEFT JOIN jour_retards j ON p.NumCompteEpargne = j.NumcompteEpargne LEFT JOIN echeanciers e ON p.NumDossier = e.NumDossier WHERE p.CodeMonnaie = "CDF" GROUP BY p.NumDossier, p.NumCompteEpargne, p.CodeMonnaie, j.DateRetard ORDER BY p.NumDossier;
                    // dd($dataBalanceAgee);

                    //RECUPERE L'ENCOURS GLOBAL DE CREDIT

                    //     $getSoldeEncoursCreditCDF = DB::select('SELECT SUM(transactions.Debitfc)-SUM(transactions.Creditfc) As SoldeEncoursCDF FROM  transactions
                    //  WHERE transactions.CodeMonnaie=2 AND Libelle NOT LIKE "%Imputation%" AND transactions.NumCompte="' . $comptePretAuMembreCDF . '" ')[0];

                    $getSoldeEncoursCreditCDF = DB::table('transactions')
                        ->selectRaw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) AS SoldeEncoursCDF')
                        ->where('transactions.CodeMonnaie', 2) // Filtre sur la devise (CDF)
                        ->where('transactions.NumCompte', $this->comptePretAuMembreCDF) // Filtre sur le compte spécifique
                        ->where('transactions.Libelle', 'NOT LIKE', '%Imputation%') // Filtre excluant les libellés contenant "Imputation"
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where('transactions.Operant', $request->agent_credit_name); // Filtre optionnel
                        })
                        ->first();
                    $getEncoursBrutCreditCDF = DB::table('transactions')
                        ->selectRaw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) AS SoldeEncoursCDF')
                        ->where('transactions.CodeMonnaie', 2) // Filtre sur la devise (CDF)
                        ->where('transactions.NumCompte', $this->comptePretAuMembreCDF) // Filtre sur le compte spécifique
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where('transactions.Operant', $request->agent_credit_name); // Filtre optionnel
                        })
                        ->first();

                    // RECUPERE LA SOMME DE CAPITAL EN RETARD
                    //     $getSoldeCapRetardCDF = DB::select('SELECT SUM(transactions.Debitfc)-SUM(transactions.Creditfc)  As TotRetard FROM  transactions
                    // WHERE transactions.CodeMonnaie=2 AND transactions.NumCompte="' . $compteRetardCDF . '"')[0];
                    $getSoldeCapRetardCDF = DB::table('transactions')
                        ->selectRaw('SUM(transactions.Debitfc) - SUM(transactions.Creditfc) AS TotRetard')
                        ->where('transactions.CodeMonnaie', 2) // Filtre sur la devise (CDF)
                        ->where('transactions.NumCompte', $this->compteRetardCDF) // Filtre sur le compte spécifique
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where('transactions.Operant', $request->agent_credit_name); // Filtre optionnel sur le gestionnaire
                        })
                        ->first(); // Récupère le solde total

                    // $PAR = ($getSoldeCapRetardCDF->TotRetard) / ($getSoldeEncoursCreditCDF->SoldeEncoursCDF + $getSoldeCapRetardCDF->TotRetard) * 100;

                    $denominator = $getSoldeEncoursCreditCDF->SoldeEncoursCDF + $getSoldeCapRetardCDF->TotRetard;

                    if ($denominator != 0) {
                        $PAR = ($getSoldeCapRetardCDF->TotRetard / $denominator) * 100;
                    } else {
                        $PAR = 0; // Ou une valeur par défaut
                    }

                    return response()->json([
                        "status" => 1,
                        "data_balance_agee" => $dataBalanceAgee,
                        "soldeEncourCDF" => $getEncoursBrutCreditCDF,
                        "totRetardCDF" => $PAR
                    ]);
                } else if ($request->devise == "USD") {
                    $dataBalanceAgee = Portefeuille::where("portefeuilles.CodeMonnaie", "=", $request->devise)
                        ->where("portefeuilles.Octroye", 1)
                        ->where("portefeuilles.Cloture", "!=", 1)
                        ->join("comptes", "portefeuilles.NumCompteEpargne", "=", "comptes.NumCompte")
                        ->leftJoin("jour_retards", "portefeuilles.NumCompteEpargne", "=", "jour_retards.NumcompteEpargne")
                        ->leftJoin("echeanciers", "portefeuilles.NumDossier", "=", "echeanciers.NumDossier")
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where("portefeuilles.Gestionnaire", $request->agent_credit_name);
                        })
                        ->selectRaw('
                     portefeuilles.NumDossier,
                     portefeuilles.NumCompteEpargne,
                     portefeuilles.CodeMonnaie,
                     portefeuilles.NumDossier,
                     portefeuilles.NumCompteCredit,
                     portefeuilles.NomCompte,
                     portefeuilles.DateOctroi,
                     portefeuilles.DateEcheance,
                     portefeuilles.MontantAccorde,
                     portefeuilles.Duree,
                     jour_retards.DateRetard,
                     jour_retards.NbrJrRetard,

                     SUM(CASE WHEN echeanciers.statutPayement = 1 AND echeanciers.posted = 1 THEN echeanciers.CapAmmorti ELSE 0 END) AS TotalCapitalRembourse,
                     SUM(CASE WHEN echeanciers.statutPayement = 1 AND echeanciers.posted = 1 THEN echeanciers.Interet ELSE 0 END) AS TotalInteretRembourse,
                     SUM(echeanciers.CapAmmorti) - SUM(CASE WHEN echeanciers.StatutPayement = 1 AND echeanciers.Posted = 1 THEN echeanciers.CapAmmorti ELSE 0 END) AS CapitalRestant,
                     SUM(echeanciers.Interet) - SUM(CASE WHEN echeanciers.StatutPayement = 1 AND echeanciers.Posted = 1 THEN echeanciers.Interet ELSE 0 END) AS InteretRestant
                             ')
                        ->groupBy(
                            'portefeuilles.NumDossier',
                            'portefeuilles.NumCompteEpargne',
                            'portefeuilles.CodeMonnaie',
                            'portefeuilles.NumCompteCredit',
                            'portefeuilles.NomCompte',
                            'portefeuilles.DateOctroi',
                            'portefeuilles.DateEcheance',
                            'portefeuilles.MontantAccorde',
                            'portefeuilles.Duree',
                            'jour_retards.DateRetard',
                            'jour_retards.NbrJrRetard'
                        )
                        ->orderBy('portefeuilles.DateOctroi', 'desc')
                        ->get();

                    //SELECT p.NumDossier, p.NumCompteEpargne, p.CodeMonnaie, j.DateRetard, SUM(CASE WHEN e.statutPayement = 1 AND e.posted = 1 THEN e.CapAmmorti ELSE 0 END) AS TotalCapitalRembourse, SUM(CASE WHEN e.statutPayement = 1 AND e.posted = 1 THEN e.Interet ELSE 0 END) AS TotalInteretRembourse FROM portefeuilles p JOIN comptes c ON p.NumCompteEpargne = c.NumCompte LEFT JOIN jour_retards j ON p.NumCompteEpargne = j.NumcompteEpargne LEFT JOIN echeanciers e ON p.NumDossier = e.NumDossier WHERE p.CodeMonnaie = "CDF" GROUP BY p.NumDossier, p.NumCompteEpargne, p.CodeMonnaie, j.DateRetard ORDER BY p.NumDossier;
                    // dd($dataBalanceAgee);

                    //RECUPERE L'ENCOURS GLOBAL DE CREDIT

                    //         $getSoldeEncoursCreditUSD = DB::select('SELECT SUM(transactions.Debitusd)-SUM(transactions.Creditusd) As SoldeEncoursUSD FROM  transactions
                    //  WHERE transactions.CodeMonnaie=1 AND Libelle NOT LIKE "%Imputation%" AND transactions.NumCompte="' . $comptePretAuMembreUSD . '"')[0];

                    $getSoldeEncoursCreditUSD = DB::table('transactions')
                        ->selectRaw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) AS SoldeEncoursUSD')
                        ->where('transactions.CodeMonnaie', 1)
                        ->where('transactions.NumCompte', $this->comptePretAuMembreUSD)
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where('transactions.Operant', $request->agent_credit_name);
                        })
                        ->first();

                    $getEncourBrutCreditUSD = DB::table('transactions')
                        ->selectRaw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) AS SoldeEncoursUSD')
                        ->where('transactions.CodeMonnaie', 1)
                        ->where('transactions.NumCompte', $this->comptePretAuMembreUSD)
                        ->where('transactions.Libelle', 'NOT LIKE', '%Imputation%')
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where('transactions.Operant', $request->agent_credit_name);
                        })
                        ->first();


                    // RECUPERE LA SOMME DE CAPITAL EN RETARD

                    //         $getSoldeCapRetardUSD = DB::select('SELECT SUM(transactions.Debitusd)-SUM(transactions.Creditusd)  As TotRetard FROM  transactions
                    // WHERE transactions.CodeMonnaie=1 AND transactions.NumCompte="' . $compteRetardUSD . '"')[0];

                    $getSoldeCapRetardUSD = DB::table('transactions')
                        ->selectRaw('SUM(transactions.Debitusd) - SUM(transactions.Creditusd) AS TotRetard')
                        ->where('transactions.CodeMonnaie', 1) // Filtre sur la devise (USD)
                        ->where('transactions.NumCompte', $this->compteRetardUSD) // Filtre sur le compte spécifique
                        ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                            $query->where('transactions.Operant', $request->agent_credit_name); // Filtre optionnel
                        })
                        ->first(); // Récupère le total

                    // dd($getSoldeEncoursCreditUSD->SoldeEncoursUSD . " " . $getSoldeCapRetardUSD->TotRetard);
                    $denominator = $getSoldeEncoursCreditUSD->SoldeEncoursUSD + $getSoldeCapRetardUSD->TotRetard;

                    if ($denominator != 0) {
                        $PAR = ($getSoldeCapRetardUSD->TotRetard / $denominator) * 100;
                    } else {
                        $PAR = 0; // Ou une valeur par défaut
                    }
                    // $PAR = ($getSoldeCapRetardUSD->TotRetard) / ($getSoldeEncoursCreditUSD->SoldeEncoursUSD + $getSoldeCapRetardUSD->TotRetard) * 100;

                    return response()->json([
                        "status" => 1,
                        "data_balance_agee" => $dataBalanceAgee,
                        "soldeEncourUSD" => $getEncourBrutCreditUSD,
                        "totRetardUSD" => $PAR
                    ]);
                }
            } else {
                return response()->json([
                    "status" => 0,
                    "msg" => "Vous devez sélectionner la devise pour affiche la balance"
                ]);
            }
        }
    }

    //GET BALANCE HOME PAGE 
    public function getBalanceHomePage()
    {
        return view("eco.pages.balance");
    }

    //PERMET D'AFFICHER LA BALANCE 

    public function getBalanceCompte(Request $request)
    {
        $date_debut = $request->date_debut;
        $date_fin   = $request->date_fin;
        $devise     = $request->devise;
        $compte_debut = $request->compte_debut;
        $compte_fin   = $request->compte_fin;
        $type_balance = $request->type_balance ?? 'detail';

        $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
        $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
        $codeMonnaie = $devise === 'USD' ? 1 : 2;

        // $champRef = 'c.RefTypeCompte';

        // // ✅ Récupération des comptes individuels (niveau 5, est_classe = 0)
        // $comptes = DB::table('comptes as c')
        //     ->whereBetween($champRef, [$compte_debut, $compte_fin])
        //     ->where('c.est_classe', 0)
        //      ->where('c.CodeMonnaie', $codeMonnaie)
        //     ->orderBy('c.NumCompte')
        //     ->get(['c.NumCompte', 'c.NomCompte', 'c.RefSousGroupe']);


        // Détermination du champ de filtre
        if (strlen($compte_debut) == 2 && strlen($compte_fin) == 2) {
            $champRef = 'c.RefCadre';
        } elseif (strlen($compte_debut) == 3 && strlen($compte_fin) == 3) {
            $champRef = 'c.RefGroupe';
        } elseif (strlen($compte_debut) == 13 && strlen($compte_fin) == 13) {
            $champRef = 'c.NumCompte';
        } else {
            $champRef = 'c.RefTypeCompte';
        }



        // // Récupération des comptes de niveau 5
        // $comptes = DB::table('comptes as c')
        //     ->whereBetween($champRef, [$compte_debut, $compte_fin])
        //     ->where('c.niveau', 5)
        //     ->where('c.est_classe', 0)
        //     ->where('c.CodeMonnaie', $codeMonnaie)
        //     ->orderBy('c.NomCompte')
        //     ->get();


        // Remplacer whereBetween par whereIn pour RefTypeCompte
        if ($champRef == 'c.RefTypeCompte') {
            $valeurs = [];
            for ($i = (int)$compte_debut; $i <= (int)$compte_fin; $i++) {
                $valeurs[] = (string)$i;
            }





            $comptes = DB::table('comptes as c')
                ->whereIn($champRef, $valeurs)
                ->where('c.niveau', 5)
                ->where('c.est_classe', 0)
                ->where('c.CodeMonnaie', $codeMonnaie)
                ->orderBy('c.NomCompte')
                ->get();
        } else {
            $comptes = DB::table('comptes as c')
                ->whereBetween($champRef, [$compte_debut, $compte_fin])
                ->where('c.niveau', 5)
                ->where('c.est_classe', 0)
                ->where('c.CodeMonnaie', $codeMonnaie)
                ->orderBy('c.NomCompte')
                ->get();
        }


        if ($comptes->isEmpty()) {
            return response()->json(['status' => 0, 'msg' => 'Aucun compte trouvé pour cette plage']);
        }

        // Soldes initiaux (avant date_debut)
        // $soldesInitiaux = DB::table('transactions as t')
        //     ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        //     ->whereBetween($champRef, [$compte_debut, $compte_fin])
        //     ->where('t.CodeMonnaie', $codeMonnaie)
        //     ->where('t.DateTransaction', '<', $date_debut)
        //     ->select(
        //         'c.NumCompte',
        //         DB::raw("COALESCE(SUM(CASE WHEN LEFT(c.NumCompte,1) IN ('1','2','3') THEN t.$debitCol - t.$creditCol ELSE t.$creditCol - t.$debitCol END), 0) as soldeInitial")
        //     )
        //     ->groupBy('c.NumCompte')
        //     ->get()
        //     ->keyBy('NumCompte');

        // // Mouvements dans la période
        // $mouvements = DB::table('transactions as t')
        //     ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        //     ->whereBetween($champRef, [$compte_debut, $compte_fin])
        //     ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
        //     ->where('t.CodeMonnaie', $codeMonnaie)
        //     ->select(
        //         'c.NumCompte',
        //         DB::raw("SUM(t.$debitCol) as totalDebit"),
        //         DB::raw("SUM(t.$creditCol) as totalCredit")
        //     )
        //     ->groupBy('c.NumCompte')
        //     ->get()
        //     ->keyBy('NumCompte');


        // Solution 1 : Convertir explicitement en entier
        $mouvements = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->whereBetween($champRef, [$compte_debut, $compte_fin])
            ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
            ->where(DB::raw('CAST(t.CodeMonnaie AS UNSIGNED)'), $codeMonnaie)  // ← Conversion explicite
            ->select(
                'c.NumCompte',
                DB::raw("SUM(t.$debitCol) as totalDebit"),
                DB::raw("SUM(t.$creditCol) as totalCredit")
            )
            ->groupBy('c.NumCompte')
            ->get()
            ->keyBy('NumCompte');

        // Même chose pour $soldesInitiaux
        $soldesInitiaux = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->whereBetween($champRef, [$compte_debut, $compte_fin])
            ->where(DB::raw('CAST(t.CodeMonnaie AS UNSIGNED)'), $codeMonnaie)  // ← Conversion explicite
            ->where('t.DateTransaction', '<', $date_debut)
            ->select(
                'c.NumCompte',
                DB::raw("COALESCE(SUM(CASE WHEN LEFT(c.NumCompte,1) IN ('1','2','3') THEN t.$debitCol - t.$creditCol ELSE t.$creditCol - t.$debitCol END), 0) as soldeInitial")
            )
            ->groupBy('c.NumCompte')
            ->get()
            ->keyBy('NumCompte');


        $rawData = [];
        foreach ($comptes as $compte) {
            $num = $compte->NumCompte;
            // Le sous-groupe (RefSousGroupe) est le numéro du compte parent (niveau 4)
            $sousGroupe = !empty($compte->RefSousGroupe) ? $compte->RefSousGroupe : substr($num, 0, 4);

            $soldeInit = $soldesInitiaux[$num]->soldeInitial ?? 0;
            $mvtDebit = $mouvements[$num]->totalDebit ?? 0;
            $mvtCredit = $mouvements[$num]->totalCredit ?? 0;

            $isActif = in_array(substr($num, 0, 1), ['1', '2', '3']);
            if ($isActif) {
                $reportDebit = $soldeInit > 0 ? $soldeInit : 0;
                $reportCredit = $soldeInit < 0 ? -$soldeInit : 0;
            } else {
                $reportDebit = $soldeInit < 0 ? -$soldeInit : 0;
                $reportCredit = $soldeInit > 0 ? $soldeInit : 0;
            }

            $totalDebit = $reportDebit + $mvtDebit;
            $totalCredit = $reportCredit + $mvtCredit;
            $soldeFinal = $totalDebit - $totalCredit;
            $soldeDebiteur = $soldeFinal > 0 ? $soldeFinal : 0;
            $soldeCrediteur = $soldeFinal < 0 ? -$soldeFinal : 0;

            $rawData[] = [
                'NumCompte' => $num,
                'NomCompte' => $compte->NomCompte,
                'RefSousGroupe' => $sousGroupe,
                'report_debit' => $reportDebit,
                'report_credit' => $reportCredit,
                'mvt_debit' => $mvtDebit,
                'mvt_credit' => $mvtCredit,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'solde_debiteur' => $soldeDebiteur,
                'solde_crediteur' => $soldeCrediteur,
            ];
        }





        // ========== MODE CONSOLIDÉ ==========
        // ========== MODE CONSOLIDÉ (regroupement par parent niveau 4) ==========
        if ($type_balance === 'consolide') {
            // Récupérer tous les comptes de niveau 4 (parents) avec leur libellé
            $parents = DB::table('comptes')
                ->where('niveau', 4)
                ->where('est_classe', 1)  // ou 0 selon votre structure, mais niveau 4 suffit
                //->where('CodeMonnaie', $codeMonnaie)
                ->get(['NumCompte', 'NomCompte'])
                ->keyBy('NumCompte');

            $grouped = [];

            foreach ($rawData as $item) {

                // $numCompte = $item['NumCompte'];
                // Le parent est les 4 premiers caractères du compte individuel
                // $parentCode = substr($numCompte, 0, 4);
                $parentCode = $item['RefSousGroupe'];  // NOUVELLE MÉTHODE - utilise la colonne existante

                // Vérifier que ce parent existe bien dans la table des comptes niveau 4
                if (!isset($parents[$parentCode])) {
                    // LOG 2: Parents manquants

                    continue; // on ignore les comptes qui n'ont pas de parent connu
                }

                if (!isset($grouped[$parentCode])) {
                    $grouped[$parentCode] = [
                        'parent_nom' => $parents[$parentCode]->NomCompte,
                        'report_debit' => 0,
                        'report_credit' => 0,
                        'mvt_debit' => 0,
                        'mvt_credit' => 0,
                        'total_debit' => 0,
                        'total_credit' => 0,
                        'solde_debiteur' => 0,
                        'solde_crediteur' => 0,
                    ];
                }




                $grouped[$parentCode]['report_debit'] += $item['report_debit'];
                $grouped[$parentCode]['report_credit'] += $item['report_credit'];
                $grouped[$parentCode]['mvt_debit'] += $item['mvt_debit'];
                $grouped[$parentCode]['mvt_credit'] += $item['mvt_credit'];
                $grouped[$parentCode]['total_debit'] += $item['total_debit'];
                $grouped[$parentCode]['total_credit'] += $item['total_credit'];
                $grouped[$parentCode]['solde_debiteur'] += $item['solde_debiteur'];
                $grouped[$parentCode]['solde_crediteur'] += $item['solde_crediteur'];
            }




            //dd($grouped);
            // Supprimer les sous-groupes complètement nuls (optionnel)
            $grouped = array_filter($grouped, function ($g) {
                return $g['report_debit'] != 0 || $g['report_credit'] != 0 ||
                    $g['mvt_debit'] != 0 || $g['mvt_credit'] != 0 ||
                    $g['total_debit'] != 0 || $g['total_credit'] != 0 ||
                    $g['solde_debiteur'] != 0 || $g['solde_crediteur'] != 0;
            });


            $data = [];
            foreach ($grouped as $code => $g) {
                $data[] = [
                    'compte' => $code . ' - ' . $g['parent_nom'],
                    'report_debit' => $g['report_debit'],
                    'report_credit' => $g['report_credit'],
                    'mvt_debit' => $g['mvt_debit'],
                    'mvt_credit' => $g['mvt_credit'],
                    'total_debit' => $g['total_debit'],
                    'total_credit' => $g['total_credit'],
                    'solde_debiteur' => $g['solde_debiteur'],
                    'solde_crediteur' => $g['solde_crediteur'],
                ];
            }
        }
        // ========== MODE DÉTAILLÉ ==========
        else {
            $data = [];
            foreach ($rawData as $item) {
                $data[] = [
                    'compte' => $item['NumCompte'] ?? '',
                    'libelle' => $item['NomCompte'],
                    'report_debit' => $item['report_debit'],
                    'report_credit' => $item['report_credit'],
                    'mvt_debit' => $item['mvt_debit'],
                    'mvt_credit' => $item['mvt_credit'],
                    'total_debit' => $item['total_debit'],
                    'total_credit' => $item['total_credit'],
                    'solde_debiteur' => $item['solde_debiteur'],
                    'solde_crediteur' => $item['solde_crediteur'],
                ];
            }
        }

        return response()->json([
            'status' => 1,
            'data' => $data,
            'type' => $type_balance,
            'devise' => $devise,
            'periode' => ['debut' => $date_debut, 'fin' => $date_fin]
        ]);
    }

    //PERMET DE D'AFFICHER LA PAGE DE BILAN

    public function getBilanHomePage()
    {
        return view("eco.pages.bilan");
    }


    public function getGrandLivreHomePage()
    {
        return view("eco.pages.grandlivre");
    }


    //GET BILAN DATA 

    public function getBilanCompte(Request $request)
    {
        $date1 = $request->date_debut_balance;
        $date2 = $request->date_fin_balance;
        $devise = $request->devise;

        // Colonnes selon devise
        $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
        $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
        $monnaieValue = $devise === 'USD' ? 1 : 2;
        // ✅ ICI : calcul du 38


        $provision38 = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->where('c.RefCadre', '38')
            ->where('t.CodeMonnaie', $monnaieValue)
            ->select(
                DB::raw("COALESCE(SUM(t.$creditCol - t.$debitCol), 0) as total38"),

            )
            ->first();
        //dd($provision38);

        // ==================== ACTIF ====================
        $actifData = DB::table('comptes as c')
            ->leftJoin('comptes as c_individuel', 'c.NumCompte', '=', 'c_individuel.compte_parent')
            ->leftJoin('transactions as t', function ($join) use ($monnaieValue) {
                $join->on('c_individuel.NumCompte', '=', 't.NumCompte')
                    ->where('t.CodeMonnaie', '=', $monnaieValue);
            })
            ->select(
                'c.NumCompte',
                'c.NomCompte',
                'c.RefCadre',
                'c.RefGroupe',
                'c.RefSousGroupe',
                'c.RefTypeCompte',
                'c.nature_compte',
                // Solde début
                DB::raw("
            COALESCE(SUM(
                CASE 
                    WHEN t.DateTransaction <= '$date1' 
                    THEN  t.$debitCol - t.$creditCol
                    ELSE 0 
                END
            ),0) AS soldeDebut
        "),

                // 🔥 SOLDE FIN 
                DB::raw("
    COALESCE(SUM(
        CASE 
            WHEN t.DateTransaction <= '$date2' 
            THEN  t.$debitCol - t.$creditCol 
            ELSE 0
        END
    ),0) AS soldeFin
"),

                // Solde N-1
                DB::raw("
            COALESCE(SUM(
                CASE 
                    WHEN t.DateTransaction <= DATE_SUB('$date2', INTERVAL 1 MONTH)
                    THEN   t.$debitCol - t.$creditCol
                    ELSE 0 
                END
            ),0) AS soldeN1
        ")
            )
            ->where('c.niveau', 4)
            ->where('c.est_classe', 1)
            ->where('c.nature_compte', 'ACTIF')
            // ->orWhere('c.RefCadre', '38') // 👈 on force juste ici
            ->groupBy(
                'c.NumCompte',
                'c.NomCompte',
                'c.RefCadre',
                'c.RefGroupe',
                'c.RefSousGroupe',
                'c.RefTypeCompte',
                'c.nature_compte'
            )
            ->orderBy('c.RefCadre')
            ->orderBy('c.RefGroupe')
            ->orderBy('c.RefSousGroupe')
            ->get();

        // 🔥 1. Calcul du TOTAL 39 (BRUT)
        // $total39 = collect($actifData)
        //     ->where('RefCadre', '39')
        //     ->sum(function ($item) {
        //         return abs($item->soldeFin);
        //     });

        $total39 = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->where('c.RefCadre', '39')
            ->where('t.CodeMonnaie', $monnaieValue)
            ->select(DB::raw("COALESCE(SUM(t.$debitCol - t.$creditCol), 0) as total39"))
            ->value('total39');



        // 🔥 2. Récupération provision 38
        $provision = abs($provision38->total38 ?? 0);

        // 🔥 3. Calcul NET
        $solde39_brut = $total39;
        $solde38 = $provision;
        $solde39_net = $solde39_brut - $solde38;


        // 🔥 1. Supprimer toutes les lignes 39
        $actifData = collect($actifData)
            ->reject(function ($item) {
                return $item->RefCadre == '39';
            })
            ->values();

        // 🔥 2. Créer une ligne consolidée 39
        $ligne39 = (object)[
            'NumCompte' => '39',
            'NomCompte' => 'Créances douteuses ou litigieuses (NET)',
            'RefCadre' => '39',
            'RefGroupe' => null,
            'RefSousGroupe' => null,
            'RefTypeCompte' => '3',
            'nature_compte' => 'ACTIF',
            'soldeDebut' => 0,
            'soldeFin' => $solde39_net, // 🔥 NET
            'soldeN1' => 0,
            'solde39_brut' => $solde39_brut,
            'solde38' => $solde38,
        ];

        // 🔥 3. Ajouter la ligne 39 dans la collection
        $actifData->push($ligne39);

        // 🔥 4. (Optionnel mais PRO) trier par NumCompte
        $actifData = $actifData->sortBy('NumCompte')->values();

        // 🔥 4. Injection UNE SEULE FOIS dans les données
        foreach ($actifData as $item) {
            if ($item->RefCadre == '39') {

                $item->solde39_brut = $solde39_brut;
                $item->solde38 = $solde38;
                $item->soldeFin = $solde39_net;

                break; // 🔥 TRÈS IMPORTANT (évite duplication)
            }
        }

        // dd($actifData);


        // ==================== PASSIF ====================
        $passifData = DB::table('comptes as c')
            ->leftJoin('comptes as c_individuel', 'c.NumCompte', '=', 'c_individuel.compte_parent')
            ->leftJoin('transactions as t', function ($join) use ($monnaieValue) {
                $join->on('c_individuel.NumCompte', '=', 't.NumCompte')
                    ->where('t.CodeMonnaie', '=', $monnaieValue);
            })
            ->select(
                'c.NumCompte',
                'c.NomCompte',
                'c.RefCadre',
                'c.RefGroupe',
                'c.RefSousGroupe',
                'c.RefTypeCompte',
                'c.nature_compte',
                DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) AS soldeDebut"),
                DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) AS soldeFin")
            )
            ->where('c.niveau', 4)
            ->where('c.est_classe', 1)
            ->where('c.nature_compte', 'PASSIF')
            ->where('c.RefCadre', '!=', '38')
            ->groupBy('c.NumCompte', 'c.NomCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
            ->orderBy('c.RefCadre')
            ->orderBy('c.RefGroupe')
            ->orderBy('c.RefSousGroupe')
            ->get();






        // 🔥 NOUVEAU : CALCUL DYNAMIQUE DU RÉSULTAT (PRODUIT - CHARGE)
        $resultat = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->where('t.CodeMonnaie', $monnaieValue)
            ->where('t.DateTransaction', '<=', $date2)
            ->select(DB::raw("
        SUM(CASE WHEN c.nature_compte = 'PRODUIT' THEN t.$creditCol - t.$debitCol ELSE 0 END) -
        SUM(CASE WHEN c.nature_compte = 'CHARGE' THEN t.$debitCol - t.$creditCol ELSE 0 END) 
        as montant
    "))
            ->first();

        $soldeResultat = $resultat->montant ?? 0;



        if ($soldeResultat != 0) {
            $estBenefice = $soldeResultat > 0;
            $passifData->push((object)[
                'NumCompte'     => $estBenefice ? '131' : '139',
                'NomCompte'     => $estBenefice ? 'RESULTAT NET : BENEFICE' : 'RESULTAT NET : PERTE',
                'RefCadre'      => '13',
                'nature_compte' => 'PASSIF',
                'soldeFin'      => abs($soldeResultat), // On affiche la valeur absolue au Passif
                // ... ajoute les autres colonnes vides si nécessaire (RefGroupe, etc.)
            ]);
        }



        // Calcul des totaux
        $totalActif = $actifData->sum('soldeFin');
        $totalPassif = $passifData->sum('soldeFin');

        return response()->json([
            "status" => 1,
            "actif" => $actifData,
            "passif" => $passifData,
            "totaux" => [
                "actif" => $totalActif,
                "passif" => $totalPassif,
                "difference" => abs($totalActif - $totalPassif),
                "est_equilibre" => abs($totalActif - $totalPassif) < 0.01
            ]
        ]);
    }


    //GRAND LIVRE 

    public function getGrandLivre(Request $request)
    {
        $date_debut = $request->date_debut;
        $date_fin   = $request->date_fin;
        $devise     = $request->devise;
        $compte_debut = $request->compte_debut;
        $compte_fin   = $request->compte_fin;

        $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
        $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
        $codeMonnaie = $devise === 'USD' ? 1 : 2;

        // Détermination du champ de filtre
        if (strlen($compte_debut) == 2 && strlen($compte_fin) == 2) {
            $champRef = 'c.RefCadre';
        } elseif (strlen($compte_debut) == 3 && strlen($compte_fin) == 3) {
            $champRef = 'c.RefGroupe';
        } elseif (strlen($compte_debut) == 13 && strlen($compte_fin) == 13) {
            $champRef = 'c.NumCompte';
        } else {
            $champRef = 'c.RefTypeCompte';
        }

        // Récupération des comptes de niveau 5
        $comptes = DB::table('comptes as c')
            ->whereBetween($champRef, [$compte_debut, $compte_fin])
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->orderBy('c.NumCompte')
            ->get();

        if ($comptes->isEmpty()) {
            return response()->json(['status' => 0, 'msg' => 'Aucun compte trouvé']);
        }

        // Soldes initiaux (avant date_debut)
        $soldesInitiaux = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->whereBetween($champRef, [$compte_debut, $compte_fin])
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->where('t.CodeMonnaie', $codeMonnaie)
            ->where('t.DateTransaction', '<', $date_debut)
            ->select(
                'c.NumCompte',
                DB::raw("
                COALESCE(SUM(
                    CASE 
                        WHEN LEFT(c.NumCompte,1) IN ('1','2','3') THEN t.$debitCol - t.$creditCol
                        ELSE t.$creditCol - t.$debitCol
                    END
                ), 0) as soldeInitial
            ")
            )
            ->groupBy('c.NumCompte')
            ->get()
            ->keyBy('NumCompte');

        // Transactions dans la période (non groupées, pour garder le détail)
        $transactions = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->whereBetween($champRef, [$compte_debut, $compte_fin])
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
            ->where('t.CodeMonnaie', $codeMonnaie)
            ->select(
                't.DateTransaction',
                't.NumTransaction',
                't.Libelle',
                'c.NumCompte',
                'c.NomCompte',
                DB::raw("t.$debitCol as debit"),
                DB::raw("t.$creditCol as credit")
            )
            ->orderBy('c.NumCompte')
            ->orderBy('t.DateTransaction')
            ->orderBy('t.NumTransaction')
            ->get()
            ->groupBy('NumCompte');

        $result = [];

        foreach ($comptes as $compte) {
            $num = $compte->NumCompte;
            $nom = $compte->NomCompte;

            // Solde initial signé (positif pour actif débiteur, négatif pour passif créditeur)
            $soldeCourant = $soldesInitiaux[$num]->soldeInitial ?? 0;

            // Ligne d'en-tête du compte
            $result[] = [
                'type' => 'compte',
                'NumCompte' => $num,
                'NomCompte' => $nom
            ];

            // Ligne solde initial (affichée en valeur absolue, mais on garde le signe pour le cumul)
            $result[] = [
                'type' => 'solde_initial',
                'libelle' => "Solde reporté au $date_debut",
                'debit' => 0,
                'credit' => 0,
                'solde' => $soldeCourant,   // valeur signée
                'solde_abs' => abs($soldeCourant)
            ];

            $totalDebit = 0;
            $totalCredit = 0;

            if (isset($transactions[$num])) {
                foreach ($transactions[$num] as $t) {
                    // Mise à jour du solde selon la nature du compte
                    if (in_array($num[0], ['1', '2', '3'])) { // compte actif
                        $soldeCourant += ($t->debit - $t->credit);
                    } else { // compte passif / produit / charge
                        $soldeCourant += ($t->credit - $t->debit);
                    }

                    $totalDebit += $t->debit;
                    $totalCredit += $t->credit;

                    $result[] = [
                        'type' => 'mouvement',
                        'date' => $t->DateTransaction,
                        'numPiece' => $t->NumTransaction,
                        'libelle' => $t->Libelle,
                        'debit' => $t->debit,
                        'credit' => $t->credit,
                        'solde' => $soldeCourant,   // solde signé
                        'solde_abs' => abs($soldeCourant)
                    ];
                }
            }

            // Ligne TOTAL
            $result[] = [
                'type' => 'total',
                'libelle' => 'TOTAL',
                'debit' => $totalDebit,
                'credit' => $totalCredit,
                'solde' => $soldeCourant,
                'solde_abs' => abs($soldeCourant)
            ];
        }


        //     $result[] = [
        //     'type' => 'mouvement',
        //     'date' => $t->DateTransaction,
        //     'numPiece' => $t->NumTransaction,
        //     'libelle' => $t->Libelle,
        //     'debit' => $t->debit,
        //     'credit' => $t->credit,
        //     'solde_precedent' => $soldeCourant - (($num[0] <= 3) ? ($t->debit - $t->credit) : ($t->credit - $t->debit)),
        //     'solde' => $soldeCourant,
        //     'solde_abs' => abs($soldeCourant)
        // ];

        return response()->json([
            'status' => 1,
            'data' => $result
        ]);
    }








    //GET TFR HOME PAGE
    public function getTfrHomePage()
    {
        return view("eco.pages.tfr");
    }


    //GET TFR REPORT 
    public function getTfrCompte(Request $request)
    {
        $date_debut = $request->date_debut;
        $date_fin   = $request->date_fin;
        $devise     = $request->devise;
        $type_tfr   = $request->type_tfr ?? 'detail'; // 'detail' ou 'consolide'

        $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
        $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
        $codeMonnaie = $devise === 'USD' ? 1 : 2;



        // 🔥 Vérification : les dates doivent être dans la même année
        $annee_debut = date('Y', strtotime($date_debut));
        $annee_fin = date('Y', strtotime($date_fin));

        if ($annee_debut != $annee_fin) {
            return response()->json([
                'status' => 0,
                'msg' => 'Veuillez choisir des dates appartenant à la même année. Le TFR s\'analyse sur un exercice annuel.'
            ]);
        }



        // Récupérer les comptes de produits et charges (niveau 5, est_classe=0)
        $comptes = DB::table('comptes as c')
            ->whereIn('c.nature_compte', ['PRODUIT', 'CHARGE'])
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->orderBy('c.NumCompte')
            ->get(['c.NumCompte', 'c.NomCompte', 'c.nature_compte', 'c.RefGroupe', 'c.RefCadre']);

        if ($comptes->isEmpty()) {
            return response()->json(['status' => 0, 'msg' => 'Aucun compte de produit ou charge trouvé pour cette devise']);
        }

        // Calcul des soldes sur la période (cumul des mouvements)
        // $soldes = DB::table('transactions as t')
        //     ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        //     ->whereIn('c.nature_compte', ['PRODUIT', 'CHARGE'])
        //     ->where('c.niveau', 5)
        //     ->where('c.est_classe', 0)
        //     ->where('c.CodeMonnaie', $codeMonnaie)
        //     ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
        //     ->where('t.CodeMonnaie', $codeMonnaie)

        //     ->select(
        //         'c.NumCompte',
        //         'c.NomCompte',
        //         'c.nature_compte',
        //         'c.RefGroupe',
        //         'c.RefCadre',
        //         DB::raw("SUM(t.$debitCol) as totalDebit"),
        //         DB::raw("SUM(t.$creditCol) as totalCredit")
        //     )
        //     ->groupBy('c.NumCompte', 'c.NomCompte', 'c.nature_compte', 'c.RefGroupe', 'c.RefCadre')
        //     ->get();

        $soldes = DB::table('transactions as t')
            ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
            ->whereIn('c.nature_compte', ['PRODUIT', 'CHARGE'])
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
            ->where('t.CodeMonnaie', $codeMonnaie)
            //   ->whereRaw("t.Libelle NOT LIKE '%CLOTURE ANNUELLE%'")
            ->select(
                'c.NumCompte',
                'c.NomCompte',
                'c.nature_compte',
                'c.RefGroupe',
                'c.RefCadre',
                DB::raw("SUM(t.$debitCol) as totalDebit"),
                DB::raw("SUM(t.$creditCol) as totalCredit")
            )
            ->groupBy('c.NumCompte', 'c.NomCompte', 'c.nature_compte', 'c.RefGroupe', 'c.RefCadre')
            ->get();

        $rawData = [];
        foreach ($soldes as $compte) {
            if ($compte->nature_compte === 'CHARGE') {
                $solde = $compte->totalDebit - $compte->totalCredit; // une charge augmente par débit
            } else { // PRODUIT
                $solde = $compte->totalCredit - $compte->totalDebit; // un produit augmente par crédit
            }
            // On ignore les lignes avec solde nul
            if (abs($solde) < 0.01) continue;
            $rawData[] = [
                'NumCompte' => $compte->NumCompte,
                'NomCompte' => $compte->NomCompte,
                'nature' => $compte->nature_compte,
                'RefGroupe' => $compte->RefGroupe,
                'RefCadre' => $compte->RefCadre,
                'solde' => $solde,
            ];
        }

        // Mode consolidé (regroupement par RefGroupe)
        if ($type_tfr === 'consolide') {
            $grouped = [];
            foreach ($rawData as $item) {
                $key = $item['RefGroupe'] ?? substr($item['NumCompte'], 0, 3);
                if (!isset($grouped[$key])) {
                    $grouped[$key] = [
                        'code' => $key,
                        'libelle' => '',
                        'nature' => $item['nature'],
                        'solde' => 0,
                    ];
                }
                $grouped[$key]['solde'] += $item['solde'];
            }
            // Récupérer les libellés des groupes (comptes de niveau 3)
            $groupes = DB::table('comptes')
                ->whereIn('RefGroupe', array_keys($grouped))
                ->where('niveau', 3)
                ->get(['RefGroupe', 'NomCompte'])
                ->keyBy('RefGroupe');
            $data = [];
            foreach ($grouped as $key => $g) {
                $libelle = isset($groupes[$key]) ? $groupes[$key]->NomCompte : "Groupe $key";
                $data[] = [
                    'compte' => $key . ' - ' . $libelle,
                    'nature' => $g['nature'],
                    'solde' => $g['solde'],
                ];
            }
        } else {
            // Mode détaillé
            $data = [];
            foreach ($rawData as $item) {
                $data[] = [
                    'compte' => $item['NumCompte'] . ' - ' . $item['NomCompte'],
                    'nature' => $item['nature'],
                    'solde' => $item['solde'],
                ];
            }
        }

        // Totaux
        $totalProduits = collect($rawData)->where('nature', 'PRODUIT')->sum('solde');
        $totalCharges = collect($rawData)->where('nature', 'CHARGE')->sum('solde');
        $resultat = $totalProduits - $totalCharges;

        return response()->json([
            'status' => 1,
            'data' => $data,
            'type' => $type_tfr,
            'devise' => $devise,
            'periode' => ['debut' => $date_debut, 'fin' => $date_fin],
            'totaux' => [
                'produits' => $totalProduits,
                'charges' => $totalCharges,
                'resultat' => $resultat,
            ]
        ]);
    }
    //GET REMBOURSEMENT ATTENDU HOME PAGE

    public function getRemboursementAttenduHomePage()
    {
        return view("eco.pages.remboursement-attendu");
    }

    //PERMET DE RECUPERER LE REMBOURSEMENT ATTENDU

    public function getRemboursAttendu(Request $request)
    {
        // dd($request->all());
        // $nombreSemaine = 1;
        $date1 = $request->dateToSearch1;
        $date2 = $request->dateToSearch2;
        if (isset($date1) and isset($date2)) {
            if ($request->devise == "CDF") {


                $data = DB::table('echeanciers')
                    ->leftJoin('portefeuilles', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                    ->select(
                        'echeanciers.*',
                        'portefeuilles.*',
                        DB::raw('IFNULL((SELECT SUM(transactions.Creditfc) - SUM(transactions.Debitfc) 
          FROM transactions 
          WHERE transactions.NumCompte = portefeuilles.NumCompteEpargne 
          AND transactions.extourner != 1), 0) AS soldeMembreCDF')
                    )
                    ->whereBetween('echeanciers.DateTranch', [$date1, $date2])
                    ->where('portefeuilles.CodeMonnaie', 'CDF')
                    ->where('portefeuilles.Cloture', '!=', 1)
                    ->where('portefeuilles.Accorde', 1)
                    ->where('portefeuilles.Octroye', 1)
                    ->where(function ($query) {
                        $query->where('echeanciers.CapAmmorti', '>', 0)
                            ->orWhere('echeanciers.Interet', '>', 0);
                    })
                    ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                        $query->where('portefeuilles.Gestionnaire', $request->agent_credit_name);
                    })
                    ->orderBy('echeanciers.DateTranch')
                    ->get();






                //RECUPERE LA SOMME
                if (count($data) != 0) {
                    $dataSomme = DB::select('SELECT SUM(CapAmmorti) as sommeCapApayer,SUM(Interet) as sommeInteretApayer FROM echeanciers  WHERE echeanciers.DateTranch BETWEEN "' . $date1 . '" AND "' . $date2 . '"')[0];
                    return response()->json(["status" => 1, "data" => $data, "dataSomme" => $dataSomme]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Pas des données trouvées"]);
                }
            }
            if ($request->devise == "USD") {


                // $data = DB::select('SELECT * FROM echeanciers 
                // LEFT JOIN portefeuilles 
                // ON echeanciers.NumDossier=portefeuilles.NumDossier 
                // WHERE echeanciers.DateTranch 
                // BETWEEN "' . $date1 . '" AND "' . $date2 . '" 
                // AND portefeuilles.CodeMonnaie="USD" AND portefeuilles.Cloture!=1 
                // AND portefeuilles.Accorde=1 AND portefeuilles.Octroye=1  
                // AND (echeanciers.CapAmmorti>0 OR echeanciers.Interet>0) 
                // ORDER BY echeanciers.DateTranch');
                $data = DB::table('echeanciers')
                    ->leftJoin('portefeuilles', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                    ->select(
                        'echeanciers.*',
                        'portefeuilles.*',
                        DB::raw('IFNULL((SELECT SUM(transactions.Creditusd) - SUM(transactions.Debitusd) 
                      FROM transactions 
                      WHERE transactions.NumCompte = portefeuilles.NumCompteEpargne AND transactions.extourner != 1), 0) AS soldeMembreUSD')
                    )
                    ->whereBetween('echeanciers.DateTranch', [$date1, $date2])
                    ->where('portefeuilles.CodeMonnaie', 'USD')
                    ->where('portefeuilles.Cloture', '!=', 1)
                    ->where('portefeuilles.Accorde', 1)
                    ->where('portefeuilles.Octroye', 1)
                    ->where(function ($query) {
                        $query->where('echeanciers.CapAmmorti', '>', 0)
                            ->orWhere('echeanciers.Interet', '>', 0);
                    })
                    ->when(!empty($request->agent_credit_name), function ($query) use ($request) {
                        $query->where('portefeuilles.Gestionnaire', $request->agent_credit_name);
                    })
                    ->orderBy('echeanciers.DateTranch')
                    ->get();

                //RECUPERE LA SOMME
                if (count($data) != 0) {
                    $dataSomme = DB::select('SELECT SUM(CapAmmorti) as sommeCapApayer,SUM(Interet) as sommeInteretApayer FROM echeanciers  WHERE echeanciers.DateTranch BETWEEN "' . $date1 . '" AND "' . $date2 . '"')[0];
                    return response()->json(["status" => 1, "data" => $data, "dataSomme" => $dataSomme]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Pas des données trouvées"]);
                }
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Veuillez renseigner la date de début et la date de fin"]);
        }
    }

    public function getSommaireCompteHomePage()
    {
        return view("eco.pages.sommaire-compte");
    }

    //PERMET DE RECUPERER LE NOM D'UN SOUS GROUPE DE COMPTE 

    public function getAccountName(Request $request)
    {
        if (isset($request->sous_groupe_compte)) {
            $accountName = Comptes::where("NumCompte", $request->sous_groupe_compte)
                ->orWhere("RefCadre", $request->sous_groupe_compte)
                ->where("isCompteInterne", 1)
                ->first();
            if ($accountName) {
                $accountName = Comptes::where("NumCompte", $request->sous_groupe_compte)
                    ->orWhere("RefCadre", $request->sous_groupe_compte)
                    ->where("isCompteInterne", 1)
                    ->first()->NomCompte;
                return response()->json(["status" => 1, "accountName" => $accountName]);
            } else {
                return response()->json(["status" => 0, "msg" => "Aucun compte trouvé"]);
            }
        }
    }

    //PERMET D'AFFICHER LE SOMMAIRE DE COMPTES
    public function getSommaireCompte(Request $request)
    {
        $date1 = $request->date_debut_balance;
        $date2 = $request->date_fin_balance;
        $sousGroupeCompte = $request->sous_groupe_compte;

        // Déterminer le CodeMonnaie et les colonnes en fonction de la valeur entrée
        // RefSousGroupe est TOUJOURS '3300' pour les deux devises
        $refSousGroupe = '3300';

        if ($sousGroupeCompte == 3300) {
            // USD
            $codeMonnaie = 1;
            $debitCol = 'Debitusd';
            $creditCol = 'Creditusd';
        } elseif ($sousGroupeCompte == 3301) {
            // CDF
            $codeMonnaie = 2;
            $debitCol = 'Debitfc';
            $creditCol = 'Creditfc';
        } else {
            return response()->json(["status" => 0, "msg" => "Code invalide. Utilisez 3300 pour USD ou 3301 pour CDF"]);
        }

        // Pour le rapport non converti
        if (isset($request->radioValue) && $request->radioValue == "rapport_non_converti") {
            $getSoldeCompte = DB::table('comptes as c')
                ->leftJoin('transactions as t', 'c.NumCompte', '=', 't.NumCompte')
                ->select(
                    'c.NumCompte',
                    'c.NomCompte',
                    DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) as soldeDebut"),
                    DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) as soldeFin")
                )
                ->where('c.RefSousGroupe', $refSousGroupe)  // Toujours '3300'
                ->where('c.CodeMonnaie', $codeMonnaie)      // 1 pour USD, 2 pour CDF
                ->where('c.niveau', 5)
                ->where('c.est_classe', 0)
                ->whereNotNull('c.NumCompte')
                ->whereNotNull('c.NomCompte')
                ->groupBy('c.NumCompte', 'c.NomCompte')
                ->orderBy('c.NomCompte')
                ->when(
                    $request->has('critereSolde') && $request->has('critereSoldeAmount'),
                    function ($query) use ($request) {
                        $critere = $request->critereSolde;
                        $amount = $request->critereSoldeAmount;
                        switch ($critere) {
                            case '>':
                                return $query->havingRaw('soldeFin > ?', [$amount]);
                            case '>=':
                                return $query->havingRaw('soldeFin >= ?', [$amount]);
                            case '<':
                                return $query->havingRaw('soldeFin < ?', [$amount]);
                            case '<=':
                                return $query->havingRaw('soldeFin <= ?', [$amount]);
                            case '=':
                                return $query->havingRaw('soldeFin = ?', [$amount]);
                            case '<>':
                                return $query->havingRaw('soldeFin <> ?', [$amount]);
                            default:
                                return $query;
                        }
                    }
                )
                ->get();

            return response()->json(["status" => 1, "data" => $getSoldeCompte]);
        }

        // Pour le rapport converti en CDF
        if (isset($request->radioValue) && $request->radioValue == "balance_convertie_cdf") {
            $getSoldeCompte = DB::table('comptes as c')
                ->leftJoin('transactions as t', function ($join) use ($date2) {
                    $join->on('c.NumCompte', '=', 't.NumCompte')
                        ->where('t.DateTransaction', '<=', $date2);
                })
                ->select(
                    'c.NumCompte',
                    'c.NomCompte',
                    DB::raw("
                    COALESCE(SUM(
                        CASE 
                            WHEN t.CodeMonnaie = 2 AND t.DateTransaction <= '$date2' 
                            THEN t.Creditfc - t.Debitfc
                            WHEN t.CodeMonnaie = 1 AND t.DateTransaction <= '$date2' 
                            THEN (t.Creditusd - t.Debitusd) * COALESCE(t.Taux, 1)
                            ELSE 0 
                        END
                    ), 0) as solde_consolide_cdf
                ")
                )
                ->where('c.RefSousGroupe', $refSousGroupe)  // Toujours '3300'
                ->where('c.niveau', 5)
                ->where('c.est_classe', 0)
                ->whereNotNull('c.NumCompte')
                ->whereNotNull('c.NomCompte')
                ->groupBy('c.NumCompte', 'c.NomCompte')
                ->orderBy('c.NomCompte')
                ->when(
                    $request->has('critereSolde') && $request->has('critereSoldeAmount'),
                    function ($query) use ($request) {
                        $critere = $request->critereSolde;
                        $amount = $request->critereSoldeAmount;
                        switch ($critere) {
                            case '>':
                                return $query->havingRaw('solde_consolide_cdf > ?', [$amount]);
                            case '>=':
                                return $query->havingRaw('solde_consolide_cdf >= ?', [$amount]);
                            case '<':
                                return $query->havingRaw('solde_consolide_cdf < ?', [$amount]);
                            case '<=':
                                return $query->havingRaw('solde_consolide_cdf <= ?', [$amount]);
                            case '=':
                                return $query->havingRaw('solde_consolide_cdf = ?', [$amount]);
                            case '<>':
                                return $query->havingRaw('solde_consolide_cdf <> ?', [$amount]);
                            default:
                                return $query;
                        }
                    }
                )
                ->get();

            return response()->json(["status" => 1, "data" => $getSoldeCompte]);
        }

        // Pour le rapport converti en USD
        if (isset($request->radioValue) && $request->radioValue == "balance_convertie_usd") {
            $getSoldeCompte = DB::table('comptes as c')
                ->leftJoin('transactions as t', function ($join) use ($date2) {
                    $join->on('c.NumCompte', '=', 't.NumCompte')
                        ->where('t.DateTransaction', '<=', $date2);
                })
                ->select(
                    'c.NumCompte',
                    'c.NomCompte',
                    DB::raw("
                    COALESCE(SUM(
                        CASE 
                            WHEN t.CodeMonnaie = 1 AND t.DateTransaction <= '$date2' 
                            THEN t.Creditusd - t.Debitusd
                            WHEN t.CodeMonnaie = 2 AND t.DateTransaction <= '$date2' 
                            THEN (t.Creditfc - t.Debitfc) / COALESCE(t.Taux, 1)
                            ELSE 0 
                        END
                    ), 0) as solde_consolide_usd
                ")
                )
                ->where('c.RefSousGroupe', $refSousGroupe)  // Toujours '3300'
                ->where('c.niveau', 5)
                ->where('c.est_classe', 0)
                ->whereNotNull('c.NumCompte')
                ->whereNotNull('c.NomCompte')
                ->groupBy('c.NumCompte', 'c.NomCompte')
                ->orderBy('c.NomCompte')
                ->when(
                    $request->has('critereSolde') && $request->has('critereSoldeAmount'),
                    function ($query) use ($request) {
                        $critere = $request->critereSolde;
                        $amount = $request->critereSoldeAmount;
                        switch ($critere) {
                            case '>':
                                return $query->havingRaw('solde_consolide_usd > ?', [$amount]);
                            case '>=':
                                return $query->havingRaw('solde_consolide_usd >= ?', [$amount]);
                            case '<':
                                return $query->havingRaw('solde_consolide_usd < ?', [$amount]);
                            case '<=':
                                return $query->havingRaw('solde_consolide_usd <= ?', [$amount]);
                            case '=':
                                return $query->havingRaw('solde_consolide_usd = ?', [$amount]);
                            case '<>':
                                return $query->havingRaw('solde_consolide_usd <> ?', [$amount]);
                            default:
                                return $query;
                        }
                    }
                )
                ->get();

            return response()->json(["status" => 1, "data" => $getSoldeCompte]);
        }

        return response()->json(["status" => 0, "msg" => "Type de rapport non reconnu"]);
    }

    //RECUPERE LES APPRO JOURNALIERE 

    public function getDailyAppro()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $dataCDF = BilletageAppro_cdf::where("DateTransaction", $dataSystem->DateSystem)->orderBy("id", "desc")->get();
        $dataUSD = BilletageAppro_usd::where("DateTransaction", $dataSystem->DateSystem)->orderBy("id", "desc")->get();

        return response()->json(["status" => 1, "dataCDF" => $dataCDF, "dataUSD" => $dataUSD]);
    }


    //RECUPERE LE DELESTAGE JOURNALIERE 

    public function getDailyDelestage()
    {
        $checkIsChefCaisse = Comptes::where("isChefCaisse", 1)->where("caissierId", Auth::user()->id)->first();
        $checkIsCaissier = Comptes::where("caissierId", Auth::user()->id)->first();
        $dataSystem = TauxEtDateSystem::latest()->first();
        if ($checkIsChefCaisse) {
            $dataCDF = Delestages::where("DateTransaction", $dataSystem->DateSystem)->where("CodeMonnaie", 2)->orderBy("id", "desc")->get();
            $dataUSD = Delestages::where("DateTransaction", $dataSystem->DateSystem)->where("CodeMonnaie", 1)->orderBy("id", "desc")->get();
            return response()->json(["status" => 1, "dataCDF" => $dataCDF, "dataUSD" => $dataUSD]);
        } else if ($checkIsCaissier) {
            $dataCDF = Delestages::where("DateTransaction", $dataSystem->DateSystem)->where("NomUtilisateur", Auth::user()->name)->where("CodeMonnaie", 2)->orderBy("id", "desc")->get();
            $dataUSD = Delestages::where("DateTransaction", $dataSystem->DateSystem)->where("NomUtilisateur", Auth::user()->name)->where("CodeMonnaie", 1)->orderBy("id", "desc")->get();
            return response()->json(["status" => 1, "dataCDF" => $dataCDF, "dataUSD" => $dataUSD]);
        }
    }

    //RECUPERE LES RECU JOURNALIERS POUR LES DEPOTS

    public function getDailyRecuDepot()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();

        $dataCDF = BilletageCDF::where("DateTransaction", $dataSystem->DateSystem)->where("NomUtilisateur", Auth::user()->name)->where("montantEntre", ">", 0)->orderBy("id", "desc")->limit(20)->get();
        $dataUSD = BilletageUSD::where("DateTransaction", $dataSystem->DateSystem)->where("NomUtilisateur", Auth::user()->name)->where("montantEntre", ">", 0)->orderBy("id", "desc")->limit(20)->get();
        return response()->json(["status" => 1, "dataCDF" => $dataCDF, "dataUSD" => $dataUSD]);
    }

    //RECUPERE LES RECU JOURNALIERS POUR LE RETRAIT

    public function getDailyRecuRetrait()
    {
        $dataSystem = TauxEtDateSystem::latest()->first();

        $dataCDF = BilletageCDF::where("DateTransaction", $dataSystem->DateSystem)->where("NomUtilisateur", Auth::user()->name)->where("montantSortie", ">", 0)->orderBy("id", "desc")->limit(20)->get();
        $dataUSD = BilletageUSD::where("DateTransaction", $dataSystem->DateSystem)->where("NomUtilisateur", Auth::user()->name)->where("montantSortie", ">", 0)->orderBy("id", "desc")->limit(20)->get();
        return response()->json(["status" => 1, "dataCDF" => $dataCDF, "dataUSD" => $dataUSD]);
    }



    // $result = DB::table('echeancier')
    //     ->select(
    //         'echeancier.NumDossier',
    //         DB::raw('SUM(echeancier.Interet) AS sommeInteretRetard'),
    //         DB::raw('SUM(echeancier.CapitalAmorti) AS sommeCapitalRetard')
    //     )
    //     ->leftJoin('remboursementcredit', 'echeancier.ReferenceEch', '=', 'remboursementcredit.ReferenceEch')
    //     ->where('echeancier.RetardPayement', 1)
    //     ->whereRaw(
    //         '(COALESCE(remboursementcredit.InteretPaye, 0) + COALESCE(remboursementcredit.CapitalPaye, 0)) < 
    //         (echeancier.Interet + echeancier.CapitalAmorti)'
    //     )
    //     ->groupBy('echeancier.NumDossier')
    //     ->get();


    public function getAgentCredit()
    {
        $getAgentCreditNames = DB::select("
        SELECT DISTINCT users.id, users.name, users.email
        FROM users
        INNER JOIN profils_users ON users.id = profils_users.user_id
        INNER JOIN profiles ON profils_users.profil_id = profiles.id
    ");

        return response()->json([
            "get_agent_credit" => $getAgentCreditNames,
            "status" => 1
        ]);
    }



    public function downloadReportSommaireCompte(Request $request)
    {
        $fetchData = $request->input('fetchData');
        $date_debut_balance = $request->input('date_debut_balance');
        $date_fin_balance = $request->input('date_fin_balance');
        $type = $request->input('type'); // Type du fichier (pdf ou excel)

        // Filtrer les colonnes que vous souhaitez pour Excel et remplacer les nulls par 0


        $view = 'reports.sommaire-compte'; // Vue Blade pour le PDF
        $filename = 'sommaire_de_compte'; // Nom du fichier

        // Générer le PDF si le type est pdf
        if ($type === "pdf") {
            $date_debut_balance = \Carbon\Carbon::parse($date_debut_balance)->format('d-m-Y');
            $date_fin_balance = \Carbon\Carbon::parse($date_fin_balance)->format('d-m-Y');
            $pdf = PDF::loadView('reports.sommaire-compte', compact('fetchData', 'date_debut_balance', 'date_fin_balance'));
            return $pdf->download('sommaire_de_compte.pdf');
        } else if ($type === 'excel') {
            // Définir les colonnes à sélectionner
            $columnsToSelect = ['NumCompte', 'NomCompte', 'soldeFin'];

            // Filtrer et réorganiser les données pour respecter l'ordre attendu
            $filteredData = array_map(function ($row) use ($columnsToSelect) {
                // Filtrer les colonnes pour récupérer les bonnes valeurs
                $filteredRow = array_intersect_key($row, array_flip($columnsToSelect));

                // S'assurer que les valeurs de 'NumCompte' et 'NomCompte' sont correctement assignées
                // Convertir NumCompte en chaîne de caractères pour éviter la notation scientifique
                $filteredRow['NumCompte'] = "'" . (string) $filteredRow['NumCompte']; // Ajout d'une apostrophe pour éviter la notation scientifique

                // Remplacer soldeFin null par 0
                if (isset($filteredRow['soldeFin']) && is_null($filteredRow['soldeFin'])) {
                    $filteredRow['soldeFin'] = 0;
                }

                // Assurez-vous que la colonne NomCompte contient bien les valeurs des noms
                $filteredRow['NomCompte'] = (isset($filteredRow['NomCompte'])) ? $filteredRow['NomCompte'] : '';

                return $filteredRow;
            }, $fetchData);

            // En-têtes pour le fichier Excel
            $headers = ['NumCompte', 'NomCompte', 'Solde Fin'];

            // Réorganiser les colonnes pour garantir que NumCompte, NomCompte et soldeFin sont dans l'ordre correct
            $reorderedData = array_map(function ($row) {
                return [
                    'NumCompte' => $row['NumCompte'],  // La colonne 'NumCompte' doit venir en premier
                    'NomCompte' => $row['NomCompte'],  // La colonne 'NomCompte' doit venir en second
                    'soldeFin' => $row['soldeFin'],    // La colonne 'soldeFin' doit être la troisième
                ];
            }, $filteredData);

            // Définir le nom du fichier Excel
            $sheetName = 'Soldes des Comptes';
            $filename = 'Sommaire_Compte_' . date('Y-m-d'); // Exemple de nom dynamique

            // Appeler la méthode pour générer le fichier Excel
            return $this->reportService->generateExcelWithHeaders($reorderedData, $headers, $sheetName, $filename);
        }
    }


    public function downloadReportSommaireCompteConvertie(Request $request)
    {
        $fetchData = $request->input('fetchData');
        $date_debut_balance = $request->input('date_debut_balance');
        $date_fin_balance = $request->input('date_fin_balance');
        $type = $request->input('type'); // Type du fichier (pdf ou excel)

        // Filtrer les colonnes que vous souhaitez pour Excel et remplacer les nulls par 0


        $view = 'reports.sommaire-compte_convertie'; // Vue Blade pour le PDF
        $filename = 'sommaire_de_compte_convertie'; // Nom du fichier

        // Générer le PDF si le type est pdf
        if ($type === "pdf") {
            $date_debut_balance = \Carbon\Carbon::parse($date_debut_balance)->format('d-m-Y');
            $date_fin_balance = \Carbon\Carbon::parse($date_fin_balance)->format('d-m-Y');
            $pdf = PDF::loadView('reports.sommaire-compte_convertie', compact('fetchData', 'date_debut_balance', 'date_fin_balance'));
            return $pdf->download('sommaire_de_compte_converti.pdf');
        }
        // } else if ($type === 'excel') {
        //     // Définir les colonnes à sélectionner
        //     $columnsToSelect = ['NumCompte', 'NomCompte', 'soldeFin'];

        //     // Filtrer et réorganiser les données pour respecter l'ordre attendu
        //     $filteredData = array_map(function ($row) use ($columnsToSelect) {
        //         // Filtrer les colonnes pour récupérer les bonnes valeurs
        //         $filteredRow = array_intersect_key($row, array_flip($columnsToSelect));

        //         // S'assurer que les valeurs de 'NumCompte' et 'NomCompte' sont correctement assignées
        //         // Convertir NumCompte en chaîne de caractères pour éviter la notation scientifique
        //         $filteredRow['NumCompte'] = "'" . (string) $filteredRow['NumCompte']; // Ajout d'une apostrophe pour éviter la notation scientifique

        //         // Remplacer soldeFin null par 0
        //         if (isset($filteredRow['soldeFin']) && is_null($filteredRow['soldeFin'])) {
        //             $filteredRow['soldeFin'] = 0;
        //         }

        //         // Assurez-vous que la colonne NomCompte contient bien les valeurs des noms
        //         $filteredRow['NomCompte'] = (isset($filteredRow['NomCompte'])) ? $filteredRow['NomCompte'] : '';

        //         return $filteredRow;
        //     }, $fetchData);

        //     // En-têtes pour le fichier Excel
        //     $headers = ['NumCompte', 'NomCompte', 'Solde Fin'];

        //     // Réorganiser les colonnes pour garantir que NumCompte, NomCompte et soldeFin sont dans l'ordre correct
        //     $reorderedData = array_map(function ($row) {
        //         return [
        //             'NumCompte' => $row['NumCompte'],  // La colonne 'NumCompte' doit venir en premier
        //             'NomCompte' => $row['NomCompte'],  // La colonne 'NomCompte' doit venir en second
        //             'soldeFin' => $row['soldeFin'],    // La colonne 'soldeFin' doit être la troisième
        //         ];
        //     }, $filteredData);

        //     // Définir le nom du fichier Excel
        //     $sheetName = 'Soldes des Comptes';
        //     $filename = 'Sommaire_Compte_' . date('Y-m-d'); // Exemple de nom dynamique

        //     // Appeler la méthode pour générer le fichier Excel
        //     return $this->reportService->generateExcelWithHeaders($reorderedData, $headers, $sheetName, $filename);
        // }
    }

    //PERMET D'EXPORTE LE RAPPORT LISTE DES COMPTES

    public function downloadReportCompteEpargne(Request $request)
    {

        $fetchData = $request->input('fetchDataCompteEpargne');
        $fetchDataCompteInterne = $request->input('fetchDataCompteInterne');



        $type = $request->input('type'); // Type du fichier (pdf ou excel)

        // 🔥 On récupère directement depuis la DB (MEILLEURE PRATIQUE)
        $data = Comptes::whereIn('nature_compte', [
            'ACTIF',
            'PASSIF',
            'PRODUIT',
            'CHARGE',
            'HORS BILAN'
        ])
            ->where('niveau', 5)
            ->orderByRaw("CASE 
            WHEN nature_compte = 'ACTIF' THEN 1
            WHEN nature_compte = 'PASSIF' THEN 2
            WHEN nature_compte = 'PRODUIT' THEN 3
            WHEN nature_compte = 'CHARGE' THEN 4
            WHEN nature_compte = 'HORS BILAN' THEN 5
        END")
            ->orderBy('NumCompte')
            ->get();

        // 🔥 Groupement par section
        $groupedData = [];
        $sections = ['ACTIF', 'PASSIF', 'PRODUIT', 'CHARGE', 'HORS BILAN'];
        foreach ($sections as $section) {
            $groupedData[$section] = [
                'USD' => $data->where('nature_compte', $section)->where('CodeMonnaie', 1)->values(),
                'CDF' => $data->where('nature_compte', $section)->where('CodeMonnaie', 2)->values(),
            ];
        }

        if ($type === "pdf") {

            $pdf = Pdf::loadView('reports.liste-compte-pargne', [
                'groupedData' => $groupedData
            ]);

            return $pdf->download('plan_comptable_interne.pdf');
        } else if ($type === 'excel') {
            // Définir les colonnes à sélectionner
            $columnsToSelect = ['NumCompte', 'NomCompte', 'sexe', 'NumAdherant', 'solde', 'CodeMonnaie', 'derniere_date_transaction'];

            // Filtrer et réorganiser les données pour respecter l'ordre attendu
            $filteredData = array_map(function ($row) use ($columnsToSelect) {
                // Filtrer les colonnes pour récupérer les bonnes valeurs
                $filteredRow = array_intersect_key($row, array_flip($columnsToSelect));

                // S'assurer que les valeurs de 'NumCompte' et 'NomCompte' sont correctement assignées
                // Convertir NumCompte en chaîne de caractères pour éviter la notation scientifique
                $filteredRow['NumCompte'] = "'" . (string) $filteredRow['NumCompte']; // Ajout d'une apostrophe pour éviter la notation scientifiqu

                // Assurez-vous que la colonne NomCompte contient bien les valeurs des noms
                $filteredRow['NomCompte'] = (isset($filteredRow['NomCompte'])) ? $filteredRow['NomCompte'] : '';

                return $filteredRow;
            }, $fetchData ?? $fetchDataCompteInterne);

            // En-têtes pour le fichier Excel
            $headers = ['NumCompte', 'NomCompte', 'Genre', 'NumAbregé', 'Solde', 'CodeMonnaie', 'DateDernièreTransaction'];

            // Réorganiser les colonnes pour garantir que NumCompte, NomCompte et soldeFin sont dans l'ordre correct
            $reorderedData = array_map(function ($row) {
                return [
                    'NumCompte' => $row['NumCompte'],               // La colonne 'NumCompte' doit venir en premier
                    'NomCompte' => $row['NomCompte'],               // La colonne 'NomCompte' doit venir en second
                    'Genre' => $row['sexe'],                        // Le genre basé sur 'sexe'
                    'NumAbregé' => $row['NumAdherant'],             // La colonne 'NumAdherant' doit être la troisième
                    'Solde' => $row['solde'],                       // Le solde
                    'CodeMonnaie' => $row['CodeMonnaie'] == 1 ? 'USD' : 'CDF', // Affichage conditionnel
                    'DateDernièreTransaction' => $row['derniere_date_transaction'], // La dernière date de transaction
                ];
            }, $filteredData);

            // Définir le nom du fichier Excel
            $sheetName = 'Liste_des_comptes_epargne';
            $filename = 'Liste_des_comptes' . date('Y-m-d'); // Exemple de nom dynamique
            // Appeler la méthode pour générer le fichier Excel
            return $this->reportService->generateExcelWithHeaders($reorderedData, $headers, $sheetName, $filename);
        }
    }
}
