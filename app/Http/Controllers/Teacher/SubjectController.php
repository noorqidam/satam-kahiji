<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\WorkItem;
use App\Models\TeacherSubjectWork;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Display teacher's assigned subjects with comprehensive overview
     */
    public function index(): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            abort(403, 'Staff record not found');
        }

        // Get subjects with detailed information
        $subjects = $staff->subjects()
            ->withCount(['students as total_students'])
            ->with(['students' => function ($query) {
                $query->select('students.id', 'students.name', 'students.nisn')
                      ->orderBy('students.name');
            }])
            ->get()
            ->map(function ($subject) use ($staff) {
                // Get work items progress for this subject
                $workItemsProgress = $this->getSubjectWorkItemsProgress($staff, $subject);
                
                // Get recent activity
                $recentFiles = TeacherSubjectWork::where('staff_id', $staff->id)
                    ->where('subject_id', $subject->id)
                    ->with(['files' => function ($query) {
                        $query->latest('uploaded_at')->limit(3);
                    }])
                    ->get()
                    ->pluck('files')
                    ->flatten()
                    ->sortByDesc('uploaded_at')
                    ->take(3)
                    ->values();

                // Calculate completion statistics
                $totalWorkItems = WorkItem::count();
                $completedWorkItems = TeacherSubjectWork::where('staff_id', $staff->id)
                    ->where('subject_id', $subject->id)
                    ->whereHas('files')
                    ->count();
                
                $completionPercentage = $totalWorkItems > 0 
                    ? round(($completedWorkItems / $totalWorkItems) * 100, 1) 
                    : 0;

                // Get folder structure status
                $hasFolders = TeacherSubjectWork::where('staff_id', $staff->id)
                    ->where('subject_id', $subject->id)
                    ->whereNotNull('gdrive_folder_id')
                    ->exists();

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'description' => $subject->description,
                    'total_students' => $subject->total_students,
                    'students' => $subject->students,
                    'work_items_progress' => $workItemsProgress,
                    'recent_files' => $recentFiles,
                    'completion_percentage' => $completionPercentage,
                    'completed_work_items' => $completedWorkItems,
                    'total_work_items' => $totalWorkItems,
                    'has_folders' => $hasFolders,
                    'folder_url' => $hasFolders 
                        ? "https://drive.google.com/drive/folders/" . TeacherSubjectWork::where('staff_id', $staff->id)
                            ->where('subject_id', $subject->id)
                            ->whereNotNull('gdrive_folder_id')
                            ->first()?->gdrive_folder_id
                        : null,
                ];
            });

        // Overall statistics
        $overallStats = [
            'total_subjects' => $subjects->count(),
            'total_students' => $subjects->sum('total_students'),
            'average_completion' => $subjects->avg('completion_percentage'),
            'total_files' => TeacherSubjectWork::where('staff_id', $staff->id)
                ->withCount('files')
                ->get()
                ->sum('files_count'),
        ];

        return Inertia::render('teacher/subjects/index', [
            'subjects' => $subjects,
            'teacher' => $staff,
            'overallStats' => $overallStats,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show detailed view of a specific subject
     */
    public function show(Subject $subject): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            abort(403, 'Staff record not found');
        }

        // Verify teacher is assigned to this subject
        if (!$staff->subjects()->where('subjects.id', $subject->id)->exists()) {
            abort(403, 'You are not assigned to this subject');
        }

        // Get detailed subject information
        $subjectDetails = [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'description' => $subject->description,
        ];

        // Get students enrolled in this subject
        $students = $subject->students()
            ->select('students.id', 'students.name', 'students.nisn', 'students.class', 'students.status')
            ->orderBy('students.name')
            ->get();

        // Get work items with detailed progress
        $workItemsProgress = $this->getDetailedSubjectWorkItemsProgress($staff, $subject);

        // Get recent activity and files
        $recentActivity = TeacherSubjectWork::where('staff_id', $staff->id)
            ->where('subject_id', $subject->id)
            ->with(['files' => function ($query) {
                $query->latest('uploaded_at')->limit(10);
            }, 'workItem'])
            ->get()
            ->map(function ($teacherWork) {
                return [
                    'work_item' => $teacherWork->workItem,
                    'files' => $teacherWork->files,
                    'folder_url' => $teacherWork->gdrive_folder_id 
                        ? "https://drive.google.com/drive/folders/" . $teacherWork->gdrive_folder_id 
                        : null,
                ];
            });

        // Statistics for this subject
        $statistics = [
            'total_students' => $students->count(),
            'total_work_items' => WorkItem::count(),
            'completed_work_items' => $workItemsProgress->where('has_files', true)->count(),
            'total_files' => $recentActivity->sum(function ($item) {
                return $item['files']->count();
            }),
            'completion_percentage' => WorkItem::count() > 0 
                ? round(($workItemsProgress->where('has_files', true)->count() / WorkItem::count()) * 100, 1)
                : 0,
        ];

        return Inertia::render('teacher/subjects/show', [
            'subject' => $subjectDetails,
            'students' => $students,
            'workItemsProgress' => $workItemsProgress,
            'recentActivity' => $recentActivity,
            'statistics' => $statistics,
            'teacher' => $staff,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Get work items progress for a specific subject
     */
    private function getSubjectWorkItemsProgress(Staff $staff, Subject $subject): array
    {
        $workItems = WorkItem::all();
        $progress = [];

        foreach ($workItems as $workItem) {
            $teacherWork = TeacherSubjectWork::where('staff_id', $staff->id)
                ->where('subject_id', $subject->id)
                ->where('work_item_id', $workItem->id)
                ->with('files')
                ->first();

            $progress[] = [
                'work_item' => $workItem,
                'has_folder' => $teacherWork ? true : false,
                'files_count' => $teacherWork ? $teacherWork->files->count() : 0,
                'has_files' => $teacherWork && $teacherWork->files->count() > 0,
                'folder_url' => $teacherWork && $teacherWork->gdrive_folder_id 
                    ? "https://drive.google.com/drive/folders/" . $teacherWork->gdrive_folder_id 
                    : null,
            ];
        }

        return $progress;
    }

    /**
     * Get detailed work items progress for subject detail view
     */
    private function getDetailedSubjectWorkItemsProgress(Staff $staff, Subject $subject)
    {
        $workItems = WorkItem::all();
        
        return $workItems->map(function ($workItem) use ($staff, $subject) {
            $teacherWork = TeacherSubjectWork::where('staff_id', $staff->id)
                ->where('subject_id', $subject->id)
                ->where('work_item_id', $workItem->id)
                ->with(['files' => function ($query) {
                    $query->latest('uploaded_at');
                }])
                ->first();

            return [
                'work_item' => $workItem,
                'has_folder' => $teacherWork ? true : false,
                'files_count' => $teacherWork ? $teacherWork->files->count() : 0,
                'files' => $teacherWork ? $teacherWork->files : collect(),
                'has_files' => $teacherWork && $teacherWork->files->count() > 0,
                'folder_url' => $teacherWork && $teacherWork->gdrive_folder_id 
                    ? "https://drive.google.com/drive/folders/" . $teacherWork->gdrive_folder_id 
                    : null,
                'last_updated' => $teacherWork && $teacherWork->files->count() > 0 
                    ? $teacherWork->files->first()->uploaded_at 
                    : null,
            ];
        });
    }

    /**
     * Initialize folders for a specific subject
     */
    public function initializeFolders(Request $request, Subject $subject)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return redirect()->route('teacher.subjects.index')
                ->with('error', 'Staff record not found');
        }

        // Verify teacher is assigned to this subject
        if (!$staff->subjects()->where('subjects.id', $subject->id)->exists()) {
            return redirect()->route('teacher.subjects.index')
                ->with('error', 'You are not assigned to this subject');
        }

        try {
            app(\App\Services\WorkItemService::class)->createTeacherWorkFolders($staff, $subject);
            
            return redirect()->route('teacher.subjects.index')
                ->with('success', 'Folders initialized successfully for ' . $subject->name);
        } catch (\Exception $e) {
            return redirect()->route('teacher.subjects.index')
                ->with('error', 'Failed to initialize folders: ' . $e->getMessage());
        }
    }
}