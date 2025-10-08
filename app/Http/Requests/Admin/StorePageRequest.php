<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'slug' => [
                'required', 
                'string', 
                'max:255', 
                'unique:pages,slug', 
                'regex:/^[a-z0-9-]+$/'
            ],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:50000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'], // 2MB max
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'slug.required' => 'The page slug is required.',
            'slug.unique' => 'A page with this slug already exists.',
            'slug.regex' => 'The slug may only contain lowercase letters, numbers, and dashes.',
            'title.required' => 'The page title is required.',
            'title.max' => 'The page title may not be greater than 255 characters.',
            'content.required' => 'The page content is required.',
            'content.max' => 'The page content may not exceed 50,000 characters.',
            'image.image' => 'The file must be an image.',
            'image.mimes' => 'The image must be a file of type: jpeg, png, jpg, gif, webp.',
            'image.max' => 'The image may not be greater than 2MB.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'slug' => 'page slug',
            'title' => 'page title',
            'content' => 'page content',
            'image' => 'featured image',
        ];
    }
}