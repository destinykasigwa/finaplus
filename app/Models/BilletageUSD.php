<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BilletageUSD extends Model
{
    use HasFactory;
    protected $fillable = [
        "refOperation",
        "NumCompte",
        "NomMembre",
        "NumAbrege",
        "Beneficiaire",
        "Motif",
        "Devise",
        "centDollars",
        "cinquanteDollars",
        "vightDollars",
        "dixDollars",
        "cinqDollars",
        "unDollars",
        "montantEntre",
        "centDollarsSortie",
        "cinquanteDollarsSortie",
        "vightDollarsSortie",
        "dixDollarsSortie",
        "cinqDollarsSortie",
        "unDollarsSortie",
        "montantSortie",
        "NomUtilisateur",
        "DateTransaction",
        "delested",
        "is_commision"
    ];
}
