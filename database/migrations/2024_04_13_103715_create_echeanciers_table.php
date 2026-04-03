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
        Schema::create('echeanciers', function (Blueprint $table) {
            $table->bigInteger("ReferenceEch")->nullable();
            $table->string("RefEcheancier", 20)->nullable();
            $table->string("IdMembreGs", 30)->nullable();
            $table->string("NumDossier", 20)->nullable();
            $table->string("NumMensualite", 20)->nullable();
            $table->string("NbreJour", 20)->nullable();
            $table->float("Capital")->nullable()->default("0.00");
            $table->float("Interet")->nullable()->default("0.00");
            $table->float("CapAmmorti")->nullable()->default("0.00");
            $table->float("TotalAp")->nullable()->default("0.00");
            $table->float("Cumul")->nullable()->default("0.00");
            $table->float("DateTranch")->nullable()->default("0.00");
            $table->date("DateDebut")->nullable();
            $table->float("Sms")->nullable()->default("0");
            $table->float("InteretPrev")->nullable()->default("0.00");
            // $table->float("CumulCapital")->nullable()->default("0.00");
            // $table->float("CumulInteret")->nullable()->default("0.00");
            $table->float("CapitalEffectif")->nullable()->default("0.00");
            $table->float("Reechelonne")->nullable()->default("0");
            $table->float("Epargne")->nullable()->default("0.00");
            $table->float("Penalite")->nullable()->default("0.00");
            $table->integer("statutPeyement")->nullable()->default("0");
            $table->integer("posted")->nullable()->default("0");
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
        Schema::dropIfExists('echeanciers');
    }
};
