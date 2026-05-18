import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";

const RapportImmobilisations = () => {
    const [loading, setLoading] = useState(false);
    const [immobilisations, setImmobilisations] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // États des filtres
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [devise, setDevise] = useState("CDF");
    const [categorie, setCategorie] = useState("");
    const [service, setService] = useState("");
    const [agenceFilter, setAgenceFilter] = useState("current");

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [userAgences, setUserAgences] = useState([]);
    const [currentAgence, setCurrentAgence] = useState(null);

    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        setDateFin(today.toISOString().split('T')[0]);
        setDateDebut(`${year}-01-01`);

        // Charger les agences depuis window
        setUserAgences(window.userAgences || []);
        setCurrentAgence(window.currentAgence || null);

        fetchCategories();
        fetchServices();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/eco/immo/categories");
            if (res.data.status === 1) setCategories(res.data.data);
        } catch (error) {
            console.error("Erreur chargement catégories", error);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await axios.get("/eco/immo/services");
            if (res.data.status === 1) setServices(res.data.data);
        } catch (error) {
            console.error("Erreur chargement services", error);
        }
    };

    const rechercherImmobilisations = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCurrentPage(1);
        try {
            const res = await axios.post("/eco/immo/rapport", {
                date_debut: dateDebut,
                date_fin: dateFin,
                devise,
                categorie,
                service,
                agence_filter: agenceFilter,
            });
            if (res.data.status === 1) {
                setImmobilisations(res.data.data);
                setFilteredData(res.data.data);
            } else {
                Swal.fire("Erreur", res.data.msg || "Aucune donnée", "error");
                setImmobilisations([]);
                setFilteredData([]);
            }
        } catch (error) {
            Swal.fire("Erreur", "Impossible de charger le rapport", "error");
            setImmobilisations([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const numberWithSpaces = (x) => {
        if (x === null || x === undefined) return "0,00";
        return x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Export Excel (TOUTES les données, pas seulement la page courante)
    const exportTableData = () => {
        if (filteredData.length === 0) return;
        const wsData = filteredData.map(immo => ({
            "Code": immo.code_immo,
            "Nom": immo.nom_immo,
            "Catégorie": immo.type?.nom_type || "-",
            "Date acquisition": immo.date_acquisition,
            "Valeur acquisition": immo.valeur_acquisition,
            "Amortissement cumulé": immo.amortissement_cumule,
            "Valeur nette": immo.valeur_nette_comptable,
            "Taux (%)": immo.taux_amortissement,
            "Méthode": immo.methode_amortissement === 'lineaire' ? 'Linéaire' : 'Dégressif',
            "Service": immo.service_affectation || "-",
            "Agence": immo.code_agence,
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Immobilisations");
        XLSX.writeFile(wb, `immobilisations_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // Export PDF (TOUTES les données, pas seulement la page courante)
    const exportToPDF = async () => {
        const element = document.getElementById("content-to-download-immobilisations");
        if (!element) return;
        // On clone l'élément pour ne pas perturber l'affichage
        const clone = element.cloneNode(true);
        // On s'assure que toutes les lignes sont visibles (pas de pagination)
        const tbody = clone.querySelector('tbody');
        if (tbody) {
            const allRows = filteredData.map(immo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${immo.code_immo}</td>
                    <td>${immo.nom_immo}</td>
                    <td>${immo.type?.nom_type || "-"}</td>
                    <td>${immo.date_acquisition}</td>
                    <td class="text-end">${numberWithSpaces(immo.valeur_acquisition)}</td>
                    <td class="text-end">${numberWithSpaces(immo.amortissement_cumule)}</td>
                    <td class="text-end">${numberWithSpaces(immo.valeur_nette_comptable)}</td>
                    <td class="text-end">${immo.taux_amortissement} %</td>
                    <td>${immo.methode_amortissement === 'lineaire' ? 'Linéaire' : 'Dégressif'}</td>
                    <td>${immo.service_affectation || "-"}</td>
                    <td>${immo.code_agence}</td>
                `;
                return row;
            });
            tbody.innerHTML = '';
            allRows.forEach(row => tbody.appendChild(row));
        }
        document.body.appendChild(clone);
        const canvas = await html2canvas(clone, { scale: 2, logging: false });
        document.body.removeChild(clone);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = pdfHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        pdf.save(`immobilisations_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div className="container-fluid py-4">
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header text-white border-0 py-3" style={{
                                    background: "#138496",
                                    borderRadius: "12px",
                                }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="fas fa-building fa-2x"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0">Rapport des immobilisations</h5>
                                    {/* <small className="text-white-50">Liste, filtres, export Excel/PDF</small> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres regroupés sur une seule ligne (compact) */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="label-modern">Date début</label>
                            <input type="date" className="form-control modern-input" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="label-modern">Date fin</label>
                            <input type="date" className="form-control modern-input" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="label-modern">Devise</label>
                            <select className="modern-select w-100" value={devise} onChange={e => setDevise(e.target.value)}>
                                <option value="CDF">CDF</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="label-modern">Catégorie</label>
                            <select className="modern-select w-100" value={categorie} onChange={e => setCategorie(e.target.value)}>
                                <option value="">Toutes</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom_type}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="label-modern">Service</label>
                            <select className="modern-select w-100" value={service} onChange={e => setService(e.target.value)}>
                                <option value="">Tous</option>
                                {services.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="label-modern">Agence</label>
                            <select className="modern-select w-100" value={agenceFilter} onChange={e => setAgenceFilter(e.target.value)} disabled={userAgences.length <= 1}>
                                <option value="current">Agence courante ({currentAgence?.nom_agence || "?"})</option>
                                {userAgences.length > 1 && <option value="all">Toutes mes agences</option>}
                                {userAgences.map(ag => <option key={ag.id} value={ag.id}>{ag.code_agence} - {ag.nom_agence}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button onClick={rechercherImmobilisations} className="btn gradient-btn w-100 py-2 text-white" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search me-2"></i>}
                                Afficher
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau avec pagination */}
            {filteredData.length > 0 && (
                <div id="content-to-download-immobilisations">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <div className="text-center mb-3">
                                <EnteteRapport />
                                <h6 className="fw-bold">RAPPORT DES IMMOBILISATIONS</h6>
                                <p className="mb-0">Période du {dateDebut} au {dateFin} - {devise}</p>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped" id="main-table-immobilisations">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Code</th>
                                            <th>Nom</th>
                                            <th>Catégorie</th>
                                            <th>Date_acquisition</th>
                                            <th className="text-end">Valeur_acquisition</th>
                                            <th className="text-end">Amort._cumulé</th>
                                            <th className="text-end">Valeur_nette</th>
                                            <th className="text-end">Taux_(%)</th>
                                            <th>Méthode</th>
                                            <th>Service</th>
                                            <th>Agence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.map(immo => (
                                            <tr key={immo.id}>
                                                <td>{immo.code_immo}</td>
                                                <td>{immo.nom_immo}</td>
                                                <td>{immo.type?.nom_type || "-"}</td>
                                                <td>{immo.date_acquisition}</td>
                                                <td className="text-end">{numberWithSpaces(immo.valeur_acquisition)}</td>
                                                <td className="text-end">{numberWithSpaces(immo.amortissement_cumule)}</td>
                                                <td className="text-end fw-bold text-success">{numberWithSpaces(immo.valeur_nette_comptable)}</td>
                                                <td className="text-end">{immo.taux_amortissement} %</td>
                                                <td>{immo.methode_amortissement === 'lineaire' ? 'Linéaire' : 'Dégressif'}</td>
                                                <td>{immo.service_affectacion || "-"}</td>
                                                <td>{immo.code_agence}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => goToPage(currentPage-1)} disabled={currentPage===1}>
                                        <i className="fas fa-chevron-left"></i> Précédent
                                    </button>
                                    <span>Page {currentPage} / {totalPages}</span>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages}>
                                        Suivant <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {filteredData.length === 0 && !loading && (
                <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x mb-2 text-muted"></i>
                    <p>Aucune immobilisation trouvée pour ces critères.</p>
                </div>
            )}

            {/* Boutons d'export (en bas à droite, toutes les données) */}
            {filteredData.length > 0 && (
                <div className="d-flex justify-content-end gap-2 mt-4">
                    <button onClick={exportTableData} className="btn" style={{ background: "#28a745", color: "white", borderRadius: "8px" }}>
                        <i className="fas fa-file-excel me-2"></i>Exporter en Excel
                    </button>
                    <button onClick={exportToPDF} className="btn" style={{ background: "#dc3545", color: "white", borderRadius: "8px" }}>
                        <i className="fas fa-file-pdf me-2"></i>Exporter en PDF
                    </button>
                </div>
            )}

            <style>{`
                .bg-gradient-teal { background: linear-gradient(135deg, #20c997, #198764); }
                .dashboard-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .dashboard-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
                .modern-input, .modern-select { border-radius: 12px; border: 1px solid #e2e8f0; padding: 8px 12px; font-size: 0.9rem; transition: all 0.2s; }
                .modern-input:focus, .modern-select:focus { border-color: #20c997; box-shadow: 0 0 0 3px rgba(32,201,151,0.1); outline: none; }
                .gradient-btn { background: linear-gradient(135deg, #20c997, #198764); border: none; border-radius: 12px; transition: all 0.2s; }
                .gradient-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(32,201,151,0.3); }
                .label-modern { font-size: 0.75rem; font-weight: 600; color: #4a5568; margin-bottom: 4px; display: block; }
                .table th, .table td { vertical-align: middle; }
            `}</style>
        </div>
    );
};

export default RapportImmobilisations;