<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StaffIndexRequest extends FormRequest
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
            'search' => 'nullable|string|max:255',
            'divisions' => 'nullable|array',
            'divisions.*' => 'string|in:Hubungan Masyarakat,Tata Usaha,Pramubhakti,Akademik',
            'subjects_search' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'search.string' => 'Search term must be valid text.',
            'search.max' => 'Search term cannot exceed 255 characters.',
            'divisions.array' => 'Divisions filter must be an array.',
            'divisions.*.string' => 'Division must be valid text.',
            'divisions.*.in' => 'Invalid division selected.',
            'subjects_search.string' => 'Subject search must be valid text.',
            'subjects_search.max' => 'Subject search cannot exceed 255 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'search' => 'search term',
            'divisions' => 'division filter',
            'divisions.*' => 'division',
            'subjects_search' => 'subject search',
        ];
    }

    /**
     * Get processed filters for the service.
     */
    public function getFilters(): array
    {
        $validated = $this->validated();
        
        return [
            'search' => $validated['search'] ?? '',
            'divisions' => $validated['divisions'] ?? [],
        ];
    }

    /**
     * Get processed additional filters.
     */
    public function getAdditionalFilters(): array
    {
        $validated = $this->validated();
        
        return [
            'subjects_search' => $validated['subjects_search'] ?? '',
        ];
    }
}