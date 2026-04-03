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
        Schema::create('porte_feuille_confings', function (Blueprint $table) {
            $table->id();
            $table->string("pre_ordinanire", 100)->nullable();
            $table->string("pre_ordinanire_au_dirigent", 100)->nullable();
            $table->string("pre_ordinanire_au_membres", 100)->nullable();
            $table->string("pre_ordinanire_au_agents", 100)->nullable();
            $table->string("pre_en_billet_delabre", 100)->nullable();
            $table->string("pre_en_billet_delabre_aux_dirigent", 100)->nullable();
            $table->string("pre_en_billet_delabre_aux_membres", 100)->nullable();
            $table->string("pre_en_billet_delabre_aux_agents", 100)->nullable();
            $table->string("grpe_compte_pret_r_HB", 100)->nullable();
            $table->string("compte_charge_radiation", 100)->nullable();
            $table->string("compte_a_credite_HB", 100)->nullable();
            $table->string("compte_a_credite_au_bilan", 100)->nullable();
            $table->string("interet_pret_ordin_NE", 100)->nullable();
            $table->string("interet_pret_ordin_echu", 100)->nullable();
            $table->string("interet_pret_en_billet_DL_NE", 100)->nullable();
            $table->string("interet_pret_en_billet_DL_E", 100)->nullable();
            $table->string("pret_ordi_en_retard", 100)->nullable();
            $table->string("un_a_30_jours", 100)->nullable();
            $table->string("trente_et_un_a_60_jours", 100)->nullable();
            $table->string("soixante_et_un_a_90_jours", 100)->nullable();
            $table->string("nonante_et_un_a_90_jours", 100)->nullable();
            $table->string("plus_de_180_jours", 100)->nullable();
            $table->string("p_billet_delabre_retard", 100)->nullable();
            $table->string("un_a_30_jours_del", 100)->nullable();
            $table->string("trente_et_un_a_60_jours_del", 100)->nullable();
            $table->string("soixante_et_un_a_90_jours_del", 100)->nullable();
            $table->string("nonante_et_un_a_180_jours_del", 100)->nullable();
            $table->string("plus_de_180_jours_del", 100)->nullable();
            $table->string("provision_pret_ordinaire", 100)->nullable();
            $table->string("provision_un_a_30_jours", 100)->nullable();
            $table->string("taux_provision_1_30_jours", 100)->nullable();
            $table->string("provision_trente_et_un_a_60_jours", 100)->nullable();
            $table->string("taux_provision_31_60_jours", 100)->nullable();
            $table->string("provision_soixante_et_un_a_90_jours", 100)->nullable();
            $table->string("taux_provision_61_90_jours", 100)->nullable();
            $table->string("provision_nonante_et_un_a_180_jours", 100)->nullable();
            $table->string("taux_provision_91_180_jours", 100)->nullable();
            $table->string("provision_plus_180_jours", 100)->nullable();
            $table->string("taux_provision_plus_180_jours", 100)->nullable();
            $table->string("provision_pret_BD", 100)->nullable();
            $table->string("provision_un_a_30_jours_BD", 100)->nullable();
            $table->string("taux_provision_1_30_jours_BD", 100)->nullable();
            $table->string("provision_trente_et_un_a_60_jours_BD", 100)->nullable();
            $table->string("taux_provision_31_60_jours_BD", 100)->nullable();
            $table->string("provision_soixante_et_un_a_90_jours_BD", 100)->nullable();
            $table->string("taux_provision_61_90_jours_BD", 100)->nullable();
            $table->string("provision_nonante_et_un_a_180_jours_BD", 100)->nullable();
            $table->string("taux_provision_91_180_jours_BD", 100)->nullable();
            $table->string("provision_plus_180_jours_BD", 100)->nullable();
            $table->string("taux_provision_plus_180_jours_BD", 100)->nullable();
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
        Schema::dropIfExists('porte_feuille_confings');
    }
};
