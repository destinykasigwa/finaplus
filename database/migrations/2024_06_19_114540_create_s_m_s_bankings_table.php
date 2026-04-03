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
        Schema::create('s_m_s_bankings', function (Blueprint $table) {
            $table->id();
            $table->string("NumCompte", 30)->nullable();
            $table->string("NomCompte", 100)->nullable();
            $table->string("Civilite", 20)->nullable();
            $table->string("Email", 30)->nullable();
            $table->string("Telephone", 16)->nullable();
            $table->date("DateActivation")->nullable();
            $table->date("DateDesActivation")->nullable();
            $table->string("NumAbrege", 10)->nullable();
            $table->string("ActivatedSMS", 10)->nullable();
            $table->string("ActivatedEmail", 10)->nullable();
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
        Schema::dropIfExists('s_m_s_bankings');
    }
};
