import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";

const RemboursementAttendu = () => {
    const [loading, setloading] = useState(false);
    const [dateToSearch1, setdateToSearch1] = useState("");
    const [dateToSearch2, setdateToSearch2] = useState("");
    const [devise, setdevise] = useState("CDF");
    const [fetchData, setFetchData] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [total1, setTotal1] = useState(0);
    const [total2, setTotal2] = useState(0);
    const [fetchAgentCredit, setFetchAgentCredit] = useState();
    const [agent_credit_name, setagent_credit_name] = useState();

    useEffect(() => {
        // GET CURRENT DATE
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0"); // Les mois commencent à 0, donc ajoutez 1
        const day = String(today.getDate()).padStart(2, "0");
        setdateToSearch2(`${year}-${month}-${day}`);

        // GET LAST DAY OF THE PREVIOUS MONTH
        const lastDayPrevMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
        ); // 0th day of the current month gives the last day of the previous month
        const year2 = lastDayPrevMonth.getFullYear();
        const month2 = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0"); // Ajout de 1 car les mois sont indexés à partir de 0
        const day2 = String(lastDayPrevMonth.getDate()).padStart(2, "0");
        const formattedDate = `${year2}-${month2}-${day2}`;
        setdateToSearch1(formattedDate);
        setTimeout(() => {
            getAgentCredit();
        }, 2000);
    }, []); // Le tableau vide [] signifie que cet effet s'exécute une seule fois après le premier rendu

    const getAgentCredit = async () => {
        const res = await axios.get(
            "/eco/page/rapport/get-echeancier/agent-credit"
        );
        if (res.data.status == 1) {
            setFetchAgentCredit(res.data.get_agent_credit);
            console.log(fetchAgentCredit);
        }
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

    const AfficherRemboursementAttendu = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/rapport/data/remboursement-attendu", {
            dateToSearch1,
            dateToSearch2,
            devise,
            agent_credit_name,
        });
        if (res.data.status == 1) {
            setloading(false);
            setFetchData(res.data.data);
            const totalAmount1 = res.data.data.reduce(
                (acc, transaction) => acc + transaction.CapAmmorti,
                0
            );
            const totalAmount2 = res.data.data.reduce(
                (acc, transaction) => acc + transaction.Interet,
                0
            );
            setTotal1(totalAmount1 && totalAmount1);
            setTotal2(totalAmount2 && totalAmount2);
            // console.log(total1);
            // console.log(total2);
        } else {
            setloading(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 1000,
                confirmButtonText: "Okay",
            });
        }
    };

    function numberWithSpaces(x) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    // Calculate the index of the first and last item of the current page
    let itemsPerPage = 40;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems =
        fetchData && fetchData.slice(indexOfFirstItem, indexOfLastItem);

    // Function to handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Render pagination buttons
    const renderPagination = () => {
        const pageNumbers = [];
        for (
            let i = 1;
            i <= Math.ceil(fetchData && fetchData.length / itemsPerPage);
            i++
        ) {
            pageNumbers.push(
                <li key={i} className={i === currentPage ? "active" : ""}>
                    <button
                        style={
                            i === currentPage
                                ? selectedButtonStyle
                                : buttonStyle
                        }
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                </li>
            );
        }
        return pageNumbers;
    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) =>
            Math.min(
                prevPage + 1,
                Math.ceil(fetchData && fetchData.length / itemsPerPage)
            )
        );
    };

    const goToPrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
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
    const exportToPDF = () => {
        const content = document.getElementById("content-to-download");

        if (!content) {
            console.error("Element not found!");
            return;
        }

        html2canvas(content, { scale: 3 }).then((canvas) => {
            const paddingTop = 50;
            const paddingRight = 50;
            const paddingBottom = 50;
            const paddingLeft = 50;

            const canvasWidth = canvas.width + paddingLeft + paddingRight;
            const canvasHeight = canvas.height + paddingTop + paddingBottom;

            const newCanvas = document.createElement("canvas");
            newCanvas.width = canvasWidth;
            newCanvas.height = canvasHeight;
            const ctx = newCanvas.getContext("2d");

            if (ctx) {
                ctx.fillStyle = "#ffffff"; // Background color
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(canvas, paddingLeft, paddingTop);
            }

            const pdf = new jsPDF("p", "mm", "a4");
            const imgData = newCanvas.toDataURL("image/png");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.autoPrint();
            window.open(pdf.output("bloburl"), "_blank");
            // pdf.save("releve-de-compte.pdf");
        });
    };

    const paginationStyle = {
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "",
    };

    const buttonStylePrevNext = {
        padding: "2px 20px",
        backgroundColor: "steelblue",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        margin: "0 5px",
    };
    const buttonStyle = {
        padding: "1px 5px",
        backgroundColor: "steelblue",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        margin: "0 5px",
    };

    const selectedButtonStyle = {
        ...buttonStyle,
        backgroundColor: "#FFC107", // Change color for selected button
    };

    return (
     <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
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
                            <i className="fas fa-clock" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Remboursement Attendu</h5>
                            <small className="text-white-50">Suivi des échéances de remboursement</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Filtres de recherche */}
    <div className="row g-3 mb-4">
        {/* Période et devise */}
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-calendar-alt me-2"></i>Période et devise
                    </h6>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Période N-1</label>
                        <input type="date" className="form-control" style={{ borderRadius: "8px", borderColor: "#138496" }}
                            onChange={(e) => setdateToSearch1(e.target.value)} value={dateToSearch1} />
                    </div>
                    <div className="mb-3">
                        <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Date Fin</label>
                        <input type="date" className="form-control" style={{ borderRadius: "8px", borderColor: "#138496" }}
                            onChange={(e) => setdateToSearch2(e.target.value)} value={dateToSearch2} />
                    </div>
                    <div className="mb-2">
                        <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Devise</label>
                        <select className="form-control" style={{ borderRadius: "8px", borderColor: "#138496" }}
                            onChange={(e) => setdevise(e.target.value)}>
                            <option value="CDF">CDF</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Agent de crédit */}
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-user-tie me-2"></i>Agent de crédit
                    </h6>
                </div>
                <div className="card-body">
                    <div className="mb-2">
                        <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Sélectionner un agent</label>
                        <select className="form-control" style={{ borderRadius: "8px", borderColor: "#138496" }}
                            name="agent_credit_name" id="agent_credit_name"
                            onChange={(e) => setagent_credit_name(e.target.value)}>
                            <option value="">Tous les agents</option>
                            {fetchAgentCredit && fetchAgentCredit.map((res, index) => (
                                <option key={index} value={res.name}>{res.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Action */}
        <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-play me-2"></i>Action
                    </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                    <button onClick={AfficherRemboursementAttendu} className="btn w-100 py-2" 
                        style={{ background: "#138496", color: "white", borderRadius: "8px" }}>
                        <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-desktop me-2"}`}></i>
                        Afficher
                    </button>
                </div>
            </div>
        </div>
    </div>

    {/* Tableau des résultats */}
    {fetchData && fetchData.length != 0 && (
        <>
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                    <div id="content-to-download">
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
                                borderLeft: "5px solid #138496"
                            }}>
                                <i className="fas fa-hand-holding-usd me-2"></i>
                                REMBOURSEMENTS ATTENDUS
                                <br />
                                <small style={{ fontSize: "14px" }}>
                                    Du {dateParser(dateToSearch1)} au {dateParser(dateToSearch2)} - {devise}
                                </small>
                            </h4>
                        </div>

                        {/* Tableau des remboursements */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped" style={{ fontSize: "14px" }}>
                                <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
                                    <tr>
                                        <th>Date Tombée Échéance</th>
                                        <th>Numéro Compte</th>
                                        <th>Devise</th>
                                        <th>Numéro Dossier</th>
                                        <th className="text-end">Capital Échu</th>
                                        <th className="text-end">Intérêt Échu</th>
                                        <th className="text-end">Solde Compte</th>
                                        <th className="text-center">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems && currentItems.map((res, index) => {
                                        const montantTotal = parseFloat(res.CapAmmorti) + parseFloat(res.Interet);
                                        const soldeDispo = devise == "CDF" ? parseFloat(res.soldeMembreCDF) : parseFloat(res.soldeMembreUSD);
                                        const estImpaye = soldeDispo < montantTotal;
                                        
                                        return (
                                            <tr key={index} className={estImpaye ? "table-danger" : ""}>
                                                <td>{dateParser(res.DateTranch)}</td>
                                                <td className="fw-semibold">{res.NumCompteEpargne}</td>
                                                <td>
                                                    <span className={`badge ${res.CodeMonnaie == 1 ? 'bg-info' : 'bg-success'}`}>
                                                        {res.CodeMonnaie}
                                                    </span>
                                                </td>
                                                <td>{res.NumDossier}</td>
                                                <td className="text-end fw-bold">{numberWithSpaces(parseFloat(res.CapAmmorti)?.toFixed(2))}</td>
                                                <td className="text-end fw-bold">{numberWithSpaces(parseFloat(res.Interet)?.toFixed(2))}</td>
                                                <td className={`text-end fw-bold ${soldeDispo < 0 ? 'text-danger' : 'text-success'}`}>
                                                    {numberWithSpaces(soldeDispo?.toFixed(2))}
                                                </td>
                                                <td className="text-center">
                                                    {estImpaye ? (
                                                        <span className="badge bg-danger">
                                                            <i className="fas fa-exclamation-triangle me-1"></i>Impayé
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-check-circle me-1"></i>Payé
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot style={{ backgroundColor: "#e6f2f9", fontWeight: "bold" }}>
                                    <tr>
                                        <td colSpan="4" className="text-end fw-bold">TOTAUX :</td>
                                        <td className="text-end text-danger">{numberWithSpaces(total1?.toFixed(2))}</td>
                                        <td className="text-end text-danger">{numberWithSpaces(total2?.toFixed(2))}</td>
                                        <td className="text-end text-success">{numberWithSpaces((total1 + total2)?.toFixed(2))}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center align-items-center gap-2 mt-3 mb-4">
                <button onClick={goToPrevPage} disabled={currentPage === 1} 
                    className="btn btn-sm" style={{ background: currentPage === 1 ? "#ccc" : "#138496", color: "white", borderRadius: "6px", padding: "5px 12px" }}>
                    <i className="fas fa-chevron-left me-1"></i>Précédent
                </button>
                {renderPagination()}
                <button onClick={goToNextPage} disabled={currentPage === Math.ceil(fetchData?.length / itemsPerPage)} 
                    className="btn btn-sm" style={{ background: currentPage === Math.ceil(fetchData?.length / itemsPerPage) ? "#ccc" : "#138496", color: "white", borderRadius: "6px", padding: "5px 12px" }}>
                    Suivant<i className="fas fa-chevron-right ms-1"></i>
                </button>
            </div>

            {/* Boutons d'export */}
            <div className="d-flex justify-content-end gap-2 mt-3 mb-4">
                <button onClick={() => exportTableData("content-to-download")} 
                    className="btn" style={{ background: "#28a745", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-excel me-2"></i>Exporter en Excel
                </button>
                <button onClick={exportToPDF} 
                    className="btn" style={{ background: "#138496", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-pdf me-2"></i>Exporter en PDF
                </button>
            </div>
        </>
    )}

    {/* Message si aucune donnée */}
    {fetchData && fetchData.length === 0 && (
        <div className="text-center py-5">
            <i className="fas fa-inbox fa-4x mb-3 text-muted"></i>
            <p className="text-muted">Aucun remboursement attendu pour la période sélectionnée.</p>
        </div>
    )}

    <div style={{ height: "30px" }}></div>
</div>
    );
};

export default RemboursementAttendu;
