import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import UpdateSMSBankingUser from "./Modals/UpdateSMSBankingUser";

export default class SMSbanking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isloading: true,
            loading: false,
            loading2: false,
            loading3: false,
            NumCompte: "",
            NomCompte: "",
            Civilite: "",
            Email: "",
            Telephone: "",
            searchData: false,
            disabled: false,
            searchedItem: "",
            SendSMS: false,
            fetchData: [],
            fetchSeachedData: "",
            fetchUpdateData: null,
            // Pagination states
            currentPage: 1,
            itemsPerPage: 10,
            totalPages: 1,
        };
        this.actualiser = this.actualiser.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.saveBtn = this.saveBtn.bind(this);
        this.handleSeach = this.handleSeach.bind(this);
        this.UpdateUser = this.UpdateUser.bind();
        this.DeleteUser = this.DeleteUser.bind(this);
        this.getData = this.getData.bind(this);
        this.ActivateUserOnMSG = this.ActivateUserOnMSG.bind(this);
        this.ActivateUserOnEmail = this.ActivateUserOnEmail.bind(this);
        this.getIndividualsUserSmsBankingDetails =
            this.getIndividualsUserSmsBankingDetails.bind(this);
        // Pagination methods
        this.goToPrevPage = this.goToPrevPage.bind(this);
        this.goToNextPage = this.goToNextPage.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ isloading: false });
        }, 1000);
        this.getData();
    }

    //to refresh
    actualiser() {
        location.reload();
    }

    //GET DATA FROM INPUT
    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    // Pagination methods
    goToPrevPage() {
        this.setState((prevState) => ({
            currentPage: Math.max(prevState.currentPage - 1, 1)
        }));
    }

    goToNextPage() {
        this.setState((prevState) => ({
            currentPage: Math.min(prevState.currentPage + 1, prevState.totalPages)
        }));
    }

    handlePageChange(pageNumber) {
        this.setState({ currentPage: pageNumber });
    }

    renderPagination() {
        const { currentPage, totalPages } = this.state;
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            startPage = 1;
            endPage = totalPages;
        } else if (currentPage <= Math.floor(maxPagesToShow / 2)) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - Math.floor(maxPagesToShow / 2);
            endPage = currentPage + Math.floor(maxPagesToShow / 2);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <li key={1} className="page-item">
                    <button onClick={() => this.handlePageChange(1)} className="page-link">
                        1
                    </button>
                </li>
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <li key="start-ellipsis" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={`page-item ${i === currentPage ? "active" : ""}`}>
                    <button
                        onClick={() => this.handlePageChange(i)}
                        className="page-link"
                        style={i === currentPage ? { backgroundColor: "#20c997", borderColor: "#20c997", color: "white" } : {}}
                    >
                        {i}
                    </button>
                </li>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <li key="end-ellipsis" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
            pageNumbers.push(
                <li key={totalPages} className="page-item">
                    <button onClick={() => this.handlePageChange(totalPages)} className="page-link">
                        {totalPages}
                    </button>
                </li>
            );
        }

        return pageNumbers;
    }

    saveBtn = async (e) => {
        e.preventDefault();
        this.setState({ loading2: true });
        const res = await axios.post(
            "sms-banking/add-new-costomer/question",
            this.state
        );
        if (res.data.success == 1) {
            const question = confirm(
                "Vous êtes sur le point d'ajouter sur SMS banking " +
                    res.data.NomMembre +
                    " Voulez-vous continuer ?"
            );
            if (question == true) {
                const res2 = await axios.post(
                    "sms-banking/add-new-costomer",
                    this.state
                );
                Swal.fire({
                    title: "Succès",
                    text: res2.data.msg,
                    icon: "success",
                    button: "OK!",
                });
                this.getData(); // Refresh data after adding
            }
            this.setState({
                loading2: false,
                NumCompte: "",
                NomCompte: "",
                Civilite: "",
                Email: "",
                Telephone: "+243",
            });
        } else if (res.data.success == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
            this.setState({ loading2: false });
        }
    };

    handleSeach = async (item) => {
        this.setState({ loading3: true });
        if (!this.state.searchedItem) {
            Swal.fire({
                title: "Erreur",
                text: "Veuillez renseigné un numéro de compte",
                icon: "error",
                button: "OK!",
            });
            this.setState({ loading3: false });
            return;
        }

        const res = await axios.get("sms-banking/search/user/" + item);
        if (res.data.success == 1) {
            this.setState({
                fetchSeachedData: res.data.data,
                searchData: true,
                currentPage: 1,
            });
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
            this.setState({ loading3: false });
        } else if (res.data.success == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
            this.setState({ loading3: false, searchData: false });
        }
    };

    UpdateUser = async () => {};

    DeleteUser = async (item) => {
        const question = confirm(
            "Voulez-vous vraiment supprimé cet utilsateur sur le service SMS Banking ?"
        );
        if (question == true) {
            const res = await axios.delete("sms-banking/delete/item/" + item);
            if (res.data.success == 1) {
                Swal.fire({
                    title: "Succès",
                    text: res.data.msg,
                    icon: "success",
                    button: "OK!",
                });
                this.getData(); // Refresh data after deletion
            }
        }
    };

    ActivateUserOnMSG = async (item) => {
        const res = await axios.get("sms-banking/activate-user/msg/" + item);
        if (res.data.success == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
            this.getData(); // Refresh data after activation
        } else if (res.data.success == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    ActivateUserOnEmail = async (item) => {
        const res = await axios.get("sms-banking/activate-user/email/" + item);
        if (res.data.success == 1) {
            Swal.fire({
                title: "Succès",
                text: res.data.msg,
                icon: "success",
                button: "OK!",
            });
            this.getData(); // Refresh data after activation
        } else if (res.data.success == 0) {
            Swal.fire({
                title: "Erreur",
                text: res.data.msg,
                icon: "error",
                button: "OK!",
            });
        }
    };

    getData = async () => {
        try {
            const res = await axios.get("sms-banking/getlastest");
            if (res.data.success == 1) {
                const data = res.data.data;
                const totalPages = Math.ceil(data.length / this.state.itemsPerPage);
                this.setState({ 
                    fetchData: data,
                    totalPages: totalPages,
                    currentPage: 1
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    getIndividualsUserSmsBankingDetails = (id) => {
        axios
            .post("sms-banking/update/user-details", {
                userId: id,
            })
            .then((response) => {
                this.setState({
                    fetchUpdateData: response.data.data,
                });
            });
    };

    // Get current page data
    getCurrentPageData() {
        const { fetchData, currentPage, itemsPerPage, searchData, fetchSeachedData } = this.state;
        
        if (searchData && fetchSeachedData) {
            return [fetchSeachedData];
        }
        
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return fetchData.slice(indexOfFirstItem, indexOfLastItem);
    }

    render() {
        let myspinner = {
            margin: "5px auto",
            width: "3rem",
            marginTop: "180px",
            border: "0px",
            height: "200px",
        };
        
        const currentData = this.getCurrentPageData();
        const { currentPage, totalPages, itemsPerPage, searchData } = this.state;
        const startItem = searchData ? 1 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = searchData ? 1 : Math.min(currentPage * itemsPerPage, this.state.fetchData.length);

        return (
            <React.Fragment>
                {this.state.isloading ? (
                    <div className="row" id="rowspinner">
                        <div className="myspinner" style={myspinner}>
                            <span className="spinner-border" role="status"></span>
                            <span style={{ marginLeft: "-20px" }}>Chargement...</span>
                        </div>
                    </div>
                ) : (
                    <div className="container-fluid" style={{ marginTop: "10px", padding: "0 15px" }}>
                        {/* En-tête moderne */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-3">
                                    <div className="card-body p-3" style={{
                                        background: "#138496",
                                        borderRadius: "12px"
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <i className="fas fa-sms" style={{ fontSize: "28px", color: "white" }}></i>
                                                </div>
                                                <div>
                                                    <h5 className="text-white fw-bold mb-0">SMS Banking</h5>
                                                    <small className="text-white-50">Gestion des notifications par SMS et Email</small>
                                                </div>
                                            </div>
                                            <button onClick={this.actualiser} 
                                                className="btn" 
                                                style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", border: "none" }}>
                                                <i className="fas fa-sync-alt me-2"></i>Actualiser
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-lg-12">
                                <div className="card border-0 shadow-sm rounded-3">
                                    <div className="card-body p-4">
                                        {/* Formulaire d'ajout/modification */}
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-8">
                                                <div className="card border-0" style={{ background: "#e6f2f9", borderRadius: "12px" }}>
                                                    <div className="card-body">
                                                        <h6 className="fw-bold mb-3" style={{ color: "steelblue" }}>
                                                            <i className="fas fa-edit me-2"></i>Informations du client
                                                        </h6>
                                                        <form>
                                                            <table style={{ width: "100%" }}>
                                                                <tbody>
                                                                    <tr>
                                                                        <td style={{ padding: "6px", width: "35%" }}>
                                                                            <label style={{ color: "steelblue", fontWeight: "500" }}>Numéro Compte Abrégé</label>
                                                                         </td>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <input name="NumCompte" type="text" className="form-control" style={{ borderRadius: "8px" }}
                                                                                value={this.state.NumCompte} disabled={this.state.disabled ? "disabled" : ""}
                                                                                onChange={this.handleChange} />
                                                                         </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <label style={{ color: "steelblue", fontWeight: "500" }}>Civilité</label>
                                                                         </td>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <select name="Civilite" className="form-control" style={{ borderRadius: "8px" }}
                                                                                value={this.state.Civilite} disabled={this.state.disabled ? "disabled" : ""}
                                                                                onChange={this.handleChange}>
                                                                                <option value="">Sélectionnez</option>
                                                                                <option value="Monsieur">Monsieur</option>
                                                                                <option value="Madame">Madame</option>
                                                                                <option value="Mademoiselle">Mademoiselle</option>
                                                                            </select>
                                                                         </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <label style={{ color: "steelblue", fontWeight: "500" }}>Email</label>
                                                                         </td>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <input name="Email" type="email" className="form-control" style={{ borderRadius: "8px" }}
                                                                                value={this.state.Email} disabled={this.state.disabled ? "disabled" : ""}
                                                                                onChange={this.handleChange} />
                                                                         </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <label style={{ color: "steelblue", fontWeight: "500" }}>Téléphone</label>
                                                                         </td>
                                                                        <td style={{ padding: "6px" }}>
                                                                            <input name="Telephone" type="text" className="form-control" style={{ borderRadius: "8px" }}
                                                                                value={this.state.Telephone} disabled={this.state.disabled ? "disabled" : ""}
                                                                                onChange={this.handleChange} />
                                                                         </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colSpan="2" style={{ padding: "12px 6px 6px" }}>
                                                                            <button onClick={this.saveBtn} className="btn w-100 py-2" 
                                                                                style={{ background: "linear-gradient(135deg, #20c997, #198764)", color: "white", borderRadius: "8px" }}>
                                                                                <i className={`${this.state.loading2 ? "spinner-border spinner-border-sm me-2" : "fas fa-check me-2"}`}></i>
                                                                                Valider
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

                                        
                                            {/* Barre de recherche */}
                                            <div className="col-md-4">
                                                <div className="card border-0" style={{ background: "#e6f2f9", borderRadius: "12px" }}>
                                                    <div className="card-body">
                                                        <h6 className="fw-bold mb-3" style={{ color: "steelblue" }}>
                                                            <i className="fas fa-search me-2"></i>Rechercher un client
                                                        </h6>
                                                        <div className="input-group">
                                                            <input type="text" className="form-control" style={{ borderRadius: "8px 0 0 8px" }}
                                                                ref={this.textInput} placeholder="Numéro abrégé..."
                                                                name="searchedItem" value={this.state.searchedItem} onChange={this.handleChange} />
                                                            <button className="btn" style={{ background: "#20c997", color: "white", borderRadius: "0 8px 8px 0" }}
                                                                onClick={() => this.handleSeach(this.state.searchedItem)}>
                                                                <i className={`${this.state.loading3 ? "spinner-border spinner-border-sm" : "fas fa-search"}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        {/* Liste des clients */}
                                        <div className="card border-0 shadow-sm rounded-3">
                                            <div className="card-header bg-white border-0 pt-3">
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                    <h6 className="fw-bold" style={{ color: "steelblue" }}>
                                                        <i className="fas fa-users me-2"></i>Liste des clients SMS Banking
                                                    </h6>
                                                    {!this.state.searchData && this.state.fetchData.length > 0 && (
                                                        <div className="text-muted small">
                                                            Affichage {startItem} à {endItem} sur {this.state.fetchData.length} clients
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-body p-0">
                                                <div className="table-responsive">
                                                    {this.state.searchData == false ? (
                                                        this.state.fetchData.length != 0 && (
                                                            <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                                                                <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                                    <tr style={{ color: "steelblue" }}>
                                                                        <th>Compte</th>
                                                                        <th>Intitulé</th>
                                                                        <th>Email</th>
                                                                        <th>Téléphone</th>
                                                                        <th>Compte Abrégé</th>
                                                                        <th colSpan="2">Actions</th>
                                                                        <th>Notifications</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {currentData.map((res, index) => (
                                                                        <tr key={index}>
                                                                            <td className="fw-semibold">{res.NumCompte}</td>
                                                                            <td>{res.NomCompte}</td>
                                                                            <td>{res.Email || "-"}</td>
                                                                            <td>{res.Telephone || "-"}</td>
                                                                            <td>{res.NumAbrege}</td>
                                                                            <td>
                                                                                <div className="btn-group" role="group">
                                                                                    <button onClick={() => this.getIndividualsUserSmsBankingDetails(res.id)} 
                                                                                        className="btn btn-sm" data-toggle="modal" data-target="#modal-sms-banking"
                                                                                        style={{ background: "#007BFF", color: "white", borderRadius: "6px 0 0 6px" }}>
                                                                                        <i className="fas fa-edit"></i>
                                                                                    </button>
                                                                                    <button onClick={() => this.DeleteUser(res.id)} 
                                                                                        className="btn btn-sm" style={{ background: "#dc3545", color: "white", borderRadius: "0 6px 6px 0" }}>
                                                                                        <i className="fas fa-trash-alt"></i>
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <div className="btn-group" role="group">
                                                                                    {res.ActivatedSMS == 1 ? (
                                                                                        <button onClick={() => this.ActivateUserOnMSG(res.id)} 
                                                                                            className="btn btn-sm" style={{ background: "#dc3545", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                            <i className="fas fa-sms me-1"></i>Désactiver SMS
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button onClick={() => this.ActivateUserOnMSG(res.id)} 
                                                                                            className="btn btn-sm" style={{ background: "#28a745", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                            <i className="fas fa-sms me-1"></i>Activer SMS
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                <div className="btn-group" role="group">
                                                                                    {res.ActivatedEmail == 1 ? (
                                                                                        <button onClick={() => this.ActivateUserOnEmail(res.id)} 
                                                                                            className="btn btn-sm" style={{ background: "#dc3545", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                            <i className="fas fa-envelope me-1"></i>Désactiver Email
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button onClick={() => this.ActivateUserOnEmail(res.id)} 
                                                                                            className="btn btn-sm" style={{ background: "#28a745", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                            <i className="fas fa-envelope me-1"></i>Activer Email
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td>
                                                                                {/* <div className="d-flex gap-2">
                                                                                    <div className="form-check form-switch">
                                                                                        <input className="form-check-input" type="checkbox" id={`SMS-${res.id}`}
                                                                                            disabled checked={res.Telephone != null && res.ActivatedSMS != 0} />
                                                                                        <label className="form-check-label" htmlFor={`SMS-${res.id}`} style={{ fontSize: "12px" }}>SMS</label>
                                                                                    </div>
                                                                                    <div className="form-check form-switch">
                                                                                        <input className="form-check-input" type="checkbox" id={`Email-${res.id}`}
                                                                                            disabled checked={res.Email != null && res.ActivatedEmail != 0} />
                                                                                        <label className="form-check-label" htmlFor={`Email-${res.id}`} style={{ fontSize: "12px" }}>Email</label>
                                                                                    </div>
                                                                                </div> */}
                                                                                <UpdateSMSBankingUser modalId={res.id} data={this.state.fetchUpdateData} nameMembre={res.NomCompte} />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )
                                                    ) : (
                                                        this.state.fetchSeachedData && (
                                                            <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                                                                <thead style={{ backgroundColor: "#e6f2f9" }}>
                                                                    <tr style={{ color: "steelblue" }}>
                                                                        <th>Compte</th>
                                                                        <th>Intitulé</th>
                                                                        <th>Email</th>
                                                                        <th>Téléphone</th>
                                                                        <th>Compte Abrégé</th>
                                                                        <th colSpan="2">Actions</th>
                                                                        <th>Notifications</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td className="fw-semibold">{this.state.fetchSeachedData.NumCompte}</td>
                                                                        <td>{this.state.fetchSeachedData.NomCompte}</td>
                                                                        <td>{this.state.fetchSeachedData.Email || "-"}</td>
                                                                        <td>{this.state.fetchSeachedData.Telephone || "-"}</td>
                                                                        <td>{this.state.fetchSeachedData.NumAbrege}</td>
                                                                        <td>
                                                                            <div className="btn-group" role="group">
                                                                                <button onClick={() => this.getIndividualsUserSmsBankingDetails(this.state.fetchSeachedData.id)} 
                                                                                    className="btn btn-sm" data-toggle="modal" data-target="#modal-sms-banking"
                                                                                    style={{ background: "#007BFF", color: "white", borderRadius: "6px 0 0 6px" }}>
                                                                                    <i className="fas fa-edit"></i>
                                                                                </button>
                                                                                <button onClick={() => this.DeleteUser(this.state.fetchSeachedData.id)} 
                                                                                    className="btn btn-sm" style={{ background: "#dc3545", color: "white", borderRadius: "0 6px 6px 0" }}>
                                                                                    <i className="fas fa-trash-alt"></i>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="btn-group" role="group">
                                                                                {this.state.fetchSeachedData.ActivatedSMS == 1 ? (
                                                                                    <button onClick={() => this.ActivateUserOnMSG(this.state.fetchSeachedData.id)} 
                                                                                        className="btn btn-sm" style={{ background: "#dc3545", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                        <i className="fas fa-sms me-1"></i>Désactiver SMS
                                                                                    </button>
                                                                                ) : (
                                                                                    <button onClick={() => this.ActivateUserOnMSG(this.state.fetchSeachedData.id)} 
                                                                                        className="btn btn-sm" style={{ background: "#28a745", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                        <i className="fas fa-sms me-1"></i>Activer SMS
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="btn-group" role="group">
                                                                                {this.state.fetchSeachedData.ActivatedEmail == 1 ? (
                                                                                    <button onClick={() => this.ActivateUserOnEmail(this.state.fetchSeachedData.id)} 
                                                                                        className="btn btn-sm" style={{ background: "#dc3545", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                        <i className="fas fa-envelope me-1"></i>Désactiver Email
                                                                                    </button>
                                                                                ) : (
                                                                                    <button onClick={() => this.ActivateUserOnEmail(this.state.fetchSeachedData.id)} 
                                                                                        className="btn btn-sm" style={{ background: "#28a745", color: "white", borderRadius: "6px",fontSize:"10px" }}>
                                                                                        <i className="fas fa-envelope me-1"></i>Activer Email
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            {/* <div className="d-flex gap-2">
                                                                                <div className="form-check form-switch">
                                                                                    <input className="form-check-input" type="checkbox" id="SMS-search"
                                                                                        disabled checked={this.state.fetchSeachedData.Telephone && this.state.fetchSeachedData.ActivatedSMS == 1} />
                                                                                    <label className="form-check-label" htmlFor="SMS-search" style={{ fontSize: "12px" }}>SMS</label>
                                                                                </div>
                                                                                <div className="form-check form-switch">
                                                                                    <input className="form-check-input" type="checkbox" id="Email-search"
                                                                                        disabled checked={this.state.fetchSeachedData.Email && this.state.fetchSeachedData.ActivatedEmail == 1} />
                                                                                    <label className="form-check-label" htmlFor="Email-search" style={{ fontSize: "12px" }}>Email</label>
                                                                                </div>
                                                                            </div> */}
                                                                            <UpdateSMSBankingUser modalId={this.state.state} data={this.state.fetchUpdateData} nameMembre={this.state.fetchSeachedData.NomCompte} />
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        {!this.state.searchData && this.state.fetchData.length > 0 && (
                                            <div className="d-flex justify-content-between align-items-center mt-4 pt-2">
                                                <div className="text-muted small">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    {this.state.fetchData.length} client(s) au total
                                                </div>
                                                <nav aria-label="Pagination des clients">
                                                    <ul className="pagination pagination-sm mb-0">
                                                        <li className={`page-item ${this.state.currentPage === 1 ? "disabled" : ""}`}>
                                                            <button 
                                                                className="page-link" 
                                                                onClick={this.goToPrevPage}
                                                                disabled={this.state.currentPage === 1}
                                                                style={{ borderRadius: "8px 0 0 8px" }}
                                                            >
                                                                <i className="fas fa-chevron-left me-1"></i>Précédent
                                                            </button>
                                                        </li>
                                                        {this.renderPagination()}
                                                        <li className={`page-item ${this.state.currentPage === this.state.totalPages ? "disabled" : ""}`}>
                                                            <button 
                                                                className="page-link" 
                                                                onClick={this.goToNextPage}
                                                                disabled={this.state.currentPage === this.state.totalPages}
                                                                style={{ borderRadius: "0 8px 8px 0" }}
                                                            >
                                                                Suivant<i className="fas fa-chevron-right ms-1"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}