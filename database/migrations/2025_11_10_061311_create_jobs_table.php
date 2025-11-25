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

            $table->string('shipment_id')->nullable()->index();
            $table->string('booking_id')->index();
            $table->string('cus_id')->index();
            $table->string('mode')->nullable()->index();
            $table->integer('containers')->default(0);
            $table->date('eta')->nullable()->index();
            $table->string('category')->nullable()->index();
            $table->string('bl_number')->nullable()->index();
            $table->integer('free_day')->default(0);

            $table->unsignedBigInteger('route_id')->nullable()->index();
            $table->string('origin')->nullable();
            $table->string('destination')->nullable();
            $table->string('shipment_type')->nullable();
            $table->integer('status')->default(0)->index();

            // Operational
            $table->text('operational_pickup_date')->nullable();
            $table->text('operational_container_info')->nullable();
            $table->text('operational_gatepass_info')->nullable();
            $table->text('operational_receiving_confirmation')->nullable();

            // Detention
            $table->integer('detention_free_days')->nullable();
            $table->integer('detention_used_days')->nullable();
            $table->string('detention_extra_days')->nullable();
            $table->string('detention_rate')->nullable();
            $table->string('detention_total')->nullable();
            $table->text('detention_remark')->nullable();

            // Demurrage
            $table->integer('demurrage_free_days')->nullable();
            $table->integer('demurrage_used_days')->nullable();
            $table->string('demurrage_extra_days')->nullable();
            $table->string('demurrage_rate')->nullable();
            $table->string('demurrage_total')->nullable();
            $table->text('demurrage_remark')->nullable();

            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable()->index();

            $table->softDeletes();
            $table->timestamps();

            // Foreign keys
            $table->foreign('cus_id')->references('cus_id')->on('customers')->onDelete('cascade');
            $table->foreign('booking_id')->references('booking_id')->on('leads')->onDelete('cascade');
            $table->foreign('route_id')->references('id')->on('routes')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
