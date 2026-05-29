import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import UpdateSMSBankingUser from "./Modals/UpdateSMSBankingUser";
import "../styles/style.css";

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
            // Modal state
            showAddModal: false,
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
        // Modal methods
        this.openAddModal = this.openAddModal.bind(this);
        this.closeAddModal = this.closeAddModal.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ isloading: false });
        }, 1000);
        this.getData();
    }

    actualiser() {
        location.reload();
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    resetForm() {
        this.setState({
            NumCompte: "",
            NomCompte: "",
            Civilite: "",
            Email: "",
            Telephone: "+243",
            loading2: false,
        });
    }

    openAddModal() {
        this.resetForm();
        this.setState({ showAddModal: true });
    }

    closeAddModal() {
        this.setState({ showAddModal: false });
    }

    // Pagination methods
    goToPrevPage() {
        this.setState((prevState) => ({
            currentPage: Math.max(prevState.currentPage - 1, 1),
        }));
    }

    goToNextPage() {
        this.setState((prevState) => ({
            currentPage: Math.min(
                prevState.currentPage + 1,
                prevState.totalPages,
            ),
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
                    <button
                        onClick={() => this.handlePageChange(1)}
                        className="page-link"
                    >
                        1
                    </button>
                </li>,
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <li key="start-ellipsis" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>,
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li
                    key={i}
                    className={`page-item ${i === currentPage ? "active" : ""}`}
                >
                    <button
                        onClick={() => this.handlePageChange(i)}
                        className="page-link"
                        style={
                            i === currentPage
                                ? {
                                      backgroundColor: "#20c997",
                                      borderColor: "#20c997",
                                      color: "white",
                                  }
                                : {}
                        }
                    >
                        {i}
                    </button>
                </li>,
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <li key="end-ellipsis" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>,
                );
            }
            pageNumbers.push(
                <li key={totalPages} className="page-item">
                    <button
                        onClick={() => this.handlePageChange(totalPages)}
                        className="page-link"
                    >
                        {totalPages}
                    </button>
                </li>,
            );
        }

        return pageNumbers;
    }

    saveBtn = async (e) => {
        e.preventDefault();
        this.setState({ loading2: true });
        const res = await axios.post(
            "sms-banking/add-new-costomer/question",
            this.state,
        );
        if (res.data.success == 1) {
            const question = confirm(
                "Vous êtes sur le point d'ajouter sur SMS banking " +
                    res.data.NomMembre +
                    " Voulez-vous continuer ?",
            );
            if (question == true) {
                const res2 = await axios.post(
                    "sms-banking/add-new-costomer",
                    this.state,
                );
                Swal.fire({
                    title: "Succès",
                    text: res2.data.msg,
                    icon: "success",
                    button: "OK!",
                });
                this.getData();
                this.closeAddModal(); // Fermer le modal après ajout réussi
            }
            this.setState({
                loading2: false,
            });
            this.resetForm();
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
            "Voulez-vous vraiment supprimé cet utilsateur sur le service SMS Banking ?",
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
                this.getData();
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
            this.getData();
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
            this.getData();
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
                const totalPages = Math.ceil(
                    data.length / this.state.itemsPerPage,
                );
                this.setState({
                    fetchData: data,
                    totalPages: totalPages,
                    currentPage: 1,
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

    getCurrentPageData() {
        const {
            fetchData,
            currentPage,
            itemsPerPage,
            searchData,
            fetchSeachedData,
        } = this.state;

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
        const { currentPage, totalPages, itemsPerPage, searchData } =
            this.state;
        const startItem = searchData ? 1 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = searchData
            ? 1
            : Math.min(currentPage * itemsPerPage, this.state.fetchData.length);

        const modernStyles = {
            card: {
                background: "white",
                borderRadius: "24px",
                boxShadow:
                    "0 20px 35px -12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.02)",
                border: "1px solid rgba(203, 213, 225, 0.4)",
                transition: "box-shadow 0.2s ease",
            },
            label: {
                color: "#1e293b",
                fontWeight: "600",
                fontSize: "0.85rem",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
            },
            input: {
                width: "100%",
                padding: "12px 16px",
                fontSize: "0.95rem",
                border: "1.5px solid #e2e8f0",
                borderRadius: "14px",
                backgroundColor: "#fafcff",
                transition: "all 0.2s ease",
                outline: "none",
                fontFamily: "inherit",
            },
            select: {
                width: "100%",
                padding: "12px 16px",
                fontSize: "0.95rem",
                border: "1.5px solid #e2e8f0",
                borderRadius: "14px",
                backgroundColor: "#fafcff",
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "none",
                fontFamily: "inherit",
            },
            button: {
                background: "linear-gradient(105deg, #10b981 0%, #059669 100%)",
                border: "none",
                padding: "12px 24px",
                fontWeight: "600",
                fontSize: "0.9rem",
                letterSpacing: "0.5px",
                borderRadius: "40px",
                color: "white",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 8px rgba(16,185,129,0.2)",
                width: "auto",
                minWidth: "160px",
            },
            modalOverlay: {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1050,
            },
            modalContent: {
                background: "white",
                borderRadius: "28px",
                maxWidth: "650px",
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                animation: "fadeInUp 0.3s ease",
            },
        };

        return (
            <React.Fragment>
                {this.state.isloading ? (
                    <div className="row" id="rowspinner">
                        <div className="myspinner" style={myspinner}>
                            <span
                                className="spinner-border"
                                role="status"
                            ></span>
                            <span style={{ marginLeft: "-20px" }}>
                                Chargement...
                            </span>
                        </div>
                    </div>
                ) : (
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
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <i
                                                        className="fas fa-sms"
                                                        style={{
                                                            fontSize: "28px",
                                                            color: "white",
                                                        }}
                                                    ></i>
                                                </div>
                                                <div>
                                                    <h5 className="text-white fw-bold mb-0">
                                                        SMS Banking
                                                    </h5>
                                                    <small className="text-white-50">
                                                        Gestion des
                                                        notifications par SMS et
                                                        Email
                                                    </small>
                                                </div>
                                            </div>
                                            <button
                                                onClick={this.actualiser}
                                                className="btn"
                                                style={{
                                                    background:
                                                        "rgba(255,255,255,0.2)",
                                                    color: "white",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                }}
                                            >
                                                <i className="fas fa-sync-alt me-2"></i>
                                                Actualiser
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
                                        {/* Barre de recherche + bouton Ajouter */}
                                        <div className="row mb-4 align-items-center">
                                            <div className="col-md-8">
                                                <div
                                                    className="card border-0"
                                                    style={{
                                                        background: "#e6f2f9",
                                                        borderRadius: "12px",
                                                    }}
                                                >
                                                    <div className="card-body py-2 px-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i className="fas fa-search text-secondary"></i>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm border-0 bg-transparent"
                                                                placeholder="Rechercher par numéro de compte..."
                                                                name="searchedItem"
                                                                value={
                                                                    this.state
                                                                        .searchedItem
                                                                }
                                                                onChange={
                                                                    this
                                                                        .handleChange
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                        "Enter"
                                                                    ) {
                                                                        this.handleSeach(
                                                                            this
                                                                                .state
                                                                                .searchedItem,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background:
                                                                        "#20c997",
                                                                    color: "white",
                                                                    borderRadius:
                                                                        "8px",
                                                                }}
                                                                onClick={() =>
                                                                    this.handleSeach(
                                                                        this
                                                                            .state
                                                                            .searchedItem,
                                                                    )
                                                                }
                                                            >
                                                                <i
                                                                    className={`${this.state.loading3 ? "spinner-border spinner-border-sm" : "fas fa-search"}`}
                                                                ></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                                <button
                                                    onClick={this.openAddModal}
                                                    className="btn"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                        color: "white",
                                                        borderRadius: "40px",
                                                        padding:
                                                            "10px 24px",
                                                        fontWeight: "600",
                                                        border: "none",
                                                        boxShadow:
                                                            "0 4px 10px rgba(16,185,129,0.3)",
                                                    }}
                                                >
                                                    <i className="fas fa-plus-circle me-2"></i>
                                                    Ajouter nouveau
                                                </button>
                                            </div>
                                        </div>

                                        {/* Liste des clients - tableau remonté */}
                                        <div className="card border-0 shadow-sm rounded-3">
                                            <div className="card-header bg-white border-0 pt-3">
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                    <h6
                                                        className="fw-bold"
                                                        style={{
                                                            color: "steelblue",
                                                        }}
                                                    >
                                                        <i className="fas fa-users me-2"></i>
                                                        Liste des clients SMS
                                                        Banking
                                                    </h6>
                                                    {!this.state.searchData &&
                                                        this.state.fetchData
                                                            .length > 0 && (
                                                            <div className="text-muted small">
                                                                Affichage{" "}
                                                                {startItem} à{" "}
                                                                {endItem} sur{" "}
                                                                {
                                                                    this.state
                                                                        .fetchData
                                                                        .length
                                                                }{" "}
                                                                clients
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            <div className="card-body p-0">
                                                <div className="table-responsive">
                                                    {!this.state.searchData
                                                        ? this.state.fetchData
                                                              .length !== 0 && (
                                                              <table
                                                                  className="table table-hover mb-0"
                                                                  style={{
                                                                      fontSize:
                                                                          "13px",
                                                                  }}
                                                              >
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
                                                                              Compte
                                                                          </th>
                                                                          <th>
                                                                              Intitulé
                                                                          </th>
                                                                          <th>
                                                                              Email
                                                                          </th>
                                                                          <th>
                                                                              Téléphone
                                                                          </th>
                                                                          <th>
                                                                              Compte
                                                                              Abrégé
                                                                          </th>
                                                                          <th colSpan="2">
                                                                              Actions
                                                                          </th>
                                                                          <th>
                                                                              Notifications
                                                                          </th>
                                                                              </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                      {currentData.map(
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
                                                                                          res.NumCompte
                                                                                      }
                                                                                  </td>
                                                                                  <td>
                                                                                      {
                                                                                          res.NomCompte
                                                                                      }
                                                                                  </td>
                                                                                  <td>
                                                                                      {res.Email ||
                                                                                          "-"}
                                                                                  </td>
                                                                                  <td>
                                                                                      {res.Telephone ||
                                                                                          "-"}
                                                                                  </td>
                                                                                  <td>
                                                                                      {
                                                                                          res.NumAbrege
                                                                                      }
                                                                                  </td>
                                                                                  <td>
                                                                                      <div
                                                                                          className="btn-group"
                                                                                          role="group"
                                                                                      >
                                                                                          <button
                                                                                              onClick={() =>
                                                                                                  this.getIndividualsUserSmsBankingDetails(
                                                                                                      res.id,
                                                                                                  )
                                                                                              }
                                                                                              className="btn btn-sm"
                                                                                              data-toggle="modal"
                                                                                              data-target="#modal-sms-banking"
                                                                                              style={{
                                                                                                  background:
                                                                                                      "#007BFF",
                                                                                                  color: "white",
                                                                                                  borderRadius:
                                                                                                      "6px 0 0 6px",
                                                                                              }}
                                                                                          >
                                                                                              <i className="fas fa-edit"></i>
                                                                                          </button>
                                                                                          <button
                                                                                              onClick={() =>
                                                                                                  this.DeleteUser(
                                                                                                      res.id,
                                                                                                  )
                                                                                              }
                                                                                              className="btn btn-sm"
                                                                                              style={{
                                                                                                  background:
                                                                                                      "#dc3545",
                                                                                                  color: "white",
                                                                                                  borderRadius:
                                                                                                      "0 6px 6px 0",
                                                                                              }}
                                                                                          >
                                                                                              <i className="fas fa-trash-alt"></i>
                                                                                          </button>
                                                                                      </div>
                                                                                  </td>
                                                                                  <td>
                                                                                      <div
                                                                                          className="btn-group"
                                                                                          role="group"
                                                                                      >
                                                                                          {res.ActivatedSMS ==
                                                                                          1 ? (
                                                                                              <button
                                                                                                  onClick={() =>
                                                                                                      this.ActivateUserOnMSG(
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
                                                                                                      fontSize:
                                                                                                          "10px",
                                                                                                  }}
                                                                                              >
                                                                                                  <i className="fas fa-sms me-1"></i>
                                                                                                  Désactiver
                                                                                                  SMS
                                                                                              </button>
                                                                                          ) : (
                                                                                              <button
                                                                                                  onClick={() =>
                                                                                                      this.ActivateUserOnMSG(
                                                                                                          res.id,
                                                                                                      )
                                                                                                  }
                                                                                                  className="btn btn-sm"
                                                                                                  style={{
                                                                                                      background:
                                                                                                          "#28a745",
                                                                                                      color: "white",
                                                                                                      borderRadius:
                                                                                                          "6px",
                                                                                                      fontSize:
                                                                                                          "10px",
                                                                                                  }}
                                                                                              >
                                                                                                  <i className="fas fa-sms me-1"></i>
                                                                                                  Activer
                                                                                                  SMS
                                                                                              </button>
                                                                                          )}
                                                                                      </div>
                                                                                  </td>
                                                                                  <td>
                                                                                      <div
                                                                                          className="btn-group"
                                                                                          role="group"
                                                                                      >
                                                                                          {res.ActivatedEmail ==
                                                                                          1 ? (
                                                                                              <button
                                                                                                  onClick={() =>
                                                                                                      this.ActivateUserOnEmail(
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
                                                                                                      fontSize:
                                                                                                          "10px",
                                                                                                  }}
                                                                                              >
                                                                                                  <i className="fas fa-envelope me-1"></i>
                                                                                                  Désactiver
                                                                                                  Email
                                                                                              </button>
                                                                                          ) : (
                                                                                              <button
                                                                                                  onClick={() =>
                                                                                                      this.ActivateUserOnEmail(
                                                                                                          res.id,
                                                                                                      )
                                                                                                  }
                                                                                                  className="btn btn-sm"
                                                                                                  style={{
                                                                                                      background:
                                                                                                          "#28a745",
                                                                                                      color: "white",
                                                                                                      borderRadius:
                                                                                                          "6px",
                                                                                                      fontSize:
                                                                                                          "10px",
                                                                                                  }}
                                                                                              >
                                                                                                  <i className="fas fa-envelope me-1"></i>
                                                                                                  Activer
                                                                                                  Email
                                                                                              </button>
                                                                                          )}
                                                                                      </div>
                                                                                  </td>
                                                                                  <td>
                                                                                      <UpdateSMSBankingUser
                                                                                          modalId={
                                                                                              res.id
                                                                                          }
                                                                                          data={
                                                                                              this
                                                                                                  .state
                                                                                                  .fetchUpdateData
                                                                                          }
                                                                                          nameMembre={
                                                                                              res.NomCompte
                                                                                          }
                                                                                      />
                                                                                  </td>
                                                                              </tr>
                                                                          ),
                                                                      )}
                                                                  </tbody>
                                                              </table>
                                                          )
                                                        : this.state
                                                              .fetchSeachedData && (
                                                              <table
                                                                  className="table table-hover mb-0"
                                                                  style={{
                                                                      fontSize:
                                                                          "13px",
                                                                  }}
                                                              >
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
                                                                              Compte
                                                                          </th>
                                                                          <th>
                                                                              Intitulé
                                                                          </th>
                                                                          <th>
                                                                              Email
                                                                          </th>
                                                                          <th>
                                                                              Téléphone
                                                                          </th>
                                                                          <th>
                                                                              Compte
                                                                              Abrégé
                                                                          </th>
                                                                          <th colSpan="2">
                                                                              Actions
                                                                          </th>
                                                                          <th>
                                                                              Notifications
                                                                          </th>
                                                                      </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                      <tr>
                                                                          <td className="fw-semibold">
                                                                              {
                                                                                  this
                                                                                      .state
                                                                                      .fetchSeachedData
                                                                                      .NumCompte
                                                                              }
                                                                          </td>
                                                                          <td>
                                                                              {
                                                                                  this
                                                                                      .state
                                                                                      .fetchSeachedData
                                                                                      .NomCompte
                                                                              }
                                                                          </td>
                                                                          <td>
                                                                              {this
                                                                                  .state
                                                                                  .fetchSeachedData
                                                                                  .Email ||
                                                                                  "-"}
                                                                          </td>
                                                                          <td>
                                                                              {this
                                                                                  .state
                                                                                  .fetchSeachedData
                                                                                  .Telephone ||
                                                                                  "-"}
                                                                          </td>
                                                                          <td>
                                                                              {
                                                                                  this
                                                                                      .state
                                                                                      .fetchSeachedData
                                                                                      .NumAbrege
                                                                              }
                                                                          </td>
                                                                          <td>
                                                                              <div
                                                                                  className="btn-group"
                                                                                  role="group"
                                                                              >
                                                                                  <button
                                                                                      onClick={() =>
                                                                                          this.getIndividualsUserSmsBankingDetails(
                                                                                              this
                                                                                                  .state
                                                                                                  .fetchSeachedData
                                                                                                  .id,
                                                                                          )
                                                                                      }
                                                                                      className="btn btn-sm"
                                                                                      data-toggle="modal"
                                                                                      data-target="#modal-sms-banking"
                                                                                      style={{
                                                                                          background:
                                                                                              "#007BFF",
                                                                                          color: "white",
                                                                                          borderRadius:
                                                                                              "6px 0 0 6px",
                                                                                      }}
                                                                                  >
                                                                                      <i className="fas fa-edit"></i>
                                                                                  </button>
                                                                                  <button
                                                                                      onClick={() =>
                                                                                          this.DeleteUser(
                                                                                              this
                                                                                                  .state
                                                                                                  .fetchSeachedData
                                                                                                  .id,
                                                                                          )
                                                                                      }
                                                                                      className="btn btn-sm"
                                                                                      style={{
                                                                                          background:
                                                                                              "#dc3545",
                                                                                          color: "white",
                                                                                          borderRadius:
                                                                                              "0 6px 6px 0",
                                                                                      }}
                                                                                  >
                                                                                      <i className="fas fa-trash-alt"></i>
                                                                                  </button>
                                                                              </div>
                                                                          </td>
                                                                          <td>
                                                                              <div
                                                                                  className="btn-group"
                                                                                  role="group"
                                                                              >
                                                                                  {this
                                                                                      .state
                                                                                      .fetchSeachedData
                                                                                      .ActivatedSMS ==
                                                                                  1 ? (
                                                                                      <button
                                                                                          onClick={() =>
                                                                                              this.ActivateUserOnMSG(
                                                                                                  this
                                                                                                      .state
                                                                                                      .fetchSeachedData
                                                                                                      .id,
                                                                                              )
                                                                                          }
                                                                                          className="btn btn-sm"
                                                                                          style={{
                                                                                              background:
                                                                                                  "#dc3545",
                                                                                              color: "white",
                                                                                              borderRadius:
                                                                                                  "6px",
                                                                                              fontSize:
                                                                                                  "10px",
                                                                                          }}
                                                                                      >
                                                                                          <i className="fas fa-sms me-1"></i>
                                                                                          Désactiver
                                                                                          SMS
                                                                                      </button>
                                                                                  ) : (
                                                                                      <button
                                                                                          onClick={() =>
                                                                                              this.ActivateUserOnMSG(
                                                                                                  this
                                                                                                      .state
                                                                                                      .fetchSeachedData
                                                                                                      .id,
                                                                                              )
                                                                                          }
                                                                                          className="btn btn-sm"
                                                                                          style={{
                                                                                              background:
                                                                                                  "#28a745",
                                                                                              color: "white",
                                                                                              borderRadius:
                                                                                                  "6px",
                                                                                              fontSize:
                                                                                                  "10px",
                                                                                          }}
                                                                                      >
                                                                                          <i className="fas fa-sms me-1"></i>
                                                                                          Activer
                                                                                          SMS
                                                                                      </button>
                                                                                  )}
                                                                              </div>
                                                                          </td>
                                                                          <td>
                                                                              <div
                                                                                  className="btn-group"
                                                                                  role="group"
                                                                              >
                                                                                  {this
                                                                                      .state
                                                                                      .fetchSeachedData
                                                                                      .ActivatedEmail ==
                                                                                  1 ? (
                                                                                      <button
                                                                                          onClick={() =>
                                                                                              this.ActivateUserOnEmail(
                                                                                                  this
                                                                                                      .state
                                                                                                      .fetchSeachedData
                                                                                                      .id,
                                                                                              )
                                                                                          }
                                                                                          className="btn btn-sm"
                                                                                          style={{
                                                                                              background:
                                                                                                  "#dc3545",
                                                                                              color: "white",
                                                                                              borderRadius:
                                                                                                  "6px",
                                                                                              fontSize:
                                                                                                  "10px",
                                                                                          }}
                                                                                      >
                                                                                          <i className="fas fa-envelope me-1"></i>
                                                                                          Désactiver
                                                                                          Email
                                                                                      </button>
                                                                                  ) : (
                                                                                      <button
                                                                                          onClick={() =>
                                                                                              this.ActivateUserOnEmail(
                                                                                                  this
                                                                                                      .state
                                                                                                      .fetchSeachedData
                                                                                                      .id,
                                                                                              )
                                                                                          }
                                                                                          className="btn btn-sm"
                                                                                          style={{
                                                                                              background:
                                                                                                  "#28a745",
                                                                                              color: "white",
                                                                                              borderRadius:
                                                                                                  "6px",
                                                                                              fontSize:
                                                                                                  "10px",
                                                                                          }}
                                                                                      >
                                                                                          <i className="fas fa-envelope me-1"></i>
                                                                                          Activer
                                                                                          Email
                                                                                      </button>
                                                                                  )}
                                                                              </div>
                                                                          </td>
                                                                          <td>
                                                                              <UpdateSMSBankingUser
                                                                                  modalId={
                                                                                      this
                                                                                          .state
                                                                                          .state
                                                                                  }
                                                                                  data={
                                                                                      this
                                                                                          .state
                                                                                          .fetchUpdateData
                                                                                  }
                                                                                  nameMembre={
                                                                                      this
                                                                                          .state
                                                                                          .fetchSeachedData
                                                                                          .NomCompte
                                                                                  }
                                                                              />
                                                                          </td>
                                                                      </tr>
                                                                  </tbody>
                                                              </table>
                                                          )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        {!this.state.searchData &&
                                            this.state.fetchData.length > 0 && (
                                                <div className="d-flex justify-content-between align-items-center mt-4 pt-2">
                                                    <div className="text-muted small">
                                                        <i className="fas fa-info-circle me-1"></i>
                                                        {
                                                            this.state.fetchData
                                                                .length
                                                        }{" "}
                                                        client(s) au total
                                                    </div>
                                                    <nav aria-label="Pagination des clients">
                                                        <ul className="pagination pagination-sm mb-0">
                                                            <li
                                                                className={`page-item ${this.state.currentPage === 1 ? "disabled" : ""}`}
                                                            >
                                                                <button
                                                                    className="page-link"
                                                                    onClick={
                                                                        this
                                                                            .goToPrevPage
                                                                    }
                                                                    disabled={
                                                                        this
                                                                            .state
                                                                            .currentPage ===
                                                                        1
                                                                    }
                                                                    style={{
                                                                        borderRadius:
                                                                            "8px 0 0 8px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-chevron-left me-1"></i>
                                                                    Précédent
                                                                </button>
                                                            </li>
                                                            {this.renderPagination()}
                                                            <li
                                                                className={`page-item ${this.state.currentPage === this.state.totalPages ? "disabled" : ""}`}
                                                            >
                                                                <button
                                                                    className="page-link"
                                                                    onClick={
                                                                        this
                                                                            .goToNextPage
                                                                    }
                                                                    disabled={
                                                                        this
                                                                            .state
                                                                            .currentPage ===
                                                                        this
                                                                            .state
                                                                            .totalPages
                                                                    }
                                                                    style={{
                                                                        borderRadius:
                                                                            "0 8px 8px 0",
                                                                    }}
                                                                >
                                                                    Suivant
                                                                    <i className="fas fa-chevron-right ms-1"></i>
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

                {/* Modal d'ajout */}
                {this.state.showAddModal && (
                    <div style={modernStyles.modalOverlay} onClick={this.closeAddModal}>
                        <div
                            style={modernStyles.modalContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 p-xl-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold m-0" style={{ color: "#0f3b5c" }}>
                                        <i className="fas fa-user-plus me-2 text-success"></i>
                                        Nouveau client SMS Banking
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={this.closeAddModal}
                                        aria-label="Fermer"
                                    ></button>
                                </div>

                                <form>
                                    <div className="mb-4">
                                        <label style={modernStyles.label}>
                                            <i className="fas fa-hashtag"></i> Numéro de compte *
                                        </label>
                                        <input
                                            name="NumCompte"
                                            type="text"
                                            className="form-control"
                                            style={modernStyles.input}
                                            value={this.state.NumCompte}
                                            onChange={this.handleChange}
                                            placeholder="Ex: 12345678"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label style={modernStyles.label}>
                                            <i className="fas fa-user-tag"></i> Civilité *
                                        </label>
                                        <select
                                            name="Civilite"
                                            className="form-select"
                                            style={modernStyles.select}
                                            value={this.state.Civilite}
                                            onChange={this.handleChange}
                                            required
                                        >
                                            <option value="">Sélectionnez</option>
                                            <option value="Monsieur">Monsieur</option>
                                            <option value="Madame">Madame</option>
                                            <option value="Mademoiselle">Mademoiselle</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label style={modernStyles.label}>
                                            <i className="fas fa-envelope"></i> Email
                                        </label>
                                        <input
                                            name="Email"
                                            type="email"
                                            className="form-control"
                                            style={modernStyles.input}
                                            value={this.state.Email}
                                            onChange={this.handleChange}
                                            placeholder="client@exemple.com"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label style={modernStyles.label}>
                                            <i className="fas fa-phone-alt"></i> Téléphone *
                                        </label>
                                        <input
                                            name="Telephone"
                                            type="tel"
                                            className="form-control"
                                            style={modernStyles.input}
                                            value={this.state.Telephone}
                                            onChange={this.handleChange}
                                            placeholder="+243 xxxxxxxx"
                                            required
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={this.closeAddModal}
                                            style={{ borderRadius: "40px", padding: "10px 24px" }}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="button"
                                            onClick={this.saveBtn}
                                            className="btn gradient-btn"
                                            style={modernStyles.button}
                                            disabled={this.state.loading2}
                                        >
                                            {this.state.loading2 ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Envoi...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    Valider
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </React.Fragment>
        );
    }
}