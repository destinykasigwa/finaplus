import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FiscalYearList = ({ years, onSelect, onRefresh, onDelete, loading }) => {
    const [newYear, setNewYear] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!newYear) {
            Swal.fire('Attention', 'Veuillez saisir une année', 'warning');
            return;
        }
        setCreating(true);
        try {
            const res = await axios.post('/eco/budget/fiscal-years', { year: newYear });
            if (res.data.status === 1) {
                Swal.fire('Succès', 'Exercice créé avec succès', 'success');
                onRefresh();
                setNewYear('');
            } else {
                Swal.fire('Erreur', res.data.msg || 'Impossible de créer', 'error');
            }
        } catch (error) {
            Swal.fire('Erreur', 'Erreur lors de la création', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, year) => {
        const confirm = await Swal.fire({
            title: 'Confirmation',
            text: `Supprimer l'exercice ${year} ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer',
        });
        if (confirm.isConfirmed) {
            try {
                const res = await axios.delete(`/eco/budget/fiscal-years/${id}`);
                if (res.data.status === 1) {
                    Swal.fire('Supprimé', 'Exercice supprimé', 'success');
                    onDelete();
                }
            } catch (error) {
                Swal.fire('Erreur', 'Impossible de supprimer', 'error');
            }
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-calendar-alt me-2" style={{ color: '#138496' }}></i>
                    Exercices
                </h6>
            </div>
            <div className="card-body pt-2">
                <div className="input-group mb-3">
                    <input
                        type="number"
                        className="form-control modern-input"
                        placeholder="Nouvel exercice (ex: 2026)"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        disabled={creating}
                    />
                    <button className="btn btn-teal" onClick={handleCreate} disabled={creating}>
                        {creating ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-plus"></i>}
                    </button>
                </div>
                {loading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border text-teal" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {years.map((year) => (
                            <div
                                key={year.id}
                                className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0 border-bottom"
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelect(year)}
                            >
                                <span className="fw-semibold">{year.year}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge rounded-pill bg-${year.status === 'open' ? 'success' : 'secondary'}`}>
                                        {year.status === 'open' ? 'Ouvert' : 'Clôturé'}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(year.id, year.year); }}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {years.length === 0 && (
                            <div className="text-center text-muted py-3">
                                <i className="fas fa-inbox fa-2x d-block mb-2"></i>
                                Aucun exercice créé
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FiscalYearList;