// BatchPreviewDetail.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bars } from "react-loader-spinner";
import Swal from "sweetalert2";

const BatchPreviewDetail = ({ batchId, onRefresh, refreshKey }) => {
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBatch = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/eco/batch/detail/${batchId}`);
            if (res.data.status === 1) setBatch(res.data.data);
            else Swal.fire("Erreur", "Batch introuvable", "error");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (batchId) fetchBatch();
    }, [batchId, refreshKey]);

    // Fonctions d’action (valider, rejeter, exécuter) – à recopier depuis BatchPaiement
    const validerBatch = async (id) => {
        const res = await axios.post(`/eco/batch/valider/${id}`);
        if (res.data.status === 1) {
            Swal.fire("Validé", "Batch validé", "success");
            fetchBatch();
            if (onRefresh) onRefresh();
        } else {
            Swal.fire("Erreur", res.data.msg, "error");
        }
    };

    const rejeterBatch = async (id) => {
        const { value: motif } = await Swal.fire({ title: "Motif", input: "text", inputPlaceholder: "Raison du rejet" });
        if (!motif) return;
        const res = await axios.post(`/eco/batch/rejeter/${id}`, { motif });
        if (res.data.status === 1) {
            Swal.fire("Rejeté", "Batch rejeté", "success");
            fetchBatch();
            if (onRefresh) onRefresh();
        } else {
            Swal.fire("Erreur", res.data.msg, "error");
        }
    };

    const executerBatch = async (id) => {
        const confirm = await Swal.fire({ title: "Confirmation", text: "Exécuter ce batch ?", icon: "warning", showCancelButton: true });
        if (confirm.isConfirmed) {
            const res = await axios.post(`/eco/batch/executer/${id}`);
            if (res.data.status === 1) {
                Swal.fire("Succès", "Batch en cours d'exécution", "success");
                fetchBatch();
                if (onRefresh) onRefresh();
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        }
    };

    if (loading) return <div className="text-center py-3"><Bars height="40" width="40" color="#20c997" /></div>;
    if (!batch) return null;

    return (
        <div className="mt-4 p-3 border rounded bg-light">
            <h6 className="fw-bold">Détail du batch {batch.reference}</h6>
            <div className="row g-2 mb-2">
                <div className="col-md-3"><strong>Statut :</strong> {batch.statut}</div>
                <div className="col-md-3"><strong>Montant total :</strong> {batch.total_montant.toLocaleString()} {batch.compte?.CodeMonnaie == 1 ? 'USD' : 'CDF'}</div>
                <div className="col-md-3"><strong>Lignes :</strong> {batch.total_lignes}</div>
            </div>
            <div className="table-responsive">
                <table className="table table-sm table-bordered">
                    <thead><tr><th>Compte</th><th>Montant</th><th>Statut</th><th>Erreur</th></tr></thead>
                    <tbody>
                        {batch.lignes.map(ligne => (
                            <tr key={ligne.id}>
                                <td>{ligne.compte || ligne.telephone}</td>
                                <td>{ligne.montant.toLocaleString()}</td>
                                <td>{ligne.statut === 'succes' ? 'Succès' : (ligne.statut === 'echec' ? 'Échec' : 'En attente')}</td>
                                <td className="text-danger">{ligne.message_erreur || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="d-flex gap-2 mt-2">
                {batch.statut === 'en_attente' && window.currentUser?.role === 'admin' && (
                    <>
                        <button className="btn btn-sm btn-success" onClick={() => validerBatch(batch.id)}>Valider</button>
                        <button className="btn btn-sm btn-danger" onClick={() => rejeterBatch(batch.id)}>Rejeter</button>
                    </>
                )}
                {batch.statut === 'valide' && window.currentUser?.role === 'admin' && (
                    <button className="btn btn-sm btn-warning" onClick={() => executerBatch(batch.id)}>Exécuter</button>
                )}
            </div>
        </div>
    );
};

export default BatchPreviewDetail;