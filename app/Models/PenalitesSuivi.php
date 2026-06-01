<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenalitesSuivi extends Model
{
    use HasFactory;
     protected $table = 'penalites_suivi';

    protected $fillable = [
        'NumDossier',
        'DateDernierCalcul',
        'TotalPenalites'
    ];

    protected $casts = [
        'DateDernierCalcul' => 'date',
        'TotalPenalites' => 'decimal:2'
    ];

    /**
     * Relation avec le portefeuille (crédit)
     */
    public function portefeuille()
    {
        return $this->belongsTo(Portefeuille::class, 'NumDossier', 'NumDossier');
    }
}
