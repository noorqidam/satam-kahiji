<?php

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class SubjectAssignmentTransformer
{
    public function transformStaffPaginated(LengthAwarePaginator $staff): LengthAwarePaginator
    {
        $staff->getCollection()->transform(function ($staffMember) {
            return $this->transformStaffForAssignment($staffMember);
        });

        return $staff;
    }

    public function transformSubjectsPaginated(LengthAwarePaginator $subjects): LengthAwarePaginator
    {
        $subjects->getCollection()->transform(function ($subject) {
            return $this->transformSubjectForAssignment($subject);
        });

        return $subjects;
    }

    public function transformAssignmentMatrix(array $matrixData): array
    {
        return [
            'staff' => $this->transformStaffCollection($matrixData['staff']),
            'subjects' => $this->transformSubjectsCollection($matrixData['subjects']),
            'assignments' => $this->transformAssignmentData($matrixData['matrix']),
        ];
    }

    public function transformBulkUpdateResponse(array $result): array
    {
        return [
            'processed_count' => $result['processed'],
            'changed_count' => $result['changed'] ?? 0,
            'skipped_count' => $result['skipped'],
            'total_count' => $result['total'],
            'errors' => $result['errors'] ?? [],
            'success_rate' => $result['total'] > 0 ? round(($result['processed'] / $result['total']) * 100, 2) : 0,
            'change_rate' => $result['processed'] > 0 ? round((($result['changed'] ?? 0) / $result['processed']) * 100, 2) : 0,
            'has_errors' => !empty($result['errors']),
            'has_changes' => ($result['changed'] ?? 0) > 0,
        ];
    }

    private function transformStaffForAssignment($staff): array
    {
        return [
            'id' => $staff->id,
            'name' => $staff->name,
            'position' => $staff->position,
            'division' => $staff->division,
            'subjects' => $staff->subjects ? $staff->subjects->map(function ($subject) {
                return ['id' => $subject->id];
            })->toArray() : [],
            'subject_count' => $staff->subjects ? $staff->subjects->count() : 0,
        ];
    }

    private function transformSubjectForAssignment($subject): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'staff_count' => $subject->staff_count ?? 0,
        ];
    }

    private function transformStaffCollection(EloquentCollection $staff): array
    {
        return $staff->map(function ($staffMember) {
            return [
                'id' => $staffMember->id,
                'name' => $staffMember->name,
                'position' => $staffMember->position,
                'division' => $staffMember->division,
                'assigned_subjects' => $staffMember->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'code' => $subject->code,
                    ];
                })->toArray(),
            ];
        })->toArray();
    }

    private function transformSubjectsCollection(EloquentCollection $subjects): array
    {
        return $subjects->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
            ];
        })->toArray();
    }

    private function transformAssignmentData(array $matrix): array
    {
        $assignments = [];
        
        foreach ($matrix as $staffId => $data) {
            $assignments[] = [
                'staff_id' => $staffId,
                'staff_name' => $data['staff']->name,
                'subject_ids' => $data['assigned_subjects'],
                'subject_count' => count($data['assigned_subjects']),
            ];
        }

        return $assignments;
    }
}