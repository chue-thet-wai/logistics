<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();

            $table->string('shipment_id')->index();
            $table->string('booking_id')->index();
            $table->string('cus_id')->index();

            $table->integer('mode')->default(1); 
            $table->integer('category')->default(1); 
            $table->date('eta')->nullable();
            $table->string('si_number')->nullable();
            $table->integer('loading_port')->nullable();
            $table->integer('discharge_port')->nullable();

            $table->string('master_bl_number')->nullable();
            $table->string('house_bl_number')->nullable();

            $table->string('forwarder')->nullable();
            $table->integer('carrier')->nullable();
            $table->integer('total_container')->default(0);
            $table->string('shipper_name')->nullable();
            $table->integer('consignee')->nullable();
            $table->integer('type')->nullable();
            $table->integer('bl_status')->nullable();
            $table->integer('free_day_type')->nullable();
            $table->date('surrendered_date')->nullable();
            $table->integer('status')->default(0)->index(); 

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            $table->unique(['master_bl_number', 'deleted_at']);
            $table->unique(['house_bl_number', 'deleted_at']);

            // Foreign keys
            $table->foreign('cus_id')
                ->references('cus_id')
                ->on('customers')
                ->cascadeOnDelete();

            $table->foreign('booking_id')
                ->references('booking_id')
                ->on('leads')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
