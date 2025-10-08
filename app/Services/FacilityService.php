<?php

namespace App\Services;

use App\Models\Facility;
use App\Repositories\Contracts\FacilityRepositoryInterface;
use App\Services\PhotoHandler;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class FacilityService
{
    public function __construct(
        private FacilityRepositoryInterface $facilityRepository,
        private PhotoHandler $photoHandler
    ) {}

    /**
     * Get paginated facilities with filters.
     */
    public function getPaginatedFacilities(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->facilityRepository->getPaginatedFacilities($filters, $perPage);
    }

    /**
     * Get all facilities.
     */
    public function getAllFacilities(): Collection
    {
        return $this->facilityRepository->getAll();
    }

    /**
     * Find facility by ID.
     */
    public function findFacility(int $id): ?Facility
    {
        return $this->facilityRepository->findById($id);
    }

    /**
     * Create a new facility with business logic validation.
     */
    public function createFacility(array $data, ?UploadedFile $image, int $userId): Facility
    {
        // Handle image upload if present
        if ($image) {
            $data['photo'] = $this->photoHandler->storeFacility($image);
            $data['metadata'] = $this->extractImageMetadata($image);
        }

        $facility = $this->facilityRepository->create($data);

        Log::info('Facility created', [
            'facility_id' => $facility->getKey(),
            'facility_name' => $facility->name,
            'created_by' => $userId,
            'has_photo' => !empty($facility->photo),
        ]);

        return $facility;
    }

    /**
     * Update existing facility with change tracking.
     */
    public function updateFacility(Facility $facility, array $data, ?UploadedFile $image, bool $removeImage, int $userId): bool
    {
        $oldData = $facility->getOriginal();

        // Handle image removal
        if ($removeImage && $facility->photo) {
            $this->photoHandler->deletePhoto($facility->photo, 'facilities');
            $data['photo'] = null;
            $data['metadata'] = null;
        }

        // Handle new image upload
        if ($image) {
            // Delete old image if exists
            if ($facility->photo) {
                $this->photoHandler->deletePhoto($facility->photo, 'facilities');
            }
            
            $data['photo'] = $this->photoHandler->storeFacility($image);
            $data['metadata'] = $this->extractImageMetadata($image);
        }

        $result = $this->facilityRepository->update($facility, $data);

        if ($result) {
            $changes = $facility->getChanges();
            if (!empty($changes)) {
                Log::info('Facility updated', [
                    'facility_id' => $facility->getKey(),
                    'facility_name' => $facility->name,
                    'updated_by' => $userId,
                    'changes' => array_keys($changes),
                    'photo_changed' => array_key_exists('photo', $changes),
                ]);
            }
        }

        return $result;
    }

    /**
     * Delete facility with audit logging and file cleanup.
     */
    public function deleteFacility(Facility $facility, int $userId): bool
    {
        $facilityData = $facility->toArray();
        $facilityId = $facility->getKey();
        $hasPhoto = !empty($facility->photo);

        // Delete image from storage if exists
        if ($facility->photo) {
            $this->photoHandler->deletePhoto($facility->photo, 'facilities');
        }

        $result = $this->facilityRepository->delete($facility);

        if ($result) {
            Log::warning('Facility deleted', [
                'facility_id' => $facilityId,
                'facility_name' => $facilityData['name'] ?? 'N/A',
                'deleted_by' => $userId,
                'had_photo' => $hasPhoto,
            ]);
        }

        return $result;
    }

    /**
     * Search facilities.
     */
    public function searchFacilities(string $query): Collection
    {
        return $this->facilityRepository->search($query);
    }

    /**
     * Get facilities with photos for gallery display.
     */
    public function getFacilitiesWithPhotos(): Collection
    {
        return $this->facilityRepository->getFacilitiesWithPhotos();
    }

    /**
     * Get facility statistics.
     */
    public function getFacilityStats(): array
    {
        $total = $this->facilityRepository->count();
        $withPhotos = $this->facilityRepository->getFacilitiesWithPhotos()->count();
        
        return [
            'total_facilities' => $total,
            'facilities_with_photos' => $withPhotos,
            'facilities_without_photos' => $total - $withPhotos,
            'photo_percentage' => $total > 0 ? round(($withPhotos / $total) * 100, 1) : 0,
        ];
    }

    /**
     * Extract metadata from uploaded image file.
     */
    private function extractImageMetadata(UploadedFile $file): array
    {
        $metadata = [
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_size_human' => $this->formatBytes($file->getSize()),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'uploaded_at' => now()->toISOString(),
        ];

        // Get image dimensions if it's an image
        if (str_starts_with($file->getMimeType(), 'image/')) {
            $imageInfo = getimagesize($file->getPathname());
            if ($imageInfo) {
                $metadata['width'] = $imageInfo[0];
                $metadata['height'] = $imageInfo[1];
                $metadata['dimensions'] = $imageInfo[0] . 'x' . $imageInfo[1];
                
                // Calculate aspect ratio
                if ($imageInfo[1] > 0) {
                    $metadata['aspect_ratio'] = round($imageInfo[0] / $imageInfo[1], 2);
                }

                // Determine orientation
                $metadata['orientation'] = $imageInfo[0] > $imageInfo[1] ? 'landscape' : 
                    ($imageInfo[0] < $imageInfo[1] ? 'portrait' : 'square');
            }
        }

        return $metadata;
    }

    /**
     * Format bytes into human readable format.
     */
    private function formatBytes(int $size, int $precision = 2): string
    {
        if ($size === 0) {
            return '0 B';
        }
        
        $base = log($size, 1024);
        $suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
    }
}