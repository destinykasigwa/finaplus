import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Recuperation = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: "",
        password: "",
        password_confirm: "",
        code_recuperation: "",
    });
    const [isValide, setIsValide] = useState(0);
    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmitStep1 = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/auth/recuperation", user);
            if (res.data.status == 1) {
                setIsValide(1);
                Swal.fire({
                    title: "Code envoyé !",
                    text: "Un code de récupération a été envoyé à votre adresse email",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else if (res.data.status == 0) {
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg,
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#B58932",
                });
            } else {
                setError(res.data.validate_error);
            }
        } catch (error) {
            Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue",
                icon: "error",
                confirmButtonColor: "#B58932",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitStep2 = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/auth/recuperation-step-two", user);
            if (res.data.status == 1) {
                setIsValide(2);
                Swal.fire({
                    title: "Code valide !",
                    text: "Vous pouvez maintenant créer un nouveau mot de passe",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else if (res.data.status == 0) {
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg,
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#B58932",
                });
            } else {
                setError(res.data.validate_error);
            }
        } catch (error) {
            Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue",
                icon: "error",
                confirmButtonColor: "#B58932",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitStep3 = async (e) => {
        e.preventDefault();
        
        if (user.password !== user.password_confirm) {
            Swal.fire({
                title: "Erreur",
                text: "Les mots de passe ne correspondent pas",
                icon: "error",
                confirmButtonColor: "#B58932",
            });
            return;
        }
        
        setLoading(true);
        try {
            const res = await axios.post("/auth/recuperation-step-three", user);
            if (res.data.status == 1) {
                Swal.fire({
                    title: "Succès !",
                    text: "Votre mot de passe a été modifié avec succès",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setTimeout(() => {
                    navigate("/auth/login");
                    window.location.reload();
                }, 2000);
            } else if (res.data.status == 0) {
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg,
                    icon: "error",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#B58932",
                });
            } else {
                setError(res.data.validate_error);
            }
        } catch (error) {
            Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue",
                icon: "error",
                confirmButtonColor: "#B58932",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        if (isValide === 0) return "Récupération du mot de passe";
        if (isValide === 1) return "Vérification du code";
        return "Création du nouveau mot de passe";
    };

    const getStepSubtitle = () => {
        if (isValide === 0) return "Étape 1/3 - Saisissez votre adresse email";
        if (isValide === 1) return "Étape 2/3 - Entrez le code de récupération";
        return "Étape 3/3 - Créez votre nouveau mot de passe";
    };

    return (
       
         <div className="login-container">
            <div className="login-background">
                <div className="login-overlay"></div>
            </div>

            <div className="login-wrapper">
            <div style={{
                width: "100%",
                maxWidth: "500px"
            }}>
                <div style={{
                    background: "white",
                    borderRadius: "32px",
                    padding: "40px 35px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
                }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "35px" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <img 
                                src="/images/logo/logo.png" 
                                alt="FinaPlus" 
                                style={{ height: "70px", width: "auto",borderRadius:"100px" }}
                            />
                        </div>
                        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#024443", marginBottom: "8px" }}>
                            {getStepTitle()}
                        </h2>
                        <p style={{ fontSize: "14px", color: "#6c757d", margin: 0 }}>
                            {getStepSubtitle()}
                        </p>
                    </div>

                    {/* Step 1: Email */}
                    {isValide === 0 && (
                        <form onSubmit={handleSubmitStep1} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
                                    <i className="fas fa-envelope" style={{ color: "#B58932", marginRight: "8px" }}></i>
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: error.email ? "2px solid #dc3545" : "2px solid #e9ecef",
                                        borderRadius: "16px",
                                        fontSize: "14px",
                                        boxSizing: "border-box",
                                        transition: "all 0.3s"
                                    }}
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    placeholder="exemple@email.com"
                                />
                                {error.email && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "5px", display: "block" }}>{error.email}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: "linear-gradient(135deg, #B58932 0%, #d4a143 100%)",
                                    color: "white",
                                    border: "none",
                                    padding: "14px",
                                    borderRadius: "16px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    transition: "all 0.3s"
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane"></i>
                                        Envoyer le code
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Code de récupération */}
                    {isValide === 1 && (
                        <form onSubmit={handleSubmitStep2} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
                                    <i className="fas fa-key" style={{ color: "#B58932", marginRight: "8px" }}></i>
                                    Code de récupération
                                </label>
                                <input
                                    type="text"
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: error.code_recuperation ? "2px solid #dc3545" : "2px solid #e9ecef",
                                        borderRadius: "16px",
                                        fontSize: "14px",
                                        boxSizing: "border-box"
                                    }}
                                    value={user.code_recuperation}
                                    onChange={(e) => setUser({ ...user, code_recuperation: e.target.value })}
                                    placeholder="Entrez le code reçu par email"
                                />
                                {error.code_recuperation && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "5px", display: "block" }}>{error.code_recuperation}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: "linear-gradient(135deg, #B58932 0%, #d4a143 100%)",
                                    color: "white",
                                    border: "none",
                                    padding: "14px",
                                    borderRadius: "16px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px"
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Vérification...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle"></i>
                                        Vérifier le code
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Nouveau mot de passe */}
                    {isValide === 2 && (
                        <form onSubmit={handleSubmitStep3} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
                                    <i className="fas fa-lock" style={{ color: "#B58932", marginRight: "8px" }}></i>
                                    Nouveau mot de passe
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        style={{
                                            width: "100%",
                                            padding: "12px 45px 12px 16px",
                                            border: error.password ? "2px solid #dc3545" : "2px solid #e9ecef",
                                            borderRadius: "16px",
                                            fontSize: "14px",
                                            boxSizing: "border-box"
                                        }}
                                        value={user.password}
                                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                                        placeholder="Entrez votre nouveau mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#6c757d"
                                        }}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {error.password && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "5px", display: "block" }}>{error.password}</span>}
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
                                    <i className="fas fa-check-circle" style={{ color: "#B58932", marginRight: "8px" }}></i>
                                    Confirmer le mot de passe
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        style={{
                                            width: "100%",
                                            padding: "12px 45px 12px 16px",
                                            border: error.password_confirm ? "2px solid #dc3545" : "2px solid #e9ecef",
                                            borderRadius: "16px",
                                            fontSize: "14px",
                                            boxSizing: "border-box"
                                        }}
                                        value={user.password_confirm}
                                        onChange={(e) => setUser({ ...user, password_confirm: e.target.value })}
                                        placeholder="Confirmez votre nouveau mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: "absolute",
                                            right: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#6c757d"
                                        }}
                                    >
                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {error.password_confirm && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "5px", display: "block" }}>{error.password_confirm}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    background: "linear-gradient(135deg, #B58932 0%, #d4a143 100%)",
                                    color: "white",
                                    border: "none",
                                    padding: "14px",
                                    borderRadius: "16px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.7 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px"
                                }}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Modification en cours...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        Réinitialiser le mot de passe
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Lien retour */}
                    <div style={{ textAlign: "center", marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #e9ecef" }}>
                        <a href="/auth/login" style={{ color: "#B58932", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}>
                            <i className="fas fa-arrow-left"></i> Retour à la connexion
                        </a>
                    </div>
                </div>
            </div>
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

export default Recuperation;












































