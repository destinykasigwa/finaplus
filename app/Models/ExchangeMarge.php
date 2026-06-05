<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeMarge extends Model
{
    protected $table = 'exchange_marges';

    protected $fillable = [
        'devise_source',
        'devise_target',
        'marge',
        'type_marge',
        'created_by',
    ];

    protected $casts = [
        'marge' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Récupère la marge pour une paire de devises
     */
    public static function getMarge($source, $target)
    {
        $marge = self::where('devise_source', $source)
            ->where('devise_target', $target)
            ->first();
        
        return $marge ? $marge->marge : 0;
    }
}