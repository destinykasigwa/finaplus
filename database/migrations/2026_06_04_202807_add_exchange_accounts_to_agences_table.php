<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddExchangeAccountsToAgencesTable extends Migration
{
    public function up()
    {
        Schema::table('agences', function (Blueprint $table) {
            $table->string('compte_position_usd')->nullable()->after('compte_liaison_usd');
            $table->string('compte_position_cdf')->nullable()->after('compte_position_usd');
            $table->string('compte_position_eur')->nullable()->after('compte_position_cdf');
            $table->string('compte_gain_change')->nullable()->after('compte_position_eur');
            $table->string('compte_perte_change')->nullable()->after('compte_gain_change');
        });
    }

    public function down()
    {
        Schema::table('agences', function (Blueprint $table) {
            $table->dropColumn([
                'compte_position_usd',
                'compte_position_cdf',
                'compte_position_eur',
                'compte_gain_change',
                'compte_perte_change'
            ]);
        });
    }
}