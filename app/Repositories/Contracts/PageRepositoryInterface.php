<?php

namespace App\Repositories\Contracts;

use App\Models\Page;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PageRepositoryInterface
{
    /**
     * Get all pages ordered by creation date.
     */
    public function getAll(): Collection;

    /**
     * Get paginated pages with optional filters.
     */
    public function getPaginatedPages(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find page by ID.
     */
    public function findById(int $id): ?Page;

    /**
     * Find page by slug.
     */
    public function findBySlug(string $slug): ?Page;

    /**
     * Create a new page.
     */
    public function create(array $data): Page;

    /**
     * Update an existing page.
     */
    public function update(Page $page, array $data): bool;

    /**
     * Delete a page.
     */
    public function delete(Page $page): bool;

    /**
     * Check if a slug exists (excluding a specific page ID).
     */
    public function slugExists(string $slug, ?int $excludeId = null): bool;

    /**
     * Search pages by title or content.
     */
    public function search(string $query): Collection;

    /**
     * Get pages with images.
     */
    public function getPagesWithImages(): Collection;

    /**
     * Get recently updated pages.
     */
    public function getRecentlyUpdated(int $limit = 5): Collection;

    /**
     * Get page count.
     */
    public function count(): int;
}