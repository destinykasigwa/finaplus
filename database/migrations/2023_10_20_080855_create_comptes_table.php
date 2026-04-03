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
        Schema::create('comptes', function (Blueprint $table) {
            $table->bigInteger('RefCompte')->nullable();
            $table->string('CodeAgence', 20)->nullable();
            $table->string('NumCompte', 20)->nullable();
            $table->string('NumCompteAmo', 20)->nullable();
            $table->string('NomCompte', 20)->nullable();
            $table->string('RefTypeCompte', 20)->nullable();
            $table->string('RefCadre', 20)->nullable();
            $table->string('RefGroupe', 20)->nullable();
            $table->string('RefSousGroupe', 20)->nullable();
            $table->string('Desactive', 20)->nullable();
            $table->string('Protege', 20)->nullable();
            $table->string('Contentieux', 20)->nullable();
            $table->string('CreditBloque', 20)->nullable();
            $table->string('DebitBloque', 20)->nullable();
            $table->string('SoldeMin', 20)->nullable();
            $table->string('SoldeMax', 20)->nullable();
            $table->string('DebitAutirise', 20)->nullable();
            $table->string('CodeMonnaie', 20)->nullable();
            $table->float('soldeAvant', 20)->nullable()->default('0.000');
            $table->float('SoldeAvantfc', 20)->nullable()->default('0.000');
            $table->float('SoldeAvantus', 20)->nullable()->default('0.000');
            $table->float('SoldeIni', 20)->nullable()->default('0.000');
            $table->float('Debit', 20)->nullable()->default('0.000');
            $table->float('Credit', 20)->nullable()->default('0.000');
            $table->float('solde', 20)->nullable()->default('0.000');
            $table->float('SoldeInifc', 20)->nullable()->default('0.000');
            $table->float('Debitfc', 20)->nullable()->default('0.000');
            $table->float('Creditfc', 20)->nullable()->default('0.000');
            $table->float('Soldefc', 20)->nullable()->default('0.000');
            $table->float('Soldeaufc', 20)->nullable()->default('0.000');
            $table->float('SoldeInius', 20)->nullable()->default('0.000');
            $table->float('Debitus', 20)->nullable()->default('0.000');
            $table->float('Creditus', 20)->nullable()->default('0.000');
            $table->float('Soldeus', 20)->nullable()->default('0.000');
            $table->float('Soldeauus', 20)->nullable()->default('0.000');
            $table->float('Decouvert', 20)->nullable()->default('0.000');
            $table->float('PrevAnnuel', 20)->nullable()->default('0.000');
            $table->float('Realimoisencours', 20)->nullable()->default('0.000');
            $table->string('Adesse', 20)->nullable();
            $table->string('Email', 20)->nullable();
            $table->string('Mendataire1', 20)->nullable();
            $table->string('Civilite', 20)->nullable();
            $table->string('NumeTelephone', 20)->nullable();
            $table->string('DateNaissance', 20)->nullable();
            $table->string('ModeSignature', 20)->nullable();
            $table->string('Echeance', 20)->nullable();
            $table->string('NumDossier', 20)->nullable();
            $table->string('MontantPret', 20)->nullable();
            $table->string('TypeCredit', 20)->nullable();
            $table->string('Intervalle', 20)->nullable();
            $table->string('Beneficiare', 20)->nullable();
            $table->string('DateOctrois', 20)->nullable();
            $table->string('DateProchainEcheance', 20)->nullable();
            $table->string('DateEcheance', 20)->nullable();
            $table->string('DateOuverture', 20)->nullable();
            $table->string('DateDernierMouvement', 20)->nullable();
            $table->string('TauxInteret', 20)->nullable();
            $table->string('NombreJour', 20)->nullable();
            $table->string('sexe', 20)->nullable();
            $table->string('profession', 20)->nullable();
            $table->string('Heritier', 20)->nullable();
            $table->string('Guichet', 20)->nullable();
            $table->string('Garantie', 20)->nullable();
            $table->string('Secteur', 20)->nullable();
            $table->string('SousSecteur', 20)->nullable();
            $table->string('Transfert', 20)->nullable();
            $table->string('Tranche', 20)->nullable();
            $table->string('PersonneMorale', 20)->nullable();
            $table->string('Imprime', 20)->nullable();
            $table->string('NumAdherant', 20)->nullable();
            $table->string('Ferme', 20)->nullable();
            $table->string('DateFermeture', 20)->nullable();
            $table->string('MotifFermeture', 20)->nullable();
            $table->string('isCaissier', 11)->nullable();
            $table->string('caissierId', 11)->nullable();
            $table->string('isBilanAccount', 11)->nullable();
            $table->string('isResultAccount', 11)->nullable();
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
        Schema::dropIfExists('comptes');
    }
};
