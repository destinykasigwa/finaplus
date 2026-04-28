<?php 
//To access the values of the data object you provided in PHP, you can simply access them by their keys. Assuming the object is passed to your PHP script as an associative array, you would access its values like this:
 /*$data = [
    'userCheckbox' => false,
    'SuspensTransactions' => false,
    'givenCurrency' => true,
    'GivenJournal' => true
];

$userCheckbox = $data['userCheckbox'];
$SuspensTransactions = $data['SuspensTransactions'];
$givenCurrency = $data['givenCurrency'];
$GivenJournal = $data['GivenJournal'];

echo "userCheckbox: $userCheckbox<br>";
echo "SuspensTransactions: $SuspensTransactions<br>";
echo "givenCurrency: $givenCurrency<br>";
echo "GivenJournal: $GivenJournal<br>";  */

//Note: In PHP, boolean true is converted to the string "1" when echoed and boolean false prints nothing when echoed.





















// public function getSommaireCompte(Request $request)
// {
//     $date2 = $request->date_fin_balance;           // seule date utile
//     $sousGroupeCompte = $request->sous_groupe_compte;

//     // ----- Gestion du filtre agence (inchangée) -----
//     $agenceFilter = $request->agence_filter ?? 'current';
//     $codeAgence = null;
//     $user = auth()->user();

//     if ($agenceFilter === 'current') {
//         $currentAgence = session('current_agence');
//         $codeAgence = $currentAgence['code_agence'] ?? null;
//         if (!$codeAgence) {
//             return response()->json(['status' => 0, 'msg' => 'Aucune agence courante définie']);
//         }
//     } elseif ($agenceFilter === 'all') {
//         $codeAgence = null;
//     } else {
//         $agence = $user->agences()->where('agences.id', $agenceFilter)->first();
//         if (!$agence) {
//             return response()->json(['status' => 0, 'msg' => 'Agence non autorisée']);
//         }
//         $codeAgence = $agence->code_agence;
//     }
//     // ----- Fin gestion agence -----

//     $refSousGroupe = '3300';

//     if ($sousGroupeCompte == 3300) {
//         $codeMonnaie = 1;
//         $debitCol = 'Debitusd';
//         $creditCol = 'Creditusd';
//     } elseif ($sousGroupeCompte == 3301) {
//         $codeMonnaie = 2;
//         $debitCol = 'Debitfc';
//         $creditCol = 'Creditfc';
//     } else {
//         return response()->json(["status" => 0, "msg" => "Code invalide. Utilisez 3300 pour USD ou 3301 pour CDF"]);
//     }

//     // Rapport non converti
//     if (isset($request->radioValue) && $request->radioValue == "rapport_non_converti") {
//         $getSoldeCompte = DB::table('comptes as c')
//             ->leftJoin('transactions as t', 'c.NumCompte', '=', 't.NumCompte')
//             ->select(
//                 'c.NumCompte',
//                 'c.NomCompte',
//                 DB::raw("COALESCE(SUM(CASE WHEN t.DateTransaction <= '$date2' THEN t.$creditCol - t.$debitCol ELSE 0 END), 0) as soldeFin")
//             )
//             ->where('c.RefSousGroupe', $refSousGroupe)
//             ->where('c.CodeMonnaie', $codeMonnaie)
//             ->where('c.niveau', 5)
//             ->where('c.est_classe', 0)
//             ->whereNotNull('c.NumCompte')
//             ->whereNotNull('c.NomCompte')
//             ->when($codeAgence, function($q) use ($codeAgence) {
//                 return $q->where('c.CodeAgence', $codeAgence);
//             })
//             ->groupBy('c.NumCompte', 'c.NomCompte')
//             ->orderBy('c.NomCompte')
//             ->when(
//                 $request->has('critereSolde') && $request->has('critereSoldeAmount'),
//                 function ($query) use ($request) {
//                     $critere = $request->critereSolde;
//                     $amount = $request->critereSoldeAmount;
//                     switch ($critere) {
//                         case '>': return $query->havingRaw('soldeFin > ?', [$amount]);
//                         case '>=': return $query->havingRaw('soldeFin >= ?', [$amount]);
//                         case '<': return $query->havingRaw('soldeFin < ?', [$amount]);
//                         case '<=': return $query->havingRaw('soldeFin <= ?', [$amount]);
//                         case '=': return $query->havingRaw('soldeFin = ?', [$amount]);
//                         case '<>': return $query->havingRaw('soldeFin <> ?', [$amount]);
//                         default: return $query;
//                     }
//                 }
//             )
//             ->get();

//         return response()->json(["status" => 1, "data" => $getSoldeCompte]);
//     }

//     // Rapport converti en CDF
//     if (isset($request->radioValue) && $request->radioValue == "balance_convertie_cdf") {
//         $getSoldeCompte = DB::table('comptes as c')
//             ->leftJoin('transactions as t', function ($join) use ($date2, $codeAgence) {
//                 $join->on('c.NumCompte', '=', 't.NumCompte')
//                     ->where('t.DateTransaction', '<=', $date2);
//                 if ($codeAgence) {
//                     $join->where('t.CodeAgence', '=', $codeAgence);
//                 }
//             })
//             ->select(
//                 'c.NumCompte',
//                 'c.NomCompte',
//                 DB::raw("
//                     COALESCE(SUM(
//                         CASE 
//                             WHEN t.CodeMonnaie = 2 AND t.DateTransaction <= '$date2' 
//                             THEN t.Creditfc - t.Debitfc
//                             WHEN t.CodeMonnaie = 1 AND t.DateTransaction <= '$date2' 
//                             THEN (t.Creditusd - t.Debitusd) * COALESCE(t.Taux, 1)
//                             ELSE 0 
//                         END
//                     ), 0) as solde_consolide_cdf
//                 ")
//             )
//             ->where('c.RefSousGroupe', $refSousGroupe)
//             ->where('c.niveau', 5)
//             ->where('c.est_classe', 0)
//             ->whereNotNull('c.NumCompte')
//             ->whereNotNull('c.NomCompte')
//             ->when($codeAgence, function($q) use ($codeAgence) {
//                 return $q->where('c.CodeAgence', $codeAgence);
//             })
//             ->groupBy('c.NumCompte', 'c.NomCompte')
//             ->orderBy('c.NomCompte')
//             ->when(
//                 $request->has('critereSolde') && $request->has('critereSoldeAmount'),
//                 function ($query) use ($request) {
//                     $critere = $request->critereSolde;
//                     $amount = $request->critereSoldeAmount;
//                     switch ($critere) {
//                         case '>': return $query->havingRaw('solde_consolide_cdf > ?', [$amount]);
//                         case '>=': return $query->havingRaw('solde_consolide_cdf >= ?', [$amount]);
//                         case '<': return $query->havingRaw('solde_consolide_cdf < ?', [$amount]);
//                         case '<=': return $query->havingRaw('solde_consolide_cdf <= ?', [$amount]);
//                         case '=': return $query->havingRaw('solde_consolide_cdf = ?', [$amount]);
//                         case '<>': return $query->havingRaw('solde_consolide_cdf <> ?', [$amount]);
//                         default: return $query;
//                     }
//                 }
//             )
//             ->get();

//         return response()->json(["status" => 1, "data" => $getSoldeCompte]);
//     }

//     // Rapport converti en USD
//     if (isset($request->radioValue) && $request->radioValue == "balance_convertie_usd") {
//         $getSoldeCompte = DB::table('comptes as c')
//             ->leftJoin('transactions as t', function ($join) use ($date2, $codeAgence) {
//                 $join->on('c.NumCompte', '=', 't.NumCompte')
//                     ->where('t.DateTransaction', '<=', $date2);
//                 if ($codeAgence) {
//                     $join->where('t.CodeAgence', '=', $codeAgence);
//                 }
//             })
//             ->select(
//                 'c.NumCompte',
//                 'c.NomCompte',
//                 DB::raw("
//                     COALESCE(SUM(
//                         CASE 
//                             WHEN t.CodeMonnaie = 1 AND t.DateTransaction <= '$date2' 
//                             THEN t.Creditusd - t.Debitusd
//                             WHEN t.CodeMonnaie = 2 AND t.DateTransaction <= '$date2' 
//                             THEN (t.Creditfc - t.Debitfc) / COALESCE(t.Taux, 1)
//                             ELSE 0 
//                         END
//                     ), 0) as solde_consolide_usd
//                 ")
//             )
//             ->where('c.RefSousGroupe', $refSousGroupe)
//             ->where('c.niveau', 5)
//             ->where('c.est_classe', 0)
//             ->whereNotNull('c.NumCompte')
//             ->whereNotNull('c.NomCompte')
//             ->when($codeAgence, function($q) use ($codeAgence) {
//                 return $q->where('c.CodeAgence', $codeAgence);
//             })
//             ->groupBy('c.NumCompte', 'c.NomCompte')
//             ->orderBy('c.NomCompte')
//             ->when(
//                 $request->has('critereSolde') && $request->has('critereSoldeAmount'),
//                 function ($query) use ($request) {
//                     $critere = $request->critereSolde;
//                     $amount = $request->critereSoldeAmount;
//                     switch ($critere) {
//                         case '>': return $query->havingRaw('solde_consolide_usd > ?', [$amount]);
//                         case '>=': return $query->havingRaw('solde_consolide_usd >= ?', [$amount]);
//                         case '<': return $query->havingRaw('solde_consolide_usd < ?', [$amount]);
//                         case '<=': return $query->havingRaw('solde_consolide_usd <= ?', [$amount]);
//                         case '=': return $query->havingRaw('solde_consolide_usd = ?', [$amount]);
//                         case '<>': return $query->havingRaw('solde_consolide_usd <> ?', [$amount]);
//                         default: return $query;
//                     }
//                 }
//             )
//             ->get();

//         return response()->json(["status" => 1, "data" => $getSoldeCompte]);
//     }

//     return response()->json(["status" => 0, "msg" => "Type de rapport non reconnu"]);
}