<?php

namespace App\Listeners;

use App\Models\Transaction;
use App\Events\TransactionCreated;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class DuplicateTransaction
{
    // /**
    //  * Handle the event.
    //  *
    //  * @param  \App\Events\TransactionCreated  $event
    //  * @return void
    //  */
    // public function handle(TransactionCreated $event)
    // {
    //     $transaction = $event->transaction;

    //     // Fetch the account type
    //     $account = $transaction->account;

    //     // Log fetched account data
    //     Log::info('Fetched account data', ['account' => $account]);

    //     // Check if account exists
    //     if ($account) {
    //         Log::info('Account exists', ['RefTypeCompte' => $account->RefTypeCompte]);
    //         if ($account && in_array($account->RefTypeCompte, [6, 7])) {
    //             $newTransaction = $transaction->replicate();
    //             $newTransaction->NumCompte = 87;

    //             if ($transaction->CodeMonnaie == 1) {
    //                 $newTransaction->Debitusd = $transaction->Debitusd;
    //                 $newTransaction->Creditusd = $transaction->Creditusd;
    //             } elseif ($transaction->CodeMonnaie == 2) {
    //                 $newTransaction->Debitfc = $transaction->Debitfc;
    //                 $newTransaction->Creditfc = $transaction->Creditfc;
    //             }

    //             $newTransaction->save();
    //         } else {
    //             // Log an error or take appropriate action
    //             Log::error('Account not found or RefTypeCompte not in [6, 7]', ['transaction_id' => $transaction->id]);
    //         }
    //     } else {
    //         // Log an error or take appropriate action
    //         Log::error('Account not found', ['transaction_id' => $transaction->id, 'NumCompte' => $transaction->NumCompte]);
    //     }
    // }
}
