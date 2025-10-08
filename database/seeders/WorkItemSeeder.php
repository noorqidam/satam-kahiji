<?php

namespace Database\Seeders;

use App\Models\WorkItem;
use Illuminate\Database\Seeder;

class WorkItemSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $workItems = [
            [
                'name' => 'Prota (Annual Program)',
                'is_required' => true,
                'created_by_role' => 'headmaster',
            ],
            [
                'name' => 'Prosem (Semester Program)',
                'is_required' => true,
                'created_by_role' => 'headmaster',
            ],
            [
                'name' => 'Module',
                'is_required' => true,
                'created_by_role' => 'headmaster',
            ],
            [
                'name' => 'Attendance List',
                'is_required' => true,
                'created_by_role' => 'headmaster',
            ],
            [
                'name' => 'Agenda',
                'is_required' => true,
                'created_by_role' => 'headmaster',
            ],
        ];

        foreach ($workItems as $workItem) {
            WorkItem::firstOrCreate(
                ['name' => $workItem['name']],
                $workItem
            );
        }
    }
}