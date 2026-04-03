import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Crediter = () => {
    const [loading, setloading] = useState(false);
    const [compte_a_debiter, setcompte_a_debiter] = useState();
    const [compte_a_crediter, setcompte_a_crediter] = useState();
    const [Libelle, setLibelle] = useState();
    const [Montant, setMontant] = useState();
    const [FetchDataDebit, setFetchDataDebit] = useState();
    const [FetchDataCredit, setFetchDataCredit] = useState();
    const [FetchSoldeDebit, setFetchSoldeDebit] = useState();
    const [FetchSoldeCredit, setFetchSoldeCredit] = useState();
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/transaction/crediter/save", {
            compte_a_debiter: compte_a_debiter,
            compte_a_crediter: compte_a_crediter,
            Montant,
            devise: FetchDataDebit.CodeMonnaie,
            Libelle: Libelle,
        });
        if (res.data.status == 1) {
            setloading(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            setMontant("");
            setLibelle("");
        } else if (res.data.status == 0) {
            setloading(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else {
            setloading(false);
            setError(res.data.validate_error);
        }
    };
    const getSeachedDataDebit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/debiter/get-data", {
            compte_a_debiter,
        });
        if (res.data.status == 1) {
            setFetchDataDebit(res.data.dataDebit);
            setFetchSoldeDebit(res.data.soldeCompteDebit);
            console.log(FetchSolde);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };
    const getSeachedDataCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/crediter/get-data", {
            compte_a_crediter,
        });
        if (res.data.status == 1) {
            setFetchDataCredit(res.data.dataCredit);
            setFetchSoldeCredit(res.data.soldeCompteCredit);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    function numberWithSpaces(x) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    return (
        <div className="container-fluid" style={{ marginTop: "10px" }}>
            <div className="row">
                <div className="col-md-12 card rounded-10 p-1">
                    <div
                        style={{
                            background: "teal",
                            borderRadius: "10px",
                            height: "10",
                            padding: "2px",
                            color: "white",
                        }}
                    >
                        <h5 className="text-bold p-1">Créditer les comptes</h5>
                    </div>{" "}
                </div>
            </div>
            <div className="row mt-3">
                <div
                    className="col-md-3 card rounded-0 p-3"
                    style={{ marginRight: "3px" }}
                >
                    <form action="">
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <label
                                            htmlFor="compte_a_crediter"
                                            style={{ color: "steelblue" }}
                                        >
                                            Crédit sur
                                        </label>
                                    </td>
                                    <td>
                                        <input
                                            id="compte_a_crediter"
                                            name="compte_a_crediter"
                                            type="text"
                                            style={{
                                                padding: "1px ",
                                                border: `${"1px solid #dcdcdc"}`,
                                                marginBottom: "5px",
                                                width: "100px",
                                            }}
                                            onChange={(e) => {
                                                setcompte_a_crediter(
                                                    e.target.value
                                                );
                                            }}
                                        />
                                        <button
                                            className="btn btn-primary rounded-0"
                                            style={{
                                                padding: "2px",
                                                marginTop: "-5px",
                                                width: "30px",
                                            }}
                                            onClick={getSeachedDataCredit}
                                        >
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <label
                                            htmlFor="compte_a_debiter"
                                            style={{ color: "steelblue" }}
                                        >
                                            Débit sur
                                        </label>
                                    </td>
                                    <td>
                                        <input
                                            id="compte_a_debiter"
                                            name="compte_a_debiter"
                                            type="text"
                                            style={{
                                                padding: "1px ",
                                                border: `${"1px solid #dcdcdc"}`,
                                                marginBottom: "5px",
                                                width: "100px",
                                            }}
                                            onChange={(e) => {
                                                setcompte_a_debiter(
                                                    e.target.value
                                                );
                                            }}
                                        />
                                        <button
                                            className="btn btn-primary rounded-0"
                                            style={{
                                                padding: "2px",
                                                marginTop: "-5px",
                                                width: "30px",
                                            }}
                                            onClick={getSeachedDataDebit}
                                        >
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </td>
                                </tr>

                                <hr />
                            </tbody>
                        </table>
                    </form>
                </div>
                {FetchDataCredit && (
                    <div className="col-md-4 card rounded-0">
                        <p className="text-bold" style={{ color: "steelblue" }}>
                            Informations sur le compte à Créditer
                        </p>
                        <table className="table-bordered p-1">
                            <tr>
                                <td style={{ padding: "2px " }}>
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "bold",
                                        }}
                                        htmlFor=""
                                    >
                                        Nom Compte :
                                    </label>
                                </td>
                                <td style={{ padding: "2px " }}>
                                    {FetchDataCredit &&
                                        FetchDataCredit.NomCompte}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: "2px " }}>
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "bold",
                                        }}
                                        htmlFor=""
                                    >
                                        Num compte :
                                    </label>
                                </td>
                                <td style={{ padding: "2px " }}>
                                    {FetchDataCredit &&
                                        FetchDataCredit.NumCompte}
                                </td>
                            </tr>

                            <tr>
                                <td style={{ padding: "2px " }}>
                                    {" "}
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "bold",
                                        }}
                                        htmlFor=""
                                    >
                                        Solde compte:
                                    </label>
                                </td>

                                {FetchSoldeCredit && (
                                    <td style={{ padding: "3px " }}>
                                        {FetchSoldeCredit.soldeCompte}{" "}
                                        {FetchDataCredit &&
                                        FetchDataCredit.CodeMonnaie == 1
                                            ? " USD"
                                            : " CDF"}
                                    </td>
                                )}
                            </tr>
                        </table>
                    </div>
                )}
                {FetchDataDebit && (
                    <div className="col-md-4 card rounded-0">
                        <p className="text-bold" style={{ color: "steelblue" }}>
                            Informations sur le compte à Débiter
                        </p>
                        <table className="table-bordered p-1">
                            <tr>
                                <td style={{ padding: "2px " }}>
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "bold",
                                        }}
                                        htmlFor=""
                                    >
                                        Nom Compte :
                                    </label>
                                </td>
                                <td style={{ padding: "2px " }}>
                                    {FetchDataDebit && FetchDataDebit.NomCompte}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ padding: "2px " }}>
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "bold",
                                        }}
                                        htmlFor=""
                                    >
                                        Num compte :
                                    </label>
                                </td>
                                <td style={{ padding: "2px " }}>
                                    {FetchDataDebit && FetchDataDebit.NumCompte}
                                </td>
                            </tr>

                            <tr>
                                <td style={{ padding: "2px " }}>
                                    {" "}
                                    <label
                                        style={{
                                            color: "steelblue",
                                            fontWeight: "bold",
                                        }}
                                        htmlFor=""
                                    >
                                        Solde compte:
                                    </label>
                                </td>

                                {FetchSoldeDebit && (
                                    <td style={{ padding: "3px " }}>
                                        {FetchSoldeDebit.soldeCompte}{" "}
                                        {FetchDataDebit &&
                                        FetchDataDebit.CodeMonnaie == 1
                                            ? " USD"
                                            : " CDF"}
                                    </td>
                                )}
                            </tr>
                        </table>
                    </div>
                )}
            </div>
            <p
                className="border border-10"
                style={{
                    background: "#dcdcdc",
                    padding: "1px",
                }}
            ></p>
            <div className="row">
                <div
                    className="col-md-4 card rounded-0 p-3"
                    style={{ marginRight: "3px" }}
                >
                    <form action="">
                        <fieldset>
                            <legend
                                style={{
                                    border: "2px solid:#dcdcdc !important",
                                }}
                            >
                                {/* <p>Informations</p> */}
                            </legend>
                            <table>
                                <tbody>
                                    <tr>
                                        {/* <td>
                                            {" "}
                                            <label
                                                htmlFor="Devise"
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                            >
                                                Devise
                                            </label>
                                        </td> */}
                                        {/* <td>
                                            {" "}
                                            <select
                                                id="devise"
                                                name="devise"
                                                style={{
                                                    padding: "1px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                }}
                                                onChange={(e) => {
                                                    setDevise(e.target.value);
                                                }}

                                                disabled
                                            >
                                                <option value=""> {FetchDataCredit} </option>
                                            </select>
                                        </td> */}
                                    </tr>
                                    <tr>
                                        <td>
                                            {" "}
                                            <label
                                                htmlFor="Montant"
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                            >
                                                Montant
                                            </label>
                                        </td>
                                        <td>
                                            {" "}
                                            <input
                                                id="Montant"
                                                name="Montant"
                                                type="text"
                                                style={{
                                                    padding: "5px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "120px",
                                                    borderRadius: "5px",
                                                }}
                                                onChange={(e) =>
                                                    setMontant(e.target.value)
                                                }
                                                value={Montant}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            {" "}
                                            <label
                                                htmlFor="telephone"
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                            >
                                                Libellé
                                            </label>
                                        </td>
                                        <td>
                                            {" "}
                                            <input
                                                type="text"
                                                id="Libelle"
                                                name="Libelle"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "300px",
                                                    borderRadius: "5px",
                                                }}
                                                onChange={(e) => {
                                                    setLibelle(e.target.value);
                                                }}
                                                value={Libelle}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <button
                                                className="btn btn-primary rounded-10"
                                                id="validerbtn"
                                                onClick={saveOperation}
                                            >
                                                <i
                                                    className={`${
                                                        loading
                                                            ? "spinner-border spinner-border-sm"
                                                            : " fas fa-check"
                                                    }`}
                                                ></i>
                                                Valider
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </fieldset>
                    </form>
                </div>

                {/* <div className="col-md-3 card rounded-0 p-3">
                    <form action="">
                        <table>
                            <tr>
                                <td>
                                    <button
                                        className="btn btn-primary rounded-0"
                                        id="validerbtn"
                                        onClick={saveOperation}
                                    >
                                        <i
                                            className={`${
                                                loading
                                                    ? "spinner-border spinner-border-sm"
                                                    : " fas fa-check"
                                            }`}
                                        ></i>
                                        Valider
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </form>
                </div>
                <div
                    className="col-md-4 card rounded-0 p-3"
                    style={{ marginRight: "2px" }}
                ></div> */}
            </div>
        </div>
    );
};

export default Crediter;
