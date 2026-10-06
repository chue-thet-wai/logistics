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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');

            $table->string('cus_id')->unique();
            $table->string('name')->nullable();
            $table->integer('customer_type')->default(0);
            $table->integer('status')->default(0);

            $table->string('contact_person')->nullable();
            $table->string('designation')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('phone',20)->nullable();
            $table->string('secondary_phone',20)->nullable();
            $table->string('whatsapp')->nullable();

            $table->text('billing_address')->nullable();
            $table->string('billing_country')->nullable();
            $table->string('billing_state')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_zip',20)->nullable();

            $table->text('shipping_address')->nullable();
            $table->string('shipping_country')->nullable();
            $table->string('shipping_state')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_zip',20)->nullable();

            $table->decimal('credit_limit', 10, 2)->nullable();
            $table->string('currency',10)->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('invoice_email')->nullable();

            $table->text('notes')->nullable();

            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
