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
        Schema::table('contacts', function (Blueprint $table) {
            // Drop and recreate the phone column in the correct position
            $table->dropColumn('phone');
        });
        
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            // Drop and recreate the phone column at the end
            $table->dropColumn('phone');
        });
        
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('phone')->nullable();
        });
    }
};
