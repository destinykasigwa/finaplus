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
    const [fetchDailyOperationCDF, setFetchDailyOperationCDF] = useState();
    const [fetchDailyOperationUSD, setFetchDailyOperationUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [delesteRealise, setDelesteRealise] = useState(false); // ← empêche de recliquer

    useEffect(() => {
        getLastestOperation();
        GetInformation();
    }, []);

    const getLastestOperation = async () => {
        const res = await axios.get("/eco/pages/delestage/get-daily-operations");
        if (res.data.status == 1) {
            setFetchDailyOperationCDF(res.data.dataCDF);
            setFetchDailyOperationUSD(res.data.dataUSD);
        }
    };

    const saveOperation = async (e) => {
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                setloading(false);
                const res = await axios.post("/eco/page/delestage/validation", {
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
                    // Rafraîchir les données (billetterie + historique)
                    getLastestOperation();
                    GetInformation();
                    // Marque que le délestage a été fait -> bouton désactivé
                    setDelesteRealise(true);
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
            } else {
                setloading(false);
            }
        });
    };

    const GetInformation = async () => {
        const res = await axios.get("/eco/page/delestage/get-billetage-caissier");
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.billetageCDF[0]);
            setGetBilletageUSD(res.data.billetageUSD[0]);
            setFetchInfo(true);
        }
    };

    function numberWithSpaces(x) {
        if (x === null || x === undefined) return "0.00";
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    const handlePrintClick = (data) => {
        setSelectedData(data);
    };

    return (
        <div className="container-fluid" style={{ marginTop: "20px", padding: "0 20px", maxWidth: "1400px" }}>
            {/* En-tête moderne amélioré */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-body p-4" style={{
                            background: "linear-gradient(135deg, #0b7285 0%, #138496 100%)",
                        }}>
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i className="fas fa-power-off" style={{ fontSize: "30px", color: "white" }}></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-1">Délestage</h5>
                                    <small className="text-white-50" style={{ letterSpacing: "0.5px" }}>Clôture et délestage de la caisse</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {fetchInfo && (
                <>
                    <div className="row g-4 mb-4">
                        {/* Carte Informations */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-header bg-white border-0 pt-3 px-4">
                                    <h6 className="fw-bold mb-0" style={{ color: "#0b7285" }}>
                                        <i className="fas fa-info-circle me-2"></i>Informations
                                    </h6>
                                </div>
                                <div className="card-body px-4">
                                    <div className="mb-3">
                                        <label className="form-label" style={{ color: "#0b7285", fontWeight: "500" }}>Devise</label>
                                        <select
                                            className="form-select rounded-3"
                                            onChange={(e) => setDevise(e.target.value)}
                                        >
                                            <option value="CDF">CDF</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label" style={{ color: "#0b7285", fontWeight: "500" }}>Montant</label>
                                        {devise === "USD" ? (
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                style={{
                                                    backgroundColor: "#f8f9fa",
                                                    fontWeight: "bold",
                                                    fontSize: "22px",
                                                    textAlign: "right",
                                                    color: "#0b7285",
                                                    border: "1px solid #dee2e6"
                                                }}
                                                value={getBilletageUSD?.sommeMontantUSD ? numberWithSpaces(getBilletageUSD.sommeMontantUSD) : ""}
                                                disabled
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                style={{
                                                    backgroundColor: "#f8f9fa",
                                                    fontWeight: "bold",
                                                    fontSize: "22px",
                                                    textAlign: "right",
                                                    color: "#0b7285",
                                                    border: "1px solid #dee2e6"
                                                }}
                                                value={getBilletageCDF?.sommeMontantCDF ? numberWithSpaces(getBilletageCDF.sommeMontantCDF) : ""}
                                                disabled
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billetage Disponible + Bouton : masqués après délestage réussi si les données sont vides */}
                        {(getBilletageCDF || getBilletageUSD) && !delesteRealise && (
                            <>
                                <div className="col-md-5">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-header bg-white border-0 pt-3 px-4">
                                            <h6 className="fw-bold mb-0" style={{ color: "#0b7285" }}>
                                                <i className="fas fa-money-bill-wave me-2"></i>Billetage Disponible
                                            </h6>
                                        </div>
                                        <div className="card-body px-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                            {devise === "USD" ? (
                                                getBilletageUSD && (
                                                    <div className="table-responsive">
                                                        <table className="table table-borderless table-sm align-middle">
                                                            <thead style={{ backgroundColor: "#e6f4f1" }}>
                                                                <tr style={{ color: "#0b7285" }}>
                                                                    <th>Coupure</th>
                                                                    <th className="text-center">Nbr Billets</th>
                                                                    <th className="text-end">Montant</th>
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
                                                                        <td className="text-center">{parseInt(item.value) || 0}</td>
                                                                        <td className="text-end text-success fw-bold">
                                                                            {(parseInt(item.value) * item.multiplier).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr style={{ backgroundColor: "#6c757d", color: "white" }}>
                                                                    <th colSpan="2" className="text-start ps-3">Total</th>
                                                                    <th className="text-end pe-3">
                                                                        {numberWithSpaces(parseInt(getBilletageUSD.sommeMontantUSD))}
                                                                    </th>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                )
                                            ) : (
                                                getBilletageCDF && (
                                                    <div className="table-responsive">
                                                        <table className="table table-borderless table-sm align-middle">
                                                            <thead style={{ backgroundColor: "#e6f4f1" }}>
                                                                <tr style={{ color: "#0b7285" }}>
                                                                    <th>Coupure</th>
                                                                    <th className="text-center">Nbr Billets</th>
                                                                    <th className="text-end">Montant</th>
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
                                                                        <td className="text-center">{parseInt(item.value) || 0}</td>
                                                                        <td className="text-end text-success fw-bold">
                                                                            {(parseInt(item.value) * item.multiplier).toLocaleString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr style={{ backgroundColor: "#6c757d", color: "white" }}>
                                                                    <th colSpan="2" className="text-start ps-3">Total</th>
                                                                    <th className="text-end pe-3">
                                                                        {numberWithSpaces(parseInt(getBilletageCDF.sommeMontantCDF))}
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

                                {/* Bouton Délester */}
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-body d-flex align-items-center justify-content-center">
                                            {(getBilletageCDF !== undefined || getBilletageUSD !== undefined) && (
                                                <button
                                                    className="btn w-100 py-3 fw-bold"
                                                    style={{
                                                        background: "linear-gradient(135deg, #0b7285, #0d9488)",
                                                        border: "none",
                                                        borderRadius: "12px",
                                                        fontSize: "17px",
                                                        color: "white",
                                                        transition: "all 0.3s ease",
                                                        boxShadow: "0 4px 12px rgba(11,114,133,0.3)"
                                                    }}
                                                    onClick={saveOperation}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "translateY(-2px)";
                                                        e.currentTarget.style.boxShadow = "0 6px 18px rgba(11,114,133,0.5)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "translateY(0)";
                                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(11,114,133,0.3)";
                                                    }}
                                                >
                                                    <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-power-off me-2"}`}></i>
                                                    Délester
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Si billetage vide après délestage ou premier chargement, on affiche un message (optionnel) */}
                        {(!getBilletageCDF && !getBilletageUSD) && !delesteRealise && fetchInfo && (
                            <div className="col-md-8">
                                <div className="card border-0 shadow-sm rounded-4 h-100">
                                    <div className="card-body d-flex align-items-center justify-content-center text-muted">
                                        <i className="fas fa-box-open me-3" style={{ fontSize: "4rem", opacity: 0.3 }}></i>
                                        <div>
                                            <h5 className="fw-bold mb-1">Aucun billetage disponible</h5>
                                            <p className="mb-0">Le caissier n'a pas encore de billetage ou le délestage a été effectué.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Séparateur décoratif */}
                    <div className="position-relative my-5">
                        <hr className="border-2" style={{ borderColor: "#e0e0e0" }} />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold rounded-pill shadow-sm">
                            <i className="fas fa-history me-1"></i> Délestages récents
                        </span>
                    </div>

                    {/* Historique des délestages */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-header bg-white border-0 pt-3 px-4">
                                    <h6 className="fw-bold mb-0" style={{ color: "#0b7285" }}>
                                        <i className="fas fa-clock me-2"></i>Délestages récents
                                    </h6>
                                </div>
                                <div className="card-body px-4">
                                    {fetchDailyOperationCDF && fetchDailyOperationCDF.length > 0 && (
                                        <>
                                            <div className="mb-3">
                                                <h5 className="fw-bold" style={{ color: "#0b7285" }}>
                                                    <i className="fas fa-chart-line me-2"></i>CDF
                                                </h5>
                                            </div>
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
                                                        {fetchDailyOperationCDF.map((res, index) => (
                                                            <tr key={index}>
                                                                <td><small className="text-muted">{res.Reference}</small></td>
                                                                <td className="fw-bold text-danger">{res.montantCDF?.toLocaleString()}</td>
                                                                <td><small>{res.NomUtilisateur}</small></td>
                                                                <td className="text-end">
                                                                    <button
                                                                        onClick={() => handlePrintClick(res)}
                                                                        data-toggle="modal"
                                                                        data-target="#modal-delestage-cdf"
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

                                    {fetchDailyOperationUSD && fetchDailyOperationUSD.length > 0 && (
                                        <>
                                            <div className="mb-3 mt-4">
                                                <h5 className="fw-bold" style={{ color: "#0b7285" }}>
                                                    <i className="fas fa-dollar-sign me-2"></i>USD
                                                </h5>
                                            </div>
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
                                                        {fetchDailyOperationUSD.map((res, index) => (
                                                            <tr key={index}>
                                                                <td><small className="text-muted">{res.Reference}</small></td>
                                                                <td className="fw-bold text-danger">{res.montantUSD?.toLocaleString()}</td>
                                                                <td><small>{res.NomUtilisateur}</small></td>
                                                                <td className="text-end">
                                                                    <button
                                                                        onClick={() => handlePrintClick(res)}
                                                                        data-toggle="modal"
                                                                        data-target="#modal-delestage-usd"
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

                                    {(!fetchDailyOperationCDF || fetchDailyOperationCDF.length === 0) &&
                                     (!fetchDailyOperationUSD || fetchDailyOperationUSD.length === 0) && (
                                        <div className="text-center py-5 text-muted">
                                            <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0 fw-bold">Aucun délestage récent</p>
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