import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bars } from "react-loader-spinner";

const MontageCredit = () => {
    const [loading, setloading] = useState(false);
    const [isLoadingRemb, setisLoadingRemb] = useState(false);
    const [fetchData, setFetchData] = useState({
        data: null,
        compteCredit: null,
        epargneCaution: null,
    });
    const [fetchDataToUpdate, setFetchDataToUpdate] = useState();
    const [fetchTypeCredit, setFetchTypeCredit] = useState();
    const [fetchAgentCredit, setFetchAgentCredit] = useState();
    const [fetchObjetCredit, setFetchObjetCredit] = useState();
    const [fetchFrequenceRembours, setFetchFrequenceRembours] = useState();
    const [fetchUserName, setFetchUserName] = useState();
    const [Search_field, setSearch_field] = useState();
    //ADD NEW CREDIT ATTRIBUTE

    const [type_credit, settype_credit] = useState();
    const [recouvreur, setrecouvreur] = useState();
    const [montant_demande, setmontant_demande] = useState();
    const [frequence_rembours, setfrequence_rembours] = useState();
    const [nbr_echeance, setnbr_echeance] = useState();
    const [monnaie, setmonnaie] = useState();
    const [duree, setduree] = useState();
    const [interval, setinterval] = useState();
    const [periode_grace, setperiode_grace] = useState();
    const [NomCompte, setNomCompte] = useState();
    const [compte_epargne, setcompte_epargne] = useState();
    const [compte_credit, setcompte_credit] = useState();
    const [objet_credit, setobjet_credit] = useState();
    const [gestionnaire, setgestionnaire] = useState();
    const [source_fond, setsource_fond] = useState();
    const [taux_interet, settaux_interet] = useState();
    const [taux_retard, settaux_retard] = useState();
    const [echnce_differee, setechnce_differee] = useState();
    const [cycle, setcycle] = useState();
    const [solde_cap, setsolde_cap] = useState();
    const [utilisateur, setutilisateur] = useState();
    const [agence, setagence] = useState();
    const [tot_interet, settot_interet] = useState();
    const [tot_general, settot_general] = useState();
    const [date_demande, setdate_demande] = useState();
    const [epargne_caution, setepargne_caution] = useState();
    const [produit_credit, setproduit_credit] = useState();
    

    //ATTRIBUTE TO UPDATE
    const [type_credit_up, settype_credit_up] = useState();
    const [recouvreur_up, setrecouvreur_up] = useState();
    const [montant_demande_up, setmontant_demande_up] = useState();
    const [frequence_rembours_up, setfrequence_rembours_up] = useState();
    const [date_demande_up, setdate_demande_up] = useState();
    const [nbr_echeance_up, setnbr_echeance_up] = useState();
    const [monnaie_up, setmonnaie_up] = useState();
    const [duree_up, setduree_up] = useState();
    const [interval_up, setinterval_up] = useState();
    const [periode_grace_up, setperiode_grace_up] = useState();
    const [NomCompte_up, setNomCompte_up] = useState();
    const [compte_epargne_up, setcompte_epargne_up] = useState();
    const [compte_credit_up, setcompte_credit_up] = useState();
    const [objet_credit_up, setobjet_credit_up] = useState();
    const [gestionnaire_up, setgestionnaire_up] = useState();
    const [source_fond_up, setsource_fond_up] = useState();
    const [taux_interet_up, settaux_interet_up] = useState();
    const [taux_retard_up, settaux_retard_up] = useState();
    const [echnce_differee_up, setechnce_differee_up] = useState();
    const [numDossier_up, setNumDossier_up] = useState();
    const [cycle_up, setcycle_up] = useState();
    const [solde_cap_up, setsolde_cap_up] = useState();
    const [utilisateur_up, setutilisateur_up] = useState();
    const [agence_up, setagence_up] = useState();
    const [tot_interet_up, settot_interet_up] = useState();
    const [tot_general_up, settot_general_up] = useState();
    const [epargne_caution_up, setepargne_caution_up] = useState();
    const [addNew, setAddNew] = useState(false);
    const [getNumDossier, setGetNumDossier] = useState();
    const [error, setError] = useState([]);
    //ECHEANCIER ATTRIBUTE
    const [desicion, setdecision] = useState();
    const [ModeCalcul, setModeCalcul] = useState();
    const [DateOctroi, setDateOctroi] = useState();
    const [dateEcheance, setdateEcheance] = useState();
    const [DateTombeEcheance, setDateTombeEcheance] = useState();
    const [MontantAccorde, setMontantAccorde] = useState();
    const [garantie, setgarantie] = useState();
    const [hypotheque_name, sethypotheque_name] = useState();

    // const [montantRemboursementManuel, setmontantRemboursementManuel] =
    //     useState();

        const [montantRemboursementCapital, setMontantRemboursementCapital] =
        useState();
           const [montantRemboursementInteret, setMontantRemboursementInteret] =
        useState();

    const [checkboxValues, setCheckboxValues] = useState({
        RemboursementAnticipative: false,
        RemboursementAnticipativeCapital:false,
        RemboursementAnticipativeInteret:false
    });

    const [ReechelonnerCheckboxValues, setReechelonnerCheckboxValues] =
        useState({
            Reechelonner: false,
        });

    //PERMET DE MODIFIER UN CREDIT
    const upDateCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post(
            "/eco/pages/montage-credit/get-credit-to-update",
            {
                seachedAccount: Search_field,
            },
        );
        if (res.data.status == 1) {
            setAddNew(false);
            getDataToDisplayOnFormLoad();
            setFetchDataToUpdate(res.data.data);
            console.log(res.data.data);
            settype_credit_up(res.data.data.RefProduitCredit);
            setrecouvreur_up(res.data.data.Recouvreur);
            setmontant_demande_up(res.data.data.MontantDemande);
            setdate_demande_up(res.data.data.DateDemande);
            setfrequence_rembours_up(res.data.data.ModeRemboursement);
            setnbr_echeance_up(res.data.data.NbrTranche);
            setmonnaie_up(res.data.data.CodeMonnaie);
            setduree_up(res.data.data.Duree);
            setinterval_up(res.data.data.Interval);
            setperiode_grace_up(res.data.data.Grace);
            setNomCompte_up(res.data.data.NomCompte);
            setcompte_epargne_up(res.data.data.NumCompteEpargne);
            setcompte_credit_up(res.data.data.NumCompteCredit);
            setobjet_credit_up(res.data.data.ObjeFinance);
            setgestionnaire_up(res.data.data.Gestionnaire);
            setsource_fond_up(res.data.data.SourceFinancement);
            settaux_interet_up(res.data.data.TauxInteret);
            settaux_retard_up(res.data.data.TauxInteretRetard);
            //setechnce_differee_up(res.data.data.TauxInteretRetard)
            setcycle_up(res.data.data.Cycle);
            setsolde_cap_up(res.data.data.CapitalRestant);
            setutilisateur_up(res.data.data.NomUtilisateur);
            setagence_up(res.data.data.CodeAgence);
            settot_interet_up(res.data.data.InteretDu);
            settot_general_up(
                parseInt(
                    res.data.data.CapitalRestant + res.data.data.InteretDu,
                ),
            );
            setepargne_caution_up(res.data.data.NumCompteEpargneGarantie);
            setNumDossier_up(res.data.data.NumDossier);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };
    const getDataToDisplayOnFormLoad = async () => {
        const res = await axios.get("/eco/page/montage-credit-data-to-dispaly");
        if (res.data.status == 1) {
            setFetchTypeCredit(res.data.type_credit);
            setFetchObjetCredit(res.data.objet_credit);
            setFetchAgentCredit(res.data.agent_credit);
            setFetchUserName(res.data.userName);
            setFetchFrequenceRembours(res.data.frequence_rembours);
        }
    };

    useEffect(() => {
        getDataToDisplayOnFormLoad();
    }, []);

    const saveNewCredit = async (e) => {
        e.preventDefault();
        setloading(true);
        const res = await axios.post("/eco/page/montage-credit/save-new", {
            type_credit,
            recouvreur,
            montant_demande,
            frequence_rembours,
            nbr_echeance,
            monnaie,
            duree,
            interval,
            periode_grace,
            NomCompte: fetchData.data.NomCompte,
            compte_epargne: fetchData.data.NumCompte,
            compte_credit: fetchData.compteCredit,
            objet_credit,
            gestionnaire,
            source_fond,
            taux_interet,
            taux_retard,
            echnce_differee,
            cycle,
            solde_cap,
            utilisateur,
            agence,
            tot_interet,
            tot_general,
            date_demande,
            epargne_caution: fetchData.epargneCaution,
            NumDossier: getNumDossier,
            seachedAccount: Search_field,
            NumAdherant: fetchData.data.NumAdherant,
        });

        if (res.data.status == 1) {
            setloading(false);
            Swal.fire({
                title: "Montage crédit",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setloading(false);
            Swal.fire({
                title: "Montage crédit",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else {
            setloading(false);
            setError(res.data.validate_error);
        }
    };

    // PERMET D'AJOUTER UN NOUVEAU CREDIT
    const AddNewCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post(
            "/eco/page/montage-credit/get-seached-account",
            {
                seachedAccount: Search_field,
            },
        );
        if (res.data.status == 1) {
            setFetchData({
                data: res.data.data,
                compteCredit: res.data.compteCredit,
                epargneCaution: res.data.EpargneCaution,
            });
            setAddNew(true);
            setGetNumDossier(res.data.data_numdossier);
            // console.log(fetchData);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };

    const saveUpdateCredit = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/montage-credit/update", {
            type_credit_up,
            recouvreur_up,
            montant_demande_up,
            frequence_rembours_up,
            nbr_echeance_up,
            monnaie_up,
            duree_up,
            interval_up,
            periode_grace_up,
            objet_credit_up,
            gestionnaire_up,
            source_fond_up,
            taux_interet_up,
            taux_retard_up,
            echnce_differee_up,
            date_demande_up,
            NumDossier_up: numDossier_up,
            seachedAccount: Search_field,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Modication de crédit",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Modification de crédit",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
    };
    // 🔥 Fonction utilitaire pour nettoyer avant envoi
    const nettoyerMontant = (montantFormate) => {
        return montantFormate.replace(/\s/g, ""); // "200 000" → "200000"
    };

    // const saveEcheancier = async (e) => {
    //      e.preventDefault();
    //     const montantAccorde = nettoyerMontant(MontantAccorde); // ← Nettoie ici
    //     const res = await axios.post(
    //         "/eco/page/montage-credit/save-echeancier",
    //         {
    //             NumDossier: numDossier_up,
    //             desicion,
    //             ModeCalcul,
    //             DateOctroi,
    //             dateEcheance,
    //             DateTombeEcheance,
    //             MontantAccorde: montantAccorde,
    //             garantie,
    //             hypotheque_name,
    //             reechelonne: ReechelonnerCheckboxValues.Reechelonner,
    //         },
    //     );

    //     if (res.data.status == 1) {
    //         Swal.fire({
    //             title: "Echéancier",
    //             text: res.data.msg,
    //             icon: "success",
    //             timer: 8000,
    //             confirmButtonText: "Okay",
    //         });
    //         setError(res.data.validate_error);
    //     } else if (res.data.status == 0) {
    //         Swal.fire({
    //             title: "Echéancier",
    //             text: res.data.msg,
    //             icon: "error",
    //             timer: 8000,
    //             confirmButtonText: "Okay",
    //         });
    //         setError(res.data.validate_error);
    //     } else {
    //         setError(res.data.validate_error);
    //     }
    // };
const saveEcheancier = async (e) => {
    e.preventDefault();

    // Construction de l'objet de base
    const payload = {
        NumDossier: numDossier_up,
        desicion,
        ModeCalcul,
        DateOctroi,
        dateEcheance,
        DateTombeEcheance,
        garantie,
        hypotheque_name,
        reechelonne: ReechelonnerCheckboxValues.Reechelonner,
    };

    // Ajouter MontantAccorde uniquement si PAS en rééchelonnement
    if (!ReechelonnerCheckboxValues.Reechelonner) {
        // Vérifier que MontantAccorde existe et est valide
        let montant_accorde = 0;
        if (MontantAccorde && typeof MontantAccorde === 'string') {
            montant_accorde = nettoyerMontant(MontantAccorde);
        } else if (typeof MontantAccorde === 'number') {
            montant_accorde = MontantAccorde;
        }
        
        if (montant_accorde <= 0) {
            Swal.fire({
                title: "Attention",
                text: "Veuillez saisir un montant valide",
                icon: "warning",
            });
            return;
        }
        payload.MontantAccorde = montant_accorde;
    }

    try {
        const res = await axios.post("/eco/page/montage-credit/save-echeancier", payload);

        if (res.data.status == 1) {
            Swal.fire({
                title: "Échéancier",
                text: res.data.msg,
                icon: "success",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Échéancier",
                text: res.data.msg,
                icon: "error",
                timer: 8000,
                confirmButtonText: "Okay",
            });
        }
        setError(res.data.validate_error);
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: "Erreur",
            text: "Une erreur est survenue",
            icon: "error",
        });
    }
};
    const AccordeCredit = async (e) => {
        e.preventDefault();
        setisLoadingRemb(true)
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Accorder ce crédit ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/accord-credit",
                {
                    NumDossier: numDossier_up,
                },
            );
            if (res.data.status == 1) {
                setisLoadingRemb(false); 
                Swal.fire({
                    title: "Accord crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                  
            } else {
                 setisLoadingRemb(false);
                Swal.fire({
                    title: "Accord crédit",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                  
            }
        }else{
         
            setisLoadingRemb(false); // désactiver le chargement à la fin (succès ou erreur)
        
        }
    };

    //PERMET DE CLOTURER UN CREDIT

    const ClotureCredit = async (e) => {
        e.preventDefault();
        setisLoadingRemb(true)
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment clôturer ce crédit ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/cloture-credit",
                {
                    NumDossier: numDossier_up,
                },
            );
            if (res.data.status == 1) {
                    setisLoadingRemb(false); 
                Swal.fire({
                    title: "Clôture crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
              
            } else {
                setisLoadingRemb(false); 
                Swal.fire({
                    title: "Clôture crédit",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                  
            }
        }else{
         
            setisLoadingRemb(false); // désactiver le chargement à la fin (succès ou erreur)
        
        }
    };

    //PERMET DE DECAISSER LE CREDIT

    const DeccaissementCredit = async (e) => {
        e.preventDefault();
        setisLoadingRemb(true);
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Décaisser ce crédit ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/decaissement-credit",
                {
                    NumDossier: numDossier_up,
                },
            );
            if (res.data.status == 1) {
                  setisLoadingRemb(false); 
                Swal.fire({
                    title: "Déboursement crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                
            } else {
                setisLoadingRemb(false); 
                Swal.fire({
                    title: "Déboursement crédit",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
                  
            }
        }else{
         
            setisLoadingRemb(false); // désactiver le chargement à la fin (succès ou erreur)
        
        }
    };
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        //  console.log(`Switch ${name} changé:`, checked); // 👈 Pour vérifier
        setCheckboxValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    const handleCheckboxChangeReechelonne = (event) => {
        const { name, checked } = event.target;
        setReechelonnerCheckboxValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    //PERMET DE FAIRE UN REMBOURSEMENT MANUEL EN CAPITAL
    const handleRemboursementCapital= async (e) => {
        e.preventDefault();
        setisLoadingRemb(true);
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Effectuer le remboursement ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/remboursement-manuel-capital",
                {
                    numDossier: numDossier_up,
                    anticipe: checkboxValues.RemboursementAnticipativeCapital,
                    montant: montantRemboursementCapital,
                },
            );

            if (res.data.status == 1) {
                setisLoadingRemb(false);
                Swal.fire({
                    title: "Remboursement crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                setisLoadingRemb(false);
                Swal.fire({
                    // Le remboursement est entrain de s'effectuer en arrière-plan...😎
                    title: "Erreur!",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }else{
         
            setisLoadingRemb(false); // désactiver le chargement à la fin (succès ou erreur)
        
        }
    };


     const handleRemboursementInteret= async (e) => {
        e.preventDefault();
        setisLoadingRemb(true);
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Effectuer le remboursement ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/remboursement-manuel-interet",
                {
                    numDossier: numDossier_up,
                    anticipe: checkboxValues.RemboursementAnticipativeInteret,
                    montant: montantRemboursementInteret,
                },
            );

            if (res.data.status == 1) {
                setisLoadingRemb(false);
                Swal.fire({
                    title: "Remboursement crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                setisLoadingRemb(false);
                Swal.fire({
                    // Le remboursement est entrain de s'effectuer en arrière-plan...😎
                    title: "Erreur!",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }else{
         
            setisLoadingRemb(false); // désactiver le chargement à la fin (succès ou erreur)
        
        }
    };


      const handleRemboursementAnticipe= async (e) => {
        e.preventDefault();
        setisLoadingRemb(true);
        // Afficher une boîte de dialogue de confirmation
        const confirmation = await Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment Effectuer le remboursement ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
        });

        // Si l'utilisateur confirme
        if (confirmation.isConfirmed) {
            const res = await axios.post(
                "/eco/page/montage-credit/remboursement-manuel-anticipe",
                {
                    numDossier: numDossier_up,
                },
            );

            if (res.data.status == 1) {
                setisLoadingRemb(false);
                Swal.fire({
                    title: "Remboursement crédit",
                    text: res.data.msg,
                    icon: "success",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            } else {
                setisLoadingRemb(false);
                Swal.fire({
                    // Le remboursement est entrain de s'effectuer en arrière-plan...😎
                    title: "Erreur!",
                    text: res.data.msg,
                    icon: "error",
                    timer: 8000,
                    confirmButtonText: "Okay",
                });
            }
        }else{
         
            setisLoadingRemb(false); // désactiver le chargement à la fin (succès ou erreur)
        
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

    // Fonction de formatage
    const formatMontant = (valeur) => {
        // Enlève tous les caractères non numériques
        let nombre = valeur.toString().replace(/\D/g, "");
        // Convertit en nombre puis formate avec espaces
        return nombre.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // Fonction pour gérer le changement
    const handleMontantChange = (e) => {
        let valeur = e.target.value;
        // Nettoie et formate
        let nombreBrut = valeur.replace(/\s/g, "");
        let nombreFormatte = formatMontant(nombreBrut);
        setMontantAccorde(nombreFormatte);
        setmontant_demande(nombreFormatte);
    };

    return (
        <div
            className="container-fluid"
            style={{ marginTop: "10px", padding: "0 15px" }}
        >
            {isLoadingRemb && (
                <div
                    style={{
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
                        backdropFilter: "blur(3px)",
                    }}
                >
                    <div className="text-center bg-white p-4 rounded-4 shadow-lg">
                        <Bars
                            height="80"
                            width="80"
                            color="#20c997"
                            ariaLabel="loading"
                        />
                        <h5 className="mt-3 text-dark">Patientez...</h5>
                    </div>
                </div>
            )}

            {/* En-tête moderne */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div
                            className="card-body p-3"
                            style={{
                                background: "#138496",
                                borderRadius: "12px",
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i
                                            className="fas fa-folder-open"
                                            style={{
                                                fontSize: "28px",
                                                color: "white",
                                            }}
                                        ></i>
                                    </div>
                                    <div>
                                        <h5 className="text-white fw-bold mb-0">
                                            Porte Feuille de Crédit
                                        </h5>
                                        <small className="text-white-50">
                                            Gestion complète des crédits
                                        </small>
                                    </div>
                                </div>
                                <a
                                    href="eco/pages/credit/rapport-credit"
                                    className="btn"
                                    style={{
                                        background: "rgba(255,255,255,0.2)",
                                        color: "white",
                                        borderRadius: "8px",
                                        padding: "8px 20px",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                        transition: "all 0.3s ease",
                                        textDecoration: "none",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(255,255,255,0.3)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(255,255,255,0.2)")
                                    }
                                >
                                    <i className="fas fa-chart-bar me-2"></i>
                                    Rapport crédit
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Recherche et État */}
            <div className="row g-3 mb-4">
                <div className="col-md-7">
    <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header bg-white border-0 pt-3">
            <h6 className="fw-bold" style={{ color: "steelblue" }}>
                <i className="fas fa-search me-2"></i>Recherche de crédit
            </h6>
        </div>
        <div className="card-body">
            <form>
                {/* Nouvelle ligne : sélection du produit de crédit */}
                {/* <div className="row g-3 mb-3 align-items-end">
                    <div className="col-md-6">
                        <label
                            htmlFor="produit_credit"
                            className="form-label small fw-semibold mb-0"
                            style={{ color: "#4682b4" }}
                        >
                            <i className="fas fa-tag me-1"></i> Produit de crédit
                        </label>
                        <select
                            className="form-select form-select-sm modern-select"
                            name="produit_credit"
                            id="produit_credit_select"
                            onChange={(e) => setproduit_credit(e.target.value)}
                            value={produit_credit}
                        >
                            <option value="">Sélectionnez</option>
                            <option value="Crédit aux MPME">Crédit aux MPME</option>
                            <option value="Crédit à la consommation">Crédit à la consommation</option>
                            <option value="Crédit à l'habitat">Crédit à l'habitat</option>
                            <option value="Crédit Groupe Solidaire">Crédit Groupe Solidaire</option>
                            <option value="Crédit Salaire">Crédit Salaire</option>
                            <option value="Crédit Staff">Crédit Staff</option>
                            <option value="Crédit Express">Crédit Express</option>
                            <option value="Crédit Agro-Pastoral">Crédit Agro-Pastoral</option>
                            <option value="Crédit MWANGAZA">Crédit MWANGAZA</option>
                            <option value="Crédit JIKO BORA">Crédit JIKO BORA</option>
                            <option value="Crédits TUFAIDIKE WOTE">Crédits TUFAIDIKE WOTE</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                     
                        <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Un client ne peut avoir qu’un seul crédit par type.
                        </small>
                    </div>
                </div> */}

                {/* Ligne existante : recherche + boutons */}
                <div className="d-flex flex-wrap align-items-end gap-3">
                    <div style={{ flex: 1 }}>
                        <label
                            className="form-label small fw-semibold"
                            style={{ color: "steelblue" }}
                        >
                            Numéro de compte
                        </label>
                        <input
                            type="text"
                            className="form-control form-control-sm modern-input"
                            style={{ borderRadius: "8px" }}
                            name="Search_field"
                            id="Search_field"
                            onChange={(e) => setSearch_field(e.target.value)}
                            placeholder="Entrez le numéro de compte..."
                        />
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm"
                            style={{
                                background: "#20c997",
                                color: "white",
                                borderRadius: "8px",
                                padding: "8px 16px",
                            }}
                            onClick={AddNewCredit}
                        >
                            <i className="fas fa-pen me-1"></i> Nouveau
                        </button>
                        <button
                            className="btn btn-sm"
                            style={{
                                background: "#007BFF",
                                color: "white",
                                borderRadius: "8px",
                                padding: "8px 16px",
                            }}
                            onClick={upDateCredit}
                        >
                            <i className="fas fa-edit me-1"></i> Modifier
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-header bg-white border-0 pt-3">
                            <h6
                                className="fw-bold"
                                style={{ color: "steelblue" }}
                            >
                                <i className="fas fa-chart-line me-2"></i>État
                                du crédit
                            </h6>
                        </div>
                       <div className="card-body">
    <div className="card-body">
    <div className="d-flex flex-wrap gap-3 justify-content-around">
        {/* Accordé */}
        <div className="form-check form-switch">
            <input
                className={`form-check-input modern-input ${
                    fetchDataToUpdate && fetchDataToUpdate.Accorde == 1
                        ? "switch-success"
                        : "switch-secondary"
                }`}
                type="checkbox"
                id="accordedSwitch"
                disabled
                checked={fetchDataToUpdate && fetchDataToUpdate.Accorde == 1}
            />
            <label className="form-check-label" style={{ color: "steelblue" }}>
                Accordé
            </label>
        </div>

        {/* Déboursé */}
        <div className="form-check form-switch">
            <input
                className={`form-check-input modern-input ${
                    fetchDataToUpdate && fetchDataToUpdate.Octroye == 1
                        ? "switch-info"
                        : "switch-secondary"
                }`}
                type="checkbox"
                id="debourseSwitch"
                disabled
                checked={fetchDataToUpdate && fetchDataToUpdate.Octroye == 1}
            />
            <label className="form-check-label" style={{ color: "steelblue" }}>
                Déboursé
            </label>
        </div>
          {/* Rééchelonné - NOUVEAU */}
        <div className="form-check form-switch">
            <input
                className={`form-check-input modern-input ${
                    fetchDataToUpdate && fetchDataToUpdate.Reechelonne == 1
                        ? "switch-purple"
                        : "switch-secondary"
                }`}
                type="checkbox"
                id="reechelonneSwitch"
                disabled
                checked={fetchDataToUpdate && fetchDataToUpdate.Reechelonne == 1}
            />
            <label className="form-check-label" style={{ color: "steelblue" }}>
                Rééchelonné
            </label>
        </div>

        {/* Clôturé */}
        <div className="form-check form-switch">
            <input
                className={`form-check-input modern-input ${
                    fetchDataToUpdate && fetchDataToUpdate.Cloture == 1
                        ? "switch-warning"
                        : "switch-secondary"
                }`}
                type="checkbox"
                id="clotureSwitch"
                disabled
                checked={fetchDataToUpdate && fetchDataToUpdate.Cloture == 1}
            />
            <label className="form-check-label" style={{ color: "steelblue" }}>
                Clôturé
            </label>
        </div>

      
    </div>
</div>
</div>
                    </div>
                </div>
            </div>

            {/* Formulaire Nouveau Crédit / Modification */}
            {addNew ? (
                // Vue Nouveau Crédit
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-info-circle me-2"></i>
                                    Informations générales
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        width: "40%",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro dossier
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            getNumDossier &&
                                                            getNumDossier
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Type de crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm modern-select ${error.type_credit ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            settype_credit(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchTypeCredit &&
                                                            fetchTypeCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.id
                                                                        }
                                                                    >
                                                                        {
                                                                            res.type_credit
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.type_credit && (
                                                        <small className="text-danger">
                                                            {error.type_credit}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Récouvreur
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm modern-select ${error.recouvreur ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setrecouvreur(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.recouvreur && (
                                                        <small className="text-danger">
                                                            {error.recouvreur}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Mont. demandé
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        style={{
                                                            fontSize: "20px",
                                                        }}
                                                        className={`form-control form-control-sm modern-input ${error.montant_demande ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setmontant_demande(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={montant_demande}
                                                    />
                                                    {error.montant_demande && (
                                                        <small className="text-danger">
                                                            {
                                                                error.montant_demande
                                                            }
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Date demande
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="date"
                                                        className={`form-control form-control-sm modern-input ${error.date_demande ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setdate_demande(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.date_demande && (
                                                        <small className="text-danger">
                                                            {error.date_demande}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Fréquence
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm modern-select ${error.frequence_rembours ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setfrequence_rembours(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchFrequenceRembours &&
                                                            fetchFrequenceRembours.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.frequence_rembours
                                                                        }
                                                                    >
                                                                        {
                                                                            res.frequence_rembours
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.frequence_rembours && (
                                                        <small className="text-danger">
                                                            {
                                                                error.frequence_rembours
                                                            }
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nbr échnces
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm modern-input ${error.nbr_echeance ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setnbr_echeance(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.nbr_echeance && (
                                                        <small className="text-danger">
                                                            {error.nbr_echeance}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Monnaie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm modern-select ${error.monnaie ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setmonnaie(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        <option value="CDF">
                                                            CDF
                                                        </option>
                                                        <option value="USD">
                                                            USD
                                                        </option>
                                                    </select>
                                                    {error.monnaie && (
                                                        <small className="text-danger">
                                                            {error.monnaie}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Durée (jrs)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm modern-input ${error.duree ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setduree(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.duree && (
                                                        <small className="text-danger">
                                                            {error.duree}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Interval (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm modern-input ${error.interval ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setinterval(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.interval && (
                                                        <small className="text-danger">
                                                            {error.interval}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Période grâce (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setperiode_grace(
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-chart-line me-2"></i>
                                    Paramètres du crédit
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        width: "40%",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nom compte
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        disabled
                                                        value={
                                                            fetchData.data &&
                                                            fetchData.data
                                                                .NomCompte
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cpte épargne
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        disabled
                                                        value={
                                                            fetchData.data &&
                                                            fetchData.data
                                                                .NumCompte
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cpte crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        disabled
                                                        value={
                                                            fetchData.compteCredit &&
                                                            fetchData.compteCredit
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        E. garantie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        disabled
                                                        value={
                                                            fetchData.epargneCaution &&
                                                            fetchData.epargneCaution
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Objet crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm modern-select ${error.objet_credit ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setobjet_credit(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchObjetCredit &&
                                                            fetchObjetCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.objet
                                                                        }
                                                                    >
                                                                        {
                                                                            res.objet
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.objet_credit && (
                                                        <small className="text-danger">
                                                            {error.objet_credit}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Gestionnaire
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className={`form-select form-select-sm modern-select ${error.gestionnaire ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setgestionnaire(
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Sélectionnez
                                                        </option>
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                    {error.gestionnaire && (
                                                        <small className="text-danger">
                                                            {error.gestionnaire}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Source de fonds
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm modern-input ${error.source_fond ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            setsource_fond(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.source_fond && (
                                                        <small className="text-danger">
                                                            {error.source_fond}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux d'intérêt (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className={`form-control form-control-sm modern-input ${error.taux_interet ? "is-invalid" : ""}`}
                                                        onChange={(e) =>
                                                            settaux_interet(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {error.taux_interet && (
                                                        <small className="text-danger">
                                                            {error.taux_interet}
                                                        </small>
                                                    )}
                                                </td>
                                            </tr>
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux retard (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            settaux_retard(
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr> */}
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Échéances différées
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setechnce_differee(
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr> */}
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cycle
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        disabled
                                                    />
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-check-circle me-2"></i>
                                    Validation
                                </h6>
                            </div>
                            <div className="card-body d-flex align-items-center justify-content-center">
                                <button
                                    onClick={saveNewCredit}
                                    className="btn w-100 py-3 fw-bold"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #20c997, #198764)",
                                        color: "white",
                                        borderRadius: "12px",
                                        border: "none",
                                        fontSize: "16px",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 6px 16px rgba(32,201,151,0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                        e.currentTarget.style.boxShadow =
                                            "none";
                                    }}
                                >
                                    <i
                                        className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-save me-2"}`}
                                    ></i>
                                    Enregistrer le crédit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Vue Modification Crédit
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-info-circle me-2"></i>
                                    Informations générales
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        width: "40%",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Numéro dossier
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={numDossier_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Type de crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm modern-select"
                                                        onChange={(e) =>
                                                            settype_credit_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={type_credit_up}
                                                    >
                                                        <option
                                                            value={
                                                                fetchDataToUpdate?.RefTypeCredit
                                                            }
                                                        >
                                                            {
                                                                fetchDataToUpdate?.RefProduitCredit
                                                            }
                                                        </option>
                                                        {fetchTypeCredit &&
                                                            fetchTypeCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.id
                                                                        }
                                                                    >
                                                                        {
                                                                            res.type_credit
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Récouvreur
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm modern-select"
                                                        onChange={(e) =>
                                                            setrecouvreur_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={recouvreur_up}
                                                    >
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Montant demandé
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            setmontant_demande_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={
                                                            montant_demande_up
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Date demande
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            setdate_demande_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={date_demande_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Fréquence
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm modern-select"
                                                        onChange={(e) =>
                                                            setfrequence_rembours_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={
                                                            frequence_rembours_up
                                                        }
                                                    >
                                                        {fetchFrequenceRembours &&
                                                            fetchFrequenceRembours.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.frequence_rembours
                                                                        }
                                                                    >
                                                                        {
                                                                            res.frequence_rembours
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nombre échéances
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            setnbr_echeance_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={nbr_echeance_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Monnaie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        value={monnaie_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Durée (jrs)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            setduree_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={duree_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Interval (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            setinterval_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={interval_up}
                                                    />
                                                </td>
                                            </tr>
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Période grâce (jours)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setperiode_grace_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={periode_grace_up}
                                                    />
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-chart-line me-2"></i>
                                    Paramètres complémentaires
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        width: "40%",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Nom compte
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        value={NomCompte_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cpte Epargne
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        value={
                                                            compte_epargne_up
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cpte crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        value={compte_credit_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        E. garantie
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light modern-input"
                                                        value={
                                                            epargne_caution_up
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Objet crédit
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm modern-select"
                                                        onChange={(e) =>
                                                            setobjet_credit_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={objet_credit_up}
                                                    >
                                                        {fetchObjetCredit &&
                                                            fetchObjetCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.objet
                                                                        }
                                                                    >
                                                                        {
                                                                            res.objet
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Gestionnaire
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <select
                                                        className="form-select form-select-sm modern-select"
                                                        onChange={(e) =>
                                                            setgestionnaire_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={gestionnaire_up}
                                                    >
                                                        {fetchAgentCredit &&
                                                            fetchAgentCredit.map(
                                                                (res, idx) => (
                                                                    <option
                                                                        key={
                                                                            idx
                                                                        }
                                                                        value={
                                                                            res.name
                                                                        }
                                                                    >
                                                                        {
                                                                            res.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Source de fonds
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            setsource_fond_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={source_fond_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux d'intérêt (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            settaux_interet_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={taux_interet_up}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Taux retard (%)
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        onChange={(e) =>
                                                            settaux_retard_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={taux_retard_up}
                                                    />
                                                </td>
                                            </tr>
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Échéances différées
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        onChange={(e) =>
                                                            setechnce_differee_up(
                                                                e.target.value,
                                                            )
                                                        }
                                                        value={
                                                            echnce_differee_up
                                                        }
                                                    />
                                                </td>
                                            </tr> */}
                                            {/* <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Cycle
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm bg-light"
                                                        value={cycle_up}
                                                        disabled
                                                    />
                                                </td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-3 h-100">
                            <div className="card-header bg-white border-0 pt-3">
                                <h6
                                    className="fw-bold"
                                    style={{ color: "steelblue" }}
                                >
                                    <i className="fas fa-chart-simple me-2"></i>
                                    Récapitulatif
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <form>
                                    <table style={{ width: "100%" }}>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2">
                                                    <hr className="my-2" />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td
                                                    style={{
                                                        padding: "8px",
                                                        width: "50%",
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Solde capital
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate &&
                                                            numberWithSpaces(
                                                                fetchDataToUpdate.MontantAccorde,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Agence
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate?.CodeAgence
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Total intérêt
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate &&
                                                            numberWithSpaces(
                                                                fetchDataToUpdate.InteretDu,
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}>
                                                    <label
                                                        style={{
                                                            color: "steelblue",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Total général
                                                    </label>
                                                </td>
                                                <td style={{ padding: "8px" }}>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm modern-input"
                                                        style={{
                                                            background:
                                                                "#20c997",
                                                            color: "white",
                                                        }}
                                                        value={
                                                            fetchDataToUpdate &&
                                                            numberWithSpaces(
                                                                parseInt(
                                                                    fetchDataToUpdate.MontantAccorde,
                                                                ) +
                                                                    parseInt(
                                                                        fetchDataToUpdate.InteretDu,
                                                                    ),
                                                            )
                                                        }
                                                        disabled
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td
                                                    colSpan="2"
                                                    style={{
                                                        padding: "15px 8px 8px",
                                                    }}
                                                >
                                                    <button
                                                        onClick={
                                                            saveUpdateCredit
                                                        }
                                                        className="btn w-100 py-2 fw-bold"
                                                        style={{
                                                            background:
                                                                "linear-gradient(135deg, #007BFF, #0056b3)",
                                                            color: "white",
                                                            borderRadius:
                                                                "10px",
                                                        }}
                                                    >
                                                        <i className="fas fa-database me-2"></i>
                                                        Mettre à jour
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Onglets : Échéancier, Remboursement Manuel, Action */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-3">
                        <ul
                            className="nav nav-tabs tabs-credit"
                            id="creditTabs"
                            role="tablist"
                        >
                            <li className="nav-item">
                                <a
                                    className="nav-link active"
                                    id="echeancier-tab"
                                    data-toggle="pill"
                                    href="#echeancier"
                                    role="tab"
                                >
                                    <i className="fas fa-calendar-alt me-2"></i>
                                    Échéancier
                                </a>
                            </li>
                         
                               <li className="nav-item">
                                <a
                                    className="nav-link"
                                    id="remboursement-cap-tab"
                                    data-toggle="pill"
                                    href="#remboursement-cap"
                                    role="tab"
                                >
                                    <i className="fas fa-hand-holding-usd me-2"></i>
                                    Remboursement Capital
                                </a>
                            </li>
                              <li className="nav-item">
                                <a
                                    className="nav-link"
                                    id="remboursement-int-tab"
                                    data-toggle="pill"
                                    href="#remboursement-int"
                                    role="tab"
                                >
                                    <i className="fas fa-hand-holding-usd me-2"></i>
                                    Remboursement Intérêt
                                </a>
                            </li>
                            
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    id="action-tab"
                                    data-toggle="pill"
                                    href="#action"
                                    role="tab"
                                >
                                    <i className="fas fa-cog me-2"></i>Action
                                </a>
                            </li>
                        </ul>

                        <div className="card-body">
                            <div className="tab-content">
                                {/* Onglet Échéancier */}
                                <div
                                    className="tab-pane fade show active"
                                    id="echeancier"
                                    role="tabpanel"
                                >
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body">
                                                    <form>
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                            width: "45%",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Décision
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <select
                                                                            className="form-select form-select-sm modern-select"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setdecision(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Sélectionnez
                                                                            </option>
                                                                            <option value="Accepté">
                                                                                Accepté
                                                                            </option>
                                                                            <option value="Refusé">
                                                                                Refusé
                                                                            </option>
                                                                        </select>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Mode
                                                                            calcul
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <select
                                                                            className={`form-select form-select-sm modern-select ${error?.ModeCalcul ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setModeCalcul(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Sélectionnez
                                                                            </option>
                                                                            <option value="Degressif">
                                                                                Dégressif
                                                                            </option>
                                                                            <option value="Constant">
                                                                                Constant
                                                                            </option>
                                                                            <option value="Degressif__">
                                                                                Degressif
                                                                                M
                                                                                --
                                                                            </option>
                                                                        </select>
                                                                        {error?.ModeCalcul && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.ModeCalcul
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Date
                                                                            octroi
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            className={`form-control form-control-sm modern-input ${error?.DateOctroi ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setDateOctroi(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {error?.DateOctroi && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.DateOctroi
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Garantie
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <select
                                                                            className="form-select form-select-sm modern-select"
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setgarantie(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Sélectionnez
                                                                            </option>
                                                                            <option value="Caution solidaire">
                                                                                Caution
                                                                                solidaire
                                                                            </option>
                                                                            <option value="Salaire">
                                                                                Salaire
                                                                            </option>
                                                                            <option value="Hypothèque">
                                                                                Hypothèque
                                                                            </option>
                                                                            <option value="Autre">
                                                                                Autre
                                                                            </option>
                                                                        </select>
                                                                        {garantie ==
                                                                            "Hypothèque" && (
                                                                            <input
                                                                                type="text"
                                                                                className="form-control form-control-sm mt-2 modern-input"
                                                                                placeholder="Nom hypothèque"
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    sethypotheque_name(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card border-0 bg-light">
                                                <div className="card-body">
                                                    <form>
                                                        <table
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <tbody>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                            width: "45%",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Tombée
                                                                            échéance
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            className={`form-control form-control-sm modern-input ${error?.DateTombeEcheance ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setDateTombeEcheance(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {error?.DateTombeEcheance && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.DateTombeEcheance
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <label
                                                                            style={{
                                                                                color: "steelblue",
                                                                                fontWeight:
                                                                                    "500",
                                                                            }}
                                                                        >
                                                                            Dernière
                                                                            échéance
                                                                        </label>
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "8px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="date"
                                                                            className={`form-control form-control-sm modern-input ${error?.dateEcheance ? "is-invalid" : ""}`}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setdateEcheance(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {error?.dateEcheance && (
                                                                            <small className="text-danger">
                                                                                {
                                                                                    error.dateEcheance
                                                                                }
                                                                            </small>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                {ReechelonnerCheckboxValues.Reechelonner ==
                                                                    false && (
                                                                    <tr>
                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <label
                                                                                style={{
                                                                                    color: "steelblue",
                                                                                    fontWeight:
                                                                                        "500",
                                                                                }}
                                                                            >
                                                                                Montant
                                                                                accordé
                                                                            </label>
                                                                        </td>
                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                className={`form-control modern-input ${error?.MontantAccorde ? "is-invalid" : ""}`}
                                                                                style={{
                                                                                    background:
                                                                                        error?.MontantAccorde
                                                                                            ? "#dc3545"
                                                                                            : "#20c997",
                                                                                    color: "black",
                                                                                    fontWeight:
                                                                                        "bold",
                                                                                    fontSize:
                                                                                        "20px",
                                                                                }}
                                                                                value={
                                                                                    MontantAccorde || ""
                                                                                }
                                                                                onChange={
                                                                                    handleMontantChange
                                                                                }
                                                                            />
                                                                            {error?.MontantAccorde && (
                                                                                <small className="text-danger">
                                                                                    {
                                                                                        error.MontantAccorde
                                                                                    }
                                                                                </small>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                <tr>
                                                                    <td
                                                                        colSpan="2"
                                                                        style={{
                                                                            padding:
                                                                                "15px 8px 8px",
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={
                                                                                saveEcheancier
                                                                            }
                                                                            className="btn w-100 py-2"
                                                                            style={{
                                                                                background:
                                                                                    "linear-gradient(135deg, #20c997, #198764)",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-save me-2"></i>
                                                                            Enregistrer
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card border-0 bg-light h-100">
                                                <div className="card-body d-flex align-items-center justify-content-center">
                                                    <div className="form-check form-switch">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="Reechelonner"
                                                            name="Reechelonner"
                                                            style={{
                                                                width: "48px",
                                                                height: "24px",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.2s ease",
                                                            }}
                                                            checked={
                                                                ReechelonnerCheckboxValues.Reechelonner
                                                            }
                                                            onChange={
                                                                handleCheckboxChangeReechelonne
                                                            }
                                                            onMouseEnter={(
                                                                e,
                                                            ) => {
                                                                e.currentTarget.style.transform =
                                                                    "scale(1.05)";
                                                            }}
                                                            onMouseLeave={(
                                                                e,
                                                            ) => {
                                                                e.currentTarget.style.transform =
                                                                    "scale(1)";
                                                            }}
                                                        />
                                                        <label
                                                            className="form-check-label ms-2"
                                                            htmlFor="Reechelonner"
                                                            style={{
                                                                color: ReechelonnerCheckboxValues.Reechelonner
                                                                    ? "#20c997"
                                                                    : "steelblue",
                                                                fontWeight:
                                                                    "500",
                                                                fontSize:
                                                                    "14px",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "color 0.2s ease",
                                                            }}
                                                        >
                                                            <i
                                                                className={`fas ${ReechelonnerCheckboxValues.Reechelonner ? "fa-check-circle" : "fa-sync-alt"} me-2 ml-2`}
                                                            ></i>
                                                            Réechelonner ?
                                                            {ReechelonnerCheckboxValues.Reechelonner && (
                                                                <span
                                                                    className="ms-2 badge bg-warning"
                                                                    style={{
                                                                        fontSize:
                                                                            "10px",
                                                                        backgroundColor:
                                                                            "#ffc107",
                                                                        color: "#1a2632",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    Actif
                                                                </span>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                              {/* Onglet Remboursement Manuel - CAPITAL */}
<div className="tab-pane fade" id="remboursement-cap" role="tabpanel" aria-labelledby="remboursement-cap-tab">
    <div className="row">
        <div className="col-md-8">
            <div className="card border-0 bg-light">
                <div className="card-body">
                    <form>
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: "12px", width: "35%" }}>
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="RemboursementAnticipativeCapital"
                                                name="RemboursementAnticipativeCapital"
                                                style={{ width: "40px", height: "20px", cursor: "pointer" }}
                                                checked={checkboxValues.RemboursementAnticipativeCapital}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label
                                                className="form-check-label ms-2"
                                                htmlFor="RemboursementAnticipativeCapital"
                                                style={{ color: "steelblue", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}
                                            >
                                                <i className="fas fa-forward me-2"></i>
                                                Remboursement Anticipé ?
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "12px" }}>
                                        <label style={{ color: "steelblue", fontWeight: "500" }}>
                                            Montant à rembourser (Capital)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm modern-input"
                                            onChange={(e) => setMontantRemboursementCapital(e.target.value)}
                                            placeholder="0,00"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "12px" }}>
                                        <button
                                            onClick={handleRemboursementCapital}
                                            className="btn w-100 py-2"
                                            style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }}
                                        >
                                            <i className="fas fa-database me-2"></i>
                                            Rembourser le capital
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

{/* Onglet Remboursement Manuel - INTÉRÊTS */}
<div className="tab-pane fade" id="remboursement-int" role="tabpanel" aria-labelledby="remboursement-int-tab">
    <div className="row">
        <div className="col-md-8">
            <div className="card border-0 bg-light">
                <div className="card-body">
                    <form>
                        <table style={{ width: "100%" }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: "12px", width: "35%" }}>
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="RemboursementAnticipativeInteret"
                                                name="RemboursementAnticipativeInteret"
                                                style={{ width: "40px", height: "20px", cursor: "pointer" }}
                                                checked={checkboxValues.RemboursementAnticipativeInteret}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label
                                                className="form-check-label ms-2"
                                                htmlFor="RemboursementAnticipativeInteret"
                                                style={{ color: "steelblue", fontWeight: "500", fontSize: "14px", cursor: "pointer" }}
                                            >
                                                <i className="fas fa-forward me-2"></i>
                                                Remboursement Anticipé ?
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "12px" }}>
                                        <label style={{ color: "steelblue", fontWeight: "500" }}>
                                            Montant à rembourser (Intérêts)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm modern-input"
                                            onChange={(e) => setMontantRemboursementInteret(e.target.value)}
                                            placeholder="0,00"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "12px" }}>
                                        <button
                                            onClick={handleRemboursementInteret}
                                            className="btn w-100 py-2"
                                            style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }}
                                        >
                                            <i className="fas fa-database me-2"></i>
                                            Rembourser les intérêts
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div><div className="tab-pane fade" id="action" role="tabpanel">
    <div className="row">
        <div className="col-md-12">
            <div className="card border-0 bg-light">
                <div className="card-body">
                    {/* Grille des 4 boutons */}
                 <div className="row g-4">
    {/* Bouton Accorder */}
    <div className="col-md-3">
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
                <i className="fas fa-thumbs-up fa-2x text-success mb-2"></i>
                <h6 className="card-title mb-1">Accorder le crédit</h6>
                <p className="card-text small text-muted">
                    Validation administrative du dossier.
                </p>
                {fetchDataToUpdate && fetchDataToUpdate.Accorde == 1 ? (
                    <button disabled className="btn btn-secondary w-100 mt-2">
                        <i className="fas fa-check-circle me-2"></i> Déjà accordé
                    </button>
                ) : (
                    <button onClick={AccordeCredit} className="btn btn-success w-100 mt-2">
                        <i className="fas fa-thumbs-up me-2"></i> Accorder
                    </button>
                )}
            </div>
        </div>
    </div>

    {/* Bouton Débourser */}
    <div className="col-md-3">
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
                <i className="fas fa-hand-holding-usd fa-2x text-info mb-2"></i>
                <h6 className="card-title mb-1">Débourser les fonds</h6>
                <p className="card-text small text-muted">
                    Transfert des fonds sur le compte épargne.
                </p>
                {fetchDataToUpdate && fetchDataToUpdate.Octroye == 1 ? (
                    <button disabled className="btn btn-secondary w-100 mt-2">
                        <i className="fas fa-check-circle me-2"></i> Déjà déboursé
                    </button>
                ) : (
                    <button onClick={DeccaissementCredit} className="btn btn-info w-100 mt-2 text-white">
                        <i className="fas fa-hand-holding-usd me-2"></i> Débourser
                    </button>
                )}
            </div>
        </div>
    </div>

    {/* Bouton Clôturer */}
    <div className="col-md-3">
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
                <i className="fas fa-lock fa-2x text-danger mb-2"></i>
                <h6 className="card-title mb-1">Clôturer le crédit</h6>
                <p className="card-text small text-muted">
                    Terminer le crédit, restituer la garantie.
                </p>
                {fetchDataToUpdate && fetchDataToUpdate.Cloture == 1 ? (
                    <button disabled className="btn btn-secondary w-100 mt-2">
                        <i className="fas fa-lock me-2"></i> Déjà clôturé
                    </button>
                ) : (
                    <button onClick={ClotureCredit} className="btn btn-danger w-100 mt-2">
                        <i className="fas fa-lock me-2"></i> Clôturer
                    </button>
                )}
            </div>
        </div>
    </div>

    {/* Bouton Remboursement Anticipé */}
    <div className="col-md-3">
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
                <i className="fas fa-forward fa-2x text-warning mb-2"></i>
                <h6 className="card-title mb-1">Remboursement anticipé</h6>
                <p className="card-text small text-muted">
                    Solde total du crédit (capital + intérêts).
                </p>
                <button
                    onClick={handleRemboursementAnticipe}
                    className="btn btn-warning w-100 mt-2"
                    title="Utilise le solde du compte pour solder tout le restant dû"
                >
                    <i className="fas fa-forward me-2"></i> Remboursement anticipé
                </button>
            </div>
        </div>
    </div>
</div>

                    {/* Message d'information contextuel */}
                    <div className="mt-4 p-3" style={{ background: "#e6f2f9", borderRadius: "10px" }}>
                        <small className="text-muted">
                            <i className="fas fa-info-circle me-2"></i>
                            {fetchDataToUpdate && fetchDataToUpdate.Accorde == 1 && fetchDataToUpdate.Octroye == 0 &&
                                "Crédit accordé mais non encore déboursé. Cliquez sur 'Débourser' pour libérer les fonds."}
                            {fetchDataToUpdate && fetchDataToUpdate.Accorde == 1 && fetchDataToUpdate.Octroye == 1 && fetchDataToUpdate.Cloture == 0 &&
                                "Crédit en cours de remboursement. Les échéances sont actives."}
                            {fetchDataToUpdate && fetchDataToUpdate.Cloture == 1 &&
                                "Crédit clôturé. Aucune action supplémentaire n'est requise."}
                            {(!fetchDataToUpdate || (fetchDataToUpdate.Accorde == 0 && fetchDataToUpdate.Octroye == 0 && fetchDataToUpdate.Cloture == 0)) &&
                                "Crédit en attente de validation. Veuillez d'abord accorder le crédit."}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    /* Onglets crédit - version moderne */
.tabs-credit {
  display: flex;
  gap: 0.25rem;
  background: transparent;
  border-bottom: 1px solid #eef2f6;
  padding: 0;
  margin-bottom: 1.5rem;
}

.tabs-credit .nav-item {
  list-style: none;
  margin-bottom: -1px;
}

.tabs-credit .nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #5f7d9c;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  cursor: pointer;
}

.tabs-credit .nav-link i {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

/* Effet hover */
.tabs-credit .nav-link:hover {
  color: #20c997;  /* couleur principale du thème crédit */
  border-bottom-color: #b9f5e2;
  background: #fafffd;
}

/* Onglet actif */
.tabs-credit .nav-link.active {
  color: #20c997;
  border-bottom-color: #20c997;
  background: white;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.02);
}

/* Animation icône au hover */
.tabs-credit .nav-link:hover i {
  transform: translateY(-1px);
}

/* Responsive mobile */
@media (max-width: 640px) {
  .tabs-credit {
    flex-wrap: wrap;
    gap: 0.5rem;
    border-bottom: none;
  }
  .tabs-credit .nav-link {
    border-bottom: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 0.5rem 1rem;
  }
  .tabs-credit .nav-link.active {
    border-bottom-color: #20c997;
    background: #e6faf4;
  }
}
                    
                    `}
            </style>
        </div>
    );
};

export default MontageCredit;

















// const TableWithPagination = ({ data, itemsPerPage, renderRow }) => {
//     const [currentPage, setCurrentPage] = useState(1);
//     const totalPages = Math.ceil(data.length / itemsPerPage);
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const currentData = data.slice(startIndex, endIndex);

//     const goToPage = (page) => {
//         if (page >= 1 && page <= totalPages) {
//             setCurrentPage(page);
//         }
//     };

//     if (totalPages === 0) return null;

//     return (
//         <>
//             <div className="table-responsive">
//                 <table className="table table-sm table-hover mb-0">
//                     <thead>
//                         <tr style={{ color: "steelblue" }}>
//                             <th>Réf.</th>
//                             <th>Montant</th>
//                             <th>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{currentData.map(renderRow)}</tbody>
//                 </table>
//             </div>
//             {totalPages > 1 && (
//                 <div className="d-flex justify-content-between align-items-center p-1 border-top">
//                     <button
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={() => goToPage(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         style={{ padding: "2px 6px", fontSize: "11px" }}
//                     >
//                         <i className="fas fa-chevron-left"></i> Préc.
//                     </button>
//                     <span
//                         className="small text-muted"
//                         style={{ fontSize: "10px" }}
//                     >
//                         {currentPage}/{totalPages}
//                     </span>
//                     <button
//                         className="btn btn-sm btn-outline-secondary"
//                         onClick={() => goToPage(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         style={{ padding: "2px 6px", fontSize: "11px" }}
//                     >
//                         Suiv. <i className="fas fa-chevron-right"></i>
//                     </button>
//                 </div>
//             )}
//         </>
//     );
// };

// // import styles from "../styles/RegisterForm.module.css";
// import { useState, use, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import RecuDepot from "./Modals/RecuDepot";
// import { Bars } from "react-loader-spinner";
// import RecuDepotA5 from "./Modals/RecuDepotA5";
// // import { useNavigate } from "react-router-dom";

// const DepotEspece = () => {
//     //CDF ATTRIBUTE
//     const [vightMille, setvightMille] = useState(0);
//     const [dixMille, setdixMille] = useState(0);
//     const [cinqMille, setcinqMille] = useState(0);
//     const [milleFranc, setmilleFranc] = useState(0);
//     const [cinqCentFr, setcinqCentFr] = useState(0);
//     const [deuxCentFranc, setdeuxCentFranc] = useState(0);
//     const [centFranc, setcentFranc] = useState(0);
//     const [cinquanteFanc, setcinquanteFanc] = useState(0);

//     //USD ATTRIBUTE
//     const [hundred, sethundred] = useState(0);
//     const [fitfty, setfitfty] = useState(0);
//     const [twenty, settwenty] = useState(0);
//     const [ten, setten] = useState(0);
//     const [five, setfive] = useState(0);
//     const [oneDollar, setoneDollar] = useState(0);

//     const [searched_account, setsearched_account] = useState();
//     const [fetchData, setFetchData] = useState();
//     const [devise, setDevise] = useState("CDF");
//     const [motifDepot, setMotifDepot] = useState("EPARGNE");
//     const [DeposantName, setDeposantName] = useState();
//     const [DeposantPhone, setDeposantPhone] = useState();
//     const [Montant, setMontant] = useState(0);
//     const [loading, setloading] = useState(false);
//     const [error, setError] = useState([]);
//     const [fetchData2, setfetchData2] = useState();
//     const [Commission, setCommission] = useState(0);
//     const [GetCommissionConfig, setGetCommissionConfig] = useState("");
//     const [GetRecuConfig, setGetRecuConfig] = useState("");
//     const [getBilletageCDF, setGetBilletageCDF] = useState();
//     const [getBilletageUSD, setGetBilletageUSD] = useState();
//     const [selectedData, setSelectedData] = useState(null);
//     const [loadingData, setloadingData] = useState(false);
//     const [getNumCompte, setGetNumCompte] = useState();
//     const [isLoadingBar, setIsLoadingBar] = useState();
//     const [fetchSolde, setFetchSolde] = useState();
//     //GET SEACHED DATA
//     const getSeachedData = async (e) => {
//         e.preventDefault();
//         setloadingData(true);
//         const res = await axios.post("/eco/page/depot-espece/get-account/2", {
//             searched_account: searched_account,
//         });
//         if (res.data.status == 1) {
//             setloadingData(false);
//             setFetchData(res.data.data);
//             console.log(fetchData);
//         } else {
//             setloadingData(false);
//             Swal.fire({
//                 title: "Erreur",
//                 text: res.data.msg,
//                 icon: "error",
//                 timer: 8000,
//                 confirmButtonText: "Okay",
//             });
//         }
//     };

//     useEffect(() => {
//         getCommissionConfig();
//         getBilletage();
//     }, []);

//     const getBilletage = async () => {
//         const res = await axios.get("/eco/depot/get-recu");
//         if (res.data.status == 1) {
//             setGetBilletageCDF(res.data.dataCDF);
//             setGetBilletageUSD(res.data.dataUSD);
//         }
//     };

//     const getCommissionConfig = async () => {
//         const res = await axios.get("/eco/pages/get-commission-setting");
//         if (res.data.status == 1) {
//             console.log(res.data.data);
//             setGetCommissionConfig(res.data.data);
//             setGetRecuConfig(res.data.type_recu);
//         }
//     };
//     const saveOperation = async (e) => {
//         e.preventDefault();

//         // ✅ VALIDATION AVANT TOUT - Vérifier que DeposantName est rempli
//         if (!DeposantName || DeposantName.trim() === "") {
//             Swal.fire({
//                 title: "Champ obligatoire",
//                 text: "Veuillez renseigner le nom du déposant avant de valider l'opération.",
//                 icon: "warning",
//                 timer: 4000,
//                 confirmButtonText: "D'accord",
//                 confirmButtonColor: "#138496",
//             });
//             // Focus sur le champ DeposantName pour une meilleure UX
//             document.getElementById("DeposantName")?.focus();
//             return; // ⚠️ IMPORTANT : on arrête l'exécution ici
//         }

//         // ✅ Optionnel : valider aussi le montant si nécessaire
//         if (!Montant || parseFloat(Montant) <= 0) {
//             Swal.fire({
//                 title: "Montant invalide",
//                 text: "Veuillez saisir un montant valide.",
//                 icon: "warning",
//                 timer: 4000,
//                 confirmButtonText: "D'accord",
//                 confirmButtonColor: "#138496",
//             });
//             document.getElementById("Montant")?.focus();
//             return;
//         }

//         // Maintenant seulement on active le loading et on fait l'appel API
//         setloading(true);
//         setIsLoadingBar(true);

//         try {
//             const res = await axios.post(
//                 "/eco/page/depot-espece/save-deposit",
//                 {
//                     vightMille,
//                     dixMille,
//                     cinqMille,
//                     milleFranc,
//                     cinqCentFr,
//                     deuxCentFranc,
//                     centFranc,
//                     cinquanteFanc,
//                     hundred,
//                     fitfty,
//                     twenty,
//                     ten,
//                     five,
//                     oneDollar,
//                     devise: fetchData2.CodeMonnaie == 1 ? "USD" : "CDF",
//                     motifDepot,
//                     DeposantName,
//                     DeposantPhone,
//                     Montant,
//                     NumAbrege: searched_account,
//                     Commission,
//                     getNumCompte,
//                 },
//             );
//             if (res.data.status == 1) {
//                 setloading(false);
//                 setIsLoadingBar(false);
//                 setDeposantName("");
//                 setDeposantPhone("");
//                 setMontant("0");
//                 setvightMille(0);
//                 setdixMille(0);
//                 setcinqMille(0);
//                 setmilleFranc(0);
//                 setcinqCentFr(0);
//                 setdeuxCentFranc(0);
//                 setcentFranc(0);
//                 setcinquanteFanc(0);
//                 sethundred(0);
//                 setfitfty(0);
//                 settwenty(0);
//                 setten(0);
//                 setfive(0);
//                 setoneDollar(0);
//                 setCommission(0);
//                 Swal.fire({
//                     title: "Succès",
//                     text: res.data.msg,
//                     icon: "success",
//                     timer: 8000,
//                     confirmButtonText: "Okay",
//                 });
//                 getBilletage();
//             } else if (res.data.status == 0) {
//                 setloading(false);
//                 setIsLoadingBar(false);
//                 Swal.fire({
//                     title: "Erreur",
//                     text: res.data.msg,
//                     icon: "error",
//                     timer: 8000,
//                     confirmButtonText: "Okay",
//                 });
//             } else {
//                 setloading(false);
//                 setError(res.data.validate_error);
//             }
//         } catch (error) {
//             setloading(false);
//             setIsLoadingBar(false);
//             Swal.fire({
//                 title: "Erreur",
//                 text: "Erreur de connexion. Tentative de nouvelle connexion...",
//                 icon: "error",
//                 timer: 8000,
//                 confirmButtonText: "Okay",
//             });
//             setTimeout(() => {
//                 saveOperation(e);
//             }, 5000);
//         } finally {
//             setloading(false);
//             setIsLoadingBar(false);
//         }
//     };
//     const getAccountInfo = async (event) => {
//         if (event.detail == 2) {
//             setloadingData(true);
//             const res = await axios.post(
//                 "/eco/page/depot-espece/get-account/specific",
//                 {
//                     NumCompte: event.target.innerHTML,
//                 },
//             );
//             if (res.data.status == 1) {
//                 setloadingData(false);
//                 setfetchData2(res.data.data);
//                 setGetNumCompte(event.target.innerHTML);
//                 fetchData2 && setDeposantName(fetchData2.NomCompte);
//                 setFetchSolde(res.data.soldeCompte);
//                 console.log(DeposantName);
//             } else {
//                 setloadingData(false);
//                 Swal.fire({
//                     title: "Erreur",
//                     text: res.data.msg,
//                     icon: "error",
//                     timer: 8000,
//                     confirmButtonText: "Okay",
//                 });
//             }
//         }
//     };

//     const handlePrintClick = (data) => {
//         setSelectedData(data);

//         // Si A5 → imprimer directement
//     };
//     let myspinner = {
//         margin: "5px auto",
//         width: "3rem",
//         marginTop: "180px",
//         border: "0px",
//         height: "200px",
//     };

//     return (
//         <>
//             {loadingData ? (
//                 <div className="row" id="rowspinner">
//                     <div className="myspinner" style={myspinner}>
//                         <span className="spinner-border" role="status"></span>
//                         <span style={{ marginLeft: "-20px" }}>
//                             Chargement...
//                         </span>
//                     </div>
//                 </div>
//             ) : (
//                 <div
//                     className="container-fluid"
//                     style={{ marginTop: "10px", padding: "0 15px" }}
//                 >
//                     {/* En-tête moderne */}
//                     <div className="row mb-4">
//                         <div className="col-12">
//                             <div className="card border-0 shadow-sm rounded-3">
//                                 <div
//                                     className="card-body p-3"
//                                     style={{
//                                         background: "#138496",
//                                         borderRadius: "12px",
//                                     }}
//                                 >
//                                     <div className="d-flex align-items-center">
//                                         <div className="me-3">
//                                             <i
//                                                 className="fas fa-money-bill-wave"
//                                                 style={{
//                                                     fontSize: "28px",
//                                                     color: "white",
//                                                 }}
//                                             ></i>
//                                         </div>
//                                         <div>
//                                             <h5 className="text-white fw-bold mb-0">
//                                                 Dépôt D'Espèce
//                                             </h5>
//                                             <small className="text-white-50">
//                                                 Enregistrement des opérations de
//                                                 dépôt
//                                             </small>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Loading Overlay */}
//                     {isLoadingBar && (
//                         <div
//                             style={{
//                                 position: "fixed",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 display: "flex",
//                                 justifyContent: "center",
//                                 alignItems: "center",
//                                 backgroundColor: "rgba(0, 0, 0, 0.7)",
//                                 zIndex: 1050,
//                                 backdropFilter: "blur(3px)",
//                             }}
//                         >
//                             <div className="text-center bg-white p-4 rounded-4 shadow-lg">
//                                 <Bars
//                                     height="80"
//                                     width="80"
//                                     color="#20c997"
//                                     ariaLabel="loading"
//                                 />
//                                 <h5 className="mt-3 text-dark">Patientez...</h5>
//                                 <small className="text-muted">
//                                     Traitement en cours
//                                 </small>
//                             </div>
//                         </div>
//                     )}

//                     {/* Section 1: Recherche et informations compte */}
//                     <div className="row g-3 mb-4">
//                         {/* Recherche compte */}
//                         <div className="col-md-4">
//                             <div className="card border-0 shadow-sm rounded-3 h-100">
//                                 <div className="card-header bg-white border-0 pt-3 pb-0">
//                                     <h6
//                                         className="fw-bold"
//                                         style={{ color: "steelblue" }}
//                                     >
//                                         <i className="fas fa-search me-2"></i>
//                                         Recherche Compte
//                                     </h6>
//                                 </div>
//                                 <div className="card-body">
//                                     <div className="mb-3">
//                                         <div className="input-group">
//                                             <input
//                                                 id="compte_to_search"
//                                                 name="compte_to_search"
//                                                 type="text"
//                                                 className="form-control"
//                                                 placeholder="Numéro de compte..."
//                                                 style={{
//                                                     borderRadius:
//                                                         "10px 0 0 10px",
//                                                 }}
//                                                 onChange={(e) => {
//                                                     setsearched_account(
//                                                         e.target.value,
//                                                     );
//                                                 }}
//                                             />
//                                             <button
//                                                 className="btn"
//                                                 style={{
//                                                     borderRadius:
//                                                         "0 10px 10px 0",
//                                                     background: "teal",
//                                                     color: "white",
//                                                     border: "none",
//                                                 }}
//                                                 onClick={getSeachedData}
//                                             >
//                                                 <i className="fas fa-search me-1"></i>
//                                                 Rechercher
//                                             </button>
//                                         </div>
//                                     </div>
//                                     <hr className="my-3" />

//                                     <form>
//                                         <table
//                                             style={{ width: "100%" }}
//                                             className="table-sm"
//                                         >
//                                             <tbody>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "5px",
//                                                             width: "40%",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Intitulé de compte
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "5px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="intituleCompte"
//                                                             name="intituleCompte"
//                                                             type="text"
//                                                             className="form-control"
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                                 backgroundColor:
//                                                                     "#f8f9fa",
//                                                             }}
//                                                             value={
//                                                                 fetchData2 &&
//                                                                 fetchData2.NomCompte
//                                                             }
//                                                             disabled
//                                                         />
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "5px",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Numéro de compte
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "5px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="NumCompte"
//                                                             name="NumCompte"
//                                                             type="text"
//                                                             className="form-control"
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                                 backgroundColor:
//                                                                     "#f8f9fa",
//                                                             }}
//                                                             disabled
//                                                             value={
//                                                                 fetchData2 &&
//                                                                 fetchData2.NumCompte
//                                                             }
//                                                         />
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "5px",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Code Agence
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "5px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="CodeAgence"
//                                                             name="CodeAgence"
//                                                             type="text"
//                                                             className="form-control"
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                                 backgroundColor:
//                                                                     "#f8f9fa",
//                                                                 width: "100px",
//                                                             }}
//                                                             value={
//                                                                 fetchData2 &&
//                                                                 fetchData2.CodeAgence
//                                                             }
//                                                             disabled
//                                                         />
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Liste des comptes */}
//                         <div className="col-md-4">
//                             <div className="card border-0 shadow-sm rounded-3 h-100">
//                                 <div className="card-header bg-white border-0 pt-3 pb-0">
//                                     <h6
//                                         className="fw-bold"
//                                         style={{ color: "steelblue" }}
//                                     >
//                                         <i className="fas fa-list me-2"></i>
//                                         Liste des comptes
//                                     </h6>
//                                 </div>
//                                 <div className="card-body p-0">
//                                     <div
//                                         style={{
//                                             maxHeight: "320px",
//                                             overflowY: "auto",
//                                         }}
//                                     >
//                                         <table className="table table-hover mb-0 table-sm">
//                                             <tbody>
//                                                 {fetchData &&
//                                                     fetchData.map(
//                                                         (res, index) => {
//                                                             return (
//                                                                 <tr
//                                                                     key={index}
//                                                                     className="clickable-row"
//                                                                     style={{
//                                                                         cursor: "pointer",
//                                                                     }}
//                                                                     onClick={(
//                                                                         event,
//                                                                     ) =>
//                                                                         getAccountInfo(
//                                                                             event,
//                                                                         )
//                                                                     }
//                                                                 >
//                                                                     <td className="py-2 px-3 fw-semibold">
//                                                                         {
//                                                                             res.NumCompte
//                                                                         }
//                                                                     </td>
//                                                                     <td className="py-2 px-3">
//                                                                         <span
//                                                                             className={`badge ${res.CodeMonnaie == 1 ? "bg-info" : "bg-success"}`}
//                                                                         >
//                                                                             {res.CodeMonnaie ==
//                                                                             1
//                                                                                 ? "USD"
//                                                                                 : "CDF"}
//                                                                         </span>
//                                                                     </td>
//                                                                 </tr>
//                                                             );
//                                                         },
//                                                     )}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Solde compte */}
//                         {fetchSolde && (
//                             <div className="col-md-4">
//                                 <div
//                                     className="card border-0 shadow-sm rounded-3 h-100"
//                                     style={{
//                                         background:
//                                             "linear-gradient(135deg, teal 0%, #0a6b6b 100%)",
//                                     }}
//                                 >
//                                     <div className="card-body text-center">
//                                         <i className="fas fa-chart-line fa-2x mb-2 opacity-75 text-white"></i>
//                                         <h6 className="text-white-50 mb-2">
//                                             Solde du compte
//                                         </h6>
//                                         <h2 className="fw-bold mb-0 text-white">
//                                             {fetchData2 &&
//                                             fetchData2.CodeMonnaie == 1
//                                                 ? "USD "
//                                                 : "CDF "}
//                                             {fetchSolde.soldeMembre?.toFixed(
//                                                 2,
//                                             ) || "0.00"}
//                                         </h2>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Séparateur décoratif */}
//                     <div className="position-relative my-4">
//                         <hr
//                             className="border-2"
//                             style={{ borderColor: "#e9ecef" }}
//                         />
//                         <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
//                             <i className="fas fa-arrow-down me-1"></i>{" "}
//                             Informations de dépôt
//                         </span>
//                     </div>

//                     {/* Section 2: Formulaire de dépôt */}
//                     <div className="row g-3">
//                         {/* Informations du dépôt */}
//                         <div className="col-md-4">
//                             <div className="card border-0 shadow-sm rounded-3">
//                                 <div className="card-header bg-white border-0 pt-3">
//                                     <h6
//                                         className="fw-bold"
//                                         style={{ color: "steelblue" }}
//                                     >
//                                         <i className="fas fa-info-circle me-2"></i>
//                                         Informations
//                                     </h6>
//                                 </div>
//                                 <div className="card-body">
//                                     <form>
//                                         <table
//                                             style={{ width: "100%" }}
//                                             className="table-sm"
//                                         >
//                                             <tbody>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                             width: "35%",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Devise
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <select
//                                                             id="devise"
//                                                             name="devise"
//                                                             className={`form-control ${error.devise ? "is-invalid" : ""}`}
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                             }}
//                                                             disabled
//                                                             onChange={(e) => {
//                                                                 setDevise(
//                                                                     e.target
//                                                                         .value,
//                                                                 );
//                                                             }}
//                                                         >
//                                                             <option
//                                                                 value={
//                                                                     fetchData2 &&
//                                                                     fetchData2.CodeMonnaie ==
//                                                                         1
//                                                                         ? "USD"
//                                                                         : "CDF"
//                                                                 }
//                                                             >
//                                                                 {fetchData2 &&
//                                                                 fetchData2.CodeMonnaie ==
//                                                                     1
//                                                                     ? "USD"
//                                                                     : "CDF"}
//                                                             </option>
//                                                         </select>
//                                                         {error.devise && (
//                                                             <small className="text-danger d-block mt-1">
//                                                                 {error.devise}
//                                                             </small>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Motif
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="motifDepot"
//                                                             name="motifDepot"
//                                                             type="text"
//                                                             className={`form-control ${error.motifDepot ? "is-invalid" : ""}`}
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                                 textTransform:
//                                                                     "uppercase",
//                                                             }}
//                                                             onChange={(e) =>
//                                                                 setMotifDepot(
//                                                                     e.target
//                                                                         .value,
//                                                                 ).toUpperCase()
//                                                             }
//                                                             value={motifDepot}
//                                                             placeholder="Motif du dépôt"
//                                                         />
//                                                         {error.motifDepot && (
//                                                             <small className="text-danger d-block mt-1">
//                                                                 {
//                                                                     error.motifDepot
//                                                                 }
//                                                             </small>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Déposant{" "}
//                                                             <span className="text-danger">
//                                                                 *
//                                                             </span>
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="DeposantName"
//                                                             name="DeposantName"
//                                                             required
//                                                             type="text"
//                                                             className={`form-control ${error.DeposantName ? "is-invalid" : ""}`}
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                                 textTransform:
//                                                                     "uppercase",
//                                                             }}
//                                                             onChange={(e) =>
//                                                                 setDeposantName(
//                                                                     e.target
//                                                                         .value,
//                                                                 ).toUpperCase()
//                                                             }
//                                                             value={DeposantName}
//                                                             placeholder="Nom du déposant"
//                                                         />
//                                                         {error.DeposantName && (
//                                                             <small className="text-danger d-block mt-1">
//                                                                 {
//                                                                     error.DeposantName
//                                                                 }
//                                                             </small>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Téléphone
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="DeposantPhone"
//                                                             name="DeposantPhone"
//                                                             type="text"
//                                                             className="form-control"
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                             }}
//                                                             onChange={(e) =>
//                                                                 setDeposantPhone(
//                                                                     e.target
//                                                                         .value,
//                                                                 )
//                                                             }
//                                                             value={
//                                                                 DeposantPhone
//                                                             }
//                                                             placeholder="Numéro de téléphone"
//                                                         />
//                                                     </td>
//                                                 </tr>
//                                                 {GetCommissionConfig == 1 && (
//                                                     <tr>
//                                                         <td
//                                                             style={{
//                                                                 padding: "8px",
//                                                             }}
//                                                         >
//                                                             <label
//                                                                 style={{
//                                                                     color: "steelblue",
//                                                                     fontWeight:
//                                                                         "500",
//                                                                 }}
//                                                             >
//                                                                 Commission
//                                                             </label>
//                                                         </td>
//                                                         <td
//                                                             style={{
//                                                                 padding: "8px",
//                                                             }}
//                                                         >
//                                                             <input
//                                                                 id="Commission"
//                                                                 name="Commission"
//                                                                 type="text"
//                                                                 className="form-control"
//                                                                 style={{
//                                                                     borderRadius:
//                                                                         "8px",
//                                                                     width: "100px",
//                                                                 }}
//                                                                 onChange={(e) =>
//                                                                     setCommission(
//                                                                         e.target
//                                                                             .value,
//                                                                     )
//                                                                 }
//                                                                 value={
//                                                                     Commission
//                                                                 }
//                                                             />
//                                                         </td>
//                                                     </tr>
//                                                 )}
//                                                 <tr>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <label
//                                                             style={{
//                                                                 color: "steelblue",
//                                                                 fontWeight:
//                                                                     "500",
//                                                             }}
//                                                         >
//                                                             Montant
//                                                         </label>
//                                                     </td>
//                                                     <td
//                                                         style={{
//                                                             padding: "8px",
//                                                         }}
//                                                     >
//                                                         <input
//                                                             id="Montant"
//                                                             name="Montant"
//                                                             type="text"
//                                                             className={`form-control ${error.Montant ? "is-invalid" : ""}`}
//                                                             style={{
//                                                                 borderRadius:
//                                                                     "8px",
//                                                                 fontWeight:
//                                                                     "bold",
//                                                                 fontSize:
//                                                                     "18px",
//                                                             }}
//                                                             onChange={(e) =>
//                                                                 setMontant(
//                                                                     e.target
//                                                                         .value,
//                                                                 )
//                                                             }
//                                                             value={Montant}
//                                                             placeholder="0,00"
//                                                         />
//                                                         {error.Montant && (
//                                                             <small className="text-danger d-block mt-1">
//                                                                 {error.Montant}
//                                                             </small>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Billetage */}
//                         <div className="col-md-5">
//                             <div className="card border-0 shadow-sm rounded-3">
//                                 <div className="card-header bg-white border-0 pt-3">
//                                     <h6
//                                         className="fw-bold"
//                                         style={{ color: "steelblue" }}
//                                     >
//                                         <i className="fas fa-money-bill me-2"></i>
//                                         Billetage
//                                     </h6>
//                                 </div>
//                                 <div
//                                     className="card-body"
//                                     style={{
//                                         maxHeight: "500px",
//                                         overflowY: "auto",
//                                     }}
//                                 >
//                                     {fetchData2 &&
//                                     fetchData2.CodeMonnaie == 1 ? (
//                                         <div className="table-responsive">
//                                             <table className="table table-bordered table-sm table-ultra-compact">
//                                                 <thead
//                                                     style={{
//                                                         backgroundColor:
//                                                             "#e6f2f9",
//                                                     }}
//                                                 >
//                                                     <tr>
//                                                         <th
//                                                             style={{
//                                                                 color: "steelblue",
//                                                             }}
//                                                         >
//                                                             Coupures
//                                                         </th>
//                                                         <th
//                                                             style={{
//                                                                 color: "steelblue",
//                                                             }}
//                                                         >
//                                                             Nbr Billets
//                                                         </th>
//                                                         <th
//                                                             style={{
//                                                                 color: "steelblue",
//                                                             }}
//                                                         >
//                                                             Total
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {[
//                                                         {
//                                                             value: hundred,
//                                                             set: sethundred,
//                                                             label: "100",
//                                                             multiplier: 100,
//                                                         },
//                                                         {
//                                                             value: fitfty,
//                                                             set: setfitfty,
//                                                             label: "50",
//                                                             multiplier: 50,
//                                                         },
//                                                         {
//                                                             value: twenty,
//                                                             set: settwenty,
//                                                             label: "20",
//                                                             multiplier: 20,
//                                                         },
//                                                         {
//                                                             value: ten,
//                                                             set: setten,
//                                                             label: "10",
//                                                             multiplier: 10,
//                                                         },
//                                                         {
//                                                             value: five,
//                                                             set: setfive,
//                                                             label: "5",
//                                                             multiplier: 5,
//                                                         },
//                                                         {
//                                                             value: oneDollar,
//                                                             set: setoneDollar,
//                                                             label: "1",
//                                                             multiplier: 1,
//                                                         },
//                                                     ].map((item, idx) => (
//                                                         <tr key={idx}>
//                                                             <td className="fw-semibold">
//                                                                 {item.label}
//                                                             </td>
//                                                             <td>
//                                                                 <input
//                                                                     type="number"
//                                                                     className="form-control form-control-sm"
//                                                                     style={{
//                                                                         boxShadow:
//                                                                             "inset 0 0 3px #888",
//                                                                         borderRadius:
//                                                                             "6px",
//                                                                     }}
//                                                                     value={
//                                                                         item.value
//                                                                     }
//                                                                     onChange={(
//                                                                         e,
//                                                                     ) =>
//                                                                         item.set(
//                                                                             e
//                                                                                 .target
//                                                                                 .value,
//                                                                         )
//                                                                     }
//                                                                 />
//                                                             </td>
//                                                             <td className="fw-bold text-success">
//                                                                 {(
//                                                                     item.value *
//                                                                     item.multiplier
//                                                                 ).toLocaleString()}
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                     <tr
//                                                         style={{
//                                                             backgroundColor:
//                                                                 "#e6f2f9",
//                                                         }}
//                                                     >
//                                                         <th>Total</th>
//                                                         <th>
//                                                             {parseInt(hundred) +
//                                                                 parseInt(
//                                                                     fitfty,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     twenty,
//                                                                 ) +
//                                                                 parseInt(ten) +
//                                                                 parseInt(five) +
//                                                                 parseInt(
//                                                                     oneDollar,
//                                                                 )}
//                                                         </th>
//                                                         <th
//                                                             className="fw-bold fs-5"
//                                                             style={{
//                                                                 color: "#198764",
//                                                             }}
//                                                         >
//                                                             {(
//                                                                 hundred * 100 +
//                                                                 fitfty * 50 +
//                                                                 twenty * 20 +
//                                                                 ten * 10 +
//                                                                 five * 5 +
//                                                                 oneDollar * 1
//                                                             ).toLocaleString()}
//                                                         </th>
//                                                     </tr>
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     ) : (
//                                         <div className="table-responsive">
//                                             <table className="table table-bordered table-sm table-ultra-compact">
//                                                 <thead
//                                                     style={{
//                                                         backgroundColor:
//                                                             "#e6f2f9",
//                                                     }}
//                                                 >
//                                                     <tr>
//                                                         <th
//                                                             style={{
//                                                                 color: "steelblue",
//                                                             }}
//                                                         >
//                                                             Coupures
//                                                         </th>
//                                                         <th
//                                                             style={{
//                                                                 color: "steelblue",
//                                                             }}
//                                                         >
//                                                             Nbr Billets
//                                                         </th>
//                                                         <th
//                                                             style={{
//                                                                 color: "steelblue",
//                                                             }}
//                                                         >
//                                                             Total
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {[
//                                                         {
//                                                             value: vightMille,
//                                                             set: setvightMille,
//                                                             label: "20000",
//                                                             multiplier: 20000,
//                                                         },
//                                                         {
//                                                             value: dixMille,
//                                                             set: setdixMille,
//                                                             label: "10000",
//                                                             multiplier: 10000,
//                                                         },
//                                                         {
//                                                             value: cinqMille,
//                                                             set: setcinqMille,
//                                                             label: "5000",
//                                                             multiplier: 5000,
//                                                         },
//                                                         {
//                                                             value: milleFranc,
//                                                             set: setmilleFranc,
//                                                             label: "1000",
//                                                             multiplier: 1000,
//                                                         },
//                                                         {
//                                                             value: cinqCentFr,
//                                                             set: setcinqCentFr,
//                                                             label: "500",
//                                                             multiplier: 500,
//                                                         },
//                                                         {
//                                                             value: deuxCentFranc,
//                                                             set: setdeuxCentFranc,
//                                                             label: "200",
//                                                             multiplier: 200,
//                                                         },
//                                                         {
//                                                             value: centFranc,
//                                                             set: setcentFranc,
//                                                             label: "100",
//                                                             multiplier: 100,
//                                                         },
//                                                         {
//                                                             value: cinquanteFanc,
//                                                             set: setcinquanteFanc,
//                                                             label: "50",
//                                                             multiplier: 50,
//                                                         },
//                                                     ].map((item, idx) => (
//                                                         <tr key={idx}>
//                                                             <td className="fw-semibold">
//                                                                 {item.label}
//                                                             </td>
//                                                             <td>
//                                                                 <input
//                                                                     type="number"
//                                                                     className="form-control form-control-sm"
//                                                                     style={{
//                                                                         boxShadow:
//                                                                             "inset 0 0 3px #888",
//                                                                         borderRadius:
//                                                                             "6px",
//                                                                     }}
//                                                                     value={
//                                                                         item.value
//                                                                     }
//                                                                     onChange={(
//                                                                         e,
//                                                                     ) =>
//                                                                         item.set(
//                                                                             e
//                                                                                 .target
//                                                                                 .value,
//                                                                         )
//                                                                     }
//                                                                 />
//                                                             </td>
//                                                             <td className="fw-bold text-success">
//                                                                 {(
//                                                                     item.value *
//                                                                     item.multiplier
//                                                                 ).toLocaleString()}
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                     <tr
//                                                         style={{
//                                                             backgroundColor:
//                                                                 "#e6f2f9",
//                                                         }}
//                                                     >
//                                                         <th>Total</th>
//                                                         <th>
//                                                             {parseInt(
//                                                                 vightMille,
//                                                             ) +
//                                                                 parseInt(
//                                                                     dixMille,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     cinqMille,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     milleFranc,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     cinqCentFr,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     deuxCentFranc,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     centFranc,
//                                                                 ) +
//                                                                 parseInt(
//                                                                     cinquanteFanc,
//                                                                 )}
//                                                         </th>
//                                                         <th
//                                                             className="fw-bold fs-5"
//                                                             style={{
//                                                                 color: "#198764",
//                                                             }}
//                                                         >
//                                                             {(
//                                                                 vightMille *
//                                                                     20000 +
//                                                                 dixMille *
//                                                                     10000 +
//                                                                 cinqMille *
//                                                                     5000 +
//                                                                 milleFranc *
//                                                                     1000 +
//                                                                 cinqCentFr *
//                                                                     500 +
//                                                                 deuxCentFranc *
//                                                                     200 +
//                                                                 centFranc *
//                                                                     100 +
//                                                                 cinquanteFanc *
//                                                                     50
//                                                             ).toLocaleString()}
//                                                         </th>
//                                                     </tr>
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Actions et historique */}
//                         <div className="col-md-3">
//                             <div className="card border-0 shadow-sm rounded-3 mb-3">
//                                 <div className="card-body">
//                                     <button
//                                         className="btn w-100 py-2 fw-bold"
//                                         id="validerbtn"
//                                         style={{
//                                             background:
//                                                 "linear-gradient(135deg, teal, #0a6b6b)",
//                                             border: "none",
//                                             borderRadius: "10px",
//                                             fontSize: "16px",
//                                             color: "white",
//                                         }}
//                                         onClick={saveOperation}
//                                         disabled={
//                                             (fetchData2 &&
//                                             fetchData2.CodeMonnaie == 1
//                                                 ? hundred * 100 +
//                                                       fitfty * 50 +
//                                                       twenty * 20 +
//                                                       ten * 10 +
//                                                       five * 5 +
//                                                       oneDollar * 1 !==
//                                                   parseInt(Montant)
//                                                 : vightMille * 20000 +
//                                                       dixMille * 10000 +
//                                                       cinqMille * 5000 +
//                                                       milleFranc * 1000 +
//                                                       cinqCentFr * 500 +
//                                                       deuxCentFranc * 200 +
//                                                       centFranc * 100 +
//                                                       cinquanteFanc * 50 !==
//                                                   parseInt(Montant)) || !Montant
//                                         }
//                                     >
//                                         <i
//                                             className={`${loading ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}
//                                         ></i>
//                                         Valider le dépôt
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Historique des opérations avec pagination sticky-top*/}
//                             <div
//                                 className="card border-0 shadow-sm rounded-3"
//                                 style={{
//                                     maxHeight: "450px",
//                                     overflowY: "auto",
//                                 }}
//                             >
//                                 <div className="card-header bg-white border-0 pt-3  bg-white">
//                                     <h6
//                                         className="fw-bold"
//                                         style={{ color: "steelblue" }}
//                                     >
//                                         <i className="fas fa-history me-2"></i>
//                                         Opérations récentes
//                                     </h6>
//                                 </div>
//                                 <div className="card-body p-0">
//                                     {/* Section CDF */}
//                                     {getBilletageCDF &&
//                                         getBilletageCDF.length > 0 && (
//                                             <>
//                                                 <div
//                                                     className="px-3 py-2"
//                                                     style={{
//                                                         backgroundColor:
//                                                             "#e6f2f9",
//                                                     }}
//                                                 >
//                                                     <small
//                                                         className="fw-bold"
//                                                         style={{
//                                                             color: "steelblue",
//                                                         }}
//                                                     >
//                                                         CDF
//                                                     </small>
//                                                 </div>
//                                                 <TableWithPagination
//                                                     data={getBilletageCDF}
//                                                     itemsPerPage={3}
//                                                     renderRow={(res, idx) => (
//                                                         <tr key={idx}>
//                                                             <td>
//                                                                 <small>
//                                                                     {
//                                                                         res.refOperation
//                                                                     }
//                                                                 </small>
//                                                             </td>
//                                                             <td className="fw-bold">
//                                                                 {res.montantEntre?.toLocaleString()}
//                                                             </td>
//                                                             <td>
//                                                                 <button
//                                                                     data-toggle="modal"
//                                                                     data-target="#modal-bordereau"
//                                                                     onClick={() =>
//                                                                         handlePrintClick(
//                                                                             res,
//                                                                         )
//                                                                     }
//                                                                     className="btn btn-primary rounded-10"
//                                                                     style={{
//                                                                         background:
//                                                                             "teal",
//                                                                         color: "white",
//                                                                         borderRadius:
//                                                                             "6px",
//                                                                         padding:
//                                                                             "2px 8px",
//                                                                         fontSize:
//                                                                             "11px",
//                                                                     }}
//                                                                 >
//                                                                     <i className="fas fa-print"></i>
//                                                                 </button>
//                                                             </td>
//                                                         </tr>
//                                                     )}
//                                                 />
//                                             </>
//                                         )}

//                                     {/* Section USD */}
//                                     {getBilletageUSD &&
//                                         getBilletageUSD.length > 0 && (
//                                             <>
//                                                 <div
//                                                     className="px-3 py-2 mt-2"
//                                                     style={{
//                                                         backgroundColor:
//                                                             "#e6f2f9",
//                                                     }}
//                                                 >
//                                                     <small
//                                                         className="fw-bold"
//                                                         style={{
//                                                             color: "steelblue",
//                                                         }}
//                                                     >
//                                                         USD
//                                                     </small>
//                                                 </div>
//                                                 <TableWithPagination
//                                                     data={getBilletageUSD}
//                                                     itemsPerPage={3}
//                                                     renderRow={(res, idx) => (
//                                                         <tr key={idx}>
//                                                             <td>
//                                                                 <small>
//                                                                     {
//                                                                         res.refOperation
//                                                                     }
//                                                                 </small>
//                                                             </td>
//                                                             <td className="fw-bold">
//                                                                 {res.montantEntre?.toLocaleString()}
//                                                             </td>
//                                                             <td>
//                                                                 <button
//                                                                     data-toggle="modal"
//                                                                     data-target="#modal-bordereau"
//                                                                     onClick={() =>
//                                                                         handlePrintClick(
//                                                                             res,
//                                                                         )
//                                                                     }
//                                                                     className="btn btn-primary rounded-10"
//                                                                     style={{
//                                                                         background:
//                                                                             "teal",
//                                                                         color: "white",
//                                                                         borderRadius:
//                                                                             "6px",
//                                                                         padding:
//                                                                             "2px 8px",
//                                                                         fontSize:
//                                                                             "11px",
//                                                                     }}
//                                                                 >
//                                                                     <i className="fas fa-print"></i>
//                                                                 </button>
//                                                             </td>
//                                                         </tr>
//                                                     )}
//                                                 />
//                                             </>
//                                         )}

//                                     {(!getBilletageCDF ||
//                                         getBilletageCDF.length === 0) &&
//                                         (!getBilletageUSD ||
//                                             getBilletageUSD.length === 0) && (
//                                             <div className="text-center py-5 text-muted">
//                                                 <i className="fas fa-inbox fa-3x mb-2 opacity-50"></i>
//                                                 <p className="mb-0">
//                                                     Aucune opération récente
//                                                 </p>
//                                             </div>
//                                         )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Modal d'impression - Placé à la fin du formulaire comme dans l'original */}

//                     {selectedData &&
//                         (GetRecuConfig === "Thermique" ? (
//                             <RecuDepot data={selectedData} />
//                         ) : GetRecuConfig === "A5" ? (
//                             <RecuDepotA5 data={selectedData} />
//                         ) : null)}

//                     <style>
//                         {`
//                 /* Styles personnalisés pour un tableau ultra compact */
//                 .table-ultra-compact {
//                  border-collapse: collapse;
//                   }

//                 .table-ultra-compact th,
//                 .table-ultra-compact td {
//                  padding: 0.2rem 0.35rem; /* Réduction drastique du padding */
//                  line-height: 1;
//                  font-size: 0.8rem; /* Optionnel : légère réduction de la police */
//                  }
//                 `}
//                     </style>
//                 </div>
//             )}
//         </>
//     );
// };

// export default DepotEspece;









import axios from "axios";

export const EnteteBordereau = () => {
    const [data, setData] = useState(null);
    const [agenceNom, setAgenceNom] = useState("");

    const getData = async () => {
        try {
            const res = await axios.get("/eco/page/header-report");
            if (res.data.status === 1) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Erreur chargement en-tête", error);
        }
    };

    useEffect(() => {
        getData();
        // Récupérer l'agence courante (via API)
        axios.get("/eco/agence/courante")
            .then(res => {
                if (res.data.status === 1) {
                    setAgenceNom(res.data.nom_agence);
                }
            })
            .catch(err => console.error("Erreur chargement agence", err));
    }, []);

    if (!data) {
        return <div className="entete-placeholder" />;
    }

    return (
        <>
            <div className="entete-rapport">
                <div className="entete-logo">
                    {/* <img
                        src={`https://app.ihdemunis.org/uploads/images/logo/1696413083.jpg`}
                        alt="Logo"
                    /> */}
                    <img
                        src={`https://app.nuru.clindrc.com/uploads/images/logo/1736022909.PNG`}
                        alt="Logo"
                    />

                     {/* <img
                        src={`https://app.pmb.clindrc.com/uploads/images/logo/1778013225.png`}
                        alt="Logo"
                    /> */}

                     {/* <img
                        src={`https://app.clindrc.com/uploads/images/logo/1778254051.png`}
                        alt="Logo"
                    /> */}

                    
                    
                </div>
                <div className="entete-infos">
                    <div className="entete-denomination">
                        {data.denomination}
                    </div>
                    <div className="entete-sigle">
                        {data.sigle} - AGENCE DE {agenceNom || "..."}
                    </div>
                    <div className="entete-coordonnees">
                        <span>{data.ville}, {data.pays}</span>
                        <span>{data.tel}</span>
                        <span>{data.email}</span>
                    </div>
                </div>
            </div>

            <style>{`
                /* Styles par défaut pour l'écran (inchangés) */
                .entete-rapport {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border-radius: 24px;
                    padding: 20px 30px;
                    margin-bottom: 24px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                    border: 1px solid #eef2ff;
                    flex-wrap: wrap;
                    gap: 20px;
                }
                .entete-logo img {
                    height: 80px;
                    width: auto;
                    max-width: 150px;
                }
                .entete-denomination {
                    font-size: 1.6rem;
                    font-weight: 700;
                }
                .entete-sigle {
                    font-size: 1.2rem;
                    color: #0f766e;
                }
                .entete-coordonnees {
                    display: flex;
                    gap: 24px;
                    font-size: 0.85rem;
                }

                /* STYLES ULTRA COMPACTS POUR L'IMPRESSION A5 */
               @media print {
    .entete-rapport {
        all: unset;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;      /* centrage horizontal */
        justify-content: flex-start !important;
        gap: 2px !important;
        padding: 2px 0 !important;
        margin: 0 0 2px 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        width: 100% !important;
    }
    .entete-logo {
        display: block !important;
        text-align: center !important;
        margin: 0 auto !important;            /* centrage supplémentaire */
        margin-bottom: 2px !important;
    }
    .entete-logo img {
        height: 30px !important;              /* taille visible */
        width: auto !important;
        max-width: 80px !important;
        display: block !important;
        margin: 0 auto !important;            /* centrage de l’image */
    }
    .entete-infos {
        text-align: center !important;
        line-height: 1.2 !important;
        width: 100% !important;
    }
    .entete-denomination {
        font-size: 8pt !important;
        font-weight: bold !important;
        margin: 0 !important;
    }
    .entete-sigle {
        font-size: 7pt !important;
        margin: 0 !important;
        color: #0f766e !important;
    }
    .entete-coordonnees {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        gap: 4px !important;
        font-size: 5pt !important;
        margin-top: 1px !important;
    }
    .entete-coordonnees span {
        margin: 0 !important;
    }
    /* Si vous aviez des icônes FontAwesome, on les cache */
    .entete-coordonnees i {
        display: none !important;
    }
}


@media print {
    .entete-rapport {
        all: unset;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 1px !important;           /* espace réduit entre logo et texte */
        padding: 1px 0 !important;     /* moins de padding vertical */
        margin: 0 0 1px 0 !important;  /* marge basse minimale */
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        width: 100% !important;
    }
    .entete-logo {
        display: block !important;
        text-align: center !important;
        margin: 0 auto !important;
        margin-bottom: 1px !important;  /* espace sous le logo réduit */
    }
    .entete-logo img {
        height: 20px !important;        /* logo plus petit (20px au lieu de 30) */
        width: auto !important;
        max-width: 60px !important;
        display: block !important;
        margin: 0 auto !important;
    }
    .entete-infos {
        text-align: center !important;
        line-height: 1.1 !important;    /* interligne plus serré */
        width: 100% !important;
    }
    .entete-denomination {
        font-size: 7pt !important;      /* légèrement réduit */
        font-weight: bold !important;
        margin: 0 !important;
    }
    .entete-sigle {
        font-size: 6pt !important;
        margin: 0 !important;
        color: #0f766e !important;
    }
    .entete-coordonnees {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        gap: 3px !important;
        font-size: 5pt !important;
        margin-top: 0 !important;       /* supprimer la marge haute */
    }
    .entete-coordonnees span {
        margin: 0 !important;
    }
    .entete-coordonnees i {
        display: none !important;
    }
}
            `}</style>
        </>
    );
};
