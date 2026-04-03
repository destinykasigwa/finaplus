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
        Schema::create('remboursementcredits', function (Blueprint $table) {
            $table->id();
            $table->integer("RefEcheance")->nullable();
            $table->string("NumCompte", 30)->nullable();
            $table->string("NumCompteCredit", 30)->nullable();
            $table->string("NumDossie", 30)->nullable();
            $table->string("RefTypCredit", 30)->nullable();
            $table->string("NomCompte", 30)->nullable();
            $table->string("NumMensualite", 30)->nullable();
            $table->string("DateTranche", 30)->nullable();
            $table->string("DateRetard", 30)->nullable();
            $table->string("JoursRetard", 30)->nullable();
            $table->float("InteretAmmorti")->nullable()->default("0.00");
            $table->float("InteretPaye")->nullable()->default("0.00");
            $table->float("InteretS")->nullable()->default("0.00");
            $table->float("CapitalAmmortie")->nullable()->default("0.00");
            $table->float("CapitalPaye")->nullable()->default("0.00");
            $table->float("CapitalS")->nullable()->default("0.00");
            $table->float("EpargneAmmorti")->nullable()->default("0.00");
            $table->float("EpargnePaye")->nullable()->default("0.00");
            $table->float("EpargneS")->nullable()->default("0.00");
            $table->float("CodeGuichet")->nullable()->default("0.00");
            $table->float("NumAdherent")->nullable()->default("0.00");
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
        Schema::dropIfExists('remboursementcredits');
    }
};
