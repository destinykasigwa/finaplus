<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClosedDay extends Model
{
    use HasFactory;
    protected $fillable = [
        "closed",
        "DateSysteme"
    ];
}
