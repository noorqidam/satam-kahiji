<?php

namespace App\Repositories;

use App\Models\Staff;
use App\Models\Subject;
use App\Repositories\Contracts\SubjectAssignmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class SubjectAssignmentRepository implements SubjectAssignmentRepositoryInterface
{
    public function __construct(
        private Staff $staffModel,
        private Subject $subjectModel
    ) {}

    public function getEligibleStaffPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->staffModel
            ->with('subjects:id')
            ->select('id', 'name', 'position', 'division')
            ->where(function ($q) {
                $q->whereRaw('LOWER(position) LIKE ?', ['%teacher%'])
                  ->orWhereRaw('LOWER(position) LIKE ?', ['%guru%']);
            })
            ->whereRaw('LOWER(division) = ?', ['akademik']);

        $this->applyStaffFilters($query, $filters);

        return $query->paginate($perPage, ['*'], 'staff_page')->withQueryString();
    }

    public function getSubjectsPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->subjectModel
            ->withCount('staff')
            ->select('id', 'name', 'code');

        $this->applySubjectFilters($query, $filters);

        return $query->paginate($perPage, ['*'], 'subject_page')->withQueryString();
    }

    public function findStaffById(int $staffId): ?Staff
    {
        return $this->staffModel->find($staffId);
    }

    public function validateStaffEligibility(Staff $staff): bool
    {
        $isTeacher = str_contains(strtolower($staff->position), 'teacher') || 
                    str_contains(strtolower($staff->position), 'guru');
        $isAcademic = strtolower($staff->division) === 'akademik';
        
        return $isTeacher && $isAcademic;
    }

    public function syncStaffSubjects(Staff $staff, array $subjectIds): void
    {
        $staff->subjects()->sync($subjectIds);
    }

    public function getAllEligibleStaff(): EloquentCollection
    {
        return $this->staffModel
            ->with('subjects')
            ->select('id', 'name', 'position', 'division')
            ->where(function ($q) {
                $q->whereRaw('LOWER(position) LIKE ?', ['%teacher%'])
                  ->orWhereRaw('LOWER(position) LIKE ?', ['%guru%']);
            })
            ->whereRaw('LOWER(division) = ?', ['akademik'])
            ->orderBy('name')
            ->get();
    }

    public function getAllSubjects(): EloquentCollection
    {
        return $this->subjectModel
            ->select('id', 'name', 'code')
            ->orderBy('name')
            ->get();
    }

    public function getAssignmentMatrix(): array
    {
        $staff = $this->getAllEligibleStaff();
        $subjects = $this->getAllSubjects();

        $matrix = [];
        foreach ($staff as $staffMember) {
            $assignedSubjectIds = $staffMember->subjects->pluck('id')->toArray();
            $matrix[$staffMember->id] = [
                'staff' => $staffMember,
                'assigned_subjects' => $assignedSubjectIds,
            ];
        }

        return [
            'staff' => $staff,
            'subjects' => $subjects,
            'matrix' => $matrix,
        ];
    }

    public function bulkUpdateAssignments(array $assignments): array
    {
        $processedCount = 0;
        $skippedCount = 0;
        $changedCount = 0;
        $errors = [];

        // Handle empty assignments gracefully
        if (empty($assignments)) {
            return [
                'processed' => 0,
                'changed' => 0,
                'skipped' => 0,
                'errors' => [],
                'total' => 0,
            ];
        }

        foreach ($assignments as $assignment) {
            try {
                $staff = $this->findStaffById($assignment['staff_id']);
                
                if (!$staff) {
                    $errors[] = "Staff with ID {$assignment['staff_id']} not found";
                    $skippedCount++;
                    continue;
                }

                if (!$this->validateStaffEligibility($staff)) {
                    $errors[] = "Staff {$staff->name} is not eligible for subject assignments";
                    $skippedCount++;
                    continue;
                }

                // Check if there are actual changes before syncing
                $currentSubjectIds = $staff->subjects()->pluck('subjects.id')->sort()->values()->toArray();
                $newSubjectIds = collect($assignment['subject_ids'])->sort()->values()->toArray();
                
                if ($currentSubjectIds !== $newSubjectIds) {
                    $this->syncStaffSubjects($staff, $assignment['subject_ids']);
                    $changedCount++;
                }
                
                $processedCount++;
            } catch (\Exception $e) {
                $errors[] = "Error processing assignment for staff ID {$assignment['staff_id']}: " . $e->getMessage();
                $skippedCount++;
            }
        }

        return [
            'processed' => $processedCount,
            'changed' => $changedCount,
            'skipped' => $skippedCount,
            'errors' => $errors,
            'total' => count($assignments),
        ];
    }

    private function applyStaffFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['staff_search'])) {
            $search = strtolower($filters['staff_search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(division) LIKE ?', ["%{$search}%"]);
            });
        }
    }

    private function applySubjectFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['subject_search'])) {
            $search = strtolower($filters['subject_search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(code) LIKE ?', ["%{$search}%"]);
            });
        }
    }
}