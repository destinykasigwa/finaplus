<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remboursementcredit extends Model
{
    use HasFactory;
    protected $fillable = [
        "RefEcheance",
        "NumCompte",
        "NumCompteCredit",
        "NumDossie",
        "RefTypCredit",
        "NomCompte",
        "DateTranche",
        "DateRetard",
        "JoursRetard",
        "InteretAmmorti",
        "InteretPaye",
        "InteretS",
        "CapitalAmmortie",
        "CapitalPaye",
        "CapitalS",
        "EpargneAmmorti",
        "EpargnePaye",
        "EpargneS",
        "CodeGuichet",
        "NumAdherent",
    ];
}
