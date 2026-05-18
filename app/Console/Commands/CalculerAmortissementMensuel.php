<?php

namespace App\Console\Commands;

use App\Http\Controllers\ImmobilisationController;
use Illuminate\Console\Command;

class CalculerAmortissementMensuel extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
      protected $signature = 'immo:amortir';
    protected $description = 'Calcule et enregistre les dotations aux amortissements du mois pour toutes les agences';

    public function handle()
    {
        $controller = new ImmobilisationController();
        $controller->calculerAmortissementMensuel();
        $this->info('Amortissements calculés avec succès.');
    }
}
