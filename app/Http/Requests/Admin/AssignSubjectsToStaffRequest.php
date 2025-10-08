<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignSubjectsToStaffRequest extends FormRequest
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
            'subject_ids' => 'required|array|min:0',
            'subject_ids.*' => 'integer|exists:subjects,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'subject_ids.required' => 'Subject assignments are required.',
            'subject_ids.array' => 'Invalid data format for subject selection.',
            'subject_ids.*.integer' => 'Invalid subject ID provided.',
            'subject_ids.*.exists' => 'One or more selected subjects do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'subject_ids' => 'subject assignments',
            'subject_ids.*' => 'subject ID',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation: check if staff member is eligible for subject assignments
            if (!$validator->errors()->has('subject_ids')) {
                $staff = $this->route('staff');
                
                if ($staff) {
                    // Check if staff is a teacher/guru in academic division
                    $isTeacher = str_contains(strtolower($staff->position), 'teacher') || 
                                str_contains(strtolower($staff->position), 'guru');
                    $isAcademic = strtolower($staff->division) === 'akademik';
                    
                    if (!$isTeacher || !$isAcademic) {
                        $validator->errors()->add('subject_ids', 'Only teachers/guru from academic division can be assigned to subjects.');
                    }

                    // Check for duplicate subject assignments (if subjects are provided)
                    if (!empty($this->subject_ids)) {
                        $uniqueSubjects = array_unique($this->subject_ids);
                        if (count($uniqueSubjects) !== count($this->subject_ids)) {
                            $validator->errors()->add('subject_ids', 'Duplicate subjects detected in the assignment.');
                        }
                    }
                }
            }
        });
    }

    /**
     * Get validated subject IDs.
     */
    public function getSubjectIds(): array
    {
        return $this->validated()['subject_ids'];
    }

    /**
     * Check if any subjects are being assigned.
     */
    public function hasSubjects(): bool
    {
        return !empty($this->getSubjectIds());
    }
}