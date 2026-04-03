<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdhesionMembre extends Model
{
    use HasFactory;
    protected $fillable = [
        "compte_abrege",
        "num_compte",
        "agence",
        "code_agence",
        "code_monnaie",
        "type_epargne",
        "type_client",
        "intitule_compte",
        "lieu_naissance",
        "date_naissance",
        "etat_civile",
        "nom_condjoint",
        "nom_pere",
        "nom_mere",
        "profession",
        "lieu_travail",
        "civilite",
        "sexe",
        "email",
        "telephone",
        "type_piece",
        "num_piece",
        "lieu_devivraison_piece",
        "province",
        "territoire_ou_ville",
        "commune",
        "quartier",
        "type_de_gestion",
        "critere",
        "signature_image_file"
    ];
}
