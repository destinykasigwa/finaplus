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
        Schema::create('expirate_date_configs', function (Blueprint $table) {
            $table->id();
            $table->string("password_expired_days", 100)->nullable()->default("30");
            $table->string("login_attempt", 100)->nullable()->default("5");
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
        Schema::dropIfExists('expirate_date_configs');
    }
};
