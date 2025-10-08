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
        Schema::create('work_item_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_work_file_id')->constrained('teacher_work_files')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->text('feedback');
            $table->enum('status', ['pending', 'approved', 'needs_revision'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            
            $table->index(['teacher_work_file_id', 'reviewer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_item_feedback');
    }
};