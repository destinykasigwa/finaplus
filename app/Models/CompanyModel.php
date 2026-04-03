<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyModel extends Model
{
    use HasFactory;
    protected $fillable = [
        "sigle",
        "denomination",
        "adresse",
        "forme",
        "ville",
        "departement",
        "pays",
        "tel",
        "email",
        "idnat",
        "nrc",
        "num_impot",
        "date_system",
        "company_logo"
    ];
}
