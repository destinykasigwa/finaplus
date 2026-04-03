<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PorteFeuilleConfing extends Model
{
    use HasFactory;
    protected $fillable = [
        "pre_ordinanire",
        "pre_ordinanire_au_dirigent",
        "pre_ordinanire_au_membres",
        "pre_ordinanire_au_agents",
        "pre_en_billet_delabre",
        "pre_en_billet_delabre_aux_dirigent",
        "pre_en_billet_delabre_aux_membres",
        "pre_en_billet_delabre_aux_agents",
        "grpe_compte_pret_r_HB",
        "compte_charge_radiation",
        "compte_a_credite_HB",
        "compte_a_credite_au_bilan",
        "interet_pret_ordin_NE",
        "interet_pret_ordin_echu",
        "interet_pret_en_billet_DL_NE",
        "interet_pret_en_billet_DL_E",
        "pret_ordi_en_retard",
        "un_a_30_jours",
        "trente_et_un_a_60_jours",
        "soixante_et_un_a_90_jours",
        "nonante_et_un_a_90_jours",
        "plus_de_180_jours",
        "p_billet_delabre_retard",
        "un_a_30_jours_del",
        "trente_et_un_a_60_jours_del",
        "soixante_et_un_a_90_jours_del",
        "nonante_et_un_a_180_jours_del",
        "plus_de_180_jours_del",
        "provision_pret_ordinaire",
        "provision_un_a_30_jours",
        "taux_provision_1_30_jours",
        "provision_trente_et_un_a_60_jours",
        "taux_provision_31_60_jours",
        "provision_soixante_et_un_a_90_jours",
        "taux_provision_61_90_jours",
        "provision_nonante_et_un_a_180_jours",
        "taux_provision_91_180_jours",
        "provision_plus_180_jours",
        "taux_provision_plus_180_jours",
        "provision_pret_BD",
        "provision_un_a_30_jours_BD",
        "taux_provision_1_30_jours_BD",
        "provision_trente_et_un_a_60_jours_BD",
        "taux_provision_31_60_jours_BD",
        "provision_soixante_et_un_a_90_jours_BD",
        "taux_provision_61_90_jours_BD",
        "provision_nonante_et_un_a_180_jours_BD",
        "taux_provision_91_180_jours_BD",
        "provision_plus_180_jours_BD",
        "taux_provision_plus_180_jours_BD",
    ];
}
