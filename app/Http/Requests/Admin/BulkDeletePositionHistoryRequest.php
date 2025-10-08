<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeletePositionHistoryRequest extends FormRequest
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
            'ids.*' => 'integer|exists:position_history,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'At least one position history record must be selected for deletion.',
            'ids.array' => 'Invalid data format for position history selection.',
            'ids.min' => 'At least one position history record must be selected.',
            'ids.*.integer' => 'Invalid position history ID provided.',
            'ids.*.exists' => 'One or more selected position history records do not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'ids' => 'selected position history records',
            'ids.*' => 'position history ID',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation: ensure all position histories belong to the same staff member
            // This prevents accidental cross-staff deletions in bulk operations
            if (!$validator->errors()->has('ids')) {
                $positionHistories = \App\Models\PositionHistory::whereIn('id', $this->ids)->get();
                
                if ($positionHistories->count() !== count($this->ids)) {
                    $validator->errors()->add('ids', 'Some position history records could not be found.');
                    return;
                }

                $staffIds = $positionHistories->pluck('staff_id')->unique();
                
                if ($staffIds->count() > 1) {
                    $validator->errors()->add('ids', 'Cannot delete position history records from multiple staff members in a single operation.');
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
}