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
        return window.currentUser?.role == "SuperAdmin";
    });
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

    // États pour l'ajustement
    const [editing, setEditing] = useState(false);
    const [adjustedCDF, setAdjustedCDF] = useState(null);
    const [adjustedUSD, setAdjustedUSD] = useState(null);
    const [adjustedTotalCDF, setAdjustedTotalCDF] = useState(0);
    const [adjustedTotalUSD, setAdjustedTotalUSD] = useState(0);
    const [initialCDF, setInitialCDF] = useState(null);
const [initialUSD, setInitialUSD] = useState(null);

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
            if (billetageRes.data.status == 1) {
                if (isSuperAdmin) {
                    setAllBilletagesCDF(billetageRes.data.billetageCDF || []);
                    setAllBilletagesUSD(billetageRes.data.billetageUSD || []);
                } else {
                    const cdfData = billetageRes.data.billetageCDF?.[0] || null;
                    const usdData = billetageRes.data.billetageUSD?.[0] || null;
                    setMyBilletageCDF(cdfData);
                    setMyBilletageUSD(usdData);
                    // Initialisation des données ajustées
                    if (cdfData) {
                        setAdjustedCDF({ ...cdfData });
                        setAdjustedTotalCDF(parseInt(cdfData.sommeMontantCDF) || 0);
                    }
                    if (usdData) {
                        setAdjustedUSD({ ...usdData });
                        setAdjustedTotalUSD(parseInt(usdData.sommeMontantUSD) || 0);
                    }
                }
            }
            if (histoRes.data.status == 1) {
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
            setFilteredCDF([...allBilletagesCDF]);
            setFilteredUSD([...allBilletagesUSD]);
        } else {
            setFilteredCDF(
                allBilletagesCDF.filter(
                    (item) => item.DateTransaction == selectedDate,
                ),
            );
            setFilteredUSD(
                allBilletagesUSD.filter(
                    (item) => item.DateTransaction == selectedDate,
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
        } else if (caissiers.length == 0) {
            setSelectedCaissier("");
        }
    }, [filteredCDF, filteredUSD]);

    // Récupérer les données d'un caissier donné (parmi les filtrées)
    const getCaissierData = (nom) => ({
        cdf: filteredCDF.find((c) => c.NomUtilisateur == nom),
        usd: filteredUSD.find((u) => u.NomUtilisateur == nom),
    });

    // Fonctions utilitaires
    function numberWithSpaces(x) {
        if (x == null || x == undefined) return "0.00";
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Mise à jour d'une coupure CDF (mode édition)
    const updateCoupureCDF = (field, value) => {
        
        if (!adjustedCDF) return;
        const newVal = parseInt(value) || 0;
        const updated = { ...adjustedCDF, [field]: newVal };
      
        // Recalcul du total
        const total =
            (updated.vightMilleFranc || 0) * 20000 +
            (updated.dixMilleFranc || 0) * 10000 +
            (updated.cinqMilleFranc || 0) * 5000 +
            (updated.milleFranc || 0) * 1000 +
            (updated.cinqCentFranc || 0) * 500 +
            (updated.deuxCentFranc || 0) * 200 +
            (updated.centFranc || 0) * 100 +
            (updated.cinquanteFanc || 0) * 50;
        setAdjustedCDF(updated);
        setAdjustedTotalCDF(total);
    };

    // Mise à jour d'une coupure USD (mode édition)
    const updateCoupureUSD = (field, value) => {
        if (!adjustedUSD) return;
        const newVal = parseInt(value) || 0;
        const updated = { ...adjustedUSD, [field]: newVal };
        const total =
            (updated.centDollars || 0) * 100 +
            (updated.cinquanteDollars || 0) * 50 +
            (updated.vightDollars || 0) * 20 +
            (updated.dixDollars || 0) * 10 +
            (updated.cinqDollars || 0) * 5 +
            (updated.unDollars || 0) * 1;
        setAdjustedUSD(updated);
        setAdjustedTotalUSD(total);
    };

    // Sauvegarde de l'ajustement (envoi au backend)
    const saveAdjustment = async () => {
        setLoading(true);
        try {
            let payload = {
                devise: devise,
                adjusted_data: devise == "USD" ? adjustedUSD : adjustedCDF
            };
            // Si admin, on envoie aussi le nom du caissier
            if (isSuperAdmin && selectedCaissier) {
                payload.caissier = selectedCaissier;
            }
            const res = await axios.post("/eco/page/delestage/adjust-billetage", payload);
            if (res.data.status == 1) {
                Swal.fire("Succès", "Ajustement enregistré", "success");
                setEditing(false);
                // Recharger les données pour obtenir les nouveaux billetages
                await fetchAllData();
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Impossible d'enregistrer l'ajustement", "error");
        } finally {
            setLoading(false);
        }
    };

    // Annuler l'édition
    const resetAdjustment = () => {
        if (myBilletageCDF) {
            setAdjustedCDF({ ...myBilletageCDF });
            setAdjustedTotalCDF(parseInt(myBilletageCDF.sommeMontantCDF) || 0);
        }
        if (myBilletageUSD) {
            setAdjustedUSD({ ...myBilletageUSD });
            setAdjustedTotalUSD(parseInt(myBilletageUSD.sommeMontantUSD) || 0);
        }
        setEditing(false);
    };

    // Action de délestage (inchangée, mais utilise les données réelles du backend après ajustement)
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
                    if (res.data.status == 1) {
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
                    if (res.data.status == 1) {
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

    const renderBilletageTable = (data, type, isEditable = false, updateFn = null) => {
        if (!data) return <div className="alert alert-light">Aucune donnée disponible</div>;
        if (type == "USD") {
            const items = [
                { label: "100", field: "centDollars", multiplier: 100 },
                { label: "50", field: "cinquanteDollars", multiplier: 50 },
                { label: "20", field: "vightDollars", multiplier: 20 },
                { label: "10", field: "dixDollars", multiplier: 10 },
                { label: "5", field: "cinqDollars", multiplier: 5 },
                { label: "1", field: "unDollars", multiplier: 1 },
            ];
            return (
                <table className="table table-bordered table-sm">
                    <thead className="table-light">
                        <tr><th>Coupure</th><th>Nbr Billets</th><th className="text-end">Montant</th></tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.field}>
                                <td>{item.label} X</td>
                                <td>
                                    {isEditable ? (
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="form-control form-control-sm text-center"
                                            value={data[item.field] || 0}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => updateFn && updateFn(item.field, e.target.value)}
                                            
                                        />
                                    ) : (
                                        parseInt(data[item.field]) || 0
                                    )}
                                </td>
                                <td className="text-end">
                                    {((parseInt(data[item.field]) || 0) * item.multiplier).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-secondary">
                        <tr><th colSpan="2">Total</th>
                            <th className="text-end">
                                {type == "USD" ? adjustedTotalUSD.toLocaleString() : numberWithSpaces(parseInt(data.sommeMontantUSD))}
                            </th>
                        </tr>
                    </tfoot>
                </table>
            );
        } else {
            const items = [
                { label: "20 000", field: "vightMilleFranc", multiplier: 20000 },
                { label: "10 000", field: "dixMilleFranc", multiplier: 10000 },
                { label: "5 000", field: "cinqMilleFranc", multiplier: 5000 },
                { label: "1 000", field: "milleFranc", multiplier: 1000 },
                { label: "500", field: "cinqCentFranc", multiplier: 500 },
                { label: "200", field: "deuxCentFranc", multiplier: 200 },
                { label: "100", field: "centFranc", multiplier: 100 },
                { label: "50", field: "cinquanteFanc", multiplier: 50 },
            ];
            return (
                <table className="table table-bordered table-sm">
                    <thead className="table-light">
                        <tr><th>Coupure</th><th>Nbr Billets</th><th className="text-end">Montant</th></tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.field}>
                                <td>{item.label} X</td>
                                <td>
                                    {isEditable ? (
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="form-control form-control-sm text-center"
                                            value={data[item.field] || 0}
                                            onChange={(e) => updateFn && updateFn(item.field, e.target.value)}
                                        />
                                    ) : (
                                        parseInt(data[item.field]) || 0
                                    )}
                                </td>
                                <td className="text-end">
                                    {((parseInt(data[item.field]) || 0) * item.multiplier).toLocaleString()}
                                </td>
                             </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-secondary">
                        <tr><th colSpan="2">Total</th>
                            <th className="text-end">
                                {type == "CDF" ? adjustedTotalCDF.toLocaleString() : numberWithSpaces(parseInt(data.sommeMontantCDF))}
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
        devise == "USD"
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
                    </div>
                </div>
            )}

            {/* Vue simple caissier */}
            {!isSuperAdmin && (myBilletageCDF || myBilletageUSD) && (
                <div className="row g-4 mb-4">
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
                                        onChange={(e) => setDevise(e.target.value)}
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
                                            devise == "USD"
                                                ? (adjustedUSD?.sommeMontantUSD ||
                                                    myBilletageUSD?.sommeMontantUSD ||
                                                    0)
                                                : (adjustedCDF?.sommeMontantCDF ||
                                                    myBilletageCDF?.sommeMontantCDF ||
                                                    0)
                                        )}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tableau des coupures avec édition */}
                    <div className="col-md-5">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">
                                    Détail des coupures {editing && "(édition)"}
                                </h6>
                                <hr />
                                {devise == "USD" ? (
                                    adjustedUSD ? (
                                        renderBilletageTable(adjustedUSD, "USD", editing, updateCoupureUSD)
                                    ) : (
                                        renderBilletageTable(myBilletageUSD, "USD", false, null)
                                    )
                                ) : (
                                    adjustedCDF ? (
                                        renderBilletageTable(adjustedCDF, "CDF", editing, updateCoupureCDF)
                                    ) : (
                                        renderBilletageTable(myBilletageCDF, "CDF", false, null)
                                    )
                                )}
                               
                                {/* Afficher les boutons d'ajustement uniquement si des données existent pour la devise courante */}
{(devise == "USD" ? (adjustedUSD || myBilletageUSD) : (adjustedCDF || myBilletageCDF)) && (
    <div className="d-flex gap-2 mt-3">
        {!editing ? (
            <button className="btn btn-warning" onClick={() => setEditing(true)}>
                <i className="fas fa-edit"></i> Ajuster
            </button>
        ) : (
            <>
                <button className="btn btn-success" onClick={saveAdjustment}>
                    <i className="fas fa-save"></i> Valider l'ajustement
                </button>
                <button className="btn btn-secondary" onClick={resetAdjustment}>
                    Annuler
                </button>
            </>
        )}
    </div>
)}
                            </div>
                        </div>
                    </div>

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

            {/* Admin : tableau récapitulatif */}
            {isSuperAdmin && caissiersList.length == 0 && (
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
                                        const { cdf, usd } = getCaissierData(caissier);
                                        return (
                                            <tr key={caissier}>
                                                <td className="fw-bold">{caissier}</td>
                                                <td className="text-end text-success">
                                                    {numberWithSpaces(cdf?.sommeMontantCDF || 0)}
                                                </td>
                                                <td className="text-end text-primary">
                                                    {numberWithSpaces(usd?.sommeMontantUSD || 0)}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setSelectedCaissier(caissier)}
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

            {/* Détail du caissier sélectionné (admin) */}
            {selectedCaissier && (
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">Informations</h6>
                                <hr />
                                <div className="mb-3">
                                    <label>Devise</label>
                                    <select
                                        className="form-select modern-select w-50"
                                        value={devise}
                                        onChange={(e) => setDevise(e.target.value)}
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
                                        <i className="fas fa-user"></i> Caissier: {selectedCaissier}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-info">
                                    Détail des coupures {editing && "(édition)"}
                                </h6>
                                <hr />
                                {devise == "USD" ? (
                                    currentCaissier.usd ? (
                                        renderBilletageTable(currentCaissier.usd, "USD", editing, (field, val) => {
                                            // Pour l'admin, on devrait gérer un état adjusted spécifique au caissier sélectionné.
                                            // Pour simplifier, on désactive l'édition admin dans cet exemple.
                                            Swal.fire("Info", "L'édition pour admin est désactivée dans cette version", "info");
                                        })
                                    ) : (
                                        <div className="alert alert-light">Aucune donnée USD</div>
                                    )
                                ) : (
                                    currentCaissier.cdf ? (
                                        renderBilletageTable(currentCaissier.cdf, "CDF", editing, (field, val) => {
                                            Swal.fire("Info", "L'édition pour admin est désactivée dans cette version", "info");
                                        })
                                    ) : (
                                        <div className="alert alert-light">Aucune donnée CDF</div>
                                    )
                                )}
                                {/* On n'ajoute pas les boutons d'édition pour l'admin ici pour ne pas complexifier */}
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
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body px-4">
                            {historicalCDF && historicalCDF.length > 0 && (
                                <>
                                    <h5 className="fw-bold mb-3" style={{ color: "#0b7285" }}>
                                        <i className="fas fa-chart-line me-2"></i>CDF
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr style={{ color: "#0b7285" }}>
                                                    <th>Référence</th>
                                                    <th>Montant</th>
                                                    <th>Caissier</th>
                                                    <th className="text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historicalCDF.map((res, idx) => (
                                                    <tr key={idx}>
                                                        <td><small className="text-muted">{res.Reference}</small></td>
                                                        <td className="fw-bold text-danger">{res.montantCDF?.toLocaleString()}</td>
                                                        <td><small>{res.NomUtilisateur}</small></td>
                                                        <td className="text-end">
                                                            <button
                                                                data-toggle="modal"
                                                                data-target="#modal-delestage-cdf"
                                                                onClick={() => handlePrintClick(res)}
                                                                className="btn btn-sm rounded-pill px-3"
                                                                style={{ background: "#6c757d", color: "white" }}
                                                            >
                                                                <i className="fas fa-print me-1"></i> Imprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {selectedData && <RecuDelestageCDF data={selectedData} />}
                                </>
                            )}
                            {historicalUSD && historicalUSD.length > 0 && (
                                <>
                                    <h5 className="fw-bold mb-3 mt-4" style={{ color: "#0b7285" }}>
                                        <i className="fas fa-dollar-sign me-2"></i>USD
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr style={{ color: "#0b7285" }}>
                                                    <th>Référence</th>
                                                    <th>Montant</th>
                                                    <th>Caissier</th>
                                                    <th className="text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historicalUSD.map((res, idx) => (
                                                    <tr key={idx}>
                                                        <td><small className="text-muted">{res.Reference}</small></td>
                                                        <td className="fw-bold text-danger">{res.montantUSD?.toLocaleString()}</td>
                                                        <td><small>{res.NomUtilisateur}</small></td>
                                                        <td className="text-end">
                                                            <button
                                                                data-toggle="modal"
                                                                data-target="#modal-delestage-usd"
                                                                onClick={() => handlePrintClick(res)}
                                                                className="btn btn-sm rounded-pill px-3"
                                                                style={{ background: "#6c757d", color: "white" }}
                                                            >
                                                                <i className="fas fa-print me-1"></i> Imprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {selectedData && <RecuDelestageUSD data={selectedData} />}
                                </>
                            )}
                            {(!historicalCDF || historicalCDF.length == 0) &&
                                (!historicalUSD || historicalUSD.length == 0) && (
                                    <div className="text-center py-5 text-muted">
                                        <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-0 fw-bold">Aucun délestage récent</p>
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