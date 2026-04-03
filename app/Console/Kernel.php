<?php

namespace App\Console;

use App\Services\SendNotification;
use App\CustomTasks\ClotureJournee;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('password:expiration')->everyMinute()->runInBackground();
        $schedule->command('cloture:journee')->everyMinute()->runInBackground();

        // Planifier la fonction RappelRemboursementCredit tous les jours à 8h00
        $schedule->call(function () {
            // Laravel va automatiquement résoudre la dépendance AfricaTalkingService ici
            $sendNotification = app(SendNotification::class);  // Utilisation de app() pour résoudre la dépendance
            $sendNotification->RappelRemboursementCredit();
        })->everyMinute();  // Vous pouvez changer l'heure ici selon vos besoins
    }
    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
