<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeClientIdToStringInExchangeTransactions extends Migration
{
    public function up()
    {
        Schema::table('exchange_transactions', function (Blueprint $table) {
            $table->string('client_id', 50)->change();
        });
    }

    public function down()
    {
        Schema::table('exchange_transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->change();
        });
    }
}