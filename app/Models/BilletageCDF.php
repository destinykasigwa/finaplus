<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BilletageCDF extends Model
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
        "vightMilleFranc",
        "dixMilleFranc",
        "cinqMilleFranc",
        "milleFranc",
        "cinqCentFranc",
        "deuxCentFranc",
        "centFranc",
        "cinquanteFanc",
        "montantEntre",
        "vightMilleFrancSortie",
        "dixMilleFrancSortie",
        "cinqMilleFrancSortie",
        "milleFrancSortie",
        "cinqCentFrancSortie",
        "deuxCentFrancSortie",
        "centFrancSortie",
        "cinquanteFancSortie",
        "montantSortie",
        "NomUtilisateur",
        "DateTransaction",
        "delested",
        "is_commision"
    ];
}
