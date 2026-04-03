import styles from "../styles/RegisterForm.module.css";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        userName: "",
        email: "",
        confirmpassword: "",
        password: "",
    });
    const [error, setError] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/auth/regiter", user);
        if (res.data.status == 1) {
            // Swal.fire({
            //   title: "Succès",
            //   text:res.data.msg,
            //   icon: "success",
            //   timer: 3000,
            //   // showCancelButton: true,
            //   // cancelButtonColor: "#d33",
            //   confirmButtonText: "Okay",
            // });
            navigate("/auth/login");
            window.location.reload();
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                // showCancelButton: true,
                // cancelButtonColor: "#d33",
                confirmButtonText: "Okay",
            });
        } else {
            setError(res.data.validate_error);
            // Swal.fire({
            //   title: "Erreur",
            //   text:"Veuillez completer tous les champs",
            //   icon: "error",
            //   timer: 3000,
            //   // showCancelButton: true,
            //   // cancelButtonColor: "#d33",
            //   confirmButtonText: "Okay",
            // });
        }
    };

    return (
      <div
    className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3"
    style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    }}
>
    <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                {/* En-tête avec gradient */}
                <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
                    <div
                        className="d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                            width: "70px",
                            height: "70px",
                            background:
                                "linear-gradient(135deg, #20c997 0%, #198764 100%)",
                            borderRadius: "18px",
                            boxShadow:
                                "0 8px 20px rgba(32,201,151,0.3)",
                        }}
                    >
                        <i
                            className="fas fa-user-plus"
                            style={{ fontSize: "32px", color: "white" }}
                        ></i>
                    </div>
                    <h2
                        className="fw-bold mb-2"
                        style={{ color: "#2c3e50" }}
                    >
                        Créer un compte
                    </h2>
                    <p className="text-muted small mb-3">
                        Inscrivez-vous pour accéder à la plateforme
                    </p>
                </div>

                {/* Corps du formulaire */}
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <table style={{ width: "100%" }}>
                            <tbody>
                                {/* Nom d'utilisateur */}
                                <tr>
                                    <td style={{ paddingBottom: "8px" }}>
                                        <label className="form-label fw-semibold small text-muted">
                                            Nom d'utilisateur
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ paddingBottom: "24px" }}>
                                        <div className="position-relative">
                                            <i
                                                className="fas fa-user position-absolute top-50 start-0 translate-middle-y ms-3"
                                                style={{
                                                    color: "#adb5bd",
                                                    fontSize: "14px",
                                                }}
                                            ></i>
                                            <input
                                                type="text"
                                                name="userName"
                                                value={user.userName}
                                                onChange={(e) =>
                                                    setUser((p) => ({
                                                        ...p,
                                                        userName: e.target.value,
                                                    }))
                                                }
                                                className="form-control form-control-lg ps-5"
                                                style={{
                                                    borderRadius: "12px",
                                                    border: "1px solid #e9ecef",
                                                    backgroundColor: "#f8f9fa",
                                                    padding: "12px 16px 12px 40px",
                                                    transition: "all 0.2s ease",
                                                    width: "100%",
                                                }}
                                                onFocus={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#20c997";
                                                    e.currentTarget.style.backgroundColor =
                                                        "white";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 0 0 3px rgba(32,201,151,0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#e9ecef";
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f8f9fa";
                                                    e.currentTarget.style.boxShadow =
                                                        "none";
                                                }}
                                                placeholder="Entrez votre nom d'utilisateur"
                                            />
                                        </div>
                                        {error.userName && (
                                            <small className="text-danger d-block mt-1">
                                                {error.userName}
                                            </small>
                                        )}
                                    </td>
                                </tr>

                                {/* Email */}
                                <tr>
                                    <td style={{ paddingBottom: "8px" }}>
                                        <label className="form-label fw-semibold small text-muted">
                                            Adresse email
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ paddingBottom: "24px" }}>
                                        <div className="position-relative">
                                            <i
                                                className="fas fa-envelope position-absolute top-50 start-0 translate-middle-y ms-3"
                                                style={{
                                                    color: "#adb5bd",
                                                    fontSize: "14px",
                                                }}
                                            ></i>
                                            <input
                                                type="email"
                                                name="email"
                                                value={user.email}
                                                onChange={(e) =>
                                                    setUser((p) => ({
                                                        ...p,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                className="form-control form-control-lg ps-5"
                                                style={{
                                                    borderRadius: "12px",
                                                    border: "1px solid #e9ecef",
                                                    backgroundColor: "#f8f9fa",
                                                    padding: "12px 16px 12px 40px",
                                                    transition: "all 0.2s ease",
                                                    width: "100%",
                                                }}
                                                onFocus={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#20c997";
                                                    e.currentTarget.style.backgroundColor =
                                                        "white";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 0 0 3px rgba(32,201,151,0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#e9ecef";
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f8f9fa";
                                                    e.currentTarget.style.boxShadow =
                                                        "none";
                                                }}
                                                placeholder="exemple@email.com"
                                            />
                                        </div>
                                        {error.email && (
                                            <small className="text-danger d-block mt-1">
                                                {error.email}
                                            </small>
                                        )}
                                    </td>
                                </tr>

                                {/* Mot de passe */}
                                <tr>
                                    <td style={{ paddingBottom: "8px" }}>
                                        <label className="form-label fw-semibold small text-muted">
                                            Mot de passe
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ paddingBottom: "24px" }}>
                                        <div className="position-relative">
                                            <i
                                                className="fas fa-lock position-absolute top-50 start-0 translate-middle-y ms-3"
                                                style={{
                                                    color: "#adb5bd",
                                                    fontSize: "14px",
                                                }}
                                            ></i>
                                            <input
                                                type="password"
                                                name="password"
                                                value={user.password}
                                                onChange={(e) =>
                                                    setUser((p) => ({
                                                        ...p,
                                                        password: e.target.value,
                                                    }))
                                                }
                                                className="form-control form-control-lg ps-5"
                                                style={{
                                                    borderRadius: "12px",
                                                    border: "1px solid #e9ecef",
                                                    backgroundColor: "#f8f9fa",
                                                    padding: "12px 16px 12px 40px",
                                                    transition: "all 0.2s ease",
                                                    width: "100%",
                                                }}
                                                onFocus={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#20c997";
                                                    e.currentTarget.style.backgroundColor =
                                                        "white";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 0 0 3px rgba(32,201,151,0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#e9ecef";
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f8f9fa";
                                                    e.currentTarget.style.boxShadow =
                                                        "none";
                                                }}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {error.password && (
                                            <small className="text-danger d-block mt-1">
                                                {error.password}
                                            </small>
                                        )}
                                    </td>
                                </tr>

                                {/* Confirmation mot de passe */}
                                <tr>
                                    <td style={{ paddingBottom: "8px" }}>
                                        <label className="form-label fw-semibold small text-muted">
                                            Confirmer le mot de passe
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ paddingBottom: "24px" }}>
                                        <div className="position-relative">
                                            <i
                                                className="fas fa-check-circle position-absolute top-50 start-0 translate-middle-y ms-3"
                                                style={{
                                                    color: "#adb5bd",
                                                    fontSize: "14px",
                                                }}
                                            ></i>
                                            <input
                                                type="password"
                                                name="confirmpassword"
                                                value={user.confirmpassword}
                                                onChange={(e) =>
                                                    setUser((p) => ({
                                                        ...p,
                                                        confirmpassword:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="form-control form-control-lg ps-5"
                                                style={{
                                                    borderRadius: "12px",
                                                    border: "1px solid #e9ecef",
                                                    backgroundColor: "#f8f9fa",
                                                    padding: "12px 16px 12px 40px",
                                                    transition: "all 0.2s ease",
                                                    width: "100%",
                                                }}
                                                onFocus={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#20c997";
                                                    e.currentTarget.style.backgroundColor =
                                                        "white";
                                                    e.currentTarget.style.boxShadow =
                                                        "0 0 0 3px rgba(32,201,151,0.1)";
                                                }}
                                                onBlur={(e) => {
                                                    e.currentTarget.style.borderColor =
                                                        "#e9ecef";
                                                    e.currentTarget.style.backgroundColor =
                                                        "#f8f9fa";
                                                    e.currentTarget.style.boxShadow =
                                                        "none";
                                                }}
                                                placeholder="Confirmez votre mot de passe"
                                            />
                                        </div>
                                        {error.confirmpassword && (
                                            <small className="text-danger d-block mt-1">
                                                {error.confirmpassword}
                                            </small>
                                        )}
                                    </td>
                                </tr>

                                {/* Bouton d'inscription */}
                                <tr>
                                    <td>
                                        <button
                                            type="submit"
                                            className="btn w-100 py-3 fw-semibold"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #20c997 0%, #198764 100%)",
                                                color: "white",
                                                borderRadius: "12px",
                                                border: "none",
                                                transition: "all 0.2s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform =
                                                    "translateY(-2px)";
                                                e.currentTarget.style.boxShadow =
                                                    "0 6px 16px rgba(32,201,151,0.4)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform =
                                                    "translateY(0)";
                                                e.currentTarget.style.boxShadow =
                                                    "none";
                                            }}
                                        >
                                            <i className="fas fa-user-plus me-2"></i>
                                            S'inscrire
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Lien vers connexion */}
                        <div className="text-center mt-4">
                            <p className="small text-muted mb-0">
                                Vous avez déjà un compte ?
                                <a
                                    href="/auth/login"
                                    className="text-decoration-none ms-1 fw-semibold"
                                    style={{
                                        color: "#20c997",
                                        transition: "color 0.2s ease",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color =
                                            "#198764")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.color =
                                            "#20c997")
                                    }
                                >
                                    Se connecter
                                </a>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer de la carte */}
                <div className="card-footer bg-white border-0 pb-4 text-center">
                    <small className="text-muted">
                        <i className="fas fa-shield-alt me-1"></i>
                        Vos informations sont sécurisées
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>
    );
};

export default RegisterForm;
