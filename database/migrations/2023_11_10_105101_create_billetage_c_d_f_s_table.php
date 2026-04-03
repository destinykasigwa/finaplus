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
        Schema::create('billetage_c_d_f_s', function (Blueprint $table) {
            $table->id();
            $table->string("refOperation", 20)->nullable();
            $table->string("NumCompte", 100)->nullable();
            $table->string("NomMembre", 200)->nullable();
            $table->string("NumAbrege", 50)->nullable();
            $table->string("Beneficiaire", 200)->nullable();
            $table->string("Motif", 255)->nullable();
            $table->string("Devise", 30)->nullable();
            $table->float("vightMilleFranc")->nullable()->default('0.00');
            $table->float("dixMilleFranc")->nullable()->default('0.00');
            $table->float("cinqMilleFranc")->nullable()->default('0.00');
            $table->float("milleFranc")->nullable()->default('0.00');
            $table->float("cinqCentFranc")->nullable()->default('0.00');
            $table->float("deuxCentFranc")->nullable()->default('0.00');
            $table->float("centFranc")->nullable()->default('0.00');
            $table->float("cinquanteFanc")->nullable()->default('0.00');
            $table->float("montantEntre")->nullable()->default('0.00');
            //pour le retrait
            $table->float("vightMilleFrancSortie")->nullable()->default('0.00');
            $table->float("dixMilleFrancSortie")->nullable()->default('0.00');
            $table->float("cinqMilleFrancSortie")->nullable()->default('0.00');
            $table->float("milleFrancSortie")->nullable()->default('0.00');
            $table->float("cinqCentFrancSortie")->nullable()->default('0.00');
            $table->float("deuxCentFrancSortie")->nullable()->default('0.00');
            $table->float("centFrancSortie")->nullable()->default('0.00');
            $table->float("cinquanteFancSortie")->nullable()->default('0.00');
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
        Schema::dropIfExists('billetage_c_d_f_s');
    }
};
