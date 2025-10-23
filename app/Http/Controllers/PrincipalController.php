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
        try {
            // Aggressive cache for principal data since it rarely changes
            $principal = cache()->remember('principal_optimized', 600, function () {
                $data = Staff::with(['positionHistory', 'educationalBackgrounds'])
                    ->select('id', 'name', 'position', 'division', 'photo', 'bio', 'email', 'phone')
                    ->where(function($query) {
                        $query->whereRaw('LOWER(position) = ?', ['kepala sekolah'])
                              ->orWhereRaw('LOWER(position) = ?', ['principal']);
                    })
                    ->where(function($query) {
                        $query->whereRaw('LOWER(division) = ?', ['kepala sekolah'])
                              ->orWhereRaw('LOWER(division) = ?', ['headmaster']);
                    })
                    ->whereNotNull('name')
                    ->orderBy('name')
                    ->get();

                // Transform educational backgrounds
                $data->each(function ($member) {
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
                    
                    unset($member->educationalBackgrounds);
                });

                return $data;
            });

            return Inertia::render('principal', [
                'principal' => $principal,
            ]);
        } catch (\Exception $e) {
            logger('Principal error: ' . $e->getMessage());
            return Inertia::render('principal', [
                'principal' => [],
            ]);
        }
    }
}