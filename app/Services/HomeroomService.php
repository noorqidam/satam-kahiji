<?php

namespace App\Services;

use App\Models\Staff;
use App\Repositories\Contracts\HomeroomRepositoryInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class HomeroomService
{
    public function __construct(
        private HomeroomRepositoryInterface $homeroomRepository
    ) {}

    public function getHomeroomOverview(): array
    {
        $teachers = $this->homeroomRepository->getAllTeachersWithHomeroom();
        $availableClasses = $this->homeroomRepository->getAvailableClasses();
        $classStats = $this->homeroomRepository->getClassStatistics($availableClasses, $teachers);
        $unassignedClasses = $this->homeroomRepository->getUnassignedClasses($availableClasses, $teachers);

        return [
            'teachers' => $teachers,
            'class_stats' => $classStats,
            'available_classes' => $availableClasses->values()->toArray(),
            'unassigned_classes' => $unassignedClasses->values()->toArray(),
        ];
    }

    public function assignClassToTeacher(int $staffId, string $className): array
    {
        $staff = $this->homeroomRepository->findStaffById($staffId);
        
        if (!$staff) {
            throw new \InvalidArgumentException('Staff member not found');
        }

        $this->validateTeacherAssignment($staff, $className);
        $this->validateClassAvailability($className, $staff->id);

        $this->homeroomRepository->updateStaffHomeroomClass($staff, $className);
        $studentsUpdated = $this->homeroomRepository->assignStudentsToHomeroomTeacher($className, $staff->id);

        return [
            'staff' => $staff,
            'class_name' => $className,
            'students_updated' => $studentsUpdated,
        ];
    }

    public function removeTeacherAssignment(Staff $staff): array
    {
        $className = $staff->homeroom_class;
        
        if (!$className) {
            throw new \InvalidArgumentException('This teacher has no homeroom class assignment');
        }

        $this->homeroomRepository->updateStaffHomeroomClass($staff, null);
        $studentsUpdated = $this->homeroomRepository->removeStudentsFromHomeroomTeacher($className, $staff->id);

        return [
            'staff' => $staff,
            'class_name' => $className,
            'students_updated' => $studentsUpdated,
        ];
    }

    public function bulkAssignStudentsToHomeroom(int $staffId, string $className): array
    {
        $staff = $this->homeroomRepository->findStaffById($staffId);
        
        if (!$staff) {
            throw new \InvalidArgumentException('Staff member not found');
        }

        $studentsUpdated = $this->homeroomRepository->bulkAssignStudentsToHomeroom($className, $staffId);

        return [
            'staff' => $staff,
            'class_name' => $className,
            'students_updated' => $studentsUpdated,
        ];
    }

    public function getClassDetails(string $className): array
    {
        $students = $this->homeroomRepository->getStudentsByClass($className);
        $assignedTeacher = $this->homeroomRepository->findStaffByHomeroomClass($className);

        $studentsWithHomeroom = $students->whereNotNull('homeroom_teacher')->count();

        return [
            'class_name' => $className,
            'students' => $students,
            'assigned_teacher' => $assignedTeacher,
            'total_students' => $students->count(),
            'students_with_homeroom' => $studentsWithHomeroom,
        ];
    }

    public function getAvailableTeachers(): EloquentCollection
    {
        return $this->homeroomRepository->getAvailableTeachers();
    }

    private function validateTeacherAssignment(Staff $staff, string $className): void
    {
        if ($staff->homeroom_class && $staff->homeroom_class !== $className) {
            throw new \InvalidArgumentException(
                "{$staff->name} is already assigned as homeroom teacher for class {$staff->homeroom_class}. Please remove the existing assignment first."
            );
        }
    }

    private function validateClassAvailability(string $className, int $staffId): void
    {
        $existingAssignment = $this->homeroomRepository->findStaffByHomeroomClass($className, $staffId);

        if ($existingAssignment) {
            throw new \InvalidArgumentException(
                "Class {$className} is already assigned to {$existingAssignment->name}"
            );
        }
    }
}