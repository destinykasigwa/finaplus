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
        Schema::create('company_models', function (Blueprint $table) {
            $table->id();
            $table->string("sigle", 100)->nullable();
            $table->string("denomination", 100)->nullable();
            $table->string("adresse", 100)->nullable();
            $table->string("forme", 100)->nullable();
            $table->string("ville", 100)->nullable();
            $table->string("departement", 100)->nullable();
            $table->string("pays", 100)->nullable();
            $table->string("tel", 100)->nullable();
            $table->string("email", 100)->nullable();
            $table->string("idnat", 100)->nullable();
            $table->string("nrc", 100)->nullable();
            $table->string("num_impot", 100)->nullable();
            $table->string("date_system", 100)->nullable();
            $table->string("company_logo", 100)->nullable();
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
        Schema::dropIfExists('companies');
    }
};
