<?php

namespace Database\Seeders;

use App\Models\Agences;
use App\Models\Immobilisations;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ImmobilisationTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run()
    {
        // Récupérer les codes agence existants (ex: GOMA=20, KATINDO=21)
        $agences = Agences::pluck('code_agence')->toArray();
        if (empty($agences)) {
            $agences = ['20', '21']; // fallback si table agences vide
        }

        // Données de test
        $immobilisations = [
            // Immeubles d'exploitation (compte 220, amortissement linéaire 5% sur 20 ans)
            [
                'code_immo' => 'IMM-001',
                'nom_immo' => 'Immeuble siège Goma',
                'date_acquisition' => '2020-01-01',
                'valeur_acquisition' => 500000000,
                'type_immo' => 1, // id du type "Immeuble" (à adapter selon votre table types_immobilisations)
                'duree_amortissement_ans' => 20,
                'methode_amortissement' => 'lineaire',
                'valeur_residuelle' => 50000000,
                'taux_amortissement' => 5.00,
                'compte_comptable_immo' => '2200000000202', // Exemple pour agence 20 CDF
                'compte_comptable_amortissement' => '2822000000202',
                'amortissement_cumule' => 0,
                'valeur_nette_comptable' => 450000000,
                'code_agence' => '20',
                'service_affectation' => 'Direction',
            ],
            [
                'code_immo' => 'IMM-002',
                'nom_immo' => 'Immeuble Katindo',
                'date_acquisition' => '2021-06-15',
                'valeur_acquisition' => 300000000,
                'type_immo' => 1,
                'duree_amortissement_ans' => 20,
                'methode_amortissement' => 'lineaire',
                'valeur_residuelle' => 30000000,
                'taux_amortissement' => 5.00,
                'compte_comptable_immo' => '2200000000212',
                'compte_comptable_amortissement' => '2822000000212',
                'amortissement_cumule' => 0,
                'valeur_nette_comptable' => 270000000,
                'code_agence' => '21',
                'service_affectation' => 'Administration',
            ],

            // Matériel informatique (compte 2231, amortissement dégressif 33,33% sur 3 ans)
            [
                'code_immo' => 'INFO-001',
                'nom_immo' => 'Ordinateurs portables Goma',
                'date_acquisition' => '2023-02-10',
                'valeur_acquisition' => 25000000,
                'type_immo' => 2, // id pour "Matériel informatique"
                'duree_amortissement_ans' => 3,
                'methode_amortissement' => 'degresif',
                'valeur_residuelle' => 0,
                'taux_amortissement' => 33.33,
                'compte_comptable_immo' => '2231000000202',
                'compte_comptable_amortissement' => '2823100000202',
                'amortissement_cumule' => 0,
                'valeur_nette_comptable' => 25000000,
                'code_agence' => '20',
                'service_affectation' => 'Informatique',
            ],
            [
                'code_immo' => 'INFO-002',
                'nom_immo' => 'Serveurs Katindo',
                'date_acquisition' => '2023-05-20',
                'valeur_acquisition' => 45000000,
                'type_immo' => 2,
                'duree_amortissement_ans' => 3,
                'methode_amortissement' => 'degresif',
                'valeur_residuelle' => 0,
                'taux_amortissement' => 33.33,
                'compte_comptable_immo' => '2231000000212',
                'compte_comptable_amortissement' => '2823100000212',
                'amortissement_cumule' => 0,
                'valeur_nette_comptable' => 45000000,
                'code_agence' => '21',
                'service_affectation' => 'Informatique',
            ],

            // Matériel roulant (compte 2230, linéaire 20% sur 5 ans)
            [
                'code_immo' => 'VEH-001',
                'nom_immo' => 'Toyota Hilux Goma',
                'date_acquisition' => '2022-09-01',
                'valeur_acquisition' => 80000000,
                'type_immo' => 3, // id pour "Matériel roulant"
                'duree_amortissement_ans' => 5,
                'methode_amortissement' => 'lineaire',
                'valeur_residuelle' => 8000000,
                'taux_amortissement' => 20.00,
                'compte_comptable_immo' => '2230000000202',
                'compte_comptable_amortissement' => '2823000000202',
                'amortissement_cumule' => 0,
                'valeur_nette_comptable' => 72000000,
                'code_agence' => '20',
                'service_affectation' => 'Logistique',
            ],

            // Mobilier de bureau (compte 2234, linéaire 10% sur 10 ans)
            [
                'code_immo' => 'MOB-001',
                'nom_immo' => 'Bureaux et chaises Goma',
                'date_acquisition' => '2023-11-11',
                'valeur_acquisition' => 15000000,
                'type_immo' => 4, // id pour "Mobilier de bureau"
                'duree_amortissement_ans' => 10,
                'methode_amortissement' => 'lineaire',
                'valeur_residuelle' => 1500000,
                'taux_amortissement' => 10.00,
                'compte_comptable_immo' => '2234000000202',
                'compte_comptable_amortissement' => '2823400000202',
                'amortissement_cumule' => 0,
                'valeur_nette_comptable' => 13500000,
                'code_agence' => '20',
                'service_affectation' => 'Administration',
            ],
        ];

        foreach ($immobilisations as $immo) {
            // Vérifier que le type_immo existe, sinon attribuer 1 par défaut
            $typeExists = \App\Models\TypesImmobilistations::where('id', $immo['type_immo'])->exists();
            if (!$typeExists && $immo['type_immo'] != 1) {
                $immo['type_immo'] = 1;
            }
            Immobilisations::updateOrCreate(
                ['code_immo' => $immo['code_immo']],
                $immo
            );
        }

        $this->command->info('Immobilisations de test insérées avec succès.');
    }
}
