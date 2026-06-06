<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class ExchangeRate extends Model
{
    protected $table = 'exchange_rates';

    protected $fillable = [
        'source_currency',
        'target_currency',
        'rate',
        'valid_from',
        'valid_to',
        'created_by',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    public static function getCurrentRate($source, $target)
    {
        // $query = self::where('source_currency', $source)
        //     ->where('target_currency', $target)
        //     ->whereDate('valid_from', '<=', now())
        //     ->where(function ($q) {
        //         $q->whereNull('valid_to')->orWhereDate('valid_to', '>=', now());
        //     })
        //     ->orderBy('valid_from', 'desc');
        
        // Log::info("SQL getCurrentRate: " . $query->toSql());
        // Log::info("Bindings: " . json_encode($query->getBindings()));
        
        // $result = $query->first();
        // Log::info("Résultat: " . ($result ? $result->rate : 'null'));
        
        // return $result;
         return self::where('source_currency', $source)
        ->where('target_currency', $target)
        ->orderBy('created_at', 'desc')   // le dernier inséré
        ->first();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}