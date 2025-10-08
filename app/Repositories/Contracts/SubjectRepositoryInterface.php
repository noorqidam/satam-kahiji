<?php

namespace App\Repositories\Contracts;

use App\Models\Subject;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

interface SubjectRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;
    
    public function findWithStaff(int $id): ?Subject;
    
    public function create(array $data): Subject;
    
    public function update(Subject $subject, array $data): bool;
    
    public function delete(Subject $subject): bool;
    
    public function bulkDelete(array $ids): int;
    
    public function existsByCode(string $code, ?int $excludeId = null): bool;
    
    public function syncStaff(Subject $subject, array $staffIds): void;
    
    public function detachStaff(Subject $subject, int $staffId): void;
    
    public function getEligibleStaff(): EloquentCollection;
    
    public function getStaffForAssignment(): EloquentCollection;
    
    public function validateStaffEligibility(array $staffIds): array;
}