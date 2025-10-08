<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, check if there are any users with humas or tu roles
        $humasUsers = DB::table('users')->where('role', 'humas')->count();
        $tuUsers = DB::table('users')->where('role', 'tu')->count();

        if ($humasUsers > 0 || $tuUsers > 0) {
            throw new Exception("Cannot remove humas/tu roles. Found {$humasUsers} humas users and {$tuUsers} tu users. Please reassign or remove these users first.");
        }

        // For PostgreSQL, we need to alter the check constraint
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
                ALTER TABLE users 
                DROP CONSTRAINT IF EXISTS users_role_check,
                ADD CONSTRAINT users_role_check 
                CHECK (role IN ('super_admin', 'headmaster', 'teacher', 'deputy_headmaster'))
            ");
        } elseif (DB::getDriverName() === 'mysql') {
            // For MySQL, recreate the enum
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'headmaster', 'teacher', 'deputy_headmaster') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the original roles including humas and tu
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("
                ALTER TABLE users 
                DROP CONSTRAINT IF EXISTS users_role_check,
                ADD CONSTRAINT users_role_check 
                CHECK (role IN ('super_admin', 'headmaster', 'teacher', 'humas', 'tu', 'deputy_headmaster'))
            ");
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'headmaster', 'teacher', 'humas', 'tu', 'deputy_headmaster') NOT NULL");
        }
    }
};