<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteExtracurricularRequest extends FormRequest
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
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:extracurriculars,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'At least one extracurricular activity must be selected for deletion.',
            'ids.array' => 'Invalid data format for activity selection.',
            'ids.min' => 'At least one activity must be selected.',
            'ids.*.integer' => 'Invalid activity ID provided.',
            'ids.*.exists' => 'One or more selected activities do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'ids' => 'selected activities',
            'ids.*' => 'activity ID',
        ];
    }
}