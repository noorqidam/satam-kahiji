<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreExtracurricularRequest extends FormRequest
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
            'name' => 'required|string|max:255|unique:extracurriculars,name',
            'description' => 'nullable|string|max:2000',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Extracurricular activity name is required.',
            'name.string' => 'Activity name must be a valid text.',
            'name.max' => 'Activity name cannot exceed 255 characters.',
            'name.unique' => 'An extracurricular activity with this name already exists.',
            'description.string' => 'Description must be valid text.',
            'description.max' => 'Description cannot exceed 2000 characters.',
            'photo.image' => 'The file must be an image.',
            'photo.mimes' => 'Photo must be a JPEG, PNG, JPG, GIF, SVG, or WebP image.',
            'photo.max' => 'Photo size cannot exceed 2MB.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'activity name',
            'description' => 'description',
            'photo' => 'photo',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace from name and description
        $this->merge([
            'name' => $this->name ? trim($this->name) : null,
            'description' => $this->description ? trim($this->description) : null,
        ]);
    }
}