import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const Cloture = () => {
    const [disabled, setdisabled] = useState(false);
    const [isloading, setisloading] = useState(true);
    const [loading, setloading] = useState(false);
    const [showDateContainer, setshowDateContainer] = useState(false);
    const [dateWork, setDateWork] = useState("");
    const [Taux, setTaux] = useState("");
    const [usd, setusd] = useState(1);
    const [todayDate, settodayDate] = useState(new Date());
    const [isClosing, setisClosing] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setisloading(false);
        }, 1000);
        
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        setDateWork(formattedDate);
    }, []);

    const clotureBtn = async (e) => {
        setisClosing(true);
        e.preventDefault();
        const res = await axios.get("/eco/pages/cloture/journee");
        if (res.data.status == 1) {
            setdisabled(true);
            setisClosing(false);
            setshowDateContainer(true);
            Swal.fire({
                title: "Clôture de la journée",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
        } else {
            Swal.fire({
                title: "Clôture de la journée",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
            setisClosing(false);
        }
    };

    const OpenDayBtn = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/pages/cloture/openday/data", {});
        if (res.data.status == 1) {
            Swal.fire({
                title: "Date système",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
            document.getElementById("OpendayBtn")?.setAttribute("disabled", "disabled");
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Date système",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    const definirDate = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/pages/datesystem/definir", {
            dateWork,
            usd,
            Taux,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Date système",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Date système",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    const dateParser = (num) => {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        let timestamp = Date.parse(num);
        let date = new Date(timestamp).toLocaleDateString("fr-FR", options);
        return date.toString();
    };

    const actualiser = () => {
        location.reload();
    };

    if (isloading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Bars height="80" width="80" color="#20c997" ariaLabel="loading" />
                    <h5 className="mt-3 text-muted">Chargement...</h5>
                </div>
            </div>
        );
    }

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
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i className="fas fa-calendar-alt" style={{ fontSize: "28px", color: "white" }}></i>
                                    </div>
                                    <div>
                                        <h5 className="text-white fw-bold mb-0">Clôture de la journée</h5>
                                        <small className="text-white-50">Gestion des opérations quotidiennes</small>
                                    </div>
                                </div>
                                <button
                                    onClick={actualiser}
                                    className="btn"
                                    style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", border: "none" }}
                                >
                                    <i className="fas fa-sync-alt me-2"></i>Actualiser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isClosing && (
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
                    </div>
                </div>
            )}

            <div className="row g-4">
                {/* Colonne 1 - Actions de clôture */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-lock me-2"></i>Opérations quotidiennes
                            </h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex flex-column gap-3">
                                <button
                                    disabled={disabled}
                                    onClick={clotureBtn}
                                    className="btn py-3 fw-bold"
                                    style={{
                                        background: disabled ? "#adb5bd" : "linear-gradient(135deg, #dc3545, #b02a37)",
                                        color: "white",
                                        borderRadius: "12px",
                                        border: "none",
                                        fontSize: "16px",
                                        transition: "all 0.3s ease",
                                        cursor: disabled ? "not-allowed" : "pointer"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!disabled) {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(220,53,69,0.4)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!disabled) {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }
                                    }}
                                >
                                    <i className="fas fa-check-circle me-2"></i>
                                    Clôturer la journée
                                </button>

                                <button
                                    id="OpendayBtn"
                                    onClick={OpenDayBtn}
                                    className="btn py-3 fw-bold"
                                    style={{
                                        background: "linear-gradient(135deg, #28a745, #1e7e34)",
                                        color: "white",
                                        borderRadius: "12px",
                                        border: "none",
                                        fontSize: "16px",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(40,167,69,0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <i className="fas fa-unlock-alt me-2"></i>
                                    Ouvrir la journée
                                </button>

                                <button
                                    onClick={() => setshowDateContainer(true)}
                                    className="btn py-3 fw-bold"
                                    style={{
                                        background: "linear-gradient(135deg, #17a2b8, #138496)",
                                        color: "white",
                                        borderRadius: "12px",
                                        border: "none",
                                        fontSize: "16px",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(23,162,184,0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <i className="fas fa-calendar-plus me-2"></i>
                                    Définir la date N+1
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne 2 - Configuration date */}
                {showDateContainer && (
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                    <i className="fas fa-calendar-alt me-2"></i>Configuration date N+1
                                </h6>
                            </div>
                            <div className="card-body p-4">
                                <form>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold" style={{ color: "steelblue" }}>
                                            <i className="fas fa-percent me-2"></i>Taux (Facultatif)
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light" style={{ borderRadius: "10px 0 0 10px" }}>
                                                <i className="fas fa-chart-line"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ex: 2500"
                                                style={{ borderRadius: "0 10px 10px 0" }}
                                                onChange={(e) => setTaux(e.target.value)}
                                            />
                                        </div>
                                        <small className="text-muted mt-1 d-block">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Définissez le taux de conversion si nécessaire
                                        </small>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold" style={{ color: "steelblue" }}>
                                            <i className="fas fa-calendar-day me-2"></i>Date N+1
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light" style={{ borderRadius: "10px 0 0 10px" }}>
                                                <i className="fas fa-calendar"></i>
                                            </span>
                                            <input
                                                type="date"
                                                name="dateWork"
                                                id="dateWork"
                                                className="form-control"
                                                style={{ borderRadius: "0 10px 10px 0" }}
                                                value={dateWork}
                                                onChange={(e) => setDateWork(e.target.value)}
                                            />
                                        </div>
                                        <small className="text-muted mt-1 d-block">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Date d'ouverture de la prochaine journée
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        id="btnsaveDate"
                                        onClick={definirDate}
                                        className="btn w-100 py-3 fw-bold"
                                        style={{
                                            background: "linear-gradient(135deg, #20c997, #198764)",
                                            color: "white",
                                            borderRadius: "12px",
                                            border: "none",
                                            fontSize: "16px",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(32,201,151,0.3)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <i className="fas fa-save me-2"></i>
                                        Valider la configuration
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section des informations - Tableau récapitulatif */}
            {showDateContainer && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                    <i className="fas fa-chart-simple me-2"></i>Récapitulatif des dates
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ backgroundColor: "#e6f2f9" }}>
                                            <tr style={{ color: "steelblue" }}>
                                                <th>#</th>
                                                <th>Date à clôturer</th>
                                                <th>Date N+1</th>
                                                <th>Monnaie</th>
                                                <th>Taux du jour</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="fw-semibold">1</td>
                                                <td>{dateParser(todayDate)}</td>
                                                <td className="text-success fw-semibold">{dateWork}</td>
                                                <td>
                                                    <span className="badge bg-info">USD</span>
                                                </td>
                                                <td>{usd}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold">2</td>
                                                <td>{dateParser(todayDate)}</td>
                                                <td className="text-success fw-semibold">{dateWork}</td>
                                                <td>
                                                    <span className="badge bg-success">CDF</span>
                                                </td>
                                                <td>{Taux || "Non défini"}</td>
                                            </tr>
                                        </tbody>
                                     </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Message d'information */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="alert alert-info border-0" style={{ backgroundColor: "#e6f2f9", borderRadius: "12px" }}>
                        <div className="d-flex gap-3 align-items-center flex-wrap">
                            <i className="fas fa-lightbulb fa-2x" style={{ color: "#20c997" }}></i>
                            <div>
                                <strong className="text-dark">Informations importantes :</strong>
                                <ul className="mb-0 mt-1 ps-3">
                                    <li className="small text-muted">La clôture de journée est irréversible</li>
                                    <li className="small text-muted">Assurez-vous d'avoir effectué toutes les opérations avant de clôturer</li>
                                    <li className="small text-muted">La date N+1 déterminera l'ouverture de la prochaine journée</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cloture;