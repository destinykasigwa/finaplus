// import styles from "../styles/RegisterForm.module.css";
import { useState,useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuDepot from "./Modals/RecuDepot";
import { Bars } from "react-loader-spinner";
import RecuDepotA5 from "./Modals/RecuDepotA5";
// import { useNavigate } from "react-router-dom";

const Suspens = () => {
    //CDF ATTRIBUTE
    const [vightMille, setvightMille] = useState(0);
    const [dixMille, setdixMille] = useState(0);
    const [cinqMille, setcinqMille] = useState(0);
    const [milleFranc, setmilleFranc] = useState(0);
    const [cinqCentFr, setcinqCentFr] = useState(0);
    const [deuxCentFranc, setdeuxCentFranc] = useState(0);
    const [centFranc, setcentFranc] = useState(0);
    const [cinquanteFanc, setcinquanteFanc] = useState(0);
      const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [GetRecuConfig, setGetRecuConfig] = useState("");
     const [GetCommissionConfig, setGetCommissionConfig] = useState("");

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
    //GET SEACHED DATA

     useEffect(() => {
        getBilletage();
        getCommissionConfig();
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
            setGetRecuConfig(res.data.type_recu);
        }
    };

    const getSeachedData = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/depot-espece/get-account/2", {
            searched_account: searched_account,
        });
        if (res.data.status == 1) {
            setFetchData(res.data.data);
            console.log(fetchData);
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
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post(
            "/eco/page/depot-espece/save-deposit/suspens",
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
            }
        );
        if (res.data.status == 1) {
            setloading(false);
            setDeposantName("");
            setDeposantPhone("");
            setMontant("");
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
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setloading(false);
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
            const res = await axios.post(
                "/eco/page/depot-espece/get-account/specific",
                {
                    NumCompte: event.target.innerHTML,
                }
            );
            if (res.data.status == 1) {
                setfetchData2(res.data.data);
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

      const handlePrintClick = (data) => {
        setSelectedData(data);
       
        // Si A5 → imprimer directement
    };
    return (
       <div className="container-fluid py-3">
    {/* En-tête moderne */}
    <div className="row mb-4" >
        <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" >
                <div className="card-header text-white border-0 py-3" style={{background:"#138496" }}>
                    <h5 className="fw-bold mb-0">
                        <i className="fas fa-hourglass-half me-2"></i>
                        Opérations de suspens
                    </h5>
                </div>
            </div>
        </div>
    </div>

    {/* Section 1 : Recherche et sélection du compte */}
    <div className="row g-4 mb-4">
        {/* Panneau de recherche */}
        <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-search me-2" style={{ color: "#6366f1" }}></i>
                        Rechercher un compte
                    </h6>
                </div>
                <div className="card-body pt-2">
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control modern-input"
                            placeholder="Numéro de compte"
                            value={searched_account}
                            onChange={(e) => setsearched_account(e.target.value)}
                        />
                        <button
                            className="btn gradient-btn"
                            onClick={getSeachedData}
                            style={{ borderRadius: "0 12px 12px 0" }}
                        >
                            <i className="fas fa-search"></i>
                        </button>
                    </div>

                    {fetchData2 && (
                        <div className="bg-light rounded-3 p-3 mt-2">
                            <h6 className="fw-bold mb-3" style={{ color: "teal" }}>
                                <i className="fas fa-info-circle me-2"></i>Détails du compte
                            </h6>
                            <div className="row">
                                <div className="col-6 mb-2">
                                    <label className="label-modern">Intitulé</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={fetchData2.NomCompte || ""}
                                        disabled
                                    />
                                </div>
                                <div className="col-6 mb-2">
                                    <label className="label-modern">Numéro</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={fetchData2.NumCompte || ""}
                                        disabled
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="label-modern">Code agence</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={fetchData2.CodeAgence || ""}
                                        disabled
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="label-modern">Devise</label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        value={fetchData2.CodeMonnaie == 1 ? "USD" : "CDF"}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Liste des comptes */}
        <div className="col-md-7">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-list me-2" style={{ color: "#6366f1" }}></i>
                        Liste des comptes
                    </h6>
                </div>
                <div className="card-body pt-2">
                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <table className="table table-hover align-middle">
                            <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa" }}>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Devise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchData && fetchData.map((res, index) => (
                                    <tr
                                        key={index}
                                        style={{ cursor: "pointer" }}
                                          onClick={(
                                                                        event,
                                                                    ) =>
                                                                        getAccountInfo(
                                                                            event,
                                                                        )
                                                                    }
                                        className="account-row"
                                    >
                                        <td className="fw-semibold" style={{ color: "teal" }}>{res.NumCompte}</td>
                                        <td>
                                            <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                                                {res.CodeMonnaie == 1 ? "USD" : "CDF"}
                                            </span>
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

    {/* Section 2 : Dépôt / Billetage */}
    <div className="row g-4">
        {/* Colonne Informations */}
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-pen-alt me-2" style={{ color: "#6366f1" }}></i>
                        Informations
                    </h6>
                </div>
                <div className="card-body pt-2">
                    <div className="mb-3">
                        <label className="label-modern">Motif</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            value={motifDepot}
                            onChange={(e) => setMotifDepot(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="label-modern">Nom du déposant</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            value={DeposantName}
                            onChange={(e) => setDeposantName(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="label-modern">Téléphone</label>
                        <input
                            type="text"
                            className="form-control modern-input"
                            value={DeposantPhone}
                            onChange={(e) => setDeposantPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label-modern">Montant</label>
                        <input
                            type="number"
                            className="form-control modern-input"
                            value={Montant}
                            onChange={(e) => setMontant(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Colonne Billetage */}
        <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-money-bill-wave me-2" style={{ color: "#6366f1" }}></i>
                        Billetage
                    </h6>
                </div>
                <div className="card-body pt-2">
                    {fetchData2 && fetchData2.CodeMonnaie == 1 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>Coupures</th>
                                        <th>Nbre billets</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "100 $", value: hundred, set: sethundred, mult: 100 },
                                        { label: "50 $", value: fitfty, set: setfitfty, mult: 50 },
                                        { label: "20 $", value: twenty, set: settwenty, mult: 20 },
                                        { label: "10 $", value: ten, set: setten, mult: 10 },
                                        { label: "5 $", value: five, set: setfive, mult: 5 },
                                        { label: "1 $", value: oneDollar, set: setoneDollar, mult: 1 }
                                    ].map((b, idx) => (
                                        <tr key={idx}>
                                            <td>{b.label}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={b.value}
                                                    onChange={(e) => b.set(e.target.value)}
                                                />
                                            </td>
                                            <td className="fw-bold text-end">{(b.value * b.mult).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="table-active">
                                        <th>Total</th>
                                        <th className="text-center">
                                            {parseInt(hundred||0) + parseInt(fitfty||0) + parseInt(twenty||0) +
                                             parseInt(ten||0) + parseInt(five||0) + parseInt(oneDollar||0)}
                                        </th>
                                        <th className="text-end text-success fw-bold">
                                            {(hundred*100 + fitfty*50 + twenty*20 + ten*10 + five*5 + oneDollar*1).toLocaleString()} $
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>Coupures</th>
                                        <th>Nbre billets</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: "20000 FC", value: vightMille, set: setvightMille, mult: 20000 },
                                        { label: "10000 FC", value: dixMille, set: setdixMille, mult: 10000 },
                                        { label: "5000 FC", value: cinqMille, set: setcinqMille, mult: 5000 },
                                        { label: "1000 FC", value: milleFranc, set: setmilleFranc, mult: 1000 },
                                        { label: "500 FC", value: cinqCentFr, set: setcinqCentFr, mult: 500 },
                                        { label: "200 FC", value: deuxCentFranc, set: setdeuxCentFranc, mult: 200 },
                                        { label: "100 FC", value: centFranc, set: setcentFranc, mult: 100 },
                                        { label: "50 FC", value: cinquanteFanc, set: setcinquanteFanc, mult: 50 }
                                    ].map((b, idx) => (
                                        <tr key={idx}>
                                            <td>{b.label}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={b.value}
                                                    onChange={(e) => b.set(e.target.value)}
                                                />
                                            </td>
                                            <td className="fw-bold text-end">{(b.value * b.mult).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="table-active">
                                        <th>Total</th>
                                        <th className="text-center">
                                            {parseInt(vightMille||0) + parseInt(dixMille||0) + parseInt(cinqMille||0) +
                                             parseInt(milleFranc||0) + parseInt(cinqCentFr||0) + parseInt(deuxCentFranc||0) +
                                             parseInt(centFranc||0) + parseInt(cinquanteFanc||0)}
                                        </th>
                                        <th className="text-end text-success fw-bold">
                                            {(vightMille*20000 + dixMille*10000 + cinqMille*5000 + milleFranc*1000 +
                                              cinqCentFr*500 + deuxCentFranc*200 + centFranc*100 + cinquanteFanc*50).toLocaleString()} FC
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Colonne Actions */}
        <div className="col-md-2">
            <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i className="fas fa-cogs me-2" style={{ color: "#6366f1" }}></i>
                        Actions
                    </h6>
                </div>
                <div className="card-body d-flex flex-column gap-3 justify-content-center">
                    {(() => {
                        const totalUSD = hundred*100 + fitfty*50 + twenty*20 + ten*10 + five*5 + oneDollar*1;
                        const totalCDF = vightMille*20000 + dixMille*10000 + cinqMille*5000 + milleFranc*1000 +
                                         cinqCentFr*500 + deuxCentFranc*200 + centFranc*100 + cinquanteFanc*50;
                        const totalOK = (fetchData2?.CodeMonnaie == 1 && totalUSD == parseInt(Montant)) ||
                                        (fetchData2?.CodeMonnaie == 2 && totalCDF == parseInt(Montant));
                        return (
                            <>
                                <button
                                    className="btn gradient-btn w-100 py-3"
                                    onClick={saveOperation}
                                    disabled={!totalOK || loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <i className="fas fa-check me-2"></i>
                                    )}
                                    Valider
                                </button>
                                {/* <button className="btn btn-outline-secondary w-100 py-3">
                                    <i className="fas fa-print me-2"></i>
                                    Imprimer
                                </button> */}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>

         {/* Historique des opérations */}
                            <div
                                className="card border-0 shadow-sm rounded-3"
                                style={{
                                    maxHeight: "450px",
                                    overflowY: "auto",
                                }}
                            >
                                <div className="card-header bg-white border-0 pt-3  bg-white">
                                    {/* sticky-top */}
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-history me-2"></i>
                                        Opérations récentes
                                    </h6>
                                </div>
                                <div className="card-body p-0">
                                    {getBilletageCDF &&
                                        getBilletageCDF.length > 0 && (
                                            <>
                                                <div
                                                    className="px-3 py-2"
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <small
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        CDF
                                                    </small>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-hover mb-3">
                                                        <thead>
                                                            <tr
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <th>Réf.</th>
                                                                <th>Montant</th>
                                                                <th>
                                                                    Déposant
                                                                </th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {getBilletageCDF.map(
                                                                (
                                                                    res,
                                                                    index,
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.refOperation
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td className="fw-bold">
                                                                            {res.montantEntre?.toLocaleString()}
                                                                        </td>
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.Beneficiaire
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                onClick={() => handlePrintClick(res)}
                                                                className="btn btn-primary rounded-10"
                                                                data-toggle="modal"
                                                                data-target="#modal-delestage-cdf"
                                                                    
                                                                style={{ background: "teal", color: "white", borderRadius: "6px", padding: "2px 8px", fontSize: "11px" }}
                                                                
                                                            >
                                                                <i className="fas fa-print"></i> Imprimer
                                                            </button>
                                                                           
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}

                                    {getBilletageUSD &&
                                        getBilletageUSD.length > 0 && (
                                            <>
                                                <div
                                                    className="px-3 py-2 mt-2"
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <small
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        USD
                                                    </small>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-hover">
                                                        <thead>
                                                            <tr
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <th>Réf.</th>
                                                                <th>Montant</th>
                                                                <th>
                                                                    Déposant
                                                                </th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {getBilletageUSD.map(
                                                                (
                                                                    res,
                                                                    index,
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.refOperation
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td className="fw-bold">
                                                                            {res.montantEntre?.toLocaleString()}
                                                                        </td>
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.Beneficiaire
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handlePrintClick(
                                                                                        res,
                                                                                    )
                                                                                }
                                                                                data-toggle="modal"
                                                                                data-target="#modal-delestage-cdf"
                                                                                className="btn btn-primary rounded-10"
                                                                                style={{
                                                                                    background:
                                                                                        "teal",
                                                                                    color: "white",
                                                                                    borderRadius:
                                                                                        "6px",
                                                                                    padding:
                                                                                        "2px 8px",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-print"></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}

                                    {(!getBilletageCDF ||
                                        getBilletageCDF.length === 0) &&
                                        (!getBilletageUSD ||
                                            getBilletageUSD.length === 0) && (
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
    {selectedData &&
                        (GetRecuConfig === "Thermique" ? (
                            <RecuDepot data={selectedData} />
                        ) : GetRecuConfig === "A5" ? (
                            <RecuDepotA5 data={selectedData} />
                        ) : null)}

</div>
    );
};

export default Suspens;
