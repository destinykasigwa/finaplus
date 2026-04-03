<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SessionController extends Controller
{
    //
    public function checkSessionExpiration(Request $request)
    {
        // dd($request->session());
        // Vérifier si l'utilisateur est connecté
        if (auth()->check()) {
            // L'utilisateur est connecté, donc la session n'a pas expiré
            return response()->json(['sessionExpired' => false]);
        } else {
            //dd($request->session()->get('requested_page_url__'));
            // L'utilisateur n'est pas connecté, donc la session a expiré
            // Récupérer l'URL de la page protégée demandée par l'utilisateur
            // $requestedPageUrl = $request->session()->get('returnUrl');
            // $requestedPageUrl = $request->session()->get('url');
            // dd(session()->all());
            // $parsedUrl = parse_url($requestedPageUrl);
            // $parsedUrl = parse_url($requestedPageUrl);
            // $path = $parsedUrl['path'] ?? '/';
            $requestedPageUrl = session('url.intended');
            // $path = $requestedPageUrl['path'];
            $parsedUrl = parse_url($requestedPageUrl, PHP_URL_PATH);

            // dd($parsedUrl);
            // Vous pouvez stocker cette URL dans la session ou la renvoyer en tant que réponse JSON, selon vos besoins
            return response()->json([
                'sessionExpired' => true,
                'requestedPageUrl' => $parsedUrl
            ]);
        }
    }
}
