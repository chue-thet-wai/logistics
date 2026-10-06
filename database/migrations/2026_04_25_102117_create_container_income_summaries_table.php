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
        Schema::create('container_income_summaries', function (Blueprint $table) {
            $table->id();
            $table->string('container_id')->nullable()->index();
            $table->foreign('container_id')->references('container_id')->on('containers')->nullOnDelete();
            $table->decimal('total', 12, 2)->default(0)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('container_income_summaries');
    }
};
