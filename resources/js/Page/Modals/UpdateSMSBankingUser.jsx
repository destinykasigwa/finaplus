import axios from "axios";
import React from "react";
import Swal from "sweetalert2";

export default class UpdateSMSBankingUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Email: "",
            Telephone: "",
            Civilite: "",
        };
        this.handleChange = this.handleChange.bind(this);
        this.UpdateSMSBankingUserData =
            this.UpdateSMSBankingUserData.bind(this);
        this.clearData = this.clearData.bind(this);
    }
    //get data in input
    handleChange(event) {
        this.setState({
            // Computed property names
            // keys of the objects are computed dynamically

            [event.target.name]: event.target.value,
        });
    }

    static getDerivedStateFromProps(props, current_state) {
        let SMSBankingInfoUpdate = {
            Email: "",
            Telephone: "",
            Civilite: "",
        };
        //console.log(props.data.Telephone + "hhhhhhhhhhhhhhhhh");
        //updating data from input
        if (props.data) {
            if (
                current_state.Email &&
                current_state.Email !== props.data.Email
            ) {
                return null;
            }
            if (
                current_state.Telephone &&
                current_state.Telephone !== props.data.Telephone
            ) {
                return null;
            }
            if (
                current_state.Civilite &&
                current_state.Civilite !== props.data.Civilite
            ) {
                return null;
            }

            //updating data from props below
            if (
                current_state.Email !== props.data.Email ||
                current_state.Email === props.data.Email
            ) {
                SMSBankingInfoUpdate.Email = props.data.Email;
            }

            if (
                current_state.Telephone !== props.data.Telephone ||
                current_state.Telephone === props.data.Telephone
            ) {
                SMSBankingInfoUpdate.Telephone = props.data.Telephone;
            }

            if (
                current_state.Civilite !== props.data.Civilite ||
                current_state.Email === props.data.Civilite
            ) {
                SMSBankingInfoUpdate.Civilite = props.data.Civilite;
            }

            return SMSBankingInfoUpdate;
        }
    }

    //updating mendataire

    UpdateSMSBankingUserData = (e) => {
        e.preventDefault();

        axios
            .post("sms-banking/update/user/data", {
                userId: this.props.data.id,
                Email: this.state.Email,
                Telephone: this.state.Telephone,
                Civilite: this.state.Civilite,
            })
            .then((response) => {
                if (response.data.success == 1) {
                    Swal.fire({
                        title: "Success",
                        text: response.data.msg,
                        icon: "success",
                        button: "OK!",
                    });
                    // console.log(this.props.modalId);
                } else {
                    console.log(this.state);
                }
            });
    };

    clearData = () => {
        this.props.data = [];
    };

    render() {
        var labelColor = {
            fontWeight: "bold",
            color: "steelblue",
            padding: "3px",
            fontSize: "14px",
        };
        var inputColor = {
            height: "25px",
            border: "1px solid steelblue",
            padding: "3px",
            borderRadius: "0px",
        };
        var tableBorder = {
            border: "0px",
        };
        return (
            <>
              <div className="modal fade" id="modal-sms-banking">
    <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3">
            <div className="modal-header" style={{ 
                background: "#138496", 
                borderRadius: "12px 12px 0 0",
                borderBottom: "none"
            }}>
                <h4 className="modal-title fw-bold" style={{ color: "white" }}>
                    <i className="fas fa-user-edit me-2"></i>
                    Modification du membre {this.props.data && this.props.data.NomCompte}
                </h4>
                <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={this.clearData}
                    style={{ color: "white", opacity: 1 }}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            
            <div className="modal-body p-4">
                <div className="card border-0 shadow-sm rounded-3" style={{ background: "#f8f9fa" }}>
                    <div className="card-body p-4">
                        <form method="POST">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <tbody>
                                             {/* Téléphone */}
                                            <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                                <td style={{ padding: "12px 8px", width: "35%" }}>
                                                    <label style={{ color: "steelblue", fontWeight: "500" }}>
                                                        <i className="fas fa-phone-alt me-2"></i>Téléphone
                                                    </label>
                                                 </td>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <input
                                                        id="Telephone"
                                                        type="text"
                                                        className="form-control"
                                                        style={{ 
                                                            borderRadius: "8px",
                                                            border: "1px solid #e9ecef",
                                                            padding: "8px 12px",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        name="Telephone"
                                                        value={this.state.Telephone ?? ""}
                                                        onChange={this.handleChange}
                                                        placeholder="Numéro de téléphone"
                                                    />
                                                 </td>
                                              </tr>
                                            
                                            {/* Email */}
                                            <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <label style={{ color: "steelblue", fontWeight: "500" }}>
                                                        <i className="fas fa-envelope me-2"></i>Email
                                                    </label>
                                                 </td>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <input
                                                        id="Email"
                                                        type="email"
                                                        className="form-control"
                                                        style={{ 
                                                            borderRadius: "8px",
                                                            border: "1px solid #e9ecef",
                                                            padding: "8px 12px",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        name="Email"
                                                        value={this.state.Email ?? ""}
                                                        onChange={this.handleChange}
                                                        placeholder="adresse@email.com"
                                                    />
                                                 </td>
                                              </tr>
                                            
                                            {/* Civilité */}
                                            <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <label style={{ color: "steelblue", fontWeight: "500" }}>
                                                        <i className="fas fa-user-circle me-2"></i>Civilité
                                                    </label>
                                                 </td>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <select
                                                        id="Civilite"
                                                        className="form-control"
                                                        style={{ 
                                                            borderRadius: "8px",
                                                            border: "1px solid #e9ecef",
                                                            padding: "8px 12px",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                        name="Civilite"
                                                        value={this.state.Civilite ?? ""}
                                                        onChange={this.handleChange}
                                                    >
                                                        <option value="">Sélectionnez</option>
                                                        <option value="Monsieur">Monsieur</option>
                                                        <option value="Madame">Madame</option>
                                                        <option value="Mademoiselle">Mademoiselle</option>
                                                    </select>
                                                 </td>
                                              </tr>
                                            
                                            {/* Ligne d'action */}
                                            <tr>
                                                <td colSpan="2" style={{ padding: "20px 8px 8px" }}>
                                                    <button
                                                        type="button"
                                                        className="btn w-100 py-2 fw-bold"
                                                        style={{
                                                            background: "linear-gradient(135deg, #20c997, #198764)",
                                                            color: "white",
                                                            borderRadius: "10px",
                                                            border: "none",
                                                            fontSize: "14px",
                                                            transition: "all 0.3s ease"
                                                        }}
                                                        id="addMbtn"
                                                        onClick={this.UpdateSMSBankingUserData}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = "translateY(-2px)";
                                                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(32,201,151,0.4)";
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "none";
                                                        }}
                                                    >
                                                        <i className="fas fa-save me-2"></i>
                                                        Valider la modification
                                                    </button>
                                                 </td>
                                              </tr>
                                        </tbody>
                                     </table>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
            </>
        );
    }
}
