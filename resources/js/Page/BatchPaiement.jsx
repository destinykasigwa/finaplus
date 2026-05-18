import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const BatchPaiement = () => {
    // États
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [compteId, setCompteId] = useState("");
    const [comptesDisponibles, setComptesDisponibles] = useState([]);
    const [batchId, setBatchId] = useState(null);
    const [batch, setBatch] = useState(null);
    const [loadingBatch, setLoadingBatch] = useState(false);

    // Charger les comptes disponibles
    useEffect(() => {
        axios.get("/eco/batch/comptes-disponibles").then((res) => {
            if (res.data.status === 1) setComptesDisponibles(res.data.data);
        });
    }, []);

    // Charger les détails d'un batch
    const fetchBatch = async (id) => {
        setLoadingBatch(true);
        try {
            const res = await axios.get(`/eco/batch/detail/${id}`);
            if (res.data.status === 1) setBatch(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingBatch(false);
        }
    };


    // Polling automatique pour suivre l'état du batch (rafraîchissement toutes les 2 secondes)
useEffect(() => {
    if (!batchId) return;
    let interval;
    const poll = async () => {
        try {
            const res = await axios.get(`/eco/batch/detail/${batchId}`);
            if (res.data.status === 1) {
                const updatedBatch = res.data.data;
                setBatch(updatedBatch);
                // Arrêter le polling une fois que le batch n'est plus dans un état transitoire
                if (!['en_cours', 'valide'].includes(updatedBatch.statut)) {
                    clearInterval(interval);
                }
            }
        } catch (error) {
            console.error("Erreur lors du polling", error);
        }
    };
    // Démarrer le polling seulement si le batch est dans un état qui peut évoluer
    if (batch && (batch.statut === 'en_cours' || batch.statut === 'valide')) {
        interval = setInterval(poll, 2000);
        poll(); // appel immédiat pour ne pas attendre 2s
    }
    return () => {
        if (interval) clearInterval(interval);
    };
}, [batchId, batch?.statut]);

    // Upload du fichier
    const handleUpload = async () => {
        if (!file) {
            Swal.fire(
                "Erreur",
                "Veuillez sélectionner un fichier Excel",
                "error",
            );
            return;
        }
        if (!compteId) {
            Swal.fire(
                "Erreur",
                "Veuillez sélectionner un compte à débiter",
                "error",
            );
            return;
        }
        const formData = new FormData();
        formData.append("fichier", file);
        formData.append("compte_id", compteId);
        setLoading(true);
        try {
            const res = await axios.post("/eco/batch/upload", formData);
            if (res.data.status === 1) {
                setBatchId(res.data.batch.id);
                fetchBatch(res.data.batch.id);
                Swal.fire(
                    "Succès",
                    "Fichier uploadé et validé. Prévisualisation disponible.",
                    "success",
                );
            } else {
                Swal.fire(
                    "Erreur",
                    res.data.msg || "Erreur lors de l'upload",
                    "error",
                );
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur de connexion", "error");
        } finally {
            setLoading(false);
        }
    };

    // Soumettre à validation
    const soumettreValidation = async (id) => {
        try {
            const res = await axios.post(`/eco/batch/soumettre/${id}`);
            if (res.data.status === 1) {
                Swal.fire("Succès", "Batch soumis à validation", "success");
                fetchBatch(id);
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors de la soumission", "error");
        }
    };

    // Valider le batch
    const validerBatch = async (id) => {
        try {
            const res = await axios.post(`/eco/batch/valider/${id}`);
            if (res.data.status === 1) {
                Swal.fire("Succès", "Batch validé avec succès", "success");
                fetchBatch(id);
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors de la validation", "error");
        }
    };

    // Rejeter le batch
    const rejeterBatch = async (id, motif = "") => {
        const { value: motifRejet } = await Swal.fire({
            title: "Motif du rejet",
            input: "text",
            inputPlaceholder: "Raison du rejet",
            showCancelButton: true,
        });
        if (!motifRejet) return;
        try {
            const res = await axios.post(`/eco/batch/rejeter/${id}`, {
                motif: motifRejet,
            });
            if (res.data.status === 1) {
                Swal.fire("Succès", "Batch rejeté", "success");
                fetchBatch(id);
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors du rejet", "error");
        }
    };

    // Exécuter le batch (asynchrone)
    const executerBatch = async (id) => {
        const confirm = await Swal.fire({
            title: "Confirmation",
            text: "Êtes-vous sûr de vouloir exécuter ce batch ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
        });
        if (confirm.isConfirmed) {
            setLoading(true);
            try {
                const res = await axios.post(`/eco/batch/executer/${id}`);
                if (res.data.status === 1) {
                    Swal.fire(
                        "Succès",
                        "Batch en cours d'exécution",
                        "success",
                    );
                    fetchBatch(id);
                } else {
                    Swal.fire("Erreur", res.data.msg, "error");
                }
            } catch (error) {
                Swal.fire("Erreur", "Erreur lors de l'exécution", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const handlePreview = async () => {
        if (!file) {
            Swal.fire("Erreur", "Veuillez sélectionner un fichier", "error");
            return;
        }
        const formData = new FormData();
        formData.append("fichier", file);
        formData.append("compte_id", compteId);
        setPreviewLoading(true);
        try {
            const res = await axios.post("/eco/batch/preview", formData);
            if (res.data.status === 1) {
                setPreviewData(res.data.data);
                Swal.fire("Succès", "Prévisualisation disponible", "success");
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur de prévisualisation", "error");
        } finally {
            setPreviewLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header bg-gradient-teal text-white border-0 py-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="fas fa-layer-group fa-2x"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0">
                                        Paiement batch
                                    </h5>
                                    <small className="text-white-50">
                                        Import de fichiers Excel, validation et
                                        exécution en masse
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire d'upload */}
            <div className="card border-0 shadow-sm rounded-4 dashboard-card mb-4">
                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                    <h6 className="section-title">
                        <i
                            className="fas fa-upload me-2"
                            style={{ color: "#6366f1" }}
                        ></i>
                        Nouveau batch
                    </h6>
                </div>
                <div className="card-body pt-2">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-5">
                            <label className="label-modern">
                                Fichier Excel (.xlsx, .xls)
                            </label>
                            <input
                                type="file"
                                className="form-control modern-input"
                                accept=".xlsx, .xls, .csv"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                        <div className="col-md-5">
                            <label className="label-modern">
                                Compte à débiter
                            </label>
                            <input
                                list="comptes-list"
                                className="form-control modern-input"
                                value={compteId}
                                onChange={(e) => setCompteId(e.target.value)}
                                placeholder="Sélectionner ou saisir un RefCompte"
                            />
                            <datalist id="comptes-list">
                                {comptesDisponibles.map((compte) => (
                                    <option
                                        key={compte.RefCompte}
                                        value={compte.RefCompte}
                                    >
                                        {compte.NumCompte} - {compte.NomCompte}{" "}
                                        (Solde: {compte.solde}{" "}
                                        {compte.CodeMonnaie == 1
                                            ? "USD"
                                            : "CDF"}
                                        )
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <div className="col-md-2">
                            <button
                                onClick={handleUpload}
                                className="btn gradient-btn w-100 py-2 text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <i className="fas fa-cloud-upload-alt me-2"></i>
                                )}
                                Uploader
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={handlePreview}
                                disabled={previewLoading}
                            >
                                {previewLoading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <i className="fas fa-eye me-2"></i>
                                )}
                                Prévisualiser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prévisualisation du batch */}
            {batchId && (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-transparent border-0 pt-3 pb-0">
                        <h6 className="section-title">
                            <i
                                className="fas fa-eye me-2"
                                style={{ color: "#6366f1" }}
                            ></i>
                            Prévisualisation du batch
                        </h6>
                    </div>
                    <div className="card-body">
                        {loadingBatch ? (
                            <div className="text-center py-5">
                                <Bars height="60" width="60" color="#20c997" />
                            </div>
                        ) : batch ? (
                            <>
                                {/* Résumé */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-3">
                                        <div className="bg-light rounded-3 p-3 text-center">
                                            <small className="text-muted">
                                                Référence
                                            </small>
                                            <h6 className="fw-bold mb-0">
                                                {batch.reference}
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="bg-light rounded-3 p-3 text-center">
                                            <small className="text-muted">
                                                Statut
                                            </small>
                                            <span
                                                className={`badge fs-6 px-3 py-1 rounded-pill ${
                                                    batch.statut === "brouillon"
                                                        ? "bg-secondary"
                                                        : batch.statut ===
                                                            "en_attente"
                                                          ? "bg-warning"
                                                          : batch.statut ===
                                                              "valide"
                                                            ? "bg-info"
                                                            : batch.statut ===
                                                                "en_cours"
                                                              ? "bg-primary"
                                                              : batch.statut ===
                                                                  "termine"
                                                                ? "bg-success"
                                                                : batch.statut ===
                                                                    "partiel"
                                                                  ? "bg-warning"
                                                                  : "bg-danger"
                                                }`}
                                            >
                                                {batch.statut}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="bg-light rounded-3 p-3 text-center">
                                            <small className="text-muted">
                                                Montant total
                                            </small>
                                            <h6 className="fw-bold mb-0">
                                                {batch.total_montant.toLocaleString()}{" "}
                                                {batch.compte?.CodeMonnaie == 1
                                                    ? "USD"
                                                    : "CDF"}
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="bg-light rounded-3 p-3 text-center">
                                            <small className="text-muted">
                                                Lignes
                                            </small>
                                            <h6 className="fw-bold mb-0">
                                                {batch.total_lignes}
                                            </h6>
                                        </div>
                                    </div>
                                </div>

                                {/* Tableau des lignes */}
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Matricule</th>
                                                <th>Nom</th>
                                                <th>Compte</th>
                                                <th>Téléphone</th>
                                                <th>Montant</th>
                                                <th>Statut</th>
                                                <th>Erreur</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {batch.lignes.map((ligne) => (
                                                <tr
                                                    key={ligne.id}
                                                    className={
                                                        ligne.statut === "echec"
                                                            ? "table-danger"
                                                            : ""
                                                    }
                                                >
                                                    <td>
                                                        {ligne.matricule || "-"}
                                                    </td>
                                                    <td>{ligne.nom || "-"}</td>
                                                    <td>
                                                        {ligne.compte || "-"}
                                                    </td>
                                                    <td>
                                                        {ligne.telephone || "-"}
                                                    </td>
                                                    <td className="text-end">
                                                        {ligne.montant.toLocaleString()}
                                                    </td>
                                                    <td>
                                                        {ligne.statut ===
                                                        "en_attente"
                                                            ? "Acceptée"
                                                            : "Rejetée"}
                                                    </td>
                                                    <td className="text-danger">
                                                        {ligne.message_erreur ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Boutons d'action */}
                                <div className="d-flex gap-2 mt-4">
                                    {batch.statut === "brouillon" && (
                                        <button
                                            onClick={() =>
                                                soumettreValidation(batch.id)
                                            }
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-paper-plane me-2"></i>
                                            Soumettre à validation
                                        </button>
                                    )}
                                    {batch.statut === "en_attente" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    validerBatch(batch.id)
                                                }
                                                className="btn btn-success"
                                            >
                                                <i className="fas fa-check-circle me-2"></i>
                                                Valider
                                            </button>
                                            <button
                                                onClick={() =>
                                                    rejeterBatch(batch.id)
                                                }
                                                className="btn btn-danger"
                                            >
                                                <i className="fas fa-times-circle me-2"></i>
                                                Rejeter
                                            </button>
                                        </>
                                    )}
                                    {batch.statut === "valide" && (
                                        <button
                                            onClick={() =>
                                                executerBatch(batch.id)
                                            }
                                            className="btn btn-warning text-white"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <i className="fas fa-play me-2"></i>
                                            )}
                                            Exécuter le batch
                                        </button>
                                    )}
                                    {batch.statut === "en_cours" && (
                                        <button
                                            className="btn btn-secondary"
                                            disabled
                                        >
                                            <i className="fas fa-spinner fa-pulse me-2"></i>
                                            Traitement en cours...
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <i className="fas fa-inbox fa-3x mb-2"></i>
                                <p>Aucune donnée</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchPaiement;
