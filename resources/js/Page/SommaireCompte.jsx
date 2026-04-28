import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { EnteteRapport } from "./HeaderReport";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";
import { Bars } from "react-loader-spinner";

const SommaireCompte = () => {
    const [loading, setloading] = useState(false);
    const [date_debut_balance, setdate_debut_balance] = useState("");
    const [date_fin_balance, setdate_fin_balance] = useState("");
    const [radioValue, setRadioValue] = useState("rapport_non_converti");
    const [radioValue2, setRadioValue2] = useState("");
    const [chargement, setchargement] = useState(false);
    const handleRadioChange = (event) => {
        setRadioValue(event.target.value);
    };
    const handleRadioChange2 = (event) => {
        setRadioValue2(event.target.value);
    };
    const [sous_groupe_compte, setsous_groupe_compte] = useState(3300);
    // const [compte_balance_fin, setcompte_balance_fin] = useState();
    // const [devise, setdevise] = useState();
    const [fetchData, setFetchData] = useState();
    const [fetchData2, setFetchData2] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [fetchAccountName, setFetchAccountName] = useState();
    const [total1, setTotal1] = useState(0);
    const [total2, setTotal2] = useState(0);
    const [critereSolde, setCritereSolde] = useState(">");
    const [critereSoldeAmount, setCritereSoldeAmount] = useState(0);
     const [agenceFilter, setAgenceFilter] = useState("current"); // 'current', 'all', ou un id d'agence

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
            0
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

    const downloadReport = (type) => {
        setchargement(true);
        // Générer le nom du fichier avec la date du jour
        const filename = `Sommaire_Compte_${
            new Date().toISOString().split("T")[0]
        }`; // "YYYY-MM-DD"
        axios
            .post(
                "/download-report/sommaire-compte",
                {
                    fetchData: fetchData, // Assurez-vous que fetchData contient vos données
                    date_debut_balance: date_debut_balance,
                    date_fin_balance: date_fin_balance,
                    type: type, // Ajouter le paramètre type à la requête

                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"), // Ajouter le token CSRF
                    },
                    responseType: "blob", // Définir le type de réponse comme un blob (pour le fichier)
                }
            )
            .then((response) => {
                setchargement(false);
                const url = window.URL.createObjectURL(
                    new Blob([response.data])
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `${filename}.${type === "pdf" ? "pdf" : "xlsx"}`; // Utiliser le nom dynamique du fichier
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch((error) => console.error("Error:", error));
    };

    const downloadReportConvertie = (type) => {
        setchargement(true);
        // Générer le nom du fichier avec la date du jour
        const filename = `Sommaire_Compte_convertie${
            new Date().toISOString().split("T")[0]
        }`; // "YYYY-MM-DD"
        axios
            .post(
                "download-report/sommaire-compte/convertie",
                {
                    fetchData: fetchData, // Assurez-vous que fetchData contient vos données
                    date_debut_balance: date_debut_balance,
                    date_fin_balance: date_fin_balance,
                    type: type, // Ajouter le paramètre type à la requête
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"), // Ajouter le token CSRF
                    },
                    responseType: "blob", // Définir le type de réponse comme un blob (pour le fichier)
                }
            )
            .then((response) => {
                setchargement(false);
                const url = window.URL.createObjectURL(
                    new Blob([response.data])
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `${filename}.${type === "pdf" ? "pdf" : "xlsx"}`; // Utiliser le nom dynamique du fichier
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch((error) => console.error("Error:", error));
    };

    // const downloadReport = async (
    //     type,
    //     date_debut_balance,
    //     date_fin_balance,
    //     fetchData
    // ) => {
    //     try {
    //         console.log(date_debut_balance, date_fin_balance, fetchData); // Vérifiez ici
    //         const response = await axios.post(`/download-report`, {
    //             params: {
    //                 type,
    //                 date_debut_balance,
    //                 date_fin_balance,
    //                 fetchData, // Passer la variable fetchData ici
    //             },
    //             responseType: "blob", // Important pour les fichiers
    //         });

    //         // Créer un lien pour télécharger le fichier
    //         const url = window.URL.createObjectURL(new Blob([response.data]));
    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute(
    //             "download",
    //             `rapport.${type === "pdf" ? "pdf" : "xlsx"}`
    //         ); // Nom du fichier
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //     } catch (error) {
    //         console.error("Erreur lors du téléchargement du rapport:", error);
    //     }
    // };

    // Exemple d'appel de la fonction avec les variables
    //downloadReport("pdf", date_debut_balance, date_fin_balance, fetchData);

    const AfficherSommaire = async (e) => {
        e.preventDefault();
        setloading(true);
        setchargement(true);
        const res = await axios.post(
            "/eco/pages/rapport/sommaire-compte/affichage",
            {
                radioValue,
                radioValue2,
                sous_groupe_compte,
                date_debut_balance,
                date_fin_balance,
                critereSolde,
                critereSoldeAmount,
                 agence_filter: agenceFilter,
            }
        );
        if (res.data.status == 1) {
            setchargement(false);
            setloading(false);
            setFetchData(res.data.data);
            //setFetchData2(res.data.data);
            // setFetchDataConverti(res.data.data_converti);
            // setFetchDataNonConverti(res.data.data_non_converti);
            const totalAmount1 = res.data.data.reduce(
                (acc, transaction) => acc + transaction.soldeDebut,
                0
            );
            const totalAmount2 = res.data.data.reduce(
                (acc, transaction) => acc + transaction.soldeFin,
                0
            );
            setTotal1(totalAmount1 && totalAmount1);
            setTotal2(totalAmount2 && totalAmount2);
        } else {
            setchargement(false);
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

    function numberWithSpaces(x = 0) {
        if (x === null || x === undefined) {
            return "0.00"; // ou une autre valeur par défaut appropriée
        }
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    const itemsPerPage = 40;
    const totalPages = Math.ceil(fetchData && fetchData.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems =
        fetchData && fetchData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const renderPagination = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else if (currentPage <= halfMaxPagesToShow) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + halfMaxPagesToShow >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - halfMaxPagesToShow;
            endPage = currentPage + halfMaxPagesToShow;
        }

        if (startPage > 1) {
            pageNumbers.push(
                <li key={1}>
                    <button onClick={() => handlePageChange(1)}>1</button>
                </li>
            );
            if (startPage > 2) {
                pageNumbers.push(<li key="start-ellipsis">...</li>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
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

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(<li key="end-ellipsis">...</li>);
            }
            pageNumbers.push(
                <li key={totalPages}>
                    <button onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </button>
                </li>
            );
        }

        return pageNumbers;
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
            table.querySelectorAll("tr:first-child th")
        ).map(
            () => ({ wpx: 100 }) // Set default width in pixels
        );
        ws["!cols"] = cols;

        // Write workbook
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

        // Save file
        const fileName = `table_${tableId}.xlsx`;
        saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            fileName
        );
    };
    // const exportToPDF = () => {
    //     const content = document.getElementById("content-to-download-balance");

    //     if (!content) {
    //         console.error("Element not found!");
    //         return;
    //     }

    //     html2canvas(content, { scale: 2 })
    //         .then((canvas) => {
    //             const imgData = canvas.toDataURL("image/jpeg", 0.75); // Change to JPEG and set quality to 0.75
    //             const pdf = new jsPDF("p", "mm", "a4");

    //             const pdfWidth = pdf.internal.pageSize.getWidth();
    //             const pdfHeight = pdf.internal.pageSize.getHeight();
    //             const imgProps = pdf.getImageProperties(imgData);
    //             const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    //             let heightLeft = imgHeight;
    //             let position = 0;

    //             pdf.addImage(
    //                 imgData,
    //                 "JPEG",
    //                 0,
    //                 position,
    //                 pdfWidth,
    //                 imgHeight,
    //                 undefined,
    //                 "FAST"
    //             ); // Use 'FAST' compression
    //             heightLeft -= pdfHeight;

    //             while (heightLeft >= 0) {
    //                 position = heightLeft - imgHeight;
    //                 pdf.addPage();
    //                 pdf.addImage(
    //                     imgData,
    //                     "JPEG",
    //                     0,
    //                     position,
    //                     pdfWidth,
    //                     imgHeight,
    //                     undefined,
    //                     "FAST"
    //                 ); // Use 'FAST' compression
    //                 heightLeft -= pdfHeight;
    //             }

    //             pdf.autoPrint();
    //             window.open(pdf.output("bloburl"), "_blank");
    //         })
    //         .catch((error) => {
    //             console.error("Error capturing canvas:", error);
    //         });
    // };
    // const exportToPDF = () => {
    //     axios
    //         .post(
    //             "/sommaire-compte",
    //             {
    //                 fetchData: fetchData, // Assurez-vous que fetchData contient vos données
    //                 date_debut_balance: date_debut_balance,
    //                 date_fin_balance: date_fin_balance,
    //             },
    //             {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     "X-CSRF-TOKEN": document
    //                         .querySelector('meta[name="csrf-token"]')
    //                         .getAttribute("content"), // Ajouter le token CSRF
    //                 },
    //                 responseType: "blob", // Définir le type de réponse comme un blob (pour le fichier PDF)
    //             }
    //         )
    //         .then((response) => {
    //             const url = window.URL.createObjectURL(
    //                 new Blob([response.data])
    //             );
    //             const a = document.createElement("a");
    //             a.href = url;
    //             a.download = "sommaire_de_compte.pdf";
    //             document.body.appendChild(a);
    //             a.click();
    //             a.remove();
    //         })
    //         .catch((error) => console.error("Error:", error));
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

    const inputRef = useRef(null);
    useEffect(() => {
        const handleKeyDown = async (event) => {
            if (event.key === "Tab") {
                const res = await axios.post(
                    "/eco/pages/sommaire-compte/getcompte",
                    {
                        sous_groupe_compte,
                    }
                );
                if (res.data.status == 1) {
                    setFetchAccountName(res.data.accountName);
                } else {
                    Swal.fire({
                        title: "Erreur",
                        text: res.data.msg,
                        icon: "error",
                        timer: 3000,
                        confirmButtonText: "Okay",
                    });
                }
                // console.log("Tab key pressed on input");
                // Ajoutez ici votre logique personnalisée
            }
        };

        // Vérifiez si la référence est définie et ajoutez l'écouteur d'événements à l'élément d'entrée
        const inputElement = inputRef.current;
        if (inputElement) {
            inputElement.addEventListener("keydown", handleKeyDown);
        }

        // Nettoyez l'écouteur d'événements lorsque le composant est démonté
        return () => {
            if (inputElement) {
                inputElement.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [sous_groupe_compte]); // Ajoutez `sous_groupe_compte` dans les dépendances si nécessaire
    let compteur = 1;
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
                            <i className="fas fa-chart-pie" style={{ fontSize: "28px", color: "white" }}></i>
                        </div>
                        <div>
                            <h5 className="text-white fw-bold mb-0">Sommaire des comptes</h5>
                            <small className="text-white-50">Synthèse des soldes par compte</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Loading Overlay */}
    {chargement && (
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
                <small className="text-muted">Génération du rapport</small>
            </div>
        </div>
    )}

   {/* Filtres */}
<div className="row g-4 mb-5">
    {/* Sous-groupe de compte */}
    <div className="col-md-2">
        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-layer-group me-2" style={{ color: "#6366f1" }}></i>
                    Sous-groupe
                </h6>
            </div>
            <div className="card-body pt-2">
                <label className="label-modern">SG/Compte</label>
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control modern-input mb-2"
                    placeholder="Ex: 3300 ou 3301"
                    value={sous_groupe_compte}
                    onChange={(e) => setsous_groupe_compte(e.target.value)}
                />
                <div className="mt-2 p-2 bg-light rounded-3">
                    <small className="text-success fw-semibold" style={{ fontSize:"11px" }}>
                        <i className="fas fa-info-circle me-1"></i>
                        USD: 3300 | CDF: 3301
                    </small>
                    {fetchAccountName && (
                        <div className="mt-1 text-teal fw-bold small">
                            <i className="fas fa-check-circle me-1"></i>
                            {fetchAccountName}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>

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
                        value={date_debut_balance}
                        onChange={(e) => setdate_debut_balance(e.target.value)}
                    />
                </div>
                <div>
                    <label className="label-modern">Date fin</label>
                    <input
                        type="date"
                        className="form-control modern-input"
                        value={date_fin_balance}
                        onChange={(e) => setdate_fin_balance(e.target.value)}
                    />
                </div>
            </div>
        </div>
    </div>

    {/* Conversion */}
    <div className="col-md-2">
        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-exchange-alt me-2" style={{ color: "#6366f1" }}></i>
                    Conversion
                </h6>
            </div>
            <div className="card-body pt-2">
                <div className="form-check mb-2">
                    <input
                        type="radio"
                        className="form-check-input modern-radio"
                        id="rapport_non_converti"
                        value="rapport_non_converti"
                        checked={radioValue === "rapport_non_converti"}
                        onChange={handleRadioChange}
                    />
                    <label className="form-check-label text-secondary" htmlFor="rapport_non_converti">
                        Non converti
                    </label>
                </div>
                <div className="form-check mb-2">
                    <input
                        type="radio"
                        className="form-check-input modern-radio"
                        id="balance_convertie_cdf"
                        value="balance_convertie_cdf"
                        checked={radioValue === "balance_convertie_cdf"}
                        onChange={handleRadioChange}
                        disabled
                    />
                    <label className="form-check-label text-secondary" htmlFor="balance_convertie_cdf">
                        Converti en CDF
                    </label>
                </div>
                <div className="form-check">
                    <input
                        type="radio"
                        className="form-check-input modern-radio"
                        id="balance_convertie_usd"
                        value="balance_convertie_usd"
                        checked={radioValue === "balance_convertie_usd"}
                        onChange={handleRadioChange}
                        disabled
                    />
                    <label className="form-check-label text-secondary" htmlFor="balance_convertie_usd">
                        Converti en USD
                    </label>
                </div>
            </div>
        </div>
    </div>

    {/* Critère solde */}
    <div className="col-md-2">
        <div className="card border-0 shadow-sm rounded-4 h-100 dashboard-card">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h6 className="section-title">
                    <i className="fas fa-filter me-2" style={{ color: "#6366f1" }}></i>
                    Critère solde
                </h6>
            </div>
            <div className="card-body pt-2">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <select
                        className="modern-select"
                        style={{ width: "70px" }}
                        value={critereSolde}
                        onChange={(e) => setCritereSolde(e.target.value)}
                    >
                        <option value="=">=</option>
                        <option value=">">{">"}</option>
                        <option value="<">{"<"}</option>
                        <option value="<=">{"<="}</option>
                        <option value=">=">{">="}</option>
                        <option value="<>">{"<>"}</option>
                    </select>
                    <label className="text-secondary">à</label>
                    <input
                        type="text"
                        className="form-control modern-input"
                        style={{ width: "100px" }}
                        value={critereSoldeAmount}
                        onChange={(e) => setCritereSoldeAmount(e.target.value)}
                    />
                </div>
            </div>
        </div>
    </div>

    {/* Agence + Action (fusionnées) */}
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
                    className="modern-select w-100 mb-3"
                    value={agenceFilter}
                    onChange={(e) => setAgenceFilter(e.target.value)}
                    disabled={userAgences.length <= 1}
                >
                    <option value="current">
                        Agence courante ({currentAgence?.nom_agence || "Non définie"})
                    </option>
                    {userAgences.length > 1 && (
                        <>
                            <option value="all">📊 Toutes mes agences</option>
                            {userAgences.map((agence) => (
                                <option key={agence.id} value={agence.id}>
                                    🏢 {agence.code_agence} - {agence.nom_agence}
                                </option>
                            ))}
                        </>
                    )}
                </select>
                <button
                    onClick={AfficherSommaire}
                    className="btn gradient-btn w-100 py-3 text-white d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
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
    {fetchData && fetchData.length != 0 && (
        <>
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-body p-4">
                    <div id="content-to-download-balance">
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
                                SOMMAIRE DES COMPTES 
                                {radioValue == "rapport_non_converti" && sous_groupe_compte == 3300 && " - UNIQUEMENT EN USD"}
                                {radioValue == "rapport_non_converti" && sous_groupe_compte == 3301 && " - UNIQUEMENT EN CDF"}
                                {radioValue == "balance_convertie_cdf" && " - CONVERTI EN CDF"}
                                {radioValue == "balance_convertie_usd" && " - CONVERTI EN USD"}
                                <br />
                                <small style={{ fontSize: "14px" }}>AU {dateParser(new Date())}</small>
                            </h4>
                        </div>

                        {/* Tableau des comptes */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped" style={{ fontSize: "14px" }}>
                                <thead style={{ backgroundColor: "#1a2632", color: "white" }}>
                                    {radioValue == "rapport_non_converti" ? (
                                        <tr>
                                            <th style={{ textAlign: "center", width: "5%" }}>N°</th>
                                            <th>Numéro Compte</th>
                                            <th>Intitulé du compte</th>
                                            <th style={{ textAlign: "right" }}>Solde au {dateParser(date_debut_balance)}</th>
                                            <th style={{ textAlign: "right" }}>Solde au {dateParser(date_fin_balance)}</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th style={{ textAlign: "center", width: "5%" }}>N°</th>
                                            <th>Numéro Compte</th>
                                            <th>Intitulé du compte</th>
                                            <th style={{ textAlign: "right" }}>
                                                {radioValue == "balance_convertie_cdf" ? "Converti en CDF" : "Converti en USD"}
                                            </th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {currentItems && currentItems.map((res, index) => {
                                        let compteurLocal = (currentPage - 1) * itemsPerPage + index + 1;
                                        return radioValue == "rapport_non_converti" ? (
                                            <tr key={index}>
                                                <td className="text-center fw-bold">{compteurLocal}</td>
                                                <td>{res.NumCompte}</td>
                                                <td>{res.NomCompte}</td>
                                                <td className="text-end">{numberWithSpaces(res.soldeDebut?.toFixed(2))}</td>
                                                <td className="text-end fw-bold">{numberWithSpaces(res.soldeFin?.toFixed(2))}</td>
                                            </tr>
                                        ) : radioValue == "balance_convertie_cdf" ? (
                                            <tr key={index}>
                                                <td className="text-center fw-bold">{compteurLocal}</td>
                                                <td>{res.NumCompte}</td>
                                                <td>{res.NomCompte}</td>
                                                <td className="text-end fw-bold text-success">
                                                    {numberWithSpaces(parseFloat(res.solde_consolide_usd_to_cdf || 0).toFixed(2))}
                                                </td>
                                            </tr>
                                        ) : radioValue == "balance_convertie_usd" ? (
                                            <tr key={index}>
                                                <td className="text-center fw-bold">{compteurLocal}</td>
                                                <td>{res.NumCompte}</td>
                                                <td>{res.NomCompte}</td>
                                                <td className="text-end fw-bold text-success">
                                                    {numberWithSpaces(parseFloat(res.solde_consolide_cdf_to_usd || 0).toFixed(2))}
                                                </td>
                                            </tr>
                                        ) : null;
                                    })}
                                </tbody>
                                {fetchData && radioValue != "balance_convertie_usd" && radioValue != "balance_convertie_cdf" && (
                                    <tfoot style={{ backgroundColor: "#e6f2f9", fontWeight: "bold" }}>
                                        <tr>
                                            <td colSpan="3" className="text-end fw-bold">TOTAL GÉNÉRAL :</td>
                                            <td className="text-end text-danger">{numberWithSpaces(total1?.toFixed(2))}</td>
                                            <td className="text-end text-success">{numberWithSpaces(total2?.toFixed(2))}</td>
                                        </tr>
                                    </tfoot>
                                )}
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
                <button onClick={goToNextPage} disabled={currentPage === totalPages} 
                    className="btn btn-sm" style={{ background: currentPage === totalPages ? "#ccc" : "#20c997", color: "white", borderRadius: "6px", padding: "5px 12px" }}>
                    Suivant<i className="fas fa-chevron-right ms-1"></i>
                </button>
            </div>

            {/* Boutons d'export */}
            <div className="d-flex justify-content-end gap-2 mt-3 mb-4">
                <button onClick={() => radioValue == "balance_convertie_cdf" || radioValue == "balance_convertie_usd"
                    ? exportTableData("main-table-balance") : downloadReport("excel")} 
                    className="btn" style={{ background: "#28a745", color: "white", borderRadius: "8px" }}>
                    <i className="fas fa-file-excel me-2"></i>Exporter en Excel
                </button>
                <button onClick={() => radioValue == "balance_convertie_cdf" || radioValue == "balance_convertie_usd"
                    ? downloadReportConvertie("pdf") : downloadReport("pdf")} 
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
            <p className="text-muted">Aucun compte trouvé pour les critères sélectionnés.</p>
        </div>
    )}

    <div style={{ height: "30px" }}></div>
</div>
    );
};

export default SommaireCompte;
