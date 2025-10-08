<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteStaffRequest extends FormRequest
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
            'ids.*' => 'integer|exists:staff,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'At least one staff member must be selected for deletion.',
            'ids.array' => 'Invalid data format for staff selection.',
            'ids.min' => 'At least one staff member must be selected.',
            'ids.*.integer' => 'Invalid staff member ID provided.',
            'ids.*.exists' => 'One or more selected staff members do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'ids' => 'selected staff members',
            'ids.*' => 'staff member ID',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation: check for staff with user accounts or critical assignments
            if (!$validator->errors()->has('ids')) {
                $staffMembers = \App\Models\Staff::whereIn('id', $this->ids)->get();
                
                if ($staffMembers->count() !== count($this->ids)) {
                    $validator->errors()->add('ids', 'Some staff members could not be found.');
                    return;
                }

                // Check for staff with user accounts
                $staffWithUsers = $staffMembers->filter(function ($staff) {
                    return $staff->user_id !== null;
                });

                if ($staffWithUsers->count() > 0) {
                    $names = $staffWithUsers->pluck('name')->take(3)->implode(', ');
                    $message = "Cannot delete staff members with user accounts: {$names}";
                    if ($staffWithUsers->count() > 3) {
                        $message .= ' and ' . ($staffWithUsers->count() - 3) . ' others';
                    }
                    $validator->errors()->add('ids', $message . '. Please remove their user accounts first.');
                }

                // Check for staff with subject assignments
                $staffWithSubjects = $staffMembers->filter(function ($staff) {
                    return $staff->subjects && $staff->subjects->count() > 0;
                });

                if ($staffWithSubjects->count() > 0) {
                    $names = $staffWithSubjects->pluck('name')->take(3)->implode(', ');
                    $message = "Cannot delete staff members with subject assignments: {$names}";
                    if ($staffWithSubjects->count() > 3) {
                        $message .= ' and ' . ($staffWithSubjects->count() - 3) . ' others';
                    }
                    $validator->errors()->add('ids', $message . '. Please remove their assignments first.');
                }
            }
        });
    }

    /**
     * Get the count of records to be deleted.
     */
    public function getDeleteCount(): int
    {
        return count($this->validated()['ids']);
    }

    /**
     * Get validated staff IDs.
     */
    public function getStaffIds(): array
    {
        return $this->validated()['ids'];
    }
}