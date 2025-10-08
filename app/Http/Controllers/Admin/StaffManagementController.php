<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignSubjectsToStaffRequest;
use App\Http\Requests\Admin\BulkDeleteStaffRequest;
use App\Http\Requests\Admin\RemoveSubjectFromStaffRequest;
use App\Http\Requests\Admin\StaffIndexRequest;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRequest;
use App\Models\Staff;
use App\Services\StaffService;
use App\Services\StaffTransformer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class StaffManagementController extends Controller
{
    public function __construct(
        private StaffService $staffService,
        private StaffTransformer $staffTransformer
    ) {}

    /**
     * Display a listing of staff members.
     */
    public function index(StaffIndexRequest $request): Response
    {
        $filters = $request->getFilters();

        $staff = $this->staffService->getPaginatedStaff($filters);
        $transformedStaff = $this->staffTransformer->transformPaginated($staff);
        $divisions = $this->staffService->getUniqueDivisions();

        return Inertia::render('admin/staff/index', [
            'staff' => $transformedStaff,
            'divisions' => $divisions,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create(): Response
    {
        return Inertia::render('admin/staff/create');
    }

    /**
     * Store a newly created staff member.
     */
    public function store(StoreStaffRequest $request): RedirectResponse
    {
        try {
            $validated = $request->getProcessedData();
            $photo = $request->getPhotoFile();
            $this->staffService->createStaff($validated, $photo);

            return redirect()->route('admin.staff.index')
                ->with('success', 'Staff member created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create staff member: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified staff member.
     */
    public function show(Staff $staff): Response
    {
        $staffWithRelations = $this->staffService->getStaffById($staff->id);
        $transformedStaff = $this->staffTransformer->transformForShow($staffWithRelations);

        return Inertia::render('admin/staff/show', [
            'staff' => $transformedStaff,
        ]);
    }

    /**
     * Show the form for editing the specified staff member.
     */
    public function edit(StaffIndexRequest $request, Staff $staff): Response
    {
        $transformedStaff = $this->staffTransformer->transformForEdit($staff);

        // Get subjects with pagination for display (only show for teachers)
        $availableSubjects = null;
        $additionalFilters = $request->getAdditionalFilters();
        
        // Only load subjects if staff member is a teacher/guru and in academic division
        $isTeacher = str_contains(strtolower($staff->position), 'teacher') || str_contains(strtolower($staff->position), 'guru');
        $isAcademic = strtolower($staff->division) === 'akademik';
        
        if ($isTeacher && $isAcademic) {
            $subjectsQuery = \App\Models\Subject::select('id', 'name', 'code');
        
            // Search functionality for subjects
            if (!empty($additionalFilters['subjects_search'])) {
                $search = strtolower($additionalFilters['subjects_search']);
                $subjectsQuery->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                      ->orWhereRaw('LOWER(code) LIKE ?', ["%{$search}%"]);
                });
            }

            $availableSubjects = $subjectsQuery->paginate(12, ['*'], 'subjects_page')->withQueryString();
        }

        return Inertia::render('admin/staff/edit', [
            'staff' => $transformedStaff,
            'availableSubjects' => $availableSubjects,
            'filters' => ['subjects_search' => $additionalFilters['subjects_search']],
        ]);
    }

    /**
     * Update the specified staff member.
     */
    public function update(UpdateStaffRequest $request, Staff $staff): RedirectResponse
    {
        try {
            $validated = $request->getProcessedData();
            $photo = $request->getPhotoFile();
            $removePhoto = $request->shouldRemovePhoto();

            $this->staffService->updateStaff($staff, $validated, $photo, $removePhoto);

            return redirect()->route('admin.staff.index')
                ->with('success', 'Staff member updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update staff member: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy(Staff $staff): RedirectResponse
    {
        try {
            $this->staffService->deleteStaff($staff);

            return redirect()->route('admin.staff.index')
                ->with('success', 'Staff member deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete staff member: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete staff members.
     */
    public function bulkDestroy(BulkDeleteStaffRequest $request): RedirectResponse
    {
        try {
            $staffIds = $request->getStaffIds();

            $result = $this->staffService->bulkDeleteStaff($staffIds);
            $response = $this->staffTransformer->transformBulkDeleteResponse($result);

            return redirect()->route('admin.staff.index')
                ->with('success', $response['message']);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete staff members: ' . $e->getMessage());
        }
    }

    /**
     * Assign subjects to staff member.
     */
    public function assignSubjects(AssignSubjectsToStaffRequest $request, Staff $staff): RedirectResponse
    {
        try {
            $subjectIds = $request->getSubjectIds();

            $this->staffService->assignSubjects($staff, $subjectIds);

            return redirect()->back()
                ->with('success', 'Subject assignments updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update subject assignments: ' . $e->getMessage());
        }
    }

    /**
     * Remove subject from staff member.
     */
    public function removeSubject(RemoveSubjectFromStaffRequest $request, Staff $staff): RedirectResponse
    {
        try {
            $subjectId = $request->getSubjectId();

            $this->staffService->removeSubject($staff, $subjectId);

            return redirect()->back()
                ->with('success', 'Subject removed from staff member successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to remove subject: ' . $e->getMessage());
        }
    }

    public function servePhoto($path)
    {
        $decodedPath = base64_decode($path);
        
        try {
            // Try Google Drive first
            if (Storage::disk('google_drive')->exists($decodedPath)) {
                $file = Storage::disk('google_drive')->get($decodedPath);
                
                // Determine MIME type from file extension
                $extension = pathinfo($decodedPath, PATHINFO_EXTENSION);
                $mimeType = match(strtolower($extension)) {
                    'jpg', 'jpeg' => 'image/jpeg',
                    'png' => 'image/png',
                    'gif' => 'image/gif',
                    'svg' => 'image/svg+xml',
                    'webp' => 'image/webp',
                    default => 'application/octet-stream'
                };
                
                return response($file, 200)->header('Content-Type', $mimeType);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to serve staff photo from Google Drive: ' . $e->getMessage());
        }

        // Fall back to local storage
        $localPath = 'profile-photos/' . basename($decodedPath);
        if (Storage::disk('public')->exists($localPath)) {
            return response()->file(Storage::disk('public')->path($localPath));
        }

        return abort(404, 'Photo not found');
    }

    /**
     * Get photo URL from Google Drive or local storage
     */
    private function getPhotoUrl($photoPath)
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