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

            $table->string('booking_id')->index();
            $table->string('shipment_id')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('mode')->nullable(); 
            $table->string('shipment_category')->nullable(); 
            $table->string('port_loading')->nullable();
            $table->string('port_discharge')->nullable();
            $table->string('vessel_name')->nullable();
            $table->string('voyage_no')->nullable();
            $table->string('bl_number')->nullable();
            $table->date('eta')->nullable();
            $table->date('etd')->nullable();
            $table->integer('free_days')->nullable();
            $table->string('ics')->nullable();
            $table->text('remarks')->nullable();

            $table->text('preloading_instruction')->nullable();
            $table->text('container_instruction')->nullable();
            $table->text('booking_confirmation')->nullable();
            $table->text('customs_clearance')->nullable();
            $table->text('delivery_order')->nullable();

            $table->integer('used_days_container')->nullable();
            $table->integer('free_days_container')->nullable();
            $table->string('detention_status')->nullable();
            $table->text('detention_remark')->nullable();

            $table->integer('used_days_demurrage')->nullable();
            $table->integer('free_days_demurrage')->nullable();
            $table->string('demurrage_status')->nullable();
            $table->text('demurrage_remark')->nullable();

            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable()->index();

            $table->softDeletes();   
            $table->timestamps();

            $table->foreign('booking_id')->references('booking_id')->on('leads')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
