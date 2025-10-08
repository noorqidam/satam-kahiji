<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'super_admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[\d\s\-\(\)]{7,20}$/',
            'address' => 'nullable|string|max:500',
            'message' => 'required|string|min:10|max:5000',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'School name is required.',
            'name.min' => 'School name must be at least 2 characters.',
            'name.max' => 'School name cannot exceed 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'phone.regex' => 'Please provide a valid phone number format.',
            'address.max' => 'Address cannot exceed 500 characters.',
            'message.required' => 'Contact message is required.',
            'message.min' => 'Contact message must be at least 10 characters.',
            'message.max' => 'Contact message cannot exceed 5000 characters.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'school name',
            'email' => 'email address',
            'phone' => 'phone number',
            'address' => 'address',
            'message' => 'contact information',
        ];
    }
}