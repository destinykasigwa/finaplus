<?php

use App\CustomTasks\ClotureJournee;
use App\CustomTasks\ClotureJourneeCopy;
use App\Http\Controllers\EcoHomePage;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Authentication;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BulkSMSController;
use App\Http\Controllers\PostageController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SendSMSController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\AdhesionController;
use App\Http\Controllers\ClotureJourneeController;
use App\Http\Controllers\PDFExportController;
use App\Http\Controllers\RemboursementManuel;
use App\Http\Controllers\SMSBankingController;
use App\Http\Controllers\SuiviCreditController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\ComptesParamController;
use App\Http\Controllers\TransactionsController;
use App\Http\Middleware\Authenticate;
use App\Models\AdhesionMembre;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('home');
// });
//MAIN ROUTE
Route::get('/check-session-expiration', [SessionController::class, 'checkSessionExpiration']);
Route::middleware(['web'])->group(function () {
    // Définissez vos routes ici
    Route::get('/eco/pages/unauthorized', function () {
        return view('eco.pages.unauthorized');
    });
    Route::get("/", [HomeController::class, 'home']);
    Route::get('/auth/login', [Authentication::class, 'loginIndex'])->name('auth.login');
    Route::get('/auth/register', [Authentication::class, 'registerIndex'])->name('auth.register');
    Route::get('/auth/skip-change-password', [Authentication::class, 'skipPasswordIndex'])->name('auth.skip-change-password');
    Route::get('/eco/home', [EcoHomePage::class, 'ecoHomePage'])->name('eco.home');
    Route::get('/auth/forget-password', [Authentication::class, 'recuperationHomePage']);
    Route::get('/auth/reset-password', [Authentication::class, 'resetHomePage']);
    Route::get('/eco/pages/utilisateurs', [UtilisateurController::class, 'getUsersHomePage'])->middleware('checkRole:isIT')->name('eco.pages.utilisateurs');
    Route::get('/eco/pages/compte-param', [ComptesParamController::class, 'getComptesHomePage'])->name('eco.pages.compte-param');
    Route::get('/eco/pages/adhesion-membre', [AdhesionController::class, 'getAdhesionHomePage'])->name('eco.pages.adhesion-membre');
    Route::get('/eco/pages/depot-espece', [TransactionsController::class, 'getDepotEspeceHomePage'])->name('eco.pages.depot-espece');
    Route::get('/eco/pages/visa', [TransactionsController::class, 'getVisaHomePage'])->name('eco.pages.visa');
    Route::get('/eco/pages/retrait-espece', [TransactionsController::class, 'getRetraitHomePage'])->name('eco.pages.retrait-espece');
    Route::get('/eco/pages/delestage', [TransactionsController::class, 'getDelestageHomePage'])->name('eco.pages.delestage');
    // Route::get('/eco/pages/appro', [TransactionsController::class, 'getApproHomePage'])->middleware('checkRole:isChefCaisse')->name('eco.pages.appro');
     Route::get('/eco/pages/appro', [TransactionsController::class, 'getApproHomePage'])->name('eco.pages.appro');
    Route::get('/eco/pages/entreeT', [TransactionsController::class, 'getEntreeTHomePage'])->name('eco.pages.entreeT');
    Route::get('/eco/pages/releve', [TransactionsController::class, 'getReleveHomePage'])->name('eco.pages.releve');
    Route::get('/eco/pages/journal', [ReportsController::class, 'getJournalHomePage'])->name('eco.pages.journal');
    Route::get('/eco/pages/suspens', [TransactionsController::class, 'getSuspensHomePage'])->name('eco.pages.suspens');
    Route::get('/eco/pages/repertoire', [ReportsController::class, 'getRepertoireHomePage'])->name('eco.pages.repertoire');
    Route::get('/eco/pages/debiter', [TransactionsController::class, 'getDebiterHomePage'])->name('eco.pages.debiter');
    Route::get('/eco/pages/crediter', [TransactionsController::class, 'getCrediterHomePage'])->name('eco.pages.crediter');
    Route::get('/eco/pages/montage-credit', [SuiviCreditController::class, 'getMontageCreditHomePage'])->name('eco.pages.montage-credit');
    Route::get('/eco/pages/type-credit', [SuiviCreditController::class, 'getTypeCreditHomePage'])->name('eco.pages.type-credit');
    Route::get('/eco/pages/credit/rapport-credit', [ReportsController::class, 'getEcheancierCreditHomePage'])->name('eco.pages.rapport-credit');
    Route::get('/eco/pages/balance', [ReportsController::class, 'getBalanceHomePage'])->name('eco.pages.balance');
    Route::get('/eco/pages/grandlivre', [ReportsController::class, 'getGrandLivreHomePage'])->name('eco.pages.grandlivre');
     //GET GRAND LIVRE HOME PAGE 
    Route::get('/eco/pages/bilan', [ReportsController::class, 'getBilanHomePage'])->name('eco.pages.bilan');
    Route::get('/eco/pages/tfr', [ReportsController::class, 'getTfrHomePage'])->name('eco.pages.tfr');
    Route::get('/eco/pages/remboursement-attendu', [ReportsController::class, 'getRemboursementAttenduHomePage'])->name('eco.pages.remboursement-attendu');
    Route::get('/eco/pages/sommaire-compte', [ReportsController::class, 'getSommaireCompteHomePage'])->name('eco.pages.sommaire-compte');
    Route::get('/eco/pages/cloture', [PostageController::class, 'getClotureHomePage'])->name('eco.pages.cloture');
    Route::get('/eco/pages/sms-banking', [SMSBankingController::class, 'getSMSBankingHomePage'])->name('eco.pages.sms-banking');

    //GET USER TO RESET PASSWORD
    Route::get('auth/eco/pages/get-user', [Authenticate::class, 'getUser']);

    //register
    Route::post('auth/regiter', [Authentication::class, 'register']);
    //login
    Route::post('auth/login', [Authentication::class, 'login']);

    //Change the password by user when it's expired
    Route::post('auth/login/change-password', [Authentication::class, 'ChangePassWordByUser']);


    //RESET PASSWORD 

    Route::post('auth/resetpassword', [Authentication::class, 'ResetPassWordByUser']);

    //logout
    Route::post('logout', [Authentication::class, 'logout'])->name("auth/logout");
    //recuperation password step 1
    Route::post('auth/recuperation', [Authentication::class, 'recuperationPasswordStepOne']);
    //RECUPERATION PW STEP 2
    Route::post('auth/recuperation-step-two', [Authentication::class, 'recuperationPasswordStepTwo']);
    //RECUPERATION PW STEP 3
    Route::post('auth/recuperation-step-three', [Authentication::class, 'recuperationPasswordStepThree']);
    Route::get('eco/pages/getusers', [UtilisateurController::class, 'getUsers']);

    //UPDATE USER,RESET PW,AND LOCK 
    Route::post('eco/pages/updateuser', [UtilisateurController::class, 'upDateUser']);
    Route::post('eco/pages/user/init', [UtilisateurController::class, 'initPassword']);
    Route::post('eco/pages/user/lock', [UtilisateurController::class, 'lockUser']);
    //ADD NEW PROFIL

    Route::post('eco/pages/profil/addnew', [UtilisateurController::class, 'addNewProfil']);

    //GET PROFIL FOR SELECTED USER
    Route::post('eco/pages/getusers/profil', [UtilisateurController::class, 'getProfilUser']);

    //GET MENU FOR SELECTED USER 
    Route::post('eco/pages/getusers/menu', [UtilisateurController::class, 'getMenuUser']);

    //ADD A PROFIL FOR A SPECIFIC USER 

    Route::post('eco/pages/add/profil', [UtilisateurController::class, 'addNewProfilForSpecificUser']);


    //REMOVE A SPECIFIC PROFILE



    Route::post('eco/pages/remove/profil', [UtilisateurController::class, 'removeProfilForSpecificUser']);


    //ADD MENU FOR SPECIFIQUE USER
    Route::post('eco/pages/add/menu', [UtilisateurController::class, 'addMenuForSpecificUser']);

    //REMOVE A SPECIFIC MENU FOR USER 
    Route::post('eco/pages/remove/menu', [UtilisateurController::class, 'removeMenuForSpecificUser']);

    //CREATE NEW CAISSE ACCOUNT

    Route::post('eco/page/users/create-caisse-account', [UtilisateurController::class, 'createNewCaissierAccount']);

    //GET COMPANY DATA FOR PARAM PAGE

    Route::get('eco/page/params/company', [ComptesParamController::class, 'getConfigData']);


    //UPDATE COMPANY DATA

    Route::post('eco/page/params/edit-company', [ComptesParamController::class, 'UpdateCompanyData']);

    //UPDATE THE LOGO OF COMPANY


    Route::post('eco/page/params/edit-company_logo', [ComptesParamController::class, 'UpdateCompanyLogo']);

    //UPDATE ADHESION EPARGNE CONFIG
    Route::post('eco/page/params/edit-adhesion-epargne', [ComptesParamController::class, 'UpdateAdhesionEpargneConfig']);

    //UPDATE PORTE FEUIILE CONFIG


    Route::post('eco/page/params/edit-portefeuille-config', [ComptesParamController::class, 'UpdatePorteFeuilleConfig']);

    //UPDATE THE DAYS OF THE PASSWORD TIME EXPIRATION


    Route::post('eco/page/params/edit-expirate-date-config', [ComptesParamController::class, 'UpdateExpirateDateConfig']);

    //PERMET D'IGNORER LE CHANGEMENT DU MOT DE PASSE QD IL A DEJA EXPIRER


    Route::post('auth/login/change-password/skip', [Authentication::class, 'LoginSkipPassword']);


    //PERMET D'ENREGISTRER UN NOUVEAU MEMBRE
    Route::post('eco/page/adhesion-membre', [AdhesionController::class, 'RegisterNewMember']);

    //PERMET DE RECUPERER LES INFORMATIONS RELATIVES A UN MEMBRES RECHERCHER POUR MODIFICATION
    Route::post('eco/page/adhesion/get-searched-item', [AdhesionController::class, 'getSeachedMembre']);


    //PERMET DE METTRE A JOUR LES INFORMATION D'UN MEMBRES



    Route::post('eco/page/adhesion-membre/update', [AdhesionController::class, 'updateMembre']);


    //PERMET DE METTRE A JOUR LA SIGNATURE DU CLEINT

    Route::post('eco/page/adhesion/edit-signature', [AdhesionController::class, 'updateMembreSignature']);


    //CREATE NEW ACCOUNT 
    Route::post('eco/page/adhesion/creation-compte', [AdhesionController::class, 'createAccount']);


    //GET A SEACHED ACCOUNT FOR DEPOSIT
    Route::post('eco/page/depot-espece/get-account', [TransactionsController::class, 'getSeachedAccount']);


    //GET A SEACHED ACCOUNT FOR DEPOSIT
    Route::post('eco/page/depot-espece/get-account/2', [TransactionsController::class, 'getSeachedAccount2']);

    //MAKE A DEPOSIT 
    Route::post('eco/page/depot-espece/save-deposit', [TransactionsController::class, 'DepositEspece']);

    //PERMET DE FAIRE UN POSITIONNEMENT
    Route::post('eco/page/transaction/positionnement', [TransactionsController::class, 'Positionnement']);


    //FETCH A SPECIFIC ACCOUNT
    Route::post('eco/page/depot-espece/get-account/specific', [TransactionsController::class, 'GetAccount']);


    //GET VISA INFORMATION
    Route::post('eco/page/retrait/get-document', [TransactionsController::class, 'GetDocumentP']);

    //VALIDATE WIDRAWALL

    Route::post('eco/page/depot-espece/save-retrait', [TransactionsController::class, 'saveRetraitEspece']);


    //RECUPERE LES INFORMATIONS POUR DELESTAGE
    Route::get('eco/page/delestage/get-billetage-caissier', [TransactionsController::class, 'getDelestageInfo']);

    //SAVE DELESTAGE 
    Route::post('eco/page/delestage/validation', [TransactionsController::class, 'ValidateDelestage']);

    //GET ALL CAISSIERS 
    Route::get('eco/page/appro/get-all-caissiers', [TransactionsController::class, 'getAllCaissiers']);

    //SAVE APPRO 
    Route::post('eco/page/save-appro', [TransactionsController::class, 'SaveAppro']);

    //RECUPERE LES BILLETAGE LORS DE L'APPRO D'UN CAISSIER

    //RECUPERE LES INFORMATIONS POUR DELESTAGE
    Route::get('eco/page/appro/get-billetage-caissier', [TransactionsController::class, 'getApproInfo']);

    //ACCEPTE LE L'APPRO PAR LE CAISSIER 

    Route::post('eco/page/appro/accept-appro', [TransactionsController::class, 'AcceptAppro']);


    //RECUPERE LES INFORMATION DE DELESTAGE POUR LE VALIDER ET LE METTRE DANS LA CAISSE PRINCIPALE

    Route::get('eco/page/entreT/get-billetage-caissier/delested', [TransactionsController::class, 'GetDelestedItem']);


    //PERMET D'ACCEPTER UN DELESTAGE POUR METTRE L'ARGENT DANS LA CAISSE PRINCIPALE
    Route::post('eco/page/accept-delestage-usd', [TransactionsController::class, 'AcceptDelestageUSD']);

    Route::post('eco/page/accept-delestage-cdf', [TransactionsController::class, 'AcceptDelestageCDF']);

    //PERMET DE SUPPRIMER UN DELESTAGE 


    Route::get('eco/page/delestage/remove-item-usd/{id}', [TransactionsController::class, 'RemoveDelestageItemUSD']);

    Route::get('eco/page/delestage/remove-item-cdf/{id}', [TransactionsController::class, 'RemoveDelestageItemCDF']);

    //GET SEACHED ACCOUNT BY NAME 
    Route::post('eco/page/releve/get-account-by-name', [TransactionsController::class, 'getSearchedAccountByName']);
    //PERMET D'AFFICHER LE RELEVE
    Route::post('eco/page/affichage-releve', [TransactionsController::class, 'getReleveInfo']);

    //GET REPORTS HEADER SECTION
    Route::get('eco/page/header-report', [ReportsController::class, 'getReportHeaderSection']);

    //GET DEFAULT CURRENT DAY FOR REPORTS
    Route::get('eco/page/report/get-default-page', [ReportsController::class, 'getDefaultDate']);

    //GET JOURNAL DROP MENU
    Route::get('eco/page/report/get-journal-drop-menu', [ReportsController::class, 'getJournalDropMenu']);

    //GET SEARCHED JOURNAL 

    Route::post('eco/page/report/get-searched-journal', [ReportsController::class, 'getSearchedJournal']);

    //SAVE SUSPENS DEPOSIT 
    Route::post('eco/page/depot-espece/save-deposit/suspens', [TransactionsController::class, 'addNewSuspensDeposit']);

    //RECUPERE LE JOURNAL 
    Route::post('
eco/page/report/get-searched-repertoire', [ReportsController::class, 'getSearchedRepertoire']);

    //COMPTABILITE//
    //get info for debit eccount 
    Route::post('eco/page/debiter/get-data', [TransactionsController::class, 'getDataForDebitAccount']);
    //get info for credit account
    Route::post('eco/page/crediter/get-data', [TransactionsController::class, 'getDataForCreditAccount']);

    //PERMET D'ENREGISTRER LE DEBIT SUR LES COMPTES 
    Route::post('eco/page/transaction/debiter/save', [TransactionsController::class, 'saveDebit']);

    //PERMET D'ENREGISTRER LE CREDITR SUR LES COMPTES 
    Route::post('eco/page/transaction/crediter/save', [TransactionsController::class, 'saveCredit']);

    //RECUPERE UN NUMERO UNIQUE DE CREDIT
    Route::post('eco/pages/montage-credit/get-credit-to-update
', [SuiviCreditController::class, 'getCompteToUpdate']);


    //SAVE NEW TYPE CREDIT
    Route::post('eco/credit/type-credit/addnew', [SuiviCreditController::class, 'saveNewTypeCredit']);
    //UDATE TYPE CREDIT 

    Route::post('eco/credit/type-credit/update', [SuiviCreditController::class, 'updateTypeCredit']);

    //GET TYPE CREDIT FROM DATA 
    Route::get('eco/type-credit/get-data', [SuiviCreditController::class, 'getTypeCredit']);

    //GET A SPECIFIC TYPE CREDIT TO UPDATE
    Route::post('eco/page/type-credit/get-credit/specific', [SuiviCreditController::class, 'getSpecificTypeCredit']);


    //GET DATA TO DISPALY ON SUIVI CREDIT FORM ON FORM LOAD 
    Route::get('eco/page/montage-credit-data-to-dispaly', [SuiviCreditController::class, 'getDataToDisplayOnFormLoadMontageCredit']);


    //PERMET D'ENREGISTRER LE MONTAGE D'UN NOUVEAU CREDIT
    Route::post('eco/page/montage-credit/save-new', [SuiviCreditController::class, 'saveNewCreditInDb']);


    //GET SEARCHED ACCOUNT 
    Route::post('eco/page/montage-credit/get-seached-account', [SuiviCreditController::class, 'getSeachedAccount']);

    //PERMET DE MODIFIER UN CREDIT
    Route::post('eco/page/montage-credit/update', [SuiviCreditController::class, 'updateCredit']);


    //PERMET DE GENERER L'ECHEANCIER
    Route::post('eco/page/montage-credit/save-echeancier', [SuiviCreditController::class, 'saveEcheancierCredit']);

    //PERMET D'ACCORDER LE CREDIT 
    Route::post('eco/page/montage-credit/accord-credit', [SuiviCreditController::class, 'AccordCredit']);

    //PERMET DE CLOTURER LE CREDIT 
    Route::post('eco/page/montage-credit/cloture-credit', [SuiviCreditController::class, 'ClotureCredit']);

    

    //PERMET DE DECAISSER UN CREDIT 
    Route::post('eco/page/montage-credit/decaissement-credit', [SuiviCreditController::class, 'DecaissementCredit']);



    //PERMET D'EFFECTUER EUN REMBOURSEMENT EN CAPITAL
    Route::post('eco/page/montage-credit/remboursement-manuel', [ClotureJourneeCopy::class, 'RemboursementManuel']);




    //PERMET D'AFFICHER UN ECHEANCIER ET UN TABLEAU D'AMMORTISSEMENT
    Route::post('eco/page/montage-credit/get-echeancier', [ReportsController::class, 'getEcheancier']);


    //PERMET D'EXTOURNER UNE OPERATION
    Route::get(
        "eco/page/debiteur/extourne-operation/{reference}",
        [TransactionsController::class, 'extourneOperation']
    );

    //PERMET DE RECHERCHER UNE OPERATION MOYENNANT SA REFERENCE
    Route::get(
        "eco/page/debiteur/extourne-operation/reference/{ref}",
        [TransactionsController::class, 'getSearchedOperation']
    );

    //RECUPERE TOUTES LES OPERATIONS JOURNALIERES DU COMPTABLE

    Route::get(
        "eco/page/debiteur/operation-journaliere",
        [TransactionsController::class, 'getDailyOperation']
    );

    //PERMET D'AFFICHER LA BALANCE

    Route::post(
        "eco/pages/rapport/etat-financier/balance",
        [ReportsController::class, 'getBalanceCompte']
    );

    //PERMET D'AFFICHER LE BILAN
    Route::post(
        "eco/pages/rapport/etat-financier/bilan",
        [ReportsController::class, 'getBilanCompte']
    );

    //PERMET D'AFFICHER LE TFR
    Route::post(
        "eco/pages/rapport/etat-financier/tfr",
        [ReportsController::class, 'getTfrCompte']
    );



    //PEREMET DE RECUPERER LE REMBOURSEMENT ATTENDU
    Route::post(
        "rapport/data/remboursement-attendu",
        [ReportsController::class, "getRemboursAttendu"]

    );

    //GET SOUS GROUPE COMPTE NAME 
    Route::post(
        "eco/pages/sommaire-compte/getcompte",
        [ReportsController::class, "getAccountName"]

    );

    //PERMET D'AFFICHER LE SOMMAIRE DE COMPTE 
    Route::post(
        "eco/pages/rapport/sommaire-compte/affichage",
        [ReportsController::class, "getSommaireCompte"]

    );


    //PERMET D'AJOUTER UN NOUVEAU COMPTE DE COMPTABLITE

    //PERMET D'AJOUTER UN NOUVEAU COMPTE DE LA COMPTABILITE
    Route::post(
        "eco/pages/comptes/compte/add-new",
        [ComptesParamController::class, 'saveNewAccount']
    );

    //PERMET DE RECUPERER TOUT LES COMPTES INTERNE DISPONIBLE 

    Route::get(
        "eco/pages/comptes-cree/data",
        [ComptesParamController::class, 'getCreatedAccount']
    );

    //PERMET DE RECUPERER TOUS LES COMPTES EPARGNE
    Route::get(
        " eco/pages/comptes-cree/data/compte-epargne",
        [ComptesParamController::class, 'getEpargneAccount']
    );



    //CLOTURE DE LA JOURNEE EN COURS
    // Route::get(
    //     "
    // eco/pages/cloture/journee",
    //     [PostageController::class, 'clotureJournee']
    // );

    //OPEN DAY ON THE SYSTEM

    Route::post(
        "eco/pages/cloture/openday/data",
        [PostageController::class, "openNewday"]
    );




    

    //PERMET DE DEFINIR LA DATE DU SYSTEME
    Route::post(
        "
    eco/pages/datesystem/definir",
        [PostageController::class, 'definrDateSysteme']
    );

    //GET COMMISISON CONFIG
    Route::get(
        "eco/pages/get-commission-setting",
        [TransactionsController::class, 'getCommissionConfig']
    );


    Route::get('/send-sms', [SendSMSController::class, 'smsHomepage']);
    Route::post('/send-sms', [SendSMSController::class, 'sendSms'])->name('send.sms');
    Route::get('/sms-banking', [SMSbankingController::class, 'smsBankingHomepage'])->name("sms.banking");


     //PERMET DE PASSER LES ECRITIRE DE FRAIS DES SMS 
 Route::post(
        "eco/pages/prelevement-sms/executer",
        [SMSBankingController::class, "prelevementFraisSMS"]
    );


    //ADD NEW CUSTOMER ON SMS BANKING QUESTION
    Route::post(
        "/sms-banking/add-new-costomer/question",
        [SMSbankingController::class, "AddNewCustomerQuestion"]

    );
    //ADD NEW CUSTOMER ON SMS BANKING VALIDATE
    Route::post(
        "/sms-banking/add-new-costomer",
        [SMSbankingController::class, "AddNewCustomer"]

    );

    //GET LASTEST SMSBANKING USERS
    Route::get(
        "/sms-banking/getlastest",
        [SMSbankingController::class, "getLastestSMSBankingUsers"]

    );

    //GET SEARCHED ELEMENT FOR SMS-BANKING

    Route::get(
        "/sms-banking/search/user/{item}",
        [SMSbankingController::class, "getSearchedSMSBankingUsers"]

    );

    Route::get(
        "/sms-banking/activate-user/msg/{item}",
        [SMSbankingController::class, "ActivateUserOnSMSBanking"]

    );

    Route::get(
        "/sms-banking/activate-user/email/{item}",
        [SMSbankingController::class, "ActivateUserOnEmailBanking"]
    );

    //DELETE A USER ON SMS BANKING
    Route::delete(
        "/sms-banking/delete/item/{item}",
        [SMSbankingController::class, "deleteAnItemOnSmsBanking"]
    );

    //GET A USER DETAIL FOR SMS BANKING

    Route::post(
        "/sms-banking/update/user-details",
        [SMSbankingController::class, "getIndividualUserDetails"]
    );

    //UPDATE USER ON SMS BANKING
    Route::post(
        "/sms-banking/update/user/data",
        [SMSbankingController::class, "upDateUserOnSMSBanking"]
    );

    Route::post('/sommaire-compte', [PDFExportController::class, 'exportSommairePDF'])->name('export.pdf');


    //RECUPERER LES APPRO JOURNALIERES

    Route::get('eco/pages/appro/get-daily-operations', [ReportsController::class, 'getDailyAppro']);

    //PERMET DE RECUPRER LES DELESTAGE JOURNALIERS


    Route::get('eco/pages/delestage/get-daily-operations', [ReportsController::class, 'getDailyDelestage']);


    //PERMET DE RECUPERER LES RECU DEPOT
    Route::get('eco/depot/get-recu', [ReportsController::class, 'getDailyRecuDepot']);

    Route::get('eco/retrait/get-recu', [ReportsController::class, 'getDailyRecuRetrait']);



    Route::get('eco/pages/cloture/journee', [ClotureJourneeController::class, 'cloturer']);



    //SMS  TEST
    // Route::get('eco/page/send_sms', [BulkSMSController::class, 'envoyerSMS']);

    Route::get('eco/page/send_sms', [ClotureJourneeCopy::class, 'traiterRemboursementsEnRetard']);


    //GET AGENT CREDIT


    Route::get('eco/page/rapport/get-echeancier/agent-credit', [ReportsController::class, 'getAgentCredit']);


    //PERMET DE REECHELONNER UN CREDIT
    Route::post('eco/page/montage-credit/reechelonner-credit', [SuiviCreditController::class, 'ReechelonnementCredit']);

    //PERMET D'EXPORTE LE RAPPORT SOMMAIRE DES COMPTES
    Route::post('/download-report/sommaire-compte', [ReportsController::class, 'downloadReportSommaireCompte'])->name('download.report');

    //PERMET D'EXPORTE LE RAPPORT SOMMAIRE DES CONVERTI
    Route::post('/download-report/sommaire-compte/convertie', [ReportsController::class, 'downloadReportSommaireCompteConvertie'])->name('download.report');

    //PERMET D'EXPORTER LE RAPPORT LISTE DES COMPTES EPARGNE
    Route::post('/download-report/liste-compte/epargne', [ReportsController::class, 'downloadReportCompteEpargne'])->name('download.report');

    //PERMET DE CLOTURER L'EXERCICE EN COURS 
    Route::get('eco/comptes/cloture/annuelle', [PostageController::class, 'clotureAnnuelle']);

    //PERMET D'AJOUTER UN MANDATAIRE A UN COMPTE
    Route::post('eco/pages/adhesion/ajout-mandataire', [AdhesionController::class, 'ajoutMandataire']);

    //PERMET DE RECUPERER LES MANDATAIRES ASSOCIES A UN COMPTE

    Route::post('eco/pages/adhesion/get-mandaitre', [AdhesionController::class, 'getMandataire']);

    //PERMET DE SUPPRIMER UN MANDATAIRE
    Route::get('eco/pages/adhesion/suppression-mandataire/{id}', [AdhesionController::class, 'deleteMandataire']);

 
 //GET GRAND LIVRE
    Route::post('/eco/pages/rapport/grand-livre', [ReportsController::class, 'getGrandLivre']);
});
