<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EpargneAdhesionModel extends Model
{
    use HasFactory;
    protected $fillable = [
        "Ecompte_courant",
        "Ecompte_courant_usd",
        "Ecompte_courant_cdf",
        "Edebiteur",
        "Edebiteur_usd",
        "Edebiteur_fc",
        "Etontine_usd",
        "Etontine_fc",
        "D_a_terme",
        "solde_minimum",
        "frais_adhesion",
        "part_social",
        "droit_entree",
        "compte_papeterie",
        "compte_papeterie_fc",
        "compte_papeterie_usd",
        "valeur_droit_entree",
        "valeur_droit_entree_pysique",
        "valeur_droit_entree_moral",
        "valeur_frais_papeterie",
        "groupe_c_virement",
        "groupe_c_fond_non_servi",
        "compte_revenu_virement_usd",
        "compte_revenu_virement_fc",
        "taux_tva_sur_vir",
        "arrondir_frais_vir",
        "Edebiteur_radie_usd",
        "Edebiteur_radie_fc",
        "engagement_sur_eparg_usd",
        "engagement_sur_eparg_fc",
        "rec_sur_epargne_radie_usd",
        "rec_sur_epargne_radie_fc",
        "show_commission_pannel"
    ];
}
