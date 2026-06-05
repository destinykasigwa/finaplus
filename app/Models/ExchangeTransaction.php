<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeTransaction extends Model
{
    protected $fillable = [
        'reference', 'client_id', 'source_account', 'target_account',
        'source_currency', 'target_currency', 'amount_source', 'amount_target',
        'applied_rate', 'reference_rate', 'gain_loss', 'motif', 'status',
        'created_by', 'cancelled_by', 'cancellation_reason', 'cancellation_transaction_id'
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sourceCompte()
    {
        return $this->belongsTo(Comptes::class, 'source_account', 'NumCompte');
    }

    public function targetCompte()
    {
        return $this->belongsTo(Comptes::class, 'target_account', 'NumCompte');
    }

    public function cancellation()
    {
        return $this->belongsTo(self::class, 'cancellation_transaction_id', 'reference');
    }
}