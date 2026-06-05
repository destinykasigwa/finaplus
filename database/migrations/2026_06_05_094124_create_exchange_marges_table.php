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
        Schema::create('exchange_marges', function (Blueprint $table) {
    $table->id();
    $table->string('devise_source', 3);
    $table->string('devise_target', 3);
    $table->decimal('marge', 10, 2);      // 50 CDF
    $table->enum('type_marge', ['fixe', 'pourcentage'])->default('fixe');
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_marges');
    }
};
