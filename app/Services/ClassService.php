<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Repositories\Contracts\ClassRepositoryInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ClassService
{
    public function __construct(
        private ClassRepositoryInterface $classRepository
    ) {}

    public function getAllClasses(): EloquentCollection
    {
        return $this->classRepository->getAllWithRelations();
    }

    public function getClassById(int $id): ?SchoolClass
    {
        return $this->classRepository->findWithRelations($id);
    }

    public function createClass(array $data): SchoolClass
    {
        $data['name'] = $this->generateClassName($data['grade_level'], $data['class_section']);
        
        $this->validateUniqueClassName($data['name']);
        
        return $this->classRepository->create($data);
    }

    public function updateClass(SchoolClass $class, array $data): SchoolClass
    {
        $newName = $this->generateClassName($data['grade_level'], $data['class_section']);
        $oldName = $class->name;
        
        if ($newName !== $oldName) {
            $this->validateUniqueClassName($newName, $class->id);
            $data['name'] = $newName;
            
            $this->classRepository->update($class, $data);
            $this->classRepository->updateRelatedRecords($oldName, $newName);
        } else {
            $this->classRepository->update($class, $data);
        }
        
        return $class->fresh();
    }

    public function deleteClass(SchoolClass $class): bool
    {
        $this->validateClassCanBeDeleted($class);
        
        $this->classRepository->removeHomeroomTeacherAssignment($class);
        
        return $this->classRepository->delete($class);
    }

    public function bulkDeleteClasses(array $ids): array
    {
        $classes = SchoolClass::whereIn('id', $ids)->get();
        $deleted = 0;
        $errors = [];

        foreach ($classes as $class) {
            try {
                $this->validateClassCanBeDeleted($class);
                $this->classRepository->removeHomeroomTeacherAssignment($class);
                $this->classRepository->delete($class);
                $deleted++;
            } catch (\InvalidArgumentException $e) {
                $errors[] = "Class {$class->name}: {$e->getMessage()}";
            }
        }

        return [
            'deleted' => $deleted,
            'errors' => $errors,
            'total' => count($classes)
        ];
    }

    public function getClassStatistics(): array
    {
        return $this->classRepository->getStatistics();
    }

    public function getClassesByGrade(?int $gradeLevel = null): EloquentCollection
    {
        return $this->classRepository->getByGradeLevel($gradeLevel);
    }

    public function groupClassesByGrade(Collection $classes): Collection
    {
        return $classes->groupBy('grade_level');
    }

    private function generateClassName(int $gradeLevel, string $classSection): string
    {
        return $gradeLevel . $classSection;
    }

    private function validateUniqueClassName(string $name, ?int $excludeId = null): void
    {
        if ($this->classRepository->existsByName($name, $excludeId)) {
            throw ValidationException::withMessages([
                'class_section' => "Class {$name} already exists"
            ]);
        }
    }

    private function validateClassCanBeDeleted(SchoolClass $class): void
    {
        if ($this->classRepository->hasStudents($class)) {
            throw new \InvalidArgumentException('Cannot delete class with existing students. Please move students to other classes first.');
        }
    }
}