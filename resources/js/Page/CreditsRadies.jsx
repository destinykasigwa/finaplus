import React, { useState, useEffect} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { Bars } from "react-loader-spinner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { EnteteRapport } from "./HeaderReport"; // adaptez le chemin
import html2canvas from "html2canvas";



const CreditsRadies = () => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [total, setTotal] = useState({ count: 0, montant: 0 });
    const [gestionnaires, setGestionnaires] = useState([]);
    const [filtreGestionnaire, setFiltreGestionnaire] = useState("");
    const [filtreDevise, setFiltreDevise] = useState("");
    const [agenceFilter, setAgenceFilter] = useState("current"); // 'current', 'all', ou un id d'agence
   


    useEffect(() => {
        fetchCredits();
    }, [filtreGestionnaire, filtreDevise]);

    const fetchCredits = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/eco/credits/radies/liste", {
                params: {
                    gestionnaire: filtreGestionnaire,
                    devise: filtreDevise,
                },
            });
            if (res.data.status === 1) {
                setCredits(res.data.data);
                setTotal(res.data.total);
                setGestionnaires(res.data.gestionnaires || []);
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Impossible de charger les crédits", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWriteOff = async () => {
        const confirm = await Swal.fire({
            title: "Confirmation",
            text: `Radier ${selectedRows.length} crédit(s) ? Action irréversible.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Oui, radier",
        });
        if (confirm.isConfirmed) {
            setLoading(true);
            try {
                const res = await axios.post("/eco/credits/radies/radier", {
                    dossiers: selectedRows.map(row => row.NumDossier),
                });
                if (res.data.status === 1) {
                    Swal.fire("Succès", `${res.data.radies} crédit(s) radié(s)`, "success");
                    fetchCredits();
                } else {
                    Swal.fire("Erreur", res.data.msg, "error");
                }
            } catch (error) {
                Swal.fire("Erreur", "Erreur lors de la radiation", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const exportToExcel = () => {
        if (!credits.length) {
            Swal.fire("Info", "Aucune donnée à exporter", "info");
            return;
        }
        const exportData = credits.map(c => ({
            "N° Dossier": c.NumDossier,
            "Client": c.NomCompte,
            "Montant initial": c.MontantAccorde,
            "Capital restant": c.CapitalRestant,
            "Jours retard": c.JoursRetard,
            "Gestionnaire": c.Gestionnaire,
            "Devise": c.CodeMonnaie,
            "Agence": c.CodeAgence,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Credits_radies");
        XLSX.writeFile(wb, `credits_radies_${new Date().toISOString().slice(0,19)}.xlsx`);
    };

 const exportToPDF = async () => {
    if (!credits.length) return;

    const headerDiv = document.getElementById('pdf-header-container');
    if (!headerDiv) return;
    headerDiv.style.display = 'block';
    await new Promise(r => setTimeout(r, 50));

    const canvas = await html2canvas(headerDiv, { scale: 1.2, logging: false });
    headerDiv.style.display = 'none';

    const imgData = canvas.toDataURL('image/jpeg', 0.7);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight, undefined, 'FAST');

    const startY = imgHeight + 5;
    doc.autoTable({
        startY,
        head: [["N° Dossier", "Client", "Montant initial", "Capital restant", "Jours retard", "Gestionnaire", "Devise"]],
        body: credits.map(c => [c.NumDossier, c.NomCompte, c.MontantAccorde, c.CapitalRestant, c.JoursRetard, c.Gestionnaire, c.CodeMonnaie]),
        theme: "striped",
        headStyles: { fillColor: [32, 201, 151] },
        styles: { fontSize: 8, cellPadding: 1 }, // police plus petite pour gagner de la place
    });

    doc.save(`credits_radies_${new Date().toISOString().slice(0,19)}.pdf`);
};

    const columns = [
        { name: "N° Dossier", selector: row => row.NumDossier, sortable: true },
        { name: "Client", selector: row => row.NomCompte, sortable: true },
        { name: "Montant initial", selector: row => numberWithSpaces(row.MontantAccorde?.toLocaleString()), sortable: true, className: "text-end" },
        { name: "Capital restant", selector: row => numberWithSpaces(row.CapitalRestant?.toFixed(2).toLocaleString()), sortable: true, className: "text-end" },
        { name: "Jours retard", selector: row => row.JoursRetard, sortable: true, className: "text-center" },
        { name: "Gestionnaire", selector: row => row.Gestionnaire, sortable: true },
        { name: "Devise", selector: row => row.CodeMonnaie, sortable: true },
    ];

      const getAgenceNom = () => {
        if (agenceFilter === "current") {
            return "AGENCE DE " + currentAgence?.nom_agence || "Non définie";
        }
        if (agenceFilter === "all") {
            return "TOUTES AGENCES";
        }
        // agenceFilter est un id
        const agence = userAgences.find((a) => a.id == agenceFilter);
        // return agence ? `${agence.code_agence} - ${agence.nom_agence}` : "Non définie";
        return agence ? `AGENCE DE ${agence.nom_agence}` : "Non définie";
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
        <div className="container-fluid py-4">
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header text-white border-0 py-3" style={{background:"#138496" }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="fas fa-trash-alt fa-2x"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0">Crédits radiés</h5>
                                    <small className="text-white-50">Gestion des créances irrécouvrables</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <label className="form-label">Gestionnaire</label>
                    <select className="form-select" value={filtreGestionnaire} onChange={e => setFiltreGestionnaire(e.target.value)}>
                        <option value="">Tous</option>
                        {gestionnaires.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="form-label">Devise</label>
                    <select className="form-select" value={filtreDevise} onChange={e => setFiltreDevise(e.target.value)}>
                        <option value="">Toutes</option>
                        <option value="CDF">CDF</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
                <div className="col-md-6 d-flex justify-content-end align-items-end gap-2">
                    <button className="btn btn-success" onClick={exportToExcel}>
                        <i className="fas fa-file-excel me-2"></i>Excel
                    </button>
                    <button className="btn btn-danger" onClick={exportToPDF}>
                        <i className="fas fa-file-pdf me-2"></i>PDF
                    </button>
                </div>
            </div>

            {/* Résumé + bouton radiation */}
            <div className="row g-4 mb-4">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="text-muted">Crédits éligibles</span>
                                    <h2 className="fw-bold mb-0">{total.count}</h2>
                                </div>
                                <div className="vr"></div>
                                <div>
                                    <span className="text-muted">Montant total impayé</span>
                                    <h2 className="fw-bold mb-0">{total.montant?.toLocaleString()}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
                        <div className="card-body d-flex align-items-center justify-content-center">
                            <button
                                className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                                onClick={handleWriteOff}
                                disabled={selectedRows.length === 0 || loading}
                            >
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-ban"></i>}
                                <span>Radier les crédits sélectionnés</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau */}
            <div id="pdf-header-container" style={{ display: 'none', padding: '20px', textAlign: 'center' }}>
    <EnteteRapport />
    <div className="text-center mb-3">
        <h6 className="fw-bold">CREDITS ELIGIBLES A LA RADIATION</h6>
        <p>
            Agence : {currentAgence?.nom_agence || 'Non définie'} - {new Date().toLocaleDateString('fr-FR')}
        </p>
    </div>
</div>
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-0">
                    <DataTable
                        columns={columns}
                        data={credits}
                        progressPending={loading}
                        selectableRows
                        onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                        pagination
                        highlightOnHover
                        customStyles={{
                            headCells: { style: { backgroundColor: "#f8f9fa", fontWeight: "bold", color: "#1e293b" } },
                            rows: { style: { minHeight: "48px" } },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreditsRadies;