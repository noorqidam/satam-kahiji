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
        Schema::create('student_extracurricular_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('extracurricular_id')->constrained('extracurriculars')->onDelete('cascade');
            $table->string('academic_year', 9);
            $table->string('role', 100)->nullable(); // member, leader, president, etc.
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('performance_notes')->nullable();
            $table->timestamps();
            
            $table->index(['student_id', 'academic_year']);
            $table->index(['extracurricular_id', 'academic_year']);
            $table->unique(['student_id', 'extracurricular_id', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_extracurricular_history');
    }
};
