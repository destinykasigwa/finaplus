<?php

namespace App\Http\Controllers;

use App\Models\FiscalYear;
use App\Models\BudgetLine;
use App\Models\Comptes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }


    public function getBudgetHomePage(){
    return view("eco.pages.budget");
  }

    // ==================== EXERCICES ====================

    /**
     * Récupérer tous les exercices (pour l'agence courante)
     */
    public function getFiscalYears()
    {
        // Optionnel : filtrer par agence si vous stockez l'agence dans fiscal_years
        $fiscalYears = FiscalYear::orderBy('year', 'desc')->get();
        return response()->json(['status' => 1, 'data' => $fiscalYears]);
    }

    /**
     * Créer un nouvel exercice
     */
    public function storeFiscalYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required|integer|min:2000|unique:fiscal_years,year',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $year = $request->year;
        $fiscalYear = FiscalYear::create([
            'year' => $year,
            'start_date' => $year . '-01-01',
            'end_date' => $year . '-12-31',
            'status' => 'open',
        ]);

        return response()->json([
            'status' => 1,
            'data' => $fiscalYear,
            'msg' => 'Exercice créé avec succès'
        ]);
    }

    /**
     * Mettre à jour un exercice (statut, dates)
     */
    public function updateFiscalYear(Request $request, $id)
    {
        $fiscalYear = FiscalYear::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:open,closed,locked',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $fiscalYear->update($request->only(['status', 'start_date', 'end_date']));

        return response()->json([
            'status' => 1,
            'data' => $fiscalYear,
            'msg' => 'Exercice mis à jour'
        ]);
    }

    /**
     * Supprimer un exercice (uniquement s'il n'est pas verrouillé)
     */
    public function deleteFiscalYear($id)
    {
        $fiscalYear = FiscalYear::findOrFail($id);

        if ($fiscalYear->status === 'locked') {
            return response()->json([
                'status' => 0,
                'msg' => 'Impossible de supprimer un exercice verrouillé'
            ]);
        }

        $fiscalYear->budgetLines()->delete();
        $fiscalYear->delete();

        return response()->json([
            'status' => 1,
            'msg' => 'Exercice supprimé avec succès'
        ]);
    }

    // ==================== LIGNES DE BUDGET ====================

    /**
     * Récupérer les lignes de budget pour un exercice donné,
     * avec le réalisé et l'écart calculés.
     */
    public function getBudgetLines($fiscalYearId)
    {
        $fiscalYear = FiscalYear::findOrFail($fiscalYearId);

        $lines = BudgetLine::with(['account'])
            ->where('fiscal_year_id', $fiscalYearId)
            ->get();

        // Ajouter les attributs calculés (realized, variance)
        $lines->each(function ($line) use ($fiscalYear) {
            // On force le calcul via l'accesseur
            $line->realized_amount = $line->realized_amount;
            $line->variance = $line->variance;
        });

        return response()->json(['status' => 1, 'data' => $lines]);
    }

    /**
     * Sauvegarde en masse des lignes de budget (annuel)
     */
    public function bulkStoreBudgetLines(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lines' => 'required|array',
            'lines.*.fiscal_year_id' => 'required|exists:fiscal_years,id',
            'lines.*.account_id' => 'required|exists:comptes,RefCompte',
            'lines.*.planned_amount' => 'required|numeric|min:0',
            'lines.*.category' => 'required|in:operating,investment,treasury',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $lines = $request->lines;
        if (empty($lines)) {
            return response()->json(['status' => 0, 'msg' => 'Aucune ligne à enregistrer']);
        }

        // Vérifier que l'exercice existe et n'est pas verrouillé
        $fiscalYearId = $lines[0]['fiscal_year_id'];
        $fiscalYear = FiscalYear::findOrFail($fiscalYearId);
        if ($fiscalYear->status === 'locked') {
            return response()->json([
                'status' => 0,
                'msg' => 'Cet exercice est verrouillé, modification impossible'
            ]);
        }

        DB::beginTransaction();
        try {
            foreach ($lines as $lineData) {
                BudgetLine::updateOrCreate(
                    [
                        'fiscal_year_id' => $lineData['fiscal_year_id'],
                        'account_id' => $lineData['account_id'],
                    ],
                    [
                        'planned_amount' => $lineData['planned_amount'],
                        'category' => $lineData['category'],
                        'created_by' => Auth::id(),
                        'status' => 'draft',
                    ]
                );
            }
            DB::commit();

            return response()->json([
                'status' => 1,
                'msg' => 'Budget enregistré avec succès'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur bulkStoreBudgetLines: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'msg' => 'Erreur lors de l\'enregistrement: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Supprimer une ligne de budget
     */
    public function deleteBudgetLine($id)
    {
        $line = BudgetLine::findOrFail($id);

        $fiscalYear = FiscalYear::findOrFail($line->fiscal_year_id);
        if ($fiscalYear->status === 'locked') {
            return response()->json([
                'status' => 0,
                'msg' => 'Exercice verrouillé, suppression impossible'
            ]);
        }

        $line->delete();

        return response()->json([
            'status' => 1,
            'msg' => 'Ligne de budget supprimée'
        ]);
    }

    // ==================== VALIDATION DU BUDGET ====================

    /**
     * Valider le budget d'un exercice (verrouillage)
     */
    public function validateBudget($fiscalYearId)
    {
        $fiscalYear = FiscalYear::findOrFail($fiscalYearId);

        if ($fiscalYear->status !== 'open') {
            return response()->json([
                'status' => 0,
                'msg' => 'Cet exercice n\'est pas ouvert ou déjà verrouillé'
            ]);
        }

        // Vérifier qu'il y a au moins une ligne de budget
        $count = BudgetLine::where('fiscal_year_id', $fiscalYearId)->count();
        if ($count === 0) {
            return response()->json([
                'status' => 0,
                'msg' => 'Impossible de valider un budget vide'
            ]);
        }

        DB::beginTransaction();
        try {
            $fiscalYear->status = 'locked';
            $fiscalYear->save();

            BudgetLine::where('fiscal_year_id', $fiscalYearId)
                ->update([
                    'status' => 'validated',
                    'validated_at' => now(),
                ]);

            DB::commit();

            return response()->json([
                'status' => 1,
                'msg' => 'Budget validé avec succès'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur validateBudget: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'msg' => 'Erreur lors de la validation: ' . $e->getMessage()
            ]);
        }
    }

    // ==================== COMPTES (FILTRÉS PAR AGENCE) ====================

    /**
     * Récupérer les comptes par classes (RefTypeCompte) et par agence courante
     */
    public function getAccountsByClasses(Request $request)
{
    $classes = $request->classes ? explode(',', $request->classes) : ['2','3','5','6','7'];

    $currentAgence = session('current_agence');
    $codeAgence = $currentAgence['code_agence'] ?? null;
    if (!$codeAgence) {
        return response()->json(['status' => 0, 'msg' => 'Aucune agence de travail sélectionnée.']);
    }

    $accounts = Comptes::whereIn('RefTypeCompte', $classes)
        ->where('niveau', 5)
        ->where('CodeAgence', $codeAgence)
        ->where('CodeMonnaie', 1)  // ← filtre sur les comptes en USD
        ->orderBy('NumCompte')
        ->get(['RefCompte', 'NumCompte', 'NomCompte', 'RefTypeCompte']);

    return response()->json(['status' => 1, 'data' => $accounts]);
}
}