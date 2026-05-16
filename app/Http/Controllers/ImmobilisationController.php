<?php

namespace App\Http\Controllers;

use App\Models\Immobilisation;
use App\Models\TypeImmobilisation;
use App\Models\Comptes;
use App\Models\Immobilisations;
use App\Models\TypesImmobilistations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ImmobilisationController extends Controller
{
public function __construct()
    {
        $this->middleware("auth");
    }
    public function getImmoHomePage()
    {
        return view("eco.pages.enregistrement-imo");
    }
    public function getTypes()
    {
        return response()->json(['status' => 1, 'data' => TypesImmobilistations::all()]);
    }

   // Comptes d'immobilisations (classe 2)
public function getComptesImmobilisations()
{
    $comptes = Comptes::where('niveau', 5)
        ->where('est_classe', 0)
        ->where('RefCadre', 'LIKE', '2%') // 21,22,23,24...
        ->orderBy('NumCompte')
        ->get(['NumCompte', 'NomCompte']);
    return response()->json(['status' => 1, 'data' => $comptes]);
}

// Comptes d'amortissements (classe 28)
public function getComptesAmortissements()
{
    $comptes = Comptes::where('niveau', 5)
        ->where('est_classe', 0)
        ->where('RefCadre', '28')
        ->orderBy('NumCompte')
        ->get(['NumCompte', 'NomCompte']);
    return response()->json(['status' => 1, 'data' => $comptes]);
}

    public function creerImmobilisation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_immo' => 'required|unique:immobilisations',
            'nom_immo' => 'required|string',
            'date_acquisition' => 'required|date',
            'valeur_acquisition' => 'required|numeric|min:0',
            'type_immo' => 'required|exists:types_immobilisations,id',
            'duree_amortissement_ans' => 'required|integer|min:1',
            'taux_amortissement' => 'required|numeric|min:0',
            'methode_amortissement' => 'in:lineaire,degresif',
            'valeur_residuelle' => 'numeric|min:0',
            'compte_comptable_immo' => 'required|exists:comptes,NumCompte',
            'compte_comptable_amortissement' => 'required|exists:comptes,NumCompte',
            'code_agence' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $vnc = $request->valeur_acquisition - $request->valeur_residuelle;

        $immo = Immobilisations::create([
            'code_immo' => $request->code_immo,
            'nom_immo' => $request->nom_immo,
            'date_acquisition' => $request->date_acquisition,
            'valeur_acquisition' => $request->valeur_acquisition,
            'duree_amortissement_ans' => $request->duree_amortissement_ans,
            'methode_amortissement' => $request->methode_amortissement,
            'taux_amortissement' => $request->taux_amortissement,
            'valeur_residuelle' => $request->valeur_residuelle ?? 0,
            'compte_comptable_immo' => $request->compte_comptable_immo,
            'compte_comptable_amortissement' => $request->compte_comptable_amortissement,
            'amortissement_cumule' => 0,
            'valeur_nette_comptable' => $vnc,
            'code_agence' => $request->code_agence,
        ]);

        return response()->json(['status' => 1, 'msg' => 'Immobilisation enregistrée', 'data' => $immo]);
    }


public function listeImmobilisations()
{
    $user = auth()->user();
    $agences = $user->agences()->pluck('code_agence')->toArray();
    $immos = Immobilisations::whereIn('code_agence', $agences)->orderBy('created_at', 'desc')->get();
    return response()->json(['status' => 1, 'data' => $immos]);
}

public function modifierImmobilisation(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'code_immo' => 'required|unique:immobilisations,code_immo,'.$id,
        'nom_immo' => 'required',
        'date_acquisition' => 'required|date',
        'valeur_acquisition' => 'required|numeric|min:0',
        'type_immo' => 'required|exists:types_immobilisations,id',
        'duree_amortissement_ans' => 'required|integer|min:1',
        'taux_amortissement' => 'required|numeric|min:0',
        'valeur_residuelle' => 'numeric|min:0',
        'compte_comptable_immo' => 'required',
        'compte_comptable_amortissement' => 'required',
        'code_agence' => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => 0, 'errors' => $validator->errors()]);
    }

    $immo = Immobilisations::find($id);
    if (!$immo) return response()->json(['status' => 0, 'msg' => 'Immobilisation introuvable']);

    $vnc = $request->valeur_acquisition - $request->valeur_residuelle;

    $immo->update([
        'code_immo' => $request->code_immo,
        'nom_immo' => $request->nom_immo,
        'date_acquisition' => $request->date_acquisition,
        'valeur_acquisition' => $request->valeur_acquisition,
        'duree_amortissement_ans' => $request->duree_amortissement_ans,
        'methode_amortissement' => $request->methode_amortissement,
        'taux_amortissement' => $request->taux_amortissement,
        'valeur_residuelle' => $request->valeur_residuelle,
        'compte_comptable_immo' => $request->compte_comptable_immo,
        'compte_comptable_amortissement' => $request->compte_comptable_amortissement,
        'valeur_nette_comptable' => $vnc,
        'code_agence' => $request->code_agence,
    ]);

    return response()->json(['status' => 1, 'msg' => 'Immobilisation modifiée']);
}

public function supprimerImmobilisation($id)
{
    $immo = Immobilisations::find($id);
    if (!$immo) return response()->json(['status' => 0, 'msg' => 'Immobilisation introuvable']);
    $immo->delete();
    return response()->json(['status' => 1, 'msg' => 'Supprimée']);
}
}
