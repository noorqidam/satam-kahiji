<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SubjectAssignmentIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['super_admin', 'headmaster', 'teacher']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'staff_search' => 'nullable|string|max:255',
            'subject_search' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'staff_search.string' => 'Staff search term must be valid text.',
            'staff_search.max' => 'Staff search term cannot exceed 255 characters.',
            'subject_search.string' => 'Subject search term must be valid text.',
            'subject_search.max' => 'Subject search term cannot exceed 255 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'staff_search' => 'staff search',
            'subject_search' => 'subject search',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim search terms and convert empty strings to null
        $this->merge([
            'staff_search' => $this->staff_search ? trim($this->staff_search) : null,
            'subject_search' => $this->subject_search ? trim($this->subject_search) : null,
        ]);
    }

    /**
     * Get processed filters for the service.
     */
    public function getFilters(): array
    {
        $validated = $this->validated();
        
        return [
            'staff_search' => $validated['staff_search'] ?? null,
            'subject_search' => $validated['subject_search'] ?? null,
        ];
    }

    /**
     * Get filter data for frontend.
     */
    public function getFilterData(): array
    {
        return $this->only(['staff_search', 'subject_search']);
    }
}