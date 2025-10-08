<?php

namespace App\Repositories\Contracts;

use App\Models\Facility;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface FacilityRepositoryInterface
{
    /**
     * Get paginated facilities with optional filters.
     */
    public function getPaginatedFacilities(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get all facilities.
     */
    public function getAll(): Collection;

    /**
     * Find facility by ID.
     */
    public function findById(int $id): ?Facility;

    /**
     * Create a new facility.
     */
    public function create(array $data): Facility;

    /**
     * Update an existing facility.
     */
    public function update(Facility $facility, array $data): bool;

    /**
     * Delete a facility.
     */
    public function delete(Facility $facility): bool;

    /**
     * Search facilities by name or description.
     */
    public function search(string $query): Collection;

    /**
     * Get facilities with photos.
     */
    public function getFacilitiesWithPhotos(): Collection;

    /**
     * Get facility count.
     */
    public function count(): int;
}