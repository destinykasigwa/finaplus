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
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
     const [isSessionExpired, setSessionExpired] = useState(false);
    

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

    // useEffect(() => {
    //     const storedRequestedPage = localStorage.getItem("lastVisitedPage");
    //     if (storedRequestedPage && isSessionExpired) {
    //         // La session de l'utilisateur a expiré et une page protégée a été demandée précédemment
    //         navigate("/auth/login");
    //     }
    // }, [isSessionExpired]);

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
    // useEffect(() => {
    //     const storedRequestedPage = localStorage.getItem("lastVisitedPage");
    //     if (storedRequestedPage && isSessionExpired) {
    //         // La session de l'utilisateur a expiré et une page protégée a été demandée précédemment
    //         navigate("/auth/login");
    //     } else {
    //         navigate(storedRequestedPage);
    //         window.location.reload();
    //     }
    // }, [isSessionExpired]);

    // const handleSkipUpdatePassword = async (e) => {
    //     e.preventDefault();
    //     const res = await axios.post("/auth/login/change-password/skip", user);
    //     if (res.data.status == 1) {
    //         navigate("/");
    //         window.location.reload();
    //     } else if (res.data.status == 0) {
    //         Swal.fire({
    //             title: "Erreur",
    //             text: res.data.msg,
    //             icon: "error",
    //             timer: 6000,
    //             // showCancelButton: true,
    //             // cancelButtonColor: "#d33",
    //             confirmButtonText: "Okay",
    //         });
    //     }
    // };

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
                            {/* <h2 className="login-title">
                                {" "}
                                <strong
                                    style={{
                                        fontSize: "24px",
                                        background:
                                            "linear-gradient(135deg, #20c997, #198764)",
                                        WebkitBackgroundClip: "text",
                                        backgroundClip: "text",
                                        color: "#024443 0%,#026d6c 50%",
                                    }}    
                                >
                                    FinaPlus
                                </strong>
                            </h2> */}
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
                                    <input type="checkbox" /> Se souvenir de moi
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
                                    type="password"
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
                                    type="password"
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
                                    type="password"
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

// import styles from "../styles/RegisterForm.module.css";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";

// const LoginForm = () => {
//     const navigate = useNavigate();
//     const [user, setUser] = useState({
//         name: "",
//         password: "",
//         Previouspassword: "",
//         newPassword: "",
//         confirmNewPassword: "",
//     });
//     const [error, setError] = useState([]);
//     const [expiredPassword, setExpiredPassword] = useState(false);
//     const [isSessionExpired, setSessionExpired] = useState(false);
//     // Ajoutez cette ligne avec vos autres useState
//     const [showPassword, setShowPassword] = useState(false);

//     useEffect(() => {
//         const checkSessionExpiration = async () => {
//             try {
//                 const res = await axios.get("/check-session-expiration");
//                 if (res.data.sessionExpired) {
//                     console.log(res.data.requestedPageUrl);
//                     const lastVisitedUrl = res.data.requestedPageUrl;
//                     // La session de l'utilisateur a expiré
//                     setSessionExpired(true);
//                     // Stocker l'URL de la dernière page visitée dans le localStorage
//                     localStorage.setItem("lastVisitedPage", lastVisitedUrl);
//                     // console.log(window.location.pathname);
//                 } else {
//                     // La session de l'utilisateur n'a pas expiré
//                     setSessionExpired(false);
//                 }
//             } catch (error) {
//                 console.error(
//                     "Erreur lors de la vérification de l'expiration de la session :",
//                     error,
//                 );
//                 // Gérer les erreurs de requête ici
//             }
//         };

//         // Appeler la fonction pour vérifier l'expiration de la session au chargement du composant
//         checkSessionExpiration();
//     }, []);

//     // useEffect(() => {
//     //     const storedRequestedPage = localStorage.getItem("lastVisitedPage");
//     //     if (storedRequestedPage && isSessionExpired) {
//     //         // La session de l'utilisateur a expiré et une page protégée a été demandée précédemment
//     //         navigate("/auth/login");
//     //     }
//     // }, [isSessionExpired]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const res = await axios.post("/auth/login", user);
//         if (res.data.status == 1) {
//             console.log(res.data.data.reseted_password);
//             if (res.data.data.reseted_password == 1) {
//                 // Rediriger immédiatement vers la page de réinitialisation
//                 navigate("/auth/reset-password");
//                 window.location.reload();
//                 return;
//                 // Arrêter l'exécution ici
//             }
//             // Stocker l'URL de la page actuelle dans le localStorage
//             // localStorage.setItem("lastVisitedPage", window.location.pathname);
//             const lastVisitedPage = localStorage.getItem("lastVisitedPage");
//             if (lastVisitedPage && lastVisitedPage !== "null") {
//                 navigate(lastVisitedPage);
//             } else {
//                 // S'il n'y a pas de dernière page visitée, rediriger vers la page d'accueil
//                 navigate("/eco/home");
//             }
//             window.location.reload();
//         } else if (res.data.status == 0) {
//             // Afficher un message d'erreur
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 10000,
//                 confirmButtonText: "Okay",
//             });
//         } else if (res.data.status == "password_expired") {
//             // Gérer l'expiration du mot de passe
//             Swal.fire({
//                 title: "Expiration du mot de passe",
//                 text: res.data.msg,
//                 showDenyButton: true,
//                 showCancelButton: true,
//                 confirmButtonText: "Changer le mot de passe",
//                 denyButtonText: `Ignorer`,
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     // Rediriger vers la page de changement de mot de passe
//                     setExpiredPassword(true);
//                 } else if (result.isDenied) {
//                     // Ignorer la mise à jour du mot de passe et rediriger vers la page de connexion
//                     navigate("/auth/skip-change-password");
//                     window.location.reload();
//                 }
//             });
//         } else {
//             setError(res.data.validate_error);
//         }
//     };

//     const handleSubmitChangePassword = async (e) => {
//         e.preventDefault();
//         const res = await axios.post("/auth/login/change-password", user);
//         if (res.data.status == 1) {
//             navigate("/eco/home");
//             window.location.reload();
//         } else if (res.data.status == 0) {
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 10000,
//                 // showCancelButton: true,
//                 // cancelButtonColor: "#d33",
//                 confirmButtonText: "Okay",
//             });
//         }
//     };
//     // useEffect(() => {
//     //     const storedRequestedPage = localStorage.getItem("lastVisitedPage");
//     //     if (storedRequestedPage && isSessionExpired) {
//     //         // La session de l'utilisateur a expiré et une page protégée a été demandée précédemment
//     //         navigate("/auth/login");
//     //     } else {
//     //         navigate(storedRequestedPage);
//     //         window.location.reload();
//     //     }
//     // }, [isSessionExpired]);

//     // const handleSkipUpdatePassword = async (e) => {
//     //     e.preventDefault();
//     //     const res = await axios.post("/auth/login/change-password/skip", user);
//     //     if (res.data.status == 1) {
//     //         navigate("/");
//     //         window.location.reload();
//     //     } else if (res.data.status == 0) {
//     //         Swal.fire({
//     //             title: "Erreur",
//     //             text: res.data.msg,
//     //             icon: "error",
//     //             timer: 6000,
//     //             // showCancelButton: true,
//     //             // cancelButtonColor: "#d33",
//     //             confirmButtonText: "Okay",
//     //         });
//     //     }
//     // };

//     // Bouton désactivé si l'un des deux champs est vide
//     const isDisabled = user.name.trim() === "" || user.password.trim() === "";

//     return (
//         <div className="container-fluid p-0">
//     {expiredPassword == false ? (
//         <div className="row g-0 min-vh-100">
//             {/* Colonne gauche - Formulaire de connexion */}
//             <div
//                 className="col-lg-6 d-flex align-items-center justify-content-center"
//                 style={{
//                     background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
//                     position: "relative",
//                     overflow: "hidden",
//                 }}
//             >
//                 {/* Effets de fond décoratifs */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "-30%",
//                         right: "-20%",
//                         width: "80%",
//                         height: "100%",
//                         background: "radial-gradient(circle, rgba(32,201,151,0.08) 0%, transparent 70%)",
//                         borderRadius: "50%",
//                     }}
//                 ></div>
//                 <div
//                     style={{
//                         position: "absolute",
//                         bottom: "-20%",
//                         left: "-10%",
//                         width: "60%",
//                         height: "60%",
//                         background: "radial-gradient(circle, rgba(32,201,151,0.05) 0%, transparent 70%)",
//                         borderRadius: "50%",
//                     }}
//                 ></div>

//                 <div
//                     className="w-100 px-4 px-lg-5"
//                     style={{ maxWidth: "480px", zIndex: 2 }}
//                 >
//                     {/* Logo et titre */}
//                     <div className="text-center mb-5">
//                         <div
//                             className="d-inline-flex align-items-center justify-content-center mb-4"
//                             style={{
//                                 width: "80px",
//                                 height: "80px",
//                                 background: "linear-gradient(135deg, #20c997 0%, #198764 100%)",
//                                 borderRadius: "24px",
//                                 boxShadow: "0 15px 30px rgba(32,201,151,0.3)",
//                                 transition: "all 0.3s ease",
//                             }}
//                         >
//                             <i
//                                 className="fas fa-chart-line"
//                                 style={{ fontSize: "38px", color: "white" }}
//                             ></i>
//                         </div>
//                         <h1 className="fw-bold mb-2" style={{ color: "#1a2632", fontSize: "2.2rem" }}>
//                             Fina<span style={{ color: "#20c997" }}>Plus</span>
//                         </h1>
//                         <p className="text-muted mb-0">
//                             Plateforme de gestion de crédit
//                         </p>
//                     </div>

//                     {/* Formulaire */}
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-4">
//                             <label className="form-label fw-semibold text-secondary mb-2">
//                                 <i className="fas fa-user me-2"></i>
//                                 Nom d'utilisateur
//                             </label>
//                             <div className="position-relative">
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={user.name}
//                                     onChange={(e) =>
//                                         setUser((p) => ({
//                                             ...p,
//                                             name: e.target.value,
//                                         }))
//                                     }
//                                     className="form-control form-control-lg"
//                                     style={{
//                                         borderRadius: "16px",
//                                         border: "2px solid #e9ecef",
//                                         backgroundColor: "white",
//                                         padding: "14px 20px",
//                                         transition: "all 0.2s ease",
//                                         fontSize: "1rem",
//                                     }}
//                                     onFocus={(e) => {
//                                         e.currentTarget.style.borderColor = "#20c997";
//                                         e.currentTarget.style.boxShadow = "0 0 0 4px rgba(32,201,151,0.1)";
//                                     }}
//                                     onBlur={(e) => {
//                                         e.currentTarget.style.borderColor = "#e9ecef";
//                                         e.currentTarget.style.boxShadow = "none";
//                                     }}
//                                     placeholder="Entrez votre nom d'utilisateur"
//                                 />
//                             </div>
//                             {error.name && (
//                                 <small className="text-danger d-block mt-1">
//                                     <i className="fas fa-exclamation-circle me-1"></i>
//                                     {error.name}
//                                 </small>
//                             )}
//                         </div>

//                         <div className="mb-4">
//                             <div className="d-flex justify-content-between align-items-center mb-2">
//                                 <label className="form-label fw-semibold text-secondary mb-0">
//                                     <i className="fas fa-lock me-2"></i>
//                                     Mot de passe
//                                 </label>
//                                 <a
//                                     href="/auth/forget-password"
//                                     className="text-decoration-none small"
//                                     style={{ color: "#20c997", fontSize: "12px" }}
//                                 >
//                                     Mot de passe oublié ?
//                                 </a>
//                             </div>
//                             <div className="position-relative">
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     value={user.password}
//                                     onChange={(e) =>
//                                         setUser((p) => ({
//                                             ...p,
//                                             password: e.target.value,
//                                         }))
//                                     }
//                                     className="form-control form-control-lg"
//                                     style={{
//                                         borderRadius: "16px",
//                                         border: "2px solid #e9ecef",
//                                         backgroundColor: "white",
//                                         padding: "14px 50px 14px 20px",
//                                         transition: "all 0.2s ease",
//                                         fontSize: "1rem",
//                                     }}
//                                     onFocus={(e) => {
//                                         e.currentTarget.style.borderColor = "#20c997";
//                                         e.currentTarget.style.boxShadow = "0 0 0 4px rgba(32,201,151,0.1)";
//                                     }}
//                                     onBlur={(e) => {
//                                         e.currentTarget.style.borderColor = "#e9ecef";
//                                         e.currentTarget.style.boxShadow = "none";
//                                     }}
//                                     placeholder="Entrez votre mot de passe"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     style={{
//                                         position: "absolute",
//                                         right: "15px",
//                                         top: "50%",
//                                         transform: "translateY(-50%)",
//                                         background: "none",
//                                         border: "none",
//                                         color: "#adb5bd",
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
//                                 </button>
//                             </div>
//                             {error.password && (
//                                 <small className="text-danger d-block mt-1">
//                                     <i className="fas fa-exclamation-circle me-1"></i>
//                                     {error.password}
//                                 </small>
//                             )}
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={isDisabled}
//                             className="btn w-100 py-3 fw-bold"
//                             style={{
//                                 background: isDisabled
//                                     ? "#adb5bd"
//                                     : "linear-gradient(135deg, #20c997 0%, #198764 100%)",
//                                 color: "white",
//                                 borderRadius: "16px",
//                                 border: "none",
//                                 transition: "all 0.3s ease",
//                                 fontSize: "1rem",
//                                 letterSpacing: "0.5px",
//                                 cursor: isDisabled ? "not-allowed" : "pointer",
//                             }}
//                             onMouseEnter={(e) => {
//                                 if (!isDisabled) {
//                                     e.currentTarget.style.transform = "translateY(-2px)";
//                                     e.currentTarget.style.boxShadow = "0 8px 20px rgba(32,201,151,0.4)";
//                                 }
//                             }}
//                             onMouseLeave={(e) => {
//                                 if (!isDisabled) {
//                                     e.currentTarget.style.transform = "translateY(0)";
//                                     e.currentTarget.style.boxShadow = "none";
//                                 }
//                             }}
//                         >
//                             {/* {isDisabled ? (
//                                 <>
//                                     <span className="spinner-border spinner-border-sm me-2"></span>
//                                     Connexion...
//                                 </>
//                             ) : (
//                                 <>
//                                     <i className="fas fa-arrow-right-to-bracket me-2"></i>
//                                     Se connecter
//                                 </>
//                             )} */}
//                             Connexion
//                         </button>
//                     </form>

//                     {/* Footer */}
//                     <div className="text-center mt-5 pt-3">
//                         <small className="text-muted">
//                             <i className="fas fa-shield-alt me-1"></i>
//                             Connexion sécurisée
//                         </small>
//                     </div>
//                 </div>
//             </div>

//             {/* Colonne droite - Hero section */}
//             <div
//                 className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
//                 style={{
//                     background: "linear-gradient(135deg, #1a2632 0%, #0f1419 100%)",
//                     position: "relative",
//                     overflow: "hidden",
//                 }}
//             >
//                 {/* Effets de fond animés */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "10%",
//                         right: "10%",
//                         width: "300px",
//                         height: "300px",
//                         background: "radial-gradient(circle, rgba(32,201,151,0.2) 0%, transparent 70%)",
//                         borderRadius: "50%",
//                         animation: "pulse 4s ease-in-out infinite",
//                     }}
//                 ></div>
//                 <div
//                     style={{
//                         position: "absolute",
//                         bottom: "5%",
//                         left: "5%",
//                         width: "200px",
//                         height: "200px",
//                         background: "radial-gradient(circle, rgba(32,201,151,0.15) 0%, transparent 70%)",
//                         borderRadius: "50%",
//                         animation: "pulse 5s ease-in-out infinite reverse",
//                     }}
//                 ></div>

//                 <div className="text-center p-5" style={{ zIndex: 2, maxWidth: "500px" }}>
//                     <div className="mb-5">
//                         <div
//                             style={{
//                                 width: "120px",
//                                 height: "120px",
//                                 background: "rgba(32,201,151,0.15)",
//                                 borderRadius: "35px",
//                                 display: "inline-flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 backdropFilter: "blur(10px)",
//                                 marginBottom: "30px",
//                                 animation: "float 3s ease-in-out infinite",
//                             }}
//                         >
//                             <i
//                                 className="fas fa-hand-holding-usd"
//                                 style={{ fontSize: "55px", color: "#20c997" }}
//                             ></i>
//                         </div>
//                     </div>

//                     <h2 className="text-white fw-bold mb-4" style={{ fontSize: "2rem" }}>
//                         Gérez vos crédits<br />
//                         en toute simplicité
//                     </h2>

//                     <p className="text-white-50 mb-5" style={{ lineHeight: "1.6" }}>
//                         Accédez à votre tableau de bord pour suivre et gérer
//                         efficacement l'ensemble de vos opérations de crédit.
//                     </p>

//                     <div className="d-flex gap-4 justify-content-center">
//                         <div className="text-center">
//                             <div className="text-white fw-bold h3 mb-1">100%</div>
//                             <small className="text-white-50">Sécurisé</small>
//                         </div>
//                         <div className="text-center">
//                             <div className="text-white fw-bold h3 mb-1">24/7</div>
//                             <small className="text-white-50">Disponible</small>
//                         </div>
//                         <div className="text-center">
//                             <div className="text-white fw-bold h3 mb-1">Rapide</div>
//                             <small className="text-white-50">Performance</small>
//                         </div>
//                     </div>

//                     {/* Caractéristiques */}
//                     <div className="row mt-5 g-3">
//                         <div className="col-6">
//                             <div className="d-flex align-items-center gap-2">
//                                 <i className="fas fa-chart-line text-success"></i>
//                                 <span className="text-white-50 small">Suivi en temps réel</span>
//                             </div>
//                         </div>
//                         <div className="col-6">
//                             <div className="d-flex align-items-center gap-2">
//                                 <i className="fas fa-file-alt text-success"></i>
//                                 <span className="text-white-50 small">Rapports détaillés</span>
//                             </div>
//                         </div>
//                         <div className="col-6">
//                             <div className="d-flex align-items-center gap-2">
//                                 <i className="fas fa-bell text-success"></i>
//                                 <span className="text-white-50 small">Notifications</span>
//                             </div>
//                         </div>
//                         <div className="col-6">
//                             <div className="d-flex align-items-center gap-2">
//                                 <i className="fas fa-chart-pie text-success"></i>
//                                 <span className="text-white-50 small">Analyses avancées</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     ) : (
//         /* Formulaire de changement de mot de passe */
//         <div className="row g-0 min-vh-100">
//             <div className="col-lg-6 offset-lg-3 d-flex align-items-center justify-content-center py-5">
//                 <div className="w-100 px-4" style={{ maxWidth: "500px" }}>
//                     <div className="card border-0 shadow-xl rounded-4 overflow-hidden">
//                         <div className="card-header bg-white border-0 pt-5 pb-0 text-center">
//                             <div
//                                 className="d-inline-flex align-items-center justify-content-center mb-3"
//                                 style={{
//                                     width: "70px",
//                                     height: "70px",
//                                     background: "linear-gradient(135deg, #ffc107 0%, #ffb347 100%)",
//                                     borderRadius: "20px",
//                                     boxShadow: "0 8px 20px rgba(255,193,7,0.3)",
//                                 }}
//                             >
//                                 <i
//                                     className="fas fa-key"
//                                     style={{ fontSize: "32px", color: "white" }}
//                                 ></i>
//                             </div>
//                             <h3 className="fw-bold mb-1" style={{ color: "#1a2632" }}>
//                                 Changer de mot de passe
//                             </h3>
//                             <p className="text-muted small">
//                                 Pour des raisons de sécurité, veuillez définir un nouveau mot de passe
//                             </p>
//                         </div>

//                         <div className="card-body p-4 p-lg-5">
//                             <form onSubmit={handleSubmitChangePassword}>
//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold text-secondary mb-2">
//                                         <i className="fas fa-lock me-2"></i>
//                                         Ancien mot de passe
//                                     </label>
//                                     <input
//                                         type="password"
//                                         name="Previouspassword"
//                                         value={user.Previouspassword}
//                                         onChange={(e) =>
//                                             setUser((p) => ({
//                                                 ...p,
//                                                 Previouspassword: e.target.value,
//                                             }))
//                                         }
//                                         className="form-control form-control-lg"
//                                         style={{
//                                             borderRadius: "14px",
//                                             border: "2px solid #e9ecef",
//                                             padding: "12px 16px",
//                                             transition: "all 0.2s ease",
//                                         }}
//                                         onFocus={(e) => {
//                                             e.currentTarget.style.borderColor = "#ffc107";
//                                             e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,193,7,0.1)";
//                                         }}
//                                         onBlur={(e) => {
//                                             e.currentTarget.style.borderColor = "#e9ecef";
//                                             e.currentTarget.style.boxShadow = "none";
//                                         }}
//                                         placeholder="Entrez votre ancien mot de passe"
//                                     />
//                                     {error.Previouspassword && (
//                                         <small className="text-danger d-block mt-1">
//                                             <i className="fas fa-exclamation-circle me-1"></i>
//                                             {error.Previouspassword}
//                                         </small>
//                                     )}
//                                 </div>

//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold text-secondary mb-2">
//                                         <i className="fas fa-key me-2"></i>
//                                         Nouveau mot de passe
//                                     </label>
//                                     <input
//                                         type="password"
//                                         name="newPassword"
//                                         value={user.newPassword}
//                                         onChange={(e) =>
//                                             setUser((p) => ({
//                                                 ...p,
//                                                 newPassword: e.target.value,
//                                             }))
//                                         }
//                                         className="form-control form-control-lg"
//                                         style={{
//                                             borderRadius: "14px",
//                                             border: "2px solid #e9ecef",
//                                             padding: "12px 16px",
//                                             transition: "all 0.2s ease",
//                                         }}
//                                         onFocus={(e) => {
//                                             e.currentTarget.style.borderColor = "#ffc107";
//                                             e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,193,7,0.1)";
//                                         }}
//                                         onBlur={(e) => {
//                                             e.currentTarget.style.borderColor = "#e9ecef";
//                                             e.currentTarget.style.boxShadow = "none";
//                                         }}
//                                         placeholder="Entrez votre nouveau mot de passe"
//                                     />
//                                     {error.newPassword && (
//                                         <small className="text-danger d-block mt-1">
//                                             <i className="fas fa-exclamation-circle me-1"></i>
//                                             {error.newPassword}
//                                         </small>
//                                     )}
//                                 </div>

//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold text-secondary mb-2">
//                                         <i className="fas fa-check-circle me-2"></i>
//                                         Confirmer le mot de passe
//                                     </label>
//                                     <input
//                                         type="password"
//                                         name="confirmNewPassword"
//                                         value={user.confirmNewPassword}
//                                         onChange={(e) =>
//                                             setUser((p) => ({
//                                                 ...p,
//                                                 confirmNewPassword: e.target.value,
//                                             }))
//                                         }
//                                         className="form-control form-control-lg"
//                                         style={{
//                                             borderRadius: "14px",
//                                             border: "2px solid #e9ecef",
//                                             padding: "12px 16px",
//                                             transition: "all 0.2s ease",
//                                         }}
//                                         onFocus={(e) => {
//                                             e.currentTarget.style.borderColor = "#ffc107";
//                                             e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,193,7,0.1)";
//                                         }}
//                                         onBlur={(e) => {
//                                             e.currentTarget.style.borderColor = "#e9ecef";
//                                             e.currentTarget.style.boxShadow = "none";
//                                         }}
//                                         placeholder="Confirmez votre nouveau mot de passe"
//                                     />
//                                     {error.confirmNewPassword && (
//                                         <small className="text-danger d-block mt-1">
//                                             <i className="fas fa-exclamation-circle me-1"></i>
//                                             {error.confirmNewPassword}
//                                         </small>
//                                     )}
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     className="btn w-100 py-3 fw-bold"
//                                     style={{
//                                         background: "linear-gradient(135deg, #ffc107 0%, #ffb347 100%)",
//                                         color: "white",
//                                         borderRadius: "14px",
//                                         border: "none",
//                                         transition: "all 0.3s ease",
//                                         fontSize: "1rem",
//                                     }}
//                                     onMouseEnter={(e) => {
//                                         e.currentTarget.style.transform = "translateY(-2px)";
//                                         e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,193,7,0.4)";
//                                     }}
//                                     onMouseLeave={(e) => {
//                                         e.currentTarget.style.transform = "translateY(0)";
//                                         e.currentTarget.style.boxShadow = "none";
//                                     }}
//                                 >
//                                     <i className="fas fa-save me-2"></i>
//                                     Changer le mot de passe
//                                 </button>

//                                 <div className="text-center mt-4">
//                                     <a
//                                         href="/auth/forget-password"
//                                         className="text-decoration-none small"
//                                         style={{ color: "#ffc107" }}
//                                     >
//                                         <i className="fas fa-question-circle me-1"></i>
//                                         Mot de passe oublié ?
//                                     </a>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )}
//         </div>
//     );
// };

// export default LoginForm;
