import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import FiscalYearList from './FiscalYearList';
import BudgetForm from './BudgetForm';

const BudgetManager = () => {
    const [fiscalYears, setFiscalYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('operating');

    const fetchFiscalYears = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/eco/budget/fiscal-years');
            if (res.data.status === 1) {
                setFiscalYears(res.data.data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les exercices', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiscalYears();
    }, []);

    const handleSelectYear = (year) => {
        setSelectedYear(year);
    };

    const handleYearDeleted = () => {
        setSelectedYear(null);
        fetchFiscalYears();
    };

    const categories = [
        { key: 'operating', label: 'Exploitation', icon: 'fa-chart-bar' },
        { key: 'investment', label: 'Investissement', icon: 'fa-building' },
        { key: 'treasury', label: 'Trésorerie', icon: 'fa-coins' },
    ];

    return (
        <div className="container-fluid py-4">
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #138496, #138496)' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="fas fa-chart-pie fa-2x"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0">Budgétisation</h5>
                                    <small className="text-white-50">Planification et suivi budgétaire</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corps */}
            <div className="row g-4">
                <div className="col-md-4 col-lg-3">
                    <FiscalYearList
                        years={fiscalYears}
                        onSelect={handleSelectYear}
                        onRefresh={fetchFiscalYears}
                        onDelete={handleYearDeleted}
                        loading={loading}
                    />
                </div>
                <div className="col-md-8 col-lg-9">
                    {selectedYear ? (
                        <>
                            <ul className="nav nav-tabs mb-3">
                                {categories.map((cat) => (
                                    <li className="nav-item" key={cat.key}>
                                        <button
                                            className={`nav-link ${activeCategory === cat.key ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(cat.key)}
                                        >
                                            <i className={`fas ${cat.icon} me-1`}></i> {cat.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <BudgetForm
                                fiscalYear={selectedYear}
                                category={activeCategory}
                            />
                        </>
                    ) : (
                        <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                            <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                            <h5 className="text-muted">Sélectionnez un exercice</h5>
                            <p className="text-muted">Choisissez un exercice dans la liste pour commencer la saisie budgétaire.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetManager;