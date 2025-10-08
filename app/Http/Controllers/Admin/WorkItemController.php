<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WorkItem;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\TeacherSubjectWork;
use App\Models\TeacherWorkFile;
use App\Models\GoogleDriveToken;
use App\Services\WorkItemService;
use Google\Client;
use Google\Service\Drive;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class WorkItemController extends Controller
{
    protected WorkItemService $workItemService;

    public function __construct(WorkItemService $workItemService)
    {
        $this->workItemService = $workItemService;
    }

    /**
     * Display work items management dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get work items with different views based on role
        if ($user->role === 'super_admin' || $user->role === 'headmaster') {
            // Admin view: see all work items and teacher progress
            $workItems = WorkItem::orderBy('name')->get();
            $teachers = Staff::whereHas('subjects')->with(['subjects', 'user'])->get();
            
            // Get overall progress statistics
            $stats = $this->getOverallProgressStats();
            
            return Inertia::render('admin/work-items/index', [
                'workItems' => $workItems,
                'teachers' => $teachers,
                'stats' => $stats,
                'userRole' => $user->role,
            ]);
        } else {
            // Teacher view: see own work progress
            $staff = Staff::where('user_id', $user->id)->first();
            
            if (!$staff) {
                abort(403, 'Staff record not found');
            }
            
            $progress = $this->workItemService->getTeacherWorkProgress($staff);
            $feedbackSummary = $this->workItemService->getTeacherFeedbackSummary($staff);
            
            return Inertia::render('teacher/work-items/dashboard', [
                'progress' => $progress,
                'teacher' => $staff,
                'userRole' => $user->role,
                'feedbackSummary' => $feedbackSummary,
            ]);
        }
    }

    /**
     * Show work items management page (redirects to index)
     */
    public function manage(): RedirectResponse
    {
        Gate::authorize('manage-work-items');
        
        // Redirect to the main index page since we handle management there
        return redirect()->route('admin.work-items.index');
    }

    /**
     * Store a new work item (only headmaster and super_admin can create mandatory items)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:work_items',
            'is_required' => 'boolean',
        ]);

        $user = Auth::user();
        
        // Only headmaster and super_admin can create required work items
        if ($request->is_required && !in_array($user->role, ['super_admin', 'headmaster'])) {
            return response()->json(['error' => 'Only administrators can create mandatory work items'], 403);
        }

        $workItem = WorkItem::create([
            'name' => $request->name,
            'is_required' => $request->is_required ?? false,
            'created_by_role' => $user->role,
        ]);

        return response()->json([
            'message' => 'Work item created successfully',
            'workItem' => $workItem,
        ]);
    }

    /**
     * Update work item
     */
    public function update(Request $request, WorkItem $workItem)
    {
        Gate::authorize('manage-work-items');

        $request->validate([
            'name' => 'required|string|max:255|unique:work_items,name,' . $workItem->id,
            'is_required' => 'boolean',
        ]);

        $user = Auth::user();
        
        // Only headmaster and super_admin can modify required status
        if ($request->has('is_required') && !in_array($user->role, ['super_admin', 'headmaster'])) {
            return response()->json(['error' => 'Only administrators can modify mandatory status'], 403);
        }

        $workItem->update($request->only(['name', 'is_required']));

        return response()->json([
            'message' => 'Work item updated successfully',
            'workItem' => $workItem,
        ]);
    }

    /**
     * Delete work item (admin only)
     */
    public function destroy(WorkItem $workItem)
    {
        Gate::authorize('manage-work-items');

        return $this->deleteWorkItemWithFiles($workItem, 'admin');
    }
    
    /**
     * Delete work item created by teacher (teacher only)
     */
    public function destroyTeacherWorkItem(WorkItem $workItem)
    {
        $user = Auth::user();
        
        // Ensure user is a teacher
        if ($user->role !== 'teacher') {
            return back()->withErrors(['error' => 'Only teachers can delete work items through this route']);
        }
        
        // Teachers can only delete optional work items they created
        if ($workItem->is_required) {
            return back()->withErrors(['error' => 'Cannot delete required work items']);
        }
        
        if ($workItem->created_by_role !== 'teacher') {
            return back()->withErrors(['error' => 'You can only delete work items you created']);
        }

        return $this->deleteWorkItemWithFiles($workItem, 'teacher');
    }
    
    /**
     * Delete work item with associated Google Drive files and folders
     */
    private function deleteWorkItemWithFiles(WorkItem $workItem, string $userType)
    {
        try {
            // Get all teacher subject work records associated with this work item
            $teacherWorks = TeacherSubjectWork::where('work_item_id', $workItem->id)->get();
            
            if ($teacherWorks->count() > 0) {
                // Clean up Google Drive files and folders
                $this->cleanupGoogleDriveForWorkItem($teacherWorks);
            }
            
            // Delete the work item (this will cascade delete teacher_subject_work and teacher_work_files)
            $workItem->delete();
            
            $message = 'Work item and associated files deleted successfully';
            
            return $userType === 'admin' 
                ? response()->json(['message' => $message])
                : back()->with('success', $message);
                
        } catch (\Exception $e) {
            Log::error('Failed to delete work item: ' . $e->getMessage());
            
            $errorMessage = 'Failed to delete work item: ' . $e->getMessage();
            
            return $userType === 'admin'
                ? response()->json(['error' => $errorMessage], 500)
                : back()->withErrors(['error' => $errorMessage]);
        }
    }
    
    /**
     * Clean up Google Drive files and folders for a work item
     */
    private function cleanupGoogleDriveForWorkItem($teacherWorks)
    {
        $client = $this->createAuthenticatedGoogleClient();
        $service = new Drive($client);
        
        foreach ($teacherWorks as $teacherWork) {
            try {
                // Delete all files in the work item folder
                $files = $teacherWork->files;
                foreach ($files as $file) {
                    $fileId = $this->extractGoogleDriveFileId($file->file_url);
                    if ($fileId) {
                        try {
                            $service->files->delete($fileId);
                            Log::info("Deleted Google Drive file: {$file->file_name}");
                        } catch (\Exception $e) {
                            Log::warning("Failed to delete Google Drive file {$file->file_name}: " . $e->getMessage());
                        }
                    }
                }
                
                // Delete the work item folder
                if ($teacherWork->gdrive_folder_id) {
                    try {
                        $service->files->delete($teacherWork->gdrive_folder_id);
                        Log::info("Deleted Google Drive folder: {$teacherWork->folder_name}");
                    } catch (\Exception $e) {
                        Log::warning("Failed to delete Google Drive folder {$teacherWork->folder_name}: " . $e->getMessage());
                    }
                }
                
            } catch (\Exception $e) {
                Log::error("Error cleaning up Google Drive for work item {$teacherWork->id}: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Extract Google Drive file ID from URL
     */
    private function extractGoogleDriveFileId(string $url): ?string
    {
        // Extract file ID from Google Drive URL
        // Format: https://drive.google.com/file/d/{FILE_ID}/view
        if (preg_match('/\/file\/d\/([a-zA-Z0-9\-_]+)\//', $url, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    /**
     * Create authenticated Google Client
     */
    private function createAuthenticatedGoogleClient(): Client
    {
        $tokenRecord = GoogleDriveToken::getActiveToken();
        
        if (!$tokenRecord || !$tokenRecord->refresh_token) {
            throw new \RuntimeException('No active Google Drive token found. Please run the setup command first.');
        }
        
        $client = $tokenRecord->getAuthenticatedClient();
        
        if (!$client) {
            throw new \RuntimeException('Failed to create authenticated Google Drive client. Token may be invalid.');
        }
        
        return $client;
    }

    /**
     * Initialize teacher work folders for a subject
     */
    public function initializeTeacherFolders(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:staff,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $teacher = Staff::findOrFail($request->teacher_id);
        $subject = Subject::findOrFail($request->subject_id);

        // Check if user can initialize folders for this teacher
        $user = Auth::user();
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $teacher->id) {
                return back()->withErrors(['error' => 'You can only initialize your own folders']);
            }
        }

        try {
            $this->workItemService->createTeacherWorkFolders($teacher, $subject);
            
            return back()->with('success', 'Work folders initialized successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to initialize folders: ' . $e->getMessage()]);
        }
    }

    /**
     * Upload file to work item folder
     */
    public function uploadFile(Request $request)
    {
        // Set PHP upload limits dynamically for large files
        ini_set('upload_max_filesize', '10M');
        ini_set('post_max_size', '15M');
        ini_set('memory_limit', '256M');
        ini_set('max_execution_time', '300'); // 5 minutes
        
        // Log the actual PHP limits being used
        Log::info('PHP upload limits set', [
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'memory_limit' => ini_get('memory_limit'),
        ]);
        
        Log::info('Upload validation attempt', [
            'has_file' => $request->hasFile('file'),
            'teacher_subject_work_id' => $request->teacher_subject_work_id,
            'file_info' => $request->file('file') ? [
                'name' => $request->file('file')->getClientOriginalName(),
                'size' => $request->file('file')->getSize(),
                'error' => $request->file('file')->getError(),
            ] : null,
        ]);
        
        try {
            $request->validate([
                'teacher_subject_work_id' => 'required|exists:teacher_subject_work,id',
                'file' => 'required|file|max:10240', // 10MB max (in KB)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Upload validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            throw $e;
        }

        $teacherWork = TeacherSubjectWork::findOrFail($request->teacher_subject_work_id);
        
        // Check if user can upload to this folder
        $user = Auth::user();
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $teacherWork->staff_id) {
                return response()->json(['error' => 'You can only upload to your own folders'], 403);
            }
        }

        try {
            $uploadedFile = $request->file('file');
            Log::info('File upload attempt', [
                'filename' => $uploadedFile?->getClientOriginalName(),
                'size' => $uploadedFile?->getSize(),
                'mime_type' => $uploadedFile?->getMimeType(),
                'teacher_subject_work_id' => $teacherWork->id,
                'user_id' => Auth::id(),
                'request_teacher_subject_work_id' => $request->teacher_subject_work_id,
                'all_request_data' => $request->all(),
            ]);
            
            $workFile = $this->workItemService->uploadWorkFile($teacherWork, $uploadedFile);
            
            Log::info('File uploaded successfully', [
                'filename' => $workFile->file_name,
                'gdrive_url' => $workFile->file_url,
                'database_id' => $workFile->id,
            ]);
            
            return response()->json([
                'message' => 'File uploaded successfully',
                'file' => $workFile,
            ]);
        } catch (\Exception $e) {
            Log::error('File upload failed', [
                'filename' => $request->file('file')?->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete work file
     */
    public function deleteFile(TeacherWorkFile $file)
    {
        $user = Auth::user();
        
        // Check if user can delete this file
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $file->teacherSubjectWork->staff_id) {
                return response()->json(['error' => 'You can only delete your own files'], 403);
            }
        }

        $success = $this->workItemService->deleteWorkFile($file);

        if ($success) {
            return response()->json(['message' => 'File deleted successfully']);
        } else {
            return response()->json(['error' => 'Failed to delete file'], 500);
        }
    }

    /**
     * Get teacher's work progress
     */
    public function getTeacherProgress(Staff $teacher)
    {
        $user = Auth::user();
        
        // Check if user can view this teacher's progress
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $teacher->id) {
                return response()->json(['error' => 'You can only view your own progress'], 403);
            }
        }

        $progress = $this->workItemService->getTeacherWorkProgress($teacher);

        return response()->json(['progress' => $progress]);
    }

    /**
     * Get teacher subject work ID for file uploads
     */
    public function getTeacherSubjectWorkId(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:staff,id',
            'subject_id' => 'required|exists:subjects,id',
            'work_item_id' => 'required|exists:work_items,id',
        ]);

        $teacherWork = TeacherSubjectWork::where([
            'staff_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'work_item_id' => $request->work_item_id,
        ])->first();

        if (!$teacherWork) {
            return response()->json([
                'error' => 'Teacher subject work record not found. Please initialize folders first.'
            ], 404);
        }

        // Check if user can access this record
        $user = Auth::user();
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $teacherWork->staff_id) {
                return response()->json(['error' => 'You can only access your own work folders'], 403);
            }
        }

        return response()->json([
            'teacher_subject_work_id' => $teacherWork->id,
            'gdrive_folder_id' => $teacherWork->gdrive_folder_id,
        ]);
    }

    /**
     * Get overall progress statistics (admin only)
     */
    public function getProgressStats()
    {
        Gate::authorize('view-work-stats');

        $stats = $this->getOverallProgressStats();

        return response()->json(['stats' => $stats]);
    }
    
    /**
     * Store a new work item created by a teacher (always optional)
     */
    public function storeTeacherWorkItem(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:work_items',
        ]);

        $user = Auth::user();
        
        // Ensure user is a teacher
        if ($user->role !== 'teacher') {
            return back()->withErrors(['error' => 'Only teachers can create work items through this route']);
        }

        WorkItem::create([
            'name' => $request->name,
            'is_required' => false, // Teachers can only create optional work items
            'created_by_role' => $user->role,
        ]);

        return back()->with('success', 'Work item created successfully');
    }

    /**
     * Helper method to get overall progress statistics
     */
    private function getOverallProgressStats(): array
    {
        $totalTeachers = Staff::whereHas('subjects')->count();
        $totalWorkItems = WorkItem::count();
        $totalExpectedSubmissions = $totalTeachers * $totalWorkItems;
        
        $completedSubmissions = TeacherSubjectWork::whereHas('files')->count();
        
        $completionRate = $totalExpectedSubmissions > 0 
            ? round(($completedSubmissions / $totalExpectedSubmissions) * 100, 1) 
            : 0;

        // Get work item completion statistics
        $workItemStats = WorkItem::withCount([
            'teacherSubjectWorks as teachers_with_submissions' => function ($query) {
                $query->whereHas('files');
            }
        ])->get()->map(function ($workItem) use ($totalTeachers) {
            return [
                'work_item' => $workItem->name,
                'completion_count' => $workItem->teachers_with_submissions,
                'total_teachers' => $totalTeachers,
                'completion_rate' => $totalTeachers > 0 
                    ? round(($workItem->teachers_with_submissions / $totalTeachers) * 100, 1)
                    : 0,
            ];
        });

        return [
            'total_teachers' => $totalTeachers,
            'total_work_items' => $totalWorkItems,
            'total_expected_submissions' => $totalExpectedSubmissions,
            'completed_submissions' => $completedSubmissions,
            'overall_completion_rate' => $completionRate,
            'work_item_stats' => $workItemStats,
        ];
    }

    /**
     * Get file metadata from Google Drive
     */
    public function getFileMetadata(Request $request)
    {
        Log::info('getFileMetadata called', ['file_url' => $request->file_url]);
        
        try {
            $request->validate([
                'file_url' => 'required|url',
            ]);

            // Extract file ID from Google Drive URL
            $fileUrl = $request->file_url;
            preg_match('/\/d\/([a-zA-Z0-9-_]+)/', $fileUrl, $matches);
            
            if (!isset($matches[1])) {
                Log::error('Invalid Google Drive URL format', ['file_url' => $fileUrl]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google Drive URL'
                ], 400);
            }

            $fileId = $matches[1];
            Log::info('Extracted file ID', ['file_id' => $fileId]);

            // Get Google Drive client

            // Create authenticated Google client with API key
            $token = GoogleDriveToken::first();
            if (!$token) {
                Log::error('No Google Drive token found in database');
                return response()->json([
                    'success' => false,
                    'message' => 'Google Drive not configured'
                ], 500);
            }

            $client = $token->getAuthenticatedClient();
            if (!$client) {
                Log::error('Failed to get authenticated Google client');
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to authenticate with Google Drive'
                ], 500);
            }

            // Set the API key for public access
            $apiKey = config('services.google.api_key');
            if ($apiKey) {
                $client->setDeveloperKey($apiKey);
                Log::info('Google API key set for client');
            } else {
                Log::warning('No Google API key configured');
            }
            
            Log::info('Google client configured');

            $driveService = new Drive($client);

            // Get file metadata
            Log::info('Attempting to fetch file metadata from Google Drive API', ['file_id' => $fileId]);
            
            $fileMetadata = $driveService->files->get($fileId, [
                'fields' => 'id,name,size,mimeType,createdTime,modifiedTime,webViewLink'
            ]);

            Log::info('Successfully fetched file metadata', [
                'file_id' => $fileMetadata->getId(),
                'file_name' => $fileMetadata->getName(),
                'file_size' => $fileMetadata->getSize()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fileMetadata->getId(),
                    'name' => $fileMetadata->getName(),
                    'size' => $fileMetadata->getSize(),
                    'mime_type' => $fileMetadata->getMimeType(),
                    'created_time' => $fileMetadata->getCreatedTime(),
                    'modified_time' => $fileMetadata->getModifiedTime(),
                    'web_view_link' => $fileMetadata->getWebViewLink(),
                ]
            ]);

        } catch (\Google\Service\Exception $e) {
            $errorDetails = json_decode($e->getMessage(), true);
            Log::error('Google Drive API error', [
                'error' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'file_url' => $request->file_url ?? null,
                'file_id' => $fileId ?? null,
                'error_details' => $errorDetails,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Google Drive API error: ' . ($errorDetails['error']['message'] ?? $e->getMessage()),
                'error_code' => $e->getCode()
            ], 500);

        } catch (\Exception $e) {
            Log::error('File metadata fetch error', [
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'file_url' => $request->file_url ?? null,
                'file_id' => $fileId ?? null,
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching file metadata: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Track file access when user views or downloads
     */
    public function trackFileAccess(Request $request, TeacherWorkFile $file)
    {
        $user = Auth::user();
        
        // Check if user can access this file
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $file->teacherSubjectWork->staff_id) {
                return response()->json(['error' => 'You can only access your own files'], 403);
            }
        }

        $action = $request->get('action', 'view'); // 'view' or 'download'
        $this->workItemService->trackFileAccess($file, $action);

        return response()->json([
            'message' => 'File access tracked',
            'views' => $file->fresh()->views,
            'downloads' => $file->fresh()->downloads,
            'last_accessed' => $file->fresh()->last_accessed,
        ]);
    }

    /**
     * View file with access tracking
     */
    public function viewFile(TeacherWorkFile $file)
    {
        $user = Auth::user();
        
        // Check if user can access this file
        if ($user->role === 'teacher') {
            $staff = Staff::where('user_id', $user->id)->first();
            if (!$staff || $staff->id !== $file->teacherSubjectWork->staff_id) {
                abort(403, 'You can only access your own files');
            }
        }

        // Track the view
        $this->workItemService->trackFileAccess($file, 'view');

        // Redirect to Google Drive URL
        return redirect($file->file_url);
    }

    /**
     * Mark feedback as read by teacher
     */
    public function markFeedbackAsRead(Request $request, $feedbackId)
    {
        $user = Auth::user();
        if ($user->role !== 'teacher') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $success = $this->workItemService->markFeedbackAsRead($feedbackId);
        
        if ($success) {
            return response()->json(['success' => true]);
        }
        
        return response()->json(['error' => 'Failed to mark feedback as read'], 500);
    }

    /**
     * Mark all feedback as read for current teacher
     */
    public function markAllFeedbackAsRead(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'teacher') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $staff = Staff::where('user_id', $user->id)->first();
        if (!$staff) {
            return response()->json(['error' => 'Staff record not found'], 404);
        }

        $success = $this->workItemService->markAllFeedbackAsRead($staff);
        
        if ($success) {
            return response()->json(['success' => true]);
        }
        
        return response()->json(['error' => 'Failed to mark all feedback as read'], 500);
    }
}