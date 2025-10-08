<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RemoveSubjectFromStaffRequest extends FormRequest
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
            'subject_id' => 'required|integer|exists:subjects,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'subject_id.required' => 'Subject ID is required.',
            'subject_id.integer' => 'Subject ID must be a valid number.',
            'subject_id.exists' => 'The selected subject does not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'subject_id' => 'subject',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation: check if staff member actually has this subject assigned
            if (!$validator->errors()->has('subject_id')) {
                $staff = $this->route('staff');
                $subjectId = $this->subject_id;
                
                if ($staff && $subjectId) {
                    // Check if the subject is actually assigned to this staff member
                    $hasSubject = $staff->subjects()->where('subjects.id', $subjectId)->exists();
                    
                    if (!$hasSubject) {
                        $validator->errors()->add('subject_id', 'This subject is not currently assigned to the staff member.');
                    }
                }
            }
        });
    }

    /**
     * Get validated subject ID.
     */
    public function getSubjectId(): int
    {
        return $this->validated()['subject_id'];
    }
}