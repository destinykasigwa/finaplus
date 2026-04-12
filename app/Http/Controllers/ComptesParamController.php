<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Validator};
use App\Models\{CompanyModel, Comptes, EpargneAdhesionModel, ExpirateDateConfig, PorteFeuilleConfing, TauxEtDateSystem, Transactions, User};


class ComptesParamController extends Controller
{
    //
    public function __construct()
    {
        $this->middleware("auth");
    }

    //GET THE ECOUNT PARAM HOME PAGE 
    public function getComptesHomePage()
    {
        return view("eco.pages.compte-param");
    }

    //GET DEFAULT DATA TO DISPLAY FOR SOCIETY
    public function getConfigData()
    {
        $dataCompany = CompanyModel::first();
        $adhesion_epargne_data = EpargneAdhesionModel::first();
        $porte_feuille_data = PorteFeuilleConfing::first();
        $users_password_expirate = ExpirateDateConfig::first();
        $login_attempt = ExpirateDateConfig::first()->login_attempt;

        return response()->json([
            "status" => 1,
            "data_company" => $dataCompany,
            "adhesion_epargne_data" => $adhesion_epargne_data,
            "porte_feuille_data" => $porte_feuille_data,
            "users_password_expirate" => $users_password_expirate,
            "login_attempt_data" => $login_attempt
        ]);
    }

    //UPDATE COMPANY DATA

    public function UpdateCompanyData(Request $request)
    {


        CompanyModel::where("id", $request->companyId)->update([
            "sigle" => $request->sigle,
            "denomination" => $request->denomination,
            "adresse" => $request->adresse,
            "forme" => $request->forme,
            "ville" => $request->ville,
            "departement" => $request->departement,
            "pays" => $request->pays,
            "tel" => $request->tel,
            "email" => $request->email,
            "idnat" => $request->idnat,
            "nrc" => $request->nrc,
            "num_impot" => $request->num_impot,
            "date_system" => $request->date_system,
        ]);

        if (isset($request->date_system)) {
            $getLastRow = TauxEtDateSystem::latest()->first();
            if ($getLastRow) {
                TauxEtDateSystem::create([
                    "DateSystem" => $request->date_system,
                    "TauxEnDollar" => $getLastRow->TauxEnDollar,
                    "TauxEnFc" => $getLastRow->TauxEnFc
                ]);
            }
        }
        return response()->json(["status" => 1, "msg" => "Mise à jour réussie."]);
    }

    //UPDATE THE COMPANY LOGO 

    public function UpdateCompanyLogo(Request $request)
    {


        if ($request->hasFile('company_logo')) {
            $file = $request->file('company_logo');
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '.' . $extension;
            $file->move('uploads/images/logo', $filename);
            $uploaded_file = $filename;
            CompanyModel::where('id', $request->companyId)->update([
                "company_logo" => $uploaded_file,
            ]);
            return response()->json(["status" => 1, "msg" => "Mise à jour réussie."]);
        } else {
            return response()->json(["status" => 0, "msg" => "Vous n'avez pas séléctionné de fichier."]);
        }
    }

    //UPDATE ADHESION AND EPARGNE CONFIG
    public function UpdateAdhesionEpargneConfig(Request $request)
    {


        if (isset($request->AdhesionEpID)) {
            EpargneAdhesionModel::where("id", $request->AdhesionEpID)->update([
                "Ecompte_courant" => $request->Ecompte_courant,
                "Ecompte_courant_usd" => $request->Ecompte_courant_usd,
                "Ecompte_courant_cdf" => $request->Ecompte_courant_cdf,
                "Edebiteur" => $request->Edebiteur,
                "Edebiteur_usd" => $request->Edebiteur_usd,
                "Edebiteur_fc" => $request->Edebiteur_fc,
                "Etontine_usd" => $request->Etontine_usd,
                "Etontine_fc" => $request->Etontine_fc,
                "D_a_terme" => $request->D_a_terme,
                "solde_minimum" => $request->solde_minimum,
                "frais_adhesion" => $request->frais_adhesion,
                "part_social" => $request->part_social,
                "droit_entree" => $request->droit_entree,
                "compte_papeterie" => $request->compte_papeterie,
                "compte_papeterie_fc" => $request->compte_papeterie_fc,
                "compte_papeterie_usd" => $request->compte_papeterie_usd,
                "valeur_droit_entree" => $request->valeur_droit_entree,
                "valeur_droit_entree_pysique" => $request->valeur_droit_entree_pysique,
                "valeur_droit_entree_moral" => $request->valeur_droit_entree_moral,
                "valeur_frais_papeterie" => $request->valeur_frais_papeterie,
                "groupe_c_virement" => $request->groupe_c_virement,
                "groupe_c_fond_non_servi" => $request->groupe_c_fond_non_servi,
                "compte_revenu_virement_usd" => $request->compte_revenu_virement_usd,
                "compte_revenu_virement_fc" => $request->compte_revenu_virement_fc,
                "taux_tva_sur_vir" => $request->taux_tva_sur_vir,
                "arrondir_frais_vir" => $request->arrondir_frais_vir,
                "Edebiteur_radie_usd" => $request->Edebiteur_radie_usd,
                "Edebiteur_radie_fc" => $request->Edebiteur_radie_fc,
                "engagement_sur_eparg_usd" => $request->engagement_sur_eparg_usd,
                "engagement_sur_eparg_fc" => $request->engagement_sur_eparg_fc,
                "rec_sur_epargne_radie_usd" => $request->rec_sur_epargne_radie_usd,
                "rec_sur_epargne_radie_fc" => $request->rec_sur_epargne_radie_fc,
            ]);
        }

        return response()->json(["status" => 1, "msg" => "Modification réussie."]);
    }

    //UPDATE PORTE FEUILLE CONFIG

    public function UpdatePorteFeuilleConfig(Request $request)
    {
        if (isset($request->porteFeuilleConfigID)) {
            PorteFeuilleConfing::where("id", $request->porteFeuilleConfigID)->update([
                "pre_ordinanire" => $request->pre_ordinanire,
                "pre_ordinanire_au_dirigent" => $request->pre_ordinanire_au_dirigent,
                "pre_ordinanire_au_membres" => $request->pre_ordinanire_au_membres,
                "pre_ordinanire_au_agents" => $request->pre_ordinanire_au_agents,
                "pre_en_billet_delabre" => $request->pre_en_billet_delabre,
                "pre_en_billet_delabre_aux_dirigent" => $request->pre_en_billet_delabre_aux_dirigent,
                "pre_en_billet_delabre_aux_membres" => $request->pre_en_billet_delabre_aux_membres,
                "pre_en_billet_delabre_aux_agents" => $request->pre_en_billet_delabre_aux_agents,
                "grpe_compte_pret_r_HB" => $request->grpe_compte_pret_r_HB,
                "compte_charge_radiation" => $request->compte_charge_radiation,
                "compte_a_credite_HB" => $request->compte_a_credite_HB,
                "compte_a_credite_au_bilan" => $request->compte_a_credite_au_bilan,
                "interet_pret_ordin_NE" => $request->interet_pret_ordin_NE,
                "interet_pret_ordin_echu" => $request->interet_pret_ordin_echu,
                "interet_pret_en_billet_DL_NE" => $request->interet_pret_en_billet_DL_NE,
                "interet_pret_en_billet_DL_E" => $request->interet_pret_en_billet_DL_E,
                "pret_ordi_en_retard" => $request->pret_ordi_en_retard,
                "un_a_30_jours" => $request->un_a_30_jours,
                "trente_et_un_a_60_jours" => $request->trente_et_un_a_60_jours,
                "soixante_et_un_a_90_jours" => $request->soixante_et_un_a_90_jours,
                "nonante_et_un_a_90_jours" => $request->nonante_et_un_a_90_jours,
                "plus_de_180_jours" => $request->plus_de_180_jours,
                "p_billet_delabre_retard" => $request->p_billet_delabre_retard,
                "un_a_30_jours_del" => $request->un_a_30_jours_del,
                "trente_et_un_a_60_jours_del" => $request->trente_et_un_a_60_jours_del,
                "soixante_et_un_a_90_jours_del" => $request->soixante_et_un_a_90_jours_del,
                "nonante_et_un_a_180_jours_del" => $request->nonante_et_un_a_180_jours_del,
                "plus_de_180_jours_del" => $request->plus_de_180_jours_del,
                "provision_pret_ordinaire" => $request->provision_pret_ordinaire,
                "provision_un_a_30_jours" => $request->provision_un_a_30_jours,
                "taux_provision_1_30_jours" => $request->taux_provision_1_30_jours,
                "provision_trente_et_un_a_60_jours" => $request->provision_trente_et_un_a_60_jours,
                "taux_provision_31_60_jours" => $request->taux_provision_31_60_jours,
                "provision_soixante_et_un_a_90_jours" => $request->provision_soixante_et_un_a_90_jours,
                "taux_provision_61_90_jours" => $request->taux_provision_61_90_jours,
                "provision_nonante_et_un_a_180_jours" => $request->provision_nonante_et_un_a_180_jours,
                "taux_provision_91_180_jours" => $request->taux_provision_91_180_jours,
                "provision_plus_180_jours" => $request->provision_plus_180_jours,
                "taux_provision_plus_180_jours" => $request->taux_provision_plus_180_jours,
                "provision_pret_BD" => $request->provision_pret_BD,
                "provision_un_a_30_jours_BD" => $request->provision_un_a_30_jours_BD,
                "taux_provision_1_30_jours_BD" => $request->taux_provision_1_30_jours_BD,
                "provision_trente_et_un_a_60_jours_BD" => $request->provision_trente_et_un_a_60_jours_BD,
                "taux_provision_31_60_jours_BD" => $request->taux_provision_31_60_jours_BD,
                "provision_soixante_et_un_a_90_jours_BD" => $request->provision_soixante_et_un_a_90_jours_BD,
                "taux_provision_61_90_jours_BD" => $request->taux_provision_61_90_jours_BD,
                "provision_nonante_et_un_a_180_jours_BD" => $request->provision_nonante_et_un_a_180_jours_BD,
                "taux_provision_91_180_jours_BD" => $request->taux_provision_91_180_jours_BD,
                "provision_plus_180_jours_BD" => $request->provision_plus_180_jours_BD,
                "taux_provision_plus_180_jours_BD" => $request->taux_provision_plus_180_jours_BD,
            ]);
            return response()->json(["status" => 1, "msg" => "Mise à jour réussie."]);
        }
    }

    //UPDATE THE DAYS OF USERS PASSWORD EXPIRATION
    public function UpdateExpirateDateConfig(Request $request)
    {
        if (isset($request->password_expired_days_user_id)) {
            ExpirateDateConfig::where("id", $request->password_expired_days_user_id)->update([
                "password_expired_days" => $request->password_expired_days,
                "login_attempt" => $request->login_attempt
            ]);
            User::where("attempt_times", 5)->update([
                "attempt_times" => $request->login_attempt
            ]);
            $id = EpargneAdhesionModel::first()->id;
            EpargneAdhesionModel::where("id", $id)->update([
                "show_commission_pannel" => $request->showCommissionPanel == true ? 1 : 0
            ]);

            return response()->json(["status" => 1, "msg" => "Mise à jour réussie."]);
        }
    }

    //PERMET D'AJOUTER UN NOUVEAU COMPTE DE COMPTABILITE
    // public function saveNewAccount(Request $request)
    // {
    //     // $validator = Validator::make($request->all(), [
    //     //     'RefTypeCompte' => 'required|digits:4',
    //     // ]);

    //     // if ($validator->fails()) {
    //     //     return response()->json(['status' => 0, 'msg' => 'La RefTypeCompte doit être de 4 chiffres.']);
    //     // }
    //     $date = TauxEtDateSystem::orderBy('id', 'desc')->first()->DateSystem;
    //     if (isset($request->IntituleCompteNew) and isset($request->RefSousGroupe) and isset($request->RefCadre) and isset($request->RefTypeCompte) and isset($request->RefGroupe)) {
    //         //VERIFIE SI LE COMPTE N'EXISTE PAS ENCORE
    //         $checkCompteExist = Comptes::where("RefSousGroupe", "=", $request->RefSousGroupe)->first();
    //         if (!$checkCompteExist) {
    //             //CREE LA REFERENCE CADRE 
    //             // DB::select('INSERT INTO cadrecomptes RéfCadre,NomCadre,RéfTypeCompte VALUES("' . $request->RefCadre . '","' . $request->IntituleCompteNew . '","' . $request->RefTypeCompte . '")');

    //             //CREE LE COMPTE EN USD
    //             Comptes::create([
    //                 "NumCompte" => $request->RefSousGroupe . "201",
    //                 "NomCompte" => $request->IntituleCompteNew,
    //                 "RefTypeCompte" => $request->RefTypeCompte,
    //                 "RefCadre" => $request->RefCadre,
    //                 "RefGroupe" => $request->RefGroupe,
    //                 "RefSousGroupe" => $request->RefSousGroupe,
    //                 "CodeMonnaie" => 1,
    //                 "DateOuverture" => $date,
    //                 "NumAdherant" => $request->RefSousGroupe . "201",
    //                 "nature_compte"=> $request->nature_compte,
    //             ]);

    //             //CREE LE COMPTE EN cdf
    //             Comptes::create([
    //                 "NumCompte" => $request->RefSousGroupe . "202",
    //                 "NomCompte" => $request->IntituleCompteNew,
    //                 "RefTypeCompte" => $request->RefTypeCompte,
    //                 "RefCadre" => $request->RefCadre,
    //                 "RefGroupe" => $request->RefGroupe,
    //                 "RefSousGroupe" => $request->RefSousGroupe,
    //                 "CodeMonnaie" => 2,
    //                 "DateOuverture" => $date,
    //                 "NumAdherant" => $request->RefSousGroupe . "201",
    //                  "nature_compte"=> $request->nature_compte,
    //             ]);
    //             // //CDF
    //             // Transactions::create([
    //             //     "DateTransaction" => $date,
    //             //     "CodeMonnaie" => 2,
    //             //     "NumCompte" => $request->RefSousGroupe . "202",
    //             //     "Debit"  => 0,
    //             //     "Debit$"  => 0,
    //             //     "Debitfc" => 0,
    //             // ]);

    //             // //USD
    //             // Transactions::create([
    //             //     "DateTransaction" => $date,
    //             //     "CodeMonnaie" => 1,
    //             //     "NumCompte" => $request->RefSousGroupe . "201",
    //             //     "Debit"  => 0,
    //             //     "Debit$"  => 0,
    //             //     "Debitfc" => 0,
    //             // ]);
    //         } else {
    //             return response()->json(["status" => 0, "msg" => "Ce compte est déjà crée merci..."]);
    //         }

    //         return response()->json(["status" => 1, "msg" => "Le compte " . $request->RefSousGroupe . "202" . " CDF " . " et " . "" . $request->RefSousGroupe . "201" . " USD bien ajoutés merci..."]);
    //     } else {
    //         return response()->json(["status" => 0, "msg" => "Les veuillez completer tous le champs..."]);
    //     }
    // }

    public function saveNewAccount(Request $request)
    {
     
        try {
            DB::beginTransaction();

            $date = TauxEtDateSystem::orderBy('id', 'desc')->first()->DateSystem;

            if (
                !isset($request->IntituleCompteNew) || !isset($request->RefSousGroupe) ||
                !isset($request->RefCadre) || !isset($request->RefTypeCompte) || !isset($request->RefGroupe)
            ) {
                return response()->json([
                    "status" => 0,
                    "msg" => "Veuillez compléter tous les champs obligatoires."
                ]);
            }

            // Vérifier si le compte existe déjà
            $checkCompteExist = Comptes::where("RefSousGroupe", $request->RefTypeCompte)
                ->where("CodeMonnaie", 2)
                ->first();

            if ($checkCompteExist) {
                return response()->json([
                    "status" => 0,
                    "msg" => "Ce compte existe déjà."
                ]);
            }

            // Création des comptes de regroupement (hiérarchie)
            $this->creerHierarchieComptes($request, $date);

            // Création des comptes individuels
            $this->creerComptesIndividuels($request, $date);

            DB::commit();

            return response()->json([
                "status" => 1,
                "msg" => "Comptes créés avec succès. Comptes individuels: " . $request->RefSousGroupe . "202 (CDF) et " . $request->RefSousGroupe . "201 (USD)"
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "status" => 0,
                "msg" => "Erreur lors de la création: " . $e->getMessage()
            ]);
        }
    }


 // ============================================
    // FONCTIONS PRIVÉES UTILITAIRES
    // ============================================

    /**
     * Retourne le nom de la classe OHADA en fonction du RefTypeCompte
     */
    private function getNomClasse($refTypeCompte)
    {
        $classes = [
            '1' => 'CAPITAUX PROPRES',
            '2' => 'IMMOBILISATIONS',
            '3' => 'STOCKS ET CRÉANCES',
            '4' => 'TIERS',
            '5' => 'TRÉSORERIE',
            '6' => 'CHARGES',
            '7' => 'PRODUITS'
        ];
        return $classes[$refTypeCompte] ?? 'CLASSE ' . $refTypeCompte;
    }

    /**
     * Retourne la nature du compte (ACTIF/PASSIF/RESULTAT) en fonction du RefTypeCompte
     */
    private function getNatureClasse($refTypeCompte)
    {
        $natures = [
            '1' => 'PASSIF',
            '2' => 'ACTIF',
            '3' => 'ACTIF',
            '4' => null, // Sera défini par l'utilisateur
            '5' => 'ACTIF',
            '6' => 'RESULTAT',
            '7' => 'RESULTAT'
        ];
        return $natures[$refTypeCompte] ?? null;
    }

    private function creerHierarchieComptes($request, $date)
    {
        // Niveau 1: Classe
        if (!Comptes::where('NumCompte', $request->RefTypeCompte)->exists()) {
            Comptes::create([
                "NumCompte" => $request->RefTypeCompte,
                "NomCompte" => $this->getNomClasse($request->RefTypeCompte),
                "RefTypeCompte" => $request->RefTypeCompte,
                "RefCadre" => null,
                "RefGroupe" => null,
                "RefSousGroupe" => null,
                "CodeMonnaie" => null,
                "DateOuverture" => $date,
                "NumAdherant" => $request->RefTypeCompte,
                // "nature_compte" => $this->getNatureClasse($request->RefTypeCompte),
                // "nature_compte" => $request->nature_compte ?? $this->getNatureClasse($request->RefTypeCompte),
                "nature_compte" => $request->nature_compte ?? match((int)$request->RefTypeCompte) {
                    7 => "PRODUIT",
                    6 => "CHARGE",
                    default => $this->getNatureClasse($request->RefTypeCompte)
                },
                "niveau" => 1,
                "est_classe" => 1,
                "compte_parent" => null
            ]);
        }

        // Niveau 2: Cadre
        if (!Comptes::where('NumCompte', $request->RefCadre)->exists()) {
            Comptes::create([
                "NumCompte" => $request->RefCadre,
                "NomCompte" => $request->IntituleCompteNew,
                "RefTypeCompte" => $request->RefTypeCompte,
                "RefCadre" => $request->RefCadre,
                "RefGroupe" => null,
                "RefSousGroupe" => null,
                "CodeMonnaie" => null,
                "DateOuverture" => $date,
                "NumAdherant" => $request->RefCadre,
                // "nature_compte" => $this->getNatureClasse($request->RefTypeCompte),
                // "nature_compte" => $request->nature_compte ?? $this->getNatureClasse($request->RefTypeCompte),
                "nature_compte" => $request->nature_compte ?? match((int)$request->RefTypeCompte) {
                    7 => "PRODUIT",
                    6 => "CHARGE",
                    default => $this->getNatureClasse($request->RefTypeCompte)
                },
                "niveau" => 2,
                "est_classe" => 1,
                "compte_parent" => $request->RefTypeCompte
            ]);
        }

        // Niveau 3: Groupe
        if (!Comptes::where('NumCompte', $request->RefGroupe)->exists()) {
            Comptes::create([
                "NumCompte" => $request->RefGroupe,
                "NomCompte" => $request->IntituleCompteNew,
                "RefTypeCompte" => $request->RefTypeCompte,
                "RefCadre" => $request->RefCadre,
                "RefGroupe" => $request->RefGroupe,
                "RefSousGroupe" => null,
                "CodeMonnaie" => null,
                "DateOuverture" => $date,
                "NumAdherant" => $request->RefGroupe,
                // "nature_compte" => $this->getNatureClasse($request->RefTypeCompte),
                // "nature_compte" => $request->nature_compte ?? $this->getNatureClasse($request->RefTypeCompte),
                "nature_compte" => $request->nature_compte ?? match((int)$request->RefTypeCompte) {
                    7 => "PRODUIT",
                    6 => "CHARGE",
                    default => $this->getNatureClasse($request->RefTypeCompte)
                },
                "niveau" => 3,
                "est_classe" => 1,
                "compte_parent" => $request->RefCadre
            ]);
        }

        // Niveau 4: Sous-groupe
        if (!Comptes::where('NumCompte', $request->RefSousGroupe)->exists()) {
            Comptes::create([
                "NumCompte" => $request->RefSousGroupe,
                "NomCompte" => $request->IntituleCompteNew,
                "RefTypeCompte" => $request->RefTypeCompte,
                "RefCadre" => $request->RefCadre,
                "RefGroupe" => $request->RefGroupe,
                "RefSousGroupe" => $request->RefSousGroupe,
                "CodeMonnaie" => null,
                "DateOuverture" => $date,
                "NumAdherant" => $request->RefSousGroupe,
                // "nature_compte" => $this->getNatureClasse($request->RefTypeCompte),
                // "nature_compte" => $request->nature_compte ?? $this->getNatureClasse($request->RefTypeCompte),
                "nature_compte" => $request->nature_compte ?? match((int)$request->RefTypeCompte) {
                    7 => "PRODUIT",
                    6 => "CHARGE",
                    default => $this->getNatureClasse($request->RefTypeCompte)
                },
                "niveau" => 4,
                "est_classe" => 1,
                "compte_parent" => $request->RefGroupe
            ]);
        }
    }

    private function creerComptesIndividuels($request, $date)
    {
        // Compte CDF (202)
        Comptes::create([
            "NumCompte" => $request->RefSousGroupe . "202",
            "NomCompte" => $request->IntituleCompteNew,
            "RefTypeCompte" => $request->RefTypeCompte,
            "RefCadre" => $request->RefCadre,
            "RefGroupe" => $request->RefGroupe,
            "RefSousGroupe" => $request->RefSousGroupe,
            "CodeMonnaie" => 2,
            "DateOuverture" => $date,
            "NumAdherant" => $request->RefSousGroupe . "202",
            // "nature_compte" => $this->getNatureClasse($request->RefTypeCompte),
            // "nature_compte" => $request->nature_compte ?? $this->getNatureClasse($request->RefTypeCompte),
            "nature_compte" => $request->nature_compte ?? match((int)$request->RefTypeCompte) {
                7 => "PRODUIT",
                6 => "CHARGE",
                default => $this->getNatureClasse($request->RefTypeCompte)
            },
            "niveau" => 5,
            "est_classe" => 0,
            "compte_parent" => $request->RefSousGroupe
        ]);

        // Compte USD (201)
        Comptes::create([
            "NumCompte" => $request->RefSousGroupe . "201",
            "NomCompte" => $request->IntituleCompteNew,
            "RefTypeCompte" => $request->RefTypeCompte,
            "RefCadre" => $request->RefCadre,
            "RefGroupe" => $request->RefGroupe,
            "RefSousGroupe" => $request->RefSousGroupe,
            "CodeMonnaie" => 1,
            "DateOuverture" => $date,
            "NumAdherant" => $request->RefSousGroupe . "201",
            // "nature_compte" => $this->getNatureClasse($request->RefTypeCompte),
            // "nature_compte" => $request->nature_compte ?? $this->getNatureClasse($request->RefTypeCompte),
            "nature_compte" => $request->nature_compte ?? match((int)$request->RefTypeCompte) {
                7 => "PRODUIT",
                6 => "CHARGE",
                default => $this->getNatureClasse($request->RefTypeCompte)
            },
            "niveau" => 5,
            "est_classe" => 0,
            "compte_parent" => $request->RefSousGroupe
        ]);
    }

    //RECUPERER LA LISTE DE COMPTE INTERNE

    public function getCreatedAccount()
    {
        $data = Comptes::whereIn('nature_compte', [
        'ACTIF',
        'PASSIF',
        'PRODUIT',
        'CHARGE',
        'HORS BILAN'
    ])
    ->where('niveau', 5)
    ->orderByRaw("CASE 
        WHEN nature_compte = 'ACTIF' THEN 1
        WHEN nature_compte = 'PASSIF' THEN 2
        WHEN nature_compte = 'PRODUIT' THEN 3
        WHEN nature_compte = 'CHARGE' THEN 4
        WHEN nature_compte = 'HORS BILAN' THEN 5
        ELSE 6
    END")
    ->orderBy('NumCompte')
    ->get();
        return response()->json([
            "status" => 1,
            "data" => $data,
        ]);
    }

    //GET ALL EPARGNE ACCOUNTS

    public function getEpargneAccount()
    {
        $compteEpargne = Comptes::select(
            'comptes.NumCompte',
            'comptes.NomCompte',
            'adhesion_membres.sexe', // Exemple de colonne spécifique
            'comptes.NumAdherant',
            'comptes.CodeMonnaie',
            'comptes.RefCompte',
            DB::raw("
                CASE 
                    WHEN comptes.CodeMonnaie = 2 THEN 
                        SUM(transactions.Creditfc - transactions.Debitfc)
                    ELSE 
                        SUM(transactions.Creditusd - transactions.Debitusd)
                END as solde
            "),
            DB::raw("MAX(transactions.DateTransaction) as derniere_date_transaction")
        )
            ->join("adhesion_membres", "comptes.NumAdherant", "=", "adhesion_membres.compte_abrege")
            ->leftJoin("transactions", "comptes.NumCompte", "=", "transactions.NumCompte")
            ->where("comptes.RefCadre", 33)
            ->whereRaw('LENGTH(comptes.NumCompte) = 13')  // 🔥 Exactement 13 caractères
            ->whereNotIn("comptes.NumCompte", [3300, 3301]) // Simplification des exclusions
            ->groupBy(
                'comptes.NumCompte',
                'comptes.NomCompte',
                'adhesion_membres.sexe',
                'comptes.NumAdherant',
                'comptes.CodeMonnaie',
                'comptes.RefCompte'
            )
            ->distinct() // Évite les doublons si des jointures produisent des duplications
            ->orderBy("comptes.RefCompte", "desc")
            ->get();

        $compteEpargne = $compteEpargne->toArray();


        return response()->json([
            "status" => 1,
            "compteEpargne" => $compteEpargne
        ]);
    }
}
