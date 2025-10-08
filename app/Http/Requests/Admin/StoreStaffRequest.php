<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreStaffRequest extends FormRequest
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
            'name' => 'required|string|min:2|max:255',
            'position' => 'required|string|min:2|max:255',
            'division' => 'required|string|in:Hubungan Masyarakat,Tata Usaha,Pramubhakti,Akademik',
            'email' => 'required|email|max:255|unique:staff,email',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[\d\s\-\(\)]{7,20}$/',
            'bio' => 'nullable|string|max:5000',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Staff name is required.',
            'name.string' => 'Staff name must be valid text.',
            'name.min' => 'Staff name must be at least 2 characters.',
            'name.max' => 'Staff name cannot exceed 255 characters.',
            'position.required' => 'Position is required.',
            'position.string' => 'Position must be valid text.',
            'position.min' => 'Position must be at least 2 characters.',
            'position.max' => 'Position cannot exceed 255 characters.',
            'division.required' => 'Division is required.',
            'division.string' => 'Division must be valid text.',
            'division.in' => 'Please select a valid division.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email address cannot exceed 255 characters.',
            'email.unique' => 'A staff member with this email address already exists.',
            'phone.string' => 'Phone number must be valid text.',
            'phone.max' => 'Phone number cannot exceed 20 characters.',
            'phone.regex' => 'Please provide a valid phone number format.',
            'bio.string' => 'Biography must be valid text.',
            'bio.max' => 'Biography cannot exceed 5000 characters.',
            'photo.image' => 'The file must be an image.',
            'photo.mimes' => 'Photo must be a JPEG, PNG, JPG, GIF, or WebP image.',
            'photo.max' => 'Photo size cannot exceed 10MB.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'staff name',
            'position' => 'position',
            'division' => 'division',
            'email' => 'email address',
            'phone' => 'phone number',
            'bio' => 'biography',
            'photo' => 'photo',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace from text fields
        $this->merge([
            'name' => $this->name ? trim($this->name) : null,
            'position' => $this->position ? trim($this->position) : null,
            'email' => $this->email ? trim(strtolower($this->email)) : null,
            'phone' => $this->phone ? trim($this->phone) : null,
            'bio' => $this->bio ? trim($this->bio) : null,
        ]);
    }

    /**
     * Get processed data for staff creation.
     */
    public function getProcessedData(): array
    {
        $validated = $this->validated();
        
        return [
            'name' => $validated['name'],
            'position' => $validated['position'],
            'division' => $validated['division'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ];
    }

    /**
     * Get uploaded photo file if present.
     */
    public function getPhotoFile(): ?\Illuminate\Http\UploadedFile
    {
        return $this->hasFile('photo') ? $this->file('photo') : null;
    }
}