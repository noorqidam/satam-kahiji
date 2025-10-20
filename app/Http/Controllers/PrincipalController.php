<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Inertia\Inertia;
use Inertia\Response;

class PrincipalController extends Controller
{
    /**
     * Display the principal (kepala sekolah) information.
     * Filters staff where both position and division are "kepala sekolah".
     */
    public function index(): Response
    {
        $principal = Staff::with(['positionHistory', 'educationalBackgrounds'])
            ->select('id', 'name', 'position', 'division', 'photo', 'bio', 'email', 'phone')
            ->where(function($query) {
                // Filter by position "kepala sekolah" (case insensitive)
                $query->whereRaw('LOWER(position) = ?', ['kepala sekolah'])
                      ->orWhereRaw('LOWER(position) = ?', ['principal']);
            })
            ->where(function($query) {
                // Filter by division "kepala sekolah" (case insensitive)
                $query->whereRaw('LOWER(division) = ?', ['kepala sekolah'])
                      ->orWhereRaw('LOWER(division) = ?', ['headmaster']);
            })
            ->whereNotNull('name')
            ->orderBy('name')
            ->get();

        // Transform educational backgrounds to match frontend interface
        $principal->each(function ($member) {
            $member->educational_background = $member->educationalBackgrounds->map(function ($education) {
                return [
                    'id' => $education->id,
                    'degree' => $education->degree,
                    'field_of_study' => $education->field_of_study,
                    'institution' => $education->institution,
                    'graduation_year' => $education->graduation_year,
                    'description' => $education->description,
                ];
            })->toArray();
            
            // Remove the original relation to avoid duplication
            unset($member->educationalBackgrounds);
        });

        return Inertia::render('principal', [
            'principal' => $principal,
        ]);
    }
}