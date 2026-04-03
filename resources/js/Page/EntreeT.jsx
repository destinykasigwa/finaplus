// import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";

const EntreeT = () => {
    const [loading, setloading] = useState(false);
    const [devise, setDevise] = useState("CDF");
    const [getData, setGetdata] = useState();
    const [fetchInfo, setFetchInfo] = useState();
    const [fetchInfo2, setFetchInfo2] = useState();

    useEffect(() => {
        GetInformation();
    }, []);

    const GetInformation = async () => {
        const res = await axios.get(
            "/eco/page/entreT/get-billetage-caissier/delested"
        );
        if (res.data.status == 1) {
            setGetdata(res.data.data);
            setFetchInfo(res.data.billetageUSD);
            setFetchInfo2(res.data.billetageCDF);
            console.log(getData[0].centDollars);
        }
    };

    // const saveOperation = async (e) => {
    //     e.preventDefault();
    // };

    const SaveDelestageUSD = async (id) => {
        const question = confirm(
            "Voulez vous vraiment confirmer ce delestage ?"
        );
        if (question == true) {
            const res = await axios.post("/eco/page/accept-delestage-usd", {
                refDelestage: id,
            });
            if (res.data.status == 1) {
                Swal.fire({
                    title: "Succès",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
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

    const SaveDelestageCDF = async (id) => {
        const question = confirm(
            "Voulez vous vraiment confirmer ce delestage ?"
        );
        if (question == true) {
            const res = await axios.post("/eco/page/accept-delestage-cdf", {
                refDelestage: id,
            });
            if (res.data.status == 1) {
                Swal.fire({
                    title: "Succès",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
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

    const CuncelDelestageCDF = async (id) => {
        const question = confirm("Etes vous sûr de supprimer ce delestage ?");
        if (question == true) {
            const res = await axios.get(
                "/eco/page/delestage/remove-item-cdf/" + id
            );
            if (res.data.status == 1) {
                window.location.reload();
            }
        }
    };
    const CuncelDelestageUSD = async (id) => {
        const question = confirm("Etes vous sûr de supprimer ce delestage ?");
        if (question == true) {
            const res = await axios.get(
                "/eco/page/delestage/remove-item-usd/" + id
            );
            if (res.data.status == 1) {
                window.location.reload();
            }
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
    let compteur = 1;
    let compteur2 = 1;
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
                            <i className="fas fa-door-open" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Entrée Trésor</h5>
                            <small className="text-white-50">Gestion des entrées en trésorerie</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Section Sélection Devise */}
    <div className="row g-3 mb-4">
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-search me-2"></i>Sélection de la devise
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
                            </tbody>
                        </table>
                        <hr className="my-3" />
                    </form>
                </div>
            </div>
        </div>
    </div>

    {/* Section Billetage Disponible et Demandes de Délestage */}
    <div className="row g-3">
        {/* Billetage Disponible */}
        <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-money-bill me-2"></i>Billetage Disponible
                    </h6>
                </div>
                <div className="card-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {devise == "USD" ? (
                        fetchInfo && (
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead style={{ backgroundColor: "#e6f2f9" }}>
                                        <tr style={{ color: "steelblue" }}>
                                            <th>Coupure</th>
                                            <th>Nbr Billets</th>
                                            <th>Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "100", value: fetchInfo.centDollars, multiplier: 100 },
                                            { label: "50", value: fetchInfo.cinquanteDollars, multiplier: 50 },
                                            { label: "20", value: fetchInfo.vightDollars, multiplier: 20 },
                                            { label: "10", value: fetchInfo.dixDollars, multiplier: 10 },
                                            { label: "5", value: fetchInfo.cinqDollars, multiplier: 5 },
                                            { label: "1", value: fetchInfo.unDollars, multiplier: 1 }
                                        ].map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-semibold">{item.label} X</td>
                                                <td>{parseInt(item.value) || 0}</td>
                                                <td className="text-success">{(parseInt(item.value) * item.multiplier).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ backgroundColor: "#138496", color: "white" }}>
                                            <th colSpan="2">Total</th>
                                            <th className="fw-bold">
                                                {fetchInfo.montantUSD !== undefined && 
                                                    numberWithSpaces(parseInt(fetchInfo.montantUSD))}
                                            </th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )
                    ) : (
                        fetchInfo2 && (
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead style={{ backgroundColor: "#e6f2f9" }}>
                                        <tr style={{ color: "steelblue" }}>
                                            <th>Coupure</th>
                                            <th>Nbr Billets</th>
                                            <th>Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "20 000", value: fetchInfo2.vightMilleFranc, multiplier: 20000 },
                                            { label: "10 000", value: fetchInfo2.dixMilleFranc, multiplier: 10000 },
                                            { label: "5 000", value: fetchInfo2.cinqMilleFranc, multiplier: 5000 },
                                            { label: "1 000", value: fetchInfo2.milleFranc, multiplier: 1000 },
                                            { label: "500", value: fetchInfo2.cinqCentFranc, multiplier: 500 },
                                            { label: "200", value: fetchInfo2.deuxCentFranc, multiplier: 200 },
                                            { label: "100", value: fetchInfo2.centFranc, multiplier: 100 },
                                            { label: "50", value: fetchInfo2.cinquanteFanc, multiplier: 50 }
                                        ].map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-semibold">{item.label} X</td>
                                                <td>{parseInt(item.value) || 0}</td>
                                                <td className="text-success">{(parseInt(item.value) * item.multiplier).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ backgroundColor: "#20c997", color: "white" }}>
                                            <th colSpan="2">Total</th>
                                            <th className="fw-bold">
                                                {fetchInfo2.montantCDF !== undefined && 
                                                    numberWithSpaces(parseInt(fetchInfo2.montantCDF))}
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

        {/* Demandes de Délestage */}
        <div className="col-md-7">
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-list me-2"></i>Demandes de Délestage
                    </h6>
                </div>
                <div className="card-body">
                    {getData !== undefined && (
                        <>
                            {/* CDF */}
                            {getData.some(res => res.montantCDF > 0) && (
                                <>
                                    <div className="mb-3">
                                        <h5 className="fw-bold" style={{ color: "steelblue" }}>
                                            <i className="fas fa-chart-line me-2"></i>Délestage en CDF
                                        </h5>
                                    </div>
                                    <div className="table-responsive mb-4">
                                        <table className="table table-hover">
                                            <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>#</th>
                                                    <th>Nom caissier</th>
                                                    <th>Montant</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let compteur = 1;
                                                    return getData.map((res, index) => {
                                                        if (res.montantCDF > 0) {
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="fw-semibold">{compteur++}</td>
                                                                    <td>{res.NomDemandeur}</td>
                                                                    <td className="fw-bold text-success">{res.montantCDF?.toLocaleString()} CDF</td>
                                                                    <td>
                                                                        <div className="btn-group" role="group">
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                type="button"
                                                                                style={{ background: "#20c997", color: "white", borderRadius: "6px 0 0 6px" }}
                                                                                onClick={() => {
                                                                                    SaveDelestageCDF(res.id);
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-check-circle me-1"></i> Délester
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                type="button"
                                                                                style={{ background: "#dc3545", color: "white", borderRadius: "0 6px 6px 0" }}
                                                                                onClick={() => {
                                                                                    CuncelDelestageCDF(res.id);
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-times-circle me-1"></i> Réjeter
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                        return null;
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* USD */}
                            {getData.some(res => res.montantUSD > 0) && (
                                <>
                                    <div className="mb-3 mt-4">
                                        <h5 className="fw-bold" style={{ color: "steelblue" }}>
                                            <i className="fas fa-dollar-sign me-2"></i>Délestage en USD
                                        </h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                <tr style={{ color: "steelblue" }}>
                                                    <th>#</th>
                                                    <th>Nom caissier</th>
                                                    <th>Montant</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let compteur = 1;
                                                    return getData.map((res, index) => {
                                                        if (res.montantUSD > 0) {
                                                            return (
                                                                <tr key={index}>
                                                                    <td className="fw-semibold">{compteur++}</td>
                                                                    <td>{res.NomDemandeur}</td>
                                                                    <td className="fw-bold text-success">{res.montantUSD?.toLocaleString()} USD</td>
                                                                    <td>
                                                                        <div className="btn-group" role="group">
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                type="button"
                                                                                style={{ background: "#20c997", color: "white", borderRadius: "6px 0 0 6px" }}
                                                                                onClick={() => {
                                                                                    SaveDelestageUSD(res.id);
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-check-circle me-1"></i> Délester
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                type="button"
                                                                                style={{ background: "#dc3545", color: "white", borderRadius: "0 6px 6px 0" }}
                                                                                onClick={() => {
                                                                                    CuncelDelestageUSD(res.id);
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-times-circle me-1"></i> Réjeter
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                        return null;
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Message si aucune demande */}
                            {!getData.some(res => res.montantCDF > 0) && !getData.some(res => res.montantUSD > 0) && (
                                <div className="text-center py-5 text-muted">
                                    <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                    <p className="mb-0">Aucune demande de délestage en attente</p>
                                </div>
                            )}
                        </>
                    )}

                    {!getData && (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-spinner fa-3x mb-2 opacity-50"></i>
                            <p className="mb-0">Chargement des demandes...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
</div>
    );
};

export default EntreeT;
