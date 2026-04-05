import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const Debiter = () => {
    const [loading, setloading] = useState(false);
    const [compte_a_debiter, setcompte_a_debiter] = useState();
    const [compte_a_crediter, setcompte_a_crediter] = useState();
    const [Libelle, setLibelle] = useState();
    const [Montant, setMontant] = useState();
    const [FetchDataDebit, setFetchDataDebit] = useState();
    const [FetchDataCredit, setFetchDataCredit] = useState();
    const [FetchSoldeDebit, setFetchSoldeDebit] = useState();
    const [FetchSoldeCredit, setFetchSoldeCredit] = useState();
    const [fetchDayOperation, setfetchDayOperation] = useState();
    const [searchRefOperation, setsearchRefOperation] = useState();
    const [fetchSearchedOperation, setfetchSearchedOperation] = useState();
    const [chargement, setchargement] = useState(false);
    const [searched_account_by_name, setsearched_account_by_name] = useState();
    const [fetchDataByName, setFetchDataByName] = useState();
    const [copiedText, setCopiedText] = useState("");
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [selectedRowType, setSelectedRowType] = useState(null); // 'debit' ou 'credit'
    const [checkboxValues, setCheckboxValues] = useState({
        RemboursementAnticipative: false,
    });
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        setchargement(true);

        let confirmation;
        // Afficher une boîte de dialogue de confirmation
        console.log(checkboxValues.isVirement);
        if (checkboxValues.isVirement === true) {
            confirmation = await Swal.fire({
                title: "Êtes-vous sûr?",
                text: "Il semble que l'opération que vous voulez enregistrer est une operation de virement voulez vous continuer ?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Oui",
                cancelButtonText: "Non",
            });
        } else {
            confirmation = await Swal.fire({
                title: "Êtes-vous sûr?",
                text: "Vous êtes sur le point de valider cette opération voulez vous continuer ?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Oui",
                cancelButtonText: "Non",
            });
        }

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            try {
                const res = await axios.post(
                    "/eco/page/transaction/debiter/save",
                    {
                        compte_a_debiter: compte_a_debiter,
                        compte_a_crediter: compte_a_crediter,
                        Montant,
                        devise: FetchDataDebit.CodeMonnaie,
                        Libelle: Libelle,
                        isVirement: checkboxValues.isVirement,
                    },
                );

                if (res.data.status === 1) {
                    setchargement(false);
                    setloading(false);
                    Swal.fire({
                        title: "Succès",
                        text: res.data.msg,
                        icon: "success",
                        timer: 8000,
                        confirmButtonText: "Okay",
                    });
                    setMontant("");
                    setLibelle("");
                    getDayOperation();
                } else if (res.data.status === 0) {
                    setchargement(false);
                    setloading(false);
                    Swal.fire({
                        title: "Erreur",
                        text: res.data.msg,
                        icon: "error",
                        timer: 8000,
                        confirmButtonText: "Okay",
                    });
                } else {
                    setError(res.data.validate_error);
                }
            } catch (error) {
                setchargement(false);
                setloading(false);
                Swal.fire({
                    title: "Erreur",
                    text: "Une erreur s'est produite lors de l'enregistrement de l'opération.",
                    icon: "error",
                    confirmButtonText: "Okay",
                });
            }
        } else {
            setloading(false);
            setchargement(false);
        }
    };

    const getSeachedDataDebit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/debiter/get-data", {
            compte_a_debiter,
        });
        if (res.data.status == 1) {
            setFetchDataDebit(res.data.dataDebit);
            setFetchSoldeDebit(res.data.soldeCompteDebit);
            console.log(FetchSolde);
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
    const getSeachedDataCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/crediter/get-data", {
            compte_a_crediter,
        });
        if (res.data.status == 1) {
            setFetchDataCredit(res.data.dataCredit);
            setFetchSoldeCredit(res.data.soldeCompteCredit);
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

    function numberWithSpaces(x) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    const extourneOperation = async (reference) => {
        setchargement(true);
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment extourner cette opération ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });
        if (confirmation.isConfirmed) {
            const res = await axios.get(
                "/eco/page/debiteur/extourne-operation/" + reference,
            );
            if (res.data.status == 1) {
                setchargement(false);
                Swal.fire({
                    title: "Créditeur",
                    text: res.data.msg,
                    icon: "success",
                    button: "OK!",
                });
            } else if (res.data.status == 0) {
                setchargement(false);
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg,
                    icon: "error",
                    button: "OK!",
                });
            }
        } else {
            setchargement(false);
            Swal.fire({
                title: "Annulation",
                text: "L'extourne n'a pas eu lieu",
                icon: "info",
                button: "OK!",
            });
        }
    };

    useEffect(() => {
        getDayOperation();
    }, []);

    //put focus on given input
    //    const focusTextInput=()=> {
    //         this.textInput.current.focus();
    //     }
    const getDayOperation = async () => {
        const res = await axios.get("/eco/page/debiteur/operation-journaliere");

        setfetchDayOperation(res.data.data);
    };

    const handleSeachOperation = async (ref) => {
        const res = await axios.get(
            "/eco/page/debiteur/extourne-operation/reference/" + ref,
        );
        if (res.data.status == 1) {
            setfetchSearchedOperation(res.data.data);
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    //GET DATA FROM INPUT
    function handleChange(event) {
        setsearchRefOperation(
            // Computed property names
            // keys of the objects are computed dynamically
            event.target.value,
        );
    }
    const getSeachedDataByName = async (e) => {
        e.preventDefault();
        setchargement(true);
        const res = await axios.post("/eco/page/releve/get-account-by-name", {
            searched_account_by_name: searched_account_by_name,
        });
        if (res.data.status == 1) {
            setFetchDataByName(res.data.data);
            console.log(fetchDataByName);
            setchargement(false);
        } else {
            setchargement(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopiedText(text);
                alert(
                    `Le texte "${text}" a été copié dans le presse-papiers coller simplement à l'endroit souhaiter CTRL+V`,
                );
            })
            .catch((err) => console.error("Erreur lors de la copie : ", err));
    };

    // Fonction pour gérer le double-clic sur un compte
    const handleDoubleClickOnAccount = (accountNumber, targetField) => {
        if (targetField === "debit") {
            setcompte_a_debiter(accountNumber);
            // Déclencher automatiquement la recherche
            setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} };
                getSeachedDataDebit(fakeEvent);
            }, 100);
            // Réinitialiser la sélection
            setSelectedRowIndex(null);
            setSelectedRowType(null);
            setSelectedTargetField(null);
        } else if (targetField === "credit") {
            setcompte_a_crediter(accountNumber);
            // Déclencher automatiquement la recherche
            setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} };
                getSeachedDataCredit(fakeEvent);
            }, 100);
            // Réinitialiser la sélection
            setSelectedRowIndex(null);
            setSelectedRowType(null);
            setSelectedTargetField(null);
        }
    };

    // État pour suivre quel champ est actuellement sélectionné pour le remplissage
    const [selectedTargetField, setSelectedTargetField] = useState(null);

    let compteur = 1;
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
                                        className="fas fa-calculator"
                                        style={{
                                            fontSize: "28px",
                                            color: "white",
                                        }}
                                    ></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">
                                        Opérations comptables
                                    </h5>
                                    <small className="text-white-50">
                                        Débit et crédit des comptes
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
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
                        <small className="text-muted">
                            Traitement en cours
                        </small>
                    </div>
                </div>
            )}

            {selectedTargetField && (
                <div
                    className="alert alert-info alert-dismissible fade show mt-2 mb-0"
                    role="alert"
                >
                    <i className="fas fa-info-circle me-2"></i>
                    Mode de remplissage actif pour :
                    <strong className="mx-1">
                        {selectedTargetField === "debit"
                            ? "Compte à débiter"
                            : "Compte à créditer"}
                    </strong>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                        onClick={() => setSelectedTargetField(null)}
                    ></button>
                    <small className="ms-2">
                        (Double-cliquez sur n'importe quel compte dans la liste
                        ci-dessus pour le remplir automatiquement)
                    </small>
                </div>
            )}
            {/* Section Recherche des comptes */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-arrow-down me-2"></i>Compte
                                à débiter
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="input-group">
                                {/* <input
                            id="compte_a_debiter"
                            name="compte_a_debiter"
                            type="text"
                            className="form-control"
                            placeholder="Numéro de compte..."
                            style={{ borderRadius: "10px 0 0 10px" }}
                            onChange={(e) => setcompte_a_debiter(e.target.value)}
                        /> */}
                                <input
                                    id="compte_a_debiter"
                                    name="compte_a_debiter"
                                    type="text"
                                    className={`form-control ${selectedTargetField === "debit" ? "border-danger border-2" : ""}`}
                                    placeholder="Numéro de compte..."
                                    style={{ borderRadius: "10px 0 0 10px" }}
                                    onChange={(e) =>
                                        setcompte_a_debiter(e.target.value)
                                    }
                                    value={compte_a_debiter}
                                />
                                <button
                                    className="btn"
                                    style={{
                                        borderRadius: "0 10px 10px 0",
                                        background: "#dc3545",
                                        color: "white",
                                        border: "none",
                                    }}
                                    onClick={getSeachedDataDebit}
                                >
                                    <i className="fas fa-search me-1"></i>
                                    Rechercher
                                </button>
                            </div>
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
                                <i className="fas fa-arrow-up me-2"></i>Compte à
                                créditer
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="input-group">
                                {/* <input
                            id="compte_a_crediter"
                            name="compte_a_crediter"
                            type="text"
                            className="form-control"
                            placeholder="Numéro de compte..."
                            style={{ borderRadius: "10px 0 0 10px" }}
                            onChange={(e) => setcompte_a_crediter(e.target.value)}
                        /> */}
                                <input
                                    id="compte_a_crediter"
                                    name="compte_a_crediter"
                                    type="text"
                                    className={`form-control ${selectedTargetField === "credit" ? "border-success border-2" : ""}`}
                                    placeholder="Numéro de compte..."
                                    style={{ borderRadius: "10px 0 0 10px" }}
                                    onChange={(e) =>
                                        setcompte_a_crediter(e.target.value)
                                    }
                                    value={compte_a_crediter}
                                />
                                <button
                                    className="btn"
                                    style={{
                                        borderRadius: "0 10px 10px 0",
                                        background: "#28a745",
                                        color: "white",
                                        border: "none",
                                    }}
                                    onClick={getSeachedDataCredit}
                                >
                                    <i className="fas fa-search me-1"></i>
                                    Rechercher
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-user-search me-2"></i>
                                Recherche par nom
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nom du titulaire..."
                                    style={{
                                        borderRadius: "8px",
                                        width: "100%",
                                    }}
                                    onChange={(e) =>
                                        setsearched_account_by_name(
                                            e.target.value,
                                        )
                                    }
                                />
                                <button
                                    className="btn w-100"
                                    style={{
                                        background: "#20c997",
                                        color: "white",
                                        borderRadius: "8px",
                                    }}
                                    onClick={getSeachedDataByName}
                                >
                                    <i className="fas fa-search me-1"></i>
                                    Rechercher
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informations des comptes - Version Élégante */}
            <div className="row g-4 mb-4">
                {/* Compte à débiter */}
                {FetchDataDebit && (
                    <div className="col-md-6">
                        <div
                            className="card border-0 shadow-lg rounded-4 overflow-hidden h-100"
                            style={{
                                background:
                                    "linear-gradient(135deg, #fff 0%, #fff8f8 100%)",
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(-5px)";
                                e.currentTarget.style.boxShadow =
                                    "0 15px 35px rgba(220, 53, 69, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                    "0 1rem 3rem rgba(0,0,0,.175)";
                            }}
                        >
                            {/* Bandeau décoratif supérieur */}
                            <div
                                style={{
                                    height: "6px",
                                    background:
                                        "linear-gradient(90deg, #dc3545, #ff6b6b, #dc3545)",
                                    backgroundSize: "200% 100%",
                                    animation: "gradientMove 3s ease infinite",
                                }}
                            />

                            <div className="card-body p-4">
                                {/* En-tête avec icône et titre */}
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "15px",
                                                background:
                                                    "linear-gradient(135deg, #dc3545, #ff6b6b)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow:
                                                    "0 4px 15px rgba(220, 53, 69, 0.3)",
                                            }}
                                        >
                                            <i
                                                className="fas fa-arrow-down fa-lg"
                                                style={{ color: "white" }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5
                                                className="fw-bold mb-0"
                                                style={{ color: "#dc3545" }}
                                            >
                                                Compte à débiter
                                            </h5>
                                            <small className="text-muted">
                                                Détails du compte source
                                            </small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-sm text-muted"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                }}
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href="#"
                                                        onClick={() =>
                                                            handleCopy(
                                                                FetchDataDebit.NumCompte,
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-copy me-2"></i>
                                                        Copier le numéro
                                                    </a>
                                                </li>
                                                {/* <li>
                                                    <a 
                                                        className="dropdown-item" 
                                                        href={`/eco/pages/releve`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i className="fas fa-file-alt me-2"></i>Voir le relevé
                                                    </a>
                                                </li> */}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations du compte - Design moderne */}
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div
                                            className="p-3 rounded-3"
                                            style={{
                                                background: "#f8f9fa",
                                                borderLeft: "3px solid #dc3545",
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small text-uppercase">
                                                    Nom du titulaire
                                                </span>
                                                <i className="fas fa-user text-danger opacity-50"></i>
                                            </div>
                                            <h6 className="fw-bold mb-0">
                                                {FetchDataDebit.NomCompte}
                                            </h6>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div
                                            className="p-3 rounded-3"
                                            style={{
                                                background: "#f8f9fa",
                                                borderLeft: "3px solid #17a2b8",
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small text-uppercase">
                                                    Numéro de compte
                                                </span>
                                                <i className="fas fa-hashtag text-info opacity-50"></i>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <code
                                                    className="fw-bold"
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    {FetchDataDebit.NumCompte}
                                                </code>
                                                <button
                                                    className="btn btn-sm btn-link text-decoration-none p-0"
                                                    onClick={() =>
                                                        handleCopy(
                                                            FetchDataDebit.NumCompte,
                                                        )
                                                    }
                                                    style={{ color: "#17a2b8" }}
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {FetchSoldeDebit && (
                                        <div className="col-12">
                                            <div
                                                className="p-3 rounded-3"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #dc3545, #ff6b6b)",
                                                    boxShadow:
                                                        "0 4px 15px rgba(220, 53, 69, 0.2)",
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="text-white-50 small text-uppercase">
                                                        Solde actuel
                                                    </span>
                                                    <i className="fas fa-chart-line text-white-50"></i>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-end">
                                                    <h3 className="fw-bold text-white mb-0">
                                                        {numberWithSpaces(
                                                            FetchSoldeDebit.soldeCompte?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </h3>
                                                    <span className="badge bg-white text-danger px-3 py-2 rounded-pill">
                                                        {FetchDataDebit.CodeMonnaie ==
                                                        1
                                                            ? "USD"
                                                            : "CDF"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compte à créditer */}
                {FetchDataCredit && (
                    <div className="col-md-6">
                        <div
                            className="card border-0 shadow-lg rounded-4 overflow-hidden h-100"
                            style={{
                                background:
                                    "linear-gradient(135deg, #fff 0%, #f0fff4 100%)",
                                transition:
                                    "transform 0.3s ease, box-shadow 0.3s ease",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(-5px)";
                                e.currentTarget.style.boxShadow =
                                    "0 15px 35px rgba(40, 167, 69, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                    "0 1rem 3rem rgba(0,0,0,.175)";
                            }}
                        >
                            {/* Bandeau décoratif supérieur */}
                            <div
                                style={{
                                    height: "6px",
                                    background:
                                        "linear-gradient(90deg, #28a745, #34ce57, #28a745)",
                                    backgroundSize: "200% 100%",
                                    animation: "gradientMove 3s ease infinite",
                                }}
                            />

                            <div className="card-body p-4">
                                {/* En-tête avec icône et titre */}
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "15px",
                                                background:
                                                    "linear-gradient(135deg, #28a745, #34ce57)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow:
                                                    "0 4px 15px rgba(40, 167, 69, 0.3)",
                                            }}
                                        >
                                            <i
                                                className="fas fa-arrow-up fa-lg"
                                                style={{ color: "white" }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5
                                                className="fw-bold mb-0"
                                                style={{ color: "#28a745" }}
                                            >
                                                Compte à créditer
                                            </h5>
                                            <small className="text-muted">
                                                Détails du compte destination
                                            </small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-sm text-muted"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                }}
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <a
                                                        className="dropdown-item"
                                                        href="#"
                                                        onClick={() =>
                                                            handleCopy(
                                                                FetchDataCredit.NumCompte,
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-copy me-2"></i>
                                                        Copier le numéro
                                                    </a>
                                                </li>
                                                {/* <li><a className="dropdown-item" href="#" onClick={() => window.open(`/releve/${FetchDataCredit.NumCompte}`, '_blank')}>
                                        <i className="fas fa-file-alt me-2"></i>Voir le relevé
                                    </a></li> */}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations du compte - Design moderne */}
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div
                                            className="p-3 rounded-3"
                                            style={{
                                                background: "#f8f9fa",
                                                borderLeft: "3px solid #28a745",
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small text-uppercase">
                                                    Nom du titulaire
                                                </span>
                                                <i className="fas fa-user text-success opacity-50"></i>
                                            </div>
                                            <h6 className="fw-bold mb-0">
                                                {FetchDataCredit.NomCompte}
                                            </h6>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div
                                            className="p-3 rounded-3"
                                            style={{
                                                background: "#f8f9fa",
                                                borderLeft: "3px solid #17a2b8",
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted small text-uppercase">
                                                    Numéro de compte
                                                </span>
                                                <i className="fas fa-hashtag text-info opacity-50"></i>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <code
                                                    className="fw-bold"
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    {FetchDataCredit.NumCompte}
                                                </code>
                                                <button
                                                    className="btn btn-sm btn-link text-decoration-none p-0"
                                                    onClick={() =>
                                                        handleCopy(
                                                            FetchDataCredit.NumCompte,
                                                        )
                                                    }
                                                    style={{ color: "#17a2b8" }}
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {FetchSoldeCredit && (
                                        <div className="col-12">
                                            <div
                                                className="p-3 rounded-3"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #28a745, #34ce57)",
                                                    boxShadow:
                                                        "0 4px 15px rgba(40, 167, 69, 0.2)",
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="text-white-50 small text-uppercase">
                                                        Solde actuel
                                                    </span>
                                                    <i className="fas fa-chart-line text-white-50"></i>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-end">
                                                    <h3 className="fw-bold text-white mb-0">
                                                        {numberWithSpaces(
                                                            FetchSoldeCredit.soldeCompte?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </h3>
                                                    <span className="badge bg-white text-success px-3 py-2 rounded-pill">
                                                        {FetchDataCredit.CodeMonnaie ==
                                                        1
                                                            ? "USD"
                                                            : "CDF"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Ajoutez ces styles CSS dans votre fichier CSS ou dans une balise style */}
            <style jsx>{`
                @keyframes gradientMove {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                /* Animation d'entrée pour les cartes */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .card {
                    animation: fadeInUp 0.5s ease-out;
                }
            `}</style>

            {/* Version simplifiée si vous voulez garder la section type d'opération */}
            {/* {FetchDataDebit && (
    <div className="row mt-3">
        <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="rounded-3 p-2" style={{ background: "#e6f2f9" }}>
                                <i className="fas fa-exchange-alt fa-lg" style={{ color: "#20c997" }}></i>
                            </div>
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div>
                                    <h6 className="fw-bold mb-1" style={{ color: "steelblue" }}>
                                        <i className="fas fa-info-circle me-2"></i>
                                        Configuration de l'opération
                                    </h6>
                                    <small className="text-muted">
                                        {checkboxValues.isVirement 
                                            ? "Mode virement activé - Les deux comptes seront débités/crédités simultanément"
                                            : "Mode standard - Opération de débit ou crédit simple"}
                                    </small>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isVirement"
                                        name="isVirement"
                                        style={{ width: "45px", height: "22px", cursor: "pointer" }}
                                        checked={checkboxValues.isVirement}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label className="form-check-label ms-2 fw-semibold" style={{ color: "steelblue" }}>
                                        <i className="fas fa-exchange-alt me-1"></i>
                                        Virement
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)} */}

            {/* Liste des comptes trouvés par nom */}
            {/* {fetchDataByName && fetchDataByName.length > 0 && (
        <div className="row mb-4">
            <div className="col-12">
                <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-header bg-white border-0 pt-3">
                        <h6 className="fw-bold" style={{ color: "steelblue" }}>
                            <i className="fas fa-list me-2"></i>Comptes trouvés ({fetchDataByName.length})
                        </h6>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive" style={{ maxHeight: "250px", overflowY: "auto" }}>
                            <table className="table table-hover mb-0">
                                <thead style={{ backgroundColor: "#e6f2f9", position: "sticky", top: 0 }}>
                                    <tr style={{ color: "steelblue" }}>
                                        <th>Numéro Compte</th>
                                        <th>Intitulé</th>
                                        <th>Devise</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetchDataByName.map((res, index) => (
                                        <tr key={index}>
                                            <td className="fw-semibold">{res.NumCompte}</td>
                                            <td>{res.NomCompte}</td>
                                            <td>
                                                <span className={`badge ${res.CodeMonnaie == 1 ? 'bg-info' : 'bg-success'}`}>
                                                    {res.CodeMonnaie == 1 ? "USD" : "CDF"}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleCopy(res.NumCompte)}
                                                    className="btn btn-sm"
                                                    style={{ background: "#20c997", color: "white", borderRadius: "6px" }}
                                                >
                                                    <i className="fas fa-copy me-1"></i>Copier
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )} */}

            {/* Liste des comptes trouvés par nom */}

            {/* Liste des comptes trouvés par nom */}
            {fetchDataByName && fetchDataByName.length > 0 && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white border-0 pt-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-list me-2"></i>
                                        Comptes trouvés (
                                        {fetchDataByName.length})
                                    </h6>
                                    <div className="text-muted small">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Cliquez sur Débit ou Crédit, puis
                                        double-cliquez sur un compte
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div
                                    className="table-responsive"
                                    style={{
                                        maxHeight: "250px",
                                        overflowY: "auto",
                                    }}
                                >
                                    <table className="table table-hover mb-0 w-100">
                                        <thead
                                            style={{
                                                backgroundColor: "#e6f2f9",
                                                position: "sticky",
                                                top: 0,
                                            }}
                                        >
                                            <tr style={{ color: "steelblue" }}>
                                                <th style={{ width: "20%" }}>
                                                    Numéro Compte
                                                </th>
                                                <th style={{ width: "35%" }}>
                                                    Intitulé
                                                </th>
                                                <th style={{ width: "10%" }}>
                                                    Devise
                                                </th>
                                                <th style={{ width: "25%" }}>
                                                    Remplir dans
                                                </th>
                                                <th style={{ width: "10%" }}>
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fetchDataByName.map(
                                                (res, index) => (
                                                    <tr
                                                        key={index}
                                                        className="account-row"
                                                        data-index={index}
                                                        style={{
                                                            cursor: "pointer",
                                                            transition:
                                                                "all 0.3s ease",
                                                            backgroundColor:
                                                                selectedRowIndex ===
                                                                    index &&
                                                                selectedRowType ===
                                                                    "debit"
                                                                    ? "#fff5f5" // Rouge clair
                                                                    : selectedRowIndex ===
                                                                            index &&
                                                                        selectedRowType ===
                                                                            "credit"
                                                                      ? "#f0fff4" // Vert clair
                                                                      : "transparent",
                                                            borderLeft:
                                                                selectedRowIndex ===
                                                                    index &&
                                                                selectedRowType ===
                                                                    "debit"
                                                                    ? "4px solid #dc3545"
                                                                    : selectedRowIndex ===
                                                                            index &&
                                                                        selectedRowType ===
                                                                            "credit"
                                                                      ? "4px solid #28a745"
                                                                      : "4px solid transparent",
                                                            boxShadow:
                                                                selectedRowIndex ===
                                                                index
                                                                    ? "0 2px 12px rgba(0,0,0,0.15)"
                                                                    : "none",
                                                            fontWeight:
                                                                selectedRowIndex ===
                                                                index
                                                                    ? "500"
                                                                    : "normal",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (
                                                                selectedRowIndex !==
                                                                index
                                                            ) {
                                                                e.currentTarget.style.backgroundColor =
                                                                    "#f8f9fa";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (
                                                                selectedRowIndex !==
                                                                index
                                                            ) {
                                                                e.currentTarget.style.backgroundColor =
                                                                    "transparent";
                                                            }
                                                        }}
                                                        onDoubleClick={() => {
                                                            // Vérifier si une ligne est sélectionnée avec un type (débit ou crédit)
                                                            if (
                                                                selectedRowIndex ===
                                                                    index &&
                                                                selectedRowType ===
                                                                    "debit"
                                                            ) {
                                                                handleDoubleClickOnAccount(
                                                                    res.NumCompte,
                                                                    "debit",
                                                                );
                                                                Swal.fire({
                                                                    title: "Succès",
                                                                    text: `Compte ${res.NumCompte} ajouté au champ "Compte à débiter"`,
                                                                    icon: "success",
                                                                    timer: 2000,
                                                                    showConfirmButton: false,
                                                                    toast: true,
                                                                    position:
                                                                        "top-end",
                                                                });
                                                            } else if (
                                                                selectedRowIndex ===
                                                                    index &&
                                                                selectedRowType ===
                                                                    "credit"
                                                            ) {
                                                                handleDoubleClickOnAccount(
                                                                    res.NumCompte,
                                                                    "credit",
                                                                );
                                                                Swal.fire({
                                                                    title: "Succès",
                                                                    text: `Compte ${res.NumCompte} ajouté au champ "Compte à créditer"`,
                                                                    icon: "success",
                                                                    timer: 2000,
                                                                    showConfirmButton: false,
                                                                    toast: true,
                                                                    position:
                                                                        "top-end",
                                                                });
                                                            } else {
                                                                // Si aucun type n'est sélectionné pour cette ligne
                                                                Swal.fire({
                                                                    title: "Information",
                                                                    text: "Veuillez d'abord cliquer sur 'Débit' ou 'Crédit' pour cette ligne",
                                                                    icon: "info",
                                                                    timer: 2000,
                                                                    showConfirmButton: false,
                                                                    toast: true,
                                                                    position:
                                                                        "top-end",
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <td className="fw-semibold">
                                                            {res.NumCompte}
                                                        </td>
                                                        <td>{res.NomCompte}</td>
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
                                                            <div
                                                                className="btn-group btn-group-sm"
                                                                role="group"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={`btn ${selectedRowIndex === index && selectedRowType === "debit" ? "btn-danger" : "btn-outline-danger"}`}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        // Réinitialiser la sélection précédente
                                                                        setSelectedRowIndex(
                                                                            index,
                                                                        );
                                                                        setSelectedRowType(
                                                                            "debit",
                                                                        );
                                                                        setSelectedTargetField(
                                                                            "debit",
                                                                        );

                                                                        Swal.fire(
                                                                            {
                                                                                title: "Mode Débit activé",
                                                                                text: `Le compte ${res.NumCompte} sera mis dans "Compte à débiter". Double-cliquez pour confirmer.`,
                                                                                icon: "info",
                                                                                timer: 2000,
                                                                                showConfirmButton: false,
                                                                                toast: true,
                                                                                position:
                                                                                    "top-end",
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <i className="fas fa-arrow-down me-1"></i>
                                                                    Débit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`btn ${selectedRowIndex === index && selectedRowType === "credit" ? "btn-success" : "btn-outline-success"}`}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        // Réinitialiser la sélection précédente
                                                                        setSelectedRowIndex(
                                                                            index,
                                                                        );
                                                                        setSelectedRowType(
                                                                            "credit",
                                                                        );
                                                                        setSelectedTargetField(
                                                                            "credit",
                                                                        );

                                                                        Swal.fire(
                                                                            {
                                                                                title: "Mode Crédit activé",
                                                                                text: `Le compte ${res.NumCompte} sera mis dans "Compte à créditer". Double-cliquez pour confirmer.`,
                                                                                icon: "info",
                                                                                timer: 2000,
                                                                                showConfirmButton: false,
                                                                                toast: true,
                                                                                position:
                                                                                    "top-end",
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <i className="fas fa-arrow-up me-1"></i>
                                                                    Crédit
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleCopy(
                                                                        res.NumCompte,
                                                                    );
                                                                }}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background:
                                                                        "#20c997",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "6px",
                                                                }}
                                                                title="Copier le numéro de compte"
                                                            >
                                                                <i className="fas fa-copy me-1"></i>
                                                                Copier
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
                </div>
            )}

            {/* Séparateur décoratif */}
            <div className="position-relative my-4">
                <hr className="border-2" style={{ borderColor: "#e9ecef" }} />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    <i className="fas fa-pen me-1"></i> Détails de l'opération
                </span>
            </div>

            {/* Formulaire de l'opération */}
            <div className="row g-3 mb-4">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-info-circle me-2"></i>
                                Informations de l'opération
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Montant
                                    </label>
                                    <input
                                        id="Montant"
                                        name="Montant"
                                        type="text"
                                        className="form-control form-control"
                                        style={{
                                            borderRadius: "10px",
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                            textAlign: "right",
                                        }}
                                        onChange={(e) =>
                                            setMontant(e.target.value)
                                        }
                                        value={Montant}
                                        placeholder="0,00"
                                    />
                                </div>
                                <div className="col-md-8">
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Libellé
                                    </label>
                                    <input
                                        type="text"
                                        id="Libelle"
                                        name="Libelle"
                                        className="form-control"
                                        style={{
                                            borderRadius: "10px",
                                            textTransform: "uppercase",
                                        }}
                                        onChange={(e) =>
                                            setLibelle(e.target.value.toUpperCase())
                                        }
                                        value={Libelle}
                                        placeholder="Description de l'opération"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body d-flex align-items-center justify-content-center">
                            <button
                                className="btn w-100 py-3 fw-bold"
                                id="validerbtn"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #20c997, #198764)",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "16px",
                                    color: "white",
                                    transition: "all 0.3s ease",
                                }}
                                onClick={saveOperation}
                                disabled={
                                    !Montant ||
                                    (!FetchDataDebit && !FetchDataCredit)
                                }
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 6px 16px rgba(32,201,151,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <i
                                    className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}
                                ></i>
                                Valider l'opération
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historique des opérations */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-history me-2"></i>
                                    Opérations récentes
                                </h6>
                                <div className="d-flex gap-2">
                                    <div
                                        className="input-group"
                                        style={{ width: "280px" }}
                                    >
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Rechercher par référence..."
                                            style={{
                                                borderRadius: "8px 0 0 8px",
                                            }}
                                            name="searchRefOperation"
                                            value={searchRefOperation}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{
                                                background: "#20c997",
                                                color: "white",
                                                borderRadius: "0 8px 8px 0",
                                            }}
                                            onClick={() =>
                                                handleSeachOperation(
                                                    searchRefOperation,
                                                )
                                            }
                                        >
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                    <button
                                        className="btn"
                                        style={{
                                            background: "#ffc107",
                                            color: "#1a2632",
                                            borderRadius: "8px",
                                        }}
                                        onClick={() =>
                                            extourneOperation(
                                                searchRefOperation,
                                            )
                                        }
                                    >
                                        <i className="fas fa-exchange-alt me-1"></i>
                                        Extourner
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div
                                className="table-responsive"
                                style={{
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                }}
                            >
                                <table
                                    className="table table-hover mb-0"
                                    style={{ fontSize: "13px" }}
                                >
                                    <thead
                                        style={{
                                            backgroundColor: "#1a2632",
                                            color: "white",
                                            position: "sticky",
                                            top: 0,
                                        }}
                                    >
                                        <tr>
                                            <th>#</th>
                                            <th>Référence</th>
                                            <th>Numéro Compte</th>
                                            <th>Montant</th>
                                            <th>Devise</th>
                                            <th>Opération</th>
                                            <th>Libellé</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!fetchSearchedOperation &&
                                        fetchDayOperation
                                            ? fetchDayOperation.map(
                                                  (res, index) => {
                                                      let compteurLocal =
                                                          index + 1;
                                                      return (
                                                          <tr key={index}>
                                                              <td className="fw-bold">
                                                                  {
                                                                      compteurLocal
                                                                  }
                                                              </td>
                                                              <td className="fw-semibold">
                                                                  {
                                                                      res.NumTransaction
                                                                  }
                                                              </td>
                                                              <td>
                                                                  {
                                                                      res.NumCompte
                                                                  }
                                                              </td>
                                                              <td className="fw-bold">
                                                                  {res.CodeMonnaie ==
                                                                  1
                                                                      ? parseInt(
                                                                            res.Creditusd,
                                                                        ) > 0
                                                                          ? parseInt(
                                                                                res.Creditusd,
                                                                            )
                                                                          : parseInt(
                                                                                res.Debitusd,
                                                                            )
                                                                      : parseInt(
                                                                              res.Creditfc,
                                                                          ) > 0
                                                                        ? parseInt(
                                                                              res.Creditfc,
                                                                          )
                                                                        : parseInt(
                                                                              res.Debitfc,
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
                                                                  <span
                                                                      className={`badge ${res.TypeTransaction === "Crédit" ? "bg-success" : "bg-danger"}`}
                                                                  >
                                                                      {
                                                                          res.TypeTransaction
                                                                      }
                                                                  </span>
                                                              </td>
                                                              <td>
                                                                  {res.Libelle}
                                                              </td>
                                                              <td>
                                                                  <button
                                                                      className="btn btn-sm"
                                                                      style={{
                                                                          background:
                                                                              "#ffc107",
                                                                          color: "#1a2632",
                                                                          borderRadius:
                                                                              "6px",
                                                                      }}
                                                                      onClick={() =>
                                                                          extourneOperation(
                                                                              res.NumTransaction,
                                                                          )
                                                                      }
                                                                  >
                                                                      <i className="fas fa-exchange-alt me-1"></i>
                                                                      Extourner
                                                                  </button>
                                                              </td>
                                                          </tr>
                                                      );
                                                  },
                                              )
                                            : fetchSearchedOperation &&
                                              fetchSearchedOperation.map(
                                                  (res, index) => {
                                                      let compteurLocal =
                                                          index + 1;
                                                      return (
                                                          <tr key={index}>
                                                              <td className="fw-bold">
                                                                  {
                                                                      compteurLocal
                                                                  }
                                                              </td>
                                                              <td className="fw-semibold">
                                                                  {
                                                                      res.NumTransaction
                                                                  }
                                                              </td>
                                                              <td>
                                                                  {
                                                                      res.NumCompte
                                                                  }
                                                              </td>
                                                              <td className="fw-bold">
                                                                  {res.CodeMonnaie ==
                                                                  1
                                                                      ? parseInt(
                                                                            res.Creditusd,
                                                                        ) > 0
                                                                          ? parseInt(
                                                                                res.Creditusd,
                                                                            )
                                                                          : parseInt(
                                                                                res.Debitusd,
                                                                            )
                                                                      : parseInt(
                                                                              res.Creditfc,
                                                                          ) > 0
                                                                        ? parseInt(
                                                                              res.Creditfc,
                                                                          )
                                                                        : parseInt(
                                                                              res.Debitfc,
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
                                                                  <span
                                                                      className={`badge ${res.TypeTransaction === "Crédit" ? "bg-success" : "bg-danger"}`}
                                                                  >
                                                                      {
                                                                          res.TypeTransaction
                                                                      }
                                                                  </span>
                                                              </td>
                                                              <td>
                                                                  {res.Libelle}
                                                              </td>
                                                              <td>
                                                                  <button
                                                                      className="btn btn-sm"
                                                                      style={{
                                                                          background:
                                                                              "#ffc107",
                                                                          color: "#1a2632",
                                                                          borderRadius:
                                                                              "6px",
                                                                      }}
                                                                      onClick={() =>
                                                                          extourneOperation(
                                                                              res.NumTransaction,
                                                                          )
                                                                      }
                                                                  >
                                                                      <i className="fas fa-exchange-alt me-1"></i>
                                                                      Extourner
                                                                  </button>
                                                              </td>
                                                          </tr>
                                                      );
                                                  },
                                              )}
                                    </tbody>
                                </table>
                                {!fetchSearchedOperation &&
                                    (!fetchDayOperation ||
                                        fetchDayOperation.length === 0) && (
                                        <div className="text-center py-5 text-muted">
                                            <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                            <p className="mb-0">
                                                Aucune opération récente
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ height: "30px" }}></div>
        </div>
    );
};

export default Debiter;
