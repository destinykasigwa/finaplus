<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'locked_state',
        'start_date',
        'expirate_date',
        'attempt_times',
        'expirate_password',
        'admin',
        'reseted_password'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function profiles()
    {
        return $this->belongsToMany(Profile::class, 'profils_users', 'user_id', 'profil_id');
    }


 public function agences()
{
    return $this->belongsToMany(Agences::class, 'user_agences', 'user_id', 'agence_id')
                ->withPivot('id')
                ->withTimestamps();
}


public function currentAgence()
{
    return $this->belongsTo(Agences::class, 'current_agence_id');
}
}
