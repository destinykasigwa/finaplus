<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('batch_paiement_lignes', function (Blueprint $table) {

    $table->id();

    /*
    |--------------------------------------------------------------------------
    | Batch parent
    |--------------------------------------------------------------------------
    */

     $table->integer('transaction_id')->nullable();
     $table->foreign('transaction_id')
      ->references('RefTransaction')
      ->on('transactions');

    $table->foreignId('batch_id')->constrained('batch_paiements')->cascadeOnDelete();
   
    /*
    |--------------------------------------------------------------------------
    | Informations bénéficiaire
    |--------------------------------------------------------------------------
    */

    $table->string('matricule')->nullable();

    $table->string('nom')->nullable();

    // Compte FinaPlus
    $table->string('compte')->nullable();

    // Mobile Money
    $table->string('telephone')->nullable();

    // Banque externe
    $table->string('banque')->nullable();

    /*
    |--------------------------------------------------------------------------
    | Paiement
    |--------------------------------------------------------------------------
    */

    $table->decimal('montant', 15, 2);

    $table->string('reference')->nullable();

    $table->enum('type_paiement', [
        'interne',
        'mobile_money',
        'externe'
    ])->default('interne');

    /*
    |--------------------------------------------------------------------------
    | Statut traitement
    |--------------------------------------------------------------------------
    */

    $table->enum('statut', [
        'en_attente',
        'succes',
        'echec'
    ])->default('en_attente');

    $table->text('message_erreur')->nullable();

    /*
    |--------------------------------------------------------------------------
    | Transaction générée
    |--------------------------------------------------------------------------
    */
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_paiement_lignes');
    }
};
