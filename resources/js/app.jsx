// /**
//  * First we will load all of this project's JavaScript dependencies which
//  * includes React and other helpers. It's a great starting point while
//  * building robust, powerful web applications using React + Laravel.
//  */

// import './bootstrap';

// /**
//  * Next, we will create a fresh React component instance and attach it to
//  * the page. Then, you may begin adding components to this application
//  * or customize the JavaScript scaffolding to fit your unique needs.
//  */

// import './components/Example';

import "./bootstrap";
import "../css/app.css";

import ReactDOM from "react-dom/client";
import RegisterForm from "./Page/Register";
import Home from "./Page/Home";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "./Page/Login";
import Recuperation from "./Page/Recuperation";
import Users from "./Page/Users";
import Comptes from "./Page/Comptes";
import SkipPassword from "./Page/SkipPassword";
import Adhesion from "./Page/Adhesion";
import DepotEspece from "./Page/DepotEspece";
import Visa from "./Page/Visa";
import RetraitEspece from "./Page/Retrait";
import Delestage from "./Page/Delestage";
import Appro from "./Page/Appro";
import EntreeT from "./Page/EntreeT";
import Releve from "./Page/Releve";
import Journal from "./Page/Journal";
import Suspens from "./Page/Suspens";
import Repertoire from "./Page/Repertoire";
import Debiter from "./Page/Debiter";
import Crediter from "./Page/Crediter";
import MontageCredit from "./Page/MontageCredit";
import TypeCredit from "./Page/Typecredit";
import Echeancier from "./Page/Echeancier";
import Balance from "./Page/Balance";
import Bilan from "./Page/Bilan";
import Tfr from "./Page/Tfr";
import RemboursementAttendu from "./Page/RemboursementAttendu";
import SommaireCompte from "./Page/SommaireCompte";
import Cloture from "./Page/Cloture";
import SMSbanking from "./Page/SMSBanking";
import ResetPassWord from "./Page/ResetPassWord";
import GrandLivre from "./Page/GrandLivre";

if (document.getElementById("app")) {
    ReactDOM.createRoot(document.getElementById("app")).render(
        <BrowserRouter>
            <Home />
        </BrowserRouter>
    );
}

if (document.getElementById("register")) {
    ReactDOM.createRoot(document.getElementById("register")).render(
        <BrowserRouter>
            <RegisterForm />
        </BrowserRouter>
    );
}
if (document.getElementById("login")) {
    ReactDOM.createRoot(document.getElementById("login")).render(
        <BrowserRouter>
            <LoginForm />
        </BrowserRouter>
    );
}
if (document.getElementById("forgetpassword")) {
    ReactDOM.createRoot(document.getElementById("forgetpassword")).render(
        <BrowserRouter>
            <Recuperation />
        </BrowserRouter>
    );
}

if (document.getElementById("resetpassword")) {
    ReactDOM.createRoot(document.getElementById("resetpassword")).render(
        <BrowserRouter>
            <ResetPassWord />
        </BrowserRouter>
    );
}

if (document.getElementById("users")) {
    ReactDOM.createRoot(document.getElementById("users")).render(
        <BrowserRouter>
            <Users />
        </BrowserRouter>
    );
}

if (document.getElementById("compteParam")) {
    ReactDOM.createRoot(document.getElementById("compteParam")).render(
        <BrowserRouter>
            <Comptes />
        </BrowserRouter>
    );
}

if (document.getElementById("skipPassword")) {
    ReactDOM.createRoot(document.getElementById("skipPassword")).render(
        <BrowserRouter>
            <SkipPassword />
        </BrowserRouter>
    );
}

if (document.getElementById("adhesionMembre")) {
    ReactDOM.createRoot(document.getElementById("adhesionMembre")).render(
        <BrowserRouter>
            <Adhesion />
        </BrowserRouter>
    );
}

if (document.getElementById("depotEspece")) {
    ReactDOM.createRoot(document.getElementById("depotEspece")).render(
        <BrowserRouter>
            <DepotEspece />
        </BrowserRouter>
    );
}

if (document.getElementById("visa")) {
    ReactDOM.createRoot(document.getElementById("visa")).render(
        <BrowserRouter>
            <Visa />
        </BrowserRouter>
    );
}

if (document.getElementById("retraitEspece")) {
    ReactDOM.createRoot(document.getElementById("retraitEspece")).render(
        <BrowserRouter>
            <RetraitEspece />
        </BrowserRouter>
    );
}

if (document.getElementById("delestage")) {
    ReactDOM.createRoot(document.getElementById("delestage")).render(
        <BrowserRouter>
            <Delestage />
        </BrowserRouter>
    );
}

if (document.getElementById("appro")) {
    ReactDOM.createRoot(document.getElementById("appro")).render(
        <BrowserRouter>
            <Appro />
        </BrowserRouter>
    );
}

if (document.getElementById("entreeT")) {
    ReactDOM.createRoot(document.getElementById("entreeT")).render(
        <BrowserRouter>
            <EntreeT />
        </BrowserRouter>
    );
}

if (document.getElementById("releve")) {
    ReactDOM.createRoot(document.getElementById("releve")).render(
        <BrowserRouter>
            <Releve />
        </BrowserRouter>
    );
}

if (document.getElementById("journal")) {
    ReactDOM.createRoot(document.getElementById("journal")).render(
        <BrowserRouter>
            <Journal />
        </BrowserRouter>
    );
}
if (document.getElementById("suspens")) {
    ReactDOM.createRoot(document.getElementById("suspens")).render(
        <BrowserRouter>
            <Suspens />
        </BrowserRouter>
    );
}

if (document.getElementById("repertoire")) {
    ReactDOM.createRoot(document.getElementById("repertoire")).render(
        <BrowserRouter>
            <Repertoire />
        </BrowserRouter>
    );
}

if (document.getElementById("debiter")) {
    ReactDOM.createRoot(document.getElementById("debiter")).render(
        <BrowserRouter>
            <Debiter />
        </BrowserRouter>
    );
}

if (document.getElementById("crediter")) {
    ReactDOM.createRoot(document.getElementById("crediter")).render(
        <BrowserRouter>
            <Crediter />
        </BrowserRouter>
    );
}

if (document.getElementById("montage-credit")) {
    ReactDOM.createRoot(document.getElementById("montage-credit")).render(
        <BrowserRouter>
            <MontageCredit />
        </BrowserRouter>
    );
}

if (document.getElementById("type-credit")) {
    ReactDOM.createRoot(document.getElementById("type-credit")).render(
        <BrowserRouter>
            <TypeCredit />
        </BrowserRouter>
    );
}

if (document.getElementById("echeancier")) {
    ReactDOM.createRoot(document.getElementById("echeancier")).render(
        <BrowserRouter>
            <Echeancier />
        </BrowserRouter>
    );
}
if (document.getElementById("balance")) {
    ReactDOM.createRoot(document.getElementById("balance")).render(
        <BrowserRouter>
            <Balance />
        </BrowserRouter>
    );
}

if (document.getElementById("bilan")) {
    ReactDOM.createRoot(document.getElementById("bilan")).render(
        <BrowserRouter>
            <Bilan />
        </BrowserRouter>
    );
}

if (document.getElementById("tfr")) {
    ReactDOM.createRoot(document.getElementById("tfr")).render(
        <BrowserRouter>
            <Tfr />
        </BrowserRouter>
    );
}

if (document.getElementById("remboursement-attendu")) {
    ReactDOM.createRoot(
        document.getElementById("remboursement-attendu")
    ).render(
        <BrowserRouter>
            <RemboursementAttendu />
        </BrowserRouter>
    );
}

if (document.getElementById("sommaire-compte")) {
    ReactDOM.createRoot(document.getElementById("sommaire-compte")).render(
        <BrowserRouter>
            <SommaireCompte />
        </BrowserRouter>
    );
}

if (document.getElementById("cloture")) {
    ReactDOM.createRoot(document.getElementById("cloture")).render(
        <BrowserRouter>
            <Cloture />
        </BrowserRouter>
    );
}
if (document.getElementById("smsBanking")) {
    ReactDOM.createRoot(document.getElementById("smsBanking")).render(
        <BrowserRouter>
            <SMSbanking />
        </BrowserRouter>
    );
}


if (document.getElementById("grandLivre")) {
    ReactDOM.createRoot(document.getElementById("grandLivre")).render(
        <BrowserRouter>
            <GrandLivre />
        </BrowserRouter>
    );
}
