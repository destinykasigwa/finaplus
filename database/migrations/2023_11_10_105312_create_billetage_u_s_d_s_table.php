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
        Schema::create('billetage_u_s_d_s', function (Blueprint $table) {
            $table->id();
            $table->string("refOperation", 20)->nullable();
            $table->string("NumCompte", 100)->nullable();
            $table->string("NomMembre", 200)->nullable();
            $table->string("NumAbrege", 50)->nullable();
            $table->string("Beneficiaire", 200)->nullable();
            $table->string("Motif", 255)->nullable();
            $table->string("Devise", 30)->nullable();
            $table->float("centDollars")->nullable()->default('0.00');
            $table->float("cinquanteDollars")->nullable()->default('0.00');
            $table->float("vightDollars")->nullable()->default('0.00');
            $table->float("dixDollars")->nullable()->default('0.00');
            $table->float("cinqDollars")->nullable()->default('0.00');
            $table->float("unDollars")->nullable()->default('0.00');
            $table->float("montantEntre")->nullable()->default('0.00');
            //pour le retrait
            $table->float("centDollarsSortie")->nullable()->default('0.00');
            $table->float("cinquanteDollarsSortie")->nullable()->default('0.00');
            $table->float("vightDollarsSortie")->nullable()->default('0.00');
            $table->float("dixDollarsSortie")->nullable()->default('0.00');
            $table->float("cinqDollarsSortie")->nullable()->default('0.00');
            $table->float("unDollarsSortie")->nullable()->default('0.00');
            $table->float("montantSortie")->nullable()->default('0.00');
            $table->string("NomUtilisateur", 20)->nullable();
            $table->date("DateTransaction")->nullable();
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
        Schema::dropIfExists('billetage_u_s_d_s');
    }
};
