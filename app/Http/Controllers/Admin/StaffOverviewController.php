<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\WorkItem;
use App\Models\TeacherSubjectWork;
use App\Models\TeacherWorkFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StaffOverviewController extends Controller
{
    /**
     * Display staff overview with work item submissions (View-only for Super Admin)
     */
    public function index(): Response
    {
        Gate::authorize('view-work-stats');

        $user = Auth::user();
        $canProvideFeedback = false; // Super Admin cannot provide feedback

        // Get all teachers with their subjects and work progress
        $teachers = Staff::whereHas('subjects')
            ->with([
                'subjects',
                'user:id,name,email',
                'teacherSubjectWorks.workItem',
                'teacherSubjectWorks.subject',
                'teacherSubjectWorks.files.latestFeedback.reviewer:id,name'
            ])
            ->get();

        // Get work items for reference
        $workItems = WorkItem::orderBy('name')->get();

        // Calculate statistics
        $stats = $this->calculateStats($teachers);

        return Inertia::render('admin/staff-overview/index', [
            'teachers' => $teachers,
            'workItems' => $workItems,
            'stats' => $stats,
            'canProvideFeedback' => $canProvideFeedback,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show detailed view of a specific teacher's work items (View-only for Super Admin)
     */
    public function show(Staff $staff): Response
    {
        Gate::authorize('view-work-stats');

        $user = Auth::user();
        $canProvideFeedback = false; // Super Admin cannot provide feedback

        // Load teacher with all related data
        $teacher = $staff->load([
            'user:id,name,email',
            'subjects',
            'teacherSubjectWorks.workItem',
            'teacherSubjectWorks.subject', 
            'teacherSubjectWorks.files.feedback.reviewer:id,name'
        ]);

        return Inertia::render('admin/staff-overview/show', [
            'teacher' => $teacher,
            'canProvideFeedback' => $canProvideFeedback,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Calculate overview statistics
     */
    private function calculateStats($teachers): array
    {
        $totalTeachers = $teachers->count();
        $totalWorkItems = WorkItem::count();
        $totalExpectedFiles = $totalTeachers * $totalWorkItems;
        
        $totalFilesUploaded = TeacherWorkFile::count();
        $totalFilesWithFeedback = TeacherWorkFile::whereHas('feedback')->count();
        $totalApprovedFiles = TeacherWorkFile::whereHas('feedback', function ($query) {
            $query->where('status', 'approved');
        })->count();
        
        $needsRevisionFiles = TeacherWorkFile::whereHas('feedback', function ($query) {
            $query->where('status', 'needs_revision');
        })->count();

        return [
            'total_teachers' => $totalTeachers,
            'total_work_items' => $totalWorkItems,
            'total_expected_files' => $totalExpectedFiles,
            'total_files_uploaded' => $totalFilesUploaded,
            'total_files_with_feedback' => $totalFilesWithFeedback,
            'total_approved_files' => $totalApprovedFiles,
            'needs_revision_files' => $needsRevisionFiles,
            'upload_completion_rate' => $totalExpectedFiles > 0 ? round(($totalFilesUploaded / $totalExpectedFiles) * 100, 1) : 0,
            'feedback_completion_rate' => $totalFilesUploaded > 0 ? round(($totalFilesWithFeedback / $totalFilesUploaded) * 100, 1) : 0,
            'approval_rate' => $totalFilesWithFeedback > 0 ? round(($totalApprovedFiles / $totalFilesWithFeedback) * 100, 1) : 0,
        ];
    }
}