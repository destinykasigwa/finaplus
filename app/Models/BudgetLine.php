<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BudgetLine extends Model
{
    protected $table = 'budget_lines';

    protected $fillable = [
        'fiscal_year_id',
        'account_id',
        'planned_amount',
        'category',
        'created_by',
        'validated_at',
        'status',
    ];

    protected $casts = [
        'planned_amount' => 'decimal:2',
        'validated_at' => 'datetime',
    ];

    // Relations
    public function fiscalYear()
    {
        return $this->belongsTo(FiscalYear::class);
    }

    public function account()
    {
        return $this->belongsTo(Comptes::class, 'account_id', 'RefCompte');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accesseur : montant réalisé
    public function getRealizedAmountAttribute()
    {
        return $this->calculateRealized();
    }

    // Accesseur : écart
    public function getVarianceAttribute()
    {
        return $this->planned_amount - $this->realized_amount;
    }

    /**
     * Calcul du montant réalisé à partir de la table 'transactions'
     */
protected function calculateRealized()
{
    // Charger les relations
    if (!$this->relationLoaded('fiscalYear')) {
        $this->load('fiscalYear');
    }
    if (!$this->relationLoaded('account')) {
        $this->load('account');
    }

    $fiscalYear = $this->fiscalYear;
    $account = $this->account;

    if (!$fiscalYear || !$account) {
        Log::warning('calculateRealized: FiscalYear ou Account manquant', [
            'fiscalYear' => $fiscalYear,
            'account' => $account,
        ]);
        return 0;
    }

    $numCompte = $account->NumCompte;

    // Log des dates de l'exercice
    Log::info('calculateRealized - Dates exercice', [
        'start_date' => $fiscalYear->start_date,
        'end_date' => $fiscalYear->end_date,
    ]);

    // Construction de la requête
    $query = DB::table('transactions')
        ->where('NumCompte', $numCompte)
        ->whereBetween('DateTransaction', [$fiscalYear->start_date, $fiscalYear->end_date]);

    // Log de la requête SQL
    Log::info('calculateRealized - SQL', [
        'sql' => $query->toSql(),
        'bindings' => $query->getBindings(),
    ]);

    // Exécution avec comptage
    $count = $query->count();
    Log::info('calculateRealized - Nombre de transactions trouvées', ['count' => $count]);

    // Récupération des sommes
    $totals = $query->select(
        DB::raw('SUM(Debit) as total_debit'),
        DB::raw('SUM(Credit) as total_credit')
    )->first();

    $debit = (float) ($totals->total_debit ?? 0);
    $credit = (float) ($totals->total_credit ?? 0);

    Log::info('calculateRealized - Résultat', [
        'numCompte' => $numCompte,
        'debit' => $debit,
        'credit' => $credit,
    ]);

    $classe = $account->RefTypeCompte ? substr($account->RefTypeCompte, 0, 1) : '';

    if ($classe == '6') {
        return $debit;
    } elseif ($classe == '7') {
        return $credit;
    } else {
        return $debit - $credit;
    }
}
}