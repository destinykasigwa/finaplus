<?php

namespace App\Services;


use AfricasTalking\SDK\AfricasTalking;

class AfricaTalkingService
{
    protected $username;
    protected $apiKey;
    protected $senderId;

    public function __construct()
    {

        // dd(env('AFRICA_TALKING_SENDER_ID'));
        $this->username = env('AFRICA_TALKING_USERNAME');
        $this->apiKey = env('AFRICA_TALKING_API_KEY');
        $this->senderId = env('AFRICA_TALKING_SENDER_ID', 'default_sender'); // Facultatif

        // Debug: vérifier les valeurs
        //dd($this->username, $this->apiKey, $this->senderId);
    }

    public function sendSms($to, $message)
    {
        $AT = new AfricasTalking($this->username, $this->apiKey);

        $sms = $AT->sms();
        $response = $sms->send([
            'to' => $to,
            'message' => $message,
            'from' => $this->senderId, // Optionnel
        ]);

        return $response;
    }
}
