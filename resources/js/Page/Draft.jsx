// import React from "react";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { EnteteRapport } from "./HeaderReport";
// import * as XLSX from "xlsx";
// import { jsPDF } from "jspdf";
// import * as FileSaver from "file-saver";
// import html2canvas from "html2canvas";

// const Echeancier = () => {
//     const [loading, setloading] = useState(false);
//     const [error, setError] = useState([]);
//     const [fetchEcheancier, setfetchEcheancier] = useState();
//     const [fetchTableauAmortiss, setfetchTableauAmortiss] = useState();
//     const [fetchSommeInteret, setfetchSommeInteret] = useState();
//     const [fetchSommeInteretAmmo, setfetchSommeInteretAmmo] = useState();
//     const [fetchSoldeEncourCDF, setfetchSoldeEncourCDF] = useState();
//     const [fetchSoldeEncourUSD, setfetchSoldeEncourUSD] = useState();
//     const [fetchTotCapRetardCDF, setfetchTotCapRetardCDF] = useState();
//     const [fetchTotCapRetardUSD, setfetchTotCapRetardUSD] = useState();
//     const [fetchBalanceAgee, setfetchBalanceAgee] = useState();
//     const [searched_num_dossier, setsearched_num_dossier] = useState();

//     const [accountName, setAccountName] = useState();
//     const [fetchCapitalRestant, setfetchCapitalRestant] = useState();
//     const [fetchCapitalRetard, setfetchCapitalRetard] = useState();
//     const [fetchInteretRetard, setfetchInteretRetard] = useState();
//     const [fetchCapitalRembourse, setfetchCapitalRembourse] = useState();
//     const [fetchInteretRembourse, setfetchInteretRembourse] = useState();
//     const [fetchInteretRestant, setfetchInteretRestant] = useState();
//     const [radioValue, setRadioValue] = useState("");
//     const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//     const [devise, setdevise] = useState();
//     const [fetchAgentCredit, setFetchAgentCredit] = useState();
//     const [agent_credit_name, setagent_credit_name] = useState();

//     // AJOUT PAR - États spécifiques
//     const [fetchGestionnaires, setFetchGestionnaires] = useState([]);
//     const [gestionnaire, setGestionnaire] = useState("");
//     const [parCategory, setParCategory] = useState("");
//     const [fetchParData, setFetchParData] = useState(null);
//     const [datePar, setDatePar] = useState(new Date().toISOString().split('T')[0]);

//     useEffect(() => {
//         const today = new Date();
//         const year = today.getFullYear();
//         const month = String(today.getMonth() + 1).padStart(2, "0");
//         const day = String(today.getDate()).padStart(2, "0");
//         setSelectedDate(`${year}-${month}-${day}`);
//         setDatePar(`${year}-${month}-${day}`);
//         setTimeout(() => {
//             getAgentCredit();
//             getGestionnaires(); // AJOUT PAR - charger liste gestionnaires
//         }, 2000);
//     }, []);

//     const getAgentCredit = async () => {
//         const res = await axios.get("/eco/page/rapport/get-echeancier/agent-credit");
//         if (res.data.status == 1) {
//             setFetchAgentCredit(res.data.get_agent_credit);
//         }
//     };

//     // AJOUT PAR - récupération de la liste des gestionnaires
//     const getGestionnaires = async () => {
//         const res = await axios.get("/eco/page/rapport/get-echeancier/agent-credit");
//         if (res.data.status == 1) {
//             setFetchGestionnaires(res.data.gestionnaires);
//         }
//     };

//     const getSeachedData = async (e) => {
//         e.preventDefault();
//         setloading(true);
//         let url = "/eco/page/montage-credit/get-echeancier";
//         let params = {
//             searched_num_dossier: searched_num_dossier,
//             radioValue,
//             selectedDate,
//             devise,
//             agent_credit_name,
//         };
//         // AJOUT PAR - ajouter les paramètres spécifiques au PAR
//         if (radioValue === "par") {
//             params = {
//                 ...params,
//                 date_par: datePar,
//                 devise_par: devise,
//                 gestionnaire_par: gestionnaire,
//                 par_category: parCategory,
//             };
//         }
//         const res = await axios.post(url, params);
//         if (res.data.status == 1) {
//             setloading(false);
//             if (radioValue === "echeancier") {
//                 setfetchEcheancier(res.data.data);
//                 setfetchSommeInteret(res.data.sommeInteret);
//                 setAccountName(res.data.NomCompte);
//                 // ... autres setters existants
//             } else if (radioValue === "tableau_ammortiss") {
//                 setfetchTableauAmortiss(res.data.data_ammortissement);
//                 setfetchSommeInteretAmmo(res.data.sommeInteret_ammort);
//                 setAccountName(res.data.NomCompte);
//                 setfetchCapitalRestant(res.data.soldeRestant);
//                 setfetchCapitalRetard(res.data.soldeEnRetard);
//                 setfetchInteretRetard(res.data.soldeEnRetard);
//                 setfetchCapitalRembourse(res.data.capitalRembourse);
//                 setfetchInteretRembourse(res.data.interetRembourse);
//                 setfetchInteretRestant(res.data.interetRestant);
//             } else if (radioValue === "balance_agee") {
//                 setfetchBalanceAgee(res.data.data_balance_agee);
//                 setfetchSoldeEncourCDF(res.data.soldeEncourCDF);
//                 setfetchSoldeEncourUSD(res.data.soldeEncourUSD);
//                 setfetchTotCapRetardCDF(res.data.totRetardCDF);
//                 setfetchTotCapRetardUSD(res.data.totRetardUSD);
//             } 
//             // AJOUT PAR - traitement des données PAR
//             else if (radioValue === "par") {
//                 setFetchParData(res.data.par_data); // attendre { par_data: [], totaux, etc. }
//             }
//         } else {
//             setloading(false);
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 8000,
//                 confirmButtonText: "Okay",
//             });
//         }
//     };

//     const handleRadioChange = (event) => {
//         setRadioValue(event.target.value);
//         // Réinitialiser les données affichées pour éviter les mélanges
//         if (event.target.value !== "par") setFetchParData(null);
//         if (event.target.value !== "balance_agee") setfetchBalanceAgee(null);
//         if (event.target.value !== "echeancier") setfetchEcheancier(null);
//         if (event.target.value !== "tableau_ammortiss") setfetchTableauAmortiss(null);
//     };

//     // Fonctions d'export existantes (inchangées)
//     const exportTableData = (tableId) => { /* ... */ };
//     const exportToPDFEcheancier = () => { /* ... */ };
//     const exportToPDFBalanceAgee = () => { /* ... */ };
//     const exportToPDFAmmortiss = () => { /* ... */ };
//     // AJOUT PAR - export PDF pour PAR
//     const exportToPDFPar = () => {
//         const content = document.getElementById("content-to-download-par");
//         if (!content) return;
//         html2canvas(content, { scale: 3 }).then((canvas) => {
//             const padding = 50;
//             const canvasWidth = canvas.width + padding * 2;
//             const canvasHeight = canvas.height + padding * 2;
//             const newCanvas = document.createElement("canvas");
//             newCanvas.width = canvasWidth;
//             newCanvas.height = canvasHeight;
//             const ctx = newCanvas.getContext("2d");
//             ctx.fillStyle = "#ffffff";
//             ctx.fillRect(0, 0, canvasWidth, canvasHeight);
//             ctx.drawImage(canvas, padding, padding);
//             const pdf = new jsPDF("p", "mm", "a4");
//             const imgData = newCanvas.toDataURL("image/png");
//             const imgProps = pdf.getImageProperties(imgData);
//             const pdfWidth = pdf.internal.pageSize.getWidth();
//             const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//             pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//             pdf.autoPrint();
//             window.open(pdf.output("bloburl"), "_blank");
//         });
//     };

//     const numberWithSpaces = (x = 0) => { /* ... existant ... */ };
//     const dateParser = (num) => { /* ... existant ... */ };
//     const numberFormat = (number) => { /* ... existant ... */ };
//     const groupByTranches = (data) => { /* ... existant ... */ };
//     const groupedData = groupByTranches(fetchBalanceAgee);

//     return (
//         <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
//             {/* En-tête (inchangé) */}
//             <div className="row mb-4">
//                 <div className="col-12">
//                     <div className="card border-0 shadow-sm rounded-3">
//                         <div className="card-body p-3" style={{ background: "#138496", borderRadius: "12px" }}>
//                             <div className="d-flex align-items-center">
//                                 <div className="me-3"><i className="fas fa-chart-line" style={{ fontSize: "28px", color: "white" }}></i></div>
//                                 <div><h5 className="text-white fw-bold mb-0">Rapports de Crédit</h5><small className="text-white-50">Échéancier, Amortissement, Balance âgée, PAR</small></div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Formulaire de recherche */}
//             <div className="row g-3 mb-4">
//                 <div className="col-md-8">
//                     <div className="card border-0 shadow-sm rounded-3">
//                         <div className="card-header bg-white border-0 pt-3">
//                             <h6 className="fw-bold" style={{ color: "steelblue" }}><i className="fas fa-search me-2"></i>Type de rapport</h6>
//                         </div>
//                         <div className="card-body">
//                             <form>
//                                 <div className="row g-3">
//                                     <div className="col-md-4">
//                                         <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Numéro dossier</label>
//                                         <input type="text" className="form-control" placeholder="Num Dossier" style={{ borderRadius: "8px", borderColor: "#20c997" }} onChange={(e) => setsearched_num_dossier(e.target.value)} />
//                                     </div>
//                                     <div className="col-md-8">
//                                         <div className="d-flex flex-wrap gap-4">
//                                             <div className="form-check">
//                                                 <input type="radio" className="form-check-input" id="echeancier_" name="reportType" value="echeancier" checked={radioValue === "echeancier"} onChange={handleRadioChange} />
//                                                 <label className="form-check-label" style={{ color: "steelblue", fontWeight: "500" }} htmlFor="echeancier_"><i className="fas fa-calendar-alt me-1"></i>Échéancier</label>
//                                             </div>
//                                             <div className="form-check">
//                                                 <input type="radio" className="form-check-input" id="tableau_ammortiss" name="reportType" value="tableau_ammortiss" checked={radioValue === "tableau_ammortiss"} onChange={handleRadioChange} />
//                                                 <label className="form-check-label" style={{ color: "steelblue", fontWeight: "500" }} htmlFor="tableau_ammortiss"><i className="fas fa-table me-1"></i>Tableau d'amortissement</label>
//                                             </div>
//                                             <div className="form-check">
//                                                 <input type="radio" className="form-check-input" id="balance_agee" name="reportType" value="balance_agee" checked={radioValue === "balance_agee"} onChange={handleRadioChange} />
//                                                 <label className="form-check-label" style={{ color: "steelblue", fontWeight: "500" }} htmlFor="balance_agee"><i className="fas fa-balance-scale me-1"></i>Balance âgée</label>
//                                             </div>
//                                             {/* AJOUT PAR - nouveau bouton radio */}
//                                             <div className="form-check">
//                                                 <input type="radio" className="form-check-input" id="par_report" name="reportType" value="par" checked={radioValue === "par"} onChange={handleRadioChange} />
//                                                 <label className="form-check-label" style={{ color: "steelblue", fontWeight: "500" }} htmlFor="par_report"><i className="fas fa-chart-pie me-1"></i>PAR</label>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Formulaire pour Balance âgée (existant) */}
//                                 {radioValue === "balance_agee" && (
//                                     <div className="row g-3 mt-3">
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Date</label>
//                                             <input type="date" className="form-control" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
//                                         </div>
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Devise</label>
//                                             <select className="form-control" onChange={(e) => setdevise(e.target.value)}>
//                                                 <option value="">Dévise</option><option value="CDF">CDF</option><option value="USD">USD</option>
//                                             </select>
//                                         </div>
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Agent de crédit</label>
//                                             <select className="form-control" onChange={(e) => setagent_credit_name(e.target.value)}>
//                                                 <option value="">Tous</option>
//                                                 {fetchAgentCredit && fetchAgentCredit.map((res, idx) => <option key={idx} value={res.name}>{res.name}</option>)}
//                                             </select>
//                                         </div>
//                                         <div className="col-md-3 d-flex align-items-end">
//                                             <button className="btn w-100" style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }} onClick={getSeachedData}>
//                                                 <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-desktop me-2"}`}></i>Afficher
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* AJOUT PAR - Formulaire pour le rapport PAR */}
//                                 {radioValue === "par" && (
//                                     <div className="row g-3 mt-3">
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Date de référence</label>
//                                             <input type="date" className="form-control" value={datePar} onChange={(e) => setDatePar(e.target.value)} />
//                                         </div>
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Devise</label>
//                                             <select className="form-control" onChange={(e) => setdevise(e.target.value)}>
//                                                 <option value="">Toutes</option><option value="CDF">CDF</option><option value="USD">USD</option>
//                                             </select>
//                                         </div>
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Gestionnaire</label>
//                                             <select className="form-control" onChange={(e) => setGestionnaire(e.target.value)}>
//                                                 <option value="">Tous</option>
//                                                 {fetchGestionnaires.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
//                                             </select>
//                                         </div>
//                                         <div className="col-md-3">
//                                             <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Catégorie PAR</label>
//                                             <select className="form-control" onChange={(e) => setParCategory(e.target.value)}>
//                                                 <option value="">Toutes</option>
//                                                 <option value="PAR30">PAR30 (1-30 jours)</option>
//                                                 <option value="PAR60">PAR60 (31-60 jours)</option>
//                                                 <option value="PAR90">PAR90 (61-90 jours)</option>
//                                                 <option value="PAR180">PAR180 (>90 jours)</option>
//                                             </select>
//                                         </div>
//                                         <div className="col-md-3 d-flex align-items-end">
//                                             <button className="btn w-100" style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }} onClick={getSeachedData}>
//                                                 <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-desktop me-2"}`}></i>Afficher
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Bouton Afficher pour les autres cas (inchangé) */}
//                                 {radioValue && radioValue !== "balance_agee" && radioValue !== "par" && (
//                                     <div className="row mt-3">
//                                         <div className="col-md-3">
//                                             <button className="btn w-100" style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }} onClick={getSeachedData}>
//                                                 <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-desktop me-2"}`}></i>Afficher
//                                             </button>
//                                         </div>
//                                     </div>
//                                 )}
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="position-relative my-4"><hr className="border-2" style={{ borderColor: "#e9ecef" }} /><span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small"><i className="fas fa-chart-bar me-1"></i> Résultats</span></div>

//             {/* Échéancier (inchangé) */}
//             {fetchEcheancier && radioValue === "echeancier" && fetchEcheancier.length !== 0 && ( /* ... contenu existant ... */ )}

//             {/* Tableau amortissement (inchangé) */}
//             {fetchTableauAmortiss && radioValue === "tableau_ammortiss" && fetchTableauAmortiss.length !== 0 && ( 


//              )}

//             {/* Balance âgée (inchangé) */}
//             {fetchBalanceAgee && fetchBalanceAgee.length !== 0 && radioValue === "balance_agee" && ( 
//                 <div className="card border-0 shadow-sm rounded-3 mb-4">
//                             <div className="card-body p-4">
//                                 <div id="content-to-download-balance_agee">
//                                     {/* En-tête */}
//                                     <div className="text-center mb-4"><EnteteRapport /></div>
                
//                                     {/* Titre */}
//                                     <div className="text-center mb-4">
//                                         <h4 style={{ background: "#1a2632", padding: "10px", color: "#fff", borderRadius: "8px", display: "inline-block" }}>
//                                             <i className="fas fa-balance-scale me-2"></i>BALANCE AGÉE EN {devise} - {dateParser(new Date())}
//                                         </h4>
//                                     </div>
//                                     <div className="table-responsive">
//                                      <table className="table table-bordered" style={{ fontSize: "12px" }}>
//                                          <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
//                                              <tr>
//                                                  <th rowSpan="2">N°</th><th rowSpan="2">NumDossier</th><th rowSpan="2">Num</th><th rowSpan="2">NomCompte</th>
//                                                  <th rowSpan="2">Durée</th><th rowSpan="2">DateOctroi</th><th rowSpan="2">Échéance</th><th rowSpan="2">Accordé</th>
//                                                  <th colSpan="2">Remboursé</th><th colSpan="2">Restant dû</th>
//                                                  <th colSpan="5">En retard En Jours</th><th rowSpan="2">Jour de Retard</th>
//                                              </tr>
//                                              <tr><th>Capital</th><th>Intérêt</th><th>Capital</th><th>Intérêt</th>
//                                                  <th>1 à 30</th><th>31 à 60</th><th>61 à 90</th><th>91 à 180</th><th>Plus de 180</th></tr>
//                                          </thead>
//                                          <tbody>
//                                              {Object.entries(groupedData).map(([tranche, items]) => (
//                                                  <React.Fragment key={tranche}>
//                                                      {items.length > 0 && (
//                                                          <>
//                                                              <tr style={{ backgroundColor: "#444", color: "white" }}>
//                                                                  <td colSpan="20"><strong>{tranche}</strong></td>
//                                                              </tr>
//                                                              {items.map((res, idx) => (
//                                                                  <tr key={idx}>
//                                                                      <td>{idx + 1}</td>
//                                                                      <td>{res.NumDossier}</td>
//                                                                      <td>{res.NumCompteCredit}</td>
//                                                                      <td>{res.NomCompte}</td>
//                                                                      <td>{res.Duree}</td>
//                                                                      <td>{dateParser(res.DateOctroi)}</td>
//                                                                      <td>{dateParser(res.DateEcheance)}</td>
//                                                                      <td>{numberWithSpaces(res.MontantAccorde)}</td>
//                                                                      <td>{numberWithSpaces(res.TotalCapitalRembourse?.toFixed(2))}</td>
//                                                                      <td>{numberWithSpaces(res.TotalInteretRembourse?.toFixed(2))}</td>
//                                                                      <td>{numberWithSpaces(res.CapitalRestant?.toFixed(2))}</td>
//                                                                      <td>{numberWithSpaces(res.InteretRestant?.toFixed(2))}</td>
//                                                                      <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
//                                                                      <td>{res.NbrJrRetard}</td>
//                                                                  </tr>
//                                                              ))}
//                                                          </>
//                                                      )}
//                                                  </React.Fragment>
//                                              ))}
//                                          </tbody>
//                                      </table>
//                                  </div>
//                                </div>
//                                </div>
//                                </div>

//              )}

//             {/* AJOUT PAR - Affichage du rapport PAR */}
//             {fetchParData && radioValue === "par" && fetchParData.length !== 0 && (
//                 <div className="card border-0 shadow-sm rounded-3 mb-4">
//                     <div className="card-body p-4">
//                         <div id="content-to-download-par">
//                             <div className="text-center mb-4"><EnteteRapport /></div>
//                             <div className="text-center mb-4">
//                                 <h4 style={{ background: "#1a2632", padding: "10px", color: "#fff", borderRadius: "8px", display: "inline-block" }}>
//                                     <i className="fas fa-chart-pie me-2"></i>PORTEFEUILLE À RISQUE (PAR) - {devise || "Toutes devises"} au {dateParser(datePar)}
//                                 </h4>
//                             </div>
//                             <div className="table-responsive">
//                                 <table className="table table-bordered table-striped" style={{ fontSize: "13px" }} id="par-table">
//                                     <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
//                                         <tr>
//                                             <th>N° Dossier</th><th>Référence Échéance</th><th>Capital à amortir</th><th>Date échéance</th>
//                                             <th>Capital payé</th><th>Reste à payer</th><th>Jours de retard</th><th>Catégorie PAR</th><th>Gestionnaire</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {fetchParData.map((item, idx) => (
//                                             <tr key={idx}>
//                                                 <td>{item.NumDossier}</td>
//                                                 <td>{item.ReferenceEch}</td>
//                                                 <td className="text-end">{numberWithSpaces(item.CapAmmorti)}</td>
//                                                 <td>{dateParser(item.DateTranch)}</td>
//                                                 <td className="text-end">{numberWithSpaces(item.CapitalPaye)}</td>
//                                                 <td className="text-end fw-bold text-danger">{numberWithSpaces(item.ResteAPayer)}</td>
//                                                 <td>{item.JoursRetard}</td>
//                                                 <td><span className={`badge ${item.PAR_Category === 'OK' ? 'bg-success' : 'bg-warning text-dark'}`}>{item.PAR_Category}</span></td>
//                                                 <td>{item.Gestionnaire}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                         <div className="d-flex justify-content-end gap-2 mt-4">
//                             <button onClick={() => exportTableData("par-table")} className="btn" style={{ background: "#28a745", color: "white", borderRadius: "8px" }}>
//                                 <i className="fas fa-file-excel me-2"></i>Exporter Excel
//                             </button>
//                             <button onClick={exportToPDFPar} className="btn" style={{ background: "#dc3545", color: "white", borderRadius: "8px" }}>
//                                 <i className="fas fa-file-pdf me-2"></i>Exporter PDF
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Message aucun résultat (adapté) */}
//             {radioValue && !fetchEcheancier && !fetchTableauAmortiss && !fetchBalanceAgee && !fetchParData && (
//                 <div className="text-center py-5"><i className="fas fa-inbox fa-4x mb-3 text-muted"></i><p className="text-muted">Aucune donnée à afficher.</p></div>
//             )}
//             <div style={{ height: "30px" }}></div>
//         </div>
//     );
// };

// export default Echeancier;