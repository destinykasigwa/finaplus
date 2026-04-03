import styles from "../styles/RegisterForm.module.css";
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/auth/login/change-password/skip", user);
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
                            <h2>Connexion! </h2>

                            <form
                                className={styles.form}
                                onSubmit={handleSubmit}
                            >
                                <div className={styles.name}>
                                    <input
                                        className={styles.input_form}
                                        type="text"
                                        name="name"
                                        value={user.name}
                                        onChange={(e) =>
                                            setUser((p) => ({
                                                ...p,
                                                name: e.target.value,
                                            }))
                                        }
                                    />
                                    <input type="hidden" value={user.SkipNow} />
                                    <span className="text-danger">
                                        {error.name}
                                    </span>
                                    <label className={styles.label_form}>
                                        Nom d'utilisateur
                                    </label>
                                </div>

                                <div className="password">
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
                                        // required
                                        // autoComplete="off"
                                        // placeholder="Xbshsd$##@31!"
                                    />
                                    <span className="text-danger">
                                        {error.password}
                                    </span>
                                    <label className={styles.label_form}>
                                        Mot de passe
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className={styles.button_effect}
                                >
                                    Connexion
                                </button>
                                <a
                                    style={{ textDecoration: "none" }}
                                    href="/auth/forget-password"
                                >
                                    J'ai oublié mon mot de passe
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

export default SkipPassword;
