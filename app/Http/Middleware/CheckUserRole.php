<?php

namespace App\Http\Middleware;

use Closure;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserRole
{
    protected $accessConfigController;

    public function __construct()
    {
        $this->accessConfigController = new \App\Http\Controllers\AccessConfigController();
    }

    public function handle($request, Closure $next, ...$roles)
    {
        $idUser = Auth::id();

        $userRoles = [
            'isCaissier' => $this->accessConfigController->CaissierProfile($idUser),
            'isIT' => $this->accessConfigController->ITProfile($idUser),
            'isComptable' => $this->accessConfigController->ComptableProfile($idUser),
            'isAgentCredit' => $this->accessConfigController->AgentCreditProfile($idUser),
            'isChefCaisse' => $this->accessConfigController->ChefCaisseProfile($idUser),
            'isAgentClientele' => $this->accessConfigController->IsAgentClientele($idUser),
            'isAgentTerrain' => $this->accessConfigController->isAgentTerrain($idUser),
        ];

        // Vérifie si l'utilisateur a au moins un des rôles requis
        foreach ($roles as $role) {
            if (!empty($userRoles[$role])) {
                return $next($request); // Autorisé
            }
        }
        // Si aucun rôle ne correspond, rediriger
        return redirect('eco/pages/unauthorized')->with('error', 'Vous n\'êtes pas autorisé à accéder à cette page.');
    }
}
