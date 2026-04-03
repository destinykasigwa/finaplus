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
                    }
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
                "/eco/page/debiteur/extourne-operation/" + reference
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
            "/eco/page/debiteur/extourne-operation/reference/" + ref
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
            event.target.value
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
                    `Le texte "${text}" a été copié dans le presse-papiers coller simplement à l'endroit souhaiter CTRL+V`
                );
            })
            .catch((err) => console.error("Erreur lors de la copie : ", err));
    };

    let compteur = 1;
    return (
      <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
    {/* En-tête moderne */}
    <div className="row mb-4">
        <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3" style={{
                    background: "#138496",
                    borderRadius: "12px"
                }}>
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="fas fa-calculator" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Opérations comptables</h5>
                            <small className="text-white-50">Débit et crédit des comptes</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Loading Overlay */}
    {chargement && (
        <div style={{
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
            backdropFilter: "blur(3px)"
        }}>
            <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                <Bars height="80" width="80" color="#20c997" ariaLabel="loading" />
                <h5 className="mt-3 text-dark">Patientez...</h5>
                <small className="text-muted">Traitement en cours</small>
            </div>
        </div>
    )}

    {/* Section Recherche des comptes */}
    <div className="row g-3 mb-4">
        <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-arrow-down me-2"></i>Compte à débiter
                    </h6>
                </div>
                <div className="card-body">
                    <div className="input-group">
                        <input
                            id="compte_a_debiter"
                            name="compte_a_debiter"
                            type="text"
                            className="form-control"
                            placeholder="Numéro de compte..."
                            style={{ borderRadius: "10px 0 0 10px" }}
                            onChange={(e) => setcompte_a_debiter(e.target.value)}
                        />
                        <button
                            className="btn"
                            style={{ borderRadius: "0 10px 10px 0", background: "#dc3545", color: "white", border: "none" }}
                            onClick={getSeachedDataDebit}
                        >
                            <i className="fas fa-search me-1"></i>Rechercher
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-arrow-up me-2"></i>Compte à créditer
                    </h6>
                </div>
                <div className="card-body">
                    <div className="input-group">
                        <input
                            id="compte_a_crediter"
                            name="compte_a_crediter"
                            type="text"
                            className="form-control"
                            placeholder="Numéro de compte..."
                            style={{ borderRadius: "10px 0 0 10px" }}
                            onChange={(e) => setcompte_a_crediter(e.target.value)}
                        />
                        <button
                            className="btn"
                            style={{ borderRadius: "0 10px 10px 0", background: "#28a745", color: "white", border: "none" }}
                            onClick={getSeachedDataCredit}
                        >
                            <i className="fas fa-search me-1"></i>Rechercher
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="col-md-2">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-user-search me-2"></i>Recherche par nom
                    </h6>
                </div>
                <div className="card-body">
                    <div className="d-flex flex-column gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nom du titulaire..."
                            style={{ borderRadius: "8px", width: "100%" }}
                            onChange={(e) => setsearched_account_by_name(e.target.value)}
                        />
                        <button
                            className="btn w-100"
                            style={{ background: "#20c997", color: "white", borderRadius: "8px" }}
                            onClick={getSeachedDataByName}
                        >
                            <i className="fas fa-search me-1"></i>Rechercher
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Informations des comptes */}
    <div className="row g-3 mb-4">
        {FetchDataDebit && (
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ borderLeft: "4px solid #dc3545" }}>
                    <div className="card-header bg-white border-0 pt-3">
                        <h6 className="fw-bold text-danger">
                            <i className="fas fa-arrow-down me-2"></i>Compte à débiter
                        </h6>
                    </div>
                    <div className="card-body">
                        <table style={{ width: "100%" }}>
                            <tbody>
                                
                                <tr>
                                    <td style={{ padding: "6px", color: "steelblue", fontWeight: "bold" }}>Nom Compte :</td>
                                    <td style={{ padding: "6px" }}>{FetchDataDebit.NomCompte}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "6px", color: "steelblue", fontWeight: "bold" }}>Numéro Compte :</td>
                                    <td style={{ padding: "6px" }}>{FetchDataDebit.NumCompte}</td>
                                </tr>
                                {FetchSoldeDebit && (
                                    <tr>
                                        <td style={{ padding: "6px", color: "steelblue", fontWeight: "bold" }}>Solde actuel :</td>
                                        <td style={{ padding: "6px" }}>
                                            <span className="fw-bold text-danger">
                                                {numberWithSpaces(FetchSoldeDebit.soldeCompte?.toFixed(2))}{" "}
                                                {FetchDataDebit.CodeMonnaie == 1 ? "USD" : "CDF"}
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {FetchDataCredit && (
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ borderLeft: "4px solid #28a745" }}>
                    <div className="card-header bg-white border-0 pt-3">
                        <h6 className="fw-bold text-success">
                            <i className="fas fa-arrow-up me-2"></i>Compte à créditer
                        </h6>
                    </div>
                    <div className="card-body">
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: "6px", color: "steelblue", fontWeight: "bold" }}>Nom Compte :</td>
                                    <td style={{ padding: "6px" }}>{FetchDataCredit.NomCompte}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "6px", color: "steelblue", fontWeight: "bold" }}>Numéro Compte :</td>
                                    <td style={{ padding: "6px" }}>{FetchDataCredit.NumCompte}</td>
                                </tr>
                                {FetchSoldeCredit && (
                                    <tr>
                                        <td style={{ padding: "6px", color: "steelblue", fontWeight: "bold" }}>Solde actuel :</td>
                                        <td style={{ padding: "6px" }}>
                                            <span className="fw-bold text-success">
                                                {numberWithSpaces(FetchSoldeCredit.soldeCompte?.toFixed(2))}{" "}
                                                {FetchDataCredit.CodeMonnaie == 1 ? "USD" : "CDF"}
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      {FetchDataDebit && (
    <div className="col-md-4">
        <div className="card border-0 shadow-sm rounded-3">
            <div className="card-header bg-white border-0 pt-3">
                <h6 className="fw-bold" style={{ color: "steelblue" }}>
                    <i className="fas fa-exchange-alt me-2"></i>Type d'opération
                </h6>
            </div>
            <div className="card-body">
                {/* Message informatif toujours visible */}
                <div className="mb-3 p-2" style={{ background: "#e6f2f9", borderRadius: "8px", fontSize: "13px" }}>
                    <i className="fas fa-info-circle me-1" style={{ color: "#20c997" }}></i>
                    <span style={{ color: "steelblue" }}>
                        <strong>Information :</strong> Cochez la case ci-dessous uniquement s'il s'agit d'un virement entre comptes d'épargne.
                        <br />
                        <small className="text-muted">Pour un simple débit/crédit standard, laissez la case décochée.</small>
                    </span>
                </div>

                <div className="form-check form-switch">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="isVirement"
                        name="isVirement"
                        style={{ width: "50px", height: "25px", cursor: "pointer",marginLeft:"0px",padding:"0px" }}
                        checked={checkboxValues.isVirement}
                        onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label ms-2 ml-5 p-2" style={{ color: "steelblue", fontWeight: "500" }}>
                        <i className="fas fa-exchange-alt me-1"></i>
                        Activer le mode virement
                    </label>
                </div>

                {checkboxValues.isVirement && (
                    <div className="mt-3 p-2" style={{ background: "#fff3cd", borderRadius: "8px", borderLeft: "4px solid #ffc107" }}>
                        <i className="fas fa-exclamation-triangle me-1" style={{ color: "#ffc107" }}></i>
                        <span style={{ color: "#856404", fontSize: "12px" }}>
                            <strong>Mode virement activé</strong> - Les deux comptes (débit et crédit) seront débités/crédités simultanément.
                        </span>
                    </div>
                )}

                {!checkboxValues.isVirement && (
                    <div className="mt-3 p-2" style={{ background: "#d1ecf1", borderRadius: "8px", borderLeft: "4px solid #17a2b8" }}>
                        <i className="fas fa-info-circle me-1" style={{ color: "#17a2b8" }}></i>
                        <span style={{ color: "#0c5460", fontSize: "12px" }}>
                            <strong>Mode standard</strong> - Opération de débit ou crédit simple.
                        </span>
                    </div>
                )}
            </div>
        </div>
    </div>
)}
    </div>

    {/* Liste des comptes trouvés par nom */}
    {fetchDataByName && fetchDataByName.length > 0 && (
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
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-info-circle me-2"></i>Informations de l'opération
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label style={{ color: "steelblue", fontWeight: "500" }}>Montant</label>
                            <input
                                id="Montant"
                                name="Montant"
                                type="text"
                                className="form-control form-control"
                                style={{ borderRadius: "10px", fontSize: "20px", fontWeight: "bold", textAlign: "right" }}
                                onChange={(e) => setMontant(e.target.value)}
                                value={Montant}
                                placeholder="0,00"
                            />
                        </div>
                        <div className="col-md-8">
                            <label style={{ color: "steelblue", fontWeight: "500" }}>Libellé</label>
                            <input
                                type="text"
                                id="Libelle"
                                name="Libelle"
                                className="form-control"
                                style={{ borderRadius: "10px", textTransform: "uppercase" }}
                                onChange={(e) => setLibelle(e.target.value)}
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
                            background: "linear-gradient(135deg, #20c997, #198764)",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            color: "white",
                            transition: "all 0.3s ease"
                        }}
                        onClick={saveOperation}
                        disabled={!Montant || (!FetchDataDebit && !FetchDataCredit)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(32,201,151,0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}></i>
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
                        <h6 className="fw-bold" style={{ color: "steelblue" }}>
                            <i className="fas fa-history me-2"></i>Opérations récentes
                        </h6>
                        <div className="d-flex gap-2">
                            <div className="input-group" style={{ width: "280px" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher par référence..."
                                    style={{ borderRadius: "8px 0 0 8px" }}
                                    name="searchRefOperation"
                                    value={searchRefOperation}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ background: "#20c997", color: "white", borderRadius: "0 8px 8px 0" }}
                                    onClick={() => handleSeachOperation(searchRefOperation)}
                                >
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                            <button
                                className="btn"
                                style={{ background: "#ffc107", color: "#1a2632", borderRadius: "8px" }}
                                onClick={() => extourneOperation(searchRefOperation)}
                            >
                                <i className="fas fa-exchange-alt me-1"></i>Extourner
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                            <thead style={{ backgroundColor: "#1a2632", color: "white", position: "sticky", top: 0 }}>
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
                                {!fetchSearchedOperation && fetchDayOperation
                                    ? fetchDayOperation.map((res, index) => {
                                        let compteurLocal = index + 1;
                                        return (
                                            <tr key={index}>
                                                <td className="fw-bold">{compteurLocal}</td>
                                                <td className="fw-semibold">{res.NumTransaction}</td>
                                                <td>{res.NumCompte}</td>
                                                <td className="fw-bold">
                                                    {res.CodeMonnaie == 1
                                                        ? (parseInt(res.Creditusd) > 0 ? parseInt(res.Creditusd) : parseInt(res.Debitusd))
                                                        : (parseInt(res.Creditfc) > 0 ? parseInt(res.Creditfc) : parseInt(res.Debitfc))}
                                                </td>
                                                <td>
                                                    <span className={`badge ${res.CodeMonnaie == 1 ? 'bg-info' : 'bg-success'}`}>
                                                        {res.CodeMonnaie == 1 ? "USD" : "CDF"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${res.TypeTransaction === "Crédit" ? 'bg-success' : 'bg-danger'}`}>
                                                        {res.TypeTransaction}
                                                    </span>
                                                </td>
                                                <td>{res.Libelle}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ background: "#ffc107", color: "#1a2632", borderRadius: "6px" }}
                                                        onClick={() => extourneOperation(res.NumTransaction)}
                                                    >
                                                        <i className="fas fa-exchange-alt me-1"></i>Extourner
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                    : fetchSearchedOperation && fetchSearchedOperation.map((res, index) => {
                                        let compteurLocal = index + 1;
                                        return (
                                            <tr key={index}>
                                                <td className="fw-bold">{compteurLocal}</td>
                                                <td className="fw-semibold">{res.NumTransaction}</td>
                                                <td>{res.NumCompte}</td>
                                                <td className="fw-bold">
                                                    {res.CodeMonnaie == 1
                                                        ? (parseInt(res.Creditusd) > 0 ? parseInt(res.Creditusd) : parseInt(res.Debitusd))
                                                        : (parseInt(res.Creditfc) > 0 ? parseInt(res.Creditfc) : parseInt(res.Debitfc))}
                                                </td>
                                                <td>
                                                    <span className={`badge ${res.CodeMonnaie == 1 ? 'bg-info' : 'bg-success'}`}>
                                                        {res.CodeMonnaie == 1 ? "USD" : "CDF"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${res.TypeTransaction === "Crédit" ? 'bg-success' : 'bg-danger'}`}>
                                                        {res.TypeTransaction}
                                                    </span>
                                                </td>
                                                <td>{res.Libelle}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ background: "#ffc107", color: "#1a2632", borderRadius: "6px" }}
                                                        onClick={() => extourneOperation(res.NumTransaction)}
                                                    >
                                                        <i className="fas fa-exchange-alt me-1"></i>Extourner
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                        {(!fetchSearchedOperation && (!fetchDayOperation || fetchDayOperation.length === 0)) && (
                            <div className="text-center py-5 text-muted">
                                <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                <p className="mb-0">Aucune opération récente</p>
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
