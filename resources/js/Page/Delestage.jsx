import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuApproUSD from "./Modals/RecuApproUSD";
import RecuApproCDF from "./Modals/RecuApproCDF";
import RecuDelestageUSD from "./Modals/RecuDelestageUSD";
import RecuDelestageCDF from "./Modals/RecuDelestageCDF";

const Delestage = () => {
    const [loading, setloading] = useState(false);
    const [Montant, setMontant] = useState(0);
    const [devise, setDevise] = useState("CDF");
    const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [fetchInfo, setFetchInfo] = useState(false);
    const [getCaissierName, setGetCaissierName] = useState();
    const [fetchDailyOperationCDF, setFetchDailyOperationCDF] = useState();
    const [fetchDailyOperationUSD, setFetchDailyOperationUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        getLastestOperation();
    }, []);
    const getLastestOperation = async () => {
        const res = await axios.get(
            "/eco/pages/delestage/get-daily-operations"
        );
        if (res.data.status == 1) {
            setFetchDailyOperationCDF(res.data.dataCDF);
            setFetchDailyOperationUSD(res.data.dataUSD);
        }
        console.log(fetchDailyOperationCDF);
    };

    const saveOperation = (e) => {
        e.preventDefault();
        setloading(true);
        Swal.fire({
            title: "Confirmation !",
            text: "Etes vous sûr d'effectuer ce délestage ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui Délester!",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    "Confirmation!",
                    "Votre délestage est effectué avec succès.",
                    "success"
                ).then(function () {
                    setloading(false);
                    const res = axios.post("/eco/page/delestage/validation", {
                        devise: devise,
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
                });
            } else {
                setloading(false);
            }
        });
    };

    useEffect(() => {
        GetInformation();
    }, []);

    const GetInformation = async () => {
        const res = await axios.get(
            "/eco/page/delestage/get-billetage-caissier"
        );
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.billetageCDF[0]);
            setGetBilletageUSD(res.data.billetageUSD[0]);

            setFetchInfo(true);
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

    const handlePrintClick = (data) => {
        setSelectedData(data);
    };

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
                            <i className="fas fa-power-off" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Délestage</h5>
                            <small className="text-white-50">Clôture et délestage de la caisse</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {fetchInfo && (
        <>
            {/* Section Informations et Billetage */}
            <div className="row g-3 mb-4">
                {/* Informations */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
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
                                                    className="form-control"
                                                    style={{ borderRadius: "8px" }}
                                                    onChange={(e) => {
                                                        setDevise(e.target.value);
                                                    }}
                                                >
                                                    <option value="CDF">CDF</option>
                                                    <option value="USD">USD</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "8px" }}>
                                                <label style={{ color: "steelblue", fontWeight: "500" }}>Montant</label>
                                            </td>
                                            <td style={{ padding: "8px" }}>
                                                {devise == "USD" ? (
                                                    <input
                                                        id="Montant"
                                                        name="Montant"
                                                        type="text"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            backgroundColor: "#1a2632",
                                                            color: "white",
                                                            fontWeight: "bold",
                                                            fontSize: "20px",
                                                            textAlign: "right"
                                                        }}
                                                        onChange={(e) => setMontant(e.target.value)}
                                                        value={getBilletageUSD && numberWithSpaces(getBilletageUSD.sommeMontantUSD)}
                                                        disabled
                                                    />
                                                ) : (
                                                    <input
                                                        id="Montant"
                                                        name="Montant"
                                                        type="text"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            backgroundColor: "#1a2632",
                                                            color: "white",
                                                            fontWeight: "bold",
                                                            fontSize: "20px",
                                                            textAlign: "right"
                                                        }}
                                                        onChange={(e) => setMontant(e.target.value)}
                                                        value={getBilletageCDF && numberWithSpaces(getBilletageCDF.sommeMontantCDF)}
                                                        disabled
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Billetage Disponible */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-money-bill me-2"></i>Billetage Disponible
                            </h6>
                        </div>
                        <div className="card-body" style={{ maxHeight: "450px", overflowY: "auto" }}>
                            {devise == "USD" ? (
                                getBilletageUSD && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>Coupure</th>
                                                    <th>Nbr Billets</th>
                                                    <th>Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { label: "100", value: getBilletageUSD.centDollars, multiplier: 100 },
                                                    { label: "50", value: getBilletageUSD.cinquanteDollars, multiplier: 50 },
                                                    { label: "20", value: getBilletageUSD.vightDollars, multiplier: 20 },
                                                    { label: "10", value: getBilletageUSD.dixDollars, multiplier: 10 },
                                                    { label: "5", value: getBilletageUSD.cinqDollars, multiplier: 5 },
                                                    { label: "1", value: getBilletageUSD.unDollars, multiplier: 1 }
                                                ].map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-semibold">{item.label} X</td>
                                                        <td>{parseInt(item.value) || 0}</td>
                                                        <td className="text-success">{(parseInt(item.value) * item.multiplier).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ backgroundColor: "#6c757d", color: "white" }}>
                                                    <th colSpan="2">Total</th>
                                                    <th className="fw-bold">
                                                        {getBilletageUSD.sommeMontantUSD !== undefined && 
                                                            numberWithSpaces(parseInt(getBilletageUSD.sommeMontantUSD))}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )
                            ) : (
                                getBilletageCDF && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>Coupure</th>
                                                    <th>Nbr Billets</th>
                                                    <th>Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { label: "20 000", value: getBilletageCDF.vightMilleFranc, multiplier: 20000 },
                                                    { label: "10 000", value: getBilletageCDF.dixMilleFranc, multiplier: 10000 },
                                                    { label: "5 000", value: getBilletageCDF.cinqMilleFranc, multiplier: 5000 },
                                                    { label: "1 000", value: getBilletageCDF.milleFranc, multiplier: 1000 },
                                                    { label: "500", value: getBilletageCDF.cinqCentFranc, multiplier: 500 },
                                                    { label: "200", value: getBilletageCDF.deuxCentFranc, multiplier: 200 },
                                                    { label: "100", value: getBilletageCDF.centFranc, multiplier: 100 },
                                                    { label: "50", value: getBilletageCDF.cinquanteFanc, multiplier: 50 }
                                                ].map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-semibold">{item.label} X</td>
                                                        <td>{parseInt(item.value) || 0}</td>
                                                        <td className="text-success">{(parseInt(item.value) * item.multiplier).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ backgroundColor: "#6c757d", color: "white" }}>
                                                    <th colSpan="2">Total</th>
                                                    <th className="fw-bold">
                                                        {getBilletageCDF.sommeMontantCDF !== undefined && 
                                                            numberWithSpaces(parseInt(getBilletageCDF.sommeMontantCDF))}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Bouton Délestage */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body d-flex align-items-center justify-content-center">
                            {(getBilletageCDF !== undefined || getBilletageUSD !== undefined) && (
                                <button
                                    className="btn w-100 py-3 fw-bold"
                                    id="validerbtn"
                                    style={{
                                        background: "linear-gradient(135deg, #6c757d, #138496",
                                        border: "none",
                                        borderRadius: "12px",
                                        fontSize: "16px",
                                        color: "white",
                                        transition: "all 0.3s ease"
                                    }}
                                    onClick={saveOperation}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(108,117,125,0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-power-off me-2"}`}></i>
                                    Délester
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Séparateur décoratif */}
            <div className="position-relative my-4">
                <hr className="border-2" style={{ borderColor: "#e9ecef" }} />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    <i className="fas fa-history me-1"></i> Délestages récents
                </span>
            </div>

            {/* Historique des délestages */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-clock me-2"></i>Délestages récents
                            </h6>
                        </div>
                        <div className="card-body">
                            {/* CDF */}
                            {fetchDailyOperationCDF && fetchDailyOperationCDF.length > 0 && (
                                <>
                                    <div className="mb-3">
                                        <h5 className="fw-bold" style={{ color: "steelblue" }}>
                                            <i className="fas fa-chart-line me-2"></i>CDF
                                        </h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>Référence</th>
                                                    <th>Montant</th>
                                                    <th>Caissier</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fetchDailyOperationCDF.map((res, index) => (
                                                    <tr key={index}>
                                                        <td><small>{res.Reference}</small></td>
                                                        <td className="fw-bold text-danger">{res.montantCDF?.toLocaleString()}</td>
                                                        <td><small>{res.NomUtilisateur}</small></td>
                                                        <td>
                                                            <button
                                                                onClick={() => handlePrintClick(res)}
                                                                data-toggle="modal"
                                                                data-target="#modal-delestage-cdf"
                                                                className="btn btn-sm"
                                                                style={{ background: "#6c757d", color: "white", borderRadius: "6px", padding: "4px 12px" }}
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

                            {/* USD */}
                            {fetchDailyOperationUSD && fetchDailyOperationUSD.length > 0 && (
                                <>
                                    <div className="mb-3 mt-4">
                                        <h5 className="fw-bold" style={{ color: "steelblue" }}>
                                            <i className="fas fa-dollar-sign me-2"></i>USD
                                        </h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>Référence</th>
                                                    <th>Montant</th>
                                                    <th>Caissier</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fetchDailyOperationUSD.map((res, index) => (
                                                    <tr key={index}>
                                                        <td><small>{res.Reference}</small></td>
                                                        <td className="fw-bold text-danger">{res.montantUSD?.toLocaleString()}</td>
                                                        <td><small>{res.NomUtilisateur}</small></td>
                                                        <td>
                                                            <button
                                                                onClick={() => handlePrintClick(res)}
                                                                data-toggle="modal"
                                                                data-target="#modal-delestage-usd"
                                                                className="btn btn-sm"
                                                                style={{ background: "#6c757d", color: "white", borderRadius: "6px", padding: "4px 12px" }}
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

                            {(!fetchDailyOperationCDF || fetchDailyOperationCDF.length === 0) && 
                             (!fetchDailyOperationUSD || fetchDailyOperationUSD.length === 0) && (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                    <p className="mb-0">Aucun délestage récent</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )}
</div>
    );
};

export default Delestage;
