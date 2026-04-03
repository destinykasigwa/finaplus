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
        Schema::create('adhesion_membres', function (Blueprint $table) {
            $table->id();
            $table->string("num_compte", 100)->nullable();
            $table->string("compte_abrege", 100)->nullable();
            $table->string("agence", 100)->nullable();
            $table->string("code_agence", 100)->nullable();
            $table->string("code_monnaie", 100)->nullable();
            $table->string("type_epargne", 100)->nullable();
            $table->string("type_client", 100)->nullable();
            $table->string("intitule_compte", 100)->nullable();
            $table->string("lieu_naissance", 100)->nullable();
            $table->string("date_naissance", 100)->nullable();
            $table->string("etat_civile", 100)->nullable();
            $table->string("nom_condjoint", 100)->nullable();
            $table->string("nom_pere", 100)->nullable();
            $table->string("nom_mere", 100)->nullable();
            $table->string("profession", 100)->nullable();
            $table->string("lieu_travail", 100)->nullable();
            $table->string("civilite", 100)->nullable();
            $table->string("sexe", 100)->nullable();
            $table->string("email", 100)->nullable();
            $table->string("telephone", 100)->nullable();
            $table->string("type_piece", 100)->nullable();
            $table->string("num_piece", 100)->nullable();
            $table->string("lieu_devivraison_piece", 100)->nullable();
            $table->string("province", 100)->nullable();
            $table->string("territoire_ou_ville", 100)->nullable();
            $table->string("commune", 100)->nullable();
            $table->string("quartier", 100)->nullable();
            $table->string("type_de_gestion", 100)->nullable();
            $table->string("critere", 100)->nullable();
            $table->string("signature_image_file", 200)->nullable();
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
        Schema::dropIfExists('adhesion_membres');
    }
};
