<?php

namespace App\Repositories;

use App\Models\Staff;
use App\Models\Subject;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class SubjectRepository implements SubjectRepositoryInterface
{
    public function __construct(
        private Subject $model,
        private Staff $staffModel
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->model->withCount('staff')->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage)->withQueryString();
    }

    public function findWithStaff(int $id): ?Subject
    {
        return $this->model
            ->with(['staff' => function($query) {
                $query->select('staff.id', 'staff.name', 'staff.position', 'staff.division', 'staff.email', 'staff.photo');
            }])
            ->find($id);
    }

    public function create(array $data): Subject
    {
        return $this->model->create($data);
    }

    public function update(Subject $subject, array $data): bool
    {
        return $subject->update($data);
    }

    public function delete(Subject $subject): bool
    {
        return $subject->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function existsByCode(string $code, ?int $excludeId = null): bool
    {
        $query = $this->model->where('code', $code);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function syncStaff(Subject $subject, array $staffIds): void
    {
        $subject->staff()->sync($staffIds);
    }

    public function detachStaff(Subject $subject, int $staffId): void
    {
        $subject->staff()->detach($staffId);
    }

    public function getEligibleStaff(): EloquentCollection
    {
        return $this->staffModel
            ->select('id', 'name', 'position', 'division')
            ->where(function ($q) {
                $q->whereRaw('LOWER(position) LIKE ?', ['%teacher%'])
                  ->orWhereRaw('LOWER(position) LIKE ?', ['%guru%']);
            })
            ->whereRaw('LOWER(division) = ?', ['akademik'])
            ->get();
    }

    public function getStaffForAssignment(): EloquentCollection
    {
        return $this->staffModel
            ->select('id', 'name', 'position', 'division')
            ->whereRaw('LOWER(position) LIKE ?', ['%guru%'])
            ->get();
    }

    public function validateStaffEligibility(array $staffIds): array
    {
        $staff = $this->staffModel->whereIn('id', $staffIds)->get();
        
        $ineligibleStaff = $staff->filter(function($staffMember) {
            $isTeacher = str_contains(strtolower($staffMember->position), 'teacher') || 
                        str_contains(strtolower($staffMember->position), 'guru');
            $isAcademic = strtolower($staffMember->division) === 'akademik';
            return !$isTeacher || !$isAcademic;
        });

        return [
            'eligible' => $staff->count() - $ineligibleStaff->count(),
            'ineligible' => $ineligibleStaff->toArray(),
            'has_ineligible' => $ineligibleStaff->isNotEmpty()
        ];
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        // Search functionality (case-insensitive)
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(code) LIKE ?', ["%{$search}%"]);
            });
        }
    }
}