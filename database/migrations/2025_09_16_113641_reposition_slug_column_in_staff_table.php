<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, skip column reordering to avoid index issues
            return;
        }
        
        Schema::table('staff', function (Blueprint $table) {
            // Drop the existing slug column
            $table->dropIndex(['slug']);
            $table->dropColumn('slug');
        });

        Schema::table('staff', function (Blueprint $table) {
            // Re-add slug column after phone column
            $table->string('slug')->nullable()->unique()->after('phone');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            // Drop the repositioned slug column
            $table->dropIndex(['slug']);
            $table->dropColumn('slug');
        });

        Schema::table('staff', function (Blueprint $table) {
            // Re-add slug column after name column (original position)
            $table->string('slug')->nullable()->unique()->after('name');
            $table->index('slug');
        });
    }
};
