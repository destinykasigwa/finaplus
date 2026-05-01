<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Comptes;
use App\Models\CompteurTransaction;
use App\Models\EpargneAdhesionModel;
use App\Models\SendedSMS;
use App\Models\SMSBanking;
use App\Models\TauxEtDateSystem;
use App\Models\Transactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

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
            $NumAdherant   = Comptes::where("NumAdherant", "=", $request->NumCompte)->orWhere('NumCompte', $request->NumCompte)->first();
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
        $data = DB::select('SELECT * FROM s_m_s_bankings ORDER BY id  DESC LIMIT 100');
        return response()->json(["success" => 1, "data" => $data]);
    }


    public function getSearchedSMSBankingUsers($item)
    {
        if (isset($item)) {
           $data = SMSBanking::where('NumAbrege', $item)->orWhere('NumCompte', $item)->first();
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






 public function prelevementFraisSMS(Request $request)
{
    try {
        DB::beginTransaction();

        $dateDebut = Carbon::parse($request->dateDebut)->startOfDay();
        $dateFin   = Carbon::parse($request->dateFin)->endOfDay();
        $exonere   = $request->input('exonere', []);

        // $ref = 'SMS_' . $dateDebut->format('Ym');
        // if (Transactions::where('reference', $ref)->exists()) {
        //     return response()->json(['success' => false, 'message' => 'Prélèvement déjà effectué pour cette période.'], 400);
        // }


        // Option 1 : suppression pure et simple (déconseillé si le processus est critique)
// Option 2 : vérifier s'il y a encore des messages à facturer, sinon ignorer
$remaining = SendedSMS::whereBetween('dateEnvoie', [$dateDebut, $dateFin])
    ->where('messageStatus', 1)
    ->where('paidStatus', 0)
    ->count();

if ($remaining == 0) {
    return response()->json(['success' => false, 'message' => 'Aucun message à prélever pour cette période.'], 400);
}

        $taux = TauxEtDateSystem::orderBy('id', 'desc')->first();
        $tauxFc = $taux ? $taux->TauxEnFc : 1;
        // Récupération de la date système (à adapter selon votre table)
        $dataSystem = TauxEtDateSystem::latest()->first();; 
        $dateSysteme = $dataSystem ? $dataSystem->DateSystem : now();
        $codeAgence = Auth::user()->codeAgence ?? '20'; // à adapter

        // Requête des messages éligibles
        $query = SendedSMS::whereBetween('dateEnvoie', [$dateDebut, $dateFin])
            ->where('messageStatus', 1)
            ->where('paidStatus', 0);

        if (!empty($exonere)) {
            $query->whereNotIn('statut', $exonere);
        }

        $messages = $query->get();

        if ($messages->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Aucun message éligible non exonéré trouvé.']);
        }

        // Grouper par compte et devise
        $grouped = $messages->groupBy(function($item) {
            return $item->NumCompte . '_' . $item->CodeMonnaie;
        });

        $now = now();
        $comptesInsuffisants = [];
        $idsTraites = []; // IDs des messages effectivement prélevés

        foreach ($grouped as $key => $msgs) {
            [$compte, $devise] = explode('_', $key);
            $nb = $msgs->count();
           $getFraisSms = EpargneAdhesionModel::first();
           $fraisSMS = $getFraisSms ? $getFraisSms->fraisSMS : 0;
            $montant = $devise == 1 ? $nb * $fraisSMS : $nb * $fraisSMS * $tauxFc;

            // Vérification du solde du compte
            if ($devise == 1) {
                $solde = Transactions::select(DB::raw("SUM(Creditusd) - SUM(Debitusd) as solde"))
                    ->where('NumCompte', $compte)
                    ->where('CodeMonnaie', 1)
                    ->first();
                $soldeActuel = $solde ? $solde->solde : 0;
            } else {
                $solde = Transactions::select(DB::raw("SUM(Creditfc) - SUM(Debitfc) as solde"))
                    ->where('NumCompte', $compte)
                    ->where('CodeMonnaie', 2)
                    ->first();
                $soldeActuel = $solde ? $solde->solde : 0;
            }

            if ($soldeActuel < $montant) {
                $comptesInsuffisants[] = [
                    'compte' => $compte,
                    'devise' => $devise == 1 ? 'USD' : 'FC',
                    'solde' => $soldeActuel,
                    'montantRequis' => $montant
                ];
                continue;
            }

            // ---- Génération du NumTransaction pour le débit ----
            $compteur = CompteurTransaction::create(['fakevalue' => '0000']);
            $numOperation = CompteurTransaction::latest()->first();
            $NumTransaction = substr(Auth::user()->name, 0, 2) . "00" . $numOperation->id;
            $numDossier = "DOS0" . $numOperation->id;
            $numDemande = "SMS0" . $numOperation->id;

            // Préparer les montants en USD/FC
            $debitUsd = ($devise == 1) ? $montant : 0;
            $debitFc  = ($devise == 2) ? $montant : 0;

            // Écriture : Débit du compte client
            Transactions::create([
                'NumTransaction'   => $NumTransaction,
                'DateTransaction'  => $dateSysteme,
                'DateSaisie'       => $dateSysteme,
                'Taux'             => $tauxFc,
                'TypeTransaction'  => 'D', // Débit
                'CodeMonnaie'      => $devise,
                'CodeAgence'       => $codeAgence,
                'NumDossier'       => $numDossier,
                'NumDemande'       => $numDemande,
                'NumCompte'        => $compte,
                'Debit'            => $montant,
                'Debitusd'         => $debitUsd,
                'Debitfc'          => $debitFc,
                'Credit'           => 0,
                'Creditusd'        => 0,
                'Creditfc'         => 0,
                'NomUtilisateur'   => Auth::user()->name,
                'Libelle'          => "Frais SMS pour {$nb} messages du {$dateDebut->toDateString()} au {$dateFin->toDateString()}",
            ]);

            // ---- Génération d'un second numéro pour le crédit (compte produit) ----
            $compteurProd = CompteurTransaction::create(['fakevalue' => '0000']);
            $numOperationProd = CompteurTransaction::latest()->first();
            $NumTransactionProd = substr(Auth::user()->name, 0, 2) . "00" . $numOperationProd->id;
            $numDossierProd = "DOS0" . $numOperationProd->id;
            $numDemandeProd = "SMS0" . $numOperationProd->id;

            $compteProduit = ($devise == 1) ? '7000201' : '7000202';
            $creditUsd = ($devise == 1) ? $montant : 0;
            $creditFc  = ($devise == 2) ? $montant : 0;

            // Écriture : Crédit du compte produit
            Transactions::create([
                'NumTransaction'   => $NumTransactionProd,
                'DateTransaction'  => $dateSysteme,
                'DateSaisie'       => $dateSysteme,
                'Taux'             => $tauxFc,
                'TypeTransaction'  => 'C', // Crédit
                'CodeMonnaie'      => $devise,
                'CodeAgence'       => $codeAgence,
                'NumDossier'       => $numDossierProd,
                'NumDemande'       => $numDemandeProd,
                'NumCompte'        => $compteProduit,
                'Debit'            => 0,
                'Debitusd'         => 0,
                'Debitfc'          => 0,
                'Credit'           => $montant,
                'Creditusd'        => $creditUsd,
                'Creditfc'         => $creditFc,
                'NomUtilisateur'   => Auth::user()->name,
                'Libelle'          => "Produit frais SMS - période {$dateDebut->toDateString()} au {$dateFin->toDateString()}",
            ]);

            // Mémoriser les IDs des messages de ce compte pour les marquer comme prélevés
            foreach ($msgs as $msg) {
                $idsTraites[] = $msg->id;
            }
        }

        // Mettre à jour le statut paidStatus des messages effectivement facturés
        if (!empty($idsTraites)) {
            SendedSMS::whereIn('id', $idsTraites)->update(['paidStatus' => 1]);
        }

        DB::commit();

        // Construction du message de retour
        $message = "Prélèvement effectué. " . count($idsTraites) . " message(s) facturé(s).";
        if (!empty($comptesInsuffisants)) {
            $message .= " Solde insuffisant pour les comptes : ";
            foreach ($comptesInsuffisants as $ins) {
                $message .= "{$ins['compte']} ({$ins['devise']}) , ";
            }
            $message = rtrim($message, ', ');
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'insuffisants' => $comptesInsuffisants // facultatif
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()], 500);
    }
}
}
