import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";
import RecuDepot from "./Modals/RecuDepot";
import RecuDepotA5 from "./Modals/RecuDepotA5";

// Composant de pagination réutilisable
const TableWithPagination = ({ data, itemsPerPage, renderRow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (totalPages === 0) return null;

    return (
        <>
            <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                    <thead>
                        <tr style={{ color: "steelblue" }}>
                            <th>Réf.</th>
                            <th>Montant</th>
                            <th>Action</th>
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
                        disabled={currentPage == 1}
                    >
                        <i className="fas fa-chevron-left"></i> Préc.
                    </button>
                    <span className="small text-muted">
                        Page {currentPage} / {totalPages}
                    </span>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Suiv. <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </>
    );
};

const DepotEspece = () => {
    // État des coupures CDF
    const [vightMille, setVightMille] = useState(0);
    const [dixMille, setDixMille] = useState(0);
    const [cinqMille, setCinqMille] = useState(0);
    const [milleFranc, setMilleFranc] = useState(0);
    const [cinqCentFr, setCinqCentFr] = useState(0);
    const [deuxCentFranc, setDeuxCentFranc] = useState(0);
    const [centFranc, setCentFranc] = useState(0);
    const [cinquanteFanc, setCinquanteFanc] = useState(0);

    // État des coupures USD
    const [hundred, setHundred] = useState(0);
    const [fitfty, setFifty] = useState(0);
    const [twenty, setTwenty] = useState(0);
    const [ten, setTen] = useState(0);
    const [five, setFive] = useState(0);
    const [oneDollar, setOneDollar] = useState(0);

    // États généraux
    const [searchedAccount, setSearchedAccount] = useState("");
    const [fetchData, setFetchData] = useState();
    const [fetchData2, setFetchData2] = useState();
    const [devise, setDevise] = useState("CDF");
    const [motifDepot, setMotifDepot] = useState("EPARGNE");
    const [deposantName, setDeposantName] = useState("");
    const [deposantPhone, setDeposantPhone] = useState("");
    const [montant, setMontant] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);
    const [commission, setCommission] = useState(0);
    const [commissionConfig, setCommissionConfig] = useState(""); // ← renommé
    const [getRecuConfig, setGetRecuConfig] = useState("");
    const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [getNumCompte, setGetNumCompte] = useState();
    const [isLoadingBar, setIsLoadingBar] = useState(false);
    const [fetchSolde, setFetchSolde] = useState();

    // Nouvel état pour savoir si le nom du déposant a été modifié manuellement
    const [isDeposantNameManuallyEdited, setIsDeposantNameManuallyEdited] =
        useState(false);

    // --------------------------
    // Utilitaires de formatage montant
    // --------------------------
    const formatMontantSaisie = (value) => {
        let clean = value.replace(/[^\d,]/g, "");
        if (clean === "") return "";
        let parts = clean.split(",");
        if (parts.length > 2) parts = [parts[0], parts.slice(1).join("")];
        let entier = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (parts.length === 2) return entier + "," + parts[1].slice(0, 2);
        return entier;
    };

    const handleMontantChange = (e) => {
        const formatted = formatMontantSaisie(e.target.value);
        setMontant(formatted);
    };

    const parseMontant = (formatted) => {
        if (!formatted) return 0;
        return parseFloat(formatted.replace(/ /g, "").replace(",", "."));
    };

    const calculerTotalBilletage = () => {
        if (fetchData2 && fetchData2.CodeMonnaie == 1) {
            return (
                hundred * 100 +
                fitfty * 50 +
                twenty * 20 +
                ten * 10 +
                five * 5 +
                oneDollar * 1
            );
        } else {
            return (
                vightMille * 20000 +
                dixMille * 10000 +
                cinqMille * 5000 +
                milleFranc * 1000 +
                cinqCentFr * 500 +
                deuxCentFranc * 200 +
                centFranc * 100 +
                cinquanteFanc * 50
            );
        }
    };

    const totalBilletage = calculerTotalBilletage();
    const montantSaisi = parseMontant(montant);
    const isMontantIncoherent =
        totalBilletage !== montantSaisi &&
        (montantSaisi > 0 || totalBilletage > 0);

    // --------------------------
    // Appels API
    // --------------------------
    const getSeachedData = async (e) => {
        e.preventDefault();
        setLoadingData(true);
        const res = await axios.post("/eco/page/depot-espece/get-account/2", {
            searched_account: searchedAccount,
        });
        if (res.data.status == 1) {
            setFetchData(res.data.data);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
        setLoadingData(false);
    };

    const getAccountInfo = async (numCompte) => {
        setLoadingData(true);
        const res = await axios.post(
            "/eco/page/depot-espece/get-account/specific",
            {
                NumCompte: numCompte,
            },
        );
        if (res.data.status == 1) {
            setFetchData2(res.data.data);
            setGetNumCompte(numCompte);
            if (!isDeposantNameManuallyEdited) {
                setDeposantName(res.data.data.NomCompte);
            }
            setFetchSolde(res.data.soldeCompte);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
        setLoadingData(false);
    };

    const getBilletage = async () => {
        const res = await axios.get("/eco/depot/get-recu");
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.dataCDF);
            setGetBilletageUSD(res.data.dataUSD);
        }
    };

    // Fonction renommée pour éviter le conflit
    const fetchCommissionConfig = async () => {
        const res = await axios.get("/eco/pages/get-commission-setting");
        if (res.data.status == 1) {
            setCommissionConfig(res.data.data);
            setGetRecuConfig(res.data.type_recu);
        }
    };

    const saveOperation = async (e) => {
        e.preventDefault();

        if (!deposantName || deposantName.trim() === "") {
            Swal.fire({
                title: "Champ obligatoire",
                text: "Veuillez renseigner le nom du déposant.",
                icon: "warning",
                confirmButtonText: "D'accord",
            });
            document.getElementById("DeposantName")?.focus();
            return;
        }

        if (!montant || parseMontant(montant) <= 0) {
            Swal.fire({
                title: "Montant invalide",
                text: "Veuillez saisir un montant valide.",
                icon: "warning",
                confirmButtonText: "D'accord",
            });
            document.getElementById("Montant")?.focus();
            return;
        }

        if (isMontantIncoherent) {
            Swal.fire({
                title: "Incohérence",
                text: `Le total du billetage (${totalBilletage.toLocaleString()}) ne correspond pas au montant saisi (${montantSaisi.toLocaleString()}). Veuillez corriger.`,
                icon: "error",
                confirmButtonText: "Ok",
            });
            return;
        }

        setLoading(true);
        setIsLoadingBar(true);

        try {
            const res = await axios.post(
                "/eco/page/depot-espece/save-deposit",
                {
                    vightMille,
                    dixMille,
                    cinqMille,
                    milleFranc,
                    cinqCentFr,
                    deuxCentFranc,
                    centFranc,
                    cinquanteFanc,
                    hundred,
                    fitfty,
                    twenty,
                    ten,
                    five,
                    oneDollar,
                    devise: fetchData2?.CodeMonnaie == 1 ? "USD" : "CDF",
                    motifDepot,
                    DeposantName: deposantName,
                    DeposantPhone: deposantPhone,
                    Montant: montantSaisi,
                    NumAbrege: searchedAccount,
                    Commission: commission,
                    getNumCompte,
                },
            );
            if (res.data.status == 1) {
                setDeposantName("");
                setDeposantPhone("");
                setMontant("0");
                setVightMille(0);
                setDixMille(0);
                setCinqMille(0);
                setMilleFranc(0);
                setCinqCentFr(0);
                setDeuxCentFranc(0);
                setCentFranc(0);
                setCinquanteFanc(0);
                setHundred(0);
                setFifty(0);
                setTwenty(0);
                setTen(0);
                setFive(0);
                setOneDollar(0);
                setCommission(0);
                setIsDeposantNameManuallyEdited(false);
                Swal.fire({
                    title: "Succès",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                getBilletage();
            } else if (res.data.status === 0) {
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
            Swal.fire({
                title: "Erreur",
                text: "Erreur de connexion. Veuillez réessayer.",
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } finally {
            setLoading(false);
            setIsLoadingBar(false);
        }
    };

    const handlePrintClick = (data) => {
        setSelectedData(data);
    };

    const handleDeposantNameChange = (e) => {
        setIsDeposantNameManuallyEdited(true);
        setDeposantName(e.target.value.toUpperCase());
    };

    // Raccourci clavier Ctrl+Entrée
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
                (e.ctrlKey && e.key === "Enter") ||
                (e.key === "Enter" && document.activeElement?.id === "Montant")
            ) {
                e.preventDefault();
                const btn = document.getElementById("validerbtn");
                if (btn && !btn.disabled) {
                    saveOperation(e);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [totalBilletage, montantSaisi, fetchData2, deposantName]);

    useEffect(() => {
        fetchCommissionConfig();
        getBilletage();
    }, []);

    const myspinner = {
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
                                        background: "#138496",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i
                                                className="fas fa-money-bill-wave"
                                                style={{
                                                    fontSize: "28px",
                                                    color: "white",
                                                }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5 className="text-white fw-bold mb-0">
                                                Dépôt D'Espèce
                                            </h5>
                                            <small className="text-white-50">
                                                Enregistrement des opérations de
                                                dépôt
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

                    {/* Section 1: Recherche et informations compte */}
                    <div className="row g-4 mb-4">
                        {/* Carte 1: Recherche compte */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-search me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Recherche Compte
                                    </h6>
                                </div>
                                <div className="card-body pt-2">
                                    <div className="input-group mb-4">
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            placeholder="Numéro de compte..."
                                            style={{
                                                borderRadius: "12px 0 0 12px",
                                                borderRight: "none",
                                            }}
                                            onChange={(e) =>
                                                setSearchedAccount(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            className="btn gradient-btn"
                                            style={{
                                                borderRadius: "0 12px 12px 0",
                                                padding: "0 20px",
                                            }}
                                            onClick={getSeachedData}
                                        >
                                            <i className="fas fa-search me-1"></i>{" "}
                                            Rechercher
                                        </button>
                                    </div>

                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="text-muted small fw-semibold">
                                                Intitulé
                                            </span>
                                            <span className="fw-semibold text-dark">
                                                {fetchData2?.NomCompte || "—"}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3">
                                            <span className="text-muted small fw-semibold">
                                                N° Compte
                                            </span>
                                            <span className="fw-semibold text-dark">
                                                {fetchData2?.NumCompte || "—"}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted small fw-semibold">
                                                Code Agence
                                            </span>
                                            <span className="fw-semibold text-dark">
                                                {fetchData2?.CodeAgence || "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carte 2: Liste des comptes */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-list me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Liste des comptes
                                    </h6>
                                </div>
                                <div className="card-body p-0">
                                    <div
                                        style={{
                                            maxHeight: "280px",
                                            overflowY: "auto",
                                        }}
                                        className="custom-scroll"
                                    >
                                        <table className="table table-hover mb-0">
                                            <tbody>
                                                {fetchData &&
                                                    fetchData.map(
                                                        (res, index) => (
                                                            <tr
                                                                key={index}
                                                                className={`clickable-row ${getNumCompte === res.NumCompte ? "table-active" : ""}`}
                                                                onClick={() =>
                                                                    getAccountInfo(
                                                                        res.NumCompte,
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                    transition:
                                                                        "all 0.2s",
                                                                }}
                                                            >
                                                                <td className="py-3 px-3 fw-semibold">
                                                                    {
                                                                        res.NumCompte
                                                                    }
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <span
                                                                        className={`badge ${res.CodeMonnaie == 1 ? "bg-info" : "bg-success"} px-3 py-2 rounded-pill`}
                                                                    >
                                                                        {res.CodeMonnaie ==
                                                                        1
                                                                            ? "USD"
                                                                            : "CDF"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {getNumCompte && (
                                    <div className="card-footer bg-white border-top py-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <i className="fas fa-check-circle text-success me-1"></i>
                                                <small className="text-muted">
                                                    Compte sélectionné
                                                </small>
                                            </div>
                                            <span className="badge bg-primary px-3 py-2 rounded-pill fs-6">
                                                {getNumCompte}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Carte 3: Solde du compte */}
                        {fetchSolde && fetchData2 && (
                            <div className="col-md-4">
                                <div
                                    className="card border-0 shadow-sm rounded-4 h-100 dashboard-card"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #0b7285 0%, #0a5c6b 100%)",
                                    }}
                                >
                                    <div className="card-body text-center d-flex flex-column justify-content-center">
                                        <i className="fas fa-wallet fa-2x mb-3 opacity-75 text-white"></i>
                                        <h6 className="text-white-50 mb-2 text-uppercase tracking-wide">
                                            Solde disponible
                                        </h6>
                                        <h2 className="fw-bold mb-0 text-white">
                                            {fetchData2?.CodeMonnaie == 1
                                                ? "USD "
                                                : "CDF "}
                                            <span className="display-6">
                                                {fetchSolde.soldeMembre?.toLocaleString(
                                                    "fr-FR",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    },
                                                ) || "0,00"}
                                            </span>
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Séparateur */}
                    <div className="position-relative my-4">
                        <hr
                            className="border-2"
                            style={{ borderColor: "#e9ecef" }}
                        />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                            <i className="fas fa-arrow-down me-1"></i>{" "}
                            Informations de dépôt
                        </span>
                    </div>

                    {/* Section 2: Formulaire de dépôt */}
                    <div className="row g-4">
                        {/* Carte 1: Informations du dépôt */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-info-circle me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Informations du dépôt
                                    </h6>
                                </div>
                                <div className="card-body pt-2">
                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Devise
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0 rounded-3">
                                                <i className="fas fa-dollar-sign text-muted"></i>
                                            </span>
                                            <select
                                                className="modern-select bg-white"
                                                disabled
                                                value={
                                                    fetchData2?.CodeMonnaie == 1
                                                        ? "USD"
                                                        : "CDF"
                                                }
                                            >
                                                <option>
                                                    {fetchData2?.CodeMonnaie ==
                                                    1
                                                        ? "USD"
                                                        : "CDF"}
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Motif
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            onChange={(e) =>
                                                setMotifDepot(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            value={motifDepot}
                                            placeholder="Ex: Dépôt espèces"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Déposant{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            id="DeposantName"
                                            type="text"
                                            className="form-control modern-input"
                                            onChange={handleDeposantNameChange}
                                            value={deposantName}
                                            placeholder="Nom complet du déposant"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control modern-input"
                                            onChange={(e) =>
                                                setDeposantPhone(e.target.value)
                                            }
                                            value={deposantPhone}
                                            placeholder="Numéro de téléphone"
                                        />
                                    </div>

                                    {commissionConfig == 1 && (
                                        <div className="mb-3">
                                            <label className="label-modern">
                                                Commission
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control modern-input"
                                                onChange={(e) =>
                                                    setCommission(
                                                        e.target.value,
                                                    )
                                                }
                                                value={commission}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Montant{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0 rounded-3">
                                                <i className="fas fa-money-bill-wave text-success"></i>
                                            </span>
                                            <input
                                                id="Montant"
                                                type="text"
                                                className="form-control modern-input fw-bold fs-4 text-success"
                                                onChange={handleMontantChange}
                                                value={montant}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carte 2: Billetage */}
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-money-bill me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Billetage
                                    </h6>
                                    <span className="badge bg-primary rounded-pill px-3">
                                        Détail des coupures
                                    </span>
                                </div>
                                <div
                                    className="card-body pt-2"
                                    style={{
                                        maxHeight: "450px",
                                        overflowY: "auto",
                                    }}
                                >
                                    <div className="table-responsive">
                                        <table className="table table-hover table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Coupure</th>
                                                    <th className="text-center">
                                                        Nombre
                                                    </th>
                                                    <th className="text-end">
                                                        Montant
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(fetchData2?.CodeMonnaie == 1
                                                    ? [
                                                          {
                                                              value: hundred,
                                                              set: setHundred,
                                                              label: "100 USD",
                                                              multiplier: 100,
                                                          },
                                                          {
                                                              value: fitfty,
                                                              set: setFifty,
                                                              label: "50 USD",
                                                              multiplier: 50,
                                                          },
                                                          {
                                                              value: twenty,
                                                              set: setTwenty,
                                                              label: "20 USD",
                                                              multiplier: 20,
                                                          },
                                                          {
                                                              value: ten,
                                                              set: setTen,
                                                              label: "10 USD",
                                                              multiplier: 10,
                                                          },
                                                          {
                                                              value: five,
                                                              set: setFive,
                                                              label: "5 USD",
                                                              multiplier: 5,
                                                          },
                                                          {
                                                              value: oneDollar,
                                                              set: setOneDollar,
                                                              label: "1 USD",
                                                              multiplier: 1,
                                                          },
                                                      ]
                                                    : [
                                                          {
                                                              value: vightMille,
                                                              set: setVightMille,
                                                              label: "20 000 FC",
                                                              multiplier: 20000,
                                                          },
                                                          {
                                                              value: dixMille,
                                                              set: setDixMille,
                                                              label: "10 000 FC",
                                                              multiplier: 10000,
                                                          },
                                                          {
                                                              value: cinqMille,
                                                              set: setCinqMille,
                                                              label: "5 000 FC",
                                                              multiplier: 5000,
                                                          },
                                                          {
                                                              value: milleFranc,
                                                              set: setMilleFranc,
                                                              label: "1 000 FC",
                                                              multiplier: 1000,
                                                          },
                                                          {
                                                              value: cinqCentFr,
                                                              set: setCinqCentFr,
                                                              label: "500 FC",
                                                              multiplier: 500,
                                                          },
                                                          {
                                                              value: deuxCentFranc,
                                                              set: setDeuxCentFranc,
                                                              label: "200 FC",
                                                              multiplier: 200,
                                                          },
                                                          {
                                                              value: centFranc,
                                                              set: setCentFranc,
                                                              label: "100 FC",
                                                              multiplier: 100,
                                                          },
                                                          {
                                                              value: cinquanteFanc,
                                                              set: setCinquanteFanc,
                                                              label: "50 FC",
                                                              multiplier: 50,
                                                          },
                                                      ]
                                                ).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-semibold">
                                                            {item.label}{" "}
                                                            <span className="text-muted">
                                                                ×
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm text-center w-75 mx-auto modern-input"
                                                                style={{
                                                                    maxWidth:
                                                                        "100px",
                                                                }}
                                                                value={
                                                                    item.value
                                                                }
                                                                onChange={(e) =>
                                                                    item.set(
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                    )
                                                                }
                                                                 onFocus={(e) => e.target.select()}
                                                            />
                                                        </td>
                                                        <td className="text-end fw-semibold text-success">
                                                            {(
                                                                item.value *
                                                                item.multiplier
                                                            ).toLocaleString(
                                                                "fr-FR",
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="table-warning">
                                                <tr>
                                                    <th class="text-end">
                                                        Total
                                                    </th>
                                                    <th class="text-center">
                                                        {fetchData2?.CodeMonnaie ==
                                                        1
                                                            ? hundred +
                                                              fitfty +
                                                              twenty +
                                                              ten +
                                                              five +
                                                              oneDollar
                                                            : vightMille +
                                                              dixMille +
                                                              cinqMille +
                                                              milleFranc +
                                                              cinqCentFr +
                                                              deuxCentFranc +
                                                              centFranc +
                                                              cinquanteFanc}
                                                    </th>
                                                    <th class="text-end fs-5 fw-bold text-success">
                                                        {totalBilletage.toLocaleString(
                                                            "fr-FR",
                                                        )}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    {isMontantIncoherent && (
                                        <div className="alert alert-warning py-2 mt-3 text-center small rounded-3">
                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                            Total billetage (
                                            {totalBilletage.toLocaleString(
                                                "fr-FR",
                                            )}
                                            ) ≠ montant saisi (
                                            {montantSaisi.toLocaleString(
                                                "fr-FR",
                                            )}
                                            )
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Carte 3: Actions et historique */}
                        <div className="col-md-3">
                            <div className="d-flex flex-column gap-3">
                                {/* Bouton validation */}
                                <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                                    <div className="card-body">
                                        <button
                                            id="validerbtn"
                                            className="btn gradient-btn w-100 py-3 fw-bold"
                                            onClick={saveOperation}
                                            disabled={
                                                !fetchData2 ||
                                                !montant ||
                                                isMontantIncoherent
                                            }
                                            title={
                                                isMontantIncoherent
                                                    ? "Le montant ne correspond pas au billetage"
                                                    : ""
                                            }
                                        >
                                            <i
                                                className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check-circle me-2"}`}
                                            ></i>
                                            Valider le dépôt
                                        </button>
                                    </div>
                                </div>

                                {/* Historique */}
                                <div className="card border-0 shadow-sm rounded-4 dashboard-card flex-grow-1">
                                    <div className="card-header bg-white border-0 pt-3 pb-0">
                                        <h6 className="section-title">
                                            <i
                                                className="fas fa-history me-2"
                                                style={{ color: "#6366f1" }}
                                            ></i>
                                            Opérations récentes
                                        </h6>
                                    </div>
                                    <div className="card-body p-0">
                                        {getBilletageCDF?.length > 0 && (
                                            <>
                                                <div className="px-3 py-2 bg-light">
                                                    <small className="fw-bold text-primary">
                                                        📌 Franc Congolais (CDF)
                                                    </small>
                                                </div>
                                                <TableWithPagination
                                                    data={getBilletageCDF}
                                                    itemsPerPage={3}
                                                    renderRow={(res, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <small>
                                                                    {
                                                                        res.refOperation
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td class="fw-bold text-success">
                                                                {res.montantEntre?.toLocaleString(
                                                                    "fr-FR",
                                                                )}
                                                            </td>
                                                            <td class="text-center">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary rounded-3"
                                                                    data-toggle="modal"
                                                                    data-target="#modal-bordereau"
                                                                    onClick={() =>
                                                                        handlePrintClick(
                                                                            res,
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fas fa-print"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )}
                                                />
                                            </>
                                        )}
                                        {getBilletageUSD?.length > 0 && (
                                            <>
                                                <div className="px-3 py-2 bg-light mt-2">
                                                    <small className="fw-bold text-primary">
                                                        💵 Dollar américain
                                                        (USD)
                                                    </small>
                                                </div>
                                                <TableWithPagination
                                                    data={getBilletageUSD}
                                                    itemsPerPage={3}
                                                    renderRow={(res, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <small>
                                                                    {
                                                                        res.refOperation
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td class="fw-bold text-success">
                                                                {res.montantEntre?.toLocaleString(
                                                                    "fr-FR",
                                                                )}
                                                            </td>
                                                            <td class="text-center">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary rounded-3"
                                                                    data-toggle="modal"
                                                                    data-target="#modal-bordereau"
                                                                    onClick={() =>
                                                                        handlePrintClick(
                                                                            res,
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fas fa-print"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )}
                                                />
                                            </>
                                        )}
                                        {!getBilletageCDF?.length &&
                                            !getBilletageUSD?.length && (
                                                <div className="text-center py-5 text-muted">
                                                    <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                                    <p class="mb-0">
                                                        Aucune opération récente
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modals d'impression */}
                    {selectedData &&
                        (getRecuConfig === "Thermique" ? (
                            <RecuDepot data={selectedData} />
                        ) : getRecuConfig === "A5" ? (
                            <RecuDepotA5 data={selectedData} />
                        ) : null)}

                    <style>
                        {`
                        .table-ultra-compact th,
                        .table-ultra-compact td {
                            padding: 0.2rem 0.35rem;
                            line-height: 1;
                            font-size: 0.8rem;
                        }

                        .dashboard-card {
                            transition: transform 0.2s ease, box-shadow 0.2s ease;
                        }
                        .dashboard-card:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
                        }

                        .section-title {
                            font-size: 0.95rem;
                            font-weight: 600;
                            color: #1e293b;
                            letter-spacing: -0.2px;
                        }

                        .modern-input {
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 0.6rem 0.75rem;
                            transition: all 0.2s;
                        }
                        .modern-input:focus {
                            border-color: #6366f1;
                            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                            outline: none;
                        }

                        .gradient-btn {
                            background: linear-gradient(105deg, #0b7285, #0a5c6b);
                            border: none;
                            color: white;
                            font-weight: 500;
                            transition: all 0.25s;
                        }
                        .gradient-btn:hover {
                            transform: scale(1.02);
                            background: linear-gradient(105deg, #0a5c6b, #084a56);
                        }

                        .custom-scroll::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scroll::-webkit-scrollbar-track {
                            background: #f1f1f1;
                            border-radius: 10px;
                        }
                        .custom-scroll::-webkit-scrollbar-thumb {
                            background: #c1c1c1;
                            border-radius: 10px;
                        }
                        .custom-scroll::-webkit-scrollbar-thumb:hover {
                            background: #a8a8a8;
                        }

                        .clickable-row {
                            transition: background 0.15s ease;
                        }
                        .clickable-row:hover {
                            background-color: #f8f9fa;
                        }
                        .table-active {
                            background-color: #e6f7f5 !important;
                            border-left: 3px solid #0b7285;
                        }

                        .tracking-wide {
                            letter-spacing: 0.5px;
                        }


                        .label-modern {
                            font-size: 0.7rem;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            color: #64748b;
                            margin-bottom: 0.3rem;
                            display: block;
                        }

                        .dashboard-card {
                            transition: transform 0.2s ease, box-shadow 0.2s ease;
                        }
                        .dashboard-card:hover {
                            transform: translateY(-4px);
                            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
                        }

                        .section-title {
                            font-size: 0.95rem;
                            font-weight: 600;
                            color: #1e293b;
                            letter-spacing: -0.2px;
                        }

                        .modern-input {
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 0.6rem 0.75rem;
                            transition: all 0.2s;
                        }
                        .modern-input:focus {
                            border-color: #6366f1;
                            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                            outline: none;
                        }

                        .gradient-btn {
                            background: linear-gradient(105deg, #0b7285, #0a5c6b);
                            border: none;
                            border-radius: 14px;
                            font-weight: 600;
                            letter-spacing: 0.3px;
                            transition: all 0.25s;
                            color: white;
                        }
                        .gradient-btn:hover:not(:disabled) {
                            transform: scale(1.02);
                            background: linear-gradient(105deg, #0a5c6b, #084a56);
                        }
                        .gradient-btn:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                        }
                        `}
                    </style>
                </div>
            )}
        </>
    );
};

export default DepotEspece;
