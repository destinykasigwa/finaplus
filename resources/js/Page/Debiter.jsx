import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const Debiter = () => {
    const [loading, setLoading] = useState(false);
    const [chargement, setChargement] = useState(false);
    
    // Comptes
    const [compteADebiter, setCompteADebiter] = useState("");
    const [compteACrediter, setCompteACrediter] = useState("");
    const [fetchDataDebit, setFetchDataDebit] = useState(null);
    const [fetchDataCredit, setFetchDataCredit] = useState(null);
    const [soldeDebit, setSoldeDebit] = useState(null);
    const [soldeCredit, setSoldeCredit] = useState(null);
    
    // Opération
    const [montant, setMontant] = useState("");
    const [libelle, setLibelle] = useState("");
    
    // Recherche
    const [searchByName, setSearchByName] = useState("");
    const [fetchDataByName, setFetchDataByName] = useState([]);
    const [searchRefOperation, setSearchRefOperation] = useState("");
    const [fetchSearchedOperation, setFetchSearchedOperation] = useState(null);
    const [fetchDayOperation, setFetchDayOperation] = useState([]);
    
    // État pour le champ actif (débit ou crédit)
    const [activeField, setActiveField] = useState(null); // 'debit' ou 'credit'
    
    // Pagination pour l'historique
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Copie
    const [copiedText, setCopiedText] = useState("");
    
    // --------------------------------------------------------------
    // Utilitaires
    // --------------------------------------------------------------
    const numberWithSpaces = (x) => {
        if (x === null || x === undefined) return "0,00";
        let parts = x.toFixed(2).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(",");
    };
    
    const parseFormattedNumber = (formatted) => {
        // Convertit "1 234 567,89" en 1234567.89
        return parseFloat(formatted.replace(/ /g, "").replace(",", "."));
    };
    
    const formatMontantSaisie = (value) => {
        // Nettoyer : enlever tout sauf chiffres et virgule
        let clean = value.replace(/[^\d,]/g, "");
        if (clean === "") return "";
        let parts = clean.split(",");
        if (parts.length > 2) parts = [parts[0], parts.slice(1).join("")];
        let entier = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        if (parts.length === 2) return entier + "," + parts[1].slice(0, 2);
        return entier;
    };
    
    const handleMontantChange = (e) => {
        const raw = e.target.value;
        const formatted = formatMontantSaisie(raw);
        setMontant(formatted);
    };
    
    // Suggérer un libellé basé sur les comptes
    useEffect(() => {
        if (fetchDataDebit && fetchDataCredit && !libelle) {
            const sugg = `Virement de ${fetchDataDebit.NumCompte} vers ${fetchDataCredit.NumCompte}`;
            setLibelle(sugg);
        }
    }, [fetchDataDebit, fetchDataCredit]);
    
    // --------------------------------------------------------------
    // API Calls
    // --------------------------------------------------------------
    const getSeachedDataDebit = async (e) => {
        if (e) e.preventDefault();
        if (!compteADebiter) return;
        const res = await axios.post("/eco/page/debiter/get-data", { compte_a_debiter: compteADebiter });
        if (res.data.status === 1) {
            setFetchDataDebit(res.data.dataDebit);
            setSoldeDebit(res.data.soldeCompteDebit);
        } else {
            Swal.fire({ title: "Erreur", text: res.data.msg, icon: "error" });
        }
    };
    
    const getSeachedDataCredit = async (e) => {
        if (e) e.preventDefault();
        if (!compteACrediter) return;
        const res = await axios.post("/eco/page/crediter/get-data", { compte_a_crediter: compteACrediter });
        if (res.data.status === 1) {
            setFetchDataCredit(res.data.dataCredit);
            setSoldeCredit(res.data.soldeCompteCredit);
        } else {
            Swal.fire({ title: "Erreur", text: res.data.msg, icon: "error" });
        }
    };
    
    const getDayOperation = async () => {
        const res = await axios.get("/eco/page/debiteur/operation-journaliere");
        setFetchDayOperation(res.data.data || []);
        setCurrentPage(1);
    };
    
    const handleSeachOperation = async (ref) => {
        if (!ref) return;
        const res = await axios.get("/eco/page/debiteur/extourne-operation/reference/" + ref);
        if (res.data.status === 1) {
            setFetchSearchedOperation(res.data.data);
        } else {
            Swal.fire({ title: "Erreur", text: res.data.msg, icon: "error" });
        }
    };
    
    const getSeachedDataByName = async (e) => {
        e.preventDefault();
        if (!searchByName.trim()) return;
        setChargement(true);
        const res = await axios.post("/eco/page/releve/get-account-by-name", {
            searched_account_by_name: searchByName,
        });
        setChargement(false);
        if (res.data.status === 1) {
            setFetchDataByName(res.data.data);
        } else {
            Swal.fire({ title: "Erreur", text: res.data.msg, icon: "error" });
        }
    };
    
    const extourneOperation = async (reference) => {
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment extourner cette opération ?",
            icon: "question",
            showCancelButton: true,
        });
        if (!confirmation.isConfirmed) return;
        setChargement(true);
        const res = await axios.get("/eco/page/debiteur/extourne-operation/" + reference);
        setChargement(false);
        Swal.fire({
            title: res.data.status === 1 ? "Succès" : "Erreur",
            text: res.data.msg,
            icon: res.data.status === 1 ? "success" : "error",
        });
        if (res.data.status === 1) getDayOperation();
    };
    
    const saveOperation = async (e) => {
        e.preventDefault();
        if (!montant || !fetchDataDebit || !fetchDataCredit) {
            Swal.fire({ title: "Attention", text: "Veuillez sélectionner les deux comptes et un montant.", icon: "warning" });
            return;
        }
        
        const montantNumerique = parseFormattedNumber(montant);
        if (isNaN(montantNumerique) || montantNumerique <= 0) {
            Swal.fire({ title: "Erreur", text: "Montant invalide", icon: "error" });
            return;
        }
        
        if (fetchDataDebit.CodeMonnaie !== fetchDataCredit.CodeMonnaie) {
            Swal.fire({
                title: "Erreur de devise",
                text: `Les deux comptes doivent avoir la même devise.`,
                icon: "error",
            });
            return;
        }
        
        const confirmation = await Swal.fire({
            title: "Confirmation",
            text: `Valider l'opération de ${montant} ${fetchDataDebit.CodeMonnaie === 1 ? "USD" : "CDF"} ?`,
            icon: "question",
            showCancelButton: true,
        });
        if (!confirmation.isConfirmed) return;
        
        setLoading(true);
        setChargement(true);
        try {
            const res = await axios.post("/eco/page/transaction/debiter/save", {
                compte_a_debiter: compteADebiter,
                compte_a_crediter: compteACrediter,
                Montant: montantNumerique,
                devise: fetchDataDebit.CodeMonnaie,
                Libelle: libelle,
                isVirement: false, // ou selon besoin
            });
            if (res.data.status === 1) {
                Swal.fire({ title: "Succès", text: res.data.msg, icon: "success", timer: 3000 });
                // Réinitialiser après succès ?
                const reset = await Swal.fire({
                    title: "Nouvelle opération ?",
                    text: "Voulez-vous vider le formulaire pour une nouvelle saisie ?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Oui, vider",
                    cancelButtonText: "Rester",
                });
                if (reset.isConfirmed) {
                    resetForm();
                } else {
                    // Garder les comptes mais vider montant/libellé
                    setMontant("");
                    setLibelle("");
                }
                getDayOperation();
            } else {
                Swal.fire({ title: "Erreur", text: res.data.msg, icon: "error" });
            }
        } catch (error) {
            Swal.fire({ title: "Erreur", text: "Problème serveur", icon: "error" });
        } finally {
            setLoading(false);
            setChargement(false);
        }
    };
    
    const resetForm = () => {
        setCompteADebiter("");
        setCompteACrediter("");
        setFetchDataDebit(null);
        setFetchDataCredit(null);
        setSoldeDebit(null);
        setSoldeCredit(null);
        setMontant("");
        setLibelle("");
        setActiveField(null);
        setFetchDataByName([]);
    };
    
    // Remplissage automatique par clic sur un compte dans la liste
    const handleAccountClick = (accountNumber, accountData) => {
        if (activeField === "debit") {
            setCompteADebiter(accountNumber);
            // Petit délai pour laisser setter l'état
            setTimeout(() => {
                getSeachedDataDebit(null);
            }, 50);
            setActiveField(null);
            Swal.fire({ title: "Compte à débiter", text: `${accountNumber} sélectionné`, icon: "success", timer: 1500, showConfirmButton: false });
        } else if (activeField === "credit") {
            setCompteACrediter(accountNumber);
            setTimeout(() => {
                getSeachedDataCredit(null);
            }, 50);
            setActiveField(null);
            Swal.fire({ title: "Compte à créditer", text: `${accountNumber} sélectionné`, icon: "success", timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ title: "Info", text: "Veuillez d'abord cliquer sur le champ Débit ou Crédit pour l'activer.", icon: "info", timer: 2000 });
        }
    };
    
    // Raccourci clavier : Ctrl+Entrée ou Entrée sur montant
    const handleKeyDown = (e) => {
        if ((e.ctrlKey && e.key === "Enter") || (e.key === "Enter" && document.activeElement?.id === "montantInput")) {
            saveOperation(e);
        }
    };
    
    useEffect(() => {
        getDayOperation();
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [montant, fetchDataDebit, fetchDataCredit, libelle, compteADebiter, compteACrediter]);
    
    // Pagination de l'historique
    const totalPages = Math.ceil((fetchSearchedOperation ? fetchSearchedOperation.length : fetchDayOperation.length) / itemsPerPage);
    const paginatedData = (fetchSearchedOperation || fetchDayOperation).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    // --------------------------------------------------------------
    // Rendu
    // --------------------------------------------------------------
    return (
        <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-body p-3" style={{ background: "#138496", borderRadius: "12px" }}>
                            <div className="d-flex align-items-center">
                                <i className="fas fa-calculator me-3" style={{ fontSize: "28px", color: "white" }}></i>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">Opérations comptables</h5>
                                    <small className="text-white-50">Débit et crédit des comptes</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Loading overlay */}
            {chargement && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
                    <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                        <Bars height="80" width="80" color="#20c997" />
                        <h5 className="mt-3">Patientez...</h5>
                    </div>
                </div>
            )}
            
            {/* Panneau de sélection des comptes */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body">
                            <label className="fw-bold" style={{ color: "steelblue" }}>Compte à débiter</label>
                            <div className="input-group mt-2">
                                <input
                                    type="text"
                                    className={`form-control ${activeField === "debit" ? "border-danger border-3" : ""}`}
                                    placeholder="Numéro compte"
                                    value={compteADebiter}
                                    onChange={(e) => setCompteADebiter(e.target.value)}
                                    onFocus={() => setActiveField("debit")}
                                />
                                <button className="btn btn-danger" onClick={getSeachedDataDebit}>
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                            {activeField === "debit" && <small className="text-danger">Mode débit actif – cliquez sur un compte dans la liste</small>}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body">
                            <label className="fw-bold" style={{ color: "steelblue" }}>Compte à créditer</label>
                            <div className="input-group mt-2">
                                <input
                                    type="text"
                                    className={`form-control ${activeField === "credit" ? "border-success border-3" : ""}`}
                                    placeholder="Numéro compte"
                                    value={compteACrediter}
                                    onChange={(e) => setCompteACrediter(e.target.value)}
                                    onFocus={() => setActiveField("credit")}
                                />
                                <button className="btn btn-success" onClick={getSeachedDataCredit}>
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                            {activeField === "credit" && <small className="text-success">Mode crédit actif – cliquez sur un compte dans la liste</small>}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                        <div className="card-body">
                            <label className="fw-bold" style={{ color: "steelblue" }}>Recherche par nom</label>
                            <div className="input-group mt-2">
                                <input type="text" className="form-control" placeholder="Nom du client" value={searchByName} onChange={(e) => setSearchByName(e.target.value)} />
                                <button className="btn btn-info" onClick={getSeachedDataByName}>
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Informations des comptes sélectionnés (cartes) */}
            <div className="row g-4 mb-4">
                {fetchDataDebit && (
                    <div className="col-md-6">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                            <div style={{ height: "4px", background: "linear-gradient(90deg, #dc3545, #ff6b6b)" }} />
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between">
                                    <h6 className="text-danger fw-bold">Compte à débiter</h6>
                                    <button className="btn btn-sm" onClick={() => handleCopy(fetchDataDebit.NumCompte)}><i className="fas fa-copy"></i></button>
                                </div>
                                <p className="mb-1"><strong>{fetchDataDebit.NomCompte}</strong></p>
                                <code>{fetchDataDebit.NumCompte}</code>
                                {soldeDebit && (
                                    <div className="mt-2 p-2 rounded bg-light">
                                        <small>Solde</small>
                                        <h5 className="text-danger">{numberWithSpaces(soldeDebit.soldeCompte)} {fetchDataDebit.CodeMonnaie === 1 ? "USD" : "CDF"}</h5>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {fetchDataCredit && (
                    <div className="col-md-6">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                            <div style={{ height: "4px", background: "linear-gradient(90deg, #28a745, #34ce57)" }} />
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between">
                                    <h6 className="text-success fw-bold">Compte à créditer</h6>
                                    <button className="btn btn-sm" onClick={() => handleCopy(fetchDataCredit.NumCompte)}><i className="fas fa-copy"></i></button>
                                </div>
                                <p className="mb-1"><strong>{fetchDataCredit.NomCompte}</strong></p>
                                <code>{fetchDataCredit.NumCompte}</code>
                                {soldeCredit && (
                                    <div className="mt-2 p-2 rounded bg-light">
                                        <small>Solde</small>
                                        <h5 className="text-success">{numberWithSpaces(soldeCredit.soldeCompte)} {fetchDataCredit.CodeMonnaie === 1 ? "USD" : "CDF"}</h5>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Liste des comptes trouvés par nom – avec clic pour remplir */}
            {fetchDataByName.length > 0 && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h6 className="fw-bold">Comptes trouvés ({fetchDataByName.length}) – cliquez sur une ligne pour remplir le champ actif</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                    <table className="table table-hover mb-0">
                                        <thead style={{ backgroundColor: "#e6f2f9", position: "sticky", top: 0 }}>
                                            <tr>
                                                <th>Numéro</th>
                                                <th>Intitulé</th>
                                                <th>Devise</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fetchDataByName.map((acc, idx) => (
                                                <tr key={idx} onClick={() => handleAccountClick(acc.NumCompte, acc)} style={{ cursor: "pointer" }}>
                                                    <td className="fw-semibold">{acc.NumCompte}</td>
                                                    <td>{acc.NomCompte}</td>
                                                    <td><span className={`badge ${acc.CodeMonnaie === 1 ? "bg-info" : "bg-success"}`}>{acc.CodeMonnaie === 1 ? "USD" : "CDF"}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Formulaire opération */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <label className="fw-bold">Montant</label>
                            <input
                                id="montantInput"
                                type="text"
                                className="form-control form-control-lg text-end fw-bold"
                                placeholder="0,00"
                                value={montant}
                                onChange={handleMontantChange}
                                style={{ fontSize: "1.2rem" }}
                            />
                            <small className="text-muted">Appuyez sur Ctrl+Enter pour valider</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <label className="fw-bold">Libellé</label>
                            <input type="text" className="form-control" value={libelle} onChange={(e) => setLibelle(e.target.value.toUpperCase())} />
                        </div>
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column justify-content-center gap-2">
                            <button className="btn btn-success w-100 py-2" onClick={saveOperation} disabled={!montant || !fetchDataDebit || !fetchDataCredit}>
                                <i className="fas fa-check me-2"></i> Valider
                            </button>
                            <button className="btn btn-outline-secondary w-100" onClick={resetForm}>
                                <i className="fas fa-eraser me-2"></i> Nouvelle opération
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Historique des opérations avec pagination */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
    <h6 className="fw-bold mb-0">
        <i className="fas fa-history me-2"></i> Opérations récentes
    </h6>
    
    {/* Ce bloc sera à droite */}
    <div className="input-group w-auto ms-auto">
        <input type="text" className="form-control form-control-sm" placeholder="Référence" value={searchRefOperation} onChange={(e) => setSearchRefOperation(e.target.value)} />
        <button className="btn btn-sm btn-info" onClick={() => handleSeachOperation(searchRefOperation)}><i className="fas fa-search"></i></button>
        <button className="btn btn-sm btn-warning" onClick={() => extourneOperation(searchRefOperation)}><i className="fas fa-exchange-alt"></i> Extourner</button>
    </div>
</div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Référence</th>
                                            <th>Compte</th>
                                            <th>Montant</th>
                                            <th>Devise</th>
                                            <th>Type</th>
                                            <th>Libellé</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((op, idx) => (
                                            <tr key={idx}>
                                                <td>{(currentPage-1)*itemsPerPage + idx + 1}</td>
                                                <td className="fw-semibold">{op.NumTransaction}</td>
                                                <td>{op.NumCompte}</td>
                                                <td className="fw-bold">
                                                    {op.CodeMonnaie === 1
                                                        ? (parseInt(op.Creditusd) > 0 ? parseInt(op.Creditusd) : parseInt(op.Debitusd))
                                                        : (parseInt(op.Creditfc) > 0 ? parseInt(op.Creditfc) : parseInt(op.Debitfc))
                                                    }
                                                </td>
                                                <td><span className={`badge ${op.CodeMonnaie === 1 ? "bg-info" : "bg-success"}`}>{op.CodeMonnaie === 1 ? "USD" : "CDF"}</span></td>
                                                <td><span className={`badge ${op.TypeTransaction === "Crédit" ? "bg-success" : "bg-danger"}`}>{op.TypeTransaction}</span></td>
                                                <td>{op.Libelle}</td>
                                                <td><button className="btn btn-sm btn-warning" onClick={() => extourneOperation(op.NumTransaction)}><i className="fas fa-exchange-alt"></i></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-3">
                                    <nav>
                                        <ul className="pagination pagination-sm">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev-1,1))}>Précédent</button>
                                            </li>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <li key={i} className={`page-item ${currentPage === i+1 ? "active" : ""}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))}>Suivant</button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height: "30px" }}></div>
        </div>
    );
};

export default Debiter;