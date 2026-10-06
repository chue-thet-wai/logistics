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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id(); 
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('driver_id')->unique(); 
            $table->string('name')->nullable()->index();
            $table->string('email')->unique()->nullable();
            $table->string('phone',20)->nullable()->index();
            $table->string('status',20)->nullable()->index();
            $table->string('route')->nullable()->index();
            $table->string('checkpoint')->nullable()->index();
            $table->boolean('available')->default(1)->index();// 1 = Available, 0 = Busy
            $table->text('remark')->nullable();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable()->index();

            $table->timestamps(); 
            $table->softDeletes(); 

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->index('created_at');
            $table->index('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
