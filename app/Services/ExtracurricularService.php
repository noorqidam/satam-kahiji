<?php

namespace App\Services;

use App\Models\Extracurricular;
use App\Repositories\Contracts\ExtracurricularRepositoryInterface;
use App\Services\PhotoHandler;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class ExtracurricularService
{
    public function __construct(
        private ExtracurricularRepositoryInterface $extracurricularRepository,
        private PhotoHandler $photoHandler
    ) {}

    public function getPaginatedExtracurriculars(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->extracurricularRepository->getPaginated($filters, $perPage);
    }

    public function getExtracurricularById(int $id): ?Extracurricular
    {
        return $this->extracurricularRepository->findWithStudents($id);
    }

    public function createExtracurricular(array $data, ?UploadedFile $photo = null): Extracurricular
    {
        $this->validateUniqueExtracurricularName($data['name']);

        $extracurricularData = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ];

        if ($photo) {
            $extracurricularData['photo'] = $this->photoHandler->storeExtracurricular($photo);
        }

        return $this->extracurricularRepository->create($extracurricularData);
    }

    public function updateExtracurricular(
        Extracurricular $extracurricular, 
        array $data, 
        ?UploadedFile $photo = null,
        bool $removePhoto = false
    ): Extracurricular {
        $this->validateUniqueExtracurricularName($data['name'], $extracurricular->id);

        $updateData = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ];

        if ($removePhoto) {
            $this->handlePhotoRemoval($extracurricular);
            $updateData['photo'] = null;
        } elseif ($photo) {
            $this->handlePhotoReplacement($extracurricular, $photo);
            $updateData['photo'] = $this->photoHandler->storeExtracurricular($photo);
        }

        $this->extracurricularRepository->update($extracurricular, $updateData);

        return $extracurricular->fresh();
    }

    public function deleteExtracurricular(Extracurricular $extracurricular): bool
    {
        $this->handlePhotoRemoval($extracurricular);
        
        return $this->extracurricularRepository->delete($extracurricular);
    }

    public function bulkDeleteExtracurriculars(array $ids): array
    {
        $extracurriculars = $this->extracurricularRepository->findByIds($ids);
        $deleted = 0;

        foreach ($extracurriculars as $extracurricular) {
            $this->handlePhotoRemoval($extracurricular);
            $deleted++;
        }

        $this->extracurricularRepository->bulkDelete($ids);

        return [
            'deleted' => $deleted,
            'total' => count($ids)
        ];
    }

    public function assignStudents(Extracurricular $extracurricular, array $studentIds): void
    {
        $this->extracurricularRepository->syncStudents($extracurricular, $studentIds);
    }

    public function removeStudent(Extracurricular $extracurricular, int $studentId): void
    {
        $this->extracurricularRepository->detachStudent($extracurricular, $studentId);
    }

    private function validateUniqueExtracurricularName(string $name, ?int $excludeId = null): void
    {
        if ($this->extracurricularRepository->existsByName($name, $excludeId)) {
            throw ValidationException::withMessages([
                'name' => "Extracurricular activity '{$name}' already exists"
            ]);
        }
    }

    private function handlePhotoRemoval(Extracurricular $extracurricular): void
    {
        if ($extracurricular->photo) {
            $this->photoHandler->delete($extracurricular->photo);
        }
    }

    private function handlePhotoReplacement(Extracurricular $extracurricular, UploadedFile $newPhoto): void
    {
        if ($extracurricular->photo) {
            $this->photoHandler->delete($extracurricular->photo);
        }
    }
}