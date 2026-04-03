<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Echeancier extends Model
{
    use HasFactory;
    protected $fillable = [
        "RefEcheancier",
        "IdMembreGs",
        "NumDossier",
        "NumMensualite",
        "NbreJour",
        "Capital",
        "Interet",
        "CapAmmorti",
        "TotalAp",
        // "SoldeCapital",
        // "SoldeInteret",
        "Cumul",
        "DateTranch",
        "DateDebut",
        "Sms",
        "InteretPrev",
        // "CumulCapital",
        // "CumulInteret",
        "CapitalEffectif",
        "Reechelonne",
        "Epargne",
        "Penalite",
        "statutPeyement",
        "posted"
    ];
}
