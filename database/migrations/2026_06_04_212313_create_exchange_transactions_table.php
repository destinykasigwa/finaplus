<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExchangeTransactionsTable extends Migration
{
    public function up()
    {
        Schema::create('exchange_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();
            $table->foreignId('client_id')->constrained('users');
            $table->string('source_account', 20);
            $table->string('target_account', 20);
            $table->string('source_currency', 3);
            $table->string('target_currency', 3);
            $table->decimal('amount_source', 15, 2);
            $table->decimal('amount_target', 15, 2);
            $table->decimal('applied_rate', 15, 4);
            $table->decimal('reference_rate', 15, 4);
            $table->decimal('gain_loss', 15, 2);
            $table->string('motif', 255);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('cancelled_by')->nullable()->constrained('users');
            $table->text('cancellation_reason')->nullable();
            $table->string('cancellation_transaction_id', 50)->nullable();
            $table->timestamps();

            $table->index('reference');
            $table->index('client_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('exchange_transactions');
    }
}