<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TauxEtDateSystem extends Model
{
    use HasFactory;
    protected $fillable = [
        "DateSystem",
        "TauxEnDollar",
        "TauxEnFc"
    ];
}
