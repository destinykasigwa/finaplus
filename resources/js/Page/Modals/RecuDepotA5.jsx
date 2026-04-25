import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { EnteteRecu } from "../EnteteRecu";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";
import { EnteteBordereau } from "../EnteteBordereau";
import JsBarcode from "jsbarcode";
import Barcode from "./Barcode";

//import "../../styles/style.css";

const RecuDepotA5 = ({ data }) => {
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

    const exportToPDF = () => {
        const content = document.getElementById("modal-to-print");
        if (!content) return;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reçu A5</title>
            <style>
               @media print {
    @page {
        size: A5 landscape;
        margin: 3mm;
        /* Supprimer les numéros de page */
        @bottom-right { content: none; }
        @top-right { content: none; }
    }
    body {
        margin: 0;
        padding: 0;
        background: white;
        font-family: 'Courier New', monospace;
    }
    .a5-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 3mm;
        width: 100%;
        /* Éviter que le conteneur ne se coupe */
        page-break-inside: avoid;
    }
    .print-pos {
        width: 48%;
        padding: 1mm;
        border: 0px solid #aaa;
        border-radius: 1mm;
        background: white;
        page-break-inside: avoid;  /* crucial : chaque reçu reste entier */
        font-size: 7pt;
        box-sizing: border-box;
        /* PAS de height fixe */
    }
    /* Forcer la largeur complète des enfants */
    .print-pos, .print-pos *,
    #printme, .card, .row, .col-md-12, .modal-body {
        width: 100% !important;
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
    table {
        width: 100% !important;
        border-collapse: collapse;
        font-size: 6pt;
        table-layout: auto;
    }
    th, td {
        padding: 0.5mm !important;
        text-align: left;
        border-bottom: 0.5px dashed #ccc;
    }
    td:last-child, th:last-child {
        text-align: right;
    }
    h5 {
        font-size: 8pt;
        background: #eee;
        padding: 0.5mm;
        margin: 1mm 0;
        text-align: center;
    }
   

    .print-pos {
        page-break-inside: avoid;
        break-inside: avoid;
    }


    .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2mm;
}

.header-right {
    text-align: right;
}

.barcode {
    margin-top: 2px;
}

.header-right svg {
    width: 120px;
    height: 40px;
}

svg {
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
   
}
            </style>
        </head>
        <body>
            <div class="a5-row">
                <div class="print-pos">${content.outerHTML}</div>
                <div class="print-pos">${content.outerHTML}</div>
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
                                                <div className="header-top">
                                                    <div className="left">
                                                        <EnteteBordereau />
                                                    </div>

                                                    <div className="header-right">
                                                        {/* <div style={{ fontSize: "8pt", fontWeight: "bold" }}>
                                                       {data.refOperation}
                                                        </div> */}

                                                        <Barcode
                                                            value={`REC-${data.refOperation}`}
                                                        />
                                                    </div>
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
                                                                // border: "1px solid #444",
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

                                                            {/* Signatures - largeurs égales */}
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    marginTop:
                                                                        "3px",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    tableLayout:
                                                                        "fixed", // force les largeurs de colonnes
                                                                }}
                                                            >
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style={{
                                                                                border: "1px solid #333",
                                                                                padding:
                                                                                    "4px 6px",
                                                                                textAlign:
                                                                                    "center",
                                                                                width: "50%", // première moitié
                                                                                fontSize:
                                                                                    "8pt",
                                                                                fontWeight:
                                                                                    "bold",
                                                                                backgroundColor:
                                                                                    "#f9f9f9",
                                                                                borderRadius:
                                                                                    "2px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    marginBottom:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                Signature
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "9pt",
                                                                                    fontWeight:
                                                                                        "normal",
                                                                                    marginTop:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    data.NomUtilisateur
                                                                                }{" "}
                                                                                {/* caissier */}
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                border: "1px solid #333",
                                                                                padding:
                                                                                    "4px 6px",
                                                                                textAlign:
                                                                                    "center",
                                                                                width: "50%", // seconde moitié
                                                                                fontSize:
                                                                                    "8pt",
                                                                                fontWeight:
                                                                                    "bold",
                                                                                backgroundColor:
                                                                                    "#f9f9f9",
                                                                                borderRadius:
                                                                                    "2px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    marginBottom:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                Signature
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "9pt",
                                                                                    fontWeight:
                                                                                        "normal",
                                                                                    marginTop:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    data.Beneficiaire
                                                                                }{" "}
                                                                                {/* client */}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
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
                                                                // border: "1px solid #444",
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
                                                            {/* <table
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
                                                            </table> */}

                                                             {/* Signatures - largeurs égales */}
                                                            <table
                                                                style={{
                                                                    width: "100%",
                                                                    marginTop:
                                                                        "3px",
                                                                    borderCollapse:
                                                                        "collapse",
                                                                    tableLayout:
                                                                        "fixed", // force les largeurs de colonnes
                                                                }}
                                                            >
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            style={{
                                                                                border: "1px solid #333",
                                                                                padding:
                                                                                    "4px 6px",
                                                                                textAlign:
                                                                                    "center",
                                                                                width: "50%", // première moitié
                                                                                fontSize:
                                                                                    "8pt",
                                                                                fontWeight:
                                                                                    "bold",
                                                                                backgroundColor:
                                                                                    "#f9f9f9",
                                                                                borderRadius:
                                                                                    "2px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    marginBottom:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                Signature
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "9pt",
                                                                                    fontWeight:
                                                                                        "normal",
                                                                                    marginTop:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    data.NomUtilisateur
                                                                                }{" "}
                                                                                {/* caissier */}
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                border: "1px solid #333",
                                                                                padding:
                                                                                    "4px 6px",
                                                                                textAlign:
                                                                                    "center",
                                                                                width: "50%", // seconde moitié
                                                                                fontSize:
                                                                                    "8pt",
                                                                                fontWeight:
                                                                                    "bold",
                                                                                backgroundColor:
                                                                                    "#f9f9f9",
                                                                                borderRadius:
                                                                                    "2px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    marginBottom:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                Signature
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "9pt",
                                                                                    fontWeight:
                                                                                        "normal",
                                                                                    marginTop:
                                                                                        "2px",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    data.Beneficiaire
                                                                                }{" "}
                                                                                {/* client */}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
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
export default RecuDepotA5;
