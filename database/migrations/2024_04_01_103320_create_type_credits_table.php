<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('type_credits', function (Blueprint $table) {
            $table->id();
            $table->string("Reference", 50)->nullable();
            $table->string("type_credit", 200)->nullable();
            $table->float("taux_ordinaire")->nullable()->default("0.00");
            $table->float("montant_min")->nullable()->default("0.00");
            $table->float("montant_max")->nullable()->default("0.00");
            $table->string("compte_interet", 100)->nullable();
            $table->string("compte_etude_dossier", 100)->nullable();
            $table->string("sous_groupe_compte", 100)->nullable();
            $table->float("taux_retard")->nullable()->default("0.00");
            $table->string("compte_interet_retard", 100)->nullable();
            $table->float("frais_dossier")->nullable()->default("0.00");
            $table->float("commission")->nullable()->default("0.00");
            $table->string("compte_commission", 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('type_credits');
    }
};
