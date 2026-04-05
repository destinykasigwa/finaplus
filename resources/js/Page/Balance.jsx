import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";

const Balance = () => {
    const [loading, setLoading] = useState(false);
    const [date_debut, setDateDebut] = useState("");
    const [date_fin, setDateFin] = useState("");
    const [devise, setDevise] = useState("CDF");
    const [compteDebut, setCompteDebut] = useState("");
    const [compteFin, setCompteFin] = useState("");
    const [balanceData, setBalanceData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [typeBalance, setTypeBalance] = useState("detail"); // "detail" ou "consolide"
    const itemsPerPage = 20;




    const buildHierarchy = (data) => {
        const result = [];

        const classes = {};

        data.forEach((item) => {
            const classe = item.compte.substring(0, 1);
            const sousGroupe = item.compte.substring(0, 2);

            if (!classes[classe]) {
                classes[classe] = {
                    type: "classe",
                    code: classe,
                    items: {},
                };
            }

            if (!classes[classe].items[sousGroupe]) {
                classes[classe].items[sousGroupe] = {
                    type: "sous_groupe",
                    code: sousGroupe,
                    comptes: [],
                };
            }

            classes[classe].items[sousGroupe].comptes.push({
                ...item,
                type: "compte",
            });
        });

        return classes;
    };
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        setDateFin(`${year}-${month}-${day}`);
        const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
        );
        setDateDebut(
            `${firstDayOfMonth.getFullYear()}-${String(firstDayOfMonth.getMonth() + 1).padStart(2, "0")}-${String(firstDayOfMonth.getDate()).padStart(2, "0")}`,
        );
    }, []);


     // Fonction utilitaire
        const getPremierJourAnnee = (annee = null) => {
            const anneeUtilisee = annee || new Date().getFullYear();
            return `${anneeUtilisee}-01-01`;
        };
    
        // Dans votre composant
        useEffect(() => {
            setDateDebut(getPremierJourAnnee()); // Année en cours
            // ou
            setDateDebut(getPremierJourAnnee()); // Année 2025 spécifique
        }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!compteDebut || !compteFin) {
            Swal.fire(
                "Attention",
                "Veuillez saisir une plage de comptes",
                "warning",
            );
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(
                "eco/pages/rapport/etat-financier/balance",
                {
                    date_debut,
                    date_fin,
                    devise,
                    compte_debut: compteDebut,
                    compte_fin: compteFin,
                    type_balance: typeBalance,
                },
            );
            if (res.data.status === 1) {
                setBalanceData(res.data.data);
                setCurrentPage(1);
            } else {
                Swal.fire(
                    "Erreur",
                    res.data.msg || "Aucune donnée trouvée",
                    "error",
                );
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Erreur", "Erreur serveur", "error");
        } finally {
            setLoading(false);
        }
    };

    const numberWithSpaces = (x) => {
        if (x === null || x === undefined) return "0,00";
        return Number(x).toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const dateParser = (num) => {
        if (!num) return "";
        return new Date(num).toLocaleDateString("fr-FR");
    };

    const flattenHierarchy = (classes) => {
        let result = [];

        Object.values(classes).forEach((classe) => {
            Object.values(classe.items).forEach((sousGroupe) => {
                sousGroupe.comptes.forEach((compte) => {
                    result.push(compte);
                });
            });
        });

        return result;
    };

    const hierarchy = buildHierarchy(balanceData);

    // 🔥 on aplatit
    const flatData = flattenHierarchy(hierarchy);

    // Pagination
    const totalPages = Math.ceil(flatData.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentItems = flatData.slice(startIdx, startIdx + itemsPerPage);

    // PaginationModerne (identique à celle du Grand Livre)
    const PaginationModerne = ({ currentPage, totalPages, onPageChange }) => {
        const maxPagesToShow = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        const pages = Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i,
        );
        return (
            <div className="pagination-modern">
                <button
                    className="page-nav"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <i className="fas fa-chevron-left"></i>
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            className="page-number"
                            onClick={() => onPageChange(1)}
                        >
                            1
                        </button>
                        {startPage > 2 && (
                            <span className="page-dots">...</span>
                        )}
                    </>
                )}
                {pages.map((page) => (
                    <button
                        key={page}
                        className={`page-number ${page === currentPage ? "active" : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="page-dots">...</span>
                        )}
                        <button
                            className="page-number"
                            onClick={() => onPageChange(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    className="page-nav"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
                <div className="page-info">
                    Page {currentPage} sur {totalPages}
                </div>
            </div>
        );
    };

    // Export Excel
    const exportToExcel = () => {
        const wsData = balanceData.map((item) => {
            const base = {
                "Report Débit": item.report_debit,
                "Report Crédit": item.report_credit,
                "Mvt Débit": item.mvt_debit,
                "Mvt Crédit": item.mvt_credit,
                "Total Débit": item.total_debit,
                "Total Crédit": item.total_credit,
                "Solde Débiteur": item.solde_debiteur,
                "Solde Créditeur": item.solde_crediteur,
            };
            if (typeBalance === "detail") {
                return { Compte: item.compte, Libellé: item.libelle, ...base };
            } else {
                return { "Compte (sous-groupe)": item.compte, ...base };
            }
        });
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Balance");
        XLSX.writeFile(wb, `balance_${date_debut}_${date_fin}.xlsx`);
    };

    const exportToPDF = () => {
        const element = document.getElementById("balance-content");
        if (!element) return;
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`balance_${date_debut}_${date_fin}.pdf`);
        });
    };

    return (
        <div className="balance-container">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader-card">
                        <Bars height="70" width="70" color="#10b981" />
                        <h5>Chargement de la balance...</h5>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="balance-header" style={{   background: "#138496"}} >
                <div className="balance-header-content">
                    <div className="balance-header-icon">
                      <i className="fas fa-balance-scale"></i>
                    </div>
                    <div>
                        <h1>Balance des comptes</h1>
                        <p>Synthèse des soldes et mouvements</p>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="balance-filters">
                <div className="filter-card">
                    <div className="filter-header">
                        <i className="fas fa-calendar-alt"></i> Période
                    </div>
                    <div className="filter-body">
                        <label>Date début</label>
                        <input
                            type="date"
                            className="modern-input"
                            value={date_debut}
                            onChange={(e) => setDateDebut(e.target.value)}
                        />
                        <label>Date fin</label>
                        <input
                            type="date"
                            className="modern-input"
                            value={date_fin}
                            onChange={(e) => setDateFin(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-card">
                    <div className="filter-header">
                        <i className="fas fa-exchange-alt"></i> Devise
                    </div>
                    <div className="filter-body">
                        <select
                            className="modern-select"
                            value={devise}
                            onChange={(e) => setDevise(e.target.value)}
                        >
                            <option value="CDF">CDF (Franc Congolais)</option>
                            <option value="USD">USD (Dollar US)</option>
                        </select>
                    </div>
                </div>
                <div className="filter-card">
                    <div className="filter-header">
                        <i className="fas fa-filter"></i> Portée comptes
                    </div>
                    <div className="filter-body">
                        <label>Compte début</label>
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="ex: 1"
                            value={compteDebut}
                            onChange={(e) => setCompteDebut(e.target.value)}
                        />
                        <label>Compte fin</label>
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="ex: 3"
                            value={compteFin}
                            onChange={(e) => setCompteFin(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-card">
                    <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                        <div className="card-header bg-transparent border-0 pt-3 pb-0">
                            <h6 className="section-title">
                                <i
                                    className="fas fa-chart-pie me-2"
                                    style={{ color: "#6366f1" }}
                                ></i>
                                Type balance
                            </h6>
                        </div>
                        <div className="card-body pt-2">
                            <div className="form-check mb-2">
                                <input
                                    type="radio"
                                    className="form-check-input modern-radio"
                                    id="balance_detail"
                                    value="detail"
                                    checked={typeBalance === "detail"}
                                    onChange={(e) =>
                                        setTypeBalance(e.target.value)
                                    }
                                />
                                <label
                                    className="form-check-label text-secondary"
                                    htmlFor="balance_detail"
                                >
                                    Balance semi‑détaillée
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input modern-radio"
                                    id="balance_consolide"
                                    value="consolide"
                                    checked={typeBalance === "consolide"}
                                    onChange={(e) =>
                                        setTypeBalance(e.target.value)
                                    }
                                />
                                <label
                                    className="form-check-label text-secondary"
                                    htmlFor="balance_consolide"
                                >
                                    Balance consolidée
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="filter-card action-card">
                    <button
                        className="btn-primary-gradient"
                        onClick={handleSearch}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <i className="fas fa-chart-line"></i>
                        )}
                        Afficher la balance
                    </button>
                </div>
            </div>

            {/* Résultats */}
            {balanceData.length > 0 && (
                <div id="balance-content">
                    <div className="balance-report-card">
                        <div className="balance-report-header text-center">
                            <EnteteRapport />

                            <h3 className="fw-bold">
                                BALANCE GENERALE DES COMPTES
                            </h3>

                            <p>
                                DU {dateParser(date_debut)} AU{" "}
                                {dateParser(date_fin)}
                            </p>

                            <p>
                                Devise : <strong>{devise}</strong> | Comptes :{" "}
                                <strong>{compteDebut}</strong> à{" "}
                                <strong>{compteFin}</strong>
                            </p>
                        </div>
                        <div className="table-responsive">
                            <table className="balance-table">
                                <thead>
                                    <tr className="text-center">
                                        <th rowSpan="2">Compte</th>
                                        {typeBalance === "detail" && (
                                            <th rowSpan="2">Libellé</th>
                                        )}

                                        <th colSpan="2">REPORT</th>
                                        <th colSpan="2">MOUVEMENTS</th>
                                        <th colSpan="2">TOTAUX</th>
                                        <th colSpan="2">SOLDE</th>
                                    </tr>

                                    <tr className="text-center">
                                        <th>D</th>
                                        <th>C</th>

                                        <th>D</th>
                                        <th>C</th>

                                        <th>D</th>
                                        <th>C</th>

                                        <th>D</th>
                                        <th>C</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(
                                        buildHierarchy(currentItems),
                                    ).map((classe, i) => (
                                        <React.Fragment key={i}>
                                            {/* ===== CLASSE ===== */}
                                            <tr className="classe-row">
                                                <td colSpan={10}>
                                                    <strong>
                                                        CLASSE {classe.code}
                                                    </strong>
                                                </td>
                                            </tr>

                                            {Object.values(classe.items).map(
                                                (sg, j) => {
                                                    // Calcul total sous-groupe
                                                    const totalSG =
                                                        sg.comptes.reduce(
                                                            (acc, c) => ({
                                                                report_debit:
                                                                    acc.report_debit +
                                                                    c.report_debit,
                                                                report_credit:
                                                                    acc.report_credit +
                                                                    c.report_credit,
                                                                mvt_debit:
                                                                    acc.mvt_debit +
                                                                    c.mvt_debit,
                                                                mvt_credit:
                                                                    acc.mvt_credit +
                                                                    c.mvt_credit,
                                                                total_debit:
                                                                    acc.total_debit +
                                                                    c.total_debit,
                                                                total_credit:
                                                                    acc.total_credit +
                                                                    c.total_credit,
                                                                solde_debiteur:
                                                                    acc.solde_debiteur +
                                                                    c.solde_debiteur,
                                                                solde_crediteur:
                                                                    acc.solde_crediteur +
                                                                    c.solde_crediteur,
                                                            }),
                                                            {
                                                                report_debit: 0,
                                                                report_credit: 0,
                                                                mvt_debit: 0,
                                                                mvt_credit: 0,
                                                                total_debit: 0,
                                                                total_credit: 0,
                                                                solde_debiteur: 0,
                                                                solde_crediteur: 0,
                                                            },
                                                        );

                                                    return (
                                                        <React.Fragment key={j}>
                                                            {/* ===== SOUS GROUPE ===== */}
                                                            <tr className="sous-groupe-row">
                                                                <td
                                                                    colSpan={10}
                                                                >
                                                                    <strong>
                                                                        Sous-groupe{" "}
                                                                        {
                                                                            sg.code
                                                                        }
                                                                    </strong>
                                                                </td>
                                                            </tr>

                                                            {/* ===== COMPTES ===== */}
                                                            {sg.comptes.map(
                                                                (c, k) => (
                                                                    <tr key={k}>
                                                                        <td>
                                                                            {
                                                                                c.compte
                                                                            }
                                                                        </td>
                                                                        {typeBalance ===
                                                                            "detail" && (
                                                                            <td>
                                                                                {
                                                                                    c.libelle
                                                                                }
                                                                            </td>
                                                                        )}

                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.report_debit,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.report_credit,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.mvt_debit,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.mvt_credit,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.total_debit,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.total_credit,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.solde_debiteur,
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            {numberWithSpaces(
                                                                                c.solde_crediteur,
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}

                                                            {/* ===== TOTAL SOUS GROUPE ===== */}
                                                            <tr className="total-sg">
                                                                <td
                                                                    colSpan={
                                                                        typeBalance ===
                                                                        "detail"
                                                                            ? 2
                                                                            : 1
                                                                    }
                                                                >
                                                                    TOTAL{" "}
                                                                    {sg.code}
                                                                </td>

                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.report_debit,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.report_credit,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.mvt_debit,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.mvt_credit,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.total_debit,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.total_credit,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.solde_debiteur,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {numberWithSpaces(
                                                                        totalSG.solde_crediteur,
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    );
                                                },
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                                <tfoot className="balance-footer">
                                    <tr>
                                        <td
                                            colSpan={
                                                typeBalance === "detail" ? 2 : 1
                                            }
                                            className="fw-bold"
                                        >
                                            TOTAUX
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.report_debit,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.report_credit,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.mvt_debit,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.mvt_credit,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.total_debit,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.total_credit,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.solde_debiteur,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {numberWithSpaces(
                                                balanceData.reduce(
                                                    (sum, i) =>
                                                        sum + i.solde_crediteur,
                                                    0,
                                                ),
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <PaginationModerne
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                    <div className="balance-export-buttons">
                        <button className="btn-excel" onClick={exportToExcel}>
                            <i className="fas fa-file-excel"></i> Excel
                        </button>
                        <button className="btn-pdf" onClick={exportToPDF}>
                            <i className="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </div>
            )}

            {balanceData.length === 0 && !loading && (
                <div className="balance-empty">
                    <i className="fas fa-scale-balanced"></i>
                    <p>
                        Aucune donnée trouvée pour la période et la plage de
                        comptes sélectionnées.
                    </p>
                    <span>Modifiez les filtres et réessayez.</span>
                </div>
            )}

            <style jsx>{`
                .balance-container {
                    background: #f4f7fc;
                    min-height: 100vh;
                    padding: 20px 24px;
                    font-family: "Inter", system-ui, sans-serif;
                }
                .loader-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1050;
                }
                .loader-card {
                    background: white;
                    border-radius: 28px;
                    padding: 30px 40px;
                    text-align: center;
                    box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.2);
                }
                .balance-header {
                    background: linear-gradient(135deg, #0f766e, #14b8a6);
                    border-radius: 28px;
                    padding: 20px 28px;
                    margin-bottom: 32px;
                    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
                 
                }
                .balance-header-content {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    color: white;
                }
                .balance-header-icon {
                    background: rgba(255, 255, 255, 0.2);
                    width: 60px;
                    height: 60px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }
                .balance-header h1 {
                    margin: 0;
                    font-size: 1.8rem;
                    font-weight: 700;
                }
                .balance-header p {
                    margin: 4px 0 0;
                    opacity: 0.85;
                }
                .balance-filters {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .filter-card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
                    transition:
                        transform 0.2s,
                        box-shadow 0.2s;
                    overflow: hidden;
                }
                .filter-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 28px -8px rgba(0, 0, 0, 0.12);
                }
                .filter-header {
                    background: #f8fafc;
                    padding: 14px 20px;
                    font-weight: 600;
                    color: #1e293b;
                    border-bottom: 1px solid #eef2ff;
                }
                .filter-header i {
                    color: #6366f1;
                    margin-right: 8px;
                }
                .filter-body {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .filter-body label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #475569;
                }
                .modern-input,
                .modern-select {
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 12px 16px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    background: white;
                    width: 100%;
                }
                .modern-input:focus,
                .modern-select:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                    outline: none;
                }
                .action-card {
                    background: transparent;
                    box-shadow: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-primary-gradient {
                    background: linear-gradient(105deg, #10b981, #059669);
                    border: none;
                    border-radius: 40px;
                    padding: 14px 20px;
                    width: 100%;
                    color: white;
                    font-weight: 700;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.25s;
                    cursor: pointer;
                }
                .btn-primary-gradient:hover {
                    transform: scale(1.02);
                    background: linear-gradient(105deg, #059669, #047857);
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
                }
                .balance-report-card {
                    background: white;
                    border-radius: 28px;
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    margin-bottom: 24px;
                }
                .balance-report-header {
                    text-align: center;
                    padding: 24px 20px 16px;
                    border-bottom: 1px solid #edf2f7;
                }
                .balance-report-header h2 {
                    margin: 12px 0 4px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .balance-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .balance-table thead th {
                    background: #f1f5f9;
                    padding: 14px 12px;
                    font-weight: 600;
                    color: #1e293b;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                }
                .balance-table tbody td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #f0f2f5;
                }
                .balance-table tbody tr:hover {
                    background: #fafcff;
                }
                .balance-footer {
                    background: #f8fafc;
                    font-weight: 700;
                    border-top: 2px solid #e2e8f0;
                }
                .text-end {
                    text-align: right;
                }
                .text-success {
                    color: #10b981;
                }
                .text-danger {
                    color: #ef4444;
                }
                .fw-bold {
                    font-weight: 700;
                }
                .balance-export-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .btn-excel,
                .btn-pdf {
                    border: none;
                    border-radius: 40px;
                    padding: 10px 24px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .btn-excel {
                    background: #10b981;
                    color: white;
                }
                .btn-excel:hover {
                    background: #059669;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
                }
                .btn-pdf {
                    background: #ef4444;
                    color: white;
                }
                .btn-pdf:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
                }
                .balance-empty {
                    text-align: center;
                    background: white;
                    border-radius: 32px;
                    padding: 60px 20px;
                    margin-top: 20px;
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
                }
                .balance-empty i {
                    font-size: 48px;
                    color: #cbd5e1;
                    margin-bottom: 16px;
                }
                .pagination-modern {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin-top: 1.5rem;
                    padding-bottom: 20px;
                }
                .page-number,
                .page-nav {
                    min-width: 40px;
                    height: 40px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: white;
                    border-radius: 14px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    color: #1e293b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    padding: 0 0.75rem;
                }
                .page-number {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                }
                .page-number.active {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-color: transparent;
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .page-nav {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                }
                .page-nav:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .page-info {
                    margin-left: 1rem;
                    font-size: 0.8rem;
                    color: #475569;
                    background: #f1f5f9;
                    padding: 0.3rem 0.8rem;
                    border-radius: 30px;
                }
                @media (max-width: 768px) {
                    .balance-container {
                        padding: 12px;
                    }
                    .balance-header h1 {
                        font-size: 1.4rem;
                    }
                    .balance-filters {
                        grid-template-columns: 1fr;
                    }
                    .balance-table {
                        font-size: 0.75rem;
                    }
                }

                .balance-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .balance-table th,
                .balance-table td {
                    border: 1px solid #ddd;
                    padding: 6px;
                }

                .balance-table thead {
                    background: #f5f7fa;
                    font-weight: bold;
                }

                .balance-table thead tr:first-child {
                    background: #e9ecef;
                    font-size: 14px;
                }

                .balance-table tbody tr:hover {
                    background: #f9f9f9;
                }

                .balance-table td {
                    text-align: right;
                }

                .balance-table td:first-child,
                .balance-table td:nth-child(2) {
                    text-align: left;
                }

                .balance-footer {
                    background: #e9ecef;
                    font-weight: bold;
                }

                .text-success {
                    color: #198754;
                }

                .text-danger {
                    color: #dc3545;
                }

                .balance-table td:nth-child(3),
                .balance-table th:nth-child(3),
                .balance-table td:nth-child(5),
                .balance-table th:nth-child(5),
                .balance-table td:nth-child(7),
                .balance-table th:nth-child(7),
                .balance-table td:nth-child(9),
                .balance-table th:nth-child(9) {
                    border-left: 2px solid #dcdcdc;
                }

                .classe-row {
                    background: #dfe6e9;
                    font-size: 14px;
                }

                .sous-groupe-row {
                    background: #f1f3f5;
                }

                .total-sg {
                    background: #e9ecef;
                    font-weight: bold;
                    border-top: 2px solid black;
                }
            `}</style>
        </div>
    );
};

export default Balance;
