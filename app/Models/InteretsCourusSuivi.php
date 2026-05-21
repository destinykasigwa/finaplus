<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteretsCourusSuivi extends Model
{
      use HasFactory;

    protected $table = 'interets_courus_suivi';

    protected $fillable = [
        'NumDossier',
        'DateDernierCalcul',
        'CapitalRestant',
        'InteretCouruNonPaye',
    ];

    protected $casts = [
        'DateDernierCalcul' => 'date',
        'CapitalRestant' => 'decimal:2',
        'InteretCouruNonPaye' => 'decimal:2',
    ];

    /**
     * Relation avec le portefeuille (crédit)
     */
    public function portefeuille()
    {
        return $this->belongsTo(Portefeuille::class, 'NumDossier', 'NumDossier');
    }
}
