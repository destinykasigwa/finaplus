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
        <div
            className="h-100 d-flex align-items-center justify-content-center"
            style={{ marginTop: "100px" }}
        >
            <div className="col-md-6 card">
                <div>
                    <div className={styles.register_section_warp}>
                        <div className={styles.register_section_right}>
                            <div className={styles.headersection}>
                                <h5
                                    style={{
                                        color: "steelblue",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Votre mot de passe a été réinitialisé vous
                                    devez le changer
                                </h5>
                            </div>

                            <form
                                className={styles.form}
                                onSubmit={handleSubmit}
                                style={{ padding: "5px" }}
                            >
                                <div className={styles.password}>
                                    <input
                                        className={styles.input_form}
                                        type="password"
                                        name="password"
                                        value={user.password}
                                        onChange={(e) =>
                                            setUser((p) => ({
                                                ...p,
                                                password: e.target.value,
                                            }))
                                        }
                                        required
                                        // placeholder=""
                                        // autoComplete="off"
                                    />
                                    <span className="text-danger">
                                        {error.password}
                                    </span>
                                    <label className={styles.label_form}>
                                        Nouveau mot de passe
                                    </label>
                                </div>
                                <div className={styles.password}>
                                    <input
                                        className={styles.input_form}
                                        type="password"
                                        name="password_confirm"
                                        value={user.password_confirm}
                                        onChange={(e) =>
                                            setUser((p) => ({
                                                ...p,
                                                password_confirm:
                                                    e.target.value,
                                            }))
                                        }
                                        required
                                        // placeholder=""
                                        // autoComplete="off"
                                    />
                                    <span className="text-danger">
                                        {error.password_confirm}
                                    </span>
                                    <label className={styles.label_form}>
                                        Confirmez le mot de passe
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className={styles.button_effect}
                                >
                                    Changer
                                </button>
                                <a
                                    style={{ textDecoration: "none" }}
                                    href="/auth/login"
                                >
                                    Retour à la connexion
                                </a>
                            </form>
                        </div>
                    </div>
                </div>
                <br />
            </div>
        </div>
    );
};

export default ResetPassWord;
