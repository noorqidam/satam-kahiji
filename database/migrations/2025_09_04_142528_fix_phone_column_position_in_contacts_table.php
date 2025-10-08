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
        // For PostgreSQL, we need to recreate the table to change column order
        DB::statement('CREATE TABLE contacts_new (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            phone VARCHAR(255),
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )');
        
        // Copy data from old table to new table
        DB::statement('INSERT INTO contacts_new (id, name, email, message, phone, created_at, updated_at) 
                       SELECT id, name, email, message, phone, created_at, updated_at FROM contacts');
        
        // Update the sequence to continue from the last ID
        DB::statement('SELECT setval(\'contacts_new_id_seq\', (SELECT MAX(id) FROM contacts_new))');
        
        // Drop old table and rename new table
        DB::statement('DROP TABLE contacts');
        DB::statement('ALTER TABLE contacts_new RENAME TO contacts');
        DB::statement('ALTER SEQUENCE contacts_new_id_seq RENAME TO contacts_id_seq');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse: recreate table with phone at the end
        DB::statement('CREATE TABLE contacts_new (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            phone VARCHAR(255)
        )');
        
        // Copy data from old table to new table
        DB::statement('INSERT INTO contacts_new (id, name, email, message, created_at, updated_at, phone) 
                       SELECT id, name, email, message, created_at, updated_at, phone FROM contacts');
        
        // Update the sequence to continue from the last ID
        DB::statement('SELECT setval(\'contacts_new_id_seq\', (SELECT MAX(id) FROM contacts_new))');
        
        // Drop old table and rename new table
        DB::statement('DROP TABLE contacts');
        DB::statement('ALTER TABLE contacts_new RENAME TO contacts');
        DB::statement('ALTER SEQUENCE contacts_new_id_seq RENAME TO contacts_id_seq');
    }
};
