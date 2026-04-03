<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LockedGarantie extends Model
{
    use HasFactory;
    protected $fillable = [
        "NumCompte",
        "NumAbrege",
        "Montant",
        "Devise",
        "paidState"
    ];
}
