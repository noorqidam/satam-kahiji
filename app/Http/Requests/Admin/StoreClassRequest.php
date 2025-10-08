<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
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
            'grade_level' => 'required|in:7,8,9',
            'class_section' => 'required|string|max:10',
            'description' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1|max:50',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'grade_level.required' => 'Grade level is required.',
            'grade_level.in' => 'Grade level must be 7, 8, or 9.',
            'class_section.required' => 'Class section is required.',
            'class_section.max' => 'Class section cannot exceed 10 characters.',
            'capacity.required' => 'Class capacity is required.',
            'capacity.integer' => 'Capacity must be a number.',
            'capacity.min' => 'Capacity must be at least 1 student.',
            'capacity.max' => 'Capacity cannot exceed 50 students.',
            'description.max' => 'Description cannot exceed 255 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'grade_level' => 'grade level',
            'class_section' => 'class section',
            'description' => 'description',
            'capacity' => 'capacity',
        ];
    }
}