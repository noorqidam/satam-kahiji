<?php

namespace App\Repositories;

use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use App\Repositories\Contracts\HomeroomRepositoryInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class HomeroomRepository implements HomeroomRepositoryInterface
{
    public function __construct(
        private Staff $staffModel,
        private SchoolClass $classModel,
        private Student $studentModel
    ) {}

    public function getAllTeachersWithHomeroom(): EloquentCollection
    {
        return $this->staffModel
            ->whereHas('user', function ($query) {
                $query->where('role', 'teacher');
            })
            ->with(['user', 'homeroomStudents'])
            ->get();
    }

    public function getAvailableClasses(): Collection
    {
        return $this->classModel
            ->orderBy('grade_level')
            ->orderBy('class_section')
            ->pluck('name');
    }

    public function getClassStatistics(Collection $availableClasses, EloquentCollection $teachers): Collection
    {
        return $availableClasses->map(function ($className) use ($teachers) {
            $studentCount = $this->studentModel->where('class', $className)->count();
            $assignedTeacher = $teachers->firstWhere('homeroom_class', $className);
            
            return [
                'class' => $className,
                'student_count' => $studentCount,
                'assigned_teacher' => $assignedTeacher,
                'has_teacher' => $assignedTeacher !== null,
            ];
        })->values();
    }

    public function getUnassignedClasses(Collection $availableClasses, EloquentCollection $teachers): Collection
    {
        $assignedClasses = $teachers->whereNotNull('homeroom_class')->pluck('homeroom_class');
        return $availableClasses->diff($assignedClasses);
    }

    public function findStaffById(int $staffId): ?Staff
    {
        return $this->staffModel->find($staffId);
    }

    public function findStaffByHomeroomClass(string $className, ?int $excludeStaffId = null): ?Staff
    {
        $query = $this->staffModel->where('homeroom_class', $className);
        
        if ($excludeStaffId) {
            $query->where('id', '!=', $excludeStaffId);
        }
        
        return $query->first();
    }

    public function updateStaffHomeroomClass(Staff $staff, ?string $className): bool
    {
        return $staff->update(['homeroom_class' => $className]);
    }

    public function assignStudentsToHomeroomTeacher(string $className, int $staffId): int
    {
        return $this->studentModel
            ->where('class', $className)
            ->update(['homeroom_teacher_id' => $staffId]);
    }

    public function removeStudentsFromHomeroomTeacher(string $className, int $staffId): int
    {
        return $this->studentModel
            ->where('class', $className)
            ->where('homeroom_teacher_id', $staffId)
            ->update(['homeroom_teacher_id' => null]);
    }

    public function getStudentsByClass(string $className): EloquentCollection
    {
        return $this->studentModel
            ->where('class', $className)
            ->with('homeroomTeacher')
            ->orderBy('name')
            ->get();
    }

    public function getAvailableTeachers(): EloquentCollection
    {
        return $this->staffModel
            ->whereHas('user', function ($query) {
                $query->where('role', 'teacher');
            })
            ->with('user')
            ->orderBy('name')
            ->get();
    }

    public function bulkAssignStudentsToHomeroom(string $className, int $staffId): int
    {
        return $this->studentModel
            ->where('class', $className)
            ->update(['homeroom_teacher_id' => $staffId]);
    }
}