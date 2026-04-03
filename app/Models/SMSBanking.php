<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SMSBanking extends Model
{
    use HasFactory;
    protected $fillable = [
        "NumCompte",
        "NomCompte",
        "Civilite",
        "Email",
        "Telephone",
        "DateActivation",
        "DateDesActivation",
        "NumAbrege",
        "ActivatedSMS",
        "ActivatedEmail"
    ];
}
