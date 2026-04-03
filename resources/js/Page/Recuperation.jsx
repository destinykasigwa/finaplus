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
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #024443 0%, #026d6c 50%, #B58932 100%)",
            fontFamily: "'Inter', sans-serif",
            padding: "20px"
        }}>
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
    );
};

export default Recuperation;













































// import styles from "../styles/RegisterForm.module.css";
// import { useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";

// const Recuperation = () => {
//     const navigate = useNavigate();
//     const [user, setUser] = useState({
//         email: "",
//         password: "",
//         password_confirm: "",
//         code_recuperation: "",
//     });
//     const [isValide, setIsValide] = useState(0);

//     const [error, setError] = useState([]);
//     const handleSubmitStep1 = async (e) => {
//         e.preventDefault();
//         //CHECK IF EMAIL IS CORRECT STEP 1
//         const res = await axios.post("/auth/recuperation", user);
//         if (res.data.status == 1) {
//             setIsValide(1);
//             // navigate('/auth/forget-password')
//             // window.location.reload()
//         } else if (res.data.status == 0) {
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 3000,
//                 // showCancelButton: true,
//                 // cancelButtonColor: "#d33",
//                 confirmButtonText: "Okay",
//             });
//         } else {
//             setError(res.data.validate_error);
//         }
//     };
//     //CHECK THE SENT CODE IF IS CORRECT
//     const handleSubmitStep2 = async (e) => {
//         e.preventDefault();
//         const res = await axios.post("/auth/recuperation-step-two", user);
//         if (res.data.status == 1) {
//             setIsValide(2);
//             // navigate('/auth/login')
//             // window.location.reload()
//         } else if (res.data.status == 0) {
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 3000,
//                 // showCancelButton: true,
//                 // cancelButtonColor: "#d33",
//                 confirmButtonText: "Okay",
//             });
//         } else {
//             setError(res.data.validate_error);
//             // Swal.fire({
//             //   title: "Erreur",
//             //   text:"Veuillez completer tous les champs",
//             //   icon: "error",
//             //   timer: 3000,
//             //   // showCancelButton: true,
//             //   // cancelButtonColor: "#d33",
//             //   confirmButtonText: "Okay",
//             // });
//         }
//     };

//     //CREATE NEW PASSWORD
//     const handleSubmitStep3 = async (e) => {
//         e.preventDefault();
//         const res = await axios.post("/auth/recuperation-step-three", user);
//         if (res.data.status == 1) {
//             setIsValide(2);
//             navigate("/auth/login");
//             window.location.reload();
//         } else if (res.data.status == 0) {
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 3000,
//                 // showCancelButton: true,
//                 // cancelButtonColor: "#d33",
//                 confirmButtonText: "Okay",
//             });
//         } else {
//             setError(res.data.validate_error);
//         }
//     };

//     return (
//         <div
//             className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3"
//             style={{
//                 background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
//             }}
//         >
//             <div className="row w-100 justify-content-center">
//                 <div className="col-md-6 col-lg-5">
//                     {/* Étape 1 : Saisie de l'email */}
//                     {isValide == 0 && (
//                         <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
//                             <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
//                                 <div
//                                     className="d-inline-flex align-items-center justify-content-center mb-3"
//                                     style={{
//                                         width: "70px",
//                                         height: "70px",
//                                         background:
//                                             "linear-gradient(135deg, #ffc107 0%, #ffb347 100%)",
//                                         borderRadius: "18px",
//                                         boxShadow:
//                                             "0 8px 20px rgba(255,193,7,0.3)",
//                                     }}
//                                 >
//                                     <i
//                                         className="fas fa-key"
//                                         style={{
//                                             fontSize: "32px",
//                                             color: "white",
//                                         }}
//                                     ></i>
//                                 </div>
//                                 <h2
//                                     className="fw-bold mb-2"
//                                     style={{ color: "#2c3e50" }}
//                                 >
//                                     Récupération du mot de passe
//                                 </h2>
//                                 <p className="text-muted small mb-3">
//                                     Étape 1/3 - Saisissez votre adresse email
//                                 </p>
//                                 <div className="d-flex justify-content-center gap-2 mb-3">
//                                     <span
//                                         className="badge bg-warning rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         Étape 1
//                                     </span>
//                                     <span
//                                         className="badge bg-light text-muted rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         Étape 2
//                                     </span>
//                                     <span
//                                         className="badge bg-light text-muted rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         Étape 3
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="card-body p-4">
//                                 <form onSubmit={handleSubmitStep1}>
//                                     <div className="mb-4">
//                                         <label className="form-label fw-semibold small text-muted">
//                                             Adresse email
//                                         </label>
//                                         <div className="position-relative">
//                                             <i
//                                                 className="fas fa-envelope position-absolute top-50 start-0 translate-middle-y ms-3"
//                                                 style={{
//                                                     color: "#adb5bd",
//                                                     fontSize: "14px",
//                                                 }}
//                                             ></i>
//                                             <input
//                                                 type="email"
//                                                 name="email"
//                                                 value={user.email}
//                                                 onChange={(e) =>
//                                                     setUser((p) => ({
//                                                         ...p,
//                                                         email: e.target.value,
//                                                     }))
//                                                 }
//                                                 className="form-control form-control-lg ps-5"
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     border: "1px solid #e9ecef",
//                                                     backgroundColor: "#f8f9fa",
//                                                     padding:
//                                                         "12px 16px 12px 40px",
//                                                     transition: "all 0.2s ease",
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#ffc107";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "white";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "0 0 0 3px rgba(255,193,7,0.1)";
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#e9ecef";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "#f8f9fa";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "none";
//                                                 }}
//                                                 placeholder="exemple@email.com"
//                                             />
//                                         </div>
//                                         {error.email && (
//                                             <small className="text-danger d-block mt-1">
//                                                 {error.email}
//                                             </small>
//                                         )}
//                                     </div>

//                                     <button
//                                         type="submit"
//                                         className="btn w-100 py-3 fw-semibold"
//                                         style={{
//                                             background:
//                                                 "linear-gradient(135deg, #ffc107 0%, #ffb347 100%)",
//                                             color: "white",
//                                             borderRadius: "12px",
//                                             border: "none",
//                                             transition: "all 0.2s ease",
//                                         }}
//                                         onMouseEnter={(e) => {
//                                             e.currentTarget.style.transform =
//                                                 "translateY(-2px)";
//                                             e.currentTarget.style.boxShadow =
//                                                 "0 6px 16px rgba(255,193,7,0.4)";
//                                         }}
//                                         onMouseLeave={(e) => {
//                                             e.currentTarget.style.transform =
//                                                 "translateY(0)";
//                                             e.currentTarget.style.boxShadow =
//                                                 "none";
//                                         }}
//                                     >
//                                         <i className="fas fa-paper-plane me-2"></i>
//                                         Envoyer le code
//                                     </button>

//                                     <div className="text-center mt-4">
//                                         <a
//                                             href="/auth/login"
//                                             className="text-decoration-none small d-inline-flex align-items-center gap-1"
//                                             style={{
//                                                 color: "#6c757d",
//                                                 transition: "color 0.2s ease",
//                                             }}
//                                             onMouseEnter={(e) =>
//                                                 (e.currentTarget.style.color =
//                                                     "#ffc107")
//                                             }
//                                             onMouseLeave={(e) =>
//                                                 (e.currentTarget.style.color =
//                                                     "#6c757d")
//                                             }
//                                         >
//                                             <i className="fas fa-arrow-left me-1"></i>
//                                             Retour à la connexion
//                                         </a>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     )}

//                     {/* Étape 2 : Saisie du code de récupération */}
//                     {isValide == 1 && (
//                         <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
//                             <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
//                                 <div
//                                     className="d-inline-flex align-items-center justify-content-center mb-3"
//                                     style={{
//                                         width: "70px",
//                                         height: "70px",
//                                         background:
//                                             "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
//                                         borderRadius: "18px",
//                                         boxShadow:
//                                             "0 8px 20px rgba(23,162,184,0.3)",
//                                     }}
//                                 >
//                                     <i
//                                         className="fas fa-envelope-open-text"
//                                         style={{
//                                             fontSize: "32px",
//                                             color: "white",
//                                         }}
//                                     ></i>
//                                 </div>
//                                 <h2
//                                     className="fw-bold mb-2"
//                                     style={{ color: "#2c3e50" }}
//                                 >
//                                     Vérification du code
//                                 </h2>
//                                 <p className="text-muted small mb-3">
//                                     Étape 2/3 - Saisissez le code reçu par email
//                                 </p>
//                                 <div className="d-flex justify-content-center gap-2 mb-3">
//                                     <span
//                                         className="badge bg-success rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         ✓ Étape 1
//                                     </span>
//                                     <span
//                                         className="badge bg-info text-white rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         Étape 2
//                                     </span>
//                                     <span
//                                         className="badge bg-light text-muted rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         Étape 3
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="card-body p-4">
//                                 <form onSubmit={handleSubmitStep2}>
//                                     <div className="mb-4">
//                                         <label className="form-label fw-semibold small text-muted">
//                                             Code de récupération
//                                         </label>
//                                         <div className="position-relative">
//                                             <i
//                                                 className="fas fa-qrcode position-absolute top-50 start-0 translate-middle-y ms-3"
//                                                 style={{
//                                                     color: "#adb5bd",
//                                                     fontSize: "14px",
//                                                 }}
//                                             ></i>
//                                             <input
//                                                 type="text"
//                                                 name="code_recuperation"
//                                                 value={user.code_recuperation}
//                                                 onChange={(e) =>
//                                                     setUser((p) => ({
//                                                         ...p,
//                                                         code_recuperation:
//                                                             e.target.value,
//                                                     }))
//                                                 }
//                                                 className="form-control form-control-lg ps-5"
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     border: "1px solid #e9ecef",
//                                                     backgroundColor: "#f8f9fa",
//                                                     padding:
//                                                         "12px 16px 12px 40px",
//                                                     transition: "all 0.2s ease",
//                                                     textAlign: "center",
//                                                     letterSpacing: "4px",
//                                                     fontSize: "18px",
//                                                     fontWeight: "bold",
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#17a2b8";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "white";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "0 0 0 3px rgba(23,162,184,0.1)";
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#e9ecef";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "#f8f9fa";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "none";
//                                                 }}
//                                                 placeholder="••••••"
//                                                 maxLength="6"
//                                             />
//                                         </div>
//                                         {error.code_recuperation && (
//                                             <small className="text-danger d-block mt-1">
//                                                 {error.code_recuperation}
//                                             </small>
//                                         )}
//                                         <small className="text-muted d-block mt-2">
//                                             <i className="fas fa-info-circle me-1"></i>
//                                             Un code à 6 chiffres a été envoyé à
//                                             votre adresse email
//                                         </small>
//                                     </div>

//                                     <button
//                                         type="submit"
//                                         className="btn w-100 py-3 fw-semibold"
//                                         style={{
//                                             background:
//                                                 "linear-gradient(135deg, #17a2b8 0%, #138496 100%)",
//                                             color: "white",
//                                             borderRadius: "12px",
//                                             border: "none",
//                                             transition: "all 0.2s ease",
//                                         }}
//                                         onMouseEnter={(e) => {
//                                             e.currentTarget.style.transform =
//                                                 "translateY(-2px)";
//                                             e.currentTarget.style.boxShadow =
//                                                 "0 6px 16px rgba(23,162,184,0.4)";
//                                         }}
//                                         onMouseLeave={(e) => {
//                                             e.currentTarget.style.transform =
//                                                 "translateY(0)";
//                                             e.currentTarget.style.boxShadow =
//                                                 "none";
//                                         }}
//                                     >
//                                         <i className="fas fa-check-circle me-2"></i>
//                                         Vérifier le code
//                                     </button>

//                                     <div className="text-center mt-4">
//                                         <a
//                                             href="/auth/login"
//                                             className="text-decoration-none small d-inline-flex align-items-center gap-1"
//                                             style={{
//                                                 color: "#6c757d",
//                                                 transition: "color 0.2s ease",
//                                             }}
//                                             onMouseEnter={(e) =>
//                                                 (e.currentTarget.style.color =
//                                                     "#17a2b8")
//                                             }
//                                             onMouseLeave={(e) =>
//                                                 (e.currentTarget.style.color =
//                                                     "#6c757d")
//                                             }
//                                         >
//                                             <i className="fas fa-arrow-left me-1"></i>
//                                             Retour à la connexion
//                                         </a>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     )}

//                     {/* Étape 3 : Nouveau mot de passe */}
//                     {isValide == 2 && (
//                         <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
//                             <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
//                                 <div
//                                     className="d-inline-flex align-items-center justify-content-center mb-3"
//                                     style={{
//                                         width: "70px",
//                                         height: "70px",
//                                         background:
//                                             "linear-gradient(135deg, #20c997 0%, #198764 100%)",
//                                         borderRadius: "18px",
//                                         boxShadow:
//                                             "0 8px 20px rgba(32,201,151,0.3)",
//                                     }}
//                                 >
//                                     <i
//                                         className="fas fa-lock"
//                                         style={{
//                                             fontSize: "32px",
//                                             color: "white",
//                                         }}
//                                     ></i>
//                                 </div>
//                                 <h2
//                                     className="fw-bold mb-2"
//                                     style={{ color: "#2c3e50" }}
//                                 >
//                                     Nouveau mot de passe
//                                 </h2>
//                                 <p className="text-muted small mb-3">
//                                     Étape 3/3 - Créez votre nouveau mot de passe
//                                 </p>
//                                 <div className="d-flex justify-content-center gap-2 mb-3">
//                                     <span
//                                         className="badge bg-success rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         ✓ Étape 1
//                                     </span>
//                                     <span
//                                         className="badge bg-success rounded-pill px-3 py-2"
//                                         style={{ fontSize: "12px" }}
//                                     >
//                                         ✓ Étape 2
//                                     </span>
//                                     <span
//                                         className="badge bg-teal text-white rounded-pill px-3 py-2"
//                                         style={{
//                                             fontSize: "12px",
//                                             backgroundColor: "#20c997",
//                                         }}
//                                     >
//                                         Étape 3
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="card-body p-4">
//                                 <form onSubmit={handleSubmitStep3}>
//                                     <div className="mb-4">
//                                         <label className="form-label fw-semibold small text-muted">
//                                             Nouveau mot de passe
//                                         </label>
//                                         <div className="position-relative">
//                                             <i
//                                                 className="fas fa-lock position-absolute top-50 start-0 translate-middle-y ms-3"
//                                                 style={{
//                                                     color: "#adb5bd",
//                                                     fontSize: "14px",
//                                                 }}
//                                             ></i>
//                                             <input
//                                                 type="password"
//                                                 name="password"
//                                                 value={user.password}
//                                                 onChange={(e) =>
//                                                     setUser((p) => ({
//                                                         ...p,
//                                                         password:
//                                                             e.target.value,
//                                                     }))
//                                                 }
//                                                 className="form-control form-control-lg ps-5"
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     border: "1px solid #e9ecef",
//                                                     backgroundColor: "#f8f9fa",
//                                                     padding:
//                                                         "12px 16px 12px 40px",
//                                                     transition: "all 0.2s ease",
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#20c997";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "white";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "0 0 0 3px rgba(32,201,151,0.1)";
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#e9ecef";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "#f8f9fa";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "none";
//                                                 }}
//                                                 placeholder="••••••••"
//                                             />
//                                         </div>
//                                         {error.password && (
//                                             <small className="text-danger d-block mt-1">
//                                                 {error.password}
//                                             </small>
//                                         )}
//                                         <small className="text-muted d-block mt-2">
//                                             <i className="fas fa-info-circle me-1"></i>
//                                             Minimum 8 caractères, avec lettres
//                                             et chiffres
//                                         </small>
//                                     </div>

//                                     <div className="mb-4">
//                                         <label className="form-label fw-semibold small text-muted">
//                                             Confirmer le mot de passe
//                                         </label>
//                                         <div className="position-relative">
//                                             <i
//                                                 className="fas fa-check-circle position-absolute top-50 start-0 translate-middle-y ms-3"
//                                                 style={{
//                                                     color: "#adb5bd",
//                                                     fontSize: "14px",
//                                                 }}
//                                             ></i>
//                                             <input
//                                                 type="password"
//                                                 name="password_confirm"
//                                                 value={user.password_confirm}
//                                                 onChange={(e) =>
//                                                     setUser((p) => ({
//                                                         ...p,
//                                                         password_confirm:
//                                                             e.target.value,
//                                                     }))
//                                                 }
//                                                 className="form-control form-control-lg ps-5"
//                                                 style={{
//                                                     borderRadius: "12px",
//                                                     border: "1px solid #e9ecef",
//                                                     backgroundColor: "#f8f9fa",
//                                                     padding:
//                                                         "12px 16px 12px 40px",
//                                                     transition: "all 0.2s ease",
//                                                 }}
//                                                 onFocus={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#20c997";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "white";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "0 0 0 3px rgba(32,201,151,0.1)";
//                                                 }}
//                                                 onBlur={(e) => {
//                                                     e.currentTarget.style.borderColor =
//                                                         "#e9ecef";
//                                                     e.currentTarget.style.backgroundColor =
//                                                         "#f8f9fa";
//                                                     e.currentTarget.style.boxShadow =
//                                                         "none";
//                                                 }}
//                                                 placeholder="Confirmez votre mot de passe"
//                                             />
//                                         </div>
//                                         {error.password_confirm && (
//                                             <small className="text-danger d-block mt-1">
//                                                 {error.password_confirm}
//                                             </small>
//                                         )}
//                                     </div>

//                                     <button
//                                         type="submit"
//                                         className="btn w-100 py-3 fw-semibold"
//                                         style={{
//                                             background:
//                                                 "linear-gradient(135deg, #20c997 0%, #198764 100%)",
//                                             color: "white",
//                                             borderRadius: "12px",
//                                             border: "none",
//                                             transition: "all 0.2s ease",
//                                         }}
//                                         onMouseEnter={(e) => {
//                                             e.currentTarget.style.transform =
//                                                 "translateY(-2px)";
//                                             e.currentTarget.style.boxShadow =
//                                                 "0 6px 16px rgba(32,201,151,0.4)";
//                                         }}
//                                         onMouseLeave={(e) => {
//                                             e.currentTarget.style.transform =
//                                                 "translateY(0)";
//                                             e.currentTarget.style.boxShadow =
//                                                 "none";
//                                         }}
//                                     >
//                                         <i className="fas fa-save me-2"></i>
//                                         Récupérer le mot de passe
//                                     </button>

//                                     <div className="text-center mt-4">
//                                         <a
//                                             href="/auth/login"
//                                             className="text-decoration-none small d-inline-flex align-items-center gap-1"
//                                             style={{
//                                                 color: "#6c757d",
//                                                 transition: "color 0.2s ease",
//                                             }}
//                                             onMouseEnter={(e) =>
//                                                 (e.currentTarget.style.color =
//                                                     "#20c997")
//                                             }
//                                             onMouseLeave={(e) =>
//                                                 (e.currentTarget.style.color =
//                                                     "#6c757d")
//                                             }
//                                         >
//                                             <i className="fas fa-arrow-left me-1"></i>
//                                             Retour à la connexion
//                                         </a>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Recuperation;
