<?php

namespace App\Http\Controllers;

use App\Models\Comptes;
use Barryvdh\DomPDF\Facade\Pdf; // Utilisation de la façade Pdf
use Illuminate\Http\Request;


class PDFExportController extends Controller
{
    public function exportSommairePDF(Request $request)
    {
        $fetchData = $request->input('fetchData');
        $date_debut_balance = $request->input('date_debut_balance');
        $date_fin_balance = $request->input('date_fin_balance');

        // Charger une vue et passer les données à la vue
        $pdf = PDF::loadView('reports.sommaire-compte', compact('fetchData', 'date_debut_balance', 'date_fin_balance'));
        // Télécharger le PDF
        return $pdf->download('sommaire_de_compte.pdf');
    }
}
