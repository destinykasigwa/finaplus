<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use GuzzleHttp\Exception\ClientException;

class BulkSMSController extends Controller
{
    public function envoyerSMS()
    {
        try {
            // Créer un client Guzzle
            $client = new Client();
            // Encoder le nom d'utilisateur et le mot de passe en base64
            $credentials = base64_encode('destin_kasigwa:destin1990@@');
            // Envoyer une requête POST à l'API BulkSMS avec authentification par token
            $response = $client->post('https://api.bulksms.com/v1/messages', [
                'headers' => [
                    'Authorization' => 'Basic ' . $credentials,
                ],
                'json' => [
                    'to' => '+243976518324',
                    'body' => 'Bonjour depuis Laravel et BulkSMS!',
                ]
            ]);



            // Vérifier la réponse et la traiter si nécessaire
            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            // Gérer la réponse de l'API BulkSMS ici

            // Retourner une réponse à l'utilisateur
            return response()->json(['status' => 'success', 'message' => 'SMS envoyé avec succès']);
        } catch (ClientException $e) {
            $statusCode = $e->getResponse()->getStatusCode();
            $responseBody = json_decode($e->getResponse()->getBody()->getContents(), true);

            // Vérifier si l'erreur est due à un solde insuffisant
            if ($statusCode === 403 && isset($responseBody['type']) && $responseBody['type'] === 'https://developer.bulksms.com/json/v1/errors#insufficient-credits') {
                return response()->json(['status' => 'error', 'message' => 'Solde insuffisant pour envoyer le SMS. Veuillez recharger votre compte.']);
            }

            // Si ce n'est pas une erreur due à un solde insuffisant, retourner un message générique
            return response()->json(['status' => 'error', 'message' => 'Une erreur s\'est produite lors de l\'envoi du SMS. Veuillez réessayer.']);
        }
    }
}
