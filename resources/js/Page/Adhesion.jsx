import styles from "../styles/RegisterForm.module.css";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Adhesion = () => {
    const [adhesion, setAdhesion] = useState({
        agence: "",
        code_monnaie: "CDF",
        type_epargne: "",
        type_client: "",
        intitule_compte: "",
        lieu_naissance: "",
        date_naissance: "",
        etat_civile: "",
        nom_condjoint: "",
        nom_pere: "",
        nom_mere: "",
        profession: "",
        lieu_travail: "",
        civilite: "",
        sexe: "",
        email: "",
        telephone: "",
        type_piece: "",
        num_piece: "",
        lieu_devivraison_piece: "",
        province: "",
        territoire_ou_ville: "",
        commune: "",
        quartier: "",
        type_de_gestion: "",
        critere: "",
    });
    const [isLoading1, setIsloading1] = useState(false);
    const [isLoading2, setIsloading2] = useState(false);
    const [error, setError] = useState([]);

    ///UPDATE ATTRIBUTE

    const [agence, setagence] = useState();
    const [code_monnaie, setcode_monnaie] = useState();
    const [type_epargne, settype_epargne] = useState();
    const [type_client, settype_client] = useState();
    const [intitule_compte, setintitule_compte] = useState();
    const [lieu_naissance, setlieu_naissance] = useState();
    const [date_naissance, setdate_naissance] = useState();
    const [etat_civile, setetat_civile] = useState();
    const [nom_condjoint, setnom_condjoint] = useState();
    const [nom_pere, setnom_pere] = useState();
    const [nom_mere, setnom_mere] = useState();
    const [profession, setprofession] = useState();
    const [lieu_travail, setlieu_travail] = useState();
    const [civilite, setcivilite] = useState();
    const [sexe, setsexe] = useState();
    const [email, setemail] = useState();
    const [telephone, settelephone] = useState();
    const [type_piece, settype_piece] = useState();
    const [num_piece, setnum_piece] = useState();
    const [lieu_devivraison_piece, setlieu_devivraison_piece] = useState();
    const [province, setprovince] = useState();
    const [territoire_ou_ville, setterritoire_ou_ville] = useState();
    const [commune, setcommune] = useState();
    const [quartier, setquartier] = useState();
    const [type_de_gestion, settype_de_gestion] = useState();
    const [critere, setcritere] = useState();
    const [compte_to_search, setcompte_to_search] = useState();
    const [signature_image_file, setsignature_image_file] = useState();
    const [signature_file, setsignature_file] = useState();

    //ACTIVATION COMPTE ATTRIBUTE
    const [devise_compte, setdevise_compte] = useState("CDF");
    const [mandataireName, setmandataireName] = useState();
    const [mandatairePhone, setmandatairePhone] = useState();
    const [fetchMandataire, setFetchMandataire] = useState();

    //ENREGISTRE LES DONNEES POUR LE NOUVEAU MEMBRE CREE
    const handleSubmitAdhesion = async (e) => {
        e.preventDefault();
        setIsloading1(true);
        const res = await axios.post("/eco/page/adhesion-membre", adhesion);
        if (res.data.status == 1) {
            setIsloading1(false);
            adhesion.intitule_compte = "";
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setIsloading1(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading1(false);
            setError(res.data.validate_error);
            console.log(res.data.validate_error);
        }
    };
    //PERMET DE RECUPERER LE MANDATAIRE ASSOCIE A UN COMPTE

    const getMandataires = async () => {
        // e.preventDefault();
        const res = await axios.post("/eco/pages/adhesion/get-mandaitre", {
            compte_to_search: compte_to_search,
        });
        if (res.data.status == 1) {
            setFetchMandataire(res.data.data);
            console.log(fetchMandataire);
        } else {
            console.log("something went rwong");
        }
    };

    //GET DATA TO UPDATE
    const getSeachedData = async (e) => {
        e.preventDefault();

        //console.log(compte_to_search);
        const res = await axios.post("/eco/page/adhesion/get-searched-item", {
            compte_to_search,
        });
        if (res.data.status == 1) {
            getMandataires(); //AFFICHE LES MANDATAIRES ASSOCIE A UN COMPTE
            setagence(res.data.data.agence);
            setcode_monnaie(res.data.data.code_monnaie);
            settype_epargne(res.data.data.type_epargne);
            settype_client(res.data.data.type_client);
            setintitule_compte(res.data.data.intitule_compte);
            setlieu_naissance(res.data.data.lieu_naissance);
            setdate_naissance(res.data.data.date_naissance);
            setetat_civile(res.data.data.etat_civile);
            setnom_condjoint(res.data.data.nom_condjoint);
            setnom_pere(res.data.data.nom_pere);
            setnom_mere(res.data.data.nom_mere);
            setprofession(res.data.data.profession);
            setlieu_travail(res.data.data.lieu_travail);
            setcivilite(res.data.data.civilite);
            setsexe(res.data.data.sexe);
            setemail(res.data.data.email);
            settelephone(res.data.data.telephone);
            settype_piece(res.data.data.type_piece);
            setnum_piece(res.data.data.num_piece);
            setlieu_devivraison_piece(res.data.data.lieu_devivraison_piece);
            setprovince(res.data.data.province);
            setterritoire_ou_ville(res.data.data.territoire_ou_ville);
            setcommune(res.data.data.commune);
            setquartier(res.data.data.quartier);
            settype_de_gestion(res.data.data.type_de_gestion);
            setcritere(res.data.data.critere);
            // setFetchDataToUpdate(res.data.data);
            setsignature_file(res.data.data.signature_image_file);
        } else if (res.data.status == 0) {
            setIsloading2(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                confirmButtonText: "Okay",
            });
        }
    };

    const handleSubmitAdhesionUpdate = async (e) => {
        e.preventDefault();
        setIsloading2(true);
        const res = await axios.post("/eco/page/adhesion-membre/update", {
            compte_to_search,
            type_epargne,
            type_client,
            intitule_compte,
            lieu_naissance,
            date_naissance,
            etat_civile,
            nom_condjoint,
            nom_pere,
            nom_mere,
            profession,
            lieu_travail,
            civilite,
            sexe,
            email,
            telephone,
            type_piece,
            num_piece,
            lieu_devivraison_piece,
            province,
            territoire_ou_ville,
            commune,
            quartier,
            type_de_gestion,
            critere,
        });
        if (res.data.status == 1) {
            setIsloading2(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setIsloading2(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading2(false);
            setError(res.data.validate_error);
        }
    };

    const updateMembreSignature = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("signature_image_file", signature_image_file);
            formData.append("compte_to_search", compte_to_search);
            const config = {
                Headers: {
                    accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.8",
                    "content-type": "multipart/form-data",
                },
            };

            const url = "/eco/page/adhesion/edit-signature";
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
    //CREATE NEW ACCOUNT FOR USER
    const createAccount = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/adhesion/creation-compte", {
            compteAbrege: compte_to_search,
            devise_compte: devise_compte,
        });
        console.log(res.data.status);
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    const AjouterMandataire = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/pages/adhesion/ajout-mandataire", {
            compteAbrege: compte_to_search,
            mandataireName,
            mandatairePhone,
        });
        if (res.data.status == 1) {
            getMandataires(); //AFFICHE LES MANDATAIRES ASSOCIE A UN COMPTE
            setmandataireName("");
            setmandatairePhone("");
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };
    //PERMET DE SUPPRIMER UN MANDATAIRE
    const DeleteMandataire = async (id) => {
        Swal.fire({
            title: "Confirmation !",
            text: "Etes vous sûr de supprimer ce mandataire ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui supprimer!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.get(
                        "/eco/pages/adhesion/suppression-mandataire/" + id,
                    );
                    if (res.data.status === 1) {
                        getMandataires(); //MET AJOUR LE TABLEAU APRES SUPPRESSION
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
                    Swal.fire({
                        title: "Erreur",
                        text: "Une erreur est survenue .",
                        icon: "error",
                        timer: 8000,
                        confirmButtonText: "Okay",
                    });
                    console.error(error);
                }
            }
        });
    };
    return (
        <div
            className="container-fluid"
            style={{ marginTop: "10px", padding: "0 15px" }}
        >
            {/* En-tête moderne */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div
                            className="card-body p-3"
                            style={{
                                background: "#138496",
                                borderRadius: "12px",
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i
                                        className="fas fa-user-plus"
                                        style={{
                                            fontSize: "28px",
                                            color: "white",
                                        }}
                                    ></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">
                                        Adhésion des membres
                                    </h5>
                                    <small className="text-white-50">
                                        Gestion complète des adhésions et
                                        comptes membres
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Onglets modernisés */}
            <div className="card border-0 shadow-sm rounded-3">
                <ul
                    className="nav nav-tabs tabs-modern"
                    id="adhesionTabs"
                    role="tablist"
                >
                    <li className="nav-item">
                        <a
                            className="nav-link active"
                            id="info-base-tab"
                            data-toggle="pill"
                            href="#info-base"
                            role="tab"
                        >
                            <i className="fas fa-info-circle me-2"></i>
                            Informations de base
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="photo-signature-tab"
                            data-toggle="pill"
                            href="#photo-signature"
                            role="tab"
                        >
                            <i className="fas fa-camera me-2"></i>Photo et
                            signature
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="mandataire-tab"
                            data-toggle="pill"
                            href="#mandataire"
                            role="tab"
                        >
                            <i className="fas fa-users me-2"></i>Informations
                            mandataires
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="creation-compte-tab"
                            data-toggle="pill"
                            href="#creation-compte"
                            role="tab"
                        >
                            <i className="fas fa-credit-card me-2"></i>Création
                            comptes
                        </a>
                    </li>
                </ul>

                <div className="card-body">
                    <div className="tab-content">
                        {/* Onglet 1: Informations de base */}
                        <div
                            className="tab-pane fade show active"
                            id="info-base"
                            role="tabpanel"
                        >
                            {/* Nouveau membre */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-user-plus me-2"></i>
                                        Nouveau membre
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-5">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Agence
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`form-control ${error.agence ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                agence: e
                                                                                    .target
                                                                                    .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="SIEGE">
                                                                        SIEGE
                                                                    </option>
                                                                </select>
                                                                {error.agence && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.agence
                                                                        }
                                                                    </small>
                                                                )}
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Code monnaie
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    disabled
                                                                >
                                                                    <option value="CDF">
                                                                        CDF
                                                                    </option>
                                                                    <option value="USD">
                                                                        USD
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type épargne
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`form-control ${error.type_epargne ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_epargne:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Epargne à vie">
                                                                        Epargne
                                                                        à vie
                                                                    </option>
                                                                </select>
                                                                {error.type_epargne && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.type_epargne
                                                                        }
                                                                    </small>
                                                                )}
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type client
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`form-control ${error.type_client ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_client:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Personne pysique">
                                                                        Personne
                                                                        physique
                                                                    </option>
                                                                    <option value="Personne morale">
                                                                        Personne
                                                                        morale
                                                                    </option>
                                                                </select>
                                                                {error.type_client && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.type_client
                                                                        }
                                                                    </small>
                                                                )}
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Nom compte
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
                                                                    className={`form-control ${error.intitule_compte ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                intitule_compte:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    value={
                                                                        adhesion.intitule_compte
                                                                    }
                                                                />
                                                                {error.intitule_compte && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.intitule_compte
                                                                        }
                                                                    </small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section IDENTITE et ADRESSE */}
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-id-card me-2"></i>
                                                IDENTITÉ
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body"
                                            style={{
                                                maxHeight: "500px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        {[
                                                            {
                                                                label: "Lieu de naissance",
                                                                field: "lieu_naissance",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Date de naissance",
                                                                field: "date_naissance",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Nom du père",
                                                                field: "nom_pere",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Nom de la mère",
                                                                field: "nom_mere",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Profession",
                                                                field: "profession",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Lieu de travail",
                                                                field: "lieu_travail",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Email",
                                                                field: "email",
                                                                type: "email",
                                                            },
                                                            {
                                                                label: "Téléphone",
                                                                field: "telephone",
                                                                type: "tel",
                                                            },
                                                            {
                                                                label: "Num pièce",
                                                                field: "num_piece",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Délivée à",
                                                                field: "lieu_devivraison_piece",
                                                                type: "text",
                                                            },
                                                        ].map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        width: "45%",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                            fontWeight:
                                                                                "500",
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </label>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type={
                                                                            item.type
                                                                        }
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAdhesion(
                                                                                (
                                                                                    p,
                                                                                ) => ({
                                                                                    ...p,
                                                                                    [item.field]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        value={
                                                                            adhesion[
                                                                                item
                                                                                    .field
                                                                            ]
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    État civile
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                etat_civile:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    value={
                                                                        adhesion.etat_civile
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Marié(e)">
                                                                        Marié(e)
                                                                    </option>
                                                                    <option value="Célibateur">
                                                                        Célibataire
                                                                    </option>
                                                                    <option value="Veuf(ve)">
                                                                        Veuf(ve)
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        {adhesion.etat_civile ===
                                                            "Marié(e)" && (
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                            fontWeight:
                                                                                "500",
                                                                        }}
                                                                    >
                                                                        Marié(e)
                                                                        à
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
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAdhesion(
                                                                                (
                                                                                    p,
                                                                                ) => ({
                                                                                    ...p,
                                                                                    nom_condjoint:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        value={
                                                                            adhesion.nom_condjoint
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Civilité
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                civilite:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Monsieur">
                                                                        Monsieur
                                                                    </option>
                                                                    <option value="Madame">
                                                                        Madame
                                                                    </option>
                                                                    <option value="Mademoiselle">
                                                                        Mademoiselle
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Sexe
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                sexe: e
                                                                                    .target
                                                                                    .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Homme">
                                                                        Homme
                                                                    </option>
                                                                    <option value="Femme">
                                                                        Femme
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type pièce
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_piece:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Carte d'électeur">
                                                                        Carte
                                                                        d'électeur
                                                                    </option>
                                                                    <option value="pass port">
                                                                        Passeport
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                ADRESSE
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Province
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                province:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    {[
                                                                        "Kinshasa",
                                                                        "Haut-katanga",
                                                                        "Nord-Kivu",
                                                                        "Sud-Kivu",
                                                                        "Lualaba",
                                                                        "Equateur",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Maniema",
                                                                        "Ituri",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Kasai-Oiental",
                                                                        "Congo-Central",
                                                                        "Kwango",
                                                                        "Kwilu",
                                                                        "Lomami",
                                                                        "Mai-Ndombe",
                                                                        "Maniema",
                                                                        "Mongala",
                                                                        "Nord-Ubangi",
                                                                        "Sud-Ubangi",
                                                                        "Tanganyika",
                                                                        "Tshopo",
                                                                        "Tshapa",
                                                                    ].map(
                                                                        (
                                                                            prov,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    prov
                                                                                }
                                                                                value={
                                                                                    prov
                                                                                }
                                                                            >
                                                                                {
                                                                                    prov
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Territoire
                                                                    ou ville
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
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                territoire_ou_ville:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Secteur chef
                                                                    ou com.
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
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                commune:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Quartier
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
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                quartier:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
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

                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-chart-line me-2"></i>
                                                AUTRES INFORMATIONS
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type de
                                                                    gestion
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_de_gestion:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Individuel">
                                                                        Individuel
                                                                    </option>
                                                                    <option value="Collectif">
                                                                        Collectif
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Critère
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`form-control ${error.critere ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                critere:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="A">
                                                                        A
                                                                    </option>
                                                                    <option value="B">
                                                                        B
                                                                    </option>
                                                                    <option value="C">
                                                                        C
                                                                    </option>
                                                                    <option value="D">
                                                                        D
                                                                    </option>
                                                                    <option value="Autre">
                                                                        Autre
                                                                    </option>
                                                                </select>
                                                                {error.critere && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.critere
                                                                        }
                                                                    </small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        handleSubmitAdhesion
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${isLoading1 ? "spinner-border spinner-border-sm me-2" : "fas fa-save me-2"}`}
                                                                    ></i>
                                                                    Enregistrer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Onglet 2: Photo et signature (Modification compte) */}
                        <div
                            className="tab-pane fade"
                            id="photo-signature"
                            role="tabpanel"
                        >
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-edit me-2"></i>
                                                Modification compte
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte
                                                                    abrégé
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div className="d-flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "8px",
                                                                            width: "120px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setcompte_to_search(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                    <button
                                                                        className="btn"
                                                                        style={{
                                                                            background:
                                                                                "#138496",
                                                                            color: "white",
                                                                            borderRadius:
                                                                                "8px",
                                                                        }}
                                                                        onClick={
                                                                            getSeachedData
                                                                        }
                                                                    >
                                                                        <i className="fas fa-search me-1"></i>
                                                                        Rechercher
                                                                    </button>
                                                                </div>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Code monnaie
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    value={
                                                                        code_monnaie
                                                                    }
                                                                    disabled
                                                                >
                                                                    <option value="CDF">
                                                                        CDF
                                                                    </option>
                                                                    <option value="USD">
                                                                        USD
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type épargne
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settype_epargne(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        type_epargne
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            type_epargne
                                                                        }
                                                                    >
                                                                        {
                                                                            type_epargne
                                                                        }
                                                                    </option>
                                                                    <option value="Epargne à vie">
                                                                        Epargne
                                                                        à vie
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type client
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settype_client(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        type_client
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            type_client
                                                                        }
                                                                    >
                                                                        {
                                                                            type_client
                                                                        }
                                                                    </option>
                                                                    <option value="Personne pysique">
                                                                        Personne
                                                                        physique
                                                                    </option>
                                                                    <option value="Personne morale">
                                                                        Personne
                                                                        morale
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Intitulé de
                                                                    compte
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
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setintitule_compte(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        intitule_compte
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

                                <div className="col-md-7">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-camera me-2"></i>
                                                Photo et signature
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            {signature_file && (
                                                <div className="mb-3">
                                                    <label
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        Signature actuelle
                                                    </label>
                                                    <iframe
                                                        src={`uploads/membres/signatures/files/${signature_file}`}
                                                        style={{
                                                            width: "100%",
                                                            height: "200px",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                        }}
                                                        title="Signature"
                                                    ></iframe>
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <label
                                                    className="fw-bold"
                                                    style={{
                                                        color: "steelblue",
                                                    }}
                                                >
                                                    Nouvelle signature
                                                </label>
                                                <div
                                                    className="drop-container p-4 text-center border-2 border-dashed rounded-3"
                                                    style={{
                                                        border: "2px dashed #138496",
                                                        background: "#f8f9fa",
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-cloud-upload-alt fa-2x mb-2"
                                                        style={{
                                                            color: "#138496",
                                                        }}
                                                    ></i>
                                                    <p className="mb-2">
                                                        Déposez votre fichier
                                                        ici ou
                                                    </p>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        accept="pdf/*,image/*"
                                                        onChange={(e) =>
                                                            setsignature_image_file(
                                                                e.target
                                                                    .files[0],
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={updateMembreSignature}
                                                className="btn w-100 py-2"
                                                style={{
                                                    background: "#138496",
                                                    color: "white",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                <i className="fas fa-upload me-2"></i>
                                                Mettre à jour
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section IDENTITE, ADRESSE et AUTRES pour modification (structure similaire avec les setters correspondants) */}
                            <div className="row g-3 mt-3">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                IDENTITÉ
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body"
                                            style={{
                                                maxHeight: "500px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        {[
                                                            {
                                                                label: "Lieu de naissance",
                                                                field: lieu_naissance,
                                                                setter: setlieu_naissance,
                                                            },
                                                            {
                                                                label: "Date de naissance",
                                                                field: date_naissance,
                                                                setter: setdate_naissance,
                                                            },
                                                            {
                                                                label: "Nom du père",
                                                                field: nom_pere,
                                                                setter: setnom_pere,
                                                            },
                                                            {
                                                                label: "Nom de la mère",
                                                                field: nom_mere,
                                                                setter: setnom_mere,
                                                            },
                                                            {
                                                                label: "Profession",
                                                                field: profession,
                                                                setter: setprofession,
                                                            },
                                                            {
                                                                label: "Lieu de travail",
                                                                field: lieu_travail,
                                                                setter: setlieu_travail,
                                                            },
                                                            {
                                                                label: "Email",
                                                                field: email,
                                                                setter: setemail,
                                                            },
                                                            {
                                                                label: "Téléphone",
                                                                field: telephone,
                                                                setter: settelephone,
                                                            },
                                                            {
                                                                label: "Num pièce",
                                                                field: num_piece,
                                                                setter: setnum_piece,
                                                            },
                                                            {
                                                                label: "Délivée à",
                                                                field: lieu_devivraison_piece,
                                                                setter: setlieu_devivraison_piece,
                                                            },
                                                        ].map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        width: "45%",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
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
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        value={
                                                                            item.field
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            item.setter(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    État civile
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setetat_civile(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        etat_civile
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Marié(e)">
                                                                        Marié(e)
                                                                    </option>
                                                                    <option value="Célibateur">
                                                                        Célibataire
                                                                    </option>
                                                                    <option value="Veuf(ve)">
                                                                        Veuf(ve)
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Civilité
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setcivilite(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        civilite
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Monsieur">
                                                                        Monsieur
                                                                    </option>
                                                                    <option value="Madame">
                                                                        Madame
                                                                    </option>
                                                                    <option value="Mademoiselle">
                                                                        Mademoiselle
                                                                    </option>
                                                                </select>
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
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Sexe
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setsexe(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={sexe}
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Homme">
                                                                        Homme
                                                                    </option>
                                                                    <option value="Femme">
                                                                        Femme
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                ADRESSE
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "45%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Province
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovince(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        province
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            province
                                                                        }
                                                                    >
                                                                        {
                                                                            province
                                                                        }
                                                                    </option>
                                                                    {[
                                                                        "Kinshasa",
                                                                        "Haut-katanga",
                                                                        "Nord-Kivu",
                                                                        "Sud-Kivu",
                                                                        "Lualaba",
                                                                        "Equateur",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Maniema",
                                                                        "Ituri",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Kasai-Oiental",
                                                                        "Congo-Central",
                                                                        "Kwango",
                                                                        "Kwilu",
                                                                        "Lomami",
                                                                        "Mai-Ndombe",
                                                                        "Maniema",
                                                                        "Mongala",
                                                                        "Nord-Ubangi",
                                                                        "Sud-Ubangi",
                                                                        "Tanganyika",
                                                                        "Tshopo",
                                                                        "Tshapa",
                                                                    ].map(
                                                                        (
                                                                            prov,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    prov
                                                                                }
                                                                                value={
                                                                                    prov
                                                                                }
                                                                            >
                                                                                {
                                                                                    prov
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                    {/* {["Kinshasa", "Haut-katanga", "Nord-Kivu", "Sud-Kivu"].map(p => <option key={p} value={p}>{p}</option>)} */}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Territoire
                                                                    ou ville
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setterritoire_ou_ville(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        territoire_ou_ville
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Secteur chef
                                                                    ou com.
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control mt-1"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setcommune(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        commune
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Quartier
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control mt-1"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setquartier(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        quartier
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
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                AUTRES INFORMATIONS
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "45%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Type de
                                                                    gestion
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settype_de_gestion(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        type_de_gestion
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            type_de_gestion
                                                                        }
                                                                    >
                                                                        {
                                                                            type_de_gestion
                                                                        }
                                                                    </option>
                                                                    <option value="Individuel">
                                                                        Individuel
                                                                    </option>
                                                                    <option value="Collectif">
                                                                        Collectif
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Critère
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setcritere(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        critere
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            critere
                                                                        }
                                                                    >
                                                                        {
                                                                            critere
                                                                        }
                                                                    </option>
                                                                    <option value="A">
                                                                        A
                                                                    </option>
                                                                    <option value="B">
                                                                        B
                                                                    </option>
                                                                    <option value="C">
                                                                        C
                                                                    </option>
                                                                    <option value="D">
                                                                        D
                                                                    </option>
                                                                    <option value="Autre">
                                                                        Autre
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        handleSubmitAdhesionUpdate
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${isLoading2 ? "spinner-border spinner-border-sm me-2" : "fas fa-save me-2"}`}
                                                                    ></i>
                                                                    Enregistrer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Onglet 3: Mandataires */}
                        <div
                            className="tab-pane fade"
                            id="mandataire"
                            role="tabpanel"
                        >
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-user-plus me-2"></i>
                                                Nouveau mandataire
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte
                                                                    abrégé
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                                                    <div className="d-flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "8px",
                                                                                width: "120px",
                                                                            }}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setcompte_to_search(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <button
                                                                            className="btn"
                                                                            style={{
                                                                                background:
                                                                                    "#138496",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                            onClick={
                                                                                getSeachedData
                                                                            }
                                                                        >
                                                                            <i className="fas fa-search me-1"></i>
                                                                            Rechercher
                                                                        </button>
                                                                    </div>
                                                                    {intitule_compte && (
                                                                        <div className="info-bulle-compte ms-2">
                                                                            <i className="fas fa-check-circle"></i>
                                                                            <span>
                                                                                {
                                                                                    intitule_compte
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {/* <tr><td colSpan="2"><label className="fw-bold" style={{ color: "steelblue" }}>{intitule_compte || ""}</label></td></tr> */}
                                                        {[
                                                            {
                                                                label: "Nom mandataire",
                                                                field: mandataireName,
                                                                setter: setmandataireName,
                                                            },
                                                            {
                                                                label: "Téléphone",
                                                                field: mandatairePhone,
                                                                setter: setmandatairePhone,
                                                            },
                                                        ].map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
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
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        value={
                                                                            item.field
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            item.setter(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        AjouterMandataire
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-plus-circle me-2"></i>
                                                                    Ajouter
                                                                    mandataire
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {fetchMandataire &&
                                    fetchMandataire.length > 0 && (
                                        <div className="col-md-6">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-header bg-white border-0 pt-3">
                                                    <h6
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <i className="fas fa-list me-2"></i>
                                                        Liste des mandataires
                                                    </h6>
                                                </div>
                                                <div className="card-body p-0">
                                                    <div className="table-responsive">
                                                        <table className="table table-hover mb-0">
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
                                                                    <th>
                                                                        Nom
                                                                        mandataire
                                                                    </th>
                                                                    <th>
                                                                        Téléphone
                                                                    </th>
                                                                    <th>
                                                                        Action
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {fetchMandataire.map(
                                                                    (
                                                                        res,
                                                                        index,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <td className="fw-semibold">
                                                                                {
                                                                                    res.mendataireName
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.telephoneM
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        DeleteMandataire(
                                                                                            res.id,
                                                                                        )
                                                                                    }
                                                                                    className="btn btn-sm"
                                                                                    style={{
                                                                                        background:
                                                                                            "#dc3545",
                                                                                        color: "white",
                                                                                        borderRadius:
                                                                                            "6px",
                                                                                        padding:
                                                                                            "4px 12px",
                                                                                    }}
                                                                                >
                                                                                    <i className="fas fa-trash-alt me-1"></i>
                                                                                    Supprimer
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Onglet 4: Création comptes */}
                        <div
                            className="tab-pane fade"
                            id="creation-compte"
                            role="tabpanel"
                        >
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-credit-card me-2"></i>
                                                Création compte
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte
                                                                    abrégé
                                                                </label>
                                                            </td>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                                                    <div className="d-flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "8px",
                                                                                width: "120px",
                                                                            }}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setcompte_to_search(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <button
                                                                            className="btn"
                                                                            style={{
                                                                                background:
                                                                                    "#138496",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                            onClick={
                                                                                getSeachedData
                                                                            }
                                                                        >
                                                                            <i className="fas fa-search me-1"></i>
                                                                            Rechercher
                                                                        </button>
                                                                    </div>
                                                                    {intitule_compte && (
                                                                        <div className="info-bulle-compte ms-2">
                                                                            <i className="fas fa-check-circle"></i>
                                                                            <span>
                                                                                {
                                                                                    intitule_compte
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {/* <td style={{ padding: "6px" }}>
                                                        <label className="fw-bold" style={{ color: "steelblue" }}>{intitule_compte || ""}</label>
                                                    </td> */}
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte à
                                                                    créer
                                                                </label>
                                                            </td>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    name="devise_compte"
                                                                    id="devise_compte"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setdevise_compte(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="CDF">
                                                                        Compte
                                                                        en CDF
                                                                    </option>
                                                                    <option value="USD">
                                                                        Compte
                                                                        en USD
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan="3"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        createAccount
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-plus-circle me-2"></i>
                                                                    Créer le
                                                                    compte
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
        /* Onglets modernes */
.tabs-modern {
  display: flex;
  gap: 0.25rem;
  background: transparent;
  border-bottom: 1px solid #eef2f6;
  padding: 0;
  margin-bottom: 1.5rem;
}

.tabs-modern .nav-item {
  list-style: none;
  margin-bottom: -1px;
}

.tabs-modern .nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #5f7d9c;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  cursor: pointer;
}

.tabs-modern .nav-link i {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

/* Effet hover */
.tabs-modern .nav-link:hover {
  color: #138496;
  border-bottom-color: #c4e6ed;
  background: #fafcfc;
}

/* Onglet actif */
.tabs-modern .nav-link.active {
  color: #138496;
  border-bottom-color: #138496;
  background: white;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.02);
}

/* Animation légère sur l'icône au hover */
.tabs-modern .nav-link:hover i {
  transform: translateY(-1px);
}

/* Responsive : empilage sur mobile */
@media (max-width: 640px) {
  .tabs-modern {
    flex-wrap: wrap;
    gap: 0.5rem;
    border-bottom: none;
  }
  .tabs-modern .nav-link {
    border-bottom: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 0.5rem 1rem;
  }
  .tabs-modern .nav-link.active {
    border-bottom-color: #138496;
    background: #eef9fc;
  }
}
        `}
            </style>
        </div>
    );
};

export default Adhesion;
