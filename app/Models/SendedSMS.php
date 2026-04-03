<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SendedSMS extends Model
{
    use HasFactory;
    protected $fillable = [
        "numPhone",
        "messageStatus",
        "paidStatus",
        "dateEnvoie",
    ];
}
