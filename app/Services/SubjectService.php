<?php

namespace App\Services;

use App\Models\Subject;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Validation\ValidationException;

class SubjectService
{
    public function __construct(
        private SubjectRepositoryInterface $subjectRepository
    ) {}

    public function getPaginatedSubjects(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->subjectRepository->getPaginated($filters, $perPage);
    }

    public function getSubjectById(int $id): ?Subject
    {
        return $this->subjectRepository->findWithStaff($id);
    }

    public function createSubject(array $data): Subject
    {
        $this->validateUniqueSubjectCode($data['code'] ?? null);

        return $this->subjectRepository->create([
            'name' => $data['name'],
            'code' => $data['code'] ?? null,
        ]);
    }

    public function updateSubject(Subject $subject, array $data): Subject
    {
        $this->validateUniqueSubjectCode($data['code'] ?? null, $subject->id);

        $this->subjectRepository->update($subject, [
            'name' => $data['name'],
            'code' => $data['code'] ?? null,
        ]);

        return $subject->fresh();
    }

    public function deleteSubject(Subject $subject): bool
    {
        return $this->subjectRepository->delete($subject);
    }

    public function bulkDeleteSubjects(array $ids): array
    {
        $deletedCount = $this->subjectRepository->bulkDelete($ids);

        return [
            'deleted' => $deletedCount,
            'total' => count($ids)
        ];
    }

    public function assignStaff(Subject $subject, array $staffIds): void
    {
        $validation = $this->subjectRepository->validateStaffEligibility($staffIds);
        
        if ($validation['has_ineligible']) {
            throw new \InvalidArgumentException(
                'Only teachers/guru from academic division can be assigned to subjects.'
            );
        }

        $this->subjectRepository->syncStaff($subject, $staffIds);
    }

    public function removeStaff(Subject $subject, int $staffId): void
    {
        $this->subjectRepository->detachStaff($subject, $staffId);
    }

    public function getEligibleStaff(): EloquentCollection
    {
        return $this->subjectRepository->getEligibleStaff();
    }

    public function getStaffForAssignment(): EloquentCollection
    {
        return $this->subjectRepository->getStaffForAssignment();
    }

    private function validateUniqueSubjectCode(?string $code, ?int $excludeId = null): void
    {
        if (!$code) {
            return; // Code is optional
        }

        if ($this->subjectRepository->existsByCode($code, $excludeId)) {
            throw ValidationException::withMessages([
                'code' => "Subject code '{$code}' already exists"
            ]);
        }
    }
}