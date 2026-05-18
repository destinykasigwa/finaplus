<?php

namespace App\Jobs;

use App\Models\BatchPaiement;
use App\Models\BatchPaiementLigne;
use App\Models\Comptes;
use App\Models\Transactions;
use App\Models\TauxEtDateSystem;
use App\Models\CompteurTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExecuterBatchPaiement implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $batchId;
    protected $userId;

    public function __construct($batchId, $userId)
    {
        $this->batchId = $batchId;
        $this->userId = $userId;
    }

    public function handle()
    {
        $batch = BatchPaiement::with(['lignes', 'compte'])->find($this->batchId);
        if (!$batch || $batch->statut !== 'valide') {
            Log::error("Batch {$this->batchId} non valide ou inexistant");
            return;
        }

        DB::beginTransaction();
        try {
            $comptePrincipal = $batch->compte;
            if (!$comptePrincipal) {
                throw new \Exception('Compte principal introuvable');
            }
            $devise = (substr($comptePrincipal->NumCompte, -1) == '1') ? 1 : 2;
            $total = $batch->total_montant;

            // 1. Débiter le compte principal (créer une transaction unique)
            $this->creerTransactionDebitGlobal($comptePrincipal, $total, $devise, $batch);

            // 2. Créditer chaque bénéficiaire
            $lignes = $batch->lignes->where('statut', 'en_attente');
            $succes = 0;
            foreach ($lignes as $ligne) {
                $beneficiaire = Comptes::where('NumCompte', $ligne->compte)->first();
                if (!$beneficiaire) {
                    $ligne->statut = 'echec';
                    $ligne->message_erreur = 'Compte bénéficiaire introuvable au moment de l’exécution';
                    $ligne->save();
                    continue;
                }

                $numTransaction = $this->creerTransactionCreditBeneficiaire($beneficiaire, $ligne->montant, $devise, $batch);
                $ligne->transaction_id = $numTransaction;
                $ligne->statut = 'succes';
                $ligne->save();
                $succes++;
            }

            // $batch->statut = ($succes == $batch->total_lignes) ? 'termine' : 'partiel';
            // $batch->date_execution = now();
            // $batch->save();
            // Après DB::commit() (ou dans le bloc try, après la boucle)
            $nouveauStatut = ($succes == $batch->total_lignes) ? 'termine' : 'partiel';
            DB::table('batch_paiements')
                ->where('id', $this->batchId)
                ->update([
                    'statut' => $nouveauStatut,
                    'date_execution' => now(),
                ]);


            Log::info("Statut du batch mis à jour à {$batch->statut}");

            DB::commit();
            Log::info("Batch {$batch->reference} exécuté : $succes succès, " . ($batch->total_lignes - $succes) . ' échecs');
        } catch (\Exception $e) {
            DB::rollBack();
            $batch->statut = 'annule';
            $batch->save();
            Log::error("Erreur exécution batch {$batch->reference} : " . $e->getMessage());
            throw $e; // pour que le job soit marqué comme échoué dans la queue
        }
    }

    private function creerTransactionDebitGlobal($comptePrincipal, $montant, $devise, $batch)
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $numTransaction = $this->genererNumTransaction();
        $debitCol = ($devise == 1) ? 'Debitusd' : 'Debitfc';
        $libelle = "Paiement batch {$batch->reference} - Débit principal";

        Transactions::create([
            'NumTransaction' => $numTransaction,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $dataSystem->TauxEnFc,
            'TypeTransaction' => 'D',
            'CodeMonnaie' => $devise,
            'CodeAgence' => $comptePrincipal->CodeAgence,
            'NumDossier' => $batch->reference,
            'NumCompte' => $comptePrincipal->NumCompte,
            'Debit' => $montant,
            $debitCol => $montant,
            'NomUtilisateur' => 'System',
            'Libelle' => $libelle,
        ]);
    }

    private function creerTransactionCreditBeneficiaire($beneficiaire, $montant, $devise, $batch)
    {
        $dataSystem = TauxEtDateSystem::latest()->first();
        $numTransaction = $this->genererNumTransaction();
        $creditCol = ($devise == 1) ? 'Creditusd' : 'Creditfc';
        $libelle = "Paiement batch {$batch->reference} - Crédit bénéficiaire {$beneficiaire->NumCompte}";

        Transactions::create([
            'NumTransaction' => $numTransaction,
            'DateTransaction' => $dataSystem->DateSystem,
            'DateSaisie' => now(),
            'Taux' => $dataSystem->TauxEnFc,
            'TypeTransaction' => 'C',
            'CodeMonnaie' => $devise,
            'CodeAgence' => $beneficiaire->CodeAgence,
            'NumDossier' => $batch->reference,
            'NumCompte' => $beneficiaire->NumCompte,
            'Credit' => $montant,
            $creditCol => $montant,
            'NomUtilisateur' => 'System',
            'Libelle' => $libelle,
        ]);
        return $numTransaction;
    }

    private function genererNumTransaction()
    {
        CompteurTransaction::create(['fakevalue' => '0000']);
        $dernier = CompteurTransaction::latest()->first();
        return 'BP' . str_pad($dernier->id, 6, '0', STR_PAD_LEFT);
    }
}
