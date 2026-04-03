import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";

const GrandLivre = () => {
    const [loading, setLoading] = useState(false);
    const [date_debut, setDateDebut] = useState("");
    const [date_fin, setDateFin] = useState("");
    const [devise, setDevise] = useState("CDF");
    const [compteDebut, setCompteDebut] = useState("");
    const [compteFin, setCompteFin] = useState("");
    const [rawData, setRawData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50; // lignes par page

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
            const res = await axios.post("/eco/pages/rapport/grand-livre", {
                date_debut,
                date_fin,
                devise,
                compte_debut: compteDebut,
                compte_fin: compteFin,
            });

            if (res.data.status === 1) {
                setRawData(res.data.data);
                setCurrentPage(1);
            } else {
                Swal.fire("Erreur", "Aucune donnée trouvée", "error");
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

    // ✅ Gestion des comptes et pagination
    const comptes = rawData.filter((l) => l.type === "compte");
    const currentCompte = comptes[currentPage - 1] || null;

    let toutesLesLignes = [];

    if (currentCompte) {
        let started = false;

        for (let ligne of rawData) {
            if (ligne.type === "compte") {
                started = ligne.NumCompte === currentCompte.NumCompte;
            }
            if (started) {
                toutesLesLignes.push(ligne);
            }
        }
    }

    const totalPages = Math.ceil(rawData.length / itemsPerPage);
    const lignesAffichees = rawData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    // 📄 Export Excel
    const exportToExcel = () => {
        const allRows = [];
        comptes.forEach((compte) => {
            const lignes = rawData.filter(
                (l) => l.NumCompte === compte.NumCompte,
            );
            lignes.forEach((l) => {
                allRows.push({
                    Compte: compte.NumCompte,
                    "Libellé compte": compte.NomCompte,
                    Date: l.date ? dateParser(l.date) : "",
                    "N° Pièce": l.numPiece || "",
                    Libellé: l.libelle,
                    Débit: l.debit,
                    Crédit: l.credit,
                    Solde: Math.abs(l.solde),
                });
            });
            allRows.push({}); // ligne vide
        });
        const ws = XLSX.utils.json_to_sheet(allRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Grand Livre");
        XLSX.writeFile(wb, `grand_livre_${date_debut}_${date_fin}.xlsx`);
    };

    // 📄 Export PDF
    const exportToPDF = () => {
        const element = document.getElementById("grand-livre-content");
        if (!element) return;
        html2canvas(element, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`grand_livre_${date_debut}_${date_fin}.pdf`);
        });
    };

    // 🔹 Pagination moderne
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
                                Chargement du grand livre...
                            </h5>
                        </div>
                    </div>
                )}

                {/* En-tête */}
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
                                    <i
                                        className="fas fa-book me-3"
                                        style={{
                                            fontSize: "28px",
                                            color: "white",
                                        }}
                                    ></i>
                                    <h5 className="text-white fw-bold mb-0">
                                        Grand Livre Comptable
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres modernes */}
                <div className="row g-4 mb-5">
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
                                        Date début
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control modern-input"
                                        value={date_debut}
                                        onChange={(e) =>
                                            setDateDebut(e.target.value)
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
                                        value={date_fin}
                                        onChange={(e) =>
                                            setDateFin(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i
                                        className="fas fa-exchange-alt me-2"
                                        style={{ color: "#6366f1" }}
                                    ></i>
                                    Devise
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <select
                                    className="form-select modern-select"
                                    value={devise}
                                    onChange={(e) => setDevise(e.target.value)}
                                >
                                    <option value="CDF">CDF</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i
                                        className="fas fa-filter me-2"
                                        style={{ color: "#6366f1" }}
                                    ></i>
                                    Portée comptes
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="mb-2">
                                    <label className="label-modern">
                                        Compte début
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        placeholder="ex: 1"
                                        value={compteDebut}
                                        onChange={(e) =>
                                            setCompteDebut(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="label-modern">
                                        Compte fin
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        placeholder="ex: 3"
                                        value={compteFin}
                                        onChange={(e) =>
                                            setCompteFin(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                            <div className="card-body d-flex align-items-center justify-content-center p-3">
                                <button
                                    onClick={handleSearch}
                                    className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <i className="fas fa-search"></i>
                                    )}
                                    <span>Afficher le grand livre</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 
                {loading && <Bars color="#20c997" height={50} width={50} />} */}
                {rawData.length > 0 && currentCompte && (
                    <div id="grand-livre-content">
                        <div className="gl-report-card">
                            <div className="gl-report-header">
                                <EnteteRapport />
                                <h2>GRAND LIVRE</h2>
                                <p>
                                    Du {dateParser(date_debut)} au{" "}
                                    {dateParser(date_fin)} | Devise : {devise} |
                                    Comptes de {compteDebut} à {compteFin}
                                </p>
                                {/* <div className="current-compte">
                                    <i className="fas fa-tag"></i>{" "}
                                    {currentCompte.NumCompte} -{" "}
                                    {currentCompte.NomCompte}
                                </div> */}
                            </div>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>N° Pièce</th>
                                        <th>Libellé</th>
                                        <th>Débit</th>
                                        <th>Crédit</th>
                                        <th>Solde</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lignesAffichees.map((ligne, idx) => {
                                        if (ligne.type === "compte") {
                                            return (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        background: "#dfe6e9",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    <td colSpan="6">
                                                        {ligne.NumCompte} -{" "}
                                                        {ligne.NomCompte}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        if (ligne.type === "solde_initial") {
                                            return (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        fontStyle: "italic",
                                                    }}
                                                >
                                                    <td></td>
                                                    <td></td>
                                                    <td>{ligne.libelle}</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            Math.abs(
                                                                Number(
                                                                    ligne.solde,
                                                                ),
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        if (ligne.type === "total") {
                                            return (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        fontWeight: "bold",
                                                        background: "#f1f2f6",
                                                    }}
                                                >
                                                    <td></td>
                                                    <td></td>
                                                    <td>{ligne.libelle}</td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            Math.abs(
                                                                Number(
                                                                    ligne.debit,
                                                                ),
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            Math.abs(
                                                                Number(
                                                                    ligne.credit,
                                                                ),
                                                            ),
                                                        )}
                                                    </td>
                                                    <td className="text-end">
                                                        {numberWithSpaces(
                                                            Math.abs(
                                                                Number(
                                                                    ligne.solde,
                                                                ),
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                            <tr key={idx}>
                                                <td>
                                                    {dateParser(ligne.date)}
                                                </td>
                                                <td>{ligne.numPiece}</td>
                                                <td>{ligne.libelle}</td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        Math.abs(
                                                            Number(ligne.debit),
                                                        ),
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        Math.abs(
                                                            Number(
                                                                ligne.credit,
                                                            ),
                                                        ),
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    {numberWithSpaces(
                                                        Math.abs(
                                                            Number(
                                                                ligne.solde_abs,
                                                            ),
                                                        ),
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {rawData.length === 0 && !loading && (
                    <div className="gl-empty">
                        <i className="fas fa-book-open"></i>
                        <p>
                            Aucune écriture trouvée pour la période et la plage
                            de comptes sélectionnées.
                        </p>
                        <span>Modifiez les filtres et réessayez.</span>
                    </div>
                )}

                {totalPages > 1 && (
                    <>
                        <PaginationModerne
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                        <div className="text-end">
                            <button
                                onClick={exportToExcel}
                                className="btn btn-success me-2"
                            >
                                Exporter Excel
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="btn btn-danger"
                            >
                                Exporter PDF
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>
                {`
                /* Pagination moderne */
.pagination-modern {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
}

.page-number, .page-nav {
    min-width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: white;
    border-radius: 12px;
    font-weight: 500;
    font-size: 0.9rem;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    padding: 0 0.75rem;
}

.page-number {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.page-number:hover {
    background: #eef2ff;
    border-color: #6366f1;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(99,102,241,0.15);
}

.page-number.active {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}

.page-nav {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
}

.page-nav:hover:not(:disabled) {
    background: #eef2ff;
    border-color: #6366f1;
    transform: translateY(-2px);
}

.page-nav:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

.page-dots {
    color: #94a3b8;
    font-weight: 600;
    margin: 0 0.25rem;
}

.page-info {
    margin-left: 1rem;
    font-size: 0.8rem;
    color: #475569;
    background: #f1f5f9;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-weight: 500;
}

.dashboard-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.dashboard-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; }
 .modern-input { border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.6rem 0.75rem; transition: all 0.2s; }
 .modern-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); outline: none; }
.modern-select { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.6rem 0.75rem; background-color: white; font-size: 0.85rem; font-weight: 500; color: #1e293b; cursor: pointer; }
 .gradient-btn { background: linear-gradient(105deg, #10b981, #059669); border: none; border-radius: 14px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.25s; }
 .gradient-btn:hover { transform: scale(1.02); background: linear-gradient(105deg, #059669, #047857); box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
  .section-title { font-size: 0.95rem; font-weight: 600; color: #1e293b; letter-spacing: -0.2px; }
 .label-modern { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 0.3rem; display: block; }
/* Rapport */
                .gl-report-card {
                    background: white;
                    border-radius: 28px;
                    box-shadow: 0 12px 28px rgba(0,0,0,0.08);
                    overflow: hidden;
                    margin-bottom: 24px;
                }

                .gl-empty {
                    text-align: center;
                    background: white;
                    border-radius: 32px;
                    padding: 60px 20px;
                    margin-top: 20px;
                    box-shadow: 0 6px 14px rgba(0,0,0,0.05);
                }
                .gl-empty i {
                    font-size: 48px;
                    color: #cbd5e1;
                    margin-bottom: 16px;
                }
                .gl-empty p {
                    color: #475569;
                    font-size: 1rem;
                    margin-bottom: 8px;
                }
                .gl-empty span {
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                .gl-report-card {
                    background: white;
                    border-radius: 28px;
                    box-shadow: 0 12px 28px rgba(0,0,0,0.08);
                    overflow: hidden;
                    margin-bottom: 24px;
                }
                .gl-report-header {
                    text-align: center;
                    padding: 24px 20px 16px;
                    border-bottom: 1px solid #edf2f7;
                }
                .gl-report-header h2 {
                    margin: 12px 0 4px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .gl-report-header p {
                    color: #475569;
                    font-size: 0.85rem;
                }

                .gl-report-header {
                    text-align: center;
                    padding: 24px 20px 16px;
                    border-bottom: 1px solid #edf2f7;
                }
                .gl-report-header h2 {
                    margin: 12px 0 4px;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .gl-report-header p {
                    color: #475569;
                    font-size: 0.85rem;
                }

`}
            </style>
        </>
    );
};

export default GrandLivre;
