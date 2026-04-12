// import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuApproCDF from "./Modals/RecuApproCDF";
import RecuApproUSD from "./Modals/RecuApproUSD";
// import { useNavigate } from "react-router-dom";

const Appro = () => {
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
    const [devise, setDevise] = useState("CDF");
    const [CaissierId, setCaissierId] = useState();
    const [fetchData, setFetchData] = useState();
    const [Montant, setMontant] = useState(0);
    const [loading, setloading] = useState(false);
    const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [getchefcaisse, setgetChefcaisse] = useState();
    const [fetchDailyOperationCDF, setFetchDailyOperationCDF] = useState();
    const [fetchDailyOperationUSD, setFetchDailyOperationUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    useEffect(() => {
        getAllCaissier();
        GetUserInformation();
        getLastestOperation();
    }, []);

    const getAllCaissier = async () => {
        const res = await axios.get("/eco/page/appro/get-all-caissiers");
        if (res.data.status == 1) {
            setFetchData(res.data.data);
            setgetChefcaisse(res.data.chefcaisse);
            // console.log(fetchData[0].NomCompte);
        }
    };
    //PERMET AU CHEF CAISSE D'APPPROVISIONNER UN CAISSIER
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/save-appro", {
            devise,
            Montant,
            CaissierId,
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

            setDevise("");
            setMontant("");
            setvightMille("0");
            setdixMille("0");
            setcinqMille("0");
            setmilleFranc("0");
            setcinqCentFr("0");
            setdeuxCentFranc("0");
            setcentFranc("0");
            setcinquanteFanc("0");
            sethundred("0");
            setfitfty("0");
            settwenty("0");
            setten("0");
            setfive("0");
            setoneDollar("0");
            getLastestOperation();
        } else {
            setloading(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    //PERMET DE RECUPERER LES OPERATIONS RECENTES POUR EDITER LES RECU

    const getLastestOperation = async () => {
        const res = await axios.get("/eco/pages/appro/get-daily-operations");
        if (res.data.status == 1) {
            setFetchDailyOperationCDF(res.data.dataCDF);
            setFetchDailyOperationUSD(res.data.dataUSD);
        }
        console.log(fetchDailyOperationCDF);
    };

    const GetUserInformation = async () => {
        const res = await axios.get("/eco/page/appro/get-billetage-caissier");
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.billetageCDF);
            setGetBilletageUSD(res.data.billetageUSD);
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

    //PERMET A L'UTILISATEUR D'ACCEPTER L'APPRO LUI ENVOYE PAR LE CHEF CAISSE
    const AcceptAppro = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/appro/accept-appro", {
            devise,
        });

        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
            // setTimeout(function () {
            //     window.location.reload();
            // }, 2000);
            getLastestOperation();
            GetUserInformation();
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

    function removeLastWord(sentence) {
        const words = sentence.split(" "); // Divise la chaîne en mots
        const wordsWithoutLast = words.slice(0, -1); // Prend tous les mots sauf le dernier
        return wordsWithoutLast.join(" "); // Recompose la chaîne sans le dernier mot
    }

    const handlePrintClick = (data) => {
        setSelectedData(data);
    };

    return (
        <>
            {fetchData !== undefined &&
            getchefcaisse &&
            getchefcaisse.isChefCaisse == 1 ? (
                // Vue pour le Chef de Caisse
                <div
                    className="container-fluid"
                    style={{ marginTop: "10px", padding: "0 15px" }}
                >
                    {/* En-tête moderne */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div
                                    className="card-body p-3"
                                    style={{
                                        background: "#138496",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i
                                                className="fas fa-charging-station"
                                                style={{
                                                    fontSize: "28px",
                                                    color: "white",
                                                }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5 className="text-white fw-bold mb-0">
                                                Approvisionnement
                                            </h5>
                                            <small className="text-white-50">
                                                Gestion des approvisionnements
                                                en espèces
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Formulaire - Chef de Caisse */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-info-circle me-2"></i>
                                        Informations d'approvisionnement
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <table style={{ width: "100%" }}>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                            width: "35%",
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                color: "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Devise
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <select
                                                            id="devise"
                                                            name="devise"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                            }}
                                                            onChange={(e) => {
                                                                setDevise(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        >
                                                            <option value="CDF">
                                                                CDF
                                                            </option>
                                                            <option value="USD">
                                                                USD
                                                            </option>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                color: "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Caissier(ère)
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <select
                                                            id="CaissierId"
                                                            name="CaissierId"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                            }}
                                                            onChange={(e) => {
                                                                setCaissierId(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        >
                                                            <option value="">
                                                                Sélectionnez
                                                            </option>
                                                            {fetchData &&
                                                                fetchData.map(
                                                                    (
                                                                        res,
                                                                        index,
                                                                    ) => {
                                                                        return (
                                                                            <option
                                                                                key={
                                                                                    index
                                                                                }
                                                                                value={
                                                                                    res.caissierId
                                                                                }
                                                                            >
                                                                                {removeLastWord(
                                                                                    res.NomCompte,
                                                                                )}
                                                                            </option>
                                                                        );
                                                                    },
                                                                )}
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                color: "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Montant
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <input
                                                            id="Montant"
                                                            name="Montant"
                                                            type="text"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                                fontWeight:
                                                                    "bold",
                                                                fontSize:
                                                                    "18px",
                                                            }}
                                                            onChange={(e) =>
                                                                setMontant(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            value={Montant}
                                                            placeholder="0,00"
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <hr className="my-3" />
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Billetage */}
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-money-bill me-2"></i>
                                        Billetage
                                    </h6>
                                </div>
                                <div
                                    className="card-body"
                                    style={{
                                        maxHeight: "450px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {devise == "USD" ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-sm">
                                                <thead
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <tr>
                                                        <th
                                                            style={{
                                                                color: "steelblue",
                                                            }}
                                                        >
                                                            Coupures
                                                        </th>
                                                        <th
                                                            style={{
                                                                color: "steelblue",
                                                            }}
                                                        >
                                                            Nbr Billets
                                                        </th>
                                                        <th
                                                            style={{
                                                                color: "steelblue",
                                                            }}
                                                        >
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        {
                                                            value: hundred,
                                                            set: sethundred,
                                                            label: "100",
                                                            multiplier: 100,
                                                        },
                                                        {
                                                            value: fitfty,
                                                            set: setfitfty,
                                                            label: "50",
                                                            multiplier: 50,
                                                        },
                                                        {
                                                            value: twenty,
                                                            set: settwenty,
                                                            label: "20",
                                                            multiplier: 20,
                                                        },
                                                        {
                                                            value: ten,
                                                            set: setten,
                                                            label: "10",
                                                            multiplier: 10,
                                                        },
                                                        {
                                                            value: five,
                                                            set: setfive,
                                                            label: "5",
                                                            multiplier: 5,
                                                        },
                                                        {
                                                            value: oneDollar,
                                                            set: setoneDollar,
                                                            label: "1",
                                                            multiplier: 1,
                                                        },
                                                    ].map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="fw-semibold">
                                                                {item.label}
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        boxShadow:
                                                                            "inset 0 0 3px #888",
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    value={
                                                                        item.value
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        item.set(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                {(
                                                                    item.value *
                                                                    item.multiplier
                                                                ).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr
                                                        style={{
                                                            backgroundColor:
                                                                "#e6f2f9",
                                                        }}
                                                    >
                                                        <th>Total</th>
                                                        <th>
                                                            {parseInt(hundred) +
                                                                parseInt(
                                                                    fitfty,
                                                                ) +
                                                                parseInt(
                                                                    twenty,
                                                                ) +
                                                                parseInt(ten) +
                                                                parseInt(five) +
                                                                parseInt(
                                                                    oneDollar,
                                                                )}
                                                        </th>
                                                        <th
                                                            className="fw-bold fs-5"
                                                            style={{
                                                                color: "#ffc107",
                                                            }}
                                                        >
                                                            {(
                                                                hundred * 100 +
                                                                fitfty * 50 +
                                                                twenty * 20 +
                                                                ten * 10 +
                                                                five * 5 +
                                                                oneDollar * 1
                                                            ).toLocaleString()}
                                                        </th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-sm">
                                                <thead
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <tr>
                                                        <th
                                                            style={{
                                                                color: "steelblue",
                                                            }}
                                                        >
                                                            Coupures
                                                        </th>
                                                        <th
                                                            style={{
                                                                color: "steelblue",
                                                            }}
                                                        >
                                                            Nbr Billets
                                                        </th>
                                                        <th
                                                            style={{
                                                                color: "steelblue",
                                                            }}
                                                        >
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        {
                                                            value: vightMille,
                                                            set: setvightMille,
                                                            label: "20000",
                                                            multiplier: 20000,
                                                        },
                                                        {
                                                            value: dixMille,
                                                            set: setdixMille,
                                                            label: "10000",
                                                            multiplier: 10000,
                                                        },
                                                        {
                                                            value: cinqMille,
                                                            set: setcinqMille,
                                                            label: "5000",
                                                            multiplier: 5000,
                                                        },
                                                        {
                                                            value: milleFranc,
                                                            set: setmilleFranc,
                                                            label: "1000",
                                                            multiplier: 1000,
                                                        },
                                                        {
                                                            value: cinqCentFr,
                                                            set: setcinqCentFr,
                                                            label: "500",
                                                            multiplier: 500,
                                                        },
                                                        {
                                                            value: deuxCentFranc,
                                                            set: setdeuxCentFranc,
                                                            label: "200",
                                                            multiplier: 200,
                                                        },
                                                        {
                                                            value: centFranc,
                                                            set: setcentFranc,
                                                            label: "100",
                                                            multiplier: 100,
                                                        },
                                                        {
                                                            value: cinquanteFanc,
                                                            set: setcinquanteFanc,
                                                            label: "50",
                                                            multiplier: 50,
                                                        },
                                                    ].map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="fw-semibold">
                                                                {item.label}
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm"
                                                                    style={{
                                                                        boxShadow:
                                                                            "inset 0 0 3px #888",
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    value={
                                                                        item.value
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        item.set(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                {(
                                                                    item.value *
                                                                    item.multiplier
                                                                ).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr
                                                        style={{
                                                            backgroundColor:
                                                                "#e6f2f9",
                                                        }}
                                                    >
                                                        <th>Total</th>
                                                        <th>
                                                            {parseInt(
                                                                vightMille,
                                                            ) +
                                                                parseInt(
                                                                    dixMille,
                                                                ) +
                                                                parseInt(
                                                                    cinqMille,
                                                                ) +
                                                                parseInt(
                                                                    milleFranc,
                                                                ) +
                                                                parseInt(
                                                                    cinqCentFr,
                                                                ) +
                                                                parseInt(
                                                                    deuxCentFranc,
                                                                ) +
                                                                parseInt(
                                                                    centFranc,
                                                                ) +
                                                                parseInt(
                                                                    cinquanteFanc,
                                                                )}
                                                        </th>
                                                        <th
                                                            className="fw-bold fs-5"
                                                            style={{
                                                                color: "#ffc107",
                                                            }}
                                                        >
                                                            {(
                                                                vightMille *
                                                                    20000 +
                                                                dixMille *
                                                                    10000 +
                                                                cinqMille *
                                                                    5000 +
                                                                milleFranc *
                                                                    1000 +
                                                                cinqCentFr *
                                                                    500 +
                                                                deuxCentFranc *
                                                                    200 +
                                                                centFranc *
                                                                    100 +
                                                                cinquanteFanc *
                                                                    50
                                                            ).toLocaleString()}
                                                        </th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bouton Validation */}
                        <div className="col-md-2">
                            <div className="card border-0 shadow-sm rounded-3 h-100">
                                <div className="card-body d-flex align-items-center justify-content-center">
                                    <button
                                        className="btn w-100 py-3 fw-bold"
                                        id="validerbtn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #ffc107, #e0a800)",
                                            border: "none",
                                            borderRadius: "12px",
                                            fontSize: "16px",
                                            color: "white",
                                            transition: "all 0.3s ease",
                                        }}
                                        onClick={saveOperation}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(-2px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 16px rgba(255,193,7,0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "none";
                                        }}
                                        disabled={
                                            (devise == "USD"
                                                ? hundred * 100 +
                                                      fitfty * 50 +
                                                      twenty * 20 +
                                                      ten * 10 +
                                                      five * 5 +
                                                      oneDollar * 1 !==
                                                  parseInt(Montant)
                                                : vightMille * 20000 +
                                                      dixMille * 10000 +
                                                      cinqMille * 5000 +
                                                      milleFranc * 1000 +
                                                      cinqCentFr * 500 +
                                                      deuxCentFranc * 200 +
                                                      centFranc * 100 +
                                                      cinquanteFanc * 50 !==
                                                  parseInt(Montant)) ||
                                            !Montant ||
                                            !CaissierId
                                        }
                                    >
                                        <i
                                            className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}
                                        ></i>
                                        Valider
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Séparateur décoratif */}
                    <div className="position-relative my-4">
                        <hr
                            className="border-2"
                            style={{ borderColor: "#e9ecef" }}
                        />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                            <i className="fas fa-history me-1"></i> Opérations
                            récentes
                        </span>
                    </div>

                    {/* Historique des opérations */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-clock me-2"></i>
                                        Appros récents
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {fetchDailyOperationCDF &&
                                        fetchDailyOperationCDF.length > 0 && (
                                            <>
                                                <div className="mb-3">
                                                    <h5
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <i className="fas fa-chart-line me-2"></i>
                                                        CDF
                                                    </h5>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead
                                                            style={{
                                                                backgroundColor:
                                                                    "#e6f2f9",
                                                            }}
                                                        >
                                                            <tr
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <th>
                                                                    Référence
                                                                </th>
                                                                <th>Montant</th>
                                                                <th>
                                                                    Caissier
                                                                </th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fetchDailyOperationCDF.map(
                                                                (
                                                                    res,
                                                                    index,
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.Reference
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td className="fw-bold text-success">
                                                                            {res.montant?.toLocaleString()}
                                                                        </td>
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.NomUtilisateur
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handlePrintClick(
                                                                                        res,
                                                                                    )
                                                                                }
                                                                                data-toggle="modal"
                                                                                data-target="#modal-appro-cdf"
                                                                                className="btn btn-sm"
                                                                                style={{
                                                                                    background:
                                                                                        "#ffc107",
                                                                                    color: "white",
                                                                                    borderRadius:
                                                                                        "6px",
                                                                                    padding:
                                                                                        "4px 12px",
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-print me-1"></i>{" "}
                                                                                Imprimer
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {selectedData && (
                                                    <RecuApproCDF
                                                        data={selectedData}
                                                    />
                                                )}
                                            </>
                                        )}

                                    {fetchDailyOperationUSD &&
                                        fetchDailyOperationUSD.length > 0 && (
                                            <>
                                                <div className="mb-3 mt-4">
                                                    <h5
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <i className="fas fa-dollar-sign me-2"></i>
                                                        USD
                                                    </h5>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead
                                                            style={{
                                                                backgroundColor:
                                                                    "#e6f2f9",
                                                            }}
                                                        >
                                                            <tr
                                                                style={{
                                                                    color: "steelblue",
                                                                }}
                                                            >
                                                                <th>
                                                                    Référence
                                                                </th>
                                                                <th>Montant</th>
                                                                <th>
                                                                    Caissier
                                                                </th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fetchDailyOperationUSD.map(
                                                                (
                                                                    res,
                                                                    index,
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.Reference
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td className="fw-bold text-success">
                                                                            {res.montant?.toLocaleString()}
                                                                        </td>
                                                                        <td>
                                                                            <small>
                                                                                {
                                                                                    res.NomUtilisateur
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handlePrintClick(
                                                                                        res,
                                                                                    )
                                                                                }
                                                                                data-toggle="modal"
                                                                                data-target="#modal-appro-usd"
                                                                                className="btn btn-sm"
                                                                                style={{
                                                                                    background:
                                                                                        "#ffc107",
                                                                                    color: "white",
                                                                                    borderRadius:
                                                                                        "6px",
                                                                                    padding:
                                                                                        "4px 12px",
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-print me-1"></i>{" "}
                                                                                Imprimer
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {selectedData && (
                                                    <RecuApproUSD
                                                        data={selectedData}
                                                    />
                                                )}
                                            </>
                                        )}

                                    {(!fetchDailyOperationCDF ||
                                        fetchDailyOperationCDF.length === 0) &&
                                        (!fetchDailyOperationUSD ||
                                            fetchDailyOperationUSD.length ===
                                                0) && (
                                            <div className="text-center py-5 text-muted">
                                                <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                                <p className="mb-0">
                                                    Aucune opération récente
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Vue pour les autres utilisateurs (consultation du billetage disponible)
                <div
                    className="container-fluid"
                    style={{ marginTop: "10px", padding: "0 15px" }}
                >
                    {/* En-tête moderne */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div
                                    className="card-body p-3"
                                    style={{
                                        background: "#138496",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i
                                                className="fas fa-charging-station"
                                                style={{
                                                    fontSize: "28px",
                                                    color: "white",
                                                }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5 className="text-white fw-bold mb-0">
                                                Approvisionnement
                                            </h5>
                                            <small className="text-white-50">
                                                Consultation du billetage
                                                disponible
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Billetage Disponible */}
                    <div className="row g-3">
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Sélection de la devise
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <table style={{ width: "100%" }}>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                            width: "35%",
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                color: "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Devise
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <select
                                                            id="devise"
                                                            name="devise"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                            }}
                                                            onChange={(e) => {
                                                                setDevise(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        >
                                                            <option value="CDF">
                                                                CDF
                                                            </option>
                                                            <option value="USD">
                                                                USD
                                                            </option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <hr className="my-3" />
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-money-bill me-2"></i>
                                        Billetage Disponible
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {devise == "USD"
                                        ? getBilletageUSD && (
                                              <div className="table-responsive">
                                                  <table className="table table-bordered">
                                                      <thead
                                                          style={{
                                                              backgroundColor:
                                                                  "#e6f2f9",
                                                          }}
                                                      >
                                                          <tr
                                                              style={{
                                                                  color: "steelblue",
                                                              }}
                                                          >
                                                              <th>Coupure</th>
                                                              <th>
                                                                  Nbr Billets
                                                              </th>
                                                              <th>Montant</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                          {[
                                                              {
                                                                  label: "100",
                                                                  value: getBilletageUSD.centDollars,
                                                                  multiplier: 100,
                                                              },
                                                              {
                                                                  label: "50",
                                                                  value: getBilletageUSD.cinquanteDollars,
                                                                  multiplier: 50,
                                                              },
                                                              {
                                                                  label: "20",
                                                                  value: getBilletageUSD.vightDollars,
                                                                  multiplier: 20,
                                                              },
                                                              {
                                                                  label: "10",
                                                                  value: getBilletageUSD.dixDollars,
                                                                  multiplier: 10,
                                                              },
                                                              {
                                                                  label: "5",
                                                                  value: getBilletageUSD.cinqDollars,
                                                                  multiplier: 5,
                                                              },
                                                              {
                                                                  label: "1",
                                                                  value: getBilletageUSD.unDollars,
                                                                  multiplier: 1,
                                                              },
                                                          ].map((item, idx) => (
                                                              <tr key={idx}>
                                                                  <td className="fw-semibold">
                                                                      {
                                                                          item.label
                                                                      }{" "}
                                                                      X
                                                                  </td>
                                                                  <td>
                                                                      {parseInt(
                                                                          item.value,
                                                                      ) || 0}
                                                                  </td>
                                                                  <td className="text-success">
                                                                      {(
                                                                          parseInt(
                                                                              item.value,
                                                                          ) *
                                                                          item.multiplier
                                                                      ).toLocaleString()}
                                                                  </td>
                                                              </tr>
                                                          ))}
                                                      </tbody>
                                                      <tfoot>
                                                          <tr
                                                              style={{
                                                                  backgroundColor:
                                                                      "#ffc107",
                                                                  color: "white",
                                                              }}
                                                          >
                                                              <th colSpan="2">
                                                                  Total
                                                              </th>
                                                              <th className="fw-bold">
                                                                  {getBilletageUSD.montant !==
                                                                      undefined &&
                                                                      numberWithSpaces(
                                                                          parseInt(
                                                                              getBilletageUSD.montant,
                                                                          ),
                                                                      )}
                                                              </th>
                                                          </tr>
                                                      </tfoot>
                                                  </table>
                                              </div>
                                          )
                                        : getBilletageCDF && (
                                              <div className="table-responsive">
                                                  <table className="table table-bordered">
                                                      <thead
                                                          style={{
                                                              backgroundColor:
                                                                  "#e6f2f9",
                                                          }}
                                                      >
                                                          <tr
                                                              style={{
                                                                  color: "steelblue",
                                                              }}
                                                          >
                                                              <th>Coupure</th>
                                                              <th>
                                                                  Nbr Billets
                                                              </th>
                                                              <th>Montant</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                          {[
                                                              {
                                                                  label: "20 000",
                                                                  value: getBilletageCDF.vightMilleFranc,
                                                                  multiplier: 20000,
                                                              },
                                                              {
                                                                  label: "10 000",
                                                                  value: getBilletageCDF.dixMilleFranc,
                                                                  multiplier: 10000,
                                                              },
                                                              {
                                                                  label: "5 000",
                                                                  value: getBilletageCDF.cinqMilleFranc,
                                                                  multiplier: 5000,
                                                              },
                                                              {
                                                                  label: "1 000",
                                                                  value: getBilletageCDF.milleFranc,
                                                                  multiplier: 1000,
                                                              },
                                                              {
                                                                  label: "500",
                                                                  value: getBilletageCDF.cinqCentFranc,
                                                                  multiplier: 500,
                                                              },
                                                              {
                                                                  label: "200",
                                                                  value: getBilletageCDF.deuxCentFranc,
                                                                  multiplier: 200,
                                                              },
                                                              {
                                                                  label: "100",
                                                                  value: getBilletageCDF.centFranc,
                                                                  multiplier: 100,
                                                              },
                                                              {
                                                                  label: "50",
                                                                  value: getBilletageCDF.cinquanteFanc,
                                                                  multiplier: 50,
                                                              },
                                                          ].map((item, idx) => (
                                                              <tr key={idx}>
                                                                  <td className="fw-semibold">
                                                                      {
                                                                          item.label
                                                                      }{" "}
                                                                      X
                                                                  </td>
                                                                  <td>
                                                                      {parseInt(
                                                                          item.value,
                                                                      ) || 0}
                                                                  </td>
                                                                  <td className="text-success">
                                                                      {(
                                                                          parseInt(
                                                                              item.value,
                                                                          ) *
                                                                          item.multiplier
                                                                      ).toLocaleString()}
                                                                  </td>
                                                              </tr>
                                                          ))}
                                                      </tbody>
                                                      <tfoot>
                                                          <tr
                                                              style={{
                                                                  backgroundColor:
                                                                      "#ffc107",
                                                                  color: "white",
                                                              }}
                                                          >
                                                              <th colSpan="2">
                                                                  Total
                                                              </th>
                                                              <th className="fw-bold">
                                                                  {getBilletageCDF.montant !==
                                                                      undefined &&
                                                                      numberWithSpaces(
                                                                          parseInt(
                                                                              getBilletageCDF.montant,
                                                                          ),
                                                                      )}
                                                              </th>
                                                          </tr>
                                                      </tfoot>
                                                  </table>
                                              </div>
                                          )}
                                </div>
                            </div>
                        </div>

                        {/* Bouton Validation */}
                        <div className="col-md-2">
                            <div className="card border-0 shadow-sm rounded-3 h-100">
                                <div className="card-body d-flex align-items-center justify-content-center">
                                    <button
                                        className="btn w-100 py-3 fw-bold"
                                        id="validerbtn"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #ffc107, #e0a800)",
                                            border: "none",
                                            borderRadius: "12px",
                                            fontSize: "16px",
                                            color: "white",
                                            transition: "all 0.3s ease",
                                        }}
                                        onClick={AcceptAppro}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(-2px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 6px 16px rgba(255,193,7,0.4)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "none";
                                        }}
                                    >
                                        <i
                                            className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}
                                        ></i>
                                        Valider
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Appro;
