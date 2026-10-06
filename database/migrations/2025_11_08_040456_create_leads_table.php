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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('booking_id')->unique();

            $table->string('cus_id')->index(); 

            $table->integer('mode')->default(0)->index(); 
            $table->integer('category')->default(0)->index(); 
            $table->date('eta')->nullable()->index();

            $table->string('master_bl_number')->nullable();
            $table->string('house_bl_number')->nullable();

            $table->string('forwarder')->nullable()->index();
            $table->integer('demurrage_free_day')->default(0)->index();
            $table->integer('detention_free_day')->default(0)->index();
            $table->integer('total_container')->default(0)->index();
            $table->integer('status')->default(0)->index();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            $table->unique(['master_bl_number', 'deleted_at']);
            $table->unique(['house_bl_number', 'deleted_at']);

            $table->foreign('cus_id')
                ->references('cus_id')
                ->on('customers')
                ->cascadeOnDelete();

            $table->index('created_at');
            $table->index('updated_at');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
