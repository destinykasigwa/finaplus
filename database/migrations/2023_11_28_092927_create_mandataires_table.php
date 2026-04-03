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
        Schema::create('mandataires', function (Blueprint $table) {
            $table->id();
            $table->string('refCompte', 100)->nullable();
            $table->string('mendataireName', 100)->nullable();
            $table->string('lieuNaissM', 100)->nullable();
            $table->string('dateNaissM', 100)->nullable();
            $table->string('etatCivileM', 100)->nullable();
            $table->string('sexeM', 100)->nullable();
            $table->string('typePieceM', 100)->nullable();
            $table->string('professionM', 100)->nullable();
            $table->string('telephoneM', 100)->nullable();
            $table->string('adresseM', 100)->nullable();
            $table->string('observationM', 100)->nullable();
            $table->string('photoM', 100)->nullable();
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
        Schema::dropIfExists('mandataires');
    }
};
