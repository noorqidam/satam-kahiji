<?php

namespace Database\Seeders;

use App\Models\EducationalBackground;
use App\Models\Staff;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EducationalBackgroundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find principal staff members
        $principals = Staff::where(function($query) {
            $query->whereRaw('LOWER(position) = ?', ['kepala sekolah'])
                  ->orWhereRaw('LOWER(position) = ?', ['principal']);
        })
        ->where(function($query) {
            $query->whereRaw('LOWER(division) = ?', ['kepala sekolah'])
                  ->orWhereRaw('LOWER(division) = ?', ['headmaster']);
        })
        ->get();

        foreach ($principals as $principal) {
            // Add sample educational background data for each principal
            EducationalBackground::create([
                'staff_id' => $principal->id,
                'degree' => 'Magister Pendidikan (M.Pd.)',
                'field_of_study' => 'Manajemen Pendidikan',
                'institution' => 'Universitas Pendidikan Indonesia',
                'graduation_year' => 2015,
                'description' => 'Fokus pada manajemen dan kepemimpinan institusi pendidikan'
            ]);

            EducationalBackground::create([
                'staff_id' => $principal->id,
                'degree' => 'Sarjana Pendidikan (S.Pd.)',
                'field_of_study' => 'Pendidikan Matematika',
                'institution' => 'Universitas Negeri Jakarta',
                'graduation_year' => 2010,
                'description' => 'Lulusan terbaik dengan predikat Summa Cum Laude'
            ]);
        }
    }
}
