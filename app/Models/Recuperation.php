<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recuperation extends Model
{
    use HasFactory;
    protected $fillable = [
        "email",
        "random_int",
    ];
}
