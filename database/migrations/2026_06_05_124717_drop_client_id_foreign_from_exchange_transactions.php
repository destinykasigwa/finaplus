<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropClientIdForeignFromExchangeTransactions extends Migration
{
    public function up()
    {
        Schema::table('exchange_transactions', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
        });
    }

    public function down()
    {
        Schema::table('exchange_transactions', function (Blueprint $table) {
            $table->foreign('client_id')->references('id')->on('users');
        });
    }
}