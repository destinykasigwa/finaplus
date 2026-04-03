<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpirateDateConfig extends Model
{
    use HasFactory;
    protected $fillable = [
        "password_expired_days",
        "login_attempt"
    ];
}
