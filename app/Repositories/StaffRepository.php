<?php

namespace App\Repositories;

use App\Models\Staff;
use App\Repositories\Contracts\StaffRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class StaffRepository implements StaffRepositoryInterface
{
    public function __construct(
        private Staff $model
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with('user')->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage)->withQueryString();
    }

    public function findWithRelations(int $id): ?Staff
    {
        return $this->model
            ->with(['user', 'subjects'])
            ->find($id);
    }

    public function create(array $data): Staff
    {
        return $this->model->create($data);
    }

    public function update(Staff $staff, array $data): bool
    {
        return $staff->update($data);
    }

    public function delete(Staff $staff): bool
    {
        return $staff->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function findByIds(array $ids): EloquentCollection
    {
        return $this->model->whereIn('id', $ids)->get();
    }

    public function getUniqueDivisions(): Collection
    {
        return $this->model
            ->distinct()
            ->pluck('division')
            ->filter()
            ->sort()
            ->values();
    }

    public function syncSubjects(Staff $staff, array $subjectIds): void
    {
        $staff->subjects()->sync($subjectIds);
    }

    public function detachSubject(Staff $staff, int $subjectId): void
    {
        $staff->subjects()->detach($subjectId);
    }

    public function isTeacherInAcademicDivision(Staff $staff): bool
    {
        $isTeacher = str_contains(strtolower($staff->position), 'teacher') || 
                    str_contains(strtolower($staff->position), 'guru');
        $isAcademic = strtolower($staff->division) === 'akademik';
        
        return $isTeacher && $isAcademic;
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        // Search functionality (case-insensitive)
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(division) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(phone) LIKE ?', ["%{$search}%"]);
            });
        }

        // Multiple divisions filter
        if (!empty($filters['divisions'])) {
            $divisions = is_string($filters['divisions']) 
                ? explode(',', $filters['divisions']) 
                : $filters['divisions'];
            
            $query->whereIn('division', $divisions);
        }
    }
}