<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExchangeRatesTable extends Migration
{
    public function up()
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('source_currency', 3);  // USD, EUR, CDF
            $table->string('target_currency', 3); // USD, EUR, CDF
            $table->decimal('rate', 15, 4);       // Taux de référence
            $table->date('valid_from');
            $table->date('valid_to')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();

            $table->unique(['source_currency', 'target_currency', 'valid_from'], 'exchange_rates_unique');
            $table->index(['source_currency', 'target_currency', 'valid_from']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('exchange_rates');
    }
}