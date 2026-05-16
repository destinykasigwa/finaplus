<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypeImmobilisationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run()
{
    DB::table('types_immobilisations')->insert([
        ['nom_type' => 'Immeuble', 'duree_amortissement' => 20, 'taux_amortissement' => 5.00, 'methode_amortissement' => 'lineaire'],
        ['nom_type' => 'Matériel informatique', 'duree_amortissement' => 3, 'taux_amortissement' => 33.33, 'methode_amortissement' => 'degresif'],
        ['nom_type' => 'Mobilier de bureau', 'duree_amortissement' => 10, 'taux_amortissement' => 10.00, 'methode_amortissement' => 'lineaire'],
        ['nom_type' => 'Matériel roulant', 'duree_amortissement' => 5, 'taux_amortissement' => 20.00, 'methode_amortissement' => 'degresif'],
    ]);
}
}
