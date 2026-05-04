<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delestages extends Model
{
    use HasFactory;
    protected $fillable = [
        "Reference",
        "code_agence",
        "NumCompteCaissier",
        "vightMilleFranc",
        "dixMilleFranc",
        "cinqMilleFranc",
        "milleFranc",
        "cinqCentFranc",
        "deuxCentFranc",
        "centFranc",
        "cinquanteFanc",
        "montantCDF",
        "centDollars",
        "cinquanteDollars",
        "vightDollars",
        "dixDollars",
        "cinqDollars",
        "unDollars",
        "montantUSD",
        "received",
        "NomUtilisateur",
        "NomDemandeur",
        "DateTransaction",
        "CodeMonnaie",

    ];
}
