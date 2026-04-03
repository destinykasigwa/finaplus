<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Positionnements extends Model
{
    use HasFactory;
    protected $fillable = [
        "Reference",
        "NumCompte",
        "NomCompte",
        "Montant",
        "CodeMonnaie",
        "CodeAgence",
        "CodeGuichet",
        "DateTransaction",
        "DateTransaction",
        "Document",
        "NumDocument",
        "Retirant",
        "Concerne",
        "Adresse",
        "NumTel",
        "TypePieceIdentity",
        "NumPieceIdentity",
        "Proprietaire",
        "Mandataire",
        "NomUtilisateur",
        "Autorisateur",
        "RefCompte",
        "Servie"
    ];
}
