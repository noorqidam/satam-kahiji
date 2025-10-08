<?php

namespace App\Repositories\Contracts;

use App\Models\Extracurricular;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ExtracurricularRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator;
    
    public function findWithStudents(int $id): ?Extracurricular;
    
    public function create(array $data): Extracurricular;
    
    public function update(Extracurricular $extracurricular, array $data): bool;
    
    public function delete(Extracurricular $extracurricular): bool;
    
    public function bulkDelete(array $ids): int;
    
    public function findByIds(array $ids): Collection;
    
    public function existsByName(string $name, ?int $excludeId = null): bool;
    
    public function syncStudents(Extracurricular $extracurricular, array $studentIds): void;
    
    public function detachStudent(Extracurricular $extracurricular, int $studentId): void;
}