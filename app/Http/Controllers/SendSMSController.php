<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use Twilio\Rest\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\TestSmsNotification;

class SendSMSController extends Controller
{

    public function sendSms(Request $request)
    {
        try {
            $receiver_number = $request->number;
            $message = "Bonjour test";
            $account_sid = getenv("TWILIO_SID");
            $auth_token = getenv("TWILIO_TOKEN");
            $twilio_number = getenv("TWILIO_FROM");

            $client = new Client($account_sid, $auth_token);
            $client->messages->create($receiver_number, [
                'from' => $twilio_number,
                'body' => $message,

            ]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function smsHomepage()
    {
        return view("send-sms");
    }
}
