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
        Schema::create('student_disciplinary_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->string('incident_type', 100);
            $table->text('description');
            $table->text('action_taken')->nullable();
            $table->date('date');
            $table->enum('severity', ['minor', 'moderate', 'serious'])->default('minor');
            $table->timestamps();
            
            $table->index(['student_id', 'date']);
            $table->index('severity');
            $table->index('incident_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_disciplinary_records');
    }
};
