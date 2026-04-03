import { useState, useEffect } from "react";
import React, { Fragment } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";

const Bilan = () => {
    const [loading, setloading] = useState(false);
    const [date_debut_balance, setdate_debut_balance] = useState("");
    const [date_fin_balance, setdate_fin_balance] = useState("");
    const [radioValue, setRadioValue] = useState("type_balance");
    const [radioValue2, setRadioValue2] = useState("porte_detaillee");
    const [devise, setdevise] = useState("CDF");
    const [fetchActif, setFetchActif] = useState([]);
    const [fetchPassif, setFetchPassif] = useState([]);
    const [currentPageActif, setCurrentPageActif] = useState(1);
    const [currentPagePassif, setCurrentPagePassif] = useState(1);
    const [totalActif, setTotalActif] = useState(0);
    const [totalPassif, setTotalPassif] = useState(0);

    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        setdate_fin_balance(`${year}-${month}-${day}`);

        const lastDayPrevMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
        );
        const year2 = lastDayPrevMonth.getFullYear();
        const month2 = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0");
        const day2 = String(lastDayPrevMonth.getDate()).padStart(2, "0");
        setdate_debut_balance(`${year2}-${month2}-${day2}`);
    }, []);

    const dateParser = (num) => {
        const options = { year: "numeric", month: "numeric", day: "numeric" };
        let timestamp = Date.parse(num);
        return new Date(timestamp).toLocaleDateString("fr-FR", options);
    };

    const AfficherBilan = async (e) => {
        e.preventDefault();
        setloading(true);
        try {
            const res = await axios.post(
                "/eco/pages/rapport/etat-financier/bilan",
                {
                    radioValue,
                    radioValue2,
                    date_debut_balance,
                    date_fin_balance,
                    devise,
                },
            );

            if (res.data.status == 1) {
                // NOUVELLE STRUCTURE : les données sont dans actif et passif
                const actifData = res.data.actif || [];
                const passifData = res.data.passif || [];

                console.log("=== BILAN GÉNÉRÉ ===");
                console.log("ACTIF (", actifData.length, "comptes)");
                console.log("PASSIF (", passifData.length, "comptes)");
                console.log(
                    "Total ACTIF:",
                    actifData.reduce(
                        (sum, item) => sum + Math.abs(item.soldeFin || 0),
                        0,
                    ),
                );
                console.log(
                    "Total PASSIF:",
                    passifData.reduce(
                        (sum, item) => sum + Math.abs(item.soldeFin || 0),
                        0,
                    ),
                );

                setFetchActif(actifData);
                setFetchPassif(passifData);

                const totalActifCalc = actifData.reduce(
                    (sum, item) => sum + Math.abs(item.soldeFin || 0),
                    0,
                );
                const totalPassifCalc = passifData.reduce(
                    (sum, item) => sum + Math.abs(item.soldeFin || 0),
                    0,
                );
                setTotalActif(totalActifCalc);
                setTotalPassif(totalPassifCalc);

                // Vérification de l'égalité fondamentale
                const difference = Math.abs(totalActifCalc - totalPassifCalc);
                if (difference > 0.01) {
                    console.warn(
                        `⚠️ Différence de ${difference} entre ACTIF et PASSIF`,
                    );
                } else {
                    console.log("✅ Bilan équilibré !");
                }
            } else {
                Swal.fire({
                    title: "Erreur",
                    text: res.data.msg || "Aucune donnée trouvée",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Erreur lors du chargement du bilan", error);
            Swal.fire({
                title: "Erreur",
                text: "Impossible de charger le bilan",
                icon: "error",
            });
        } finally {
            setloading(false);
        }
    };

    const handleRadioChange = (event) => setRadioValue(event.target.value);
    const handleRadioChange2 = (event) => setRadioValue2(event.target.value);

    function numberWithSpaces(x) {
        if (x === null || x === undefined) return "0,00";
        return x.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    // Fonction pour obtenir le libellé formaté selon le type d'affichage
    const getLibelleFormate = (item) => {
        if (radioValue2 === "porte_detaillee") {
            // Affichage détaillé : Numéro + Libellé
            return `${item.NumCompte || ""} - ${item.NomCompte}`;
        } else {
            // Affichage groupé : Sous-groupe + Libellé
            const code = item.RefSousGroupe || item.RefGroupe || item.RefCadre;
            return `${code} - ${item.NomCompte}`;
        }
    };

    const itemsPerPage = 30;
    const totalPagesActif = Math.ceil(fetchActif.length / itemsPerPage);
    const totalPagesPassif = Math.ceil(fetchPassif.length / itemsPerPage);

    const getCurrentItems = (data, currentPage) => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return data.slice(indexOfFirstItem, indexOfLastItem);
    };

    const renderPagination = (currentPage, totalPages, setPage) => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li
                    key={i}
                    className={`page-item ${i === currentPage ? "active" : ""}`}
                >
                    <button
                        onClick={() => setPage(i)}
                        className="page-link"
                        style={
                            i === currentPage
                                ? selectedButtonStyle
                                : buttonStyle
                        }
                    >
                        {i}
                    </button>
                </li>,
            );
        }
        return pageNumbers;
    };

    const buttonStyle = {
        padding: "5px 10px",
        backgroundColor: "#20c997",
        color: "white",
        border: "none",
        borderRadius: "5px",
        margin: "0 3px",
        cursor: "pointer",
    };
    const selectedButtonStyle = { ...buttonStyle, backgroundColor: "#ffc107" };
    const buttonStylePrevNext = {
        padding: "5px 15px",
        backgroundColor: "#20c997",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        margin: "0 5px",
    };

    const exportTableData = (tableId) => {
        const table = document.getElementById(tableId);
        if (!table) return;
        const wb = XLSX.utils.table_to_book(table);
        XLSX.writeFile(
            wb,
            `bilan_${new Date().toISOString().slice(0, 10)}.xlsx`,
        );
    };

    const exportToPDF = () => {
        const content = document.getElementById("content-to-download-balance");
        if (!content) return;
        html2canvas(content, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`bilan_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    };

    const groupByRefCadre = (data) => {
        const map = {};

        data.forEach((item) => {
            const cadre = item.RefCadre;

            if (!map[cadre]) {
                map[cadre] = {
                    RefCadre: cadre,
                    items: [],
                    totalN: 0,
                    totalN1: 0,
                };
            }

            map[cadre].items.push(item);
            map[cadre].totalN += Math.abs(item.soldeFin || 0);
            map[cadre].totalN1 += Math.abs(item.soldeN1 || 0);
        });

        return Object.values(map);
    };

    const TableBilan = ({ title, data }) => {
        // Mode consolidé : regroupement par RefCadre (2 chiffres)
        if (radioValue2 === "porte_groupee") {
            const groupedByCadre = {};
            data.forEach((item) => {
                const cadre = item.RefCadre;
                if (!groupedByCadre[cadre]) {
                    groupedByCadre[cadre] = {
                        RefCadre: cadre,
                        NomCompte: item.NomCompte,
                        totalN: 0,
                        totalN1: 0,
                        items: [],
                    };
                }
                groupedByCadre[cadre].totalN += Math.abs(item.soldeFin || 0);
                groupedByCadre[cadre].totalN1 += Math.abs(item.soldeN1 || 0);
                groupedByCadre[cadre].items.push(item);
            });

            return (
                <div className="mb-4">
                    <h5
                        style={{
                            background: "#f1f1f1",
                            padding: "8px",
                            border: "1px solid #ccc",
                            fontWeight: "bold",
                        }}
                    >
                        {title}
                    </h5>
                    <table
                        className="table table-bordered table-sm"
                        style={{ fontSize: "13px" }}
                    >
                        <thead style={{ background: "#dee2e6" }}>
                            <tr>
                                <th style={{ width: "20%" }}>Classe</th>
                                <th>Libellé</th>
                                <th className="text-end">Net (N)</th>
                                <th className="text-end">Net (N-1)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(groupedByCadre).map((group, idx) => {
                                // Gestion spéciale pour la classe 39 (créances brutes + provision)
                                if (group.RefCadre === "39") {
                                    const solde39Brut =
                                        group.items[0]?.solde39_brut || 0;
                                    const solde38 =
                                        group.items[0]?.solde38 || 0;
                                    return (
                                        <React.Fragment key={idx}>
                                            <tr
                                                style={{
                                                    background: "#f8f9fa",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                <td colSpan="2">
                                                    Créances brutes (39)
                                                </td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        solde39Brut,
                                                    )}
                                                </td>
                                                <td className="text-end">-</td>
                                            </tr>
                                            <tr
                                                style={{
                                                    background: "#f8f9fa",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                <td colSpan="2">
                                                    Provision (38)
                                                </td>
                                                <td className="text-end">
                                                    -{" "}
                                                    {numberWithSpaces(solde38)}
                                                </td>
                                                <td className="text-end">-</td>
                                            </tr>
                                            <tr
                                                style={{
                                                    background: "#e9ecef",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                <td>{group.RefCadre}</td>
                                                <td>{group.NomCompte}</td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        group.totalN,
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        group.totalN1,
                                                    )}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                }
                                return (
                                    <tr
                                        key={idx}
                                        style={{
                                            background: "#f8f9fa",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        <td>{group.RefCadre}</td>
                                        <td>{group.NomCompte}</td>
                                        <td className="text-end">
                                            {numberWithSpaces(group.totalN)}
                                        </td>
                                        <td className="text-end">
                                            {numberWithSpaces(group.totalN1)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Mode semi-détaillé : hiérarchie RefCadre → RefSousGroupe → comptes
        // On structure d'abord les données
        const structure = {};

        data.forEach((item) => {
            const cadre = item.RefCadre;
            const sousGroupe =
                item.RefSousGroupe || item.NumCompte?.substring(0, 4) || "0000"; // fallback
            const compte = item.NumCompte;

            if (!structure[cadre]) {
                structure[cadre] = {
                    nomCadre: item.NomCompte?.split(" - ")[0] || "",
                    sousGroupes: {},
                };
            }
            if (!structure[cadre].sousGroupes[sousGroupe]) {
                structure[cadre].sousGroupes[sousGroupe] = {
                    nomSousGroupe: `Sous-groupe ${sousGroupe}`,
                    totalN: 0,
                    totalN1: 0,
                    comptes: [],
                };
            }
            structure[cadre].sousGroupes[sousGroupe].totalN += Math.abs(
                item.soldeFin || 0,
            );
            structure[cadre].sousGroupes[sousGroupe].totalN1 += Math.abs(
                item.soldeN1 || 0,
            );
            structure[cadre].sousGroupes[sousGroupe].comptes.push(item);
        });

        // Tri des cadres et sous-groupes
        const sortedCadres = Object.keys(structure).sort();

        return (
            <div className="mb-4">
                <h5
                    style={{
                        background: "#f1f1f1",
                        padding: "8px",
                        border: "1px solid #ccc",
                        fontWeight: "bold",
                    }}
                >
                    {title}
                </h5>
                <table
                    className="table table-bordered table-sm"
                    style={{ fontSize: "13px" }}
                >
                    <thead style={{ background: "#dee2e6" }}>
                        <tr>
                            <th style={{ width: "20%" }}>Compte</th>
                            <th>Libellé</th>
                            <th className="text-end">Net (N)</th>
                            <th className="text-end">Net (N-1)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCadres.map((cadre) => {
                            const cadreData = structure[cadre];
                            const sousGroupesSorted = Object.keys(
                                cadreData.sousGroupes,
                            ).sort();

                            return (
                                <React.Fragment key={cadre}>
                                    {/* Ligne de la classe principale */}
                                    <tr
                                        style={{
                                            background: "#d1d5db",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        <td
                                            colSpan="4"
                                            style={{ fontSize: "1.05rem" }}
                                        >
                                            {cadre} - {cadreData.nomCadre}
                                        </td>
                                    </tr>

                                    {sousGroupesSorted.map((sg) => {
                                        const sgData =
                                            cadreData.sousGroupes[sg];
                                        // Ligne du sous-groupe (total)
                                        return (
                                            <React.Fragment key={sg}>
                                                <tr
                                                    style={{
                                                        background: "#f3f4f6",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            paddingLeft: "20px",
                                                        }}
                                                    >
                                                        {sg}
                                                    </td>
                                                    <td
                                                        style={{
                                                            paddingLeft: "20px",
                                                        }}
                                                    >
                                                        {sgData.nomSousGroupe}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            sgData.totalN,
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            sgData.totalN1,
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* Détail des comptes de ce sous-groupe */}
                                                {sgData.comptes.map(
                                                    (compte, idx) => (
                                                        <tr key={idx}>
                                                            <td
                                                                style={{
                                                                    paddingLeft:
                                                                        "40px",
                                                                }}
                                                            >
                                                                {
                                                                    compte.NumCompte
                                                                }
                                                            </td>
                                                            <td
                                                                style={{
                                                                    paddingLeft:
                                                                        "40px",
                                                                }}
                                                            >
                                                                {
                                                                    compte.NomCompte
                                                                }
                                                            </td>
                                                            <td className="text-end">
                                                                {numberWithSpaces(
                                                                    Math.abs(
                                                                        compte.soldeFin ||
                                                                            0,
                                                                    ),
                                                                )}
                                                            </td>
                                                            <td className="text-end">
                                                                {numberWithSpaces(
                                                                    Math.abs(
                                                                        compte.soldeN1 ||
                                                                            0,
                                                                    ),
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };
    return (
        <>
            <div
                className="container-fluid"
                style={{ marginTop: "10px", padding: "0 15px" }}
            >
                {loading && (
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
                            backgroundColor: "rgba(0,0,0,0.7)",
                            zIndex: 1050,
                            backdropFilter: "blur(3px)",
                        }}
                    >
                        <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                            <Bars
                                height="80"
                                width="80"
                                color="#20c997"
                                ariaLabel="loading"
                            />
                            <h5 className="mt-3 text-dark">
                                Génération du bilan...
                            </h5>
                        </div>
                    </div>
                )}

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
                                            Bilan Comptable
                                        </h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres */}

                <div className="row g-4 mb-5">
                    {/* Période */}
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i
                                        className="fas fa-calendar-alt me-2"
                                        style={{ color: "#6366f1" }}
                                    ></i>
                                    Période
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="mb-3">
                                    <label className="label-modern">
                                        Période N-1
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control modern-input"
                                        value={date_debut_balance}
                                        onChange={(e) =>
                                            setdate_debut_balance(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="label-modern">
                                        Date fin
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control modern-input"
                                        value={date_fin_balance}
                                        onChange={(e) =>
                                            setdate_fin_balance(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consolidation */}
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i
                                        className="fas fa-exchange-alt me-2"
                                        style={{ color: "#6366f1" }}
                                    ></i>
                                    Consolidation
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                    <input
                                        type="radio"
                                        className="modern-radio"
                                        id="type_balance"
                                        value="type_balance"
                                        checked={radioValue === "type_balance"}
                                        onChange={handleRadioChange}
                                    />
                                    <label
                                        htmlFor="type_balance"
                                        className="text-secondary fw-medium me-1"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        Bilan uniquement en
                                    </label>
                                    <select
                                        className="modern-select"
                                        onChange={(e) =>
                                            setdevise(e.target.value)
                                        }
                                        value={devise}
                                    >
                                        <option value="CDF">CDF</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                {/* Sections commentées conservées mais cachées */}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i
                                        className="fas fa-chart-pie me-2"
                                        style={{ color: "#6366f1" }}
                                    ></i>
                                    Type bilan
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="form-check mb-2">
                                    <input
                                        type="radio"
                                        className="form-check-input modern-radio"
                                        id="porte_detaillee"
                                        value="porte_detaillee"
                                        checked={
                                            radioValue2 === "porte_detaillee"
                                        }
                                        onChange={handleRadioChange2}
                                    />
                                    <label
                                        className="form-check-label text-secondary"
                                        htmlFor="porte_detaillee"
                                    >
                                        Bilan semi‑détaillé
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input modern-radio"
                                        id="porte_groupee"
                                        value="porte_groupee"
                                        checked={
                                            radioValue2 === "porte_groupee"
                                        }
                                        onChange={handleRadioChange2}
                                    />
                                    <label
                                        className="form-check-label text-secondary"
                                        htmlFor="porte_groupee"
                                    >
                                        Bilan consolidé
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Bouton d'action */}
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-body d-flex align-items-center justify-content-center p-3">
                                <button
                                    onClick={AfficherBilan}
                                    className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                                >
                                    {loading ? (
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                    ) : (
                                        <i className="fas fa-chart-line"></i>
                                    )}
                                    <span>Afficher le bilan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Affichage du bilan */}
                {(fetchActif.length > 0 || fetchPassif.length > 0) && (
                    <div id="content-to-download-balance">
                        <div className="card border-0 shadow-sm rounded-3 mb-4">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <EnteteRapport />
                                </div>
                                {/* <div className="text-center mb-4">
                                <h4 style={{ background: "#1a2632", padding: "12px", color: "#fff", borderRadius: "8px", display: "inline-block", borderLeft: "5px solid #20c997" }}>
                                    BILAN COMPTABLE AU {dateParser(date_fin_balance)}
                                    <br /><small style={{ fontSize: "12px" }}>Normes comptables OHADA - {devise}</small>
                                </h4>
                            </div> */}
                                <div className="text-center mb-3">
                                    <h6 className="fw-bold">
                                        BILAN SYNTHÈSE EN {devise}
                                    </h6>
                                    <p className="mb-0">
                                        Au {dateParser(date_fin_balance)}
                                    </p>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <TableBilan
                                            title="ACTIF"
                                            data={fetchActif}
                                            color="green"
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <TableBilan
                                            title="PASSIF"
                                            data={fetchPassif}
                                            color="red"
                                        />
                                    </div>
                                </div>

                                {/* Égalité fondamentale du bilan */}
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <div
                                            className="card border-0 shadow-sm rounded-3"
                                            style={{
                                                background:
                                                    Math.abs(
                                                        totalActif -
                                                            totalPassif,
                                                    ) < 0.01
                                                        ? "rgba(40,167,69,0.1)"
                                                        : "rgba(220,53,69,0.1)",
                                            }}
                                        >
                                            <div className="card-body text-center">
                                                <h5 className="fw-bold mb-0">
                                                    ÉGALITÉ FONDAMENTALE DU
                                                    BILAN :
                                                    <span
                                                        className={
                                                            Math.abs(
                                                                totalActif -
                                                                    totalPassif,
                                                            ) < 0.01
                                                                ? "text-success ms-2"
                                                                : "text-danger ms-2"
                                                        }
                                                    >
                                                        ACTIF = PASSIF
                                                    </span>
                                                </h5>
                                                <small className="text-muted">
                                                    Total Actif:{" "}
                                                    {numberWithSpaces(
                                                        totalActif,
                                                    )}{" "}
                                                    {devise} | Total Passif:{" "}
                                                    {numberWithSpaces(
                                                        totalPassif,
                                                    )}{" "}
                                                    {devise}
                                                    {Math.abs(
                                                        totalActif -
                                                            totalPassif,
                                                    ) > 0.01 && (
                                                        <span className="text-warning ms-2">
                                                            (Différence:{" "}
                                                            {numberWithSpaces(
                                                                Math.abs(
                                                                    totalActif -
                                                                        totalPassif,
                                                                ),
                                                            )}
                                                            )
                                                        </span>
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message si aucune donnée */}
                {fetchActif.length === 0 &&
                    fetchPassif.length === 0 &&
                    !loading && (
                        <div className="text-center py-5">
                            <i className="fas fa-chart-line fa-3x mb-3 text-muted"></i>
                            <p className="text-muted">
                                Aucune donnée trouvée pour la période
                                sélectionnée.
                            </p>
                            <small className="text-muted">
                                Vérifiez les dates et les paramètres de
                                recherche.
                            </small>
                        </div>
                    )}

                {/* Boutons d'export */}
                {(fetchActif.length > 0 || fetchPassif.length > 0) && (
                    <div className="d-flex justify-content-end gap-2 mb-4">
                        <button
                            onClick={() =>
                                exportTableData("main-table-balance")
                            }
                            className="btn"
                            style={{
                                background: "#28a745",
                                color: "white",
                                borderRadius: "8px",
                            }}
                        >
                            <i className="fas fa-file-excel me-2"></i>Exporter
                            en Excel
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="btn"
                            style={{
                                background: "#dc3545",
                                color: "white",
                                borderRadius: "8px",
                            }}
                        >
                            <i className="fas fa-file-pdf me-2"></i>Exporter en
                            PDF
                        </button>
                    </div>
                )}
            </div>

            <style>
                {`
          table {
    border-collapse: collapse;
}

th, td {
    border: 1px solid #000 !important;
}

thead {
    background: #dee2e6;
}

tr {
    line-height: 1.2;
}


.dashboard-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
  }
  .modern-input {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.6rem 0.75rem;
    transition: all 0.2s;
  }
  .modern-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    outline: none;
  }
  .modern-radio {
    accent-color: #6366f1;
    width: 1.1rem;
    height: 1.1rem;
    margin-top: 0.2rem;
  }
  .modern-select {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.3rem 1.5rem 0.3rem 0.75rem;
    background-color: white;
    font-size: 0.85rem;
    font-weight: 500;
    color: #1e293b;
    cursor: pointer;
  }
  .gradient-btn {
    background: linear-gradient(105deg, #10b981, #059669);
    border: none;
    border-radius: 14px;
    font-weight: 600;
    letter-spacing: 0.3px;
    transition: all 0.25s;
  }
  .gradient-btn:hover {
    transform: scale(1.02);
    background: linear-gradient(105deg, #059669, #047857);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }
  .card-header-custom {
    background: transparent;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    letter-spacing: -0.2px;
  }
  .label-modern {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    margin-bottom: 0.3rem;
  }
          `}
            </style>
        </>
    );
};

export default Bilan;
