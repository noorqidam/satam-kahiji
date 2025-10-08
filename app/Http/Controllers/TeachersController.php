<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\TeacherWorkFile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeachersController extends Controller
{
    /**
     * Display a listing of teachers.
     */
    public function index(): Response
    {
        $teachers = Staff::with(['subjects:id,name,code'])
            ->select('id', 'name', 'slug', 'position', 'photo', 'bio', 'email', 'homeroom_class')
            ->where(function($query) {
                $query->where('position', 'guru')
                      ->orWhere('position', 'Guru');
            })
            ->where(function($query) {
                $query->where('division', 'Akademik')
                      ->orWhere('division', 'akademik');
            })
            ->whereNotNull('name')
            ->orderBy('name')
            ->get();

        return Inertia::render('teachers/index', [
            'teachers' => $teachers,
        ]);
    }

    /**
     * Display the specified teacher.
     */
    public function show(Request $request, $slug): Response
    {
        $teacher = Staff::with([
            'subjects:id,name,code,description',
            'teacherSubjectWorks.workItem:id,name',
            'teacherSubjectWorks.files' => function ($query) {
                $query->select('id', 'teacher_subject_work_id', 'file_name', 'file_url', 'uploaded_at', 'file_size', 'mime_type')
                    ->orderBy('uploaded_at', 'desc');
            }
        ])
        ->where('slug', $slug)
        ->where(function($query) {
            $query->where('position', 'guru')
                  ->orWhere('position', 'Guru');
        })
        ->where(function($query) {
            $query->where('division', 'Akademik')
                  ->orWhere('division', 'akademik');
        })
        ->firstOrFail();

        // Group files by work item type
        $filesByType = [
            'prota' => [],
            'prosem' => [],
            'module' => [],
            'attendance' => [],
            'agenda' => [],
            'other' => []
        ];

        foreach ($teacher->teacherSubjectWorks as $subjectWork) {
            foreach ($subjectWork->files as $file) {
                $workItemName = strtolower($subjectWork->workItem->name ?? 'other');
                
                // Categorize files based on work item name or file name
                if (str_contains($workItemName, 'prota') || str_contains(strtolower($file->file_name), 'prota')) {
                    $filesByType['prota'][] = $file;
                } elseif (str_contains($workItemName, 'prosem') || str_contains(strtolower($file->file_name), 'prosem')) {
                    $filesByType['prosem'][] = $file;
                } elseif (str_contains($workItemName, 'modul') || str_contains(strtolower($file->file_name), 'modul') || 
                         str_contains($workItemName, 'module') || str_contains(strtolower($file->file_name), 'module')) {
                    $filesByType['module'][] = $file;
                } elseif (str_contains($workItemName, 'absen') || str_contains(strtolower($file->file_name), 'absen') ||
                         str_contains($workItemName, 'attendance') || str_contains(strtolower($file->file_name), 'attendance')) {
                    $filesByType['attendance'][] = $file;
                } elseif (str_contains($workItemName, 'agenda') || str_contains(strtolower($file->file_name), 'agenda')) {
                    $filesByType['agenda'][] = $file;
                } else {
                    $filesByType['other'][] = $file;
                }
            }
        }

        // Calculate statistics
        $totalFiles = array_sum(array_map('count', $filesByType));
        $subjectCount = $teacher->subjects->count();

        return Inertia::render('teachers/show', [
            'teacher' => $teacher,
            'filesByType' => $filesByType,
            'statistics' => [
                'totalFiles' => $totalFiles,
                'subjectCount' => $subjectCount,
                'recentFiles' => $this->getRecentFiles($teacher),
            ]
        ]);
    }

    /**
     * Get recent files for the teacher
     */
    private function getRecentFiles(Staff $teacher, int $limit = 5): array
    {
        $recentFiles = [];
        
        foreach ($teacher->teacherSubjectWorks as $subjectWork) {
            foreach ($subjectWork->files as $file) {
                $recentFiles[] = [
                    'file' => $file,
                    'subject' => $subjectWork->subject->name ?? 'Unknown',
                    'work_item' => $subjectWork->workItem->name ?? 'Unknown'
                ];
            }
        }

        // Sort by upload date and take the most recent
        usort($recentFiles, function($a, $b) {
            return strtotime($b['file']->uploaded_at) - strtotime($a['file']->uploaded_at);
        });

        return array_slice($recentFiles, 0, $limit);
    }
}