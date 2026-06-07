import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { Bars } from "react-loader-spinner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CurrencyExchange = () => {
    const [activeTab, setActiveTab] = useState("operation");
    const [loading, setLoading] = useState(false);
    const [userAgences, setUserAgences] = useState([]);
    const [currentAgence, setCurrentAgence] = useState(null);

    const [useMargin, setUseMargin] = useState(true);
    const [editingMarge, setEditingMarge] = useState(null);
    const [editMargeValue, setEditMargeValue] = useState("");
    const [marges, setMarges] = useState([]);
    const [userModifiedRate, setUserModifiedRate] = useState(false);

    // Opération
    const [clientSearch, setClientSearch] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientName, setClientName] = useState("");
    const [clientAccounts, setClientAccounts] = useState([]);
    const [sourceAccount, setSourceAccount] = useState("");
    const [targetAccount, setTargetAccount] = useState("");
    const [sourceDevise, setSourceDevise] = useState("");
    const [targetDevise, setTargetDevise] = useState("");
    const [amount, setAmount] = useState("");
    const [appliedRate, setAppliedRate] = useState(null);
    const [referenceRate, setReferenceRate] = useState(null);
    const [gainLoss, setGainLoss] = useState(0);
    const [motif, setMotif] = useState("Change de devises");
    const [soldeSource, setSoldeSource] = useState(0);
    const [margin, setMargin] = useState(0);

    // Paramétrage
    const [rates, setRates] = useState([]);
    const [newRate, setNewRate] = useState({
        source_currency: "USD",
        target_currency: "CDF",
        rate: "",
        valid_from: "",
        valid_to: "",
    });
    const [exchangeAccounts, setExchangeAccounts] = useState({
        position_usd: "",
        position_cdf: "",
        position_eur: "",
        gain_account: "",
        loss_account: "",
    });

    // Historique
    const [transactions, setTransactions] = useState([]);
    const [filters, setFilters] = useState({
        date_debut: "",
        date_fin: "",
        source_currency: "",
        target_currency: "",
    });

    useEffect(() => {
        setUserAgences(window.userAgences || []);
        setCurrentAgence(window.currentAgence || null);
        fetchRates();
        fetchExchangeAccounts();
        fetchTransactions();
        fetchMarges();
    }, []);

    useEffect(() => {
        if (sourceDevise && targetDevise) {
            setMotif(`Change ${sourceDevise} → ${targetDevise}`);
        }
    }, [sourceDevise, targetDevise]);

    const fetchRates = async () => {
        const res = await axios.get("/eco/exchange/rates");
        if (res.data.status == 1) setRates(res.data.data);
    };

    const fetchExchangeAccounts = async () => {
        const res = await axios.get("/eco/exchange/accounts");
        if (res.data.status == 1) setExchangeAccounts(res.data.data);
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/eco/exchange/transactions", {
                params: filters,
            });
            if (res.data.status == 1) setTransactions(res.data.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMarges = async () => {
        try {
            const res = await axios.get("/eco/exchange/marges");
            if (res.data.status == 1) {
                setMarges(res.data.data);
            }
        } catch (error) {
            console.error("Erreur chargement marges:", error);
        }
    };

    const searchClient = async () => {
        if (!clientSearch) return;
        try {
            const res = await axios.post("/eco/exchange/search-client", {
                search: clientSearch,
            });
            if (res.data.status == 1 && res.data.data.length > 0) {
                const client = res.data.data[0];
                console.log("Client trouvé:", client);

                // Utiliser NumCompte comme identifiant (clé primaire dans comptes)
                const clientId = client.NumCompte;
                setClientId(clientId);
                setClientName(client.name);
                await fetchClientAccounts(clientId);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const fetchClientAccounts = async (numCompte) => {
        try {
            const res = await axios.post("/eco/exchange/client-accounts", {
                client_id: numCompte, // Envoyer le NumCompte
            });
            if (res.data.status == 1) setClientAccounts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSourceChange = async (e) => {
        setUserModifiedRate(false);
        const account = e.target.value;
        setSourceAccount(account);
        const compte = clientAccounts.find((c) => c.NumCompte == account);
        if (compte) {
            setSourceDevise(
                compte.CodeMonnaie == 1
                    ? "USD"
                    : compte.CodeMonnaie == 2
                      ? "CDF"
                      : "EUR",
            );
            const res = await axios.post("/eco/exchange/balance", {
                num_compte: account,
            });
            if (res.data.status == 1) setSoldeSource(res.data.solde);
        }
    };

    const handleTargetChange = (e) => {
        setUserModifiedRate(false);
        const account = e.target.value;
        setTargetAccount(account);
        const compte = clientAccounts.find((c) => c.NumCompte == account);
        if (compte)
            setTargetDevise(
                compte.CodeMonnaie == 1
                    ? "USD"
                    : compte.CodeMonnaie == 2
                      ? "CDF"
                      : "EUR",
            );
    };

    const getReferenceRate = async () => {
        console.log("🔍 getReferenceRate appelé - useMargin =", useMargin);

        if (!sourceDevise || !targetDevise) {
            console.log("Pas de devises sélectionnées");
            return;
        }

        try {
            const res = await axios.get("/eco/exchange/reference-rate", {
                params: {
                    source: sourceDevise,
                    target: targetDevise,
                    apply_margin: useMargin ? 1 : 0,
                },
            });

            console.log("📊 Réponse API complète:", res.data);

            if (res.data.status == 1) {
                let reference = res.data.reference_rate;
                let applied = res.data.rate;
                let margeValue = res.data.margin || 0;
                if (
                    sourceDevise == "CDF" &&
                    targetDevise == "USD" &&
                    useMargin &&
                    margeValue > 0
                ) {
                    const tauxRefCDF = 1 / reference;
                    const tauxAppliedCDF = tauxRefCDF + margeValue; // 2350 + 50 = 2400
                    applied = 1 / tauxAppliedCDF;
                }

                console.log("✅ Taux référence:", reference);
                console.log("✅ Taux appliqué:", applied);
                console.log("✅ Marge:", margeValue);

                setReferenceRate(reference);
                setAppliedRate(applied);
                setMargin(margeValue);
            }
        } catch (error) {
            console.error("❌ Erreur:", error);
        }
    };
    useEffect(() => {
        getReferenceRate();
    }, [sourceDevise, targetDevise, useMargin]);

    const calculateGainLoss = () => {
        if (
            !amount ||
            !appliedRate ||
            !referenceRate ||
            !sourceDevise ||
            !targetDevise
        )
            return;
        let gain = 0;

        if (sourceDevise == "USD" && targetDevise == "CDF") {
            gain = (referenceRate - appliedRate) * parseFloat(amount);
        } else if (sourceDevise == "CDF" && targetDevise == "USD") {
            // 🔥 Correction : le taux doit être en CDF pour 1 USD
            const tauxRefCDF = 1 / referenceRate; // 2350
            const tauxAppliedCDF = 1 / appliedRate; // 2400
            const usdAmount = parseFloat(amount) / tauxAppliedCDF; // 5000 / 2400 = 2.083 USD
            gain = (tauxAppliedCDF - tauxRefCDF) * usdAmount; // (2400 - 2350) * 2.083 = 104.15 CDF
        }

        console.log("Gain calculé:", gain);
        setGainLoss(gain);
    };

    useEffect(() => {
        calculateGainLoss();
    }, [amount, appliedRate, referenceRate, sourceDevise, targetDevise]);

    // Fonctions d'affichage des taux
    const displayReferenceRate = (rate, source, target) => {
        if (!rate) return "";
        if (source == "CDF" && target == "USD") {
            return (1 / rate).toFixed(0);
        }
        return rate.toFixed(2);
    };

    const displayAppliedRate = (rate, source, target) => {
        if (!rate) return "";
        if (source == "CDF" && target == "USD") {
            return (1 / rate).toFixed(0);
        }
        return rate.toFixed(2);
    };

    // const executeExchange = async () => {
    //     if (
    //         !sourceAccount ||
    //         !targetAccount ||
    //         !amount ||
    //         !appliedRate ||
    //         !motif
    //     ) {
    //         Swal.fire("Erreur", "Veuillez remplir tous les champs", "error");
    //         return;
    //     }
    //     if (parseFloat(amount) > soldeSource) {
    //         Swal.fire("Erreur", "Solde insuffisant", "error");
    //         return;
    //     }
    //     setLoading(true);

    //     console.log("Envoi au backend:", {
    //         amount: amount,
    //         applied_rate: appliedRate,
    //         source: sourceDevise,
    //         target: targetDevise,
    //     });

    //     try {
    //         // 🔥 Convertir le taux pour CDF -> USD
    //         let finalRate = appliedRate;

    //         if (sourceDevise == "CDF" && targetDevise == "USD") {
    //             // Convertir referenceRate (ex: 0.0004255) en taux CDF (ex: 2350)
    //             const tauxRefCDF = Number(1 / referenceRate);
    //             console.log("Taux référence en CDF:", tauxRefCDF);

    //             if (useMargin) {
    //                 // Récupérer la marge (doit être un nombre)
    //                 const margeActuelle = Number(
    //                     marges.find(
    //                         (m) =>
    //                             m.devise_source == "CDF" &&
    //                             m.devise_target == "USD",
    //                     )?.marge || 50,
    //                 );
    //                 // Additionner (pas concaténer)
    //                 finalRate = tauxRefCDF + margeActuelle;
    //                 console.log("Taux avec marge:", finalRate);
    //             } else {
    //                 finalRate = tauxRefCDF;
    //             }
    //         }

    //         const res = await axios.post("/eco/exchange/execute", {
    //             client_id: clientId,
    //             source_account: sourceAccount,
    //             target_account: targetAccount,
    //             amount: parseFloat(amount),
    //             applied_rate: finalRate,
    //             motif: motif,
    //         });

    //         if (res.data.status == 1) {
    //             Swal.fire(
    //                 "Succès",
    //                 `Opération effectuée. Gain: ${res.data.data.gain_loss.toFixed(2)} CDF`,
    //                 "success",
    //             );
    //             setAmount("");
    //             setAppliedRate(null);
    //             setMotif("");
    //             setSourceAccount("");
    //             setTargetAccount("");
    //             setUserModifiedRate(false);
    //             fetchClientAccounts(clientId);
    //             fetchTransactions();
    //         } else {
    //             Swal.fire("Erreur", res.data.msg, "error");
    //         }
    //     } catch (error) {
    //         Swal.fire("Erreur", "Erreur lors de l'opération", "error");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const executeExchange = async () => {
        if (
            !sourceAccount ||
            !targetAccount ||
            !amount ||
            !appliedRate ||
            !motif
        ) {
            Swal.fire("Erreur", "Veuillez remplir tous les champs", "error");
            return;
        }
        if (parseFloat(amount) > soldeSource) {
            Swal.fire("Erreur", "Solde insuffisant", "error");
            return;
        }
        setLoading(true);

        // Normalisation du taux pour le backend : toujours en CDF pour 1 unité de devise source
        let rateToSend = appliedRate;
        if (sourceDevise === "CDF" && targetDevise === "USD") {
            // appliedRate stocké est l'inverse (USD/CDF) car l'affichage se fait en CDF/USD
            rateToSend = 1 / appliedRate;
        }
        // Pour USD → CDF, rateToSend = appliedRate (déjà en CDF/USD)

        console.log("Envoi au backend:", {
            amount: amount,
            applied_rate: rateToSend,
            source: sourceDevise,
            target: targetDevise,
        });

        try {
            const res = await axios.post("/eco/exchange/execute", {
                client_id: clientId,
                source_account: sourceAccount,
                target_account: targetAccount,
                amount: parseFloat(amount),
                applied_rate: rateToSend, // ← taux normalisé
                motif: motif,
            });

            if (res.data.status == 1) {
                // Swal.fire(
                //     "Succès",
                //     `Opération effectuée. Gain: ${res.data.data.gain_loss.toFixed(2)} CDF`,
                //     "success"
                // );
                const gainLossValue = res.data.data.gain_loss;
                const gainLossLabel = gainLossValue >= 0 ? "Gain" : "Perte";
                Swal.fire(
                    "Succès",
                    `Opération effectuée. ${gainLossValue >= 0 ? "Gain" : "Perte"}: ${gainLossValue.toFixed(2)} CDF`,
                    "success",
                );
                fetchRates(); // recharge la liste des taux
                // 👇 Force le rechargement du taux de référence pour l'opération en cours
                if (sourceDevise && targetDevise) {
                    getReferenceRate();
                }
                // Réinitialisation
                setAmount("");
                setAppliedRate(null);
                // setMotif("");
                setSourceAccount("");
                setTargetAccount("");
                setUserModifiedRate(false);
                fetchClientAccounts(clientId);
                fetchTransactions();
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors de l'opération", "error");
        } finally {
            setLoading(false);
        }
    };
    const saveRate = async () => {
        if (!newRate.rate || !newRate.valid_from) {
            Swal.fire("Erreur", "Veuillez remplir tous les champs", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/eco/exchange/rates", newRate);
            if (res.data.status == 1) {
                Swal.fire("Succès", "Taux enregistré", "success");
                fetchRates();
                setNewRate({
                    source_currency: "USD",
                    target_currency: "CDF",
                    rate: "",
                    valid_from: "",
                    valid_to: "",
                });
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors de l'enregistrement", "error");
        } finally {
            setLoading(false);
        }
    };

    const saveAccounts = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                "/eco/exchange/accounts",
                exchangeAccounts,
            );
            if (res.data.status == 1) {
                Swal.fire("Succès", "Comptes paramétrés", "success");
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors de l'enregistrement", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateMarge = async (id, marge) => {
        try {
            const res = await axios.post("/eco/exchange/marges", { id, marge });
            if (res.data.status == 1) {
                Swal.fire("Succès", "Marge mise à jour", "success");
                fetchMarges();
                setEditingMarge(null);
            } else {
                Swal.fire("Erreur", res.data.msg, "error");
            }
        } catch (error) {
            Swal.fire("Erreur", "Erreur lors de la mise à jour", "error");
        }
    };

    const startEditMarge = (marge) => {
        setEditingMarge(marge.id);
        setEditMargeValue(marge.marge.toString());
    };

    // == NOUVELLES FONCTIONS D'EXPORT ==
    const exportToExcel = () => {
        if (transactions.length == 0) {
            Swal.fire("Information", "Aucune transaction à exporter", "info");
            return;
        }

        // Préparer les données pour Excel (colonnes souhaitées)
        const exportData = transactions.map((row) => ({
            Référence: row.reference,
            Client: row.client?.name,
            "Montant source": `${row.amount_source} ${row.source_currency}`,
            "Montant destination": `${row.amount_target} ${row.target_currency}`,
            "Taux appliqué": row.applied_rate,
            "Gain/Perte (CDF)": row.gain_loss,
            Motif: row.motif,
            Date: new Date(row.created_at).toLocaleString("fr-FR"),
        }));

        // Créer un classeur et une feuille
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historique_Change");

        // Générer le fichier
        XLSX.writeFile(
            wb,
            `historique_change_${new Date().toISOString().slice(0, 19)}.xlsx`,
        );

        Swal.fire(
            "Export réussi",
            "Le fichier Excel a été téléchargé",
            "success",
        );
    };

    const exportToPDF = () => {
        if (transactions.length == 0) {
            Swal.fire("Information", "Aucune transaction à exporter", "info");
            return;
        }

        // Créer un document PDF
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        // Titre
        doc.setFontSize(16);
        doc.text("Historique des opérations de change", 14, 15);
        doc.setFontSize(10);
        doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 22);

        // Préparer les lignes pour le tableau
        const tableColumn = [
            "Référence",
            "Client",
            "Montant source",
            "Montant destination",
            "Taux appliqué",
            "Gain/Perte (CDF)",
            "Motif",
            "Date",
        ];
        const tableRows = transactions.map((row) => [
            row.reference,
            row.client?.name || "",
            `${row.amount_source} ${row.source_currency}`,
            `${row.amount_target} ${row.target_currency}`,
            row.applied_rate,
            `${row.gain_loss.toLocaleString()} CDF`,
            row.motif,
            new Date(row.created_at).toLocaleString("fr-FR"),
        ]);

        // Ajouter le tableau avec autotable
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: "striped",
            styles: { fontSize: 8, cellPadding: 1.5 },
            headStyles: {
                fillColor: [19, 132, 150],
                textColor: 255,
                fontSize: 9,
            },
            alternateRowStyles: { fillColor: [240, 248, 255] },
            margin: { top: 30, left: 10, right: 10 },
        });

        // Sauvegarder le PDF
        doc.save(
            `historique_change_${new Date().toISOString().slice(0, 19)}.pdf`,
        );
        Swal.fire(
            "Export réussi",
            "Le fichier PDF a été téléchargé",
            "success",
        );
    };
    // == FIN NOUVELLES FONCTIONS ==

    const columns = [
        { name: "Référence", selector: (row) => row.reference, sortable: true },
        {
            name: "NumCompte",
            cell: (row) => <span>{row.client_id}</span>,
            sortable: true,
        },
        {
            name: "Montant source",
            selector: (row) => `${row.amount_source} ${row.source_currency}`,
            sortable: true,
            className: "text-end",
        },
        {
            name: "Montant destination",
            selector: (row) => `${row.amount_target} ${row.target_currency}`,
            sortable: true,
            className: "text-end",
        },
        {
            name: "Taux appliqué",
            selector: (row) => row.applied_rate,
            sortable: true,
            className: "text-end",
        },
        {
            name: "Gain/Perte",
            selector: (row) => row.gain_loss.toLocaleString(),
            sortable: true,
            className: "text-end",
            cell: (row) => (
                <span
                    className={
                        row.gain_loss >= 0 ? "text-success" : "text-danger"
                    }
                >
                    {row.gain_loss.toLocaleString()} CDF
                </span>
            ),
        },
        { name: "Motif", selector: (row) => row.motif },
        {
            name: "Date",
            selector: (row) => new Date(row.created_at).toLocaleString(),
            sortable: true,
        },
    ];

    // Déterminer la marge à afficher
    const currentMargin =
        marges.find(
            (m) =>
                m.devise_source == sourceDevise &&
                m.devise_target == targetDevise,
        )?.marge || 50;

    return (
        <div className="container-fluid py-4">
            {/* En-tête */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div
                            className="card-header text-white border-0 py-3"
                            style={{ background: "#138496" }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-3 p-2">
                                    <i className="fas fa-exchange-alt fa-2x"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0">
                                        Change de devises
                                    </h5>
                                    <small className="text-white-50">
                                        Opérations d'achat/vente de devises
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab == "operation" ? "active" : ""}`}
                        onClick={() => setActiveTab("operation")}
                    >
                        <i className="fas fa-exchange-alt me-2"></i>Opération
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab == "settings" ? "active" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        <i className="fas fa-sliders-h me-2"></i>Paramétrage
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab == "history" ? "active" : ""}`}
                        onClick={() => setActiveTab("history")}
                    >
                        <i className="fas fa-history me-2"></i>Historique
                    </button>
                </li>
            </ul>

            {/* Onglet Opération */}
            {activeTab == "operation" && (
                <div className="row g-4">
                    <div className="col-md-6">
                        {/* Carte Client */}
                        <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i className="fas fa-user me-2"></i>Client
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control modern-input"
                                        placeholder="Numéro client ou nom"
                                        value={clientSearch}
                                        onChange={(e) =>
                                            setClientSearch(e.target.value)
                                        }
                                    />
                                    <button
                                        className="btn btn-teal"
                                        onClick={searchClient}
                                    >
                                        <i className="fas fa-search"></i>{" "}
                                        Rechercher
                                    </button>
                                </div>
                                {clientName && (
                                    <div className="alert alert-info">
                                        <i className="fas fa-user-circle me-2"></i>
                                        <strong>{clientName}</strong> (ID:{" "}
                                        {clientId})
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Carte Opération */}
                        {clientId && (
                            <div className="card border-0 shadow-sm rounded-4 dashboard-card mt-4">
                                <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                    <h6 className="section-title">
                                        <i className="fas fa-exchange-alt me-2"></i>
                                        Opération de change
                                    </h6>
                                </div>
                                <div className="card-body pt-2">
                                    {/* Toggle Marge */}
                                    <div className="form-check form-switch mb-3 ml-4">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="toggleMargin"
                                            checked={useMargin}
                                            onChange={(e) => {
                                                setUseMargin(e.target.checked);
                                                setUserModifiedRate(false);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="toggleMargin"
                                            style={{ cursor: "pointer" }}
                                        >
                                            Appliquer la marge automatique (
                                            {currentMargin} FC)
                                        </label>
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Compte source
                                        </label>
                                        <select
                                            className="modern-select w-100"
                                            value={sourceAccount}
                                            onChange={handleSourceChange}
                                        >
                                            <option value="">
                                                Sélectionner
                                            </option>
                                            {clientAccounts.map((acc) => (
                                                <option
                                                    key={acc.NumCompte}
                                                    value={acc.NumCompte}
                                                >
                                                    {acc.NumCompte} -{" "}
                                                    {acc.NomCompte} (
                                                    {acc.CodeMonnaie == 1
                                                        ? "USD"
                                                        : acc.CodeMonnaie == 2
                                                          ? "CDF"
                                                          : "EUR"}
                                                    )
                                                </option>
                                            ))}
                                        </select>
                                        {sourceAccount && (
                                            <small className="text-muted">
                                                Solde:{" "}
                                                {soldeSource.toLocaleString()}{" "}
                                                {sourceDevise}
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Compte destination
                                        </label>
                                        <select
                                            className="modern-select w-100"
                                            value={targetAccount}
                                            onChange={handleTargetChange}
                                        >
                                            <option value="">
                                                Sélectionner
                                            </option>
                                            {clientAccounts
                                                .filter(
                                                    (acc) =>
                                                        acc.NumCompte !==
                                                        sourceAccount,
                                                )
                                                .map((acc) => (
                                                    <option
                                                        key={acc.NumCompte}
                                                        value={acc.NumCompte}
                                                    >
                                                        {acc.NumCompte} -{" "}
                                                        {acc.NomCompte} (
                                                        {acc.CodeMonnaie == 1
                                                            ? "USD"
                                                            : acc.CodeMonnaie ==
                                                                2
                                                              ? "CDF"
                                                              : "EUR"}
                                                        )
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Montant à convertir
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control modern-input"
                                            value={amount}
                                            onChange={(e) =>
                                                setAmount(e.target.value)
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="label-modern">
                                                Taux de référence
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control modern-input bg-light"
                                                value={displayReferenceRate(
                                                    referenceRate,
                                                    sourceDevise,
                                                    targetDevise,
                                                )}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="label-modern">
                                                Taux appliqué
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                className="form-control modern-input"
                                                value={displayAppliedRate(
                                                    appliedRate,
                                                    sourceDevise,
                                                    targetDevise,
                                                )}
                                                onChange={(e) => {
                                                    setUserModifiedRate(true);
                                                    let value = parseFloat(
                                                        e.target.value,
                                                    );
                                                    if (
                                                        sourceDevise == "CDF" &&
                                                        targetDevise == "USD" &&
                                                        value > 0
                                                    ) {
                                                        value = 1 / value;
                                                    }
                                                    setAppliedRate(value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Gain / Perte estimé(e)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input fw-bold text-center"
                                            value={`${gainLoss >= 0 ? "+" : ""}${gainLoss.toLocaleString()} CDF`}
                                            readOnly
                                            disabled
                                            style={{
                                                color:
                                                    gainLoss >= 0
                                                        ? "green"
                                                        : "red",
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="label-modern">
                                            Motif
                                        </label>
                                        <textarea
                                            className="form-control modern-input"
                                            rows="2"
                                            value={motif}
                                            onChange={(e) =>
                                                setMotif(e.target.value)
                                            }
                                            placeholder="Raison de l'opération"
                                        ></textarea>
                                    </div>

                                    <button
                                        className="btn gradient-btn w-100 py-2 text-white"
                                        onClick={executeExchange}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <i className="fas fa-exchange-alt me-2"></i>
                                        )}
                                        Effectuer le change
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Informations
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="alert alert-info">
                                    <i className="fas fa-lightbulb me-2"></i>
                                    <strong>Comment ça marche ?</strong>
                                    <br />
                                    Le taux appliqué au client peut être
                                    différent du taux de référence. La
                                    différence génère un gain ou une perte pour
                                    l'institution.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Onglet Paramétrage */}
            {activeTab == "settings" && (
                <div className="row g-4">
                    {/* Taux de change */}
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i className="fas fa-chart-line me-2"></i>
                                    Taux de change
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="row g-2 mb-3">
                                    <div className="col-4">
                                        <select
                                            className="modern-select w-100"
                                            value={newRate.source_currency}
                                            onChange={(e) =>
                                                setNewRate({
                                                    ...newRate,
                                                    source_currency:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="USD">USD</option>
                                            <option value="CDF">CDF</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                    <div className="col-1 text-center pt-2">
                                        →
                                    </div>
                                    <div className="col-4">
                                        <select
                                            className="modern-select w-100"
                                            value={newRate.target_currency}
                                            onChange={(e) =>
                                                setNewRate({
                                                    ...newRate,
                                                    target_currency:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="USD">USD</option>
                                            <option value="CDF">CDF</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                    <div className="col-3">
                                        <input
                                            type="number"
                                            step="0.0001"
                                            className="form-control modern-input"
                                            placeholder="Taux"
                                            value={newRate.rate}
                                            onChange={(e) =>
                                                setNewRate({
                                                    ...newRate,
                                                    rate: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="small text-muted">
                                            Date début
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control modern-input"
                                            value={newRate.valid_from}
                                            onChange={(e) =>
                                                setNewRate({
                                                    ...newRate,
                                                    valid_from: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="small text-muted">
                                            Date fin (optionnel)
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control modern-input"
                                            value={newRate.valid_to}
                                            onChange={(e) =>
                                                setNewRate({
                                                    ...newRate,
                                                    valid_to: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-12 mt-2">
                                        <button
                                            className="btn btn-sm btn-teal w-100"
                                            onClick={saveRate}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-save me-2"></i>
                                            Ajouter / modifier taux
                                        </button>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Devise source</th>
                                                <th>Devise cible</th>
                                                <th>Taux</th>
                                                <th>Validité</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rates.map((rate) => (
                                                <tr key={rate.id}>
                                                    <td>
                                                        {rate.source_currency}
                                                    </td>
                                                    <td>
                                                        {rate.target_currency}
                                                    </td>
                                                    <td className="text-end">
                                                        {rate.rate}
                                                    </td>
                                                    <td>
                                                        {new Date(
                                                            rate.valid_from,
                                                        ).toLocaleDateString(
                                                            "fr-FR",
                                                        )}{" "}
                                                        → {rate.valid_to || "∞"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration des marges */}
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i
                                        className="fas fa-percent me-2"
                                        style={{ color: "#6366f1" }}
                                    ></i>
                                    Configuration des marges
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Les marges sont automatiquement appliquées
                                    lors des opérations de change.
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Devise source</th>
                                                <th>Devise destination</th>
                                                <th>Marge (CDF)</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marges.map((marge) => (
                                                <tr key={marge.id}>
                                                    <td>
                                                        {marge.devise_source}
                                                    </td>
                                                    <td>
                                                        {marge.devise_target}
                                                    </td>
                                                    <td>
                                                        {editingMarge ==
                                                        marge.id ? (
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                style={{
                                                                    width: "100px",
                                                                }}
                                                                value={
                                                                    editMargeValue
                                                                }
                                                                onChange={(e) =>
                                                                    setEditMargeValue(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="fw-bold">
                                                                {marge.marge}{" "}
                                                                CDF
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingMarge ==
                                                        marge.id ? (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm btn-success me-2"
                                                                    onClick={() =>
                                                                        updateMarge(
                                                                            marge.id,
                                                                            parseFloat(
                                                                                editMargeValue,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() =>
                                                                        setEditingMarge(
                                                                            null,
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() =>
                                                                    startEditMarge(
                                                                        marge,
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-edit me-1"></i>{" "}
                                                                Modifier
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {marges.length == 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="text-center text-muted"
                                                    >
                                                        Aucune marge configurée
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <small className="text-muted">
                                    <i className="fas fa-lightbulb me-1"></i>
                                    Pour USD → CDF : Taux appliqué = Taux
                                    référence - Marge
                                    <br />
                                    Pour CDF → USD : Taux appliqué = Taux
                                    référence + Marge
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Comptes comptables */}
                    <div className="col-md-12">
                        <div className="card border-0 shadow-sm rounded-4 dashboard-card">
                            <div className="card-header bg-transparent border-0 pt-3 pb-0">
                                <h6 className="section-title">
                                    <i className="fas fa-book me-2"></i>Comptes
                                    comptables
                                </h6>
                            </div>
                            <div className="card-body pt-2">
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Configuration pour l'agence courante :{" "}
                                    <strong>{currentAgence?.nom_agence}</strong>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="label-modern">
                                            Compte de position USD
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            value={
                                                exchangeAccounts.position_usd
                                            }
                                            onChange={(e) =>
                                                setExchangeAccounts({
                                                    ...exchangeAccounts,
                                                    position_usd:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <small className="text-muted">
                                            Compte technique pour les
                                            transactions en USD
                                        </small>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="label-modern">
                                            Compte de position CDF
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            value={
                                                exchangeAccounts.position_cdf
                                            }
                                            onChange={(e) =>
                                                setExchangeAccounts({
                                                    ...exchangeAccounts,
                                                    position_cdf:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="label-modern">
                                            Compte de position EUR
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            value={
                                                exchangeAccounts.position_eur
                                            }
                                            onChange={(e) =>
                                                setExchangeAccounts({
                                                    ...exchangeAccounts,
                                                    position_eur:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="label-modern">
                                            Compte de gain de change
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            value={
                                                exchangeAccounts.gain_account
                                            }
                                            onChange={(e) =>
                                                setExchangeAccounts({
                                                    ...exchangeAccounts,
                                                    gain_account:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="label-modern">
                                            Compte de perte de change
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control modern-input"
                                            value={
                                                exchangeAccounts.loss_account
                                            }
                                            onChange={(e) =>
                                                setExchangeAccounts({
                                                    ...exchangeAccounts,
                                                    loss_account:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4 d-flex align-items-end">
                                        <button
                                            className="btn btn-teal w-100"
                                            onClick={saveAccounts}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-save me-2"></i>
                                            Enregistrer les comptes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Onglet Historique - MODIFIÉ POUR AJOUTER LES BOUTONS D'EXPORT */}
            {activeTab == "history" && (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body">
                        <div className="row g-3 mb-4">
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control modern-input"
                                    placeholder="Date début"
                                    value={filters.date_debut}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            date_debut: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="date"
                                    className="form-control modern-input"
                                    placeholder="Date fin"
                                    value={filters.date_fin}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            date_fin: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="col-md-2">
                                <select
                                    className="modern-select w-100"
                                    value={filters.source_currency}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            source_currency: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Devise source</option>
                                    <option value="USD">USD</option>
                                    <option value="CDF">CDF</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select
                                    className="modern-select w-100"
                                    value={filters.target_currency}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            target_currency: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">Devise cible</option>
                                    <option value="USD">USD</option>
                                    <option value="CDF">CDF</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <button
                                    className="btn btn-teal w-100"
                                    onClick={fetchTransactions}
                                >
                                    <i className="fas fa-search me-2"></i>
                                    Filtrer
                                </button>
                            </div>
                            {/* NOUVEAUX BOUTONS D'EXPORT */}
                            <div className="col-md-2 d-flex gap-2">
                                <button
                                    className="btn btn-success w-50"
                                    onClick={exportToExcel}
                                    title="Exporter en Excel"
                                >
                                    <i className="fas fa-file-excel me-1"></i>{" "}
                                    Excel
                                </button>
                                <button
                                    className="btn btn-danger w-50"
                                    onClick={exportToPDF}
                                    title="Exporter en PDF"
                                >
                                    <i className="fas fa-file-pdf me-1"></i> PDF
                                </button>
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={transactions}
                            progressPending={loading}
                            pagination
                            highlightOnHover
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencyExchange;
