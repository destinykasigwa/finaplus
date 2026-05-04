const TableWithPagination = ({ data, itemsPerPage, renderRow }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (totalPages === 0) return null;

    return (
        <>
            <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                    <thead>
                        <tr style={{ color: "steelblue" }}>
                            {/* <th>Réf.</th> */}
                            <th>Montant</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>{currentData.map(renderRow)}</tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-1 border-top">
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ padding: "2px 6px", fontSize: "11px" }}
                    >
                        <i className="fas fa-chevron-left"></i> Préc.
                    </button>
                    <span
                        className="small text-muted"
                        style={{ fontSize: "10px" }}
                    >
                        {currentPage}/{totalPages}
                    </span>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ padding: "2px 6px", fontSize: "11px" }}
                    >
                        Suiv. <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </>
    );
};

// import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import RecuDepot from "./Modals/RecuDepot";
import { Bars } from "react-loader-spinner";
import RecuDepotA5 from "./Modals/RecuDepotA5";
// import { useNavigate } from "react-router-dom";

const RetraitEspece = () => {
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

    const [numDocument, setnumDocument] = useState();
    const [fetchData, setFetchData] = useState();
    const [devise, setDevise] = useState("CDF");
    const [motifRetrait, setMotifRetrait] = useState("RETRAIT D'ESPECE");
    // const [Retirant, setRetirant] = useState();
    // const [RetirantPhone, setRetirantPhone] = useState();
    const [Montant, setMontant] = useState(0);
    const [loading, setloading] = useState(false);
    const [error, setError] = useState([]);
    const [Commission, setCommission] = useState(0);
    const [GetCommissionConfig, setGetCommissionConfig] = useState("");
    const [GetRecuConfig, setGetRecuConfig] = useState("");
    const [getBilletageCDF, setGetBilletageCDF] = useState();
    const [getBilletageUSD, setGetBilletageUSD] = useState();
    const [selectedData, setSelectedData] = useState(null);
    const [isLoadingBar, setIsLoadingBar] = useState();
    const [fetchInfo, setFetchInfo] = useState(false);

    const [fetchBilletageCDF, setFetchBilletageCDF] = useState();
    const [fetchBilletageUSD, setFetchBilletageUSD] = useState();

    //GET SEACHED DATA
    const getSeachedData = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/retrait/get-document", {
            numDocument: numDocument,
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

    useEffect(() => {
        getCommissionConfig();
        getBilletage();
        GetInformation();
    }, []);

    const getBilletage = async () => {
        const res = await axios.get("/eco/retrait/get-recu");
        if (res.data.status == 1) {
            setGetBilletageCDF(res.data.dataCDF);
            setGetBilletageUSD(res.data.dataUSD);
        }
    };

    const GetInformation = async () => {
        const res = await axios.get(
            "/eco/page/delestage/get-billetage-caissier",
        );
        if (res.data.status == 1) {
            setFetchBilletageCDF(res.data.billetageCDF[0]);
            setFetchBilletageUSD(res.data.billetageUSD[0]);
            setFetchInfo(true);
        }
    };

    const getCommissionConfig = async () => {
        const res = await axios.get("/eco/pages/get-commission-setting");
        if (res.data.status == 1) {
            console.log(res.data.data);
            setGetCommissionConfig(res.data.data);
            setGetRecuConfig(res.data.type_recu);
        }
    };
    const saveOperation = async (e) => {
        e.preventDefault();
        setloading(true);
        setIsLoadingBar(true);
        const res = await axios.post("/eco/page/depot-espece/save-retrait", {
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
            devise: fetchData.CodeMonnaie,
            motifRetrait,
            Retirant: fetchData.Retirant,
            RetirantPhone: fetchData.NumTel,
            Montant: fetchData.Montant,
            NumAbrege: fetchData.RefCompte,
            // numDocument: fetchData.NumDocument,
            numDocument: numDocument,
            Commission,
        });
        if (res.data.status == 1) {
            setloading(false);
            setIsLoadingBar(false);
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
            getBilletage();
            GetInformation();
        } else if (res.data.status == 0) {
            setloading(false);
            setIsLoadingBar(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 100000,
                confirmButtonText: "Okay",
            });
        } else {
            setloading(false);
            setIsLoadingBar(false);
            setError(res.data.validate_error);
        }
    };

    const handlePrintClick = (data) => {
        setSelectedData(data);
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
                                        className="fas fa-money-bill-wave"
                                        style={{
                                            fontSize: "28px",
                                            color: "white",
                                        }}
                                    ></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">
                                        Retrait D'Espèce
                                    </h5>
                                    <small className="text-white-50">
                                        Opération de retrait d'espèces
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-3">
                {/* Loading Overlay */}
                {isLoadingBar && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            zIndex: 1050,
                            backdropFilter: "blur(3px)",
                        }}
                    >
                        <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                            <Bars
                                height="80"
                                width="80"
                                color="#dc3545"
                                ariaLabel="loading"
                            />
                            <h5 className="mt-3 text-dark">Patientez...</h5>
                            <small className="text-muted">
                                Traitement en cours
                            </small>
                        </div>
                    </div>
                )}

                {/* Section Recherche Compte */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-header bg-white border-0 pt-3 pb-0">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-search me-2"></i>Recherche
                                Compte
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <div className="input-group">
                                    <input
                                        id="compte_to_search"
                                        name="compte_to_search"
                                        type="text"
                                        className="form-control"
                                        placeholder="Numéro de document..."
                                        style={{
                                            borderRadius: "10px 0 0 10px",
                                        }}
                                        onChange={(e) => {
                                            setnumDocument(e.target.value);
                                        }}
                                    />
                                    <button
                                        className="btn"
                                        style={{
                                            borderRadius: "0 10px 10px 0",
                                            background: "#dc3545",
                                            color: "white",
                                            border: "none",
                                        }}
                                        onClick={getSeachedData}
                                    >
                                        <i className="fas fa-search me-1"></i>
                                        Rechercher
                                    </button>
                                </div>
                            </div>
                            <hr className="my-3" />

                            <form>
                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        <tr>
                                            <td
                                                style={{
                                                    padding: "5px",
                                                    width: "40%",
                                                }}
                                            >
                                                <label
                                                    style={{
                                                        color: "steelblue",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    Intitulé de compte
                                                </label>
                                            </td>
                                            <td style={{ padding: "5px" }}>
                                                <input
                                                    id="NomCompte"
                                                    name="NomCompte"
                                                    type="text"
                                                    className="form-control"
                                                    style={{
                                                        borderRadius: "8px",
                                                        backgroundColor:
                                                            "#f8f9fa",
                                                    }}
                                                    value={
                                                        fetchData &&
                                                        fetchData.NomCompte
                                                    }
                                                    disabled
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "5px" }}>
                                                <label
                                                    style={{
                                                        color: "steelblue",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    Numéro de compte
                                                </label>
                                            </td>
                                            <td style={{ padding: "5px" }}>
                                                <input
                                                    id="NumCompte"
                                                    name="NumCompte"
                                                    type="text"
                                                    className="form-control"
                                                    style={{
                                                        borderRadius: "8px",
                                                        backgroundColor:
                                                            "#f8f9fa",
                                                    }}
                                                    disabled
                                                    value={
                                                        fetchData &&
                                                        fetchData.NumCompte
                                                    }
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "5px" }}>
                                                <label
                                                    style={{
                                                        color: "steelblue",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    Code Agence
                                                </label>
                                            </td>
                                            <td style={{ padding: "5px" }}>
                                                <input
                                                    id="CodeAgence"
                                                    name="CodeAgence"
                                                    type="text"
                                                    className="form-control"
                                                    style={{
                                                        borderRadius: "8px",
                                                        backgroundColor:
                                                            "#f8f9fa",
                                                        width: "100px",
                                                    }}
                                                    value={
                                                        fetchData &&
                                                        fetchData.CodeAgence
                                                    }
                                                    disabled
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
                </div>
                {/* Billetage Disponible */}

                {fetchInfo && (
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-money-bill me-2"></i>
                                    Billetage Disponible en CDF
                                </h6>
                            </div>
                            <div
                                className="card-body"
                                style={{
                                    maxHeight: "450px",
                                    overflowY: "auto",
                                }}
                            >
                                {fetchBilletageCDF && (
                                    <div className="table-responsive">
                                        <table
                                            className="table table-bordered table-sm table-ultra-compact"
                                            style={{
                                                fontSize: "12px",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            <thead
                                                style={{
                                                    backgroundColor: "#e6f2f9",
                                                }}
                                            >
                                                <tr
                                                    style={{
                                                        color: "steelblue",
                                                    }}
                                                >
                                                    <th>Coupure</th>
                                                    <th>Nbr Billets</th>
                                                    <th>Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    {
                                                        label: "20 000",
                                                        value: fetchBilletageCDF.vightMilleFranc,
                                                        multiplier: 20000,
                                                    },
                                                    {
                                                        label: "10 000",
                                                        value: fetchBilletageCDF.dixMilleFranc,
                                                        multiplier: 10000,
                                                    },
                                                    {
                                                        label: "5 000",
                                                        value: fetchBilletageCDF.cinqMilleFranc,
                                                        multiplier: 5000,
                                                    },
                                                    {
                                                        label: "1 000",
                                                        value: fetchBilletageCDF.milleFranc,
                                                        multiplier: 1000,
                                                    },
                                                    {
                                                        label: "500",
                                                        value: fetchBilletageCDF.cinqCentFranc,
                                                        multiplier: 500,
                                                    },
                                                    {
                                                        label: "200",
                                                        value: fetchBilletageCDF.deuxCentFranc,
                                                        multiplier: 200,
                                                    },
                                                    {
                                                        label: "100",
                                                        value: fetchBilletageCDF.centFranc,
                                                        multiplier: 100,
                                                    },
                                                    {
                                                        label: "50",
                                                        value: fetchBilletageCDF.cinquanteFanc,
                                                        multiplier: 50,
                                                    },
                                                ].map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-semibold">
                                                            {item.label} X
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
                                                            "#6c757d",
                                                        color: "white",
                                                    }}
                                                >
                                                    <th colSpan="2">Total</th>
                                                    <th className="fw-bold">
                                                        {fetchBilletageCDF.sommeMontantCDF !==
                                                            undefined &&
                                                            numberWithSpaces(
                                                                parseInt(
                                                                    fetchBilletageCDF.sommeMontantCDF,
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
                )}

                {fetchInfo && (
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-money-bill me-2"></i>
                                    Billetage Disponible en USD
                                </h6>
                            </div>
                            <div
                                className="card-body"
                                style={{
                                    maxHeight: "450px",
                                    overflowY: "auto",
                                }}
                            >
                                {fetchBilletageUSD && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm table-ultra-compact">
                                            <thead
                                                style={{
                                                    backgroundColor: "#e6f2f9",
                                                }}
                                            >
                                                <tr
                                                    style={{
                                                        color: "steelblue",
                                                    }}
                                                >
                                                    <th>Coupure</th>
                                                    <th>Nbr Billets</th>
                                                    <th>Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    {
                                                        label: "100",
                                                        value: fetchBilletageUSD.centDollars,
                                                        multiplier: 100,
                                                    },
                                                    {
                                                        label: "50",
                                                        value: fetchBilletageUSD.cinquanteDollars,
                                                        multiplier: 50,
                                                    },
                                                    {
                                                        label: "20",
                                                        value: fetchBilletageUSD.vightDollars,
                                                        multiplier: 20,
                                                    },
                                                    {
                                                        label: "10",
                                                        value: fetchBilletageUSD.dixDollars,
                                                        multiplier: 10,
                                                    },
                                                    {
                                                        label: "5",
                                                        value: fetchBilletageUSD.cinqDollars,
                                                        multiplier: 5,
                                                    },
                                                    {
                                                        label: "1",
                                                        value: fetchBilletageUSD.unDollars,
                                                        multiplier: 1,
                                                    },
                                                ].map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="fw-semibold">
                                                            {item.label} X
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
                                                            "#6c757d",
                                                        color: "white",
                                                    }}
                                                >
                                                    <th colSpan="2">Total</th>
                                                    <th className="fw-bold">
                                                        {fetchBilletageUSD.sommeMontantUSD !==
                                                            undefined &&
                                                            numberWithSpaces(
                                                                parseInt(
                                                                    fetchBilletageUSD.sommeMontantUSD,
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
                )}
            </div>

            {/* Séparateur décoratif */}
            <div className="position-relative my-4">
                <hr className="border-2" style={{ borderColor: "#e9ecef" }} />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    <i className="fas fa-arrow-down me-1"></i> Informations de
                    retrait
                </span>
            </div>

            {/* Section Formulaire de retrait */}
            <div className="row g-3">
                {/* Informations du retrait */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-info-circle me-2"></i>
                                Informations
                            </h6>
                        </div>
                        <div className="card-body">
                            <form>
                                <fieldset>
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
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Devise
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        id="devise"
                                                        name="devise"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            backgroundColor:
                                                                "#f8f9fa",
                                                        }}
                                                        onChange={(e) => {
                                                            setDevise(
                                                                e.target.value,
                                                            );
                                                        }}
                                                        disabled
                                                    >
                                                        <option
                                                            value={
                                                                fetchData &&
                                                                fetchData.CodeMonnaie
                                                            }
                                                        >
                                                            {fetchData &&
                                                                fetchData.CodeMonnaie}
                                                        </option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Motif
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        id="motifRetrait"
                                                        name="motifRetrait"
                                                        type="text"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            textTransform:
                                                                "uppercase",
                                                        }}
                                                        onChange={(e) =>
                                                            setMotifRetrait(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={motifRetrait}
                                                        placeholder="Motif du retrait"
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Bénéficiaire
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        id="Retirant"
                                                        name="Retirant"
                                                        type="text"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            backgroundColor:
                                                                "#f8f9fa",
                                                        }}
                                                        disabled
                                                        value={
                                                            fetchData &&
                                                            fetchData.Retirant
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Téléphone
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        id="RetirantPhone"
                                                        name="RetirantPhone"
                                                        type="text"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            backgroundColor:
                                                                "#f8f9fa",
                                                        }}
                                                        disabled
                                                        value={
                                                            fetchData &&
                                                            fetchData.NumTel
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            {GetCommissionConfig == 1 && (
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
                                                            Commission
                                                        </label>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "8px",
                                                        }}
                                                    >
                                                        <input
                                                            id="Commission"
                                                            name="Commission"
                                                            type="text"
                                                            className="form-control"
                                                            style={{
                                                                borderRadius:
                                                                    "8px",
                                                                width: "100px",
                                                            }}
                                                            onChange={(e) =>
                                                                setCommission(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            value={Commission}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Montant
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        id="Montant"
                                                        name="Montant"
                                                        type="text"
                                                        className="form-control"
                                                        style={{
                                                            borderRadius: "8px",
                                                            fontWeight: "bold",
                                                            fontSize: "18px",
                                                            backgroundColor:
                                                                "#f8f9fa",
                                                        }}
                                                        disabled
                                                        value={
                                                            fetchData &&
                                                            fetchData.Montant
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </fieldset>
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
                            style={{ maxHeight: "500px", overflowY: "auto" }}
                        >
                            {fetchData && fetchData.CodeMonnaie == "USD" ? (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead
                                            style={{
                                                backgroundColor: "#e6f2f9",
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
                                                            value={item.value}
                                                            onChange={(e) =>
                                                                item.set(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="fw-bold text-danger">
                                                        {(
                                                            item.value *
                                                            item.multiplier
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr
                                                style={{
                                                    backgroundColor: "#e6f2f9",
                                                }}
                                            >
                                                <th>Total</th>
                                                <th>
                                                    {parseInt(hundred) +
                                                        parseInt(fitfty) +
                                                        parseInt(twenty) +
                                                        parseInt(ten) +
                                                        parseInt(five) +
                                                        parseInt(oneDollar)}
                                                </th>
                                                <th
                                                    className="fw-bold fs-5"
                                                    style={{ color: "#dc3545" }}
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
                                                backgroundColor: "#e6f2f9",
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
                                                            value={item.value}
                                                            onChange={(e) =>
                                                                item.set(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="fw-bold text-danger">
                                                        {(
                                                            item.value *
                                                            item.multiplier
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr
                                                style={{
                                                    backgroundColor: "#e6f2f9",
                                                }}
                                            >
                                                <th>Total</th>
                                                <th>
                                                    {parseInt(vightMille) +
                                                        parseInt(dixMille) +
                                                        parseInt(cinqMille) +
                                                        parseInt(milleFranc) +
                                                        parseInt(cinqCentFr) +
                                                        parseInt(
                                                            deuxCentFranc,
                                                        ) +
                                                        parseInt(centFranc) +
                                                        parseInt(cinquanteFanc)}
                                                </th>
                                                <th
                                                    className="fw-bold fs-5"
                                                    style={{ color: "#dc3545" }}
                                                >
                                                    {(
                                                        vightMille * 20000 +
                                                        dixMille * 10000 +
                                                        cinqMille * 5000 +
                                                        milleFranc * 1000 +
                                                        cinqCentFr * 500 +
                                                        deuxCentFranc * 200 +
                                                        centFranc * 100 +
                                                        cinquanteFanc * 50
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

                {/* Actions et historique */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-3 mb-3">
                        <div className="card-body">
                            <button
                                className="btn w-100 py-2 fw-bold"
                                id="validerbtn"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #dc3545, #b02a37)",
                                    border: "none",
                                    borderRadius: "10px",
                                    fontSize: "16px",
                                    color: "white",
                                }}
                                onClick={saveOperation}
                                disabled={
                                    (fetchData && fetchData.CodeMonnaie == "USD"
                                        ? hundred * 100 +
                                              fitfty * 50 +
                                              twenty * 20 +
                                              ten * 10 +
                                              five * 5 +
                                              oneDollar * 1 !==
                                          parseInt(
                                              fetchData && fetchData.Montant,
                                          )
                                        : vightMille * 20000 +
                                              dixMille * 10000 +
                                              cinqMille * 5000 +
                                              milleFranc * 1000 +
                                              cinqCentFr * 500 +
                                              deuxCentFranc * 200 +
                                              centFranc * 100 +
                                              cinquanteFanc * 50 !==
                                          parseInt(
                                              fetchData && fetchData.Montant,
                                          )) || !fetchData
                                }
                            >
                                <i
                                    className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}
                                ></i>
                                Valider le retrait
                            </button>
                        </div>
                    </div>

                    {/* Historique des opérations */}
                    {/* <div className="card border-0 shadow-sm rounded-3" style={{ maxHeight: "450px", overflowY: "auto" }}>
                <div className="card-header bg-white border-0 pt-3 sticky-top bg-white">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-history me-2"></i>Opérations récentes
                    </h6>
                </div>
                <div className="card-body p-0">
                    {getBilletageCDF && getBilletageCDF.length > 0 && (
                        <>
                            <div className="px-3 py-2" style={{ backgroundColor: "#e6f2f9" }}>
                                <small className="fw-bold" style={{ color: "steelblue" }}>CDF</small>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-3 table-ultra-compact">
                                    <thead>
                                        <tr style={{ color: "steelblue" }}>
                                            <th>Réf.</th>
                                            <th>Montant</th>
                                            <th>Bénéficiaire</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getBilletageCDF.map((res, index) => (
                                            <tr key={index}>
                                                <td><small>{res.refOperation}</small></td>
                                                <td className="fw-bold text-danger">{res.montantSortie?.toLocaleString()}</td>
                                                <td><small>{res.Beneficiaire}</small></td>
                                                <td>
                                                    <button
                                                        onClick={() => handlePrintClick(res)}
                                                        data-toggle="modal"
                                                        data-target="#modal-delestage-cdf"
                                                        className="btn btn-sm"
                                                        style={{ background: "#dc3545", color: "white", borderRadius: "6px", padding: "2px 8px", fontSize: "11px" }}
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {getBilletageUSD && getBilletageUSD.length > 0 && (
                        <>
                            <div className="px-3 py-2 mt-2" style={{ backgroundColor: "#e6f2f9" }}>
                                <small className="fw-bold" style={{ color: "steelblue" }}>USD</small>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-sm table-hover table-ultra-compact">
                                    <thead>
                                        <tr style={{ color: "steelblue" }}>
                                            <th>Réf.</th>
                                            <th>Montant</th>
                                            <th>Bénéficiaire</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getBilletageUSD.map((res, index) => (
                                            <tr key={index}>
                                                <td><small>{res.refOperation}</small></td>
                                                <td className="fw-bold text-danger">{res.montantSortie?.toLocaleString()}</td>
                                                <td><small>{res.Beneficiaire}</small></td>
                                                <td>
                                                    <button
                                                        onClick={() => handlePrintClick(res)}
                                                        data-toggle="modal"
                                                        data-target="#modal-delestage-cdf"
                                                        className="btn btn-sm"
                                                        style={{ background: "#dc3545", color: "white", borderRadius: "6px", padding: "2px 8px", fontSize: "11px" }}
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {(!getBilletageCDF || getBilletageCDF.length === 0) && 
                     (!getBilletageUSD || getBilletageUSD.length === 0) && (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                            <p className="mb-0">Aucune opération récente</p>
                        </div>
                    )}
                </div>
                      </div> */}
                    {/* Historique des opérations avec pagination */}
                    <div
                        className="card border-0 shadow-sm rounded-3"
                        style={{ maxHeight: "450px", overflowY: "auto" }}
                    >
                        <div className="card-header bg-white border-0 pt-3 sticky-top bg-white">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-history me-2"></i>
                                Opérations récentes
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            {/* Section CDF */}
                            {getBilletageCDF && getBilletageCDF.length > 0 && (
                                <>
                                    <div
                                        className="px-3 py-2"
                                        style={{ backgroundColor: "#e6f2f9" }}
                                    >
                                        <small
                                            className="fw-bold"
                                            style={{ color: "steelblue" }}
                                        >
                                            CDF
                                        </small>
                                    </div>
                                    <TableWithPagination
                                        data={getBilletageCDF}
                                        itemsPerPage={3}
                                        renderRow={(res, idx) => (
                                            <tr key={idx}>
                                                {/* <td>
                                                    <small>
                                                        {res.refOperation}
                                                    </small>
                                                </td> */}
                                                <td className="fw-bold text-danger">
                                                    {res.montantSortie?.toLocaleString()}
                                                </td>
                                                <td>
                                                    <small>
                                                        {res.Beneficiaire}
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
                                                        data-target="#modal-delestage-cdf"
                                                        className="btn btn-sm"
                                                        style={{
                                                            background:
                                                                "#dc3545",
                                                            color: "white",
                                                            borderRadius: "6px",
                                                            padding: "2px 8px",
                                                            fontSize: "11px",
                                                        }}
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    />
                                </>
                            )}

                            {/* Section USD */}
                            {getBilletageUSD && getBilletageUSD.length > 0 && (
                                <>
                                    <div
                                        className="px-3 py-2 mt-2"
                                        style={{ backgroundColor: "#e6f2f9" }}
                                    >
                                        <small
                                            className="fw-bold"
                                            style={{ color: "steelblue" }}
                                        >
                                            USD
                                        </small>
                                    </div>
                                    <TableWithPagination
                                        data={getBilletageUSD}
                                        itemsPerPage={3}
                                        renderRow={(res, idx) => (
                                            <tr key={idx}>
                                                {/* <td>
                                                    <small>
                                                        {res.refOperation}
                                                    </small>
                                                </td> */}
                                                <td className="fw-bold text-danger">
                                                    {res.montantSortie?.toLocaleString()}
                                                </td>
                                                <td>
                                                    <small>
                                                        {res.Beneficiaire}
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
                                                        data-target="#modal-delestage-cdf"
                                                        className="btn btn-sm"
                                                        style={{
                                                            background:
                                                                "#dc3545",
                                                            color: "white",
                                                            borderRadius: "6px",
                                                            padding: "2px 8px",
                                                            fontSize: "11px",
                                                        }}
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    />
                                </>
                            )}

                            {(!getBilletageCDF ||
                                getBilletageCDF.length === 0) &&
                                (!getBilletageUSD ||
                                    getBilletageUSD.length === 0) && (
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

            {/* Modal d'impression */}
            {selectedData &&
                (GetRecuConfig === "Thermique" ? (
                    <RecuDepot data={selectedData} />
                ) : GetRecuConfig === "A5" ? (
                    <RecuDepotA5 data={selectedData} />
                ) : null)}
            <style>
                {`
        /* Styles personnalisés pour un tableau ultra compact */
.table-ultra-compact {
    border-collapse: collapse;
}

.table-ultra-compact th,
.table-ultra-compact td {
    padding: 0.2rem 0.35rem; /* Réduction drastique du padding */
    line-height: 1.2;
    font-size: 0.8rem; /* Optionnel : légère réduction de la police */
}
        `}
            </style>
        </div>
    );
};

export default RetraitEspece;
