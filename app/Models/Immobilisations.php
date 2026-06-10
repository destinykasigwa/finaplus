<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Immobilisations extends Model
{
    use HasFactory;
    // protected $table = 'immobilisations';
    protected $fillable = [
        'code_immo',
        'nom_immo',
        'date_acquisition',
        'valeur_acquisition',
        'type_immo',
        'duree_amortissement_ans',
        'methode_amortissement',
        'valeur_residuelle',
        'taux_amortissement',
        'compte_comptable_immo',
        'compte_comptable_amortissement',
        'amortissement_cumule',
        'valeur_nette_comptable',
        'code_agence',
        'service_affectation',
         'dernier_amortissement_mois', // ou 'date_dernier_amortissement'
    ];

    // Relation avec le type d'immobilisation
    public function type()
    {
        return $this->belongsTo(TypesImmobilistations::class, 'type_immo');
    }

    // Relation avec l'agence
    public function agence()
    {
        return $this->belongsTo(Agences::class, 'code_agence', 'code_agence');
    }
}
