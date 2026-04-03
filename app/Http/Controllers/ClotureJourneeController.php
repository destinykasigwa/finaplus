<?php

namespace App\Http\Controllers;

use App\CustomTasks\ClotureJournee;  // Assure-toi d'importer la classe ClotureJournee
use App\CustomTasks\ClotureJourneeCopy;
use Illuminate\Http\Request;

class ClotureJourneeController extends Controller
{
    public function cloturer(Request $request)
    {
        try {
            // Appeler la classe ClotureJourneeCopy
            $clotureJournee = new ClotureJourneeCopy($request);
            $clotureJournee->execute();

            // Réponse de succès
            return response()->json([
                "status" => 1,
                "msg" => "Clôture de la journée réussie !",
            ]);
        } catch (\Exception $e) {
            // Gérer les erreurs
            return response()->json([
                "status" => 0,
                "msg" => "Erreur lors de la clôture : " . $e->getMessage(),
            ], 500);
        }
    }
}
