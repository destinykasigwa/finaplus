<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AccessConfigController extends Controller
{

    public function CaissierProfile($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'Caissier']);
        return !empty($getUserRole);
    }

    public function ITProfile($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'IT']);
        return !empty($getUserRole);
    }

    public function ComptableProfile($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'Comptable']);
        return !empty($getUserRole);
    }

    public function AgentCreditProfile($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'Agent de crédit']);
        return !empty($getUserRole);
    }

    public function ChefCaisseProfile($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'Chef caisse']);
        return !empty($getUserRole);
    }

    public function IsAgentClientele($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'Agent clientèle']);
        return !empty($getUserRole);
    }

    public function isAgentTerrain($idUser)
    {
        $getUserRole = DB::select('SELECT * FROM profiles JOIN profils_users ON profils_users.profil_id = profiles.id WHERE profils_users.user_id = ? AND profiles.nom_profile = ?', [$idUser, 'Agent Terrain']);
        return !empty($getUserRole);
    }
}
