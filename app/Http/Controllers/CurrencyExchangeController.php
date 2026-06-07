<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use App\Models\ExchangeTransaction;
use App\Models\Agences;
use App\Models\Comptes;
use App\Models\ExchangeMarge;
use App\Models\User;
use App\Services\CurrencyExchangeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CurrencyExchangeController extends Controller
{
    protected $exchangeService;

    public function __construct(CurrencyExchangeService $exchangeService)
    {
        $this->exchangeService = $exchangeService;
        $this->middleware('auth');
    }

    // ==================== TAUX DE CHANGE ====================
    // public function getRates()
    // {
    //     $rates = ExchangeRate::with('creator')->orderBy('valid_from', 'desc')->get();
    //     return response()->json(['status' => 1, 'data' => $rates]);
    // }

    public function getChangeCreditHomePage(){
        return view("eco.pages.currency-exchange");
    }

    public function getRates()
    {
        $rates = ExchangeRate::with('creator')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json(['status' => 1, 'data' => $rates]);
    }

    public function storeRate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_currency' => 'required|string|size:3',
            'target_currency' => 'required|string|size:3',
            'rate' => 'required|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_to' => 'nullable|date|after:valid_from',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $rate = ExchangeRate::create([
            'source_currency' => $request->source_currency,
            'target_currency' => $request->target_currency,
            'rate' => $request->rate,
            'valid_from' => $request->valid_from,
            'valid_to' => $request->valid_to,
            'created_by' => Auth::id(),
        ]);

        return response()->json(['status' => 1, 'data' => $rate, 'msg' => 'Taux enregistré']);
    }



    public function getReferenceRate(Request $request)
    {
        $source = $request->source;
        $target = $request->target;
        $applyMargin = $request->apply_margin ?? true;

        // Récupérer le taux de référence (toujours USD -> CDF)
        // $usdToCdfRate = ExchangeRate::getCurrentRate('USD', 'CDF');
        // $tauxRefUSDToCDF = $usdToCdfRate ? (float)$usdToCdfRate->rate : 2350;

        $usdToCdfRate = ExchangeRate::getCurrentRate('USD', 'CDF');
        if (!$usdToCdfRate) {
            return response()->json(['status' => 0, 'msg' => 'Aucun taux USD/CDF configuré']);
        }
        $tauxRefUSDToCDF = (float)$usdToCdfRate->rate;

        $margeValue = 0;
        $tauxClient = 0;

        if ($source == 'USD' && $target == 'CDF') {
            $margeValue = 50;
            $tauxClient = $tauxRefUSDToCDF - ($applyMargin ? $margeValue : 0);
            $tauxRef = $tauxRefUSDToCDF;
        } elseif ($source == 'CDF' && $target == 'USD') {
            $margeValue = 50;
            $tauxAvecMarge = $tauxRefUSDToCDF + ($applyMargin ? $margeValue : 0);
            $tauxClient = 1 / $tauxAvecMarge;
            $tauxRef = 1 / $tauxRefUSDToCDF;
        } else {
            return response()->json(['status' => 0, 'msg' => 'Paire non supportée']);
        }

        return response()->json([
            'status' => 1,
            'rate' => $tauxClient,
            'reference_rate' => $tauxRef,
            'margin' => $margeValue
        ]);
    }

    // ==================== COMPTES DE CHANGE (PAR AGENCE) ====================
    public function getExchangeAccounts()
    {
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        $agence = Agences::where('code_agence', $codeAgence)->first();

        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non trouvée']);
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'position_usd' => $agence->compte_position_usd,
                'position_cdf' => $agence->compte_position_cdf,
                'position_eur' => $agence->compte_position_eur,
                'gain_account' => $agence->compte_gain_change,
                'loss_account' => $agence->compte_perte_change,
            ]
        ]);
    }

    public function updateExchangeAccounts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'position_usd' => 'nullable|exists:comptes,NumCompte',
            'position_cdf' => 'nullable|exists:comptes,NumCompte',
            'position_eur' => 'nullable|exists:comptes,NumCompte',
            'gain_account' => 'nullable|exists:comptes,NumCompte',
            'loss_account' => 'nullable|exists:comptes,NumCompte',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;
        $agence = Agences::where('code_agence', $codeAgence)->first();

        if (!$agence) {
            return response()->json(['status' => 0, 'msg' => 'Agence non trouvée']);
        }

        $agence->compte_position_usd = $request->position_usd;
        $agence->compte_position_cdf = $request->position_cdf;
        $agence->compte_position_eur = $request->position_eur;
        $agence->compte_gain_change = $request->gain_account;
        $agence->compte_perte_change = $request->loss_account;
        $agence->save();

        return response()->json(['status' => 1, 'msg' => 'Comptes de change mis à jour']);
    }

    // ==================== OPÉRATIONS DE CHANGE ====================
    //  public function searchClient(Request $request)
    // {
    //     $search = $request->search;

    //     $comptes = Comptes::where('NumCompte', 'like', "%$search%")
    //         ->orWhere('NomCompte', 'like', "%$search%")
    //         ->orWhere('NumAdherant', 'like', "%$search%")
    //         ->orWhere('Num_Manuel', 'like', "%$search%")
    //         ->whereIn('RefGroupe', [330, 331])
    //         ->limit(10)
    //         ->get(['NumAdherant as id', 'NomCompte as name', 'NumCompte']);

    //     return response()->json(['status' => 1, 'data' => $comptes]);
    // }

    public function searchClient(Request $request)
    {
        $search = $request->search;

        $comptes = Comptes::where(function ($query) use ($search) {
            $query->where('NumCompte', 'like', "%$search%")
                ->orWhere('NomCompte', 'like', "%$search%")
                ->orWhere('Num_Manuel', 'like', "%$search%")
                ->orWhere('NumAdherant', 'like', "%$search%");
        })
            ->whereIn('RefGroupe', [330, 331])
            ->limit(10)
            ->get(['NumCompte', 'NomCompte as name', 'CodeMonnaie', 'Num_Manuel', 'NumAdherant as id']);

        return response()->json(['status' => 1, 'data' => $comptes]);
    }

    public function getClientAccounts(Request $request)
    {
        $request->validate(['client_id' => 'required']);
        $search = $request->client_id;

        // 1. D'abord, trouver le compte correspondant à l'identifiant saisi
        $compteTrouve = Comptes::where(function ($query) use ($search) {
            $query->where('NumCompte', $search)
                ->orWhere('Num_Manuel', $search)
                ->orWhere('NumAdherant', $search);
        })
            ->whereIn('RefGroupe', [330, 331])
            ->first();

        if (!$compteTrouve) {
            return response()->json(['status' => 0, 'msg' => 'Compte introuvable']);
        }

        // 2. Récupérer tous les comptes du même client (même NumAdherant)
        $comptes = Comptes::where('NumAdherant', $compteTrouve->NumAdherant)
            ->whereIn('RefGroupe', [330, 331])
            ->get(['NumCompte', 'NomCompte', 'CodeMonnaie']);

        return response()->json(['status' => 1, 'data' => $comptes]);
    }

    public function getAccountBalance(Request $request)
    {
        $request->validate(['num_compte' => 'required|exists:comptes,NumCompte']);
        $compte = Comptes::where('NumCompte', $request->num_compte)->first();
        $solde = $this->exchangeService->getSoldeCompte($compte->NumCompte, $compte->CodeMonnaie);
        return response()->json(['status' => 1, 'solde' => $solde]);
    }

    public function executeExchange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required',
            'source_account' => 'required|exists:comptes,NumCompte',
            'target_account' => 'required|exists:comptes,NumCompte',
            'amount' => 'required|numeric|min:0.01',
            'applied_rate' => 'required|numeric|min:0',
            'motif' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        try {
            $this->exchangeService->checkAccountsConfigured();
            $transaction = $this->exchangeService->executeExchange($request->all());
            return response()->json(['status' => 1, 'data' => $transaction]);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'msg' => $e->getMessage()]);
        }
    }

    public function cancelExchange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => 'required|exists:exchange_transactions,reference',
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        try {
            $this->exchangeService->checkAccountsConfigured();
            $this->exchangeService->cancelExchange($request->reference, $request->reason);
            return response()->json(['status' => 1, 'msg' => 'Opération annulée']);
        } catch (\Exception $e) {
            return response()->json(['status' => 0, 'msg' => $e->getMessage()]);
        }
    }

    // ==================== HISTORIQUE ET RAPPORTS ====================
    public function getTransactions(Request $request)
    {
        $query = ExchangeTransaction::with(['client', 'creator']);

        if ($request->filled('client_id')) $query->where('client_id', $request->client_id);
        if ($request->filled('date_debut')) $query->whereDate('created_at', '>=', $request->date_debut);
        if ($request->filled('date_fin')) $query->whereDate('created_at', '<=', $request->date_fin);
        if ($request->filled('source_currency')) $query->where('source_currency', $request->source_currency);
        if ($request->filled('target_currency')) $query->where('target_currency', $request->target_currency);
        if ($request->filled('user_id')) $query->where('created_by', $request->user_id);
        if ($request->filled('min_gain')) $query->where('gain_loss', '>=', $request->min_gain);
        if ($request->filled('max_gain')) $query->where('gain_loss', '<=', $request->max_gain);



        $transactions = $query->orderBy('created_at', 'desc')->paginate(20);

        
        return response()->json(['status' => 1, 'data' => $transactions]);
    }

    public function getDailyReport(Request $request)
    {
        $date = $request->date ?? now()->toDateString();
        $query = ExchangeTransaction::whereDate('created_at', $date)->where('status', 'completed');

        $stats = [
            'count' => $query->count(),
            'volume_usd' => $query->where('source_currency', 'USD')->sum('amount_source') + $query->where('target_currency', 'USD')->sum('amount_target'),
            'volume_cdf' => $query->where('source_currency', 'CDF')->sum('amount_source') + $query->where('target_currency', 'CDF')->sum('amount_target'),
            'total_gain' => $query->where('gain_loss', '>', 0)->sum('gain_loss'),
            'total_loss' => $query->where('gain_loss', '<', 0)->sum('gain_loss'),
            'net_result' => $query->sum('gain_loss'),
        ];

        return response()->json(['status' => 1, 'data' => $stats]);
    }


    public function getMarges()
    {
        $marges = ExchangeMarge::all();
        return response()->json(['status' => 1, 'data' => $marges]);
    }

    public function updateMarge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:exchange_marges,id',
            'marge' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 0, 'errors' => $validator->errors()]);
        }

        $marge = ExchangeMarge::find($request->id);
        $marge->marge = $request->marge;
        $marge->save();

        return response()->json(['status' => 1, 'msg' => 'Marge mise à jour']);
    }
}
