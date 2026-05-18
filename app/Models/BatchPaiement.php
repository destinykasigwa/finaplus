<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BatchPaiement extends Model
{
    use HasFactory;

    protected $table = 'batch_paiements';

    protected $fillable = [
        'reference',
        'compte_id',
        'total_montant',
        'total_lignes',
        'statut',
        'cree_par',
        'valide_par',
        'execute_par',
        'fichier_original',
        'hash_fichier',
        'date_execution',
        'observations',
    ];

    protected $casts = [
        'total_montant' => 'decimal:2',
        'total_lignes' => 'integer',
        'date_execution' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relation avec le compte débité (comptes)
    public function compteDebite(): BelongsTo
    {
        return $this->belongsTo(Comptes::class, 'compte_id', 'RefCompte');
    }

    // Relation avec l'utilisateur créateur
    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    // Relation avec l'utilisateur validateur
    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    // Relation avec l'utilisateur exécuteur
    public function executeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'execute_par');
    }

    // Détails du batch (lignes)
    public function lignes()
{
    return $this->hasMany(BatchPaiementLigne::class, 'batch_id');
}

public function compte()
{
    return $this->belongsTo(Comptes::class, 'compte_id', 'RefCompte');
}
}