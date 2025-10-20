<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
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
        $staff = $this->route('staff');
        
        // Base validation rules (always required)
        $rules = [
            'bio' => 'nullable|string|max:5000',
            'photo' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,gif,webp',
                'max:10240',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        // Log debug information about the value type
                        Log::info('Photo upload debug - value type', [
                            'value_type' => gettype($value),
                            'is_uploaded_file' => $value instanceof \Illuminate\Http\UploadedFile,
                            'value_content' => is_array($value) ? json_encode($value) : 'not array'
                        ]);
                        
                        // Check if value is an UploadedFile instance
                        if (!$value instanceof \Illuminate\Http\UploadedFile) {
                            $fail('The uploaded data is not a valid file.');
                            return;
                        }
                        
                        // Additional validation to debug image issues
                        $mimeType = $value->getMimeType();
                        $extension = $value->getClientOriginalExtension();
                        $size = $value->getSize();
                        
                        // Log debug information
                        Log::info('Photo upload debug', [
                            'mime_type' => $mimeType,
                            'extension' => $extension,
                            'size' => $size,
                            'original_name' => $value->getClientOriginalName(),
                            'is_valid' => $value->isValid(),
                        ]);
                        
                        // Check if file is valid
                        if (!$value->isValid()) {
                            $fail('The uploaded file is corrupted or invalid.');
                            return;
                        }
                        
                        // Check MIME type manually
                        $allowedMimes = [
                            'image/jpeg',
                            'image/png', 
                            'image/jpg',
                            'image/gif',
                            'image/webp'
                        ];
                        
                        if (!in_array($mimeType, $allowedMimes)) {
                            $fail("The file type {$mimeType} is not allowed. Please upload a valid image file.");
                            return;
                        }
                        
                        // Check if it's actually an image using getimagesize
                        $tempPath = $value->getPathname();
                        $imageInfo = @getimagesize($tempPath);
                        
                        if ($imageInfo === false) {
                            $fail('The file does not appear to be a valid image file.');
                            return;
                        }
                    }
                }
            ],
            'remove_photo' => 'nullable|boolean',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[\d\s\-\(\)]{7,20}$/',
        ];

        // If staff doesn't have a user account, validate basic fields
        if ($staff && $staff->user_id === null) {
            $rules = array_merge($rules, [
                'name' => 'required|string|min:2|max:255',
                'position' => 'required|string|min:2|max:255',
                'division' => 'required|string|in:Hubungan Masyarakat,Tata Usaha,Pramubhakti,Akademik',
                'email' => ['required', 'email', 'max:255', Rule::unique('staff')->ignore($staff->id)],
            ]);
        }

        return $rules;
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
            'photo.file' => 'Please select a valid file.',
            'photo.mimes' => 'Photo must be a JPEG, PNG, JPG, GIF, or WebP image.',
            'photo.max' => 'Photo size cannot exceed 10MB (10,240 KB).',
            'remove_photo.boolean' => 'Remove photo flag must be true or false.',
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
            'remove_photo' => 'remove photo flag',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace from text fields
        $data = [];
        
        if ($this->has('name')) {
            $data['name'] = trim($this->name);
        }
        
        if ($this->has('position')) {
            $data['position'] = trim($this->position);
        }
        
        if ($this->has('email')) {
            $data['email'] = trim(strtolower($this->email));
        }
        
        if ($this->has('phone')) {
            $data['phone'] = $this->phone ? trim($this->phone) : null;
        }
        
        if ($this->has('bio')) {
            $data['bio'] = $this->bio ? trim($this->bio) : null;
        }

        $this->merge($data);
    }

    /**
     * Check if photo should be removed.
     */
    public function shouldRemovePhoto(): bool
    {
        return $this->boolean('remove_photo');
    }

    /**
     * Get uploaded photo file if present.
     */
    public function getPhotoFile(): ?\Illuminate\Http\UploadedFile
    {
        return $this->hasFile('photo') ? $this->file('photo') : null;
    }

    /**
     * Check if staff has a user account (cannot edit basic info).
     */
    public function hasUserAccount(): bool
    {
        $staff = $this->route('staff');
        return $staff && $staff->user_id !== null;
    }

    /**
     * Get processed data for staff update.
     */
    public function getProcessedData(): array
    {
        return $this->validated();
    }
}