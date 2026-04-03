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
        Schema::create('epargne_adhesion_models', function (Blueprint $table) {
            $table->id();
            $table->string("Ecompte_courant", 100)->nullable();
            $table->string("Ecompte_courant_usd", 100)->nullable();
            $table->string("Ecompte_courant_cdf", 100)->nullable();
            $table->string("Edebiteur", 100)->nullable();
            $table->string("Edebiteur_usd", 100)->nullable();
            $table->string("Edebiteur_fc", 100)->nullable();
            $table->string("Etontine_usd", 100)->nullable();
            $table->string("Etontine_fc", 100)->nullable();
            $table->string("D_a_terme", 100)->nullable();
            $table->string("solde_minimum", 100)->nullable();
            $table->string("frais_adhesion", 100)->nullable();
            $table->string("part_social", 100)->nullable();
            $table->string("droit_entree", 100)->nullable();
            $table->string("compte_papeterie", 100)->nullable();
            $table->string("compte_papeterie_fc", 100)->nullable();
            $table->string("compte_papeterie_usd", 100)->nullable();
            $table->string("valeur_droit_entree", 100)->nullable();
            $table->string("valeur_droit_entree_pysique", 100)->nullable();
            $table->string("valeur_droit_entree_moral", 100)->nullable();
            $table->string("valeur_frais_papeterie", 100)->nullable();
            $table->string("groupe_c_virement", 100)->nullable();
            $table->string("groupe_c_fond_non_servi", 100)->nullable();
            $table->string("compte_revenu_virement_usd", 100)->nullable();
            $table->string("compte_revenu_virement_fc", 100)->nullable();
            $table->string("taux_tva_sur_vir", 100)->nullable();
            $table->string("arrondir_frais_vir", 100)->nullable();
            $table->string("Edebiteur_radie_usd", 100)->nullable();
            $table->string("Edebiteur_radie_fc", 100)->nullable();
            $table->string("engagement_sur_eparg_usd", 100)->nullable();
            $table->string("engagement_sur_eparg_fc", 100)->nullable();
            $table->string("rec_sur_epargne_radie_usd", 100)->nullable();
            $table->string("rec_sur_epargne_radie_fc", 100)->nullable();
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
        Schema::dropIfExists('epargne_adhesion_models');
    }
};
