<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class ClassTransformer
{
    public function transformForIndex(EloquentCollection $classes): Collection
    {
        return $classes->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'grade_level' => $class->grade_level,
                'class_section' => $class->class_section,
                'description' => $class->description,
                'capacity' => $class->capacity,
                'student_count' => $class->students_count,
                'available_capacity' => $class->capacity - $class->students_count,
                'is_full' => $class->students_count >= $class->capacity,
                'homeroom_teacher' => $this->transformHomeroomTeacher($class->homeroomTeacher),
            ];
        });
    }

    public function transformForShow(SchoolClass $class): array
    {
        return [
            'id' => $class->id,
            'name' => $class->name,
            'grade_level' => $class->grade_level,
            'class_section' => $class->class_section,
            'description' => $class->description,
            'capacity' => $class->capacity,
            'student_count' => $class->students->count(),
            'available_capacity' => $class->capacity - $class->students->count(),
            'is_full' => $class->students->count() >= $class->capacity,
            'homeroom_teacher' => $this->transformHomeroomTeacher($class->homeroomTeacher),
        ];
    }

    public function transformForEdit(SchoolClass $class): array
    {
        return [
            'id' => $class->id,
            'name' => $class->name,
            'grade_level' => $class->grade_level,
            'class_section' => $class->class_section,
            'description' => $class->description,
            'capacity' => $class->capacity,
        ];
    }

    public function transformStudentsForShow(EloquentCollection $students): Collection
    {
        return $students->map(function ($student) {
            return [
                'id' => $student->id,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'gender' => $student->gender,
                'status' => $student->status,
                'entry_year' => $student->entry_year,
                'graduation_year' => $student->graduation_year,
                'average_grade' => $this->calculateAverageGrade($student),
                'photo' => $this->transformStudentPhoto($student->photo),
            ];
        });
    }

    public function transformForApi(EloquentCollection $classes): Collection
    {
        return $classes->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'grade_level' => $class->grade_level,
                'class_section' => $class->class_section,
                'capacity' => $class->capacity,
                'student_count' => $class->students()->count(),
                'available_capacity' => $class->capacity - $class->students()->count(),
            ];
        });
    }

    private function transformHomeroomTeacher($teacher): ?array
    {
        if (!$teacher) {
            return null;
        }

        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'position' => $teacher->position,
        ];
    }

    private function calculateAverageGrade(Student $student): float
    {
        if (!$student->grades) {
            return 0;
        }

        return round($student->grades->avg('score'), 2);
    }

    private function transformStudentPhoto(?string $photo): ?string
    {
        if (!$photo || $photo === 'default.jpg') {
            return null;
        }

        return str_starts_with($photo, 'http') 
            ? $photo 
            : "/storage/{$photo}";
    }
}