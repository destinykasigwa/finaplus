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
         "compte_liaison_usd"
    ];



    public function users()
{
    return $this->belongsToMany(User::class, 'user_agences');
}
}
