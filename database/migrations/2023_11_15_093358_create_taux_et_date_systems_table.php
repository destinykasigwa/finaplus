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
        Schema::create('taux_et_date_systems', function (Blueprint $table) {
            $table->id();
            $table->date("DateSystem")->nullable();
            $table->float("TauxEnDollar")->default("1");
            $table->float("TauxEnFc")->nullable();
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
        Schema::dropIfExists('taux_et_date_systems');
    }
};
