<?php

namespace App\Repositories;

use App\Models\Extracurricular;
use App\Repositories\Contracts\ExtracurricularRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ExtracurricularRepository implements ExtracurricularRepositoryInterface
{
    public function __construct(
        private Extracurricular $model
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->model->withCount('students')->orderBy('name');

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage)->withQueryString();
    }

    public function findWithStudents(int $id): ?Extracurricular
    {
        return $this->model
            ->with(['students' => function ($query) {
                $query->orderBy('name');
            }])
            ->find($id);
    }

    public function create(array $data): Extracurricular
    {
        return $this->model->create($data);
    }

    public function update(Extracurricular $extracurricular, array $data): bool
    {
        return $extracurricular->update($data);
    }

    public function delete(Extracurricular $extracurricular): bool
    {
        return $extracurricular->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function findByIds(array $ids): Collection
    {
        return $this->model->whereIn('id', $ids)->get();
    }

    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        $query = $this->model->where('name', $name);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function syncStudents(Extracurricular $extracurricular, array $studentIds): void
    {
        $extracurricular->students()->sync($studentIds);
    }

    public function detachStudent(Extracurricular $extracurricular, int $studentId): void
    {
        $extracurricular->students()->detach($studentId);
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $searchTerm = strtolower($filters['search']);
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%' . $searchTerm . '%'])
                  ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $searchTerm . '%']);
            });
        }
    }
}