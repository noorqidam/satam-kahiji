<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignStudentsToExtracurricularRequest extends FormRequest
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
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_ids.required' => 'At least one student must be selected for assignment.',
            'student_ids.array' => 'Invalid data format for student selection.',
            'student_ids.min' => 'At least one student must be selected.',
            'student_ids.*.integer' => 'Invalid student ID provided.',
            'student_ids.*.exists' => 'One or more selected students do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'student_ids' => 'selected students',
            'student_ids.*' => 'student ID',
        ];
    }
}