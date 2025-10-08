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
        Schema::table('work_item_feedback', function (Blueprint $table) {
            $table->timestamp('teacher_read_at')->nullable()->after('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_item_feedback', function (Blueprint $table) {
            $table->dropColumn('teacher_read_at');
        });
    }
};
