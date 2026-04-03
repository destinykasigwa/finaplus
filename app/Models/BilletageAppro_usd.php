<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BilletageAppro_usd extends Model
{
    use HasFactory;
    protected $fillable = [
        "Reference",
        "NumCompteCaissier",
        "centDollars",
        "cinquanteDollars",
        "vightDollars",
        "dixDollars",
        "cinqDollars",
        "unDollars",
        "received",
        "NomUtilisateur",
        "DateTransaction",
        "NomDemandeur",
        "montant"
    ];
}
