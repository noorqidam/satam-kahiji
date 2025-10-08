<?php

namespace App\Services;

use App\Models\Staff;
use App\Repositories\Contracts\StaffRepositoryInterface;
use App\Services\PhotoHandler;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class StaffService
{
    public function __construct(
        private StaffRepositoryInterface $staffRepository,
        private PhotoHandler $photoHandler
    ) {}

    public function getPaginatedStaff(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        // Normalize filters
        $normalizedFilters = $this->normalizeFilters($filters);
        
        return $this->staffRepository->getPaginated($normalizedFilters, $perPage);
    }

    public function getStaffById(int $id): ?Staff
    {
        return $this->staffRepository->findWithRelations($id);
    }

    public function createStaff(array $data, ?UploadedFile $photo = null): Staff
    {
        $this->optimizePhpSettings();

        $staffData = [
            'name' => $data['name'],
            'position' => $data['position'],
            'division' => $data['division'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'bio' => $data['bio'] ?? null,
        ];

        if ($photo) {
            $staffData['photo'] = $this->photoHandler->store($photo);
        }

        return $this->staffRepository->create($staffData);
    }

    public function updateStaff(
        Staff $staff, 
        array $data, 
        ?UploadedFile $photo = null, 
        bool $removePhoto = false
    ): Staff {
        $this->optimizePhpSettings();

        $updateData = array_filter([
            'name' => $data['name'] ?? null,
            'position' => $data['position'] ?? null,
            'division' => $data['division'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'bio' => $data['bio'] ?? null,
        ], function ($value) {
            return $value !== null;
        });

        if ($removePhoto) {
            $this->handlePhotoRemoval($staff);
            $updateData['photo'] = null;
        } elseif ($photo) {
            $this->handlePhotoReplacement($staff, $photo);
            $updateData['photo'] = $this->photoHandler->update($photo, $staff->photo, true);
        }

        $this->staffRepository->update($staff, $updateData);

        return $staff->fresh();
    }

    public function deleteStaff(Staff $staff): bool
    {
        $this->handlePhotoDelete($staff);
        
        return $this->staffRepository->delete($staff);
    }

    public function bulkDeleteStaff(array $ids): array
    {
        $staff = $this->staffRepository->findByIds($ids);
        $deleted = 0;

        foreach ($staff as $member) {
            $this->handlePhotoDelete($member);
            $deleted++;
        }

        $this->staffRepository->bulkDelete($ids);

        return [
            'deleted' => $deleted,
            'total' => count($ids)
        ];
    }

    public function assignSubjects(Staff $staff, array $subjectIds): void
    {
        $this->validateTeacherForSubjectAssignment($staff);
        
        $this->staffRepository->syncSubjects($staff, $subjectIds);
    }

    public function removeSubject(Staff $staff, int $subjectId): void
    {
        $this->staffRepository->detachSubject($staff, $subjectId);
    }

    public function getUniqueDivisions(): Collection
    {
        return $this->staffRepository->getUniqueDivisions();
    }

    private function normalizeFilters(array $filters): array
    {
        $normalized = [
            'search' => $filters['search'] ?? '',
            'divisions' => $filters['divisions'] ?? [],
        ];

        // Convert comma-separated string to array if needed
        if (is_string($normalized['divisions'])) {
            $normalized['divisions'] = explode(',', $normalized['divisions']);
        }

        return $normalized;
    }

    private function validateTeacherForSubjectAssignment(Staff $staff): void
    {
        if (!$this->staffRepository->isTeacherInAcademicDivision($staff)) {
            throw new \InvalidArgumentException(
                'Only teachers/guru from academic division can be assigned to subjects.'
            );
        }
    }

    private function handlePhotoRemoval(Staff $staff): void
    {
        if ($staff->photo) {
            $this->photoHandler->remove($staff->photo, true);
        }
    }

    private function handlePhotoReplacement(Staff $staff, UploadedFile $newPhoto): void
    {
        // Photo replacement is handled by PhotoHandler::update method
        // which automatically deletes the old photo
    }

    private function handlePhotoDelete(Staff $staff): void
    {
        if ($staff->photo) {
            $this->photoHandler->delete($staff->photo, false);
        }
    }

    private function optimizePhpSettings(): void
    {
        ini_set('upload_max_filesize', '10M');
        ini_set('post_max_size', '12M');
        ini_set('max_execution_time', 300);
    }
}