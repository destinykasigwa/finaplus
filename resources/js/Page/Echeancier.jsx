import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";

const Echeancier = () => {
    const [loading, setloading] = useState(false);
    const [error, setError] = useState([]);
    const [fetchEcheancier, setfetchEcheancier] = useState();
    const [fetchTableauAmortiss, setfetchTableauAmortiss] = useState();
    const [fetchSommeInteret, setfetchSommeInteret] = useState();
    const [fetchSommeInteretAmmo, setfetchSommeInteretAmmo] = useState();
    const [fetchSoldeEncourCDF, setfetchSoldeEncourCDF] = useState();
    const [fetchSoldeEncourUSD, setfetchSoldeEncourUSD] = useState();
    const [fetchTotCapRetardCDF, setfetchTotCapRetardCDF] = useState();
    const [fetchTotCapRetardUSD, setfetchTotCapRetardUSD] = useState();
    const [fetchBalanceAgee, setfetchBalanceAgee] = useState();
    const [searched_num_dossier, setsearched_num_dossier] = useState();

    const [accountName, setAccountName] = useState();
    const [fetchCapitalRestant, setfetchCapitalRestant] = useState();
    const [fetchCapitalRetard, setfetchCapitalRetard] = useState();
    const [fetchInteretRetard, setfetchInteretRetard] = useState();
    const [fetchCapitalRembourse, setfetchCapitalRembourse] = useState();
    const [fetchInteretRembourse, setfetchInteretRembourse] = useState();
    const [fetchInteretRestant, setfetchInteretRestant] = useState();
    const [radioValue, setRadioValue] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [devise, setdevise] = useState();
    const [fetchAgentCredit, setFetchAgentCredit] = useState();
    const [agent_credit_name, setagent_credit_name] = useState();

    // AJOUT PAR - États spécifiques
    const [fetchGestionnaires, setFetchGestionnaires] = useState([]);
    const [gestionnaire, setGestionnaire] = useState("");
    const [parCategory, setParCategory] = useState("");
    const [fetchParData, setFetchParData] = useState(null);
    const [totalParData, setTotalParData] = useState(null);
    const [datePar, setDatePar] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [parGlobalPercent, setParGlobalPercent] = useState(0);
    const [globalPercentages, setGlobalPercentages] = useState(null);

    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0"); // Les mois commencent à 0, donc ajoutez 1
        const day = String(today.getDate()).padStart(2, "0");
        setSelectedDate(`${year}-${month}-${day}`);
        setTimeout(() => {
            getAgentCredit();
            getGestionnaires(); // AJOUT PAR - charger liste gestionnaires
        }, 2000);
    }, []); // Le tableau vide [] signifie que cet effet s'exécute une seule fois après le premier rendu

    const getAgentCredit = async () => {
        const res = await axios.get(
            "/eco/page/rapport/get-echeancier/agent-credit",
        );
        if (res.data.status == 1) {
            setFetchAgentCredit(res.data.get_agent_credit);
            console.log(fetchAgentCredit);
        }
    };

    // AJOUT PAR - récupération de la liste des gestionnaires
    const getGestionnaires = async () => {
        const res = await axios.get(
            "/eco/page/rapport/get-echeancier/agent-credit",
        );
        if (res.data.status == 1) {
            setFetchGestionnaires(res.data.get_agent_credit);
        }
    };

    //GET SEACHED DATA
    const getSeachedData = async (e) => {
        e.preventDefault();
        setloading(true);
        let url = "/eco/page/montage-credit/get-echeancier";
        let params = {
            searched_num_dossier: searched_num_dossier,
            radioValue,
            selectedDate,
            devise,
            agent_credit_name,
        };
        // AJOUT PAR - ajouter les paramètres spécifiques au PAR
        if (radioValue === "par") {
            params = {
                ...params,
                date_par: datePar,
                devise_par: devise,
                gestionnaire_par: agent_credit_name,
                par_category: parCategory,
            };
        }
        const res = await axios.post(url, params);
        if (res.data.status == 1) {
            setloading(false);
            if (radioValue === "echeancier") {
                setfetchEcheancier(res.data.data);
                setfetchSommeInteret(res.data.sommeInteret);
                setAccountName(res.data.NomCompte);
                // ... autres setters existants
            } else if (radioValue === "tableau_ammortiss") {
                setfetchTableauAmortiss(res.data.data_ammortissement);
                setfetchSommeInteretAmmo(res.data.sommeInteret_ammort);
                setAccountName(res.data.NomCompte);
                setfetchCapitalRestant(res.data.soldeRestant);
                setfetchCapitalRetard(res.data.soldeEnRetard);
                setfetchInteretRetard(res.data.soldeEnRetard);
                setfetchCapitalRembourse(res.data.capitalRembourse);
                setfetchInteretRembourse(res.data.interetRembourse);
                setfetchInteretRestant(res.data.interetRestant);
            } else if (radioValue === "balance_agee") {
                setfetchBalanceAgee(res.data.data_balance_agee);
                setfetchSoldeEncourCDF(res.data.soldeEncourCDF);
                setfetchSoldeEncourUSD(res.data.soldeEncourUSD);
                setfetchTotCapRetardCDF(res.data.totRetardCDF);
                setfetchTotCapRetardUSD(res.data.totRetardUSD);
            }
            // AJOUT PAR - traitement des données PAR
            else if (radioValue === "par") {
                //setFetchParData(res.data.par_data); // attendre { par_data: [], totaux, etc. }
                setFetchParData(res.data.data);
                setTotalParData(res.data.total);
                setParGlobalPercent(res.data.par_global_percent);
                setGlobalPercentages(res.data.global_percentages); // AJOUT

                console.log(fetchParData);
                // const encoursGlobal = res.data.encours_global;
            }
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
    // const handleRadioChange = (event) => {
    //     setRadioValue(event.target.value);
    // };
    const handleRadioChange = (event) => {
        setRadioValue(event.target.value);
        // Réinitialiser les données affichées pour éviter les mélanges
        if (event.target.value !== "par") setFetchParData(null);
        if (event.target.value !== "balance_agee") setfetchBalanceAgee(null);
        if (event.target.value !== "echeancier") setfetchEcheancier(null);
        if (event.target.value !== "tableau_ammortiss")
            setfetchTableauAmortiss(null);
    };
    let compteur = 0;
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
    //PERMET DE FORMATER LES CHIFFRES
    const numberFormat = (number = 0) => {
        let locales = [
            //undefined,  // Your own browser
            "en-US", // United States
            //'de-DE',    // Germany
            //'ru-RU',    // Russia
            //'hi-IN',    // India
        ];
        let opts = { minimumFractionDigits: 2 };
        let index = 3;
        let nombre = number.toLocaleString(locales[index], opts);
        if (nombre === isNaN) {
            nombre = 0.0;
        } else {
            return nombre;
        }
    };

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

    const exportToPDFEcheancier = () => {
        const content = document.getElementById(
            "content-to-download-echeancier",
        );

        if (!content) {
            console.error("Element not found!");
            return;
        }

        html2canvas(content, { scale: 3 }).then((canvas) => {
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
            const imgData = newCanvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.autoPrint();
            window.open(pdf.output("bloburl"), "_blank");
            // pdf.save("releve-de-compte.pdf");
        });
    };

    const exportToPDFBalanceAgee = () => {
        const content = document.getElementById(
            "content-to-download-balance_agee",
        );

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

    const exportToPDFAmmortiss = () => {
        const content = document.getElementById(
            "content-to-download-ammortissemment",
        );

        if (!content) {
            console.error("Element not found!");
            return;
        }

        html2canvas(content, { scale: 3 }).then((canvas) => {
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
            const imgData = newCanvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.autoPrint();
            window.open(pdf.output("bloburl"), "_blank");
            // pdf.save("releve-de-compte.pdf");
        });
    };

    function numberWithSpaces(x = 0) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    const groupByTranches = (data) => {
        const groupedData = {
            "Crédits sains": [],
            "En retard de 1 à 30 jrs": [],
            "En retard de 31 à 60 jours": [],
            "En retard de 61 à 90 jours": [],
            "En retard de 91 à 180 jours": [],
            "En retard de plus de 180 jours": [],
        };

        fetchBalanceAgee &&
            fetchBalanceAgee.forEach((item) => {
                if (item.NbrJrRetard <= 0 || item.NbrJrRetard === null) {
                    groupedData["Crédits sains"].push(item);
                } else if (item.NbrJrRetard >= 1 && item.NbrJrRetard <= 30) {
                    groupedData["En retard de 1 à 30 jrs"].push(item);
                } else if (item.NbrJrRetard >= 31 && item.NbrJrRetard <= 60) {
                    groupedData["En retard de 31 à 60 jours"].push(item);
                } else if (item.NbrJrRetard >= 61 && item.NbrJrRetard <= 90) {
                    groupedData["En retard de 61 à 90 jours"].push(item);
                } else if (item.NbrJrRetard >= 91 && item.NbrJrRetard <= 180) {
                    groupedData["En retard de 91 à 180 jours"].push(item);
                } else if (item.NbrJrRetard > 180) {
                    groupedData["En retard de plus de 180 jours"].push(item);
                }
            });

        return groupedData;
    };

    // AJOUT PAR - export PDF pour PAR
    const exportToPDFPar = () => {
        const content = document.getElementById("content-to-download-par");
        if (!content) return;
        html2canvas(content, { scale: 3 }).then((canvas) => {
            const padding = 50;
            const canvasWidth = canvas.width + padding * 2;
            const canvasHeight = canvas.height + padding * 2;
            const newCanvas = document.createElement("canvas");
            newCanvas.width = canvasWidth;
            newCanvas.height = canvasHeight;
            const ctx = newCanvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(canvas, padding, padding);
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = newCanvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.autoPrint();
            window.open(pdf.output("bloburl"), "_blank");
        });
    };

    const safePAR = (value) => Math.max(0, Number(value ?? 0));
    const formatPAR = (value) => numberWithSpaces(safePAR(value).toFixed(2));

    const groupedData = groupByTranches(fetchBalanceAgee);

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
                                        className="fas fa-chart-line"
                                        style={{
                                            fontSize: "28px",
                                            color: "white",
                                        }}
                                    ></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">
                                        Rapports de Crédit
                                    </h5>
                                    <small className="text-white-50">
                                        Échéancier, Tableau d'amortissement et
                                        Balance âgée
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Formulaire de recherche */}
            {/* Section Formulaire de recherche - version stylée pleine largeur */}
<div className="row g-4 mb-5">
    <div className="col-12">
        <div className="card border-0 shadow rounded-4">
            <div className="card-header bg-white border-0 pt-4 pb-2">
                <h6 className="fw-bold fs-5 mb-0" style={{ color: "#1a4d8c" }}>
                    <i className="fas fa-search me-2"></i>Type de rapport
                </h6>
                <p className="text-muted small mt-1 mb-0">Sélectionnez le rapport et affinez les filtres</p>
            </div>
            <div className="card-body pt-0">
                <form>
                    {/* Ligne 1 : Numéro dossier + boutons radio */}
                    <div className="row g-3 align-items-end">
                        <div className="col-md-5">
                            <label className="form-label fw-semibold small text-secondary">
                                <i className="fas fa-folder-open me-1"></i> Numéro dossier
                            </label>
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0">
                                    <i className="fas fa-hashtag text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Ex: D2025-001"
                                    onChange={(e) => setsearched_num_dossier(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-7">
                            <label className="form-label fw-semibold small text-secondary mb-2">
                                <i className="fas fa-chart-line me-1"></i> Type de rapport
                            </label>
                            <div className="d-flex flex-wrap gap-2">
                                {[
                                    { id: "echeancier_", value: "echeancier", icon: "fa-calendar-alt", label: "Échéancier" },
                                    { id: "tableau_ammortiss", value: "tableau_ammortiss", icon: "fa-table", label: "Tableau d'amortissement" },
                                    { id: "balance_agee", value: "balance_agee", icon: "fa-balance-scale", label: "Balance âgée" },
                                    { id: "par_report", value: "par", icon: "fa-chart-pie", label: "PAR" }
                                ].map(opt => (
                                    <div className="form-check" key={opt.id}>
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id={opt.id}
                                            name="reportType"
                                            value={opt.value}
                                            checked={radioValue === opt.value}
                                            onChange={handleRadioChange}
                                        />
                                        <label className="form-check-label" htmlFor={opt.id}>
                                            <i className={`fas ${opt.icon} me-1 text-primary`}></i>
                                            {opt.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filtres conditionnels : Balance âgée */}
                    {radioValue === "balance_agee" && (
                        <div className="row g-3 mt-4 pt-2 border-top">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small text-secondary">
                                    <i className="far fa-calendar-alt me-1"></i> Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setdate_balance_agee(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small text-secondary">
                                    <i className="fas fa-money-bill-wave me-1"></i> Devise
                                </label>
                                <select className="form-select" onChange={(e) => setdevise(e.target.value)}>
                                    <option value="">Dévise</option>
                                    <option value="CDF">CDF</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small text-secondary">
                                    <i className="fas fa-user-tie me-1"></i> Agent de crédit
                                </label>
                                <select className="form-select" onChange={(e) => setagent_credit_name(e.target.value)}>
                                    <option value="">Tous</option>
                                    {fetchAgentCredit?.map((res, idx) => (
                                        <option key={idx} value={res.name}>{res.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button
                                    className="btn btn-success w-100 shadow-sm"
                                    onClick={getSeachedData}
                                    disabled={loading}
                                    style={{ background: "linear-gradient(135deg, #20c997, #198764)", border: "none" }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                        <i className="fas fa-desktop me-2"></i>
                                    )}
                                    Afficher
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filtres conditionnels : PAR */}
                    {radioValue === "par" && (
                        <div className="row g-3 mt-4 pt-2 border-top">
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small text-secondary">
                                    <i className="far fa-calendar-check me-1"></i> Date de référence
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={datePar}
                                    onChange={(e) => setDatePar(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small text-secondary">
                                    <i className="fas fa-coins me-1"></i> Devise
                                </label>
                                <select className="form-select" onChange={(e) => setdevise(e.target.value)}>
                                    <option value="">Toutes</option>
                                    <option value="CDF">CDF</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold small text-secondary">
                                    <i className="fas fa-users me-1"></i> Gestionnaire
                                </label>
                                <select className="form-select" onChange={(e) => setagent_credit_name(e.target.value)}>
                                    <option value="">Tous</option>
                                    {fetchAgentCredit?.map((res, idx) => (
                                        <option key={idx} value={res.name}>{res.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button
                                    className="btn btn-success w-100 shadow-sm"
                                    onClick={getSeachedData}
                                    disabled={loading}
                                    style={{ background: "linear-gradient(135deg, #20c997, #198764)", border: "none" }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                        <i className="fas fa-chart-pie me-2"></i>
                                    )}
                                    Afficher
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bouton simple pour Échéancier / Amortissement */}
                    {radioValue && radioValue !== "balance_agee" && radioValue !== "par" && (
                        <div className="row mt-4 pt-2 border-top">
                            <div className="col-md-4 mx-auto">
                                <button
                                    className="btn btn-success w-100 shadow-sm"
                                    onClick={getSeachedData}
                                    disabled={loading}
                                    style={{ background: "linear-gradient(135deg, #20c997, #198764)", border: "none" }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                        <i className="fas fa-download me-2"></i>
                                    )}
                                    Afficher
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    </div>
</div>

            {/* Séparateur décoratif */}
            <div className="position-relative my-4">
                <hr className="border-2" style={{ borderColor: "#e9ecef" }} />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    <i className="fas fa-chart-bar me-1"></i> Résultats
                </span>
            </div>

            {/* ÉCHÉANCIER */}
            {fetchEcheancier &&
                radioValue == "echeancier" &&
                fetchEcheancier.length != 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <div id="content-to-download-echeancier">
                                <div id="main-table-echeancier">
                                    {/* En-tête du rapport */}
                                    <div className="text-center mb-4">
                                        <EnteteRapport />
                                    </div>

                                    {/* Titre */}
                                    <div className="text-center mb-4">
                                        <h4
                                            style={{
                                                background: "#1a2632",
                                                padding: "10px",
                                                color: "#fff",
                                                borderRadius: "8px",
                                                display: "inline-block",
                                            }}
                                        >
                                            <i className="fas fa-calendar-check me-2"></i>
                                            ECHEANCIER DE REMBOURSEMENT N°{" "}
                                            {searched_num_dossier}
                                        </h4>
                                    </div>

                                    {/* Informations du crédit */}
                                    <div className="row g-3 mb-4">
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
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Intitulé :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {
                                                                        fetchEcheancier[0]
                                                                            ?.NomCompte
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    C. épargne :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {
                                                                        fetchEcheancier[0]
                                                                            ?.NumCompteEpargne
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Type crédit
                                                                    :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {
                                                                        fetchEcheancier[0]
                                                                            ?.RefProduitCredit
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Durée :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {
                                                                        fetchEcheancier[0]
                                                                            ?.Duree
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Montant :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "#20c997",
                                                                    }}
                                                                >
                                                                    {numberFormat(
                                                                        fetchEcheancier[0]
                                                                            ?.MontantAccorde,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    N° Dossier :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {
                                                                        searched_num_dossier
                                                                    }
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
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Date octroi
                                                                    :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {dateParser(
                                                                        fetchEcheancier[0]
                                                                            ?.DateOctroi,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    C. crédit :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {
                                                                        fetchEcheancier[0]
                                                                            ?.NumCompteCredit
                                                                    }
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Total
                                                                    intérêt :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            fetchSommeInteret?.sommeInteret,
                                                                        ),
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Total
                                                                    Capital :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {numberFormat(
                                                                        fetchEcheancier[0]
                                                                            ?.MontantAccorde,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Total à
                                                                    payer :
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        background:
                                                                            "#20c997",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "6px",
                                                                        fontWeight:
                                                                            "bold",
                                                                    }}
                                                                >
                                                                    {numberFormat(
                                                                        parseFloat(
                                                                            fetchEcheancier[0]
                                                                                ?.MontantAccorde,
                                                                        ) +
                                                                            parseFloat(
                                                                                fetchSommeInteret?.sommeInteret,
                                                                            ),
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tableau Échéancier */}
                                    <div className="table-responsive">
                                        <table
                                            className="table table-bordered table-striped"
                                            style={{ fontSize: "13px" }}
                                        >
                                            <thead
                                                style={{
                                                    backgroundColor: "#1a2632",
                                                    color: "white",
                                                }}
                                            >
                                                <tr>
                                                    <th>N°</th>
                                                    <th>Date D'échéance</th>
                                                    <th>Capital</th>
                                                    <th>Intérêt</th>
                                                    <th>C. Ammorti</th>
                                                    <th>Tot à payer</th>
                                                    <th>C. restant dû</th>
                                                    <th>Epargne</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let compteur = 1;
                                                    return fetchEcheancier.map(
                                                        (res, index) => (
                                                            <tr key={index}>
                                                                <td className="fw-bold">
                                                                    {compteur++}
                                                                </td>
                                                                <td>
                                                                    {dateParser(
                                                                        res.DateTranch,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            res.Capital,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            res.Interet,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            res.CapAmmorti,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td className="fw-bold text-success">
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            res.TotalAp,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            res.Cumul,
                                                                        ),
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberFormat(
                                                                        parseInt(
                                                                            res.Epargne,
                                                                        ),
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    );
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Signatures */}
                                    <div className="row mt-5 pt-4">
                                        <div className="col-md-6">
                                            <div
                                                style={{
                                                    borderTop: "2px solid #000",
                                                    width: "200px",
                                                    paddingTop: "5px",
                                                }}
                                            >
                                                <small>Signature client</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <div
                                                style={{
                                                    borderTop: "2px solid #000",
                                                    width: "200px",
                                                    marginLeft: "auto",
                                                    paddingTop: "5px",
                                                }}
                                            >
                                                <small>
                                                    Signature agent de crédit
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons d'export */}
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    onClick={() =>
                                        exportTableData("main-table-echeancier")
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
                                    onClick={exportToPDFEcheancier}
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

            {/* TABLEAU D'AMORTISSEMENT */}
            {fetchTableauAmortiss &&
                radioValue == "tableau_ammortiss" &&
                fetchTableauAmortiss.length != 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <div id="content-to-download-ammortissemment">
                                {/* En-tête */}
                                <div className="text-center mb-4">
                                    <EnteteRapport />
                                </div>

                                {/* Titre */}
                                <div className="text-center mb-4">
                                    <h4
                                        style={{
                                            background: "#1a2632",
                                            padding: "10px",
                                            color: "#fff",
                                            borderRadius: "8px",
                                            display: "inline-block",
                                        }}
                                    >
                                        <i className="fas fa-chart-line me-2"></i>
                                        TABLEAU D'AMORTISSEMENT DE CREDIT N°{" "}
                                        {searched_num_dossier}
                                    </h4>
                                </div>

                                {/* Informations récapitulatives */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-3">
                                        <div
                                            className="card border-0"
                                            style={{
                                                background: "#e6f2f9",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <div className="card-body p-2">
                                                <table
                                                    style={{
                                                        width: "100%",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                TypeCrédit :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.RefProduitCredit
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                N°COMPTE :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.NumCompteEpargne
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Intitulé :
                                                            </td>
                                                            <td>
                                                                {
                                                                    accountName?.NomCompte
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                ModeRemb. :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.ModeRemboursement
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Gestionn. :
                                                            </td>
                                                            <td>
                                                                {
                                                                    accountName?.Gestionnaire
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div
                                            className="card border-0"
                                            style={{
                                                background: "#e6f2f9",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <div className="card-body p-2">
                                                <table
                                                    style={{
                                                        width: "100%",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Durée en jour :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.Duree
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Nbre tranche :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.NbrTranche
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Date Octroi :
                                                            </td>
                                                            <td>
                                                                {dateParser(
                                                                    fetchTableauAmortiss[0]
                                                                        ?.DateOctroi,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Date Échéance :
                                                            </td>
                                                            <td>
                                                                {dateParser(
                                                                    fetchTableauAmortiss[0]
                                                                        ?.DateTombeEcheance,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                NumDossier :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.NumDossier
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div
                                            className="card border-0"
                                            style={{
                                                background: "#e6f2f9",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <div className="card-body p-2">
                                                <table
                                                    style={{
                                                        width: "100%",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Type Mensualité
                                                                :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.ModeRemboursement
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Taux d'intérêt :
                                                            </td>
                                                            <td>
                                                                {
                                                                    fetchTableauAmortiss[0]
                                                                        ?.TauxInteret
                                                                }{" "}
                                                                %
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Intérêt
                                                                remboursé :
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    fetchInteretRembourse?.intereRembourse,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Intérêt Restant
                                                                :
                                                            </td>
                                                            <td>
                                                                {fetchInteretRestant?.intereRestant?.toFixed(
                                                                    2,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Intérêt en
                                                                Retard :
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    fetchInteretRetard?.sommeInteretRetard,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div
                                            className="card border-0"
                                            style={{
                                                background: "#e6f2f9",
                                                borderRadius: "12px",
                                            }}
                                        >
                                            <div className="card-body p-2">
                                                <table
                                                    style={{
                                                        width: "100%",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Montant Accordé
                                                                :
                                                            </td>
                                                            <td className="text-success fw-bold">
                                                                {numberFormat(
                                                                    parseInt(
                                                                        fetchTableauAmortiss[0]
                                                                            ?.MontantAccorde,
                                                                    ),
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Capital
                                                                Remboursé :
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    fetchCapitalRembourse,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Capital Restant
                                                                dû :
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    fetchCapitalRestant,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="fw-bold">
                                                                Capital en
                                                                Retard :
                                                            </td>
                                                            <td className="text-danger">
                                                                {numberFormat(
                                                                    fetchCapitalRetard?.sommeCapitalRetard,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tableau d'amortissement */}
                                <div className="table-responsive">
                                    <table
                                        className="table table-bordered"
                                        style={{ fontSize: "12px" }}
                                    >
                                        <thead
                                            style={{
                                                backgroundColor: "#1a2632",
                                                color: "white",
                                            }}
                                        >
                                            <tr>
                                                <th rowSpan="2">N°</th>
                                                <th rowSpan="2">
                                                    Date Tranche
                                                </th>
                                                <th colSpan="4">
                                                    ÉCHÉANCIER PRÉVISIONNEL
                                                </th>
                                                <th colSpan="3">
                                                    REMBOURS. EFFECTIFS
                                                </th>
                                                <th colSpan="3">
                                                    REMBOURS. EN RETARD
                                                </th>
                                                <th rowSpan="2">
                                                    TOT. EN RETARD
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>Capital</th>
                                                <th>Intérêt</th>
                                                <th>Épargne</th>
                                                <th>Pénalités</th>
                                                <th>Capital</th>
                                                <th>Intérêt</th>
                                                <th>Épargne</th>
                                                <th>Capital</th>
                                                <th>Intérêt</th>
                                                <th>Épargne</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                let compteur = 1;
                                                return fetchTableauAmortiss.map(
                                                    (res, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {compteur++}
                                                            </td>
                                                            <td>
                                                                {dateParser(
                                                                    res.DateTranch,
                                                                )}
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.CapAmmorti,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.Interet,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.Epargne,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td>
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.Penalite,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td
                                                                className={
                                                                    parseInt(
                                                                        res.CapitalPaye,
                                                                    ) > 0
                                                                        ? "bg-success text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.CapitalPaye,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td
                                                                className={
                                                                    parseInt(
                                                                        res.InteretPaye,
                                                                    ) > 0
                                                                        ? "bg-success text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.InteretPaye,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td
                                                                className={
                                                                    parseInt(
                                                                        res.EpargnePaye,
                                                                    ) > 0
                                                                        ? "bg-success text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {numberFormat(
                                                                    parseInt(
                                                                        res.EpargnePaye,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td
                                                                className={
                                                                    parseInt(
                                                                        res.CapAmmorti,
                                                                    ) -
                                                                        parseInt(
                                                                            res.CapitalPaye,
                                                                        ) >
                                                                    0
                                                                        ? "bg-danger text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {numberFormat(
                                                                    Math.max(
                                                                        0,
                                                                        parseInt(
                                                                            res.CapAmmorti,
                                                                        ) -
                                                                            parseInt(
                                                                                res.CapitalPaye,
                                                                            ),
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td
                                                                className={
                                                                    parseInt(
                                                                        res.Interet,
                                                                    ) -
                                                                        parseInt(
                                                                            res.InteretPaye,
                                                                        ) >
                                                                    0
                                                                        ? "bg-danger text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {numberFormat(
                                                                    Math.max(
                                                                        0,
                                                                        parseInt(
                                                                            res.Interet,
                                                                        ) -
                                                                            parseInt(
                                                                                res.InteretPaye,
                                                                            ),
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td
                                                                className={
                                                                    parseInt(
                                                                        res.Epargne,
                                                                    ) -
                                                                        parseInt(
                                                                            res.EpargnePaye,
                                                                        ) >
                                                                    0
                                                                        ? "bg-danger text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {numberFormat(
                                                                    Math.max(
                                                                        0,
                                                                        parseInt(
                                                                            res.Epargne,
                                                                        ) -
                                                                            parseInt(
                                                                                res.EpargnePaye,
                                                                            ),
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td className="bg-warning">
                                                                {numberFormat(
                                                                    Math.max(
                                                                        0,
                                                                        parseInt(
                                                                            res.CapAmmorti,
                                                                        ) -
                                                                            parseInt(
                                                                                res.CapitalPaye,
                                                                            ) +
                                                                            parseInt(
                                                                                res.Interet,
                                                                            ) -
                                                                            parseInt(
                                                                                res.InteretPaye,
                                                                            ) +
                                                                            parseInt(
                                                                                res.Epargne,
                                                                            ) -
                                                                            parseInt(
                                                                                res.EpargnePaye,
                                                                            ),
                                                                    ),
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Boutons d'export */}
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    onClick={() =>
                                        exportTableData(
                                            "content-to-download-ammortissemment",
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
                                    onClick={exportToPDFAmmortiss}
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

            {/* BALANCE AGÉE */}
            {fetchBalanceAgee &&
                fetchBalanceAgee.length != 0 &&
                radioValue == "balance_agee" && (
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <div id="content-to-download-balance_agee">
                                {/* En-tête */}
                                <div className="text-center mb-4">
                                    <EnteteRapport />
                                </div>

                                {/* Titre */}
                                <div className="text-center mb-4">
                                    <h4
                                        style={{
                                            background: "#1a2632",
                                            padding: "10px",
                                            color: "#fff",
                                            borderRadius: "8px",
                                            display: "inline-block",
                                        }}
                                    >
                                        <i className="fas fa-balance-scale me-2"></i>
                                        BALANCE AGÉE EN {devise} -{" "}
                                        {dateParser(new Date())}
                                    </h4>
                                </div>

                                {/* Tableau Balance âgée */}
                                <div className="table-responsive">
                                    <table
                                        className="table table-bordered"
                                        style={{ fontSize: "12px" }}
                                    >
                                        <thead
                                            style={{
                                                backgroundColor: "#1a2632",
                                                color: "white",
                                            }}
                                        >
                                            <tr>
                                                <th rowSpan="2">N°</th>
                                                <th rowSpan="2">NumDossier</th>
                                                <th rowSpan="2">Num</th>
                                                <th rowSpan="2">NomCompte</th>
                                                <th rowSpan="2">Durée</th>
                                                <th rowSpan="2">DateOctroi</th>
                                                <th rowSpan="2">Échéance</th>
                                                <th rowSpan="2">Accordé</th>
                                                <th colSpan="2">Remboursé</th>
                                                <th colSpan="2">Restant dû</th>
                                                <th colSpan="5">
                                                    En retard En Jours
                                                </th>
                                                <th rowSpan="2">
                                                    Jour de Retard
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>Capital</th>
                                                <th>Intérêt</th>
                                                <th>Capital</th>
                                                <th>Intérêt</th>
                                                <th>1 à 30</th>
                                                <th>31 à 60</th>
                                                <th>61 à 90</th>
                                                <th>91 à 180</th>
                                                <th>Plus de 180</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(groupedData).map(
                                                ([tranche, items]) => (
                                                    <React.Fragment
                                                        key={tranche}
                                                    >
                                                        {items.length > 0 && (
                                                            <>
                                                                <tr
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#444",
                                                                        color: "white",
                                                                    }}
                                                                >
                                                                    <td colSpan="20">
                                                                        <strong>
                                                                            {
                                                                                tranche
                                                                            }
                                                                        </strong>
                                                                    </td>
                                                                </tr>
                                                                {items.map(
                                                                    (
                                                                        res,
                                                                        idx,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                idx
                                                                            }
                                                                        >
                                                                            <td>
                                                                                {idx +
                                                                                    1}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.NumDossier
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.NumCompteCredit
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.NomCompte
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.Duree
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {dateParser(
                                                                                    res.DateOctroi,
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {dateParser(
                                                                                    res.DateEcheance,
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {numberWithSpaces(
                                                                                    res.MontantAccorde,
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {numberWithSpaces(
                                                                                    res.TotalCapitalRembourse?.toFixed(
                                                                                        2,
                                                                                    ),
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {numberWithSpaces(
                                                                                    res.TotalInteretRembourse?.toFixed(
                                                                                        2,
                                                                                    ),
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {numberWithSpaces(
                                                                                    res.CapitalRestant?.toFixed(
                                                                                        2,
                                                                                    ),
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {numberWithSpaces(
                                                                                    res.InteretRestant?.toFixed(
                                                                                        2,
                                                                                    ),
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                -
                                                                            </td>
                                                                            <td>
                                                                                -
                                                                            </td>
                                                                            <td>
                                                                                -
                                                                            </td>
                                                                            <td>
                                                                                -
                                                                            </td>
                                                                            <td>
                                                                                -
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.NbrJrRetard
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </>
                                                        )}
                                                    </React.Fragment>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Encours global */}
                                <div className="row mt-4">
                                    <div className="col-md-6">
                                        {devise == "CDF" && (
                                            <div className="alert alert-success">
                                                <strong>
                                                    Encours global de crédit CDF
                                                    :
                                                </strong>{" "}
                                                {numberWithSpaces(
                                                    fetchSoldeEncourCDF &&
                                                        fetchSoldeEncourCDF.toFixed(
                                                            2,
                                                        ),
                                                )}
                                            </div>
                                        )}
                                        {devise == "USD" && (
                                            <div className="alert alert-success">
                                                <strong>
                                                    Encours global de crédit USD
                                                    :
                                                </strong>{" "}
                                                {numberWithSpaces(
                                                    fetchSoldeEncourUSD &&
                                                        fetchSoldeEncourUSD.toFixed(
                                                            2,
                                                        ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Taux déliquence */}
                                {devise === "CDF" && (
                                    <div
                                        className="row mt-3 p-3"
                                        style={{
                                            background: "#e6f2f9",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <div className="col-md-12">
                                            <h5>
                                                Taux déliquence (PAR) ={" "}
                                                <span className="fw-bold">
                                                    {numberWithSpaces(
                                                        fetchTotCapRetardCDF &&
                                                            fetchTotCapRetardCDF.toFixed(
                                                                2,
                                                            ),
                                                    )}{" "}
                                                    %
                                                </span>
                                            </h5>
                                            <hr />
                                            <small className="text-muted">
                                                Restant dû de crédit avec au
                                                moins un remboursement en retard
                                                / (Crédit sain + Restant dû de
                                                crédit avec retard) × 100 (≤5%)
                                            </small>
                                        </div>
                                    </div>
                                )}
                                {devise == "USD" && (
                                    <div
                                        className="row mt-3 p-3"
                                        style={{
                                            background: "#e6f2f9",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <div className="col-md-12">
                                            <h5>
                                                Taux déliquence (PAR) ={" "}
                                                <span className="fw-bold">
                                                    {numberWithSpaces(
                                                        fetchTotCapRetardUSD &&
                                                            fetchTotCapRetardUSD.toFixed(
                                                                2,
                                                            ),
                                                    )}{" "}
                                                    %
                                                </span>
                                            </h5>
                                            <hr />
                                            <small className="text-muted">
                                                Restant dû de crédit avec au
                                                moins un remboursement en retard
                                                / (Crédit sain + Restant dû de
                                                crédit avec retard) × 100 (≤5%)
                                            </small>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Boutons d'export */}
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    onClick={() =>
                                        exportTableData(
                                            "content-to-download-balance_agee",
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
                                    onClick={exportToPDFBalanceAgee}
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

            {/* AJOUT PAR - Affichage du rapport PAR */}
            {/* RAPPORT PAR - STYLE PDF */}
            {fetchParData &&
                radioValue === "par" &&
                fetchParData.length !== 0 && (
                    <div className="card border-0 shadow-sm rounded-3 mb-4">
                        <div className="card-body p-4">
                            <div id="content-to-download-par">
                                {/* En-tête de l'institution (identique au PDF) */}
                                <div className="text-center mb-3">
                                    <EnteteRapport />
                                    {/* <div
                                        className="mt-2"
                                        style={{
                                            fontSize: "12px",
                                            color: "#555",
                                        }}
                                    >
                                        13, RUE NZUMUKA JAMES AV. MONT GOMA Q.
                                        LES VOLCANS, C. GOMA
                                        <br />
                                        Agrément BCC: GOUV./D.033/N°000733;
                                        N°IMPOT : A1102952X, ID.NAT: T89643G
                                        <br />
                                        Tél : +243970237272 E-mail :
                                        coopecakibayetu@gmail.com
                                    </div> */}
                                </div>

                                {/* Titre principal */}
                                <div className="text-center mb-4">
                                    <h5
                                        style={{
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        ENCOURS SYNTHESE PAR GESTIONNAIRE EN{" "}
                                        {devise || "TOUTES DEVISES"}
                                        <br />
                                        AGENCE DE GOMA AU {dateParser(datePar)}
                                    </h5>
                                </div>

                                {/* Tableau compact (padding réduit) */}
                                <div className="table-responsive">
                                    <table
                                        className="table table-bordered table-sm"
                                        style={{
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                        }}
                                        id="par-table"
                                    >
                                        <thead
                                            style={{
                                                backgroundColor: "#e6f2f9",
                                                color: "#1a2632",
                                            }}
                                        >
                                            <tr>
                                                <th>GESTIONNAIRE</th>
                                                <th className="text-end">
                                                    Nbr
                                                </th>
                                                <th className="text-end">
                                                    Accordé
                                                </th>
                                                <th className="text-end">
                                                    Encours
                                                </th>
                                                <th className="text-end">
                                                    Sain
                                                </th>
                                                <th className="text-end">
                                                    1-30
                                                </th>
                                                <th className="text-end">
                                                    31-60
                                                </th>
                                                <th className="text-end">
                                                    61-90
                                                </th>
                                                <th className="text-end">
                                                    91-180
                                                </th>
                                                <th className="text-end">
                                                    +180
                                                </th>
                                                <th className="text-end">
                                                    PAR≥1
                                                </th>
                                                <th className="text-end">
                                                    PAR{">"}30
                                                </th>
                                                <th className="text-end">
                                                    PAR{">"}60
                                                </th>
                                                <th className="text-end">
                                                    PAR{">"}90
                                                </th>
                                                <th className="text-end">
                                                    % PAR interne
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fetchParData.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold">
                                                        {item.Gestionnaire}
                                                    </td>
                                                    <td className="text-end">
                                                        {item.NbrCredits}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            item.TotalAccorde?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        {numberWithSpaces(
                                                            item.EncoursTotal?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            item.EncoursSain?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_1_30
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_31_60
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_61_90
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_91_180
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_PLUS_180
                                                            
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold text-danger">
                                                        {formatPAR(
                                                            item.PAR_SUP_1
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_SUP_30
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_SUP_60
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            item.PAR_SUP_90
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        {item.TAUX_PAR_INTERNE?.toFixed(
                                                            2,
                                                        )}{" "}
                                                        %
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* TOTAL GÉNÉRAL */}
                                            {totalParData && (
                                                <tr
                                                    style={{
                                                        backgroundColor:
                                                            "#f2f2f2",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    <td>TOTAL GENERAL</td>
                                                    <td className="text-end">
                                                        {
                                                            totalParData.NbrCredits
                                                        }
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            totalParData.TotalAccorde?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            totalParData.EncoursTotal?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            totalParData.EncoursSain?.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_1_30
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_31_60
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_61_90
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_91_180
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_PLUS_180
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold text-danger">
                                                        {formatPAR(
                                                            totalParData.PAR_SUP_1
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_SUP_30
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_SUP_60
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatPAR(
                                                            totalParData.PAR_SUP_90
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        {totalParData.TAUX_PAR_INTERNE?.toFixed(
                                                            2,
                                                        )}{" "}
                                                        %
                                                    </td>
                                                </tr>
                                            )}

                                            {/* LIGNE DES POURCENTAGES GLOBAUX (Sain, retards, PAR cumulés) */}
                                            {globalPercentages && (
                                                <tr
                                                    style={{
                                                        backgroundColor:
                                                            "#e9ecef",
                                                        fontStyle: "italic",
                                                    }}
                                                >
                                                    <td className="fw-bold">
                                                        % / Encours global
                                                    </td>
                                                    <td className="text-end">
                                                        {" "}
                                                    </td>{" "}
                                                    {/* vide pour Nbr */}
                                                    <td className="text-end">
                                                        {" "}
                                                    </td>{" "}
                                                    {/* vide pour Accordé */}
                                                    <td className="text-end">
                                                        {" "}
                                                    </td>{" "}
                                                    {/* vide pour Encours */}
                                                    <td className="text-end fw-bold text-success">
                                                        {globalPercentages.Sain}{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages[
                                                                "1_30"
                                                            ]
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages[
                                                                "31_60"
                                                            ]
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages[
                                                                "61_90"
                                                            ]
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages[
                                                                "91_180"
                                                            ]
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages.Plus180
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end fw-bold text-danger">
                                                        {
                                                            globalPercentages.PAR_SUP_1
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages.PAR_SUP_30
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages.PAR_SUP_60
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {
                                                            globalPercentages.PAR_SUP_90
                                                        }{" "}
                                                        %
                                                    </td>
                                                    <td className="text-end">
                                                        {" "}
                                                    </td>
                                                </tr>
                                            )}
                                            {/* Ligne de pourcentage global (comme dans le PDF) */}
                                            <tr
                                                style={{
                                                    backgroundColor: "#ffeeba",
                                                }}
                                            >
                                                <td
                                                    colSpan="14"
                                                    className="text-end fw-bold"
                                                >
                                                    MOYENNE GLOBALE DU PAR :
                                                </td>
                                                <td className="text-end fw-bold text-danger">
                                                    {parGlobalPercent} %
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Boutons d'export */}
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    onClick={() => exportTableData("par-table")}
                                    className="btn btn-success btn-sm"
                                >
                                    <i className="fas fa-file-excel me-2"></i>
                                    Excel
                                </button>
                                <button
                                    onClick={exportToPDFPar}
                                    className="btn btn-danger btn-sm"
                                >
                                    <i className="fas fa-file-pdf me-2"></i>PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Message aucun résultat (adapté) */}
            {radioValue &&
                !fetchEcheancier &&
                !fetchTableauAmortiss &&
                !fetchBalanceAgee &&
                !fetchParData && (
                    <div className="text-center py-5">
                        <i className="fas fa-inbox fa-4x mb-3 text-muted"></i>
                        <p className="text-muted">Aucune donnée à afficher.</p>
                    </div>
                )}
            <div style={{ height: "30px" }}></div>

            {/* Message si aucun résultat
    {radioValue && !fetchEcheancier && !fetchTableauAmortiss && !fetchBalanceAgee && (
        <div className="text-center py-5">
            <i className="fas fa-inbox fa-4x mb-3 text-muted"></i>
            <p className="text-muted">Aucune donnée à afficher. Veuillez sélectionner un type de rapport et un numéro de dossier.</p>
        </div>
    )} */}
            <div style={{ height: "30px" }}></div>
        </div>
    );
};

export default Echeancier;
