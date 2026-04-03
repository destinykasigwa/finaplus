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
        Schema::create('portefeuilles', function (Blueprint $table) {
            $table->id();
            $table->string("RefTypeCredit", 30)->nullable();
            $table->string("RefProduitCredit", 30)->nullable();
            $table->string("CodeAgence", 30)->nullable();
            $table->string("CodeGuichet", 30)->nullable();
            $table->date("DateDemande")->nullable();
            $table->date("DateOctroi")->nullable();
            $table->date("DateEcheance")->nullable();
            $table->date("DateTranche")->nullable();
            $table->string("NbrTranche", 30)->nullable();
            $table->string("NumCompteEpargne", 30)->nullable();
            $table->string("NumCompteCredit", 30)->nullable();
            $table->string("NumCompteEpargneGarantie", 30)->nullable();
            $table->string("NomCompte", 30)->nullable();
            $table->string("Duree", 30)->nullable();
            $table->string("Dufferee", 30)->nullable();
            $table->string("Grace", 5)->nullable();
            $table->string("NumDossier", 30)->nullable();
            $table->string("NumDemande", 30)->nullable();
            $table->float("MontantDemande")->nullable()->default('0.00');
            $table->string("ObjeFinance", 30)->nullable();
            $table->float("MontantAccorde")->nullable()->default('0.00');
            $table->string("Decision", 40)->nullable();
            $table->string("Motivation", 40)->nullable();
            $table->string("CodeMonnaie", 5)->nullable();
            $table->float("Interval")->nullable()->default('0.00');
            $table->string("ModeRemboursement", 40)->nullable();
            $table->string("Modecalcul", 50)->nullable();
            $table->float("TauxInteret")->nullable()->default('0.00');
            $table->string("CompteInteret", 40)->nullable();
            $table->float("TauxInteretRetard")->nullable()->default('0.00');
            $table->string("CompteInteretRetard", 40)->nullable();
            $table->float("InteretRetardIn")->nullable()->default('0.00');
            $table->float("InteretCalcule")->nullable()->default('0.00');
            $table->float("TotCumule")->nullable()->default('0.00');
            $table->float("RemboursCapitalIn")->nullable()->default('0.00');
            $table->float("RemboursInteretIn")->nullable()->default('0.00');
            $table->float("InteretSpotIn")->nullable()->default('0.00');
            $table->float("RemboursEparneProgr")->nullable()->default('0.00');
            $table->float("RemboursInteretRetarIn")->nullable()->default('0.00');
            $table->float("RemboursCapital")->nullable()->default('0.00');
            $table->float("RemboursInteret")->nullable()->default('0.00');
            $table->float("RemboursEpargneProgr")->nullable()->default('0.00');
            $table->float("RemboursInteretRetard")->nullable()->default('0.00');
            $table->float("CapitalRestant")->nullable()->default('0.00');
            $table->float("InteretRestant")->nullable()->default('0.00');
            $table->float("CapitalEchu")->nullable()->default('0.00');
            $table->float("EpargneEchu")->nullable()->default('0.00');
            $table->float("InteretEchu")->nullable()->default('0.00');
            $table->float("InteretRetardEchu")->nullable()->default('0.00');
            $table->float("CapitalDu")->nullable()->default('0.00');
            $table->float("CapitalRetard")->nullable()->default('0.00');
            $table->float("InteretDu")->nullable()->default('0.00');
            $table->float("EpargneDu")->nullable()->default('0.00');
            $table->float("AvanceInteret")->nullable()->default('0.00');
            $table->float("NonEchu")->nullable()->default('0.00');
            $table->float("Retard1")->nullable()->default('0.00');
            $table->float("Retard2")->nullable()->default('0.00');
            $table->float("Retard3")->nullable()->default('0.00');
            $table->float("Retard4")->nullable()->default('0.00');
            $table->float("Retard5")->nullable()->default('0.00');
            $table->float("PourcentageProvision")->nullable()->default('0.00');
            $table->float("JourRetard")->nullable()->default('0.00');
            $table->string("SourceFinancement", 50)->nullable();
            $table->string("Gestionnaire", 40)->nullable();
            $table->string("Octroye", 5)->nullable()->default('0');
            $table->string("numAdherant", 30)->nullable();
            $table->string("NumMensualite", 30)->nullable();
            $table->float("FraisEtudeDossier")->nullable()->default('0.00');
            $table->string("CompteEtudeDossier", 30)->nullable();
            $table->float("FraisCommission")->nullable()->default('0.00');
            $table->string("CompteCommission", 30)->nullable();
            $table->string("Animateur", 30)->nullable();
            $table->string("Accorde", 5)->nullable()->default('0');
            $table->string("AccordePar", 30)->nullable();
            $table->string("OctroyePar", 30)->nullable();
            $table->date("DateTombeEcheance")->nullable();
            $table->string("NomUtilisateur", 30)->nullable();
            $table->string("Cloture", 5)->nullable()->default('0');
            $table->string("CloturePar", 30)->nullable();
            $table->string("DateCloture", 30)->nullable();
            $table->string("Radie", 5)->nullable()->default('0');
            $table->float("CapitalRadie")->nullable()->default('0.00');
            $table->float("InteretRadie")->nullable()->default('0.00');
            $table->date("DateRadiation")->nullable();
            $table->string("NumCompteHB", 30)->nullable();
            $table->float("MontantRadie")->nullable()->default('0.00');
            $table->string("Spot", 5)->nullable()->default('0');
            $table->string("Anticipation", 5)->nullable()->default('0');
            $table->string("Reechelonne", 5)->nullable()->default('0');
            $table->date("DateReechellonement")->nullable();
            $table->float("MontantReechelonne")->nullable()->default('0.00');
            $table->string("NbrTrancheReechellonne", 5)->nullable();
            $table->string('DureeReechellone', 10)->nullable();
            $table->string('GroupeSolidaire', 10)->nullable()->default('0');
            $table->string('Cyclable', 10)->nullable()->default('0');
            $table->string('Cycle', 10)->nullable()->default('1');
            $table->string('RefMode', 10)->nullable();
            $table->string('TrancheDecalage', 10)->nullable();
            $table->string('PeriodiciteDecalage', 10)->nullable();
            $table->string('DureeDecalage', 10)->nullable();
            $table->string('DateDecale', 10)->nullable();
            $table->string('TypeGarantie', 50)->nullable();
            $table->float("InteretPrecompte")->nullable()->default('0.00');
            $table->string('Homme', 10)->nullable();
            $table->string('Femme', 10)->nullable();
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
        Schema::dropIfExists('portefeuilles');
    }
};
