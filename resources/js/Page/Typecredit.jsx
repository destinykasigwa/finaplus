import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const TypeCredit = () => {
    const [loading, setLoading] = useState(false);
    const [fetchData, setFetchData] = useState();
    const [reference, setReference] = useState();
    const [type_credit, settype_credit] = useState();
    const [taux_ordinaire, settaux_ordinaire] = useState();
    const [montant_min, setmontant_min] = useState();
    const [montant_max, setmontant_max] = useState();
    const [compte_interet, setcompte_interet] = useState();
    const [compte_commission, setcompte_commission] = useState();
    const [compte_etude_dossier, setcompte_etude_dossier] = useState();
    const [sous_groupe_compte, setsous_groupe_compte] = useState();
    const [taux_retard, settaux_retard] = useState();
    const [compte_interet_retard, setcompte_interet_retard] = useState();
    const [commission_en_pourc, setcommission_en_pourc] = useState();
    const [frais_dossier, setfrais_dossier] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [fetchData2, setfetchData2] = useState();
    const [showForm, setShowForm] = useState(true);

    //UPDATE ATTRIBUTE
    const [reference_up, setReference_up] = useState();
    const [type_credit_up, settype_credit_up] = useState();
    const [taux_ordinaire_up, settaux_ordinaire_up] = useState();
    const [montant_min_up, setmontant_min_up] = useState();
    const [montant_max_up, setmontant_max_up] = useState();
    const [compte_interet_up, setcompte_interet_up] = useState();
    const [compte_commission_up, setcompte_commission_up] = useState();
    const [compte_etude_dossier_up, setcompte_etude_dossier_up] = useState();
    const [sous_groupe_compte_up, setsous_groupe_compte_up] = useState();
    const [taux_retard_up, settaux_retard_up] = useState();
    const [compte_interet_retard_up, setcompte_interet_retard_up] = useState();
    const [commission_en_pourc_up, setcommission_en_pourc_up] = useState();
    const [frais_dossier_up, setfrais_dossier_up] = useState();

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setLoading(true);
        const res = await axios.get("/eco/type-credit/get-data");
        if (res.data.status == 1) {
            setFetchData(res.data.data);
        }
        setLoading(false);
    };

    const saveTypeCredit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await axios.post("/eco/credit/type-credit/addnew", {
            reference,
            type_credit,
            taux_ordinaire,
            montant_min,
            montant_max,
            compte_interet,
            compte_commission,
            compte_etude_dossier,
            sous_groupe_compte,
            taux_retard,
            compte_interet_retard,
            commission_en_pourc,
            frais_dossier,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "OK",
            });
            getData();
            // Réinitialiser le formulaire
            settype_credit("");
            settaux_ordinaire("");
            setmontant_min("");
            setmontant_max("");
            setcompte_interet("");
            setcompte_commission("");
            setcompte_etude_dossier("");
            setsous_groupe_compte("");
            settaux_retard("");
            setcompte_interet_retard("");
            setcommission_en_pourc("");
            setfrais_dossier("");
        }
        setLoading(false);
    };

    const updateTypeCredit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await axios.post("/eco/credit/type-credit/update", {
            reference_up,
            type_credit_up,
            taux_ordinaire_up,
            montant_min_up,
            montant_max_up,
            compte_interet_up,
            compte_commission_up,
            compte_etude_dossier_up,
            sous_groupe_compte_up,
            taux_retard_up,
            compte_interet_retard_up,
            commission_en_pourc_up,
            frais_dossier_up,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "OK",
            });
            getData();
            setfetchData2(null);
            setShowForm(true);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "OK",
            });
        }
        setLoading(false);
    };

    const getInfo = async (ref) => {
        const res = await axios.post("/eco/page/type-credit/get-credit/specific", {
            RefCredit: ref,
        });
        if (res.data.status == 1) {
            const data = res.data.data;
            setfetchData2(data);
            setShowForm(false);
            setReference_up(data.Reference);
            settype_credit_up(data.type_credit);
            settaux_ordinaire_up(data.taux_ordinaire);
            setmontant_min_up(data.montant_min);
            setmontant_max_up(data.montant_max);
            setcompte_interet_up(data.compte_interet);
            setcompte_commission_up(data.compte_commission);
            setcompte_etude_dossier_up(data.compte_etude_dossier);
            setsous_groupe_compte_up(data.sous_groupe_compte);
            settaux_retard_up(data.taux_retard);
            setcompte_interet_retard_up(data.compte_interet_retard);
            setcommission_en_pourc_up(data.commission);
            setfrais_dossier_up(data.frais_dossier);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "OK",
            });
        }
    };

    const ChargerTypeCredit = () => {
        if (fetchData2) {
            setReference_up(fetchData2.Reference);
            settype_credit_up(fetchData2.type_credit);
            settaux_ordinaire_up(fetchData2.taux_ordinaire);
            setmontant_min_up(fetchData2.montant_min);
            setmontant_max_up(fetchData2.montant_max);
            setcompte_interet_up(fetchData2.compte_interet);
            setcompte_commission_up(fetchData2.compte_commission);
            setcompte_etude_dossier_up(fetchData2.compte_etude_dossier);
            setsous_groupe_compte_up(fetchData2.sous_groupe_compte);
            settaux_retard_up(fetchData2.taux_retard);
            setcompte_interet_retard_up(fetchData2.compte_interet_retard);
            setcommission_en_pourc_up(fetchData2.commission);
            setfrais_dossier_up(fetchData2.frais_dossier);
        }
    };

    const cancelEdit = () => {
        setfetchData2(null);
        setShowForm(true);
    };

    // Pagination
    let itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = fetchData && fetchData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((fetchData?.length || 0) / itemsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else if (currentPage <= Math.floor(maxPagesToShow / 2)) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - Math.floor(maxPagesToShow / 2);
            endPage = currentPage + Math.floor(maxPagesToShow / 2);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${i === currentPage ? "active" : ""}`}>
                    <button onClick={() => handlePageChange(i)} className="page-link">
                        {i}
                    </button>
                </li>
            );
        }
        return pageNumbers;
    };

    return (
        <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
            {loading && (
                <div style={{
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
                    backdropFilter: "blur(3px)"
                }}>
                    <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                        <Bars height="80" width="80" color="#20c997" ariaLabel="loading" />
                        <h5 className="mt-3 text-dark">Patientez...</h5>
                    </div>
                </div>
            )}

            {/* En-tête moderne */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-body p-3" style={{
                             background: "#138496",
                            borderRadius: "12px"
                        }}>
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i className="fas fa-tags" style={{ fontSize: "28px", color: "white" }}></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">Types de crédit</h5>
                                    <small className="text-white-50">Gestion des produits de crédit</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Formulaire d'ajout/modification */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                    <i className="fas fa-plus-circle me-2"></i>
                                    {showForm ? "Nouveau type de crédit" : "Modification du crédit"}
                                </h6>
                                {!showForm && (
                                    <button
                                        onClick={cancelEdit}
                                        className="btn btn-sm"
                                        style={{ background: "#6c757d", color: "white", borderRadius: "8px" }}
                                    >
                                        <i className="fas fa-times me-1"></i>Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {showForm ? (
                                <form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-tag me-1"></i>Type de crédit
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => settype_credit(e.target.value)}
                                                value={type_credit}
                                                placeholder="Ex: Crédit Express"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-chart-line me-1"></i>Taux ordinaire (%)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => settaux_ordinaire(e.target.value)}
                                                value={taux_ordinaire}
                                                placeholder="Ex: 12"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-arrow-down me-1"></i>Montant minimum
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setmontant_min(e.target.value)}
                                                value={montant_min}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-arrow-up me-1"></i>Montant maximum
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setmontant_max(e.target.value)}
                                                value={montant_max}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-percent me-1"></i>Taux retard (%)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => settaux_retard(e.target.value)}
                                                value={taux_retard}
                                                placeholder="Ex: 5"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-percent me-1"></i>Commission (%)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setcommission_en_pourc(e.target.value)}
                                                value={commission_en_pourc}
                                                placeholder="Ex: 2"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-folder me-1"></i>Sous-groupe compte
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setsous_groupe_compte(e.target.value)}
                                                value={sous_groupe_compte}
                                                placeholder="Ex: 7000"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-money-bill-wave me-1"></i>Compte intérêt
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setcompte_interet(e.target.value)}
                                                value={compte_interet}
                                                placeholder="Numéro de compte"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-hand-holding-usd me-1"></i>Compte commission
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setcompte_commission(e.target.value)}
                                                value={compte_commission}
                                                placeholder="Numéro de compte"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-file-invoice me-1"></i>Compte étude dossier
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setcompte_etude_dossier(e.target.value)}
                                                value={compte_etude_dossier}
                                                placeholder="Numéro de compte"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                <i className="fas fa-clock me-1"></i>Compte intérêt retard
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: "10px" }}
                                                onChange={(e) => setcompte_interet_retard(e.target.value)}
                                                value={compte_interet_retard}
                                                placeholder="Numéro de compte"
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button
                                                onClick={saveTypeCredit}
                                                className="btn w-100 py-3 fw-bold"
                                                style={{
                                                    background: "linear-gradient(135deg, #20c997, #198764)",
                                                    color: "white",
                                                    borderRadius: "12px",
                                                    border: "none",
                                                    fontSize: "16px",
                                                    transition: "all 0.3s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-2px)";
                                                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(32,201,151,0.3)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0)";
                                                    e.currentTarget.style.boxShadow = "none";
                                                }}
                                            >
                                                <i className="fas fa-save me-2"></i>
                                                Enregistrer le type de crédit
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                fetchData2 && (
                                    <form>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-tag me-1"></i>Type de crédit
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px", background: "#f8f9fa" }}
                                                    value={type_credit_up}
                                                    onChange={(e) => settype_credit_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-chart-line me-1"></i>Taux ordinaire (%)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={taux_ordinaire_up}
                                                    onChange={(e) => settaux_ordinaire_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-arrow-down me-1"></i>Montant minimum
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={montant_min_up}
                                                    onChange={(e) => setmontant_min_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-arrow-up me-1"></i>Montant maximum
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={montant_max_up}
                                                    onChange={(e) => setmontant_max_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-percent me-1"></i>Taux retard (%)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={taux_retard_up}
                                                    onChange={(e) => settaux_retard_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-percent me-1"></i>Commission (%)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={commission_en_pourc_up}
                                                    onChange={(e) => setcommission_en_pourc_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-folder me-1"></i>Sous-groupe compte
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px", background: "#f8f9fa" }}
                                                    value={sous_groupe_compte_up}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-money-bill-wave me-1"></i>Compte intérêt
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={compte_interet_up}
                                                    onChange={(e) => setcompte_interet_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-hand-holding-usd me-1"></i>Compte commission
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={compte_commission_up}
                                                    onChange={(e) => setcompte_commission_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-file-invoice me-1"></i>Compte étude dossier
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={compte_etude_dossier_up}
                                                    onChange={(e) => setcompte_etude_dossier_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold" style={{ color: "steelblue" }}>
                                                    <i className="fas fa-clock me-1"></i>Compte intérêt retard
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: "10px" }}
                                                    value={compte_interet_retard_up}
                                                    onChange={(e) => setcompte_interet_retard_up(e.target.value)}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <div className="d-flex gap-3">
                                                    <button
                                                        onClick={updateTypeCredit}
                                                        className="btn flex-grow-1 py-3 fw-bold"
                                                        style={{
                                                            background: "linear-gradient(135deg, #007BFF, #0056b3)",
                                                            color: "white",
                                                            borderRadius: "12px",
                                                            border: "none",
                                                            fontSize: "16px",
                                                            transition: "all 0.3s ease"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,123,255,0.3)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "none";
                                                        }}
                                                    >
                                                        <i className="fas fa-edit me-2"></i>
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={ChargerTypeCredit}
                                                        className="btn py-3 px-4 fw-bold"
                                                        style={{
                                                            background: "linear-gradient(135deg, #28a745, #1e7e34)",
                                                            color: "white",
                                                            borderRadius: "12px",
                                                            border: "none",
                                                            transition: "all 0.3s ease"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                        }}
                                                    >
                                                        <i className="fas fa-sync-alt me-1"></i>
                                                        Recharger
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Liste des types de crédit */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                <i className="fas fa-list me-2"></i>Liste des types de crédit
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: "#e6f2f9" }}>
                                        <tr style={{ color: "steelblue" }}>
                                            <th>Réf</th>
                                            <th>Type crédit</th>
                                            <th>Taux %</th>
                                            <th>Min</th>
                                            <th>Max</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems && currentItems.map((res, index) => (
                                            <tr key={index} style={{ cursor: "pointer" }} onClick={() => getInfo(res.Reference)}>
                                                <td className="fw-semibold text-primary">{res.Reference}</td>
                                                <td>{res.type_credit}</td>
                                                <td className="text-success fw-semibold">{res.taux_ordinaire}%</td>
                                                <td>{new Intl.NumberFormat('fr-FR').format(res.montant_min)}</td>
                                                <td>{new Intl.NumberFormat('fr-FR').format(res.montant_max)}</td>
                                             </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {fetchData && fetchData.length > 0 && (
                            <div className="card-footer bg-white border-0 pt-3 pb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="text-muted small">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Total: {fetchData.length} type(s)
                                    </div>
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={goToPrevPage} disabled={currentPage === 1}>
                                                    <i className="fas fa-chevron-left"></i>
                                                </button>
                                            </li>
                                            {renderPagination()}
                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={goToNextPage} disabled={currentPage === totalPages}>
                                                    <i className="fas fa-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypeCredit;