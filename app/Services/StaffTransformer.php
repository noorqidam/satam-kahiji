<?php

namespace App\Services;

use App\Models\Staff;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\Storage;

class StaffTransformer
{
    public function transformPaginated(LengthAwarePaginator $staff): LengthAwarePaginator
    {
        $staff->getCollection()->transform(function ($staffMember) {
            return $this->transformForIndex($staffMember);
        });

        return $staff;
    }

    public function transformForIndex(Staff $staff): array
    {
        return [
            'id' => $staff->id,
            'user_id' => $staff->user_id,
            'name' => $staff->name,
            'position' => $staff->position,
            'division' => $staff->division,
            'email' => $staff->email,
            'phone' => $staff->phone,
            'bio' => $staff->bio,
            'photo' => $staff->photo,
            'photo_url' => $staff->photo ? $this->getPhotoUrl($staff->photo) : null,
            'homeroom_class' => $staff->homeroom_class,
            'created_at' => $staff->created_at,
            'updated_at' => $staff->updated_at,
            'user' => $staff->user,
        ];
    }

    public function transformForShow(Staff $staff): array
    {
        return [
            'id' => $staff->id,
            'user_id' => $staff->user_id,
            'name' => $staff->name,
            'position' => $staff->position,
            'division' => $staff->division,
            'email' => $staff->email,
            'phone' => $staff->phone,
            'bio' => $staff->bio,
            'photo' => $staff->photo,
            'photo_url' => $staff->photo ? $this->getPhotoUrl($staff->photo) : null,
            'homeroom_class' => $staff->homeroom_class,
            'created_at' => $staff->created_at,
            'updated_at' => $staff->updated_at,
            'user' => $staff->user,
            'subjects' => $this->transformSubjects($staff->subjects),
        ];
    }

    public function transformForEdit(Staff $staff): array
    {
        $staff->load(['user', 'positionHistory' => function($query) {
            $query->orderBy('start_year', 'desc');
        }, 'educationalBackgrounds' => function($query) {
            $query->orderBy('graduation_year', 'desc');
        }, 'subjects']);

        return [
            'id' => $staff->id,
            'user_id' => $staff->user_id,
            'name' => $staff->name,
            'position' => $staff->position,
            'division' => $staff->division,
            'email' => $staff->email,
            'phone' => $staff->phone,
            'bio' => $staff->bio,
            'photo' => $staff->photo,
            'photo_url' => $staff->photo ? $this->getPhotoUrl($staff->photo) : null,
            'homeroom_class' => $staff->homeroom_class,
            'created_at' => $staff->created_at,
            'updated_at' => $staff->updated_at,
            'user' => $staff->user,
            'position_history' => $staff->positionHistory,
            'educational_background' => $staff->educationalBackgrounds,
            'subjects' => $this->transformSubjects($staff->subjects),
        ];
    }

    public function transformBulkDeleteResponse(array $result): array
    {
        return [
            'message' => "{$result['deleted']} staff members deleted successfully.",
            'deleted_count' => $result['deleted'],
            'total_count' => $result['total'],
        ];
    }

    private function transformSubjects(?EloquentCollection $subjects): array
    {
        if (!$subjects) {
            return [];
        }

        return $subjects->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'pivot' => $subject->pivot ?? null,
            ];
        })->toArray();
    }

    private function getPhotoUrl(string $photoPath): string
    {
        // If it's already a full URL (from Google Drive), return as-is
        if (str_starts_with($photoPath, 'http')) {
            return $photoPath;
        }
        
        // Try local storage first (backup files)
        $localPath = 'profile-photos/' . basename($photoPath);
        if (Storage::disk('public')->exists($localPath)) {
            return asset('storage/' . $localPath);
        }
        
        // Fall back to custom route for Google Drive files
        return route('admin.staff.photo', ['path' => base64_encode($photoPath)]);
    }
}