<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BilletageAppro_cdf extends Model
{
    use HasFactory;
    protected $fillable = [
        "Reference",
        "NumCompteCaissier",
        "vightMilleFranc",
        "dixMilleFranc",
        "cinqMilleFranc",
        "milleFranc",
        "cinqCentFranc",
        "deuxCentFranc",
        "centFranc",
        "cinquanteFanc",
        "received",
        "NomUtilisateur",
        "NomDemandeur",
        "DateTransaction",
        "montant"
    ];
}
