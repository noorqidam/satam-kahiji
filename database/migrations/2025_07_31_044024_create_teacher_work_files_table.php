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
        Schema::create('teacher_work_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_subject_work_id')->constrained('teacher_subject_work')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_url');
            $table->timestamp('uploaded_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_work_files');
    }
};
