import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const TableWithPagination = ({ data, itemsPerPage, renderRow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    if (totalPages === 0) return null;

    return (
        <>
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr style={{ color: "steelblue" }}>
                            <th>N° Document</th>
                            <th>Bénéficiaire</th>
                            <th>Montant</th>
                            <th>Date</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>{currentData.map(renderRow)}</tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-2 border-top">
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ padding: "2px 6px", fontSize: "11px" }}
                    >
                        <i className="fas fa-chevron-left"></i> Préc.
                    </button>
                    <span
                        className="small text-muted"
                        style={{ fontSize: "10px" }}
                    >
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ padding: "2px 6px", fontSize: "11px" }}
                    >
                        Suiv. <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </>
    );
};

const Visa = () => {
    const [loading, setloading] = useState(false);
    const [error, setError] = useState([]);
    const [searched_account, setsearched_account] = useState();
    const [fetchData, setFetchData] = useState();
    const [fetchData2, setfetchData2] = useState();
    // const [devise, setDevise] = useState("");
    const [Montant, setMontant] = useState(0);
    const [benecifiaire, setBenecifiaire] = useState();
    const [typeDocument, setTypeDocument] = useState();
    const [other_benecifiaire, setother_benecifiaire] = useState();
    // const [numDocument, setnumDocument] = useState();
    const [telephone, setTelephone] = useState();
    const [signature_file, setsignature_file] = useState();
    const [fetchnumDocument, setFetchnumDocument] = useState();
    const [fetchMandataire, setFetchMandataire] = useState();
    const [loadingData, setloadingData] = useState(false);
    const [isLoadingBar, setIsLoadingBar] = useState();
    const [fetchSolde, setFetchSolde] = useState();
    const [recentOperations, setRecentOperations] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const getSeachedData = async (e) => {
        e.preventDefault();
        setloadingData(true);
        const res = await axios.post("/eco/page/depot-espece/get-account/2", {
            searched_account: searched_account,
        });
        if (res.data.status == 1) {
            setloadingData(false);
            setFetchData(res.data.data);
            setsignature_file(
                res.data.membreSignature
                    ? res.data.membreSignature.signature_image_file
                    : null,
            );
            setFetchnumDocument(res.data.numDocument);
            setFetchMandataire(res.data.madantairedata);
            2;
            console.log(fetchnumDocument);
        } else {
            setloadingData(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    useEffect(() => {
        const fetchRecentVisa = async () => {
            try {
                const res = await axios.get(
                    "/eco/page/visa/operations-recentes",
                );
                if (res.data.status === 1) {
                    setRecentOperations(res.data.data);
                }
            } catch (error) {
                console.error("Erreur chargement visa récents", error);
            } finally {
                setLoadingRecent(false);
            }
        };
        fetchRecentVisa();
    }, []);

    const saveOperation = async (e) => {
        e.preventDefault();
        // ✅ VALIDATION AVANT TOUT - Vérifier que DeposantName est rempli
        if (!benecifiaire || benecifiaire.trim() === "") {
            Swal.fire({
                title: "Champ obligatoire",
                text: "Veuillez renseigner le nom du beneficiaire avant de valider l'opération.",
                icon: "warning",
                timer: 4000,
                confirmButtonText: "D'accord",
                confirmButtonColor: "#138496",
            });
            // Focus sur le champ DeposantName pour une meilleure UX
            document.getElementById("beneficiaire")?.focus();
            return; // ⚠️ IMPORTANT : on arrête l'exécution ici
        }
        setloading(true);
        setIsLoadingBar(true);

        // alert(other_benecifiaire);
        const res = await axios.post("/eco/page/transaction/positionnement", {
            refCompte: searched_account,
            devise: fetchData2.CodeMonnaie == 1 ? "USD" : "CDF",
            Montant,
            benecifiaire,
            typeDocument,
            numDocument: "DC00" + fetchnumDocument,
            telephone,
            other_benecifiaire,
        });
        if (res.data.status == 1) {
            setloading(false);
            setIsLoadingBar(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            setMontant("");
            setTelephone("");
            setBenecifiaire("");
            setother_benecifiaire("");
            fetchRecentVisa();
        } else if (res.data.status == 0) {
            setloading(false);
            setIsLoadingBar(false);
            Swal.fire({
                title: "Erreur",
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

    const getAccountInfo = async (event) => {
        if (event.detail == 2) {
            setloadingData(true);
            const res = await axios.post(
                "/eco/page/depot-espece/get-account/specific",
                {
                    NumCompte: event.target.innerHTML,
                },
            );
            if (res.data.status == 1) {
                setloadingData(false);
                setfetchData2(res.data.data);
                setFetchSolde(res.data.soldeCompte);
                console.log(fetchData2);
            } else {
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }
    };
    let myspinner = {
        margin: "5px auto",
        width: "3rem",
        marginTop: "180px",
        border: "0px",
        height: "200px",
    };
    return (
        <>
            {loadingData ? (
                <div className="row" id="rowspinner">
                    <div className="myspinner" style={myspinner}>
                        <span className="spinner-border" role="status"></span>
                        <span style={{ marginLeft: "-20px" }}>
                            Chargement...
                        </span>
                    </div>
                </div>
            ) : (
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
                                        background:
                                            "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i
                                                className="fab fa-cc-visa"
                                                style={{
                                                    fontSize: "28px",
                                                    color: "white",
                                                }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5 className="text-white fw-bold mb-0">
                                                Visa
                                            </h5>
                                            <small className="text-white-50">
                                                Positionnement et autorisation
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {isLoadingBar && (
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
                                    color="#17a2b8"
                                    ariaLabel="loading"
                                />
                                <h5 className="mt-3 text-dark">Patientez...</h5>
                                <small className="text-muted">
                                    Traitement en cours
                                </small>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Recherche et informations compte */}
                    <div className="row g-3 mb-4">
                        {/* Recherche compte */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-3 h-100">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Recherche Compte
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <div className="input-group">
                                            <input
                                                id="compte_to_search"
                                                name="compte_to_search"
                                                type="text"
                                                className="form-control"
                                                placeholder="Numéro de compte..."
                                                style={{
                                                    borderRadius:
                                                        "10px 0 0 10px",
                                                }}
                                                onChange={(e) => {
                                                    setsearched_account(
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                            <button
                                                className="btn"
                                                style={{
                                                    borderRadius:
                                                        "0 10px 10px 0",
                                                    background: "#17a2b8",
                                                    color: "white",
                                                    border: "none",
                                                }}
                                                onClick={getSeachedData}
                                            >
                                                <i className="fas fa-search me-1"></i>
                                                Rechercher
                                            </button>
                                        </div>
                                    </div>
                                    <hr className="my-3" />

                                    <form>
                                        <table style={{ width: "100%" }}>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "5px",
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
                                                            Intitulé de compte
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "5px",
                                                        }}
                                                    >
                                                        <input
                                                            id="intituleCompte"
                                                            name="intituleCompte"
                                                            type="text"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                                backgroundColor:
                                                                    "#f8f9fa",
                                                            }}
                                                            value={
                                                                fetchData2 &&
                                                                fetchData2.NomCompte
                                                            }
                                                            disabled
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "5px",
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                color: "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Numéro de compte
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "5px",
                                                        }}
                                                    >
                                                        <input
                                                            id="NumCompte"
                                                            name="NumCompte"
                                                            type="text"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                                backgroundColor:
                                                                    "#f8f9fa",
                                                            }}
                                                            disabled
                                                            value={
                                                                fetchData2 &&
                                                                fetchData2.NumCompte
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "5px",
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                color: "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Code Agence
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "5px",
                                                        }}
                                                    >
                                                        <input
                                                            id="CodeAgence"
                                                            name="CodeAgence"
                                                            type="text"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                                backgroundColor:
                                                                    "#f8f9fa",
                                                                width: "100px",
                                                            }}
                                                            value={
                                                                fetchData2 &&
                                                                fetchData2.CodeAgence
                                                            }
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

                        {/* Liste des comptes */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-3 h-100">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-list me-2"></i>
                                        Liste des comptes
                                    </h6>
                                </div>
                                <div className="card-body p-0">
                                    <div
                                        style={{
                                            maxHeight: "320px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <table className="table table-hover mb-0">
                                            <tbody>
                                                {fetchData &&
                                                    fetchData.map(
                                                        (res, index) => {
                                                            return (
                                                                <tr
                                                                    key={index}
                                                                    className="clickable-row"
                                                                    style={{
                                                                        cursor: "pointer",
                                                                    }}
                                                                    onClick={(
                                                                        event,
                                                                    ) =>
                                                                        getAccountInfo(
                                                                            event,
                                                                        )
                                                                    }
                                                                >
                                                                    <td className="py-2 px-3 fw-semibold">
                                                                        {
                                                                            res.NumCompte
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 px-3">
                                                                        <span
                                                                            className={`badge ${res.CodeMonnaie == 1 ? "bg-info" : "bg-success"}`}
                                                                        >
                                                                            {res.CodeMonnaie ==
                                                                            1
                                                                                ? "USD"
                                                                                : "CDF"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Solde compte */}
                        {fetchSolde && (
                            <div className="col-md-4">
                                <div
                                    className="card border-0 shadow-sm rounded-3 h-100"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
                                    }}
                                >
                                    <div className="card-body text-center">
                                        <i className="fas fa-chart-line fa-2x mb-2 opacity-75 text-white"></i>
                                        <h6 className="text-white-50 mb-2">
                                            Solde du compte
                                        </h6>
                                        <h2 className="fw-bold mb-0 text-white">
                                            {fetchData2 &&
                                            fetchData2.CodeMonnaie == 1
                                                ? "USD "
                                                : "CDF "}
                                            {fetchSolde.soldeMembre?.toFixed(
                                                2,
                                            ) || "0.00"}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Séparateur décoratif */}
                    <div className="position-relative my-4">
                        <hr
                            className="border-2"
                            style={{ borderColor: "#e9ecef" }}
                        />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                            <i className="fas fa-arrow-down me-1"></i>{" "}
                            Informations de visa
                        </span>
                    </div>

                    {/* Section Formulaire de visa */}
                    <div className="row g-3">
                        {/* Informations du visa */}
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-info-circle me-2"></i>
                                        Informations
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <fieldset>
                                            <table style={{ width: "100%" }}>
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                                width: "35%",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    color: "steelblue",
                                                                    fontWeight:
                                                                        "500",
                                                                }}
                                                            >
                                                                Devise
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <select
                                                                id="devise"
                                                                name="devise"
                                                                className="form-control"
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                    backgroundColor:
                                                                        "#f8f9fa",
                                                                }}
                                                                disabled
                                                            >
                                                                <option
                                                                    value={
                                                                        fetchData2 &&
                                                                        fetchData2.CodeMonnaie ==
                                                                            1
                                                                            ? "USD"
                                                                            : "CDF"
                                                                    }
                                                                >
                                                                    {fetchData2 &&
                                                                    fetchData2.CodeMonnaie ==
                                                                        1
                                                                        ? "USD"
                                                                        : "CDF"}
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
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
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <input
                                                                id="Montant"
                                                                name="Montant"
                                                                type="text"
                                                                className={`form-control ${error.Montant ? "is-invalid" : ""}`}
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                    fontWeight:
                                                                        "bold",
                                                                    fontSize:
                                                                        "18px",
                                                                }}
                                                                onChange={(e) =>
                                                                    setMontant(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                value={Montant}
                                                                placeholder="0,00"
                                                            />
                                                            {error.Montant && (
                                                                <small className="text-danger d-block mt-1">
                                                                    {
                                                                        error.Montant
                                                                    }
                                                                </small>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    color: "steelblue",
                                                                    fontWeight:
                                                                        "500",
                                                                }}
                                                            >
                                                                Type document
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <select
                                                                id="typeDocument"
                                                                name="typeDocument"
                                                                className={`form-control ${error.typeDocument ? "is-invalid" : ""}`}
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                }}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setTypeDocument(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            >
                                                                <option value="">
                                                                    Sélectionnez
                                                                </option>
                                                                <option value="Visa de retrait">
                                                                    Visa de
                                                                    retrait
                                                                </option>
                                                                <option value="Bon de depense">
                                                                    Bon de
                                                                    dépense
                                                                </option>
                                                            </select>
                                                            {error.typeDocument && (
                                                                <small className="text-danger d-block mt-1">
                                                                    {
                                                                        error.typeDocument
                                                                    }
                                                                </small>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    color: "steelblue",
                                                                    fontWeight:
                                                                        "500",
                                                                }}
                                                            >
                                                                Num document
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                id="numDocument"
                                                                name="numDocument"
                                                                className="form-control"
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                    backgroundColor:
                                                                        "#f8f9fa",
                                                                }}
                                                                disabled
                                                                value={
                                                                    fetchnumDocument
                                                                        ? "DC00" +
                                                                          fetchnumDocument
                                                                        : ""
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    color: "steelblue",
                                                                    fontWeight:
                                                                        "500",
                                                                }}
                                                            >
                                                                Bénéficiaire
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <select
                                                                id="benecifiaire"
                                                                name="benecifiaire"
                                                                className="form-control"
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                }}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setBenecifiaire(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            >
                                                                <option value="">
                                                                    Sélectionnez
                                                                </option>
                                                                {fetchMandataire &&
                                                                    fetchMandataire.map(
                                                                        (
                                                                            res,
                                                                            idx,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                value={
                                                                                    res.mendataireName
                                                                                }
                                                                            >
                                                                                {
                                                                                    res.mendataireName
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                <option value="autre">
                                                                    Autre
                                                                </option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    {benecifiaire ==
                                                        "autre" && (
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "green",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Nom
                                                                    bénéficiaire
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
                                                                    id="other_benecifiaire"
                                                                    name="other_benecifiaire"
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                        border: "2px solid green",
                                                                    }}
                                                                    placeholder="Nom du bénéficiaire"
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        setother_benecifiaire(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ).toUpperCase();
                                                                    }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    color: "steelblue",
                                                                    fontWeight:
                                                                        "500",
                                                                }}
                                                            >
                                                                Téléphone
                                                            </label>
                                                        </td>
                                                        <td
                                                            style={{
                                                                padding: "8px",
                                                            }}
                                                        >
                                                            <input
                                                                type="text"
                                                                id="telephone"
                                                                name="telephone"
                                                                className="form-control"
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                }}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setTelephone(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                                value={
                                                                    telephone
                                                                }
                                                                placeholder="Numéro de téléphone"
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </fieldset>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Bouton de validation */}
                        <div className="col-md-3">
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
                                        className="btn w-100 py-3 fw-bold"
                                        id="validerbtn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #17a2b8, #138496)",
                                            border: "none",
                                            borderRadius: "12px",
                                            fontSize: "16px",
                                            color: "white",
                                            transition: "all 0.3s ease",
                                        }}
                                        onClick={saveOperation}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(-2px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 16px rgba(23,162,184,0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "none";
                                        }}
                                        disabled={!Montant || !typeDocument}
                                    >
                                        <i
                                            className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}
                                        ></i>
                                        Valider le visa
                                    </button>
                                </div>
                                <div className="card-footer bg-white border-0 pb-3">
                                    <small className="text-muted d-block text-center">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Assurez-vous que toutes les informations
                                        sont correctes
                                    </small>
                                </div>
                            </div>
                        </div>
                        {/* Signature et photo */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-3 h-100">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-signature me-2"></i>
                                        Signature
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {signature_file ? (
                                        <div className="text-center">
                                            <div
                                                className="border rounded-3 p-3"
                                                style={{
                                                    backgroundColor: "#f8f9fa",
                                                }}
                                            >
                                                <iframe
                                                    src={`uploads/membres/signatures/files/${signature_file}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "250px",
                                                        border: "none",
                                                        borderRadius: "8px",
                                                    }}
                                                    title="Signature du membre"
                                                ></iframe>
                                                <small className="text-muted d-block mt-2">
                                                    <i className="fas fa-check-circle text-success me-1"></i>
                                                    Signature du titulaire du
                                                    compte
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <i className="fas fa-signature fa-4x mb-3 opacity-50"></i>
                                            <p className="mb-0">
                                                Aucune signature disponible
                                            </p>
                                            <small>
                                                Veuillez sélectionner un compte
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ================== TABLEAU DES DERNIÈRES OPÉRATIONS VISÉES ================== */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-clock me-2"></i>Dernières
                                opérations visées
                            </h6>
                        </div>
                        <div className="card-body">
                            {loadingRecent ? (
                                <div className="text-center py-4">
                                    <div
                                        className="spinner-border text-teal"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Chargement...
                                        </span>
                                    </div>
                                </div>
                            ) : recentOperations &&
                              recentOperations.length > 0 ? (
                                <>
                                    <TableWithPagination
                                        data={recentOperations}
                                        itemsPerPage={10}
                                        renderRow={(op, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {op.numDocument ||
                                                        op.NumDocument}
                                                </td>
                                                <td>
                                                    {op.beneficiaire ||
                                                        op.Retirant}
                                                </td>
                                                <td className="fw-bold">
                                                    {op.Montant?.toLocaleString()}{" "}
                                                    {op.CodeMonnaie}
                                                </td>
                                                <td>
                                                    {new Date(
                                                        op.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    {op.Servie == "1" ? (
                                                        <span className="badge bg-success">
                                                            Servie
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger">
                                                            Pas servie
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                    <p className="mb-0">
                                        Aucune opération visa récente
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Visa;
