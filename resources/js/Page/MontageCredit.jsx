import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const MontageCredit = () => {
    const [loading, setloading] = useState(false);
    const [isLoadingRemb, setisLoadingRemb] = useState(false);
    const [fetchData, setFetchData] = useState({
        data: null,
        compteCredit: null,
        epargneCaution: null,
    });
    const [fetchDataToUpdate, setFetchDataToUpdate] = useState();
    const [fetchTypeCredit, setFetchTypeCredit] = useState();
    const [fetchAgentCredit, setFetchAgentCredit] = useState();
    const [fetchObjetCredit, setFetchObjetCredit] = useState();
    const [fetchFrequenceRembours, setFetchFrequenceRembours] = useState();
    const [fetchUserName, setFetchUserName] = useState();
    const [Search_field, setSearch_field] = useState();
    //ADD NEW CREDIT ATTRIBUTE

    const [type_credit, settype_credit] = useState();
    const [recouvreur, setrecouvreur] = useState();
    const [montant_demande, setmontant_demande] = useState();
    const [frequence_rembours, setfrequence_rembours] = useState();
    const [nbr_echeance, setnbr_echeance] = useState();
    const [monnaie, setmonnaie] = useState();
    const [duree, setduree] = useState();
    const [interval, setinterval] = useState();
    const [periode_grace, setperiode_grace] = useState();
    const [NomCompte, setNomCompte] = useState();
    const [compte_epargne, setcompte_epargne] = useState();
    const [compte_credit, setcompte_credit] = useState();
    const [objet_credit, setobjet_credit] = useState();
    const [gestionnaire, setgestionnaire] = useState();
    const [source_fond, setsource_fond] = useState();
    const [taux_interet, settaux_interet] = useState();
    const [taux_retard, settaux_retard] = useState();
    const [echnce_differee, setechnce_differee] = useState();
    const [cycle, setcycle] = useState();
    const [solde_cap, setsolde_cap] = useState();
    const [utilisateur, setutilisateur] = useState();
    const [agence, setagence] = useState();
    const [tot_interet, settot_interet] = useState();
    const [tot_general, settot_general] = useState();
    const [date_demande, setdate_demande] = useState();
    const [epargne_caution, setepargne_caution] = useState();

    //ATTRIBUTE TO UPDATE
    const [type_credit_up, settype_credit_up] = useState();
    const [recouvreur_up, setrecouvreur_up] = useState();
    const [montant_demande_up, setmontant_demande_up] = useState();
    const [frequence_rembours_up, setfrequence_rembours_up] = useState();
    const [date_demande_up, setdate_demande_up] = useState();
    const [nbr_echeance_up, setnbr_echeance_up] = useState();
    const [monnaie_up, setmonnaie_up] = useState();
    const [duree_up, setduree_up] = useState();
    const [interval_up, setinterval_up] = useState();
    const [periode_grace_up, setperiode_grace_up] = useState();
    const [NomCompte_up, setNomCompte_up] = useState();
    const [compte_epargne_up, setcompte_epargne_up] = useState();
    const [compte_credit_up, setcompte_credit_up] = useState();
    const [objet_credit_up, setobjet_credit_up] = useState();
    const [gestionnaire_up, setgestionnaire_up] = useState();
    const [source_fond_up, setsource_fond_up] = useState();
    const [taux_interet_up, settaux_interet_up] = useState();
    const [taux_retard_up, settaux_retard_up] = useState();
    const [echnce_differee_up, setechnce_differee_up] = useState();
    const [numDossier_up, setNumDossier_up] = useState();
    const [cycle_up, setcycle_up] = useState();
    const [solde_cap_up, setsolde_cap_up] = useState();
    const [utilisateur_up, setutilisateur_up] = useState();
    const [agence_up, setagence_up] = useState();
    const [tot_interet_up, settot_interet_up] = useState();
    const [tot_general_up, settot_general_up] = useState();
    const [epargne_caution_up, setepargne_caution_up] = useState();
    const [addNew, setAddNew] = useState(false);
    const [getNumDossier, setGetNumDossier] = useState();
    const [error, setError] = useState([]);
    //ECHEANCIER ATTRIBUTE
    const [desicion, setdecision] = useState();
    const [ModeCalcul, setModeCalcul] = useState();
    const [DateOctroi, setDateOctroi] = useState();
    const [dateEcheance, setdateEcheance] = useState();
    const [DateTombeEcheance, setDateTombeEcheance] = useState();
    const [MontantAccorde, setMontantAccorde] = useState();
    const [garantie, setgarantie] = useState();
    const [hypotheque_name, sethypotheque_name] = useState();
    const [montantRemboursementManuel, setmontantRemboursementManuel] =
        useState();

    const [checkboxValues, setCheckboxValues] = useState({
        RemboursementAnticipative: false,
    });

    const [ReechelonnerCheckboxValues, setReechelonnerCheckboxValues] =
        useState({
            Reechelonner: false,
        });

    //PERMET DE MODIFIER UN CREDIT
    const upDateCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post(
            "/eco/pages/montage-credit/get-credit-to-update",
            {
                seachedAccount: Search_field,
            },
        );
        if (res.data.status == 1) {
            setAddNew(false);
            getDataToDisplayOnFormLoad();
            setFetchDataToUpdate(res.data.data);
            console.log(res.data.data);
            settype_credit_up(res.data.data.RefProduitCredit);
            setrecouvreur_up(res.data.data.Recouvreur);
            setmontant_demande_up(res.data.data.MontantDemande);
            setdate_demande_up(res.data.data.DateDemande);
            setfrequence_rembours_up(res.data.data.ModeRemboursement);
            setnbr_echeance_up(res.data.data.NbrTranche);
            setmonnaie_up(res.data.data.CodeMonnaie);
            setduree_up(res.data.data.Duree);
            setinterval_up(res.data.data.Interval);
            setperiode_grace_up(res.data.data.Grace);
            setNomCompte_up(res.data.data.NomCompte);
            setcompte_epargne_up(res.data.data.NumCompteEpargne);
            setcompte_credit_up(res.data.data.NumCompteCredit);
            setobjet_credit_up(res.data.data.ObjeFinance);
            setgestionnaire_up(res.data.data.Gestionnaire);
            setsource_fond_up(res.data.data.SourceFinancement);
            settaux_interet_up(res.data.data.TauxInteret);
            settaux_retard_up(res.data.data.TauxInteretRetard);
            //setechnce_differee_up(res.data.data.TauxInteretRetard)
            setcycle_up(res.data.data.Cycle);
            setsolde_cap_up(res.data.data.CapitalRestant);
            setutilisateur_up(res.data.data.NomUtilisateur);
            setagence_up(res.data.data.CodeAgence);
            settot_interet_up(res.data.data.InteretDu);
            settot_general_up(
                parseInt(
                    res.data.data.CapitalRestant + res.data.data.InteretDu,
                ),
            );
            setepargne_caution_up(res.data.data.NumCompteEpargneGarantie);
            setNumDossier_up(res.data.data.NumDossier);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };
    const getDataToDisplayOnFormLoad = async () => {
        const res = await axios.get("/eco/page/montage-credit-data-to-dispaly");
        if (res.data.status == 1) {
            setFetchTypeCredit(res.data.type_credit);
            setFetchObjetCredit(res.data.objet_credit);
            setFetchAgentCredit(res.data.agent_credit);
            setFetchUserName(res.data.userName);
            setFetchFrequenceRembours(res.data.frequence_rembours);
        }
    };

    useEffect(() => {
        getDataToDisplayOnFormLoad();
    }, []);

    const saveNewCredit = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/montage-credit/save-new", {
            type_credit,
            recouvreur,
            montant_demande,
            frequence_rembours,
            nbr_echeance,
            monnaie,
            duree,
            interval,
            periode_grace,
            NomCompte: fetchData.data.NomCompte,
            compte_epargne: fetchData.data.NumCompte,
            compte_credit: fetchData.compteCredit,
            objet_credit,
            gestionnaire,
            source_fond,
            taux_interet,
            taux_retard,
            echnce_differee,
            cycle,
            solde_cap,
            utilisateur,
            agence,
            tot_interet,
            tot_general,
            date_demande,
            epargne_caution: fetchData.epargneCaution,
            NumDossier: "ND000" + getNumDossier.id,
            seachedAccount: Search_field,
            NumAdherant: fetchData.data.NumAdherant,
        });

        if (res.data.status == 1) {
            setloading(false);
            Swal.fire({
                title: "Montage crédit",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setloading(false);
            Swal.fire({
                title: "Montage crédit",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else {
            setloading(false);
            setError(res.data.validate_error);
        }
    };

    // PERMET D'AJOUTER UN NOUVEAU CREDIT
    const AddNewCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post(
            "/eco/page/montage-credit/get-seached-account",
            {
                seachedAccount: Search_field,
            },
        );
        if (res.data.status == 1) {
            setFetchData({
                data: res.data.data,
                compteCredit: res.data.compteCredit,
                epargneCaution: res.data.EpargneCaution,
            });
            setAddNew(true);
            setGetNumDossier(res.data.data_numdossier);
            // console.log(fetchData);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    const saveUpdateCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/montage-credit/update", {
            type_credit_up,
            recouvreur_up,
            montant_demande_up,
            frequence_rembours_up,
            nbr_echeance_up,
            monnaie_up,
            duree_up,
            interval_up,
            periode_grace_up,
            objet_credit_up,
            gestionnaire_up,
            source_fond_up,
            taux_interet_up,
            taux_retard_up,
            echnce_differee_up,
            date_demande_up,
            NumDossier_up: numDossier_up,
            seachedAccount: Search_field,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Modication de crédit",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Modification de crédit",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    const saveEcheancier = async (e) => {
        e.preventDefault();
        const res = await axios.post(
            "/eco/page/montage-credit/save-echeancier",
            {
                NumDossier: numDossier_up,
                desicion,
                ModeCalcul,
                DateOctroi,
                dateEcheance,
                DateTombeEcheance,
                MontantAccorde,
                garantie,
                hypotheque_name,
                reechelonne: ReechelonnerCheckboxValues.Reechelonner,
            },
        );

        if (res.data.status == 1) {
            Swal.fire({
                title: "Echéancier",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            setError(res.data.validate_error);
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Echéancier",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            setError(res.data.validate_error);
        } else {
            setError(res.data.validate_error);
        }
    };

    const AccordeCredit = async (e) => {
        e.preventDefault();
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Accorder ce crédit ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/accord-credit",
                {
                    NumDossier: numDossier_up,
                },
            );
            if (res.data.status == 1) {
                Swal.fire({
                    title: "Accord crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                Swal.fire({
                    title: "Accord crédit",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }
    };

    //PERMET DE CLOTURER UN CREDIT

    const ClotureCredit = async (e) => {
        e.preventDefault();
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment clôturer ce crédit ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/cloture-credit",
                {
                    NumDossier: numDossier_up,
                },
            );
            if (res.data.status == 1) {
                Swal.fire({
                    title: "Clôture crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                Swal.fire({
                    title: "Clôture crédit",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }
    };

    //PERMET DE DECAISSER LE CREDIT

    const DeccaissementCredit = async (e) => {
        e.preventDefault();
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Décaisser ce crédit ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/decaissement-credit",
                {
                    NumDossier: numDossier_up,
                },
            );
            if (res.data.status == 1) {
                Swal.fire({
                    title: "Déboursement crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                Swal.fire({
                    title: "Déboursement crédit",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }
    };
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        //  console.log(`Switch ${name} changé:`, checked); // 👈 Pour vérifier
        setCheckboxValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    const handleCheckboxChangeReechelonne = (event) => {
        const { name, checked } = event.target;
        setReechelonnerCheckboxValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    //PERMET DE FAIRE UN REMBOURSEMENT MANUEL EN CAPITAL
    const RemboursementManuel = async (e) => {
        e.preventDefault();
        setisLoadingRemb(true);
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Effectuer le remboursement ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/remboursement-manuel",
                {
                    numDossier: numDossier_up,
                    remboursAnticipe: checkboxValues.RemboursementAnticipative,
                    montantRemboursementManuel: montantRemboursementManuel,
                },
            );

            if (res.data.status == 1) {
                setisLoadingRemb(false);
                Swal.fire({
                    title: "Remboursement crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                setisLoadingRemb(false);
                Swal.fire({
                    // Le remboursement est entrain de s'effectuer en arrière-plan...😎
                    title: "Erreur!",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }
    };

    function numberWithSpaces(x) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }
    return (
        <div
            className="container-fluid"
            style={{ marginTop: "10px", padding: "0 15px" }}
        >
            {isLoadingRemb && (
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
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        zIndex: 1050,
                        backdropFilter: "blur(3px)",
                    }}
                >
                    <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                        <Bars
                            height="80"
                            width="80"
                            color="#20c997"
                            ariaLabel="loading"
                        />
                        <h5 className="mt-3 text-dark">Patientez...</h5>
                    </div>
                </div>
            )}

            {/* En-tête moderne */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div
                            className="card-body p-3"
                            style={{
                                background:
                                    "linear-gradient(135deg, #20c997 0%, #198764 100%)",
                                borderRadius: "12px",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i
                                            className="fas fa-folder-open"
                                            style={{
                                                fontSize: "28px",
                                                color: "white",
                                            }}
                                        ></i>
                                    </div>
                                    <div>
                                        <h5 className="text-white fw-bold mb-0">
                                            Porte Feuille de Crédit
                                        </h5>
                                        <small className="text-white-50">
                                            Gestion complète des crédits
                                        </small>
                                    </div>
                                </div>
                                <a
                                    href="eco/pages/credit/rapport-credit"
                                    className="btn"
                                    style={{
                                        background: "rgba(255,255,255,0.2)",
                                        color: "white",
                                        borderRadius: "8px",
                                        padding: "8px 20px",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                        textDecoration: "none",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(255,255,255,0.3)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(255,255,255,0.2)")
                                    }
                                >
                                    <i className="fas fa-chart-bar me-2"></i>
                                    Rapport crédit
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Recherche et État */}
            <div className="row g-3 mb-4">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-search me-2"></i>Recherche
                                de crédit
                            </h6>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="d-flex flex-wrap align-items-end gap-3">
                                    <div style={{ flex: 1 }}>
                                        <label
                                            className="form-label small fw-semibold"
                                            style={{ color: "steelblue" }}
                                        >
                                            Numéro de compte
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            style={{ borderRadius: "8px" }}
                                            name="Search_field"
                                            id="Search_field"
                                            onChange={(e) =>
                                                setSearch_field(e.target.value)
                                            }
                                            placeholder="Entrez le numéro de compte..."
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: "#20c997",
                                                color: "white",
                                                borderRadius: "8px",
                                                padding: "8px 16px",
                                            }}
                                            onClick={AddNewCredit}
                                        >
                                            <i className="fas fa-pen me-1"></i>
                                            Nouveau
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{
                                                background: "#007BFF",
                                                color: "white",
                                                borderRadius: "8px",
                                                padding: "8px 16px",
                                            }}
                                            onClick={upDateCredit}
                                        >
                                            <i className="fas fa-edit me-1"></i>
                                            Modifier
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-chart-line me-2"></i>État
                                du crédit
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-3 justify-content-around">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="accordedSwitch"
                                        disabled
                                        checked={
                                            fetchDataToUpdate &&
                                            fetchDataToUpdate.Accorde == 1
                                        }
                                    />
                                    <label
                                        className="form-check-label"
                                        style={{ color: "steelblue" }}
                                    >
                                        Accordé
                                    </label>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="debourseSwitch"
                                        disabled
                                        checked={
                                            fetchDataToUpdate &&
                                            fetchDataToUpdate.Octroye == 1
                                        }
                                    />
                                    <label
                                        className="form-check-label"
                                        style={{ color: "steelblue" }}
                                    >
                                        Déboursé
                                    </label>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="clotureSwitch"
                                        disabled
                                        checked={
                                            fetchDataToUpdate &&
                                            fetchDataToUpdate.Cloture == 1
                                        }
                                    />
                                    <label
                                        className="form-check-label"
                                        style={{ color: "steelblue" }}
                                    >
                                        Clôturé
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire Nouveau Crédit / Modification */}
            {addNew ? (
                // Vue Nouveau Crédit
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-info-circle me-2"></i>
                                    Informations générales
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
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
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro dossier
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            getNumDossier &&
                                                            "ND000" +
                                                                getNumDossier.id
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Type de crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm ${error.type_credit ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            settype_credit(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchTypeCredit &&
                                                            fetchTypeCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.id
                                                                        }
                                                                    >
                                                                        {
                                                                            res.type_credit
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.type_credit && (
                                                        <small className="text-danger">
                                                            {error.type_credit}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Récouvreur
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm ${error.recouvreur ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setrecouvreur(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.recouvreur && (
                                                        <small className="text-danger">
                                                            {error.recouvreur}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Montant demandé
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${error.montant_demande ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setmontant_demande(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.montant_demande && (
                                                        <small className="text-danger">
                                                            {
                                                                error.montant_demande
                                                            }
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Date demande
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="date"
                                                        className={`form-control form-control-sm ${error.date_demande ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setdate_demande(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.date_demande && (
                                                        <small className="text-danger">
                                                            {error.date_demande}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Fréquence
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm ${error.frequence_rembours ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setfrequence_rembours(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchFrequenceRembours &&
                                                            fetchFrequenceRembours.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.frequence_rembours
                                                                        }
                                                                    >
                                                                        {
                                                                            res.frequence_rembours
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.frequence_rembours && (
                                                        <small className="text-danger">
                                                            {
                                                                error.frequence_rembours
                                                            }
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nombre échéances
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${error.nbr_echeance ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setnbr_echeance(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.nbr_echeance && (
                                                        <small className="text-danger">
                                                            {error.nbr_echeance}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Monnaie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm ${error.monnaie ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setmonnaie(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        <option value="CDF">
                                                            CDF
                                                        </option>
                                                        <option value="USD">
                                                            USD
                                                        </option>
                                                    </select>
                                                    {error.monnaie && (
                                                        <small className="text-danger">
                                                            {error.monnaie}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Durée (mois)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${error.duree ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setduree(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.duree && (
                                                        <small className="text-danger">
                                                            {error.duree}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Interval (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${error.interval ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setinterval(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.interval && (
                                                        <small className="text-danger">
                                                            {error.interval}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Période grâce (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setperiode_grace(
                                                                e.target.value,
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
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-chart-line me-2"></i>
                                    Paramètres du crédit
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
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
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nom compte
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        disabled
                                                        value={
                                                            fetchData.data &&
                                                            fetchData.data
                                                                .NomCompte
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro compte épargne
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        disabled
                                                        value={
                                                            fetchData.data &&
                                                            fetchData.data
                                                                .NumCompte
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro compte crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        disabled
                                                        value={
                                                            fetchData.compteCredit &&
                                                            fetchData.compteCredit
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Epargne garantie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        disabled
                                                        value={
                                                            fetchData.epargneCaution &&
                                                            fetchData.epargneCaution
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Objet crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm ${error.objet_credit ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setobjet_credit(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchObjetCredit &&
                                                            fetchObjetCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.objet
                                                                        }
                                                                    >
                                                                        {
                                                                            res.objet
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.objet_credit && (
                                                        <small className="text-danger">
                                                            {error.objet_credit}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Gestionnaire
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm ${error.gestionnaire ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setgestionnaire(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.gestionnaire && (
                                                        <small className="text-danger">
                                                            {error.gestionnaire}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Source de fonds
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${error.source_fond ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setsource_fond(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.source_fond && (
                                                        <small className="text-danger">
                                                            {error.source_fond}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux d'intérêt (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm ${error.taux_interet ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            settaux_interet(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.taux_interet && (
                                                        <small className="text-danger">
                                                            {error.taux_interet}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux retard (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            settaux_retard(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Échéances différées
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setechnce_differee(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cycle
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        disabled
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
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-check-circle me-2"></i>
                                    Validation
                                </h6>
                            </div>
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <button
                                    onClick={saveNewCredit}
                                    className="btn w-100 py-3 fw-bold"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #20c997, #198764)",
                                        color: "white",
                                        borderRadius: "12px",
                                        border: "none",
                                        fontSize: "16px",
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
                                    <i
                                        className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-save me-2"}`}
                                    ></i>
                                    Enregistrer le crédit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Vue Modification Crédit
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-info-circle me-2"></i>
                                    Informations générales
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
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
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro dossier
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={numDossier_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Type de crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        onChange={(e) =>
                                                            settype_credit_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={type_credit_up}
                                                    >
                                                        <option
                                                            value={
                                                                fetchDataToUpdate?.RefTypeCredit
                                                            }
                                                        >
                                                            {
                                                                fetchDataToUpdate?.RefProduitCredit
                                                            }
                                                        </option>
                                                        {fetchTypeCredit &&
                                                            fetchTypeCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.id
                                                                        }
                                                                    >
                                                                        {
                                                                            res.type_credit
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Récouvreur
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        onChange={(e) =>
                                                            setrecouvreur_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={recouvreur_up}
                                                    >
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Montant demandé
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setmontant_demande_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={
                                                            montant_demande_up
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Date demande
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setdate_demande_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={date_demande_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Fréquence
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        onChange={(e) =>
                                                            setfrequence_rembours_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={
                                                            frequence_rembours_up
                                                        }
                                                    >
                                                        {fetchFrequenceRembours &&
                                                            fetchFrequenceRembours.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.frequence_rembours
                                                                        }
                                                                    >
                                                                        {
                                                                            res.frequence_rembours
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nombre échéances
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setnbr_echeance_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={nbr_echeance_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Monnaie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={monnaie_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Durée (mois)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setduree_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={duree_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Interval (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setinterval_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={interval_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Période grâce (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setperiode_grace_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={periode_grace_up}
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
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-chart-line me-2"></i>
                                    Paramètres complémentaires
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
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
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nom compte
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={NomCompte_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro compte épargne
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={
                                                            compte_epargne_up
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro compte crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={compte_credit_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Epargne garantie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={
                                                            epargne_caution_up
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Objet crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        onChange={(e) =>
                                                            setobjet_credit_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={objet_credit_up}
                                                    >
                                                        {fetchObjetCredit &&
                                                            fetchObjetCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.objet
                                                                        }
                                                                    >
                                                                        {
                                                                            res.objet
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Gestionnaire
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        onChange={(e) =>
                                                            setgestionnaire_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={gestionnaire_up}
                                                    >
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Source de fonds
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setsource_fond_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={source_fond_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux d'intérêt (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            settaux_interet_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={taux_interet_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux retard (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            settaux_retard_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={taux_retard_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Échéances différées
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setechnce_differee_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={
                                                            echnce_differee_up
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cycle
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={cycle_up}
                                                        disabled
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
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-chart-simple me-2"></i>
                                    Récapitulatif
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        width: "50%",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Solde capital
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate &&
                                                            numberWithSpaces(
                                                                fetchDataToUpdate.MontantAccorde,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Agence
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate?.CodeAgence
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Total intérêt
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate &&
                                                            numberWithSpaces(
                                                                fetchDataToUpdate.InteretDu,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Total général
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate &&
                                                            numberWithSpaces(
                                                                parseInt(
                                                                    fetchDataToUpdate.MontantAccorde,
                                                                ) +
                                                                    parseInt(
                                                                        fetchDataToUpdate.InteretDu,
                                                                    ),
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    colSpan="2"
                                                    style={{
                                                        padding: "15px 8px 8px",
                                                    }}
                                                >
                                                    <button
                                                        onClick={
                                                            saveUpdateCredit
                                                        }
                                                        className="btn w-100 py-2 fw-bold"
                                                        style={{
                                                            background:
                                                                "linear-gradient(135deg, #007BFF, #0056b3)",
                                                            color: "white",
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >
                                                        <i className="fas fa-database me-2"></i>
                                                        Mettre à jour
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
            )}

            {/* Onglets : Échéancier, Remboursement Manuel, Action */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <ul
                            className="nav nav-tabs"
                            id="creditTabs"
                            role="tablist"
                            style={{
                                background: "#f8f9fa",
                                borderRadius: "12px 12px 0 0",
                                borderBottom: "none",
                                padding: "0 15px",
                            }}
                        >
                            <li className="nav-item">
                                <a
                                    className="nav-link active"
                                    id="echeancier-tab"
                                    data-toggle="pill"
                                    href="#echeancier"
                                    role="tab"
                                    style={{
                                        color: "#20c997",
                                        fontWeight: "bold",
                                        border: "none",
                                        padding: "12px 20px",
                                    }}
                                >
                                    <i className="fas fa-calendar-alt me-2"></i>
                                    Échéancier
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    id="remboursement-tab"
                                    data-toggle="pill"
                                    href="#remboursement"
                                    role="tab"
                                    style={{
                                        color: "#6c757d",
                                        fontWeight: "bold",
                                        border: "none",
                                        padding: "12px 20px",
                                    }}
                                >
                                    <i className="fas fa-hand-holding-usd me-2"></i>
                                    Remboursement Manuel
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    id="action-tab"
                                    data-toggle="pill"
                                    href="#action"
                                    role="tab"
                                    style={{
                                        color: "#6c757d",
                                        fontWeight: "bold",
                                        border: "none",
                                        padding: "12px 20px",
                                    }}
                                >
                                    <i className="fas fa-cog me-2"></i>Action
                                </a>
                            </li>
                        </ul>

                        <div className="card-body">
                            <div className="tab-content">
                                {/* Onglet Échéancier */}
                                <div
                                    className="tab-pane fade show active"
                                    id="echeancier"
                                    role="tabpanel"
                                >
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body">
                                                    <form>
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
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
                                                                            Décision
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setdecision(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Sélectionnez
                                                                            </option>
                                                                            <option value="Accepté">
                                                                                Accepté
                                                                            </option>
                                                                            <option value="Refusé">
                                                                                Refusé
                                                                            </option>
                                                                        </select>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Mode
                                                                            calcul
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <select
                                                                            className={`form-select form-select-sm ${error?.ModeCalcul ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setModeCalcul(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Sélectionnez
                                                                            </option>
                                                                            <option value="Degressif">
                                                                                Dégressif
                                                                            </option>
                                                                            <option value="Constant">
                                                                                Constant
                                                                            </option>
                                                                            <option value="Degressif__">
                                                                                Degressif
                                                                                M
                                                                                --
                                                                            </option>
                                                                        </select>
                                                                        {error?.ModeCalcul && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.ModeCalcul
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Date
                                                                            octroi
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            className={`form-control form-control-sm ${error?.DateOctroi ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setDateOctroi(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {error?.DateOctroi && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.DateOctroi
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Garantie
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setgarantie(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Sélectionnez
                                                                            </option>
                                                                            <option value="Caution solidaire">
                                                                                Caution
                                                                                solidaire
                                                                            </option>
                                                                            <option value="Salaire">
                                                                                Salaire
                                                                            </option>
                                                                            <option value="Hypothèque">
                                                                                Hypothèque
                                                                            </option>
                                                                            <option value="Autre">
                                                                                Autre
                                                                            </option>
                                                                        </select>
                                                                        {garantie ==
                                                                            "Hypothèque" && (
                                                                            <input
                                                                                type="text"
                                                                                className="form-control form-control-sm mt-2"
                                                                                placeholder="Nom hypothèque"
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    sethypotheque_name(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body">
                                                    <form>
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
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
                                                                            Tombée
                                                                            échéance
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            className={`form-control form-control-sm ${error?.DateTombeEcheance ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setDateTombeEcheance(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {error?.DateTombeEcheance && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.DateTombeEcheance
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Dernière
                                                                            échéance
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            className={`form-control form-control-sm ${error?.dateEcheance ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setdateEcheance(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {error?.dateEcheance && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.dateEcheance
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                {ReechelonnerCheckboxValues.Reechelonner ==
                                                                    false && (
                                                                    <tr>
                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <label
                                                                                style={{
                                                                                    color: "steelblue",
                                                                                    fontWeight:
                                                                                        "500",
                                                                                }}
                                                                            >
                                                                                Montant
                                                                                accordé
                                                                            </label>
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                className={`form-control form-control-sm ${error?.MontantAccorde ? "is-invalid" : ""}`}
                                                                                style={{
                                                                                    background:
                                                                                        error?.MontantAccorde
                                                                                            ? "#dc3545"
                                                                                            : "#20c997",
                                                                                    color: "white",
                                                                                    fontWeight:
                                                                                        "bold",
                                                                                }}
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    setMontantAccorde(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            />
                                                                            {error?.MontantAccorde && (
                                                                                <small className="text-danger">
                                                                                    {
                                                                                        error.MontantAccorde
                                                                                    }
                                                                                </small>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                <tr>
                                                                    <td
                                                                        colSpan="2"
                                                                        style={{
                                                                            padding:
                                                                                "15px 8px 8px",
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={
                                                                                saveEcheancier
                                                                            }
                                                                            className="btn w-100 py-2"
                                                                            style={{
                                                                                background:
                                                                                    "linear-gradient(135deg, #20c997, #198764)",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-save me-2"></i>
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
                                        <div className="col-md-4">
                                            <div className="card border-0 bg-light h-100">
                                                <div className="card-body d-flex align-items-center justify-content-center">
                                                    <div className="form-check form-switch">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="Reechelonner"
                                                            name="Reechelonner"
                                                            style={{
                                                                width: "48px",
                                                                height: "24px",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.2s ease",
                                                            }}
                                                            checked={
                                                                ReechelonnerCheckboxValues.Reechelonner
                                                            }
                                                            onChange={
                                                                handleCheckboxChangeReechelonne
                                                            }
                                                            onMouseEnter={(
                                                                e,
                                                            ) => {
                                                                e.currentTarget.style.transform =
                                                                    "scale(1.05)";
                                                            }}
                                                            onMouseLeave={(
                                                                e,
                                                            ) => {
                                                                e.currentTarget.style.transform =
                                                                    "scale(1)";
                                                            }}
                                                        />
                                                        <label
                                                            className="form-check-label ms-2"
                                                            htmlFor="Reechelonner"
                                                            style={{
                                                                color: ReechelonnerCheckboxValues.Reechelonner
                                                                    ? "#20c997"
                                                                    : "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                                fontSize:
                                                                    "14px",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "color 0.2s ease",
                                                            }}
                                                        >
                                                            <i
                                                                className={`fas ${ReechelonnerCheckboxValues.Reechelonner ? "fa-check-circle" : "fa-sync-alt"} me-2 ml-2`}
                                                            ></i>
                                                            Réechelonner ?
                                                            {ReechelonnerCheckboxValues.Reechelonner && (
                                                                <span
                                                                    className="ms-2 badge bg-warning"
                                                                    style={{
                                                                        fontSize:
                                                                            "10px",
                                                                        backgroundColor:
                                                                            "#ffc107",
                                                                        color: "#1a2632",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    Actif
                                                                </span>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Onglet Remboursement Manuel */}
                                <div
                                    className="tab-pane fade"
                                    id="remboursement"
                                    role="tabpanel"
                                >
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body">
                                                    <form>
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "12px",
                                                                            width: "35%",
                                                                        }}
                                                                    >
                                                                        {/* Switch Remboursement Anticipé */}
                                                                        <div className="form-check form-switch">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                id="RemboursementAnticipative"
                                                                                name="RemboursementAnticipative"
                                                                                style={{
                                                                                    width: "40px",
                                                                                    height: "20px",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                                checked={
                                                                                    checkboxValues.RemboursementAnticipative
                                                                                }
                                                                                onChange={
                                                                                    handleCheckboxChange
                                                                                }
                                                                            />
                                                                            <label
                                                                                className="form-check-label ms-2"
                                                                                htmlFor="RemboursementAnticipative"
                                                                                style={{
                                                                                    color: "steelblue",
                                                                                    fontWeight:
                                                                                        "500",
                                                                                    fontSize:
                                                                                        "14px",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-forward me-2"></i>
                                                                                Remboursement
                                                                                Anticipé
                                                                                ?
                                                                            </label>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "12px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Montant
                                                                            à
                                                                            rembourser
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setmontantRemboursementManuel(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="0,00"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "12px",
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={
                                                                                RemboursementManuel
                                                                            }
                                                                            className="btn w-100 py-2"
                                                                            style={{
                                                                                background:
                                                                                    "linear-gradient(135deg, #20c997, #198764)",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-database me-2"></i>
                                                                            Rembourser
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

                                {/* Onglet Action */}
                                <div
                                    className="tab-pane fade"
                                    id="action"
                                    role="tabpanel"
                                >
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body">
                                                    <div className="d-flex flex-wrap gap-3">
                                                        <div>
                                                            {fetchDataToUpdate &&
                                                            fetchDataToUpdate.Accorde ==
                                                                1 ? (
                                                                <button
                                                                    disabled
                                                                    className="btn btn-secondary"
                                                                    style={{
                                                                        borderRadius:
                                                                            "10px",
                                                                        padding:
                                                                            "12px 24px",
                                                                        opacity: 0.6,
                                                                    }}
                                                                >
                                                                    <i className="fas fa-thumbs-up me-2"></i>
                                                                    Déjà Accordé
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={
                                                                        AccordeCredit
                                                                    }
                                                                    className="btn"
                                                                    style={{
                                                                        background:
                                                                            "linear-gradient(135deg, #28a745, #1e7e34)",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "10px",
                                                                        padding:
                                                                            "12px 24px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-thumbs-up me-2"></i>
                                                                    Accorder
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {fetchDataToUpdate &&
                                                            fetchDataToUpdate.Octroye ==
                                                                1 ? (
                                                                <button
                                                                    disabled
                                                                    className="btn btn-secondary"
                                                                    style={{
                                                                        borderRadius:
                                                                            "10px",
                                                                        padding:
                                                                            "12px 24px",
                                                                        opacity: 0.6,
                                                                    }}
                                                                >
                                                                    <i className="fas fa-hand-holding-usd me-2"></i>
                                                                    Déjà
                                                                    Déboursé
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={
                                                                        DeccaissementCredit
                                                                    }
                                                                    className="btn"
                                                                    style={{
                                                                        background:
                                                                            "linear-gradient(135deg, #17a2b8, #138496)",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "10px",
                                                                        padding:
                                                                            "12px 24px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-hand-holding-usd me-2"></i>
                                                                    Débourser
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {fetchDataToUpdate &&
                                                            fetchDataToUpdate.Cloture ==
                                                                1 ? (
                                                                <button
                                                                    disabled
                                                                    className="btn btn-secondary"
                                                                    style={{
                                                                        borderRadius:
                                                                            "10px",
                                                                        padding:
                                                                            "12px 24px",
                                                                        opacity: 0.6,
                                                                    }}
                                                                >
                                                                    <i className="fas fa-lock me-2"></i>
                                                                    Déjà Clôturé
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={
                                                                        ClotureCredit
                                                                    }
                                                                    className="btn"
                                                                    style={{
                                                                        background:
                                                                            "linear-gradient(135deg, #dc3545, #b02a37)",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "10px",
                                                                        padding:
                                                                            "12px 24px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-unlock-alt me-2"></i>
                                                                    Clôturer
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="mt-4 p-3"
                                                        style={{
                                                            background:
                                                                "#e6f2f9",
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >
                                                        <small className="text-muted">
                                                            <i className="fas fa-info-circle me-2"></i>
                                                            {fetchDataToUpdate &&
                                                                fetchDataToUpdate.Accorde ==
                                                                    1 &&
                                                                fetchDataToUpdate.Octroye ==
                                                                    0 &&
                                                                "Crédit accordé mais non encore déboursé. Cliquez sur 'Débourser' pour libérer les fonds."}
                                                            {fetchDataToUpdate &&
                                                                fetchDataToUpdate.Accorde ==
                                                                    1 &&
                                                                fetchDataToUpdate.Octroye ==
                                                                    1 &&
                                                                fetchDataToUpdate.Cloture ==
                                                                    0 &&
                                                                "Crédit en cours de remboursement. Les échéances sont actives."}
                                                            {fetchDataToUpdate &&
                                                                fetchDataToUpdate.Cloture ==
                                                                    1 &&
                                                                "Crédit clôturé. Aucune action supplémentaire n'est requise."}
                                                            {(!fetchDataToUpdate ||
                                                                (fetchDataToUpdate.Accorde ==
                                                                    0 &&
                                                                    fetchDataToUpdate.Octroye ==
                                                                        0 &&
                                                                    fetchDataToUpdate.Cloture ==
                                                                        0)) &&
                                                                "Crédit en attente de validation. Veuillez d'abord accorder le crédit."}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MontageCredit;
