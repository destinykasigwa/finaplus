import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

const ImmoGestion = () => {
    const [immobilisations, setImmobilisations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [typesImmo, setTypesImmo] = useState([]);
    const [comptesImmo, setComptesImmo] = useState([]);
    const [comptesAmort, setComptesAmort] = useState([]);
    const [userAgences, setUserAgences] = useState([]);
    const [currentAgence, setCurrentAgence] = useState(null);
    const [searchText, setSearchText] = useState('');
const [filteredImmo, setFilteredImmo] = useState([]);


    const [formData, setFormData] = useState({
        code_immo: "",
        nom_immo: "",
        date_acquisition: "",
        valeur_acquisition: "",
        type_immo: "",
        duree_amortissement_ans: "",
        methode_amortissement: "lineaire",
        valeur_residuelle: 0,
        taux_amortissement: "",
        compte_comptable_immo: "",
        compte_comptable_amortissement: "",
        code_agence: "",
    });

    useEffect(() => {
        loadUserAgences();
        fetchTypesImmo();
        // fetchComptesImmo();
        fetchImmobilisations();
        fetchComptesImmobilisations();
        fetchComptesAmortissements();
    }, []);

    useEffect(() => {
    // Filtrer les immobilisations en fonction du texte saisi
    if (searchText.trim() === '') {
        setFilteredImmo(immobilisations);
    } else {
        const lowerSearch = searchText.toLowerCase();
        const filtered = immobilisations.filter(immo =>
            immo.code_immo.toLowerCase().includes(lowerSearch) ||
            immo.nom_immo.toLowerCase().includes(lowerSearch) ||
            (immo.type_immo && immo.type_immo.nom_type && immo.type_immo.nom_type.toLowerCase().includes(lowerSearch)) ||
            immo.code_agence.toLowerCase().includes(lowerSearch) ||
            immo.methode_amortissement.toLowerCase().includes(lowerSearch)
        );
        setFilteredImmo(filtered);
    }

}, [searchText, immobilisations]);


const fetchComptesImmobilisations = async () => {
    const res = await axios.get("/eco/comptes/immobilisations");
    if (res.data.status === 1) setComptesImmo(res.data.data);
};

const fetchComptesAmortissements = async () => {
    const res = await axios.get("/eco/comptes/amortissements");
    if (res.data.status === 1) setComptesAmort(res.data.data);
};

    const loadUserAgences = () => {
        const agences = window.userAgences || [];
        const current = window.currentAgence || null;
        setUserAgences(agences);
        setCurrentAgence(current);
        if (current && current.code_agence) {
            setFormData(prev => ({ ...prev, code_agence: current.code_agence }));
        }
    };

    const fetchTypesImmo = async () => {
        try {
            const res = await axios.get("/eco/immo/types");
            if (res.data.status === 1) setTypesImmo(res.data.data);
            console.log(typesImmo);
        } catch (error) {
            console.error("Erreur chargement types", error);
        }
    };

    // const fetchComptesImmo = async () => {
    //     try {
    //         const res = await axios.get("/eco/comptes/classe/2");
    //         if (res.data.status === 1) setComptesImmo(res.data.data);
    //     } catch (error) {
    //         console.error("Erreur chargement comptes", error);
    //     }
    // };

    const fetchImmobilisations = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/eco/immo/liste");
            if (res.data.status === 1) setImmobilisations(res.data.data);
        } catch (error) {
            console.error("Erreur chargement immobilisations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "type_immo") {
            const selectedType = typesImmo.find(t => t.id == value);
            if (selectedType) {
                setFormData(prev => ({
                    ...prev,
                    duree_amortissement_ans: selectedType.duree_amortissement,
                    taux_amortissement: selectedType.taux_amortissement,
                    methode_amortissement: selectedType.methode_amortissement || "lineaire",
                }));
            }
        }
    };

    const openModal = (immo = null) => {
        if (immo) {
            setEditingId(immo.id);
            setFormData({
                code_immo: immo.code_immo,
                nom_immo: immo.nom_immo,
                date_acquisition: immo.date_acquisition,
                valeur_acquisition: immo.valeur_acquisition,
                type_immo: immo.type_immo,
                duree_amortissement_ans: immo.duree_amortissement_ans,
                methode_amortissement: immo.methode_amortissement,
                valeur_residuelle: immo.valeur_residuelle,
                taux_amortissement: immo.taux_amortissement,
                compte_comptable_immo: immo.compte_comptable_immo,
                compte_comptable_amortissement: immo.compte_comptable_amortissement,
                code_agence: immo.code_agence,
            });
        } else {
            setEditingId(null);
            setFormData({
                code_immo: "",
                nom_immo: "",
                date_acquisition: "",
                valeur_acquisition: "",
                type_immo: "",
                duree_amortissement_ans: "",
                methode_amortissement: "lineaire",
                valeur_residuelle: 0,
                taux_amortissement: "",
                compte_comptable_immo: "",
                compte_comptable_amortissement: "",
                code_agence: currentAgence?.code_agence || "",
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (editingId) {
                res = await axios.put(`/eco/immo/modifier/${editingId}`, formData);
            } else {
                res = await axios.post("/eco/immo/creer", formData);
            }
            if (res.data.status === 1) {
                Swal.fire("Succès", editingId ? "Immobilisation modifiée" : "Immobilisation enregistrée", "success");
                setModalOpen(false);
                fetchImmobilisations();
            } else {
                Swal.fire("Erreur", res.data.msg || "Erreur lors de l'enregistrement", "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Une erreur est survenue", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Confirmation",
            text: "Supprimer cette immobilisation ?",
            icon: "warning",
            showCancelButton: true,
        });
        if (confirm.isConfirmed) {
            try {
                const res = await axios.delete(`/eco/immo/supprimer/${id}`);
                if (res.data.status === 1) {
                    Swal.fire("Supprimé", "", "success");
                    fetchImmobilisations();
                } else {
                    Swal.fire("Erreur", res.data.msg, "error");
                }
            } catch (error) {
                Swal.fire("Erreur", "Impossible de supprimer", "error");
            }
        }
    };

    const columns = [
        { name: "Code", selector: row => row.code_immo, sortable: true },
        { name: "Nom", selector: row => row.nom_immo, sortable: true },
        { name: "Date acquisition", selector: row => row.date_acquisition, sortable: true },
        { name: "Valeur (CDF)", selector: row => row.valeur_acquisition.toLocaleString(), sortable: true },
        { name: "Durée (ans)", selector: row => row.duree_amortissement_ans },
        { name: "Méthode", selector: row => row.methode_amortissement },
        { name: "VNC (CDF)", selector: row => row.valeur_nette_comptable?.toLocaleString() || "-" },
        { name: "Agence", selector: row => row.code_agence },
        {
            name: "Actions",
            cell: row => (
                <>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(row)}>
                        <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </>
            ),
            center: true,
        },
    ];

    return (
        <div className="container-fluid py-4">
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header text-white border-0 py-3 d-flex justify-content-between align-items-center" style={{background:"#138496" }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="fas fa-building fa-2x"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0">Gestion des immobilisations</h5>
                                    <small className="text-white-50">Liste, création, modification, suppression</small>
                                </div>
                            </div>
                            <button className="btn btn-light" onClick={() => openModal()}>
                                <i className="fas fa-plus me-2"></i>Nouvelle immobilisation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau */}
           {/* Carte du tableau avec barre de recherche */}
            <div className="card border-0 shadow-sm rounded-4">
                  <div className="d-flex justify-content-end mb-3">
            <div className="d-flex gap-2">
                <input
                    type="text"
                    className="form-control form-control-sm p-2 mt-2 mr-1"
                    style={{ width: "250px", borderRadius: "20px" }}
                    placeholder="Rechercher..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                {searchText && (
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSearchText('')}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>
        </div>
                <div className="card-body p-0">
                    <DataTable
                        columns={columns}
                        data={filteredImmo}
                        progressPending={loading}
                        pagination
                        highlightOnHover
                        customStyles={{
                            headCells: { style: { backgroundColor: "#f8f9fa", fontWeight: "bold" } }
                        }}
                    />
                </div>
            </div>

            {/* Modal d'édition / création */}
            {modalOpen && (
                <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setModalOpen(false)}>
                    <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-content rounded-4">
                            <div className="modal-header text-white" style={{background:"#138496" }}>
                                <h5 className="modal-title">{editingId ? "Modifier" : "Nouvelle"} immobilisation</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="label-modern">Code immobilisation</label>
                                            <input type="text" className="form-control modern-input" name="code_immo" value={formData.code_immo} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="label-modern">Nom / Désignation</label>
                                            <input type="text" className="form-control modern-input" name="nom_immo" value={formData.nom_immo} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Date d'acquisition</label>
                                            <input type="date" className="form-control modern-input" name="date_acquisition" value={formData.date_acquisition} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Valeur acquisition (CDF)</label>
                                            <input type="number" step="0.01" className="form-control modern-input" name="valeur_acquisition" value={formData.valeur_acquisition} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Agence</label>
                                            <select className="modern-select w-100" name="code_agence" value={formData.code_agence} onChange={handleChange} disabled={userAgences.length <= 1} required>
                                                <option value="">Sélectionner</option>
                                                {userAgences.map(a => <option key={a.id} value={a.code_agence}>{a.code_agence} - {a.nom_agence}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Type immobilisation</label>
                                            <select className="modern-select w-100" name="type_immo" value={formData.type_immo} onChange={handleChange} required>
                                                <option value="">Sélectionner</option>
                                                {typesImmo.map(t => <option key={t.id} value={t.id}>{t.nom_type}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Durée (années)</label>
                                            <input type="number" className="form-control modern-input" name="duree_amortissement_ans" value={formData.duree_amortissement_ans} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Méthode</label>
                                            <select className="modern-select w-100" name="methode_amortissement" value={formData.methode_amortissement} onChange={handleChange}>
                                                <option value="lineaire">Linéaire</option>
                                                <option value="degresif">Dégressif (OHADA)</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Taux amortissement (%)</label>
                                            <input type="number" step="0.01" className="form-control modern-input" name="taux_amortissement" value={formData.taux_amortissement} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="label-modern">Valeur résiduelle (CDF)</label>
                                            <input type="number" step="0.01" className="form-control modern-input" name="valeur_residuelle" value={formData.valeur_residuelle} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="label-modern">Compte immobilisation</label>
                                            <select className="modern-select w-100" name="compte_comptable_immo" value={formData.compte_comptable_immo} onChange={handleChange} required>
                                                {comptesImmo.map(c => <option key={c.NumCompte} value={c.NumCompte}>{c.NumCompte} - {c.NomCompte}</option>)}
                                                
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="label-modern">Compte amortissement</label>
                                            <select className="modern-select w-100" name="compte_comptable_amortissement" value={formData.compte_comptable_amortissement} onChange={handleChange} required>
                                                <option value="">Sélectionner</option>
                                                {comptesAmort.map(c => <option key={c.NumCompte} value={c.NumCompte}>{c.NumCompte} - {c.NomCompte}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="text-end mt-4">
                                        <button type="submit" className="btn gradient-btn px-4" disabled={loading}>
                                            {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-save me-2"></i>}
                                            {editingId ? "Mettre à jour" : "Enregistrer"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImmoGestion;