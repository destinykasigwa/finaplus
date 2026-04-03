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
        Schema::create('jour_retards', function (Blueprint $table) {
            $table->id();
            $table->string("NumcompteEpargne")->nullable();
            $table->string("NumcompteCredit")->nullable();
            $table->string("NumDossier", 50)->nullable();
            $table->string("NbrJrRetard", 50)->nullable();
            $table->date("DateRetard")->nullable();
            $table->integer("provision1")->nullable()->default("0");
            $table->integer("provision2")->nullable()->default("0");
            $table->integer("provision3")->nullable()->default("0");
            $table->integer("provision4")->nullable()->default("0");
            $table->integer("provision5")->nullable()->default("0");
            $table->integer("repriseProvision")->nullable()->default("0");
            $table->integer("reclassement")->nullable()->default("0");
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
        Schema::dropIfExists('jour_retards');
    }
};
