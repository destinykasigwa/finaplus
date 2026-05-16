import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SkipPassword = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        password: "",
    });
    const [error, setError] = useState([]);
    const [showPassword, setShowPassword] = useState(false); // uniquement pour l'UI, aucune incidence sur la logique

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/auth/login/change-password/skip", user);
        if (res.data.status == 1) {
            navigate("/gestion_credit/home");
            window.location.reload();
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 10000,
                confirmButtonText: "Okay",
            });
        } else {
            setError(res.data.validate_error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-overlay"></div>
            </div>

            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-section">
                            <img
                                src="/images/logo/logo.png"
                                alt="FinaPlus"
                                className="login-logo"
                                style={{ borderRadius: "100px" }}
                            />
                        </div>
                        <p className="login-subtitle">
                            Connectez-vous pour accéder au tableau de bord
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-icon">
                                <i className="fas fa-user"></i>
                            </div>
                            <input
                                type="text"
                                className={`form-input ${error.name ? "error" : ""}`}
                                name="name"
                                value={user.name}
                                onChange={(e) =>
                                    setUser((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Nom d'utilisateur"
                            />
                            {error.name && (
                                <span className="error-message">
                                    {error.name}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <i className="fas fa-lock"></i>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={`form-input ${error.password ? "error" : ""}`}
                                name="password"
                                value={user.password}
                                onChange={(e) =>
                                    setUser((p) => ({
                                        ...p,
                                        password: e.target.value,
                                    }))
                                }
                                placeholder="Mot de passe"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </button>
                            {error.password && (
                                <span className="error-message">
                                    {error.password}
                                </span>
                            )}
                        </div>

                        <button type="submit" className="login-button">
                            <i className="fas fa-sign-in-alt"></i> Se connecter
                        </button>

                        <div className="form-footer">
                            <a href="/auth/forget-password" className="forgot-link">
                                J'ai oublié mon mot de passe
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            {/* Styles identiques à ceux de la page de connexion */}
            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    font-family:
                        "Inter",
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }

                .login-background {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        135deg,
                        #024443 0%,
                        #026d6c 50%,
                        #b58932 100%
                    );
                    z-index: 0;
                }

                .login-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("/images/bg-pattern.png") repeat;
                    opacity: 0.05;
                }

                .login-wrapper {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 480px;
                    padding: 20px;
                }

                .login-card {
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    border-radius: 32px;
                    padding: 40px 35px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transition:
                        transform 0.3s ease,
                        box-shadow 0.3s ease;
                    animation: fadeIn 0.6s ease-out;
                }

                .login-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 35px;
                }

                .logo-section {
                    margin-bottom: 20px;
                }

                .login-logo {
                    height: 70px;
                    width: auto;
                    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
                }

                .login-subtitle {
                    font-size: 14px;
                    color: #6c757d;
                    margin: 0;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-group {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #b58932;
                    font-size: 16px;
                    z-index: 1;
                }

                .form-input {
                    width: 100%;
                    padding: 14px 45px 14px 45px;
                    border: 2px solid #e9ecef;
                    border-radius: 16px;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    background: #fff;
                    font-family: inherit;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #b58932;
                    box-shadow: 0 0 0 4px rgba(181, 137, 50, 0.1);
                }

                .form-input.error {
                    border-color: #dc3545;
                }

                .error-message {
                    display: block;
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 5px;
                    margin-left: 5px;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6c757d;
                    font-size: 16px;
                    transition: color 0.3s;
                }

                .password-toggle:hover {
                    color: #b58932;
                }

                .login-button {
                    background: linear-gradient(135deg, #b58932 0%, #d4a143 100%);
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                }

                .login-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(181, 137, 50, 0.3);
                    background: linear-gradient(135deg, #d4a143 0%, #b58932 100%);
                }

                .form-footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .forgot-link {
                    color: #b58932;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: color 0.3s;
                }

                .forgot-link:hover {
                    color: #024443;
                    text-decoration: underline;
                }

                @media (max-width: 768px) {
                    .login-card {
                        padding: 30px 25px;
                    }
                    .form-input {
                        padding: 12px 40px 12px 40px;
                    }
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 25px 20px;
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default SkipPassword;