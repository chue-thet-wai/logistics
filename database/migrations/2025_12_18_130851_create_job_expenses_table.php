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
        Schema::create('job_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_status_log_id')->constrained()->cascadeOnDelete();

            $table->enum('type', ['fuel', 'toll']);

            $table->string('station_name')->nullable(); // fuel
            $table->string('gate_name')->nullable();    // toll

            $table->decimal('liter', 8, 2)->nullable();
            $table->decimal('amount', 10, 2);

            $table->string('receipt')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_expenses');
    }
};
