<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
      // create_budget_lines_table (modifiée)
Schema::create('budget_lines', function (Blueprint $table) {
    $table->id();
    $table->foreignId('fiscal_year_id')->constrained()->onDelete('cascade');
    $table->bigInteger('account_id');
    $table->foreign('account_id')->references('RefCompte')->on('comptes')->onDelete('cascade');
    $table->decimal('planned_amount', 15, 2)->default(0);
    $table->enum('category', ['operating', 'investment', 'treasury']);
    $table->foreignId('created_by')->nullable()->constrained('users');
    $table->timestamp('validated_at')->nullable();
    $table->enum('status', ['draft', 'validated', 'rejected'])->default('draft');
    $table->timestamps();

    $table->unique(['fiscal_year_id', 'account_id']);
});
    }

    public function down()
    {
        Schema::dropIfExists('budget_lines');
    }
};