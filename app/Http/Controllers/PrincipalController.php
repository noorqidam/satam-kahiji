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
        $principal = Staff::with(['positionHistory'])
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

        return Inertia::render('principal', [
            'principal' => $principal,
        ]);
    }
}