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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., "7A", "8B", "9C"
            $table->enum('grade_level', ['7', '8', '9']); // Junior high school grades
            $table->string('class_section', 10); // e.g., "A", "B", "C"
            $table->string('description')->nullable();
            $table->integer('capacity')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Index for better performance
            $table->index(['grade_level', 'class_section']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
