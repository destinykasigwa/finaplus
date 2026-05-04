<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agences extends Model
{
    use HasFactory;
    protected $fillable = [
         "codeAgence",
         "NomAgence",
         "compte_liaison_cdf",
         "compte_liaison_usd",
         "last_ref_compte",
         "last_ref_num_visa",
         "last_ref_numdossier",
         "compte_virement_caisse_cdf",
          "compte_virement_caisse_usd",
         "compte_caisse_usd",
         "compte_caisse_cdf"

    ];



    public function users()
{
    return $this->belongsToMany(User::class, 'user_agences');
}
}
