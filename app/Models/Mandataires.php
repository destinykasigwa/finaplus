<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mandataires extends Model
{
    use HasFactory;
    protected $fillable = [
        'refCompte',
        'mendataireName',
        'lieuNaissM',
        'dateNaissM',
        'etatCivileM',
        'sexeM',
        'typePieceM',
        'professionM',
        'telephoneM',
        'adresseM',
        'observationM',
        'photoM',
        'SignatureM',
        'otherMention',
    ];
}
