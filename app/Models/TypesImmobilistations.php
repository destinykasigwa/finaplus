<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypesImmobilistations extends Model
{
    use HasFactory;

protected $table = 'types_immobilisations';
protected $fillable = ['nom_type', 'duree_amortissement', 'taux_amortissement', 'methode_amortissement'];
}
