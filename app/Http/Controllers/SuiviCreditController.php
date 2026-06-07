<?php

namespace App\Http\Controllers;

use App\Constants\JournalType;
use App\Models\Agences;
use App\Models\User;
use App\Models\Comptes;
use App\Models\Echeancier;
use App\Models\JourRetard;
use App\Models\TypeCredit;
use App\Models\ObjetCredit;
use App\Models\Portefeuille;
use App\Models\Transactions;
use Illuminate\Http\Request;
use App\Models\LockedGarantie;
use App\Models\TauxEtDateSystem;
use App\Services\SendNotification;
use Illuminate\Support\Facades\DB;
use App\Models\CompteurTransaction;
use App\Models\Remboursementcredit;
use Illuminate\Support\Facades\Auth;
use App\Models\CompteurDossierCredit;
use App\Models\EpargneAdhesionModel;
use App\Models\FrequenceRemboursement;
use Illuminate\Support\Facades\Validator;
use App\CustomTasks\ClotureJourneeCopy;
use Illuminate\Support\Facades\Log;

class SuiviCreditController extends Controller
{
    // public $compteCreditAuxMembreCDF;
    // public $compteCreditAuxMembreUSD;
    protected $sendNotification;

    //
    public function __construct()
    {
        $this->middleware("auth");
        // $this->compteCreditAuxMembreCDF = "3210000000202";
        // $this->compteCreditAuxMembreUSD = "3210000000201";
        $this->sendNotification = app(SendNotification::class);
    }

    //GET MONTAGE CREDIT HOME PAGE 

    public function getMontageCreditHomePage()
    {
        return  view("eco.pages.montage-credit");
    }

    public function getRadiationCreditHomePage()
    {
        return  view("eco.pages.radiation-credit");
    }

    //GET NUM COMPTE TO UPDATE

    public function getCompteToUpdate(Request $request)
    {

        // Récupérer l'agence courante de l'utilisateur (depuis la session)
        $currentAgence = session('current_agence');
        if (!$currentAgence || !isset($currentAgence['code_agence'])) {
            return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
        }
        $codeAgenceCourante = $currentAgence['code_agence'];
      if (isset($request->seachedAccount)) {
    $data = Portefeuille::where(function ($query) use ($request) {
            $query->where("portefeuilles.numAdherant", $request->seachedAccount)
                ->orWhere("portefeuilles.NumCompteEpargne", $request->seachedAccount)
                ->orWhere("portefeuilles.NumDossier", $request->seachedAccount);
        })
        ->join("type_credits", "portefeuilles.RefTypeCredit", "=", "type_credits.id")
        ->where("portefeuilles.CodeAgence", $codeAgenceCourante)
        ->orderBy('portefeuilles.id', 'desc') // Dernier enregistrement
        ->first();
    
    if ($data) {
        return response()->json(["status" => 1, "data" => $data]);
    }
    
    return response()->json(["status" => 0, "msg" => "Aucune information trouvée !"]);
}

return response()->json(["status" => 0, "msg" => "Aucune information trouvée"]);
    }
    //GET TYPE CREDIT HOME PAGE

    public function getTypeCreditHomePage()
    {
        return view("eco.pages.type-credit");
    }

    //PERMET D'ENREGISTRER UN TYPE CREDIT 
    public function saveNewTypeCredit(Request $request)
    {

        if (isset($request->type_credit)) {
            $ref = TypeCredit::latest()->first()->id;
            TypeCredit::create([
                "Reference" => "CR00" . $ref,
                "type_credit" => $request->type_credit,
                "taux_ordinaire" => $request->taux_ordinaire,
                "montant_min" => $request->montant_min,
                "montant_max" => $request->montant_max,
                "compte_interet" => $request->compte_interet,
                "compte_etude_dossier" => $request->compte_etude_dossier,
                "sous_groupe_compte" => $request->sous_groupe_compte,
                "taux_retard" => $request->taux_retard,
                "compte_interet_retard" => $request->compte_interet_retard,
                "frais_dossier" => $request->frais_dossier,
                "commission" => $request->commission_en_pourc,
                "compte_commission" => $request->compte_commission,
            ]);
            return response()->json([
                "status" => 1,
                "msg" => "Type de crédit bien enregistré"
            ]);
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Erreur"
            ]);
        }
    }

    //PERMET DE RECUPERER LE TYPE DE CREDIT DANS L DB

    public function getTypeCredit()
    {
        $data = TypeCredit::where("state", "on")->orderBy('type_credit', 'desc')->get();
        return response()->json([
            "status" => 1,
            "data" => $data
        ]);
    }

    //PUBLIC FUNCTION GET TYPE CREDIT
    public function getSpecificTypeCredit(Request $request)
    {
        if (isset($request->RefCredit)) {
            $data = TypeCredit::where("Reference", $request->RefCredit)->first();
            return response()->json([
                "status" => 1,
                "data" => $data
            ]);
        }
    }

    //UPDATE TYPE CREDIT
    public function   updateTypeCredit(Request $request)
    {
        if (isset($request->reference_up)) {
            TypeCredit::where("Reference", $request->reference_up)->update([
                "type_credit" => $request->type_credit_up,
                "taux_ordinaire" => $request->taux_ordinaire_up,
                "montant_min" => $request->montant_min_up,
                "montant_max" => $request->montant_max_up,
                "compte_interet" => $request->compte_interet_up,
                "compte_etude_dossier" => $request->compte_etude_dossier_up,
                "sous_groupe_compte" => $request->sous_groupe_compte_up,
                "taux_retard" => $request->taux_retard_up,
                "compte_interet_retard" => $request->compte_interet_retard_up,
                "frais_dossier" => $request->frais_dossier_up,
                "commission" => $request->commission_en_pourc_up,
                "compte_commission" => $request->compte_commission_up,
            ]);

            return response()->json([
                "status" => 1,
                "msg" => "Modification réussie."
            ]);
        } else {
            return response()->json([
                "status" => 0,
                "msg" => "Erreur."
            ]);
        }
    }

    //GET DATA TO DISPLAY ON FORM LOAD 

    public function getDataToDisplayOnFormLoadMontageCredit()
    {
        $type_credit = TypeCredit::where("state", "on")->orderBy('type_credit', 'desc')->get();
        $objet_credit = ObjetCredit::get();
        $agent_credit = User::get();
        $frequenceRemboursement = FrequenceRemboursement::get();
        return response()->json([
            "status" => 1,
            "type_credit" => $type_credit,
            "objet_credit" => $objet_credit,
            "agent_credit" => $agent_credit,
            "frequence_rembours" => $frequenceRemboursement,
            "userName" => Auth::user()->name
        ]);
    }

    //PERMET D'ENREGISTRER UN NOUVEAU CREDIT

    public function saveNewCreditInDb(Request $request)
    {


        $validator = validator::make($request->all(), [
            'type_credit' => 'required',
            'recouvreur' => 'required',
            'montant_demande' => 'required',
            'frequence_rembours' => 'required',
            'nbr_echeance' => 'required',
            'date_demande' => 'required',
            'monnaie' => 'required',
            'duree' => 'required',
            'interval' => 'required',
            'objet_credit' => 'required',
            'gestionnaire' => 'required',
            'source_fond' => 'required',
            'taux_interet' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        } else {
            //VERIFIE SI LA PERSONNE N'A PAS UN CREDIT ENCOURS OU QU'IL N'A PAS ENCORE SOLDE
            $getCompteAbrege = Comptes::where(function ($query) use ($request) {
                $query->where('NumCompte', $request->seachedAccount)
                    ->orWhere('NumAdherant', $request->seachedAccount)
                    ->orWhere('Num_Manuel', $request->seachedAccount);
            })->first();
            $getTypeCreditName = TypeCredit::where("id", $request->type_credit)->first();
            Portefeuille::create([
                "RefTypeCredit" => $request->type_credit,
                "RefProduitCredit" => $getTypeCreditName->type_credit,
                "CodeAgence" => $getCompteAbrege->CodeAgence,
                "DateDemande" => $request->date_demande,
                "NbrTranche" => $request->nbr_echeance,
                "NumCompteEpargne" => $request->compte_epargne,
                "NumCompteCredit" => $request->compte_credit,
                "NumCompteEpargneGarantie" => $request->epargne_caution,
                "NomCompte" => $request->NomCompte,
                "Duree" => $request->duree,
                "NumDossier" => $request->NumDossier,
                "MontantDemande" => $request->montant_demande,
                "ObjeFinance" => $request->objet_credit,
                "CodeMonnaie" => $request->monnaie,
                "Interval" => $request->interval,
                "ModeRemboursement" => $request->frequence_rembours,
                "TauxInteret" => $request->taux_interet,
                "NomUtilisateur" => Auth::user()->name,
                "Recouvreur" => $request->recouvreur,
                "SourceFinancement" => $request->source_fond,
                "Gestionnaire" => $request->gestionnaire,
                "numAdherant" => $request->NumAdherant,
            ]);
            // CompteurDossierCredit::create([
            //     "0000",
            // ]);
            $currentAgence = session('current_agence');
            $codeAgence = $currentAgence['code_agence'] ?? null;
            $agence = Agences::where('code_agence', $codeAgence)->first();
            if (!$codeAgence) {
                return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
            }
            $numDocument = $agence->last_ref_numdossier + 1;
            $agence->last_ref_numdossier = $numDocument;
            $agence->save();
            return response()->json([
                'status' => 1,
                'msg' => 'Ce dossier a été mis en place avec succès',
                'validate_error' => $validator->messages()
            ]);
        }
    }

    public function getSeachedAccount(Request $request)
    {
        try {
            if (isset($request->seachedAccount)) {

                $search = $request->seachedAccount;

                // Récupération de l'agence courante de l'utilisateur
                $currentAgence = session('current_agence');
                $codeAgenceCourante = $currentAgence['code_agence'] ?? null;
                if (!$codeAgenceCourante) {
                    return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
                }

                // Recherche du compte (niveau 5) dans l'agence courante
                $data = Comptes::where('niveau', 5)
                    ->where('CodeAgence', $codeAgenceCourante)
                    ->where(function ($query) use ($search) {
                        $query->where('NumCompte', $search)
                            ->orWhere('NumAdherant', $search)
                            ->orWhere('Num_Manuel', $search);
                    })
                    ->first();


                if (!$data) {
                    return response()->json(['status' => 0, 'msg' => "Ce numéro de compte n'existe pas dans votre agence."]);
                }

                // Vérification d'un crédit non clôturé
                // $checkNumExist = Comptes::where("NumAdherant", $request->seachedAccount)->orWhere("NumCompte", $request->seachedAccount)->first();

                if ($data) {
                    $checkCreditNonCloture = Portefeuille::where(function ($query) use ($request, $codeAgenceCourante) {
                        $query->where("NumCompteEpargne", $request->seachedAccount)
                            ->orWhere("numAdherant", $request->seachedAccount);
                    })->where("CodeAgence", $codeAgenceCourante)
                        ->first();

                    if ($checkCreditNonCloture) {
                        if ($checkCreditNonCloture->Cloture == 0) {
                            return response()->json([
                                'status' => 0,
                                'msg' => "Vous devez d'abord clôturer le crédit encours avant de monter un nouveau."
                            ]);
                        }
                    }
                    //  $data_numdossier = DB::select("SELECT * FROM compteur_dossier_credits ORDER BY id DESC")[0];
                    // Récupérer l'agence depuis la base
                    $currentAgence = session('current_agence');
                    $codeAgence = $currentAgence['code_agence'] ?? null;
                    $agence = Agences::where('code_agence', $codeAgence)->first();
                    if (!$codeAgence) {
                        return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
                    }
                    $numDocument = $agence->last_ref_numdossier + 1;
                    $agence->last_ref_numdossier = $numDocument;
                    // $agence->save();
                    $data_numdossier = "ND" . $codeAgence . "0" . $numDocument;
                    $data = Comptes::where('niveau', 5)
                        ->where('CodeAgence', $codeAgenceCourante)
                        ->where(function ($query) use ($search) {
                            $query->where('NumCompte', $search)
                                ->orWhere('NumAdherant', $search)
                                ->orWhere('Num_Manuel', $search);
                        })
                        ->first();
                    $codeAgence = $data->CodeAgence;
                    if ($data->CodeMonnaie == 2) {
                        if ($data->NumAdherant < 10) {
                            $compteCreditEnFranc = "320100000" . $data->NumAdherant . $codeAgence . "2";
                            $epargneCautionCDF = "334100000" . $data->NumAdherant . $codeAgence . "2";
                        } else if ($data->NumAdherant >= 10 && $data->NumAdherant < 100) {
                            $epargneCautionCDF = "33410000" . $data->NumAdherant . $codeAgence . "2";
                            $compteCreditEnFranc = "32010000" . $data->NumAdherant . $codeAgence . "2";
                        } else if ($data->NumAdherant >= 100 && $data->NumAdherant < 1000) {
                            $epargneCautionCDF = "3341000" . $data->NumAdherant . $codeAgence . "2";
                            $compteCreditEnFranc = "3201000" . $data->NumAdherant . $codeAgence . "2";
                        } else if ($data->NumAdherant >= 1000 && $data->NumAdherant < 10000) {
                            $epargneCautionCDF = "334100" . $data->NumAdherant . $codeAgence . "2";
                            $compteCreditEnFranc = "320100" . $data->NumAdherant . $codeAgence . "2";
                        } else if ($data->NumAdherant >= 10000 && $data->NumAdherant < 100000) {
                            $epargneCautionCDF = "33410" . $data->NumAdherant . $codeAgence . "2";
                            $compteCreditEnFranc = "32010" . $data->NumAdherant . $codeAgence . "2";
                        } else if ($data->NumAdherant >= 100000 && $data->NumAdherant < 1000000) {
                            $epargneCautionCDF = "3341" . $data->NumAdherant . $codeAgence . "2";
                            $compteCreditEnFranc = "3201" . $data->NumAdherant . $codeAgence . "2";
                        }
                    } else if ($data->CodeMonnaie == 1) {
                        if ($data->NumAdherant < 10) {
                            $compteCreditEnUSD = "320000000" . $data->NumAdherant . $codeAgence . "1";
                            $epargneCautionUSD = "334000000" . $data->NumAdherant . $codeAgence . "1";
                        } else if ($data->NumAdherant >= 10 && $data->NumAdherant < 100) {
                            $epargneCautionUSD = "33400000" . $data->NumAdherant . $codeAgence . "1";
                            $compteCreditEnUSD = "32000000" . $data->NumAdherant . $codeAgence . "1";
                        } else if ($data->NumAdherant >= 100 && $data->NumAdherant < 1000) {
                            $epargneCautionUSD = "3340000" . $data->NumAdherant . $codeAgence . "1";
                            $compteCreditEnUSD = "3200000" . $data->NumAdherant . $codeAgence . "1";
                        } else if ($data->NumAdherant >= 1000 && $data->NumAdherant < 10000) {
                            $epargneCautionUSD = "334000" . $data->NumAdherant . $codeAgence . "1";
                            $compteCreditEnUSD = "320000" . $data->NumAdherant . $codeAgence . "1";
                        } else if ($data->NumAdherant >= 10000 && $data->NumAdherant < 100000) {
                            $epargneCautionUSD = "33400" . $data->NumAdherant . $codeAgence . "1";
                            $compteCreditEnUSD = "32000" . $data->NumAdherant . $codeAgence . "1";
                        } else if ($data->NumAdherant >= 100000 && $data->NumAdherant < 1000000) {
                            $epargneCautionUSD = "3340" . $data->NumAdherant . $codeAgence . "1";
                            $compteCreditEnUSD = "3200" . $data->NumAdherant . $codeAgence . "1";
                        }
                    }

                    return response()->json([
                        "status" => 1,
                        "data" => $data,
                        "compteCredit" => $data->CodeMonnaie == 2 ? $compteCreditEnFranc : $compteCreditEnUSD,
                        "EpargneCaution" => $data->CodeMonnaie == 2 ? $epargneCautionCDF : $epargneCautionUSD,
                        "data_numdossier" => $data_numdossier
                    ]);
                } else {
                    return response()->json([
                        'status' => 0,
                        'msg' => "Ce numero de compte n'existe pas."
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'msg' => "Veuillez renseigner un numero de compte"
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(["status" => 0, "msg" => "Erreur : " . $e->getMessage()]);
        }
    }


    //PERMET DE MODDIFIER UN CREDIT 
    public function updateCredit(Request $request)
    {
        if (isset($request->NumDossier_up)) {
            // dd($request->all());
            $RefCreditCheck = TypeCredit::where("type_credit", $request->type_credit_up)->first();
            if ($RefCreditCheck) {
                $RefCredit = TypeCredit::where("type_credit", $request->type_credit_up)->first();
            } else {
                $RefCredit = TypeCredit::where("id", $request->type_credit_up)->first();
            }
            Portefeuille::where("NumDossier", $request->NumDossier_up)->update([
                "RefTypeCredit" => $RefCredit->id,
                "RefProduitCredit" => $RefCredit->type_credit,
                "DateDemande" => $request->date_demande_up,
                "NbrTranche" => $request->nbr_echeance_up,
                "Duree" => $request->duree_up,
                "MontantDemande" => $request->montant_demande_up,
                "ObjeFinance" => $request->objet_credit_up,
                "Interval" => $request->interval_up,
                "ModeRemboursement" => $request->frequence_rembours_up,
                "TauxInteret" => $request->taux_interet_up,
                "Gestionnaire" => $request->gestionnaire_up,
                "Recouvreur" => $request->recouvreur_up,
                "SourceFinancement" => $request->source_fond_up,
            ]);
            return response()->json([
                'status' => 1,
                'msg' => "Modification réussie"
            ]);
        } else {
            return response()->json([
                'status' => 0,
                'msg' => "Erreur de modification"
            ]);
        }
    }

    //PERMET DE GENERER L'ECHEANCIER D'UN CREDIT

    public function saveEcheancierCredit(Request $request)
    {
        // dd($request->all());
        $validator = validator::make($request->all(), [
            'desicion' => 'required',
            'ModeCalcul' => 'required',
            'DateOctroi' => 'required',
            'dateEcheance' => 'required',
            'DateTombeEcheance' => 'required',
            'MontantAccorde' => 'required_if:reechelonne,false',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        } else {
            if (isset($request->NumDossier)) {
                $currentAgence = session('current_agence');
                $codeAgence = $currentAgence['code_agence'] ?? null;
                //VERIFIE SI L'ECHEACHIER N'ETAIT PAS DEJA GENERER POUR CE CREDIT
                $checkRow = Echeancier::where("NumDossier", $request->NumDossier)->where("CodeAgence", $codeAgence)->first();
                //POUR REECHELONNER LE CREDIT
                if ($request->reechelonne && $checkRow) {
                    // 1. Vérifier que le crédit n'est pas déjà clôturé
                    $credit = Portefeuille::where("NumDossier", $request->NumDossier)->first();
                    if (!$credit || $credit->Cloture == 1) {
                        return response()->json([
                            'status' => 0,
                            'msg' => "Impossible de rééchelonner un crédit déjà clôturé.",
                        ]);
                    }

                    // 2. Calcul du capital restant réel (toutes échéances)
                    $today = date("Y-m-d");
                    $totalCapitalRestant = Echeancier::selectRaw('
        SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) AS totalRestant
    ')
                        ->leftJoin('remboursementcredits', function ($join) use ($today) {
                            $join->on('echeanciers.ReferenceEch', '=', 'remboursementcredits.RefEcheance')
                                ->whereDate('remboursementcredits.DateTranche', '<=', $today);
                        })
                        ->where('echeanciers.NumDossier', $request->NumDossier)
                        ->first();
                    $capitalRestantDu = $totalCapitalRestant ? $totalCapitalRestant->totalRestant : 0;
                    if ($capitalRestantDu <= 0) {
                        return response()->json([
                            "status" => 0,
                            "msg" => "Aucun capital restant. Le crédit est déjà soldé.",
                        ]);
                    }

                    // 3. Annuler les provisions et reclasser (39 -> 32)
                    $clotureTask = new ClotureJourneeCopy($request);
                    $clotureTask->annulerProvisionEtReclasser($request->NumDossier);
                    $interetCouru = DB::table('interets_courus_suivi')
                        ->where('NumDossier', $request->NumDossier)
                        ->value('InteretCouruNonPaye') ?? 0;

                    if ($interetCouru > 0) {
                        // Option 1 : annulation pure
                        DB::table('interets_courus_suivi')
                            ->where('NumDossier', $request->NumDossier)
                            ->update(['InteretCouruNonPaye' => 0]);

                        // Option 2 : capitalisation (ajouter au capital restant)
                        // $capitalRestantDu += $interetCouru;
                    }
                    // 4. Marquer les anciennes échéances futures comme annulées
                    $dateReechelonnement = $request->dateReechelonnement ?? $today;
                    Echeancier::where('NumDossier', $request->NumDossier)
                        // ->where('DateTranch', '>', $dateReechelonnement)
                        ->update(['Reechelonne' => 1]); // 2 = annulé (à adapter selon votre schéma)

                    // 5. Mettre à jour le portefeuille (champ reechelonne)
                    Portefeuille::where('NumDossier', $request->NumDossier)
                        ->update([
                            'Reechelonne' => 1,
                            "MontantReechelonne" => $capitalRestantDu
                        ]);

                    // 6. Générer le nouvel échéancier avec le capital restant
                    $this->genereEcheancier(
                        $request->desicion,
                        $request->ModeCalcul,
                        $request->DateOctroi,
                        $request->DateTombeEcheance,
                        $capitalRestantDu,
                        $request->TauxInteret,
                        $request->DateTranche,
                        $request->dateEcheance,
                        $request->NumDossier,
                    );

                    return response()->json([
                        "status" => 1,
                        "msg" => "Rééchelonnement effectué avec succès.",
                    ]);
                }
                //SI L'ECHEANCIER ETAIT DEJA GENERER POUR CE CREDIT EST QUE C PAS UN REECHELONNEMENT
                if ($checkRow and !$request->reechelonne) {
                    //VERIFIE S'IL N'EXISTE PAS UN REMBOURSEMENT DEJA EFFECTUE
                    $chechRembours = Remboursementcredit::where("NumDossie", $request->NumDossier)
                        ->where(function ($query) {
                            $query->where("CapitalPaye", ">", 0)
                                ->orWhere("InteretPaye", ">", 0);
                        })
                        ->where('CodeAgence', $codeAgence) // ← ajout du filtre agence
                        ->first();
                    if (!$chechRembours) {

                        Echeancier::where("NumDossier", "=", $request->NumDossier)->delete();
                        $this->genereEcheancier(
                            $request->desicion,
                            $request->ModeCalcul,
                            $request->DateOctroi,
                            $request->DateTombeEcheance,
                            $request->MontantAccorde,
                            $request->TauxInteret,
                            $request->DateTranche,
                            $request->dateEcheance,
                            $request->NumDossier,

                        );

                        return response()->json([
                            "status" => 1,
                            "msg" => "Géneration de l'écheancier bien effectuée",
                            'validate_error' => $validator->messages()
                        ]);
                    } else {
                        return response()->json([
                            'status' => 0,
                            'msg' => "Cette action est interdite pour un crédit comportant déjà des remboursements."
                        ]);
                    }
                }
                if (!$checkRow) {
                    $this->genereEcheancier(
                        $request->desicion,
                        $request->ModeCalcul,
                        $request->DateOctroi,
                        $request->DateTombeEcheance,
                        $request->MontantAccorde,
                        $request->TauxInteret,
                        $request->DateTranche,
                        $request->dateEcheance,
                        $request->NumDossier,

                    );
                    return response()->json([
                        "status" => 1,
                        "msg" => "Géneration de l'écheancier bien effectuée",
                        'validate_error' => $validator->messages()
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'msg' => "Aucun crédit trouvé"
                ]);
            }
        }
    }


    //FUNCTION POUR GENERER UNE ECHEANCIER ECRASE L'ANCIENNE SI ELLE EXISTE DEJA SINON INSERT


    public function genereEcheancier(
        $desicion,
        $ModeCalcul,
        $DateOctroi,
        $DateTombeEcheance,
        $MontantAccorde,
        $TauxInteret,
        $DateTranche,
        $dateEcheance,
        $NumDossier,
    ) {

        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        //RECUPERE LES INFORMATIONS SUR LE CREDIT DANS LE DB 
        $data = Portefeuille::where("NumDossier", $NumDossier)->where("CodeAgence", $codeAgence)->first();

        //MET  LE PORTE FEUILLE A JOUR
        Portefeuille::where("NumDossier", "=", $NumDossier)->update([
            "Decision" => $desicion,
            "DateOctroi" =>  $DateOctroi,
            "DateEcheance" => $dateEcheance,
            "DateTombeEcheance" => $DateTombeEcheance,
            "MontantAccorde" => $MontantAccorde,
        ]);
        //PERMET DE RECUPER LE TYPE DE CREDIT
        $getTypeCredit = Portefeuille::where("NumDossier", $NumDossier)
            ->join("type_credits", "portefeuilles.RefTypeCredit", "=", "type_credits.id")->first();
        // ENEGISTRE L'ECHEANCIER

        if ($getTypeCredit->type_credit == "CREDIT TUINUKE FC" or $getTypeCredit->type_credit == "CREDIT TUINUKE USD") {
            Echeancier::create([
                "CodeAgence" => $codeAgence,
                "NumDossier" => $NumDossier,
                "NumMensualite"  => 0,
                "NbreJour" => 0,
                "Capital" => $MontantAccorde,
                "Interet" => 0,
                "Cumul"  => $MontantAccorde,
                "DateTranch" => $DateOctroi,
                // "SoldeCapital" => $request->MontantAccorde,
                // "SoldeInteret" => 0,
            ]);


            //COMPLETE L'ECHEANCIER
            $capital = $MontantAccorde;
            $interet = 0;
            $capitalAmorti = $capital / $data->NbrTranche;
            $maxDays = date('t');
            $dates = array($DateTombeEcheance);

            $dateOctroie = $DateOctroi;
            for ($i = 1; $i < $maxDays; $i++) {
                $NewDate = date('Y-m-d', strtotime("+" . $i . " days", strtotime("$dateOctroie")));
                $dates[] = $NewDate;
            }
            if ($ModeCalcul == "Constant") {
                foreach ($dates as $dt) {

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                    Echeancier::create([
                        "CodeAgence" => $codeAgence,
                        "NumDossier" => $NumDossier,
                        "NumMensualite" => 0,
                        "NbreJour" => $lastRowData->NbreJour + 1,
                        "Capital" =>  $lastRowData->Capital - $capitalAmorti,
                        "Interet" =>  $interet,
                        "CapAmmorti" => $capitalAmorti,
                        "TotalAp" => $capitalAmorti + $interet,
                        "Cumul"  => $lastRowData->Capital - $capitalAmorti,
                        // "SoldeCapital" => $lastRowData->Capital - $capitalAmorti,
                        "DateTranch" =>  $dt,
                        // "DateDebut" => $request->DateTranche,
                        "InteretPrev" => $interet,
                        // "CumulCapital" => $lastRowData->Capital - $capitalAmorti,
                    ]);

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                }
            } else if ($ModeCalcul == "Degressif") {
                foreach ($dates as $dt) {
                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                    Echeancier::create([
                        "CodeAgence" => $codeAgence,
                        "NumDossier" => $NumDossier,
                        "NumMensualite" => 0,
                        "NbreJour" => $lastRowData->NbreJour + 1,
                        "Capital" =>  $lastRowData->Capital - $capitalAmorti,
                        "Interet" =>  $interet,
                        "CapAmmorti" => $capitalAmorti,
                        "TotalAp" => $capitalAmorti + $interet,
                        "Cumul"  => $lastRowData->Capital - $capitalAmorti,
                        // "SoldeCapital" => $lastRowData->Capital - $capitalAmorti,
                        "DateTranch" =>  $dt,
                        // "DateDebut" => $request->DateTranche,
                        "InteretPrev" => $interet,
                        // "CumulCapital" => $lastRowData->Capital - $capitalAmorti,
                    ]);
                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                }
            }
        } else if ($getTypeCredit->type_credit == "CREDIT INUKA FC" or $getTypeCredit->type_credit == "CREDIT INUKA USD") {
            Echeancier::create([
                "CodeAgence" => $codeAgence,
                "NumDossier" => $NumDossier,
                "NumMensualite"  => 0,
                "NbreJour" => 0,
                "Capital" => $MontantAccorde,
                "Interet" => 0,
                "Cumul"  => $MontantAccorde,
                "DateTranch" => $DateOctroi,
            ]);


            // $dateOctroie = $DateOctroi;
            // $dates = array($DateTombeEcheance);
            // for ($i = 1; $i < $data->NbrTranche; $i++) {
            //     $NewDate = date('Y-m-d', strtotime("+" . $i . "week", strtotime("$dateOctroie")));
            //     $dates[] = $NewDate;
            // }
            $dates = [];

            for ($i = 0; $i < $data->NbrTranche; $i++) {

                $NewDate = date(
                    'Y-m-d',
                    strtotime("+$i week", strtotime($DateTombeEcheance))
                );

                $dates[] = $NewDate;
            }
            if ($ModeCalcul == "Constant") {
                foreach ($dates as $dt) {
                    $capital = $MontantAccorde;
                    $interet = $TauxInteret;
                    $interetApayer = $MontantAccorde * $TauxInteret / 100;
                    $capitalAmorti = $capital / $data->NbrTranche;
                    // $epargneObligatoire = ($capitalAmorti * 5) / 100;
                    // $totalAp = $interetApayer + $capitalAmorti +  $epargneObligatoire;
                    $totalAp = $interetApayer + $capitalAmorti;
                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                    Echeancier::create([
                        "CodeAgence" => $codeAgence,
                        "NumDossier" => $NumDossier,
                        "NumMensualite" => 0,
                        "NbreJour" => $lastRowData->NbreJour + 1,
                        "Capital" =>  $lastRowData->Capital - $capitalAmorti,
                        "Interet" =>  $interetApayer,
                        "CapAmmorti" => $capitalAmorti,
                        "TotalAp" => $totalAp,
                        "Cumul"  => $lastRowData->Capital - $capitalAmorti,
                        // "SoldeCapital" => $lastRowData->Capital - $capitalAmorti,
                        "DateTranch" =>  $dt,
                        "DateDebut" => $DateTranche,
                        "InteretPrev" => $interetApayer,
                        // "Epargne" => $epargneObligatoire
                        // "CumulCapital" => $lastRowData->Capital - $capitalAmorti,
                    ]);

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                }
            } else if ($ModeCalcul == "Degressif") {
                foreach ($dates as $dt) {
                    $capital = $MontantAccorde;
                    $interet = $TauxInteret;

                    $capitalAmorti = $capital / $data->NbrTranche;
                    $epargneObligatoire = ($capitalAmorti * 5) / 100;

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                    $interetApayer = $lastRowData->Capital * $TauxInteret / 100;
                    $totalAp = $interetApayer + $capitalAmorti +  $epargneObligatoire;

                    Echeancier::create([
                        "CodeAgence" => $codeAgence,
                        "NumDossier" => $NumDossier,
                        "NumMensualite" => 0,
                        "NbreJour" => $lastRowData->NbreJour + 1,
                        "Capital" =>  $lastRowData->Capital - $capitalAmorti,
                        "Interet" =>  $interetApayer,
                        "CapAmmorti" => $capitalAmorti,
                        "TotalAp" => $totalAp,
                        "Cumul"  => $lastRowData->Capital - $capitalAmorti,
                        // "SoldeCapital" => $lastRowData->Capital - $capitalAmorti,
                        "DateTranch" =>  $dt,
                        "DateDebut" => $DateTranche,
                        "InteretPrev" => $interetApayer,
                        "Epargne" => $epargneObligatoire
                        // "CumulCapital" => $lastRowData->Capital - $capitalAmorti,
                    ]);

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                }
            }
        } else if ($getTypeCredit->type_credit == "C. A LA CONSOMMATION FC" or  $getTypeCredit->type_credit == "C. PETIT COMMERCE FC" or $getTypeCredit->type_credit == "C. A LA CONSOMMATION USD" or  $getTypeCredit->type_credit == "C. PETIT COMMERCE USD") {

            Echeancier::create([
                "CodeAgence" => $codeAgence,
                "NumDossier" => $NumDossier,
                "NumMensualite"  => 0,
                "NbreJour" => 0,
                "Capital" => $MontantAccorde,
                "Interet" => 0,
                "Cumul"  => $MontantAccorde,
                "DateTranch" => $DateOctroi,
            ]);

            // $dateOctroie = $DateOctroi;
            // $dates = array($DateTombeEcheance);
            // $NbrTranche = $data->NbrTranche + 1;
            // for ($i = 2; $i < $NbrTranche; $i++) {
            //     $NewDate = date('Y-m-d', strtotime("+" . $i . "month", strtotime("$dateOctroie")));
            //     $dates[] = $NewDate;
            // }
            $dates = [];
            for ($i = 0; $i < $data->NbrTranche; $i++) {

                $NewDate = date(
                    'Y-m-d',
                    strtotime("+$i month", strtotime($DateTombeEcheance))
                );

                $dates[] = $NewDate;
            }
            if ($ModeCalcul == "Constant") {
                foreach ($dates as $dt) {
                    $capital = $MontantAccorde;
                    $interet = $data->TauxInteret;
                    $interetApayer = $MontantAccorde * $data->TauxInteret / 100;
                    $capitalAmorti = $capital / $data->NbrTranche;
                    $totalAp = $interetApayer + $capitalAmorti;
                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                    Echeancier::create([
                        "CodeAgence" => $codeAgence,
                        "NumDossier" => $NumDossier,
                        "NumMensualite" => 0,
                        "NbreJour" => $lastRowData->NbreJour + 1,
                        "Capital" =>  $lastRowData->Capital - $capitalAmorti,
                        "Interet" =>  $interetApayer,
                        "CapAmmorti" => $capitalAmorti,
                        "TotalAp" => $totalAp,
                        "Cumul"  => $lastRowData->Capital - $capitalAmorti,
                        // "SoldeCapital" => $lastRowData->Capital - $capitalAmorti,
                        "DateTranch" =>  $dt,
                        "DateDebut" => $DateTranche,
                        "InteretPrev" => $interetApayer,
                        // "CumulCapital" => $lastRowData->Capital - $capitalAmorti,
                    ]);

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                }
            } else if ($ModeCalcul == "Degressif") {
                foreach ($dates as $dt) {
                    $capital = $MontantAccorde;
                    $interet = $data->TauxInteret;
                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                    $interetApayer = $lastRowData->Capital * $data->TauxInteret / 100;
                    $capitalAmorti = $capital / $data->NbrTranche;
                    $totalAp = $interetApayer + $capitalAmorti;
                    Echeancier::create([
                        "CodeAgence" => $codeAgence,
                        "NumDossier" => $NumDossier,
                        "NumMensualite" => 0,
                        "NbreJour" => $lastRowData->NbreJour + 1,
                        "Capital" =>  $lastRowData->Capital - $capitalAmorti,
                        "Interet" =>  $interetApayer,
                        "CapAmmorti" => $capitalAmorti,
                        "TotalAp" => $totalAp,
                        "Cumul"  => $lastRowData->Capital - $capitalAmorti,
                        // "SoldeCapital" => $lastRowData->Capital - $capitalAmorti,
                        "DateTranch" =>  $dt,
                        "DateDebut" => $DateTranche,
                        "InteretPrev" => $interetApayer,
                        // "CumulCapital" => $lastRowData->Capital - $capitalAmorti,
                    ]);

                    $lastRowData  = Echeancier::orderBy('ReferenceEch', 'desc')->first();
                }
            }
        }
    }

    //PERMET D'ACCORDER UN CREDIT 

    public function AccordCredit(Request $request)
    {
        if (isset($request->NumDossier)) {
            //VERIFIE SI L'ECHEANCIER DU CREDIT A ETE BIEN GENERE
            $checkEcheancierExist = Echeancier::where("NumDossier", $request->NumDossier)->first();
            if ($checkEcheancierExist) {
                //VERIFIE SI LE CREDIT N PAS ENCORE ACCORDE
                $checkNotGiven = Portefeuille::where("portefeuilles.NumDossier", "=", $request->NumDossier)->where("portefeuilles.Accorde", "=", 0)->first();
                if ($checkNotGiven) {
                    $getDossier = Portefeuille::where("portefeuilles.NumDossier", "=", $request->NumDossier)->where("portefeuilles.Accorde", "=", 0)->join("type_credits", "type_credits.id", "=", "portefeuilles.RefTypeCredit")->first();
                    $NumCompteEpargne = $getDossier->NumCompteEpargne;
                    $CompteInteret = $getDossier->compte_interet;
                    $compteEpargneCaution = $getDossier->NumCompteEpargneGarantie;
                    //dd($compteEpargneCaution);
                    $NumCompteCredit = $getDossier->NumCompteCredit;
                    $getTauxEpargneObligatoire = EpargneAdhesionModel::first();
                    $tauxEpargneObligatoire = $getTauxEpargneObligatoire ? $getTauxEpargneObligatoire->epargneObligatoire : 0;
                    if ($tauxEpargneObligatoire > 0) {

                        //VERIFIE SI LE COMPTE N PAS ENCORE CREE
                        $checkCompteEpargne = Comptes::where("NumCompte", $compteEpargneCaution)->first();
                        if (!$checkCompteEpargne) {
                            //ON CREE SON COMPTE EPARGNE GARANTIE 
                            Comptes::create([
                                'CodeAgence' => $getDossier->CodeAgence,
                                'NumCompte' => $compteEpargneCaution,
                                'NomCompte' => $getDossier->NomCompte,
                                'RefTypeCompte' => "3",
                                'RefCadre' => "33",
                                'RefGroupe' => "334",
                                'RefSousGroupe' => "3340",
                                'CodeMonnaie' => $getDossier->CodeMonnaie == "CDF" ? 2 : 1,
                                'NumAdherant' => $getDossier->numAdherant,
                                'nature_compte' => "PASSIF",
                                'niveau' => "5",
                                'est_classe' => 0,
                                'compte_parent' => "3340",
                            ]);
                        }
                        $checkCompteCredit = Comptes::where("NumCompte", $NumCompteCredit)->first();
                        if (!$checkCompteCredit) {
                            //ON CREE SON COMPTE CREDIT
                            Comptes::create([
                                'CodeAgence' => $getDossier->CodeAgence,
                                'NumCompte' => $NumCompteCredit,
                                'NomCompte' => $getDossier->NomCompte,
                                'RefTypeCompte' => "3",
                                'RefCadre' => "32",
                                'RefGroupe' => $getDossier->CodeMonnaie == "CDF" ? "321" : "320",
                                'RefSousGroupe' => $getDossier->CodeMonnaie == "CDF" ? "3210" : "3210",
                                'CodeMonnaie' => $getDossier->CodeMonnaie == "CDF" ? 2 : 1,
                                'NumAdherant' => $getDossier->numAdherant,
                                'nature_compte' => "ACTIF",
                                'niveau' => "5",
                                'est_classe' => 0,
                                'compte_parent' => "3200",
                            ]);
                        }

                        //RECUPERE LE SOLDE SI C'EST UN CREDIT EN CDF
                        //RECUPERE LES NUMERO DE COMPTE
                        // $compteEpargneGarantieCDF = "3340000000202";
                        // $compteEpargneGarantieUSD = "3340000000201";
                        if ($getDossier->CodeMonnaie == "CDF") {

                            $soldeMembreCDF = Transactions::select(
                                DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeCDF"),
                            )->where("NumCompte", '=', $NumCompteEpargne)
                                ->groupBy("NumCompte")
                                ->first();
                            $montantAccorde = $getDossier->MontantAccorde;
                            $garantieCredit = ($montantAccorde * $tauxEpargneObligatoire) / 100;

                            if ($soldeMembreCDF->soldeCDF >= $garantieCredit) {
                                //ON RECUPERE LE 30% SUR LE COMPTE DE LA PERSONNE CONCERNEE POUR L'EPARGNE GARANTIE
                                //CREE UN NUMERO DE TRANSACTION
                                CompteurTransaction::create([
                                    'fakevalue' => "0000",
                                ]);
                                $numOperation = [];
                                $numOperation = CompteurTransaction::latest()->first();
                                $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "R00" . $numOperation->id;
                                $dataSystem = TauxEtDateSystem::latest()->first();
                                $tauxDuJour = $dataSystem->TauxEnFc;
                                $dateSaisie = date("Y-m-d");
                                $dataSystem = $dataSystem->DateSystem;
                                //DEBITE LE COMPTE DU MEMBRE
                                Transactions::create([
                                    "NumTransaction" => $NumTransaction,
                                      "RefJournal" => JournalType::CREDIT,
                                    // "DateTransaction" => $getDossier->DateOctroi,
                                    "DateTransaction" => $dataSystem,
                                    "DateSaisie" => $dateSaisie,
                                    "TypeTransaction" => "D",
                                    "CodeMonnaie" => 2,
                                    "CodeAgence" => $getDossier->CodeAgence,
                                    "NumDossier" => "DOS00" . $numOperation->id,
                                    "NumDemande" => "V00" . $numOperation->id,
                                    "NumCompte" => $NumCompteEpargne,
                                    "NumComptecp" => $compteEpargneCaution,
                                    "Debit"  => $garantieCredit,
                                    "Debitusd"  => $garantieCredit / $tauxDuJour,
                                    "Debitfc" => $garantieCredit,
                                    "NomUtilisateur" => Auth::user()->name,
                                    "Libelle" => "PRISE DE L'EPARGNE GARANTIE DE VOTRE CREDIT CREDIT ACCORDE EN DATE DU " . $dateSaisie,
                                ]);

                                //PUIS ON CREDITE LE COMPTE EPARGNE GARANTIE DE CE MONTANT POUR LA COMPBALITE
                                // Transactions::create([
                                //     "NumTransaction" => $NumTransaction,
                                //     "DateTransaction" => $getDossier->DateOctroi,
                                //     "DateSaisie" => $dateSaisie,
                                //     "TypeTransaction" => "C",
                                //     "CodeMonnaie" => 2,
                                //     "CodeAgence" => $getDossier->CodeAgence,
                                //     "NumDossier" => "DOS00" . $numOperation->id,
                                //     "NumDemande" => "V00" . $numOperation->id,
                                //     "NumCompte" => $compteEpargneGarantieCDF,
                                //     "NumComptecp" => $NumCompteEpargne,
                                //     "Credit"  => $garantieCredit,
                                //     "Creditusd"  => $garantieCredit / $tauxDuJour,
                                //     "Creditfc" => $garantieCredit,
                                //     "NomUtilisateur" => Auth::user()->name,
                                //     "Libelle" => "MISE EN PLACE  DE  L'EPARGNE GARANTIE DU CREDIT OCRTROYE A " . $getDossier->NomCompte . " NUMERO DE COMPTE " . $NumCompteEpargne,
                                // ]);
                                //PUIS ON CREDITE LE COMPTE EPARGNE GARANTIE DE CE MONTANT POUR LE CLIENT
                                Transactions::create([
                                    "NumTransaction" => $NumTransaction,
                                    "RefJournal" => JournalType::CREDIT,
                                    "DateTransaction" => $dataSystem,
                                    "DateSaisie" => $dateSaisie,
                                    "TypeTransaction" => "C",
                                    "CodeMonnaie" => 2,
                                    "CodeAgence" => $getDossier->CodeAgence,
                                    "NumDossier" => "DOS00" . $numOperation->id,
                                    "NumDemande" => "V00" . $numOperation->id,
                                    "NumCompte" => $compteEpargneCaution,
                                    "NumComptecp" => $NumCompteEpargne,
                                    "Credit"  => $garantieCredit,
                                    "Creditusd"  => $garantieCredit / $tauxDuJour,
                                    "Creditfc" => $garantieCredit,
                                    "NomUtilisateur" => Auth::user()->name,
                                    "Libelle" => "MISE EN PLACE  DE  L'EPARGNE GARANTIE DU CREDIT OCRTROYE A " . $getDossier->NomCompte . " NUMERO DE COMPTE " . $NumCompteEpargne,
                                ]);

                                //ENREGISTRE CA DANS UNE TABLE SPECIFIQUE

                                LockedGarantie::create([
                                    "NumCompte" => $NumCompteEpargne,
                                    "EpargneGarantie" => $compteEpargneCaution,
                                    "NumAbrege" => $getDossier->numAdherant,
                                    "Montant" => $garantieCredit,
                                    "Devise" => "CDF",
                                ]);

                                //MET A JOUR LA TABLE POURTE FEUILLE 
                                Portefeuille::where("NumDossier", $request->NumDossier)->update([
                                    "Accorde" => 1
                                ]);


                                //PERMET DE METTRE A JOUR LA TABLE PORTE FEUILLE POUR RENSEIGNE LA SOMME DES INTERET ET CAPITAL
                                //GET SUM
                                $soldeInteret = Echeancier::select(
                                    DB::raw("SUM(Interet) as sommeInteret"),
                                )->where("NumDossier", '=', $request->NumDossier)
                                    ->groupBy("NumDossier")
                                    ->first();

                                //UPADATE TABLE
                                Portefeuille::where("NumDossier", $request->NumDossier)->update([
                                    "CompteInteret" => $CompteInteret,
                                    "InteretDu" => $soldeInteret->sommeInteret
                                ]);

                                return response()->json([
                                    'status' => 1,
                                    'msg' => "Crédit bien accordé"
                                ]);
                            } else {
                                return response()->json([
                                    'status' => 0,
                                    'msg' => "Le solde pour constituer l'Epargne garantie de ce crédit est insiffusant"
                                ]);
                            }
                        } else if ($getDossier->CodeMonnaie == "USD") {

                            $soldeMembreUSD = Transactions::select(
                                DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeUSD"),
                            )->where("NumCompte", '=', $NumCompteEpargne)
                                ->groupBy("NumCompte")
                                ->first();
                            $montantAccorde = $getDossier->MontantAccorde;
                            $garantieCredit = ($montantAccorde * $tauxEpargneObligatoire) / 100;
                            if ($soldeMembreUSD->soldeUSD >= $garantieCredit) {
                                //ON RECUPERE LE 30% SUR LE COMPTE DE LA PERSONNE CONCERNEE POUR L'EPARGNE GARANTIE
                                //CREE UN NUMERO DE TRANSACTION
                                CompteurTransaction::create([
                                    'fakevalue' => "0000",
                                ]);
                                $numOperation = [];
                                $numOperation = CompteurTransaction::latest()->first();
                                $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "R00" . $numOperation->id;
                                $dataSystem = TauxEtDateSystem::latest()->first();
                                $tauxDuJour = $dataSystem->TauxEnFc;
                                $dateSaisie = date("Y-m-d");
                                //DEBITE LE COMPTE DU MEMBRE
                                Transactions::create([
                                    "NumTransaction" => $NumTransaction,
                                    "RefJournal" => JournalType::CREDIT,
                                    "DateTransaction" => $getDossier->DateOctroi,
                                    "DateSaisie" => $dateSaisie,
                                    "TypeTransaction" => "D",
                                    "CodeMonnaie" => 1,
                                    "CodeAgence" => $getDossier->CodeAgence,
                                    "NumDossier" => "DOS00" . $numOperation->id,
                                    "NumDemande" => "V00" . $numOperation->id,
                                    "NumCompte" => $NumCompteEpargne,
                                    "NumComptecp" =>  $compteEpargneCaution,
                                    "Debit"  => $garantieCredit,
                                    "Debitusd"  => $garantieCredit,
                                    "Debitfc" => $garantieCredit * $tauxDuJour,
                                    "NomUtilisateur" => Auth::user()->name,
                                    "Libelle" => "PRISE DE L'EPARGNE GARANTIE DE VOTRE CREDIT CREDIT ACCORDE EN DATE DU " . $dateSaisie,
                                ]);

                                //PUIS ON CREDITE LE COMPTE EPARGNE GARANTIE DE CE MONTANT POUR LA COMPBALITE
                                // Transactions::create([
                                //     "NumTransaction" => $NumTransaction,
                                //     "DateTransaction" => $getDossier->DateOctroi,
                                //     "DateSaisie" => $dateSaisie,
                                //     "TypeTransaction" => "C",
                                //     "CodeMonnaie" => 1,
                                //     "CodeAgence" => $getDossier->CodeAgence,
                                //     "NumDossier" => "DOS00" . $numOperation->id,
                                //     "NumDemande" => "V00" . $numOperation->id,
                                //     "NumCompte" => $compteEpargneGarantieUSD,
                                //     "NumComptecp" => $NumCompteEpargne,
                                //     "Credit"  => $garantieCredit,
                                //     "Creditusd"  => $garantieCredit,
                                //     "Creditfc" => $garantieCredit * $tauxDuJour,
                                //     "NomUtilisateur" => Auth::user()->name,
                                //     "Libelle" => "MISE EN PLACE  DE  L'EPARGNE GARANTIE DU CREDIT OCRTROYE A " . $getDossier->NomCompte . " NUMERO DE COMPTE " . $NumCompteEpargne,
                                // ]);

                                //PUIS ON CREDITE LE COMPTE EPARGNE GARANTIE DE CE MONTANT POUR LE CLIENT
                                Transactions::create([
                                    "NumTransaction" => $NumTransaction,
                                    "RefJournal" => JournalType::CREDIT,
                                    "DateTransaction" => $getDossier->DateOctroi,
                                    "DateSaisie" => $dateSaisie,
                                    "TypeTransaction" => "C",
                                    "CodeMonnaie" => 1,
                                    "CodeAgence" => $getDossier->CodeAgence,
                                    "NumDossier" => "DOS00" . $numOperation->id,
                                    "NumDemande" => "V00" . $numOperation->id,
                                    "NumCompte" => $compteEpargneCaution,
                                    "NumComptecp" => $NumCompteEpargne,
                                    "Credit"  => $garantieCredit,
                                    "Creditusd"  => $garantieCredit,
                                    "Creditfc" => $garantieCredit * $tauxDuJour,
                                    "NomUtilisateur" => Auth::user()->name,
                                    "Libelle" => "MISE EN PLACE  DE  L'EPARGNE GARANTIE DU CREDIT OCRTROYE A " . $getDossier->NomCompte . " NUMERO DE COMPTE " . $NumCompteEpargne,
                                ]);



                                //ENREGISTRE CA DANS UNE TABLE SPECIFIQUE

                                LockedGarantie::create([
                                    "NumCompte" => $NumCompteEpargne,
                                    "EpargneGarantie" => $compteEpargneCaution,
                                    "NumAbrege" => $getDossier->numAdherant,
                                    "Montant" => $garantieCredit,
                                    "Devise" => "USD",
                                ]);
                                //MET A JOUR LA TABLE POURTE FEUILLE 
                                Portefeuille::where("NumDossier", $request->NumDossier)->update([
                                    "Accorde" => 1
                                ]);

                                //PERMET DE METTRE A JOUR LA TABLE PORTE FEUILLE POUR RENSEIGNE LA SOMME DES INTERET ET CAPITAL
                                //GET SUM
                                $soldeInteret = Echeancier::select(
                                    DB::raw("SUM(Interet) as sommeInteret"),
                                )->where("NumDossier", '=', $request->NumDossier)
                                    ->groupBy("NumDossier")
                                    ->first();

                                //UPADATE TABLE
                                Portefeuille::where("NumDossier", $request->NumDossier)->update([
                                    "CompteInteret" => $CompteInteret,
                                    "InteretDu" => $soldeInteret->sommeInteret
                                ]);

                                return response()->json([
                                    'status' => 1,
                                    'msg' => "Crédit bien accordé"
                                ]);
                            } else {
                                return response()->json([
                                    'status' => 0,
                                    'msg' => "Le solde pour constituer l'Epargne garantie de ce crédit est insiffusant"
                                ]);
                            }
                        }
                    } else {
                        //MET A JOUR LA TABLE POURTE FEUILLE 
                        Portefeuille::where("NumDossier", $request->NumDossier)->update([
                            "Accorde" => 1
                        ]);
                        //PERMET DE METTRE A JOUR LA TABLE PORTE FEUILLE POUR RENSEIGNE LA SOMME DES INTERET ET CAPITAL
                        //GET SUM
                        $soldeInteret = Echeancier::select(
                            DB::raw("SUM(Interet) as sommeInteret"),
                        )->where("NumDossier", '=', $request->NumDossier)
                            ->groupBy("NumDossier")
                            ->first();

                        //UPADATE TABLE
                        Portefeuille::where("NumDossier", $request->NumDossier)->update([
                            "CompteInteret" => $CompteInteret,
                            "InteretDu" => $soldeInteret->sommeInteret
                        ]);

                        return response()->json([
                            'status' => 1,
                            'msg' => "Crédit bien accordé"
                        ]);
                    }
                } else {
                    return response()->json([
                        'status' => 0,
                        'msg' => "Ce crédit a déjà été accordé"
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 0,
                    'msg' => "Vous devez d'abord generé l'écheancier de ce crédit avant de l'accorder"
                ]);
            }
        } else {
            return response()->json([
                'status' => 0,
                'msg' => "Aucun crédit trouvé"
            ]);
        }
    }

    //PERMET DE CLOTURER UN CREDIT 
    public function ClotureCredit(Request $request)
    {

        if (isset($request->NumDossier)) {

            //REMET L'EPARGNE GARANTIE A LA PERSONNE
            // $compteEpargneGarantieCDF = "3340000000202";
            // $compteEpargneGarantieUSD = "3340000000201";
            //CREE UN NUMERO DE TRANSACTION
            CompteurTransaction::create([
                'fakevalue' => "0000",
            ]);
            $numOperation = [];
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "R00" . $numOperation->id;
            $dataSystem = TauxEtDateSystem::latest()->first();
            $tauxDuJour = $dataSystem->TauxEnFc;
            $dateSystem = $dataSystem->DateSystem;
            $dateSaisie = date("Y-m-d");
            $getNumCompte = Portefeuille::where("NumDossier", "=", $request->NumDossier)->where("Cloture", "=", 0)->first();
            $NumCompte = $getNumCompte->NumCompteEpargne;
            // Appel à la méthode de reprise de provision et reclassement
            $clotureTask = new ClotureJourneeCopy($request);
            $clotureTask->annulerProvisionEtReclasser($request->NumDossier);
            if ($getNumCompte->CodeMonnaie == "CDF") {
                //RECUPERE LE MONTANT DANS LA TABLE CONCERNE
                $getData = LockedGarantie::where("NumCompte", "=", $NumCompte)->where("paidState", "=", 0)->first();
                if ($getData) {
                    //DEBITE LE COMPTE EPARGNE GARANTIE 
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                         "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "Taux" => 1,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $getNumCompte->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $getData->EpargneGarantie,
                        "NumComptecp" => $NumCompte,
                        "Debit"  => $getData->Montant,
                        "Debitusd"  => $getData->Montant / $tauxDuJour,
                        "Debitfc" => $getData->Montant,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "RESTITUTION DE  L'EPARGNE GARANTIE DU CREDIT OCRTROYE A " . $getNumCompte->NomCompte . " NUMERO DE COMPTE " . $NumCompte,
                    ]);

                    //CREDITE LE COMPTE DU MEMBRE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                         "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "Taux" => 1,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $getNumCompte->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $NumCompte,
                        "NumComptecp" => $getData->EpargneGarantie,
                        "Credit"  => $getData->Montant,
                        "Creditusd"  => $getData->Montant / $tauxDuJour,
                        "Creditfc" => $getData->Montant,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "RESTITUTION DE VOTRE EPARGNE GARANTIE",
                    ]);
                    LockedGarantie::where("NumCompte", $NumCompte)->where("paidState", "=", 0)->update([
                        "paidState" => 1
                    ]);

                    Portefeuille::where("NumDossier", "=", $request->NumDossier)->update([
                        "Cloture" => 1,
                        "CloturePar" => Auth::user()->name,
                    ]);
                }
            } else if ($getNumCompte->CodeMonnaie == "USD") {
                //RECUPERE LE MONTANT DANS LA TABLE CONCERNE
                $getData = LockedGarantie::where("NumCompte", "=", $NumCompte)->where("paidState", "=", 0)->first();
                if ($getData) {
                    //DEBITE LE COMPTE EPARGNE GARANTIE 
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                         "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "Taux" => 1,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $getNumCompte->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $getData->EpargneGarantie,
                        "NumComptecp" => $NumCompte,
                        "Debit"  => $getData->Montant,
                        "Debitusd"  => $getData->Montant,
                        "Debitfc" => $getData->Montant * $tauxDuJour,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "RESTITUTION DE  L'EPARGNE GARANTIE DU CREDIT OCRTROYE A " . $getNumCompte->NomCompte . " NUMERO DE COMPTE " . $NumCompte,
                    ]);

                    //CREDITE LE COMPTE DU MEMBRE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                         "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "Taux" => 1,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $getNumCompte->CodeAgence,
                        "NumDossier" => "DOS00" . $numOperation->id,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $NumCompte,
                        "NumComptecp" => $getData->EpargneGarantie,
                        "Credit"  => $getData->Montant,
                        "Creditusd"  => $getData->Montant,
                        "Creditfc" => $getData->Montant * $tauxDuJour,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "RESTITUTION DE VOTRE EPARGNE GARANTIE",
                    ]);

                    LockedGarantie::where("NumCompte", $NumCompte)->where("paidState", "=", 0)->update([
                        "paidState" => 1
                    ]);
                }
                Portefeuille::where("NumDossier", "=", $request->NumDossier)->update([
                    "Cloture" => 1,
                    "CloturePar" => Auth::user()->name,
                ]);
            }



            return response()->json(["status" => 1, "msg" => "Ce crédit a bien été Clôturé merci."]);
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun numéro de compte renseigné."]);
        }
    }

    //PERMET DE DECAISSER LE CREDIT

    public function DecaissementCredit(Request $request)
    {
        if (isset($request->NumDossier)) {
            $currentAgence = session('current_agence');
            $codeAgence = $currentAgence['code_agence'] ?? null;
            $creditExist = Portefeuille::where("NumDossier", "=", $request->NumDossier)->where("CodeAgence", $codeAgence)->first();

            if ($creditExist->Accorde == 1) {
                Portefeuille::where("NumDossier", "=", $request->NumDossier)->update([
                    "Octroye" => 1,
                    "OctroyePar" => Auth::user()->name,
                ]);
                //VERIE SI LE CREDIT NE PAS ENCORE DEBOURSER
                if ($creditExist->Octroye == 1) {
                    return response()->json(["status" => 0, "msg" => "Ce crédit a déjà été Décaissé."]);
                }
                //ENREGISTRE TOUT D'ABORD LE COMPTE CREDIT DU BENEFICIAIRE S'IL n'EXISTE PAS
                $dataCredit = Portefeuille::where("NumDossier", "=", $request->NumDossier)->first();
                //RECUPERE LA DATE DU SYSTEME
                $dataSystem = TauxEtDateSystem::latest()->first();
                $tauxDuJour = $dataSystem->TauxEnFc;
                $dateSystem = $dataSystem->DateSystem;
                $dateSaisie = date("Y-m-d");
                if ($dataCredit->CodeMonnaie == "CDF") {
                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "R00" . $numOperation->id;
                    //DEBITE LE COMPTE CREDIT
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => $request->NumDossier,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompteCredit,
                        "NumComptecp" => $dataCredit->NumCompteEpargne,
                        "Debit" => $dataCredit->MontantAccorde,
                        "Operant" =>  $dataCredit->Gestionnaire,
                        "Debitusd" => $dataCredit->MontantAccorde / $tauxDuJour,
                        "Debitfc" => $dataCredit->MontantAccorde,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "Crédit à court terme octroyé à " . $dataCredit->NomCompte . " en date du " . $creditExist->DateOctroi . " Numéro dossier " . $dataCredit->NumDossier,
                        "refCompteMembre" => $dataCredit->numAdherant,
                    ]);
                    //PUIS ON DEBITE LE COMPTE CREDIT DU MEMBRE

                    // Transactions::create([
                    //     "NumTransaction" => $NumTransaction,
                    //     "DateTransaction" => $dateSystem,
                    //     "DateSaisie" => $dateSaisie,
                    //     "TypeTransaction" => "D",
                    //     "CodeMonnaie" => 2,
                    //     "CodeAgence" => "20",
                    //     "NumDossier" => "DOS00" . $numOperation->id,
                    //     "NumDemande" => "V00" . $numOperation->id,
                    //     "NumCompte" => $dataCredit->NumCompteCredit,
                    //     "NumComptecp" =>  $dataCredit->NumCompteEpargne,
                    //     "Debit" => $dataCredit->MontantAccorde,
                    //     "Operant" =>  $dataCredit->Gestionnaire,
                    //     "Debitusd" => $dataCredit->MontantAccorde / $tauxDuJour,
                    //     "Debitfc" => $dataCredit->MontantAccorde,
                    //     "NomUtilisateur" => Auth::user()->name,
                    //     "Libelle" => "Crédit à court terme octroyé à " . $dataCredit->NomCompte . " en date du " . $dateSystem . " Numéro dossier " . $dataCredit->NumDossier,
                    //     "refCompteMembre" => $dataCredit->NumCompteCredit,
                    // ]);

                    //APRES CETTE OPERATION ON CREDITE SON COMPTE EPARGNE


                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" =>  $dateSystem,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 2,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => $request->NumDossier,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompteEpargne,
                        "NumComptecp" =>  $dataCredit->NumCompteCredit,
                        "Credit" => $dataCredit->MontantAccorde,
                        "Operant" =>  $dataCredit->Gestionnaire,
                        "Creditusd" => $dataCredit->MontantAccorde / $tauxDuJour,
                        "Creditfc" => $dataCredit->MontantAccorde,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "Votre crédit à court terme octroyé en date du " . $creditExist->DateOctroi . " Numéro dossier " . $dataCredit->NumDossier,
                        "refCompteMembre" => $dataCredit->numAdherant,
                    ]);
                } else if ($dataCredit->CodeMonnaie == "USD") {

                    // $numCompteCreditUSD = 3270000000201;


                    CompteurTransaction::create([
                        'fakevalue' => "0000",
                    ]);
                    $numOperation = [];
                    $numOperation = CompteurTransaction::latest()->first();
                    $NumTransaction = Auth::user()->name[0] . Auth::user()->name[1] . "R00" . $numOperation->id;

                    // $compteCreditAuxMembreUSD = "3210000000201";
                    //DEBITE LE COMPTE CREDIT USD
                    // Transactions::create([
                    //     "NumTransaction" => $NumTransaction,
                    //     "DateTransaction" => $dateSystem,
                    //     "DateSaisie" => $dateSaisie,
                    //     "TypeTransaction" => "D",
                    //     "CodeMonnaie" => 1,
                    //     "CodeAgence" => "20",
                    //     "NumDossier" => "DOS00" . $numOperation->id,
                    //     "NumDemande" => "V00" . $numOperation->id,
                    //     "NumCompte" => $compteCreditAuxMembreUSD,
                    //     "NumComptecp" => $dataCredit->NumCompteEpargne,
                    //     "Debit" => $dataCredit->MontantAccorde,
                    //     "Operant" =>  $dataCredit->Gestionnaire,
                    //     "Debitusd" => $dataCredit->MontantAccorde,
                    //     "Debitfc" => $dataCredit->MontantAccorde * $tauxDuJour,
                    //     "NomUtilisateur" => Auth::user()->name,
                    //     "Libelle" => "Crédit à court terme octroyé à " . $dataCredit->NomCompte . " en date du " . $dateSystem . " Numéro dossier " . $dataCredit->NumDossier,
                    //     "refCompteMembre" => $compteCreditAuxMembreUSD,
                    // ]);
                    // DEBITE LE COMPTE CREDIT DU MEMBRE
                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "TypeTransaction" => "D",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => $request->NumDossier,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompteCredit,
                        "NumComptecp" =>  $dataCredit->NumCompteEpargne,
                        "Debit" => $dataCredit->MontantAccorde,
                        "Operant" =>  $dataCredit->Gestionnaire,
                        "Debitusd" => $dataCredit->MontantAccorde,
                        "Debitfc" => $dataCredit->MontantAccorde * $tauxDuJour,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "Crédit à court terme octroyé à " . $dataCredit->NomCompte . " en date du " . $creditExist->DateOctroi . " Numéro dossier " . $dataCredit->NumDossier,
                        "refCompteMembre" => $dataCredit->numAdherant,
                    ]);

                    //APRES CETTE OPERATION ON CREDITE SON COMPTE EPARGNE


                    Transactions::create([
                        "NumTransaction" => $NumTransaction,
                        "RefJournal" => JournalType::CREDIT,
                        "DateTransaction" => $dateSystem,
                        "DateSaisie" => $dateSaisie,
                        "TypeTransaction" => "C",
                        "CodeMonnaie" => 1,
                        "CodeAgence" => $dataCredit->CodeAgence,
                        "NumDossier" => $request->NumDossier,
                        "NumDemande" => "V00" . $numOperation->id,
                        "NumCompte" => $dataCredit->NumCompteEpargne,
                        "NumComptecp" =>  $dataCredit->NumCompteCredit,
                        "Credit" => $dataCredit->MontantAccorde,
                        "Operant" =>  $dataCredit->Gestionnaire,
                        "Creditusd" => $dataCredit->MontantAccorde,
                        "Creditfc" => $dataCredit->MontantAccorde * $tauxDuJour,
                        "NomUtilisateur" => Auth::user()->name,
                        "Libelle" => "Votre crédit à court terme octroyé en date du " . $dateSystem . " Numéro dossier " . $dataCredit->NumDossier . " Compte crédit " . $dataCredit->NumCompteCredit,
                        "refCompteMembre" => $dataCredit->numAdherant,
                    ]);
                }
                //ENVOIE UNE NOTIFICATION
                $Libelle = "Votre crédit à court terme octroyé en date du " . $creditExist->DateOctroi;
                $this->sendNotification->sendNotificationOctroiCredit($dataCredit->numAdherant, $dataCredit->CodeMonnaie, $dataCredit->MontantAccorde, $Libelle);
                return response()->json(["status" => 1, "msg" => "Ce crédit a bien été décaissé merci."]);
            } else {
                return response()->json(["status" => 0, "msg" => "Le crédit ne pas encore accordé merci."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun numéro de dossier trouvé."]);
        }
    }





    //CES FONCTIONS PERMETTENT UN REMBOURSEMENT MANUEL EN CAPITAL ET INTERET
    public function rembourserCapital(Request $request)
    {
        try {
            $cloture = new ClotureJourneeCopy($request);
            $result = $cloture->remboursementManuelCapital(
                $request->montant,
                $request->numDossier,
                $request->anticipe ?? false
            );
            return response()->json(['status' => 1, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'msg' => $e->getMessage()]);
        }
    }

    public function rembourserInteret(Request $request)
    {
        try {
            $cloture = new ClotureJourneeCopy($request);
            $result = $cloture->remboursementManuelInteret(
                $request->montant,
                $request->numDossier,
                $request->anticipe ?? false
            );
            return response()->json(['status' => 1, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'msg' => $e->getMessage()]);
        }
    }



    public function rembourserAnticipe(Request $request)
    {
        try {
            $cloture = new ClotureJourneeCopy($request);
            $result = $cloture->remboursementAnticipe($request->numDossier);
            return response()->json(['status' => 1, 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'msg' => $e->getMessage()]);
        }
    }



    //  public function listeCreditsARadier(Request $request)
    // {
    //     $user = auth()->user();
    //     $agenceIds = $user->agences()->pluck('code_agence')->toArray();

    //     $gestionnaire = $request->get('gestionnaire');
    //     $devise = $request->get('devise');

    //     $query = DB::table('portefeuilles as p')
    //         ->join('echeanciers as e', 'p.NumDossier', '=', 'e.NumDossier')
    //         ->leftJoin('remboursementcredits as r', 'e.ReferenceEch', '=', 'r.RefEcheance')
    //         ->whereIn('p.CodeAgence', $agenceIds)
    //         ->where('p.Cloture', 0)
    //         ->where('p.Octroye', 1)
    //         ->where('p.Accorde', 1)
    //         ->when($gestionnaire, fn($q) => $q->where('p.Gestionnaire', $gestionnaire))
    //         ->when($devise, fn($q) => $q->where('p.CodeMonnaie', $devise))
    //         ->select(
    //             'p.NumDossier',
    //             'p.NomCompte',
    //             'p.MontantAccorde',
    //             'p.CodeAgence',
    //             'p.Gestionnaire',
    //             'p.CodeMonnaie',
    //             DB::raw('SUM(e.CapAmmorti) - SUM(COALESCE(r.CapitalPaye, 0)) as CapitalRestant'),
    //             DB::raw('
    //                 DATEDIFF(CURDATE(), (
    //                     SELECT MAX(e2.DateTranch)
    //                     FROM echeanciers e2
    //                     LEFT JOIN remboursementcredits r2 ON e2.ReferenceEch = r2.RefEcheance
    //                     WHERE e2.NumDossier = p.NumDossier
    //                       AND (e2.CapAmmorti - COALESCE(r2.CapitalPaye, 0)) > 0
    //                       AND e2.DateTranch < CURDATE()
    //                 )) as JoursRetard
    //             ')
    //         )
    //         ->groupBy('p.NumDossier', 'p.NomCompte', 'p.MontantAccorde', 'p.CodeAgence', 'p.Gestionnaire', 'p.CodeMonnaie')
    //         ->having('CapitalRestant', '>', 1) // seuil > 1 (éviter les centimes résiduels)
    //         ->having('JoursRetard', '>', 180)
    //         ->orderBy('JoursRetard', 'desc');

    //     $credits = $query->get();
    //     $totalMontant = $credits->sum('CapitalRestant');

    //     // Récupérer la liste des gestionnaires distincts pour le filtre
    //     $gestionnaires = DB::table('portefeuilles')
    //         ->whereIn('CodeAgence', $agenceIds)
    //         ->where('Octroye', 1)
    //         ->where('Accorde', 1)
    //         ->where('Cloture', 0)
    //         ->select('Gestionnaire')
    //         ->distinct()
    //         ->pluck('Gestionnaire');

    //     return response()->json([
    //         'status' => 1,
    //         'data' => $credits,
    //         'total' => [
    //             'count' => $credits->count(),
    //             'montant' => $totalMontant,
    //         ],
    //         'filters' => [
    //             'gestionnaires' => $gestionnaires,
    //         ]
    //     ]);
    // }


    public function listeCreditsARadier(Request $request)
    {
        $user = auth()->user();
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence active']);
        }

        $gestionnaire = $request->gestionnaire;
        $devise = $request->devise; // 'CDF' ou 'USD'

        $query = DB::table('portefeuilles as p')
            ->join('echeanciers as e', 'p.NumDossier', '=', 'e.NumDossier')
            ->leftJoin('remboursementcredits as r', 'e.ReferenceEch', '=', 'r.RefEcheance')
            ->where('p.CodeAgence', $codeAgence)
            ->where('p.Cloture', 0)
            ->where('p.Octroye', 1)
            ->where('p.Accorde', 1)
            ->where('p.Radie', 0)
            ->select(
                'p.NumDossier',
                'p.NomCompte',
                'p.MontantAccorde',
                'p.CodeAgence',
                'p.Gestionnaire',
                'p.CodeMonnaie',
                DB::raw('SUM(e.CapAmmorti) - SUM(COALESCE(r.CapitalPaye, 0)) as CapitalRestant'),
                DB::raw('
                DATEDIFF(CURDATE(), (
                    SELECT MAX(e2.DateTranch)
                    FROM echeanciers e2
                    LEFT JOIN remboursementcredits r2 ON e2.ReferenceEch = r2.RefEcheance
                    WHERE e2.NumDossier = p.NumDossier
                      AND (e2.CapAmmorti - COALESCE(r2.CapitalPaye, 0)) > 0
                      AND e2.DateTranch < CURDATE()
                )) as JoursRetard
            ')
            )
            ->groupBy('p.NumDossier', 'p.NomCompte', 'p.MontantAccorde', 'p.CodeAgence', 'p.Gestionnaire', 'p.CodeMonnaie')
            ->having('CapitalRestant', '>', 1) // seuil > 1
            ->having('JoursRetard', '>', 360);

        if ($gestionnaire) {
            $query->having('p.Gestionnaire', $gestionnaire);
        }
        if ($devise) {
            $query->having('p.CodeMonnaie', $devise);
        }

        $credits = $query->get();
        $totalMontant = $credits->sum('CapitalRestant');

        // Liste des gestionnaires pour le filtre
        $gestionnaires = DB::table('portefeuilles')
            ->where('CodeAgence', $codeAgence)
            ->select('Gestionnaire')
            ->distinct()
            ->pluck('Gestionnaire');

        return response()->json([
            'status' => 1,
            'data' => $credits,
            'total' => [
                'count' => $credits->count(),
                'montant' => $totalMontant,
            ],
            'gestionnaires' => $gestionnaires,
        ]);
    }



    /**
     * Crée un compte s'il n'existe pas
     */
    private function ensureCompteExiste($numCompte, $nomCompte, $nature, $codeAgence, $codeMonnaie)
    {
        if (!Comptes::where('NumCompte', $numCompte)->exists()) {
            $refCadre = substr($numCompte, 0, 2);
            $refGroupe = substr($numCompte, 0, 3);
            $refSousGroupe = substr($numCompte, 0, 4);
            Comptes::create([
                'CodeAgence'    => $codeAgence,
                'NumCompte'     => $numCompte,
                'NomCompte'     => $nomCompte,
                'nature_compte' => $nature,
                'niveau'        => 5,
                'est_classe'    => 0,
                'CodeMonnaie'   => $codeMonnaie,
                'RefCadre'      => $refCadre,
                'RefGroupe'     => $refGroupe,
                'RefSousGroupe' => $refSousGroupe,
                'RefTypeCompte' => substr($numCompte, 0, 1),
                'compte_parent' => $refSousGroupe,
            ]);
        }
    }

    /**
     * Génère le compte 67 (perte sur créances) pour une agence et une devise
     */
    private function getComptePerte($codeAgence, $codeMonnaie)
    {
        $suffixe = ($codeMonnaie == 1) ? '1' : '2';
        $codeAgencePad = str_pad($codeAgence, 2, '0', STR_PAD_LEFT);
        $numCompte = "6700000000" . $codeAgencePad . $suffixe;
        $nomCompte = "Pertes sur créances - Agence " . $codeAgence . ($codeMonnaie == 1 ? ' USD' : ' CDF');
        $this->ensureCompteExiste($numCompte, $nomCompte, 'CHARGE', $codeAgence, $codeMonnaie);
        return $numCompte;
    }

    private function getCompteHorsBilan($codeAgence, $codeMonnaie)
    {
        $suffixe = ($codeMonnaie == 1) ? '1' : '2';
        $codeAgencePad = str_pad($codeAgence, 2, '0', STR_PAD_LEFT);
        $numCompte = "9000000000" . $codeAgencePad . $suffixe;
        $nomCompte = "Créances radiées - Agence " . $codeAgence . ($codeMonnaie == 1 ? ' USD' : ' CDF');
        $this->ensureCompteExiste($numCompte, $nomCompte, 'HORS_BILAN', $codeAgence, $codeMonnaie);
        return $numCompte;
    }

    private function getCapitalRestant($numDossier)
    {
        $result = DB::selectOne("
            SELECT SUM(echeanciers.CapAmmorti) - SUM(COALESCE(remboursementcredits.CapitalPaye, 0)) as reste
            FROM echeanciers
            LEFT JOIN remboursementcredits ON echeanciers.ReferenceEch = remboursementcredits.RefEcheance
            WHERE echeanciers.NumDossier = ?
        ", [$numDossier]);
        return $result->reste ?? 0;
    }

    private function genererNumTransaction()
    {
        $id = DB::table('compteur_transactions')->insertGetId(['fakevalue' => '0000']);
        return 'RD' . str_pad($id, 8, '0', STR_PAD_LEFT);
    }

    public function radierCredits(Request $request)
    {
        $request->validate([
            'dossiers' => 'required|array',
            'dossiers.*' => 'string'
        ]);

        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(['status' => 0, 'msg' => 'Aucune agence active']);
        }

        $radies = 0;
        DB::beginTransaction();
        try {
            foreach ($request->dossiers as $numDossier) {
                $portefeuille = Portefeuille::where('NumDossier', $numDossier)
                    ->where('CodeAgence', $codeAgence)
                    ->first();

                if (!$portefeuille || $portefeuille->Cloture == 1 || $portefeuille->Radie == 1) continue;

                // Écriture comptable de radiation
                $this->ecrireRadiation($portefeuille);

                // Marquer comme radié
                $portefeuille->Radie = 1;
                $portefeuille->save();

                $radies++;
            }
            DB::commit();

            return response()->json([
                'status' => 1,
                'radies' => $radies,
                'msg' => "$radies crédit(s) radié(s) avec succès"
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Radiation échouée : " . $e->getMessage());
            return response()->json(['status' => 0, 'msg' => 'Erreur lors de la radiation']);
        }
    }







    private function ecrireRadiation($portefeuille)
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $codeAgence = $portefeuille->CodeAgence;
        $codeMonnaie = ($portefeuille->CodeMonnaie == 'USD') ? 1 : 2;
        $montant = $this->getCapitalRestant($portefeuille->NumDossier);
        if ($montant <= 0) return;

        // Récupérer le compte 39 (créance litigieuse)
        $jourRetard = JourRetard::where('NumDossier', $portefeuille->NumDossier)->first();
        $compte39 = $jourRetard ? $jourRetard->NumCompteCreanceLitigieuse : null;
        if (!$compte39) {
            $compte39 = $portefeuille->NumCompteEpargne; // fallback
        }

        $numTransaction = $this->genererNumTransaction();
        $comptePerte = $this->getComptePerte($codeAgence, $codeMonnaie);      // 67
        $compteHorsBilan = $this->getCompteHorsBilan($codeAgence, $codeMonnaie); // 90

        // 1. Constatation de la perte et annulation de la créance
        // Débit 67 (charge), Crédit 39 (actif)
        Transactions::create([
            'NumTransaction' => $numTransaction,
            "RefJournal" => JournalType::CREDIT,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'TypeTransaction' => 'D',
            'CodeMonnaie' => $codeMonnaie,
            'CodeAgence' => $codeAgence,
            'NumDossier' => $portefeuille->NumDossier,
            'NumCompte' => $comptePerte,
            'NumComptecp' => $compte39,
            'Debit' => $montant,
            'Debitfc' => $codeMonnaie == 2 ? $montant : $montant * $dataSystem->TauxEnFc,
            'Debitusd' => $codeMonnaie == 1 ? $montant : $montant / $dataSystem->TauxEnFc,
            'NomUtilisateur' => auth()->user()->name,
            'Libelle' => "Radiation du crédit dossier {$portefeuille->NumDossier} (perte)",
        ]);

        Transactions::create([
            'NumTransaction' => $numTransaction,
            "RefJournal" => JournalType::CREDIT,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'TypeTransaction' => 'C',
            'CodeMonnaie' => $codeMonnaie,
            'CodeAgence' => $codeAgence,
            'NumDossier' => $portefeuille->NumDossier,
            'NumCompte' => $compte39,
            'NumComptecp' => $comptePerte,
            'Credit' => $montant,
            'Creditfc' => $codeMonnaie == 2 ? $montant : $montant * $dataSystem->TauxEnFc,
            'Creditusd' => $codeMonnaie == 1 ? $montant : $montant / $dataSystem->TauxEnFc,
            'NomUtilisateur' => auth()->user()->name,
            'Libelle' => "Radiation du crédit dossier {$portefeuille->NumDossier} (annulation créance)",
        ]);

        // 2. Enregistrement hors bilan (crédit du compte 90)
        Transactions::create([
            'NumTransaction' => $numTransaction,
            "RefJournal" => JournalType::CREDIT,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'TypeTransaction' => 'C',
            'CodeMonnaie' => $codeMonnaie,
            'CodeAgence' => $codeAgence,
            'NumDossier' => $portefeuille->NumDossier,
            'NumCompte' => $compteHorsBilan,
            'Credit' => $montant,
            'Creditfc' => $codeMonnaie == 2 ? $montant : $montant * $dataSystem->TauxEnFc,
            'Creditusd' => $codeMonnaie == 1 ? $montant : $montant / $dataSystem->TauxEnFc,
            'NomUtilisateur' => auth()->user()->name,
            'Libelle' => "Radiation du crédit dossier {$portefeuille->NumDossier} (hors bilan)",
        ]);
    }



    public function getCreditsByMember(Request $request)
    {
        $credits = Portefeuille::where('numAdherant', $request->numAdherant)
            ->where('Cloture', 0)
            ->get(['NumDossier', 'MontantAccorde', 'CodeMonnaie', 'Accorde', 'Octroye']);
        return response()->json(['status' => 1, 'credits' => $credits]);
    }

    public function getCreditByDossier(Request $request)
    {
        $credit = Portefeuille::where('NumDossier', $request->numDossier)->first();
        return response()->json(['status' => 1, 'data' => $credit]);
    }
}
