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
        Schema::create('immobilisations', function (Blueprint $table) {
            $table->id();
            $table->string('code_immo')->unique();
            $table->string('nom_immo');
            $table->date('date_acquisition');
            $table->decimal('valeur_acquisition', 15, 2);
            $table->integer('duree_amortissement_ans');
            $table->enum('methode_amortissement', ['lineaire', 'degresif'])->default('lineaire');
            $table->decimal('taux_amortissement', 5, 2);
            $table->decimal('valeur_residuelle', 15, 2)->default(0);
            $table->string('compte_comptable_immo');
            $table->string('compte_comptable_amortissement');
            $table->decimal('amortissement_cumule', 15, 2)->default(0);
            $table->decimal('valeur_nette_comptable', 15, 2);
            $table->string('code_agence');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('immobilisations');
    }
};
