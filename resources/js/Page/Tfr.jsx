import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";

const TFR = () => {
    const [loading, setLoading] = useState(false);
    const [date_debut, setDateDebut] = useState("");
    const [date_fin, setDateFin] = useState("");
    const [devise, setDevise] = useState("CDF");
    const [typeTFR, setTypeTFR] = useState("detail");
    const [tfrData, setTfrData] = useState([]);
    const [totaux, setTotaux] = useState({
        produits: 0,
        charges: 0,
        resultat: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

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
        setLoading(true);
        try {
            const res = await axios.post(
                "/eco/pages/rapport/etat-financier/tfr",
                {
                    date_debut,
                    date_fin,
                    devise,
                    type_tfr: typeTFR,
                },
            );
            if (res.data.status === 1) {
                setTfrData(res.data.data);
                setTotaux(res.data.totaux);
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

    // Pagination
    const totalPages = Math.ceil(tfrData.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentItems = tfrData.slice(startIdx, startIdx + itemsPerPage);

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

    const exportToExcel = () => {
        const wsData = tfrData.map((item) => ({
            Compte: item.compte,
            Nature: item.nature === "PRODUIT" ? "Produit" : "Charge",
            Montant: item.solde,
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "TFR");
        XLSX.writeFile(wb, `tfr_${date_debut}_${date_fin}.xlsx`);
    };

    const exportToPDF = () => {
        const element = document.getElementById("tfr-content");
        if (!element) return;
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`tfr_${date_debut}_${date_fin}.pdf`);
        });
    };

    const isPeriodValid = () => {
        if (!date_debut || !date_fin) return true;
        const anneeDebut = new Date(date_debut).getFullYear();
        const anneeFin = new Date(date_fin).getFullYear();
        return anneeDebut === anneeFin;
    };

    return (
        <div className="tfr-container">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader-card">
                        <Bars height="70" width="70" color="#10b981" />
                        <h5>Calcul du Tableau de Résultat...</h5>
                    </div>
                </div>
            )}

            <div className="tfr-header" style={{ background: "#138496" }}>
                <div className="tfr-header-content">
                    <div className="tfr-header-icon">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <h1>Tableau de Formation du Résultat (TFR)</h1>
                        <p>Produits - Charges = Résultat net</p>
                    </div>
                </div>
            </div>

            <div className="tfr-filters">
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
                        {!isPeriodValid() && (
                            <small
                                className="text-muted"
                                style={{ fontSize: "16px" }}
                            >
                                <i className="fas fa-exclamation-triangle text-danger">
                                    {" "}
                                    Les dates doivent être dans la même
                                    année{" "}
                                </i>
                            </small>
                        )}
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
                        <i className="fas fa-chart-pie"></i> Type TFR
                    </div>
                    <div className="filter-body">
                        <div className="form-check mb-2">
                            <input
                                type="radio"
                                className="form-check-input"
                                id="detail"
                                value="detail"
                                checked={typeTFR === "detail"}
                                onChange={(e) => setTypeTFR(e.target.value)}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="detail"
                            >
                                Détaillé (par compte)
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="radio"
                                className="form-check-input"
                                id="consolide"
                                value="consolide"
                                checked={typeTFR === "consolide"}
                                onChange={(e) => setTypeTFR(e.target.value)}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="consolide"
                            >
                                Consolidé (par groupe)
                            </label>
                        </div>
                    </div>
                </div>
                <div className="filter-card action-card">
                    <div className="btn-with-tooltip" style={{ width: "100%" }}>
                        <button
                            className="btn-primary-gradient mt-2"
                            onClick={handleSearch}
                            disabled={!isPeriodValid()}
                            style={{
                                opacity: !isPeriodValid() ? 0.6 : 1,
                                width: "100%",
                            }}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <i className="fas fa-calculator"></i>
                            )}
                            Calculer le résultat
                        </button>
                        {!isPeriodValid() && (
                            <span className="tooltip-text">
                                <i className="fas fa-info-circle me-1"></i> Les
                                dates doivent être dans la même année
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {tfrData.length > 0 && (
                <>
                    <div id="tfr-content">
                        <div className="tfr-report-card">
                            <div className="tfr-report-header">
                                <EnteteRapport />
                                <h2>TABLEAU DE FORMATION DU RÉSULTAT</h2>
                                <p>
                                    Du {dateParser(date_debut)} au{" "}
                                    {dateParser(date_fin)} | Devise : {devise}
                                </p>
                            </div>
                            <div className="table-responsive">
                                <table className="tfr-table">
                                    <thead>
                                        <tr>
                                            <th>Compte</th>
                                            <th>Nature</th>
                                            <th className="text-end">
                                                Montant
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.compte}</td>
                                                <td>
                                                    {item.nature === "PRODUIT"
                                                        ? "Produit"
                                                        : "Charge"}
                                                </td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        item.solde,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="tfr-footer">
                                        <tr
                                            style={{
                                                background: "#e2e3e5",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            <td colSpan="2">TOTAL PRODUITS</td>
                                            <td className="text-end text-success">
                                                {numberWithSpaces(
                                                    totaux.produits,
                                                )}
                                            </td>
                                        </tr>
                                        <tr
                                            style={{
                                                background: "#e2e3e5",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            <td colSpan="2">TOTAL CHARGES</td>
                                            <td className="text-end text-danger">
                                                {numberWithSpaces(
                                                    totaux.charges,
                                                )}
                                            </td>
                                        </tr>
                                        <tr
                                            style={{
                                                background: "#d1d5db",
                                                fontWeight: "bold",
                                                fontSize: "1.05rem",
                                            }}
                                        >
                                            <td colSpan="2">RÉSULTAT NET</td>
                                            <td className="text-end fw-bold">
                                                {numberWithSpaces(
                                                    totaux.resultat,
                                                )}
                                                {totaux.resultat >= 0
                                                    ? " (Bénéfice)"
                                                    : " (Perte)"}
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
                    </div>

                    <div className="tfr-export-buttons">
                        <button className="btn-excel" onClick={exportToExcel}>
                            <i className="fas fa-file-excel"></i> Excel
                        </button>
                        <button className="btn-pdf" onClick={exportToPDF}>
                            <i className="fas fa-file-pdf"></i> PDF
                        </button>
                    </div>
                </>
            )}

            {tfrData.length === 0 && !loading && (
                <div className="tfr-empty">
                    <i className="fas fa-chart-line"></i>
                    <p>Aucune donnée trouvée pour la période sélectionnée.</p>
                    <span>
                        Vérifiez que des transactions existent pour les comptes
                        de produits/charges.
                    </span>
                </div>
            )}

            <style jsx>{`
                .tfr-container {
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
                .tfr-header {
                    background: linear-gradient(135deg, #0f766e, #14b8a6);
                    border-radius: 28px;
                    padding: 20px 28px;
                    margin-bottom: 32px;
                    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
                }
                .tfr-header-content {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    color: white;
                }
                .tfr-header-icon {
                    background: rgba(255, 255, 255, 0.2);
                    width: 60px;
                    height: 60px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }
                .tfr-header h1 {
                    margin: 0;
                    font-size: 1.8rem;
                    font-weight: 700;
                }
                .tfr-header p {
                    margin: 4px 0 0;
                    opacity: 0.85;
                }
                .tfr-filters {
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
                .tfr-report-card {
                    background: white;
                    border-radius: 28px;
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    margin-bottom: 24px;
                }
                .tfr-report-header {
                    text-align: center;
                    padding: 24px 20px 16px;
                    border-bottom: 1px solid #edf2f7;
                }
                .tfr-report-header h2 {
                    margin: 12px 0 4px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .tfr-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .tfr-table thead th {
                    background: #f1f5f9;
                    padding: 14px 12px;
                    font-weight: 600;
                    color: #1e293b;
                    border-bottom: 1px solid #e2e8f0;
                }
                .tfr-table tbody td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #f0f2f5;
                }
                .tfr-table tbody tr:hover {
                    background: #fafcff;
                }
                .tfr-footer td {
                    background: #f8fafc;
                    font-weight: 700;
                    border-top: 2px solid #e2e8f0;
                    padding: 12px;
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
                .tfr-export-buttons {
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
                .tfr-empty {
                    text-align: center;
                    background: white;
                    border-radius: 32px;
                    padding: 60px 20px;
                    margin-top: 20px;
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
                }
                .tfr-empty i {
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
                    .tfr-container {
                        padding: 12px;
                    }
                    .tfr-header h1 {
                        font-size: 1.4rem;
                    }
                    .tfr-filters {
                        grid-template-columns: 1fr;
                    }
                }

                /* Tooltip container */
                .btn-with-tooltip {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                }

                /* Tooltip text */
                .btn-with-tooltip .tooltip-text {
                    visibility: hidden;
                    background-color: #1e293b;
                    color: #fff;
                    text-align: center;
                    padding: 8px 12px;
                    border-radius: 8px;
                    position: absolute;
                    z-index: 1;
                    bottom: 125%;
                    left: 50%;
                    transform: translateX(-50%);
                    white-space: nowrap;
                    font-size: 0.8rem;
                    font-weight: normal;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                /* Tooltip arrow */
                .btn-with-tooltip .tooltip-text::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: #1e293b transparent transparent transparent;
                }

                /* Show tooltip on hover */
                .btn-with-tooltip:hover .tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }

                /* Désactiver le tooltip quand le bouton est actif */
                .btn-with-tooltip:hover .tooltip-text:not(:disabled) {
                    visibility: visible;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default TFR;
