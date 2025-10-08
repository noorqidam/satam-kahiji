<?php

namespace App\Services;

use App\Models\Subject;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class SubjectTransformer
{
    public function transformPaginated(LengthAwarePaginator $subjects): LengthAwarePaginator
    {
        $subjects->getCollection()->transform(function ($subject) {
            return $this->transformForIndex($subject);
        });

        return $subjects;
    }

    public function transformForIndex(Subject $subject): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'description' => $subject->description,
            'staff_count' => $subject->staff_count,
            'created_at' => $subject->created_at,
            'updated_at' => $subject->updated_at,
        ];
    }

    public function transformForShow(Subject $subject): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'description' => $subject->description,
            'staff' => $this->transformStaff($subject->staff),
            'created_at' => $subject->created_at,
            'updated_at' => $subject->updated_at,
        ];
    }

    public function transformForEdit(Subject $subject): array
    {
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'description' => $subject->description,
            'staff' => $this->transformStaffForEdit($subject->staff),
            'created_at' => $subject->created_at,
            'updated_at' => $subject->updated_at,
        ];
    }

    public function transformStaffForAssignment(EloquentCollection $staff): array
    {
        return $staff->map(function ($staffMember) {
            return [
                'id' => $staffMember->id,
                'name' => $staffMember->name,
                'position' => $staffMember->position,
                'division' => $staffMember->division,
            ];
        })->toArray();
    }

    public function transformBulkDeleteResponse(array $result): array
    {
        return [
            'message' => "{$result['deleted']} subjects deleted successfully.",
            'deleted_count' => $result['deleted'],
            'total_count' => $result['total'],
        ];
    }

    private function transformStaff(?EloquentCollection $staff): array
    {
        if (!$staff) {
            return [];
        }

        return $staff->map(function ($staffMember) {
            return [
                'id' => $staffMember->id,
                'name' => $staffMember->name,
                'position' => $staffMember->position,
                'division' => $staffMember->division,
                'email' => $staffMember->email,
                'photo' => $staffMember->photo,
                'pivot' => $staffMember->pivot ?? null,
            ];
        })->toArray();
    }

    private function transformStaffForEdit(?EloquentCollection $staff): array
    {
        if (!$staff) {
            return [];
        }

        return $staff->map(function ($staffMember) {
            return [
                'id' => $staffMember->id,
                'name' => $staffMember->name,
                'position' => $staffMember->position,
                'division' => $staffMember->division,
                'pivot' => $staffMember->pivot ?? null,
            ];
        })->toArray();
    }
}