<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
    {
        // Supprimer la clé étrangère si elle existe
        Schema::table('batch_paiement_lignes', function (Blueprint $table) {
            $table->dropForeign(['transaction_id']);
        });

        // Modifier la colonne en string (NULL autorisé)
        Schema::table('batch_paiement_lignes', function (Blueprint $table) {
            $table->string('transaction_id', 50)->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('batch_paiement_lignes', function (Blueprint $table) {
            $table->unsignedBigInteger('transaction_id')->nullable()->change();
        });
    }
};
