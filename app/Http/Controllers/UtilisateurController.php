<?php

namespace App\Http\Controllers;

use App\Models\Comptes;
use App\Models\Menus;
use App\Models\Profile;
use App\Models\ProfilsUser;
use App\Models\User;
use App\Models\UserMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends Controller
{
    //
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function getUsersHomePage()
    {
        return view("eco.pages.utilisateurs");
    }

    //GET USERS
    public function getUsers()
    {
        $data = User::all();
        $profildata = Profile::all();
        $menudata = Menus::all();

        return response()->json(["status" => 1, "data" => $data, "profildata" => $profildata, "menudata" => $menudata]);
    }
    //UPDATE USER 

    public function upDateUser(Request $request)
    {
        User::where("id", "=", $request->userId)->update([
            "name" => $request->name,
            "email" => $request->email
        ]);
        return response()->json(["status" => 1, "msg" => "Modification réussie."]);
    }


    //INIT PASS WORD

    public function initPassword(Request $request)
    {


        $todayDate = date("Y-m-d");
        $defaultPassword = Hash::make("0000");
        User::where("id", "=", $request->userId)->update([
            "password" => $defaultPassword,
            "start_date" => $todayDate,
            "expirate_date" => $todayDate,
            "expirate_password" => 0,
            "locked_state" => 0,
            "attempt_times" => 6,
            "reseted_password" => 1,
        ]);
        return response()->json(["status" => 1, "msg" => "le mot de passe de cet utilisateur a été réinitialisé."]);
    }

    //LOCK A USER 
    public function lockUser(Request $request)
    {
        $data = User::where("id", "=", $request->userId)->first();
        if ($data->locked_state == 0) {
            User::where("id", $request->userId)->update([
                "locked_state" => 1
            ]);
            return response()->json(["status" => 1, "msg" => "Utilisateur bloqué !"]);
        } else {
            User::where("id", $request->userId)->update([
                "locked_state" => 0
            ]);
            return response()->json(["status" => 1, "msg" => "Utilisateur débloqué !"]);
        }
    }

    //ADD NEW PROFIL
    public function addNewProfil(Request $request)
    {


        if (isset($request->profilName)) {
            Profile::create([
                "nom_profile" => $request->profilName,
            ]);
            return response()->json(["status" => 1, "msg" => "Profile bien ajouté !"]);
        } else {
            return response()->json(["status" => 0, "msg" => "Erreur !"]);
        }
    }

    public function getProfilUser(Request $request)
    {

        $get_profil_user = ProfilsUser::where("user_id", $request->userId)
            ->join("profiles", "profiles.id", "=", "profils_users.profil_id")->get();

        if (count($get_profil_user) != 0) {
            return response()->json(["status" => 1, "get_profil_user" => $get_profil_user]);
        } else {
            return response()->json(["status" => 0, "msg" => "Pas des profiles trouvés pour cet utilisateur"]);
        }
    }

    //ADD A PROFIL FOR A SPECIFIC USER 
    public function addNewProfilForSpecificUser(Request $request)
    {

        $checkIfProfilNotExist = ProfilsUser::where("user_id", $request->userId)->where("profil_id", $request->profilId)->first();
        if (!$checkIfProfilNotExist) {
            ProfilsUser::create([
                "user_id" => $request->userId,
                "profil_id" => $request->profilId
            ]);
            return response()->json(["status" => 1, "msg" => "Profil bien accordé."]);
        } else {
            return response()->json(["status" => 0, "msg" => "C'est utilisateur a déjà ce profil."]);
        }
    }

    //REMOVE A SPECIFIC PROFIL

    public function removeProfilForSpecificUser(Request $request)
    {
        ProfilsUser::where("profil_id", "=", $request->idProfil)->delete();
        return response()->json(["status" => 1, "msg" => "Profile bien retiré à c'est utilisateur"]);
    }


    //ADD A MENU FOR SPECIFIC USER

    public function addMenuForSpecificUser(Request $request)
    {
        $checkIfMenuNotExist = UserMenu::where("user_id", $request->userId)->where("menu_id", $request->menuId)->first();
        if (!$checkIfMenuNotExist) {
            UserMenu::create([
                "user_id" => $request->userId,
                "menu_id" => $request->menuId,
                // "profil_id" => $request->profilId
            ]);
            return response()->json(["status" => 1, "msg" => "Menu bien ajouté"]);
        } else {
            return response()->json(["status" => 0, "msg" => "Cet utilisateur a déjà accès à ce menu"]);
        }
    }

    //GET MENU FOR SPECIFIC USER

    public function getMenuUser(Request $request)
    {
        $get_menu_user = UserMenu::where("user_id", $request->userId)
            ->join("menuses", "menuses.id", "=", "user_menus.menu_id")->get();

        if (count($get_menu_user) != 0) {
            return response()->json(["status" => 1, "get_menu_user" => $get_menu_user]);
        } else {
            return response()->json(["status" => 0, "msg" => "Pas des profiles trouvés pour cet utilisateur"]);
        }
    }

    //REMOVE A SPECIFIC MENU FOR USER 

    public function removeMenuForSpecificUser(Request $request)
    {
        UserMenu::where("menu_id", "=", $request->idMenu)->delete();
        return response()->json(["status" => 1, "msg" => "Menu bien retiré à c'est utilisateur"]);
    }

    //PERMET DE CREER UN COMPTE CAISSE

    public function createNewCaissierAccount(Request $request)
    {
        if (isset($request->userId)) {
            $userData = User::where("id", $request->userId)->first();
            //CREATE USD ACCOUNT
            Comptes::create([
                'CodeAgence' => 20,
                'NumCompte' => "5700" . $request->userId . "201",
                'NomCompte' => $userData->name,
                'RefTypeCompte' => "5",
                'RefCadre' => "57",
                'RefGroupe' => "570",
                'RefSousGroupe' => "5700",
                'CodeMonnaie' => 1,
                'NumAdherant' => "5700" . $request->userId . "201",
                'isCaissier' => 1,
                'caissierId' => $request->userId
            ]);
            //CREATE CDF ACCOUNT
            Comptes::create([
                'CodeAgence' => 20,
                'NumCompte' => "5700" . $request->userId . "202",
                'NomCompte' => $userData->name,
                'RefTypeCompte' => "5",
                'RefCadre' => "57",
                'RefGroupe' => "570",
                'RefSousGroupe' => "5700",
                'CodeMonnaie' => 2,
                'NumAdherant' => "5700" . $request->userId . "202",
                'isCaissier' => 1,
                'caissierId' => $request->userId

            ]);
            return response()->json(["status" => 1, "msg" => "Compte caisse bien crée pour l'utilsateur " . $userData->name]);
        } else {
            return response()->json(["status" => 0, "msg" => "Aucun utilisateur sélectionné!"]);
        }
    }
}
