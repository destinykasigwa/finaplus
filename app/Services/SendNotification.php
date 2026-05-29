<?php

namespace App\Services;


use Carbon\Carbon;
use App\Models\Comptes;
use App\Models\SendedSMS;
use App\Models\SMSBanking;
use App\Models\Portefeuille;
use App\Models\Transactions;
use App\Mail\TransactionsEmail;
use App\Models\TauxEtDateSystem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class SendNotification
{
    protected $africaTalking;

    public function __construct(AfricaTalkingService $africaTalking)
    {
        $this->africaTalking = $africaTalking;
    }


    //PERMET D'ENVOYER DES NOTIFICATION
    public function sendNotification($NumCompte, $devise, $montant, $typeTransaction, $operant)
    {
        if ($devise == 1) {
            $devise = "USD"; //USD
        } else if ($devise == 2) {
            $devise = "CDF"; //CDF
        } else {
            $devise;
        }

        //RECUPERE LES INFORMATIONS DE LA PERSONNE QUI VENAIT D'EFFECTUER UN MOUVEMENT
        $getMembreInfo = SMSBanking::where("NumAbrege", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
        if ($getMembreInfo) {
            if ($getMembreInfo->Email != null and $getMembreInfo->ActivatedEmail == 1) {
                if ($devise == "CDF") {
                    $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                    //RECUPERE LE SOLDE DU MEMBRE EN FC 
                    $compteCDF = $getMembreInfo2->NumCompte;
                    $soldeMembreCDF = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                    )->where("NumCompte", '=', $compteCDF)
                        ->groupBy("NumCompte")
                        ->first();

                    $data = ($getMembreInfo2->sexe == "Homme" ? " Bonjour Monsieur " : ($getMembreInfo2->sexe == "Femme" ? " Bonjour Madame " : " Bonjour ")) .
                        $getMembreInfo2->NomCompte . " Votre compte CDF-" . $NumCompte . ($typeTransaction == "C" ? " est crédité " : "debité ") . " de " . $montant . " CDF  Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";
                    Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                    // return view('emails.test');
                } else if ($devise == "USD") {
                    $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();

                    $NumCompteUSD = $getMembreInfo2->NumCompte;

                    //RECUPERE LE SOLDE DU MEMBRE EN USD
                    $soldeMembreUSD = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $NumCompteUSD)
                        ->groupBy("NumCompte")
                        ->first();

                    // $data = $getMembreInfo2->sexe == "Homme" ? "Bonjour Monsieur" : ($getMembreInfo2->sexe == "Femme"  ? "Bonjour Madame" : "Bonjour") .
                    //     $getMembreInfo2->NomCompte . " Votre compte USD " . $NumCompteUSD . " est crédité de " . $montantDepot . " USD Votre nouveau solde est de  " . $soldeMembreUSD->soldeMembreUSD . "USD";


                    $data = ($getMembreInfo2->sexe == "Homme"
                        ? "Bonjour Monsieur"
                        : ($getMembreInfo2->sexe == "Femme"
                            ? "Bonjour Madame"
                            : "Bonjour"))
                        . " " . $getMembreInfo2->NomCompte
                        . " Votre compte USD-" . $NumCompte .
                        ($typeTransaction == "C" ? " est crédité " : "debité " .
                            " est crédité de ") . $montant
                        . " USD. Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD.";

                    Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                }
            }
            if ($getMembreInfo->Telephone != null and $getMembreInfo->ActivatedSMS == 1) {

                if ($devise == "CDF") {
                    try {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $NumCompteCDF = $getMembreInfo2->NumCompte;
                        $soldeMembreCDF = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                        )->where("NumCompte", '=', $NumCompteCDF)
                            ->groupBy("NumCompte")
                            ->first();

                        // $message = ($getMembreInfo2->sexe == "Homme")
                        //     ? "Bonjour Monsieur "
                        //     : (($getMembreInfo2->sexe == "Femme")
                        //         ? "Bonjour Madame "
                        //         : "Bonjour ");

                        $message = $getMembreInfo2->NomCompte . ", Votre compte CDF-" . $NumCompte .
                            ($typeTransaction == "C" ? " est credite " : " est debite ") .
                            " de " . $montant .
                            ($typeTransaction == "C" ? " depot de " : " retrait de ") . $operant . " Votre nouveau solde est de " . number_format($soldeMembreCDF->soldeMembreCDF, 2, ',', ' ') . " CDF";

                        $receiver_number = $getMembreInfo->Telephone;
                        $response = $this->africaTalking->sendSms($receiver_number, $message);
                        //Log::info(json_encode($response));
                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            $CodeMonnaie = 2;
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteCDF,
                                "CodeMonnaie" => $CodeMonnaie,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            $CodeMonnaie = 2;
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteCDF,
                                "CodeMonnaie" => $CodeMonnaie,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        }
                    } catch (\Throwable $th) {
                        throw $th;
                    }
                } else if ($devise == "USD") {
                    try {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $NumCompteUSD = $getMembreInfo2->NumCompte;
                        $soldeMembreUSD = Transactions::select(
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $NumCompteUSD)
                            ->groupBy("NumCompte")
                            ->first();

                        $receiver_number = $getMembreInfo->Telephone;
                        // $message = ($getMembreInfo2->sexe == "Homme")
                        //     ? "Bonjour Monsieur "
                        //     : (($getMembreInfo2->sexe == "Femme")
                        //         ? "Bonjour Madame "
                        //         : "Bonjour ");

                        $message = $getMembreInfo2->NomCompte . " Votre compte USD-" . $NumCompte .
                            ($typeTransaction == "C" ? " est credite " : " est debite ") .
                            " de " . $montant . ($typeTransaction == "C" ? " depot de " : " retrait de ") . $operant . ". Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";

                        $receiver_number = $getMembreInfo->Telephone;
                        $response = $this->africaTalking->sendSms($receiver_number, $message);

                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteUSD,
                                "CodeMonnaie" => 1,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteUSD,
                                "CodeMonnaie" => 1,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        }
                    } catch (\Throwable $th) {
                        throw $th;
                    }
                }
            }
        }
    }


    //PERMET D'ENVOYER UNE NOTIFICATION LORS DE L'ANNULATION D'UNE OPERATION

    public function sendNotificationExtourneOp($NumCompte, $devise, $montant, $typeTransaction)
    {
        // if ($codeMonnaie == 1) {
        //     $devise = "USD"; //USD
        // } else if ($codeMonnaie == 2) {
        //     $devise = "CDF"; //CDF
        // }
        //RECUPERE LES INFORMATIONS DE LA PERSONNE QUI VENAIT D'EFFECTUER UN MOUVEMENT
        $getMembreInfo = SMSBanking::where("NumAbrege", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
        if ($getMembreInfo) {
            if ($getMembreInfo->Email != null and $getMembreInfo->ActivatedEmail == 1) {
                if ($devise == "CDF") {
                    $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                    //RECUPERE LE SOLDE DU MEMBRE EN FC 
                    $compteCDF = $getMembreInfo2->NumCompte;
                    $soldeMembreCDF = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                    )->where("NumCompte", '=', $compteCDF)
                        ->groupBy("NumCompte")
                        ->first();

                    $data = ($getMembreInfo2->sexe == "Homme" ? " Bonjour Monsieur " : ($getMembreInfo2->sexe == "Femme" ? " Bonjour Madame " : " Bonjour ")) .
                        $getMembreInfo2->NomCompte . " Annulation " . ($typeTransaction == "C" ? " de votre depot" : " de votre retrait ") . " de " . $montant . " sur votre compte CDF-" . $NumCompte . "  Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";
                    Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                    // return view('emails.test');
                } else if ($devise == "USD") {
                    $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();

                    $NumCompteUSD = $getMembreInfo2->NumCompte;

                    //RECUPERE LE SOLDE DU MEMBRE EN USD
                    $soldeMembreUSD = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $NumCompteUSD)
                        ->groupBy("NumCompte")
                        ->first();

                    // $data = $getMembreInfo2->sexe == "Homme" ? "Bonjour Monsieur" : ($getMembreInfo2->sexe == "Femme"  ? "Bonjour Madame" : "Bonjour") .
                    //     $getMembreInfo2->NomCompte . " Votre compte USD " . $NumCompteUSD . " est crédité de " . $montantDepot . " USD Votre nouveau solde est de  " . $soldeMembreUSD->soldeMembreUSD . "USD";


                    $data = ($getMembreInfo2->sexe == "Homme"
                        ? "Bonjour Monsieur"
                        : ($getMembreInfo2->sexe == "Femme"
                            ? "Bonjour Madame"
                            : "Bonjour"))
                        . " " .  $getMembreInfo2->NomCompte . ", Annulation " . ($typeTransaction == "C" ? " de votre dépot " : "de votre retrait ") . " de " . $montant . " sur votre compte USD-" . $NumCompte . "  Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreCDF) . " USD";

                    Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                }
            }
            if ($getMembreInfo->Telephone != null and $getMembreInfo->ActivatedSMS == 1) {

                if ($devise == "CDF") {
                    try {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $NumCompteCDF = $getMembreInfo2->NumCompte;
                        $soldeMembreCDF = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                        )->where("NumCompte", '=', $NumCompteCDF)
                            ->groupBy("NumCompte")
                            ->first();

                        // $message = ($getMembreInfo2->sexe == "Homme")
                        //     ? "Bonjour Monsieur "
                        //     : (($getMembreInfo2->sexe == "Femme")
                        //         ? "Bonjour Madame "
                        //         : "Bonjour ");

                        $message =  $getMembreInfo2->NomCompte . ", Annulation " . ($typeTransaction == "C" ? " de votre depot " : "de votre retrait ") . " de " . $montant . " sur votre compte CDF-" . $NumCompte . "  Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";

                        $receiver_number = $getMembreInfo->Telephone;
                        $response = $this->africaTalking->sendSms($receiver_number, $message);
                        //Log::info(json_encode($response));
                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteCDF,
                                "CodeMonnaie" => 2,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteCDF,
                                "CodeMonnaie" => 2,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        }
                    } catch (\Throwable $th) {
                        throw $th;
                    }
                } else if ($devise == "USD") {
                    try {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $NumCompteUSD = $getMembreInfo2->NumCompte;
                        $soldeMembreUSD = Transactions::select(
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $NumCompteUSD)
                            ->groupBy("NumCompte")
                            ->first();

                        $receiver_number = $getMembreInfo->Telephone;
                        // $message = ($getMembreInfo2->sexe == "Homme")
                        //     ? "Bonjour Monsieur "
                        //     : (($getMembreInfo2->sexe == "Femme")
                        //         ? "Bonjour Madame "
                        //         : "Bonjour ");

                        $message =  $getMembreInfo2->NomCompte . ", Annulation " . ($typeTransaction == "C" ? " de votre depot " : "de votre retrait ") . " de " . $montant . " sur votre compte USD-" . $NumCompte . "  Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";
                        $receiver_number = $getMembreInfo->Telephone;
                        $response = $this->africaTalking->sendSms($receiver_number, $message);

                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteUSD,
                                "CodeMonnaie" => 1,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteUSD,
                                "CodeMonnaie" => 1,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        }
                    } catch (\Throwable $th) {
                        throw $th;
                    }
                }
            }
        }
    }

    //CETTE FONCTION ENVOIE DE MESSAGE A UN CREDIT POUR UN MOUVEMENT DANS LE MENU Comptabilite
    public function sendNotificationComptabilite($NumCompte, $devise, $montant, $typeTransaction, $libelle)
    {
        // if ($codeMonnaie == 1) {
        //     $devise = "USD"; //USD
        // } else if ($codeMonnaie == 2) {
        //     $devise = "CDF"; //CDF
        // }
        //RECUPERE LES INFORMATIONS DE LA PERSONNE QUI VENAIT D'EFFECTUER UN MOUVEMENT
        $getMembreInfo = SMSBanking::where("NumAbrege", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
        if ($getMembreInfo) {
            if ($getMembreInfo->Email != null and $getMembreInfo->ActivatedEmail == 1) {
                if ($devise == "CDF") {
                    $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                    //RECUPERE LE SOLDE DU MEMBRE EN FC 
                    $compteCDF = $getMembreInfo2->NumCompte;
                    $soldeMembreCDF = Transactions::select(
                        DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                    )->where("NumCompte", '=', $compteCDF)
                        ->groupBy("NumCompte")
                        ->first();

                    $data = ($getMembreInfo2->sexe == "Homme" ? " Bonjour Monsieur " : ($getMembreInfo2->sexe == "Femme" ? " Bonjour Madame " : " Bonjour ")) .
                        $getMembreInfo2->NomCompte . " Votre compte CDF-" . $NumCompte . ($typeTransaction == "C" ? " est crédité " : "debité ") . " de " . $montant . " " . $libelle . "  Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";
                    Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                    // return view('emails.test');
                } else if ($devise == "USD") {
                    $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();

                    $NumCompteUSD = $getMembreInfo2->NumCompte;

                    //RECUPERE LE SOLDE DU MEMBRE EN USD
                    $soldeMembreUSD = Transactions::select(
                        DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                    )->where("NumCompte", '=', $NumCompteUSD)
                        ->groupBy("NumCompte")
                        ->first();

                    // $data = $getMembreInfo2->sexe == "Homme" ? "Bonjour Monsieur" : ($getMembreInfo2->sexe == "Femme"  ? "Bonjour Madame" : "Bonjour") .
                    //     $getMembreInfo2->NomCompte . " Votre compte USD " . $NumCompteUSD . " est crédité de " . $montantDepot . " USD Votre nouveau solde est de  " . $soldeMembreUSD->soldeMembreUSD . "USD";


                    $data = ($getMembreInfo2->sexe == "Homme" ? " Bonjour Monsieur " : ($getMembreInfo2->sexe == "Femme" ? " Bonjour Madame " : " Bonjour ")) .
                        $getMembreInfo2->NomCompte . " Votre compte USD-" . $NumCompte . ($typeTransaction == "C" ? " est crédité " : "debité ") . " de " . $montant . " " . $libelle . "  Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";

                    Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                }
            }
            if ($getMembreInfo->Telephone != null and $getMembreInfo->ActivatedSMS == 1) {

                if ($devise == "CDF") {
                    try {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $NumCompteCDF = $getMembreInfo2->NumCompte;
                        $soldeMembreCDF = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                        )->where("NumCompte", '=', $NumCompteCDF)
                            ->groupBy("NumCompte")
                            ->first();

                        // $message = ($getMembreInfo2->sexe == "Homme")
                        //     ? "Bonjour Monsieur "
                        //     : (($getMembreInfo2->sexe == "Femme")
                        //         ? "Bonjour Madame "
                        //         : "Bonjour ");
                        $message =   $getMembreInfo2->NomCompte . " Votre compte CDF-" . $NumCompte . ($typeTransaction == "C" ? " est credite " : " debite ") . " de " . $montant . " " . $libelle . "  Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";
                        $receiver_number = $getMembreInfo->Telephone;
                        $response = $this->africaTalking->sendSms($receiver_number, $message);
                        //Log::info(json_encode($response));
                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteCDF,
                                "CodeMonnaie" => 2,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteCDF,
                                "CodeMonnaie" => 2,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        }
                    } catch (\Throwable $th) {
                        throw $th;
                    }
                } else if ($devise == "USD") {
                    try {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $NumCompteUSD = $getMembreInfo2->NumCompte;
                        $soldeMembreUSD = Transactions::select(
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $NumCompteUSD)
                            ->groupBy("NumCompte")
                            ->first();
                        $receiver_number = $getMembreInfo->Telephone;
                        // $message = ($getMembreInfo2->sexe == "Homme")
                        //     ? "Bonjour Monsieur "
                        //     : (($getMembreInfo2->sexe == "Femme")
                        //         ? "Bonjour Madame "
                        //         : "Bonjour ");

                        $message =   $getMembreInfo2->NomCompte . ", Votre compte USD-" . $NumCompte . ($typeTransaction == "C" ? " est credite" : " debite ") . " de " . $montant . " " . $libelle . "  Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";
                        $receiver_number = $getMembreInfo->Telephone;
                        $response = $this->africaTalking->sendSms($receiver_number, $message);

                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteUSD,
                                "CodeMonnaie" => 1,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $NumCompteUSD,
                                "CodeMonnaie" => 1,
                                "statut" => $typeTransaction == "C" ? "depot" : "retrait"
                            ]);
                        }
                    } catch (\Throwable $th) {
                        throw $th;
                    }
                }
            }
        }
    }


  public function sendNotificationOctroiCredit($NumCompte, $devise, $montant, $libelle)
{
    // Récupérer les informations du membre
    $getMembreInfo = SMSBanking::where("NumAbrege", $NumCompte)
        ->orWhere("NumCompte", $NumCompte)
        ->first();
    if (!$getMembreInfo) return;

    // Récupérer le compte (nom, sexe) via NumCompte, NumAdherant ou Num_Manuel
    $compte = Comptes::where("NumCompte", $NumCompte)
        ->orWhere("NumAdherant", $NumCompte)
        ->orWhere("Num_Manuel", $NumCompte)
        ->first();
    if (!$compte) return;

    // Convertir le montant en float pour number_format
    $montantFloat = (float)$montant;
    $montantFormate = number_format($montantFloat, 0, ',', ' ');

    // Récupérer le solde du compte après octroi (dans la bonne devise)
    $solde = 0;
    if ($devise == "CDF") {
        $soldeMembre = Transactions::select(DB::raw("SUM(Creditfc)-SUM(Debitfc) as solde"))
            ->where("NumCompte", $compte->NumCompte)
            ->first();
        $solde = $soldeMembre ? (float)$soldeMembre->solde : 0;
    } else {
        $soldeMembre = Transactions::select(DB::raw("SUM(Creditusd)-SUM(Debitusd) as solde"))
            ->where("NumCompte", $compte->NumCompte)
            ->first();
        $solde = $soldeMembre ? (float)$soldeMembre->solde : 0;
    }
    $soldeFormate = number_format($solde, 0, ',', ' ');

    // Construction du message court
    $nomCourt = strtok($compte->NomCompte, ' ');
    $civilite = '';
    if ($compte->sexe == 'Homme') $civilite = 'M. ';
    elseif ($compte->sexe == 'Femme') $civilite = 'Mme ';

    $message = $civilite . $nomCourt . ", votre credit de " . $montantFormate . " " . $devise . " a ete decaisse. Nouveau solde: " . $soldeFormate . " " . $devise;

    // Raccourcir si > 160 caractères
    if (strlen($message) > 160) {
        $message = $civilite . $nomCourt . ", crédit décaissé: " . $montantFormate . " " . $devise . ". Solde: " . $soldeFormate . " " . $devise;
    }
    if (strlen($message) > 160) {
        $message = "Crédit décaissé: " . $montantFormate . " " . $devise . ". Solde: " . $soldeFormate . " " . $devise;
    }
    if (strlen($message) > 160) {
        $message = substr($message, 0, 157) . '...';
    }

    // Envoi Email
    
    $message = $civilite . $nomCourt . ", votre crédit de " . $montantFormate . " " . $devise . " a été décaissé. Nouveau solde: " . $soldeFormate . " " . $devise;
    if ($getMembreInfo->Email && $getMembreInfo->ActivatedEmail == 1) {
        Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($message));
    }

    // Envoi SMS
    if ($getMembreInfo->Telephone && $getMembreInfo->ActivatedSMS == 1) {
        try {
            
            $message = $civilite . $nomCourt . ", votre credit de " . $montantFormate . " " . $devise . " a ete decaisse. Nouveau solde: " . $soldeFormate . " " . $devise;
            $response = $this->africaTalking->sendSms($getMembreInfo->Telephone, $message);
            $status = ($response['status'] == 'success') ? 1 : 0;
            SendedSMS::create([
                "numPhone" => $getMembreInfo->Telephone,
                "messageStatus" => $status,
                "paidStatus" => 0,
                "dateEnvoie" => date("Y-m-d"),
                "NumCompte" => $compte->NumCompte,
                "CodeMonnaie" => ($devise == "CDF") ? 2 : 1,
                "statut" => "octroi_credit"
            ]);
        } catch (\Throwable $th) {
            Log::error("Erreur envoi SMS octroi crédit: " . $th->getMessage());
        }
    }
}


    //PERMET D'ENVOYER DES NOTIFICATION
    public function sendNotificationRemboursementCredit($NumCompte, $devise, $montant, $typeTransaction, $isPartielOrComplete)
    {
        if ($typeTransaction == "Interet") {
            //RECUPERE LES INFORMATIONS DE LA PERSONNE QUI VENAIT D'EFFECTUER UN MOUVEMENT
            $getMembreInfo = SMSBanking::where("NumAbrege", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
            if ($getMembreInfo) {
                if ($getMembreInfo->Email != null and $getMembreInfo->ActivatedEmail == 1) {
                    if ($devise == "CDF") {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN FC 
                        $compteCDF = $getMembreInfo2->NumCompte;
                        $soldeMembreCDF = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                        )->where("NumCompte", '=', $compteCDF)
                            ->groupBy("NumCompte")
                            ->first();

                        $data = ($getMembreInfo2->sexe == "Homme")
                            ? "Bonjour Monsieur "
                            : (($getMembreInfo2->sexe == "Femme")
                                ? "Bonjour Madame "
                                : "Bonjour ");

                        $data .= $getMembreInfo2->NomCompte . " Votre compte CDF-" . $NumCompte .
                            " est debité de " . $montant . " capital ordinaire du credit " . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";
                        Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                        // return view('emails.test');
                    } else if ($devise == "USD") {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();

                        $NumCompteUSD = $getMembreInfo2->NumCompte;

                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $soldeMembreUSD = Transactions::select(
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $NumCompteUSD)
                            ->groupBy("NumCompte")
                            ->first();

                        // $data = $getMembreInfo2->sexe == "Homme" ? "Bonjour Monsieur" : ($getMembreInfo2->sexe == "Femme"  ? "Bonjour Madame" : "Bonjour") .
                        //     $getMembreInfo2->NomCompte . " Votre compte USD " . $NumCompteUSD . " est crédité de " . $montantDepot . " USD Votre nouveau solde est de  " . $soldeMembreUSD->soldeMembreUSD . "USD";


                        $data = ($getMembreInfo2->sexe == "Homme")
                            ? "Bonjour Monsieur "
                            : (($getMembreInfo2->sexe == "Femme")
                                ? "Bonjour Madame "
                                : "Bonjour ");

                        $data .= $getMembreInfo2->NomCompte . " Votre compte USD-" . $NumCompte .
                            " est debite de " . $montant . " capital ordinaire du credit " . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";

                        Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                    }
                }
                if ($getMembreInfo->Telephone != null and $getMembreInfo->ActivatedSMS == 1) {

                    if ($devise == "CDF") {
                        try {
                            $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                            //RECUPERE LE SOLDE DU MEMBRE EN USD
                            $NumCompteCDF = $getMembreInfo2->NumCompte;
                            $soldeMembreCDF = Transactions::select(
                                DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                            )->where("NumCompte", '=', $NumCompteCDF)
                                ->groupBy("NumCompte")
                                ->first();

                            // $message = ($getMembreInfo2->sexe == "Homme")
                            //     ? "Bonjour Monsieur "
                            //     : (($getMembreInfo2->sexe == "Femme")
                            //         ? "Bonjour Madame "
                            //         : "Bonjour ");

                            $message = $getMembreInfo2->NomCompte . ", Votre compte CDF-" . $NumCompte .
                                " est debite de " . $montant . " interet ordinaire du credit " . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";

                            $receiver_number = $getMembreInfo->Telephone;
                            $response = $this->africaTalking->sendSms($receiver_number, $message);
                            //Log::info(json_encode($response));
                            if ($response['status'] == 'success') {
                                // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 1,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteCDF,
                                    "CodeMonnaie" => 2,
                                    "statut" => "remboursement"
                                ]);
                            } else {
                                // Traiter l'échec, par exemple, loguer l'erreur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 0,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteCDF,
                                    "CodeMonnaie" => 2,
                                    "statut" => "remboursement"
                                ]);
                            }
                        } catch (\Throwable $th) {
                            throw $th;
                        }
                    } else if ($devise == "USD") {
                        try {
                            $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                            //RECUPERE LE SOLDE DU MEMBRE EN USD
                            $NumCompteUSD = $getMembreInfo2->NumCompte;
                            $soldeMembreUSD = Transactions::select(
                                DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                            )->where("NumCompte", '=', $NumCompteUSD)
                                ->groupBy("NumCompte")
                                ->first();

                            $receiver_number = $getMembreInfo->Telephone;
                            // $message = ($getMembreInfo2->sexe == "Homme")
                            //     ? "Bonjour Monsieur "
                            //     : (($getMembreInfo2->sexe == "Femme")
                            //         ? "Bonjour Madame "
                            //         : "Bonjour ");

                            $message = $getMembreInfo2->NomCompte . ", Votre compte USD-" . $NumCompte .
                                " est debite de " . $montant . " interet ordinaire du credit " . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";

                            $receiver_number = $getMembreInfo->Telephone;
                            $response = $this->africaTalking->sendSms($receiver_number, $message);

                            if ($response['status'] == 'success') {
                                // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 1,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteUSD,
                                    "CodeMonnaie" => 1,
                                    "statut" => "remboursement"

                                ]);
                            } else {
                                // Traiter l'échec, par exemple, loguer l'erreur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 0,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteUSD,
                                    "CodeMonnaie" => 1,
                                    "statut" => "remboursement"
                                ]);
                            }
                        } catch (\Throwable $th) {
                            throw $th;
                        }
                    }
                }
            }
        } else if ($typeTransaction == "Capital") {
            //RECUPERE LES INFORMATIONS DE LA PERSONNE QUI VENAIT D'EFFECTUER UN MOUVEMENT
            $getMembreInfo = SMSBanking::where("NumAbrege", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
            if ($getMembreInfo) {
                if ($getMembreInfo->Email != null and $getMembreInfo->ActivatedEmail == 1) {
                    if ($devise == "CDF") {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                        //RECUPERE LE SOLDE DU MEMBRE EN FC 
                        $compteCDF = $getMembreInfo2->NumCompte;
                        $soldeMembreCDF = Transactions::select(
                            DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                        )->where("NumCompte", '=', $compteCDF)
                            ->groupBy("NumCompte")
                            ->first();

                        $data = ($getMembreInfo2->sexe == "Homme")
                            ? "Bonjour Monsieur "
                            : (($getMembreInfo2->sexe == "Femme")
                                ? "Bonjour Madame "
                                : "Bonjour ");

                        $data .= $getMembreInfo2->NomCompte . " Votre compte CDF-" . $NumCompte .
                            " est debité de " . $montant . " capital ordinaire du credit " . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";
                        Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                        // return view('emails.test');
                    } else if ($devise == "USD") {
                        $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();

                        $NumCompteUSD = $getMembreInfo2->NumCompte;

                        //RECUPERE LE SOLDE DU MEMBRE EN USD
                        $soldeMembreUSD = Transactions::select(
                            DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                        )->where("NumCompte", '=', $NumCompteUSD)
                            ->groupBy("NumCompte")
                            ->first();
                        $data = ($getMembreInfo2->sexe == "Homme")
                            ? "Bonjour Monsieur "
                            : (($getMembreInfo2->sexe == "Femme")
                                ? "Bonjour Madame "
                                : "Bonjour ");

                        $data .= $getMembreInfo2->NomCompte . " Votre compte USD-" . $NumCompte .
                            " est debité de " . $montant . " capital ordinaire du credit" . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";

                        Mail::to($getMembreInfo->Email)->send(new TransactionsEmail($data));
                    }
                }
                if ($getMembreInfo->Telephone != null and $getMembreInfo->ActivatedSMS == 1) {

                    if ($devise == "CDF") {
                        try {
                            $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 2)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                            //RECUPERE LE SOLDE DU MEMBRE EN USD
                            $NumCompteCDF = $getMembreInfo2->NumCompte;
                            $soldeMembreCDF = Transactions::select(
                                DB::raw("SUM(Creditfc)-SUM(Debitfc) as soldeMembreCDF"),
                            )->where("NumCompte", '=', $NumCompteCDF)
                                ->groupBy("NumCompte")
                                ->first();

                            $message = $getMembreInfo2->NomCompte . ", Votre compte CDF-" . $NumCompte .
                                " est debite de " . $montant . " capital ordinaire du credit" . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreCDF->soldeMembreCDF) . " CDF";

                            $receiver_number = $getMembreInfo->Telephone;
                            $response = $this->africaTalking->sendSms($receiver_number, $message);
                            //Log::info(json_encode($response));
                            if ($response['status'] == 'success') {
                                // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 1,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteCDF,
                                    "CodeMonnaie" => 2,
                                    "statut" => "remboursement"
                                ]);
                            } else {
                                // Traiter l'échec, par exemple, loguer l'erreur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 0,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteCDF,
                                    "CodeMonnaie" => 2,
                                    "statut" => "remboursement"
                                ]);
                            }
                        } catch (\Throwable $th) {
                            throw $th;
                        }
                    } else if ($devise == "USD") {
                        try {
                            $getMembreInfo2 = Comptes::where("CodeMonnaie", "=", 1)->where("NumAdherant", "=", $NumCompte)->orWhere("NumCompte", $NumCompte)->first();
                            //RECUPERE LE SOLDE DU MEMBRE EN USD
                            $NumCompteUSD = $getMembreInfo2->NumCompte;
                            $soldeMembreUSD = Transactions::select(
                                DB::raw("SUM(Creditusd)-SUM(Debitusd) as soldeMembreUSD"),
                            )->where("NumCompte", '=', $NumCompteUSD)
                                ->groupBy("NumCompte")
                                ->first();

                            $receiver_number = $getMembreInfo->Telephone;
                            // $message = ($getMembreInfo2->sexe == "Homme")
                            //     ? "Bonjour Monsieur "
                            //     : (($getMembreInfo2->sexe == "Femme")
                            //         ? "Bonjour Madame "
                            //         : "Bonjour ");

                            $message = $getMembreInfo2->NomCompte . ", Votre compte USD-" . $NumCompte .
                                " est debite de " . $montant . " capital ordinaire du credit " . $isPartielOrComplete . " Votre nouveau solde est de " .  number_format($soldeMembreUSD->soldeMembreUSD) . " USD";

                            $receiver_number = $getMembreInfo->Telephone;
                            $response = $this->africaTalking->sendSms($receiver_number, $message);

                            if ($response['status'] == 'success') {
                                // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 1,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteUSD,
                                    "CodeMonnaie" => 1,
                                    "statut" => "remboursement"
                                ]);
                            } else {
                                // Traiter l'échec, par exemple, loguer l'erreur
                                SendedSMS::create([
                                    "numPhone" => $receiver_number,
                                    "messageStatus" => 0,
                                    "paidStatus" => 0,
                                    "dateEnvoie" => date("Y-m-d"),
                                    "NumCompte" => $NumCompteUSD,
                                    "CodeMonnaie" => 1,
                                    "statut" => "remboursement"
                                ]);
                            }
                        } catch (\Throwable $th) {
                            throw $th;
                        }
                    }
                }
            }
        }
    }

    //PERMET D'ENVOYER UNE NOTIFACTION DE RAPPEL DE REMBOURSEMENT

    public function RappelRemboursementCredit()
    {
        // Date du jour
        // $dateDuJour = TauxEtDateSystem::latest()->first()->DateSystem;
        $dateDuJour = date("Y-m-d");
        $dateDuJour = Carbon::createFromFormat('Y-m-d', $dateDuJour)->startOfDay();
        $dateRemboursement = $dateDuJour->copy()->addDays(3)->startOfDay();
        $dateCible = $dateRemboursement->copy()->subDays(3)->startOfDay();
        // Logs pour vérification
        info("Date du jour : " . $dateDuJour);
        info("Date de remboursement : " . $dateRemboursement);
        info("Date cible : " . $dateCible);
        // Date cible (3 jours avant la date de tranche)
        // $dateCible = $dateDuJour->addDays(3);
        //RECUPERE LES INFORMATIONS RELATIVES AU PORTE FEUILLE MAIS AUSSI L'ECHEANCIER
        if ($dateDuJour->equalTo($dateCible)) {
            info("okkk " . $dateRemboursement);
            $getPorteFeuille = Portefeuille::where("portefeuilles.Octroye", 1)
                ->where("portefeuilles.Accorde", 1)
                ->where("portefeuilles.Cloture", 0)
                ->where("echeanciers.DateTranch", $dateRemboursement->format('Y-m-d'))
                ->join("echeanciers", "portefeuilles.NumDossier", "=", "echeanciers.NumDossier")->get();

            info($getPorteFeuille);
            if ($getPorteFeuille->isNotEmpty()) {
                //info("okkk22");
                for ($i = 0; $i < sizeof($getPorteFeuille); $i++) {
                    //CHECK IF USER EXISTER ON NOTIFICATION
                    $checkMembreExistOnSMSAlert = SMSBanking::where("NumAbrege", "=", $getPorteFeuille[$i]->numAdherant)->where("ActivatedSMS", 1)->first();
                    if ($checkMembreExistOnSMSAlert) {
                        info("ok message sould be sent");
                        //S'IL EST ABONNE SUR LES SMS ON L'ENVOIE UN MESSAGE
                        $receiver_number = $checkMembreExistOnSMSAlert->Telephone;
                        $message = " Ns vs rappellons que votre " . $getPorteFeuille[$i]->NbreJour .
                            "e tranche Doss. " . $getPorteFeuille[$i]->NumDossier
                            . " tombe ce " . Carbon::parse($getPorteFeuille[$i]->DateTranch)->format('d-m-Y')
                            . ". Cap " . $getPorteFeuille[$i]->CapAmmorti . " Int " . $getPorteFeuille[$i]->Interet
                            . " " . $getPorteFeuille[$i]->CodeMonnaie
                            . " Ns vs remercions de vs acquitter ds le delais.";
                        $response = $this->africaTalking->sendSms($receiver_number, $message);
                        if ($response['status'] == 'success') {
                            // Traiter le succès, par exemple, loguer ou notifier l'utilisateur
                            $CodeMonnaie = $getPorteFeuille[$i]->CodeMonnaie == "CDF" ? 2 : 1;
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 1,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $getPorteFeuille[$i]->NumCompteEpargne,
                                "CodeMonnaie" => $CodeMonnaie,
                                "statut" => "rappel_remboursement"
                            ]);
                        } else {
                            // Traiter l'échec, par exemple, loguer l'erreur
                            $CodeMonnaie = $getPorteFeuille[$i]->CodeMonnaie == "CDF" ? 2 : 1;
                            SendedSMS::create([
                                "numPhone" => $receiver_number,
                                "messageStatus" => 0,
                                "paidStatus" => 0,
                                "dateEnvoie" => date("Y-m-d"),
                                "NumCompte" => $getPorteFeuille[$i]->NumCompteEpargne,
                                "CodeMonnaie" => $CodeMonnaie,
                                "statut" => "rappel_remboursement"
                            ]);
                        }
                    }
                    $checkMembreExistOnEmailAlert = SMSBanking::where("NumAbrege", "=", $getPorteFeuille[$i]->numAdherant)->where("ActivatedEmail", 1)->first();
                    if ($checkMembreExistOnEmailAlert) {
                        //info("ok email sould be sent");
                        $data = ($checkMembreExistOnEmailAlert->sexe == "Homme")
                            ? "Bonjour Monsieur "
                            : (($checkMembreExistOnEmailAlert->sexe == "Femme")
                                ? "Bonjour Madame "
                                : "Bonjour ");

                        $data .= $getPorteFeuille[$i]->NomCompte . " Nous vous rappellons que votre " . $getPorteFeuille[$i]->NbreJour .
                            " e tranche Doss. " . $getPorteFeuille[$i]->NumDossier
                            . " tombe ce " . Carbon::parse($getPorteFeuille[$i]->DateTranch)->format('d-m-Y')
                            . ". Cap " . $getPorteFeuille[$i]->CapAmmorti . " Int " . $getPorteFeuille[$i]->Interet
                            . " " . $getPorteFeuille[$i]->CodeMonnaie
                            . " Ns vs remercions de vs acquitter ds le delais.";
                        Mail::to($checkMembreExistOnEmailAlert->Email)->send(new TransactionsEmail($data));
                    }
                }
            } else {
                info("not okkk22");
            }
        } else {
            info("not okk");
        }
    }
}
