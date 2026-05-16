<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::create('types_immobilisations', function (Blueprint $table) {
        $table->id();
        $table->string('nom_type');
        $table->integer('duree_amortissement'); // années
        $table->decimal('taux_amortissement', 5, 2);
        $table->enum('methode_amortissement', ['lineaire', 'degresif'])->default('lineaire');
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('types_immobilisations');
}
};
