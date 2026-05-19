import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const GestionBatchs = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statutFiltre, setStatutFiltre] = useState("en_attente");
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationData, setPaginationData] = useState(null);
    const [isLoadingBar, setIsLoadingBar] = useState(false);

    useEffect(() => {
        chargerBatches();
    }, [statutFiltre, refreshKey]);

    // const chargerBatches = async () => {
    //     setLoading(true);
    //     try {
    //         const res = await axios.get(`/eco/batch/historique?statut=${statutFiltre}`);
    //         if (res.data.status === 1) {
    //             const batchesData = res.data.data.data || res.data.data;
    //             setBatches(Array.isArray(batchesData) ? batchesData : []);
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const chargerBatches = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `/eco/batch/historique?statut=${statutFiltre}&page=${page}`,
            );
            if (res.data.status === 1) {
                const paginated = res.data.data;
                setBatches(paginated.data);
                setCurrentPage(paginated.current_page);
                setLastPage(paginated.last_page);
                setPaginationData(paginated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoir = async (batch) => {
        setSelectedBatch(null);
        setLoadingDetail(true);
        try {
            const res = await axios.get(`/eco/batch/detail/${batch.id}`);
            if (res.data.status === 1) setSelectedBatch(res.data.data);
            else
                Swal.fire(
                    "Erreur",
                    "Impossible de charger les détails",
                    "error",
                );
        } catch (error) {
            Swal.fire("Erreur", "Erreur de chargement", "error");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Actions
    const soumettreValidation = async (id) => {
        const res = await axios.post(`/eco/batch/soumettre/${id}`);
        if (res.data.status === 1) {
            Swal.fire("Succès", "Batch soumis à validation", "success");
            setRefreshKey((prev) => prev + 1);
        } else {
            Swal.fire("Erreur", res.data.msg, "error");
        }
    };

    const validerBatch = async (id) => {
        const res = await axios.post(`/eco/batch/valider/${id}`);
        if (res.data.status === 1) {
            Swal.fire("Validé", "Batch validé avec succès", "success");
            setRefreshKey((prev) => prev + 1);
            if (selectedBatch?.id === id) handleVoir(selectedBatch);
        } else {
            Swal.fire("Erreur", res.data.msg, "error");
        }
    };

    const rejeterBatch = async (id) => {
        const { value: motif } = await Swal.fire({
            title: "Motif du rejet",
            input: "text",
            inputPlaceholder: "Raison du rejet",
            showCancelButton: true,
        });
        if (!motif) return;
        const res = await axios.post(`/eco/batch/rejeter/${id}`, { motif });
        if (res.data.status === 1) {
            Swal.fire("Rejeté", "Batch rejeté", "success");
            setRefreshKey((prev) => prev + 1);
            if (selectedBatch?.id === id) setSelectedBatch(null);
        } else {
            Swal.fire("Erreur", res.data.msg, "error");
        }
    };

    // const executerBatch = async (id) => {
    //     const confirm = await Swal.fire({
    //         title: "Confirmation",
    //         text: "Exécuter ce batch ?",
    //         icon: "warning",
    //         showCancelButton: true,
    //     });
    //     if (confirm.isConfirmed) {
    //         const res = await axios.post(`/eco/batch/executer/${id}`);
    //         if (res.data.status === 1) {
    //             Swal.fire("Succès", "Batch en cours d'exécution", "success");
    //             setRefreshKey((prev) => prev + 1);
    //             if (selectedBatch?.id === id) handleVoir(selectedBatch);
    //         } else {
    //             Swal.fire("Erreur", res.data.msg, "error");
    //         }
    //     }
    // };

    const executerBatch = async (id) => {
        const confirm = await Swal.fire({
            title: "Confirmation",
            text: "Exécuter ce batch ?",
            icon: "warning",
            showCancelButton: true,
        });
        if (confirm.isConfirmed) {
            setIsLoadingBar(true); // Afficher le spinner
            try {
                const res = await axios.post(`/eco/batch/executer/${id}`);
                if (res.data.status === 1) {
                    Swal.fire(
                        "Succès",
                        "Batch en cours d'exécution",
                        "success",
                    );
                    setRefreshKey((prev) => prev + 1);
                    if (selectedBatch?.id === id) handleVoir(selectedBatch);
                } else {
                    Swal.fire("Erreur", res.data.msg, "error");
                }
            } catch (error) {
                Swal.fire("Erreur", "Erreur lors de l'exécution", "error");
            } finally {
                setIsLoadingBar(false); // Cacher le spinner
            }
        }
    };
    const isAdmin = window.currentUser?.admin === 1;

    return (
        <div className="container-fluid py-4">
            {isLoadingBar && (
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
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
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
                        <h5 className="mt-3 text-dark">Patientez...</h5>
                        <small className="text-muted">
                            Traitement en cours
                        </small>
                    </div>
                </div>
            )}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-gradient-teal text-white">
                    <h5 className="mb-0">Gestion des paiements batch</h5>
                </div>
                <div className="card-body">
                    {/* Filtres */}
                    <div className="d-flex gap-3 mb-3">
                        <button
                            className={`btn ${statutFiltre === "en_attente" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setStatutFiltre("en_attente")}
                        >
                            En attente
                        </button>
                        <button
                            className={`btn ${statutFiltre === "valide" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setStatutFiltre("valide")}
                        >
                            Validés
                        </button>
                        <button
                            className={`btn ${statutFiltre === "termine" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setStatutFiltre("termine")}
                        >
                            Terminés
                        </button>
                    </div>

                    {/* Tableau des batches */}
                    {loading ? (
                        <div className="text-center py-5">
                            <Bars height="60" width="60" color="#20c997" />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Référence</th>
                                        <th>Créé par</th>
                                        <th>Montant total</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches.map((batch) => (
                                        <tr key={batch.id}>
                                            <td>{batch.reference}</td>
                                            <td>
                                                {batch.createur?.name || "-"}
                                            </td>
                                            <td className="text-end">
                                                {batch.total_montant.toLocaleString()}{" "}
                                                {batch.compte?.CodeMonnaie == 1
                                                    ? "USD"
                                                    : "CDF"}
                                            </td>
                                            <td>{batch.statut}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() =>
                                                        handleVoir(batch)
                                                    }
                                                >
                                                    Voir
                                                </button>
                                                {batch.statut === "brouillon" &&
                                                    batch.cree_par ===
                                                        window.currentUser
                                                            ?.id && (
                                                        <button
                                                            className="btn btn-sm btn-primary ms-2"
                                                            onClick={() =>
                                                                soumettreValidation(
                                                                    batch.id,
                                                                )
                                                            }
                                                        >
                                                            Soumettre
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Détail du batch sélectionné (affiché en bas) */}
                    {selectedBatch && (
                        <div className="mt-4 p-3 border rounded-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold">
                                    Détail du batch {selectedBatch.reference}
                                </h6>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setSelectedBatch(null)}
                                >
                                    Fermer
                                </button>
                            </div>
                            {loadingDetail ? (
                                <div className="text-center">
                                    <Bars
                                        height="40"
                                        width="40"
                                        color="#20c997"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-3">
                                            <strong>Statut :</strong>{" "}
                                            {selectedBatch.statut}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>Montant total :</strong>{" "}
                                            {selectedBatch.total_montant.toLocaleString()}{" "}
                                            {selectedBatch.compte
                                                ?.CodeMonnaie == 1
                                                ? "USD"
                                                : "CDF"}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>Lignes :</strong>{" "}
                                            {selectedBatch.total_lignes}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>Date exécution :</strong>{" "}
                                            {selectedBatch.date_execution ||
                                                "-"}
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Compte</th>
                                                    <th>Montant</th>
                                                    <th>Libellé</th>
                                                    <th>Statut</th>
                                                    <th>Erreur</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedBatch.lignes.map(
                                                    (ligne) => (
                                                        <tr key={ligne.id}>
                                                            <td>
                                                                {ligne.compte ||
                                                                    ligne.telephone ||
                                                                    "-"}
                                                            </td>
                                                            <td className="text-end">
                                                                {ligne.montant.toLocaleString()}
                                                            </td>
                                                            <td>
                                                             {ligne.reference}
                                                            </td>
                                                            <td>
                                                                {ligne.statut ===
                                                                "succes"
                                                                    ? "Succès"
                                                                    : ligne.statut ===
                                                                        "echec"
                                                                      ? "Échec"
                                                                      : "En attente"}
                                                            </td>
                                                            <td className="text-danger">
                                                                {ligne.message_erreur ||
                                                                    "-"}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                disabled={currentPage === 1}
                                                onClick={() =>
                                                    chargerBatches(
                                                        currentPage - 1,
                                                    )
                                                }
                                            >
                                                Précédent
                                            </button>
                                            <span>
                                                Page {currentPage} / {lastPage}
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                disabled={
                                                    currentPage === lastPage
                                                }
                                                onClick={() =>
                                                    chargerBatches(
                                                        currentPage + 1,
                                                    )
                                                }
                                            >
                                                Suivant
                                            </button>
                                        </div>
                                    </div>
                                    {/* Boutons d'action selon statut et rôle */}
                                    <div className="d-flex gap-2 mt-3">
                                        {selectedBatch.statut === "brouillon" &&
                                            selectedBatch.cree_par ===
                                                window.currentUser?.id && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() =>
                                                        soumettreValidation(
                                                            selectedBatch.id,
                                                        )
                                                    }
                                                >
                                                    Soumettre à validation
                                                </button>
                                            )}
                                        {selectedBatch.statut ===
                                            "en_attente" &&
                                            isAdmin && (
                                                <>
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() =>
                                                            validerBatch(
                                                                selectedBatch.id,
                                                            )
                                                        }
                                                    >
                                                        Valider
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() =>
                                                            rejeterBatch(
                                                                selectedBatch.id,
                                                            )
                                                        }
                                                    >
                                                        Rejeter
                                                    </button>
                                                </>
                                            )}
                                        {selectedBatch.statut === "valide" &&
                                            isAdmin && (
                                                <button
                                                    className="btn btn-warning text-white"
                                                    onClick={() =>
                                                        executerBatch(
                                                            selectedBatch.id,
                                                        )
                                                    }
                                                >
                                                    Exécuter le batch
                                                </button>
                                            )}
                                        {selectedBatch.statut ===
                                            "en_cours" && (
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
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionBatchs;
