import styles from "../styles/RegisterForm.module.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const Adhesion = () => {
    const [adhesion, setAdhesion] = useState({
        code_agence: "",
        code_monnaie: "CDF",
        type_epargne: "",
        type_client: "",
        intitule_compte: "",
        lieu_naissance: "",
        date_naissance: "",
        etat_civile: "",
        nom_condjoint: "",
        nom_pere: "",
        nom_mere: "",
        profession: "",
        lieu_travail: "",
        civilite: "",
        sexe: "",
        email: "",
        telephone: "",
        type_piece: "",
        num_piece: "",
        lieu_devivraison_piece: "",
        province: "",
        territoire_ou_ville: "",
        commune: "",
        quartier: "",
        type_de_gestion: "",
        critere: "",
        suiteAdresse: "",
    });
    const [isLoading1, setIsloading1] = useState(false);
    const [isLoading2, setIsloading2] = useState(false);
    const [error, setError] = useState([]);
    // const [agenceFilter, setAgenceFilter] = useState("current"); // 'current', 'all', ou un id d'agence

    ///UPDATE ATTRIBUTE

    const [agence, setagence] = useState();
    const [code_monnaie, setcode_monnaie] = useState();
    const [type_epargne, settype_epargne] = useState();
    const [type_client, settype_client] = useState();
    const [intitule_compte, setintitule_compte] = useState();
    const [lieu_naissance, setlieu_naissance] = useState();
    const [date_naissance, setdate_naissance] = useState();
    const [etat_civile, setetat_civile] = useState();
    const [nom_condjoint, setnom_condjoint] = useState();
    const [nom_pere, setnom_pere] = useState();
    const [nom_mere, setnom_mere] = useState();
    const [profession, setprofession] = useState();
    const [lieu_travail, setlieu_travail] = useState();
    const [civilite, setcivilite] = useState();
    const [sexe, setsexe] = useState();
    const [email, setemail] = useState();
    const [telephone, settelephone] = useState();
    const [type_piece, settype_piece] = useState();
    const [num_piece, setnum_piece] = useState();
    const [lieu_devivraison_piece, setlieu_devivraison_piece] = useState();
    const [province, setprovince] = useState();
    const [territoire_ou_ville, setterritoire_ou_ville] = useState();
    const [commune, setcommune] = useState();
    const [quartier, setquartier] = useState();
    const [type_de_gestion, settype_de_gestion] = useState();
    const [critere, setcritere] = useState();
    const [compte_to_search, setcompte_to_search] = useState();
    const [signature_image_file, setsignature_image_file] = useState();
    const [signature_file, setsignature_file] = useState();

    //ACTIVATION COMPTE ATTRIBUTE
    const [devise_compte, setdevise_compte] = useState("CDF");
    const [mandataireName, setmandataireName] = useState();
    const [mandatairePhone, setmandatairePhone] = useState();
    const [fetchMandataire, setFetchMandataire] = useState();

    const [agencesList, setAgencesList] = useState([]);
    const [loadingAgences, setLoadingAgences] = useState(true);

    // États pour la photo et signature
    const [uploadMode, setUploadMode] = useState("signature"); // 'signature', 'photo_upload', 'camera'
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [capturedPhotoFile, setCapturedPhotoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [photo_file, setPhotoFile] = useState(null); // Récupéré depuis getSeachedData
    // États pour la gestion de la caméra
    const [cameraFacing, setCameraFacing] = useState("environment"); // 'user' ou 'environment'
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    let stream = null;

    //ENREGISTRE LES DONNEES POUR LE NOUVEAU MEMBRE CREE
    const handleSubmitAdhesion = async (e) => {
        e.preventDefault();
        setIsloading1(true);
        const res = await axios.post("/eco/page/adhesion-membre", adhesion);
        if (res.data.status == 1) {
            setIsloading1(false);
            adhesion.intitule_compte = "";
            adhesion.type_epargne = "";
            adhesion.type_client = "";
            adhesion.lieu_naissance = "";
            adhesion.date_naissance = "";
            adhesion.etat_civile = "";
            adhesion.nom_condjoint = "";
            adhesion.nom_pere = "";
            adhesion.nom_mere = "";
            adhesion.profession = "";
            adhesion.lieu_travail = "";
            adhesion.civilite = "";
            adhesion.sexe = "";
            adhesion.email = "";
            adhesion.telephone = "";
            adhesion.type_piece = "";
            adhesion.num_piece = "";
            adhesion.lieu_devivraison_piece = "";
            adhesion.province = "";
            adhesion.territoire_ou_ville = "";
            adhesion.commune = "";
            adhesion.quartier = "";
            adhesion.type_de_gestion = "";
            adhesion.critere = "";
            adhesion.suiteAdresse = "";
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setIsloading1(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading1(false);
            setError(res.data.validate_error);
            console.log(res.data.validate_error);
        }
    };
    //PERMET DE RECUPERER LE MANDATAIRE ASSOCIE A UN COMPTE

    const getMandataires = async () => {
        // e.preventDefault();
        const res = await axios.post("/eco/pages/adhesion/get-mandaitre", {
            compte_to_search: compte_to_search,
        });
        if (res.data.status == 1) {
            setFetchMandataire(res.data.data);
            console.log(fetchMandataire);
        } else {
            console.log("something went rwong");
        }
    };

    //GET DATA TO UPDATE
    const getSeachedData = async (e) => {
        e.preventDefault();

        //console.log(compte_to_search);
        const res = await axios.post("/eco/page/adhesion/get-searched-item", {
            compte_to_search,
        });
        if (res.data.status == 1) {
            getMandataires(); //AFFICHE LES MANDATAIRES ASSOCIE A UN COMPTE
            setagence(res.data.data.agence);
            setcode_monnaie(res.data.data.code_monnaie);
            settype_epargne(res.data.data.type_epargne);
            settype_client(res.data.data.type_client);
            setintitule_compte(res.data.data.intitule_compte);
            setlieu_naissance(res.data.data.lieu_naissance);
            setdate_naissance(res.data.data.date_naissance);
            setetat_civile(res.data.data.etat_civile);
            setnom_condjoint(res.data.data.nom_condjoint);
            setnom_pere(res.data.data.nom_pere);
            setnom_mere(res.data.data.nom_mere);
            setprofession(res.data.data.profession);
            setlieu_travail(res.data.data.lieu_travail);
            setcivilite(res.data.data.civilite);
            setsexe(res.data.data.sexe);
            setemail(res.data.data.email);
            settelephone(res.data.data.telephone);
            settype_piece(res.data.data.type_piece);
            setnum_piece(res.data.data.num_piece);
            setlieu_devivraison_piece(res.data.data.lieu_devivraison_piece);
            setprovince(res.data.data.province);
            setterritoire_ou_ville(res.data.data.territoire_ou_ville);
            setcommune(res.data.data.commune);
            setquartier(res.data.data.quartier);
            settype_de_gestion(res.data.data.type_de_gestion);
            setcritere(res.data.data.critere);
            // setFetchDataToUpdate(res.data.data);
            setsignature_file(res.data.data.signature_image_file);
            setPhotoFile(res.data.data.photo_file); // Ajout pour la photo
        } else if (res.data.status == 0) {
            setIsloading2(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                confirmButtonText: "Okay",
            });
        }
    };

    const handleSubmitAdhesionUpdate = async (e) => {
        e.preventDefault();
        setIsloading2(true);
        const res = await axios.post("/eco/page/adhesion-membre/update", {
            compte_to_search,
            type_epargne,
            type_client,
            intitule_compte,
            lieu_naissance,
            date_naissance,
            etat_civile,
            nom_condjoint,
            nom_pere,
            nom_mere,
            profession,
            lieu_travail,
            civilite,
            sexe,
            email,
            telephone,
            type_piece,
            num_piece,
            lieu_devivraison_piece,
            province,
            territoire_ou_ville,
            commune,
            quartier,
            type_de_gestion,
            critere,
        });
        if (res.data.status == 1) {
            setIsloading2(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            setIsloading2(false);
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading2(false);
            setError(res.data.validate_error);
        }
    };

    const updateMembreSignature = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("signature_image_file", signature_image_file);
            formData.append("compte_to_search", compte_to_search);
            const config = {
                Headers: {
                    accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.8",
                    "content-type": "multipart/form-data",
                },
            };

            const url = "/eco/page/adhesion/edit-signature";
            axios
                .post(url, formData, config)
                .then((response) => {
                    if (response.data.status == 1) {
                        Swal.fire({
                            title: "Succès",
                            text: response.data.msg,
                            icon: "success",
                            button: "OK!",
                        });
                    } else {
                        Swal.fire({
                            title: "Erreur",
                            text: response.data.msg,
                            icon: "error",
                            button: "OK!",
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            throw error;
        }
    };
    //CREATE NEW ACCOUNT FOR USER
    const createAccount = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/adhesion/creation-compte", {
            compteAbrege: compte_to_search,
            devise_compte: devise_compte,
        });
        console.log(res.data.status);
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    useEffect(() => {
        const fetchAgences = async () => {
            try {
                const res = await axios.get("/eco/pages/user-agences");
                if (res.data.status === 1) {
                    setAgencesList(res.data.data);
                    // Si une seule agence, on la pré‑sélectionne
                    if (res.data.data.length === 1) {
                        setAdhesion((prev) => ({
                            ...prev,
                            agence_id: res.data.data[0].id,
                        }));
                    }
                }
            } catch (error) {
                console.error("Erreur chargement agences", error);
            } finally {
                setLoadingAgences(false);
            }
        };
        fetchAgences();
    }, []);

    const AjouterMandataire = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/pages/adhesion/ajout-mandataire", {
            compteAbrege: compte_to_search,
            mandataireName,
            mandatairePhone,
        });
        if (res.data.status == 1) {
            getMandataires(); //AFFICHE LES MANDATAIRES ASSOCIE A UN COMPTE
            setmandataireName("");
            setmandatairePhone("");
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };
    //PERMET DE SUPPRIMER UN MANDATAIRE
    const DeleteMandataire = async (id) => {
        Swal.fire({
            title: "Confirmation !",
            text: "Etes vous sûr de supprimer ce mandataire ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui supprimer!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.get(
                        "/eco/pages/adhesion/suppression-mandataire/" + id,
                    );
                    if (res.data.status === 1) {
                        getMandataires(); //MET AJOUR LE TABLEAU APRES SUPPRESSION
                        Swal.fire({
                            title: "Succès",
                            text: res.data.msg,
                            icon: "success",
                            timer: 8000,
                            confirmButtonText: "Okay",
                        });
                    } else {
                        Swal.fire({
                            title: "Erreur",
                            text: res.data.msg,
                            icon: "error",
                            timer: 8000,
                            confirmButtonText: "Okay",
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        title: "Erreur",
                        text: "Une erreur est survenue .",
                        icon: "error",
                        timer: 8000,
                        confirmButtonText: "Okay",
                    });
                    console.error(error);
                }
            }
        });
    };

    // Démarrer la caméra
    // const startCamera = async () => {
    //     try {
    //         // Demander l'accès à la caméra
    //         const mediaStream = await navigator.mediaDevices.getUserMedia({
    //             video: {
    //                 width: { ideal: 1280 },
    //                 height: { ideal: 720 },
    //             },
    //         });
    //         stream = mediaStream;
    //         if (videoRef.current) {
    //             videoRef.current.srcObject = stream;
    //             videoRef.current.play();
    //             setCameraActive(true);
    //         }
    //     } catch (err) {
    //         console.error("Erreur d'accès à la caméra:", err);
    //         Swal.fire({
    //             title: "Erreur",
    //             text: "Impossible d'accéder à la caméra. Vérifiez les permissions.",
    //             icon: "error",
    //             confirmButtonText: "Ok",
    //         });
    //     }
    // };
    // Démarrer la caméra avec choix de l'appareil
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { exact: cameraFacing }, // Utilise la caméra sélectionnée
                },
            });
            stream = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraActive(true);
            }
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            // Fallback: essaie sans spécifier facingMode
            try {
                const fallbackStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                    });
                stream = fallbackStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                    videoRef.current.play();
                    setCameraActive(true);
                }
            } catch (fallbackErr) {
                Swal.fire({
                    title: "Erreur",
                    text: "Impossible d'accéder à la caméra. Vérifiez les permissions.",
                    icon: "error",
                    confirmButtonText: "Ok",
                });
            }
        }
    };

    // Changer de caméra (avant/arrière)
    const switchCamera = async () => {
        if (!cameraActive) return;

        // Arrêter la caméra actuelle
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            stream = null;
        }

        // Changer de direction
        const newFacing =
            cameraFacing === "environment" ? "user" : "environment";
        setCameraFacing(newFacing);

        // Redémarrer avec la nouvelle caméra
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { exact: newFacing },
                },
            });
            stream = mediaStream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Erreur changement caméra:", err);
            // Fallback: essaie avec n'importe quelle caméra
            try {
                const fallbackStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                    });
                stream = fallbackStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                    videoRef.current.play();
                }
            } catch (fallbackErr) {
                Swal.fire({
                    title: "Erreur",
                    text: "Impossible de changer de caméra",
                    icon: "error",
                    confirmButtonText: "Ok",
                });
            }
        }
    };

    // Arrêter la caméra
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            stream = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    // Capturer la photo
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // Définir les dimensions du canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Dessiner l'image de la vidéo sur le canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convertir en base64 pour l'aperçu
            const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedPhoto(photoDataUrl);

            // Convertir en fichier pour l'upload
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const file = new File(
                            [blob],
                            `photo_${Date.now()}.jpg`,
                            { type: "image/jpeg" },
                        );
                        setCapturedPhotoFile(file);
                        console.log(
                            "Photo capturée:",
                            file.name,
                            file.size,
                            "bytes",
                        );
                    }
                },
                "image/jpeg",
                0.9,
            );

            // Arrêter la caméra après capture
            stopCamera();
        }
    };

    // Upload photo depuis ordinateur
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            // Vérifier la taille (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    title: "Erreur",
                    text: "Le fichier est trop volumineux. Maximum 2MB.",
                    icon: "error",
                    confirmButtonText: "Ok",
                });
                return;
            }

            setCapturedPhotoFile(file);

            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                setCapturedPhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            Swal.fire({
                title: "Erreur",
                text: "Veuillez sélectionner une image valide (JPG, PNG, GIF)",
                icon: "error",
                confirmButtonText: "Ok",
            });
        }
    };

    // Drag and drop pour upload photo
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    title: "Erreur",
                    text: "Le fichier est trop volumineux. Maximum 2MB.",
                    icon: "error",
                    confirmButtonText: "Ok",
                });
                return;
            }

            setCapturedPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setCapturedPhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Sauvegarder la photo
    const updateMembrePhoto = async () => {
        if (!capturedPhotoFile) {
            Swal.fire({
                title: "Attention",
                text: "Aucune photo sélectionnée",
                icon: "warning",
                confirmButtonText: "Ok",
            });
            return;
        }

        if (!compte_to_search) {
            Swal.fire({
                title: "Attention",
                text: "Veuillez d'abord rechercher un compte",
                icon: "warning",
                confirmButtonText: "Ok",
            });
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("photo_file", capturedPhotoFile);
            formData.append("compte_to_search", compte_to_search);

            const url = "/eco/page/adhesion/edit-photo";
            const response = await axios.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == 1) {
                Swal.fire({
                    title: "Succès",
                    text: response.data.msg,
                    icon: "success",
                    confirmButtonText: "OK!",
                });
                setCapturedPhoto(null);
                setCapturedPhotoFile(null);
                // Rafraîchir les données
                if (compte_to_search) {
                    const fakeEvent = { preventDefault: () => {} };
                    await getSeachedData(fakeEvent);
                }
            } else {
                Swal.fire({
                    title: "Erreur",
                    text: response.data.msg,
                    icon: "error",
                    confirmButtonText: "OK!",
                });
            }
        } catch (error) {
            console.error("Erreur upload photo:", error);
            Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue lors de l'upload",
                icon: "error",
                confirmButtonText: "OK!",
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Nettoyage de la caméra au démontage
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, []);
    return (
        <div
            className="container-fluid"
            style={{ marginTop: "10px", padding: "0 15px" }}
        >
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
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i
                                        className="fas fa-user-plus"
                                        style={{
                                            fontSize: "28px",
                                            color: "white",
                                        }}
                                    ></i>
                                </div>
                                <div>
                                    <h5 className="text-white fw-bold mb-0">
                                        Adhésion des membres
                                    </h5>
                                    <small className="text-white-50">
                                        Gestion complète des adhésions et
                                        comptes membres
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Onglets modernisés */}
            <div className="card border-0 shadow-sm rounded-3">
                <ul
                    className="nav nav-tabs tabs-modern"
                    id="adhesionTabs"
                    role="tablist"
                >
                    <li className="nav-item">
                        <a
                            className="nav-link active"
                            id="info-base-tab"
                            data-toggle="pill"
                            href="#info-base"
                            role="tab"
                        >
                            <i className="fas fa-info-circle me-2"></i>
                            Informations de base
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="photo-signature-tab"
                            data-toggle="pill"
                            href="#photo-signature"
                            role="tab"
                        >
                            <i className="fas fa-camera me-2"></i>Photo et
                            signature
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="mandataire-tab"
                            data-toggle="pill"
                            href="#mandataire"
                            role="tab"
                        >
                            <i className="fas fa-users me-2"></i>Informations
                            mandataires
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className="nav-link"
                            id="creation-compte-tab"
                            data-toggle="pill"
                            href="#creation-compte"
                            role="tab"
                        >
                            <i className="fas fa-credit-card me-2"></i>Création
                            comptes
                        </a>
                    </li>
                </ul>

                <div className="card-body">
                    <div className="tab-content">
                        {/* Onglet 1: Informations de base */}
                        <div
                            className="tab-pane fade show active"
                            id="info-base"
                            role="tabpanel"
                        >
                            {/* Nouveau membre */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0 pt-3">
                                    <h6
                                        className="fw-bold"
                                        style={{ color: "steelblue" }}
                                    >
                                        <i className="fas fa-user-plus me-2"></i>
                                        Nouveau membre
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-5">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Agence
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                {loadingAgences ? (
                                                                    <span className="spinner-border spinner-border-sm text-muted"></span>
                                                                ) : (
                                                                    <select
                                                                        className="modern-select"
                                                                        style={{
                                                                            borderRadius:
                                                                                "8px",
                                                                        }}
                                                                        value={
                                                                            adhesion.code_agence ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAdhesion(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    code_agence:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            agencesList.length <=
                                                                            1
                                                                        }
                                                                    >
                                                                        {agencesList.map(
                                                                            (
                                                                                agence,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        agence.id
                                                                                    }
                                                                                    value={
                                                                                        agence.code_agence
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        agence.code_agence
                                                                                    }{" "}
                                                                                    -{" "}
                                                                                    {
                                                                                        agence.nom_agence
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                )}
                                                                {/* {error.code_agence && <small className="text-danger">{error.code_agence}</small>} */}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Code monnaie
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    disabled
                                                                >
                                                                    <option value="CDF">
                                                                        CDF
                                                                    </option>
                                                                    <option value="USD">
                                                                        USD
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type épargne
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`modern-select ${error.type_epargne ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_epargne:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Epargne à vie">
                                                                        Epargne
                                                                        à vie
                                                                    </option>
                                                                </select>
                                                                {error.type_epargne && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.type_epargne
                                                                        }
                                                                    </small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type client
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`modern-select ${error.type_client ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_client:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Personne pysique">
                                                                        Personne
                                                                        physique
                                                                    </option>
                                                                    <option value="Personne morale">
                                                                        Personne
                                                                        morale
                                                                    </option>
                                                                </select>
                                                                {error.type_client && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.type_client
                                                                        }
                                                                    </small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Nom compte
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className={`form-control ${error.intitule_compte ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                intitule_compte:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    value={
                                                                        adhesion.intitule_compte
                                                                    }
                                                                />
                                                                {error.intitule_compte && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.intitule_compte
                                                                        }
                                                                    </small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section IDENTITE et ADRESSE */}
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-id-card me-2"></i>
                                                IDENTITÉ
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body"
                                            style={{
                                                maxHeight: "500px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        {[
                                                            {
                                                                label: "Lieu de naissance",
                                                                field: "lieu_naissance",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Date de naissance",
                                                                field: "date_naissance",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Nom du père",
                                                                field: "nom_pere",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Nom de la mère",
                                                                field: "nom_mere",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Profession",
                                                                field: "profession",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Lieu de travail",
                                                                field: "lieu_travail",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Email",
                                                                field: "email",
                                                                type: "email",
                                                            },
                                                            {
                                                                label: "Téléphone",
                                                                field: "telephone",
                                                                type: "tel",
                                                            },
                                                            {
                                                                label: "Num pièce",
                                                                field: "num_piece",
                                                                type: "text",
                                                            },
                                                            {
                                                                label: "Délivée à",
                                                                field: "lieu_devivraison_piece",
                                                                type: "text",
                                                            },
                                                        ].map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
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
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </label>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type={
                                                                            item.type
                                                                        }
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAdhesion(
                                                                                (
                                                                                    p,
                                                                                ) => ({
                                                                                    ...p,
                                                                                    [item.field]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        value={
                                                                            adhesion[
                                                                                item
                                                                                    .field
                                                                            ]
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    État civile
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                etat_civile:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    value={
                                                                        adhesion.etat_civile
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Marié(e)">
                                                                        Marié(e)
                                                                    </option>
                                                                    <option value="Célibateur">
                                                                        Célibataire
                                                                    </option>
                                                                    <option value="Veuf(ve)">
                                                                        Veuf(ve)
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        {adhesion.etat_civile ===
                                                            "Marié(e)" && (
                                                            <tr>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                            fontWeight:
                                                                                "500",
                                                                        }}
                                                                    >
                                                                        Marié(e)
                                                                        à
                                                                    </label>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setAdhesion(
                                                                                (
                                                                                    p,
                                                                                ) => ({
                                                                                    ...p,
                                                                                    nom_condjoint:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        value={
                                                                            adhesion.nom_condjoint
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Civilité
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                civilite:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Monsieur">
                                                                        Monsieur
                                                                    </option>
                                                                    <option value="Madame">
                                                                        Madame
                                                                    </option>
                                                                    <option value="Mademoiselle">
                                                                        Mademoiselle
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Sexe
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                sexe: e
                                                                                    .target
                                                                                    .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Homme">
                                                                        Homme
                                                                    </option>
                                                                    <option value="Femme">
                                                                        Femme
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type pièce
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_piece:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Carte d'électeur">
                                                                        Carte
                                                                        d'électeur
                                                                    </option>
                                                                    <option value="pass port">
                                                                        Passeport
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                ADRESSE
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
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
                                                                    Province
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                province:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    {[
                                                                        "Kinshasa",
                                                                        "Haut-katanga",
                                                                        "Nord-Kivu",
                                                                        "Sud-Kivu",
                                                                        "Lualaba",
                                                                        "Equateur",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Maniema",
                                                                        "Ituri",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Kasai-Oiental",
                                                                        "Congo-Central",
                                                                        "Kwango",
                                                                        "Kwilu",
                                                                        "Lomami",
                                                                        "Mai-Ndombe",
                                                                        "Maniema",
                                                                        "Mongala",
                                                                        "Nord-Ubangi",
                                                                        "Sud-Ubangi",
                                                                        "Tanganyika",
                                                                        "Tshopo",
                                                                        "Tshapa",
                                                                    ].map(
                                                                        (
                                                                            prov,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    prov
                                                                                }
                                                                                value={
                                                                                    prov
                                                                                }
                                                                            >
                                                                                {
                                                                                    prov
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Territoire
                                                                    ou ville
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                territoire_ou_ville:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Secteur chef
                                                                    ou com.
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                commune:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Quartier
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                quartier:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Suite
                                                                    Adresse
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <textarea
                                                                    type="text"
                                                                    className={`form-control ${error.suiteAdresse ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                suiteAdresse:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                ></textarea>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-chart-line me-2"></i>
                                                AUTRES INFORMATIONS
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
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
                                                                    Type de
                                                                    gestion
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                type_de_gestion:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Individuel">
                                                                        Individuel
                                                                    </option>
                                                                    <option value="Collectif">
                                                                        Collectif
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Critère
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className={`modern-select ${error.critere ? "is-invalid" : ""}`}
                                                                    style={{
                                                                        borderRadius:
                                                                            "6px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setAdhesion(
                                                                            (
                                                                                p,
                                                                            ) => ({
                                                                                ...p,
                                                                                critere:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="A">
                                                                        A
                                                                    </option>
                                                                    <option value="B">
                                                                        B
                                                                    </option>
                                                                    <option value="C">
                                                                        C
                                                                    </option>
                                                                    <option value="D">
                                                                        D
                                                                    </option>
                                                                    <option value="Autre">
                                                                        Autre
                                                                    </option>
                                                                </select>
                                                                {error.critere && (
                                                                    <small className="text-danger">
                                                                        {
                                                                            error.critere
                                                                        }
                                                                    </small>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        handleSubmitAdhesion
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${isLoading1 ? "spinner-border spinner-border-sm me-2" : "fas fa-save me-2"}`}
                                                                    ></i>
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
                            </div>
                        </div>

                        {/* Onglet 2: Photo et signature (Modification compte) */}
                        <div
                            className="tab-pane fade"
                            id="photo-signature"
                            role="tabpanel"
                        >
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-edit me-2"></i>
                                                Modification compte
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="2">
                                                                <hr className="my-2" />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte
                                                                    abrégé
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div className="d-flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "8px",
                                                                            width: "120px",
                                                                        }}
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setcompte_to_search(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                    <button
                                                                        className="btn"
                                                                        style={{
                                                                            background:
                                                                                "#138496",
                                                                            color: "white",
                                                                            borderRadius:
                                                                                "8px",
                                                                        }}
                                                                        onClick={
                                                                            getSeachedData
                                                                        }
                                                                    >
                                                                        <i className="fas fa-search me-1"></i>
                                                                        {/* Rechercher */}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Code monnaie
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    value={
                                                                        code_monnaie
                                                                    }
                                                                    disabled
                                                                >
                                                                    <option value="CDF">
                                                                        CDF
                                                                    </option>
                                                                    <option value="USD">
                                                                        USD
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type épargne
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settype_epargne(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        type_epargne
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            type_epargne
                                                                        }
                                                                    >
                                                                        {
                                                                            type_epargne
                                                                        }
                                                                    </option>
                                                                    <option value="Epargne à vie">
                                                                        Epargne
                                                                        à vie
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Type client
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settype_client(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        type_client
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            type_client
                                                                        }
                                                                    >
                                                                        {
                                                                            type_client
                                                                        }
                                                                    </option>
                                                                    <option value="Personne pysique">
                                                                        Personne
                                                                        physique
                                                                    </option>
                                                                    <option value="Personne morale">
                                                                        Personne
                                                                        morale
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Intitulé de
                                                                    compte
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setintitule_compte(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        intitule_compte
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="card border-0 shadow-sm ">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                IDENTITÉ
                                            </h6>
                                        </div>
                                        <div
                                            className="card-body"
                                            style={{
                                                maxHeight: "575px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        {[
                                                            {
                                                                label: "Lieu de naissance",
                                                                field: lieu_naissance,
                                                                setter: setlieu_naissance,
                                                            },
                                                            {
                                                                label: "Date de naissance",
                                                                field: date_naissance,
                                                                setter: setdate_naissance,
                                                            },
                                                            {
                                                                label: "Nom du père",
                                                                field: nom_pere,
                                                                setter: setnom_pere,
                                                            },
                                                            {
                                                                label: "Nom de la mère",
                                                                field: nom_mere,
                                                                setter: setnom_mere,
                                                            },
                                                            {
                                                                label: "Profession",
                                                                field: profession,
                                                                setter: setprofession,
                                                            },
                                                            {
                                                                label: "Lieu de travail",
                                                                field: lieu_travail,
                                                                setter: setlieu_travail,
                                                            },
                                                            {
                                                                label: "Email",
                                                                field: email,
                                                                setter: setemail,
                                                            },
                                                            {
                                                                label: "Téléphone",
                                                                field: telephone,
                                                                setter: settelephone,
                                                            },
                                                            {
                                                                label: "Num pièce",
                                                                field: num_piece,
                                                                setter: setnum_piece,
                                                            },
                                                            {
                                                                label: "Délivée à",
                                                                field: lieu_devivraison_piece,
                                                                setter: setlieu_devivraison_piece,
                                                            },
                                                        ].map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                        width: "45%",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </label>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        value={
                                                                            item.field
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            item.setter(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    État civile
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setetat_civile(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        etat_civile
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Marié(e)">
                                                                        Marié(e)
                                                                    </option>
                                                                    <option value="Célibateur">
                                                                        Célibataire
                                                                    </option>
                                                                    <option value="Veuf(ve)">
                                                                        Veuf(ve)
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Civilité
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setcivilite(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        civilite
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Monsieur">
                                                                        Monsieur
                                                                    </option>
                                                                    <option value="Madame">
                                                                        Madame
                                                                    </option>
                                                                    <option value="Mademoiselle">
                                                                        Mademoiselle
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Sexe
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setsexe(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={sexe}
                                                                >
                                                                    <option value="">
                                                                        Sélectionnez
                                                                    </option>
                                                                    <option value="Homme">
                                                                        Homme
                                                                    </option>
                                                                    <option value="Femme">
                                                                        Femme
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-7">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div
                                            className="card-header bg-white border-0 py-3 px-4"
                                            style={{
                                                borderBottom:
                                                    "1px solid #eef2f6",
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    className="rounded p-2"
                                                    style={{
                                                        background:
                                                            "rgba(19,132,150,0.1)",
                                                    }}
                                                >
                                                    <i className="fas fa-camera text-info"></i>
                                                </div>
                                                <h6
                                                    className="fw-bold mb-0"
                                                    style={{ color: "#1a2c3e" }}
                                                >
                                                    Photo et signature
                                                </h6>
                                            </div>
                                        </div>
                                        <div className="card-body p-4">
                                            {/* Tabs pour alterner entre les 3 options */}
                                            <ul
                                                className="nav nav-pills mb-4"
                                                style={{
                                                    gap: "0.5rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <li className="nav-item">
                                                    <button
                                                        className={`btn ${uploadMode === "signature" ? "btn-modern" : "btn-modern-secondary"}`}
                                                        onClick={() =>
                                                            setUploadMode(
                                                                "signature",
                                                            )
                                                        }
                                                        style={{
                                                            fontSize:
                                                                "0.875rem",
                                                        }}
                                                    >
                                                        <i className="fas fa-signature me-2"></i>
                                                        Signature
                                                    </button>
                                                </li>
                                                <li className="nav-item">
                                                    <button
                                                        className={`btn ${uploadMode === "photo_upload" ? "btn-modern" : "btn-modern-secondary"}`}
                                                        onClick={() =>
                                                            setUploadMode(
                                                                "photo_upload",
                                                            )
                                                        }
                                                        style={{
                                                            fontSize:
                                                                "0.875rem",
                                                        }}
                                                    >
                                                        <i className="fas fa-upload me-2"></i>
                                                        Upload photo
                                                    </button>
                                                </li>
                                                <li className="nav-item">
                                                    <button
                                                        className={`btn ${uploadMode === "camera" ? "btn-modern" : "btn-modern-secondary"}`}
                                                        onClick={() =>
                                                            setUploadMode(
                                                                "camera",
                                                            )
                                                        }
                                                        style={{
                                                            fontSize:
                                                                "0.875rem",
                                                        }}
                                                    >
                                                        <i className="fas fa-camera me-2"></i>
                                                        Capture photo
                                                    </button>
                                                </li>
                                            </ul>

                                            {/* MODE 1: SIGNATURE */}
                                            {uploadMode === "signature" && (
                                                <>
                                                    {signature_file && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-file-signature me-1"></i>
                                                                Signature
                                                                actuelle
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light">
                                                                <Zoom>
                                                                    <img
                                                                        src={`/uploads/membres/signatures/files/${signature_file}`}
                                                                        alt="Photo du membre"
                                                                        style={{
                                                                            width: "100%",
                                                                            height:"100px",
                                                                            // minHeight:
                                                                            //     "50px",
                                                                            objectFit:
                                                                                "contain",
                                                                        }}
                                                                        onError={(
                                                                            e,
                                                                        ) => {
                                                                            e.target.src =
                                                                                "/images/default-avatar.png";
                                                                        }}
                                                                    />
                                                                </Zoom>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mb-4">
                                                        <label className="form-label fw-semibold small text-secondary">
                                                            <i className="fas fa-upload me-1"></i>
                                                            Nouvelle signature
                                                        </label>
                                                        <div
                                                            className="drop-zone p-4 text-center rounded-3"
                                                            style={{
                                                                border: "2px dashed #138496",
                                                                background:
                                                                    "#f8f9fa",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.3s",
                                                            }}
                                                            onDragOver={(e) =>
                                                                e.preventDefault()
                                                            }
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                const file =
                                                                    e
                                                                        .dataTransfer
                                                                        .files[0];
                                                                if (
                                                                    file &&
                                                                    (file.type.startsWith(
                                                                        "image/",
                                                                    ) ||
                                                                        file.type ===
                                                                            "application/pdf")
                                                                ) {
                                                                    setsignature_image_file(
                                                                        file,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <i
                                                                className="fas fa-cloud-upload-alt fa-3x mb-3"
                                                                style={{
                                                                    color: "#138496",
                                                                }}
                                                            ></i>
                                                            <p className="mb-2 text-muted">
                                                                Déposez votre
                                                                fichier ici ou
                                                            </p>
                                                            <input
                                                                type="file"
                                                                className="form-control modern-input"
                                                                accept="pdf/*,image/*"
                                                                onChange={(e) =>
                                                                    setsignature_image_file(
                                                                        e.target
                                                                            .files[0],
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={
                                                            updateMembreSignature
                                                        }
                                                        className="btn btn-modern w-100 py-3"
                                                    >
                                                        <i className="fas fa-upload me-2"></i>
                                                        Mettre à jour la
                                                        signature
                                                    </button>
                                                </>
                                            )}

                                            {/* MODE 2: UPLOAD PHOTO */}
                                            {uploadMode === "photo_upload" && (
                                                <>
                                                    {photo_file && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-image me-1"></i>
                                                                Photo actuelle
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light text-center">
                                                                <img
                                                                    src={`/uploads/membres/photos/files/${photo_file}`}
                                                                    alt="Photo du membre"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "150px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        e.target.src =
                                                                            "/images/default-avatar.png";
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mb-4">
                                                        <label className="form-label fw-semibold small text-secondary">
                                                            <i className="fas fa-upload me-1"></i>
                                                            Nouvelle photo
                                                        </label>
                                                        <div
                                                            className="drop-zone p-4 text-center rounded-3"
                                                            style={{
                                                                border: "2px dashed #138496",
                                                                background:
                                                                    "#f8f9fa",
                                                                cursor: "pointer",
                                                                transition:
                                                                    "all 0.3s",
                                                            }}
                                                            onDragOver={(e) =>
                                                                e.preventDefault()
                                                            }
                                                            onDrop={handleDrop}
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        "photoInput",
                                                                    )
                                                                    .click()
                                                            }
                                                        >
                                                            <i
                                                                className="fas fa-cloud-upload-alt fa-3x mb-3"
                                                                style={{
                                                                    color: "#138496",
                                                                }}
                                                            ></i>
                                                            <p className="mb-2 text-muted">
                                                                Déposez votre
                                                                image ici ou
                                                                cliquez pour
                                                                sélectionner
                                                            </p>
                                                            <input
                                                                id="photoInput"
                                                                type="file"
                                                                className="form-control modern-input"
                                                                // accept="image/*"
                                                                accept="image/jpeg, image/jpg, image/png, image/gif, image/webp, .jpeg, .jpg, .png, .gif, .webp"
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                                onChange={
                                                                    handlePhotoUpload
                                                                }
                                                            />
                                                            <small className="text-muted">
                                                                Formats acceptés
                                                                : JPG, PNG, GIF.
                                                                Taille max : 2MB
                                                            </small>
                                                        </div>
                                                    </div>

                                                    {capturedPhoto && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-eye me-1"></i>
                                                                Aperçu
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light text-center">
                                                                <img
                                                                    src={
                                                                        capturedPhoto
                                                                    }
                                                                    alt="Aperçu"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "150px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="d-flex gap-2 mt-3">
                                                                <button
                                                                    className="btn btn-modern-secondary flex-grow-1"
                                                                    onClick={() => {
                                                                        setCapturedPhoto(
                                                                            null,
                                                                        );
                                                                        setCapturedPhotoFile(
                                                                            null,
                                                                        );
                                                                    }}
                                                                >
                                                                    <i className="fas fa-times me-2"></i>
                                                                    Annuler
                                                                </button>
                                                                <button
                                                                    className="btn btn-modern flex-grow-1"
                                                                    onClick={
                                                                        updateMembrePhoto
                                                                    }
                                                                    disabled={
                                                                        isUploading
                                                                    }
                                                                >
                                                                    {isUploading ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                                            Enregistrement...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-save me-2"></i>
                                                                            Enregistrer
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* MODE 3: CAPTURE PHOTO VIA WEBCAM */}
                                            {/* {uploadMode === "camera" && (
                                                <>
                                                    {photo_file && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-image me-1"></i>
                                                                Photo actuelle
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light text-center">
                                                                <img
                                                                    src={`/uploads/membres/photos/files/${photo_file}`}
                                                                    alt="Photo du membre"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "150px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        e.target.src =
                                                                            "/images/default-avatar.png";
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mb-4">
                                                        <label className="form-label fw-semibold small text-secondary">
                                                            <i className="fas fa-video me-1"></i>
                                                            Capture photo
                                                        </label>
                                                        <div
                                                            className="position-relative rounded-3 overflow-hidden"
                                                            style={{
                                                                background:
                                                                    "#000",
                                                                aspectRatio:
                                                                    "4/3",
                                                            }}
                                                        >
                                                            <video
                                                                ref={videoRef}
                                                                autoPlay
                                                                playsInline
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                            <canvas
                                                                ref={canvasRef}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                            />
                                                            {!cameraActive &&
                                                                !capturedPhoto && (
                                                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                                        <button
                                                                            className="btn btn-modern"
                                                                            onClick={
                                                                                startCamera
                                                                            }
                                                                        >
                                                                            <i className="fas fa-play me-2"></i>
                                                                            Démarrer
                                                                            la
                                                                            caméra
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>

                                                    {cameraActive && (
                                                        <div className="d-flex gap-3 mb-4">
                                                            <button
                                                                className="btn btn-modern flex-grow-1"
                                                                onClick={
                                                                    capturePhoto
                                                                }
                                                            >
                                                                <i className="fas fa-camera me-2"></i>
                                                                Prendre la photo
                                                            </button>
                                                            <button
                                                                className="btn btn-modern-secondary flex-grow-1"
                                                                onClick={
                                                                    stopCamera
                                                                }
                                                            >
                                                                <i className="fas fa-stop me-2"></i>
                                                                Arrêter
                                                            </button>
                                                        </div>
                                                    )}

                                                    {capturedPhoto && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-eye me-1"></i>
                                                                Aperçu
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light text-center">
                                                                <img
                                                                    src={
                                                                        capturedPhoto
                                                                    }
                                                                    alt="Aperçu"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "150px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="d-flex gap-2 mt-3">
                                                                <button
                                                                    className="btn btn-modern-secondary flex-grow-1"
                                                                    onClick={() => {
                                                                        setCapturedPhoto(
                                                                            null,
                                                                        );
                                                                        setCapturedPhotoFile(
                                                                            null,
                                                                        );
                                                                        startCamera();
                                                                    }}
                                                                >
                                                                    <i className="fas fa-redo me-2"></i>
                                                                    Reprendre
                                                                </button>
                                                                <button
                                                                    className="btn btn-modern flex-grow-1"
                                                                    onClick={
                                                                        updateMembrePhoto
                                                                    }
                                                                    disabled={
                                                                        isUploading
                                                                    }
                                                                >
                                                                    {isUploading ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                                            Enregistrement...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-save me-2"></i>
                                                                            Enregistrer
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )} */}
                                            {/* Mode Capture Photo via Webcam */}
                                            {uploadMode === "camera" && (
                                                <>
                                                    {/* Photo actuelle */}
                                                    {photo_file && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-image me-1"></i>
                                                                Photo actuelle
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light text-center">
                                                                <img
                                                                    src={`/uploads/membres/photos/files/${photo_file}`}
                                                                    alt="Photo du membre"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "150px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        e.target.src =
                                                                            "/images/default-avatar.png";
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Webcam */}
                                                    <div className="mb-4">
                                                        <label className="form-label fw-semibold small text-secondary">
                                                            <i className="fas fa-video me-1"></i>
                                                            Capture photo
                                                        </label>
                                                        <div
                                                            className="position-relative rounded-3 overflow-hidden"
                                                            style={{
                                                                background:
                                                                    "#000",
                                                                aspectRatio:
                                                                    "4/3",
                                                            }}
                                                        >
                                                            <video
                                                                ref={videoRef}
                                                                autoPlay
                                                                playsInline
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                            <canvas
                                                                ref={canvasRef}
                                                                style={{
                                                                    display:
                                                                        "none",
                                                                }}
                                                            />
                                                            {!cameraActive &&
                                                                !capturedPhoto && (
                                                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                                        <button
                                                                            className="btn btn-modern"
                                                                            onClick={
                                                                                startCamera
                                                                            }
                                                                        >
                                                                            <i className="fas fa-play me-2"></i>
                                                                            Démarrer
                                                                            la
                                                                            caméra
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>

                                                    {/* Contrôles photo - AJOUTEZ LE BOUTON CHANGER CAMERA ICI */}
                                                    {cameraActive && (
                                                        <div className="d-flex gap-3 mb-4">
                                                            <button
                                                                className="btn btn-modern flex-grow-1"
                                                                onClick={
                                                                    capturePhoto
                                                                }
                                                            >
                                                                <i className="fas fa-camera me-2"></i>
                                                                Prendre
                                                            </button>
                                                            <button
                                                                className="btn btn-modern-secondary flex-grow-1"
                                                                onClick={
                                                                    switchCamera
                                                                }
                                                            >
                                                                <i className="fas fa-sync-alt me-2"></i>
                                                                Changer
                                                            </button>
                                                            <button
                                                                className="btn btn-modern-secondary flex-grow-1"
                                                                onClick={
                                                                    stopCamera
                                                                }
                                                            >
                                                                <i className="fas fa-stop me-2"></i>
                                                                Arrêter
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Aperçu de la photo capturée */}
                                                    {capturedPhoto && (
                                                        <div className="mb-4">
                                                            <label className="form-label fw-semibold small text-secondary">
                                                                <i className="fas fa-eye me-1"></i>
                                                                Aperçu
                                                            </label>
                                                            <div className="border rounded-3 p-2 bg-light text-center">
                                                                <img
                                                                    src={
                                                                        capturedPhoto
                                                                    }
                                                                    alt="Aperçu"
                                                                    style={{
                                                                        maxWidth:
                                                                            "100%",
                                                                        maxHeight:
                                                                            "150px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="d-flex gap-2 mt-3">
                                                                <button
                                                                    className="btn btn-modern-secondary flex-grow-1"
                                                                    onClick={() => {
                                                                        setCapturedPhoto(
                                                                            null,
                                                                        );
                                                                        setCapturedPhotoFile(
                                                                            null,
                                                                        );
                                                                        startCamera();
                                                                    }}
                                                                >
                                                                    <i className="fas fa-redo me-2"></i>
                                                                    Reprendre
                                                                </button>
                                                                <button
                                                                    className="btn btn-modern flex-grow-1"
                                                                    onClick={
                                                                        updateMembrePhoto
                                                                    }
                                                                    disabled={
                                                                        isUploading
                                                                    }
                                                                >
                                                                    {isUploading ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                                            Enregistrement...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-save me-2"></i>
                                                                            Enregistrer
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section IDENTITE, ADRESSE et AUTRES pour modification (structure similaire avec les setters correspondants) */}
                            <div className="row g-3 mt-3">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                ADRESSE
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "45%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Province
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setprovince(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        province
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            province
                                                                        }
                                                                    >
                                                                        {
                                                                            province
                                                                        }
                                                                    </option>
                                                                    {[
                                                                        "Kinshasa",
                                                                        "Haut-katanga",
                                                                        "Nord-Kivu",
                                                                        "Sud-Kivu",
                                                                        "Lualaba",
                                                                        "Equateur",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Maniema",
                                                                        "Ituri",
                                                                        "Kasai",
                                                                        "Kasai-Central",
                                                                        "Kasai-Oiental",
                                                                        "Congo-Central",
                                                                        "Kwango",
                                                                        "Kwilu",
                                                                        "Lomami",
                                                                        "Mai-Ndombe",
                                                                        "Maniema",
                                                                        "Mongala",
                                                                        "Nord-Ubangi",
                                                                        "Sud-Ubangi",
                                                                        "Tanganyika",
                                                                        "Tshopo",
                                                                        "Tshapa",
                                                                    ].map(
                                                                        (
                                                                            prov,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    prov
                                                                                }
                                                                                value={
                                                                                    prov
                                                                                }
                                                                            >
                                                                                {
                                                                                    prov
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                    {/* {["Kinshasa", "Haut-katanga", "Nord-Kivu", "Sud-Kivu"].map(p => <option key={p} value={p}>{p}</option>)} */}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Territoire
                                                                    ou ville
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setterritoire_ou_ville(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        territoire_ou_ville
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Secteur chef
                                                                    ou com.
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control mt-1"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setcommune(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        commune
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Quartier
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control mt-1"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setquartier(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        quartier
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                AUTRES INFORMATIONS
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "45%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Type de
                                                                    gestion
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="modern-select"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        settype_de_gestion(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        type_de_gestion
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            type_de_gestion
                                                                        }
                                                                    >
                                                                        {
                                                                            type_de_gestion
                                                                        }
                                                                    </option>
                                                                    <option value="Individuel">
                                                                        Individuel
                                                                    </option>
                                                                    <option value="Collectif">
                                                                        Collectif
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    Critère
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="modern-select"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setcritere(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    value={
                                                                        critere
                                                                    }
                                                                >
                                                                    <option
                                                                        value={
                                                                            critere
                                                                        }
                                                                    >
                                                                        {
                                                                            critere
                                                                        }
                                                                    </option>
                                                                    <option value="A">
                                                                        A
                                                                    </option>
                                                                    <option value="B">
                                                                        B
                                                                    </option>
                                                                    <option value="C">
                                                                        C
                                                                    </option>
                                                                    <option value="D">
                                                                        D
                                                                    </option>
                                                                    <option value="Autre">
                                                                        Autre
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        handleSubmitAdhesionUpdate
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${isLoading2 ? "spinner-border spinner-border-sm me-2" : "fas fa-save me-2"}`}
                                                                    ></i>
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
                            </div>
                        </div>

                        {/* Onglet 3: Mandataires */}
                        <div
                            className="tab-pane fade"
                            id="mandataire"
                            role="tabpanel"
                        >
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-user-plus me-2"></i>
                                                Nouveau mandataire
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte
                                                                    abrégé
                                                                </label>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                                                    <div className="d-flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "8px",
                                                                                width: "120px",
                                                                            }}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setcompte_to_search(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <button
                                                                            className="btn"
                                                                            style={{
                                                                                background:
                                                                                    "#138496",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                            onClick={
                                                                                getSeachedData
                                                                            }
                                                                        >
                                                                            <i className="fas fa-search me-1"></i>
                                                                            {/* Rechercher */}
                                                                        </button>
                                                                    </div>
                                                                    {intitule_compte && (
                                                                        <div className="info-bulle-compte ms-2">
                                                                            <i className="fas fa-check-circle"></i>
                                                                            <span>
                                                                                {
                                                                                    intitule_compte
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {/* <tr><td colSpan="2"><label className="fw-bold" style={{ color: "steelblue" }}>{intitule_compte || ""}</label></td></tr> */}
                                                        {[
                                                            {
                                                                label: "Nom mandataire",
                                                                field: mandataireName,
                                                                setter: setmandataireName,
                                                            },
                                                            {
                                                                label: "Téléphone",
                                                                field: mandatairePhone,
                                                                setter: setmandatairePhone,
                                                            },
                                                        ].map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <label
                                                                        style={{
                                                                            color: "steelblue",
                                                                        }}
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </label>
                                                                </td>
                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        style={{
                                                                            borderRadius:
                                                                                "6px",
                                                                        }}
                                                                        value={
                                                                            item.field
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            item.setter(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        AjouterMandataire
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-plus-circle me-2"></i>
                                                                    Ajouter
                                                                    mandataire
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {fetchMandataire &&
                                    fetchMandataire.length > 0 && (
                                        <div className="col-md-6">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-header bg-white border-0 pt-3">
                                                    <h6
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <i className="fas fa-list me-2"></i>
                                                        Liste des mandataires
                                                    </h6>
                                                </div>
                                                <div className="card-body p-0">
                                                    <div className="table-responsive">
                                                        <table className="table table-hover mb-0">
                                                            <thead
                                                                style={{
                                                                    backgroundColor:
                                                                        "#e6f2f9",
                                                                }}
                                                            >
                                                                <tr
                                                                    style={{
                                                                        color: "steelblue",
                                                                    }}
                                                                >
                                                                    <th>
                                                                        Nom
                                                                        mandataire
                                                                    </th>
                                                                    <th>
                                                                        Téléphone
                                                                    </th>
                                                                    <th>
                                                                        Action
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {fetchMandataire.map(
                                                                    (
                                                                        res,
                                                                        index,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <td className="fw-semibold">
                                                                                {
                                                                                    res.mendataireName
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    res.telephoneM
                                                                                }
                                                                            </td>
                                                                            <td>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        DeleteMandataire(
                                                                                            res.id,
                                                                                        )
                                                                                    }
                                                                                    className="btn btn-sm"
                                                                                    style={{
                                                                                        background:
                                                                                            "#dc3545",
                                                                                        color: "white",
                                                                                        borderRadius:
                                                                                            "6px",
                                                                                        padding:
                                                                                            "4px 12px",
                                                                                    }}
                                                                                >
                                                                                    <i className="fas fa-trash-alt me-1"></i>
                                                                                    Supprimer
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Onglet 4: Création comptes */}
                        <div
                            className="tab-pane fade"
                            id="creation-compte"
                            role="tabpanel"
                        >
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-0 pt-3">
                                            <h6
                                                className="fw-bold"
                                                style={{ color: "steelblue" }}
                                            >
                                                <i className="fas fa-credit-card me-2"></i>
                                                Création compte
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <form>
                                                <table
                                                    style={{ width: "100%" }}
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                    width: "40%",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte
                                                                    abrégé
                                                                </label>
                                                            </td>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                                                    <div className="d-flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            style={{
                                                                                borderRadius:
                                                                                    "8px",
                                                                                width: "120px",
                                                                            }}
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setcompte_to_search(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <button
                                                                            className="btn"
                                                                            style={{
                                                                                background:
                                                                                    "#138496",
                                                                                color: "white",
                                                                                borderRadius:
                                                                                    "8px",
                                                                            }}
                                                                            onClick={
                                                                                getSeachedData
                                                                            }
                                                                        >
                                                                            <i className="fas fa-search me-1"></i>
                                                                            {/* Rechercher */}
                                                                        </button>
                                                                    </div>
                                                                    {intitule_compte && (
                                                                        <div className="info-bulle-compte ms-2">
                                                                            <i className="fas fa-check-circle"></i>
                                                                            <span>
                                                                                {
                                                                                    intitule_compte
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {/* <td style={{ padding: "6px" }}>
                                                        <label className="fw-bold" style={{ color: "steelblue" }}>{intitule_compte || ""}</label>
                                                    </td> */}
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        color: "steelblue",
                                                                        fontWeight:
                                                                            "500",
                                                                    }}
                                                                >
                                                                    Compte à
                                                                    créer
                                                                </label>
                                                            </td>
                                                            <td
                                                                colSpan="2"
                                                                style={{
                                                                    padding:
                                                                        "6px",
                                                                }}
                                                            >
                                                                <select
                                                                    className="modern-select"
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                    name="devise_compte"
                                                                    id="devise_compte"
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setdevise_compte(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="CDF">
                                                                        Compte
                                                                        en CDF
                                                                    </option>
                                                                    <option value="USD">
                                                                        Compte
                                                                        en USD
                                                                    </option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td
                                                                colSpan="3"
                                                                style={{
                                                                    padding:
                                                                        "15px 6px 6px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={
                                                                        createAccount
                                                                    }
                                                                    className="btn w-100 py-2"
                                                                    style={{
                                                                        background:
                                                                            "#138496",
                                                                        color: "white",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-plus-circle me-2"></i>
                                                                    Créer le
                                                                    compte
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
                    </div>
                </div>
            </div>

            <style>
                {`
        /* Onglets modernes */
.tabs-modern {
  display: flex;
  gap: 0.25rem;
  background: transparent;
  border-bottom: 1px solid #eef2f6;
  padding: 0;
  margin-bottom: 1.5rem;
}

.tabs-modern .nav-item {
  list-style: none;
  margin-bottom: -1px;
}

.tabs-modern .nav-link {
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

.tabs-modern .nav-link i {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

/* Effet hover */
.tabs-modern .nav-link:hover {
  color: #138496;
  border-bottom-color: #c4e6ed;
  background: #fafcfc;
}

/* Onglet actif */
.tabs-modern .nav-link.active {
  color: #138496;
  border-bottom-color: #138496;
  background: white;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.02);
}

/* Animation légère sur l'icône au hover */
.tabs-modern .nav-link:hover i {
  transform: translateY(-1px);
}

/* Responsive : empilage sur mobile */
@media (max-width: 640px) {
  .tabs-modern {
    flex-wrap: wrap;
    gap: 0.5rem;
    border-bottom: none;
  }
  .tabs-modern .nav-link {
    border-bottom: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 0.5rem 1rem;
  }
  .tabs-modern .nav-link.active {
    border-bottom-color: #138496;
    background: #eef9fc;
  }
}

/* Boutons modernes */
.btn-modern {
    background: linear-gradient(135deg, #138496 0%, #0f6e7a 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-modern:hover {
    background: linear-gradient(135deg, #0f6e7a 0%, #0c5a64 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(19,132,150,0.3);
    color: white;
}

.btn-modern-secondary {
    background: #f1f5f9;
    color: #138496;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.btn-modern-secondary:hover {
    background: #eef9fc;
    border-color: #138496;
}

/* Drop zone */
.drop-zone:hover {
    border-color: #0d6e7a !important;
    background: #f0f9fa !important;
}

/* Nav pills */
.nav-pills .btn {
    border-radius: 10px;
}
        `}
            </style>
        </div>
    );
};

export default Adhesion;
