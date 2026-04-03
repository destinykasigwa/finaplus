import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { EnteteRecu } from "../EnteteRecu";
import { jsPDF } from "jspdf";
import * as FileSaver from "file-saver";
import html2canvas from "html2canvas";

const RecuApproUSD = ({ data }) => {
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
                "quatre-vingt".length
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
        const content = document.getElementById("modal-to-print-usd");

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
        });
    };

    const cellStyle = {
        paddingTop: "5px",
        paddingBottom: "5px",
        lineHeight: "1",
    };
    return (
        <>
            <div
                className="modal fade card-body h-200"
                id="modal-appro-usd"
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
                        <div className="modal-body" id="modal-to-print-usd">
                            <div className="row">
                                <div className="col-md-12">
                                    <div
                                    // className="card-body h-200"
                                    // style={{
                                    //     background: "#dcdcdc",
                                    // }}
                                    >
                                        <div className="row" id="printme">
                                            <div
                                                className="card"
                                                style={{
                                                    margin: "5px",
                                                    width: "100%",
                                                }}
                                            >
                                                <div
                                                    className="logo-container"
                                                    style={{
                                                        // margin: "0 auto",
                                                        width: "100%",
                                                    }}
                                                >
                                                    {" "}
                                                    <br />
                                                    <br />
                                                    {/* <div style={{ textAlign: "center" }}><h4><b>ACTION POUR LA PAIX L'EDUCATION ET LE DEFENSE DES DROITS HUMAINS</b></h4></div> */}
                                                    <EnteteRecu />
                                                </div>
                                                <div
                                                    className="row"
                                                    style={{
                                                        // margin: "0px auto",
                                                        marginTop: "5px",
                                                        margin: "auto",
                                                        width: "300px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {" "}
                                                    <h5
                                                        style={{
                                                            background:
                                                                "#dcdcdc",
                                                            padding: "5px",
                                                            color: "#000",
                                                            fontSize: "16px",
                                                            marginBottom:
                                                                "-30px",
                                                            marginLeft: "30px",
                                                            marginRight: "30px",
                                                        }}
                                                    >
                                                        PIECE
                                                        D'APPROVISIONNEMENT N°{" "}
                                                        {data.Reference}
                                                    </h5>{" "}
                                                </div>

                                                <div
                                                    class="card-body"
                                                    style={{
                                                        marginLeft: "2px",
                                                        marginRight: "2px",
                                                        marginTop: "30px",
                                                    }}
                                                >
                                                    <div
                                                        className="row entete-recu"
                                                        style={{
                                                            width: "100%",
                                                            // margin: "0px auto",
                                                            background:
                                                                "#dcdcdc",
                                                            padding: "2px",
                                                            color: "#000",
                                                            border: "1px solid #444",
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >
                                                        <div className="col-md-12">
                                                            <table
                                                                className=""
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            >
                                                                <tr
                                                                    style={{
                                                                        border: "1px solid #fff",
                                                                    }}
                                                                >
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        N°
                                                                        Compte :
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        {" "}
                                                                        {
                                                                            data.NumCompteCaissier
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    style={{
                                                                        border: "1px solid #fff",
                                                                    }}
                                                                >
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        Nom
                                                                        Caissier
                                                                        :
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        {
                                                                            data.NomDemandeur
                                                                        }
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    style={{
                                                                        border: "1px solid #fff",
                                                                    }}
                                                                ></tr>

                                                                <tr
                                                                    style={{
                                                                        border: "1px solid #fff",
                                                                    }}
                                                                >
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        Motif
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        Approvisionnement
                                                                    </td>
                                                                </tr>
                                                                <tr
                                                                    style={{
                                                                        border: "1px solid #fff",
                                                                    }}
                                                                >
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        Dévise
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            border: "1px solid #fff",
                                                                        }}
                                                                    >
                                                                        USD
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    <div
                                                        align="left"
                                                        style={{
                                                            marginLeft: "100px",
                                                        }}
                                                    >
                                                        BILLETAGE
                                                    </div>
                                                    <div
                                                        className="row  corp-recu"
                                                        // id=""
                                                        style={{
                                                            width: "100%",
                                                            // margin: "0px auto",
                                                            background:
                                                                "#DCDCDC",
                                                            padding: "5px",
                                                            color: "#000",
                                                            border: "2px solid #444",
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >
                                                        <table
                                                            className="table table-striped"
                                                            style={{
                                                                background:
                                                                    "#DCDCDC",
                                                                padding: "5px",
                                                                color: "#000",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col">
                                                                        Nbre
                                                                        Billets
                                                                    </th>
                                                                    <th scope="col">
                                                                        Coupure
                                                                    </th>
                                                                    <th scope="col">
                                                                        Total
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {parseInt(
                                                                    data.centDollars
                                                                ) > 0 && (
                                                                    <React.Fragment>
                                                                        <tr>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.centDollars
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                X
                                                                                100{" "}
                                                                            </td>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.centDollars
                                                                                ) *
                                                                                    100}
                                                                            </td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                )}
                                                                {parseInt(
                                                                    data.cinquanteDollars
                                                                ) > 0 && (
                                                                    <React.Fragment>
                                                                        <tr>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.cinquanteDollars
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                X
                                                                                50{" "}
                                                                            </td>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.cinquanteDollars
                                                                                ) *
                                                                                    50}
                                                                            </td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                )}
                                                                {parseInt(
                                                                    data.vightDollars
                                                                ) > 0 && (
                                                                    <React.Fragment>
                                                                        <tr>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.vightDollars
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                X
                                                                                20{" "}
                                                                            </td>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.vightDollars
                                                                                ) *
                                                                                    20}
                                                                            </td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                )}
                                                                {parseInt(
                                                                    data.dixDollars
                                                                ) > 0 && (
                                                                    <React.Fragment>
                                                                        <tr>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.dixDollars
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                X
                                                                                10{" "}
                                                                            </td>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.dixDollars
                                                                                ) *
                                                                                    10}
                                                                            </td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                )}
                                                                {parseInt(
                                                                    data.cinqDollars
                                                                ) > 0 && (
                                                                    <React.Fragment>
                                                                        <tr>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.cinqDollars
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                X
                                                                                5{" "}
                                                                            </td>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.cinqDollars
                                                                                ) *
                                                                                    50}
                                                                            </td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                )}
                                                                {parseInt(
                                                                    data.unDollars
                                                                ) > 0 && (
                                                                    <React.Fragment>
                                                                        <tr>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.unDollars
                                                                                )}{" "}
                                                                            </td>
                                                                            <td>
                                                                                X
                                                                                1{" "}
                                                                            </td>
                                                                            <td>
                                                                                {parseInt(
                                                                                    data.unDollars
                                                                                ) *
                                                                                    1}
                                                                            </td>
                                                                        </tr>
                                                                    </React.Fragment>
                                                                )}

                                                                <tr>
                                                                    <th>
                                                                        Total
                                                                    </th>
                                                                    <th
                                                                        style={{
                                                                            border: "0px",
                                                                        }}
                                                                    ></th>
                                                                    <td
                                                                        style={{
                                                                            fontSize:
                                                                                "25px",
                                                                            fontWeight:
                                                                                "bold",
                                                                        }}
                                                                    >
                                                                        {parseInt(
                                                                            data.montant
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <div>
                                                            Nous disons USD{" "}
                                                            <b>
                                                                {" "}
                                                                {NumberToLetter(
                                                                    data.montant
                                                                )}{" "}
                                                                Dollar{" "}
                                                                {parseInt(
                                                                    data.montant
                                                                ) > 1
                                                                    ? " s"
                                                                    : ""}
                                                                {parseInt(
                                                                    data.montant
                                                                ) > 1
                                                                    ? " américains"
                                                                    : " américain"}
                                                            </b>{" "}
                                                        </div>
                                                        <hr
                                                            style={{
                                                                border: "2px dashed #fff",
                                                                width: "95%",
                                                            }}
                                                        />
                                                        <div>
                                                            Date valeur :{" "}
                                                            {dateParser(
                                                                data.DateTransaction
                                                            )}
                                                        </div>

                                                        <div>
                                                            Fait à goma le{" "}
                                                            {dateParser(
                                                                data.DateTransaction
                                                            )}{" "}
                                                            {" à " +
                                                                data.created_at
                                                                    .split(
                                                                        "T"
                                                                    )[1]
                                                                    .split(
                                                                        "."
                                                                    )[0]}
                                                        </div>

                                                        <table className="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th
                                                                        style={{
                                                                            border: "2px solid #000",
                                                                            padding:
                                                                                "20px",
                                                                        }}
                                                                    >
                                                                        {" "}
                                                                        Signature{" "}
                                                                        {
                                                                            data.NomUtilisateur
                                                                        }
                                                                    </th>
                                                                    <th></th>
                                                                    <th></th>
                                                                    <th></th>
                                                                    <th></th>
                                                                    <th></th>

                                                                    <th
                                                                        style={{
                                                                            border: "2px solid #000",
                                                                            padding:
                                                                                "20px",
                                                                        }}
                                                                    >
                                                                        <i>
                                                                            Signature{" "}
                                                                            {
                                                                                data.NomDemandeur
                                                                            }
                                                                        </i>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
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
export default RecuApproUSD;
