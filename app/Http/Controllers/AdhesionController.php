<?php

namespace App\Http\Controllers;

use App\Models\Comptes;
use App\Models\Mandataires;
use Illuminate\Http\Request;
use App\Models\AdhesionMembre;
use App\Models\CompteurCompte;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AdhesionController extends Controller
{

    //
    public function __construct()
    {
        $this->middleware("auth");
    }

    public function getAdhesionHomePage()
    {
        return view("eco.pages.adhesion-membre");
    }

    //PERMET D'ENREGISTRER UN NOUVEAU MEMBRE

    public function RegisterNewMember(Request $request)
    {
        $validator = validator::make($request->all(), [
            'agence' => 'required',
            'code_monnaie' => 'required',
            'type_epargne' => 'required',
            'type_client' => 'required',
            'intitule_compte' => 'required',
            'critere' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'validate_error' => $validator->messages()
            ]);
        }
        //CREATE AN ACCOUNT REF
        CompteurCompte::create([
            "default_value" => "0000"
        ]);
        //GET LAST ROW CREATED
        $refCompte = CompteurCompte::latest()->first()->id;
        if ($request->agence == "SIEGE") {
            $codeAgence = "20";
        }
        if ($refCompte < 10) {
            $compteEnFranc = "330100000" . $refCompte . "202";
        } else if ($refCompte >= 10 && $refCompte < 100) {
            $compteEnFranc = "33010000" . $refCompte . "202";
        } else if ($refCompte >= 100 && $refCompte < 1000) {
            $compteEnFranc = "3301000" . $refCompte . "202";
        } else if ($refCompte >= 1000 && $refCompte < 10000) {
            $compteEnFranc = "330100" . $refCompte . "202";
        }
        AdhesionMembre::create([
            "num_compte" => $compteEnFranc,
            "compte_abrege" => $refCompte,
            "agence" => $request->agence,
            "code_agence" => $codeAgence,
            "code_monnaie" => "CDF",
            "type_epargne" => $request->type_epargne,
            "type_client" => $request->type_client,
            "intitule_compte" => $request->intitule_compte,
            "lieu_naissance" => $request->lieu_naissance,
            "date_naissance" => $request->date_naissance,
            "etat_civile" => $request->etat_civile,
            "nom_condjoint" => $request->nom_condjoint,
            "nom_pere" => $request->nom_pere,
            "nom_mere" => $request->nom_mere,
            "profession" => $request->profession,
            "lieu_travail" => $request->lieu_travail,
            "civilite" => $request->civilite,
            "sexe" => $request->sexe,
            "email" => $request->email,
            "telephone" => $request->telephone,
            "type_piece" => $request->type_piece,
            "num_piece" => $request->num_piece,
            "lieu_devivraison_piece" => $request->lieu_devivraison_piece,
            "province" => $request->province,
            "territoire_ou_ville" => $request->territoire_ou_ville,
            "commune" => $request->commune,
            "quartier" => $request->quartier,
            "type_de_gestion" => $request->type_de_gestion,
            "critere" => $request->critere,
        ]);

        // $lastId = AdhesionMembre::latest()->first();
        Mandataires::create([
            "refCompte" => $refCompte,
            "mendataireName" => $request->intitule_compte,
            "lieuNaissM" => $request->lieu_naissance,
            "dateNaissM" => $request->date_naissance,
            "etatCivileM" => $request->etat_civile,
            "sexeM" => $request->sexe,
            "typePieceM" => $request->type_piece,
            "professionM" => $request->profession,
            "telephoneM" => $request->telephone,
            "adresseM" => $request->quartier,
            // "observationM" => $request->observation,
            // "photoM" => $request->photoM,

        ]);

        return response()->json(["status" => 1, "msg" => "Enregistrement réussi compte abregé: " . $refCompte]);
    }

    //GET A SEACHED MEMBER TO UPDATE

    public function getSeachedMembre(Request $request)
    {
        // $validator = validator::make($request->all(), [
        //     'compte_to_search' => 'required',
        // ]);
        // if ($validator->fails()) {
        //     return response()->json([
        //         'validate_error' => $validator->messages()
        //     ]);
        // }
        // return response()->json([$request->compte_to_search]);
        if (isset($request->compte_to_search)) {

            $data =  AdhesionMembre::where("compte_abrege", $request->compte_to_search)->first();
            if ($data) {
                return response()->json(["status" => 1, "data" => $data]);
            } else {
                return response()->json(["status" => 0, "msg" => "Aucun membre trouvé"]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Veuillez renseigner un numéro de compte"]);
        }
    }

    //PERMET DE METTRE A JOURS LES INFORMATIONS D'UN MEMBRES

    public function updateMembre(Request $request)
    {
        if (isset($request->compte_to_search)) {
            AdhesionMembre::where("compte_abrege", $request->compte_to_search)->update([
                "type_epargne" => $request->type_epargne,
                "type_client" => $request->type_client,
                "intitule_compte" => $request->intitule_compte,
                "lieu_naissance" => $request->lieu_naissance,
                "date_naissance" => $request->date_naissance,
                "etat_civile" => $request->etat_civile,
                "nom_condjoint" => $request->nom_condjoint,
                "nom_pere" => $request->nom_pere,
                "nom_mere" => $request->nom_mere,
                "profession" => $request->profession,
                "lieu_travail" => $request->lieu_travail,
                "civilite" => $request->civilite,
                "sexe" => $request->sexe,
                "email" => $request->email,
                "telephone" => $request->telephone,
                "type_piece" => $request->type_piece,
                "num_piece" => $request->num_piece,
                "lieu_devivraison_piece" => $request->lieu_devivraison_piece,
                "province" => $request->province,
                "territoire_ou_ville" => $request->territoire_ou_ville,
                "commune" => $request->commune,
                "quartier" => $request->quartier,
                "type_de_gestion" => $request->type_de_gestion,
                "critere" => $request->critere,
            ]);
            $checkCompteExist = Comptes::where("NumAdherant", $request->compte_to_search)->first();
            if ($checkCompteExist) {
                Comptes::where("NumAdherant", $request->compte_to_search)->update([
                    "NomCompte" => $request->intitule_compte,
                    "sexe" => $request->sexe,
                ]);
            }
            return response()->json(["status" => 1, "msg" => "Mise à jour réussie"]);
        } else {
            return response()->json(["status" => 0, "msg" => "Veuillez renseigner un numéro de compte"]);
        }
    }

    //PERMET DE METTRE A JOUR LA SIGNATURE DU CLIENT
    public function updateMembreSignature(Request $request)
    {
        if (isset($request->compte_to_search)) {
            if ($request->hasFile('signature_image_file')) {
                $file = $request->file('signature_image_file');
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '.' . $extension;
                $file->move('uploads/membres/signatures/files', $filename);
                $uploaded_file = $filename;
                $chechraw = AdhesionMembre::where('compte_abrege', $request->compte_to_search)->first();
                if ($chechraw) {
                    AdhesionMembre::where('compte_abrege', $request->compte_to_search)->update([
                        "signature_image_file" => $uploaded_file,
                    ]);
                    return response()->json(["status" => 1, "msg" => "Mise à jour réussie."]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Une erreur est survenue."]);
                }
            } else {
                return response()->json(["status" => 0, "msg" => "Vous n'avez pas séléctionné de fichier."]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Veuillez renseigner un numéro de compte"]);
        }
    }

    //CREATE NEW ACCOUNT FOR CONSTOMER 

    public function createAccount(Request $request)
    {
        if (isset($request->compteAbrege)) {
            if ($request->devise_compte == "CDF") {
                //CHECK IF THE ACCOUNT NOT ALREADY CREATED
                $checkCompteExist = Comptes::where("NumAdherant", $request->compteAbrege)->where("CodeMonnaie", 2)->first();
                if (!$checkCompteExist) {
                    $data = AdhesionMembre::where("compte_abrege", $request->compteAbrege)->first();
                    Comptes::create([
                        'CodeAgence' => $data->code_agence,
                        'NumCompte' => $data->num_compte,
                        'NomCompte' => $data->intitule_compte,
                        'RefTypeCompte' => "3",
                        'RefCadre' => "33",
                        'RefGroupe' => "330",
                        'RefSousGroupe' => "3301",
                        'CodeMonnaie' => 2,
                        'NumeTelephone' => $data->telephone,
                        'DateNaissance' => $data->date_naissance,
                        'NumAdherant' => $data->compte_abrege,
                    ]);
                    return response()->json(["status" => 1, "msg" => "Compte bien crée"]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Le compte en CDF existe déjà pour ce membre."]);
                }
            } else if ($request->devise_compte == "USD") {
                //CHECK IF THE ACCOUNT NOT ALREADY CREATED
                $checkCompteExist = Comptes::where("NumAdherant", $request->compteAbrege)->where("CodeMonnaie", 1)->first();
                if (!$checkCompteExist) {
                    if ($request->compteAbrege     < 10) {
                        $compteEnDollars = "330000000" . $request->compteAbrege     . "201";
                    } else if ($request->compteAbrege >= 10 && $request->compteAbrege < 100) {
                        $compteEnDollars = "33000000" . $request->compteAbrege . "201";
                    } else if ($request->compteAbrege >= 100 && $request->compteAbrege < 1000) {
                        $compteEnDollars = "3300000" . $request->compteAbrege . "201";
                    } else if ($request->compteAbrege >= 1000 && $request->compteAbrege < 10000) {
                        $compteEnDollars = "330000" . $request->compteAbrege . "201";
                    }
                    $data = AdhesionMembre::where("compte_abrege", $request->compteAbrege)->first();
                    Comptes::create([
                        'CodeAgence' => $data->code_agence,
                        'NumCompte' => $compteEnDollars,
                        'NomCompte' => $data->intitule_compte,
                        'RefTypeCompte' => "3",
                        'RefCadre' => "33",
                        'RefGroupe' => "330",
                        'RefSousGroupe' => "3300",
                        'CodeMonnaie' => 1,
                        'NumeTelephone' => $data->telephone,
                        'DateNaissance' => $data->date_naissance,
                        'NumAdherant' => $data->compte_abrege,
                    ]);
                    return response()->json(["status" => 1, "msg" => "Compte bien crée"]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Le compte en dollars existe déjà pour ce membre."]);
                }
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun compte renseigné"]);
        }
    }

    public function ajoutMandataire(Request $request)
    {
        if (isset($request->compteAbrege)) {
            if ($request->mandataireName) {
                if ($request->mandatairePhone) {
                    Mandataires::create([
                        'refCompte' => $request->compteAbrege,
                        'mendataireName' => $request->mandataireName,
                        'telephoneM' => $request->mandatairePhone,
                    ]);
                    return response()->json(["status" => 1, "msg" => "Mandataire ajouté avec succès"]);
                } else {
                    return response()->json(["status" => 0, "msg" => "Vous devez renseigné le numéro de télephone du mandataire"]);
                }
            } else {
                return response()->json(["status" => 0, "msg" => "Le champ nom ne dois pas être vide"]);
            }
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun compte renseigné"]);
        }
    }

    public function getMandataire(Request $request)
    {
        if (isset($request->compte_to_search)) {
            $data =  Mandataires::where("refCompte", $request->compte_to_search)->get();
            return response()->json(["status" => 1, "data" => $data]);
        }
    }

    public function deleteMandataire($id)
    {
        if (Auth::user()->admin == 1) {
            Mandataires::where("id", "=", $id)->delete();
            return response()->json(["status" => 1, "msg" => "Mandataire bien supprimé"]);
        } else {
            return response()->json(["status" => 0, "msg" => "Vous n'êtes autorisé à supprimer un mandataire"]);
        }
    }
}
