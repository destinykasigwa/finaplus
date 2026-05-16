import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuDelestageUSD from "./Modals/RecuDelestageUSD";
import RecuDelestageCDF from "./Modals/RecuDelestageCDF";

const Delestage = () => {
    const [loading, setLoading] = useState(false);
    const [devise, setDevise] = useState("CDF");
    const [fetchInfo, setFetchInfo] = useState(false);

    // Données brutes (une seule récupération)
    const [allBilletagesCDF, setAllBilletagesCDF] = useState([]);
    const [allBilletagesUSD, setAllBilletagesUSD] = useState([]);
    const [historicalCDF, setHistoricalCDF] = useState([]);
    const [historicalUSD, setHistoricalUSD] = useState([]);

    // État pour l'admin
    const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
        return window.currentUser?.role === "SuperAdmin";
    });
    // const [selectedDate, setSelectedDate] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [selectedCaissier, setSelectedCaissier] = useState("");
    // Données filtrées (selon selectedDate)
    const [filteredCDF, setFilteredCDF] = useState([]);
    const [filteredUSD, setFilteredUSD] = useState([]);
    const [caissiersList, setCaissiersList] = useState([]);
    // Impression
    const [selectedData, setSelectedData] = useState(null);

    const [myBilletageCDF, setMyBilletageCDF] = useState(null);
    const [myBilletageUSD, setMyBilletageUSD] = useState(null);

    // Détection du rôle
    useEffect(() => {
        fetchAllData();
    }, []);

    // Chargement unique de toutes les données
    const fetchAllData = async () => {
        try {
            const [billetageRes, histoRes] = await Promise.all([
                axios.get("/eco/page/delestage/get-billetage-caissier"),
                axios.get("/eco/pages/delestage/get-daily-operations"),
            ]);
            if (billetageRes.data.status === 1) {
                if (isSuperAdmin) {
                    setAllBilletagesCDF(billetageRes.data.billetageCDF || []);
                    setAllBilletagesUSD(billetageRes.data.billetageUSD || []);
                } else {
                    setMyBilletageCDF(
                        billetageRes.data.billetageCDF?.[0] || null,
                    );
                    setMyBilletageUSD(
                        billetageRes.data.billetageUSD?.[0] || null,
                    );
                }
            }
            if (histoRes.data.status === 1) {
                setHistoricalCDF(histoRes.data.dataCDF || []);
                setHistoricalUSD(histoRes.data.dataUSD || []);
            }
            setFetchInfo(true);
        } catch (error) {
            console.error("Erreur chargement", error);
            Swal.fire("Erreur", "Impossible de charger les données", "error");
        }
    };

    // Filtrer localement en fonction de la date sélectionnée
    useEffect(() => {
        if (!fetchInfo) return;
        if (!selectedDate) {
            // Pas de filtre => toutes les données
            setFilteredCDF([...allBilletagesCDF]);
            setFilteredUSD([...allBilletagesUSD]);
        } else {
            setFilteredCDF(
                allBilletagesCDF.filter(
                    (item) => item.DateTransaction === selectedDate,
                ),
            );
            setFilteredUSD(
                allBilletagesUSD.filter(
                    (item) => item.DateTransaction === selectedDate,
                ),
            );
        }
    }, [selectedDate, allBilletagesCDF, allBilletagesUSD, fetchInfo]);

    // Extraire la liste des caissiers à partir des données filtrées
    useEffect(() => {
        const caissiersSet = new Set();
        [...filteredCDF, ...filteredUSD].forEach((item) => {
            if (item.NomUtilisateur) caissiersSet.add(item.NomUtilisateur);
        });
        const caissiers = Array.from(caissiersSet);
        setCaissiersList(caissiers);
        if (caissiers.length > 0 && !caissiers.includes(selectedCaissier)) {
            setSelectedCaissier(caissiers[0]);
        } else if (caissiers.length === 0) {
            setSelectedCaissier("");
        }
    }, [filteredCDF, filteredUSD]);

    // Récupérer les données d'un caissier donné (parmi les filtrées)
    const getCaissierData = (nom) => ({
        cdf: filteredCDF.find((c) => c.NomUtilisateur === nom),
        usd: filteredUSD.find((u) => u.NomUtilisateur === nom),
    });

    // Action de délestage
    const handleDelestage = async () => {
        if (!selectedCaissier) {
            Swal.fire(
                "Aucun caissier",
                "Veuillez sélectionner un caissier",
                "warning",
            );
            return;
        }
        setLoading(true);
        Swal.fire({
            title: "Confirmation",
            text: `Délester ${selectedCaissier} pour la date ${selectedDate || "toutes dates"} ?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const payload = { devise, caissier: selectedCaissier };
                    if (selectedDate) payload.date = selectedDate;
                    const res = await axios.post(
                        "/eco/page/delestage/validation",
                        payload,
                    );
                    if (res.data.status === 1) {
                        Swal.fire("Succès", res.data.msg, "success");
                        // Recharger les données fraîches
                        await fetchAllData();
                        // Réinitialiser la date pour éviter incohérence (ou laisser)
                        // setSelectedDate("");
                    } else {
                        Swal.fire("Erreur", res.data.msg, "error");
                    }
                } catch (error) {
                    Swal.fire("Erreur", "Problème lors du délestage", "error");
                }
            }
            setLoading(false);
        });
    };

    // Fonctions utilitaires (inchangées)
    function numberWithSpaces(x) {
        if (x === null || x === undefined) return "0.00";
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    const handleMyDelestage = async () => {
        setLoading(true);
        Swal.fire({
            title: "Confirmation",
            text: "Voulez-vous délester votre caisse ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.post(
                        "/eco/page/delestage/validation",
                        { devise },
                    );
                    if (res.data.status === 1) {
                        Swal.fire("Succès", res.data.msg, "success");
                        await fetchAllData();
                    } else {
                        Swal.fire("Erreur", res.data.msg, "error");
                    }
                } catch (error) {
                    Swal.fire("Erreur", "Problème lors du délestage", "error");
                }
            }
            setLoading(false);
        });
    };

    const renderBilletageTable = (data, type) => {
        if (!data)
            return (
                <div className="alert alert-light">
                    Aucune donnée disponible
                </div>
            );
        if (type === "USD") {
            const items = [
                { label: "100", value: data.centDollars, multiplier: 100 },
                { label: "50", value: data.cinquanteDollars, multiplier: 50 },
                { label: "20", value: data.vightDollars, multiplier: 20 },
                { label: "10", value: data.dixDollars, multiplier: 10 },
                { label: "5", value: data.cinqDollars, multiplier: 5 },
                { label: "1", value: data.unDollars, multiplier: 1 },
            ];
            return (
                <table className="table table-bordered table-sm">
                    <thead className="table-light">
                        <tr>
                            <th>Coupure</th>
                            <th>Nbr Billets</th>
                            <th className="text-end">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.label} X</td>
                                <td>{parseInt(item.value) || 0}</td>
                                <td className="text-end">
                                    {(
                                        parseInt(item.value) * item.multiplier
                                    ).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-secondary">
                        <tr>
                            <th colSpan="2">Total</th>
                            <th className="text-end">
                                {numberWithSpaces(
                                    parseInt(data.sommeMontantUSD),
                                )}
                            </th>
                        </tr>
                    </tfoot>
                </table>
            );
        } else {
            const items = [
                {
                    label: "20 000",
                    value: data.vightMilleFranc,
                    multiplier: 20000,
                },
                {
                    label: "10 000",
                    value: data.dixMilleFranc,
                    multiplier: 10000,
                },
                {
                    label: "5 000",
                    value: data.cinqMilleFranc,
                    multiplier: 5000,
                },
                { label: "1 000", value: data.milleFranc, multiplier: 1000 },
                { label: "500", value: data.cinqCentFranc, multiplier: 500 },
                { label: "200", value: data.deuxCentFranc, multiplier: 200 },
                { label: "100", value: data.centFranc, multiplier: 100 },
                { label: "50", value: data.cinquanteFanc, multiplier: 50 },
            ];
            return (
                <table className="table table-bordered table-sm">
                    <thead className="table-light">
                        <tr>
                            <th>Coupure</th>
                            <th>Nbr Billets</th>
                            <th className="text-end">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.label} X</td>
                                <td>{parseInt(item.value) || 0}</td>
                                <td className="text-end">
                                    {(
                                        parseInt(item.value) * item.multiplier
                                    ).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-secondary">
                        <tr>
                            <th colSpan="2">Total</th>
                            <th className="text-end">
                                {numberWithSpaces(
                                    parseInt(data.sommeMontantCDF),
                                )}
                            </th>
                        </tr>
                    </tfoot>
                </table>
            );
        }
    };

    const handlePrintClick = (data) => setSelectedData(data);

    const currentCaissier = getCaissierData(selectedCaissier);
    const currentMontant =
        devise === "USD"
            ? currentCaissier.usd?.sommeMontantUSD || 0
            : currentCaissier.cdf?.sommeMontantCDF || 0;

    if (!fetchInfo)
        return <div className="text-center p-5">Chargement des données...</div>;

    return (
        <div
            className="container-fluid"
            style={{ marginTop: "20px", padding: "0 20px", maxWidth: "1400px" }}
        >
            {/* En-tête */}
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
                                        <i className="fas fa-power-off me-2"></i>
                                        Délestage
                                    </h5>
                                    <small className="text-white-50">
                                        Clôture et délestage de la caisse
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtre date pour admin */}
            {isSuperAdmin && (
                <div className="row mb-4">
                    <div className="col-md-4">
                        <label className="form-label fw-bold">
                            Filtrer par date
                        </label>
                        <input
                            type="date"
                            className="form-control modern-input w-50"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {/* <small className="text-muted">Laissez vide pour afficher toutes les dates (billetages non délestés)</small> */}
                    </div>
                </div>
            )}

            {!isSuperAdmin && (myBilletageCDF || myBilletageUSD) && (
                <div className="row g-4 mb-4">
                    {/* Carte informations */}
                    <div className="col-md-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">
                                    Mes informations
                                </h6>
                                <hr />
                                <div className="mb-3">
                                    <label className="form-label">Devise</label>
                                    <select
                                        className="form-select modern-select w-50"
                                        value={devise}
                                        onChange={(e) =>
                                            setDevise(e.target.value)
                                        }
                                    >
                                        <option value="CDF">CDF</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">
                                        Montant total
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg fw-bold text-end modern-input w-50"
                                        value={numberWithSpaces(
                                            devise === "USD"
                                                ? myBilletageUSD?.sommeMontantUSD ||
                                                      0
                                                : myBilletageCDF?.sommeMontantCDF ||
                                                      0,
                                        )}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tableau des coupures */}
                    <div className="col-md-5">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">
                                    Détail des coupures
                                </h6>
                                <hr />
                                {devise === "USD"
                                    ? renderBilletageTable(
                                          myBilletageUSD,
                                          "USD",
                                      )
                                    : renderBilletageTable(
                                          myBilletageCDF,
                                          "CDF",
                                      )}
                            </div>
                        </div>
                    </div>

                    {/* Bouton Délester */}
                    <div className="col-md-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <button
                                    className="btn btn-success w-100 py-3 fw-bold"
                                    onClick={handleMyDelestage}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <>
                                            <i className="fas fa-power-off me-2"></i>
                                            Délester
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau récapitulatif (admin) */}
            {isSuperAdmin && caissiersList.length === 0 && (
                <div className="alert alert-info">
                    Aucun billetage non délesté pour la période sélectionnée.
                </div>
            )}
            {isSuperAdmin && caissiersList.length > 0 && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-white fw-bold">
                        Billetages non délestés
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Caissier</th>
                                        <th className="text-end">Total CDF</th>
                                        <th className="text-end">Total USD</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caissiersList.map((caissier) => {
                                        const { cdf, usd } =
                                            getCaissierData(caissier);
                                        return (
                                            <tr key={caissier}>
                                                <td className="fw-bold">
                                                    {caissier}
                                                </td>
                                                <td className="text-end text-success">
                                                    {numberWithSpaces(
                                                        cdf?.sommeMontantCDF ||
                                                            0,
                                                    )}
                                                </td>
                                                <td className="text-end text-primary">
                                                    {numberWithSpaces(
                                                        usd?.sommeMontantUSD ||
                                                            0,
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() =>
                                                            setSelectedCaissier(
                                                                caissier,
                                                            )
                                                        }
                                                    >
                                                        Sélectionner
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Détail du caissier sélectionné */}
            {selectedCaissier && (
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">
                                    Informations
                                </h6>
                                <hr />
                                <div className="mb-3">
                                    <label>Devise</label>
                                    <select
                                        className="form-select modern-select w-50"
                                        value={devise}
                                        onChange={(e) =>
                                            setDevise(e.target.value)
                                        }
                                    >
                                        <option value="CDF">CDF</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Montant total</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg fw-bold text-end modern-input w-50"
                                        value={numberWithSpaces(currentMontant)}
                                        disabled
                                    />
                                </div>
                                {isSuperAdmin && (
                                    <div className="mt-3 text-muted">
                                        <i className="fas fa-user"></i>{" "}
                                        Caissier: {selectedCaissier}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">
                                    Détail des coupures
                                </h6>
                                <hr />
                                {devise === "USD"
                                    ? renderBilletageTable(
                                          currentCaissier.usd,
                                          "USD",
                                      )
                                    : renderBilletageTable(
                                          currentCaissier.cdf,
                                          "CDF",
                                      )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm h-100">
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <button
                                    className="btn btn-success w-100 py-3 fw-bold"
                                    onClick={handleDelestage}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <>
                                            <i className="fas fa-power-off me-2"></i>
                                            Délester
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Historique des délestages */}
            {/* Historique des délestages */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body px-4">
                            {historicalCDF && historicalCDF.length > 0 && (
                                <>
                                    <h5
                                        className="fw-bold mb-3"
                                        style={{ color: "#0b7285" }}
                                    >
                                        <i className="fas fa-chart-line me-2"></i>
                                        CDF
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr
                                                    style={{ color: "#0b7285" }}
                                                >
                                                    <th>Référence</th>
                                                    <th>Montant</th>
                                                    <th>Caissier</th>
                                                    <th className="text-end">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historicalCDF.map(
                                                    (res, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {
                                                                        res.Reference
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td className="fw-bold text-danger">
                                                                {res.montantCDF?.toLocaleString()}
                                                            </td>
                                                            <td>
                                                                <small>
                                                                    {
                                                                        res.NomUtilisateur
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td className="text-end">
                                                                <button
                                                                 data-toggle="modal"
                                                                 data-target="#modal-delestage-cdf"
                                                                    onClick={() =>
                                                                        handlePrintClick(
                                                                            res,
                                                                        )
                                                                    }
                                                                    className="btn btn-sm rounded-pill px-3"
                                                                    style={{
                                                                        background:
                                                                            "#6c757d",
                                                                        color: "white",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-print me-1"></i>{" "}
                                                                    Imprimer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {selectedData && (
                                        <RecuDelestageCDF data={selectedData} />
                                    )}
                                </>
                            )}
                            {historicalUSD && historicalUSD.length > 0 && (
                                <>
                                    <h5
                                        className="fw-bold mb-3 mt-4"
                                        style={{ color: "#0b7285" }}
                                    >
                                        <i className="fas fa-dollar-sign me-2"></i>
                                        USD
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr
                                                    style={{ color: "#0b7285" }}
                                                >
                                                    <th>Référence</th>
                                                    <th>Montant</th>
                                                    <th>Caissier</th>
                                                    <th className="text-end">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historicalUSD.map(
                                                    (res, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {
                                                                        res.Reference
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td className="fw-bold text-danger">
                                                                {res.montantUSD?.toLocaleString()}
                                                            </td>
                                                            <td>
                                                                <small>
                                                                    {
                                                                        res.NomUtilisateur
                                                                    }
                                                                </small>
                                                            </td>
                                                            <td className="text-end">
                                                                <button
                                                                 data-toggle="modal"
                                                                 data-target="#modal-delestage-usd"
                                                                    onClick={() =>
                                                                        handlePrintClick(
                                                                            res,
                                                                        )
                                                                    }
                                                                    className="btn btn-sm rounded-pill px-3"
                                                                    style={{
                                                                        background:
                                                                            "#6c757d",
                                                                        color: "white",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-print me-1"></i>{" "}
                                                                    Imprimer
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {selectedData && (
                                        <RecuDelestageUSD data={selectedData} />
                                    )}
                                </>
                            )}
                            {(!historicalCDF || historicalCDF.length === 0) &&
                                (!historicalUSD ||
                                    historicalUSD.length === 0) && (
                                    <div className="text-center py-5 text-muted">
                                        <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-0 fw-bold">
                                            Aucun délestage récent
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Delestage;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import RecuApproUSD from "./Modals/RecuApproUSD";
// import RecuApproCDF from "./Modals/RecuApproCDF";
// import RecuDelestageUSD from "./Modals/RecuDelestageUSD";
// import RecuDelestageCDF from "./Modals/RecuDelestageCDF";

// const Delestage = () => {
//     const [loading, setloading] = useState(false);
//     const [Montant, setMontant] = useState(0);
//     const [devise, setDevise] = useState("CDF");
//     const [getBilletageCDF, setGetBilletageCDF] = useState();
//     const [getBilletageUSD, setGetBilletageUSD] = useState();
//     const [fetchInfo, setFetchInfo] = useState(false);
//     const [fetchDailyOperationCDF, setFetchDailyOperationCDF] = useState();
//     const [fetchDailyOperationUSD, setFetchDailyOperationUSD] = useState();
//     const [selectedData, setSelectedData] = useState(null);
//     const [delesteRealise, setDelesteRealise] = useState(false); // ← empêche de recliquer

//     useEffect(() => {
//         getLastestOperation();
//         GetInformation();
//     }, []);

//     const getLastestOperation = async () => {
//         const res = await axios.get("/eco/pages/delestage/get-daily-operations");
//         if (res.data.status == 1) {
//             setFetchDailyOperationCDF(res.data.dataCDF);
//             setFetchDailyOperationUSD(res.data.dataUSD);
//         }
//     };

//     // const saveOperation = async (e) => {
//     //     e.preventDefault();
//     //     setloading(true);
//     //     Swal.fire({
//     //         title: "Confirmation !",
//     //         text: "Etes vous sûr d'effectuer ce délestage ?",
//     //         icon: "warning",
//     //         showCancelButton: true,
//     //         confirmButtonColor: "#3085d6",
//     //         cancelButtonColor: "#d33",
//     //         confirmButtonText: "Oui Délester!",
//     //     }).then(async (result) => {
//     //         if (result.isConfirmed) {
//     //             setloading(false);
//     //             const res = await axios.post("/eco/page/delestage/validation", {
//     //                 devise: devise,
//     //             });
//     //             if (res.data.status == 1) {
//     //                 Swal.fire({
//     //                     title: "Succès",
//     //                     text: res.data.msg,
//     //                     icon: "success",
//     //                     timer: 8000,
//     //                     confirmButtonText: "Okay",
//     //                 });
//     //                 // Rafraîchir les données (billetterie + historique)
//     //                 getLastestOperation();
//     //                 GetInformation();
//     //                 // Marque que le délestage a été fait -> bouton désactivé
//     //                 setDelesteRealise(true);
//     //             } else {
//     //                 setloading(false);
//     //                 Swal.fire({
//     //                     title: "Erreur",
//     //                     text: res.data.msg,
//     //                     icon: "error",
//     //                     timer: 8000,
//     //                     confirmButtonText: "Okay",
//     //                 });
//     //             }
//     //         } else {
//     //             setloading(false);
//     //         }
//     //     });
//     // };

//     const saveOperation = async (e) => {
//         e.preventDefault();
//         setloading(true);
//         Swal.fire({
//             title: "Confirmation !",
//             text: "Etes vous sûr d'effectuer ce délestage ?",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Oui Délester!",
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 setloading(false);
//                 const res = await axios.post("/eco/page/delestage/validation", {
//                     devise: devise,
//                 });
//                 if (res.data.status == 1) {
//                     Swal.fire({
//                         title: "Succès",
//                         text: res.data.msg,
//                         icon: "success",
//                         timer: 8000,
//                         confirmButtonText: "Okay",
//                     });
//                     // Rafraîchir les données (billetterie + historique)
//                     getLastestOperation();
//                     GetInformation();
//                     // NE PAS MODIFIER DE ETAT DE MASQUAGE
//                 } else {
//                     setloading(false);
//                     Swal.fire({
//                         title: "Erreur",
//                         text: res.data.msg,
//                         icon: "error",
//                         timer: 8000,
//                         confirmButtonText: "Okay",
//                     });
//                 }
//             } else {
//                 setloading(false);
//             }
//         });
//     };
//     const GetInformation = async () => {
//         const res = await axios.get("/eco/page/delestage/get-billetage-caissier");
//         if (res.data.status == 1) {
//             setGetBilletageCDF(res.data.billetageCDF[0]);
//             setGetBilletageUSD(res.data.billetageUSD[0]);
//             setFetchInfo(true);
//         }
//     };

//     function numberWithSpaces(x) {
//         if (x === null || x === undefined) return "0.00";
//         var parts = x.toString().split(".");
//         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
//         return parts.join(".");
//     }

//     const handlePrintClick = (data) => {
//         setSelectedData(data);
//     };

//     return (
//         <div className="container-fluid" style={{ marginTop: "20px", padding: "0 20px", maxWidth: "1400px" }}>
//             {/* En-tête moderne amélioré */}
//             <div className="row mb-4">
//                 <div className="col-12">
//                     <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
//                         <div className="card-body p-4" style={{
//                             background: "linear-gradient(135deg, #0b7285 0%, #138496 100%)",
//                         }}>
//                             <div className="d-flex align-items-center">
//                                 <div className="me-3">
//                                     <i className="fas fa-power-off" style={{ fontSize: "30px", color: "white" }}></i>
//                                 </div>
//                                 <div>
//                                     <h5 className="text-white fw-bold mb-1">Délestage</h5>
//                                     <small className="text-white-50" style={{ letterSpacing: "0.5px" }}>Clôture et délestage de la caisse</small>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {fetchInfo && (
//                 <>
//                     <div className="row g-4 mb-4">
//                         {/* Carte Informations */}
//                         <div className="col-md-4">
//                             <div className="card border-0 shadow-sm rounded-4 h-100">
//                                 <div className="card-header bg-white border-0 pt-3 px-4">
//                                     <h6 className="fw-bold mb-0" style={{ color: "#0b7285" }}>
//                                         <i className="fas fa-info-circle me-2"></i>Informations
//                                     </h6>
//                                 </div>
//                                 <div className="card-body px-4">
//                                     <div className="mb-3">
//                                         <label className="form-label" style={{ color: "#0b7285", fontWeight: "500" }}>Devise</label>
//                                         <select
//                                             className="form-select rounded-3 modern-selects w-50"
//                                             onChange={(e) => setDevise(e.target.value)}
//                                         >
//                                             <option value="CDF">CDF</option>
//                                             <option value="USD">USD</option>
//                                         </select>
//                                     </div>
//                                     <div className="mb-2">
//                                         <label className="form-label" style={{ color: "#0b7285", fontWeight: "500" }}>Montant</label>
//                                         {devise === "USD" ? (
//                                             <input
//                                                 type="text"
//                                                 className="form-control rounded-3 w-50"
//                                                 style={{
//                                                     backgroundColor: "#f8f9fa",
//                                                     fontWeight: "bold",
//                                                     fontSize: "22px",
//                                                     textAlign: "right",
//                                                     color: "#0b7285",
//                                                     border: "1px solid #dee2e6"
//                                                 }}
//                                                 value={getBilletageUSD?.sommeMontantUSD ? numberWithSpaces(getBilletageUSD.sommeMontantUSD) : ""}
//                                                 disabled
//                                             />
//                                         ) : (
//                                             <input
//                                                 type="text"
//                                                 className="form-control rounded-3 w-50"
//                                                 style={{
//                                                     backgroundColor: "#f8f9fa",
//                                                     fontWeight: "bold",
//                                                     fontSize: "22px",
//                                                     textAlign: "right",
//                                                     color: "#0b7285",
//                                                     border: "1px solid #dee2e6"
//                                                 }}
//                                                 value={getBilletageCDF?.sommeMontantCDF ? numberWithSpaces(getBilletageCDF.sommeMontantCDF) : ""}
//                                                 disabled
//                                             />
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Billetage Disponible + Bouton : masqués après délestage réussi si les données sont vides */}
//                         {(getBilletageCDF || getBilletageUSD) && !delesteRealise && (
//                             <>
//                                 <div className="col-md-5">
//                                     <div className="card border-0 shadow-sm rounded-4 h-100">
//                                         <div className="card-header bg-white border-0 pt-3 px-4">
//                                             <h6 className="fw-bold mb-0" style={{ color: "#0b7285" }}>
//                                                 <i className="fas fa-money-bill-wave me-2"></i>Billetage Disponible
//                                             </h6>
//                                         </div>
//                                         <div className="card-body px-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
//                                             {devise === "USD" ? (
//                                                 getBilletageUSD && (
//                                                     <div className="table-responsive">
//                                                         <table className="table table-bordered table-sm align-middle">
//                                                             <thead style={{ backgroundColor: "#e6f4f1" }}>
//                                                                 <tr style={{ color: "#0b7285" }}>
//                                                                     <th>Coupure</th>
//                                                                     <th className="text-center">Nbr Billets</th>
//                                                                     <th className="text-end">Montant</th>
//                                                                 </tr>
//                                                             </thead>
//                                                             <tbody>
//                                                                 {[
//                                                                     { label: "100", value: getBilletageUSD.centDollars, multiplier: 100 },
//                                                                     { label: "50", value: getBilletageUSD.cinquanteDollars, multiplier: 50 },
//                                                                     { label: "20", value: getBilletageUSD.vightDollars, multiplier: 20 },
//                                                                     { label: "10", value: getBilletageUSD.dixDollars, multiplier: 10 },
//                                                                     { label: "5", value: getBilletageUSD.cinqDollars, multiplier: 5 },
//                                                                     { label: "1", value: getBilletageUSD.unDollars, multiplier: 1 }
//                                                                 ].map((item, idx) => (
//                                                                     <tr key={idx}>
//                                                                         <td className="fw-semibold">{item.label} X</td>
//                                                                         <td className="text-center">{parseInt(item.value) || 0}</td>
//                                                                         <td className="text-end text-success fw-bold">
//                                                                             {(parseInt(item.value) * item.multiplier).toLocaleString()}
//                                                                         </td>
//                                                                     </tr>
//                                                                 ))}
//                                                             </tbody>
//                                                             <tfoot>
//                                                                 <tr style={{ backgroundColor: "#6c757d", color: "white" }}>
//                                                                     <th colSpan="2" className="text-start ps-3">Total</th>
//                                                                     <th className="text-end pe-3">
//                                                                         {numberWithSpaces(parseInt(getBilletageUSD.sommeMontantUSD))}
//                                                                     </th>
//                                                                 </tr>
//                                                             </tfoot>
//                                                         </table>
//                                                     </div>
//                                                 )
//                                             ) : (
//                                                 getBilletageCDF && (
//                                                     <div className="table-responsive">
//                                                         <table className="table table-bordered table-sm align-middle">
//                                                             <thead style={{ backgroundColor: "#e6f4f1" }}>
//                                                                 <tr style={{ color: "#0b7285" }}>
//                                                                     <th>Coupure</th>
//                                                                     <th className="text-center">Nbr Billets</th>
//                                                                     <th className="text-end">Montant</th>
//                                                                 </tr>
//                                                             </thead>
//                                                             <tbody>
//                                                                 {[
//                                                                     { label: "20 000", value: getBilletageCDF.vightMilleFranc, multiplier: 20000 },
//                                                                     { label: "10 000", value: getBilletageCDF.dixMilleFranc, multiplier: 10000 },
//                                                                     { label: "5 000", value: getBilletageCDF.cinqMilleFranc, multiplier: 5000 },
//                                                                     { label: "1 000", value: getBilletageCDF.milleFranc, multiplier: 1000 },
//                                                                     { label: "500", value: getBilletageCDF.cinqCentFranc, multiplier: 500 },
//                                                                     { label: "200", value: getBilletageCDF.deuxCentFranc, multiplier: 200 },
//                                                                     { label: "100", value: getBilletageCDF.centFranc, multiplier: 100 },
//                                                                     { label: "50", value: getBilletageCDF.cinquanteFanc, multiplier: 50 }
//                                                                 ].map((item, idx) => (
//                                                                     <tr key={idx}>
//                                                                         <td className="fw-semibold">{item.label} X</td>
//                                                                         <td className="text-center">{parseInt(item.value) || 0}</td>
//                                                                         <td className="text-end text-success fw-bold">
//                                                                             {(parseInt(item.value) * item.multiplier).toLocaleString()}
//                                                                         </td>
//                                                                     </tr>
//                                                                 ))}
//                                                             </tbody>
//                                                             <tfoot>
//                                                                 <tr style={{ backgroundColor: "#6c757d", color: "white" }}>
//                                                                     <th colSpan="2" className="text-start ps-3">Total</th>
//                                                                     <th className="text-end pe-3">
//                                                                         {numberWithSpaces(parseInt(getBilletageCDF.sommeMontantCDF))}
//                                                                     </th>
//                                                                 </tr>
//                                                             </tfoot>
//                                                         </table>
//                                                     </div>
//                                                 )
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Bouton Délester */}
//                                 <div className="col-md-3">
//                                     <div className="card border-0 shadow-sm rounded-4 h-100">
//                                         <div className="card-body d-flex align-items-center justify-content-center">
//                                             {(getBilletageCDF !== undefined || getBilletageUSD !== undefined) && (
//                                                 <button
//                                                     className="btn w-100 py-3 fw-bold"
//                                                     style={{
//                                                         background: "linear-gradient(135deg, #0b7285, #0d9488)",
//                                                         border: "none",
//                                                         borderRadius: "12px",
//                                                         fontSize: "17px",
//                                                         color: "white",
//                                                         transition: "all 0.3s ease",
//                                                         boxShadow: "0 4px 12px rgba(11,114,133,0.3)"
//                                                     }}
//                                                     onClick={saveOperation}
//                                                     onMouseEnter={(e) => {
//                                                         e.currentTarget.style.transform = "translateY(-2px)";
//                                                         e.currentTarget.style.boxShadow = "0 6px 18px rgba(11,114,133,0.5)";
//                                                     }}
//                                                     onMouseLeave={(e) => {
//                                                         e.currentTarget.style.transform = "translateY(0)";
//                                                         e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,114,133,0.3)";
//                                                     }}
//                                                 >
//                                                     <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-power-off me-2"}`}></i>
//                                                     Délester
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Bouton : désactivé si le montant de la devise courante est nul */}

//                             </>
//                         )}

//                         {/* Si billetage vide après délestage ou premier chargement, on affiche un message (optionnel) */}
//                         {(!getBilletageCDF && !getBilletageUSD) && !delesteRealise && fetchInfo && (
//                             <div className="col-md-8">
//                                 <div className="card border-0 shadow-sm rounded-4 h-100">
//                                     <div className="card-body d-flex align-items-center justify-content-center text-muted">
//                                         <i className="fas fa-box-open me-3" style={{ fontSize: "4rem", opacity: 0.3 }}></i>
//                                         <div>
//                                             <h5 className="fw-bold mb-1">Aucun billetage disponible</h5>
//                                             <p className="mb-0">Le caissier n'a pas encore de billetage ou le délestage a été effectué.</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Séparateur décoratif */}
//                     <div className="position-relative my-5">
//                         <hr className="border-2" style={{ borderColor: "#e0e0e0" }} />
//                         <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold rounded-pill shadow-sm">
//                             <i className="fas fa-history me-1"></i> Délestages récents
//                         </span>
//                     </div>

//                     {/* Historique des délestages */}
//                     <div className="row">
//                         <div className="col-12">
//                             <div className="card border-0 shadow-sm rounded-4">
//                                 <div className="card-header bg-white border-0 pt-3 px-4">
//                                     <h6 className="fw-bold mb-0" style={{ color: "#0b7285" }}>
//                                         <i className="fas fa-clock me-2"></i>Délestages récents
//                                     </h6>
//                                 </div>
//                                 <div className="card-body px-4">
//                                     {fetchDailyOperationCDF && fetchDailyOperationCDF.length > 0 && (
//                                         <>
//                                             <div className="mb-3">
//                                                 <h5 className="fw-bold" style={{ color: "#0b7285" }}>
//                                                     <i className="fas fa-chart-line me-2"></i>CDF
//                                                 </h5>
//                                             </div>
//                                             <div className="table-responsive">
//                                                 <table className="table table-hover align-middle">
//                                                     <thead className="table-light">
//                                                         <tr style={{ color: "#0b7285" }}>
//                                                             <th>Référence</th>
//                                                             <th>Montant</th>
//                                                             <th>Caissier</th>
//                                                             <th className="text-end">Action</th>
//                                                         </tr>
//                                                     </thead>
//                                                     <tbody>
//                                                         {fetchDailyOperationCDF.map((res, index) => (
//                                                             <tr key={index}>
//                                                                 <td><small className="text-muted">{res.Reference}</small></td>
//                                                                 <td className="fw-bold text-danger">{res.montantCDF?.toLocaleString()}</td>
//                                                                 <td><small>{res.NomUtilisateur}</small></td>
//                                                                 <td className="text-end">
//                                                                     <button
//                                                                         onClick={() => handlePrintClick(res)}
//                                                                         data-toggle="modal"
//                                                                         data-target="#modal-delestage-cdf"
//                                                                         className="btn btn-sm rounded-pill px-3"
//                                                                         style={{ background: "#6c757d", color: "white" }}
//                                                                     >
//                                                                         <i className="fas fa-print me-1"></i> Imprimer
//                                                                     </button>
//                                                                 </td>
//                                                             </tr>
//                                                         ))}
//                                                     </tbody>
//                                                 </table>
//                                             </div>
//                                             {selectedData && <RecuDelestageCDF data={selectedData} />}
//                                         </>
//                                     )}

//                                     {fetchDailyOperationUSD && fetchDailyOperationUSD.length > 0 && (
//                                         <>
//                                             <div className="mb-3 mt-4">
//                                                 <h5 className="fw-bold" style={{ color: "#0b7285" }}>
//                                                     <i className="fas fa-dollar-sign me-2"></i>USD
//                                                 </h5>
//                                             </div>
//                                             <div className="table-responsive">
//                                                 <table className="table table-hover align-middle">
//                                                     <thead className="table-light">
//                                                         <tr style={{ color: "#0b7285" }}>
//                                                             <th>Référence</th>
//                                                             <th>Montant</th>
//                                                             <th>Caissier</th>
//                                                             <th className="text-end">Action</th>
//                                                         </tr>
//                                                     </thead>
//                                                     <tbody>
//                                                         {fetchDailyOperationUSD.map((res, index) => (
//                                                             <tr key={index}>
//                                                                 <td><small className="text-muted">{res.Reference}</small></td>
//                                                                 <td className="fw-bold text-danger">{res.montantUSD?.toLocaleString()}</td>
//                                                                 <td><small>{res.NomUtilisateur}</small></td>
//                                                                 <td className="text-end">
//                                                                     <button
//                                                                         onClick={() => handlePrintClick(res)}
//                                                                         data-toggle="modal"
//                                                                         data-target="#modal-delestage-usd"
//                                                                         className="btn btn-sm rounded-pill px-3"
//                                                                         style={{ background: "#6c757d", color: "white" }}
//                                                                     >
//                                                                         <i className="fas fa-print me-1"></i> Imprimer
//                                                                     </button>
//                                                                 </td>
//                                                             </tr>
//                                                         ))}
//                                                     </tbody>
//                                                 </table>
//                                             </div>
//                                             {selectedData && <RecuDelestageUSD data={selectedData} />}
//                                         </>
//                                     )}

//                                     {(!fetchDailyOperationCDF || fetchDailyOperationCDF.length === 0) &&
//                                      (!fetchDailyOperationUSD || fetchDailyOperationUSD.length === 0) && (
//                                         <div className="text-center py-5 text-muted">
//                                             <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
//                                             <p className="mb-0 fw-bold">Aucun délestage récent</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default Delestage;
