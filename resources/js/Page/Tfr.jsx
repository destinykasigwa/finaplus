import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";

const Tfr = () => {
    const [loading, setloading] = useState(false);
    const [date_debut_balance, setdate_debut_balance] = useState("");
    const [date_fin_balance, setdate_fin_balance] = useState("");
    const [radioValue, setRadioValue] = useState("type_balance");
    const [radioValue2, setRadioValue2] = useState("");
    const handleRadioChange = (event) => {
        setRadioValue(event.target.value);
    };
    const handleRadioChange2 = (event) => {
        setRadioValue2(event.target.value);
    };
    const [compte_balance_debut, setcompte_balance_debut] = useState();
    const [compte_balance_fin, setcompte_balance_fin] = useState();
    const [devise, setdevise] = useState();
    const [fetchData, setFetchData] = useState();
    const [fetchResultat, setFetchResultat] = useState();
    // const [fetchData2, setFetchData2] = useState();
    // const [fetchDataConverti, setFetchDataConverti] = useState();
    // const [fetchDataNonConverti, setFetchDataNonConverti] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    // const [currentPage2, setCurrentPage2] = useState(1);
    // const [transactions, setTransactions] = useState([]);
    // const [total1, setTotal1] = useState(0);
    // const [total2, setTotal2] = useState(0);
    // const [totalConvertie1, setTotalConvertie1] = useState(0);
    // const [totalConvertie2, setTotalConvertie2] = useState(0);

    useEffect(() => {
        // GET CURRENT DATE
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0"); // Les mois commencent à 0, donc ajoutez 1
        const day = String(today.getDate()).padStart(2, "0");
        setdate_fin_balance(`${year}-${month}-${day}`);

        // GET LAST DAY OF THE PREVIOUS MONTH
        const lastDayPrevMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
        ); // 0th day of the current month gives the last day of the previous month
        const year2 = lastDayPrevMonth.getFullYear();
        const month2 = String(lastDayPrevMonth.getMonth() + 1).padStart(2, "0"); // Ajout de 1 car les mois sont indexés à partir de 0
        const day2 = String(lastDayPrevMonth.getDate()).padStart(2, "0");
        const formattedDate = `${year2}-${month2}-${day2}`;
        setdate_debut_balance(formattedDate);
    }, []); // Le tableau vide [] signifie que cet effet s'exécute une seule fois après le premier rendu

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

    const AfficherBalance = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/pages/rapport/etat-financier/tfr", {
            radioValue,
            radioValue2,
            date_debut_balance,
            date_fin_balance,
            devise,
            compte_balance_debut,
            compte_balance_fin,
        });
        if (res.data.status == 1) {
            setloading(false);
            setFetchData(res.data.data);
            setFetchResultat(res.data.resultatNet);
            // setFetchData2(res.data.data2);
            setTransactions(fetchData);
            const data = fetchData;
            // setFetchDataConverti(res.data.data_converti);
            // setFetchDataNonConverti(res.data.data_non_converti);
            // Calculer les totaux
            if (data) {
            }
            const totalAmount1 = fetchData.reduce(
                (acc, transaction) =>
                    transaction.RefTypeCompte === 7
                        ? acc + transaction.soldeDebut
                        : acc - transaction.soldeDebut,
                0,
            );
            const totalAmount2 = fetchData.reduce(
                (acc, transaction) =>
                    transaction.RefTypeCompte === 7
                        ? acc + transaction.soldeFin
                        : acc - transaction.soldeFin,
                0,
            );
            setTotal1(totalAmount1);
            setTotal2(totalAmount2);

            // const data = fetchData;

            // const fetchData2 = data;

            // const totalAmountConvertie1 = fetchData2.reduce(
            //     (acc, transaction) => {
            //         const soldeDebutCDF = parseFloat(transaction.soldeDebutCDF);
            //         const soldeDebutUSD = parseFloat(transaction.soldeDebutUSD);
            //         if (transaction.RefTypeCompte === "7") {
            //             return acc + soldeDebutCDF + soldeDebutUSD;
            //         } else if (transaction.RefTypeCompte === "6") {
            //             return acc + soldeDebutCDF - soldeDebutUSD;
            //         }
            //         return acc;
            //     },
            //     0
            // );

            // const totalAmountConvertie2 = fetchData2.reduce(
            //     (acc, transaction) => {
            //         const soldeFinCDF = parseFloat(transaction.soldeFinCDF);
            //         const soldeFinUSD = parseFloat(transaction.soldeFinUSD);
            //         if (transaction.RefTypeCompte === "7") {
            //             return acc + soldeFinCDF + soldeFinUSD;
            //         } else if (transaction.RefTypeCompte === "6") {
            //             return acc + soldeFinCDF - soldeFinUSD;
            //         }
            //         return acc;
            //     },
            //     0
            // );

            // console.log("totalAmountConvertie1:", totalAmountConvertie1);
            // console.log("totalAmountConvertie2:", totalAmountConvertie2);

            // setTotalConvertie1(totalAmountConvertie1);
            // setTotalConvertie2(totalAmountConvertie2);
        }
    };

    function numberWithSpaces(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    // function removeLastWord(sentence) {
    //     // Vérifie si sentence est null ou undefined, retourne une chaîne vide si c'est le cas
    //     if (!sentence) {
    //         return "";
    //     }
    //     // Convert the sentence to lowercase
    //     const modifiedSentence = sentence.toLowerCase();

    //     // Split the sentence into words
    //     let words = modifiedSentence.split(" ");

    //     // Check if the last word is "en" and remove it if it is
    //     if (words[words.length - 1] === "en" || "En") {
    //         words = words.slice(0, -1);
    //     }

    //     // Remove the actual last word
    //     const wordsWithoutLast = words.slice(0, -1);

    //     // Capitalize the first letter of each word
    //     const capitalizedWords = wordsWithoutLast.map(
    //         (word) => word.charAt(0).toUpperCase() + word.slice(1)
    //     );

    //     // Recompose the sentence without the last word
    //     return capitalizedWords.join(" ");
    // }

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
                </li>,
            );
        }
        return pageNumbers;
    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) =>
            Math.min(
                prevPage + 1,
                Math.ceil(fetchData && fetchData.length / itemsPerPage),
            ),
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

        if (!table) {
            console.error(`Table with id ${tableId} not found`);
            return;
        }

        // Convert table to workbook
        const wb = XLSX.utils.table_to_book(table, { raw: true });

        // Optionally set column widths
        const ws = wb.Sheets[wb.SheetNames[0]];
        const cols = Array.from(
            table.querySelectorAll("tr:first-child th"),
        ).map(
            () => ({ wpx: 100 }), // Set default width in pixels
        );
        ws["!cols"] = cols;

        // Write workbook
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

        // Save file
        const fileName = `table_${tableId}.xlsx`;
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            fileName,
        );
    };
    const exportToPDF = () => {
        const content = document.getElementById("content-to-download-tfr");

        if (!content) {
            console.error("Element not found!");
            return;
        }

        // Reduce scale to lower quality
        html2canvas(content, { scale: 2 }).then((canvas) => {
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
            const imgData = newCanvas.toDataURL("image/jpeg", 0.8); // Use JPEG format and set quality to 0.8
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            pdf.autoPrint();
            window.open(pdf.output("bloburl"), "_blank");
            // pdf.save("releve-de-compte.pdf");
        });
    };

    // const replaceCurrencyByCDF = (text) => {
    //     return text.replace(/EN USD/g, "EN CDF");
    // };

    // const replaceCurrencyByUSD = (text) => {
    //     return text.replace(/EN USD/g, "EN CDF");
    // };

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
                            <i className="fas fa-chart-line" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Tableau de Formation de Résultat (TFR)</h5>
                            <small className="text-white-50">Analyse des performances financières</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Filtres */}
    <div className="row g-3 mb-4">
        {/* Période */}
        <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-calendar-alt me-2"></i>Période
                    </h6>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Période N-1</label>
                        <input type="date" className="form-control" style={{ borderRadius: "8px", borderColor: "#20c997" }}
                            onChange={(e) => setdate_debut_balance(e.target.value)} value={date_debut_balance} />
                    </div>
                    <div className="mb-2">
                        <label style={{ color: "steelblue", fontWeight: "500", fontSize: "13px" }}>Date Fin</label>
                        <input type="date" className="form-control" style={{ borderRadius: "8px", borderColor: "#20c997" }}
                            onChange={(e) => setdate_fin_balance(e.target.value)} value={date_fin_balance} />
                    </div>
                </div>
            </div>
        </div>

        {/* Consolidation */}
        <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-exchange-alt me-2"></i>Consolidation % à la monnaie
                    </h6>
                </div>
                <div className="card-body">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <div className="form-check">
                            <input type="radio" className="form-check-input" id="type_balance" name="type_balance"
                                value="type_balance" checked={radioValue === "type_balance"} onChange={handleRadioChange} />
                            <label className="form-check-label" style={{ color: "steelblue" }}>
                                Balance uniquement en
                            </label>
                            <select name="devise" id="devise" className="form-select d-inline-block w-auto ms-2" 
                                style={{ borderRadius: "6px", borderColor: "#20c997" }} onChange={(e) => setdevise(e.target.value)}>
                                <option value="">Dévise</option>
                                <option value="CDF">CDF</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="form-check mb-2">
                            <input disabled type="radio" className="form-check-input" id="balance_convertie_cdf" name="balance_convertie_cdf"
                                value="balance_convertie_cdf" checked={radioValue === "balance_convertie_cdf"} onChange={handleRadioChange} />
                            <label className="form-check-label" style={{ color: "steelblue" }}>
                                TFR convertie en CDF
                            </label>
                        </div>
                        <div className="form-check">
                            <input disabled type="radio" className="form-check-input" id="balance_convertie_usd" name="balance_convertie_usd"
                                value="balance_convertie_usd" checked={radioValue === "balance_convertie_usd"} onChange={handleRadioChange} />
                            <label className="form-check-label" style={{ color: "steelblue" }}>
                                TFR convertie en USD
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action */}
        <div className="col-md-2">
            <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-3">
                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                        <i className="fas fa-play me-2"></i>Action
                    </h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                    <button onClick={AfficherBalance} className="btn w-100 py-2" 
                        style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }}>
                        <i className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-desktop me-2"}`}></i>
                        Afficher
                    </button>
                </div>
            </div>
        </div>
    </div>

    {/* Tableau TFR */}
    {fetchData && fetchData.length != 0 && (
        <>
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                    <div id="content-to-download-tfr">
                        {/* En-tête du rapport */}
                        <div className="text-center mb-3"><EnteteRapport /></div>
                        
                        <div className="text-center mb-4">
                            <h4 style={{ 
                                background: "#1a2632", 
                                padding: "12px", 
                                color: "#fff", 
                                borderRadius: "8px", 
                                display: "inline-block",
                                borderLeft: "5px solid #20c997"
                            }}>
                                TFR 
                                {radioValue == "type_balance" && devise == "USD" && " - UNIQUEMENT EN USD"}
                                {radioValue == "type_balance" && devise == "CDF" && " - UNIQUEMENT EN CDF"}
                                {radioValue == "balance_convertie_cdf" && " - CONVERTIE EN CDF"}
                                {radioValue == "balance_convertie_usd" && " - CONVERTIE EN USD"}
                                <br />
                                <small style={{ fontSize: "14px" }}>AU {dateParser(new Date())}</small>
                            </h4>
                        </div>

                        {/* Tableau principal */}
                        <div className="table-responsive">
                            <table className="table table-bordered" style={{ fontSize: "13px" }}>
                                <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
                                    <tr>
                                        <th rowSpan="2" style={{ textAlign: "left" }}>Code Désignation du compte</th>
                                        <th colSpan="1" style={{ textAlign: "center" }}>N</th>
                                        <th colSpan="1" style={{ textAlign: "center" }}>N-1</th>
                                    </tr>
                                    <tr>
                                        <th style={{ textAlign: "center" }}>AU {date_fin_balance && dateParser(date_fin_balance)}</th>
                                        <th style={{ textAlign: "center" }}>AU {date_debut_balance && dateParser(date_debut_balance)}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems && currentItems.map((res, index) => {
                                        const isTotalLine = res.NumCompte == "851" || res.NumCompte == "850";
                                        const isResultLine = res.NumCompte == "871" || res.NumCompte == "870";
                                        const rowStyle = {
                                            background: isTotalLine ? "#e6f2f9" : isResultLine ? "#20c997" : "",
                                            fontSize: isTotalLine || isResultLine ? "18px" : "",
                                            fontWeight: isTotalLine || isResultLine ? "bold" : ""
                                        };
                                        
                                        return radioValue == "type_balance" ? (
                                            <tr key={index} style={rowStyle}>
                                                <td>
                                                    {res.RefTypeCompte == "7" ? " + " : res.RefTypeCompte == "6" ? " - " : ""}
                                                    {res.RefCadre} {res.NomCompte}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {res.RefCadre == "85" || res.RefCadre == "87"
                                                        ? numberWithSpaces(res.soldeFin?.toFixed(2))
                                                        : numberWithSpaces(Math.abs(res.soldeFin)?.toFixed(2))}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {res.RefCadre == "85" || res.RefCadre == "87"
                                                        ? numberWithSpaces(res.soldeDebut?.toFixed(2))
                                                        : numberWithSpaces(Math.abs(res.soldeDebut)?.toFixed(2))}
                                                </td>
                                            </tr>
                                        ) : radioValue == "balance_convertie_cdf" ? (
                                            <tr key={index} style={rowStyle}>
                                                <td>
                                                    {res.RefTypeCompte == "7" ? " + " : res.RefTypeCompte == "6" ? " - " : ""}
                                                    {res.RefCadre} {res.NomCompte}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {res.RefCadre == "85" || res.RefCadre == "87"
                                                        ? numberWithSpaces(parseFloat(res.solde_consolide_cdf_to_usd_date_2)?.toFixed(2))
                                                        : numberWithSpaces(Math.abs(parseFloat(res.solde_consolide_cdf_to_usd_date_2))?.toFixed(2))}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {res.RefCadre == "85" || res.RefCadre == "87"
                                                        ? numberWithSpaces(parseFloat(res.solde_consolide_cdf_to_usd_date_1)?.toFixed(2))
                                                        : numberWithSpaces(Math.abs(parseFloat(res.solde_consolide_cdf_to_usd_date_1))?.toFixed(2))}
                                                </td>
                                            </tr>
                                        ) : radioValue == "balance_convertie_usd" ? (
                                            <tr key={index} style={rowStyle}>
                                                <td>
                                                    {res.RefTypeCompte == "7" ? " + " : res.RefTypeCompte == "6" ? " - " : ""}
                                                    {res.RefCadre} {res.NomCompte}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {res.RefCadre == "85" || res.RefCadre == "87"
                                                        ? numberWithSpaces(parseFloat(res.solde_consolide_usd_to_cdf_date_2)?.toFixed(2))
                                                        : numberWithSpaces(Math.abs(parseFloat(res.solde_consolide_usd_to_cdf_date_2))?.toFixed(2))}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    {res.RefCadre == "85" || res.RefCadre == "87"
                                                        ? numberWithSpaces(parseFloat(res.solde_consolide_cdf_to_usd_date_2)?.toFixed(2))
                                                        : numberWithSpaces(Math.abs(parseFloat(res.solde_consolide_cdf_to_usd_date_1))?.toFixed(2))}
                                                </td>
                                            </tr>
                                        ) : null;
                                    })}
                                </tbody>
                                <tfoot style={{ backgroundColor: "#20c997", color: "white", fontWeight: "bold" }}>
                                    <tr>
                                        <td className="fw-bold fs-5">Résultat Net de l'exercice</td>
                                        <td className="text-end fs-5">{fetchResultat && numberWithSpaces(fetchResultat?.toFixed(2))}</td>
                                        <td className="text-center">////////////////</td>
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
                    className="btn btn-sm" style={{ background: currentPage === 1 ? "#ccc" : "#20c997", color: "white", borderRadius: "6px", padding: "5px 12px" }}>
                    <i className="fas fa-chevron-left me-1"></i>Précédent
                </button>
                {renderPagination()}
                <button onClick={goToNextPage} disabled={currentPage === Math.ceil(fetchData?.length / itemsPerPage)} 
                    className="btn btn-sm" style={{ background: currentPage === Math.ceil(fetchData?.length / itemsPerPage) ? "#ccc" : "#20c997", color: "white", borderRadius: "6px", padding: "5px 12px" }}>
                    Suivant<i className="fas fa-chevron-right ms-1"></i>
                </button>
            </div>

            {/* Boutons d'export */}
            <div className="d-flex justify-content-end gap-2 mt-3 mb-4">
                <button onClick={() => exportTableData("content-to-download-tfr")} 
                    className="btn" style={{ background: "#28a745", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-excel me-2"></i>Exporter en Excel
                </button>
                <button onClick={exportToPDF} 
                    className="btn" style={{ background: "#dc3545", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-pdf me-2"></i>Exporter en PDF
                </button>
            </div>
        </>
    )}

    {/* Message si aucune donnée */}
    {fetchData && fetchData.length === 0 && (
        <div className="text-center py-5">
            <i className="fas fa-inbox fa-4x mb-3 text-muted"></i>
            <p className="text-muted">Aucune donnée trouvée pour la période sélectionnée.</p>
        </div>
    )}

    <div style={{ height: "30px" }}></div>
</div>
    );
};

export default Tfr;
