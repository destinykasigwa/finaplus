import styles from "../styles/Global.module.css";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import DataTable from "react-data-table-component";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4/js/dataTables.bootstrap4.min";
// import "data";

const TypeCredit = () => {
    const [loading, setLoading] = useState(false);
    const [fetchData, setFetchData] = useState();
    const [reference, setReference] = useState();
    const [type_credit, settype_credit] = useState();
    const [taux_ordinaire, settaux_ordinaire] = useState();
    const [montant_min, setmontant_min] = useState();
    const [montant_max, setmontant_max] = useState();
    const [compte_interet, setcompte_interet] = useState();
    const [compte_commission, setcompte_commission] = useState();
    const [compte_etude_dossier, setcompte_etude_dossier] = useState();
    const [sous_groupe_compte, setsous_groupe_compte] = useState();
    const [taux_retard, settaux_retard] = useState();
    const [compte_interet_retard, setcompte_interet_retard] = useState();
    const [commission_en_pourc, setcommission_en_pourc] = useState();
    const [frais_de_dossier, setfrais_de_dossier] = useState();
    useEffect(() => {
        // Initialize DataTable
        $("#example").DataTable();
        getData();
    }, []);

    const getData = async () => {
        const res = await axios.get("/eco/type-credit/get-data");
        if (res.data.status == 1) {
            setFetchData(res.data.data);
        }
    };
    const saveTypeCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/credit/type-credit/addnew", {
            reference,
            type_credit,
            taux_ordinaire,
            montant_min,
            montant_max,
            compte_interet,
            compte_commission,
            compte_etude_dossier,
            sous_groupe_compte,
            taux_retard,
            compte_interet_retard,
            commission_en_pourc,
            frais_de_dossier,
        });

        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
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
                        <h5 className="text-bold p-1">Type crédit</h5>
                    </div>{" "}
                </div>
            </div>
            <div className="row mt-3"></div>
            <p
                className="border border-10"
                style={{
                    background: "#dcdcdc",
                    padding: "1px",
                }}
            ></p>
            <div className="row">
                <div
                    className="col-md-9 card rounded-0 p-4"
                    style={{ marginRight: "3px" }}
                >
                    <form action="">
                        <div className="row">
                            <div className="col-md-6">
                                <fieldset>
                                    {/* <legend
                                        className="float-none w-auto p-0"
                                        style={{
                                            margin: "-15px",
                                            marginLeft: "7px",
                                        }}
                                    >
                                        <p style={{ fontSize: "15px" }}>
                                            Type crédit
                                        </p>
                                    </legend> */}

                                    <table>
                                        {/* <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="reference"
                                                >
                                                    Référence
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                    }}
                                                    name="reference"
                                                    id="reference"
                                                    onChange={(e) => {
                                                        setReference(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr> */}
                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="type_credit"
                                                >
                                                    Type crédit
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "300px",
                                                    }}
                                                    name="type_credit"
                                                    id="type_credit"
                                                    onChange={(e) => {
                                                        settype_credit(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="taux_ordinaire"
                                                >
                                                    Taux ordinaire
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "150px",
                                                    }}
                                                    name="taux_ordinaire"
                                                    id="taux_ordinaire"
                                                    onChange={(e) => {
                                                        settaux_ordinaire(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="montant_min"
                                                >
                                                    Montant Min
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "150px",
                                                    }}
                                                    name="montant_min"
                                                    id="montant_min"
                                                    onChange={(e) => {
                                                        setmontant_min(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="montant_max"
                                                >
                                                    Montant Max
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "150px",
                                                    }}
                                                    name="montant_max"
                                                    id="montant_max"
                                                    onChange={(e) => {
                                                        setmontant_max(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="compte_interet"
                                                >
                                                    Compte intérêt
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "150px",
                                                    }}
                                                    name="compte_interet"
                                                    id="compte_interet"
                                                    onChange={(e) => {
                                                        setcompte_interet(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="commission"
                                                >
                                                    Commission
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "150px",
                                                    }}
                                                    name="commission"
                                                    id="commission"
                                                    onChange={(e) => {
                                                        setcommission(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label
                                                    style={{
                                                        padding: "2px",
                                                        color: "steelblue",
                                                    }}
                                                    htmlFor="compte_etude_dossier"
                                                >
                                                    Compte étude dossier
                                                </label>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    style={{
                                                        padding: "3px ",
                                                        border: `${"1px solid #dcdcdc"}`,
                                                        marginBottom: "5px",
                                                        width: "150px",
                                                    }}
                                                    name="compte_etude_dossier"
                                                    id="compte_etude_dossier"
                                                    onChange={(e) => {
                                                        setcompte_etude_dossier(
                                                            e.target.value
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    </table>
                                </fieldset>
                            </div>
                            <div className="col-md-6">
                                <table>
                                    <tr>
                                        <td>
                                            <label
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                                htmlFor="sous_groupe_compte"
                                            >
                                                S/G Compte
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                }}
                                                name="sous_groupe_compte"
                                                id="sous_groupe_compte"
                                                onChange={(e) => {
                                                    setsous_groupe_compte(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                                htmlFor="taux_retard"
                                            >
                                                Taux retard
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "300px",
                                                }}
                                                name="taux_retard"
                                                id="taux_retard"
                                                onChange={(e) => {
                                                    settaux_retard(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                                htmlFor="compte_interet_retard"
                                            >
                                                Compte int. retard
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "150px",
                                                }}
                                                name="compte_interet_retard"
                                                id="compte_interet_retard"
                                                onChange={(e) => {
                                                    setcompte_interet_retard(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                                htmlFor="frais_de_dossier"
                                            >
                                                Frais de doss (%).
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "150px",
                                                }}
                                                name="frais_de_dossier"
                                                id="frais_de_dossier"
                                                onChange={(e) => {
                                                    setfrais_de_dossier(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                                htmlFor="commission_en_pourc"
                                            >
                                                commission(%)
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "150px",
                                                }}
                                                name="commission_en_pourc"
                                                id="commission_en_pourc"
                                                onChange={(e) => {
                                                    setcommission_en_pourc(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                                htmlFor="compte_commission"
                                            >
                                                Compte commission
                                            </label>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                style={{
                                                    padding: "3px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    width: "150px",
                                                }}
                                                name="compte_commission"
                                                id="compte_commission"
                                                onChange={(e) => {
                                                    setcompte_commission(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <button
                                                onClick={saveTypeCredit}
                                                className="btn btn-primary rounded-0"
                                            >
                                                Enregistrer
                                            </button>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 card rounded-0 p-2">
                    <table
                        id="example"
                        className="table table-striped table-bordered p-3 mt-2"
                        style={{ width: "100%" }}
                    >
                        <thead>
                            <tr>
                                <th>Réf</th>
                                <th>TypeCrédit</th>
                                <th>TauxOrd.</th>
                                <th>MontantMin.</th>
                                <th>MontantMax.</th>
                                <th>CompteInt.</th>
                                <th>Commission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetchData &&
                                fetchData.map((res, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{compteur++}</td>
                                            <td>{res.Reference}</td>
                                            <td>{res.type_credit}</td>
                                            <td>{res.taux_ordinaire}</td>
                                            <td>{res.montant_min}</td>
                                            <td>{res.montant_max}</td>
                                            <td>{res.compte_interet}</td>
                                            <td>{res.compte_etude_dossier}</td>
                                        </tr>
                                    );
                                })}
                            <tr>
                                <td>1</td>
                                <td>Product 1</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Product 1</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>Product 1</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                                <td>100</td>
                            </tr>

                            {/* Ajoutez plus de lignes au besoin */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TypeCredit;
