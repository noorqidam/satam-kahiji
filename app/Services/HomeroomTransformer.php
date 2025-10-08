<?php

namespace App\Services;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class HomeroomTransformer
{
    public function transformTeachersForIndex(EloquentCollection $teachers): Collection
    {
        return $teachers->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->name,
                'position' => $staff->position,
                'division' => $staff->division,
                'homeroom_class' => $staff->homeroom_class,
                'homeroom_students_count' => $staff->homeroomStudents->count(),
                'user_email' => $staff->user->email ?? null,
            ];
        });
    }

    public function transformStudentsForClassDetails(EloquentCollection $students): Collection
    {
        return $students->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'gender' => $student->gender,
                'status' => $student->status,
                'homeroom_teacher' => $student->homeroomTeacher ? [
                    'id' => $student->homeroomTeacher->id,
                    'name' => $student->homeroomTeacher->name,
                ] : null,
            ];
        });
    }

    public function transformTeacherForClassDetails(?Staff $teacher): ?array
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

    public function transformAvailableTeachers(EloquentCollection $teachers): Collection
    {
        return $teachers->map(function ($staff) {
            return [
                'id' => $staff->id,
                'name' => $staff->name,
                'position' => $staff->position,
                'division' => $staff->division,
                'homeroom_class' => $staff->homeroom_class,
                'is_available' => $staff->homeroom_class === null,
                'homeroom_students_count' => $staff->homeroomStudents()->count(),
            ];
        });
    }

    public function transformClassDetailsResponse(array $classDetails): array
    {
        return [
            'class' => $classDetails['class_name'],
            'students' => $this->transformStudentsForClassDetails($classDetails['students']),
            'assigned_teacher' => $this->transformTeacherForClassDetails($classDetails['assigned_teacher']),
            'total_students' => $classDetails['total_students'],
            'students_with_homeroom' => $classDetails['students_with_homeroom'],
        ];
    }

    public function transformBulkAssignResponse(array $result): array
    {
        return [
            'message' => "Successfully assigned {$result['students_updated']} students from class {$result['class_name']} to {$result['staff']->name}",
            'students_updated' => $result['students_updated'],
        ];
    }
}