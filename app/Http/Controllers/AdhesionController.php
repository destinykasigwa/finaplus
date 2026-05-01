<?php

namespace App\Http\Controllers;

use App\Models\Comptes;
use App\Models\Mandataires;
use Illuminate\Http\Request;
use App\Models\AdhesionMembre;
use App\Models\Agences;
use App\Models\CompteurCompte;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
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

    /**
     * Génère un préfixe unique pour une agence (2 lettres)
     * Exemples : GOMA → GM, KATINDO → KT, SIEGE → SG
     */
    private function getPrefixeAgence($codeAgence)
    {
        // Vous pouvez utiliser un mapping direct selon le code_agence ou le nom_agence
        $prefixes = [
            'GOMA'    => 'GM',
            'KATINDO' => 'KT',
            'SIEGE'   => 'SG',
            // Ajoutez ici tous les codes/noms d'agence avec leur préfixe
        ];

        // Récupérer l'agence depuis la base de données pour obtenir son nom
        $agence = Agences::where('code_agence', $codeAgence)->first();
        if (!$agence) {
            // Par défaut, on prend les deux premières lettres du code en majuscule
            return strtoupper(substr($codeAgence, 0, 2));
        }

        $nom = strtoupper($agence->nom_agence);
        // Vérifier dans le tableau mapping
        if (isset($prefixes[$nom])) {
            return $prefixes[$nom];
        }

        // Sinon, prendre les deux premières lettres du nom (ex: BUKAVU → BU)
        return substr($nom, 0, 2);
    }
    // public function RegisterNewMember(Request $request)
    // {
    //     $validator = validator::make($request->all(), [
    //         // 'code_agence' => 'required',
    //         'code_monnaie' => 'required',
    //         'type_epargne' => 'required',
    //         'type_client' => 'required',
    //         'intitule_compte' => 'required',
    //         'critere' => 'required',
    //         'suiteAdresse'  => 'required',
    //     ]);
    //     if ($validator->fails()) {
    //         return response()->json([
    //             'validate_error' => $validator->messages()
    //         ]);
    //     }
    //     $getAgence = Agences::where("code_agence", $request->code_agence)->first();
    //     $NomAgence = $getAgence ? $getAgence->nom_agence : null;

    //     $codeAgence = $request->code_agence;
    //     if (!$codeAgence) {
    //         $user = auth()->user();
    //         $agence = $user->agences()->first();
    //         if ($agence) {
    //             $codeAgence = $agence->code_agence;
    //         } else {
    //             return response()->json(['status' => 0, 'msg' => 'Aucune agence associée à cet utilisateur']);
    //         }
    //     }
    //     //CREATE AN ACCOUNT REF
    //     CompteurCompte::create([
    //         "default_value" => "0000"
    //     ]);
    //     //GET LAST ROW CREATED
    //     $refCompte = CompteurCompte::latest()->first()->id;
    //     if ($refCompte < 10) {
    //         $compteEnFranc = "330100000" . $refCompte . $codeAgence . "2";
    //     } else if ($refCompte >= 10 && $refCompte < 100) {
    //         $compteEnFranc = "33010000" . $refCompte . $codeAgence . "2";
    //     } else if ($refCompte >= 100 && $refCompte < 1000) {
    //         $compteEnFranc = "3301000" . $refCompte . $codeAgence . "2";
    //     } else if ($refCompte >= 1000 && $refCompte < 10000) {
    //         $compteEnFranc = "330100" . $refCompte . $codeAgence . "2";
    //     }

    //     $prefixe = $this->getPrefixeAgence($codeAgence);
    //     $numManuel = $prefixe . $refCompte; // $NumAdherant = "500" par exemple
    //     AdhesionMembre::create([
    //         "num_compte" => $compteEnFranc,
    //         "compte_abrege" => $refCompte,
    //         "Num_Manuel"=>$numManuel,
    //         "agence" => $NomAgence,
    //         "code_agence" => $request->code_agence,
    //         "code_monnaie" => "CDF",
    //         "type_epargne" => $request->type_epargne,
    //         "type_client" => $request->type_client,
    //         "intitule_compte" => $request->intitule_compte,
    //         "lieu_naissance" => $request->lieu_naissance,
    //         "date_naissance" => $request->date_naissance,
    //         "etat_civile" => $request->etat_civile,
    //         "nom_condjoint" => $request->nom_condjoint,
    //         "nom_pere" => $request->nom_pere,
    //         "nom_mere" => $request->nom_mere,
    //         "profession" => $request->profession,
    //         "lieu_travail" => $request->lieu_travail,
    //         "civilite" => $request->civilite,
    //         "sexe" => $request->sexe,
    //         "email" => $request->email,
    //         "telephone" => $request->telephone,
    //         "type_piece" => $request->type_piece,
    //         "num_piece" => $request->num_piece,
    //         "lieu_devivraison_piece" => $request->lieu_devivraison_piece,
    //         "province" => $request->province,
    //         "territoire_ou_ville" => $request->territoire_ou_ville,
    //         "commune" => $request->commune,
    //         "quartier" => $request->quartier,
    //         "type_de_gestion" => $request->type_de_gestion,
    //         "critere" => $request->critere,
    //         "suiteAdresse" => $request->suiteAdresse
    //     ]);

    //     // $lastId = AdhesionMembre::latest()->first();
    //     Mandataires::create([
    //         "refCompte" => $refCompte,
    //         "mendataireName" => $request->intitule_compte,
    //         "lieuNaissM" => $request->lieu_naissance,
    //         "dateNaissM" => $request->date_naissance,
    //         "etatCivileM" => $request->etat_civile,
    //         "sexeM" => $request->sexe,
    //         "typePieceM" => $request->type_piece,
    //         "professionM" => $request->profession,
    //         "telephoneM" => $request->telephone,
    //         "adresseM" => $request->quartier,
    //         // "observationM" => $request->observation,
    //         // "photoM" => $request->photoM,

    //     ]);

    //     return response()->json(["status" => 1, "msg" => "Enregistrement réussi compte abregé: " . $refCompte]);
    // }

    public function RegisterNewMember(Request $request)
    {
        $validator = validator::make($request->all(), [
            'code_monnaie' => 'required',
            'type_epargne' => 'required',
            'type_client' => 'required',
            'intitule_compte' => 'required',
            'critere' => 'required',
            'suiteAdresse'  => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['validate_error' => $validator->messages()]);
        }

        // Récupération du code agence (depuis le formulaire ou depuis l'utilisateur)
        $codeAgence = $request->code_agence;
        if (!$codeAgence) {
            $user = auth()->user();
            $agence = $user->agences()->first();
            if ($agence) {
                $codeAgence = $agence->code_agence;
            } else {
                return response()->json(['status' => 0, 'msg' => 'Aucune agence associée à cet utilisateur']);
            }
        }

        // Récupérer l'agence depuis la base
        $agence = Agences::where('code_agence', $codeAgence)->first();
        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence introuvable']);
        }
        $NomAgence = $agence->nom_agence;

        // Incrémenter le compteur propre à l'agence
        $refCompte = $agence->last_ref_compte + 1;
        $agence->last_ref_compte = $refCompte;
        $agence->save();

        // Construction du numéro de compte CDF (3301...)
        $codeAgenceNum = (string) $codeAgence; // ex: "21"
        // if ($refCompte < 10) {
        //     $compteEnFranc = "330100000" . $refCompte . $codeAgenceNum . "2";
        // } elseif ($refCompte >= 10 && $refCompte < 100) {
        //     $compteEnFranc = "33010000" . $refCompte . $codeAgenceNum . "2";
        // } elseif ($refCompte >= 100 && $refCompte < 1000) {
        //     $compteEnFranc = "3301000" . $refCompte . $codeAgenceNum . "2";
        // } elseif ($refCompte >= 1000 && $refCompte < 10000) {
        //     $compteEnFranc = "330100" . $refCompte . $codeAgenceNum . "2";
        // } else {
        //     // Pour les valeurs plus grandes (9999 et plus)
        //     $compteEnFranc = "33010" . $refCompte . $codeAgenceNum . "2";
        // }

        if ($refCompte < 10) {
            $compteEnFranc = "330100000" . $refCompte . $codeAgenceNum . "2";
        } elseif ($refCompte < 100) {
            $compteEnFranc = "33010000" . $refCompte . $codeAgenceNum . "2";
        } elseif ($refCompte < 1000) {
            $compteEnFranc = "3301000" . $refCompte . $codeAgenceNum . "2";
        } elseif ($refCompte < 10000) {
            $compteEnFranc = "330100" . $refCompte . $codeAgenceNum . "2";
        } elseif ($refCompte < 100000) {
            $compteEnFranc = "33010" . $refCompte . $codeAgenceNum . "2";
        } elseif ($refCompte < 1000000) {
            $compteEnFranc = "3301" . $refCompte . $codeAgenceNum . "2";
        } elseif ($refCompte < 10000000) {
            $compteEnFranc = "330" . $refCompte . $codeAgenceNum . "2";
        } else {
            // Si jamais on atteint 10 millions de membres (improbable), on peut lancer une erreur
            return response()->json(["status" => 0, "msg" => "Limite de membres atteinte pour cette agence"]);
        }

        // Génération du numéro manuel (ex: GM1551)
        $prefixe = $this->getPrefixeAgence($codeAgence);
        $numManuel = $prefixe . $refCompte;

        // Création de l'adhésion
        AdhesionMembre::create([
            "num_compte" => $compteEnFranc,
            "compte_abrege" => $refCompte,
            "Num_Manuel" => $numManuel,
            "agence" => $NomAgence,
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
            "suiteAdresse" => $request->suiteAdresse
        ]);

        // Création du mandataire
        Mandataires::create([
            "refCompte" => $refCompte,
            "CodeAgence"=>$codeAgence,
            "mendataireName" => $request->intitule_compte,
            "lieuNaissM" => $request->lieu_naissance,
            "dateNaissM" => $request->date_naissance,
            "etatCivileM" => $request->etat_civile,
            "sexeM" => $request->sexe,
            "typePieceM" => $request->type_piece,
            "professionM" => $request->profession,
            "telephoneM" => $request->telephone,
            "adresseM" => $request->quartier,
        ]);

        return response()->json(["status" => 1, "msg" => "Enregistrement réussi compte abregé: " . $refCompte]);
    }

    //GET A SEACHED MEMBER TO UPDATE

    // public function getSeachedMembre(Request $request)
    // {

    //     if (isset($request->compte_to_search)) {

    //         $data =  AdhesionMembre::where("compte_abrege", $request->compte_to_search)->first();
    //         if ($data) {
    //             return response()->json(["status" => 1, "data" => $data]);
    //         } else {
    //             return response()->json(["status" => 0, "msg" => "Aucun membre trouvé"]);
    //         }
    //     } else {
    //         return response()->json(["status" => 0, "msg" => "Veuillez renseigner un numéro de compte"]);
    //     }
    // }

    public function getSeachedMembre(Request $request)
    {
        if (!isset($request->compte_to_search)) {
            return response()->json(["status" => 0, "msg" => "Veuillez renseigner un numéro de compte"]);
        }

        $search = $request->compte_to_search;

        // Récupération de l'agence courante
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        if (!$codeAgence) {
            return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
        }

        // Recherche dans adhesion_membres
        // Si la table a une colonne 'code_agence', on filtre directement
        // Sinon, on utilise le préfixe du num_manuel (si vous avez stocké le préfixe)
        $query = AdhesionMembre::query();

        // Option 1 : colonne code_agence existe (recommandé)
        if (Schema::hasColumn('adhesion_membres', 'code_agence')) {
            $query->where('code_agence', $codeAgence);
        } else {
            // Option 2 : utiliser le préfixe du num_manuel
            $prefixe = $this->getPrefixeAgence($codeAgence); // fonction définie précédemment
            $query->where('Num_Manuel', 'like', $prefixe . '%');
        }

        // Recherche sur compte_abrege ou num_manuel
        $membre = $query->where(function ($q) use ($search) {
            $q->where('compte_abrege', $search)
                ->orWhere('Num_Manuel', $search);
        })->first();

        if (!$membre) {
            return response()->json(["status" => 0, "msg" => "Aucun membre trouvé dans votre agence pour ce numéro"]);
        }

        return response()->json(["status" => 1, "data" => $membre]);
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

    // public function createAccount(Request $request)
    // {
    //     if (isset($request->compteAbrege)) {
    //         if ($request->devise_compte == "CDF") {
    //             //CHECK IF THE ACCOUNT NOT ALREADY CREATED
    //             $checkCompteExist = Comptes::where("NumAdherant", $request->compteAbrege)->where("CodeMonnaie", 2)->first();
    //             if (!$checkCompteExist) {
    //                 $data = AdhesionMembre::where("compte_abrege", $request->compteAbrege)->first();
    //                 Comptes::create([
    //                     'CodeAgence' => $data->code_agence,
    //                     'NumCompte' => $data->num_compte,
    //                     'Num_Manuel'=>$data->Num_Manuel,
    //                     'NomCompte' => $data->intitule_compte,
    //                     'RefTypeCompte' => "3",
    //                     'RefCadre' => "33",
    //                     'RefGroupe' => "330",
    //                     'RefSousGroupe' => "3301",
    //                     'CodeMonnaie' => 2,
    //                     'NumeTelephone' => $data->telephone,
    //                     'DateNaissance' => $data->date_naissance,
    //                     'NumAdherant' => $data->compte_abrege,
    //                     'nature_compte' => "PASSIF",
    //                     'niveau' => "5",
    //                     'est_classe' => 0,
    //                     'compte_parent' => "3300",

    //                 ]);
    //                 return response()->json(["status" => 1, "msg" => "Compte bien crée"]);
    //             } else {
    //                 return response()->json(["status" => 0, "msg" => "Le compte en CDF existe déjà pour ce membre."]);
    //             }
    //         } else if ($request->devise_compte == "USD") {
    //             //CHECK IF THE ACCOUNT NOT ALREADY CREATED
    //             $checkCompteExist = Comptes::where("NumAdherant", $request->compteAbrege)->where("CodeMonnaie", 1)->first();

    //             if (!$checkCompteExist) {
    //                 $getCodeAgence = AdhesionMembre::where("compte_abrege", $request->compteAbrege)->first();
    //                 $codeAgence = $getCodeAgence ? $getCodeAgence->code_agence : null;
    //                 if ($request->compteAbrege < 10) {
    //                     $compteEnDollars = "330000000" . $request->compteAbrege     . $codeAgence . "1";
    //                 } else if ($request->compteAbrege >= 10 && $request->compteAbrege < 100) {
    //                     $compteEnDollars = "33000000" . $request->compteAbrege  . $codeAgence . "1";
    //                 } else if ($request->compteAbrege >= 100 && $request->compteAbrege < 1000) {
    //                     $compteEnDollars = "3300000" . $request->compteAbrege  . $codeAgence . "1";
    //                 } else if ($request->compteAbrege >= 1000 && $request->compteAbrege < 10000) {
    //                     $compteEnDollars = "330000" . $request->compteAbrege  . $codeAgence . "1";
    //                 }
    //                 $data = AdhesionMembre::where("compte_abrege", $request->compteAbrege)->first();
    //                 Comptes::create([
    //                     'CodeAgence' => $data->code_agence,
    //                     'NumCompte' => $compteEnDollars,
    //                     'Num_Manuel'=>$data->Num_Manuel,
    //                     'NomCompte' => $data->intitule_compte,
    //                     'RefTypeCompte' => "3",
    //                     'RefCadre' => "33",
    //                     'RefGroupe' => "330",
    //                     'RefSousGroupe' => "3300",
    //                     'CodeMonnaie' => 1,
    //                     'NumeTelephone' => $data->telephone,
    //                     'DateNaissance' => $data->date_naissance,
    //                     'NumAdherant' => $data->compte_abrege,
    //                     'nature_compte' => "PASSIF",
    //                     'niveau' => "5",
    //                     'est_classe' => 0,
    //                     'compte_parent' => "3300",
    //                 ]);
    //                 return response()->json(["status" => 1, "msg" => "Compte bien crée"]);
    //             } else {
    //                 return response()->json(["status" => 0, "msg" => "Le compte en dollars existe déjà pour ce membre."]);
    //             }
    //         }
    //     } else {
    //         return response()->json(["status" => 0, "msg" => "Aucun compte renseigné"]);
    //     }
    // }

    // CREATE NEW ACCOUNT FOR CUSTOMER
//    public function createAccount(Request $request)
// {
//     if (!isset($request->compteAbrege)) {
//         return response()->json(["status" => 0, "msg" => "Aucun compte renseigné"]);
//     }

//     // Récupérer l'agence de travail de l'utilisateur connecté
//     $currentAgence = session('current_agence');
//     if (!$currentAgence || !isset($currentAgence['code_agence'])) {
//         return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
//     }
//     $codeAgenceUtil = $currentAgence['code_agence'];
//     $nomAgenceUtil = $currentAgence['nom_agence'] ?? $codeAgenceUtil;

//     // Récupérer les infos du membre depuis adhesion_membres
//     $data = AdhesionMembre::where("compte_abrege", $request->compteAbrege)->first();
//     if (!$data) {
//         return response()->json(["status" => 0, "msg" => "Membre introuvable avec ce numéro abrégé"]);
//     }

//     // Vérifier que le membre appartient à l'agence de l'utilisateur
//     if ($data->code_agence != $codeAgenceUtil) {
//         $agenceMembre = Agences::where('code_agence', $data->code_agence)->first();
//         $nomAgenceMembre = $agenceMembre ? $agenceMembre->nom_agence : $data->code_agence;
//         return response()->json([
//             "status" => 0,
//             "msg" => "Ce membre appartient à l'agence '{$nomAgenceMembre}'. Vous travaillez actuellement sur l'agence '{$nomAgenceUtil}'. Veuillez changer d'agence via le sélecteur en haut pour créer le compte de ce membre."
//         ]);
//     }

//     $codeAgence = $data->code_agence; // ex: "20", "21"
//     $abrege = (int) $request->compteAbrege;

//     if ($request->devise_compte == "CDF") {
//         // Vérifier si le compte CDF n'existe pas déjà
//         $checkCompteExist = Comptes::where("NumAdherant", $abrege)->where("CodeMonnaie", 2)->first();
//         if ($checkCompteExist) {
//             return response()->json(["status" => 0, "msg" => "Le compte en CDF existe déjà pour ce membre."]);
//         }

//         // Le numéro de compte CDF a été construit lors de l'adhésion
//         Comptes::create([
//             'CodeAgence'    => $data->code_agence,
//             'NumCompte'     => $data->num_compte,
//             'Num_Manuel'    => $data->Num_Manuel,
//             'NomCompte'     => $data->intitule_compte,
//             'RefTypeCompte' => "3",
//             'RefCadre'      => "33",
//             'RefGroupe'     => "330",
//             'RefSousGroupe' => "3301",
//             'CodeMonnaie'   => 2,
//             'NumeTelephone' => $data->telephone,
//             'DateNaissance' => $data->date_naissance,
//             'NumAdherant'   => $abrege,
//             'nature_compte' => "PASSIF",
//             'niveau'        => 5,
//             'est_classe'    => 0,
//             'compte_parent' => "3300",
//         ]);
//         return response()->json(["status" => 1, "msg" => "Compte CDF bien créé"]);
//     } elseif ($request->devise_compte == "USD") {
//         // Vérifier si le compte USD n'existe pas déjà
//         $checkCompteExist = Comptes::where("NumAdherant", $abrege)->where("CodeMonnaie", 1)->first();
//         if ($checkCompteExist) {
//             return response()->json(["status" => 0, "msg" => "Le compte en USD existe déjà pour ce membre."]);
//         }

//         // Construction du numéro de compte USD (3300...)
//         $codeAgenceNum = (string) $codeAgence;

//         if ($abrege < 10) {
//             $compteEnDollars = "330000000" . $abrege . $codeAgenceNum . "1";
//         } elseif ($abrege < 100) {
//             $compteEnDollars = "33000000" . $abrege . $codeAgenceNum . "1";
//         } elseif ($abrege < 1000) {
//             $compteEnDollars = "3300000" . $abrege . $codeAgenceNum . "1";
//         } elseif ($abrege < 10000) {
//             $compteEnDollars = "330000" . $abrege . $codeAgenceNum . "1";
//         } elseif ($abrege < 100000) {
//             $compteEnDollars = "33000" . $abrege . $codeAgenceNum . "1";
//         } elseif ($abrege < 1000000) {
//             $compteEnDollars = "3300" . $abrege . $codeAgenceNum . "1";
//         } elseif ($abrege < 10000000) {
//             $compteEnDollars = "330" . $abrege . $codeAgenceNum . "1";
//         } else {
//             return response()->json(["status" => 0, "msg" => "Limite de membres atteinte"]);
//         }

//         Comptes::create([
//             'CodeAgence'    => $data->code_agence,
//             'NumCompte'     => $compteEnDollars,
//             'Num_Manuel'    => $data->Num_Manuel,
//             'NomCompte'     => $data->intitule_compte,
//             'RefTypeCompte' => "3",
//             'RefCadre'      => "33",
//             'RefGroupe'     => "330",
//             'RefSousGroupe' => "3300",
//             'CodeMonnaie'   => 1,
//             'NumeTelephone' => $data->telephone,
//             'DateNaissance' => $data->date_naissance,
//             'NumAdherant'   => $abrege,
//             'nature_compte' => "PASSIF",
//             'niveau'        => 5,
//             'est_classe'    => 0,
//             'compte_parent' => "3300",
//         ]);
//         return response()->json(["status" => 1, "msg" => "Compte USD bien créé"]);
//     } else {
//         return response()->json(["status" => 0, "msg" => "Devise non reconnue"]);
//     }
// }


public function createAccount(Request $request)
{
    if (!isset($request->compteAbrege)) {
        return response()->json(["status" => 0, "msg" => "Aucun compte renseigné"]);
    }

    // Récupérer l'agence de travail de l'utilisateur
    $currentAgence = session('current_agence');
    if (!$currentAgence || !isset($currentAgence['code_agence'])) {
        return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
    }
    $codeAgenceUtil = $currentAgence['code_agence'];
    $nomAgenceUtil = $currentAgence['nom_agence'] ?? $codeAgenceUtil;

    $search = trim($request->compteAbrege);
    $data = null;

    // 1. Si c'est un Num_Manuel (2 lettres + chiffres) → recherche directe
    if (preg_match('/^[A-Za-z]{2}\d+$/', $search)) {
        $data = AdhesionMembre::where('Num_Manuel', $search)->first();
        if (!$data) {
            return response()->json(["status" => 0, "msg" => "Aucun membre avec ce Num_Manuel"]);
        }
        // Autoriser la création même si l'agence diffère (l'utilisateur a explicitement utilisé le Num_Manuel)
    }
    // 2. Si c'est un numéro de compte complet (13 chiffres)
    elseif (strlen($search) === 13 && ctype_digit($search)) {
        $data = AdhesionMembre::where('num_compte', $search)->first();
        if (!$data) {
            return response()->json(["status" => 0, "msg" => "Aucun membre avec ce numéro de compte"]);
        }
    }
    // 3. Sinon, c'est un numéro abrégé numérique
    else {
        // Chercher d'abord dans l'agence courante
        $data = AdhesionMembre::where('compte_abrege', $search)
                              ->where('code_agence', $codeAgenceUtil)
                              ->first();
        if (!$data) {
            // Vérifier si ce numéro existe dans une autre agence
            $autre = AdhesionMembre::where('compte_abrege', $search)->first();
            if ($autre) {
                $agenceMembre = Agences::where('code_agence', $autre->code_agence)->first();
                $nomAgenceMembre = $agenceMembre ? $agenceMembre->nom_agence : $autre->code_agence;
                return response()->json([
                    "status" => 0,
                    "msg" => "Ce numéro abrégé correspond à un membre de l'agence '{$nomAgenceMembre}'. Vous travaillez sur '{$nomAgenceUtil}'. Veuillez utiliser son Num_Manuel ('{$autre->Num_Manuel}') ou changer d'agence."
                ]);
            }
            return response()->json(["status" => 0, "msg" => "Aucun membre trouvé avec ce numéro abrégé"]);
        }
    }

    // Vérification facultative : si le membre est d'une agence différente et que l'utilisateur n'a pas utilisé le Num_Manuel, on bloque
    if ($data->code_agence != $codeAgenceUtil && !preg_match('/^[A-Za-z]{2}\d+$/', $search) && strlen($search) !== 13) {
        $agenceMembre = Agences::where('code_agence', $data->code_agence)->first();
        $nomAgenceMembre = $agenceMembre ? $agenceMembre->nom_agence : $data->code_agence;
        return response()->json([
            "status" => 0,
            "msg" => "Ce membre appartient à l'agence '{$nomAgenceMembre}'. Vous travaillez sur '{$nomAgenceUtil}'. Pour créer son compte, utilisez son Num_Manuel ('{$data->Num_Manuel}') ou changez d'agence."
        ]);
    }

    // Si on arrive ici, on peut créer le compte
    $codeAgence = $data->code_agence;
    $abrege = (int) $data->compte_abrege;


    
        // Construction du numéro de compte USD (3300...)
        $codeAgenceNum = (string) $codeAgence;

        if ($abrege < 10) {
            $compteEnDollars = "330000000" . $abrege . $codeAgenceNum . "1";
        } elseif ($abrege < 100) {
            $compteEnDollars = "33000000" . $abrege . $codeAgenceNum . "1";
        } elseif ($abrege < 1000) {
            $compteEnDollars = "3300000" . $abrege . $codeAgenceNum . "1";
        } elseif ($abrege < 10000) {
            $compteEnDollars = "330000" . $abrege . $codeAgenceNum . "1";
        } elseif ($abrege < 100000) {
            $compteEnDollars = "33000" . $abrege . $codeAgenceNum . "1";
        } elseif ($abrege < 1000000) {
            $compteEnDollars = "3300" . $abrege . $codeAgenceNum . "1";
        } elseif ($abrege < 10000000) {
            $compteEnDollars = "330" . $abrege . $codeAgenceNum . "1";
        } else {
            return response()->json(["status" => 0, "msg" => "Limite de membres atteinte"]);
        }

        Comptes::create([
            'CodeAgence'    => $data->code_agence,
            'NumCompte'     => $compteEnDollars,
            'Num_Manuel'    => $data->Num_Manuel,
            'NomCompte'     => $data->intitule_compte,
            'RefTypeCompte' => "3",
            'RefCadre'      => "33",
            'RefGroupe'     => "330",
            'RefSousGroupe' => "3300",
            'CodeMonnaie'   => 1,
            'NumeTelephone' => $data->telephone,
            'DateNaissance' => $data->date_naissance,
            'NumAdherant'   => $abrege,
            'nature_compte' => "PASSIF",
            'niveau'        => 5,
            'est_classe'    => 0,
            'compte_parent' => "3300",
        ]);
        return response()->json(["status" => 1, "msg" => "Compte USD bien créé"]);

    // ... le reste de votre code pour créer le compte (CDF ou USD) inchangé ...
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
    if (!isset($request->compte_to_search)) {
        return response()->json(["status" => 0, "msg" => "Aucun compte renseigné"]);
    }

    $currentAgence = session('current_agence');
    $codeAgence = $currentAgence['code_agence'] ?? null;
    if (!$codeAgence) {
        return response()->json(["status" => 0, "msg" => "Aucune agence de travail sélectionnée"]);
    }

    // Récupérer l'adhésion pour connaître le code_agence du membre (sécurité)
    $adhesion = AdhesionMembre::where('compte_abrege', $request->compte_to_search)
                ->orWhere('num_compte', $request->compte_to_search)
                ->first();

    if (!$adhesion) {
        return response()->json(["status" => 0, "msg" => "Membre introuvable"]);
    }

    // Récupérer les mandataires du membre pour l'agence courante (ou toutes, selon besoin)
    $data = Mandataires::where('refCompte', $adhesion->compte_abrege)
                       ->where('CodeAgence', $codeAgence) // filtre par agence de l'utilisateur
                       ->get();

    return response()->json(["status" => 1, "data" => $data]);
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

    public function getUserAgencesForAdhesion()
    {
        $user = auth()->user();
        $agences = $user->agences()
            ->select('agences.id', 'agences.code_agence', 'agences.nom_agence')
            ->get();
        return response()->json([
            'status' => 1,
            'data'   => $agences
        ]);
    }
}
