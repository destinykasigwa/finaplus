<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Comptes;
use App\Models\SMSBanking;
use App\Models\TauxEtDateSystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SMSBankingController extends Controller
{
    //
    public function __construct()
    {
        $this->middleware("auth");
    }

    //GET SMS BANKING HOME PAGE 
    public function getSMSBankingHomePage()
    {
        return view("eco.pages.sms-banking");
    }

    public function AddNewCustomerQuestion(Request $request)
    {
        if (isset($request->NumCompte)) {
            //VERIFIE SI LE NUMERO DE COMPTE ABREGE SAISIE PAR L'UTILISATEUR EST CORRECT
            $NumAdherant   = Comptes::where("NumAdherant", "=", $request->NumCompte)->first();
            if ($NumAdherant) {
                return response()->json(["success" => 1, "NomMembre" => $NumAdherant->NomCompte]);
            } else {
                return response()->json(["success" => 0, "msg" => "le Numéro de compte abregé que vous avez renseigné n pas valide"]);
            }
        }
    }

    public function normalizePhoneNumber($phone)
    {
        // Retirer tous les espaces et les caractères spéciaux du numéro pour faciliter le formatage
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        // Vérifier si le numéro commence par '0', '243', ou '+243'
        if (preg_match('/^0/', $phone)) {
            // Remplacer '0' au début par '+243'
            $phone = preg_replace('/^0/', '+243', $phone);
        } elseif (preg_match('/^243/', $phone)) {
            // Remplacer '243' au début par '+243'
            $phone = preg_replace('/^243/', '+243', $phone);
        } elseif (preg_match('/^\+243/', $phone) === 0) {
            // Si le numéro ne commence pas par '+243', l'ajouter
            $phone = '+243' . $phone;
        }

        return $phone;
    }

    public function AddNewCustomer(Request $request)
    {

        $date = TauxEtDateSystem::orderBy('id', 'desc')->first()->DateSystem;
        if (isset($request->NumCompte)) {
            //VERIFIE SI LE NUMERO DE COMPTE ABREGE SAISIE PAR L'UTILISATEUR EST CORRECT
            $NumAdherant   = Comptes::where("NumAdherant", "=", $request->NumCompte)->first();
            $phone = $this->normalizePhoneNumber($request->Telephone);
            if ($NumAdherant) {
                SMSBanking::create([
                    "NumCompte" => $NumAdherant->NumCompte,
                    "NomCompte" => $NumAdherant->NomCompte,
                    "Civilite" => $request->Civilite,
                    "Email" => $request->Email,
                    "Telephone" => $phone,
                    "DateActivation" => $date,
                    "NumAbrege" => $request->NumCompte
                ]);
                return response()->json(["success" => 1, "msg" => "Ajouter avec succès"]);
            } else {
                return response()->json(["success" => 0, "msg" => "le Numéro de compte abregé que vous avez renseigné n pas valide"]);
            }
        }
    }

    //GET LASTEST SMS BANKING USERS

    public function getLastestSMSBankingUsers()
    {
        $data = DB::select('SELECT * FROM s_m_s_bankings ORDER BY id  DESC LIMIT 8');
        return response()->json(["success" => 1, "data" => $data]);
    }


    public function getSearchedSMSBankingUsers($item)
    {
        if (isset($item)) {
            $data =  SMSBanking::where("NumAbrege", "=", $item)->first();
            if ($data) {
                return response()->json(["success" => 1, "msg" => "Element trouvé", "data" => $data]);
            } else {
                return response()->json(["success" => 0, "msg" => "Aucun Element trouvé"]);
            }
        }
    }


    //ACTIVATE OR DESACTIVE USER ON SMS BANKING

    public function ActivateUserOnSMSBanking($item)
    {
        if (isset($item)) {
            $getUserInfo = SMSBanking::where("id", "=", $item)->first();
            if ($getUserInfo->Telephone) {
                if ($getUserInfo->ActivatedSMS == 0) {
                    SMSBanking::where("id", "=", $item)->update([
                        "ActivatedSMS" => 1
                    ]);

                    return response()->json(["success" => 1, "msg" => "Vous avez activé " . $getUserInfo->NomCompte . " Sur SMS Banking merci! "]);
                } else if ($getUserInfo->ActivatedSMS == 1) {
                    SMSBanking::where("id", "=", $item)->update([
                        "ActivatedSMS" => 0
                    ]);
                    return response()->json(["success" => 1, "msg" => "Vous avez désactivé " . $getUserInfo->NomCompte . " Sur SMS Banking merci! "]);
                }
            } else {
                return response()->json(["success" => 0, "msg" => "Veuillez renseigner le numéro de télephone avant de continuer! "]);
            }
        }
    }

    public function ActivateUserOnEmailBanking($item)
    {
        if (isset($item)) {
            $getUserInfo = SMSBanking::where("id", "=", $item)->first();
            if ($getUserInfo->Email) {
                if ($getUserInfo->ActivatedEmail == 0) {
                    SMSBanking::where("id", "=", $item)->update([
                        "ActivatedEmail" => 1
                    ]);

                    return response()->json(["success" => 1, "msg" => "Vous avez activé " . $getUserInfo->NomCompte . " Sur Email Banking merci! "]);
                } else if ($getUserInfo->ActivatedEmail == 1) {
                    SMSBanking::where("id", "=", $item)->update([
                        "ActivatedEmail" => 0
                    ]);
                    return response()->json(["success" => 1, "msg" => "Vous avez désactivé " . $getUserInfo->NomCompte . " Sur Email Banking merci! "]);
                }
            } else {
                return response()->json(["success" => 0, "msg" => "Veuillez renseigner l'Email avant de continuer merci! "]);
            }
        }
    }


    //DELETED A SPECIC ITEM

    public function deleteAnItemOnSmsBanking($item)
    {
        if (isset($item)) {
            $NameUser = SMSBanking::where("id", "=", $item)->first()->NomCompte;
            SMSBanking::where("id", "=", $item)->delete();
            return response()->json(["success" => 1, "msg" => "Vous avez supprimer l'utilisateur " . $NameUser . " sur SMS Banking"]);
        }
    }

    //GET INDIVIDUAL USER DETAILS


    public function getIndividualUserDetails(Request $request)
    {

        try {
            $userData = SMSBanking::where("id", "=", $request->userId)->first();
            return response()->json(["data" => $userData]);
        } catch (Exception $th) {
            Log::error($th);
        }
    }


    //UPDATE USER ON SMS MOBILE


    public function upDateUserOnSMSBanking(Request $request)
    {
        if (isset($request->userId)) {
            SMSBanking::where('id', '=', $request->userId)->update([
                "Telephone" => $request->Telephone,
                "Email" => $request->Email,
                "Civilite" => $request->Civilite,
            ]);
            return response()->json(["success" => 1, "msg" => "Modification réussie merci"]);
            //return redirect('/home');
        }
    }
}
