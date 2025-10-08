<?php

namespace App\Services;

use App\Models\Extracurricular;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\Storage;

class ExtracurricularTransformer
{
    public function transformPaginated(LengthAwarePaginator $extracurriculars): LengthAwarePaginator
    {
        $extracurriculars->getCollection()->transform(function ($extracurricular) {
            return $this->transformForIndex($extracurricular);
        });

        return $extracurriculars;
    }

    public function transformForIndex(Extracurricular $extracurricular): array
    {
        return [
            'id' => $extracurricular->id,
            'name' => $extracurricular->name,
            'description' => $extracurricular->description,
            'photo' => $extracurricular->photo,
            'photo_url' => $extracurricular->photo ? $this->getPhotoUrl($extracurricular->photo) : null,
            'students_count' => $extracurricular->students_count,
            'created_at' => $extracurricular->created_at,
            'updated_at' => $extracurricular->updated_at,
        ];
    }

    public function transformForShow(Extracurricular $extracurricular): array
    {
        return [
            'id' => $extracurricular->id,
            'name' => $extracurricular->name,
            'description' => $extracurricular->description,
            'photo' => $extracurricular->photo,
            'photo_url' => $extracurricular->photo ? $this->getPhotoUrl($extracurricular->photo) : null,
            'students' => $this->transformStudents($extracurricular->students),
            'created_at' => $extracurricular->created_at,
            'updated_at' => $extracurricular->updated_at,
        ];
    }

    public function transformForEdit(Extracurricular $extracurricular): array
    {
        return [
            'id' => $extracurricular->id,
            'name' => $extracurricular->name,
            'description' => $extracurricular->description,
            'photo' => $extracurricular->photo,
            'photo_url' => $extracurricular->photo ? $this->getPhotoUrl($extracurricular->photo) : null,
        ];
    }

    private function transformStudents(EloquentCollection $students): array
    {
        return $students->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'class' => $student->class,
                'pivot' => $student->pivot,
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
        $localPath = 'extracurriculars/' . basename($photoPath);
        if (Storage::disk('public')->exists($localPath)) {
            return Storage::url($localPath);
        }
        
        // Fall back to custom route for Google Drive files
        return route('admin.extracurriculars.photo', ['path' => base64_encode($photoPath)]);
    }
}