<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeCredit extends Model
{
    use HasFactory;
    protected $fillable = [
        "Reference",
        "type_credit",
        "taux_ordinaire",
        "montant_min",
        "montant_max",
        "compte_interet",
        "compte_etude_dossier",
        "sous_groupe_compte",
        "taux_retard",
        "compte_interet_retard",
        "frais_dossier",
        "commission",
        "compte_commission",
    ];
}
