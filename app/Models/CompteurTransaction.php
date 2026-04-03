<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompteurTransaction extends Model
{
    use HasFactory;
    protected $fillable = [
        'fakevalue',
    ];
}
