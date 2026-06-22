<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FiscalYear extends Model
{
    protected $fillable = ['year', 'start_date', 'end_date', 'status'];

    public function budgetLines()
    {
        return $this->hasMany(BudgetLine::class);
    }
}