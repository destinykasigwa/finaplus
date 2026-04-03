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
        Schema::create('sended_s_m_s', function (Blueprint $table) {
            $table->id();
            $table->string("numPhone", 30)->nullable();
            $table->integer("messageStatus")->nullable();
            $table->integer("paidStatus")->nullable()->default("0");
            $table->date("dateEnvoie")->nullable();
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
        Schema::dropIfExists('sended_s_m_s');
    }
};
