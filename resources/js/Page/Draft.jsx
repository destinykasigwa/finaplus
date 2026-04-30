// import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";
// import { ExportCSV } from "./Print";
import { EnteteRapport } from "./HeaderReport";
// import { useNavigate } from "react-router-dom";

const Journal = () => {
    const [loading, setloading] = useState(false);
    const [devise, setDevise] = useState("CDF");

    const [getDataCDF, setGetdataCDF] = useState();
    const [getDataUSD, setGetdataUSD] = useState();
    const [getdefaultDateDebut, setGetdefaultDateDebut] = useState();
    const [getdefaultDateFin, setGetdefaultDateFin] = useState();
    const [dateDebut, setDateDebut] = useState();
    const [dateFin, setDateFin] = useState();
    const [getTypeJournal, setGetTypeJournal] = useState();
    // const [checkboxValue, setCheckboxValue] = useState(false);
    const [radioValue, setRadioValue] = useState("");
    const [radioValue2, setRadioValue2] = useState("");
    const [checkboxValues, setCheckboxValues] = useState({
        userCheckbox: false,
        SuspensTransactions: false,
        givenCurrency: false,
        GivenJournal: false,
    });
    const [AgenceFrom, setAgenceFrom] = useState("GOMA");
    // const [fetchUsers, setFetchUsers] = useState();
    const [MonnaieDonnee, setMonnaieDonnee] = useState();
    const [JournalDonne, setJournalDonne] = useState();
    const [getAllUsers, setgetAllUsers] = useState();
    const [UserName, setUserName] = useState();
    const [agenceFilter, setAgenceFilter] = useState("current"); // 'current', 'all', ou un id d'agence
    const [getTot, setGetTot] = useState({
        totCDF: "",
        totUSD: "",
    });

    useEffect(() => {
        GetInformation();
        getDefaultDate();
        getJournalDropMenu();
    }, []);

    // const handleCheckboxChange = (event) => {
    //     setCheckboxValue(event.target.checked);
    // };
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    const handleRadioChange = (event) => {
        setRadioValue(event.target.value);
    };

    const handleRadioChange2 = (event) => {
        setRadioValue2(event.target.value);
    };

    const GetInformation = async () => {};

    const getDefaultDate = async () => {
        const res = await axios.get("/eco/page/report/get-default-page");
        if (res.data.status == 1) {
            setGetdefaultDateDebut(res.data.dateDebut);
            setGetdefaultDateFin(res.data.dateFin);
        }
    };
    const getJournalDropMenu = async () => {
        const res = await axios.get("/eco/page/report/get-journal-drop-menu");
        if (res.data.status == 1) {
            setGetTypeJournal(res.data.data);
            setgetAllUsers(res.data.users);
            // setFetchUsers(getAllUsers);
            // console.log(UserName);
        }
    };
    const GetJournal = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/report/get-searched-journal", {
            DateDebut: dateDebut ? dateDebut : getdefaultDateDebut,
            DateFin: dateFin ? dateFin : getdefaultDateFin,
            // TypeAgence: radioValue,
            // TypeJournal: radioValue2,
            AutresCriteres: checkboxValues,
            // AgenceFrom: AgenceFrom,
            UserName: UserName,
            // MonnaieDonnee: MonnaieDonnee,
            // JournalDonne: JournalDonne,
           agence_filter: agenceFilter, // <- ajout

        });
        if (res.data.status == 1) {
            setloading(false);
            setGetdataCDF(res.data.dataCDF);
            setGetdataUSD(res.data.dataUSD);
            setGetTot({
                totCDF: res.data.totCDF,
                totUSD: res.data.totUSD,
            });
            //console.log(getTot.totCDF.TotalDebitfc);
        } else {
            setloading(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    const exportTableData = (tableId) => {
        const s2ab = (s) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i)
                view[i] = s.charCodeAt(i) & 0xff;
            return buf;
        };

        const table = document.getElementById(tableId);
        const wb = XLSX.utils.table_to_book(table);
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
        const fileName = `table_${tableId}.xlsx`;
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            fileName
        );
    };
    // const exportToPDFCDF = () => {
    //     const content = document.getElementById("content-to-download-cdf");

    //     if (!content) {
    //         console.error("Element not found!");
    //         return;
    //     }

    //     html2canvas(content, { scale: 3 }).then((canvas) => {
    //         const paddingTop = 50;
    //         const paddingRight = 50;
    //         const paddingBottom = 50;
    //         const paddingLeft = 50;

    //         const canvasWidth = canvas.width + paddingLeft + paddingRight;
    //         const canvasHeight = canvas.height + paddingTop + paddingBottom;

    //         const newCanvas = document.createElement("canvas");
    //         newCanvas.width = canvasWidth;
    //         newCanvas.height = canvasHeight;
    //         const ctx = newCanvas.getContext("2d");

    //         if (ctx) {
    //             ctx.fillStyle = "#ffffff"; // Background color
    //             ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //             ctx.drawImage(canvas, paddingLeft, paddingTop);
    //         }

    //         const pdf = new jsPDF("p", "mm", "a4");
    //         const imgData = newCanvas.toDataURL("image/png");
    //         const imgProps = pdf.getImageProperties(imgData);
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    //         pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    //         pdf.autoPrint();
    //         window.open(pdf.output("bloburl"), "_blank");
    //         // pdf.save("releve-de-compte.pdf");
    //     });
    // };
    const exportToPDF = () => {
        const content = document.getElementById("content-to-download-journal");

        if (!content) {
            console.error("Element not found!");
            return;
        }

        html2canvas(content, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL("image/jpeg", 0.75); // Change to JPEG and set quality to 0.75
                const pdf = new jsPDF("p", "mm", "a4");

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(
                    imgData,
                    "JPEG",
                    0,
                    position,
                    pdfWidth,
                    imgHeight,
                    undefined,
                    "FAST"
                ); // Use 'FAST' compression
                heightLeft -= pdfHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(
                        imgData,
                        "JPEG",
                        0,
                        position,
                        pdfWidth,
                        imgHeight,
                        undefined,
                        "FAST"
                    ); // Use 'FAST' compression
                    heightLeft -= pdfHeight;
                }

                pdf.autoPrint();
                window.open(pdf.output("bloburl"), "_blank");
            })
            .catch((error) => {
                console.error("Error capturing canvas:", error);
            });
    };

    const dateParser = (num) => {
        const options = {
            // weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",
        };

        let timestamp = Date.parse(num);

        let date = new Date(timestamp).toLocaleDateString("fr-FR", options);

        return date.toString();
    };
    function numberWithSpaces(x) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }
    let compteur = 1;
    let compteur2 = 1;
    return (
        <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
    {/* En-tête moderne */}
    <div className="row mb-4">
        <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-3" style={{
                    background: "#138496",
                    // linear-gradient(135deg, #20c997 0%, #198764 100%)
                    borderRadius: "12px"
                }}>
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <i className="fas fa-book-open" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Journal des opérations</h5>
                            <small className="text-white-50">Historique complet des transactions</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Filtres */}
   <div className="row g-4 mb-4">
    {/* Période */}
    <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-calendar-alt me-2" style={{ color: "#6366f1" }}></i>
                    Période
                </h6>
            </div>
            <div className="card-body pt-2">
                <div className="mb-3">
                    <label className="label-modern">Date début</label>
                    <input
                        type="date"
                        className="form-control modern-input"
                        value={dateDebut || getdefaultDateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                    />
                </div>
                <div>
                    <label className="label-modern">Date fin</label>
                    <input
                        type="date"
                        className="form-control modern-input"
                        value={dateFin || getdefaultDateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                    />
                </div>
            </div>
        </div>
    </div>

{/* Utilisateur */}
<div className="col-md-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
        <div className="card-header bg-transparent border-0 pt-3 pb-0">
            <h6 className="section-title">
                <i className="fas fa-user me-2" style={{ color: "#6366f1" }}></i>
                Utilisateur
            </h6>
        </div>
        <div className="card-body pt-2">
            <label className="label-modern">Agent</label>
            <select
                className="modern-select w-100 mb-3"
                value={UserName}
                onChange={(e) => setUserName(e.target.value)}
            >
                <option value="">Tous les utilisateurs</option>
                {getAllUsers?.map((user, idx) => (
                    <option key={idx} value={user.name}>{user.name}</option>
                ))}
            </select>
            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="TransSuspen"
                    name="SuspensTransactions"
                    checked={checkboxValues.SuspensTransactions}
                    onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="TransSuspen">
                    Transactions en suspens
                </label>
            </div>
        </div>
    </div>
</div>

    {/* Agence */}
    <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-building me-2" style={{ color: "#6366f1" }}></i>
                    Agence
                </h6>
            </div>
            <div className="card-body pt-2">
                <select
                    className="modern-select w-100"
                    value={agenceFilter}
                    onChange={(e) => setAgenceFilter(e.target.value)}
                    disabled={userAgences.length <= 1}
                >
                    <option value="current">
                        Agence courante ({currentAgence?.nom_agence || "Non définie"})
                    </option>
                    {userAgences.length > 1 && (
                        <>
                            <option value="all">Toutes mes agences</option>
                            {userAgences.map((agence) => (
                                <option key={agence.id} value={agence.id}>
                                    {agence.code_agence} - {agence.nom_agence}
                                </option>
                            ))}
                        </>
                    )}
                </select>
            </div>
        </div>
    </div>

    {/* Action */}
    <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-play me-2" style={{ color: "#6366f1" }}></i>
                    Action
                </h6>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center pt-2">
                <button
                    onClick={GetJournal}
                    className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        <i className="fas fa-desktop"></i>
                    )}
                    <span>Afficher</span>
                </button>
            </div>
        </div>
    </div>
</div>

   {/* Tableau des résultats */}
{(getDataCDF && getDataCDF.length > 0) || (getDataUSD && getDataUSD.length > 0) ? (
    <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
            <div id="content-to-download-journal">
                {/* En-tête du rapport */}
                <div className="text-center mb-3">
                    <EnteteRapport />
                </div>

                <div className="text-center mb-4">
                    <h4 style={{ 
                        background: "#1a2632", 
                        padding: "12px", 
                        color: "#fff", 
                        borderRadius: "8px", 
                        display: "inline-block",
                        borderLeft: "5px solid #20c997"
                    }}>
                        <i className="fas fa-book-open me-2"></i>
                        JOURNAL DES OPÉRATIONS
                        <br />
                        <small style={{ fontSize: "14px" }}>
                            Du {dateDebut ? dateParser(dateDebut) : dateParser(getdefaultDateDebut)} 
                            au {dateFin ? dateParser(dateFin) : dateParser(getdefaultDateFin)}
                        </small>
                    </h4>
                </div>

                {/* Filtres actifs (inchangé) */}
                <div className="row g-2 mb-3">
                    {radioValue === "givenAgence" && AgenceFrom && (
                        <div className="col-auto">
                            <span className="badge bg-info">Agence: {AgenceFrom}</span>
                        </div>
                    )}
                    {UserName && (
                        <div className="col-auto">
                            <span className="badge bg-success">Utilisateur: {UserName}</span>
                        </div>
                    )}
                    {checkboxValues.SuspensTransactions && (
                        <div className="col-auto">
                            <span className="badge bg-warning">Opérations En suspens</span>
                        </div>
                    )}
                    {checkboxValues.givenCurrency && MonnaieDonnee && (
                        <div className="col-auto">
                            <span className="badge bg-secondary">Devise: {MonnaieDonnee}</span>
                        </div>
                    )}
                    {checkboxValues.GivenJournal && JournalDonne && (
                        <div className="col-auto">
                            <span className="badge bg-dark">Journal: {JournalDonne}</span>
                        </div>
                    )}
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered table-striped" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
                            <tr>
                                <th>Date</th>
                                <th>Réf. Op</th>
                                <th>Compte débit</th>
                                <th>Compte crédit</th>
                                <th>Libellé</th>
                                <th className="text-end">Débit</th>
                                <th className="text-end">Crédit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* SECTION CDF */}
                            {getDataCDF && getDataCDF.length > 0 && (
                                <>
                                    <tr style={{ backgroundColor: "#e6f2f9" }}>
                                        <td colSpan="7" className="fw-bold fs-5" style={{ color: "steelblue" }}>
                                            <i className="fas fa-chart-line me-2"></i>CDF
                                        </td>
                                    </tr>
                                    {getDataCDF.map((res, index) => (
                                        <tr key={`cdf-${index}`}>
                                            <td>{dateParser(res.DateTransaction)}</td>
                                            <td className="fw-semibold">{res.NumTransaction}</td>
                                            <td>
                                                {res.CompteDebit}<br />
                                                <small className="text-muted">{res.NomCompteDebit}</small>
                                            </td>
                                            <td>
                                                {res.CompteCredit}<br />
                                                <small className="text-muted">{res.NomCompteCredit}</small>
                                            </td>
                                            <td>{res.Libelle}</td>
                                            <td className="text-end text-danger fw-bold">
                                                {numberWithSpaces(res.MontantDebit?.toFixed(2))}
                                            </td>
                                            <td className="text-end text-success fw-bold">
                                                {numberWithSpaces(res.MontantCredit?.toFixed(2))}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: "#20c997", color: "white", fontWeight: "bold" }}>
                                        <td colSpan="5" className="text-end fw-bold">TOTAL CDF :</td>
                                        <td className="text-end">
                                            {numberWithSpaces(getTot?.totCDF?.TotalDebitfc?.toFixed(2))}
                                        </td>
                                        <td className="text-end">
                                            {numberWithSpaces(getTot?.totCDF?.TotalCreditfc?.toFixed(2))}
                                        </td>
                                    </tr>
                                </>
                            )}

                            {/* SECTION USD */}
                            {getDataUSD && getDataUSD.length > 0 && (
                                <>
                                    <tr style={{ backgroundColor: "#e6f2f9" }}>
                                        <td colSpan="7" className="fw-bold fs-5" style={{ color: "steelblue" }}>
                                            <i className="fas fa-dollar-sign me-2"></i>USD
                                        </td>
                                    </tr>
                                    {getDataUSD.map((res, index) => (
                                        <tr key={`usd-${index}`}>
                                            <td>{dateParser(res.DateTransaction)}</td>
                                            <td className="fw-semibold">{res.NumTransaction}</td>
                                            <td>
                                                {res.CompteDebit}<br />
                                                <small className="text-muted">{res.NomCompteDebit}</small>
                                            </td>
                                            <td>
                                                {res.CompteCredit}<br />
                                                <small className="text-muted">{res.NomCompteCredit}</small>
                                            </td>
                                            <td>{res.Libelle}</td>
                                            <td className="text-end text-danger fw-bold">
                                                {numberWithSpaces(res.MontantDebit?.toFixed(2))}
                                            </td>
                                            <td className="text-end text-success fw-bold">
                                                {numberWithSpaces(res.MontantCredit?.toFixed(2))}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: "#20c997", color: "white", fontWeight: "bold" }}>
                                        <td colSpan="5" className="text-end fw-bold">TOTAL USD :</td>
                                        <td className="text-end">
                                            {numberWithSpaces(getTot?.totUSD?.TotalDebitusd?.toFixed(2))}
                                        </td>
                                        <td className="text-end">
                                            {numberWithSpaces(getTot?.totUSD?.TotalCreditusd?.toFixed(2))}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Boutons d'export */}
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button onClick={() => exportTableData("content-to-download-journal")} 
                    className="btn" style={{ background: "#28a745", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-excel me-2"></i>Exporter en Excel
                </button>
                <button onClick={exportToPDF} 
                    className="btn" style={{ background: "#dc3545", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-pdf me-2"></i>Exporter en PDF
                </button>
            </div>
        </div>
    </div>
) : (
    (getDataCDF || getDataUSD) && (
        <div className="text-center py-5">
            <i className="fas fa-inbox fa-4x mb-3 text-muted"></i>
            <p className="text-muted">Aucune opération trouvée pour les critères sélectionnés.</p>
        </div>
    )
)}

    <div style={{ height: "30px" }}></div>

    <style>
        {`
        .modern-input {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}
.modern-input:focus {
    border-color: #20c997;
    box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
}
.modern-select {
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    font-size: 0.9rem;
    background-color: white;
    transition: all 0.2s ease;
}
.modern-select:focus {
    border-color: #20c997;
    box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
}
.label-modern {
    font-size: 0.8rem;
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 6px;
    display: block;
}
.section-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}
.gradient-btn {
    background: linear-gradient(135deg, #20c997, #198764);
    border: none;
    border-radius: 12px;
    transition: all 0.2s ease;
}
.gradient-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(32, 201, 151, 0.3);
}
        `}
    </style>
</div>
    );
};

export default Journal;
