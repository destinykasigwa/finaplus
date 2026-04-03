<?php

namespace App\Models;

use App\Events\TransactionCreated;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transactions extends Model
{
    // protected $dispatchesEvents = [
    //     'created' => TransactionCreated::class,
    // ];
    // public function account()
    // {
    //     return $this->belongsTo(Comptes::class, 'NumCompte', 'NumCompte');
    // }
    use HasFactory;
    protected $fillable = [
        "NumTransaction",
        "RefJournal",
        "Caisse",
        "DateTransaction",
        "DateSaisie",
        "Taux",
        "TypeTransaction",
        "CodeMonnaie",
        "DocSource",
        "CodeAgence",
        "CodeAgenceOrigine",
        "CodeTypeJournal",
        "NumDossier",
        "NumDemande",
        "NumCompte",
        "NumComptecp",
        "NumCompteEpargne",
        "NombreLettre",
        "Debit",
        "Credit",
        "Operant",
        "AgenceDestination",
        "Expediteur",
        "AdresseExpediteur",
        "Destinataire",
        "Destination",
        "Provenance",
        "NumTelDestinataire",
        "AdresseDestinataire",
        "TypePieceDestinataire",
        "NumPieceDestinataire",
        "CodeVirement",
        "FraisVirement",
        "Reduction",
        "TVA",
        "TVAApplicable",
        "Concerne",
        "DateRetrait",
        "DateEnvoie",
        "Retire",
        "Tresor",
        "Virement",
        "DocJustificatif",
        "Superviseur",
        "Collecteur",
        "Libelle",
        "Debitusd",
        "Creditusd",
        "Debitfc",
        "Creditfc",
        "Auto",
        "Dureepret",
        "DateEcheance",
        "TauxInteret",
        "Secteur",
        "SousSecteur",
        "CodeGuichet",
        "Garantie",
        "NumTransactioncp",
        "NomUtilisateur",
        "Traite",
        "Envoye",
        "Cat",
        "Suspens",
        "Imprime",
        "sms",
        "SousCompte",
        "Valide",
        "ValidePar",
        "DateValidation",
        "refCompteMembre",
        "extourner",
        "isSuspens",
        "extourner",
        "isVirement",
        "is_system",
    ];
}
