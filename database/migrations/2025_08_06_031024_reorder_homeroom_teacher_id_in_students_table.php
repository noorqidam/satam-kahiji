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
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['homeroom_teacher_id']);
            $table->dropColumn('homeroom_teacher_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('homeroom_teacher_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('staff')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['homeroom_teacher_id']);
            $table->dropColumn('homeroom_teacher_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('homeroom_teacher_id')
                  ->nullable()
                  ->after('class')
                  ->constrained('staff')
                  ->nullOnDelete();
        });
    }
};
