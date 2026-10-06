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
        Schema::create('routes', function (Blueprint $table) {
            $table->id(); 
            $table->string('route_id')->unique(); 
            $table->string('name')->index();
            $table->string('origin')->nullable()->index();
            $table->string('destination')->nullable()->index();
            $table->string('total_distance')->nullable()->index();
            $table->string('estimate_duration')->nullable()->index();
            $table->integer('status')->default(0)->index();//0 is inactive and 1 is active
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
        Schema::dropIfExists('routes');
    }
};
