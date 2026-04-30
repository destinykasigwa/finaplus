// import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuApproCDF from "./Modals/RecuApproCDF";
import RecuApproUSD from "./Modals/RecuApproUSD";
// import { useNavigate } from "react-router-dom";

const Appro = () => {
    //CDF ATTRIBUTE
    const [vightMille, setvightMille] = useState(0);
    const [dixMille, setdixMille] = useState(0);
    const [cinqMille, setcinqMille] = useState(0);
    const [milleFranc, setmilleFranc] = useState(0);
    const [cinqCentFr, setcinqCentFr] = useState(0);
    const [deuxCentFranc, setdeuxCentFranc] = useState(0);
    const [centFranc, setcentFranc] = useState(0);
    const [cinquanteFanc, setcinquanteFanc] = useState(0);

    //USD ATTRIBUTE
    const [hundred, sethundred] = useState(0);
    const [fitfty, setfitfty] = useState(0);
    const [twenty, settwenty] = useState(0);
    const [ten, setten] = useState(0);
    const [five, setfive] = useState(0);
    const [oneDollar, setoneDollar] = useState(0);
    const [devise, setDevise] = useState("CDF");
    const [CaissierId, setCaissierId] = useState();
    const [fetchData, setFetchData] = useState();
    const [Montant, setMontant] = useState(0);
    const [loading, setloading] = useState(false);
    const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [getchefcaisse, setgetChefcaisse] = useState();
    const [fetchDailyOperationCDF, setFetchDailyOperationCDF] = useState();
    const [fetchDailyOperationUSD, setFetchDailyOperationUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    useEffect(() => {
        getAllCaissier();
        GetUserInformation();
        getLastestOperation();
    }, []);

    const getAllCaissier = async () => {
        const res = await axios.get("/eco/page/appro/get-all-caissiers");
        if (res.data.status == 1) {
            setFetchData(res.data.data);
            setgetChefcaisse(res.data.chefcaisse);
            // console.log(fetchData[0].NomCompte);
        }
    };
    //PERMET AU CHEF CAISSE D'APPPROVISIONNER UN CAISSIER
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/save-appro", {
            devise,
            Montant,
            CaissierId,
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
        });
        if (res.data.status == 1) {
            setloading(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });

            setDevise("");
            setMontant("");
            setvightMille("0");
            setdixMille("0");
            setcinqMille("0");
            setmilleFranc("0");
            setcinqCentFr("0");
            setdeuxCentFranc("0");
            setcentFranc("0");
            setcinquanteFanc("0");
            sethundred("0");
            setfitfty("0");
            settwenty("0");
            setten("0");
            setfive("0");
            setoneDollar("0");
            getLastestOperation();
        } else {
            setloading(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    //PERMET DE RECUPERER LES OPERATIONS RECENTES POUR EDITER LES RECU

    const getLastestOperation = async () => {
        const res = await axios.get("/eco/pages/appro/get-daily-operations");
        if (res.data.status == 1) {
            setFetchDailyOperationCDF(res.data.dataCDF);
            setFetchDailyOperationUSD(res.data.dataUSD);
        }
        console.log(fetchDailyOperationCDF);
    };

    const GetUserInformation = async () => {
        const res = await axios.get("/eco/page/appro/get-billetage-caissier");
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.billetageCDF);
            setGetBilletageUSD(res.data.billetageUSD);
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

    //PERMET A L'UTILISATEUR D'ACCEPTER L'APPRO LUI ENVOYE PAR LE CHEF CAISSE
    const AcceptAppro = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/appro/accept-appro", {
            devise,
        });

        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            // setTimeout(function () {
            //     window.location.reload();
            // }, 2000);
            getLastestOperation();
            GetUserInformation();
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

    function removeLastWord(sentence) {
        const words = sentence.split(" "); // Divise la chaîne en mots
        const wordsWithoutLast = words.slice(0, -1); // Prend tous les mots sauf le dernier
        return wordsWithoutLast.join(" "); // Recompose la chaîne sans le dernier mot
    }

    const handlePrintClick = (data) => {
        setSelectedData(data);
    };

    return (
        <>
            {fetchData !== undefined &&
            getchefcaisse &&
            getchefcaisse.isChefCaisse == 1 ? (
                <div className="container-fluid py-4">
    {/* ========== EN-TÊTE MODERNE ========== */}
    <div className="row mb-4">
        <div className="col-12">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-header text-white border-0 py-3" style={{background: "#0b7285" }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-3 p-2">
                            <i className="fas fa-charging-station fa-2x"></i>
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0">Approvisionnement</h5>
                            <small className="text-white-50">Gestion des approvisionnements en espèces</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* ========== SECTION FORMULAIRE ========== */}
    <div className="row g-4 mb-4">
        {/* Carte Informations + Devise */}
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-info-circle me-2" style={{ color: "#6366f1" }}></i>
                        Informations d'approvisionnement
                    </h6>
                </div>
                <div className="card-body pt-2">
                    <div className="mb-3">
                        <label className="label-modern">Devise</label>
                        <select
                            className="modern-select w-100"
                            value={devise}
                            onChange={(e) => setDevise(e.target.value)}
                        >
                            <option value="CDF">Franc Congolais (CDF)</option>
                            <option value="USD">Dollar américain (USD)</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="label-modern">Caissier(ère)</label>
                        <select
                            className="modern-select w-100"
                            value={CaissierId}
                            onChange={(e) => setCaissierId(e.target.value)}
                        >
                            <option value="">Sélectionnez un caissier</option>
                            {fetchData?.map((res, idx) => (
                                <option key={idx} value={res.caissierId}>
                                    {removeLastWord(res.NomCompte)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label-modern">Montant</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            placeholder="0,00"
                            value={Montant}
                            onChange={(e) => setMontant(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Carte Billetage */}
        <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-money-bill-wave me-2" style={{ color: "#6366f1" }}></i>
                        Billetage
                    </h6>
                </div>
                <div className="card-body pt-2" style={{ maxHeight: "450px", overflowY: "auto" }}>
                    {devise === "USD" ? (
                        <div className="table-responsive">
                            <table className="table table-hover table-sm align-middle custom-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Coupure</th>
                                        <th>Nombre de billets</th>
                                        <th className="text-end">Montant (USD)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "100", value: hundred, set: sethundred, mult: 100 },
                                        { label: "50", value: fitfty, set: setfitfty, mult: 50 },
                                        { label: "20", value: twenty, set: settwenty, mult: 20 },
                                        { label: "10", value: ten, set: setten, mult: 10 },
                                        { label: "5", value: five, set: setfive, mult: 5 },
                                        { label: "1", value: oneDollar, set: setoneDollar, mult: 1 }
                                    ].map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{item.label} ×</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm modern-input"
                                                    value={item.value}
                                                    onChange={(e) => item.set(e.target.value)}
                                                />
                                            </td>
                                            <td className="text-end text-success fw-semibold">
                                                {((parseInt(item.value) || 0) * item.mult).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-warning fw-bold">
                                    <tr>
                                        <th colSpan="2">Total général</th>
                                        <th className="text-end">
                                            {(
                                                (parseInt(hundred) || 0) * 100 +
                                                (parseInt(fitfty) || 0) * 50 +
                                                (parseInt(twenty) || 0) * 20 +
                                                (parseInt(ten) || 0) * 10 +
                                                (parseInt(five) || 0) * 5 +
                                                (parseInt(oneDollar) || 0) * 1
                                            ).toLocaleString()} USD
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-sm align-middle custom-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Coupure</th>
                                        <th>Nombre de billets</th>
                                        <th className="text-end">Montant (CDF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "20 000", value: vightMille, set: setvightMille, mult: 20000 },
                                        { label: "10 000", value: dixMille, set: setdixMille, mult: 10000 },
                                        { label: "5 000", value: cinqMille, set: setcinqMille, mult: 5000 },
                                        { label: "1 000", value: milleFranc, set: setmilleFranc, mult: 1000 },
                                        { label: "500", value: cinqCentFr, set: setcinqCentFr, mult: 500 },
                                        { label: "200", value: deuxCentFranc, set: setdeuxCentFranc, mult: 200 },
                                        { label: "100", value: centFranc, set: setcentFranc, mult: 100 },
                                        { label: "50", value: cinquanteFanc, set: setcinquanteFanc, mult: 50 }
                                    ].map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{item.label} ×</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm modern-input"
                                                    value={item.value}
                                                    onChange={(e) => item.set(e.target.value)}
                                                />
                                            </td>
                                            <td className="text-end text-success fw-semibold">
                                                {((parseInt(item.value) || 0) * item.mult).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-warning fw-bold">
                                    <tr>
                                        <th colSpan="2">Total général</th>
                                        <th className="text-end">
                                            {(
                                                (parseInt(vightMille) || 0) * 20000 +
                                                (parseInt(dixMille) || 0) * 10000 +
                                                (parseInt(cinqMille) || 0) * 5000 +
                                                (parseInt(milleFranc) || 0) * 1000 +
                                                (parseInt(cinqCentFr) || 0) * 500 +
                                                (parseInt(deuxCentFranc) || 0) * 200 +
                                                (parseInt(centFranc) || 0) * 100 +
                                                (parseInt(cinquanteFanc) || 0) * 50
                                            ).toLocaleString()} CDF
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Carte Action - Validation */}
        <div className="col-md-2">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-check-circle me-2" style={{ color: "#6366f1" }}></i>
                        Action
                    </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                    <button
                        className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                        onClick={saveOperation}
                        disabled={
                            (devise === "USD"
                                ? (parseInt(hundred) || 0) * 100 +
                                  (parseInt(fitfty) || 0) * 50 +
                                  (parseInt(twenty) || 0) * 20 +
                                  (parseInt(ten) || 0) * 10 +
                                  (parseInt(five) || 0) * 5 +
                                  (parseInt(oneDollar) || 0) * 1
                                : (parseInt(vightMille) || 0) * 20000 +
                                  (parseInt(dixMille) || 0) * 10000 +
                                  (parseInt(cinqMille) || 0) * 5000 +
                                  (parseInt(milleFranc) || 0) * 1000 +
                                  (parseInt(cinqCentFr) || 0) * 500 +
                                  (parseInt(deuxCentFranc) || 0) * 200 +
                                  (parseInt(centFranc) || 0) * 100 +
                                  (parseInt(cinquanteFanc) || 0) * 50) !== parseInt(Montant) ||
                            !Montant ||
                            !CaissierId
                        }
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <i className="fas fa-check-circle"></i>
                        )}
                        <span>Valider</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    {/* ========== SÉPARATEUR + HISTORIQUE ========== */}
    <div className="position-relative my-4">
        <hr className="border-2" style={{ borderColor: "#e9ecef" }} />
        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
            <i className="fas fa-history me-1"></i> Opérations récentes
        </span>
    </div>

    <div className="row">
        <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-clock me-2" style={{ color: "#6366f1" }}></i>
                        Appros récents
                    </h6>
                </div>
                <div className="card-body pt-2">
                    {/* CDF */}
                    {fetchDailyOperationCDF?.length > 0 && (
                        <>
                            <div className="mb-2">
                                <h5 className="fw-bold mb-0" style={{ color: "teal" }}>
                                    <i className="fas fa-chart-line me-2"></i>Francs Congolais (CDF)
                                </h5>
                            </div>
                            <div className="table-responsive mb-4">
                                <table className="table table-hover align-middle custom-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Référence</th>
                                            <th className="text-end">Montant</th>
                                            <th>Caissier</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fetchDailyOperationCDF.map((res, idx) => (
                                            <tr key={idx}>
                                                <td><small>{res.Reference}</small></td>
                                                <td className="text-end fw-bold text-success">{res.montant?.toLocaleString()} CDF</td>
                                                <td>{res.NomUtilisateur}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() => handlePrintClick(res)}
                                                        className="btn btn-sm btn-outline-warning"
                                                        data-toggle="modal"
                                                        data-target="#modal-appro-cdf"
                                                        style={{ borderRadius: "20px" }}
                                                        >
                                                        <i className="fas fa-print me-1"></i> Imprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedData && <RecuApproCDF data={selectedData} />}
                        </>
                    )}

                    {/* USD */}
                    {fetchDailyOperationUSD?.length > 0 && (
                        <>
                            <div className="mb-2 mt-3">
                                <h5 className="fw-bold mb-0" style={{ color: "teal" }}>
                                    <i className="fas fa-dollar-sign me-2"></i>Dollars américains (USD)
                                </h5>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle custom-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Référence</th>
                                            <th className="text-end">Montant</th>
                                            <th>Caissier</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fetchDailyOperationUSD.map((res, idx) => (
                                            <tr key={idx}>
                                                <td><small>{res.Reference}</small></td>
                                                <td className="text-end fw-bold text-success">{res.montant?.toLocaleString()} USD</td>
                                                <td>{res.NomUtilisateur}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() => handlePrintClick(res)}
                                                        className="btn btn-sm btn-outline-warning"
                                                        data-toggle="modal"
                                                        data-target="#modal-appro-usd"
                                                        style={{ borderRadius: "20px" }}
                                                    >
                                                        <i className="fas fa-print me-1"></i> Imprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedData && <RecuApproUSD data={selectedData} />}
                        </>
                    )}

                    {(!fetchDailyOperationCDF || fetchDailyOperationCDF.length === 0) &&
                        (!fetchDailyOperationUSD || fetchDailyOperationUSD.length === 0) && (
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
            ) : (
                // Vue pour les autres utilisateurs (consultation du billetage disponible)
              <div className="container-fluid py-4">
    {/* En-tête moderne */}
    <div className="row mb-4" >
        <div className="col-12">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background:"#0b7285" }}>
                <div className="card-header text-white border-0 py-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-25 rounded-3 p-2">
                            <i className="fas fa-charging-station fa-2x"></i>
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0">Approvisionnement</h5>
                            <small className="text-white-50">Consultation du billetage disponible</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Cartes : Devise + Billetage + Action */}
    <div className="row g-4">
        {/* Carte : Sélection de la devise */}
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-coins me-2" style={{ color: "#6366f1" }}></i>
                        Devise
                    </h6>
                </div>
                <div className="card-body pt-2">
                    <label className="label-modern">Choisir la devise</label>
                    <select
                        className="modern-select w-100"
                        value={devise}
                        onChange={(e) => setDevise(e.target.value)}
                    >
                        <option value="CDF">Franc Congolais (CDF)</option>
                        <option value="USD">Dollar américain (USD)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Carte : Billetage disponible */}
        <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-money-bill-wave me-2" style={{ color: "#6366f1" }}></i>
                        Billetage disponible
                    </h6>
                </div>
                <div className="card-body pt-2">
                    {devise === "USD" && getBilletageUSD ? (
                        <div className="table-responsive">
                            <table className="table table-hover table-sm align-middle custom-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Coupure</th>
                                        <th>Nombre de billets</th>
                                        <th classNam e="text-end">Montant (USD)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "100", value: getBilletageUSD.centDollars, mult: 100 },
                                        { label: "50", value: getBilletageUSD.cinquanteDollars, mult: 50 },
                                        { label: "20", value: getBilletageUSD.vightDollars, mult: 20 },
                                        { label: "10", value: getBilletageUSD.dixDollars, mult: 10 },
                                        { label: "5", value: getBilletageUSD.cinqDollars, mult: 5 },
                                        { label: "1", value: getBilletageUSD.unDollars, mult: 1 }
                                    ].map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{item.label} ×</td>
                                            <td>{parseInt(item.value) || 0}</td>
                                            <td className="text-end text-success fw-semibold">
                                                {((parseInt(item.value) || 0) * item.mult).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-warning fw-bold">
                                    <tr>
                                        <th colSpan="2">Total général</th>
                                        <th className="text-end">
                                            {getBilletageUSD.montant !== undefined &&
                                                numberWithSpaces(parseInt(getBilletageUSD.montant))} USD
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : devise === "CDF" && getBilletageCDF ? (
                        <div className="table-responsive">
                            <table className="table table-hover table-sm align-middle custom-table">
                                <thead className="table-light">
                                    <tr>
                                        <th>Coupure</th>
                                        <th>Nombre de billets</th>
                                        <th className="text-end">Montant (CDF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "20 000", value: getBilletageCDF.vightMilleFranc, mult: 20000 },
                                        { label: "10 000", value: getBilletageCDF.dixMilleFranc, mult: 10000 },
                                        { label: "5 000", value: getBilletageCDF.cinqMilleFranc, mult: 5000 },
                                        { label: "1 000", value: getBilletageCDF.milleFranc, mult: 1000 },
                                        { label: "500", value: getBilletageCDF.cinqCentFranc, mult: 500 },
                                        { label: "200", value: getBilletageCDF.deuxCentFranc, mult: 200 },
                                        { label: "100", value: getBilletageCDF.centFranc, mult: 100 },
                                        { label: "50", value: getBilletageCDF.cinquanteFanc, mult: 50 }
                                    ].map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{item.label} ×</td>
                                            <td>{parseInt(item.value) || 0}</td>
                                            <td className="text-end text-success fw-semibold">
                                                {((parseInt(item.value) || 0) * item.mult).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-warning fw-bold">
                                    <tr>
                                        <th colSpan="2">Total général</th>
                                        <th className="text-end">
                                            {getBilletageCDF.montant !== undefined &&
                                                numberWithSpaces(parseInt(getBilletageCDF.montant))} CDF
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                            <p>Chargement du billetage...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Carte : Validation */}
        <div className="col-md-2">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-check-circle me-2" style={{ color: "#6366f1" }}></i>
                        Action
                    </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                    <button
                        className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                        onClick={AcceptAppro}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <i className="fas fa-check-circle"></i>
                        )}
                        <span>Valider</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
            )}
           
        </>
    );
};

export default Appro;
