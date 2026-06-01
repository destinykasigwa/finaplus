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
         Schema::create('penalites_suivi', function (Blueprint $table) {
            $table->id();
            $table->string('NumDossier');
            $table->date('DateDernierCalcul');
            $table->decimal('TotalPenalites', 15, 2)->default(0);
            $table->timestamps();
            
            // Index pour accélérer les recherches
            $table->index('NumDossier');
            $table->index('DateDernierCalcul');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penalites_suivi');
    }
};
