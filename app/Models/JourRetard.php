<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JourRetard extends Model
{
    use HasFactory;
    protected $fillable = [
        "NumcompteEpargne",
        "NumcompteCredit",
        "NumCompteCreanceLitigieuse",
        "CompteProvision",
        "NumDossier",
        "NbrJrRetard",
        "DateRetard",
        "provision1",
        "provision2",
        "provision3",
        "provision4",
        "provision5",
        "repriseProvision",
        "reclassement"
    ];
}
