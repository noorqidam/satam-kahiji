<?php

namespace App\Repositories\Contracts;

use App\Models\Staff;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

interface StaffRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    
    public function findWithRelations(int $id): ?Staff;
    
    public function create(array $data): Staff;
    
    public function update(Staff $staff, array $data): bool;
    
    public function delete(Staff $staff): bool;
    
    public function bulkDelete(array $ids): int;
    
    public function findByIds(array $ids): EloquentCollection;
    
    public function getUniqueDivisions(): Collection;
    
    public function syncSubjects(Staff $staff, array $subjectIds): void;
    
    public function detachSubject(Staff $staff, int $subjectId): void;
    
    public function isTeacherInAcademicDivision(Staff $staff): bool;
}