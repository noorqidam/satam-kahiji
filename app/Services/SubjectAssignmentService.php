<?php

namespace App\Services;

use App\Repositories\Contracts\SubjectAssignmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SubjectAssignmentService
{
    public function __construct(
        private SubjectAssignmentRepositoryInterface $assignmentRepository
    ) {}

    public function getAssignmentOverview(array $filters = []): array
    {
        $staffFilters = ['staff_search' => $filters['staff_search'] ?? null];
        $subjectFilters = ['subject_search' => $filters['subject_search'] ?? null];

        $staff = $this->assignmentRepository->getEligibleStaffPaginated($staffFilters, 10);
        $subjects = $this->assignmentRepository->getSubjectsPaginated($subjectFilters, 15);

        return [
            'staff' => $staff,
            'subjects' => $subjects,
        ];
    }

    public function getFullAssignmentMatrix(): array
    {
        return $this->assignmentRepository->getAssignmentMatrix();
    }

    public function bulkUpdateAssignments(array $assignments): array
    {
        $this->validateAssignments($assignments);
        
        return $this->assignmentRepository->bulkUpdateAssignments($assignments);
    }

    public function generateAssignmentSummary(array $result): string
    {
        $changedCount = $result['changed'] ?? 0;
        $processedCount = $result['processed'] ?? 0;
        $skippedCount = $result['skipped'] ?? 0;
        
        if ($changedCount === 0) {
            return "No changes detected in subject assignments.";
        }
        
        $message = "Subject assignments updated successfully. ";
        $message .= "Changed: {$changedCount}, Processed: {$processedCount}";
        
        if ($skippedCount > 0) {
            $message .= ", Skipped: {$skippedCount}";
        }
        
        if (!empty($result['errors'])) {
            $message .= ". Errors encountered: " . count($result['errors']) . " issues.";
        }
        
        return $message;
    }

    private function validateAssignments(array $assignments): void
    {
        // Allow empty assignments - this is valid when no changes are made
        if (empty($assignments)) {
            return;
        }

        foreach ($assignments as $index => $assignment) {
            if (!isset($assignment['staff_id'])) {
                throw new \InvalidArgumentException("Assignment at index {$index} is missing staff_id");
            }

            if (!isset($assignment['subject_ids']) || !is_array($assignment['subject_ids'])) {
                throw new \InvalidArgumentException("Assignment at index {$index} has invalid subject_ids");
            }
        }
    }
}