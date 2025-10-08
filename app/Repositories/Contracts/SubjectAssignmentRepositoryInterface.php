<?php

namespace App\Repositories\Contracts;

use App\Models\Staff;
use App\Models\Subject;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

interface SubjectAssignmentRepositoryInterface
{
    public function getEligibleStaffPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;
    
    public function getSubjectsPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    
    public function findStaffById(int $staffId): ?Staff;
    
    public function validateStaffEligibility(Staff $staff): bool;
    
    public function syncStaffSubjects(Staff $staff, array $subjectIds): void;
    
    public function getAllEligibleStaff(): EloquentCollection;
    
    public function getAllSubjects(): EloquentCollection;
    
    public function getAssignmentMatrix(): array;
    
    public function bulkUpdateAssignments(array $assignments): array;
}