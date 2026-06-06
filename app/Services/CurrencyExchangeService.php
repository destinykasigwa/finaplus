<?php

namespace App\Services;

use App\Constants\JournalType;
use App\Models\ExchangeRate;
use App\Models\ExchangeTransaction;
use App\Models\Comptes;
use App\Models\Agences;
use App\Models\Transactions;
use App\Models\TauxEtDateSystem;
use App\Models\CompteurTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\SendNotification;

class CurrencyExchangeService
{
    protected $agence;
    protected $comptePositionUSD;
    protected $comptePositionCDF;
    protected $comptePositionEUR;
    protected $compteGainChange;
    protected $comptePerteChange;
    protected $sendNotification;


    public function __construct()
    {
        $this->sendNotification = app(SendNotification::class);
        $currentAgence = session('current_agence');
        $codeAgence = $currentAgence['code_agence'] ?? null;

        if ($codeAgence) {
            $this->agence = Agences::where('code_agence', $codeAgence)->first();
            if ($this->agence) {
                $this->comptePositionUSD = $this->agence->compte_position_usd;
                $this->comptePositionCDF = $this->agence->compte_position_cdf;
                $this->comptePositionEUR = $this->agence->compte_position_eur;
                $this->compteGainChange = $this->agence->compte_gain_change;
                $this->comptePerteChange = $this->agence->compte_perte_change;
            }
        }
    }

    public function checkAccountsConfigured()
    {
        if (!$this->comptePositionUSD || !$this->comptePositionCDF || !$this->compteGainChange || !$this->comptePerteChange) {
            throw new \Exception('Les comptes de change ne sont pas configurés pour cette agence.');
        }
        return true;
    }

    public function getSoldeCompte($numCompte, $codeMonnaie)
    {
        $debitCol = ($codeMonnaie == 1) ? 'Debitusd' : 'Debitfc';
        $creditCol = ($codeMonnaie == 1) ? 'Creditusd' : 'Creditfc';

        $solde = Transactions::where('NumCompte', $numCompte)
            ->where('CodeMonnaie', $codeMonnaie)
            ->select(DB::raw("SUM($creditCol) - SUM($debitCol) as solde"))
            ->value('solde');
        return $solde ?? 0;
    }

    //  public function getSoldeComptePositionEchange($numCompte, $codeMonnaie)
    // {
    //     $debitCol = ($codeMonnaie == 1) ? 'Debitusd' : 'Debitfc';
    //     $creditCol = ($codeMonnaie == 1) ? 'Creditusd' : 'Creditfc';
    //     $solde = Transactions::where('NumCompte', $numCompte)
    //         ->where('CodeMonnaie', $codeMonnaie)
    //         ->select(DB::raw("SUM($debitCol) - SUM($creditCol) as solde"))
    //         ->value('solde');
    //     return $solde ?? 0;
    // }

    public function executeExchange($data)
    {
        $clientId = $data['client_id'];
        $sourceAccount = $data['source_account'];
        $targetAccount = $data['target_account'];
        $amount = $data['amount'];
        $appliedRate = $data['applied_rate'];
        $motif = $data['motif'];
        $userId = Auth::id();

        $sourceCompte = Comptes::where('NumCompte', $sourceAccount)->first();
        $targetCompte = Comptes::where('NumCompte', $targetAccount)->first();

        if (!$sourceCompte || !$targetCompte) {
            throw new \Exception('Compte source ou destination introuvable');
        }

        if ($sourceCompte->NumAdherant != $targetCompte->NumAdherant) {
            throw new \Exception('Les comptes n\'appartiennent pas au même client');
        }

        if ($sourceCompte->CodeMonnaie == $targetCompte->CodeMonnaie) {
            throw new \Exception('Les devises source et destination doivent être différentes');
        }

        $sourceDevise = $sourceCompte->CodeMonnaie == 1 ? 'USD' : ($sourceCompte->CodeMonnaie == 2 ? 'CDF' : 'EUR');
        $targetDevise = $targetCompte->CodeMonnaie == 1 ? 'USD' : ($targetCompte->CodeMonnaie == 2 ? 'CDF' : 'EUR');

        // Récupération du taux de référence (direct ou inverse)
        $referenceRate = null;
        $directRate = ExchangeRate::getCurrentRate($sourceDevise, $targetDevise);
        if ($directRate) {
            $referenceRate = $directRate->rate;
        } else {
            $inverseRate = ExchangeRate::getCurrentRate($targetDevise, $sourceDevise);
            if ($inverseRate) {
                $referenceRate = 1 / $inverseRate->rate;
            }
        }

        if (!$referenceRate) {
            throw new \Exception("Taux de référence non configuré pour $sourceDevise → $targetDevise");
        }

        $solde = $this->getSoldeCompte($sourceAccount, $sourceCompte->CodeMonnaie);
        if ($solde < $amount) {
            throw new \Exception('Solde insuffisant sur le compte source');
        }

        $amountTarget = $this->convertAmount($amount, $appliedRate, $sourceDevise, $targetDevise);
        $gainLoss = $this->calculateGainLoss($amount, $appliedRate, $referenceRate, $sourceDevise, $targetDevise);
        $reference = $this->generateReference();

        Log::info("Exchange - $sourceDevise -> $targetDevise: amount=$amount, rate=$appliedRate, target=$amountTarget, gain=$gainLoss");

        DB::beginTransaction();
        try {
            $dataSystem = TauxEtDateSystem::latest()->first();

            if ($sourceDevise == 'USD' && $targetDevise == 'CDF') {
                $this->processUSDtoCDF($sourceCompte, $targetCompte, $amount, $amountTarget, $gainLoss, $reference, $motif, $userId, $dataSystem);
            } elseif ($sourceDevise == 'CDF' && $targetDevise == 'USD') {
                $this->processCDFtoUSD($sourceCompte, $targetCompte, $amount, $amountTarget, $gainLoss, $reference, $motif, $userId, $dataSystem);
            } else {
                throw new \Exception('Paire de devises non supportée');
            }

            $transaction = ExchangeTransaction::create([
                'reference' => $reference,
                'client_id' => $clientId,
                'source_account' => $sourceAccount,
                'target_account' => $targetAccount,
                'source_currency' => $sourceDevise,
                'target_currency' => $targetDevise,
                'amount_source' => $amount,
                'amount_target' => $amountTarget,
                'applied_rate' => $appliedRate,
                'reference_rate' => $referenceRate,
                'gain_loss' => $gainLoss,
                'motif' => $motif,
                'status' => 'completed',
                'created_by' => $userId,
            ]);

            Log::info("Gain calculé: $gainLoss");
            $this->sendNotification->sendNotificationComptabilite(
                $clientId,   // ← correction ici
                $sourceDevise,
                $amount,
                'C',                                     // ← type fixe : débit
                $motif
            );
            DB::commit();
            return $transaction;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function convertAmount($amount, $rate, $sourceDevise, $targetDevise)
    {
        if ($sourceDevise == 'USD' && $targetDevise == 'CDF') {
            return $amount * $rate;
        } elseif ($sourceDevise == 'CDF' && $targetDevise == 'USD') {
            return $amount / $rate;
        }
        return $amount * $rate;
    }

    // private function calculateGainLoss($amount, $appliedRate, $referenceRate, $sourceDevise, $targetDevise)
    // {
    //     if ($sourceDevise == 'USD' && $targetDevise == 'CDF') {
    //         return ($referenceRate - $appliedRate) * $amount;
    //     } elseif ($sourceDevise == 'CDF' && $targetDevise == 'USD') {
    //         $usdAmount = $amount / $appliedRate;
    //         return ($appliedRate - $referenceRate) * $usdAmount;
    //     }
    //     return 0;
    // }
    private function calculateGainLoss($amount, $appliedRate, $referenceRate, $sourceDevise, $targetDevise)
    {
        if ($sourceDevise == 'USD' && $targetDevise == 'CDF') {
            return ($referenceRate - $appliedRate) * $amount;
        } elseif ($sourceDevise == 'CDF' && $targetDevise == 'USD') {
            // $appliedRate est déjà en CDF (ex: 2400), $referenceRate en valeur réelle (0.0004167)
            $tauxRefCDF = 1 / $referenceRate;  // 1 / 0.0004167 = 2400
            $tauxAppliedCDF = $appliedRate;     // 2400 (déjà correct)
            $usdAmount = $amount / $tauxAppliedCDF; // 5000 / 2400 = 2.083
            $gain = ($tauxAppliedCDF - $tauxRefCDF) * $usdAmount;

            Log::info("CDF->USD Gain: amount=$amount, tauxRefCDF=$tauxRefCDF, tauxAppliedCDF=$tauxAppliedCDF, usdAmount=$usdAmount, gain=$gain");

            return $gain;
        }
        return 0;
    }

    private function generateReference()
    {
        $id = DB::table('compteur_transactions')->insertGetId(['fakevalue' => '0000']);
        return 'CH' . str_pad($id, 8, '0', STR_PAD_LEFT);
    }

    private function createEcriture($numTransaction, $dataSystem, $codeMonnaie, $codeAgence, $numCompte, $numComptecp, $type, $montant, $libelle, $userId, $taux, $debitCol, $creditCol)
    {
        $data = [
            'NumTransaction' => $numTransaction,
            "RefJournal" => JournalType::TRANSFERT,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $taux,
            'TypeTransaction' => $type,
            'CodeMonnaie' => $codeMonnaie,
            'CodeAgence' => $codeAgence,
            'NumCompte' => $numCompte,
            'NumComptecp' => $numComptecp,
            'NomUtilisateur' => Auth::user()->name,
            'Libelle' => $libelle,
        ];

        if ($type == 'D') {
            $data['Debit'] = $montant;
            $data[$debitCol] = $montant;
            $data['Credit'] = 0;
            $data[$creditCol] = 0;
        } else {
            $data['Credit'] = $montant;
            $data[$creditCol] = $montant;
            $data['Debit'] = 0;
            $data[$debitCol] = 0;
        }

        return Transactions::create($data);
    }

    // private function processUSDtoCDF($sourceCompte, $targetCompte, $amount, $amountTarget, $gainLoss, $reference, $motif, $userId, $dataSystem)
    // {
    //     $taux = $dataSystem->TauxEnFc;
    //     $numTransaction = $this->generateReference();

    //     // Débit USD
    //     $this->createEcriture($numTransaction, $dataSystem, 1, $sourceCompte->CodeAgence, $sourceCompte->NumCompte, null, 'D', $amount, "Change USD->CDF: $motif (Ref: $reference)", $userId, $taux, 'Debitusd', 'Creditusd');

    //     // Crédit CDF
    //     $this->createEcriture($numTransaction, $dataSystem, 2, $targetCompte->CodeAgence, $targetCompte->NumCompte, null, 'C', $amountTarget, "Change USD->CDF: $motif (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');

    //     // Gain/Perte
    //     if ($gainLoss != 0) {
    //         $compteResultat = ($gainLoss > 0) ? $this->compteGainChange : $this->comptePerteChange;
    //         $type = ($gainLoss > 0) ? 'C' : 'D';
    //         $montantAbs = abs($gainLoss);
    //         $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $compteResultat, null, $type, $montantAbs, "Gain/Perte de change USD->CDF (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
    //     }
    // }

    // private function processCDFtoUSD($sourceCompte, $targetCompte, $amount, $amountTarget, $gainLoss, $reference, $motif, $userId, $dataSystem)
    // {
    //     $taux = $dataSystem->TauxEnFc;
    //     $numTransaction = $this->generateReference();

    //     // Débit CDF
    //     $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $sourceCompte->NumCompte, null, 'D', $amount, "Change CDF->USD: $motif (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');

    //     // Crédit USD - $amountTarget est déjà en USD
    //     $this->createEcriture($numTransaction, $dataSystem, 1, $targetCompte->CodeAgence, $targetCompte->NumCompte, null, 'C', $amountTarget, "Change CDF->USD: $motif (Ref: $reference)", $userId, $taux, 'Debitusd', 'Creditusd');

    //     // Gain/Perte en CDF
    //     if ($gainLoss != 0) {
    //         $compteResultat = ($gainLoss > 0) ? $this->compteGainChange : $this->comptePerteChange;
    //         $type = ($gainLoss > 0) ? 'C' : 'D';
    //         $montantAbs = abs($gainLoss);
    //         $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $compteResultat, null, $type, $montantAbs, "Gain/Perte de change CDF->USD (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
    //     }
    // }
    private function processUSDtoCDF($sourceCompte, $targetCompte, $amount, $amountTarget, $gainLoss, $reference, $motif, $userId, $dataSystem)
{
    $taux = $dataSystem->TauxEnFc;
    $numTransaction = $this->generateReference();

    // 1. Débit du compte USD client
    $this->createEcriture($numTransaction, $dataSystem, 1, $sourceCompte->CodeAgence, $sourceCompte->NumCompte, $this->comptePositionUSD, 'D', $amount, "Change USD->CDF: $motif (Ref: $reference)", $userId, $taux, 'Debitusd', 'Creditusd');

    // 2. Crédit du compte position USD
    $this->createEcriture($numTransaction, $dataSystem, 1, $sourceCompte->CodeAgence, $this->comptePositionUSD, $sourceCompte->NumCompte, 'C', $amount, "Change USD->CDF: $motif (Ref: $reference)", $userId, $taux, 'Debitusd', 'Creditusd');

    // 3. Débit du compte position CDF
    $this->createEcriture($numTransaction, $dataSystem, 2, $targetCompte->CodeAgence, $this->comptePositionCDF, $targetCompte->NumCompte, 'D', $amountTarget, "Change USD->CDF: $motif (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');

    // 4. Crédit du compte CDF client
    $this->createEcriture($numTransaction, $dataSystem, 2, $targetCompte->CodeAgence, $targetCompte->NumCompte, $this->comptePositionCDF, 'C', $amountTarget, "Change USD->CDF: $motif (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');

    // 5. Gain/Perte
    // if ($gainLoss != 0) {
    //     $compteResultat = ($gainLoss > 0) ? $this->compteGainChange : $this->comptePerteChange;
    //     $type = ($gainLoss > 0) ? 'C' : 'D';
    //     $montantAbs = abs($gainLoss);
    //     $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $compteResultat, null, $type, $montantAbs, "Gain/Perte change USD->CDF (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
    // }
     if ($gainLoss != 0) {
        
        $compteResultat = ($gainLoss > 0) ? $this->compteGainChange : $this->comptePerteChange;
        $typeResultat = ($gainLoss > 0) ? 'C' : 'D'; // Crédit pour gain, Débit pour perte
        $montantAbs = abs($gainLoss);
        // Écriture de résultat
        $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $compteResultat, null, $typeResultat, $montantAbs, "Gain/Perte change USD->CDF (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
        // Ajustement du compte position CDF pour équilibrer
        $typePosition = ($gainLoss > 0) ? 'D' : 'C'; // Débit pour gain, Crédit pour perte
        $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $this->comptePositionCDF, null, $typePosition, $montantAbs, "Ajustement gain/perte position USD (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
    }
}

    private function processCDFtoUSD($sourceCompte, $targetCompte, $amount, $amountTarget, $gainLoss, $reference, $motif, $userId, $dataSystem)
{
    $taux = $dataSystem->TauxEnFc;
    $numTransaction = $this->generateReference();

    // 1. Débit client CDF
    $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $sourceCompte->NumCompte, $this->comptePositionCDF, 'D', $amount, "Change CDF->USD: $motif (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');

    // 2. Crédit position CDF
    $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $this->comptePositionCDF, $sourceCompte->NumCompte, 'C', $amount, "Change CDF->USD: $motif (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');

    // 3. Débit position USD
    $this->createEcriture($numTransaction, $dataSystem, 1, $targetCompte->CodeAgence, $this->comptePositionUSD, $targetCompte->NumCompte, 'D', $amountTarget, "Change CDF->USD: $motif (Ref: $reference)", $userId, $taux, 'Debitusd', 'Creditusd');

    // 4. Crédit client USD
    $this->createEcriture($numTransaction, $dataSystem, 1, $targetCompte->CodeAgence, $targetCompte->NumCompte, $this->comptePositionUSD, 'C', $amountTarget, "Change CDF->USD: $motif (Ref: $reference)", $userId, $taux, 'Debitusd', 'Creditusd');

    // 5. Gain/Perte – on ajuste le compte position CDF et on constate le résultat
    if ($gainLoss != 0) {
        
        $compteResultat = ($gainLoss > 0) ? $this->compteGainChange : $this->comptePerteChange;
        $typeResultat = ($gainLoss > 0) ? 'C' : 'D'; // Crédit pour gain, Débit pour perte
        $montantAbs = abs($gainLoss);
        // Écriture de résultat
        $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $compteResultat, null, $typeResultat, $montantAbs, "Gain/Perte change CDF->USD (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
        // Ajustement du compte position CDF pour équilibrer
        $typePosition = ($gainLoss > 0) ? 'D' : 'C'; // Débit pour gain, Crédit pour perte
        $this->createEcriture($numTransaction, $dataSystem, 2, $sourceCompte->CodeAgence, $this->comptePositionCDF, null, $typePosition, $montantAbs, "Ajustement gain/perte position CDF (Ref: $reference)", $userId, $taux, 'Debitfc', 'Creditfc');
    }
}

    public function cancelExchange($reference, $reason)
    {
        $original = ExchangeTransaction::where('reference', $reference)->first();
        if (!$original || $original->status !== 'completed') {
            throw new \Exception('Transaction introuvable ou déjà annulée');
        }

        DB::beginTransaction();
        try {
            $dataSystem = TauxEtDateSystem::latest()->first();
            $userId = Auth::id();
            $cancelReference = $this->generateReference();

            $sourceCompte = Comptes::where('NumCompte', $original->source_account)->first();
            $targetCompte = Comptes::where('NumCompte', $original->target_account)->first();
            $amount = $original->amount_source;
            $amountTarget = $original->amount_target;

            if ($original->source_currency == 'USD' && $original->target_currency == 'CDF') {
                // Annulation USD -> CDF : l'inverse (débit CDF, crédit USD)
                $this->createEcriture($cancelReference, $dataSystem, 2, $sourceCompte->CodeAgence, $targetCompte->NumCompte, null, 'D', $amountTarget, "Annulation change USD->CDF: $reason", $userId, $dataSystem->TauxEnFc, 'Debitfc', 'Creditfc');
                $this->createEcriture($cancelReference, $dataSystem, 1, $targetCompte->CodeAgence, $sourceCompte->NumCompte, null, 'C', $amount, "Annulation change USD->CDF: $reason", $userId, $dataSystem->TauxEnFc, 'Debitusd', 'Creditusd');
            } else {
                // Annulation CDF -> USD : l'inverse (débit USD, crédit CDF)
                $this->createEcriture($cancelReference, $dataSystem, 1, $sourceCompte->CodeAgence, $targetCompte->NumCompte, null, 'C', $amountTarget, "Annulation change CDF->USD: $reason", $userId, $dataSystem->TauxEnFc, 'Debitusd', 'Creditusd');
                $this->createEcriture($cancelReference, $dataSystem, 2, $targetCompte->CodeAgence, $sourceCompte->NumCompte, null, 'D', $amount, "Annulation change CDF->USD: $reason", $userId, $dataSystem->TauxEnFc, 'Debitfc', 'Creditfc');
            }

            $original->status = 'cancelled';
            $original->cancelled_by = $userId;
            $original->cancellation_reason = $reason;
            $original->cancellation_transaction_id = $cancelReference;
            $original->save();

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
