<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we need to recreate the table with the correct column order
        // First, backup existing data
        DB::statement('CREATE TABLE contacts_backup AS SELECT * FROM contacts');
        
        // Drop the existing table
        DB::statement('DROP TABLE contacts');
        
        // Recreate the table with the correct column order
        DB::statement('
            CREATE TABLE contacts (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                phone VARCHAR(255),
                address VARCHAR(500),
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        ');
        
        // Restore data in the new column order
        DB::statement('
            INSERT INTO contacts (id, name, email, message, phone, address, created_at, updated_at)
            SELECT id, name, email, message, phone, address, created_at, updated_at 
            FROM contacts_backup
        ');
        
        // Update the sequence to continue from the last ID
        DB::statement("SELECT setval('contacts_id_seq', (SELECT MAX(id) FROM contacts))");
        
        // Clean up backup table
        DB::statement('DROP TABLE contacts_backup');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed due to column reordering
        // If rollback is needed, restore from backup
        throw new \Exception('This migration cannot be reversed. Restore from backup if needed.');
    }
};
