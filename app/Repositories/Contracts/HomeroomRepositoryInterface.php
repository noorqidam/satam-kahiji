<?php

namespace App\Repositories\Contracts;

use App\Models\Staff;
use App\Models\Student;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

interface HomeroomRepositoryInterface
{
    public function getAllTeachersWithHomeroom(): EloquentCollection;
    
    public function getAvailableClasses(): Collection;
    
    public function getClassStatistics(Collection $availableClasses, EloquentCollection $teachers): Collection;
    
    public function getUnassignedClasses(Collection $availableClasses, EloquentCollection $teachers): Collection;
    
    public function findStaffById(int $staffId): ?Staff;
    
    public function findStaffByHomeroomClass(string $className, ?int $excludeStaffId = null): ?Staff;
    
    public function updateStaffHomeroomClass(Staff $staff, ?string $className): bool;
    
    public function assignStudentsToHomeroomTeacher(string $className, int $staffId): int;
    
    public function removeStudentsFromHomeroomTeacher(string $className, int $staffId): int;
    
    public function getStudentsByClass(string $className): EloquentCollection;
    
    public function getAvailableTeachers(): EloquentCollection;
    
    public function bulkAssignStudentsToHomeroom(string $className, int $staffId): int;
}