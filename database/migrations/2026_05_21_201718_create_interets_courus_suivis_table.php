<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('interets_courus_suivi', function (Blueprint $table) {
    $table->id();
    $table->string('NumDossier');
    $table->date('DateDernierCalcul');
    $table->decimal('CapitalRestant', 15, 2);
    $table->decimal('InteretCouruNonPaye', 15, 2)->default(0);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interets_courus_suivis');
    }
};
