import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ResetPassWord = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        password: "",
        password_confirm: "",
    });

    // const [isValide, setIsValide] = useState(0);

    const [error, setError] = useState([]);
    const [getuserId, setGetuserId] = useState();
    const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [loading, setLoading] = useState(false);

// Fonctions pour la force du mot de passe
const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
};

const getPasswordStrengthLabel = (password) => {
    const strength = getPasswordStrength(password);
    if (strength === 0) return "Très faible";
    if (strength <= 2) return "Faible";
    if (strength <= 3) return "Moyen";
    if (strength <= 4) return "Fort";
    return "Très fort";
};

const getPasswordStrengthClass = (password) => {
    const strength = getPasswordStrength(password);
    if (strength === 0) return "bg-danger";
    if (strength <= 2) return "bg-warning";
    if (strength <= 3) return "bg-info";
    return "bg-success";
};

const getPasswordStrengthPercent = (password) => {
    const strength = getPasswordStrength(password);
    return (strength / 5) * 100;
};

    useEffect(() => {
        GetUser();
    }, []);

    const GetUser = async () => {
        const res = await axios.get("/auth/eco/pages/get-user");
        setGetuserId(res.data.userId);
    };
    //CREATE NEW PASSWORD
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/auth/resetpassword", {
            ...user, // Copie les valeurs actuelles de `user`
            userId: getuserId, // Ajoute `userId` à l'objet
        });
        if (res.data.status == 1) {
            navigate("/auth/login");
            window.location.reload();
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setError(res.data.validate_error);
        }
    };
    return (
      <>
      <style>
        {`
       
    .form-control:focus {
        border-color: #ffc107;
        box-shadow: 0 0 0 3px rgba(255,193,7,0.1);
        outline: none;
    }
    
    .btn:active {
        transform: scale(0.98);
    }
    
    @media (max-width: 768px) {
        .card-body {
            padding: 1.5rem !important;
        }
        
        .form-control-lg {
            font-size: 1rem;
            padding: 10px 16px 10px 40px;
        }
    }

        `}
      </style>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
    <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                {/* En-tête avec gradient */}
                <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                        width: "70px",
                        height: "70px",
                        background: "linear-gradient(135deg, #ffc107 0%, #ffb347 100%)",
                        borderRadius: "18px",
                        boxShadow: "0 8px 20px rgba(255,193,7,0.3)"
                    }}>
                        <i className="fas fa-key" style={{ fontSize: "32px", color: "white" }}></i>
                    </div>
                    <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                        Réinitialisation du mot de passe
                    </h2>
                    <p className="text-muted small mb-3">
                        Pour des raisons de sécurité, veuillez définir un nouveau mot de passe
                    </p>
                </div>

                {/* Corps du formulaire */}
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        {/* Nouveau mot de passe */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold small text-muted">
                                Nouveau mot de passe
                            </label>
                            <div className="position-relative">
                                <i className="fas fa-lock position-absolute top-50 start-0 translate-middle-y ms-3" style={{
                                    color: "#adb5bd",
                                    fontSize: "14px"
                                }}></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={user.password}
                                    onChange={(e) => setUser(p => ({ ...p, password: e.target.value }))}
                                    className="form-control form-control-lg ps-5 pe-5"
                                    style={{
                                        borderRadius: "12px",
                                        border: "1px solid #e9ecef",
                                        backgroundColor: "#f8f9fa",
                                        padding: "12px 16px 12px 40px",
                                        transition: "all 0.2s ease"
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#ffc107";
                                        e.currentTarget.style.backgroundColor = "white";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,193,7,0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e9ecef";
                                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                    placeholder="Entrez votre nouveau mot de passe"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0 text-muted"
                                    style={{ textDecoration: "none" }}
                                >
                                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                            {error.password && (
                                <small className="text-danger d-block mt-1">
                                    <i className="fas fa-exclamation-circle me-1"></i>
                                    {error.password}
                                </small>
                            )}
                        </div>

                        {/* Confirmation mot de passe */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold small text-muted">
                                Confirmer le mot de passe
                            </label>
                            <div className="position-relative">
                                <i className="fas fa-check-circle position-absolute top-50 start-0 translate-middle-y ms-3" style={{
                                    color: "#adb5bd",
                                    fontSize: "14px"
                                }}></i>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password_confirm"
                                    value={user.password_confirm}
                                    onChange={(e) => setUser(p => ({ ...p, password_confirm: e.target.value }))}
                                    className="form-control form-control-lg ps-5 pe-5"
                                    style={{
                                        borderRadius: "12px",
                                        border: "1px solid #e9ecef",
                                        backgroundColor: "#f8f9fa",
                                        padding: "12px 16px 12px 40px",
                                        transition: "all 0.2s ease"
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "#ffc107";
                                        e.currentTarget.style.backgroundColor = "white";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,193,7,0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "#e9ecef";
                                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                    placeholder="Confirmez votre nouveau mot de passe"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0 text-muted"
                                    style={{ textDecoration: "none" }}
                                >
                                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                            {error.password_confirm && (
                                <small className="text-danger d-block mt-1">
                                    <i className="fas fa-exclamation-circle me-1"></i>
                                    {error.password_confirm}
                                </small>
                            )}
                        </div>

                        {/* Indicateur de force du mot de passe */}
                        {user.password && (
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small className="text-muted">Force du mot de passe</small>
                                    <small className={`fw-semibold ${getPasswordStrengthClass(user.password)}`}>
                                        {getPasswordStrengthLabel(user.password)}
                                    </small>
                                </div>
                                <div className="progress" style={{ height: "4px", borderRadius: "2px" }}>
                                    <div 
                                        className={`progress-bar ${getPasswordStrengthClass(user.password)}`}
                                        style={{ width: `${getPasswordStrengthPercent(user.password)}%`, transition: "width 0.3s ease" }}
                                    ></div>
                                </div>
                                <small className="text-muted d-block mt-1">
                                    <i className="fas fa-info-circle me-1"></i>
                                    Minimum 8 caractères, avec lettres et chiffres
                                </small>
                            </div>
                        )}

                        {/* Bouton de changement */}
                        <button
                            type="submit"
                            className="btn w-100 py-3 fw-semibold"
                            style={{
                                background: "linear-gradient(135deg, #ffc107 0%, #ffb347 100%)",
                                color: "white",
                                borderRadius: "12px",
                                border: "none",
                                transition: "all 0.3s ease",
                                fontSize: "16px"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(255,193,7,0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Changement en cours...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>
                                    Changer le mot de passe
                                </>
                            )}
                        </button>

                        {/* Lien retour */}
                        <div className="text-center mt-4">
                            <a
                                href="/auth/login"
                                className="text-decoration-none small"
                                style={{
                                    color: "#ffc107",
                                    transition: "color 0.2s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#ffb347"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#ffc107"}
                            >
                                <i className="fas fa-arrow-left me-1"></i>
                                Retour à la connexion
                            </a>
                        </div>
                    </form>
                </div>

                {/* Footer de la carte */}
                <div className="card-footer bg-white border-0 pb-4 text-center">
                    <small className="text-muted">
                        <i className="fas fa-shield-alt me-1"></i>
                        Mot de passe sécurisé recommandé
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>
      </>
    );
};

export default ResetPassWord;
