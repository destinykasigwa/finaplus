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

    // //GET JOURNAL DROP MENU
    // public function getJournalDropMenu()
    // {
    //     $data = DB::select("SELECT * FROM type_journal ORDER BY id");
    //     $users = User::get();
    //     return response()->json(["status" => 1, "data" => $data, "users" => $users]);
    // }

    public function getJournalDropMenu()
{
    $data = DB::select("SELECT * FROM type_journal ORDER BY id");

    $currentAgence = session('current_agence');
    $currentAgenceId = $currentAgence['id'] ?? null;

    if (!$currentAgenceId) {
        // Aucune agence courante -> liste vide (ou selon votre besoin)
        $users = collect();
    } else {
        $users = User::whereHas('agences', function ($q) use ($currentAgenceId) {
            $q->where('agences.id', $currentAgenceId);
        })->get();
    }

    return response()->json([
        "status" => 1,
        "data" => $data,
        "users" => $users
    ]);
}
    //GET SEARCHED JOURNAL

// public function getSearchedJournal(Request $request)
// {
//     $user = auth()->user();

//     // =========================
//     // 🔹 Gestion CodeAgence (OBLIGATOIRE)
//     // =========================
//     $agenceFilter = $request->agence_filter ?? 'current';
//     $codeAgence = null;

//     if ($agenceFilter === 'current') {
//         $currentAgence = session('current_agence');
//         $codeAgence = $currentAgence['code_agence'] ?? null;

//         if (!$codeAgence) {
//             return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
//         }
//     } elseif ($agenceFilter !== 'all') {
//         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();

//         if (!$agence) {
//             return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
//         }

//         $codeAgence = $agence->code_agence;
//     }

//     if (!$codeAgence) {
//         return response()->json(['status' => 0, 'msg' => 'Code agence requis']);
//     }

//     // =========================
//     // 🔹 Filtres optionnels
//     // =========================
//     $dateDebut = $request->DateDebut ?? null;
//     $dateFin   = $request->DateFin ?? null;
//     $userName  = $request->UserName ?? null;
//     $isSuspens = $request->AutresCriteres['SuspensTransactions'] ?? false;

//     // =========================
//     // 🔹 Construction WHERE dynamique
//     // =========================
//     $conditions = [];

//     // obligatoire
//     $conditions[] = "t1.CodeAgence = '$codeAgence'";

//     // optionnels
//     if ($dateDebut && $dateFin) {
//         $conditions[] = "t1.DateTransaction BETWEEN '$dateDebut' AND '$dateFin'";
//     }

//     if ($userName) {
//         $conditions[] = "t1.NomUtilisateur = '$userName'";
//     }

//     // ✔️ CORRECTION ICI
//     if ($isSuspens) {
//         $conditions[] = "t1.isSuspens = 1";
//     }

//     // logique métier (matching débit/crédit)
//     $conditions[] = "t1.Debitfc = t2.Creditfc";
//     $conditions[] = "t1.Debitusd = t2.Creditusd";
//     $conditions[] = "t1.Creditfc = t2.Debitfc";
//     $conditions[] = "t1.Creditusd = t2.Debitusd";

//     $whereClause = implode(" AND ", $conditions);

//     // =========================
//     // 🔹 Fonction de génération requête
//     // =========================
//     $buildQuery = function ($codeMonnaie) use ($whereClause) {
//         return "
//             SELECT DISTINCT 
//                 t1.NumTransaction,
//                 t1.DateTransaction,
//                 t1.CodeMonnaie,
//                 t1.NumCompte,
//                 t1.NumComptecp,
//                 t1.Debitfc,
//                 t1.Debitusd,
//                 t1.Creditfc,
//                 t1.Creditusd,
//                 t1.Libelle,
//                 c1.NomCompte AS NomCompte
//             FROM transactions t1
//             JOIN transactions t2 
//                 ON t1.NumComptecp = t2.NumCompte 
//                 AND t1.NumCompte = t2.NumComptecp 
//                 AND t1.CodeMonnaie = t2.CodeMonnaie 
//                 AND t1.DateTransaction = t2.DateTransaction 
//                 AND t1.NumTransaction = t2.NumTransaction
//             JOIN comptes c1 ON t1.NumCompte = c1.NumCompte
//             WHERE $whereClause
//             AND t1.CodeMonnaie = $codeMonnaie
//         ";
//     };

//     // =========================
//     // 🔹 Exécution
//     // =========================
//     $queryCDF = $buildQuery(2);
//     $queryUSD = $buildQuery(1);

//     $dataCDF = DB::select($queryCDF);
//     $dataUSD = DB::select($queryUSD);

//     if (empty($dataCDF) && empty($dataUSD)) {
//         return response()->json([
//             "status" => 0,
//             "msg" => "Pas de données trouvées"
//         ]);
//     }

//     // =========================
//     // 🔹 Totaux
//     // =========================
//     $buildTotalQuery = function ($codeMonnaie) use ($whereClause) {
//         return "
//             SELECT 
//                 SUM(t1.Debitfc) AS TotalDebitfc,
//                 SUM(t1.Debitusd) AS TotalDebitusd,
//                 SUM(t1.Creditfc) AS TotalCreditfc,
//                 SUM(t1.Creditusd) AS TotalCreditusd
//             FROM transactions t1
//             JOIN transactions t2 
//                 ON t1.NumComptecp = t2.NumCompte 
//                 AND t1.NumCompte = t2.NumComptecp 
//                 AND t1.CodeMonnaie = t2.CodeMonnaie 
//                 AND t1.DateTransaction = t2.DateTransaction 
//                 AND t1.NumTransaction = t2.NumTransaction
//             WHERE $whereClause
//             AND t1.CodeMonnaie = $codeMonnaie
//         ";
//     };

//     $totUSD = DB::select($buildTotalQuery(1))[0];
//     $totCDF = DB::select($buildTotalQuery(2))[0];

//     // =========================
//     // 🔹 Retour
//     // =========================
//     return response()->json([
//         "status" => 1,
//         "dataCDF" => $dataCDF,
//         "dataUSD" => $dataUSD,
//         "totCDF" => $totCDF,
//         "totUSD" => $totUSD,
//     ]);
// }


// public function getSearchedJournal(Request $request)
// {
//     $user = auth()->user();

//     // Gestion du filtre agence (identique)
//     $agenceFilter = $request->agence_filter ?? 'current';
//     $codeAgence = null;
//     if ($agenceFilter === 'current') {
//         $currentAgence = session('current_agence');
//         $codeAgence = $currentAgence['code_agence'] ?? null;
//         if (!$codeAgence) return response()->json(['status' => 0, 'msg' => 'Aucune agence courante']);
//     } elseif ($agenceFilter !== 'all') {
//         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
//         if (!$agence) return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
//         $codeAgence = $agence->code_agence;
//     }
//     if (!$codeAgence) return response()->json(['status' => 0, 'msg' => 'Code agence requis']);

//     // Autres filtres
//     $dateDebut = $request->DateDebut ?? null;
//     $dateFin   = $request->DateFin ?? null;
//     $userName  = $request->UserName ?? null;
//     $isSuspens = $request->AutresCriteres['SuspensTransactions'] ?? false;

//     // Conditions WHERE communes
//     $conditions = ["t.CodeAgence = '$codeAgence'"];
//     if ($dateDebut && $dateFin) $conditions[] = "t.DateTransaction BETWEEN '$dateDebut' AND '$dateFin'";
//     if ($userName) $conditions[] = "t.NomUtilisateur = '$userName'";
//     if ($isSuspens) $conditions[] = "t.isSuspens = 1";
//     $whereClause = implode(" AND ", $conditions);

//     // Fonction pour récupérer les lignes brutes (débit/crédit)
//     $getRawLines = function ($codeMonnaie, $debitCol, $creditCol) use ($whereClause) {
//         return DB::select("
//             SELECT 
//                 t.NumTransaction,
//                 t.DateTransaction,
//                 t.CodeMonnaie,
//                 t.NumCompte,
//                 c.NomCompte,
//                 t.$debitCol AS Debit,
//                 t.$creditCol AS Credit,
//                 t.Libelle
//             FROM transactions t
//             JOIN comptes c ON t.NumCompte = c.NumCompte
//             WHERE $whereClause
//               AND t.CodeMonnaie = $codeMonnaie
//               AND (t.$debitCol != 0 OR t.$creditCol != 0)
//             ORDER BY t.DateTransaction, t.NumTransaction
//         ");
//     };

//     // Regroupement PHP
//     $buildGrouped = function ($rawLines) {
//         $grouped = [];
//         foreach ($rawLines as $line) {
//             $key = $line->NumTransaction . '_' . $line->DateTransaction;
//             if (!isset($grouped[$key])) {
//                 $grouped[$key] = (object)[
//                     'NumTransaction' => $line->NumTransaction,
//                     'DateTransaction' => $line->DateTransaction,
//                     'CodeMonnaie' => $line->CodeMonnaie,
//                     'CompteDebit' => null,
//                     'NomCompteDebit' => null,
//                     'CompteCredit' => null,
//                     'NomCompteCredit' => null,
//                     'MontantDebit' => 0,
//                     'MontantCredit' => 0,
//                     'Libelle' => $line->Libelle,
//                 ];
//             }
//             if ($line->Debit > 0) {
//                 $grouped[$key]->CompteDebit = $line->NumCompte;
//                 $grouped[$key]->NomCompteDebit = $line->NomCompte;
//                 $grouped[$key]->MontantDebit = $line->Debit;
//             }
//             if ($line->Credit > 0) {
//                 $grouped[$key]->CompteCredit = $line->NumCompte;
//                 $grouped[$key]->NomCompteCredit = $line->NomCompte;
//                 $grouped[$key]->MontantCredit = $line->Credit;
//             }
//         }
//         return array_values($grouped);
//     };

//     // Données CDF (CodeMonnaie = 2)
//     $rawCDF = $getRawLines(2, 'Debitfc', 'Creditfc');
//     $dataCDF = $buildGrouped($rawCDF);

//     // Données USD (CodeMonnaie = 1)
//     $rawUSD = $getRawLines(1, 'Debitusd', 'Creditusd');
//     $dataUSD = $buildGrouped($rawUSD);

//     if (empty($dataCDF) && empty($dataUSD)) {
//         return response()->json(['status' => 0, 'msg' => 'Pas de données trouvées']);
//     }

//     // Totaux (somme des montants débit et crédit après regroupement)
//     $totCDF = (object)['TotalDebitfc' => 0, 'TotalCreditfc' => 0];
//     foreach ($dataCDF as $row) {
//         $totCDF->TotalDebitfc += $row->MontantDebit;
//         $totCDF->TotalCreditfc += $row->MontantCredit;
//     }

//     $totUSD = (object)['TotalDebitusd' => 0, 'TotalCreditusd' => 0];
//     foreach ($dataUSD as $row) {
//         $totUSD->TotalDebitusd += $row->MontantDebit;
//         $totUSD->TotalCreditusd += $row->MontantCredit;
//     }

//     return response()->json([
//         'status' => 1,
//         'dataCDF' => $dataCDF,
//         'dataUSD' => $dataUSD,
//         'totCDF' => $totCDF,
//         'totUSD' => $totUSD,
//     ]);
// }


// public function getSearchedJournal(Request $request)
// {
//     $user = auth()->user();

//     // ---------- Gestion du filtre agence (obligatoire) ----------
//     $agenceFilter = $request->agence_filter ?? 'current';
//     $codeAgence = null;
//     if ($agenceFilter === 'current') {
//         $currentAgence = session('current_agence');
//         $codeAgence = $currentAgence['code_agence'] ?? null;
//         if (!$codeAgence) {
//             return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
//         }
//     } elseif ($agenceFilter !== 'all') {
//         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
//         if (!$agence) {
//             return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
//         }
//         $codeAgence = $agence->code_agence;
//     }
//     if (!$codeAgence) {
//         return response()->json(['status' => 0, 'msg' => 'Code agence requis']);
//     }

//     // ---------- Autres filtres ----------
//     $dateDebut = $request->DateDebut ?? null;
//     $dateFin   = $request->DateFin ?? null;
//     $userName  = $request->UserName ?? null;
//     $isSuspens = $request->AutresCriteres['SuspensTransactions'] ?? false;

//     // Conditions SQL communes
//     $conditions = ["t.CodeAgence = '$codeAgence'"];
//     if ($dateDebut && $dateFin) $conditions[] = "t.DateTransaction BETWEEN '$dateDebut' AND '$dateFin'";
//     if ($userName) $conditions[] = "t.NomUtilisateur = '$userName'";
//     if ($isSuspens) $conditions[] = "t.isSuspens = 1";
//     $whereClause = implode(" AND ", $conditions);

//     // Fonction pour récupérer les lignes brutes d'une devise
//     $getRawLines = function ($codeMonnaie, $debitCol, $creditCol) use ($whereClause) {
//         return DB::select("
//             SELECT 
//                 t.NumTransaction,
//                 t.DateTransaction,
//                 t.CodeMonnaie,
//                 t.NumCompte,
//                 c.NomCompte,
//                 t.$debitCol AS MontantDebit,
//                 t.$creditCol AS MontantCredit,
//                 t.Libelle
//             FROM transactions t
//             JOIN comptes c ON t.NumCompte = c.NumCompte
//             WHERE $whereClause
//               AND t.CodeMonnaie = $codeMonnaie
//               AND (t.$debitCol != 0 OR t.$creditCol != 0)
//             ORDER BY t.DateTransaction, t.NumTransaction
//         ");
//     };

//     // Regroupement en PHP : une ligne par transaction
//     $buildGrouped = function ($rawLines) {
//         $grouped = [];
//         foreach ($rawLines as $line) {
//             $key = $line->NumTransaction . '_' . $line->DateTransaction;
//             if (!isset($grouped[$key])) {
//                 $grouped[$key] = (object)[
//                     'NumTransaction'   => $line->NumTransaction,
//                     'DateTransaction'  => $line->DateTransaction,
//                     'CodeMonnaie'      => $line->CodeMonnaie,
//                     'CompteDebit'      => null,
//                     'NomCompteDebit'   => null,
//                     'CompteCredit'     => null,
//                     'NomCompteCredit'  => null,
//                     'MontantDebit'     => 0,
//                     'MontantCredit'    => 0,
//                     'Libelle'          => $line->Libelle,
//                 ];
//             }
//             // Ligne débit
//             if ($line->MontantDebit > 0) {
//                 $grouped[$key]->CompteDebit    = $line->NumCompte;
//                 $grouped[$key]->NomCompteDebit = $line->NomCompte;
//                 $grouped[$key]->MontantDebit   = $line->MontantDebit;
//             }
//             // Ligne crédit
//             if ($line->MontantCredit > 0) {
//                 $grouped[$key]->CompteCredit    = $line->NumCompte;
//                 $grouped[$key]->NomCompteCredit = $line->NomCompte;
//                 $grouped[$key]->MontantCredit   = $line->MontantCredit;
//             }
//         }
//         return array_values($grouped);
//     };

//     // Exécution pour CDF (CodeMonnaie = 2)
//     $rawCDF = $getRawLines(2, 'Debitfc', 'Creditfc');
//     $dataCDF = $buildGrouped($rawCDF);

//     // Exécution pour USD (CodeMonnaie = 1)
//     $rawUSD = $getRawLines(1, 'Debitusd', 'Creditusd');
//     $dataUSD = $buildGrouped($rawUSD);

//     if (empty($dataCDF) && empty($dataUSD)) {
//         return response()->json(['status' => 0, 'msg' => 'Pas de données trouvées']);
//     }

//     // Totaux après regroupement
//     $totCDF = (object)['TotalDebit' => 0, 'TotalCredit' => 0];
//     foreach ($dataCDF as $row) {
//         $totCDF->TotalDebit  += $row->MontantDebit;
//         $totCDF->TotalCredit += $row->MontantCredit;
//     }

//     $totUSD = (object)['TotalDebit' => 0, 'TotalCredit' => 0];
//     foreach ($dataUSD as $row) {
//         $totUSD->TotalDebit  += $row->MontantDebit;
//         $totUSD->TotalCredit += $row->MontantCredit;
//     }

//     return response()->json([
//         'status'  => 1,
//         'dataCDF' => $dataCDF,
//         'dataUSD' => $dataUSD,
//         'totCDF'  => $totCDF,
//         'totUSD'  => $totUSD,
//     ]);
// }

public function getSearchedJournal(Request $request)
{
    $user = auth()->user();

    // ---------- Gestion du filtre agence ----------
    $agenceFilter = $request->agence_filter ?? 'current';
    $codeAgence = null;

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter !== 'all') {
        // Sélection d'une agence spécifique (par son id)
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }
    // Pour 'all', $codeAgence reste null (pas de filtre d'agence)

    // ---------- Autres filtres ----------
    $dateDebut = $request->DateDebut ?? null;
    $dateFin   = $request->DateFin ?? null;
    $userName  = $request->UserName ?? null;
    $isSuspens = $request->AutresCriteres['SuspensTransactions'] ?? false;

    // Construction des conditions WHERE (seulement si agence spécifique)
    $conditions = [];
    if ($codeAgence) {
        $conditions[] = "t.CodeAgence = '$codeAgence'";
    }
    if ($dateDebut && $dateFin) {
        $conditions[] = "t.DateTransaction BETWEEN '$dateDebut' AND '$dateFin'";
    }
    if ($userName) {
        $conditions[] = "t.NomUtilisateur = '$userName'";
    }
    if ($isSuspens) {
        $conditions[] = "t.isSuspens = 1";
    }

    $whereClause = implode(" AND ", $conditions);
    if (!empty($whereClause)) {
        $whereClause = " WHERE " . $whereClause;
    } else {
        $whereClause = "";
    }

    // Fonction pour récupérer les lignes brutes d'une devise
    $getRawLines = function ($codeMonnaie, $debitCol, $creditCol) use ($whereClause) {
        return DB::select("
            SELECT 
                t.NumTransaction,
                t.DateTransaction,
                t.CodeMonnaie,
                t.NumCompte,
                c.NomCompte,
                t.$debitCol AS MontantDebit,
                t.$creditCol AS MontantCredit,
                t.Libelle
            FROM transactions t
            JOIN comptes c ON t.NumCompte = c.NumCompte
            $whereClause
              AND t.CodeMonnaie = $codeMonnaie
              AND (t.$debitCol != 0 OR t.$creditCol != 0)
            ORDER BY t.DateTransaction, t.NumTransaction
        ");
    };

    // Regroupement en PHP
    $buildGrouped = function ($rawLines) {
        $grouped = [];
        foreach ($rawLines as $line) {
            $key = $line->NumTransaction . '_' . $line->DateTransaction;
            if (!isset($grouped[$key])) {
                $grouped[$key] = (object)[
                    'NumTransaction'   => $line->NumTransaction,
                    'DateTransaction'  => $line->DateTransaction,
                    'CodeMonnaie'      => $line->CodeMonnaie,
                    'CompteDebit'      => null,
                    'NomCompteDebit'   => null,
                    'CompteCredit'     => null,
                    'NomCompteCredit'  => null,
                    'MontantDebit'     => 0,
                    'MontantCredit'    => 0,
                    'Libelle'          => $line->Libelle,
                ];
            }
            if ($line->MontantDebit > 0) {
                $grouped[$key]->CompteDebit    = $line->NumCompte;
                $grouped[$key]->NomCompteDebit = $line->NomCompte;
                $grouped[$key]->MontantDebit   = $line->MontantDebit;
            }
            if ($line->MontantCredit > 0) {
                $grouped[$key]->CompteCredit    = $line->NumCompte;
                $grouped[$key]->NomCompteCredit = $line->NomCompte;
                $grouped[$key]->MontantCredit   = $line->MontantCredit;
            }
        }
        return array_values($grouped);
    };

    // Exécution CDF
    $rawCDF = $getRawLines(2, 'Debitfc', 'Creditfc');
    $dataCDF = $buildGrouped($rawCDF);

    // Exécution USD
    $rawUSD = $getRawLines(1, 'Debitusd', 'Creditusd');
    $dataUSD = $buildGrouped($rawUSD);

    if (empty($dataCDF) && empty($dataUSD)) {
        return response()->json(['status' => 0, 'msg' => 'Pas de données trouvées']);
    }

    // Totaux
    $totCDF = (object)['TotalDebit' => 0, 'TotalCredit' => 0];
    foreach ($dataCDF as $row) {
        $totCDF->TotalDebit  += $row->MontantDebit;
        $totCDF->TotalCredit += $row->MontantCredit;
    }

    $totUSD = (object)['TotalDebit' => 0, 'TotalCredit' => 0];
    foreach ($dataUSD as $row) {
        $totUSD->TotalDebit  += $row->MontantDebit;
        $totUSD->TotalCredit += $row->MontantCredit;
    }

    return response()->json([
        'status'  => 1,
        'dataCDF' => $dataCDF,
        'dataUSD' => $dataUSD,
        'totCDF'  => $totCDF,
        'totUSD'  => $totUSD,
    ]);
}

public function getSearchedRepertoire(Request $request)
{
    // 1. Gestion du filtre agence
    $agenceFilter = $request->agence_filter ?? 'current';
    $codeAgence = null;
    $user = auth()->user();

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null;
    } else {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }

    // Base de la requête commune (on ajoute le filtre agence sur transactions et comptes)
    $baseQuery = DB::table('transactions')
        ->join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
        ->whereBetween('transactions.DateTransaction', [$request->DateDebut, $request->DateFin])
        ->where('comptes.RefGroupe', 330)
        ->when($request->filled('UserName'), function ($q) use ($request) {
            $q->where('transactions.NomUtilisateur', $request->UserName);
        })
        ->when($codeAgence, function ($q) use ($codeAgence) {
            return $q->where('transactions.CodeAgence', $codeAgence)
                     ->where('comptes.CodeAgence', $codeAgence);
        });

    // Vérification existence des données
    $hasCDF = (clone $baseQuery)->where('transactions.CodeMonnaie', 2)->exists();
    $hasUSD = (clone $baseQuery)->where('transactions.CodeMonnaie', 1)->exists();

    if (!$hasCDF && !$hasUSD) {
        return response()->json([
            "status" => 0,
            "msg"    => "Pas de données trouvées"
        ]);
    }

    // Colonnes selon devise
    $columnsCDF = [
        'transactions.DateTransaction', 'transactions.NumTransaction',
        'transactions.NumCompte', 'comptes.NomCompte', 'transactions.Libelle',
        'transactions.Creditfc', 'transactions.Debitfc',
        'transactions.Credit', 'transactions.Debit',
        'transactions.Creditusd', 'transactions.Debitusd',
        'transactions.CodeMonnaie'
    ];

    $columnsUSD = [
        'transactions.DateTransaction', 'transactions.NumTransaction',
        'transactions.NumCompte', 'comptes.NomCompte', 'transactions.Libelle',
        'transactions.Credit', 'transactions.Debit',
        'transactions.Creditusd', 'transactions.Debitusd',
        'transactions.CodeMonnaie'
    ];

    if (!$request->filled('UserName')) {
        $columnsCDF[] = 'transactions.NomUtilisateur';
        $columnsUSD[] = 'transactions.NomUtilisateur';
    }

    // Requête CDF
    $dataCDF = (clone $baseQuery)
        ->where('transactions.CodeMonnaie', 2)
        ->select($columnsCDF)
        ->orderBy('transactions.NomUtilisateur')
        ->orderBy('transactions.NumTransaction')
        ->orderBy('transactions.Debit', 'desc')
        ->get();

    // Requête USD (avec exclusion du compte 3300 seulement si pas de UserName)
    $dataUSD = (clone $baseQuery)
        ->where('transactions.CodeMonnaie', 1)
        ->when(!$request->filled('UserName'), function ($q) {
            $q->where('transactions.NumCompte', '!=', 3300);
        })
        ->select($columnsUSD)
        ->orderBy('transactions.NomUtilisateur')
        ->orderBy('transactions.NumTransaction')
        ->orderBy('transactions.Debit', 'desc')
        ->get();

    // Totaux CDF
    $totDebitCDF  = (clone $baseQuery)->where('transactions.CodeMonnaie', 2)->sum('transactions.Debitfc');
    $totCreditCDF = (clone $baseQuery)->where('transactions.CodeMonnaie', 2)->sum('transactions.Creditfc');

    // Totaux USD (jamais de filtre NumCompte != 3300)
    $totDebitUSD  = (clone $baseQuery)->where('transactions.CodeMonnaie', 1)->sum('transactions.Debitusd');
    $totCreditUSD = (clone $baseQuery)->where('transactions.CodeMonnaie', 1)->sum('transactions.Creditusd');

    return response()->json([
        "dataCDF"      => $dataCDF,
        "dataUSD"      => $dataUSD,
        "totDebitCDF"  => ['totDebitCDF'  => $totDebitCDF],
        "totCreditCDF" => ['totCreditCDF' => $totCreditCDF],
        "totDebitUSD"  => ['totDebitUSD'  => $totDebitUSD],
        "totCreditUSD" => ['totCreditUSD' => $totCreditUSD],
        "status"       => 1
    ]);
}

    //GET ECHEANCIER HOME PAGE 
    public function getEcheancierCreditHomePage()
    {
        return view("eco.pages.rapport-credit");
    }

    //PERMET D'AFFICHER L'ECHEANCIER ET UN TABLEAU D'AMMORTISSMENT
public function getEcheancier(Request $request)
{
    // ----- GESTION DU FILTRE AGENCE -----
    $agenceFilter = $request->agence_filter ?? 'current';
    $codeAgence = null;
    $user = auth()->user();

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null;
    } else {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }

    // Helper pour filtrer sur portefeuilles.CodeAgence
    $addAgenceWhere = function($query) use ($codeAgence) {
        if ($codeAgence) {
            return $query->where('portefeuilles.CodeAgence', $codeAgence);
        }
        return $query;
    };

    // ----- FIN GESTION AGENCE -----

    //VERIFIE SI L'UTILISATEUR SOUHAITE AFFICHE QUE TYPE DE RAPPORT
    if (isset($request->radioValue) and $request->radioValue == "echeancier") {
        //VERIFIE SI LE NUMERO DE DOSSIER EXISTE 
        if (isset($request->searched_num_dossier)) {
            $currentAgence = session('current_agence');
            $codeAgence = $currentAgence['code_agence'] ?? null;
            $checkNumDossier = Echeancier::where("NumDossier", "=", $request->searched_num_dossier)->where("CodeAgence",$codeAgence)->first();
            if ($checkNumDossier) {
                $data = Portefeuille::where("portefeuilles.NumDossier", "=", $request->searched_num_dossier)
                    ->join('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                    ->join('comptes', 'comptes.NumCompte', '=', 'portefeuilles.NumCompteEpargne')
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->where('portefeuilles.CodeAgence', $codeAgence);
                    })
                    ->get();

                $dataSommeInter = Echeancier::select(DB::raw("SUM(echeanciers.Interet) as sommeInteret"))
                    ->where("echeanciers.NumDossier", "=", $request->searched_num_dossier)
                    ->join('portefeuilles', 'portefeuilles.NumDossier', '=', 'echeanciers.NumDossier')
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->where('portefeuilles.CodeAgence', $codeAgence);
                    })
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
                    ->leftJoin('echeanciers', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                    ->leftJoin('remboursementcredits', 'remboursementcredits.RefEcheance', '=', 'echeanciers.ReferenceEch')
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->where('portefeuilles.CodeAgence', $codeAgence);
                    })
                    ->get();

                $dataSommeInter = Echeancier::select(DB::raw("SUM(echeanciers.Interet) as sommeInteret"))
                    ->where("echeanciers.NumDossier", "=", $request->searched_num_dossier)
                    ->join('portefeuilles', 'portefeuilles.NumDossier', '=', 'echeanciers.NumDossier')
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->where('portefeuilles.CodeAgence', $codeAgence);
                    })
                    ->first();

                $NomCompte = Portefeuille::where("NumDossier", $request->searched_num_dossier)
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->where('CodeAgence', $codeAgence);
                    })
                    ->first();

                $soldeRestant = Echeancier::selectRaw('
                        echeanciers.NumDossier,
                        SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS InteretRetard,
                        SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS soldeRestant
                    ')
                    ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                    ->where('echeanciers.posted', '=!', 1)
                    ->where('echeanciers.statutPayement', '=!', 1)
                    ->where('echeanciers.NumDossier', $request->searched_num_dossier)
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->whereExists(function($sub) use ($codeAgence) {
                            $sub->select(DB::raw(1))
                                ->from('portefeuilles')
                                ->whereColumn('portefeuilles.NumDossier', 'echeanciers.NumDossier')
                                ->where('portefeuilles.CodeAgence', $codeAgence);
                        });
                    })
                    ->groupBy('echeanciers.NumDossier')
                    ->first();
                $SoldeCreditRestant = $soldeRestant->soldeRestant ?? 0;

                $capitalRembourse = DB::select('SELECT SUM(echeanciers.CapAmmorti) as capitalRembourse from echeanciers 
                    where echeanciers.NumDossier="' . $request->searched_num_dossier . '" 
                    and echeanciers.posted=1 and echeanciers.statutPayement=1 
                    GROUP BY echeanciers.NumDossier');
                $capitalRembours = $capitalRembourse[0]->capitalRembourse ?? 0;

                $soldeEnRetard = Echeancier::selectRaw('
                        echeanciers.NumDossier,
                        SUM(echeanciers.Interet) - SUM(COALESCE(remboursementcredits.InteretPaye, 0)) AS sommeInteretRetard,
                        SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS sommeCapitalRetard
                    ')
                    ->leftJoin('remboursementcredits', 'echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                    ->where('echeanciers.RetardPayement', 1)
                    ->where('echeanciers.NumDossier', $request->searched_num_dossier)
                    ->when($codeAgence, function($q) use ($codeAgence) {
                        return $q->whereExists(function($sub) use ($codeAgence) {
                            $sub->select(DB::raw(1))
                                ->from('portefeuilles')
                                ->whereColumn('portefeuilles.NumDossier', 'echeanciers.NumDossier')
                                ->where('portefeuilles.CodeAgence', $codeAgence);
                        });
                    })
                    ->groupBy('echeanciers.NumDossier')
                    ->first();

                $InteretRembourse = DB::select('SELECT SUM(echeanciers.Interet) as intereRembourse from echeanciers 
                    where echeanciers.NumDossier="' . $request->searched_num_dossier . '" 
                    and echeanciers.posted=1 and echeanciers.statutPayement=1 
                    GROUP BY echeanciers.NumDossier');
                $InteretRembourse = $InteretRembourse[0] ?? 0;

                $InteretRestant = DB::select('SELECT SUM(echeanciers.Interet) as intereRestant from echeanciers 
                    where echeanciers.NumDossier="' . $request->searched_num_dossier . '" 
                    and echeanciers.posted=!1 and echeanciers.statutPayement=!1 
                    GROUP BY echeanciers.NumDossier');
                $InteretRestant = $InteretRestant[0] ?? 0;

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
        if (isset($request->devise) and isset($request->selectedDate)) {
            $agentCreditName = $request->agent_credit_name;
            $devise = $request->devise;

            // Requête commune pour la balance âgée (CDF ou USD)
            $balanceQuery = Portefeuille::where("portefeuilles.CodeMonnaie", "=", $devise)
                ->where("portefeuilles.Octroye", 1)
                ->where("portefeuilles.Cloture", "!=", 1)
                ->when(!empty($request->selectedDate), function ($query) use ($request) {
                    $query->whereDate("portefeuilles.DateOctroi", "<=", $request->selectedDate);
                })
                ->join("comptes", "portefeuilles.NumCompteEpargne", "=", "comptes.NumCompte")
                ->leftJoin("jour_retards", "portefeuilles.NumCompteEpargne", "=", "jour_retards.NumcompteEpargne")
                ->leftJoin("echeanciers", "portefeuilles.NumDossier", "=", "echeanciers.NumDossier")
                ->when(!empty($agentCreditName), function ($query) use ($agentCreditName) {
                    $query->where("portefeuilles.Gestionnaire", $agentCreditName);
                })
                ->when($codeAgence, function($q) use ($codeAgence) {
                    return $q->where('portefeuilles.CodeAgence', $codeAgence);
                })
                ->selectRaw('
                    portefeuilles.NumDossier,
                    portefeuilles.NumCompteEpargne,
                    portefeuilles.CodeMonnaie,
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
                ->orderBy('portefeuilles.DateOctroi', 'desc');

            $dataBalanceAgee = $balanceQuery->get();

            // Calcul de l'encours global et du PAR
            $subQueryRemboursement = DB::table('remboursementcredits')
                ->selectRaw('NumDossie, SUM(CapitalPaye) as total_paye')
                ->groupBy('NumDossie');

            $encoursQuery = DB::table('portefeuilles as p')
                ->leftJoinSub($subQueryRemboursement, 'r', function ($join) {
                    $join->on('p.NumDossier', '=', 'r.NumDossie');
                })
                ->where('p.CodeMonnaie', $devise)
                ->when(!empty($agentCreditName), function ($q) use ($agentCreditName) {
                    $q->where('p.Gestionnaire', $agentCreditName);
                })
                ->when($codeAgence, function($q) use ($codeAgence) {
                    return $q->where('p.CodeAgence', $codeAgence);
                })
                ->selectRaw('SUM(GREATEST(p.MontantAccorde - COALESCE(r.total_paye, 0), 0)) AS SoldeEncours');

            $resultEncours = $encoursQuery->first();
            $soldeEncours = $resultEncours->SoldeEncours ?? 0;

            $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
            $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
            $codeMonnaie = $devise === 'USD' ? 1 : 2;

            $queryCreditRetard = DB::table('transactions')
                ->join('comptes', 'transactions.NumCompte', '=', 'comptes.NumCompte')
                ->selectRaw("SUM(transactions.$debitCol) - SUM(transactions.$creditCol) AS TotRetard")
                ->where('comptes.RefSousGroupe', 3900)
                ->where('comptes.CodeMonnaie', $codeMonnaie)
                ->when(!empty($request->selectedDate), function ($query) use ($request) {
                    $query->whereDate('transactions.DateTransaction', '<=', $request->selectedDate);
                })
                ->when(!empty($agentCreditName), function ($query) use ($agentCreditName) {
                    $query->where('transactions.Operant', $agentCreditName);
                });

            $soldeCreditRetard = $queryCreditRetard->first();

            $denominator = $soldeEncours + ($soldeCreditRetard->TotRetard ?? 0);
            if ($denominator != 0 && $denominator > 0) {
                $PAR = ($soldeCreditRetard->TotRetard / $denominator) * 100;
            } else {
                $PAR = 0;
            }

            return response()->json([
                "status" => 1,
                "data_balance_agee" => $dataBalanceAgee,
                "soldeEncour".($devise === 'USD' ? 'USD' : 'CDF') => $soldeEncours,
                "totRetard".($devise === 'USD' ? 'USD' : 'CDF') => $PAR
            ]);
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Vous devez sélectionner la devise pour afficher la balance"
            ]);
        }
    } else if ($request->radioValue == "par") {
        $date = $request->date_par ?? now()->toDateString();
        $devise = $request->devise_par;
        $gestionnaire = $request->gestionnaire_par;

        // Sous‑requête : total payé par échéance
        $subRemboursement = DB::table('remboursementcredits')
            ->selectRaw('RefEcheance, SUM(CapitalPaye) as total_paye')
            ->groupBy('RefEcheance');

        $subRemboursementGlobal = DB::table('remboursementcredits')
            ->selectRaw('NumDossie as NumDossier, SUM(CapitalPaye) as total_rembourse')
            ->groupBy('NumDossie');

        $query = DB::table('echeanciers as e')
            ->join('portefeuilles as p', 'e.NumDossier', '=', 'p.NumDossier')
            ->leftJoinSub($subRemboursement, 'r', fn($join) => $join->on('e.ReferenceEch', '=', 'r.RefEcheance'))
            ->leftJoinSub($subRemboursementGlobal, 'rg', fn($join) => $join->on('p.NumDossier', '=', 'rg.NumDossier'))
            ->where(fn($q) => $q->where('p.Cloture', '!=', 1)->orWhereNull('p.Cloture'))
            ->where(fn($q) => $q->where('p.Accorde', '=', 1)->orWhereNull('p.Accorde'))
            ->where(fn($q) => $q->where('p.Octroye', '=', 1)->orWhereNull('p.Octroye'))
            ->when($codeAgence, function($q) use ($codeAgence) {
                return $q->where('p.CodeAgence', $codeAgence);
            })
            ->selectRaw("
                p.Gestionnaire,
                COUNT(DISTINCT p.NumDossier) AS NbrCredits,
                SUM(p.MontantAccorde) AS TotalAccorde,
                SUM(p.MontantAccorde) - SUM(COALESCE(rg.total_rembourse,0)) AS EncoursReel,
                SUM(e.CapAmmorti - COALESCE(r.total_paye,0)) AS EncoursTotal,
                SUM(CASE WHEN DATEDIFF('$date', e.DateTranch) <= 0
                    THEN (e.CapAmmorti - COALESCE(r.total_paye,0)) ELSE 0 END) AS EncoursSain,
                SUM(CASE WHEN DATEDIFF('$date', e.DateTranch) BETWEEN 1 AND 30
                    THEN (e.CapAmmorti - COALESCE(r.total_paye,0)) ELSE 0 END) AS PAR_1_30,
                SUM(CASE WHEN DATEDIFF('$date', e.DateTranch) BETWEEN 31 AND 60
                    THEN (e.CapAmmorti - COALESCE(r.total_paye,0)) ELSE 0 END) AS PAR_31_60,
                SUM(CASE WHEN DATEDIFF('$date', e.DateTranch) BETWEEN 61 AND 90
                    THEN (e.CapAmmorti - COALESCE(r.total_paye,0)) ELSE 0 END) AS PAR_61_90,
                SUM(CASE WHEN DATEDIFF('$date', e.DateTranch) BETWEEN 91 AND 180
                    THEN (e.CapAmmorti - COALESCE(r.total_paye,0)) ELSE 0 END) AS PAR_91_180,
                SUM(CASE WHEN DATEDIFF('$date', e.DateTranch) > 180
                    THEN (e.CapAmmorti - COALESCE(r.total_paye,0)) ELSE 0 END) AS PAR_PLUS_180
            ")
            ->groupBy('p.Gestionnaire');

        if (!empty($devise)) {
            $query->where('p.CodeMonnaie', $devise);
        }
        if (!empty($gestionnaire) && $gestionnaire !== 'Tous') {
            $query->where('p.Gestionnaire', $gestionnaire);
        }

        $parData = $query->get()->keyBy('Gestionnaire');

        $portefeuilleQuery = DB::table('portefeuilles')
            ->selectRaw("Gestionnaire, COUNT(DISTINCT NumDossier) AS NbrCredits, SUM(MontantAccorde) AS TotalAccorde")
            ->groupBy('Gestionnaire')
            ->when($codeAgence, function($q) use ($codeAgence) {
                return $q->where('CodeAgence', $codeAgence);
            });
        if (!empty($devise)) $portefeuilleQuery->where('CodeMonnaie', $devise);
        if (!empty($gestionnaire) && $gestionnaire !== 'Tous') $portefeuilleQuery->where('Gestionnaire', $gestionnaire);
        $portefeuilleData = $portefeuilleQuery->get()->keyBy('Gestionnaire');

        $data = $parData->map(function ($row, $gestionnaire) use ($portefeuilleData) {
            $p = $portefeuilleData[$gestionnaire] ?? null;
            $row->NbrCredits = $p->NbrCredits ?? 0;
            $row->TotalAccorde = $p->TotalAccorde ?? 0;
            $row->PAR_SUP_1 = $row->PAR_1_30 + $row->PAR_31_60 + $row->PAR_61_90 + $row->PAR_91_180 + $row->PAR_PLUS_180;
            $row->PAR_SUP_30 = $row->PAR_31_60 + $row->PAR_61_90 + $row->PAR_91_180 + $row->PAR_PLUS_180;
            $row->PAR_SUP_60 = $row->PAR_61_90 + $row->PAR_91_180 + $row->PAR_PLUS_180;
            $row->PAR_SUP_90 = $row->PAR_91_180 + $row->PAR_PLUS_180;
            $encours = max($row->EncoursTotal, 0.0001);
            $row->TAUX_PAR_INTERNE = round(($row->PAR_SUP_1 / $encours) * 100, 2);
            return $row;
        });

        $total = [
            'Gestionnaire'   => 'TOTAL GENERAL',
            'NbrCredits'     => $data->sum('NbrCredits'),
            'TotalAccorde'   => $data->sum('TotalAccorde'),
            'EncoursReel'    => $data->sum('EncoursReel'),
            'EncoursTotal'   => $data->sum('EncoursTotal'),
            'EncoursSain'    => $data->sum('EncoursSain'),
            'PAR_1_30'       => $data->sum('PAR_1_30'),
            'PAR_31_60'      => $data->sum('PAR_31_60'),
            'PAR_61_90'      => $data->sum('PAR_61_90'),
            'PAR_91_180'     => $data->sum('PAR_91_180'),
            'PAR_PLUS_180'   => $data->sum('PAR_PLUS_180'),
            'PAR_SUP_1'      => $data->sum('PAR_SUP_1'),
            'PAR_SUP_30'     => $data->sum('PAR_SUP_30'),
            'PAR_SUP_60'     => $data->sum('PAR_SUP_60'),
            'PAR_SUP_90'     => $data->sum('PAR_SUP_90'),
        ];
        $total['TAUX_PAR_INTERNE'] = round(($total['PAR_SUP_1'] / max($total['EncoursTotal'], 0.0001)) * 100, 2);

        $encoursGlobal = DB::table('portefeuilles')
            ->when($devise, fn($q) => $q->where('CodeMonnaie', $devise))
            ->when($codeAgence, fn($q) => $q->where('CodeAgence', $codeAgence))
            ->sum('MontantAccorde');
        $parGlobal = $data->sum('PAR_SUP_1');
        $parGlobalPercent = round(($parGlobal / max($encoursGlobal, 0.0001)) * 100, 2);

        $globalPercentages = [
            'Sain'      => $encoursGlobal > 0 ? round(($total['EncoursSain'] / $encoursGlobal) * 100, 2) : 0,
            '1_30'      => $encoursGlobal > 0 ? round(($total['PAR_1_30'] / $encoursGlobal) * 100, 2) : 0,
            '31_60'     => $encoursGlobal > 0 ? round(($total['PAR_31_60'] / $encoursGlobal) * 100, 2) : 0,
            '61_90'     => $encoursGlobal > 0 ? round(($total['PAR_61_90'] / $encoursGlobal) * 100, 2) : 0,
            '91_180'    => $encoursGlobal > 0 ? round(($total['PAR_91_180'] / $encoursGlobal) * 100, 2) : 0,
            'Plus180'   => $encoursGlobal > 0 ? round(($total['PAR_PLUS_180'] / $encoursGlobal) * 100, 2) : 0,
            'PAR_SUP_1' => $encoursGlobal > 0 ? round(($total['PAR_SUP_1'] / $encoursGlobal) * 100, 2) : 0,
            'PAR_SUP_30' => $encoursGlobal > 0 ? round(($total['PAR_SUP_30'] / $encoursGlobal) * 100, 2) : 0,
            'PAR_SUP_60' => $encoursGlobal > 0 ? round(($total['PAR_SUP_60'] / $encoursGlobal) * 100, 2) : 0,
            'PAR_SUP_90' => $encoursGlobal > 0 ? round(($total['PAR_SUP_90'] / $encoursGlobal) * 100, 2) : 0,
        ];

        return response()->json([
            'status' => 1,
            'data'   => $data->values(),
            'total'  => $total,
            'par_global_percent' => $parGlobalPercent,
            'global_percentages' => $globalPercentages,
            'encours_global' => $encoursGlobal
        ]);
    }

    return response()->json(['status' => 0, 'msg' => 'Type de rapport non reconnu']);
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
    $agenceFilter = $request->agence_filter ?? 'current';

    // Déterminer le code agence à utiliser (null = toutes les agences)
    $codeAgence = null;
    $user = auth()->user();

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null; // pas de filtre
    } else {
        // agenceFilter est un id
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }

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

    // Récupération des comptes avec filtre agence
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
            ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
            ->orderBy('c.NomCompte')
            ->get();
    } else {
        $comptes = DB::table('comptes as c')
            ->whereBetween($champRef, [$compte_debut, $compte_fin])
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
            ->orderBy('c.NomCompte')
            ->get();
    }

    if ($comptes->isEmpty()) {
        return response()->json(['status' => 0, 'msg' => 'Aucun compte trouvé pour cette plage']);
    }

    // Soldes initiaux (avant date_debut)
    $soldesInitiaux = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->whereBetween($champRef, [$compte_debut, $compte_fin])
        ->where(DB::raw('CAST(t.CodeMonnaie AS UNSIGNED)'), $codeMonnaie)
        ->where('t.DateTransaction', '<', $date_debut)
        ->when($codeAgence, function($q) use ($codeAgence) {
            return $q->where('c.CodeAgence', $codeAgence)
                     ->where('t.CodeAgence', $codeAgence);
        })
        ->select(
            'c.NumCompte',
            DB::raw("COALESCE(SUM(CASE WHEN LEFT(c.NumCompte,1) IN ('1','2','3') THEN t.$debitCol - t.$creditCol ELSE t.$creditCol - t.$debitCol END), 0) as soldeInitial")
        )
        ->groupBy('c.NumCompte')
        ->get()
        ->keyBy('NumCompte');

    // Mouvements dans la période
    $mouvements = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->whereBetween($champRef, [$compte_debut, $compte_fin])
        ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
        ->where(DB::raw('CAST(t.CodeMonnaie AS UNSIGNED)'), $codeMonnaie)
        ->when($codeAgence, function($q) use ($codeAgence) {
            return $q->where('c.CodeAgence', $codeAgence)
                     ->where('t.CodeAgence', $codeAgence);
        })
        ->select(
            'c.NumCompte',
            DB::raw("SUM(t.$debitCol) as totalDebit"),
            DB::raw("SUM(t.$creditCol) as totalCredit")
        )
        ->groupBy('c.NumCompte')
        ->get()
        ->keyBy('NumCompte');

    // Construction des données brutes (inchangée)
    $rawData = [];
    foreach ($comptes as $compte) {
        $num = $compte->NumCompte;
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

    // Consolidation ou détail (inchangé)
    if ($type_balance === 'consolide') {
        $parents = DB::table('comptes')
            ->where('niveau', 4)
            ->where('est_classe', 1)
            ->get(['NumCompte', 'NomCompte'])
            ->keyBy('NumCompte');

        $grouped = [];
        foreach ($rawData as $item) {
            $parentCode = $item['RefSousGroupe'];
            if (!isset($parents[$parentCode])) continue;

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
    } else {
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


    //GET BILAN REPORTS 

//  public function getBilanCompte(Request $request)
// {
//     $date1 = $request->date_debut_balance;
//     $date2 = $request->date_fin_balance;
//     $devise = $request->devise;
//     $agenceFilter = $request->agence_filter ?? 'current';

//     // Déterminer le code agence à utiliser pour le filtrage (null = toutes les agences)
//     $codeAgence = null;
//     $user = auth()->user();

//     if ($agenceFilter === 'current') {
//         $currentAgence = session('current_agence');
//         $codeAgence = $currentAgence['code_agence'] ?? null;
//         if (!$codeAgence) {
//             return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie pour cet utilisateur']);
//         }
//     } elseif ($agenceFilter === 'all') {
//         $codeAgence = null; // pas de filtre
//     } else {
//         // agenceFilter est un id (ex: 1,2,3...)
//         // Vérifier que l'agence appartient bien à l'utilisateur
//         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
//         if (!$agence) {
//             return response()->json(['status' => 0, 'msg' => 'Agence non autorisée pour cet utilisateur']);
//         }
//         $codeAgence = $agence->code_agence;
//     }

//     $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
//     $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
//     $monnaieValue = $devise === 'USD' ? 1 : 2;

//     // Helper pour ajouter condition WHERE sur CodeAgence si nécessaire
//     $addAgenceWhere = function($query) use ($codeAgence) {
//         if ($codeAgence) {
//             $query->where('CodeAgence', $codeAgence);
//         }
//         return $query;
//     };

//     // Provision 38
//     $provision38 = DB::table('transactions as t')
//         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
//         ->where('c.RefCadre', '38')
//         ->where('t.CodeMonnaie', $monnaieValue)
//         ->where('t.DateTransaction', '<=', $date2)
//         ->when($codeAgence, function($q) use ($codeAgence) {
//             return $q->where('c.CodeAgence', $codeAgence);
//         })
//         ->select(DB::raw("COALESCE(SUM(t.$creditCol - t.$debitCol), 0) as total38"))
//         ->first();

//     // ==================== ACTIF ====================
//     $actifQuery = DB::table('comptes as c')
//         ->leftJoin('comptes as c_individuel', function($join) use ($codeAgence) {
//             $join->on('c.NumCompte', '=', 'c_individuel.compte_parent');
//             if ($codeAgence) {
//                 $join->where('c_individuel.CodeAgence', $codeAgence);
//             }
//         })
//         ->leftJoin('transactions as t', function ($join) use ($monnaieValue, $codeAgence) {
//             $join->on('c_individuel.NumCompte', '=', 't.NumCompte')
//                  ->where('t.CodeMonnaie', '=', $monnaieValue);
//             if ($codeAgence) {
//                 $join->where('t.CodeAgence', $codeAgence);
//             }
//         })
//         ->select(
//             'c.NumCompte',
//             'c.NomCompte',
//             'c.RefCadre',
//             'c.RefGroupe',
//             'c.RefSousGroupe',
//             'c.RefTypeCompte',
//             'c.nature_compte',
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$debitCol - t.$creditCol ELSE 0 END),0) AS soldeDebut"),
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$debitCol - t.$creditCol ELSE 0 END),0) AS soldeFin")
//         )
//         ->where('c.niveau', 4)
//         ->where('c.est_classe', 1)
//         ->where('c.nature_compte', 'ACTIF')
//         ->when($codeAgence, function($q) use ($codeAgence) {
//             return $q->where('c.CodeAgence', $codeAgence);
//         })
//         ->groupBy('c.NumCompte', 'c.NomCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
//         ->orderBy('c.RefCadre')
//         ->orderBy('c.RefGroupe')
//         ->orderBy('c.RefSousGroupe');

//     $actifData = $actifQuery->get();

//     // Total 39 (brut)
//     $total39 = DB::table('transactions as t')
//         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
//         ->where('c.RefCadre', '39')
//         ->where('t.DateTransaction', '<=', $date2)
//         ->where('t.CodeMonnaie', $monnaieValue)
//         ->when($codeAgence, function($q) use ($codeAgence) {
//             return $q->where('c.CodeAgence', $codeAgence);
//         })
//         ->select(DB::raw("COALESCE(SUM(t.$debitCol - t.$creditCol), 0) as total39"))
//         ->value('total39');

//     $provision = abs($provision38->total38 ?? 0);
//     $solde39_brut = $total39;
//     $solde38 = $provision;
//     $solde39_net = $solde39_brut - $solde38;

//     // Supprimer les lignes 39 et ajouter la ligne consolidée
//     $actifData = collect($actifData)->reject(fn($item) => $item->RefCadre == '39')->values();
//     $ligne39 = (object)[
//         'NumCompte' => '39',
//         'NomCompte' => 'Créances douteuses ou litigieuses (NET)',
//         'RefCadre' => '39',
//         'RefGroupe' => null,
//         'RefSousGroupe' => null,
//         'RefTypeCompte' => '3',
//         'nature_compte' => 'ACTIF',
//         'soldeDebut' => 0,
//         'soldeFin' => $solde39_net,
//     ];
//     $actifData->push($ligne39);
//     $actifData = $actifData->sortBy('NumCompte')->values();

//     // ==================== PASSIF ====================
//     $passifQuery = DB::table('comptes as c')
//         ->leftJoin('comptes as c_individuel', function($join) use ($codeAgence) {
//             $join->on('c.NumCompte', '=', 'c_individuel.compte_parent');
//             if ($codeAgence) {
//                 $join->where('c_individuel.CodeAgence', $codeAgence);
//             }
//         })
//         ->leftJoin('transactions as t', function ($join) use ($monnaieValue, $codeAgence) {
//             $join->on('c_individuel.NumCompte', '=', 't.NumCompte')
//                  ->where('t.CodeMonnaie', '=', $monnaieValue);
//             if ($codeAgence) {
//                 $join->where('t.CodeAgence', $codeAgence);
//             }
//         })
//         ->select(
//             'c.NumCompte',
//             'c.NomCompte',
//             'c.RefCadre',
//             'c.RefGroupe',
//             'c.RefSousGroupe',
//             'c.RefTypeCompte',
//             'c.nature_compte',
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) AS soldeDebut"),
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) AS soldeFin")
//         )
//         ->where('c.niveau', 4)
//         ->where('c.est_classe', 1)
//         ->where('c.nature_compte', 'PASSIF')
//         ->where('c.RefCadre', '!=', '38')
//         ->when($codeAgence, function($q) use ($codeAgence) {
//             return $q->where('c.CodeAgence', $codeAgence);
//         })
//         ->groupBy('c.NumCompte', 'c.NomCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
//         ->orderBy('c.RefCadre')
//         ->orderBy('c.RefGroupe')
//         ->orderBy('c.RefSousGroupe');

//     $passifData = $passifQuery->get();

//     // Résultat (Produit - Charge)
//     $resultat = DB::table('transactions as t')
//         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
//         ->where('t.CodeMonnaie', $monnaieValue)
//         ->where('t.DateTransaction', '<=', $date2)
//         ->when($codeAgence, function($q) use ($codeAgence) {
//             return $q->where('t.CodeAgence', $codeAgence)
//                      ->where('c.CodeAgence', $codeAgence);
//         })
//         ->select(DB::raw("
//             SUM(CASE WHEN c.nature_compte = 'PRODUIT' THEN t.$creditCol - t.$debitCol ELSE 0 END) -
//             SUM(CASE WHEN c.nature_compte = 'CHARGE' THEN t.$debitCol - t.$creditCol ELSE 0 END) 
//             as montant
//         "))
//         ->first();

//     $soldeResultat = $resultat->montant ?? 0;
//     if ($soldeResultat != 0) {
//         $estBenefice = $soldeResultat > 0;
//         $passifData->push((object)[
//             'NumCompte'     => $estBenefice ? '131' : '139',
//             'NomCompte'     => $estBenefice ? 'RESULTAT NET : BENEFICE' : 'RESULTAT NET : PERTE',
//             'RefCadre'      => '13',
//             'nature_compte' => 'PASSIF',
//             'soldeFin'      => abs($soldeResultat),
//         ]);
//     }

//     $totalActif = $actifData->sum('soldeFin');
//     $totalPassif = $passifData->sum('soldeFin');

//     return response()->json([
//         "status" => 1,
//         "actif" => $actifData,
//         "passif" => $passifData,
//         "totaux" => [
//             "actif" => $totalActif,
//             "passif" => $totalPassif,
//             "difference" => abs($totalActif - $totalPassif),
//             "est_equilibre" => abs($totalActif - $totalPassif) < 0.01
//         ]
//     ]);
// }

// public function getBilanCompte(Request $request)
// {
//     $date1 = $request->date_debut_balance;
//     $date2 = $request->date_fin_balance;
//     $devise = $request->devise;
//     $agenceFilter = $request->agence_filter ?? 'current';

//     $user = auth()->user();
//     $codeAgence = null;

//     if ($agenceFilter === 'current') {
//         $currentAgence = session('current_agence');
//         $codeAgence = $currentAgence['code_agence'] ?? null;
//         if (!$codeAgence) {
//             return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
//         }
//     } elseif ($agenceFilter === 'all') {
//         $codeAgence = null; // pas de filtre
//     } else {
//         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
//         if (!$agence) {
//             return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
//         }
//         $codeAgence = $agence->code_agence;
//     }

//     $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
//     $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
//     $monnaieValue = $devise === 'USD' ? 1 : 2;

//     // Provision 38
//     $provision38 = DB::table('transactions as t')
//         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
//         ->where('c.RefCadre', '38')
//         ->where('t.CodeMonnaie', $monnaieValue)
//         ->where('t.DateTransaction', '<=', $date2)
//         ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
//         ->selectRaw("COALESCE(SUM(t.$creditCol - t.$debitCol), 0) as total38")
//         ->first();

//     // ==================== ACTIF ====================
//     $actifQuery = DB::table('comptes as c')
//         ->leftJoin('comptes as c_individuel', function($join) use ($codeAgence) {
//             $join->on('c.NumCompte', '=', 'c_individuel.compte_parent');
//             if ($codeAgence) {
//                 $join->where('c_individuel.CodeAgence', $codeAgence);
//             }
//         })
//         ->leftJoin('transactions as t', function ($join) use ($monnaieValue, $codeAgence) {
//             $join->on('c_individuel.NumCompte', '=', 't.NumCompte')
//                  ->where('t.CodeMonnaie', '=', $monnaieValue);
//             if ($codeAgence) {
//                 $join->where('t.CodeAgence', $codeAgence);
//             }
//         })
//         ->select(
//             'c.NumCompte',
//             DB::raw("MAX(c.NomCompte) as NomCompte"), // 🔥 libellé unique en cas de regroupement
//             'c.RefCadre',
//             'c.RefGroupe',
//             'c.RefSousGroupe',
//             'c.RefTypeCompte',
//             'c.nature_compte',
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$debitCol - t.$creditCol ELSE 0 END),0) AS soldeDebut"),
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$debitCol - t.$creditCol ELSE 0 END),0) AS soldeFin")
//         )
//         ->where('c.niveau', 4)
//         ->where('c.est_classe', 1)
//         ->where('c.nature_compte', 'ACTIF')
//         ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
//         ->groupBy('c.NumCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
//         ->orderBy('c.RefCadre')
//         ->orderBy('c.RefGroupe')
//         ->orderBy('c.RefSousGroupe');

//     $actifData = $actifQuery->get();

//     // Total 39 (brut)
//     $total39 = DB::table('transactions as t')
//         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
//         ->where('c.RefCadre', '39')
//         ->where('t.DateTransaction', '<=', $date2)
//         ->where('t.CodeMonnaie', $monnaieValue)
//         ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
//         ->value(DB::raw("COALESCE(SUM(t.$debitCol - t.$creditCol), 0) as total39"));

//     $provision = abs($provision38->total38 ?? 0);
//     $solde39_net = $total39 - $provision;

//     // Supprimer les lignes 39 et ajouter la ligne consolidée
//     $actifData = collect($actifData)->reject(fn($item) => $item->RefCadre == '39')->values();
//     $ligne39 = (object)[
//         'NumCompte' => '39',
//         'NomCompte' => 'Créances douteuses ou litigieuses (NET)',
//         'RefCadre' => '39',
//         'RefGroupe' => null,
//         'RefSousGroupe' => null,
//         'RefTypeCompte' => '3',
//         'nature_compte' => 'ACTIF',
//         'soldeDebut' => 0,
//         'soldeFin' => $solde39_net,
//     ];
//     $actifData->push($ligne39);
//     $actifData = $actifData->sortBy('NumCompte')->values();

//     // ==================== PASSIF ====================
//     $passifQuery = DB::table('comptes as c')
//         ->leftJoin('comptes as c_individuel', function($join) use ($codeAgence) {
//             $join->on('c.NumCompte', '=', 'c_individuel.compte_parent');
//             if ($codeAgence) {
//                 $join->where('c_individuel.CodeAgence', $codeAgence);
//             }
//         })
//         ->leftJoin('transactions as t', function ($join) use ($monnaieValue, $codeAgence) {
//             $join->on('c_individuel.NumCompte', '=', 't.NumCompte')
//                  ->where('t.CodeMonnaie', '=', $monnaieValue);
//             if ($codeAgence) {
//                 $join->where('t.CodeAgence', $codeAgence);
//             }
//         })
//         ->select(
//             'c.NumCompte',
//             DB::raw("MAX(c.NomCompte) as NomCompte"),
//             'c.RefCadre',
//             'c.RefGroupe',
//             'c.RefSousGroupe',
//             'c.RefTypeCompte',
//             'c.nature_compte',
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) AS soldeDebut"),
//             DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) AS soldeFin")
//         )
//         ->where('c.niveau', 4)
//         ->where('c.est_classe', 1)
//         ->where('c.nature_compte', 'PASSIF')
//         ->where('c.RefCadre', '!=', '38')
//         ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
//         ->groupBy('c.NumCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
//         ->orderBy('c.RefCadre')
//         ->orderBy('c.RefGroupe')
//         ->orderBy('c.RefSousGroupe');

//     $passifData = $passifQuery->get();

//     // Résultat (Produit - Charge)
//     $resultat = DB::table('transactions as t')
//         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
//         ->where('t.CodeMonnaie', $monnaieValue)
//         ->where('t.DateTransaction', '<=', $date2)
//         ->when($codeAgence, fn($q) => $q->where('t.CodeAgence', $codeAgence)->where('c.CodeAgence', $codeAgence))
//         ->selectRaw("
//             SUM(CASE WHEN c.nature_compte = 'PRODUIT' THEN t.$creditCol - t.$debitCol ELSE 0 END) -
//             SUM(CASE WHEN c.nature_compte = 'CHARGE' THEN t.$debitCol - t.$creditCol ELSE 0 END) 
//             as montant
//         ")
//         ->first();

//     $soldeResultat = $resultat->montant ?? 0;
//     if ($soldeResultat != 0) {
//         $estBenefice = $soldeResultat > 0;
//         $passifData->push((object)[
//             'NumCompte'     => $estBenefice ? '131' : '139',
//             'NomCompte'     => $estBenefice ? 'RESULTAT NET : BENEFICE' : 'RESULTAT NET : PERTE',
//             'RefCadre'      => '13',
//             'nature_compte' => 'PASSIF',
//             'soldeFin'      => abs($soldeResultat),
//         ]);
//     }

//     $totalActif = $actifData->sum('soldeFin');
//     $totalPassif = $passifData->sum('soldeFin');

//     return response()->json([
//         "status" => 1,
//         "actif" => $actifData,
//         "passif" => $passifData,
//         "totaux" => [
//             "actif" => $totalActif,
//             "passif" => $totalPassif,
//             "difference" => abs($totalActif - $totalPassif),
//             "est_equilibre" => abs($totalActif - $totalPassif) < 0.01
//         ]
//     ]);
// }


public function getBilanCompte(Request $request)
{
    $date1 = $request->date_debut_balance;
    $date2 = $request->date_fin_balance;
    $devise = $request->devise;
    $agenceFilter = $request->agence_filter ?? 'current';

    $user = auth()->user();
    $codeAgence = null;

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null;
    } else {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }

    $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
    $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
    $monnaieValue = $devise === 'USD' ? 1 : 2;

    // Provision 38
    $provision38 = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->where('c.RefCadre', '38')
        ->where('t.CodeMonnaie', $monnaieValue)
        ->where('t.DateTransaction', '<=', $date2)
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
        ->selectRaw("COALESCE(SUM(t.$creditCol - t.$debitCol), 0) as total38")
        ->first();

    // Sous-requête : soldes des comptes de niveau 5 par parent
    $subQuery = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->where('c.niveau', 5)
        ->where('c.est_classe', 0)
        ->where('t.CodeMonnaie', $monnaieValue)
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
        ->select(
            'c.compte_parent',
            DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$debitCol - t.$creditCol ELSE 0 END), 0) AS soldeDebut"),
            DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$debitCol - t.$creditCol ELSE 0 END), 0) AS soldeFin")
        )
        ->groupBy('c.compte_parent');

    // ==================== ACTIF ====================
    $actifData = DB::table('comptes as c')
        ->leftJoinSub($subQuery, 's', 'c.NumCompte', '=', 's.compte_parent')
        ->select(
            'c.NumCompte',
            DB::raw("MAX(c.NomCompte) as NomCompte"), // agrégation pour éviter doublon
            'c.RefCadre',
            'c.RefGroupe',
            'c.RefSousGroupe',
            'c.RefTypeCompte',
            'c.nature_compte',
            DB::raw("MAX(COALESCE(s.soldeDebut, 0)) as soldeDebut"),
            DB::raw("MAX(COALESCE(s.soldeFin, 0)) as soldeFin")
        )
        ->where('c.niveau', 4)
        ->where('c.est_classe', 1)
        ->where('c.nature_compte', 'ACTIF')
        ->where('c.RefCadre', '!=', '45')
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
        ->groupBy('c.NumCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
        ->orderBy('c.RefCadre')
        ->orderBy('c.RefGroupe')
        ->orderBy('c.RefSousGroupe')
        ->get();

    // Total 39 brut
    $total39 = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->where('c.RefCadre', '39')
        ->where('t.DateTransaction', '<=', $date2)
        ->where('t.CodeMonnaie', $monnaieValue)
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
        ->value(DB::raw("COALESCE(SUM(t.$debitCol - t.$creditCol), 0)"));

    $provision = abs($provision38->total38 ?? 0);
    $solde39_net = $total39 - $provision;

    // Supprimer les anciennes lignes 39 et ajouter la ligne consolidée
    $actifData = collect($actifData)->reject(fn($item) => $item->RefCadre == '39')->values();
    $ligne39 = (object)[
        'NumCompte' => '39',
        'NomCompte' => 'Créances douteuses ou litigieuses (NET)',
        'RefCadre' => '39',
        'RefGroupe' => null,
        'RefSousGroupe' => null,
        'RefTypeCompte' => '3',
        'nature_compte' => 'ACTIF',
        'soldeDebut' => 0,
        'soldeFin' => $solde39_net,
    ];
    $actifData->push($ligne39);
    $actifData = $actifData->sortBy('NumCompte')->values();

    // ==================== PASSIF ====================
    $passifData = DB::table('comptes as c')
        ->leftJoinSub($subQuery, 's', 'c.NumCompte', '=', 's.compte_parent')
        ->select(
            'c.NumCompte',
            DB::raw("MAX(c.NomCompte) as NomCompte"),
            'c.RefCadre',
            'c.RefGroupe',
            'c.RefSousGroupe',
            'c.RefTypeCompte',
            'c.nature_compte',
            DB::raw("MAX(COALESCE(s.soldeDebut, 0)) as soldeDebut"),
            DB::raw("MAX(COALESCE(s.soldeFin, 0)) as soldeFin")
        )
        ->where('c.niveau', 4)
        ->where('c.est_classe', 1)
        ->where('c.nature_compte', 'PASSIF')
        ->where('c.RefCadre', '!=', '38')
        ->where('c.RefCadre', '!=', '45')
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
        ->groupBy('c.NumCompte', 'c.RefCadre', 'c.RefGroupe', 'c.RefSousGroupe', 'c.RefTypeCompte', 'c.nature_compte')
        ->orderBy('c.RefCadre')
        ->orderBy('c.RefGroupe')
        ->orderBy('c.RefSousGroupe')
        ->get();

    // Résultat (Produit - Charge)
    $resultat = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->where('t.CodeMonnaie', $monnaieValue)
        ->where('t.DateTransaction', '<=', $date2)
        ->when($codeAgence, fn($q) => $q->where('t.CodeAgence', $codeAgence)->where('c.CodeAgence', $codeAgence))
        ->selectRaw("
            SUM(CASE WHEN c.nature_compte = 'PRODUIT' THEN t.$creditCol - t.$debitCol ELSE 0 END) -
            SUM(CASE WHEN c.nature_compte = 'CHARGE' THEN t.$debitCol - t.$creditCol ELSE 0 END) 
            as montant
        ")
        ->first();

    $soldeResultat = $resultat->montant ?? 0;
    if ($soldeResultat != 0) {
        $estBenefice = $soldeResultat > 0;
        $passifData->push((object)[
            'NumCompte'     => $estBenefice ? '131' : '139',
            'NomCompte'     => $estBenefice ? 'RESULTAT NET : BENEFICE' : 'RESULTAT NET : PERTE',
            'RefCadre'      => '13',
            'nature_compte' => 'PASSIF',
            'soldeFin'      => abs($soldeResultat),
        ]);
    }

    $totalActif = $actifData->sum('soldeFin');
    $totalPassif = $passifData->sum('soldeFin');

  // Calcul direct du solde des comptes de liaison (RefCadre = 45) selon la convention passif (crédit - débit)
$liaisonQuery = DB::table('transactions as t')
    ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
    ->where('c.RefCadre', '45')
    ->where('c.niveau', 5) // ne prendre que les comptes individuels de liaison (niveau 5)
    ->where('t.CodeMonnaie', $monnaieValue)
    ->where('t.DateTransaction', '<=', $date2) // solde à la date de fin
    ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
    ->selectRaw("COALESCE(SUM(t.$creditCol - t.$debitCol), 0) as solde")
    ->first();

$soldeLiaison = $liaisonQuery ? $liaisonQuery->solde : 0;

if (abs($soldeLiaison) > 0.0001) {
    $ligneLiaison = (object)[
        'NumCompte' => '45',
        'NomCompte' => 'COMPTE DE LIAISON INTER-AGENCE',
        'RefCadre' => '45',
        'RefGroupe' => null,
        'RefSousGroupe' => null,
        'RefTypeCompte' => '4',
        'nature_compte' => ($soldeLiaison > 0 ? 'PASSIF' : 'ACTIF'),
        'soldeDebut' => 0,
        'soldeFin' => abs($soldeLiaison),
    ];

    if ($soldeLiaison > 0) {
        $passifData->push($ligneLiaison);
    } else {
        $actifData->push($ligneLiaison);
    }

}

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
    // public function getGrandLivre(Request $request)
    // {
    //     $date_debut = $request->date_debut;
    //     $date_fin   = $request->date_fin;
    //     $devise     = $request->devise;
    //     $compte_debut = $request->compte_debut;
    //     $compte_fin   = $request->compte_fin;

    //     $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
    //     $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
    //     $codeMonnaie = $devise === 'USD' ? 1 : 2;

    //     // Détermination du champ de filtre
    //     if (strlen($compte_debut) == 2 && strlen($compte_fin) == 2) {
    //         $champRef = 'c.RefCadre';
    //     } elseif (strlen($compte_debut) == 3 && strlen($compte_fin) == 3) {
    //         $champRef = 'c.RefGroupe';
    //     } elseif (strlen($compte_debut) == 13 && strlen($compte_fin) == 13) {
    //         $champRef = 'c.NumCompte';
    //     } else {
    //         $champRef = 'c.RefTypeCompte';
    //     }

    //     // Récupération des comptes de niveau 5
    //     $comptes = DB::table('comptes as c')
    //         ->whereBetween($champRef, [$compte_debut, $compte_fin])
    //         ->where('c.niveau', 5)
    //         ->where('c.est_classe', 0)
    //         ->where('c.CodeMonnaie', $codeMonnaie)
    //         ->orderBy('c.NumCompte')
    //         ->get();

    //     if ($comptes->isEmpty()) {
    //         return response()->json(['status' => 0, 'msg' => 'Aucun compte trouvé']);
    //     }

    //     // Soldes initiaux (avant date_debut)
    //     $soldesInitiaux = DB::table('transactions as t')
    //         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
    //         ->whereBetween($champRef, [$compte_debut, $compte_fin])
    //         ->where('c.niveau', 5)
    //         ->where('c.est_classe', 0)
    //         ->where('c.CodeMonnaie', $codeMonnaie)
    //         ->where('t.CodeMonnaie', $codeMonnaie)
    //         ->where('t.DateTransaction', '<', $date_debut)
    //         ->select(
    //             'c.NumCompte',
    //             DB::raw("
    //             COALESCE(SUM(
    //                 CASE 
    //                     WHEN LEFT(c.NumCompte,1) IN ('1','2','3') THEN t.$debitCol - t.$creditCol
    //                     ELSE t.$creditCol - t.$debitCol
    //                 END
    //             ), 0) as soldeInitial
    //         ")
    //         )
    //         ->groupBy('c.NumCompte')
    //         ->get()
    //         ->keyBy('NumCompte');

    //     // Transactions dans la période (non groupées, pour garder le détail)
    //     $transactions = DB::table('transactions as t')
    //         ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
    //         ->whereBetween($champRef, [$compte_debut, $compte_fin])
    //         ->where('c.niveau', 5)
    //         ->where('c.est_classe', 0)
    //         ->where('c.CodeMonnaie', $codeMonnaie)
    //         ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
    //         ->where('t.CodeMonnaie', $codeMonnaie)
    //         ->select(
    //             't.DateTransaction',
    //             't.NumTransaction',
    //             't.Libelle',
    //             'c.NumCompte',
    //             'c.NomCompte',
    //             DB::raw("t.$debitCol as debit"),
    //             DB::raw("t.$creditCol as credit")
    //         )
    //         ->orderBy('c.NumCompte')
    //         ->orderBy('t.DateTransaction')
    //         ->orderBy('t.NumTransaction')
    //         ->get()
    //         ->groupBy('NumCompte');

    //     $result = [];

    //     foreach ($comptes as $compte) {
    //         $num = $compte->NumCompte;
    //         $nom = $compte->NomCompte;

    //         // Solde initial signé (positif pour actif débiteur, négatif pour passif créditeur)
    //         $soldeCourant = $soldesInitiaux[$num]->soldeInitial ?? 0;

    //         // Ligne d'en-tête du compte
    //         $result[] = [
    //             'type' => 'compte',
    //             'NumCompte' => $num,
    //             'NomCompte' => $nom
    //         ];

    //         // Ligne solde initial (affichée en valeur absolue, mais on garde le signe pour le cumul)
    //         $result[] = [
    //             'type' => 'solde_initial',
    //             'libelle' => "Solde reporté au $date_debut",
    //             'debit' => 0,
    //             'credit' => 0,
    //             'solde' => $soldeCourant,   // valeur signée
    //             'solde_abs' => abs($soldeCourant)
    //         ];

    //         $totalDebit = 0;
    //         $totalCredit = 0;

    //         if (isset($transactions[$num])) {
    //             foreach ($transactions[$num] as $t) {
    //                 // Mise à jour du solde selon la nature du compte
    //                 if (in_array($num[0], ['1', '2', '3'])) { // compte actif
    //                     $soldeCourant += ($t->debit - $t->credit);
    //                 } else { // compte passif / produit / charge
    //                     $soldeCourant += ($t->credit - $t->debit);
    //                 }

    //                 $totalDebit += $t->debit;
    //                 $totalCredit += $t->credit;

    //                 $result[] = [
    //                     'type' => 'mouvement',
    //                     'date' => $t->DateTransaction,
    //                     'numPiece' => $t->NumTransaction,
    //                     'libelle' => $t->Libelle,
    //                     'debit' => $t->debit,
    //                     'credit' => $t->credit,
    //                     'solde' => $soldeCourant,   // solde signé
    //                     'solde_abs' => abs($soldeCourant)
    //                 ];
    //             }
    //         }

    //         // Ligne TOTAL
    //         $result[] = [
    //             'type' => 'total',
    //             'libelle' => 'TOTAL',
    //             'debit' => $totalDebit,
    //             'credit' => $totalCredit,
    //             'solde' => $soldeCourant,
    //             'solde_abs' => abs($soldeCourant)
    //         ];
    //     }


    //     //     $result[] = [
    //     //     'type' => 'mouvement',
    //     //     'date' => $t->DateTransaction,
    //     //     'numPiece' => $t->NumTransaction,
    //     //     'libelle' => $t->Libelle,
    //     //     'debit' => $t->debit,
    //     //     'credit' => $t->credit,
    //     //     'solde_precedent' => $soldeCourant - (($num[0] <= 3) ? ($t->debit - $t->credit) : ($t->credit - $t->debit)),
    //     //     'solde' => $soldeCourant,
    //     //     'solde_abs' => abs($soldeCourant)
    //     // ];

    //     return response()->json([
    //         'status' => 1,
    //         'data' => $result
    //     ]);
    // }

   public function getGrandLivre(Request $request)
{
    $date_debut = $request->date_debut;
    $date_fin   = $request->date_fin;
    $devise     = $request->devise;
    $compte_debut = $request->compte_debut;
    $compte_fin   = $request->compte_fin;
    $agenceFilter = $request->agence_filter ?? 'current';

    // Détermination du code agence (null = toutes les agences)
    $codeAgence = null;
    $user = auth()->user();

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null;
    } else {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }

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

    // Récupération des comptes de niveau 5 avec filtre agence
    $comptes = DB::table('comptes as c')
        ->whereBetween($champRef, [$compte_debut, $compte_fin])
        ->where('c.niveau', 5)
        ->where('c.est_classe', 0)
        ->where('c.CodeMonnaie', $codeMonnaie)
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
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
        ->when($codeAgence, function($q) use ($codeAgence) {
            return $q->where('c.CodeAgence', $codeAgence)
                     ->where('t.CodeAgence', $codeAgence);
        })
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

    // Transactions dans la période (détail)
    $transactions = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->whereBetween($champRef, [$compte_debut, $compte_fin])
        ->where('c.niveau', 5)
        ->where('c.est_classe', 0)
        ->where('c.CodeMonnaie', $codeMonnaie)
        ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
        ->where('t.CodeMonnaie', $codeMonnaie)
        ->when($codeAgence, function($q) use ($codeAgence) {
            return $q->where('c.CodeAgence', $codeAgence)
                     ->where('t.CodeAgence', $codeAgence);
        })
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

        $soldeCourant = $soldesInitiaux[$num]->soldeInitial ?? 0;
        $accountLines = [];

        $accountLines[] = [
            'type' => 'compte',
            'NumCompte' => $num,
            'NomCompte' => $nom
        ];

        $accountLines[] = [
            'type' => 'solde_initial',
            'libelle' => "Solde reporté au $date_debut",
            'debit' => 0,
            'credit' => 0,
            'solde' => $soldeCourant,
            'solde_abs' => abs($soldeCourant)
        ];

        $totalDebit = 0;
        $totalCredit = 0;

        if (isset($transactions[$num])) {
            foreach ($transactions[$num] as $t) {
                if (in_array($num[0], ['1', '2', '3'])) {
                    $soldeCourant += ($t->debit - $t->credit);
                } else {
                    $soldeCourant += ($t->credit - $t->debit);
                }

                $totalDebit += $t->debit;
                $totalCredit += $t->credit;

                $accountLines[] = [
                    'type' => 'mouvement',
                    'date' => $t->DateTransaction,
                    'numPiece' => $t->NumTransaction,
                    'libelle' => $t->Libelle,
                    'debit' => $t->debit,
                    'credit' => $t->credit,
                    'solde' => $soldeCourant,
                    'solde_abs' => abs($soldeCourant)
                ];
            }
        }

        $accountLines[] = [
            'type' => 'total',
            'libelle' => 'TOTAL',
            'debit' => $totalDebit,
            'credit' => $totalCredit,
            'solde' => $soldeCourant,
            'solde_abs' => abs($soldeCourant)
        ];

        // On exclut les comptes dont le solde final est nul
        if ($soldeCourant != 0) {
            $result = array_merge($result, $accountLines);
        }
    }

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


   public function getTfrCompte(Request $request)
{
    $date_debut = $request->date_debut;
    $date_fin   = $request->date_fin;
    $devise     = $request->devise;
    $type_tfr   = $request->type_tfr ?? 'detail';
    $agenceFilter = $request->agence_filter ?? 'current';

    // Déterminer le code agence (null = toutes les agences)
    $codeAgence = null;
    $user = auth()->user();

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null;
    } else {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }

    $debitCol = $devise === 'USD' ? 'Debitusd' : 'Debitfc';
    $creditCol = $devise === 'USD' ? 'Creditusd' : 'Creditfc';
    $codeMonnaie = $devise === 'USD' ? 1 : 2;

    // Vérification : les dates doivent être dans la même année
    $annee_debut = date('Y', strtotime($date_debut));
    $annee_fin = date('Y', strtotime($date_fin));
    if ($annee_debut != $annee_fin) {
        return response()->json([
            'status' => 0,
            'msg' => 'Veuillez choisir des dates appartenant à la même année. Le TFR s\'analyse sur un exercice annuel.'
        ]);
    }

    // Récupérer les comptes de produits et charges (niveau 5) avec filtre agence
    $comptes = DB::table('comptes as c')
        ->whereIn('c.nature_compte', ['PRODUIT', 'CHARGE'])
        ->where('c.niveau', 5)
        ->where('c.est_classe', 0)
        ->where('c.CodeMonnaie', $codeMonnaie)
        ->when($codeAgence, fn($q) => $q->where('c.CodeAgence', $codeAgence))
        ->orderBy('c.NumCompte')
        ->get(['c.NumCompte', 'c.NomCompte', 'c.nature_compte', 'c.RefGroupe', 'c.RefCadre']);

    if ($comptes->isEmpty()) {
        return response()->json(['status' => 0, 'msg' => 'Aucun compte de produit ou charge trouvé pour cette devise']);
    }

    // Calcul des soldes sur la période (cumul des mouvements)
    $soldes = DB::table('transactions as t')
        ->join('comptes as c', 't.NumCompte', '=', 'c.NumCompte')
        ->whereIn('c.nature_compte', ['PRODUIT', 'CHARGE'])
        ->where('c.niveau', 5)
        ->where('c.est_classe', 0)
        ->where('c.CodeMonnaie', $codeMonnaie)
        ->whereBetween('t.DateTransaction', [$date_debut, $date_fin])
        ->where('t.CodeMonnaie', $codeMonnaie)
        ->when($codeAgence, function($q) use ($codeAgence) {
            return $q->where('c.CodeAgence', $codeAgence)
                     ->where('t.CodeAgence', $codeAgence);
        })
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
            $solde = $compte->totalDebit - $compte->totalCredit;
        } else { // PRODUIT
            $solde = $compte->totalCredit - $compte->totalDebit;
        }
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
    $date1 = $request->dateToSearch1;
    $date2 = $request->dateToSearch2;
    if (isset($date1) and isset($date2)) {
        // ----- GESTION DU FILTRE AGENCE -----
        $agenceFilter = $request->agence_filter ?? 'current';
        $codeAgence = null;
        $user = auth()->user();

        if ($agenceFilter === 'current') {
            $currentAgence = session('current_agence');
            $codeAgence = $currentAgence['code_agence'] ?? null;
            if (!$codeAgence) {
                return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
            }
        } elseif ($agenceFilter === 'all') {
            $codeAgence = null;
        } else {
            $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
            if (!$agence) {
                return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
            }
            $codeAgence = $agence->code_agence;
        }

        if ($request->devise == "CDF") {
            $data = DB::table('echeanciers')
                ->leftJoin('portefeuilles', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->select(
                    'echeanciers.*',
                    'portefeuilles.*',
                    DB::raw('IFNULL((SELECT SUM(transactions.Creditfc) - SUM(transactions.Debitfc) 
                      FROM transactions 
                      WHERE transactions.NumCompte = portefeuilles.NumCompteEpargne 
                      AND transactions.extourner != 1
                      ' . ($codeAgence ? "AND transactions.CodeAgence = '{$codeAgence}'" : '') . '), 0) AS soldeMembreCDF')
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
                ->when($codeAgence, function ($query) use ($codeAgence) {
                    $query->where('portefeuilles.CodeAgence', $codeAgence);
                })
                ->orderBy('echeanciers.DateTranch')
                ->get();

            if (count($data) != 0) {
                $sommeQuery = DB::table('echeanciers')
                    ->join('portefeuilles', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                    ->whereBetween('echeanciers.DateTranch', [$date1, $date2])
                    ->where('portefeuilles.CodeMonnaie', 'CDF')
                    ->where('portefeuilles.Cloture', '!=', 1)
                    ->where('portefeuilles.Accorde', 1)
                    ->where('portefeuilles.Octroye', 1)
                    ->when(!empty($request->agent_credit_name), function ($q) use ($request) {
                        $q->where('portefeuilles.Gestionnaire', $request->agent_credit_name);
                    })
                    ->when($codeAgence, function ($q) use ($codeAgence) {
                        $q->where('portefeuilles.CodeAgence', $codeAgence);
                    })
                    ->selectRaw('SUM(echeanciers.CapAmmorti) as sommeCapApayer, SUM(echeanciers.Interet) as sommeInteretApayer');
                $dataSomme = $sommeQuery->first();
                return response()->json(["status" => 1, "data" => $data, "dataSomme" => $dataSomme]);
            } else {
                return response()->json(["status" => 0, "msg" => "Pas de données trouvées"]);
            }
        }
        if ($request->devise == "USD") {
            $data = DB::table('echeanciers')
                ->leftJoin('portefeuilles', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                ->select(
                    'echeanciers.*',
                    'portefeuilles.*',
                    DB::raw('IFNULL((SELECT SUM(transactions.Creditusd) - SUM(transactions.Debitusd) 
                      FROM transactions 
                      WHERE transactions.NumCompte = portefeuilles.NumCompteEpargne AND transactions.extourner != 1
                      ' . ($codeAgence ? "AND transactions.CodeAgence = '{$codeAgence}'" : '') . '), 0) AS soldeMembreUSD')
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
                ->when($codeAgence, function ($query) use ($codeAgence) {
                    $query->where('portefeuilles.CodeAgence', $codeAgence);
                })
                ->orderBy('echeanciers.DateTranch')
                ->get();

            if (count($data) != 0) {
                $sommeQuery = DB::table('echeanciers')
                    ->join('portefeuilles', 'echeanciers.NumDossier', '=', 'portefeuilles.NumDossier')
                    ->whereBetween('echeanciers.DateTranch', [$date1, $date2])
                    ->where('portefeuilles.CodeMonnaie', 'USD')
                    ->where('portefeuilles.Cloture', '!=', 1)
                    ->where('portefeuilles.Accorde', 1)
                    ->where('portefeuilles.Octroye', 1)
                    ->when(!empty($request->agent_credit_name), function ($q) use ($request) {
                        $q->where('portefeuilles.Gestionnaire', $request->agent_credit_name);
                    })
                    ->when($codeAgence, function ($q) use ($codeAgence) {
                        $q->where('portefeuilles.CodeAgence', $codeAgence);
                    })
                    ->selectRaw('SUM(echeanciers.CapAmmorti) as sommeCapApayer, SUM(echeanciers.Interet) as sommeInteretApayer');
                $dataSomme = $sommeQuery->first();
                return response()->json(["status" => 1, "data" => $data, "dataSomme" => $dataSomme]);
            } else {
                return response()->json(["status" => 0, "msg" => "Pas de données trouvées"]);
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

   public function getSommaireCompte(Request $request)
{
    $date1 = $request->date_debut_balance;
    $date2 = $request->date_fin_balance;
    $sousGroupeCompte = $request->sous_groupe_compte;

    // ----- Gestion du filtre agence -----
    $agenceFilter = $request->agence_filter ?? 'current';
    $codeAgence = null;
    $user = auth()->user();

    if ($agenceFilter === 'current') {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
        }
    } elseif ($agenceFilter === 'all') {
        $codeAgence = null;
    } else {
        $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
        }
        $codeAgence = $agence->code_agence;
    }
    // ----- Fin gestion agence -----

    $refSousGroupe = '3300';

    if ($sousGroupeCompte == 3300) {
        $codeMonnaie = 1;
        $debitCol = 'Debitusd';
        $creditCol = 'Creditusd';
    } elseif ($sousGroupeCompte == 3301) {
        $codeMonnaie = 2;
        $debitCol = 'Debitfc';
        $creditCol = 'Creditfc';
    } else {
        return response()->json(["status" => 0, "msg" => "Code invalide. Utilisez 3300 pour USD ou 3301 pour CDF"]);
    }

    // Rapport non converti
    if (isset($request->radioValue) && $request->radioValue == "rapport_non_converti") {
        $getSoldeCompte = DB::table('comptes as c')
            ->leftJoin('transactions as t', 'c.NumCompte', '=', 't.NumCompte')
            ->select(
                'c.NumCompte',
                'c.NomCompte',
                DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date1' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) as soldeDebut"),
                DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) as soldeFin")
            )
            ->where('c.RefSousGroupe', $refSousGroupe)
            ->where('c.CodeMonnaie', $codeMonnaie)
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->whereNotNull('c.NumCompte')
            ->whereNotNull('c.NomCompte')
            ->when($codeAgence, function($q) use ($codeAgence) {
                return $q->where('c.CodeAgence', $codeAgence);
            })
            ->groupBy('c.NumCompte', 'c.NomCompte')
            ->orderBy('c.NomCompte')
            ->when(
                $request->has('critereSolde') && $request->has('critereSoldeAmount'),
                function ($query) use ($request) {
                    $critere = $request->critereSolde;
                    $amount = $request->critereSoldeAmount;
                    switch ($critere) {
                        case '>': return $query->havingRaw('soldeFin > ?', [$amount]);
                        case '>=': return $query->havingRaw('soldeFin >= ?', [$amount]);
                        case '<': return $query->havingRaw('soldeFin < ?', [$amount]);
                        case '<=': return $query->havingRaw('soldeFin <= ?', [$amount]);
                        case '=': return $query->havingRaw('soldeFin = ?', [$amount]);
                        case '<>': return $query->havingRaw('soldeFin <> ?', [$amount]);
                        default: return $query;
                    }
                }
            )
            ->get();

        return response()->json(["status" => 1, "data" => $getSoldeCompte]);
    }

    // Rapport converti en CDF
    if (isset($request->radioValue) && $request->radioValue == "balance_convertie_cdf") {
        $getSoldeCompte = DB::table('comptes as c')
            ->leftJoin('transactions as t', function ($join) use ($date2, $codeAgence) {
                $join->on('c.NumCompte', '=', 't.NumCompte')
                    ->where('t.DateTransaction', '<=', $date2);
                if ($codeAgence) {
                    $join->where('t.CodeAgence', '=', $codeAgence);
                }
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
            ->where('c.RefSousGroupe', $refSousGroupe)
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->whereNotNull('c.NumCompte')
            ->whereNotNull('c.NomCompte')
            ->when($codeAgence, function($q) use ($codeAgence) {
                return $q->where('c.CodeAgence', $codeAgence);
            })
            ->groupBy('c.NumCompte', 'c.NomCompte')
            ->orderBy('c.NomCompte')
            ->when(
                $request->has('critereSolde') && $request->has('critereSoldeAmount'),
                function ($query) use ($request) {
                    $critere = $request->critereSolde;
                    $amount = $request->critereSoldeAmount;
                    switch ($critere) {
                        case '>': return $query->havingRaw('solde_consolide_cdf > ?', [$amount]);
                        case '>=': return $query->havingRaw('solde_consolide_cdf >= ?', [$amount]);
                        case '<': return $query->havingRaw('solde_consolide_cdf < ?', [$amount]);
                        case '<=': return $query->havingRaw('solde_consolide_cdf <= ?', [$amount]);
                        case '=': return $query->havingRaw('solde_consolide_cdf = ?', [$amount]);
                        case '<>': return $query->havingRaw('solde_consolide_cdf <> ?', [$amount]);
                        default: return $query;
                    }
                }
            )
            ->get();

        return response()->json(["status" => 1, "data" => $getSoldeCompte]);
    }

    // Rapport converti en USD
    if (isset($request->radioValue) && $request->radioValue == "balance_convertie_usd") {
        $getSoldeCompte = DB::table('comptes as c')
            ->leftJoin('transactions as t', function ($join) use ($date2, $codeAgence) {
                $join->on('c.NumCompte', '=', 't.NumCompte')
                    ->where('t.DateTransaction', '<=', $date2);
                if ($codeAgence) {
                    $join->where('t.CodeAgence', '=', $codeAgence);
                }
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
            ->where('c.RefSousGroupe', $refSousGroupe)
            ->where('c.niveau', 5)
            ->where('c.est_classe', 0)
            ->whereNotNull('c.NumCompte')
            ->whereNotNull('c.NomCompte')
            ->when($codeAgence, function($q) use ($codeAgence) {
                return $q->where('c.CodeAgence', $codeAgence);
            })
            ->groupBy('c.NumCompte', 'c.NomCompte')
            ->orderBy('c.NomCompte')
            ->when(
                $request->has('critereSolde') && $request->has('critereSoldeAmount'),
                function ($query) use ($request) {
                    $critere = $request->critereSolde;
                    $amount = $request->critereSoldeAmount;
                    switch ($critere) {
                        case '>': return $query->havingRaw('solde_consolide_usd > ?', [$amount]);
                        case '>=': return $query->havingRaw('solde_consolide_usd >= ?', [$amount]);
                        case '<': return $query->havingRaw('solde_consolide_usd < ?', [$amount]);
                        case '<=': return $query->havingRaw('solde_consolide_usd <= ?', [$amount]);
                        case '=': return $query->havingRaw('solde_consolide_usd = ?', [$amount]);
                        case '<>': return $query->havingRaw('solde_consolide_usd <> ?', [$amount]);
                        default: return $query;
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


    // public function getAgentCredit()
    // {
    //     $getAgentCreditNames = DB::select("
    //     SELECT DISTINCT users.id, users.name, users.email
    //     FROM users
    //     INNER JOIN profils_users ON users.id = profils_users.user_id
    //     INNER JOIN profiles ON profils_users.profil_id = profiles.id
    //     WHERE profiles.nom_profile='Agent de crédit'
    // ");

    //     return response()->json([
    //         "get_agent_credit" => $getAgentCreditNames,
    //         "status" => 1
    //     ]);
    // }

    public function getAgentCredit()
{
    $currentAgence = session('current_agence');
    $currentAgenceId = $currentAgence['id'] ?? null;

    if (!$currentAgenceId) {
        return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
    }

    $getAgentCreditNames = User::select('users.id', 'users.name', 'users.email')
        ->join('profils_users', 'users.id', '=', 'profils_users.user_id')
        ->join('profiles', 'profils_users.profil_id', '=', 'profiles.id')
        ->where('profiles.nom_profile', 'Agent de crédit')
        ->whereHas('agences', function ($q) use ($currentAgenceId) {
            $q->where('agences.id', $currentAgenceId);
        })
        ->distinct()
        ->get();

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



    public function getCurrentAgence()
{
    $currentAgence = session('current_agence');
    if (!$currentAgence || !isset($currentAgence['nom_agence'])) {
        return response()->json(['status' => 0, 'msg' => 'Agence non définie']);
    }
    return response()->json(['status' => 1, 'nom_agence' => $currentAgence['nom_agence']]);
}
}
