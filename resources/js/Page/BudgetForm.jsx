import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Bars } from 'react-loader-spinner';

// Fonction utilitaire pour capitaliser en sécurité
const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

const BudgetForm = ({ fiscalYear, category = 'operating' }) => {
    const [budgetLines, setBudgetLines] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isValidated, setIsValidated] = useState(
        fiscalYear?.status === 'locked' || fiscalYear?.status === 'closed'
    );

    // Charger les lignes de budget et les comptes
    useEffect(() => {
        if (fiscalYear?.id) {
            fetchBudgetLines();
            fetchAccounts();
        }
    }, [fiscalYear, category]);

    const fetchBudgetLines = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/eco/budget/lines/${fiscalYear.id}`);
            if (res.data.status === 1) {
                // S'assurer que les données contiennent les attributs calculés
                setBudgetLines(res.data.data.map(line => ({
                    ...line,
                    planned_amount: Number(line.planned_amount) || 0,
                    realized_amount: Number(line.realized_amount) || 0,
                    variance: Number(line.variance) || 0,
                })));
            }
        } catch (error) {
            console.error('Erreur chargement budget:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async () => {
        try {
            let classes = '';
            if (category === 'operating') classes = '6,7';
            else if (category === 'investment') classes = '2';
            else if (category === 'treasury') classes = '5';
            else classes = '6,7'; // fallback

            const res = await axios.get(`/eco/budget/accounts?classes=${classes}`);
            if (res.data.status === 1) {
                setAccounts(res.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement comptes:', error);
        }
    };

    // Déterminer le type de compte pour l'icône
    const getAccountType = (account) => {
        if (!account || !account.RefTypeCompte) return 'expense';
        const type = account.RefTypeCompte;
        if (type === '5') return 'cash';
        if (type === '7') return 'product';
        if (['2', '3'].includes(type)) return 'investment';
        return 'expense';
    };

    const getTypeIcon = (account) => {
        const type = getAccountType(account);
        if (type === 'product') return 'fa-arrow-up text-success';
        if (type === 'expense') return 'fa-arrow-down text-danger';
        if (type === 'cash') return 'fa-coins text-warning';
        return 'fa-building text-primary';
    };

    // Gestion de la modification d'un montant planifié
    const handleChange = (accountId, value) => {
        if (isValidated) {
            Swal.fire('Info', 'Ce budget est validé, modification non autorisée', 'info');
            return;
        }
        const numValue = parseFloat(value) || 0;
        setBudgetLines((prev) => {
            const existingIndex = prev.findIndex((line) => line.account_id === accountId);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], planned_amount: numValue };
                return updated;
            } else {
                const account = accounts.find((a) => a.RefCompte === accountId);
                if (!account) return prev;
                const newLine = {
                    fiscal_year_id: fiscalYear.id,
                    account_id: accountId,
                    planned_amount: numValue,
                    category: category,
                    status: 'draft',
                    account: account,
                    realized_amount: 0,
                    variance: 0,
                };
                return [...prev, newLine];
            }
        });
    };

    // Sauvegarde en masse
    const saveBudget = async () => {
        if (isValidated) {
            Swal.fire('Info', 'Ce budget est validé, modification non autorisée', 'info');
            return;
        }
        setSaving(true);
        try {
            const payload = budgetLines.map((line) => ({
                fiscal_year_id: line.fiscal_year_id,
                account_id: line.account_id,
                planned_amount: line.planned_amount,
                category: line.category,
            }));
            const res = await axios.post('/eco/budget/lines/bulk', { lines: payload });
            if (res.data.status === 1) {
                Swal.fire('Succès', 'Budget enregistré avec succès', 'success');
                await fetchBudgetLines();
            } else {
                Swal.fire('Erreur', res.data.msg || 'Échec de la sauvegarde', 'error');
            }
        } catch (error) {
            Swal.fire('Erreur', 'Erreur lors de la sauvegarde', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Validation du budget (verrouillage)
    const validateBudget = async () => {
        const confirm = await Swal.fire({
            title: 'Validation du budget',
            text: `Valider le budget ${fiscalYear.year} ? Cette action est irréversible.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Valider',
        });
        if (confirm.isConfirmed) {
            setSaving(true);
            try {
                const res = await axios.post(`/eco/budget/validate/${fiscalYear.id}`);
                if (res.data.status === 1) {
                    Swal.fire('Validé', 'Budget validé avec succès', 'success');
                    setIsValidated(true);
                    await fetchBudgetLines();
                } else {
                    Swal.fire('Erreur', res.data.msg || 'Impossible de valider', 'error');
                }
            } catch (error) {
                Swal.fire('Erreur', 'Erreur lors de la validation', 'error');
            } finally {
                setSaving(false);
            }
        }
    };

    // Totaux sécurisés
    const getTotalPlanned = () => {
        if (!Array.isArray(budgetLines)) return 0;
        return budgetLines.reduce((sum, l) => sum + (Number(l.planned_amount) || 0), 0);
    };

    const getTotalRealized = () => {
        if (!Array.isArray(budgetLines)) return 0;
        return budgetLines.reduce((sum, l) => sum + (Number(l.realized_amount) || 0), 0);
    };

    const getTotalVariance = () => {
        if (!Array.isArray(budgetLines)) return 0;
        return budgetLines.reduce((sum, l) => sum + (Number(l.variance) || 0), 0);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Bars height={40} width={40} color="#138496" />
                <p className="mt-2 text-muted">Chargement du budget...</p>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                <h6 className="section-title">
                    <i className="fas fa-edit me-2" style={{ color: '#138496' }}></i>
                    Budget {fiscalYear?.year} - {capitalize(category)}
                    {isValidated && <span className="badge bg-success ms-2">Validé</span>}
                </h6>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={saveBudget}
                        disabled={saving || isValidated}
                    >
                        {saving ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <>
                                <i className="fas fa-save me-1"></i> Enregistrer
                            </>
                        )}
                    </button>
                    {!isValidated && (
                        <button
                            className="btn btn-sm btn-success"
                            onClick={validateBudget}
                            disabled={saving}
                        >
                            <i className="fas fa-check-circle me-1"></i> Valider
                        </button>
                    )}
                </div>
            </div>
            <div className="card-body pt-2">
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Compte</th>
                                <th>Intitulé</th>
                                <th className="text-end">Planifié</th>
                                <th className="text-end">Réalisé</th>
                                <th className="text-end">Écart</th>
                            </tr>
                        </thead>
                      <tbody>
    {accounts.map((account) => {
        const line = budgetLines.find(
            (l) => l.account_id === account.RefCompte
        );
        const planned = line?.planned_amount || 0;
        const realized = line?.realized_amount || 0;
        const variance = line?.variance || 0;
        return (
            <tr key={account.RefCompte}>
                <td title={account.NumCompte}>
                    {String(account.NumCompte).substring(0, 13)}
                </td>
                <td>
                    <i className={`fas ${getTypeIcon(account)} me-2`}></i>
                    {account.NomCompte}
                </td>
                <td className="text-end">
                    <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm text-end"
                        value={planned}
                        onChange={(e) =>
                            handleChange(account.RefCompte, e.target.value)
                        }
                        disabled={isValidated}
                        style={{ width: '120px', display: 'inline-block' }}
                    />
                </td>
                <td className="text-end">{realized.toFixed(2)}</td>
                <td
                    className={`text-end fw-bold ${
                        variance >= 0 ? 'text-success' : 'text-danger'
                    }`}
                >
                    {variance.toFixed(2)}
                </td>
            </tr>
        );
    })}
    <tr className="table-info fw-bold">
        <td colSpan="2" className="text-end">TOTAL</td>
        <td className="text-end">{getTotalPlanned().toFixed(2)}</td>
        <td className="text-end">{getTotalRealized().toFixed(2)}</td>
        <td className="text-end">{getTotalVariance().toFixed(2)}</td>
    </tr>
</tbody>
                    </table>
                </div>
                <div className="mt-3 text-muted small">
                    <i className="fas fa-info-circle me-1"></i>
                    Saisissez le montant prévisionnel annuel pour chaque compte. Le réalisé est calculé
                    automatiquement à partir des transactions.
                </div>
            </div>
        </div>
    );
};

export default BudgetForm;