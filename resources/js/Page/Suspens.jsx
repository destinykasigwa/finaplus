// import styles from "../styles/RegisterForm.module.css";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";

const Suspens = () => {
    //CDF ATTRIBUTE
    const [vightMille, setvightMille] = useState(0);
    const [dixMille, setdixMille] = useState(0);
    const [cinqMille, setcinqMille] = useState(0);
    const [milleFranc, setmilleFranc] = useState(0);
    const [cinqCentFr, setcinqCentFr] = useState(0);
    const [deuxCentFranc, setdeuxCentFranc] = useState(0);
    const [centFranc, setcentFranc] = useState(0);
    const [cinquanteFanc, setcinquanteFanc] = useState(0);

    //USD ATTRIBUTE
    const [hundred, sethundred] = useState(0);
    const [fitfty, setfitfty] = useState(0);
    const [twenty, settwenty] = useState(0);
    const [ten, setten] = useState(0);
    const [five, setfive] = useState(0);
    const [oneDollar, setoneDollar] = useState(0);

    const [searched_account, setsearched_account] = useState();
    const [fetchData, setFetchData] = useState();
    const [devise, setDevise] = useState("CDF");
    const [motifDepot, setMotifDepot] = useState("EPARGNE");
    const [DeposantName, setDeposantName] = useState();
    const [DeposantPhone, setDeposantPhone] = useState();
    const [Montant, setMontant] = useState(0);
    const [loading, setloading] = useState(false);
    const [error, setError] = useState([]);
    const [fetchData2, setfetchData2] = useState();
    //GET SEACHED DATA
    const getSeachedData = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/depot-espece/get-account", {
            searched_account: searched_account,
        });
        if (res.data.status == 1) {
            setFetchData(res.data.data);
            console.log(fetchData);
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
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post(
            "/eco/page/depot-espece/save-deposit/suspens",
            {
                vightMille,
                dixMille,
                cinqMille,
                milleFranc,
                cinqCentFr,
                deuxCentFranc,
                centFranc,
                cinquanteFanc,
                hundred,
                fitfty,
                twenty,
                ten,
                five,
                oneDollar,
                devise: fetchData2.CodeMonnaie == 1 ? "USD" : "CDF",
                motifDepot,
                DeposantName,
                DeposantPhone,
                Montant,
                NumAbrege: searched_account,
            }
        );
        if (res.data.status == 1) {
            setloading(false);
            setDeposantName("");
            setDeposantPhone("");
            setMontant("");
            setvightMille(0);
            setdixMille(0);
            setcinqMille(0);
            setmilleFranc(0);
            setcinqCentFr(0);
            setdeuxCentFranc(0);
            setcentFranc(0);
            setcinquanteFanc(0);
            sethundred(0);
            setfitfty(0);
            settwenty(0);
            setten(0);
            setfive(0);
            setoneDollar(0);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
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
    const getAccountInfo = async (event) => {
        if (event.detail == 2) {
            const res = await axios.post(
                "/eco/page/depot-espece/get-account/specific",
                {
                    NumCompte: event.target.innerHTML,
                }
            );
            if (res.data.status == 1) {
                setfetchData2(res.data.data);
                console.log(fetchData2);
            } else {
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
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
                        <h5 className="text-bold p-1">Opérations de suspens</h5>
                    </div>{" "}
                </div>
            </div>
            <div className="row mt-3">
                <div
                    className="col-md-4 card rounded-0 p-3"
                    style={{ marginRight: "3px" }}
                >
                    <form action="">
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <input
                                            id="compte_to_search"
                                            name="compte_to_search"
                                            type="text"
                                            style={{
                                                padding: "1px ",
                                                border: `${"1px solid #dcdcdc"}`,
                                                marginBottom: "5px",
                                                width: "80px",
                                                color: "red",
                                            }}
                                            onChange={(e) => {
                                                setsearched_account(
                                                    e.target.value
                                                );
                                            }}
                                        />
                                        <button
                                            className="btn btn-primary rounded-0"
                                            style={{
                                                padding: "2px",
                                                marginTop: "-5px",
                                            }}
                                            onClick={getSeachedData}
                                        >
                                            Rechercher
                                        </button>
                                    </td>
                                </tr>
                                <hr />
                                <tr>
                                    <td>
                                        {" "}
                                        <label
                                            htmlFor="intituleCompte"
                                            style={{
                                                padding: "2px",
                                                color: "steelblue",
                                            }}
                                        >
                                            Intitulé de compte
                                        </label>
                                    </td>
                                    <td>
                                        {" "}
                                        <input
                                            id="intituleCompte"
                                            name="intituleCompte"
                                            type="text"
                                            style={{
                                                padding: "1px ",
                                                border: `${"1px solid #dcdcdc"}`,
                                                marginBottom: "5px",
                                                color: "red",
                                            }}
                                            value={
                                                fetchData2 &&
                                                fetchData2.NomCompte
                                            }
                                            disabled
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {" "}
                                        <label
                                            htmlFor="NumCompte"
                                            style={{
                                                padding: "2px",
                                                color: "steelblue",
                                            }}
                                        >
                                            Numéro de compte
                                        </label>
                                    </td>
                                    <td>
                                        {" "}
                                        <input
                                            id="NumCompte"
                                            name="NumCompte"
                                            type="text"
                                            style={{
                                                padding: "1px ",
                                                border: `${"1px solid #dcdcdc"}`,
                                                marginBottom: "5px",
                                                color: "red",
                                            }}
                                            disabled
                                            value={
                                                fetchData2 &&
                                                fetchData2.NumCompte
                                            }
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {" "}
                                        <label
                                            htmlFor="CodeAgence"
                                            style={{
                                                padding: "2px",
                                                color: "steelblue",
                                            }}
                                        >
                                            Code Agence
                                        </label>
                                    </td>
                                    <td>
                                        {" "}
                                        <input
                                            id="CodeAgence"
                                            name="CodeAgence"
                                            type="text"
                                            style={{
                                                padding: "1px ",
                                                border: `${"1px solid #dcdcdc"}`,
                                                marginBottom: "5px",
                                                width: "50px",
                                                color: "red",
                                            }}
                                            value={
                                                fetchData2 &&
                                                fetchData2.CodeAgence
                                            }
                                            disabled
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
                <div className="col-md-4 card rounded-0 p-3">
                    <p className="text-bold" style={{ color: "steelblue" }}>
                        Liste de comptes
                    </p>
                    <form
                        action=""
                        style={{ overflowX: "scroll", height: "150px" }}
                    >
                        <table className="table">
                            {fetchData &&
                                fetchData.map((res, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            style={{
                                                background: "#dcdcdc",
                                                color: "red",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    border: "1px solid #fff",
                                                    cursor: "pointer",
                                                }}
                                                onClick={(event) =>
                                                    getAccountInfo(event)
                                                }
                                            >
                                                {res.NumCompte}
                                            </td>
                                            <td
                                                style={{
                                                    border: "1px solid #fff",
                                                }}
                                            >
                                                {res.CodeMonnaie == 1
                                                    ? "USD"
                                                    : "CDF"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            <tr>
                                {/* <td>
                                    <button className="btn btn-primary rounded-0">
                                        Afficher le solde
                                    </button>
                                </td> */}
                            </tr>
                        </table>
                    </form>
                </div>
            </div>
            <p
                className="border border-10"
                style={{
                    background: "#dcdcdc",
                    padding: "1px",
                }}
            ></p>
            <div
                className="row"
                // style={{ height: "340px", overflowX: "scroll" }}
            >
                <div
                    className="col-md-4 card rounded-0 p-1"
                    style={{ marginRight: "3px" }}
                >
                    <form action="">
                        <fieldset>
                            <legend
                                style={{
                                    border: "2px solid:#dcdcdc !important",
                                }}
                            >
                                <p>Informations</p>
                            </legend>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
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
                                        </td>
                                        <td>
                                            {" "}
                                            <select
                                                id="devise"
                                                name="devise"
                                                style={{
                                                    padding: "1px ",
                                                    border: `${
                                                        error.devise
                                                            ? "1px solid red"
                                                            : "1px solid #dcdcdc"
                                                    }`,
                                                    marginBottom: "5px",
                                                    color: "red",
                                                }}
                                                disabled
                                                onChange={(e) => {
                                                    setDevise(e.target.value);
                                                }}
                                            >
                                                <option
                                                    value={
                                                        fetchData2 &&
                                                        fetchData2.CodeMonnaie ==
                                                            1
                                                            ? "USD"
                                                            : "CDF"
                                                    }
                                                >
                                                    {fetchData2 &&
                                                    fetchData2.CodeMonnaie == 1
                                                        ? "USD"
                                                        : "CDF"}
                                                </option>
                                                {/* <option value="USD">USD</option> */}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {" "}
                                            <label
                                                htmlFor="motifDepot"
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                            >
                                                Motif
                                            </label>
                                        </td>
                                        <td>
                                            {" "}
                                            <input
                                                id="motifDepot"
                                                name="motifDepot"
                                                type="text"
                                                style={{
                                                    padding: "1px ",
                                                    border: `${
                                                        error.motifDepot
                                                            ? "1px solid red"
                                                            : "1px solid #dcdcdc"
                                                    }`,
                                                    marginBottom: "5px",
                                                    color: "red",
                                                }}
                                                onChange={(e) =>
                                                    setMotifDepot(
                                                        e.target.value
                                                    )
                                                }
                                                value={motifDepot}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            {" "}
                                            <label
                                                htmlFor="DeposantName"
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                            >
                                                Nom du déposant
                                            </label>
                                        </td>
                                        <td>
                                            {" "}
                                            <input
                                                id="DeposantName"
                                                name="DeposantName"
                                                type="text"
                                                style={{
                                                    padding: "1px ",
                                                    border: `${
                                                        error.DeposantName
                                                            ? "1px solid red"
                                                            : "1px solid #dcdcdc"
                                                    }`,
                                                    marginBottom: "5px",
                                                    color: "red",
                                                }}
                                                onChange={(e) =>
                                                    setDeposantName(
                                                        e.target.value
                                                    )
                                                }
                                                value={DeposantName}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            {" "}
                                            <label
                                                htmlFor="DeposantPhone"
                                                style={{
                                                    padding: "2px",
                                                    color: "steelblue",
                                                }}
                                            >
                                                Téléphone
                                            </label>
                                        </td>
                                        <td>
                                            {" "}
                                            <input
                                                id="DeposantPhone"
                                                name="DeposantPhone"
                                                type="text"
                                                style={{
                                                    padding: "1px ",
                                                    border: `${"1px solid #dcdcdc"}`,
                                                    marginBottom: "5px",
                                                    color: "red",
                                                }}
                                                onChange={(e) =>
                                                    setDeposantPhone(
                                                        e.target.value
                                                    )
                                                }
                                                value={DeposantPhone}
                                            />
                                        </td>
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
                                                    padding: "1px ",
                                                    border: `${
                                                        error.Montant
                                                            ? "1px solid red"
                                                            : "1px solid #dcdcdc"
                                                    }`,
                                                    marginBottom: "5px",
                                                    width: "70px",
                                                    color: "red",
                                                }}
                                                onChange={(e) =>
                                                    setMontant(e.target.value)
                                                }
                                                value={Montant}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </fieldset>
                    </form>
                </div>
                <div
                    className="col-md-4 card rounded-0 p-3"
                    style={{ marginRight: "2px" }}
                >
                    <form action="">
                        <fieldset>
                            <legend>
                                <p>Billetage</p>
                            </legend>
                            {fetchData2 && fetchData2.CodeMonnaie == 1 ? (
                                <form
                                    method="POST"
                                    style={{
                                        height: "auto",
                                    }}
                                >
                                    <table
                                        className="tableDepotEspece"
                                        style={{
                                            border: "2px solid #dcdcdc",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th className="col-md-4">
                                                    Coupures
                                                </th>
                                                <th className="col-md-4">
                                                    Nbr Billets
                                                </th>
                                                <th className="col-md-2">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr ng-repeat="name in getdrugnameNewArray">
                                                <td style={{ padding: "4px" }}>
                                                    100
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="hundred"
                                                        style={{
                                                            boxShadow:
                                                                "inset 0 0 5px 5px #888",
                                                            fontSize: "15px",
                                                            color: "red",
                                                        }}
                                                        value={hundred}
                                                        onChange={(e) =>
                                                            sethundred(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>{hundred * 100}</td>
                                            </tr>
                                            <tr ng-repeat="name in getdrugnameNewArray">
                                                <td style={{ padding: "4px" }}>
                                                    50
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="fitfty"
                                                        style={{
                                                            boxShadow:
                                                                "inset 0 0 5px 5px #888",
                                                            fontSize: "15px",
                                                            color: "red",
                                                        }}
                                                        onChange={(e) =>
                                                            setfitfty(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={fitfty}
                                                    />
                                                </td>
                                                <td>{fitfty * 50}</td>
                                            </tr>
                                            <tr ng-repeat="name in getdrugnameNewArray">
                                                <td style={{ padding: "4px" }}>
                                                    20
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="twenty"
                                                        style={{
                                                            boxShadow:
                                                                "inset 0 0 5px 5px #888",
                                                            fontSize: "15px",
                                                            color: "red",
                                                        }}
                                                        onChange={(e) =>
                                                            settwenty(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={twenty}
                                                    />
                                                </td>
                                                <td>{twenty * 20}</td>
                                            </tr>
                                            <tr ng-repeat="name in getdrugnameNewArray">
                                                <td style={{ padding: "4px" }}>
                                                    10
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="ten"
                                                        style={{
                                                            boxShadow:
                                                                "inset 0 0 5px 5px #888",
                                                            fontSize: "15px",
                                                            color: "red",
                                                        }}
                                                        onChange={(e) =>
                                                            setten(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={ten}
                                                    />
                                                </td>
                                                <td>{ten * 10}</td>
                                            </tr>
                                            <tr ng-repeat="name in getdrugnameNewArray">
                                                <td style={{ padding: "4px" }}>
                                                    5
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="five"
                                                        style={{
                                                            boxShadow:
                                                                "inset 0 0 5px 5px #888",
                                                            fontSize: "15px",
                                                            color: "red",
                                                        }}
                                                        onChange={(e) =>
                                                            setfive(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={five}
                                                    />
                                                </td>
                                                <td>{five * 5}</td>
                                            </tr>
                                            <tr ng-repeat="name in getdrugnameNewArray">
                                                <td style={{ padding: "4px" }}>
                                                    1
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="oneDollar"
                                                        style={{
                                                            boxShadow:
                                                                "inset 0 0 5px 5px #888",
                                                            fontSize: "15px",
                                                            color: "red",
                                                        }}
                                                        onChange={(e) =>
                                                            setoneDollar(
                                                                e.target.value
                                                            )
                                                        }
                                                        value={oneDollar}
                                                    />
                                                </td>
                                                <td>{oneDollar * 1}</td>
                                            </tr>
                                            <tr
                                                style={{
                                                    padding: "10px",
                                                }}
                                            >
                                                <th style={{ padding: "4px" }}>
                                                    Total
                                                </th>
                                                <th>
                                                    {" "}
                                                    {parseInt(hundred) +
                                                        parseInt(fitfty) +
                                                        parseInt(twenty) +
                                                        parseInt(ten) +
                                                        parseInt(five) +
                                                        parseInt(
                                                            oneDollar
                                                        )}{" "}
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: "25px",
                                                        background: "green",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    {" "}
                                                    {hundred * 100 +
                                                        fitfty * 50 +
                                                        twenty * 20 +
                                                        ten * 10 +
                                                        five * 5 +
                                                        oneDollar * 1}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </form>
                            ) : (
                                <table
                                    className="tableDepotEspece"
                                    style={{
                                        border: "2px solid #dcdcdc",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th className="col-md-4">
                                                Coupures
                                            </th>
                                            <th className="col-md-4">
                                                Nbr Billets
                                            </th>
                                            <th className="col-md-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                20000
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="vightMille"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setvightMille(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={vightMille}
                                                />
                                            </td>
                                            <td>{vightMille * 20000}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                10000
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="dixMille"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setdixMille(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={dixMille}
                                                />
                                            </td>
                                            <td>{dixMille * 10000}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                5000
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="cinqMille"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setcinqMille(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={cinqMille}
                                                />
                                            </td>
                                            <td>{cinqMille * 5000}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                1000
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="milleFranc"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setmilleFranc(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={milleFranc}
                                                />
                                            </td>
                                            <td>{milleFranc * 1000}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                500
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="cinqCentFr"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setcinqCentFr(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={cinqCentFr}
                                                />
                                            </td>
                                            <td>{cinqCentFr * 500}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                200
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="deuxCentFranc"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setdeuxCentFranc(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={deuxCentFranc}
                                                />
                                            </td>
                                            <td>{deuxCentFranc * 200}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                100
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="centFranc"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setcentFranc(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={centFranc}
                                                />
                                            </td>
                                            <td>{centFranc * 100}</td>
                                        </tr>
                                        <tr ng-repeat="name in getdrugnameNewArray">
                                            <td style={{ padding: "4px" }}>
                                                50
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="cinquanteFanc"
                                                    style={{
                                                        boxShadow:
                                                            "inset 0 0 5px 5px #888",
                                                        fontSize: "15px",
                                                        color: "red",
                                                    }}
                                                    onChange={(e) =>
                                                        setcinquanteFanc(
                                                            e.target.value
                                                        )
                                                    }
                                                    value={cinquanteFanc}
                                                />
                                            </td>
                                            <td>{cinquanteFanc * 50}</td>
                                        </tr>
                                        <tr
                                            style={{
                                                padding: "10px",
                                            }}
                                        >
                                            <th style={{ padding: "4px" }}>
                                                Total
                                            </th>
                                            <th style={{ padding: "4px" }}>
                                                {" "}
                                                {parseInt(vightMille) +
                                                    parseInt(dixMille) +
                                                    parseInt(cinqMille) +
                                                    parseInt(milleFranc) +
                                                    parseInt(cinqCentFr) +
                                                    parseInt(deuxCentFranc) +
                                                    parseInt(centFranc) +
                                                    parseInt(
                                                        cinquanteFanc
                                                    )}{" "}
                                            </th>
                                            <th
                                                style={{
                                                    fontSize: "25px",
                                                    background: "green",
                                                    color: "#fff",
                                                    padding: "4px",
                                                }}
                                            >
                                                {" "}
                                                {vightMille * 20000 +
                                                    dixMille * 10000 +
                                                    cinqMille * 5000 +
                                                    milleFranc * 1000 +
                                                    cinqCentFr * 500 +
                                                    deuxCentFranc * 200 +
                                                    centFranc * 100 +
                                                    cinquanteFanc * 50}{" "}
                                            </th>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </fieldset>
                    </form>
                </div>
                <div className="col-md-2 card rounded-0 p-3">
                    <form action="">
                        <table>
                            <tr>
                                <td>
                                    {hundred * 100 +
                                        fitfty * 50 +
                                        twenty * 20 +
                                        ten * 10 +
                                        five * 5 +
                                        oneDollar * 1 ===
                                        parseInt(Montant) ||
                                    vightMille * 20000 +
                                        dixMille * 10000 +
                                        cinqMille * 5000 +
                                        milleFranc * 1000 +
                                        cinqCentFr * 500 +
                                        deuxCentFranc * 200 +
                                        centFranc * 100 +
                                        cinquanteFanc * 50 ===
                                        parseInt(Montant) ? (
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
                                    ) : (
                                        <button
                                            className="btn btn-primary rounded-0"
                                            disabled
                                        >
                                            {" "}
                                            <i className="fas fa-check"></i>{" "}
                                            Valider
                                        </button>
                                    )}
                                    {/* <button className="btn btn-primary rounded-0">
                                        Valider
                                    </button> */}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <button className="btn btn-success rounded-0 mt-1">
                                        <i className="fas fa-print"></i>{" "}
                                        Imprimer
                                    </button>
                                </td>
                            </tr>
                            {/* <tr>
                                <td>
                                    <button className="btn btn-danger rounded-0 mt-1">
                                        Réinitialiser
                                    </button>
                                </td>
                            </tr> */}
                        </table>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Suspens;
