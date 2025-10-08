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
        Schema::table('gallery_items', function (Blueprint $table) {
            // Add mime_type column as nullable first
            $table->string('mime_type')->nullable()->after('caption');
        });

        // Update existing records to have mime_type based on type
        DB::statement("UPDATE gallery_items SET mime_type = CASE 
            WHEN type = 'image' THEN 'image/jpeg' 
            WHEN type = 'video' THEN 'video/mp4' 
            ELSE 'application/octet-stream'
        END");

        // Make mime_type not nullable after data migration
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->string('mime_type')->nullable(false)->change();
            
            // Remove the old type column
            $table->dropColumn('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            // Add back the type column
            $table->enum('type', ['image', 'video'])->after('caption');
            
            // Remove mime_type column
            $table->dropColumn('mime_type');
        });
    }
};
