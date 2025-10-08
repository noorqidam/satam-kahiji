<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Inertia\Inertia;
use Inertia\Response;

class StaffManagementController extends Controller
{
    /**
     * Display a listing of staff from non-academic divisions.
     * Excludes academic, school administration, and principal divisions.
     * Excludes teacher, principal, and super administrator positions.
     */
    public function index(): Response
    {
        $staff = Staff::select('id', 'name', 'position', 'division', 'photo', 'bio', 'email', 'phone')
            ->where(function($query) {
                // Exclude specific divisions
                $query->whereNotIn('division', [
                    'Akademik', 
                    'akademik',
                    'Kepala Sekolah', 
                    'kepala sekolah',
                    'Administrasi Sekolah',
                    'administrasi sekolah'
                ]);
            })
            ->where(function($query) {
                // Exclude specific positions
                $query->whereNotIn('position', [
                    'Guru', 
                    'guru',
                    'Teacher',
                    'teacher',
                    'Kepala Sekolah',
                    'kepala sekolah',
                    'Principal',
                    'principal',
                    'Super Administrator',
                    'super administrator',
                    'super_administrator'
                ]);
            })
            ->whereNotNull('name')
            ->orderBy('division')
            ->orderBy('name')
            ->get();

        // Group staff by division for better organization
        $staffByDivision = $staff->groupBy('division');

        return Inertia::render('staff-management', [
            'staff' => $staff,
            'staffByDivision' => $staffByDivision,
        ]);
    }
}