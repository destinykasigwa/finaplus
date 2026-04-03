<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use App\Models\ExpirateDateConfig;
use Illuminate\Support\Facades\DB;

class CheckPasswordExpirateCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'password:expiration';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Verifie si le mot de passe de l'utilsateur à expirer! ";

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        //RECUPERE LA DATE DU JOUR 
        $dateAujourd = date("Y-m-d");
        //RECUPERE TOUS LES UTILISATEURS DANS LA DB
        $userData = User::get();
        //RECUPERE LES NOMBRES DES JOURS QU'IL FAUT POUR QU'UN MOT DE PASSE SOIT EXPIRE
        $nbrJourExpiration = ExpirateDateConfig::first()->password_expired_days;
        for ($i = 0; $i < sizeof($userData); $i++) {
            //RECUPERE LA DATE OU L'UTILISATEUR A CHANGER SON MOT DE PASSE POUR LA DERNIERE FOIS
            $dateDuChangementPW = $userData[$i]->start_date;
            //RECUPERE LA DATE OU LE MOT DE PASSE DOIT EXPIRER 
            $DateExpiration = date('Y-m-d', strtotime("+" . $nbrJourExpiration . " days", strtotime("$dateDuChangementPW")));
            //SI LA DATE D'AUJOURD'HUI CORRESPOND A LA DATE DE L'EXPIRATION DU MOT DE PASSE ON MET LA TABLE USER A JOUR 
            if ($dateAujourd == $DateExpiration) {
                // info($dateAujourd);
                User::where('expirate_date', $DateExpiration)->update([
                    "expirate_password" => 1,
                ]);
            }
        }

        return Command::SUCCESS;
    }
}
