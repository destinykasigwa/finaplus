import styles from "../styles/Global.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";
// import DataTable from "react-data-table-component";

const Comptes = () => {
    // const [company, setcompany] = useState({
    //     name: "",
    //     email: "",
    // });
    //SOCIETE ATTRIBUTE
    const [sigle, setSigle] = useState();
    const [denomination, setDenomination] = useState();
    const [adresse, setAdresse] = useState();
    const [forme, setForme] = useState();
    const [ville, setVille] = useState();
    const [departement, setDepartement] = useState();
    const [pays, setPays] = useState();
    const [tel, setTel] = useState();
    const [email, setEmail] = useState();
    const [idnat, setIdnat] = useState();
    const [nrc, setNrc] = useState();
    const [num_impot, setNum_impot] = useState();
    const [companyId, setCompanyId] = useState();
    const [date_system, setDate_system] = useState();
    const [company_logo, setCompany_logo] = useState();
    const [isloading1, setIsloading1] = useState(false);
    const [isloading2, setIsloading2] = useState(false);
    const [isloading3, setisloading3] = useState(false);
    const [isloading4, setisloading4] = useState(false);
    const [fetchCompany, setFetchCompany] = useState();

    //EPARGNE ADHESION ATTRIBUTE
    const [Ecompte_courant, setEcompte_courant] = useState();
    const [Ecompte_courant_usd, setEcompte_courant_usd] = useState();
    const [Ecompte_courant_cdf, setEcompte_courant_cdf] = useState();
    const [Edebiteur, setEdebiteur] = useState();
    const [Edebiteur_usd, setEdebiteur_usd] = useState();
    const [Edebiteur_fc, setEdebiteur_fc] = useState();
    const [Etontine_usd, setEtontine_usd] = useState();
    const [Etontine_fc, setEtontine_fc] = useState();
    const [D_a_terme, setD_a_terme] = useState();
    const [solde_minimum, setsolde_minimum] = useState();
    const [frais_adhesion, setfrais_adhesion] = useState();
    const [part_social, setpart_social] = useState();
    const [droit_entree, setdroit_entree] = useState();
    const [compte_papeterie, setcompte_papeterie] = useState();
    const [compte_papeterie_fc, setcompte_papeterie_fc] = useState();
    const [compte_papeterie_usd, setcompte_papeterie_usd] = useState();
    const [valeur_droit_entree, setvaleur_droit_entree] = useState();
    const [valeur_droit_entree_pysique, setvaleur_droit_entree_pysique] =
        useState();
    const [valeur_droit_entree_moral, setvaleur_droit_entree_moral] =
        useState();
    const [valeur_frais_papeterie, setvaleur_frais_papeterie] = useState();
    const [groupe_c_virement, setgroupe_c_virement] = useState();
    const [groupe_c_fond_non_servi, setgroupe_c_fond_non_servi] = useState();
    const [compte_revenu_virement_usd, setcompte_revenu_virement_usd] =
        useState();
    const [compte_revenu_virement_fc, setcompte_revenu_virement_fc] =
        useState();
    const [taux_tva_sur_vir, settaux_tva_sur_vir] = useState();
    const [arrondir_frais_vir, setarrondir_frais_vir] = useState();
    const [Edebiteur_radie_usd, setEdebiteur_radie_usd] = useState();
    const [Edebiteur_radie_fc, setEdebiteur_radie_fc] = useState();
    const [engagement_sur_eparg_usd, setengagement_sur_eparg_usd] = useState();
    const [engagement_sur_eparg_fc, setengagement_sur_eparg_fc] = useState();
    const [rec_sur_epargne_radie_usd, setrec_sur_epargne_radie_usd] =
        useState();
    const [rec_sur_epargne_radie_fc, setrec_sur_epargne_radie_fc] = useState();
    const [AdhesionEpID, setAdhesionEpID] = useState();

    const [fetchAdhesionEpargneData, setFetchAdhesionEpargneData] = useState();

    //PORTE FEUILLE ATTRIBUTE

    const [pre_ordinanire, setpre_ordinanire] = useState();
    const [pre_ordinanire_au_dirigent, setpre_ordinanire_au_dirigent] =
        useState();
    const [pre_ordinanire_au_membres, setpre_ordinanire_au_membres] =
        useState();
    const [pre_ordinanire_au_agents, setpre_ordinanire_au_agents] = useState();
    const [pre_en_billet_delabre, setpre_en_billet_delabre] = useState();
    const [
        pre_en_billet_delabre_aux_dirigent,
        setpre_en_billet_delabre_aux_dirigent,
    ] = useState();
    const [
        pre_en_billet_delabre_aux_membres,
        setpre_en_billet_delabre_aux_membres,
    ] = useState();
    const [
        pre_en_billet_delabre_aux_agents,
        setpre_en_billet_delabre_aux_agents,
    ] = useState();
    const [grpe_compte_pret_r_HB, setgrpe_compte_pret_r_HB] = useState();
    const [compte_charge_radiation, setcompte_charge_radiation] = useState();
    const [compte_a_credite_HB, setcompte_a_credite_HB] = useState();
    const [compte_a_credite_au_bilan, setcompte_a_credite_au_bilan] =
        useState();
    const [interet_pret_ordin_NE, setinteret_pret_ordin_NE] = useState();
    const [interet_pret_ordin_echu, setinteret_pret_ordin_echu] = useState();
    const [interet_pret_en_billet_DL_NE, setinteret_pret_en_billet_DL_NE] =
        useState();
    const [interet_pret_en_billet_DL_E, setinteret_pret_en_billet_DL_E] =
        useState();
    const [pret_ordi_en_retard, setpret_ordi_en_retard] = useState();
    const [un_a_30_jours, setun_a_30_jours] = useState();
    const [trente_et_un_a_60_jours, settrente_et_un_a_60_jours] = useState();
    const [soixante_et_un_a_90_jours, setsoixante_et_un_a_90_jours] =
        useState();
    const [nonante_et_un_a_90_jours, setnonante_et_un_a_90_jours] = useState();
    const [plus_de_180_jours, setplus_de_180_jours] = useState();
    const [p_billet_delabre_retard, setp_billet_delabre_retard] = useState();
    const [un_a_30_jours_del, setun_a_30_jours_del] = useState();
    const [trente_et_un_a_60_jours_del, settrente_et_un_a_60_jours_del] =
        useState();
    const [soixante_et_un_a_90_jours_del, setsoixante_et_un_a_90_jours_del] =
        useState();
    const [nonante_et_un_a_180_jours_del, setnonante_et_un_a_180_jours_del] =
        useState();
    const [plus_de_180_jours_del, setplus_de_180_jours_del] = useState();
    const [provision_pret_ordinaire, setprovision_pret_ordinaire] = useState();
    const [provision_un_a_30_jours, setprovision_un_a_30_jours] = useState();
    const [taux_provision_1_30_jours, settaux_provision_1_30_jours] =
        useState();
    const [
        provision_trente_et_un_a_60_jours,
        setprovision_trente_et_un_a_60_jours,
    ] = useState();
    const [taux_provision_31_60_jours, settaux_provision_31_60_jours] =
        useState();
    const [
        provision_soixante_et_un_a_90_jours,
        setprovision_soixante_et_un_a_90_jours,
    ] = useState();
    const [taux_provision_61_90_jours, settaux_provision_61_90_jours] =
        useState();
    const [
        provision_nonante_et_un_a_180_jours,
        setprovision_nonante_et_un_a_180_jours,
    ] = useState();
    const [taux_provision_91_180_jours, settaux_provision_91_180_jours] =
        useState();
    const [provision_plus_180_jours, setprovision_plus_180_jours] = useState();
    const [taux_provision_plus_180_jours, settaux_provision_plus_180_jours] =
        useState();
    const [provision_pret_BD, setprovision_pret_BD] = useState();
    const [provision_un_a_30_jours_BD, setprovision_un_a_30_jours_BD] =
        useState();
    const [taux_provision_1_30_jours_BD, settaux_provision_1_30_jours_BD] =
        useState();
    const [
        provision_trente_et_un_a_60_jours_BD,
        setprovision_trente_et_un_a_60_jours_BD,
    ] = useState();
    const [taux_provision_31_60_jours_BD, settaux_provision_31_60_jours_BD] =
        useState();
    const [
        provision_soixante_et_un_a_90_jours_BD,
        setprovision_soixante_et_un_a_90_jours_BD,
    ] = useState();
    const [taux_provision_61_90_jours_BD, settaux_provision_61_90_jours_BD] =
        useState();
    const [
        provision_nonante_et_un_a_180_jours_BD,
        setprovision_nonante_et_un_a_180_jours_BD,
    ] = useState();
    const [taux_provision_91_180_jours_BD, settaux_provision_91_180_jours_BD] =
        useState();
    const [provision_plus_180_jours_BD, setprovision_plus_180_jours_BD] =
        useState();
    const [
        taux_provision_plus_180_jours_BD,
        settaux_provision_plus_180_jours_BD,
    ] = useState();
    const [porteFeuilleConfigID, setPorteFeuilleConfigID] = useState();

    //PASS WORD EXPIRATE ATTRIBUTE
    const [password_expired_days, setpassword_expired_days] = useState();
    const [password_expired_days_user_id, setpassword_expired_days_user_id] =
        useState();

    //LOGIN ATTEMPT ATTRIBUTE
    const [login_attempt, setlogin_attempt] = useState();
    const [IntituleCompteNew, setIntituleCompteNew] = useState();
    //ADD NEW ACCOUNT ATTRIBUTE
    const [RefGroupe, setRefGroupe] = useState();
    const [RefSousGroupe, setRefSousGroupe] = useState();
    const [RefCadre, setRefCadre] = useState();
    const [RefTypeCompte, setRefTypeCompte] = useState();

    const [fetchCreatedAccount, setfetchCreatedAccount] = useState();
    const [showAccountSession, setshowAccountSession] = useState(true);
    const [showCommissionPanel, setShowCommissionPanel] = useState();
    const [showAccountSessionEpargne, setshowAccountSessionEpargne] =
        useState(true);
    const [chargement, setchargement] = useState(false);
    const [fetchCompteEpargne, setFetchCompteEpargne] = useState();
    const [currentPage, setCurrentPage] = useState(1);

    const [nature_compte, setNature_compte] = useState("");
    const [planComptable, setPlanComptable] = useState("OHADA"); // 'OHADA' ou 'PCCI'
    useEffect(() => {
        getCompanyData();
    }, []);

    const handleToggleChange = (e) => {
        setShowCommissionPanel(e.target.checked);
    };

    const ChargeCompte = async (e) => {
        e.preventDefault();
        setchargement(true);
        setshowAccountSession(false);
        setshowAccountSessionEpargne(false);
        const res = await axios.get("/eco/pages/comptes-cree/data");
        if (res.data.status == 1) {
            setchargement(false);
            setfetchCreatedAccount(res.data.data);
            setFetchCompteEpargne(res.data.compteEpargne);
        }
    };

    const ChargeCompteEpargne = async (e) => {
        e.preventDefault();
        setchargement(true);
        setshowAccountSession(false);
        setshowAccountSessionEpargne(false);
        const res = await axios.get(
            "/eco/pages/comptes-cree/data/compte-epargne",
        );
        if (res.data.status == 1) {
            setchargement(false);
            setFetchCompteEpargne(res.data.compteEpargne);
        } else {
            setchargement(false);
        }
    };

    // const hideAccountSession = async (e) => {
    //     e.preventDefault();
    //     setfetchCreatedAccount(false);
    //     setshowAccountSession(true);
    //     setshowAccountSessionEpargne(false);
    // };
    // const hideAccountEpargneSession = async (e) => {
    //     e.preventDefault();
    //     setFetchCompteEpargne(false);
    //     setshowAccountSessionEpargne(true);
    //     setshowAccountSession(false);
    // };

    //GET COMPANY DATA
    const getCompanyData = async () => {
        const res = await axios.get("/eco/page/params/company");
        if (res.data.status == 1) {
            //GET COMPANY DATA
            setFetchCompany(res.data.data_company);
            setSigle(res.data.data_company.sigle);
            setDenomination(res.data.data_company.denomination);
            setAdresse(res.data.data_company.adresse);
            setForme(res.data.data_company.forme);
            setVille(res.data.data_company.ville);
            setDepartement(res.data.data_company.departement);
            setPays(res.data.data_company.pays);
            setTel(res.data.data_company.tel);
            setEmail(res.data.data_company.email);
            setIdnat(res.data.data_company.idnat);
            setNrc(res.data.data_company.nrc);
            setNum_impot(res.data.data_company.num_impot);
            setDate_system(res.data.data_company.date_system);
            setCompanyId(res.data.data_company.id);
            setCompany_logo(res.data.data_company.company_logo);

            //GET ADHESION EPARGNE DATA
            setFetchAdhesionEpargneData(res.data.adhesion_epargne_data);
            console.log(fetchAdhesionEpargneData);
            setEcompte_courant(res.data.adhesion_epargne_data.Ecompte_courant);
            setEcompte_courant_usd(
                res.data.adhesion_epargne_data.Ecompte_courant_usd,
            );
            setEcompte_courant_cdf(
                res.data.adhesion_epargne_data.Ecompte_courant_cdf,
            );
            setEdebiteur(res.data.adhesion_epargne_data.Edebiteur);
            setEdebiteur_usd(res.data.adhesion_epargne_data.Edebiteur_usd);

            setEdebiteur_fc(res.data.adhesion_epargne_data.Edebiteur_fc);
            setEtontine_usd(res.data.adhesion_epargne_data.Etontine_usd);
            setEtontine_fc(res.data.adhesion_epargne_data.Etontine_fc);
            setD_a_terme(res.data.adhesion_epargne_data.D_a_terme);
            setsolde_minimum(res.data.adhesion_epargne_data.solde_minimum);
            setfrais_adhesion(res.data.adhesion_epargne_data.frais_adhesion);
            setpart_social(res.data.adhesion_epargne_data.part_social);
            setdroit_entree(res.data.adhesion_epargne_data.droit_entree);
            setcompte_papeterie(
                res.data.adhesion_epargne_data.compte_papeterie,
            );
            setcompte_papeterie_fc(
                res.data.adhesion_epargne_data.compte_papeterie_fc,
            );
            setcompte_papeterie_usd(
                res.data.adhesion_epargne_data.compte_papeterie_usd,
            );
            setvaleur_droit_entree(
                res.data.adhesion_epargne_data.valeur_droit_entree,
            );
            setvaleur_droit_entree_pysique(
                res.data.adhesion_epargne_data.valeur_droit_entree_pysique,
            );
            setvaleur_droit_entree_moral(
                res.data.adhesion_epargne_data.valeur_droit_entree_moral,
            );
            setvaleur_frais_papeterie(
                res.data.adhesion_epargne_data.valeur_frais_papeterie,
            );
            setgroupe_c_virement(
                res.data.adhesion_epargne_data.groupe_c_virement,
            );
            setgroupe_c_fond_non_servi(
                res.data.adhesion_epargne_data.groupe_c_fond_non_servi,
            );
            setcompte_revenu_virement_usd(
                res.data.adhesion_epargne_data.compte_revenu_virement_usd,
            );
            setcompte_revenu_virement_fc(
                res.data.adhesion_epargne_data.compte_revenu_virement_fc,
            );
            settaux_tva_sur_vir(
                res.data.adhesion_epargne_data.taux_tva_sur_vir,
            );
            setarrondir_frais_vir(
                res.data.adhesion_epargne_data.arrondir_frais_vir,
            );
            setEdebiteur_radie_usd(
                res.data.adhesion_epargne_data.Edebiteur_radie_usd,
            );
            setEdebiteur_radie_fc(
                res.data.adhesion_epargne_data.Edebiteur_radie_fc,
            );
            setengagement_sur_eparg_usd(
                res.data.adhesion_epargne_data.engagement_sur_eparg_usd,
            );
            setengagement_sur_eparg_fc(
                res.data.adhesion_epargne_data.engagement_sur_eparg_fc,
            );
            setrec_sur_epargne_radie_usd(
                res.data.adhesion_epargne_data.rec_sur_epargne_radie_usd,
            );
            setrec_sur_epargne_radie_fc(
                res.data.adhesion_epargne_data.rec_sur_epargne_radie_fc,
            );
            setAdhesionEpID(res.data.adhesion_epargne_data.id);

            //GET PORTE FEUILLE ATTRIBUTE

            setpre_ordinanire(res.data.porte_feuille_data.pre_ordinanire);
            setpre_ordinanire_au_dirigent(
                res.data.porte_feuille_data.pre_ordinanire_au_dirigent,
            );
            setpre_ordinanire_au_membres(
                res.data.porte_feuille_data.pre_ordinanire_au_membres,
            );
            setpre_ordinanire_au_agents(
                res.data.porte_feuille_data.pre_ordinanire_au_agents,
            );
            setpre_en_billet_delabre(
                res.data.porte_feuille_data.pre_en_billet_delabre,
            );
            setpre_en_billet_delabre_aux_dirigent(
                res.data.porte_feuille_data.pre_en_billet_delabre_aux_dirigent,
            );
            setpre_en_billet_delabre_aux_membres(
                res.data.porte_feuille_data.pre_en_billet_delabre_aux_membres,
            );
            setpre_en_billet_delabre_aux_membres(
                res.data.porte_feuille_data.pre_en_billet_delabre_aux_membres,
            );
            setpre_en_billet_delabre_aux_agents(
                res.data.porte_feuille_data.pre_en_billet_delabre_aux_agents,
            );
            setgrpe_compte_pret_r_HB(
                res.data.porte_feuille_data.grpe_compte_pret_r_HB,
            );
            setcompte_charge_radiation(
                res.data.porte_feuille_data.compte_charge_radiation,
            );
            setcompte_a_credite_HB(
                res.data.porte_feuille_data.compte_a_credite_HB,
            );
            setcompte_a_credite_au_bilan(
                res.data.porte_feuille_data.compte_a_credite_au_bilan,
            );
            setinteret_pret_ordin_NE(
                res.data.porte_feuille_data.interet_pret_ordin_NE,
            );
            setinteret_pret_ordin_echu(
                res.data.porte_feuille_data.interet_pret_ordin_echu,
            );
            setinteret_pret_en_billet_DL_NE(
                res.data.porte_feuille_data.interet_pret_en_billet_DL_NE,
            );
            setinteret_pret_en_billet_DL_E(
                res.data.porte_feuille_data.interet_pret_en_billet_DL_E,
            );
            setpret_ordi_en_retard(
                res.data.porte_feuille_data.pret_ordi_en_retard,
            );
            setpret_ordi_en_retard(
                res.data.porte_feuille_data.pret_ordi_en_retard,
            );
            setun_a_30_jours(res.data.porte_feuille_data.un_a_30_jours);
            settrente_et_un_a_60_jours(
                res.data.porte_feuille_data.trente_et_un_a_60_jours,
            );
            setsoixante_et_un_a_90_jours(
                res.data.porte_feuille_data.soixante_et_un_a_90_jours,
            );
            setnonante_et_un_a_90_jours(
                res.data.porte_feuille_data.nonante_et_un_a_90_jours,
            );
            setplus_de_180_jours(res.data.porte_feuille_data.plus_de_180_jours);
            setp_billet_delabre_retard(
                res.data.porte_feuille_data.p_billet_delabre_retard,
            );
            setun_a_30_jours_del(res.data.porte_feuille_data.un_a_30_jours_del);
            settrente_et_un_a_60_jours_del(
                res.data.porte_feuille_data.trente_et_un_a_60_jours_del,
            );
            setsoixante_et_un_a_90_jours_del(
                res.data.porte_feuille_data.soixante_et_un_a_90_jours_del,
            );
            setnonante_et_un_a_180_jours_del(
                res.data.porte_feuille_data.nonante_et_un_a_180_jours_del,
            );
            setplus_de_180_jours_del(
                res.data.porte_feuille_data.plus_de_180_jours_del,
            );
            setprovision_pret_ordinaire(
                res.data.porte_feuille_data.provision_pret_ordinaire,
            );
            setprovision_un_a_30_jours(
                res.data.porte_feuille_data.provision_un_a_30_jours,
            );
            settaux_provision_1_30_jours(
                res.data.porte_feuille_data.taux_provision_1_30_jours,
            );
            setprovision_trente_et_un_a_60_jours(
                res.data.porte_feuille_data.provision_trente_et_un_a_60_jours,
            );
            settaux_provision_31_60_jours(
                res.data.porte_feuille_data.taux_provision_31_60_jours,
            );
            setprovision_soixante_et_un_a_90_jours(
                res.data.porte_feuille_data.provision_soixante_et_un_a_90_jours,
            );
            settaux_provision_61_90_jours(
                res.data.porte_feuille_data.taux_provision_61_90_jours,
            );
            setprovision_nonante_et_un_a_180_jours(
                res.data.porte_feuille_data.provision_nonante_et_un_a_180_jours,
            );
            settaux_provision_91_180_jours(
                res.data.porte_feuille_data.taux_provision_91_180_jours,
            );
            setprovision_plus_180_jours(
                res.data.porte_feuille_data.provision_plus_180_jours,
            );
            settaux_provision_plus_180_jours(
                res.data.porte_feuille_data.taux_provision_plus_180_jours,
            );
            setprovision_pret_BD(res.data.porte_feuille_data.provision_pret_BD);
            setprovision_un_a_30_jours_BD(
                res.data.porte_feuille_data.provision_un_a_30_jours_BD,
            );
            settaux_provision_1_30_jours_BD(
                res.data.porte_feuille_data.taux_provision_1_30_jours_BD,
            );
            setprovision_trente_et_un_a_60_jours_BD(
                res.data.porte_feuille_data
                    .provision_trente_et_un_a_60_jours_BD,
            );
            settaux_provision_31_60_jours_BD(
                res.data.porte_feuille_data.taux_provision_31_60_jours_BD,
            );
            setprovision_soixante_et_un_a_90_jours_BD(
                res.data.porte_feuille_data
                    .provision_soixante_et_un_a_90_jours_BD,
            );
            settaux_provision_61_90_jours_BD(
                res.data.porte_feuille_data.taux_provision_61_90_jours_BD,
            );
            setprovision_nonante_et_un_a_180_jours_BD(
                res.data.porte_feuille_data
                    .provision_nonante_et_un_a_180_jours_BD,
            );
            settaux_provision_91_180_jours_BD(
                res.data.porte_feuille_data.taux_provision_91_180_jours_BD,
            );
            setprovision_plus_180_jours_BD(
                res.data.porte_feuille_data.provision_plus_180_jours_BD,
            );
            settaux_provision_plus_180_jours_BD(
                res.data.porte_feuille_data.taux_provision_plus_180_jours_BD,
            );
            setPorteFeuilleConfigID(res.data.porte_feuille_data.id);

            //PASSWORD EXPIRATE DATE
            setpassword_expired_days(
                res.data.users_password_expirate.password_expired_days,
            );
            setpassword_expired_days_user_id(
                res.data.users_password_expirate.id,
            );
            //LOGIN ATTEMPT
            setlogin_attempt(res.data.login_attempt_data);
            setShowCommissionPanel(
                res.data.adhesion_epargne_data.show_commission_pannel,
            );
            console.log(login_attempt);
        }
    };
    //UPDATE COMPANY DATA

    const updateCompanyData = async (e) => {
        e.preventDefault();
        setIsloading1(true);
        const res = await axios.post("/eco/page/params/edit-company", {
            companyId,
            sigle,
            denomination,
            adresse,
            forme,
            ville,
            departement,
            pays,
            tel,
            email,
            idnat,
            nrc,
            num_impot,
            date_system,
        });
        if (res.data.status == 1) {
            setIsloading1(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading1(false);
        }
    };

    const updateCompanyLogo = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("companyId", companyId);
            formData.append("company_logo", company_logo);
            const config = {
                Headers: {
                    accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.8",
                    "content-type": "multipart/form-data",
                },
            };

            const url = "/eco/page/params/edit-company_logo";
            axios
                .post(url, formData, config)
                .then((response) => {
                    if (response.data.status == 1) {
                        Swal.fire({
                            title: "Succès",
                            text: response.data.msg,
                            icon: "success",
                            button: "OK!",
                        });
                    } else {
                        Swal.fire({
                            title: "Erreur",
                            text: response.data.msg,
                            icon: "error",
                            button: "OK!",
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            throw error;
        }
    };

    //UPDATE ADHESION AND EPARGNE CONFIG
    const updateAdhesionEpargneConfig = async (e) => {
        console.log(AdhesionEpID);
        e.preventDefault();
        setIsloading2(true);
        const res = await axios.post("/eco/page/params/edit-adhesion-epargne", {
            AdhesionEpID,
            Ecompte_courant,
            Ecompte_courant_usd,
            Ecompte_courant_cdf,
            Edebiteur,
            Edebiteur_usd,
            Edebiteur_fc,
            Etontine_usd,
            Etontine_fc,
            D_a_terme,
            solde_minimum,
            frais_adhesion,
            part_social,
            droit_entree,
            compte_papeterie,
            compte_papeterie_fc,
            compte_papeterie_usd,
            valeur_droit_entree,
            valeur_droit_entree_pysique,
            valeur_droit_entree_moral,
            valeur_frais_papeterie,
            groupe_c_virement,
            groupe_c_fond_non_servi,
            compte_revenu_virement_usd,
            compte_revenu_virement_fc,
            taux_tva_sur_vir,
            arrondir_frais_vir,
            Edebiteur_radie_usd,
            Edebiteur_radie_fc,
            engagement_sur_eparg_usd,
            engagement_sur_eparg_fc,
            rec_sur_epargne_radie_usd,
            rec_sur_epargne_radie_fc,
        });
        if (res.data.status == 1) {
            setIsloading2(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading2(false);
        }
    };

    //UPDATE PORTE FEUILLE CONFIG

    const updatePorteFeuilleConfig = async (e) => {
        e.preventDefault();
        setisloading3(true);
        const res = await axios.post(
            "/eco/page/params/edit-portefeuille-config",
            {
                porteFeuilleConfigID,
                pre_ordinanire,
                pre_ordinanire_au_dirigent,
                pre_ordinanire_au_membres,
                pre_ordinanire_au_agents,
                pre_en_billet_delabre,
                pre_en_billet_delabre_aux_dirigent,
                pre_en_billet_delabre_aux_membres,
                pre_en_billet_delabre_aux_agents,
                grpe_compte_pret_r_HB,
                compte_charge_radiation,
                compte_a_credite_HB,
                compte_a_credite_au_bilan,
                interet_pret_ordin_NE,
                interet_pret_ordin_echu,
                interet_pret_en_billet_DL_NE,
                interet_pret_en_billet_DL_E,
                pret_ordi_en_retard,
                un_a_30_jours,
                trente_et_un_a_60_jours,
                soixante_et_un_a_90_jours,
                nonante_et_un_a_90_jours,
                plus_de_180_jours,
                p_billet_delabre_retard,
                un_a_30_jours_del,
                trente_et_un_a_60_jours_del,
                soixante_et_un_a_90_jours_del,
                nonante_et_un_a_180_jours_del,
                plus_de_180_jours_del,
                provision_pret_ordinaire,
                provision_un_a_30_jours,
                taux_provision_1_30_jours,
                provision_trente_et_un_a_60_jours,
                taux_provision_31_60_jours,
                provision_soixante_et_un_a_90_jours,
                taux_provision_61_90_jours,
                provision_nonante_et_un_a_180_jours,
                taux_provision_91_180_jours,
                provision_plus_180_jours,
                taux_provision_plus_180_jours,
                provision_pret_BD,
                provision_un_a_30_jours_BD,
                taux_provision_1_30_jours_BD,
                provision_trente_et_un_a_60_jours_BD,
                taux_provision_31_60_jours_BD,
                provision_soixante_et_un_a_90_jours_BD,
                taux_provision_61_90_jours_BD,
                provision_nonante_et_un_a_180_jours_BD,
                taux_provision_91_180_jours_BD,
                provision_plus_180_jours_BD,
                taux_provision_plus_180_jours_BD,
            },
        );
        if (res.data.status == 1) {
            setisloading3(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setisloading3(false);
        }
    };

    // const FraisAdhesionChecked = async (e) => {
    //     if (e.target.checked) {
    //         setfrais_adhesion(1);
    //     }
    // };

    //UPDATE DAYS OF THE USER EXPIRATE PASSWORD
    const updateExpirateDays = async (e) => {
        e.preventDefault();
        console.log(showAccountSession);
        const res = await axios.post(
            "/eco/page/params/edit-expirate-date-config",
            {
                password_expired_days_user_id,
                password_expired_days,
                login_attempt,
                showCommissionPanel,
            },
        );
        if (res.data.status == 1) {
            setisloading3(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    const saveNewCompte = async (e) => {
        e.preventDefault();
    
        // 1. Vérification de la classe OHADA
        if (!RefTypeCompte) {
            Swal.fire({
                title: "Erreur",
                text: "Veuillez sélectionner la classe OHADA du compte (0 à 9)",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        // 2. Vérification de la nature pour les comptes de classe 4 (Tiers)
        if (RefTypeCompte === "4" && !nature_compte) {
            Swal.fire({
                title: "Erreur",
                text: "Veuillez sélectionner la nature du compte (ACTIF ou PASSIF) pour les comptes de tiers",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        // 3. Vérification de l'intitulé du compte
        if (!IntituleCompteNew || IntituleCompteNew.trim() === "") {
            Swal.fire({
                title: "Erreur",
                text: "Veuillez saisir l'intitulé du compte",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        // 4. Vérification du sous-groupe (4 chiffres)
        if (!RefSousGroupe || RefSousGroupe.length !== 4) {
            Swal.fire({
                title: "Erreur",
                text: "Le sous-groupe doit être composé de 4 chiffres (ex: 7000)",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        // 5. Vérification du cadre (2 chiffres)
        if (RefCadre && RefCadre.length !== 2) {
            Swal.fire({
                title: "Attention",
                text: "Le cadre doit être composé de 2 chiffres (ex: 70). Voulez-vous continuer ?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Oui, continuer",
                cancelButtonText: "Non, corriger",
            }).then((result) => {
                if (!result.isConfirmed) return;
            });
        }

        // 6. Vérification du groupe (3 chiffres)
        if (RefGroupe && RefGroupe.length !== 3) {
            Swal.fire({
                title: "Attention",
                text: "Le groupe doit être composé de 3 chiffres (ex: 700). Voulez-vous continuer ?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Oui, continuer",
                cancelButtonText: "Non, corriger",
            }).then((result) => {
                if (!result.isConfirmed) return;
            });
        }

        setisloading4(true);
        
        try {
            // Construction de l'objet à envoyer
            const compteData = {
                IntituleCompteNew: IntituleCompteNew.trim(),
                RefGroupe: RefGroupe || null,
                RefSousGroupe: RefSousGroupe,
                RefCadre: RefCadre || null,
                RefTypeCompte: RefTypeCompte,
                nature_compte: RefTypeCompte === "4" ? nature_compte : nature_compte,
            };

            const res = await axios.post(
                "/eco/pages/comptes/compte/add-new",
                compteData,
            );

            if (res.data.status == 1) {
                Swal.fire({
                    title: "Succès !",
                    text: res.data.msg,
                    icon: "success",
                    confirmButtonText: "OK",
                    timer: 3000,
                });

                // Réinitialiser le formulaire après succès
                addNewAccount();

                // Recharger la liste des comptes
                // if (typeof getCreatedAccounts === 'function') {
                //     getCreatedAccounts();
                // }
            } else if (res.data.status == 0) {
                Swal.fire({
                    title: "Erreur",
                    text:
                        res.data.msg ||
                        "Une erreur est survenue lors de l'enregistrement",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement:", error);
            Swal.fire({
                title: "Erreur technique",
                text:
                    error.response?.data?.msg ||
                    "Impossible d'enregistrer le compte. Vérifiez votre connexion.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } finally {
            setisloading4(false);
        }
    };

    const addNewAccount = async (e) => {
        if (e) e.preventDefault();

        // Réinitialiser tous les champs
        setIntituleCompteNew("");
        setRefGroupe("");
        setRefSousGroupe("");
        setRefCadre("");
        setRefTypeCompte("");
        setNature_compte("");

        // Optionnel : focus sur le champ intitulé
        const intituleInput = document.getElementById("intituleCompte");
        if (intituleInput) {
            intituleInput.focus();
        }
    };

    //PERMET DE CLOTURER L'EXERCICE EN COURS

    const clotureAnuelle = async (e) => {
        e.preventDefault();
        setchargement(true);
        Swal.fire({
            title: "Confirmation !",
            text: "Etes vous sûr d'effectuer la clotûre annuelle ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui Clotûrer!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    "Confirmation!",
                    "La clotûre annuelle se passe en arrière-plan, veuillez patienter.",
                    "success",
                ).then(async function () {
                    try {
                        const res = await axios.get(
                            "/eco/comptes/cloture/annuelle",
                        );
                        if (res.data.status === 1) {
                            setchargement(false);
                            Swal.fire({
                                title: "Succès",
                                text: res.data.msg,
                                icon: "success",
                                timer: 8000,
                                confirmButtonText: "Okay",
                            });
                        } else {
                            Swal.fire({
                                title: "Erreur",
                                text: res.data.msg,
                                icon: "error",
                                timer: 8000,
                                confirmButtonText: "Okay",
                            });
                        }
                    } catch (error) {
                        setchargement(false);
                        Swal.fire({
                            title: "Erreur",
                            text: "Une erreur est survenue pendant la clotûre annuelle.",
                            icon: "error",
                            timer: 8000,
                            confirmButtonText: "Okay",
                        });
                        console.error(error);
                    } finally {
                        setchargement(false);
                    }
                });
            } else {
                setchargement(false);
            }
        });
    };

    // const exportTableData = (tableId) => {
    //     const s2ab = (s) => {
    //         const buf = new ArrayBuffer(s.length);
    //         const view = new Uint8Array(buf);
    //         for (let i = 0; i !== s.length; ++i)
    //             view[i] = s.charCodeAt(i) & 0xff;
    //         return buf;
    //     };

    //     const table = document.getElementById(tableId);
    //     const wb = XLSX.utils.table_to_book(table);
    //     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    //     const fileName = `table_${tableId}.xlsx`;
    //     saveAs(
    //         new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
    //         fileName
    //     );
    // };
    // const exportToPDF = () => {
    //     const content = document.getElementById("content-to-download-balance");

    //     if (!content) {
    //         console.error("Element not found!");
    //         return;
    //     }

    //     html2canvas(content, { scale: 3 }).then((canvas) => {
    //         const paddingTop = 50;
    //         const paddingRight = 50;
    //         const paddingBottom = 50;
    //         const paddingLeft = 50;

    //         const canvasWidth = canvas.width + paddingLeft + paddingRight;
    //         const canvasHeight = canvas.height + paddingTop + paddingBottom;

    //         const newCanvas = document.createElement("canvas");
    //         newCanvas.width = canvasWidth;
    //         newCanvas.height = canvasHeight;
    //         const ctx = newCanvas.getContext("2d");

    //         if (ctx) {
    //             ctx.fillStyle = "#ffffff"; // Background color
    //             ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //             ctx.drawImage(canvas, paddingLeft, paddingTop);
    //         }

    //         const pdf = new jsPDF("p", "mm", "a4");
    //         const imgData = newCanvas.toDataURL("image/png");
    //         const imgProps = pdf.getImageProperties(imgData);
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    //         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    //         pdf.autoPrint();
    //         window.open(pdf.output("bloburl"), "_blank");
    //         // pdf.save("releve-de-compte.pdf");
    //     });
    // };

    const downloadReport = (type) => {
   
        setchargement(true);
        // Générer le nom du fichier avec la date du jour
        const filename = `liste_compte_epargne_${
            new Date().toISOString().split("T")[0]
        }`; // "YYYY-MM-DD"
        axios
            .post(
                "/download-report/liste-compte/epargne",
                {
                    fetchDataCompteInterne: fetchCreatedAccount, // Assurez-vous que fetchData contient vos données
                    fetchDataCompteEpargne:fetchCompteEpargne,
                    type: type, // Ajouter le paramètre type à la requête
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"), // Ajouter le token CSRF
                    },
                    responseType: "blob", // Définir le type de réponse comme un blob (pour le fichier)
                },
            )
            .then((response) => {
                const url = window.URL.createObjectURL(
                    new Blob([response.data]),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `${filename}.${type === "pdf" ? "pdf" : "xlsx"}`; // Utiliser le nom dynamique du fichier
                document.body.appendChild(a);
                a.click();
                a.remove();
                setchargement(false);
            })
            .catch((error) => console.error("Error:", error));
    };



    //CREATE PAGINATION

    const itemsPerPage = 40;
    const totalPages = Math.ceil(
        fetchCompteEpargne && fetchCompteEpargne.length / itemsPerPage,
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems =
        fetchCompteEpargne &&
        fetchCompteEpargne.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };
    const renderPagination = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else if (currentPage <= halfMaxPagesToShow) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + halfMaxPagesToShow >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - halfMaxPagesToShow;
            endPage = currentPage + halfMaxPagesToShow;
        }

        if (startPage > 1) {
            pageNumbers.push(
                <li key={1}>
                    <button onClick={() => handlePageChange(1)}>1</button>
                </li>,
            );
            if (startPage > 2) {
                pageNumbers.push(<li key="start-ellipsis">...</li>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={i === currentPage ? "active" : ""}>
                    <button
                        style={
                            i === currentPage
                                ? selectedButtonStyle
                                : buttonStyle
                        }
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                </li>,
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<li key="end-ellipsis">...</li>);
            }
            pageNumbers.push(
                <li key={totalPages}>
                    <button onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </button>
                </li>,
            );
        }

        return pageNumbers;
    };

    const paginationStyle = {
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "",
    };

    const buttonStylePrevNext = {
        padding: "2px 20px",
        backgroundColor: "steelblue",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        margin: "0 5px",
    };
    const buttonStyle = {
        padding: "1px 5px",
        backgroundColor: "steelblue",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        margin: "0 5px",
    };

    const selectedButtonStyle = {
        ...buttonStyle,
        backgroundColor: "#FFC107", // Change color for selected button
    };

    let compteur = 1;
    return (
        <div style={{ marginTop: "5px" }}>
            <div>
                <ul
                    className="nav nav-tabs custom-tabs"
                    id="custom-tabs-one-tab"
                    role="tablist"
                >
                    <li className="nav-item">
                        <a
                            className="nav-link active"
                            id="custom-tabs-one-1-tab"
                            data-toggle="pill"
                            href="#custom-tabs-one-1"
                            role="tab"
                            aria-controls="custom-tabs-one-1"
                            aria-selected="true"
                        >
                            <i className="fas fa-building me-2"></i>
                            Société
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="custom-tabs-two-2-tab"
                            data-toggle="pill"
                            href="#custom-tabs-two-2"
                            role="tab"
                            aria-controls="custom-tabs-two-2"
                            aria-selected="false"
                        >
                            <i className="fas fa-piggy-bank me-2"></i>
                            Épargne & Adhésion
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="custom-tabs-three-3-tab"
                            data-toggle="pill"
                            href="#custom-tabs-three-3"
                            role="tab"
                            aria-controls="custom-tabs-three-3"
                            aria-selected="false"
                        >
                            <i className="fas fa-folder-open me-2"></i>
                            Portefeuille
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="custom-tabs-four-4-tab"
                            data-toggle="pill"
                            href="#custom-tabs-four-4"
                            role="tab"
                            aria-controls="custom-tabs-four-4"
                            aria-selected="false"
                        >
                            <i className="fas fa-sliders-h me-2"></i>
                            Autres
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="custom-tabs-five-5-tab"
                            data-toggle="pill"
                            href="#custom-tabs-five-5"
                            role="tab"
                            aria-controls="custom-tabs-five-5"
                            aria-selected="false"
                        >
                            <i className="fas fa-table-list me-2"></i>
                            Comptes
                        </a>
                    </li>
                </ul>
                <div className="card-body">
                    {chargement && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                zIndex: 1000,
                            }}
                        >
                            <div>
                                <Bars
                                    height="80"
                                    width="80"
                                    color="#4fa94d"
                                    ariaLabel="loading"
                                />
                                <h5
                                    style={{
                                        color: "#fff",
                                    }}
                                >
                                    Patientez...
                                </h5>
                            </div>
                        </div>
                    )}
                    <div
                        className="tab-content"
                        id="custom-tabs-one-tabContent"
                    >
                        <div
                            className="tab-pane fade show active"
                            id="custom-tabs-one-1"
                            role="tabpanel"
                            aria-labelledby="custom-tabs-one-1-tab"
                        >
                            <h4
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                Société
                            </h4>
                            <br />
                            <div className="row g-4">
                                {/* Colonne gauche - Formulaire des informations société */}
                                <div className="col-md-8">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-building me-2"></i>
                                                Informations générales
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <form method="POST">
                                                <table
                                                    className="table table-borderless"
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        {/* Ligne 1 - Sigle et Dénomination */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                    width: "35%",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-tag me-1"></i>
                                                                    Sigle
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <div className="input-group">
                                                                    <input
                                                                        id="sigle"
                                                                        type="text"
                                                                        className="form-control form-control-sm"
                                                                        style={{
                                                                            borderRadius:
                                                                                "8px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setSigle(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        value={
                                                                            sigle
                                                                        }
                                                                        placeholder="Sigle de l'entreprise"
                                                                    />
                                                                    <input
                                                                        type="hidden"
                                                                        value={
                                                                            companyId
                                                                        }
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                    width: "30%",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-building me-1"></i>
                                                                    Dénomination
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="denomination"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDenomination(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        denomination
                                                                    }
                                                                    placeholder="Nom complet de l'entreprise"
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 2 - Adresse et Forme */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                                    Adresse
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="adresse"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdresse(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        adresse
                                                                    }
                                                                    placeholder="Adresse complète"
                                                                />
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-chart-line me-1"></i>
                                                                    Forme
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="forme"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setForme(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        forme
                                                                    }
                                                                    placeholder="Forme juridique"
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 3 - Ville et Département */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-city me-1"></i>
                                                                    Ville
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="ville"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setVille(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        ville
                                                                    }
                                                                    placeholder="Ville"
                                                                />
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-globe me-1"></i>
                                                                    Département
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="departement"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDepartement(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        departement
                                                                    }
                                                                    placeholder="Département / Province"
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 4 - Pays et Téléphone */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-flag me-1"></i>
                                                                    Pays
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="pays"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setPays(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={pays}
                                                                    placeholder="Pays"
                                                                />
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-phone me-1"></i>
                                                                    Téléphone
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="tel"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setTel(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={tel}
                                                                    placeholder="Numéro de téléphone"
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 5 - Email et ID Nat */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-envelope me-1"></i>
                                                                    Email
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="email"
                                                                    type="email"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEmail(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        email
                                                                    }
                                                                    placeholder="Email de contact"
                                                                />
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-id-card me-1"></i>
                                                                    ID National
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="idnat"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setIdnat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        idnat
                                                                    }
                                                                    placeholder="Identification nationale"
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 6 - NRC et Num Impôt */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-file-invoice me-1"></i>
                                                                    NRC
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="nrc"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setNrc(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={nrc}
                                                                    placeholder="Numéro Registre de Commerce"
                                                                />
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-receipt me-1"></i>
                                                                    Numéro Impôt
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="num_impot"
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setNum_impot(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        num_impot
                                                                    }
                                                                    placeholder="Numéro d'identification fiscale"
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 7 - Date Système */}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="fw-semibold small"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-calendar-alt me-1"></i>
                                                                    Date Système
                                                                </label>
                                                            </td>
                                                            <td
                                                                colSpan="3"
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <input
                                                                    id="date_system"
                                                                    type="date"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                        width: "auto",
                                                                        display:
                                                                            "inline-block",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setDate_system(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        date_system
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Ligne 8 - Bouton de mise à jour */}
                                                        <tr>
                                                            <td
                                                                colSpan="4"
                                                                style={{
                                                                    padding:
                                                                        "15px 8px 8px",
                                                                }}
                                                            >
                                                                <button
                                                                    type="submit"
                                                                    className="btn w-100 py-2 fw-bold"
                                                                    style={{
                                                                        background:
                                                                            "linear-gradient(135deg, #20c997, #198764)",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "10px",
                                                                        border: "none",
                                                                        transition:
                                                                            "all 0.3s ease",
                                                                    }}
                                                                    onClick={
                                                                        updateCompanyData
                                                                    }
                                                                    onMouseEnter={(
                                                                        e,
                                                                    ) => {
                                                                        e.currentTarget.style.transform =
                                                                            "translateY(-2px)";
                                                                        e.currentTarget.style.boxShadow =
                                                                            "0 6px 16px rgba(32,201,151,0.3)";
                                                                    }}
                                                                    onMouseLeave={(
                                                                        e,
                                                                    ) => {
                                                                        e.currentTarget.style.transform =
                                                                            "translateY(0)";
                                                                        e.currentTarget.style.boxShadow =
                                                                            "none";
                                                                    }}
                                                                >
                                                                    {isloading1 ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                                            Mise
                                                                            à
                                                                            jour...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-save me-2"></i>
                                                                            Mettre
                                                                            à
                                                                            jour
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne droite - Logo */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-image me-2"></i>
                                                Logo de l'entreprise
                                            </h6>
                                        </div>
                                        <div className="card-body p-4 text-center">
                                            {/* Zone d'affichage du logo */}
                                            <div
                                                className="mb-4 p-3 bg-light rounded-3"
                                                style={{
                                                    border: "2px dashed #dee2e6",
                                                }}
                                            >
                                                <img
                                                    style={{
                                                        width: "100%",
                                                        maxHeight: "150px",
                                                        objectFit: "contain",
                                                        borderRadius: "8px",
                                                    }}
                                                    src={`uploads/images/logo/${company_logo ? company_logo : "default.jpg"}`}
                                                    alt="Logo de l'entreprise"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            "/images/default-logo.png";
                                                    }}
                                                />
                                            </div>

                                            {/* Zone de téléchargement */}
                                            <div className="mb-3">
                                                <label
                                                    className="form-label fw-semibold small"
                                                    style={{
                                                        color: "steelblue",
                                                    }}
                                                >
                                                    <i className="fas fa-upload me-1"></i>
                                                    Nouveau logo
                                                </label>
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="file"
                                                    id="formFile"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    onChange={(e) =>
                                                        setCompany_logo(
                                                            e.target.files[0],
                                                        )
                                                    }
                                                    style={{
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                                <small className="text-muted d-block mt-1">
                                                    Formats acceptés : PNG, JPG,
                                                    JPEG (max 2MB)
                                                </small>
                                            </div>

                                            {/* Bouton de mise à jour du logo */}
                                            <button
                                                type="button"
                                                className="btn w-100 py-2 fw-bold"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #20c997, #198764)",
                                                    color: "white",
                                                    borderRadius: "10px",
                                                    border: "none",
                                                    transition: "all 0.3s ease",
                                                }}
                                                onClick={updateCompanyLogo}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(-2px)";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 6px 16px rgba(32,201,151,0.3)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(0)";
                                                    e.currentTarget.style.boxShadow =
                                                        "none";
                                                }}
                                            >
                                                <i className="fas fa-cloud-upload-alt me-2"></i>
                                                Mettre à jour le logo
                                            </button>

                                            {/* Information supplémentaire */}
                                            <div
                                                className="mt-3 p-2 rounded-3"
                                                style={{
                                                    backgroundColor: "#e6f2f9",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                <i
                                                    className="fas fa-info-circle me-1"
                                                    style={{ color: "#20c997" }}
                                                ></i>
                                                <span className="text-muted">
                                                    Le logo apparaîtra sur les
                                                    rapports, les fiches de
                                                    suivi et les documents
                                                    officiels.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="tab-pane fade show"
                            id="custom-tabs-two-2"
                            role="tabpanel"
                            aria-labelledby="custom-tabs-two-2-tab"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4
                                    className="fw-bold mb-0"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-piggy-bank me-2"></i>
                                    Épargne & Adhésion
                                </h4>
                                <div className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Configuration des comptes et frais
                                </div>
                            </div>

                            <div className="row g-4">
                                {/* Colonne 1 - Comptes épargne */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-chart-line me-2"></i>
                                                Groupes de comptes épargne
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <form method="POST">
                                                <table
                                                    className="table table-borderless"
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        {/* Compte Courant */}
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                className="fw-semibold pt-2 pb-1"
                                                                style={{
                                                                    color: "#20c997",
                                                                }}
                                                            >
                                                                <i className="fas fa-credit-card me-1"></i>
                                                                Compte Courant
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "45%",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne
                                                                    compte
                                                                    Courant
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Ecompte_courant
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEcompte_courant(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    value={
                                                                        AdhesionEpID
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne
                                                                    Courant USD
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Ecompte_courant_usd
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEcompte_courant_usd(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne
                                                                    Courant FC
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Ecompte_courant_cdf
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEcompte_courant_cdf(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Epargne Débiteur */}
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                className="fw-semibold pt-3 pb-1"
                                                                style={{
                                                                    color: "#20c997",
                                                                }}
                                                            >
                                                                <i className="fas fa-hand-holding-usd me-1"></i>
                                                                Epargne Débiteur
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne
                                                                    Débiteur
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Edebiteur
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEdebiteur(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne
                                                                    Débiteur USD
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Edebiteur_usd
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEdebiteur_usd(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne
                                                                    Débiteur FC
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Edebiteur_fc
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEdebiteur_fc(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Epargne à la carte */}
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                className="fw-semibold pt-3 pb-1"
                                                                style={{
                                                                    color: "#20c997",
                                                                }}
                                                            >
                                                                <i className="fas fa-coins me-1"></i>
                                                                Epargne à la
                                                                carte
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne à la
                                                                    carte USD
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Etontine_usd
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEtontine_usd(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Epargne à la
                                                                    carte FC
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        Etontine_fc
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEtontine_fc(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Autres */}
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                className="fw-semibold pt-3 pb-1"
                                                                style={{
                                                                    color: "#20c997",
                                                                }}
                                                            >
                                                                <i className="fas fa-chart-simple me-1"></i>
                                                                Autres
                                                                paramètres
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Dépôt à
                                                                    terme
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        D_a_terme
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setD_a_terme(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    className="small fw-semibold"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Solde
                                                                    minimum
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={
                                                                        solde_minimum
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setsolde_minimum(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne 2 - Adhésion */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-user-plus me-2"></i>
                                                Adhésion
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <table
                                                className="table table-borderless"
                                                style={{ width: "100%" }}
                                            >
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                                width: "45%",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <i className="fas fa-hand-holding-usd me-1"></i>
                                                                Frais d'Adhésion
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={
                                                                    frais_adhesion
                                                                }
                                                                onChange={(e) =>
                                                                    setfrais_adhesion(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="OUI">
                                                                    OUI
                                                                </option>
                                                                <option value="NON">
                                                                    NON
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <i className="fas fa-chart-line me-1"></i>
                                                                Groupe parts
                                                                sociales
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    part_social
                                                                }
                                                                onChange={(e) =>
                                                                    setpart_social(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <i className="fas fa-ticket-alt me-1"></i>
                                                                Droit d'entrée
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    droit_entree
                                                                }
                                                                onChange={(e) =>
                                                                    setdroit_entree(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-print me-1"></i>
                                                            Comptes papeterie
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte papeterie
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_papeterie
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_papeterie(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte papeterie
                                                                FC
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_papeterie_fc
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_papeterie_fc(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte papeterie
                                                                USD
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_papeterie_usd
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_papeterie_usd(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-coins me-1"></i>
                                                            Valeurs
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Valeur droit
                                                                d'entrée
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    valeur_droit_entree
                                                                }
                                                                onChange={(e) =>
                                                                    setvaleur_droit_entree(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                V. droit
                                                                d'entrée
                                                                (Personne
                                                                Physique)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    valeur_droit_entree_pysique
                                                                }
                                                                onChange={(e) =>
                                                                    setvaleur_droit_entree_pysique(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                V. droit
                                                                d'entrée
                                                                (Personne
                                                                Morale)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    valeur_droit_entree_moral
                                                                }
                                                                onChange={(e) =>
                                                                    setvaleur_droit_entree_moral(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Valeur frais de
                                                                papeterie
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    valeur_frais_papeterie
                                                                }
                                                                onChange={(e) =>
                                                                    setvaleur_frais_papeterie(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne 3 - Virement et Suivi */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-exchange-alt me-2"></i>
                                                Virement & Suivi
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <table
                                                className="table table-borderless"
                                                style={{ width: "100%" }}
                                            >
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-2 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-exchange-alt me-1"></i>
                                                            Configuration
                                                            virement
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                                width: "45%",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Groupe compte
                                                                virement
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    groupe_c_virement
                                                                }
                                                                onChange={(e) =>
                                                                    setgroupe_c_virement(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Groupe compte
                                                                fond non servi
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    groupe_c_fond_non_servi
                                                                }
                                                                onChange={(e) =>
                                                                    setgroupe_c_fond_non_servi(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte revenu
                                                                virement USD
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_revenu_virement_usd
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_revenu_virement_usd(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte revenu
                                                                virement FC
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_revenu_virement_fc
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_revenu_virement_fc(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Taux TVA sur
                                                                virement (%)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    taux_tva_sur_vir
                                                                }
                                                                onChange={(e) =>
                                                                    settaux_tva_sur_vir(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Arrondir les
                                                                frais de
                                                                virement
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={
                                                                    arrondir_frais_vir
                                                                }
                                                                onChange={(e) =>
                                                                    setarrondir_frais_vir(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="OUI">
                                                                    OUI
                                                                </option>
                                                                <option value="NON">
                                                                    NON
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-chart-line me-1"></i>
                                                            Suivi des épargnes
                                                            radiées
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Epargnes
                                                                débiteurs radiés
                                                                USD
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    Edebiteur_radie_usd
                                                                }
                                                                onChange={(e) =>
                                                                    setEdebiteur_radie_usd(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Epargnes
                                                                débiteurs radiés
                                                                FC
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    Edebiteur_radie_fc
                                                                }
                                                                onChange={(e) =>
                                                                    setEdebiteur_radie_fc(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Engagements sur
                                                                Epargne USD
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    engagement_sur_eparg_usd
                                                                }
                                                                onChange={(e) =>
                                                                    setengagement_sur_eparg_usd(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Engagements sur
                                                                Epargne FC
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    engagement_sur_eparg_fc
                                                                }
                                                                onChange={(e) =>
                                                                    setengagement_sur_eparg_fc(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Récupération sur
                                                                E. radié USD
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    rec_sur_epargne_radie_usd
                                                                }
                                                                onChange={(e) =>
                                                                    setrec_sur_epargne_radie_usd(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Récupération sur
                                                                E. radié FC
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    rec_sur_epargne_radie_fc
                                                                }
                                                                onChange={(e) =>
                                                                    setrec_sur_epargne_radie_fc(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            style={{
                                                                padding:
                                                                    "20px 6px 6px",
                                                            }}
                                                        >
                                                            <button
                                                                className="btn w-100 py-2 fw-bold"
                                                                style={{
                                                                    background:
                                                                        "linear-gradient(135deg, #20c997, #198764)",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "10px",
                                                                    border: "none",
                                                                    transition:
                                                                        "all 0.3s ease",
                                                                }}
                                                                onClick={
                                                                    updateAdhesionEpargneConfig
                                                                }
                                                                onMouseEnter={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.transform =
                                                                        "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow =
                                                                        "0 6px 16px rgba(32,201,151,0.3)";
                                                                }}
                                                                onMouseLeave={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.transform =
                                                                        "translateY(0)";
                                                                    e.currentTarget.style.boxShadow =
                                                                        "none";
                                                                }}
                                                            >
                                                                {isloading2 ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                                        Mise à
                                                                        jour...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-save me-2"></i>
                                                                        Mettre à
                                                                        jour
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="tab-pane fade show"
                            id="custom-tabs-three-3"
                            role="tabpanel"
                            aria-labelledby="custom-tabs-three-3-tab"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4
                                    className="fw-bold mb-0"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-folder-open me-2"></i>
                                    Portefeuille
                                </h4>
                                <div className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Configuration des prêts et provisions
                                </div>
                            </div>

                            <div className="row g-4">
                                {/* Colonne 1 - Prêts non échus */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-chart-line me-2"></i>
                                                Prêts non échus
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <table
                                                className="table table-borderless"
                                                style={{ width: "100%" }}
                                            >
                                                <tbody>
                                                    {/* Prêt ordinaire */}
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-2 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-file-invoice me-1"></i>
                                                            Prêt ordinaire
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                                width: "50%",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt ordinaire
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_ordinanire
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_ordinanire(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt ordinaire
                                                                aux dirigeants
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_ordinanire_au_dirigent
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_ordinanire_au_dirigent(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt ordinaire
                                                                aux membres
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_ordinanire_au_membres
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_ordinanire_au_membres(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt ordinaire
                                                                aux agents
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_ordinanire_au_agents
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_ordinanire_au_agents(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>

                                                    {/* Prêt en billet delabré */}
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-file-invoice-dollar me-1"></i>
                                                            Prêt en billet
                                                            delabré
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt en billet
                                                                delabré
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_en_billet_delabre
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_en_billet_delabre(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt billet
                                                                delabré aux
                                                                dirigeants
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_en_billet_delabre_aux_dirigent
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_en_billet_delabre_aux_dirigent(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt billet
                                                                delabré aux
                                                                membres
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_en_billet_delabre_aux_membres
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_en_billet_delabre_aux_membres(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt billet
                                                                delabré aux
                                                                agents
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pre_en_billet_delabre_aux_agents
                                                                }
                                                                onChange={(e) =>
                                                                    setpre_en_billet_delabre_aux_agents(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>

                                                    {/* Prêt radiés */}
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-trash-alt me-1"></i>
                                                            Prêts radiés
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Groupe compte
                                                                prêt radié en HB
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    grpe_compte_pret_r_HB
                                                                }
                                                                onChange={(e) =>
                                                                    setgrpe_compte_pret_r_HB(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte charge
                                                                pour la
                                                                radiation
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_charge_radiation
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_charge_radiation(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte à
                                                                créditer en HB
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_a_credite_HB
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_a_credite_HB(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Compte à
                                                                créditer au
                                                                bilan
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    compte_a_credite_au_bilan
                                                                }
                                                                onChange={(e) =>
                                                                    setcompte_a_credite_au_bilan(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne 2 - Prêts en retard */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-clock me-2"></i>
                                                Prêts en retard
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <table
                                                className="table table-borderless"
                                                style={{ width: "100%" }}
                                            >
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-2 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-chart-line me-1"></i>
                                                            Prêt ordinaire en
                                                            retard
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                                width: "50%",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt ordinaire
                                                                en retard
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    pret_ordi_en_retard
                                                                }
                                                                onChange={(e) =>
                                                                    setpret_ordi_en_retard(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                1 à 30 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    un_a_30_jours
                                                                }
                                                                onChange={(e) =>
                                                                    setun_a_30_jours(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                31 à 60 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    trente_et_un_a_60_jours
                                                                }
                                                                onChange={(e) =>
                                                                    settrente_et_un_a_60_jours(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                61 à 90 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    soixante_et_un_a_90_jours
                                                                }
                                                                onChange={(e) =>
                                                                    setsoixante_et_un_a_90_jours(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                91 à 180 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    nonante_et_un_a_90_jours
                                                                }
                                                                onChange={(e) =>
                                                                    setnonante_et_un_a_90_jours(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Plus de 180
                                                                jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    plus_de_180_jours
                                                                }
                                                                onChange={(e) =>
                                                                    setplus_de_180_jours(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-file-invoice me-1"></i>
                                                            Prêt billet delabré
                                                            en retard
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Prêt en billet
                                                                delabré en
                                                                retard
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    p_billet_delabre_retard
                                                                }
                                                                onChange={(e) =>
                                                                    setp_billet_delabre_retard(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                1 à 30 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    un_a_30_jours_del
                                                                }
                                                                onChange={(e) =>
                                                                    setun_a_30_jours_del(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                31 à 60 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    trente_et_un_a_60_jours_del
                                                                }
                                                                onChange={(e) =>
                                                                    settrente_et_un_a_60_jours_del(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                61 à 90 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    soixante_et_un_a_90_jours_del
                                                                }
                                                                onChange={(e) =>
                                                                    setsoixante_et_un_a_90_jours_del(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                91 à 180 jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    nonante_et_un_a_180_jours_del
                                                                }
                                                                onChange={(e) =>
                                                                    setnonante_et_un_a_180_jours_del(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Plus de 180
                                                                jours
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    plus_de_180_jours_del
                                                                }
                                                                onChange={(e) =>
                                                                    setplus_de_180_jours_del(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne 3 - Provisions */}
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-percent me-2"></i>
                                                Provisions
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body p-3"
                                            style={{
                                                maxHeight: "600px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <table
                                                className="table table-borderless"
                                                style={{ width: "100%" }}
                                            >
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-2 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-chart-line me-1"></i>
                                                            Provision prêt
                                                            ordinaire
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                                width: "45%",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Provision
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    provision_pret_ordinaire
                                                                }
                                                                onChange={(e) =>
                                                                    setprovision_pret_ordinaire(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                1-30 jours (base
                                                                / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_un_a_30_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_un_a_30_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_1_30_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_1_30_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                31-60 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_trente_et_un_a_60_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_trente_et_un_a_60_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_31_60_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_31_60_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                61-90 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_soixante_et_un_a_90_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_soixante_et_un_a_90_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_61_90_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_61_90_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                91-180 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_nonante_et_un_a_180_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_nonante_et_un_a_180_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_91_180_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_91_180_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Plus 180 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_plus_180_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_plus_180_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_plus_180_jours
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_plus_180_jours(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pt-3 pb-1"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-file-invoice me-1"></i>
                                                            Provision prêt
                                                            billet delabré
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Provision
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={
                                                                    provision_pret_BD
                                                                }
                                                                onChange={(e) =>
                                                                    setprovision_pret_BD(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                1-30 jours (base
                                                                / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_un_a_30_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_un_a_30_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_1_30_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_1_30_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                31-60 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_trente_et_un_a_60_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_trente_et_un_a_60_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_31_60_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_31_60_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                61-90 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_soixante_et_un_a_90_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_soixante_et_un_a_90_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_61_90_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_61_90_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                91-180 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_nonante_et_un_a_180_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_nonante_et_un_a_180_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_91_180_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_91_180_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                Plus 180 jours
                                                                (base / %)
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "6px",
                                                            }}
                                                        >
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "50%",
                                                                    }}
                                                                    value={
                                                                        provision_plus_180_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovision_plus_180_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "30%",
                                                                    }}
                                                                    value={
                                                                        taux_provision_plus_180_jours_BD
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settaux_provision_plus_180_jours_BD(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="%"
                                                                />
                                                                <span className="small align-self-center">
                                                                    %
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            style={{
                                                                padding:
                                                                    "20px 6px 6px",
                                                            }}
                                                        >
                                                            <button
                                                                className="btn w-100 py-2 fw-bold"
                                                                style={{
                                                                    background:
                                                                        "linear-gradient(135deg, #20c997, #198764)",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "10px",
                                                                    border: "none",
                                                                    transition:
                                                                        "all 0.3s ease",
                                                                }}
                                                                onClick={
                                                                    updatePorteFeuilleConfig
                                                                }
                                                                onMouseEnter={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.transform =
                                                                        "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow =
                                                                        "0 6px 16px rgba(32,201,151,0.3)";
                                                                }}
                                                                onMouseLeave={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.transform =
                                                                        "translateY(0)";
                                                                    e.currentTarget.style.boxShadow =
                                                                        "none";
                                                                }}
                                                            >
                                                                {isloading3 ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                                        Mise à
                                                                        jour...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fas fa-save me-2"></i>
                                                                        Mettre à
                                                                        jour
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="tab-pane fade show"
                            id="custom-tabs-four-4"
                            role="tabpanel"
                            aria-labelledby="custom-tabs-four-4-tab"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4
                                    className="fw-bold mb-0"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-sliders-h me-2"></i>
                                    Autres paramètres
                                </h4>
                                <div className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Sécurité et gestion de l'application
                                </div>
                            </div>

                            <div className="row g-4">
                                {/* Colonne 1 - Sécurité */}
                                <div className="col-md-7">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-shield-alt me-2"></i>
                                                Sécurité
                                            </h6>
                                        </div>
                                        <div className="card-body p-4">
                                            <table
                                                className="table table-borderless"
                                                style={{ width: "100%" }}
                                            >
                                                <tbody>
                                                    {/* Expiration du mot de passe */}
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pb-2"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-key me-1"></i>
                                                            Expiration du mot de
                                                            passe
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                                width: "40%",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <i className="fas fa-hourglass-half me-1"></i>
                                                                Durée
                                                                d'expiration
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "100px",
                                                                    }}
                                                                    value={
                                                                        password_expired_days
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setpassword_expired_days(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-muted small">
                                                                    jours
                                                                </span>
                                                            </div>
                                                            <small className="text-muted d-block mt-1">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                Après cette
                                                                période,
                                                                l'utilisateur
                                                                devra changer
                                                                son mot de passe
                                                            </small>
                                                        </td>
                                                    </tr>

                                                    {/* Tentatives de connexion */}
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <i className="fas fa-sign-in-alt me-1"></i>
                                                                Tentatives de
                                                                connexion
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        width: "100px",
                                                                    }}
                                                                    value={
                                                                        login_attempt
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setlogin_attempt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-muted small">
                                                                    tentatives
                                                                </span>
                                                            </div>
                                                            <small className="text-muted d-block mt-1">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                Nombre de
                                                                tentatives avant
                                                                blocage du
                                                                compte
                                                            </small>
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td colSpan="2">
                                                            <hr className="my-2" />
                                                        </td>
                                                    </tr>

                                                    {/* Commission */}
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="fw-semibold pb-2"
                                                            style={{
                                                                color: "#20c997",
                                                            }}
                                                        >
                                                            <i className="fas fa-percent me-1"></i>
                                                            Commission
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <label
                                                                className="small fw-semibold"
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <i className="fas fa-eye me-1"></i>
                                                                Afficher le
                                                                champ de
                                                                commission
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="commissionSwitch"
                                                                    style={{
                                                                        width: "50px",
                                                                        height: "25px",
                                                                        cursor: "pointer",
                                                                    }}
                                                                    checked={
                                                                        showCommissionPanel
                                                                    }
                                                                    onChange={
                                                                        handleToggleChange
                                                                    }
                                                                />
                                                                <label
                                                                    className="form-check-label ms-2"
                                                                    htmlFor="commissionSwitch"
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    {showCommissionPanel
                                                                        ? "Activé"
                                                                        : "Désactivé"}
                                                                </label>
                                                            </div>
                                                            <small className="text-muted d-block mt-1">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                Affiche ou
                                                                masque le champ
                                                                de commission
                                                                dans les
                                                                opérations
                                                            </small>
                                                        </td>
                                                    </tr>

                                                    {/* Bouton de mise à jour */}
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            style={{
                                                                padding:
                                                                    "20px 8px 8px",
                                                            }}
                                                        >
                                                            <button
                                                                onClick={
                                                                    updateExpirateDays
                                                                }
                                                                className="btn w-100 py-2 fw-bold"
                                                                style={{
                                                                    background:
                                                                        "linear-gradient(135deg, #20c997, #198764)",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "10px",
                                                                    border: "none",
                                                                    transition:
                                                                        "all 0.3s ease",
                                                                }}
                                                                onMouseEnter={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.transform =
                                                                        "translateY(-2px)";
                                                                    e.currentTarget.style.boxShadow =
                                                                        "0 6px 16px rgba(32,201,151,0.3)";
                                                                }}
                                                                onMouseLeave={(
                                                                    e,
                                                                ) => {
                                                                    e.currentTarget.style.transform =
                                                                        "translateY(0)";
                                                                    e.currentTarget.style.boxShadow =
                                                                        "none";
                                                                }}
                                                            >
                                                                <i className="fas fa-save me-2"></i>
                                                                Mettre à jour
                                                                les paramètres
                                                                de sécurité
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne 2 - Clôture annuelle */}
                                <div className="col-md-5">
                                    <div className="card border-0 shadow-sm rounded-3 h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-calendar-alt me-2"></i>
                                                Clôture annuelle
                                            </h6>
                                        </div>
                                        <div className="card-body p-4 text-center">
                                            <div className="mb-4">
                                                <div
                                                    className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(220, 53, 69, 0.1)",
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-exclamation-triangle fa-3x"
                                                        style={{
                                                            color: "#dc3545",
                                                        }}
                                                    ></i>
                                                </div>
                                                <h5
                                                    className="fw-bold"
                                                    style={{ color: "#dc3545" }}
                                                >
                                                    Clôture de l'exercice
                                                </h5>
                                                <p
                                                    className="text-muted mt-2 mb-3"
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    Cette opération est{" "}
                                                    <strong className="text-danger">
                                                        irréversible
                                                    </strong>
                                                    . Une fois la clôture
                                                    effectuée,
                                                    <br />
                                                    les données de l'exercice
                                                    précédent seront figées et
                                                    ne pourront plus être
                                                    modifiées.
                                                </p>
                                                <div
                                                    className="alert alert-warning py-2 mb-3"
                                                    style={{ fontSize: "13px" }}
                                                >
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Assurez-vous d'avoir
                                                    effectué toutes les
                                                    vérifications avant de
                                                    procéder à la clôture
                                                </div>
                                            </div>

                                            <button
                                                onClick={clotureAnuelle}
                                                className="btn btn-danger px-5 py-2 fw-bold"
                                                style={{
                                                    borderRadius: "10px",
                                                    transition: "all 0.3s ease",
                                                    fontSize: "16px",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(-2px)";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 6px 16px rgba(220, 53, 69, 0.3)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform =
                                                        "translateY(0)";
                                                    e.currentTarget.style.boxShadow =
                                                        "none";
                                                }}
                                            >
                                                <i className="fas fa-lock me-2"></i>
                                                Clôturer l'exercice
                                            </button>

                                            <hr className="my-4" />

                                            <div className="text-start">
                                                <small className="text-muted fw-semibold">
                                                    <i className="fas fa-list-check me-1"></i>
                                                    Points de contrôle avant
                                                    clôture :
                                                </small>
                                                <ul
                                                    className="text-muted small mt-2 mb-0"
                                                    style={{
                                                        paddingLeft: "20px",
                                                    }}
                                                >
                                                    <li>
                                                        Toutes les écritures
                                                        comptables sont validées
                                                    </li>
                                                    <li>
                                                        Les rapprochements
                                                        bancaires sont effectués
                                                    </li>
                                                    <li>
                                                        Les immobilisations sont
                                                        comptabilisées
                                                    </li>
                                                    <li>
                                                        Les inventaires sont
                                                        réalisés
                                                    </li>
                                                    <li>
                                                        Les états financiers
                                                        sont vérifiés
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="tab-pane fade show"
                            id="custom-tabs-five-5"
                            role="tabpanel"
                            aria-labelledby="custom-tabs-five-5-tab"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4
                                    className="fw-bold mb-0"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-table-list me-2"></i>
                                    Création des comptes internes
                                </h4>
                                <div className="text-muted small">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Gestion des plans comptables
                                </div>
                            </div>

                            {/* Formulaire de création de compte */}
                            <div className="card border-0 shadow-sm rounded-3 mb-4">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-plus-circle me-2"></i>
                                        Nouveau compte comptable
                                    </h6>
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Plan comptable OHADA - Classes 0 à 9
                                    </small>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-3">
                                        {/* Sélecteur du plan comptable */}
                                        <div className="col-md-12 mb-3">
                                            <label
                                                className="form-label small fw-semibold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-book me-1"></i>
                                                Plan comptable
                                            </label>
                                            <div className="d-flex gap-3">
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        id="planOhada"
                                                        value="OHADA"
                                                        checked={
                                                            planComptable ===
                                                            "OHADA"
                                                        }
                                                        onChange={() =>
                                                            setPlanComptable(
                                                                "OHADA",
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="planOhada"
                                                    >
                                                        OHADA
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        type="radio"
                                                        className="form-check-input"
                                                        id="planPcci"
                                                        value="PCCI"
                                                        checked={
                                                            planComptable ===
                                                            "PCCI"
                                                        }
                                                        onChange={() =>
                                                            setPlanComptable(
                                                                "PCCI",
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="planPcci"
                                                    >
                                                        PCCI (Plan Comptable
                                                        Congolais)
                                                    </label>
                                                </div>
                                            </div>
                                            <small className="text-muted">
                                                {planComptable === "OHADA"
                                                    ? "Classes 0 à 9 selon le système OHADA"
                                                    : "Saisie libre du code niveau 1 (ex: 3, 33, etc.)"}
                                            </small>
                                        </div>
                                        {/* Intitulé du compte */}
                                        <div className="col-md-12">
                                            <label
                                                className="form-label small fw-semibold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-tag me-1"></i>
                                                Intitulé du compte
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{
                                                    //   width: "100%",
                                                    borderRadius: "10px",
                                                    textTransform: "uppercase",
                                                }}
                                                value={IntituleCompteNew}
                                                onChange={(e) =>
                                                    setIntituleCompteNew(
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="Ex: Banque, Caisse, Fournisseurs, Clients, Salaires..."
                                            />
                                        </div>

                                        {/* Nature du compte (obligatoire pour PCCI) */}
                                        {planComptable === "PCCI" && (
                                            <div className="col-md-4">
                                                <label
                                                    className="form-label small fw-semibold"
                                                    style={{
                                                        color: "steelblue",
                                                    }}
                                                >
                                                    <i className="fas fa-balance-scale me-1"></i>
                                                    Nature comptable{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}
                                                    value={nature_compte}
                                                    onChange={(e) =>
                                                        setNature_compte(
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">
                                                        Sélectionnez la nature
                                                    </option>
                                                    <option value="ACTIF">
                                                        ACTIF (Biens, créances,
                                                        trésorerie)
                                                    </option>
                                                    <option value="PASSIF">
                                                        PASSIF (Dettes,
                                                        capitaux, épargne)
                                                    </option>
                                                    <option value="CHARGE">
                                                        CHARGE (Dépenses,
                                                        consommations)
                                                    </option>
                                                    <option value="PRODUIT">
                                                        PRODUIT (Revenus,
                                                        ventes)
                                                    </option>
                                                    <option value="">
                                                        HORS BILAN (Engagements,
                                                        garanties)
                                                    </option>
                                                </select>
                                                <small className="text-muted d-block mt-1">
                                                    {nature_compte ===
                                                        "ACTIF" &&
                                                        "Ce compte apparaîtra dans l'ACTIF du bilan"}
                                                    {nature_compte ===
                                                        "PASSIF" &&
                                                        "Ce compte apparaîtra dans le PASSIF du bilan"}
                                                    {nature_compte ===
                                                        "CHARGE" &&
                                                        "Ce compte apparaîtra dans les CHARGES du compte de résultat"}
                                                    {nature_compte ===
                                                        "PRODUIT" &&
                                                        "Ce compte apparaîtra dans les PRODUITS du compte de résultat"}
                                                    {nature_compte === "" &&
                                                        "Ce compte ne figurera ni au bilan ni au résultat (hors bilan)"}
                                                </small>
                                            </div>
                                        )}

                                        {/* Sélection du type de compte selon le plan comptable */}
                                        {/* Niveau 1 : Type/Cadre (selon plan comptable) */}
                                        <div className="col-md-4">
                                            <label
                                                className="form-label small fw-semibold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-chart-line me-1"></i>
                                                {planComptable === "OHADA"
                                                    ? "Classe OHADA (niveau 1)"
                                                    : "Classe / Type (niveau 1)"}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>

                                            {planComptable === "OHADA" ? (
                                                // --- Mode OHADA : sélection des classes 0-9 ---
                                                <select
                                                    className="form-select"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}
                                                    value={RefTypeCompte}
                                                    onChange={(e) => {
                                                        setRefTypeCompte(
                                                            e.target.value,
                                                        );
                                                        if (
                                                            e.target.value !==
                                                            "4"
                                                        ) {
                                                            setNature_compte(
                                                                "",
                                                            );
                                                        }
                                                    }}
                                                    required
                                                >
                                                    <option value="">
                                                        Sélectionnez la classe
                                                    </option>
                                                    <option value="0">
                                                        Classe 0 - Hors bilan →
                                                        HORS BILAN
                                                    </option>
                                                    <option value="1">
                                                        Classe 1 - Capitaux
                                                        propres (PASSIF) → BILAN
                                                    </option>
                                                    <option value="2">
                                                        Classe 2 -
                                                        Immobilisations (ACTIF)
                                                        → BILAN
                                                    </option>
                                                    <option value="3">
                                                        Classe 3 - Stocks
                                                        (ACTIF) → BILAN
                                                    </option>
                                                    <option value="4">
                                                        Classe 4 - Tiers
                                                        (Créances/Dettes) →
                                                        BILAN
                                                    </option>
                                                    <option value="5">
                                                        Classe 5 - Trésorerie
                                                        (ACTIF) → BILAN
                                                    </option>
                                                    <option value="6">
                                                        Classe 6 - Charges → TFR
                                                        (RÉSULTAT)
                                                    </option>
                                                    <option value="7">
                                                        Classe 7 - Produits →
                                                        TFR (RÉSULTAT)
                                                    </option>
                                                    <option value="8">
                                                        Classe 8 - Comptes
                                                        spéciaux → HORS BILAN
                                                    </option>
                                                    <option value="9">
                                                        Classe 9 - Comptes
                                                        d'ordre → HORS BILAN
                                                    </option>
                                                </select>
                                            ) : (
                                                // --- Mode PCCI : saisie libre du code niveau 1 ---
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{
                                                        borderRadius: "10px",
                                                    }}
                                                    value={RefTypeCompte}
                                                    onChange={(e) =>
                                                        setRefTypeCompte(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ex: 3, 33, 330, etc."
                                                    required
                                                />
                                            )}

                                            <small className="text-muted d-block mt-1">
                                                {planComptable === "OHADA" ? (
                                                    // Messages d'aide OHADA
                                                    <>
                                                        {RefTypeCompte ===
                                                            "0" &&
                                                            "📋 Comptes de hors bilan (Engagements, Garanties, Contreparties) → HORS BILAN"}
                                                        {RefTypeCompte ===
                                                            "1" &&
                                                            "📁 Capitaux propres, Réserves, Résultat net → BILAN (PASSIF)"}
                                                        {RefTypeCompte ===
                                                            "2" &&
                                                            "🏢 Immobilisations corporelles et incorporelles → BILAN (ACTIF)"}
                                                        {RefTypeCompte ===
                                                            "3" &&
                                                            "📦 Stocks de marchandises, matières premières → BILAN (ACTIF)"}
                                                        {RefTypeCompte ===
                                                            "4" &&
                                                            "👥 Clients, Fournisseurs, Personnel, Etat → Définir la nature ci-dessous"}
                                                        {RefTypeCompte ===
                                                            "5" &&
                                                            "🏦 Banques, Caisses, Chèques postaux → BILAN (ACTIF)"}
                                                        {RefTypeCompte ===
                                                            "6" &&
                                                            "📉 Charges (Salaires, Achats, Frais, Intérêts) → TFR (Compte de résultat)"}
                                                        {RefTypeCompte ===
                                                            "7" &&
                                                            "📈 Produits (Ventes, Revenus, Subventions) → TFR (Compte de résultat)"}
                                                        {RefTypeCompte ===
                                                            "8" &&
                                                            "⚠️ Comptes spéciaux (Engagements, Garanties, Crédit-bail) → HORS BILAN"}
                                                        {RefTypeCompte ===
                                                            "9" &&
                                                            "📋 Comptes d'ordre (Contreparties, Mémoire) → HORS BILAN"}
                                                    </>
                                                ) : (
                                                    // Message d'aide PCCI
                                                    "Saisissez le code de niveau 1 (classe) selon votre plan comptable (ex: 3 pour épargne, 1 pour capital, etc.)"
                                                )}
                                            </small>
                                        </div>

                                        {/* Nature du compte pour la classe 4 (Tiers) */}
                                        {RefTypeCompte === "4" && (
                                            <div className="col-md-4">
                                                <label
                                                    className="form-label small fw-semibold"
                                                    style={{
                                                        color: "steelblue",
                                                    }}
                                                >
                                                    <i className="fas fa-balance-scale me-1"></i>
                                                    Nature du compte{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <div className="d-flex gap-3 mt-1">
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            className="form-check-input"
                                                            id="nature_actif"
                                                            name="nature_compte"
                                                            value="ACTIF"
                                                            checked={
                                                                nature_compte ===
                                                                "ACTIF"
                                                            }
                                                            onChange={(e) =>
                                                                setNature_compte(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="nature_actif"
                                                        >
                                                            <i className="fas fa-arrow-right text-success me-1"></i>
                                                            ACTIF (Créance)
                                                        </label>
                                                        <br />
                                                        <small className="text-muted ms-4">
                                                            Ex: Clients, Avances
                                                            au personnel, TVA
                                                            récupérable
                                                        </small>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            type="radio"
                                                            className="form-check-input"
                                                            id="nature_passif"
                                                            name="nature_compte"
                                                            value="PASSIF"
                                                            checked={
                                                                nature_compte ===
                                                                "PASSIF"
                                                            }
                                                            onChange={(e) =>
                                                                setNature_compte(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="nature_passif"
                                                        >
                                                            <i className="fas fa-arrow-left text-danger me-1"></i>
                                                            PASSIF (Dette)
                                                        </label>
                                                        <br />
                                                        <small className="text-muted ms-4">
                                                            Ex: Fournisseurs,
                                                            Salaires à payer,
                                                            TVA due
                                                        </small>
                                                    </div>
                                                </div>
                                                <small className="text-muted d-block mt-2">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    {nature_compte ===
                                                        "ACTIF" &&
                                                        "Ce compte apparaîtra dans les CRÉANCES (ACTIF du bilan)"}
                                                    {nature_compte ===
                                                        "PASSIF" &&
                                                        "Ce compte apparaîtra dans les DETTES (PASSIF du bilan)"}
                                                    {!nature_compte &&
                                                        "Veuillez sélectionner la nature du compte"}
                                                </small>
                                            </div>
                                        )}

                                        {/* Message pour les comptes hors bilan (classes 0, 8, 9) */}
                                        {(RefTypeCompte === "0" ||
                                            RefTypeCompte === "8" ||
                                            RefTypeCompte === "9") && (
                                            <div className="col-md-4">
                                                <div
                                                    className="p-3 rounded-3"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(108,117,125,0.1)",
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="fas fa-archive text-secondary"></i>
                                                        <span className="text-muted small">
                                                            <strong>
                                                                Compte hors
                                                                bilan
                                                            </strong>{" "}
                                                            - Ce compte
                                                            n'apparaîtra pas
                                                            dans le bilan ni
                                                            dans le compte de
                                                            résultat. Il est
                                                            utilisé pour le
                                                            suivi des
                                                            engagements,
                                                            garanties et
                                                            opérations hors
                                                            bilan.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cadre (2 chiffres) */}
                                        <div className="col-md-2">
                                            <label
                                                className="form-label small fw-semibold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-layer-group me-1"></i>
                                                Cadre (2 chiffres)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                value={RefCadre}
                                                onChange={(e) =>
                                                    setRefCadre(e.target.value)
                                                }
                                                placeholder="Ex: 70"
                                            />
                                            <small className="text-muted">
                                                Ex: 00, 10, 20, 30, 40, 50, 60,
                                                70, 80, 90
                                            </small>
                                        </div>

                                        {/* Groupe (3 chiffres) */}
                                        <div className="col-md-2">
                                            <label
                                                className="form-label small fw-semibold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-folder me-1"></i>
                                                Groupe (3 chiffres)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                value={RefGroupe}
                                                onChange={(e) =>
                                                    setRefGroupe(e.target.value)
                                                }
                                                placeholder="Ex: 700"
                                            />
                                            <small className="text-muted">
                                                Ex: 000, 100, 200, 300, 400,
                                                500, 600, 700, 800, 900
                                            </small>
                                        </div>

                                        {/* Sous-groupe (4 chiffres) */}
                                        <div className="col-md-2">
                                            <label
                                                className="form-label small fw-semibold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-folder-open me-1"></i>
                                                Sous-groupe (4 chiffres)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                value={RefSousGroupe}
                                                onChange={(e) =>
                                                    setRefSousGroupe(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex: 7000"
                                            />
                                            <small className="text-muted">
                                                Ex: 0000, 1000, 2000, 3000,
                                                4000, 5000, 6000, 7000, 8000,
                                                9000
                                            </small>
                                        </div>

                                        {/* Numéro complet suggéré */}
                                        {RefCadre &&
                                            RefGroupe &&
                                            RefSousGroupe && (
                                                <div className="col-md-2">
                                                    <label
                                                        className="form-label small fw-semibold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <i className="fas fa-hashtag me-1"></i>
                                                        Numéro complet
                                                    </label>
                                                    <div
                                                        className="p-2 bg-light rounded-3 text-center"
                                                        style={{
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >
                                                        <code className="fw-bold fs-5">
                                                            {/* {RefCadre}{RefGroupe?.slice(-1)}{RefSousGroupe?.slice(-2)} */}
                                                            {RefSousGroupe}
                                                        </code>
                                                    </div>
                                                    <small className="text-muted">
                                                        Numéro unique du compte
                                                    </small>
                                                </div>
                                            )}

                                        {/* Résumé de la classification */}
                                        {(RefTypeCompte || nature_compte) && (
                                            <div className="col-md-12 mt-2">
                                                <div
                                                    className="p-3 rounded-3"
                                                    style={{
                                                        backgroundColor:
                                                            RefTypeCompte ===
                                                                "0" ||
                                                            RefTypeCompte ===
                                                                "8" ||
                                                            RefTypeCompte ===
                                                                "9"
                                                                ? "rgba(108,117,125,0.1)"
                                                                : RefTypeCompte ===
                                                                        "4" &&
                                                                    nature_compte ===
                                                                        "ACTIF"
                                                                  ? "rgba(40,167,69,0.1)"
                                                                  : RefTypeCompte ===
                                                                          "4" &&
                                                                      nature_compte ===
                                                                          "PASSIF"
                                                                    ? "rgba(220,53,69,0.1)"
                                                                    : RefTypeCompte ===
                                                                            "6" ||
                                                                        RefTypeCompte ===
                                                                            "7"
                                                                      ? "rgba(23,162,184,0.1)"
                                                                      : "rgba(32,201,151,0.1)",
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                                        <i
                                                            className={`fas fa-${
                                                                RefTypeCompte ===
                                                                    "0" ||
                                                                RefTypeCompte ===
                                                                    "8" ||
                                                                RefTypeCompte ===
                                                                    "9"
                                                                    ? "archive"
                                                                    : RefTypeCompte ===
                                                                            "4" &&
                                                                        nature_compte ===
                                                                            "ACTIF"
                                                                      ? "arrow-right"
                                                                      : RefTypeCompte ===
                                                                              "4" &&
                                                                          nature_compte ===
                                                                              "PASSIF"
                                                                        ? "arrow-left"
                                                                        : RefTypeCompte ===
                                                                                "6" ||
                                                                            RefTypeCompte ===
                                                                                "7"
                                                                          ? "chart-line"
                                                                          : "chart-simple"
                                                            } fa-lg`}
                                                            style={{
                                                                color:
                                                                    RefTypeCompte ===
                                                                        "0" ||
                                                                    RefTypeCompte ===
                                                                        "8" ||
                                                                    RefTypeCompte ===
                                                                        "9"
                                                                        ? "#6c757d"
                                                                        : RefTypeCompte ===
                                                                                "4" &&
                                                                            nature_compte ===
                                                                                "ACTIF"
                                                                          ? "#28a745"
                                                                          : RefTypeCompte ===
                                                                                  "4" &&
                                                                              nature_compte ===
                                                                                  "PASSIF"
                                                                            ? "#dc3545"
                                                                            : RefTypeCompte ===
                                                                                    "6" ||
                                                                                RefTypeCompte ===
                                                                                    "7"
                                                                              ? "#17a2b8"
                                                                              : "#20c997",
                                                            }}
                                                        ></i>
                                                        <div>
                                                            <strong>
                                                                {RefTypeCompte ===
                                                                    "0" &&
                                                                    "📋 Comptes hors bilan → HORS BILAN (Engagements, Garanties)"}
                                                                {RefTypeCompte ===
                                                                    "1" &&
                                                                    "📁 Capitaux propres → BILAN (PASSIF)"}
                                                                {RefTypeCompte ===
                                                                    "2" &&
                                                                    "🏢 Immobilisations → BILAN (ACTIF)"}
                                                                {RefTypeCompte ===
                                                                    "3" &&
                                                                    "📦 Stocks → BILAN (ACTIF)"}
                                                                {RefTypeCompte ===
                                                                    "4" &&
                                                                    nature_compte ===
                                                                        "ACTIF" &&
                                                                    "💰 Créances (Clients, Avances) → BILAN (ACTIF)"}
                                                                {RefTypeCompte ===
                                                                    "4" &&
                                                                    nature_compte ===
                                                                        "PASSIF" &&
                                                                    "💳 Dettes (Fournisseurs, Salaires) → BILAN (PASSIF)"}
                                                                {RefTypeCompte ===
                                                                    "5" &&
                                                                    "🏦 Trésorerie → BILAN (ACTIF)"}
                                                                {RefTypeCompte ===
                                                                    "6" &&
                                                                    "📉 Charges → TFR (Compte de résultat)"}
                                                                {RefTypeCompte ===
                                                                    "7" &&
                                                                    "📈 Produits → TFR (Compte de résultat)"}
                                                                {RefTypeCompte ===
                                                                    "8" &&
                                                                    "⚠️ Comptes spéciaux (Engagements) → HORS BILAN"}
                                                                {RefTypeCompte ===
                                                                    "9" &&
                                                                    "📋 Comptes d'ordre → HORS BILAN"}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Boutons d'action */}
                                        <div className="col-md-12 mt-3">
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn px-4 py-2 fw-bold"
                                                    style={{
                                                        background:
                                                            !RefTypeCompte ||
                                                            (RefTypeCompte ===
                                                                "4" &&
                                                                !nature_compte)
                                                                ? "#adb5bd"
                                                                : "linear-gradient(135deg, #20c997, #198764)",
                                                        color: "white",
                                                        borderRadius: "10px",
                                                        border: "none",
                                                        transition:
                                                            "all 0.3s ease",
                                                        cursor:
                                                            !RefTypeCompte ||
                                                            (RefTypeCompte ===
                                                                "4" &&
                                                                !nature_compte)
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                    onClick={saveNewCompte}
                                                    disabled={
                                                        !RefTypeCompte ||
                                                        (RefTypeCompte ===
                                                            "4" &&
                                                            !nature_compte)
                                                    }
                                                    onMouseEnter={(e) => {
                                                        if (
                                                            RefTypeCompte &&
                                                            !(
                                                                RefTypeCompte ===
                                                                    "4" &&
                                                                !nature_compte
                                                            )
                                                        ) {
                                                            e.currentTarget.style.transform =
                                                                "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow =
                                                                "0 6px 16px rgba(32,201,151,0.3)";
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (
                                                            RefTypeCompte &&
                                                            !(
                                                                RefTypeCompte ===
                                                                    "4" &&
                                                                !nature_compte
                                                            )
                                                        ) {
                                                            e.currentTarget.style.transform =
                                                                "translateY(0)";
                                                            e.currentTarget.style.boxShadow =
                                                                "none";
                                                        }
                                                    }}
                                                >
                                                    {isloading4 ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Validation...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            Valider
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary px-4 py-2 fw-bold"
                                                    style={{
                                                        borderRadius: "10px",
                                                        transition:
                                                            "all 0.3s ease",
                                                    }}
                                                    onClick={addNewAccount}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform =
                                                            "translateY(-2px)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform =
                                                            "translateY(0)";
                                                    }}
                                                >
                                                    <i className="fas fa-plus-circle me-2"></i>
                                                    Ajouter
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons de chargement */}
                            <div className="d-flex gap-3 mb-4 flex-wrap">
                                <button
                                    onClick={ChargeCompte}
                                    className="btn px-4 py-2 fw-bold"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #20c997, #198764)",
                                        color: "white",
                                        borderRadius: "10px",
                                        border: "none",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 6px 16px rgba(32,201,151,0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                        e.currentTarget.style.boxShadow =
                                            "none";
                                    }}
                                >
                                    <i className="fas fa-database me-2"></i>
                                    Charger les comptes internes
                                </button>
                                <button
                                    onClick={ChargeCompteEpargne}
                                    className="btn px-4 py-2 fw-bold"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #17a2b8, #138496)",
                                        color: "white",
                                        borderRadius: "10px",
                                        border: "none",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 6px 16px rgba(23,162,184,0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                        e.currentTarget.style.boxShadow =
                                            "none";
                                    }}
                                >
                                    <i className="fas fa-chart-line me-2"></i>
                                    Charger les comptes épargne
                                </button>
                            </div>

                            {/* Tableau des comptes internes */}
                            {fetchCreatedAccount && (
                                <div className="card border-0 shadow-sm rounded-3 mb-4">
                                    <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h6
                                            className="fw-bold mb-0"
                                            style={{ color: "steelblue" }}
                                        >
                                            <i className="fas fa-list me-2"></i>
                                            Liste des comptes internes
                                        </h6>
                                        <div className="text-muted small">
                                            <i className="fas fa-chart-simple me-1"></i>
                                            Total: {fetchCreatedAccount.length}{" "}
                                            compte(s)
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table
                                                className="table table-hover mb-0"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <thead
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <tr
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <th>#</th>
                                                        <th>Numéro compte</th>
                                                        <th>Intitulé</th>
                                                        <th>Type</th>
                                                        <th>Cadre</th>
                                                        <th>Groupe</th>
                                                        <th>Sous-groupe</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fetchCreatedAccount.map(
                                                        (res, index) => (
                                                            <tr key={index}>
                                                                <td className="fw-semibold">
                                                                    {index + 1}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.NumCompte
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.NomCompte
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.RefTypeCompte
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.RefCadre
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.RefGroupe
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.RefSousGroupe
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white border-0 pt-2 pb-3">
                                        <div className="d-flex justify-content-end">
                                            <button
                                                onClick={() =>
                                                            downloadReport(
                                                                "excel"
                                                            )
                                                        }
                                                className="btn btn-sm"
                                                style={{
                                                    background: "#28a745",
                                                    color: "white",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                <i className="fas fa-file-excel me-1"></i>
                                                Exporter Excel
                                            </button>
                                            <button
                                                 onClick={() =>
                                                            downloadReport(
                                                                "pdf"
                                                            )
                                                        }
                                                className="btn btn-sm ms-2"
                                                style={{
                                                    background: "#dc3545",
                                                    color: "white",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                <i className="fas fa-file-pdf me-1"></i>
                                                Exporter PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tableau des comptes épargne avec pagination */}
                            {fetchCompteEpargne && currentItems && (
                                <div className="card border-0 shadow-sm rounded-3">
                                    <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h6
                                            className="fw-bold mb-0"
                                            style={{ color: "steelblue" }}
                                        >
                                            <i className="fas fa-piggy-bank me-2"></i>
                                            Liste des comptes épargne
                                        </h6>
                                        <div className="text-muted small">
                                            <i className="fas fa-chart-simple me-1"></i>
                                            Affichage {indexOfFirstItem + 1} à{" "}
                                            {Math.min(
                                                indexOfLastItem,
                                                fetchCompteEpargne.length,
                                            )}{" "}
                                            sur {fetchCompteEpargne.length}
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table
                                                className="table table-hover mb-0"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <thead
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <tr
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <th>#</th>
                                                        <th>Numéro compte</th>
                                                        <th>Intitulé</th>
                                                        <th>Genre</th>
                                                        <th>Compte abrégé</th>
                                                        <th>Solde</th>
                                                        <th>Devise</th>
                                                        <th>
                                                            Dernière transaction
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map(
                                                        (res, index) => {
                                                            const compteur =
                                                                (currentPage -
                                                                    1) *
                                                                    itemsPerPage +
                                                                index +
                                                                1;
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            compteur
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            res.NumCompte
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            res.NomCompte
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            res.sexe
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            res.NumAdherant
                                                                        }
                                                                    </td>
                                                                    <td className="fw-bold text-success">
                                                                        {res.solde?.toFixed(
                                                                            2,
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className={`badge ${res.CodeMonnaie == 1 ? "bg-info" : "bg-success"}`}
                                                                        >
                                                                            {res.CodeMonnaie ==
                                                                            1
                                                                                ? "USD"
                                                                                : "CDF"}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {res.derniere_date_transaction ||
                                                                            "-"}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination moderne */}
                                    <div className="card-footer bg-white border-0 pt-3 pb-3">
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <div className="text-muted small">
                                                <i className="fas fa-info-circle me-1"></i>
                                                {fetchCompteEpargne.length}{" "}
                                                compte(s) au total
                                            </div>
                                            <nav aria-label="Pagination des comptes">
                                                <ul className="pagination pagination-sm mb-0">
                                                    <li
                                                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={
                                                                goToPrevPage
                                                            }
                                                            disabled={
                                                                currentPage ===
                                                                1
                                                            }
                                                        >
                                                            <i className="fas fa-chevron-left me-1"></i>
                                                            Précédent
                                                        </button>
                                                    </li>
                                                    {renderPagination()}
                                                    <li
                                                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={
                                                                goToNextPage
                                                            }
                                                            disabled={
                                                                currentPage ===
                                                                totalPages
                                                            }
                                                        >
                                                            Suivant
                                                            <i className="fas fa-chevron-right ms-1"></i>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                            <div className="d-flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        downloadReport("excel")
                                                    }
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: "#28a745",
                                                        color: "white",
                                                        borderRadius: "8px",
                                                    }}
                                                >
                                                    <i className="fas fa-file-excel me-1"></i>
                                                    Excel
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        downloadReport("pdf")
                                                    }
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: "#dc3545",
                                                        color: "white",
                                                        borderRadius: "8px",
                                                    }}
                                                >
                                                    <i className="fas fa-file-pdf me-1"></i>
                                                    PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comptes;
