<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Only seed super admin user and work items
        $this->call([
            SuperAdminSeeder::class,
            WorkItemSeeder::class,
        ]);
    }
}