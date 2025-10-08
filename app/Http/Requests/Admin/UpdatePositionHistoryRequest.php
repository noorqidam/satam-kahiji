<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionHistoryRequest extends FormRequest
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
            'staff_id' => 'required|integer|exists:staff,id',
            'title' => 'required|string|min:2|max:255',
            'start_year' => 'required|integer|min:1900|max:2100',
            'end_year' => 'nullable|integer|min:1900|max:2100|gte:start_year',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'staff_id.required' => 'Staff member is required.',
            'staff_id.integer' => 'Invalid staff member selected.',
            'staff_id.exists' => 'The selected staff member does not exist.',
            'title.required' => 'Position title is required.',
            'title.string' => 'Position title must be valid text.',
            'title.min' => 'Position title must be at least 2 characters.',
            'title.max' => 'Position title cannot exceed 255 characters.',
            'start_year.required' => 'Start year is required.',
            'start_year.integer' => 'Start year must be a valid number.',
            'start_year.min' => 'Start year cannot be earlier than 1900.',
            'start_year.max' => 'Start year cannot be later than 2100.',
            'end_year.integer' => 'End year must be a valid number.',
            'end_year.min' => 'End year cannot be earlier than 1900.',
            'end_year.max' => 'End year cannot be later than 2100.',
            'end_year.gte' => 'End year must be equal to or later than start year.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'staff_id' => 'staff member',
            'title' => 'position title',
            'start_year' => 'start year',
            'end_year' => 'end year',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace from title
        if ($this->has('title')) {
            $this->merge([
                'title' => trim($this->title),
            ]);
        }

        // Convert year strings to integers if needed
        if ($this->has('start_year') && is_string($this->start_year)) {
            $this->merge([
                'start_year' => (int) $this->start_year,
            ]);
        }

        if ($this->has('end_year') && is_string($this->end_year) && $this->end_year !== '') {
            $this->merge([
                'end_year' => (int) $this->end_year,
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional validation: check for overlapping positions for the same staff
            if (!$validator->errors()->has('staff_id') && !$validator->errors()->has('start_year') && !$validator->errors()->has('end_year')) {
                $staffId = $this->staff_id;
                $startYear = $this->start_year;
                $endYear = $this->end_year;
                $currentPositionId = $this->route('positionHistory')->id;

                // Check for overlapping positions (excluding current position being updated)
                $overlapping = \App\Models\PositionHistory::where('staff_id', $staffId)
                    ->where('id', '!=', $currentPositionId)
                    ->where(function ($query) use ($startYear, $endYear) {
                        if ($endYear) {
                            // Position has end year - check for any overlap
                            $query->where(function ($subQuery) use ($startYear, $endYear) {
                                $subQuery->where('start_year', '<=', $endYear)
                                    ->where(function ($endQuery) use ($startYear) {
                                        $endQuery->whereNull('end_year')
                                            ->orWhere('end_year', '>=', $startYear);
                                    });
                            });
                        } else {
                            // Position has no end year (ongoing) - check if any position overlaps with start year
                            $query->where(function ($subQuery) use ($startYear) {
                                $subQuery->where('start_year', '<=', $startYear)
                                    ->where(function ($endQuery) use ($startYear) {
                                        $endQuery->whereNull('end_year')
                                            ->orWhere('end_year', '>=', $startYear);
                                    });
                            });
                        }
                    })
                    ->exists();

                if ($overlapping) {
                    $validator->errors()->add('start_year', 'This position period overlaps with an existing position for the same staff member.');
                }
            }
        });
    }
}