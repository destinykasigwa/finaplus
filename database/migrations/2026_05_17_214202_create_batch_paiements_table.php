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
    Schema::create('batch_paiements', function (Blueprint $table) {

    $table->id();

    $table->string('reference')->unique();

    /*
    |--------------------------------------------------------------------------
    | Compte principal débité
    |--------------------------------------------------------------------------
    */
 $table->bigInteger('compte_id');

$table->foreign('compte_id')
      ->references('RefCompte')
      ->on('comptes');

    $table->decimal('total_montant', 15, 2);

    $table->integer('total_lignes');

    $table->enum('statut', [
        'brouillon',
        'en_attente',
        'valide',
        'rejete',
        'en_cours',
        'termine',
        'partiel',
        'annule'
    ])->default('brouillon');

    $table->foreignId('cree_par')
          ->constrained('users');

    $table->foreignId('valide_par')
          ->nullable()
          ->constrained('users');

    $table->foreignId('execute_par')
          ->nullable()
          ->constrained('users');

    $table->string('fichier_original')->nullable();

    $table->string('hash_fichier')->unique();

    $table->timestamp('date_execution')->nullable();

    $table->text('observations')->nullable();

    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_paiements');
    }
};
