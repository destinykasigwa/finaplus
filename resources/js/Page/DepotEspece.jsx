// import styles from "../styles/RegisterForm.module.css";
import { useState, use, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuDepot from "./Modals/RecuDepot";
import { Bars } from "react-loader-spinner";
// import { useNavigate } from "react-router-dom";

const DepotEspece = () => {
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

    const [searched_account, setsearched_account] = useState();
    const [fetchData, setFetchData] = useState();
    const [devise, setDevise] = useState("CDF");
    const [motifDepot, setMotifDepot] = useState("EPARGNE");
    const [DeposantName, setDeposantName] = useState();
    const [DeposantPhone, setDeposantPhone] = useState();
    const [Montant, setMontant] = useState(0);
    const [loading, setloading] = useState(false);
    const [error, setError] = useState([]);
    const [fetchData2, setfetchData2] = useState();
    const [Commission, setCommission] = useState(0);
    const [GetCommissionConfig, setGetCommissionConfig] = useState("");
    const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [loadingData, setloadingData] = useState(false);
    const [getNumCompte, setGetNumCompte] = useState();
    const [isLoadingBar, setIsLoadingBar] = useState();
    const [fetchSolde, setFetchSolde] = useState();
    //GET SEACHED DATA
    const getSeachedData = async (e) => {
        e.preventDefault();
        setloadingData(true);
        const res = await axios.post("/eco/page/depot-espece/get-account/2", {
            searched_account: searched_account,
        });
        if (res.data.status == 1) {
            setloadingData(false);
            setFetchData(res.data.data);
            console.log(fetchData);
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
        getCommissionConfig();
        getBilletage();
    }, []);

    const getBilletage = async () => {
        const res = await axios.get("/eco/depot/get-recu");
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.dataCDF);
            setGetBilletageUSD(res.data.dataUSD);
        }
    };

    const getCommissionConfig = async () => {
        const res = await axios.get("/eco/pages/get-commission-setting");
        if (res.data.status == 1) {
            console.log(res.data.data);
            setGetCommissionConfig(res.data.data);
        }
    };
   const saveOperation = async (e) => {
    e.preventDefault();
    
    // ✅ VALIDATION AVANT TOUT - Vérifier que DeposantName est rempli
    if (!DeposantName || DeposantName.trim() === "") {
        Swal.fire({
            title: "Champ obligatoire",
            text: "Veuillez renseigner le nom du déposant avant de valider l'opération.",
            icon: "warning",
            timer: 4000,
            confirmButtonText: "D'accord",
            confirmButtonColor: "#138496"
        });
        // Focus sur le champ DeposantName pour une meilleure UX
        document.getElementById("DeposantName")?.focus();
        return; // ⚠️ IMPORTANT : on arrête l'exécution ici
    }
    
    // ✅ Optionnel : valider aussi le montant si nécessaire
    if (!Montant || parseFloat(Montant) <= 0) {
        Swal.fire({
            title: "Montant invalide",
            text: "Veuillez saisir un montant valide.",
            icon: "warning",
            timer: 4000,
            confirmButtonText: "D'accord",
            confirmButtonColor: "#138496"
        });
        document.getElementById("Montant")?.focus();
        return;
    }
    
    // Maintenant seulement on active le loading et on fait l'appel API
    setloading(true);
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
                devise: fetchData2.CodeMonnaie == 1 ? "USD" : "CDF",
                motifDepot,
                DeposantName,
                DeposantPhone,
                Montant,
                NumAbrege: searched_account,
                Commission,
                getNumCompte,
            }
        );
        if (res.data.status == 1) {
            setloading(false);
            setIsLoadingBar(false);
            setDeposantName("");
            setDeposantPhone("");
            setMontant("0");
            setvightMille(0);
            setdixMille(0);
            setcinqMille(0);
            setmilleFranc(0);
            setcinqCentFr(0);
            setdeuxCentFranc(0);
            setcentFranc(0);
            setcinquanteFanc(0);
            sethundred(0);
            setfitfty(0);
            settwenty(0);
            setten(0);
            setfive(0);
            setoneDollar(0);
            setCommission(0);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            getBilletage();
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
    } catch (error) {
        setloading(false);
        setIsLoadingBar(false);
        Swal.fire({
            title: "Erreur",
            text: "Erreur de connexion. Tentative de nouvelle connexion...",
            icon: "error",
            timer: 8000,
            confirmButtonText: "Okay",
        });
        setTimeout(() => { 
            saveOperation(e);
        }, 5000);
    } finally {
        setloading(false);
        setIsLoadingBar(false);
    }
};
    const getAccountInfo = async (event) => {
        if (event.detail == 2) {
            setloadingData(true);
            const res = await axios.post(
                "/eco/page/depot-espece/get-account/specific",
                {
                    NumCompte: event.target.innerHTML,
                }
            );
            if (res.data.status == 1) {
                setloadingData(false);
                setfetchData2(res.data.data);
                setGetNumCompte(event.target.innerHTML);
                fetchData2 && setDeposantName(fetchData2.NomCompte);
                setFetchSolde(res.data.soldeCompte);
                console.log(DeposantName);
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
        }
    };

    const handlePrintClick = (data) => {
        setSelectedData(data);
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
                                    <i className="fas fa-money-bill-wave" style={{ fontSize: "28px", color: "white" }}></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">Dépôt D'Espèce</h5>
                                    <small className="text-white-50">Enregistrement des opérations de dépôt</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoadingBar && (
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

            {/* Section 1: Recherche et informations compte */}
            <div className="row g-3 mb-4">
                {/* Recherche compte */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white border-0 pt-3 pb-0">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-search me-2"></i>Recherche Compte
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
                                        style={{ borderRadius: "10px 0 0 10px" }}
                                        onChange={(e) => {
                                            setsearched_account(e.target.value);
                                        }}
                                    />
                                    <button
                                        className="btn"
                                        style={{ borderRadius: "0 10px 10px 0", background: "teal", color: "white", border: "none" }}
                                        onClick={getSeachedData}
                                    >
                                        <i className="fas fa-search me-1"></i>Rechercher
                                    </button>
                                </div>
                            </div>
                            <hr className="my-3" />
                            
                            <form>
                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: "5px", width: "40%" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Intitulé de compte</label>
                                            </td>
                                            <td style={{ padding: "5px" }}>
                                                <input
                                                    id="intituleCompte"
                                                    name="intituleCompte"
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "8px", backgroundColor: "#f8f9fa" }}
                                                    value={fetchData2 && fetchData2.NomCompte}
                                                    disabled
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "5px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Numéro de compte</label>
                                            </td>
                                            <td style={{ padding: "5px" }}>
                                                <input
                                                    id="NumCompte"
                                                    name="NumCompte"
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "8px", backgroundColor: "#f8f9fa" }}
                                                    disabled
                                                    value={fetchData2 && fetchData2.NumCompte}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "5px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Code Agence</label>
                                            </td>
                                            <td style={{ padding: "5px" }}>
                                                <input
                                                    id="CodeAgence"
                                                    name="CodeAgence"
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "8px", backgroundColor: "#f8f9fa", width: "100px" }}
                                                    value={fetchData2 && fetchData2.CodeAgence}
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
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-list me-2"></i>Liste des comptes
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                                <table className="table table-hover mb-0">
                                    <tbody>
                                        {fetchData && fetchData.map((res, index) => {
                                            return (
                                                <tr
                                                    key={index}
                                                    className="clickable-row"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={(event) => getAccountInfo(event)}
                                                >
                                                    <td className="py-2 px-3 fw-semibold">
                                                        {res.NumCompte}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <span className={`badge ${res.CodeMonnaie == 1 ? 'bg-info' : 'bg-success'}`}>
                                                            {res.CodeMonnaie == 1 ? "USD" : "CDF"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Solde compte */}
                {fetchSolde && (
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100" style={{
                            background: "linear-gradient(135deg, teal 0%, #0a6b6b 100%)"
                        }}>
                            <div className="card-body text-center">
                                <i className="fas fa-chart-line fa-2x mb-2 opacity-75 text-white"></i>
                                <h6 className="text-white-50 mb-2">Solde du compte</h6>
                                <h2 className="fw-bold mb-0 text-white">
                                    {fetchData2 && fetchData2.CodeMonnaie == 1 ? "USD " : "CDF "}
                                    {fetchSolde.soldeMembre?.toFixed(2) || "0.00"}
                                </h2>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Séparateur décoratif */}
            <div className="position-relative my-4">
                <hr className="border-2" style={{ borderColor: "#e9ecef" }} />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    <i className="fas fa-arrow-down me-1"></i> Informations de dépôt
                </span>
            </div>

            {/* Section 2: Formulaire de dépôt */}
            <div className="row g-3">
                {/* Informations du dépôt */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-info-circle me-2"></i>Informations
                            </h6>
                        </div>
                        <div className="card-body">
                            <form>
                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: "8px", width: "35%" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Devise</label>
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <select
                                                    id="devise"
                                                    name="devise"
                                                    className={`form-control ${error.devise ? 'is-invalid' : ''}`}
                                                    style={{ borderRadius: "8px" }}
                                                    disabled
                                                    onChange={(e) => {
                                                        setDevise(e.target.value);
                                                    }}
                                                >
                                                    <option value={fetchData2 && fetchData2.CodeMonnaie == 1 ? "USD" : "CDF"}>
                                                        {fetchData2 && fetchData2.CodeMonnaie == 1 ? "USD" : "CDF"}
                                                    </option>
                                                </select>
                                                {error.devise && <small className="text-danger d-block mt-1">{error.devise}</small>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "8px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Motif</label>
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <input
                                                    id="motifDepot"
                                                    name="motifDepot"
                                                    type="text"
                                                    className={`form-control ${error.motifDepot ? 'is-invalid' : ''}`}
                                                    style={{ borderRadius: "8px", textTransform: "uppercase" }}
                                                    onChange={(e) => setMotifDepot(e.target.value).toUpperCase()}
                                                    value={motifDepot}
                                                    placeholder="Motif du dépôt"
                                                />
                                                {error.motifDepot && <small className="text-danger d-block mt-1">{error.motifDepot}</small>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "8px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>
                                                    Déposant <span className="text-danger">*</span>
                                                </label>
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <input
                                                    id="DeposantName"
                                                    name="DeposantName"
                                                    required
                                                    type="text"
                                                    className={`form-control ${error.DeposantName ? 'is-invalid' : ''}`}
                                                    style={{ borderRadius: "8px", textTransform: "uppercase" }}
                                                    onChange={(e) => setDeposantName(e.target.value).toUpperCase()}
                                                    value={DeposantName}
                                                    placeholder="Nom du déposant"
                                                />
                                                {error.DeposantName && <small className="text-danger d-block mt-1">{error.DeposantName}</small>}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "8px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Téléphone</label>
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <input
                                                    id="DeposantPhone"
                                                    name="DeposantPhone"
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "8px" }}
                                                    onChange={(e) => setDeposantPhone(e.target.value)}
                                                    value={DeposantPhone}
                                                    placeholder="Numéro de téléphone"
                                                />
                                            </td>
                                        </tr>
                                        {GetCommissionConfig == 1 && (
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label style={{ color: "steelblue", fontWeight: "500" }}>Commission</label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        id="Commission"
                                                        name="Commission"
                                                        type="text"
                                                        className="form-control"
                                                        style={{ borderRadius: "8px", width: "100px" }}
                                                        onChange={(e) => setCommission(e.target.value)}
                                                        value={Commission}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td style={{ padding: "8px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Montant</label>
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                <input
                                                    id="Montant"
                                                    name="Montant"
                                                    type="text"
                                                    className={`form-control ${error.Montant ? 'is-invalid' : ''}`}
                                                    style={{ borderRadius: "8px", fontWeight: "bold", fontSize: "18px" }}
                                                    onChange={(e) => setMontant(e.target.value)}
                                                    value={Montant}
                                                    placeholder="0,00"
                                                />
                                                {error.Montant && <small className="text-danger d-block mt-1">{error.Montant}</small>}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Billetage */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-money-bill me-2"></i>Billetage
                            </h6>
                        </div>
                        <div className="card-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
                            {fetchData2 && fetchData2.CodeMonnaie == 1 ? (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead style={{ backgroundColor: "#e6f2f9" }}>
                                            <tr>
                                                <th style={{ color: "steelblue" }}>Coupures</th>
                                                <th style={{ color: "steelblue" }}>Nbr Billets</th>
                                                <th style={{ color: "steelblue" }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { value: hundred, set: sethundred, label: "100", multiplier: 100 },
                                                { value: fitfty, set: setfitfty, label: "50", multiplier: 50 },
                                                { value: twenty, set: settwenty, label: "20", multiplier: 20 },
                                                { value: ten, set: setten, label: "10", multiplier: 10 },
                                                { value: five, set: setfive, label: "5", multiplier: 5 },
                                                { value: oneDollar, set: setoneDollar, label: "1", multiplier: 1 }
                                            ].map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-semibold">{item.label}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{ boxShadow: "inset 0 0 3px #888", borderRadius: "6px" }}
                                                            value={item.value}
                                                            onChange={(e) => item.set(e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="fw-bold text-success">
                                                        {(item.value * item.multiplier).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr style={{ backgroundColor: "#e6f2f9" }}>
                                                <th>Total</th>
                                                <th>
                                                    {parseInt(hundred) + parseInt(fitfty) + parseInt(twenty) + 
                                                     parseInt(ten) + parseInt(five) + parseInt(oneDollar)}
                                                </th>
                                                <th className="fw-bold fs-5" style={{ color: "#198764" }}>
                                                    {(hundred * 100 + fitfty * 50 + twenty * 20 + 
                                                      ten * 10 + five * 5 + oneDollar * 1).toLocaleString()}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead style={{ backgroundColor: "#e6f2f9" }}>
                                            <tr>
                                                <th style={{ color: "steelblue" }}>Coupures</th>
                                                <th style={{ color: "steelblue" }}>Nbr Billets</th>
                                                <th style={{ color: "steelblue" }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { value: vightMille, set: setvightMille, label: "20000", multiplier: 20000 },
                                                { value: dixMille, set: setdixMille, label: "10000", multiplier: 10000 },
                                                { value: cinqMille, set: setcinqMille, label: "5000", multiplier: 5000 },
                                                { value: milleFranc, set: setmilleFranc, label: "1000", multiplier: 1000 },
                                                { value: cinqCentFr, set: setcinqCentFr, label: "500", multiplier: 500 },
                                                { value: deuxCentFranc, set: setdeuxCentFranc, label: "200", multiplier: 200 },
                                                { value: centFranc, set: setcentFranc, label: "100", multiplier: 100 },
                                                { value: cinquanteFanc, set: setcinquanteFanc, label: "50", multiplier: 50 }
                                            ].map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-semibold">{item.label}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            style={{ boxShadow: "inset 0 0 3px #888", borderRadius: "6px" }}
                                                            value={item.value}
                                                            onChange={(e) => item.set(e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="fw-bold text-success">
                                                        {(item.value * item.multiplier).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr style={{ backgroundColor: "#e6f2f9" }}>
                                                <th>Total</th>
                                                <th>
                                                    {parseInt(vightMille) + parseInt(dixMille) + parseInt(cinqMille) +
                                                     parseInt(milleFranc) + parseInt(cinqCentFr) + parseInt(deuxCentFranc) +
                                                     parseInt(centFranc) + parseInt(cinquanteFanc)}
                                                </th>
                                                <th className="fw-bold fs-5" style={{ color: "#198764" }}>
                                                    {(vightMille * 20000 + dixMille * 10000 + cinqMille * 5000 +
                                                      milleFranc * 1000 + cinqCentFr * 500 + deuxCentFranc * 200 +
                                                      centFranc * 100 + cinquanteFanc * 50).toLocaleString()}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions et historique */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                        <div className="card-body">
                            <button
                                className="btn w-100 py-2 fw-bold"
                                id="validerbtn"
                                style={{
                                    background: "linear-gradient(135deg, teal, #0a6b6b)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "16px",
                                    color: "white"
                                }}
                                onClick={saveOperation}
                                disabled={
                                    (fetchData2 && fetchData2.CodeMonnaie == 1
                                        ? (hundred * 100 + fitfty * 50 + twenty * 20 + ten * 10 + five * 5 + oneDollar * 1) !== parseInt(Montant)
                                        : (vightMille * 20000 + dixMille * 10000 + cinqMille * 5000 + milleFranc * 1000 +
                                           cinqCentFr * 500 + deuxCentFranc * 200 + centFranc * 100 + cinquanteFanc * 50) !== parseInt(Montant)
                                    ) || !Montant
                                }
                            >
                                <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}></i>
                                Valider le dépôt
                            </button>
                        </div>
                    </div>

                    {/* Historique des opérations */}
                    <div className="card border-0 shadow-sm rounded-3" style={{ maxHeight: "450px", overflowY: "auto" }}>
                        <div className="card-header bg-white border-0 pt-3 sticky-top bg-white">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-history me-2"></i>Opérations récentes
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            {getBilletageCDF && getBilletageCDF.length > 0 && (
                                <>
                                    <div className="px-3 py-2" style={{ backgroundColor: "#e6f2f9" }}>
                                        <small className="fw-bold" style={{ color: "steelblue" }}>CDF</small>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover mb-3">
                                            <thead>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>Réf.</th>
                                                    <th>Montant</th>
                                                    <th>Déposant</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getBilletageCDF.map((res, index) => (
                                                    <tr key={index}>
                                                        <td><small>{res.refOperation}</small></td>
                                                        <td className="fw-bold">{res.montantEntre?.toLocaleString()}</td>
                                                        <td><small>{res.Beneficiaire}</small></td>
                                                        <td>
                                                            <button
                                                                onClick={() => handlePrintClick(res)}
                                                                className="btn btn-primary rounded-10"
                                                                data-toggle="modal"
                                                                data-target="#modal-delestage-cdf"
                                                                    
                                                                style={{ background: "teal", color: "white", borderRadius: "6px", padding: "2px 8px", fontSize: "11px" }}
                                                                
                                                            >
                                                                <i className="fas fa-print"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                            
                            {getBilletageUSD && getBilletageUSD.length > 0 && (
                                <>
                                    <div className="px-3 py-2 mt-2" style={{ backgroundColor: "#e6f2f9" }}>
                                        <small className="fw-bold" style={{ color: "steelblue" }}>USD</small>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover">
                                            <thead>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>Réf.</th>
                                                    <th>Montant</th>
                                                    <th>Déposant</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getBilletageUSD.map((res, index) => (
                                                    <tr key={index}>
                                                        <td><small>{res.refOperation}</small></td>
                                                        <td className="fw-bold">{res.montantEntre?.toLocaleString()}</td>
                                                        <td><small>{res.Beneficiaire}</small></td>
                                                        <td>
                                                            <button
                                                                onClick={() => handlePrintClick(res)}
                                                                  data-toggle="modal"
                                                                    data-target="#modal-delestage-cdf"
                                                                    className="btn btn-primary rounded-10"
                                                                style={{ background: "teal", color: "white", borderRadius: "6px", padding: "2px 8px", fontSize: "11px" }}
                                                            >
                                                                <i className="fas fa-print"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                            
                            {(!getBilletageCDF || getBilletageCDF.length === 0) && 
                             (!getBilletageUSD || getBilletageUSD.length === 0) && (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                    <p className="mb-0">Aucune opération récente</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'impression - Placé à la fin du formulaire comme dans l'original */}
            {selectedData && <RecuDepot data={selectedData} />}
        </div>
    )}
</>
    );
};

export default DepotEspece;
