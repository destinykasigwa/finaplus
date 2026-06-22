import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaDownload } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const BudgetSummary = ({ fiscalYear }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, [fiscalYear]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`budget/summary/${fiscalYear.id}`);
            if (res.data.status === 1) setSummary(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
    if (!summary) return <div className="alert alert-info">Aucune donnée disponible</div>;

    const chartData = {
        labels: summary.months || [],
        datasets: [
            {
                label: 'Budget mensuel',
                data: summary.monthlyTotals || [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }
        ]
    };

    const pieData = {
        labels: ['Produits', 'Charges', 'Trésorerie'],
        datasets: [{
            data: [summary.totalProduct, summary.totalExpense, summary.totalCash],
            backgroundColor: ['#28a745', '#dc3545', '#17a2b8'],
        }]
    };

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between">
                <h6 className="fw-bold">Synthèse du budget {fiscalYear.year}</h6>
                <div>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => exportPDF()}>
                        <FaDownload /> PDF
                    </button>
                    <button className="btn btn-sm btn-outline-success" onClick={() => exportExcel()}>
                        <FaDownload /> Excel
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card bg-light mb-3">
                            <div className="card-body">
                                <h6>Totaux par catégorie</h6>
                                <ul className="list-unstyled">
                                    <li><span className="badge bg-success me-2">Produits</span> {summary.totalProduct?.toFixed(0)} CDF</li>
                                    <li><span className="badge bg-danger me-2">Charges</span> {summary.totalExpense?.toFixed(0)} CDF</li>
                                    <li><span className="badge bg-info me-2">Trésorerie</span> {summary.totalCash?.toFixed(0)} CDF</li>
                                    <li className="fw-bold mt-2">Total général : {summary.grandTotal?.toFixed(0)} CDF</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div style={{ height: '200px' }}>
                            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;