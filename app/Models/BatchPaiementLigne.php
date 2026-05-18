<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchPaiementLigne extends Model
{
    use HasFactory;

    protected $table = 'batch_paiement_lignes';

    protected $fillable = [
        'batch_id',
        'transaction_id',
        'matricule',
        'nom',
        'compte',
        'telephone',
        'banque',
        'montant',
        'reference',
        'type_paiement',
        'statut',
        'message_erreur',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'transaction_id' => 'integer',
    ];

    public function batch()
{
    return $this->belongsTo(BatchPaiement::class, 'batch_id');
}

    // Relation avec la transaction générée (dans table transactions)
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transactions::class, 'transaction_id', 'RefTransaction');
    }
}
