<?php

namespace App\Services;

use App\Models\Page;
use App\Repositories\Contracts\PageRepositoryInterface;
use App\Services\PhotoHandler;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PageService
{
    public function __construct(
        private PageRepositoryInterface $pageRepository,
        private PhotoHandler $photoHandler
    ) {}

    /**
     * Get all pages.
     */
    public function getAllPages(): Collection
    {
        return $this->pageRepository->getAll();
    }

    /**
     * Get paginated pages with filters.
     */
    public function getPaginatedPages(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->pageRepository->getPaginatedPages($filters, $perPage);
    }

    /**
     * Find page by ID.
     */
    public function findPage(int $id): ?Page
    {
        return $this->pageRepository->findById($id);
    }

    /**
     * Find page by slug.
     */
    public function findPageBySlug(string $slug): ?Page
    {
        return $this->pageRepository->findBySlug($slug);
    }

    /**
     * Create a new page with business logic validation.
     */
    public function createPage(array $data, ?UploadedFile $image, int $userId): Page
    {
        // Validate slug uniqueness
        if ($this->pageRepository->slugExists($data['slug'])) {
            throw new \InvalidArgumentException('A page with this slug already exists.');
        }

        // Handle image upload if present
        if ($image) {
            $data['image'] = $this->photoHandler->storePage($image);
        }

        $page = $this->pageRepository->create($data);

        Log::info('Page created', [
            'page_id' => $page->getKey(),
            'page_title' => $page->title,
            'page_slug' => $page->slug,
            'created_by' => $userId,
            'has_image' => !empty($page->image),
            'content_length' => strlen($page->content),
        ]);

        return $page;
    }

    /**
     * Update existing page with change tracking.
     */
    public function updatePage(Page $page, array $data, ?UploadedFile $image, bool $removeImage, int $userId): bool
    {
        $oldData = $page->getOriginal();

        // Validate slug uniqueness (excluding current page)
        if (isset($data['slug']) && 
            $data['slug'] !== $page->slug && 
            $this->pageRepository->slugExists($data['slug'], $page->getKey())) {
            throw new \InvalidArgumentException('A page with this slug already exists.');
        }

        // Handle image removal
        if ($removeImage && $page->image) {
            $this->photoHandler->deletePhoto($page->image, 'pages');
            $data['image'] = null;
        }
        // Handle new image upload
        elseif ($image) {
            // Delete old image if exists
            if ($page->image) {
                $this->photoHandler->deletePhoto($page->image, 'pages');
            }
            
            $data['image'] = $this->photoHandler->storePage($image);
        }
        // Keep existing image - don't include image field in update data
        else {
            // Remove image from update data to preserve existing image
            unset($data['image']);
        }

        $result = $this->pageRepository->update($page, $data);

        if ($result) {
            $changes = $page->getChanges();
            if (!empty($changes)) {
                Log::info('Page updated', [
                    'page_id' => $page->getKey(),
                    'page_title' => $page->title,
                    'page_slug' => $page->slug,
                    'updated_by' => $userId,
                    'changes' => array_keys($changes),
                    'image_changed' => array_key_exists('image', $changes),
                    'slug_changed' => array_key_exists('slug', $changes),
                    'content_length' => strlen($page->content),
                ]);
            }
        }

        return $result;
    }

    /**
     * Delete page with audit logging and file cleanup.
     */
    public function deletePage(Page $page, int $userId): bool
    {
        $pageData = $page->toArray();
        $pageId = $page->getKey();
        $hasImage = !empty($page->image);

        // Delete image from storage if exists
        if ($page->image) {
            $this->photoHandler->deletePhoto($page->image, 'pages');
        }

        $result = $this->pageRepository->delete($page);

        if ($result) {
            Log::warning('Page deleted', [
                'page_id' => $pageId,
                'page_title' => $pageData['title'] ?? 'N/A',
                'page_slug' => $pageData['slug'] ?? 'N/A',
                'deleted_by' => $userId,
                'had_image' => $hasImage,
                'content_length' => isset($pageData['content']) ? strlen($pageData['content']) : 0,
            ]);
        }

        return $result;
    }

    /**
     * Search pages.
     */
    public function searchPages(string $query): Collection
    {
        return $this->pageRepository->search($query);
    }

    /**
     * Get pages with images for gallery display.
     */
    public function getPagesWithImages(): Collection
    {
        return $this->pageRepository->getPagesWithImages();
    }

    /**
     * Get recently updated pages.
     */
    public function getRecentlyUpdatedPages(int $limit = 5): Collection
    {
        return $this->pageRepository->getRecentlyUpdated($limit);
    }

    /**
     * Get page statistics.
     */
    public function getPageStats(): array
    {
        $total = $this->pageRepository->count();
        $withImages = $this->pageRepository->getPagesWithImages()->count();
        $recentlyUpdated = $this->pageRepository->getRecentlyUpdated(10);
        
        return [
            'total_pages' => $total,
            'pages_with_images' => $withImages,
            'pages_without_images' => $total - $withImages,
            'image_percentage' => $total > 0 ? round(($withImages / $total) * 100, 1) : 0,
            'recently_updated_count' => $recentlyUpdated->count(),
            'avg_content_length' => $this->calculateAverageContentLength(),
        ];
    }

    /**
     * Generate a unique slug from title.
     */
    public function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        // Keep trying until we find a unique slug
        while ($this->pageRepository->slugExists($slug, $excludeId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Duplicate a page with a new slug and title.
     */
    public function duplicatePage(Page $originalPage, string $newTitle, int $userId): Page
    {
        $newSlug = $this->generateUniqueSlug($newTitle);
        
        $data = [
            'title' => $newTitle,
            'slug' => $newSlug,
            'content' => $originalPage->content,
            'image' => $originalPage->image, // Reference same image
        ];

        $duplicatedPage = $this->pageRepository->create($data);

        Log::info('Page duplicated', [
            'original_page_id' => $originalPage->getKey(),
            'new_page_id' => $duplicatedPage->getKey(),
            'new_title' => $newTitle,
            'new_slug' => $newSlug,
            'duplicated_by' => $userId,
        ]);

        return $duplicatedPage;
    }

    /**
     * Calculate average content length across all pages.
     */
    private function calculateAverageContentLength(): int
    {
        $pages = $this->pageRepository->getAll();
        
        if ($pages->isEmpty()) {
            return 0;
        }

        $totalLength = $pages->sum(function ($page) {
            return strlen($page->content);
        });

        return (int) round($totalLength / $pages->count());
    }
}