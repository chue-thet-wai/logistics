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
        Schema::create('trip_transport_costs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('trip_status_log_id')->constrained()->cascadeOnDelete();
            $table->string('type',50)->nullable()->index();
            $table->string('title')->nullable()->index(); 
            $table->decimal('amount', 10, 2)->index();
            $table->string('receipt')->nullable()->index();
            $table->string('receipt_2')->nullable()->index();
            $table->string('receipt_3')->nullable()->index();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_transport_costs');
    }
};
