import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AgencesManagement = () => {
    // État pour la liste des agences
    const [agences, setAgences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // État pour le formulaire (modale)
    const [showForm, setShowForm] = useState(false);
    const [selectedAgenceId, setSelectedAgenceId] = useState(null);

    // Charger la liste des agences depuis le backend
    const fetchAgences = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/agences/list");
            console.log("Données reçues :", response.data); // 👈 AJOUTEZ CECI
            console.log("Premier élément :", response.data[0]); // 👈 POUR VOIR LES CLÉS

            setAgences(response.data);
        } catch (error) {
            console.error("Erreur chargement:", error);
                 Swal.fire({
                    icon: 'error',
                    title: 'Chargement de données !',
                    text: "Impossible de charger la liste des agences",
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            //alert("Impossible de charger la liste des agences");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgences();
    }, []);

    // Supprimer une agence
    const handleDelete = async (id, nom) => {
        if (window.confirm(`Supprimer l'agence "${nom}" ?`)) {
            try {
                await axios.delete(`/agences/delete/${id}`);
                fetchAgences(); // recharger la liste
                 Swal.fire({
                    icon: 'success',
                    title: 'Suppression !',
                    text: 'Agence supprimée avec succès',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                // alert("Agence supprimée avec succès");
            } catch (error) {
                console.error("Erreur suppression:", error);
                  
                Swal.fire({
                    icon: 'error',
                    title: 'Suppression !',
                    text: 'Erreur lors de la suppression',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        }
    };

    // Ouvrir le formulaire en mode modification
    const handleEdit = (id) => {
        setSelectedAgenceId(id);
        setShowForm(true);
    };

    // Fermer le formulaire
    const handleCancelForm = () => {
        setShowForm(false);
        setSelectedAgenceId(null);
    };

    // Après succès du formulaire (création ou modification)
    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedAgenceId(null);
        fetchAgences(); // rafraîchir la liste
    };

    // Filtrage des agences par code ou nom
    const filteredAgences = agences.filter(
        (agence) =>
            (agence.nom_agence &&
                agence.nom_agence
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())) ||
            (agence.code_agence &&
                agence.code_agence
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())),
    );

    return (
        <div className="agences-container">
            {/* En-tête avec recherche et bouton nouvelle agence */}
            <div className="list-header">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-building"></i> Gestion des agences
                    </h2>
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Rechercher par code ou nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    className="btn-primary-modern"
                    onClick={() => {
                        setSelectedAgenceId(null);
                        setShowForm(true);
                    }}
                >
                    <i className="fas fa-plus-circle"></i> Nouvelle agence
                </button>
            </div>

            {/* Tableau des agences */}
            {loading ? (
                <div className="loader">Chargement...</div>
            ) : (
                <div className="table-responsive">
                    <table className="modern-table table-sm">
                        <thead>
                            <tr>
                                <th>Code agence</th>
                                <th>Nom de l'agence</th>
                                <th>Compte liaison CDF</th>
                                <th>Compte liaison USD</th>
                                <th>Dernier numéro dossier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgences.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-row">
                                        Aucune agence trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredAgences.map((agence) => (
                                    <tr key={agence.id}>
                                        <td>
                                            <span className="badge-code">
                                                {agence.code_agence}
                                            </span>
                                        </td>
                                        <td className="fw-semibold">
                                            {agence.nom_agence}
                                        </td>
                                        <td>
                                            {agence.compte_liaison_cdf || "-"}
                                        </td>
                                        <td>
                                            {agence.compte_liaison_usd || "-"}
                                        </td>
                                        <td>
                                            {agence.last_ref_numdossier || "0"}
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-icon edit"
                                                onClick={() =>
                                                    handleEdit(agence.id)
                                                }
                                                title="Modifier"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() =>
                                                    handleDelete(
                                                        agence.id,
                                                        agence.nom_agence,
                                                    )
                                                }
                                                title="Supprimer"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modale du formulaire d'ajout/modification */}
            {showForm && (
                <div className="modal-overlay" onClick={handleCancelForm}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AgenceForm
                            agenceId={selectedAgenceId}
                            onSuccess={handleFormSuccess}
                            onCancel={handleCancelForm}
                        />
                    </div>
                </div>
            )}

            {/* Styles intégrés */}
            <style>
                {`
          /* Conteneur principal */
          .agences-container {
            padding: 2rem;
            background: #f8fafc;
            min-height: 100vh;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          }

          /* En-tête et recherche */
          .list-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 2rem;
            flex-wrap: wrap;
          }

          .header-left h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .search-box {
            position: relative;
            display: flex;
            align-items: center;
          }

          .search-box i {
            position: absolute;
            left: 12px;
            color: #94a3b8;
          }

          .search-box input {
            padding: 10px 12px 10px 36px;
            border: 1px solid #e2e8f0;
            border-radius: 40px;
            width: 260px;
            font-size: 0.9rem;
            background: white;
            transition: all 0.2s;
          }

          .search-box input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          /* Bouton primaire moderne */
          .btn-primary-modern {
            background: linear-gradient(105deg, #3b82f6, #2563eb);
            border: none;
            padding: 12px 28px;
            border-radius: 40px;
            font-weight: 600;
            font-size: 0.9rem;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .btn-primary-modern:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          }

          /* Tableau moderne */
          .modern-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .modern-table thead {
            background: #1e293b;
            color: white;
          }

          .modern-table th {
            padding: 16px 20px;
            text-align: left;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .modern-table td {
            padding: 14px 20px;
            border-bottom: 1px solid #eef2f6;
            color: #1e293b;
          }

          .modern-table tbody tr:hover {
            background-color: #f8fafc;
            transition: background 0.2s;
          }

          .badge-code {
            background: #e0f2fe;
            color: #0284c7;
            padding: 4px 10px;
            border-radius: 40px;
            font-weight: 500;
            font-size: 0.8rem;
            font-family: monospace;
          }

          .actions {
            display: flex;
            gap: 12px;
          }

          .btn-icon {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 6px;
            border-radius: 40px;
            transition: all 0.2s;
          }

          .btn-icon.edit {
            color: #3b82f6;
          }

          .btn-icon.edit:hover {
            background: #eff6ff;
            transform: scale(1.1);
          }

          .btn-icon.delete {
            color: #ef4444;
          }

          .btn-icon.delete:hover {
            background: #fef2f2;
            transform: scale(1.1);
          }

          .empty-row {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
          }

          .loader {
            text-align: center;
            padding: 60px;
            color: #475569;
          }

          /* Modale */
          .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: flex-start;  /* change center → flex-start */
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;         /* permet de scroller si besoin */
}

.modal-content {
  max-width: 900px;
  width: 100%;
  max-height: none;         /* supprime la hauteur max pour laisser l'overlay gérer */
  margin-top: 15vh;          /* espace en haut (5% de la hauteur de l'écran) */
  margin-bottom: 5vh;       /* espace en bas */
  border-radius: 28px;
  animation: modalFadeIn 0.2s ease;
}

          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.98);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .agences-container {
              padding: 1rem;
            }
            .search-box input {
              width: 200px;
            }
            .modern-table th,
            .modern-table td {
              padding: 10px 12px;
            }
          }
        `}
            </style>
        </div>
    );
};

// ------------------------------------------------------------
// Composant AgenceForm (formulaire d'ajout/modification)
// ------------------------------------------------------------
const AgenceForm = ({ agenceId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        code_agence: "",
        nom_agence: "",
        compte_liaison_cdf: "",
        compte_liaison_usd: "",
        last_ref_compte: "",
        last_ref_num_visa: "",
        last_ref_numdossier: "",
        compte_virement_caisse_cdf: "",
        compte_virement_caisse_usd: "",
        compte_caisse_usd: "",
        compte_caisse_cdf: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    // Charger les données si on est en mode modification
    useEffect(() => {
        if (agenceId) {
            setIsEditMode(true);
            fetchAgence();
        }
    }, [agenceId]);

    const fetchAgence = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/eco/agences/store/${agenceId}`);
            setFormData(response.data);
        } catch (error) {
            console.error("Erreur chargement:", error);
             Swal.fire({
                    icon: 'error',
                    title: 'Suppression !',
                    text: "Impossible de charger les données de l'agence",
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
           
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.code_agence.trim())
            newErrors.code_agence = "Le code agence est requis";
        if (!formData.nom_agence.trim())
            newErrors.nom_agence = "Le nom de l'agence est requis";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await axios.put(`/eco/agences/update/${agenceId}`, formData);
                    Swal.fire({
                    icon: 'success',
                    title: 'Modification !',
                    text: "Agence modifiée avec succès",
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                // alert("Agence modifiée avec succès");
            } else {
                await axios.post("/eco/agences/store/", formData);
                // alert("Agence créée avec succès");
                    Swal.fire({
                    icon: 'success',
                    title: 'Modification !',
                    text: "Agence créée avec succès",
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
              Swal.fire({
                    icon: 'error',
                    title: 'Ajout !',
                    text: "Une erreur est survenue",
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            // alert("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code_agence: "",
            nom_agence: "",
            compte_liaison_cdf: "",
            compte_liaison_usd: "",
            last_ref_compte: "",
            last_ref_num_visa: "",
            last_ref_numdossier: "",
            compte_virement_caisse_cdf: "",
            compte_virement_caisse_usd: "",
            compte_caisse_usd: "",
            compte_caisse_cdf: "",
        });
        setErrors({});
        setIsEditMode(false);
    };

    return (
        <div className="agence-form-container">
            <div className="form-card">
                <div className="form-header">
                    <h2>
                        {isEditMode
                            ? "✏️ Modifier l'agence"
                            : "➕ Nouvelle agence"}
                    </h2>
                    {onCancel && (
                        <button
                            type="button"
                            className="close-btn"
                            onClick={onCancel}
                        >
                            ×
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                        <tbody>
                            {/* Ligne 1 : Code agence + Nom agence */}
                            <tr>
                                <td
                                    style={{ padding: "6px 8px", width: "25%" }}
                                >
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                            color: "#334155",
                                        }}
                                    >
                                        Code agence{" "}
                                        <span style={{ color: "#ef4444" }}>
                                            *
                                        </span>
                                    </label>
                                </td>
                                <td
                                    style={{ padding: "6px 8px", width: "25%" }}
                                >
                                    <input
                                        type="text"
                                        name="code_agence"
                                        value={formData.code_agence}
                                        onChange={handleChange}
                                        placeholder="Ex: AG001"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                            fontSize: "0.9rem",
                                        }}
                                        className={
                                            errors.code_agence ? "error" : ""
                                        }
                                    />
                                    {errors.code_agence && (
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "#ef4444",
                                            }}
                                        >
                                            {errors.code_agencee}
                                        </span>
                                    )}
                                </td>
                                <td
                                    style={{ padding: "6px 8px", width: "25%" }}
                                >
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                            color: "#334155",
                                        }}
                                    >
                                        Nom agence{" "}
                                        <span style={{ color: "#ef4444" }}>
                                            *
                                        </span>
                                    </label>
                                </td>
                                <td
                                    style={{ padding: "6px 8px", width: "25%" }}
                                >
                                    <input
                                        type="text"
                                        name="nom_agence"
                                        value={formData.nom_agence}
                                        onChange={handleChange}
                                        placeholder="Nom agence"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                            fontSize: "0.9rem",
                                        }}
                                        className={
                                            errors.nom_agence ? "error" : ""
                                        }
                                    />
                                    {errors.nom_agence && (
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                color: "#ef4444",
                                            }}
                                        >
                                            {errors.nom_agence}
                                        </span>
                                    )}
                                </td>
                            </tr>

                            {/* Ligne 2 : Compte liaison CDF + Compte liaison USD */}
                            <tr>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Compte liaison CDF
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="text"
                                        name="compte_liaison_cdf"
                                        value={formData.compte_liaison_cdf}
                                        onChange={handleChange}
                                        placeholder="Numéro"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Compte liaison USD
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="text"
                                        name="compte_liaison_usd"
                                        value={formData.compte_liaison_usd}
                                        onChange={handleChange}
                                        placeholder="Numéro"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                            </tr>

                            {/* Ligne 3 : Dernière réf. compte + Dernier numéro visa */}
                            <tr>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Dernière réf. compte
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="number"
                                        name="last_ref_compte"
                                        value={formData.last_ref_compte}
                                        onChange={handleChange}
                                        placeholder="0"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Dernier numéro visa
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="text"
                                        name="last_ref_num_visa"
                                        value={formData.last_ref_num_visa}
                                        onChange={handleChange}
                                        placeholder="VISA001"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                            </tr>

                            {/* Ligne 4 : Dernier numéro dossier + Compte virement caisse CDF */}
                            <tr>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Dernier numéro dossier
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="number"
                                        name="last_ref_numdossier"
                                        value={formData.last_ref_numdossier}
                                        onChange={handleChange}
                                        placeholder="0"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Compte virement caisse CDF
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="text"
                                        name="compte_virement_caisse_cdf"
                                        value={
                                            formData.compte_virement_caisse_cdf
                                        }
                                        onChange={handleChange}
                                        placeholder="Numéro"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                            </tr>

                            {/* Ligne 5 : Compte virement caisse USD + Compte caisse USD */}
                            <tr>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Compte virement caisse USD
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="text"
                                        name="compte_virement_caisse_usd"
                                        value={
                                            formData.compte_virement_caisse_usd
                                        }
                                        onChange={handleChange}
                                        placeholder="Numéro"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Compte caisse USD
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }}>
                                    <input
                                        type="text"
                                        name="compte_caisse_usd"
                                        value={formData.compte_caisse_usd}
                                        onChange={handleChange}
                                        placeholder="Numéro"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                            </tr>

                            {/* Ligne 6 : Compte caisse CDF seul (ou on peut le mettre avec un espace vide) */}
                            <tr>
                                <td style={{ padding: "6px 8px" }}>
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Compte caisse CDF
                                    </label>
                                </td>
                                <td style={{ padding: "6px 8px" }} colSpan="3">
                                    <input
                                        type="text"
                                        name="compte_caisse_cdf"
                                        value={formData.compte_caisse_cdf}
                                        onChange={handleChange}
                                        placeholder="Numéro"
                                        style={{
                                            width: "100%",
                                            padding: "8px 10px",
                                            borderRadius: "12px",
                                            border: "1.5px solid #e2e8f0",
                                        }}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div
                        className="form-actions"
                        style={{
                            marginTop: "20px",
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                        }}
                    >
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Enregistrement..."
                                : isEditMode
                                  ? "Mettre à jour"
                                  : "Créer"}
                        </button>
                        {onCancel && (
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onCancel}
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Styles du formulaire (intégrés) */}
            <style>
                {`
          .agence-form-container {
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
            padding: 0;
          }
          .form-card {
            background: white;
            border-radius: 28px;
            box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.25);
            width: 100%;
            overflow: hidden;
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: linear-gradient(105deg, #1e2a3a 0%, #0f172a 100%);
            color: white;
          }
          .form-header h2 {
            margin: 0;
            font-weight: 600;
            font-size: 1.5rem;
          }
          .close-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            font-size: 1.8rem;
            cursor: pointer;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          .close-btn:hover {
            background: rgba(255,255,255,0.3);
          }
          form {
            padding: 2rem;
          }
          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem 2rem;
            margin-bottom: 2rem;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .form-group label {
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #334155;
          }
          .required {
            color: #ef4444;
            margin-left: 4px;
          }
          .form-group input {
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 16px;
            font-size: 0.95rem;
            transition: all 0.2s;
            background-color: #fafcff;
          }
          .form-group input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
            background-color: white;
          }
          .form-group input.error {
            border-color: #ef4444;
            background-color: #fef2f2;
          }
          .error-msg {
            font-size: 0.75rem;
            color: #ef4444;
            margin-top: 4px;
          }
          .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            border-top: 1px solid #eef2f6;
            padding-top: 2rem;
          }
          .btn-submit, .btn-cancel {
            padding: 12px 28px;
            border-radius: 40px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
          }
          .btn-submit {
            background: linear-gradient(105deg, #10b981, #047857);
            color: white;
            box-shadow: 0 4px 8px rgba(16,185,129,0.2);
          }
          .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(16,185,129,0.4);
          }
          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .btn-cancel {
            background: #f1f5f9;
            color: #1e293b;
          }
          .btn-cancel:hover {
            background: #e2e8f0;
            transform: translateY(-1px);
          }
          @media (max-width: 768px) {
            form { padding: 1.5rem; }
            .form-grid { grid-template-columns: 1fr; }
            .form-actions { flex-direction: column; }
            .btn-submit, .btn-cancel { width: 100%; text-align: center; }
          }

          /* Réduction des espaces dans le tableau */
.modal-form-table td {
  vertical-align: top;
  padding: 6px 8px !important;
}
.modal-form-table input, .modal-form-table select {
  margin: 0;
}
        `}
            </style>
        </div>
    );
};

export default AgencesManagement;
