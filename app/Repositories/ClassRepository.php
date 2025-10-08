<?php

namespace App\Repositories;

use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use App\Repositories\Contracts\ClassRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ClassRepository implements ClassRepositoryInterface
{
    public function __construct(
        private SchoolClass $model
    ) {}

    public function getAllWithRelations(): Collection
    {
        return $this->model
            ->with(['homeroomTeacher'])
            ->withCount('students')
            ->orderBy('grade_level')
            ->orderBy('class_section')
            ->get();
    }

    public function findWithRelations(int $id): ?SchoolClass
    {
        return $this->model
            ->with(['students.grades', 'homeroomTeacher'])
            ->find($id);
    }

    public function create(array $data): SchoolClass
    {
        return $this->model->create($data);
    }

    public function update(SchoolClass $class, array $data): bool
    {
        return $class->update($data);
    }

    public function delete(SchoolClass $class): bool
    {
        return $class->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        $query = $this->model->where('name', $name);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function getStatistics(): array
    {
        $classes = $this->getAllWithRelations();
        
        return [
            'total_classes' => $classes->count(),
            'active_classes' => $classes->count(),
            'classes_with_teachers' => $classes->whereNotNull('homeroomTeacher')->count(),
            'total_capacity' => $classes->sum('capacity'),
            'total_students' => $classes->sum('students_count'),
        ];
    }

    public function getByGradeLevel(?int $gradeLevel = null): Collection
    {
        $query = $this->model->orderBy('grade_level')->orderBy('class_section');
        
        if ($gradeLevel) {
            $query->where('grade_level', $gradeLevel);
        }
        
        return $query->get(['id', 'name', 'grade_level', 'class_section', 'capacity']);
    }

    public function hasStudents(SchoolClass $class): bool
    {
        return $class->students()->exists();
    }

    public function removeHomeroomTeacherAssignment(SchoolClass $class): bool
    {
        if ($class->homeroomTeacher) {
            return $class->homeroomTeacher->update(['homeroom_class' => null]);
        }
        
        return true;
    }

    public function updateRelatedRecords(string $oldName, string $newName): void
    {
        Student::where('class', $oldName)->update(['class' => $newName]);
        Staff::where('homeroom_class', $oldName)->update(['homeroom_class' => $newName]);
    }
}