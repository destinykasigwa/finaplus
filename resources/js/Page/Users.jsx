import styles from "../styles/Global.module.css";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
const Users = () => {
    const navigate = useNavigate();
    // const [user, setUser] = useState({
    //     name: "",
    //     email: "",
    // });
    const [email, setEmail] = useState();
    const [name, setName] = useState();
    const [userId, setUserId] = useState();
    const [profilName, setProfileName] = useState();
    const [loading, setIsloading] = useState(false);
    const [loading2, setIsloading2] = useState(false);

    const [error, setError] = useState([]);
    const [fetchUsers, setFetchUsers] = useState();
    const [fetchProfil, setFetchProfil] = useState();
    const [fetchMenu, setFetchMenu] = useState();
    const [selectedData, setSelectedData] = useState();
    const [selectedProfilData, setSelectedProfilData] = useState();
    const [selectedMenuData, setSelectedMenuData] = useState();
    const [getEditForm, setGetEditForm] = useState(false);
    const [getResetPassWordForm, setGetResetPassWordForm] = useState(false);
    const [getLockUserForm, setGetLockUserForm] = useState(false);
    const [fetchProfilForSelectedUser, setFetchProfilForSelectedUser] =
        useState();
    const [fetchMenuForSelectedUser, setFetchMenuForSelectedUser] = useState();

    const [records, setRecords] = useState();
    const [Profilrecords, setProfilrecords] = useState();
    const [menuRecords, setMenuRecords] = useState();

   const columns = [
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-user-circle" style={{ fontSize: "14px" }}></i>
        <span>Nom d'utilisateur</span>
      </div>
    ),
    selector: (row) => row.name,
    sortable: true,
    grow: 2,
    style: {
      fontWeight: "500",
      color: "#2c3e50"
    }
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-envelope" style={{ fontSize: "14px" }}></i>
        <span>Email</span>
      </div>
    ),
    selector: (row) => row.email,
    grow: 2,
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-building" style={{ fontSize: "14px" }}></i>
        <span>Code Agence</span>
      </div>
    ),
    selector: "code_agence",
    grow: 1,
    cell: (row) => (
      <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
        {row.code_agence || "N/A"}
      </span>
    )
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-phone" style={{ fontSize: "14px" }}></i>
        <span>Téléphone</span>
      </div>
    ),
    selector: "phone",
    grow: 1,
    cell: (row) => (
      <span className="d-flex align-items-center gap-1">
        <i className="fas fa-phone-alt text-muted" style={{ fontSize: "11px" }}></i>
        {row.phone || "Non renseigné"}
      </span>
    )
  },
];

const ProfilForUserCulumn = [
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-tag" style={{ fontSize: "14px" }}></i>
        <span>Profil</span>
      </div>
    ),
    selector: (row) => row.nom_profile,
    grow: 3,
    cell: (row) => (
      <span className="fw-semibold" style={{ color: "teal" }}>
        <i className="fas fa-id-card me-2" style={{ fontSize: "12px" }}></i>
        {row.nom_profile}
      </span>
    )
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-trash-alt" style={{ fontSize: "14px" }}></i>
        <span>Action</span>
      </div>
    ),
    cell: (row) => (
      <button
        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
        onClick={() => removeProfil(row.id)}
        style={{
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: "500",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#dc3545";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#dc3545";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <i className="fas fa-trash-alt"></i>
        <span>Retirer</span>
      </button>
    ),
    grow: 1,
    center: true,
  },
];

const columnsProfil = [
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-id-card" style={{ fontSize: "14px" }}></i>
        <span>Description du profil</span>
      </div>
    ),
    selector: (row) => row.nom_profile,
    grow: 3,
    cell: (row) => (
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "rgba(32, 201, 151, 0.1)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <i className="fas fa-users" style={{ color: "teal", fontSize: "14px" }}></i>
        </div>
        <span className="fw-semibold">{row.nom_profile}</span>
      </div>
    )
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-plus-circle" style={{ fontSize: "14px" }}></i>
        <span>Action</span>
      </div>
    ),
    cell: (row) => (
      <button
        className="btn btn-sm btn-teal d-flex align-items-center gap-1"
        onClick={() => addUserProfil(row.id)}
        style={{
          backgroundColor: "teal",
          color: "white",
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: "500",
          border: "none",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "teal";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(32, 201, 151, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "teal";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <i className="fas fa-user-plus"></i>
        <span>Ajouter ce profil</span>
      </button>
    ),
    grow: 2,
    center: true,
  },
];

const columnsMenu = [
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-bars" style={{ fontSize: "14px" }}></i>
        <span>Nom du menu</span>
      </div>
    ),
    selector: (row) => row.menu_name,
    grow: 3,
    cell: (row) => (
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: "28px",
            height: "28px",
            backgroundColor: "rgba(13, 110, 253, 0.1)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <i className="fas fa-folder" style={{ color: "#0d6efd", fontSize: "12px" }}></i>
        </div>
        <span>{row.menu_name}</span>
      </div>
    )
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-plus-circle" style={{ fontSize: "14px" }}></i>
        <span>Action</span>
      </div>
    ),
    cell: (row) => (
      <button
        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
        onClick={() => addMenuForUser(row.id)}
        style={{
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: "500",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0d6efd";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#0d6efd";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <i className="fas fa-plus"></i>
        <span>Ajouter</span>
      </button>
    ),
    grow: 1,
    center: true,
  },
];

const MenuForUserCulumn = [
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-bars" style={{ fontSize: "14px" }}></i>
        <span>Nom du menu</span>
      </div>
    ),
    selector: (row) => row.menu_name,
    grow: 3,
    cell: (row) => (
      <span className="d-flex align-items-center gap-2">
        <i className="fas fa-angle-right text-muted" style={{ fontSize: "11px" }}></i>
        {row.menu_name}
      </span>
    )
  },
  {
    name: (
      <div className="d-flex align-items-center gap-2">
        <i className="fas fa-trash-alt" style={{ fontSize: "14px" }}></i>
        <span>Action</span>
      </div>
    ),
    cell: (row) => (
      <button
        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
        onClick={() => removeMenuForUser(row.id)}
        style={{
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: "500",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#dc3545";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#dc3545";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <i className="fas fa-trash-alt"></i>
        <span>Retirer</span>
      </button>
    ),
    grow: 1,
    center: true,
  },
];

const customStyles = {
  table: {
    style: {
      borderRadius: "12px",
      overflow: "hidden",
    },
  },
  header: {
    style: {
      backgroundColor: "#f8f9fa",
      padding: "16px 20px",
      borderBottom: "2px solid #e9ecef",
    },
  },
  headRow: {
    style: {
      backgroundColor: "teal",
      borderBottom: "none",
      borderRadius: "12px 12px 0 0",
    },
  },
  headCells: {
    style: {
      padding: "14px 16px",
      fontSize: "13px",
      fontWeight: "700",
      color: "white",
      letterSpacing: "0.3px",
      textTransform: "uppercase",
      backgroundColor: "teal",
      "&:first-of-type": {
        borderTopLeftRadius: "12px",
      },
      "&:last-of-type": {
        borderTopRightRadius: "12px",
      },
    },
  },
  rows: {
    style: {
      minHeight: "64px",
      borderBottom: "1px solid #e9ecef",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8f9fa",
      borderBottomColor: "#dee2e6",
      transition: "all 0.2s ease",
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      fontSize: "13px",
      color: "#495057",
    },
  },
  pagination: {
    style: {
      backgroundColor: "#f8f9fa",
      borderTop: "1px solid #e9ecef",
      padding: "12px 16px",
      borderRadius: "0 0 12px 12px",
    },
    pageButtonsStyle: {
      borderRadius: "6px",
      margin: "0 4px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#20c997",
        color: "white",
      },
    },
  },
  noData: {
    style: {
      padding: "40px",
      textAlign: "center",
      color: "#6c757d",
      fontSize: "14px",
    },
  },
};

    useEffect(() => {
        getUsers();
    }, []);
    //GET USER ON PAGE LOAD
    const getUsers = async () => {
        const res = await axios.get("/eco/pages/getusers");
        if (res.data.status == 1) {
            setFetchUsers(res.data);
            setFetchProfil(res.data);
            setFetchMenu(res.data);
            //GET RECORDS
            setProfilrecords(res.data.profildata);
            setMenuRecords(res.data.menudata);
            setRecords(res.data.data);
        }
    };
    //GET SELECTED USER IN DATA TABLE
    const handleChange = (state) => {
        setSelectedData(state.selectedRows);

        console.log(selectedData);
    };
    //GET SELECTED PROFIL ITEM
    const handleChangeProfil = (state) => {
        setSelectedProfilData(state.selectedRows);
        console.log(selectedProfilData);
    };
    //FILTER USER IN USER DATA TABLE
    const handleFilter = (event) => {
        const newData = fetchUsers.data.filter((row) => {
            return row.name
                .toLowerCase()
                .includes(event.target.value.toLowerCase());
        });
        console.log(newData);
        setRecords(newData);
    };

    //FILTER USER IN DATA TABLE
    const handleFilterProfil = (event) => {
        const newData = fetchProfil.profildata.filter((row) => {
            return row.nom_profile
                .toLowerCase()
                .includes(event.target.value.toLowerCase());
        });
        console.log(newData);
        setProfilrecords(newData);
    };

    //GET EDIT FORM
    function showEditForm() {
        setGetEditForm(true);
        setName(selectedData[0].name);
        setEmail(selectedData[0].email);
        setUserId(selectedData[0].id);
        // console.log(user.name);
    }
    //GET RESET FORM
    function showResetPWForm() {
        setGetResetPassWordForm(true);
        setUserId(selectedData[0].id);
        setName(selectedData[0].name);
    }
    //UPDATE USER
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsloading(true);
        const res = await axios.post("/eco/pages/updateuser", {
            name,
            email,
            userId,
        });
        if (res.data.status == 1) {
            setIsloading(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                // showCancelButton: true,
                // cancelButtonColor: "#d33",
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                // showCancelButton: true,
                // cancelButtonColor: "#d33",
                confirmButtonText: "Okay",
            });
        }
    };
    //INIT USER PASSWORD
    const handleInitPassword = async (e) => {
        e.preventDefault();
        setIsloading2(true);
        const res = await axios.post("/eco/pages/user/init", {
            userId,
        });
        if (res.data.status == 1) {
            setIsloading2(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };
    //SHOW LOCK USER FORM
    //GET RESET FORM
    function showLockPWForm() {
        setGetLockUserForm(true);
        setUserId(selectedData[0].id);
        setName(selectedData[0].name);
    }

    //INIT USER PASSWORD
    const handleLockUser = async (e) => {
        e.preventDefault();
        setIsloading(true);
        const res = await axios.post("/eco/pages/user/lock", {
            userId,
        });
        if (res.data.status == 1) {
            setIsloading(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    //ADD NEW PROFIL
    const handleAddProfil = async (e) => {
        e.preventDefault();

        const res = await axios.post("/eco/pages/profil/addnew", {
            profilName,
        });
        if (res.data.status == 1) {
            setIsloading(false);
            setProfileName("");
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading(false);
            Swal.fire({
                title: "Error",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    //FILTER A SEACHED MENU
    const handleFilterMenu = (event) => {
        const newData = fetchMenu.menudata.filter((row) => {
            return row.menu_name
                .toLowerCase()
                .includes(event.target.value.toLowerCase());
        });
        console.log(newData);
        setMenuRecords(newData);
    };

    //GET A SEACHED MENU ITEM

    const handleChangeMenu = (state) => {
        setSelectedMenuData(state.selectedRows);
        console.log(selectedMenuData);
    };

    //GET PROFIL FOR SELECTED USER
    const getProfilForSelectedUser = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/pages/getusers/profil", {
            userId: selectedData[0].id,
        });
        if (res.data.status == 1) {
            setFetchProfilForSelectedUser(res.data.get_profil_user);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    //GET MENU FOR SELECTED USER

    const getMenuForSelectedUser = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/pages/getusers/menu", {
            userId: selectedData[0].id,
        });
        if (res.data.status == 1) {
            setFetchMenuForSelectedUser(res.data.get_menu_user);
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    //ADD A PROFIL FOR A SPECIFIC USER

    const addUserProfil = async (id) => {
        const res = await axios.post("/eco/pages/add/profil", {
            profilId: id,
            userId: selectedData[0].id,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    //REMOVE A SPECIFIC PROFIL
    const removeProfil = async (id) => {
        // setIsloading(true);
        const res = await axios.post("/eco/pages/remove/profil", {
            idProfil: id,
        });
        if (res.data.status == 1) {
            // setIsloading(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading(false);
        }
    };

    const removeMenuForUser = async (id) => {
        // setIsloading(true);
        const res = await axios.post("/eco/pages/remove/menu", {
            idMenu: id,
        });
        if (res.data.status == 1) {
            // setIsloading(false);
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            setIsloading(false);
        }
    };

    //ADD A MENU FOR A SPECIFIQUE USER
    const addMenuForUser = async (id) => {
        const res = await axios.post("/eco/pages/add/menu", {
            menuId: id,
            userId: selectedData[0].id,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        } else {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 3000,
                confirmButtonText: "Okay",
            });
        }
    };

    //PERMET DE CREER UN COMPTE CAISSE
    const CreateCaissierAccount = async (e) => {
        e.preventDefault();
        const res = await axios.post("/eco/page/users/create-caisse-account", {
            userId,
        });
        if (res.data.status == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                timer: 4000,
                confirmButtonText: "Okay",
            });
        } else if (res.data.status == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                timer: 4000,
                confirmButtonText: "Okay",
            });
        }
    };

    return (
      <div style={{ marginTop: "5px" }}>
  <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
    {/* Tabs modernisées */}
    <div className="card-header p-0" style={{ backgroundColor: "white", borderBottom: "none" }}>
      <ul
    className="nav nav-tabs border-0 user-tabs"
    id="custom-tabs-one-tab"
    role="tablist"
>
    <li className="nav-item">
        <a
            className="nav-link active"
            id="custom-tabs-one-users-tab"
            data-toggle="pill"
            href="#custom-tabs-one-users"
            role="tab"
            aria-controls="custom-tabs-one-users"
            aria-selected="true"
        >
            <i className="fas fa-users"></i>
            Utilisateurs
        </a>
    </li>
    <li className="nav-item">
        <a
            className="nav-link"
            id="custom-tabs-one-profil-tab"
            data-toggle="pill"
            href="#custom-tabs-one-profil"
            role="tab"
            aria-controls="custom-tabs-one-profil"
            aria-selected="false"
        >
            <i className="fas fa-id-card"></i>
            Profils
        </a>
    </li>
    <li className="nav-item">
        <a
            className="nav-link"
            id="custom-tabs-one-menu-tab"
            data-toggle="pill"
            href="#custom-tabs-one-menu"
            role="tab"
            aria-controls="custom-tabs-one-menu"
            aria-selected="false"
        >
            <i className="fas fa-bars"></i>
            Menus
        </a>
    </li>
</ul>
    </div>

    <div className="card-body p-4">
      <div className="tab-content" id="custom-tabs-one-tabContent">
        {/* Tab Utilisateurs */}
        <div
          className="tab-pane fade show active"
          id="custom-tabs-one-users"
          role="tabpanel"
          aria-labelledby="custom-tabs-one-users-tab"
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: "teal" }}>
                <i className="fas fa-users me-2"></i>
                Gestion des utilisateurs
              </h4>
              <small className="text-muted">Gérez les comptes utilisateurs et leurs permissions</small>
            </div>
          </div>

          <div className="row g-4">
            {/* Tableau des utilisateurs */}
            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                  <div className="p-3 border-bottom bg-light rounded-top">
                    <div className="d-flex justify-content-end">
                      <div className="position-relative">
                        <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: "12px" }}></i>
                        <input
                          type="text"
                          onChange={handleFilter}
                          className="form-control form-control-sm ps-5"
                          style={{
                            width: "250px",
                            borderRadius: "20px",
                            border: "1px solid #e9ecef",
                            backgroundColor: "white"
                          }}
                          placeholder="Rechercher un utilisateur..."
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "500px" }}>
                    {records ? (
                      <DataTable
                        data={records}
                        columns={columns}
                        selectableRows
                        pagination={5}
                        onSelectedRowsChange={handleChange}
                        customStyles={{
                          ...customStyles,
                          headCells: {
                            style: {
                              fontWeight: "bold",
                              backgroundColor: "#f8f9fa",
                              color: "#495057"
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <div className="spinner-border text-teal" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-2 text-muted">Chargement des utilisateurs...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau d'édition */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-3 sticky-top" style={{ top: "20px" }}>
                <div className="card-header bg-white border-0 pt-3">
                  <h6 className="fw-semibold mb-0">
                    <i className="fas fa-cog text-teal me-2"></i>
                    Actions utilisateur
                  </h6>
                </div>
                <div className="card-body">
                  {getEditForm && selectedData ? (
                    <form className="mb-4">
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Nom utilisateur</label>
                        <input
                          id="userName"
                          className="form-control form-control-sm"
                          style={{ backgroundColor: "#f8f9fa" }}
                          type="text"
                          name="name"
                          required
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                        />
                        <input
                          id="userId"
                          name="userId"
                          type="hidden"
                          onChange={(e) => setUserId(e.target.value)}
                          value={userId}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Email</label>
                        <input
                          id="Email"
                          className="form-control form-control-sm"
                          style={{ backgroundColor: "#f8f9fa" }}
                          type="email"
                          name="email"
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                        />
                      </div>
                      <div className="d-grid gap-2">
                        <button
                          onClick={handleUpdate}
                          className="btn btn-teal"
                          style={{ backgroundColor: "teal", color: "white", borderRadius: "8px" }}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Mettre à jour
                            </>
                          )}
                        </button>
                        <button
                          onClick={CreateCaissierAccount}
                          className="btn btn-outline-success"
                          style={{ borderRadius: "8px" }}
                        >
                          <i className="fas fa-plus-circle me-2"></i>
                          Créer un compte caisse
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {getResetPassWordForm ? (
                    <div className="alert alert-info p-3 rounded-3 mb-4">
                      <i className="fas fa-info-circle me-2"></i>
                      <p className="mb-0">
                        Vous êtes sur le point de réinitialiser le mot de passe de{" "}
                        <strong>{name}</strong>
                      </p>
                      <button
                        onClick={handleInitPassword}
                        className="btn btn-danger w-100 mt-3"
                        style={{ borderRadius: "8px" }}
                        disabled={loading2}
                      >
                        {loading2 ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <i className="fas fa-key me-2"></i>
                            Réinitialiser le mot de passe
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}

                  {getLockUserForm ? (
                    <div className="alert alert-warning p-3 rounded-3 mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <p className="mb-0">
                        Vous êtes sur le point de {selectedData[0]?.locked_state == 1 ? "débloquer" : "bloquer"} l'utilisateur{" "}
                        <strong>{name}</strong>
                      </p>
                      <button
                        onClick={handleLockUser}
                        className={`btn w-100 mt-3 ${selectedData[0]?.locked_state == 1 ? "btn-success" : "btn-danger"}`}
                        style={{ borderRadius: "8px" }}
                      >
                        {selectedData[0]?.locked_state == 1 ? (
                          <>
                            <i className="fas fa-unlock-alt me-2"></i>
                            Débloquer l'utilisateur
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock me-2"></i>
                            Bloquer l'utilisateur
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="card-footer bg-white border-0 pb-3">
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={showEditForm}
                      style={{ borderRadius: "8px 0 0 8px" }}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Éditer
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={showResetPWForm}
                    >
                      <i className="fas fa-key me-1"></i>
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={showLockPWForm}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    >
                      <i className="fas fa-lock me-1"></i>
                      Bloquer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Profils */}
        <div
          className="tab-pane fade"
          id="custom-tabs-one-profil"
          role="tabpanel"
          aria-labelledby="custom-tabs-one-profil-tab"
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: "teal" }}>
                <i className="fas fa-id-card me-2"></i>
                Gestion des profils
              </h4>
              <small className="text-muted">Créez et gérez les profils utilisateurs</small>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                  <div className="p-3 border-bottom bg-light rounded-top">
                    <div className="d-flex justify-content-end">
                      <div className="position-relative">
                        <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input
                          type="text"
                          onChange={handleFilterProfil}
                          className="form-control form-control-sm ps-5"
                          style={{ width: "250px", borderRadius: "20px" }}
                          placeholder="Rechercher un profil..."
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "500px" }}>
                    {Profilrecords ? (
                      <DataTable
                        data={Profilrecords}
                        columns={columnsProfil}
                        pagination={5}
                        onSelectedRowsChange={handleChangeProfil}
                        customStyles={customStyles}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <div className="spinner-border text-teal"></div>
                        <p className="mt-2 text-muted">Chargement des profils...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-white border-0 pt-3">
                  <h6 className="fw-semibold mb-0">
                    <i className="fas fa-plus-circle text-teal me-2"></i>
                    Ajouter un profil
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Nom du profil</label>
                    <input
                      id="profilName"
                      className="form-control form-control-sm"
                      type="text"
                      name="profilName"
                      required
                      onChange={(e) => setProfileName(e.target.value)}
                      value={profilName}
                    />
                  </div>
                  <button
                    onClick={handleAddProfil}
                    className="btn btn-teal w-100"
                    style={{ backgroundColor: "teal", color: "white", borderRadius: "8px" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Valider
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-0 pt-3">
                  <h6 className="fw-semibold mb-0">
                    <i className="fas fa-spinner me-2 text-teal"></i>
                    Profils par utilisateur
                  </h6>
                </div>
                <div className="card-body">
                  <button
                    className="btn btn-outline-teal w-100 mb-3"
                    onClick={getProfilForSelectedUser}
                    style={{ borderRadius: "8px", borderColor: "teal", color: "#000" }}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Charger les profils
                  </button>
                  {fetchProfilForSelectedUser && fetchProfilForSelectedUser.length > 0 ? (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <DataTable
                        data={fetchProfilForSelectedUser}
                        columns={ProfilForUserCulumn}
                        pagination={5}
                        customStyles={customStyles}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-muted small mt-3">Aucun profil sélectionné</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Menus */}
        <div
          className="tab-pane fade"
          id="custom-tabs-one-menu"
          role="tabpanel"
          aria-labelledby="custom-tabs-one-menu-tab"
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: "teal" }}>
                <i className="fas fa-bars me-2"></i>
                Gestion des menus
              </h4>
              <small className="text-muted">Attribuez les permissions d'accès aux menus</small>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                  <div className="p-3 border-bottom bg-light rounded-top">
                    <div className="d-flex justify-content-end">
                      <div className="position-relative">
                        <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input
                          type="text"
                          onChange={handleFilterMenu}
                          className="form-control form-control-sm ps-5"
                          style={{ width: "250px", borderRadius: "20px" }}
                          placeholder="Rechercher un menu..."
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "500px" }}>
                    {menuRecords ? (
                      <DataTable
                        data={menuRecords}
                        columns={columnsMenu}
                        pagination={5}
                        onSelectedRowsChange={handleChangeMenu}
                        customStyles={customStyles}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <div className="spinner-border text-teal"></div>
                        <p className="mt-2 text-muted">Chargement des menus...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-0 pt-3">
                  <h6 className="fw-semibold mb-0">
                    <i className="fas fa-spinner me-2 text-teal"></i>
                    Menus par utilisateur
                  </h6>
                </div>
                <div className="card-body">
                  <button
                    className="btn btn-outline-teal w-100 mb-3"
                    onClick={getMenuForSelectedUser}
                    style={{ borderRadius: "8px", borderColor: "teal", color: "#000" }}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Charger les menus
                  </button>
                  {fetchMenuForSelectedUser && fetchMenuForSelectedUser.length > 0 ? (
                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                      <DataTable
                        data={fetchMenuForSelectedUser}
                        columns={MenuForUserCulumn}
                        pagination={5}
                        customStyles={customStyles}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-muted small mt-3">Aucun menu sélectionné</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    );
};

export default Users;
