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
     const [photo_file, setphoto_file] = useState();
    const [fetchnumDocument, setFetchnumDocument] = useState();
    const [fetchMandataire, setFetchMandataire] = useState();
    const [loadingData, setloadingData] = useState(false);
    const [isLoadingBar, setIsLoadingBar] = useState();
    const [fetchSolde, setFetchSolde] = useState();
    const [recentOperations, setRecentOperations] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [getNumCompte, setGetNumCompte] = useState();
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
            setphoto_file(
                res.data.membreSignature
                    ? res.data.membreSignature.photo_file
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
                setGetNumCompte(res.data.NumCompte);
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
                    <div className="row g-4 mb-4">
                        {/* Carte 1: Recherche Compte */}
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
                                            id="compte_to_search"
                                            type="text"
                                            className="form-control modern-input"
                                            placeholder="Numéro de compte..."
                                            style={{
                                                borderRadius: "12px 0 0 12px",
                                                borderRight: "none",
                                            }}
                                            onChange={(e) =>
                                                setsearched_account(
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
                                            maxHeight: "320px",
                                            overflowY: "auto",
                                        }}
                                        className="custom-scroll"
                                    >
                                        <table className="table table-hover mb-0">
                                            <tbody>
                                                {fetchData?.map(
                                                    (res, index) => (
                                                        <tr
                                                            key={index}
                                                            className={`clickable-row ${getNumCompte === res.NumCompte ? "table-active" : ""}`}
                                                            style={{
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.2s",
                                                            }}
                                                            onClick={(event) =>
                                                                getAccountInfo(
                                                                    event,
                                                                )
                                                            }
                                                        >
                                                            <td className="py-3 px-3 fw-semibold">
                                                                {res.NumCompte}
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
                                                {(!fetchData ||
                                                    fetchData.length === 0) && (
                                                    <tr>
                                                        <td
                                                            colSpan="2"
                                                            className="text-center py-5 text-muted"
                                                        >
                                                            <i className="fas fa-inbox fa-2x mb-2 opacity-50 d-block"></i>
                                                            Aucun compte trouvé
                                                        </td>
                                                    </tr>
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
                                            "linear-gradient(135deg, #17a2b8 0%, #0f7c8c 100%)",
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
                    <div className="row g-4">
                        {/* Carte 1: Informations du visa */}
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-info-circle me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Informations du visa
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
                                                id="devise"
                                                name="devise"
                                                className="modern-select bg-white"
                                                disabled
                                            >
                                                <option
                                                    value={
                                                        fetchData2?.CodeMonnaie ==
                                                        1
                                                            ? "USD"
                                                            : "CDF"
                                                    }
                                                >
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
                                                name="Montant"
                                                type="text"
                                                className={`form-control modern-input fw-bold fs-4 text-success  ${error.Montant ? "is-invalid" : ""}`}
                                                onChange={(e) =>
                                                    setMontant(e.target.value)
                                                }
                                                value={Montant}
                                                placeholder="0,00"
                                            />
                                        </div>
                                        {error.Montant && (
                                            <small className="text-danger d-block mt-1">
                                                {error.Montant}
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Type document{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            id="typeDocument"
                                            name="typeDocument"
                                            className={`form-select modern-input ${error.typeDocument ? "is-invalid" : ""}`}
                                            onChange={(e) =>
                                                setTypeDocument(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Sélectionnez
                                            </option>
                                            <option value="Visa de retrait">
                                                Visa de retrait
                                            </option>
                                            <option value="Bon de depense">
                                                Bon de dépense
                                            </option>
                                        </select>
                                        {error.typeDocument && (
                                            <small className="text-danger d-block mt-1">
                                                {error.typeDocument}
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Numéro document
                                        </label>
                                        <input
                                            type="text"
                                            id="numDocument"
                                            name="numDocument"
                                            className="form-control modern-input bg-light"
                                            disabled
                                            value={
                                                fetchnumDocument
                                                    ? "DC00" + fetchnumDocument
                                                    : ""
                                            }
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Bénéficiaire{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            id="benecifiaire"
                                            name="benecifiaire"
                                            className="form-select modern-input"
                                            onChange={(e) =>
                                                setBenecifiaire(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Sélectionnez
                                            </option>
                                            {fetchMandataire?.map(
                                                (res, idx) => (
                                                    <option
                                                        key={idx}
                                                        value={
                                                            res.mendataireName
                                                        }
                                                    >
                                                        {res.mendataireName}
                                                    </option>
                                                ),
                                            )}
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>

                                    {benecifiaire == "autre" && (
                                        <div className="mb-3">
                                            <label className="label-modern text-success">
                                                Nom bénéficiaire
                                            </label>
                                            <input
                                                type="text"
                                                id="other_benecifiaire"
                                                name="other_benecifiaire"
                                                className="form-control modern-input border-success"
                                                placeholder="Nom du bénéficiaire"
                                                onChange={(e) =>
                                                    setother_benecifiaire(
                                                        e.target.value,
                                                    ).toUpperCase()
                                                }
                                            />
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            id="telephone"
                                            name="telephone"
                                            className="form-control modern-input"
                                            onChange={(e) =>
                                                setTelephone(e.target.value)
                                            }
                                            value={telephone}
                                            placeholder="Numéro de téléphone"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carte 2: Validation */}
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-check-circle me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Validation
                                    </h6>
                                </div>
                                <div className="card-body d-flex flex-column justify-content-center">
                                    <button
                                        className="btn gradient-btn w-100 py-3 fw-bold"
                                        id="validerbtn"
                                        onClick={saveOperation}
                                        disabled={!Montant || !typeDocument}
                                    >
                                        <i
                                            className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check-circle me-2"}`}
                                        ></i>
                                        Valider le visa
                                    </button>
                                    <small className="text-muted d-block text-center mt-3">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Assurez-vous que toutes les informations
                                        sont correctes
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Carte 3: Signature et photo */}
                        {/* <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                                <div className="card-header bg-white border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i
                                            className="fas fa-signature me-2"
                                            style={{ color: "#6366f1" }}
                                        ></i>
                                        Signature du titulaire
                                    </h6>
                                </div>
                                <div className="card-body d-flex flex-column justify-content-center">
                                    {signature_file ? (
                                        <div className="text-center">
                                            <div
                                                className="border rounded-4 p-3 bg-light"
                                                style={{
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                <iframe
                                                    src={`uploads/membres/signatures/files/${signature_file}`}
                                                    style={{
                                                        width: "100%",
                                                        height: "250px",
                                                        border: "none",
                                                        borderRadius: "12px",
                                                    }}
                                                    title="Signature du membre"
                                                ></iframe>
                                                <div className="mt-3">
                                                    <span className="badge bg-success rounded-pill px-3 py-2">
                                                        <i className="fas fa-check-circle me-1"></i>{" "}
                                                        Signature validée
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <i className="fas fa-signature fa-4x mb-3 opacity-50"></i>
                                            <p className="mb-0 fw-semibold">
                                                Aucune signature disponible
                                            </p>
                                            <small className="text-muted">
                                                Veuillez sélectionner un compte
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div> */}
                        {/* Carte 3: Signature et photo */}
{/* Carte 3: Signature et photo avec scrollbar personnalisée */}
<div className="col-md-4">
    <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
        <div className="card-header bg-white border-0 pt-3 pb-0">
            <h6 className="section-title">
                <i className="fas fa-id-card me-2" style={{ color: "#6366f1" }}></i>
                Photo et signature du titulaire
            </h6>
        </div>
        <div className="card-body d-flex flex-column gap-3">
            {/* Section Photo */}
            <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="fas fa-camera" style={{ color: "#138496", fontSize: "12px" }}></i>
                    <span className="fw-semibold small text-secondary" style={{ fontSize: "11px" }}>Photo du membre</span>
                </div>
                {photo_file ? (
                    <div className="text-center">
                        <div className="border rounded-3 p-2 bg-light">
                            <div 
                                className="scrollable-image"
                                style={{
                                    width: "100%",
                                    height: "150px",
                                    overflow: "auto",
                                    borderRadius: "8px",
                                }}
                            >
                                <img
                                    src={`uploads/membres/photos/files/${photo_file}`}
                                    alt="Photo du membre"
                                    style={{
                                        width: "100%",
                                        minHeight: "150px",
                                        objectFit: "contain",
                                    }}
                                    onError={(e) => {
                                        e.target.src = "/images/default-avatar.png";
                                    }}
                                />
                            </div>
                            <div className="mt-2">
                                <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: "10px" }}>
                                    <i className="fas fa-check-circle me-1"></i> Photo validée
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2 text-muted border rounded-3 bg-light">
                        <i className="fas fa-user-circle fa-2x mb-1 opacity-50"></i>
                        <p className="mb-0 small fw-semibold" style={{ fontSize: "11px" }}>Aucune photo disponible</p>
                        <small className="text-muted" style={{ fontSize: "10px" }}>Veuillez sélectionner un compte</small>
                    </div>
                )}
            </div>

            {/* Séparateur léger */}
            <hr className="my-1" style={{ borderColor: "#eef2f6" }} />

            {/* Section Signature */}
            <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="fas fa-signature" style={{ color: "#138496", fontSize: "12px" }}></i>
                    <span className="fw-semibold small text-secondary" style={{ fontSize: "11px" }}>Signature du membre</span>
                </div>
                {signature_file ? (
                    <div className="text-center">
                        <div className="border rounded-3 p-2 bg-light">
                            <div 
                                className="scrollable-signature"
                                style={{
                                    width: "100%",
                                    height: "120px",
                                    overflow: "auto",
                                    borderRadius: "8px",
                                }}
                            >
                                <iframe
                                    src={`uploads/membres/signatures/files/${signature_file}`}
                                    style={{
                                        width: "100%",
                                        height: "700px",
                                        border: "none",
                                    }}
                                    title="Signature du membre"
                                ></iframe>
                            </div>
                            <div className="mt-2">
                                <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: "10px" }}>
                                    <i className="fas fa-check-circle me-1"></i> Signature validée
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2 text-muted border rounded-3 bg-light">
                        <i className="fas fa-signature fa-2x mb-1 opacity-50"></i>
                        <p className="mb-0 small fw-semibold" style={{ fontSize: "11px" }}>Aucune signature disponible</p>
                        <small className="text-muted" style={{ fontSize: "10px" }}>Veuillez sélectionner un compte</small>
                    </div>
                )}
            </div>
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

            <style>
                {`
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
                        background: linear-gradient(105deg, #17a2b8, #0f7c8c);
                        border: none;
                        color: white;
                        font-weight: 500;
                        transition: all 0.25s;
                    }
                    .gradient-btn:hover {
                        transform: scale(1.02);
                        background: linear-gradient(105deg, #0f7c8c, #0d6a78);
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
                        border-left: 3px solid #17a2b8;
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

                    .modern-input.bg-light {
                        background-color: #f8f9fa;
                    }

                    .gradient-btn {
                        background: linear-gradient(105deg, #17a2b8, #0f7c8c);
                        border: none;
                        border-radius: 14px;
                        font-weight: 600;
                        letter-spacing: 0.3px;
                        transition: all 0.25s;
                        color: white;
                    }
                    .gradient-btn:hover:not(:disabled) {
                        transform: scale(1.02);
                        background: linear-gradient(105deg, #0f7c8c, #0d6a78);
                        box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
                    }
                    .gradient-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
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

                    
                `}
            </style>
        </>
    );
};

export default Visa;
