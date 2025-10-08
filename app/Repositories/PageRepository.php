<?php

namespace App\Repositories;

use App\Models\Page;
use App\Repositories\Contracts\PageRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PageRepository implements PageRepositoryInterface
{
    public function __construct(
        private Page $model
    ) {}

    /**
     * Get all pages ordered by creation date.
     */
    public function getAll(): Collection
    {
        return $this->model->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated pages with optional filters.
     */
    public function getPaginatedPages(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->orderBy('created_at', 'desc');

        $this->applyFilters($query, $filters);

        $pages = $query->paginate($perPage);
        
        // Append query parameters to pagination links
        $pages->appends($filters);

        return $pages;
    }

    /**
     * Find page by ID.
     */
    public function findById(int $id): ?Page
    {
        return $this->model->find($id);
    }

    /**
     * Find page by slug.
     */
    public function findBySlug(string $slug): ?Page
    {
        return $this->model->where('slug', $slug)->first();
    }

    /**
     * Create a new page.
     */
    public function create(array $data): Page
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing page.
     */
    public function update(Page $page, array $data): bool
    {
        return $page->update($data);
    }

    /**
     * Delete a page.
     */
    public function delete(Page $page): bool
    {
        return $page->delete();
    }

    /**
     * Check if a slug exists (excluding a specific page ID).
     */
    public function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $query = $this->model->where('slug', $slug);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Search pages by title or content.
     */
    public function search(string $query): Collection
    {
        $searchTerm = strtolower($query);
        
        return $this->model
            ->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(content) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(slug) LIKE ?', ["%{$searchTerm}%"]);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get pages with images.
     */
    public function getPagesWithImages(): Collection
    {
        return $this->model
            ->whereNotNull('image')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get recently updated pages.
     */
    public function getRecentlyUpdated(int $limit = 5): Collection
    {
        return $this->model
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get page count.
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
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(content) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(slug) LIKE ?', ["%{$search}%"]);
            });
        }

        // Filter by pages with images
        if (!empty($filters['has_image'])) {
            if ($filters['has_image'] === 'yes') {
                $query->whereNotNull('image');
            } elseif ($filters['has_image'] === 'no') {
                $query->whereNull('image');
            }
        }

        // Date range filter
        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to'] . ' 23:59:59');
        }

        // Order filter
        if (!empty($filters['order'])) {
            switch ($filters['order']) {
                case 'title_asc':
                    $query->reorder('title', 'asc');
                    break;
                case 'title_desc':
                    $query->reorder('title', 'desc');
                    break;
                case 'slug_asc':
                    $query->reorder('slug', 'asc');
                    break;
                case 'slug_desc':
                    $query->reorder('slug', 'desc');
                    break;
                case 'updated_asc':
                    $query->reorder('updated_at', 'asc');
                    break;
                case 'updated_desc':
                    $query->reorder('updated_at', 'desc');
                    break;
                case 'created_asc':
                    $query->reorder('created_at', 'asc');
                    break;
                default:
                    $query->reorder('created_at', 'desc');
            }
        }
    }
}