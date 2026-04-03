<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\CustomTasks\ClotureJournee;
use App\CustomTasks\ClotureJourneeCopy;

class ClotureJourneeCommand extends Command
{

    protected $signature = 'cloture:journee';
    protected $description = 'Execute Cloture Journee';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $request = request(); // Si vous avez une manière d'obtenir des informations similaires à Request
        // $clotureJournee = new ClotureJournee();
        $clotureJournee = new ClotureJourneeCopy($request);
        $clotureJournee->execute();
    }
}
