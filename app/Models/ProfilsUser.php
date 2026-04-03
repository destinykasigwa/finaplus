<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilsUser extends Model
{
    use HasFactory;
    protected $fillable = [
        "user_id",
        "profil_id"
    ];
}
