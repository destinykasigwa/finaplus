<?php
// app/Http/View/Composers/ProfileComposer.php
namespace App\Http\View\Composers;

use Illuminate\View\View;
use App\Http\Controllers\AccessConfigController;
use Illuminate\Support\Facades\Auth;

class ProfileComposer
{
    protected $accessConfigController;

    public function __construct(AccessConfigController $accessConfigController)
    {
        $this->accessConfigController = $accessConfigController;
    }

    public function compose(View $view)
    {
        $idUser = Auth::id();

        $isCaissier = $this->accessConfigController->CaissierProfile($idUser);
        $isIT = $this->accessConfigController->ITProfile($idUser);
        $isComptable = $this->accessConfigController->ComptableProfile($idUser);
        $isAgentCredit = $this->accessConfigController->AgentCreditProfile($idUser);
        $isChefCaisse = $this->accessConfigController->ChefCaisseProfile($idUser);
        $isAgentClientele = $this->accessConfigController->IsAgentClientele($idUser);
        $isAgentTerrain = $this->accessConfigController->isAgentTerrain($idUser);
        $view->with([
            'isCaissier' => $isCaissier,
            'isIT' => $isIT,
            'isComptable' => $isComptable,
            'isAgentCredit' => $isAgentCredit,
            'isChefCaisse' => $isChefCaisse,
            'isAgentClientele' => $isAgentClientele,
            'isAgentTerrain' => $isAgentTerrain,
        ]);
    }
}
