<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class t_cloture extends Model
{
    use HasFactory;
    protected $fillable = [
        "cloture_state",
        "date_cloture"
    ];
}
