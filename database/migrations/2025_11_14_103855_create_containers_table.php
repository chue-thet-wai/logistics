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
        Schema::create('containers', function (Blueprint $table) {
            $table->id();

            $table->string('container_id')->index();
            $table->string('shipment_id')->index();

            $table->string('container_no')->index();
            $table->integer('container_type')->default(1);
            $table->date('arrival_date')->nullable()->index();
            $table->string('product_category')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('uom')->default(1);
            $table->decimal('weight', 10, 2)->default(0);
            $table->decimal('cbm', 10, 2)->default(0);

            $table->unsignedBigInteger('route_id')->nullable()->index();

            $table->string('origin')->nullable();
            $table->string('destination')->nullable();
            $table->integer('fz')->default(0);
            $table->string('billing_customer')->nullable();

            $table->date('pickup_date')->nullable()->index();
            $table->string('pickup_address')->nullable();
            $table->string('pickup_contact_person')->nullable();
            $table->string('pickup_contact_phone',20)->nullable();
            $table->string('delivery_address')->nullable();
            $table->string('delivery_contact_person')->nullable();
            $table->string('delivery_contact_phone',20)->nullable();
            $table->text('remark')->nullable();

            $table->integer('status')->default(0)->index();

            // Detention
            $table->integer('detention_free_day')->nullable();
            $table->date('detention_last_date')->nullable();
            $table->integer('detention_used_day')->nullable();
            $table->integer('detention_extra_day')->nullable();
            $table->string('detention_rate')->nullable();
            $table->decimal('detention_total', 12, 2)->nullable();
            $table->text('detention_remark')->nullable();
            $table->date('left_port_date')->nullable();
            $table->date('container_return_date')->nullable();

            // Demurrage
            $table->integer('demurrage_free_day')->nullable();
            $table->date('demurrage_last_date')->nullable();
            $table->integer('demurrage_used_day')->nullable();
            $table->integer('demurrage_extra_day')->nullable();
            $table->string('demurrage_rate')->nullable();
            $table->decimal('demurrage_total', 12, 2)->nullable();
            $table->text('demurrage_remark')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            // Foreign keys
            $table->foreign('shipment_id')
                ->references('shipment_id')
                ->on('jobs')
                ->cascadeOnDelete();

            $table->foreign('route_id')
                ->references('id')
                ->on('routes')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('containers');
    }
};
