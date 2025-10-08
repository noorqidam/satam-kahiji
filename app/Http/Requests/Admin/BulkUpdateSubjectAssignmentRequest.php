<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateSubjectAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['super_admin', 'headmaster']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'assignments' => 'required|array',
            'assignments.*.staff_id' => 'required|integer',
            'assignments.*.subject_ids' => 'array',
            'assignments.*.subject_ids.*' => 'integer',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'assignments.required' => 'Assignment data is required.',
            'assignments.array' => 'Assignment data must be in array format.',
            'assignments.min' => 'At least one staff assignment must be provided.',
            'assignments.*.staff_id.required' => 'Staff ID is required for each assignment.',
            'assignments.*.staff_id.integer' => 'Staff ID must be a valid number.',
            'assignments.*.staff_id.exists' => 'One or more staff members do not exist.',
            'assignments.*.subject_ids.array' => 'Subject IDs must be in array format.',
            'assignments.*.subject_ids.*.integer' => 'Subject ID must be a valid number.',
            'assignments.*.subject_ids.*.exists' => 'One or more subjects do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'assignments' => 'assignment data',
            'assignments.*.staff_id' => 'staff member',
            'assignments.*.subject_ids' => 'subject assignments',
            'assignments.*.subject_ids.*' => 'subject',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        // Temporarily disable complex validation for debugging
        // $validator->after(function ($validator) {
        //     // All validation logic temporarily disabled
        // });
    }

    /**
     * Get validated assignments data.
     */
    public function getAssignments(): array
    {
        return $this->validated()['assignments'];
    }

    /**
     * Get assignment metadata.
     */
    public function getAssignmentMetadata(): array
    {
        $assignments = $this->getAssignments();
        return [
            'total_staff' => count($assignments),
            'staff_with_assignments' => collect($assignments)->filter(function($assignment) {
                return count($assignment['subject_ids'] ?? []) > 0;
            })->count(),
            'total_assignments' => collect($assignments)->sum(function($assignment) {
                return count($assignment['subject_ids'] ?? []);
            }),
            'staff_without_assignments' => collect($assignments)->filter(function($assignment) {
                return count($assignment['subject_ids'] ?? []) === 0;
            })->count(),
        ];
    }

    /**
     * Get assignment statistics for logging/reporting.
     */
    public function getAssignmentStatistics(): array
    {
        $assignments = $this->getAssignments();
        $stats = [
            'total_staff_processed' => count($assignments),
            'assignments_by_staff' => [],
            'most_assigned_subjects' => [],
            'staff_assignment_counts' => [],
        ];

        $subjectCounts = [];
        
        foreach ($assignments as $assignment) {
            $staffId = $assignment['staff_id'];
            $subjectIds = $assignment['subject_ids'] ?? [];
            $assignmentCount = count($subjectIds);
            
            $stats['staff_assignment_counts'][$staffId] = $assignmentCount;
            $stats['assignments_by_staff'][$staffId] = $subjectIds;
            
            // Count subject frequencies
            foreach ($subjectIds as $subjectId) {
                $subjectCounts[$subjectId] = ($subjectCounts[$subjectId] ?? 0) + 1;
            }
        }

        // Sort subjects by assignment frequency
        arsort($subjectCounts);
        $stats['most_assigned_subjects'] = array_slice($subjectCounts, 0, 10, true);

        return $stats;
    }
}