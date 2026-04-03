<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->bigInteger("RefTransaction", 20)->nullable();
            $table->string("NumTransaction", 20)->nullable();
            $table->string("RefJournal", 20)->nullable();
            $table->string("Caisse", 20)->nullable();
            $table->date("DateTransaction")->nullable();
            $table->string("DateSaisie", 20)->nullable();
            $table->string("Taux", 20)->nullable();
            $table->string("TypeTransaction", 20)->nullable();
            $table->string("CodeMonnaie", 20)->nullable();
            $table->string("DocSource", 20)->nullable();
            $table->string("CodeAgence", 20)->nullable();
            $table->string("CodeAgenceOrigine", 20)->nullable();
            $table->string("CodeTypeJournal", 20)->nullable();
            $table->string("NumDossier", 20)->nullable();
            $table->string("NumDemande", 20)->nullable();
            $table->string("NumCompte", 20)->nullable();
            $table->string("NumComptecp", 20)->nullable();
            $table->string("NumCompteEpargne", 30)->nullable();
            $table->string("NombreLettre", 30)->nullable();
            $table->float("Debit", 30)->nullable()->default("0.00");
            $table->float("Credit", 30)->nullable()->default("0.00");
            $table->string("Operant", 30)->nullable();
            $table->string("AgenceDestination", 30)->nullable();
            $table->string("Expediteur", 30)->nullable();
            $table->string("AdresseExpediteur", 30)->nullable();
            $table->string("Destinataire", 30)->nullable();
            $table->string("Destination", 30)->nullable();
            $table->string("Provenance", 30)->nullable();
            $table->string("NumTelDestinataire", 30)->nullable();
            $table->string("AdresseDestinataire", 30)->nullable();
            $table->string("TypePieceDestinataire", 30)->nullable();
            $table->string("NumPieceDestinataire", 30)->nullable();
            $table->string("CodeVirement", 30)->nullable();
            $table->string("FraisVirement", 30)->nullable();
            $table->string("Reduction", 30)->nullable();
            $table->string("TVA", 30)->nullable();
            $table->string("TVAApplicable", 30)->nullable();
            $table->string("Concerne", 30)->nullable();
            $table->string("DateRetrait", 30)->nullable();
            $table->string("DateEnvoie", 30)->nullable();
            $table->string("Retire", 30)->nullable();
            $table->string("Tresor", 30)->nullable();
            $table->string("Virement", 30)->nullable();
            $table->string("DocJustificatif", 30)->nullable();
            $table->string("Superviseur", 30)->nullable();
            $table->string("Collecteur", 30)->nullable();
            $table->string("Libelle", 250)->nullable();
            $table->float("Debitusd", 30)->nullable()->default("0.00");
            $table->float("Creditusd", 30)->nullable()->default("0.00");
            $table->float("Debitfc", 30)->nullable()->default("0.00");
            $table->float("Creditfc", 30)->nullable()->default("0.00");
            $table->string("Auto", 30)->nullable();
            $table->string("Dureepret", 30)->nullable();
            $table->string("DateEcheance", 30)->nullable();
            $table->string("TauxInteret", 30)->nullable();
            $table->string("Secteur", 30)->nullable();
            $table->string("SousSecteur", 30)->nullable();
            $table->string("CodeGuichet", 30)->nullable();
            $table->string("Garantie", 30)->nullable();
            $table->string("NumTransactioncp", 30)->nullable();
            $table->string("NomUtilisateur", 30)->nullable();
            $table->string("Traite", 30)->nullable();
            $table->string("Envoye", 30)->nullable();
            $table->string("Cat", 30)->nullable();
            $table->string("Suspens", 30)->nullable();
            $table->string("Imprime", 30)->nullable();
            $table->string("sms", 30)->nullable();
            $table->string("SousCompte", 30)->nullable();
            $table->string("Valide", 30)->nullable();
            $table->string("ValidePar", 30)->nullable();
            $table->string("DateValidation", 30)->nullable();
            $table->string("refCompteMembre", 30)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
};
