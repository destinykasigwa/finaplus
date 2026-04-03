<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('locked_garanties', function (Blueprint $table) {
            $table->id();
            $table->string("NumCompte", 30)->nullable();
            $table->string("NumAbrege", 20)->nullable();
            $table->string("Montant", 100)->nullable();
            $table->string("Devise", 10)->nullable();
            $table->string("paidState", 10)->default("0");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('locked_garanties');
    }
};
