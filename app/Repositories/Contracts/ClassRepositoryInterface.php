<?php

namespace App\Repositories\Contracts;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Collection;

interface ClassRepositoryInterface
{
    public function getAllWithRelations(): Collection;
    
    public function findWithRelations(int $id): ?SchoolClass;
    
    public function create(array $data): SchoolClass;
    
    public function update(SchoolClass $class, array $data): bool;
    
    public function delete(SchoolClass $class): bool;
    
    public function bulkDelete(array $ids): int;
    
    public function existsByName(string $name, ?int $excludeId = null): bool;
    
    public function getStatistics(): array;
    
    public function getByGradeLevel(?int $gradeLevel = null): Collection;
    
    public function hasStudents(SchoolClass $class): bool;
    
    public function removeHomeroomTeacherAssignment(SchoolClass $class): bool;
    
    public function updateRelatedRecords(string $oldName, string $newName): void;
}