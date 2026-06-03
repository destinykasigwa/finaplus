import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";

const LoginForm = () => {
     const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState({
        name: "",
        password: "",
        Previouspassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [error, setError] = useState([]);
    const [expiredPassword, setExpiredPassword] = useState(false);
    const [SkipNow, setSkipNow] = useState();
    const [isLoading, setIsLoading] = useState(false);
     const [isSessionExpired, setSessionExpired] = useState(false);
    
    // États pour la visualisation des mots de passe (un par champ, fermés par défaut)
    const [showPassword, setShowPassword] = useState(false);
    const [showPreviousPassword, setShowPreviousPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const checkSessionExpiration = async () => {
            try {
                const res = await axios.get("/check-session-expiration");
                if (res.data.sessionExpired) {
                    console.log(res.data.requestedPageUrl);
                    const lastVisitedUrl = res.data.requestedPageUrl;
                    // La session de l'utilisateur a expiré
                    setSessionExpired(true);
                    // Stocker l'URL de la dernière page visitée dans le localStorage
                    localStorage.setItem("lastVisitedPage", lastVisitedUrl);
                    // console.log(window.location.pathname);
                } else {
                    // La session de l'utilisateur n'a pas expiré
                    setSessionExpired(false);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la vérification de l'expiration de la session :",
                    error,
                );
                // Gérer les erreurs de requête ici
            }
        };

        // Appeler la fonction pour vérifier l'expiration de la session au chargement du composant
        checkSessionExpiration();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/auth/login", user);
        if (res.data.status == 1) {
            console.log(res.data.data.reseted_password);
            if (res.data.data.reseted_password == 1) {
                // Rediriger immédiatement vers la page de réinitialisation
                navigate("/auth/reset-password");
                window.location.reload();
                return;
                // Arrêter l'exécution ici
            }
            // Stocker l'URL de la page actuelle dans le localStorage
            // localStorage.setItem("lastVisitedPage", window.location.pathname);
            const lastVisitedPage = localStorage.getItem("lastVisitedPage");
            if (lastVisitedPage && lastVisitedPage !== "null") {
                navigate(lastVisitedPage);
            } else {
                // S'il n'y a pas de dernière page visitée, rediriger vers la page d'accueil
                navigate("/eco/home");
            }
            window.location.reload();
        } else if (res.data.status == 0) {
            // Afficher un message d'erreur
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 10000,
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == "password_expired") {
            // Gérer l'expiration du mot de passe
            Swal.fire({
                title: "Expiration du mot de passe",
                text: res.data.msg,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Changer le mot de passe",
                denyButtonText: `Ignorer`,
            }).then((result) => {
                if (result.isConfirmed) {
                    // Rediriger vers la page de changement de mot de passe
                    setExpiredPassword(true);
                } else if (result.isDenied) {
                    // Ignorer la mise à jour du mot de passe et rediriger vers la page de connexion
                    navigate("/auth/skip-change-password");
                    window.location.reload();
                }
            });
        } else {
            setError(res.data.validate_error);
        }
    };

    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();
        const res = await axios.post("/auth/login/change-password", user);
        if (res.data.status == 1) {
            navigate("/eco/home");
            window.location.reload();
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 10000,
                // showCancelButton: true,
                // cancelButtonColor: "#d33",
                confirmButtonText: "Okay",
            });
        }
    };

    // Bouton désactivé si l'un des deux champs est vide
    const isDisabled = user.name.trim() === "" || user.password.trim() === "";
    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-overlay"></div>
            </div>

            <div className="login-wrapper">
                {expiredPassword == false ? (
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
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    <i
                                        className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                                    ></i>
                                </button>
                                {error.password && (
                                    <span className="error-message">
                                        {error.password}
                                    </span>
                                )}
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input disabled type="checkbox" /> Se souvenir de moi
                                </label>
                                <a
                                    href="/auth/forget-password"
                                    className="forgot-link"
                                >
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="login-button"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>{" "}
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-sign-in-alt"></i>{" "}
                                        Se connecter
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="login-card">
                        <div className="login-header">
                            <div className="logo-section">
                                <img
                                    src="/images/logo/logo.png"
                                    alt="FinaPlus"
                                    className="login-logo"
                                />
                            </div>
                            <h2 className="login-title">
                                Changement de mot de passe
                            </h2>
                            <p className="login-subtitle">
                                Votre mot de passe a expiré, veuillez en définir
                                un nouveau
                            </p>
                        </div>

                        <form
                            className="login-form"
                            onSubmit={handleSubmitChangePassword}
                        >
                            <div className="form-group">
                                <div className="input-icon">
                                    <i className="fas fa-key"></i>
                                </div>
                                <input
                                    type={showPreviousPassword ? "text" : "password"}
                                    className={`form-input ${error.Previouspassword ? "error" : ""}`}
                                    name="Previouspassword"
                                    value={user.Previouspassword}
                                    onChange={(e) =>
                                        setUser((p) => ({
                                            ...p,
                                            Previouspassword: e.target.value,
                                        }))
                                    }
                                    placeholder="Ancien mot de passe"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPreviousPassword(!showPreviousPassword)
                                    }
                                >
                                    <i
                                        className={`fas ${showPreviousPassword ? "fa-eye-slash" : "fa-eye"}`}
                                    ></i>
                                </button>
                                {error.Previouspassword && (
                                    <span className="error-message">
                                        {error.Previouspassword}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className={`form-input ${error.newPassword ? "error" : ""}`}
                                    name="newPassword"
                                    value={user.newPassword}
                                    onChange={(e) =>
                                        setUser((p) => ({
                                            ...p,
                                            newPassword: e.target.value,
                                        }))
                                    }
                                    placeholder="Nouveau mot de passe"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowNewPassword(!showNewPassword)
                                    }
                                >
                                    <i
                                        className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}
                                    ></i>
                                </button>
                                {error.newPassword && (
                                    <span className="error-message">
                                        {error.newPassword}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`form-input ${error.confirmNewPassword ? "error" : ""}`}
                                    name="confirmNewPassword"
                                    value={user.confirmNewPassword}
                                    onChange={(e) =>
                                        setUser((p) => ({
                                            ...p,
                                            confirmNewPassword: e.target.value,
                                        }))
                                    }
                                    placeholder="Confirmer le mot de passe"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                >
                                    <i
                                        className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                                    ></i>
                                </button>
                                {error.confirmNewPassword && (
                                    <span className="error-message">
                                        {error.confirmNewPassword}
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="login-button"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>{" "}
                                        Modification en cours...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i> Changer
                                        le mot de passe
                                    </>
                                )}
                            </button>

                            <div className="form-footer">
                                <a
                                    href="/auth/forget-password"
                                    className="forgot-link"
                                >
                                    J'ai oublié mon mot de passe
                                </a>
                            </div>
                        </form>
                    </div>
                )}
            </div>

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

                .login-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #024443;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
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

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #495057;
                    cursor: pointer;
                }

                .checkbox-label input {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: #b58932;
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

                .login-button {
                    background: linear-gradient(
                        135deg,
                        #b58932 0%,
                        #d4a143 100%
                    );
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

                .login-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(181, 137, 50, 0.3);
                    background: linear-gradient(
                        135deg,
                        #d4a143 0%,
                        #b58932 100%
                    );
                }

                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .form-footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                @media (max-width: 768px) {
                    .login-card {
                        padding: 30px 25px;
                    }

                    .login-title {
                        font-size: 24px;
                    }

                    .form-input {
                        padding: 12px 40px 12px 40px;
                    }
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 25px 20px;
                    }

                    .login-title {
                        font-size: 22px;
                    }

                    .form-options {
                        flex-direction: column;
                        gap: 10px;
                        align-items: flex-start;
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

                .login-card {
                    animation: fadeIn 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default LoginForm;