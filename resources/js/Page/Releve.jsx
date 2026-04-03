import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";
// import { ExportCSV } from "./Print";
import { EnteteRapport } from "./HeaderReport";

const Releve = () => {
    const [loading, setloading] = useState(false);
    const [fetchData, setFetchData] = useState();
    const [fetchDataByName, setFetchDataByName] = useState();
    const [devise, setDevise] = useState("CDF");
    const [fetchData2, setfetchData2] = useState();
    const [searched_account, setsearched_account] = useState();
    const [searched_account_by_name, setsearched_account_by_name] = useState();
    const [dateDebut, setDateDebut] = useState();
    const [dateFin, setDateFin] = useState();
    const [getSelectedAccount, setGetSelectedAccount] = useState();
    const [getReleveData, setGetReleveData] = useState([]);
    const [getSoldeReport, setGetSoldeReport] = useState(0);
    const [getdefaultDateDebut, setGetdefaultDateDebut] = useState();
    const [getdefaultDateFin, setGetdefaultDateFin] = useState();
    const [getDevise, setGetDevise] = useState();
    const [getSoldeInfo, setGetSoldeInfo] = useState();
    const [getOtherInfo, setGetOtherInfo] = useState();
    const [fileName, setfileName] = useState(".xlsx");
    const [loadingData, setloadingData] = useState(false);

    const saveOperation = (e) => {
        e.preventDefault();
        setloading(true);
    };

    // useEffect(() => {}, []);
    const getSeachedData = async (e) => {
        e.preventDefault();
        setloadingData(true);
        const res = await axios.post("/eco/page/depot-espece/get-account", {
            searched_account: searched_account,
        });
        if (res.data.status == 1) {
            setloadingData(false);
            setFetchData(res.data.data);
            console.log(fetchData);
        } else {
            setloadingData(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };
    const getSeachedDataByName = async (e) => {
        e.preventDefault();

        setloadingData(true);
        const res = await axios.post("/eco/page/releve/get-account-by-name", {
            searched_account_by_name: searched_account_by_name,
        });
        if (res.data.status == 1) {
            setloadingData(false);
            setFetchDataByName(res.data.data);
            console.log(fetchDataByName);
        } else {
            setloadingData(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    const getAccountInfo = async (event) => {
        if (event.detail == 2) {
            setloadingData(true);
            const res = await axios.post(
                "/eco/page/depot-espece/get-account/specific",
                {
                    NumCompte: event.target.innerHTML,
                },
            );
            if (res.data.status == 1) {
                setloadingData(false);
                setfetchData2(res.data.data);
                console.log(fetchData2);
                setGetSelectedAccount(event.target.innerHTML);
                setGetdefaultDateDebut(res.data.defaultDateDebut);
                setGetdefaultDateFin(res.data.defaultDateFin);
                setDateDebut(getdefaultDateDebut);
                setDateFin(getdefaultDateFin);
            } else {
                setloadingData(false);
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

    //PERMET D'AFFICHER LE RELEVE
    const AfficherReleve = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/affichage-releve", {
            NumCompte: getSelectedAccount,
            DateDebut: dateDebut ? dateDebut : getdefaultDateDebut,
            DateFin: dateFin ? dateFin : getdefaultDateFin,
        });
        if (res.data.status == 1) {
            setloading(false);
            setGetReleveData(res.data.dataReleve);
            setGetSoldeReport(
                res.data.dataSoldeReport.soldeReport == undefined
                    ? 0
                    : res.data.dataSoldeReport.soldeReport,
            );
            setGetDevise(res.data.devise);
            setGetSoldeInfo(res.data.soldeInfo);
            setGetOtherInfo(res.data.getCompteInfo);
            console.log(res.data.dataSoldeReport.soldeReport);
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
    function numberWithSpaces(x) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    const dateParser = (num) => {
        const options = {
            // weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",
        };

        let timestamp = Date.parse(num);

        let date = new Date(timestamp).toLocaleDateString("fr-FR", options);

        return date.toString();
    };

    //
    // const exportTableData = (tableId) => {
    //     const s2ab = (s) => {
    //         const buf = new ArrayBuffer(s.length);
    //         const view = new Uint8Array(buf);
    //         for (let i = 0; i !== s.length; ++i)
    //             view[i] = s.charCodeAt(i) & 0xff;
    //         return buf;
    //     };

    //     const table = document.getElementById(tableId);
    //     const wb = XLSX.utils.table_to_book(table);
    //     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    //     const fileName = `table_${tableId}.xlsx`;
    //     saveAs(
    //         new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
    //         fileName
    //     );
    // };
    const exportTableData = (tableId) => {
        const s2ab = (s) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i)
                view[i] = s.charCodeAt(i) & 0xff;
            return buf;
        };

        const table = document.getElementById(tableId);

        if (!table) {
            console.error(`Table with id ${tableId} not found`);
            return;
        }

        // Convert table to workbook
        const wb = XLSX.utils.table_to_book(table, { raw: true });

        // Optionally set column widths
        const ws = wb.Sheets[wb.SheetNames[0]];
        const cols = Array.from(
            table.querySelectorAll("tr:first-child th"),
        ).map(
            () => ({ wpx: 100 }), // Set default width in pixels
        );
        ws["!cols"] = cols;

        // Write workbook
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

        // Save file
        const fileName = `table_${tableId}.xlsx`;
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            fileName,
        );
    };
    const exportToPDFCDF = () => {
        const content = document.getElementById("content-to-download-cdf");

        if (!content) {
            console.error("Element not found!");
            return;
        }

        html2canvas(content, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL("image/jpeg", 0.75); // Change to JPEG and set quality to 0.75
                const pdf = new jsPDF("p", "mm", "a4");

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(
                    imgData,
                    "JPEG",
                    0,
                    position,
                    pdfWidth,
                    imgHeight,
                    undefined,
                    "FAST",
                ); // Use 'FAST' compression
                heightLeft -= pdfHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(
                        imgData,
                        "JPEG",
                        0,
                        position,
                        pdfWidth,
                        imgHeight,
                        undefined,
                        "FAST",
                    ); // Use 'FAST' compression
                    heightLeft -= pdfHeight;
                }

                pdf.autoPrint();
                window.open(pdf.output("bloburl"), "_blank");
            })
            .catch((error) => {
                console.error("Error capturing canvas:", error);
            });
    };
    const exportToPDFUSD = () => {
        const content = document.getElementById("content-to-download-usd");

        if (!content) {
            console.error("Element not found!");
            return;
        }

        html2canvas(content, { scale: 2 }).then((canvas) => {
            const paddingTop = 50;
            const paddingRight = 50;
            const paddingBottom = 50;
            const paddingLeft = 50;

            const canvasWidth = canvas.width + paddingLeft + paddingRight;
            const canvasHeight = canvas.height + paddingTop + paddingBottom;

            const newCanvas = document.createElement("canvas");
            newCanvas.width = canvasWidth;
            newCanvas.height = canvasHeight;
            const ctx = newCanvas.getContext("2d");

            if (ctx) {
                ctx.fillStyle = "#ffffff"; // Background color
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(canvas, paddingLeft, paddingTop);
            }
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = newCanvas.toDataURL("image/jpeg", 0.8); // Use JPEG format and set quality to 0.8
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.autoPrint();
            window.open(pdf.output("bloburl"), "_blank");
        });
    };
    let myspinner = {
        margin: "5px auto",
        width: "3rem",
        marginTop: "180px",
        border: "0px",
        height: "200px",
    };
    return (
        <>
            {loadingData ? (
                <div className="row" id="rowspinner">
                    <div className="myspinner" style={myspinner}>
                        <span className="spinner-border" role="status"></span>
                        <span style={{ marginLeft: "-20px" }}>
                            Chargement...
                        </span>
                    </div>
                </div>
            ) : (
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
                                        background:
                                            "#138496",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <i
                                                className="fas fa-file-alt"
                                                style={{
                                                    fontSize: "28px",
                                                    color: "white",
                                                }}
                                            ></i>
                                        </div>
                                        <div>
                                            <h5 className="text-white fw-bold mb-0">
                                                Relevé de compte
                                            </h5>
                                            <small className="text-white-50">
                                                Consultation des mouvements du
                                                compte
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Recherche */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Recherche de compte
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <form>
                                        <table style={{ width: "100%" }}>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "6px",
                                                        }}
                                                    >
                                                        <div
                                                            className="d-flex gap-2"
                                                            style={{
                                                                flexWrap:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            <input
                                                                id="compte_to_search"
                                                                name="compte_to_search"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Numéro de compte"
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                    width: "150px",
                                                                    flex: "0 0 auto",
                                                                }}
                                                                onChange={(e) =>
                                                                    setsearched_account(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                className="btn"
                                                                style={{
                                                                    background:
                                                                        "#20c997",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "8px",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    flex: "0 0 auto",
                                                                }}
                                                                onClick={
                                                                    getSeachedData
                                                                }
                                                            >
                                                                <i className="fas fa-search me-1"></i>
                                                                Rechercher
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        style={{
                                                            padding: "6px",
                                                        }}
                                                    >
                                                        <div
                                                            className="d-flex gap-2"
                                                            style={{
                                                                flexWrap:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            <input
                                                                id="compte_to_search_by_name"
                                                                name="compte_to_search_by_name"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Nom du titulaire"
                                                                style={{
                                                                    borderRadius:
                                                                        "8px",
                                                                    width: "150px",
                                                                    flex: "0 0 auto",
                                                                }}
                                                                onChange={(e) =>
                                                                    setsearched_account_by_name(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                className="btn"
                                                                style={{
                                                                    background:
                                                                        "#20c997",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "8px",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    flex: "0 0 auto",
                                                                }}
                                                                onClick={
                                                                    getSeachedDataByName
                                                                }
                                                            >
                                                                <i className="fas fa-search me-1"></i>
                                                                Rechercher par
                                                                nom
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2">
                                                        <hr className="my-2" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-list me-2"></i>
                                        Liste des comptes
                                    </h6>
                                </div>
                                <div className="card-body p-0">
                                    <div
                                        style={{
                                            maxHeight: "280px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {fetchData ? (
                                            <table className="table table-hover mb-0">
                                                <tbody>
                                                    {fetchData.map(
                                                        (res, index) => (
                                                            <tr
                                                                key={index}
                                                                className="clickable-row"
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={(
                                                                    event,
                                                                ) =>
                                                                    getAccountInfo(
                                                                        event,
                                                                    )
                                                                }
                                                            >
                                                                <td className="py-2 px-3 fw-semibold">
                                                                    {
                                                                        res.NumCompte
                                                                    }
                                                                </td>
                                                                <td className="py-2 px-3">
                                                                    <span
                                                                        className={`badge ${res.CodeMonnaie == 1 ? "bg-info" : "bg-success"}`}
                                                                    >
                                                                        {res.CodeMonnaie ==
                                                                        1
                                                                            ? "USD"
                                                                            : "CDF"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : fetchDataByName ? (
                                            <table className="table table-hover mb-0">
                                                <tbody>
                                                    {fetchDataByName.map(
                                                        (res, index) => (
                                                            <tr
                                                                key={index}
                                                                className="clickable-row"
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={(
                                                                    event,
                                                                ) =>
                                                                    getAccountInfo(
                                                                        event,
                                                                    )
                                                                }
                                                            >
                                                                <td className="py-2 px-3 fw-semibold">
                                                                    {
                                                                        res.NumCompte
                                                                    }
                                                                </td>
                                                                <td className="py-2 px-3">
                                                                    {
                                                                        res.NomCompte
                                                                    }
                                                                </td>
                                                                <td className="py-2 px-3">
                                                                    <span
                                                                        className={`badge ${res.CodeMonnaie == 1 ? "bg-info" : "bg-success"}`}
                                                                    >
                                                                        {res.CodeMonnaie ==
                                                                        1
                                                                            ? "USD"
                                                                            : "CDF"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="text-center py-4 text-muted">
                                                <i className="fas fa-inbox fa-2x mb-2 opacity-50"></i>
                                                <p className="mb-0">
                                                    Aucun compte trouvé
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sélecteur de dates */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-12">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-calendar-alt me-2"></i>
                                        Période
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-3">
                                            <label
                                                style={{
                                                    color: "steelblue",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                Date Début
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                style={{ borderRadius: "8px" }}
                                                onChange={(e) =>
                                                    setDateDebut(e.target.value)
                                                }
                                                value={
                                                    dateDebut
                                                        ? dateDebut
                                                        : getdefaultDateDebut
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label
                                                style={{
                                                    color: "steelblue",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                Date Fin
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                style={{ borderRadius: "8px" }}
                                                onChange={(e) =>
                                                    setDateFin(e.target.value)
                                                }
                                                value={
                                                    dateFin
                                                        ? dateFin
                                                        : getdefaultDateFin
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <button
                                                className="btn w-100"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #20c997, #198764)",
                                                    color: "white",
                                                    borderRadius: "8px",
                                                }}
                                                onClick={AfficherReleve}
                                            >
                                                <i
                                                    className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-desktop me-2"}`}
                                                ></i>
                                                Afficher
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Relevé de compte */}
                    {getReleveData.length !== 0 && (
                        <div className="card border-0 shadow-sm rounded-3 mb-4">
                            <div className="card-body p-4">
                                {getDevise == "CDF" ? (
                                    <div id="content-to-download-cdf">
                                        {/* En-tête du rapport */}
                                        <div className="text-center mb-3">
                                            <EnteteRapport />
                                        </div>

                                        <div className="text-center mb-4">
                                            <h4
                                                style={{
                                                    color: "steelblue",
                                                    fontWeight: "bold",
                                                    borderBottom:
                                                        "3px solid #20c997",
                                                    display: "inline-block",
                                                    padding: "0 15px 8px",
                                                }}
                                            >
                                                RELEVÉ DE COMPTE
                                            </h4>
                                        </div>

                                        {/* Informations du compte */}
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <div
                                                    className="card border-0"
                                                    style={{
                                                        background: "#e6f2f9",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    <div className="card-body">
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Intitulé
                                                                        de
                                                                        compte
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            getOtherInfo?.NomCompte
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Compte
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            getOtherInfo?.NumCompte
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Devise
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            getDevise
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Solde
                                                                        Disponible
                                                                    </td>
                                                                    <td className="fw-bold text-success">
                                                                        {numberWithSpaces(
                                                                            getSoldeInfo?.soldeDispo?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Solde
                                                                        Reporté
                                                                    </td>
                                                                    <td className="fw-bold text-danger">
                                                                        {numberWithSpaces(
                                                                            getSoldeReport?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div
                                                    className="card border-0"
                                                    style={{
                                                        background: "#e6f2f9",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    <div className="card-body">
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Total
                                                                        Débit
                                                                    </td>
                                                                    <td className="fw-bold text-danger">
                                                                        {numberWithSpaces(
                                                                            getSoldeInfo?.TotalDebit?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Total
                                                                        Crédit
                                                                    </td>
                                                                    <td className="fw-bold text-success">
                                                                        {numberWithSpaces(
                                                                            getSoldeInfo?.TotalCredit?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Date
                                                                        Début
                                                                    </td>
                                                                    <td>
                                                                        {dateParser(
                                                                            dateDebut ||
                                                                                getdefaultDateDebut,
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Date Fin
                                                                    </td>
                                                                    <td>
                                                                        {dateParser(
                                                                            dateFin ||
                                                                                getdefaultDateFin,
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tableau des mouvements */}
                                        <div className="table-responsive">
                                            <table
                                                className="table table-bordered table-striped"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <thead
                                                    style={{
                                                        backgroundColor:
                                                            "#1a2632",
                                                        color: "white",
                                                    }}
                                                >
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Réf. Op</th>
                                                        <th>Libellé</th>
                                                        <th>Débit</th>
                                                        <th>Crédit</th>
                                                        <th>Solde</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getReleveData.map(
                                                        (res, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {dateParser(
                                                                        res.DateTransaction,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.NumTransaction
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.Libelle
                                                                    }
                                                                </td>
                                                                <td className="text-danger text-end">
                                                                    {res.Debitfc?.toLocaleString() ||
                                                                        "0,00"}
                                                                </td>
                                                                <td className="text-success text-end">
                                                                    {res.Creditfc?.toLocaleString() ||
                                                                        "0,00"}
                                                                </td>
                                                                <td className="fw-bold text-end">
                                                                    {getOtherInfo.RefCadre ==
                                                                        31 ||
                                                                    getOtherInfo.RefCadre ==
                                                                        32
                                                                        ? `(${numberWithSpaces(parseFloat(res.solde + getSoldeReport).toFixed(2))})`
                                                                        : numberWithSpaces(
                                                                              parseFloat(
                                                                                  res.solde +
                                                                                      getSoldeReport,
                                                                              ).toFixed(
                                                                                  2,
                                                                              ),
                                                                          )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                                <tfoot
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <tr className="fw-bold">
                                                        <td
                                                            colSpan="3"
                                                            className="text-end"
                                                        >
                                                            TOTAUX :
                                                        </td>
                                                        <td className="text-danger text-end">
                                                            {numberWithSpaces(
                                                                getSoldeInfo?.TotalDebit?.toFixed(
                                                                    2,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="text-success text-end">
                                                            {numberWithSpaces(
                                                                getSoldeInfo?.TotalCredit?.toFixed(
                                                                    2,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            {numberWithSpaces(
                                                                getSoldeInfo?.soldeDispo?.toFixed(
                                                                    2,
                                                                ),
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div id="content-to-download-usd">
                                        {/* En-tête du rapport USD */}
                                        <div className="text-center mb-3">
                                            <EnteteRapport />
                                        </div>
                                        <div className="text-center mb-4">
                                            <h4
                                                style={{
                                                    color: "steelblue",
                                                    fontWeight: "bold",
                                                    borderBottom:
                                                        "3px solid #20c997",
                                                    display: "inline-block",
                                                    padding: "0 15px 8px",
                                                }}
                                            >
                                                RELEVÉ DE COMPTE
                                            </h4>
                                        </div>

                                        {/* Informations du compte USD */}
                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <div
                                                    className="card border-0"
                                                    style={{
                                                        background: "#e6f2f9",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    <div className="card-body">
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Intitulé
                                                                        de
                                                                        compte
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            getOtherInfo?.NomCompte
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Compte
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            getOtherInfo?.NumCompte
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Devise
                                                                    </td>
                                                                    <td className="fw-semibold">
                                                                        {
                                                                            getDevise
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Solde
                                                                        Disponible
                                                                    </td>
                                                                    <td className="fw-bold text-success">
                                                                        {numberWithSpaces(
                                                                            getSoldeInfo?.soldeDispo?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Solde
                                                                        Reporté
                                                                    </td>
                                                                    <td className="fw-bold text-danger">
                                                                        {numberWithSpaces(
                                                                            getSoldeReport?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div
                                                    className="card border-0"
                                                    style={{
                                                        background: "#e6f2f9",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    <div className="card-body">
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Total
                                                                        Débit
                                                                    </td>
                                                                    <td className="fw-bold text-danger">
                                                                        {numberWithSpaces(
                                                                            getSoldeInfo?.TotalDebit?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Total
                                                                        Crédit
                                                                    </td>
                                                                    <td className="fw-bold text-success">
                                                                        {numberWithSpaces(
                                                                            getSoldeInfo?.TotalCredit?.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Date
                                                                        Début
                                                                    </td>
                                                                    <td>
                                                                        {dateParser(
                                                                            dateDebut ||
                                                                                getdefaultDateDebut,
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        className="fw-bold"
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        Date Fin
                                                                    </td>
                                                                    <td>
                                                                        {dateParser(
                                                                            dateFin ||
                                                                                getdefaultDateFin,
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tableau des mouvements USD */}
                                        <div className="table-responsive">
                                            <table
                                                className="table table-bordered table-striped"
                                                style={{ fontSize: "13px" }}
                                            >
                                                <thead
                                                    style={{
                                                        backgroundColor:
                                                            "#1a2632",
                                                        color: "white",
                                                    }}
                                                >
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Réf. Op</th>
                                                        <th>Libellé</th>
                                                        <th>Débit</th>
                                                        <th>Crédit</th>
                                                        <th>Solde</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getReleveData.map(
                                                        (res, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {dateParser(
                                                                        res.DateTransaction,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.NumTransaction
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        res.Libelle
                                                                    }
                                                                </td>
                                                                <td className="text-danger text-end">
                                                                    {res.Debitusd?.toLocaleString() ||
                                                                        "0,00"}
                                                                </td>
                                                                <td className="text-success text-end">
                                                                    {res.Creditusd?.toLocaleString() ||
                                                                        "0,00"}
                                                                </td>
                                                                <td className="fw-bold text-end">
                                                                    {getOtherInfo.RefCadre ==
                                                                        31 ||
                                                                    getOtherInfo.RefCadre ==
                                                                        32
                                                                        ? `(${numberWithSpaces(parseFloat(res.solde + getSoldeReport).toFixed(2))})`
                                                                        : numberWithSpaces(
                                                                              parseFloat(
                                                                                  res.solde +
                                                                                      getSoldeReport,
                                                                              ).toFixed(
                                                                                  2,
                                                                              ),
                                                                          )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                                <tfoot
                                                    style={{
                                                        backgroundColor:
                                                            "#e6f2f9",
                                                    }}
                                                >
                                                    <tr className="fw-bold">
                                                        <td
                                                            colSpan="3"
                                                            className="text-end"
                                                        >
                                                            TOTAUX :
                                                        </td>
                                                        <td className="text-danger text-end">
                                                            {numberWithSpaces(
                                                                getSoldeInfo?.TotalDebit?.toFixed(
                                                                    2,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="text-success text-end">
                                                            {numberWithSpaces(
                                                                getSoldeInfo?.TotalCredit?.toFixed(
                                                                    2,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            {numberWithSpaces(
                                                                getSoldeInfo?.soldeDispo?.toFixed(
                                                                    2,
                                                                ),
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Boutons d'export */}
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        onClick={() =>
                                            exportTableData(
                                                getDevise == "CDF"
                                                    ? "content-to-download-cdf"
                                                    : "content-to-download-usd",
                                            )
                                        }
                                        className="btn"
                                        style={{
                                            background: "#28a745",
                                            color: "white",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <i className="fas fa-file-excel me-2"></i>
                                        Exporter en Excel
                                    </button>
                                    <button
                                        onClick={
                                            getDevise == "CDF"
                                                ? exportToPDFCDF
                                                : exportToPDFUSD
                                        }
                                        className="btn"
                                        style={{
                                            background: "#dc3545",
                                            color: "white",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <i className="fas fa-file-pdf me-2"></i>
                                        Exporter en PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message si aucune donnée */}
                    {getReleveData.length === 0 &&
                        getReleveData !== undefined && (
                            <div className="text-center py-5">
                                <i className="fas fa-inbox fa-4x mb-3 text-muted"></i>
                                <p className="text-muted">
                                    Aucune opération trouvée pour la période
                                    sélectionnée.
                                </p>
                            </div>
                        )}
                </div>
            )}
        </>
    );
};

export default Releve;
