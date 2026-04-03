import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { EnteteRecu } from "../EnteteRecu";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";
import { EnteteBordereau } from "../EnteteBordereau";
//import "../../styles/style.css";

const RecuDepot = ({ data }) => {
    function Unite(nombre) {
        var unite;
        switch (nombre) {
            case 0:
                unite = "zéro";
                break;
            case 1:
                unite = "un";
                break;
            case 2:
                unite = "deux";
                break;
            case 3:
                unite = "trois";
                break;
            case 4:
                unite = "quatre";
                break;
            case 5:
                unite = "cinq";
                break;
            case 6:
                unite = "six";
                break;
            case 7:
                unite = "sept";
                break;
            case 8:
                unite = "huit";
                break;
            case 9:
                unite = "neuf";
                break;
        } //fin switch
        return unite;
    } //-----------------------------------------------------------------------

    function Dizaine(nombre) {
        let dizaine = "";
        switch (nombre) {
            case 10:
                dizaine = "dix";
                break;
            case 11:
                dizaine = "onze";
                break;
            case 12:
                dizaine = "douze";
                break;
            case 13:
                dizaine = "treize";
                break;
            case 14:
                dizaine = "quatorze";
                break;
            case 15:
                dizaine = "quinze";
                break;
            case 16:
                dizaine = "seize";
                break;
            case 17:
                dizaine = "dix-sept";
                break;
            case 18:
                dizaine = "dix-huit";
                break;
            case 19:
                dizaine = "dix-neuf";
                break;
            case 20:
                dizaine = "vingt";
                break;
            case 30:
                dizaine = "trente";
                break;
            case 40:
                dizaine = "quarante";
                break;
            case 50:
                dizaine = "cinquante";
                break;
            case 60:
                dizaine = "soixante";
                break;
            case 70:
                dizaine = "soixante-dix";
                break;
            case 80:
                dizaine = "quatre-vingt";
                break;
            case 90:
                dizaine = "quatre-vingt-dix";
                break;
        } //fin switch
        return dizaine;
    } //-----------------------------------------------------------------------

    function NumberToLetter(nombre) {
        var i, j, n, quotient, reste, nb;
        var ch;
        var numberToLetter = "";
        //__________________________________

        if (nombre.toString().replace(/ /gi, "").length > 15)
            return "dépassement de capacité";
        if (isNaN(nombre.toString().replace(/ /gi, "")))
            return "Nombre non valide";

        nb = parseFloat(nombre.toString().replace(/ /gi, ""));
        if (Math.ceil(nb) != nb) return "Nombre avec virgule non géré.";

        n = nb.toString().length;
        switch (n) {
            case 1:
                numberToLetter = Unite(nb);
                break;
            case 2:
                if (nb > 19) {
                    quotient = Math.floor(nb / 10);
                    reste = nb % 10;
                    if (nb < 71 || (nb > 79 && nb < 91)) {
                        if (reste == 0) numberToLetter = Dizaine(quotient * 10);
                        if (reste == 1)
                            numberToLetter =
                                Dizaine(quotient * 10) + "-et-" + Unite(reste);
                        if (reste > 1)
                            numberToLetter =
                                Dizaine(quotient * 10) + "-" + Unite(reste);
                    } else
                        numberToLetter =
                            Dizaine((quotient - 1) * 10) +
                            "-" +
                            Dizaine(10 + reste);
                } else numberToLetter = Dizaine(nb);
                break;
            case 3:
                quotient = Math.floor(nb / 100);
                reste = nb % 100;
                if (quotient == 1 && reste == 0) numberToLetter = "cent";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "cent" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = Unite(quotient) + " cents";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        Unite(quotient) + " cent " + NumberToLetter(reste);
                break;
            case 4:
                quotient = Math.floor(nb / 1000);
                reste = nb - quotient * 1000;
                if (quotient == 1 && reste == 0) numberToLetter = "mille";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "mille" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " mille";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " mille " +
                        NumberToLetter(reste);
                break;
            case 5:
                quotient = Math.floor(nb / 1000);
                reste = nb - quotient * 1000;
                if (quotient == 1 && reste == 0) numberToLetter = "mille";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "mille" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " mille";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " mille " +
                        NumberToLetter(reste);
                break;
            case 6:
                quotient = Math.floor(nb / 1000);
                reste = nb - quotient * 1000;
                if (quotient == 1 && reste == 0) numberToLetter = "mille";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "mille" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " mille";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " mille " +
                        NumberToLetter(reste);
                break;
            case 7:
                quotient = Math.floor(nb / 1000000);
                reste = nb % 1000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un million";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "un million" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " millions";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " millions " +
                        NumberToLetter(reste);
                break;
            case 8:
                quotient = Math.floor(nb / 1000000);
                reste = nb % 1000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un million";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "un million" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " millions";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " millions " +
                        NumberToLetter(reste);
                break;
            case 9:
                quotient = Math.floor(nb / 1000000);
                reste = nb % 1000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un million";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "un million" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " millions";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " millions " +
                        NumberToLetter(reste);
                break;
            case 10:
                quotient = Math.floor(nb / 1000000000);
                reste = nb - quotient * 1000000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
                if (quotient == 1 && reste != 0)
                    numberToLetter =
                        "un milliard" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " milliards";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " milliards " +
                        NumberToLetter(reste);
                break;
            case 11:
                quotient = Math.floor(nb / 1000000000);
                reste = nb - quotient * 1000000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
                if (quotient == 1 && reste != 0)
                    numberToLetter =
                        "un milliard" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " milliards";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " milliards " +
                        NumberToLetter(reste);
                break;
            case 12:
                quotient = Math.floor(nb / 1000000000);
                reste = nb - quotient * 1000000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un milliard";
                if (quotient == 1 && reste != 0)
                    numberToLetter =
                        "un milliard" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " milliards";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " milliards " +
                        NumberToLetter(reste);
                break;
            case 13:
                quotient = Math.floor(nb / 1000000000000);
                reste = nb - quotient * 1000000000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un billion";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "un billion" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " billions";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " billions " +
                        NumberToLetter(reste);
                break;
            case 14:
                quotient = Math.floor(nb / 1000000000000);
                reste = nb - quotient * 1000000000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un billion";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "un billion" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " billions";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " billions " +
                        NumberToLetter(reste);
                break;
            case 15:
                quotient = Math.floor(nb / 1000000000000);
                reste = nb - quotient * 1000000000000;
                if (quotient == 1 && reste == 0) numberToLetter = "un billion";
                if (quotient == 1 && reste != 0)
                    numberToLetter = "un billion" + " " + NumberToLetter(reste);
                if (quotient > 1 && reste == 0)
                    numberToLetter = NumberToLetter(quotient) + " billions";
                if (quotient > 1 && reste != 0)
                    numberToLetter =
                        NumberToLetter(quotient) +
                        " billions " +
                        NumberToLetter(reste);
                break;
        } //fin switch
        /*respect de l'accord de quatre-vingt*/
        if (
            numberToLetter.substr(
                numberToLetter.length - "quatre-vingt".length,
                "quatre-vingt".length,
            ) == "quatre-vingt"
        )
            numberToLetter = numberToLetter + "s";

        return numberToLetter;
    } //-----------------------------------------------------------------------

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

    // const exportToPDF = () => {
    //     const content = document.getElementById("modal-to-print");

    //     if (!content) {
    //         console.error("Element not found!");
    //         return;
    //     }

    //     html2canvas(content, { scale: 3 })
    //         .then((canvas) => {
    //             const imgData = canvas.toDataURL("image/png");
    //             const pdf = new jsPDF("p", "mm", "a4");

    //             const pdfWidth = pdf.internal.pageSize.getWidth();
    //             const pdfHeight = pdf.internal.pageSize.getHeight();
    //             const imgProps = pdf.getImageProperties(imgData);
    //             const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    //             let heightLeft = imgHeight;
    //             let position = 0;

    //             pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    //             heightLeft -= pdfHeight;

    //             while (heightLeft >= 0) {
    //                 position = heightLeft - imgHeight;
    //                 pdf.addPage();
    //                 pdf.addImage(
    //                     imgData,
    //                     "PNG",
    //                     0,
    //                     position,
    //                     pdfWidth,
    //                     imgHeight,
    //                 );
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
    //     const content = document.getElementById("modal-to-print");

    //     if (!content) {
    //         console.error("Element not found!");
    //         return;
    //     }

    //     const printWindow = window.open("", "_blank");

    //     printWindow.document.write(`
    //     <html>
    //         <head>
    //             <title>Reçu</title>
    //              <meta charset="UTF-8">
    //              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    //             <style>
    //                 @media print {
    //                     @page {
    //                         size: 80mm auto;
    //                         margin: 0;
    //                     }

    //                     html, body {
    //                         width: 80mm;
    //                         margin: 0 auto !important;
    //                         padding: 0;
    //                         background: white;
    //                         font-size: 14px;  /* Augmenté */
    //                         text-align: center;
    //                          display: flex;
    //                          justify-content: center;
    //                     }

    //                      /* Forcer la taille */
    //                     * {
    //                         font-size: 14px !important;
    //                     }

    //                     .print-pos {
    //                         width: 130mm;        /* Plus large que la page */
    //                         margin-left: -5mm;   /* Décalage vers la gauche */
    //                         margin-right: 0;
    //                         margin: 0 auto !important;
    //                         padding: 2mm;
    //                         font-family: 'Courier New', monospace;
    //                         background: white;
    //                           font-size: 12pt;  /* 1pt = 1/72 inch - plus fiable pour l'impression */
    //                           border: 2px solid red;  /* Voir la boîte */

    //                           }

    //                     /* Force le centrage */
    //                     .row, .card, .card-body, div[class*="col-"] {
    //                         width: 100% !important;
    //                         margin: 0 auto !important;
    //                         padding: 2px 0 !important;
    //                     }

    //                     .logo-container {
    //                         width: 100% !important;
    //                         text-align: center !important;
    //                     }

    //                     h5 {
    //                         width: 100% !important;
    //                         font-size: 14pt !important;
    //                         margin: 3px 0 !important;
    //                         padding: 3px !important;
    //                         background: #eee !important;
    //                         text-align: center !important;
    //                     }

    //                     table {
    //                         width: 100% !important;
    //                         border-collapse: collapse;
    //                         margin: 2px 0 !important;
    //                     }

    //                     td, th {
    //                         padding: 4pt 2pt !important;
    //                         font-size: 14pt !important;
    //                     }

    //                     td:last-child, th:last-child {
    //                         text-align: right !important;
    //                     }

    //                     hr {
    //                         border: none !important;
    //                         border-top: 1px dashed #000 !important;
    //                         margin: 3px 0 !important;
    //                         width: 100% !important;
    //                     }

    //                     /* Correction du montant en lettres */
    //                     div[style*="textAlign: 'center'"] {
    //                         text-align: center !important;
    //                     }
    //                      /* Forcer tous les conteneurs à prendre toute la largeur */
    // .row, .card, .card-body, div[class*="col-"] {
    //     width: 100% !important;
    //     margin: 0 !important;
    //     padding: 2px 0 !important;
    // }

    // /* Centrer le texte si nécessaire */
    // h5, .text-center {
    //     text-align: center !important;
    // }
    //                 }

    //             </style>
    //         </head>
    //         <body style="margin: 0 auto; text-align: center; display: flex; justify-content: center;">
    //             <div style="text-align: left; width: fit-content;">
    //                 ${content.outerHTML}
    //             </div>
    //         </body>
    //     </html>
    // `);

    //     printWindow.document.close();
    //     printWindow.focus();

    //     setTimeout(() => {
    //         printWindow.print();
    //         printWindow.close();
    //     }, 250);
    // };
    const exportToPDF = () => {
        const content = document.getElementById("modal-to-print");

        if (!content) {
            console.error("Element not found!");
            return;
        }

        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
        <html>
           <head>
                <title>Reçu</title>
                 <meta charset="UTF-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        
                        html, body {
                            width: 80mm;
                            margin: 0 auto !important;
                            padding: 0;
                            background: white;
                            font-size: 14px;
                            text-align: center;
                            display: flex;
                            justify-content: center;
                        }

                        /* Forcer la taille */
                        * {
                            font-size: 14px !important;
                        }
                        
                        .print-pos {
                            width: 130mm;
                            margin-left: -5mm;
                            margin-right: 0;
                            margin: 0 auto !important;
                            padding: 2mm;
                            font-family: 'Courier New', monospace;
                            background: white;
                            font-size: 12pt;
                            border: 2px solid #444;  /* UNE SEULE bordure ici */
                            border-radius: 3px;
                        }
                        
                        
                        /* Garder uniquement les lignes de séparation légères dans les tableaux */
                        table {
                            width: 100% !important;
                            border-collapse: collapse;
                            margin: 2px 0 !important;
                         
                        }
                        
                        td, th {
                            padding: 4pt 2pt !important;
                            font-size: 14pt !important;
                       
                            border-bottom: 1px dashed #aaa !important;  /* Seulement lignes horizontales */
                        }
                        
                        tr:last-child td {
                            border-bottom: none !important;  /* Pas de ligne après la dernière ligne */
                        }
                        
                        td:last-child, th:last-child {
                            text-align: right !important;
                        }
                        
                        /* Style pour le titre */
                        h5 {
                            width: 100% !important;
                            font-size: 14pt !important;
                            margin: 3px 0 !important;
                            padding: 3px !important;
                            background: #eee !important;
                            text-align: center !important;
                
                        }
                        
                        /* Style pour l'espace entre les reçus */
                        .receipt-spacer {
                            height: 20mm;
                            width: 100%;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            page-break-inside: avoid;
                            margin: 0;
                            padding: 0;
                        }
                        
                        .dashed-line {
                            width: 80%;
                            border-top: 1px dashed #444;
                            margin: 2mm 0;
                        }
                        
                        .cut-text {
                            font-size: 10px;
                            color: #444;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            font-weight: bold;
                        }
                        
                        /* Style pour la signature */
                        table:last-of-type td {
                            border: 1px solid #444 !important;
                            background-color: #f9f9f9;
                        }
                        
                        /* Supprimer les bordures des conteneurs internes */
                        .ticket-header, .line, .separator {
                            border: none !important;
                        }
                        
                        /* Pour l'entête du reçu (si vous avez une classe entete-recu) */
                        .entete-recu, [class*="entete"] {
                            border: none !important;
                            background: transparent !important;
                        }
                    }
                </style>
            </head>
            <body style="margin: 0 auto; text-align: center; display: flex; justify-content: center;">
                <div style="text-align: left; width: fit-content;">
                    <!-- Premier reçu -->
                    <div class="print-pos">
                        ${content.outerHTML}
                    </div>
                    
                    <!-- Espace avec ligne COUPEZ ICI -->
                    <div class="receipt-spacer">
                        <div class="dashed-line"></div>
                        <div class="cut-text">✂️ • • • • COUPEZ ICI • • • • ✂️</div>
                        <div class="dashed-line"></div>
                    </div>
                    
                    <!-- Second reçu -->
                    <div class="print-pos">
                        ${content.outerHTML}
                    </div>
                </div>
            </body>
        </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    const cellStyle = {
        paddingTop: "5px",
        paddingBottom: "5px",
        lineHeight: "1",
    };

    // Fonction pour obtenir le premier mot et la première lettre du deuxième mot
    const getShortenedName = (name) => {
        const words = name.split(" ");
        if (words.length > 1) {
            return `${words[0]} ${words[1][0]}`;
        }
        return name; // Retourne le nom original s'il n'y a pas de deuxième mot
    };

    // const printTicket = () => {
    //     window.print();
    // };
    return (
        <>
            <div
                className="modal fade card-body h-200"
                id="modal-delestage-cdf"
                style={{
                    background: "#dcdcdc",
                }}
            >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            {/* <h4
                                style={{ color: "#000" }}
                                className="modal-title"
                            >
                                Recu appro {data.Reference}
                               
                            </h4> */}
                            <button
                                type="button"
                                class="close"
                                data-dismiss="modal"
                                aria-label="Close"
                                // onClick={clearData}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div
                            className="modal-body print-pos"
                            id="modal-to-print"
                        >
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="row" id="printme">
                                        <div
                                            className="card"
                                            style={{
                                                width: "100%",
                                                margin: "0",
                                                padding: "0",
                                            }}
                                        >
                                            <div
                                                className="logo-container"
                                                style={{
                                                    width: "100%",
                                                    textAlign: "left",
                                                }}
                                            >
                                                <br />
                                                <div className="h-130 d-flex align-items-left justify-content-left">
                                                    <EnteteBordereau />
                                                </div>
                                            </div>

                                            {data.montantEntre > 0 ? (
                                                <>
                                                    {/* Titre BORDERAUX DE DEPOT */}
                                                    <div
                                                        className="row"
                                                        style={{
                                                            width: "100%",
                                                            textAlign: "center",
                                                            marginTop: "5px",
                                                        }}
                                                    >
                                                        <h5
                                                            style={{
                                                                background:
                                                                    "#dcdcdc",
                                                                padding: "5px",
                                                                color: "#000",
                                                                fontSize:
                                                                    "14px",
                                                                margin: "0 auto",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            BORDERAUX DE DEPOT
                                                            N°{" "}
                                                            {data.refOperation}
                                                        </h5>
                                                    </div>

                                                    {/* Entête du reçu */}
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            margin: "5px 0",
                                                        }}
                                                    >
                                                        <div
                                                            className="row entete-recu"
                                                            style={{
                                                                width: "100%",
                                                                background:
                                                                    "#dcdcdc",
                                                                padding: "5px",
                                                                color: "#000",
                                                                border: "1px solid #444",
                                                                borderRadius:
                                                                    "3px",
                                                                margin: "0",
                                                            }}
                                                        >
                                                            <div className="col-md-12">
                                                                <div
                                                                    className="ticket-header p-2"
                                                                    style={{
                                                                        fontSize:
                                                                            "18px",
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="line"
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            margin: "2px 0",
                                                                        }}
                                                                    >
                                                                        <strong>
                                                                            N°
                                                                            Compte
                                                                            :
                                                                        </strong>{" "}
                                                                        {
                                                                            data.NumCompte
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className="line"
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            margin: "2px 0",
                                                                        }}
                                                                    >
                                                                        <strong>
                                                                            Compte
                                                                            abrégé
                                                                            :
                                                                        </strong>{" "}
                                                                        {
                                                                            data.NumAbrege
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className="line"
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            margin: "2px 0",
                                                                        }}
                                                                    >
                                                                        <strong>
                                                                            Intitulé
                                                                            :
                                                                        </strong>{" "}
                                                                        {getShortenedName(
                                                                            data.NomMembre,
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        className="separator"
                                                                        style={{
                                                                            height: "2px",
                                                                        }}
                                                                    ></div>
                                                                    <div
                                                                        className="line"
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            margin: "2px 0",
                                                                        }}
                                                                    >
                                                                        <strong>
                                                                            Motif
                                                                            :
                                                                        </strong>{" "}
                                                                        {
                                                                            data.Motif
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className="line"
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            margin: "2px 0",
                                                                        }}
                                                                    >
                                                                        <strong>
                                                                            Devise
                                                                            :
                                                                        </strong>{" "}
                                                                        {
                                                                            data.Devise
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* BILLETAGE */}
                                                        <div
                                                            align="left"
                                                            style={{
                                                                marginLeft: "0",
                                                                fontWeight:
                                                                    "bold",
                                                                fontSize:
                                                                    "12px",
                                                                marginTop:
                                                                    "5px",
                                                            }}
                                                        >
                                                            BILLETAGE
                                                        </div>

                                                        {/* Corps du reçu avec tableau */}
                                                        <div
                                                            className="row corp-recu"
                                                            style={{
                                                                width: "100%",
                                                                background:
                                                                    "#DCDCDC",
                                                                padding: "5px",
                                                                color: "#000",
                                                                border: "1px solid #444",
                                                                borderRadius:
                                                                    "3px",
                                                                margin: "5px 0",
                                                            }}
                                                        >
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    fontSize:
                                                                        "11px",
                                                                }}
                                                            >
                                                                <thead>
                                                                    <tr
                                                                        style={{
                                                                            borderBottom:
                                                                                "1px solid #000",
                                                                        }}
                                                                    >
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "3px",
                                                                                textAlign:
                                                                                    "left",
                                                                            }}
                                                                        >
                                                                            NbrBillets
                                                                        </th>
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "3px",
                                                                                textAlign:
                                                                                    "left",
                                                                            }}
                                                                        >
                                                                            Coupure
                                                                        </th>
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "3px",
                                                                                textAlign:
                                                                                    "right",
                                                                            }}
                                                                        >
                                                                            Total
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                {data.Devise ==
                                                                "CDF" ? (
                                                                    <tbody>
                                                                        {parseInt(
                                                                            data.vightMilleFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightMilleFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    20000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightMilleFranc,
                                                                                    ) *
                                                                                        20000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.dixMilleFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixMilleFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    10000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixMilleFranc,
                                                                                    ) *
                                                                                        10000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinqMilleFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqMilleFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    5000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqMilleFranc,
                                                                                    ) *
                                                                                        5000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.milleFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.milleFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    1000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.milleFranc,
                                                                                    ) *
                                                                                        1000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinqCentFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqCentFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    500
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqCentFranc,
                                                                                    ) *
                                                                                        500}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.deuxCentFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.deuxCentFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    200
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.deuxCentFranc,
                                                                                    ) *
                                                                                        200}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.centFranc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centFranc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    100
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centFranc,
                                                                                    ) *
                                                                                        100}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinquanteFanc,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteFanc,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    50
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteFanc,
                                                                                    ) *
                                                                                        50}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        <tr
                                                                            style={{
                                                                                borderTop:
                                                                                    "1px solid #000",
                                                                                fontWeight:
                                                                                    "bold",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                colSpan="2"
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                }}
                                                                            >
                                                                                Total
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                    textAlign:
                                                                                        "right",
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                {parseInt(
                                                                                    data.montantEntre,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : data.Devise ==
                                                                  "USD" ? (
                                                                    <tbody>
                                                                        {parseInt(
                                                                            data.centDollars,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centDollars,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    100
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centDollars,
                                                                                    ) *
                                                                                        100}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinquanteDollars,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteDollars,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    50
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteDollars,
                                                                                    ) *
                                                                                        50}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.vightDollars,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightDollars,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    20
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightDollars,
                                                                                    ) *
                                                                                        20}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.dixDollars,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixDollars,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    10
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixDollars,
                                                                                    ) *
                                                                                        10}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinqDollars,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqDollars,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    5
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqDollars,
                                                                                    ) *
                                                                                        5}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.unDollars,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.unDollars,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    1
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.unDollars,
                                                                                    ) *
                                                                                        1}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        <tr
                                                                            style={{
                                                                                borderTop:
                                                                                    "1px solid #000",
                                                                                fontWeight:
                                                                                    "bold",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                colSpan="2"
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                }}
                                                                            >
                                                                                Total
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                    textAlign:
                                                                                        "right",
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                {parseInt(
                                                                                    data.montantEntre,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : null}
                                                            </table>

                                                            {/* Montant en lettres */}
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "5px",
                                                                    fontSize:
                                                                        "9px",
                                                                    textAlign:
                                                                        "center",
                                                                    padding:
                                                                        "2px",
                                                                }}
                                                            >
                                                                Nous disons{" "}
                                                                {data.Devise ==
                                                                "CDF"
                                                                    ? "CDF"
                                                                    : "USD"}
                                                                <b>
                                                                    {" "}
                                                                    {NumberToLetter(
                                                                        data.montantEntre,
                                                                    )}{" "}
                                                                    {data.Devise ==
                                                                    "CDF"
                                                                        ? "Francs congolais"
                                                                        : "Dollars américains"}
                                                                </b>
                                                            </div>

                                                            <hr
                                                                style={{
                                                                    border: "1px dashed #000",
                                                                    width: "100%",
                                                                    margin: "3px 0",
                                                                }}
                                                            />

                                                            {/* Dates */}
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "9px",
                                                                    margin: "2px 0",
                                                                }}
                                                            >
                                                                Date valeur :{" "}
                                                                {dateParser(
                                                                    data.DateTransaction,
                                                                )}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "9px",
                                                                    margin: "2px 0",
                                                                }}
                                                            >
                                                                Fait à Goma le{" "}
                                                                {dateParser(
                                                                    data.DateTransaction,
                                                                )}{" "}
                                                                à{" "}
                                                                {
                                                                    data.created_at
                                                                        .split(
                                                                            "T",
                                                                        )[1]
                                                                        .split(
                                                                            ".",
                                                                        )[0]
                                                                }
                                                            </div>

                                                            {/* Signatures */}
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    marginTop:
                                                                        "5px",
                                                                    fontSize:
                                                                        "9px",
                                                                }}
                                                            >
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            border: "2px solid #000",
                                                                            padding:
                                                                                "20px 8px", // Encore plus d'espace
                                                                            textAlign:
                                                                                "center",
                                                                            width: "50%",
                                                                            fontSize:
                                                                                "16px", // Police encore plus grande
                                                                            fontWeight:
                                                                                "bold",
                                                                            backgroundColor:
                                                                                "#f9f9f9",
                                                                            lineHeight:
                                                                                "1.5", // Hauteur de ligne augmentée
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            Signature
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "18px",
                                                                                marginTop:
                                                                                    "5px",
                                                                            }}
                                                                        >
                                                                            {
                                                                                data.NomUtilisateur
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            border: "2px solid #000",
                                                                            padding:
                                                                                "20px 8px",
                                                                            textAlign:
                                                                                "center",
                                                                            width: "50%",
                                                                            fontSize:
                                                                                "16px",
                                                                            fontWeight:
                                                                                "bold",
                                                                            backgroundColor:
                                                                                "#f9f9f9",
                                                                            lineHeight:
                                                                                "1.5",
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            Signature
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "18px",
                                                                                marginTop:
                                                                                    "5px",
                                                                            }}
                                                                        >
                                                                            <i>
                                                                                {
                                                                                    data.Beneficiaire
                                                                                }
                                                                            </i>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : data.montantSortie > 0 ? (
                                                <>
                                                    {/* Titre BORDERAUX DE RETRAIT */}
                                                    <div
                                                        className="row"
                                                        style={{
                                                            width: "100%",
                                                            textAlign: "center",
                                                            marginTop: "5px",
                                                        }}
                                                    >
                                                        <h5
                                                            style={{
                                                                background:
                                                                    "#dcdcdc",
                                                                padding: "5px",
                                                                color: "#000",
                                                                fontSize:
                                                                    "14px",
                                                                margin: "0 auto",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            BORDERAUX DE RETRAIT
                                                            N°{" "}
                                                            {data.refOperation}
                                                        </h5>
                                                    </div>

                                                    {/* Entête du reçu avec tableau */}
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            margin: "5px 0",
                                                        }}
                                                    >
                                                        <div
                                                            className="row entete-recu"
                                                            style={{
                                                                width: "100%",
                                                                background:
                                                                    "#dcdcdc",
                                                                padding: "5px",
                                                                color: "#000",
                                                                border: "1px solid #444",
                                                                borderRadius:
                                                                    "3px",
                                                                margin: "0",
                                                            }}
                                                        >
                                                            <div className="col-md-12">
                                                                <table
                                                                    className="table p-0"
                                                                    style={{
                                                                        width: "100%",
                                                                        borderCollapse:
                                                                            "collapse",
                                                                    }}
                                                                >
                                                                    <tbody>
                                                                        <tr
                                                                            style={{
                                                                                lineHeight:
                                                                                    "1.2",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    N°
                                                                                    Compte
                                                                                    :
                                                                                </strong>
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    data.NumCompte
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                        <tr
                                                                            style={{
                                                                                lineHeight:
                                                                                    "1.2",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    Compte
                                                                                    abrégé
                                                                                    :
                                                                                </strong>
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    data.NumAbrege
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                        <tr
                                                                            style={{
                                                                                lineHeight:
                                                                                    "1.2",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    Intitulé
                                                                                    :
                                                                                </strong>
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                {getShortenedName(
                                                                                    data.NomMembre,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                        <tr
                                                                            style={{
                                                                                lineHeight:
                                                                                    "1.2",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    Bénéficiaire
                                                                                    :
                                                                                </strong>
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                {getShortenedName(
                                                                                    data.Beneficiaire,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                        <tr
                                                                            style={{
                                                                                lineHeight:
                                                                                    "1.2",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    Dévise
                                                                                    :
                                                                                </strong>
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    border: "none",
                                                                                    padding:
                                                                                        "2px 0",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                }}
                                                                            >
                                                                                {data.Devise ===
                                                                                "CDF"
                                                                                    ? "CDF"
                                                                                    : "USD"}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* BILLETAGE */}
                                                        <div
                                                            align="left"
                                                            style={{
                                                                marginLeft: "0",
                                                                fontWeight:
                                                                    "bold",
                                                                fontSize:
                                                                    "12px",
                                                                marginTop:
                                                                    "5px",
                                                            }}
                                                        >
                                                            BILLETAGE
                                                        </div>

                                                        {/* Corps du reçu avec tableau */}
                                                        <div
                                                            className="row corp-recu"
                                                            style={{
                                                                width: "100%",
                                                                background:
                                                                    "#DCDCDC",
                                                                padding: "5px",
                                                                color: "#000",
                                                                border: "1px solid #444",
                                                                borderRadius:
                                                                    "3px",
                                                                margin: "5px 0",
                                                            }}
                                                        >
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    fontSize:
                                                                        "11px",
                                                                }}
                                                            >
                                                                <thead>
                                                                    <tr
                                                                        style={{
                                                                            borderBottom:
                                                                                "1px solid #000",
                                                                        }}
                                                                    >
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "3px",
                                                                                textAlign:
                                                                                    "left",
                                                                            }}
                                                                        >
                                                                            NbrBillets
                                                                        </th>
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "3px",
                                                                                textAlign:
                                                                                    "left",
                                                                            }}
                                                                        >
                                                                            Coupure
                                                                        </th>
                                                                        <th
                                                                            style={{
                                                                                padding:
                                                                                    "3px",
                                                                                textAlign:
                                                                                    "right",
                                                                            }}
                                                                        >
                                                                            Total
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                {data.Devise ===
                                                                "CDF" ? (
                                                                    <tbody>
                                                                        {parseInt(
                                                                            data.vightMilleFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightMilleFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    20000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightMilleFrancSortie,
                                                                                    ) *
                                                                                        20000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.dixMilleFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixMilleFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    10000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixMilleFrancSortie,
                                                                                    ) *
                                                                                        10000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinqMilleFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqMilleFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    5000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqMilleFrancSortie,
                                                                                    ) *
                                                                                        5000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.milleFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.milleFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    1000
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.milleFrancSortie,
                                                                                    ) *
                                                                                        1000}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinqCentFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqCentFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    500
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqCentFrancSortie,
                                                                                    ) *
                                                                                        500}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.deuxCentFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.deuxCentFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    200
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.deuxCentFrancSortie,
                                                                                    ) *
                                                                                        200}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.centFrancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centFrancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    100
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centFrancSortie,
                                                                                    ) *
                                                                                        100}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinquanteFancSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteFancSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    50
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteFancSortie,
                                                                                    ) *
                                                                                        50}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        <tr
                                                                            style={{
                                                                                borderTop:
                                                                                    "1px solid #000",
                                                                                fontWeight:
                                                                                    "bold",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                colSpan="2"
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                }}
                                                                            >
                                                                                Total
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                    textAlign:
                                                                                        "right",
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                {parseInt(
                                                                                    data.montantSortie,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : data.Devise ===
                                                                  "USD" ? (
                                                                    <tbody>
                                                                        {parseInt(
                                                                            data.centDollarsSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centDollarsSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    100
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.centDollarsSortie,
                                                                                    ) *
                                                                                        100}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinquanteDollarsSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteDollarsSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    50
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinquanteDollarsSortie,
                                                                                    ) *
                                                                                        50}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.vightDollarsSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightDollarsSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    20
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.vightDollarsSortie,
                                                                                    ) *
                                                                                        20}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.dixDollarsSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixDollarsSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    10
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.dixDollarsSortie,
                                                                                    ) *
                                                                                        10}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.cinqDollarsSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqDollarsSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    5
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.cinqDollarsSortie,
                                                                                    ) *
                                                                                        5}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        {parseInt(
                                                                            data.unDollarsSortie,
                                                                        ) >
                                                                            0 && (
                                                                            <tr
                                                                                style={{
                                                                                    lineHeight:
                                                                                        "1.2",
                                                                                }}
                                                                            >
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.unDollarsSortie,
                                                                                    )}
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                    }}
                                                                                >
                                                                                    X
                                                                                    1
                                                                                </td>
                                                                                <td
                                                                                    style={{
                                                                                        padding:
                                                                                            "2px 3px",
                                                                                        textAlign:
                                                                                            "right",
                                                                                    }}
                                                                                >
                                                                                    {parseInt(
                                                                                        data.unDollarsSortie,
                                                                                    ) *
                                                                                        1}
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                        <tr
                                                                            style={{
                                                                                borderTop:
                                                                                    "1px solid #000",
                                                                                fontWeight:
                                                                                    "bold",
                                                                            }}
                                                                        >
                                                                            <td
                                                                                colSpan="2"
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                }}
                                                                            >
                                                                                Total
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    padding:
                                                                                        "3px",
                                                                                    textAlign:
                                                                                        "right",
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                {parseInt(
                                                                                    data.montantSortie,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                ) : null}
                                                            </table>

                                                            {/* Montant en lettres */}
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "5px",
                                                                    fontSize:
                                                                        "9px",
                                                                    textAlign:
                                                                        "center",
                                                                    padding:
                                                                        "2px",
                                                                }}
                                                            >
                                                                Nous disons{" "}
                                                                {data.Devise ===
                                                                "CDF"
                                                                    ? "CDF"
                                                                    : "USD"}
                                                                <b>
                                                                    {" "}
                                                                    {NumberToLetter(
                                                                        data.montantSortie,
                                                                    )}{" "}
                                                                    {data.Devise ===
                                                                    "CDF"
                                                                        ? "Francs congolais"
                                                                        : "Dollars américains"}
                                                                </b>
                                                            </div>

                                                            <hr
                                                                style={{
                                                                    border: "1px dashed #000",
                                                                    width: "100%",
                                                                    margin: "3px 0",
                                                                }}
                                                            />

                                                            {/* Dates */}
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "9px",
                                                                    margin: "2px 0",
                                                                }}
                                                            >
                                                                Date valeur :{" "}
                                                                {dateParser(
                                                                    data.DateTransaction,
                                                                )}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "9px",
                                                                    margin: "2px 0",
                                                                }}
                                                            >
                                                                Fait à Goma le{" "}
                                                                {dateParser(
                                                                    data.DateTransaction,
                                                                )}{" "}
                                                                à{" "}
                                                                {
                                                                    data.created_at
                                                                        .split(
                                                                            "T",
                                                                        )[1]
                                                                        .split(
                                                                            ".",
                                                                        )[0]
                                                                }
                                                            </div>

                                                            {/* Signatures */}
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    marginTop:
                                                                        "5px",
                                                                    fontSize:
                                                                        "9px",
                                                                }}
                                                            >
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            border: "2px solid #000",
                                                                            padding:
                                                                                "20px 8px",
                                                                            textAlign:
                                                                                "center",
                                                                            width: "50%",
                                                                            fontSize:
                                                                                "16px",
                                                                            fontWeight:
                                                                                "bold",
                                                                            backgroundColor:
                                                                                "#f9f9f9",
                                                                            lineHeight:
                                                                                "1.5",
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            Signature
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "18px",
                                                                                marginTop:
                                                                                    "5px",
                                                                            }}
                                                                        >
                                                                            {
                                                                                data.NomUtilisateur
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            border: "2px solid #000",
                                                                            padding:
                                                                                "20px 8px",
                                                                            textAlign:
                                                                                "center",
                                                                            width: "50%",
                                                                            fontSize:
                                                                                "16px",
                                                                            fontWeight:
                                                                                "bold",
                                                                            backgroundColor:
                                                                                "#f9f9f9",
                                                                            lineHeight:
                                                                                "1.5",
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            Signature
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                fontSize:
                                                                                    "18px",
                                                                                marginTop:
                                                                                    "5px",
                                                                            }}
                                                                        >
                                                                            <i>
                                                                                {
                                                                                    data.Beneficiaire
                                                                                }
                                                                            </i>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer justify-content-between">
                            {/* <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Sav changes</button> */}
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={exportToPDF}
                            >
                                Imprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default RecuDepot;
