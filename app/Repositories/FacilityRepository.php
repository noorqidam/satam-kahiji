<?php

namespace App\Repositories;

use App\Models\Facility;
use App\Repositories\Contracts\FacilityRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class FacilityRepository implements FacilityRepositoryInterface
{
    public function __construct(
        private Facility $model
    ) {}

    /**
     * Get paginated facilities with optional filters.
     */
    public function getPaginatedFacilities(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->orderBy('name', 'asc');

        $this->applyFilters($query, $filters);

        $facilities = $query->paginate($perPage);
        
        // Append query parameters to pagination links
        $facilities->appends($filters);

        return $facilities;
    }

    /**
     * Get all facilities.
     */
    public function getAll(): Collection
    {
        return $this->model->orderBy('name', 'asc')->get();
    }

    /**
     * Find facility by ID.
     */
    public function findById(int $id): ?Facility
    {
        return $this->model->find($id);
    }

    /**
     * Create a new facility.
     */
    public function create(array $data): Facility
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing facility.
     */
    public function update(Facility $facility, array $data): bool
    {
        return $facility->update($data);
    }

    /**
     * Delete a facility.
     */
    public function delete(Facility $facility): bool
    {
        return $facility->delete();
    }

    /**
     * Search facilities by name or description.
     */
    public function search(string $query): Collection
    {
        $searchTerm = strtolower($query);
        
        return $this->model
            ->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$searchTerm}%"]);
            })
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get facilities with photos.
     */
    public function getFacilitiesWithPhotos(): Collection
    {
        return $this->model
            ->whereNotNull('photo')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Get facility count.
     */
    public function count(): int
    {
        return $this->model->count();
    }

    /**
     * Apply filters to the query.
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        // Search filter (case-insensitive)
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
            });
        }

        // Filter by facilities with photos
        if (!empty($filters['has_photo'])) {
            if ($filters['has_photo'] === 'yes') {
                $query->whereNotNull('photo');
            } elseif ($filters['has_photo'] === 'no') {
                $query->whereNull('photo');
            }
        }

        // Order filter
        if (!empty($filters['order'])) {
            switch ($filters['order']) {
                case 'name_desc':
                    $query->reorder('name', 'desc');
                    break;
                case 'created_asc':
                    $query->reorder('created_at', 'asc');
                    break;
                case 'created_desc':
                    $query->reorder('created_at', 'desc');
                    break;
                default:
                    $query->reorder('name', 'asc');
            }
        }
    }
}