<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\Subject;
use App\Models\WorkItem;
use App\Models\TeacherSubjectWork;
use App\Models\TeacherWorkFile;
use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use App\Models\GoogleDriveToken;

class WorkItemService
{
    /**
     * Create Google Drive folder structure for teacher's work items
     * Structure: Subject Folder -> Teacher Name -> Work Item Types (Prota, Prosem, etc.)
     */
    public function createTeacherWorkFolders(Staff $teacher, Subject $subject): array
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create main subject folder
            $subjectFolderId = $this->getOrCreateSubjectFolder($service, $subject);
            
            // Get or create teacher folder within subject folder
            $teacherFolderId = $this->getOrCreateTeacherFolder($service, $teacher, $subjectFolderId);
            
            // Create work item folders within teacher folder
            $workItemFolders = $this->createWorkItemFolders($service, $teacherFolderId);
            
            // Save folder mappings to database
            $this->saveTeacherSubjectWorkFolders($teacher, $subject, $workItemFolders);
            
            return [
                'subject_folder_id' => $subjectFolderId,
                'teacher_folder_id' => $teacherFolderId,
                'work_item_folders' => $workItemFolders,
            ];
            
        } catch (\Exception $e) {
            Log::error('Failed to create teacher work folders: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Upload file to specific work item folder
     */
    public function uploadWorkFile(TeacherSubjectWork $teacherWork, UploadedFile $file): TeacherWorkFile
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            $driveFile->setParents([$teacherWork->gdrive_folder_id]);
            
            // Upload file
            $result = $service->files->create(
                $driveFile,
                [
                    'data' => file_get_contents($file->getPathname()),
                    'mimeType' => $file->getMimeType(),
                    'uploadType' => 'multipart'
                ]
            );
            
            // Make file publicly readable
            $permission = new Permission();
            $permission->setRole('reader');
            $permission->setType('anyone');
            $service->permissions->create($result->getId(), $permission);
            
            // Generate public URL
            $fileUrl = "https://drive.google.com/file/d/" . $result->getId() . "/view";
            
            // Create Google Drive path reference
            $googleDrivePath = "google_drive://teacher-work-files/{$teacherWork->staff_id}/{$teacherWork->subject_id}/{$fileName}";
            
            // Save to database with enhanced information
            return TeacherWorkFile::create([
                'teacher_subject_work_id' => $teacherWork->id,
                'file_name' => $fileName,
                'file_url' => $fileUrl,
                'file_path' => $googleDrivePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_at' => now(), // Uses application timezone (Asia/Jakarta)
                'last_accessed' => now(), // Set initial access time
                'views' => 1, // Initial view count
                'downloads' => 0,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to upload work file: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Get teacher's work progress for all subjects
     */
    public function getTeacherWorkProgress(Staff $teacher): array
    {
        $subjects = $teacher->subjects()->get();
        
        $progress = [];
        
        foreach ($subjects as $subject) {
            $workItems = WorkItem::all();
            $subjectProgress = [
                'subject' => $subject,
                'total_work_items' => $workItems->count(),
                'completed_work_items' => 0,
                'work_items' => []
            ];
            
            foreach ($workItems as $workItem) {
                $teacherWork = TeacherSubjectWork::where('staff_id', $teacher->id)
                    ->where('subject_id', $subject->id)
                    ->where('work_item_id', $workItem->id)
                    ->with(['files.latestFeedback.reviewer:id,name'])
                    ->first();
                
                $workItemData = [
                    'work_item' => $workItem,
                    'has_folder' => $teacherWork ? true : false,
                    'files_count' => $teacherWork ? $teacherWork->files->count() : 0,
                    'files' => $teacherWork ? $teacherWork->files : collect(),
                    'folder_url' => $teacherWork && $teacherWork->gdrive_folder_id 
                        ? "https://drive.google.com/drive/folders/" . $teacherWork->gdrive_folder_id 
                        : null,
                ];
                
                if ($teacherWork && $teacherWork->files->count() > 0) {
                    $subjectProgress['completed_work_items']++;
                }
                
                $subjectProgress['work_items'][] = $workItemData;
            }
            
            $subjectProgress['completion_percentage'] = $subjectProgress['total_work_items'] > 0 
                ? round(($subjectProgress['completed_work_items'] / $subjectProgress['total_work_items']) * 100, 1)
                : 0;
            
            $progress[] = $subjectProgress;
        }
        
        return $progress;
    }
    
    /**
     * Get teacher feedback summary for notifications
     */
    public function getTeacherFeedbackSummary(Staff $teacher): array
    {
        $teacherWorks = TeacherSubjectWork::where('staff_id', $teacher->id)
            ->with(['files.latestFeedback.reviewer:id,name', 'workItem', 'subject'])
            ->get();
        
        $totalFiles = 0;
        $pendingFeedback = 0;
        $approvedFiles = 0;
        $needsRevisionFiles = 0;
        $unreadFeedback = 0;
        $recentFeedbacks = [];
        
        foreach ($teacherWorks as $teacherWork) {
            foreach ($teacherWork->files as $file) {
                $totalFiles++;
                
                if (!$file->latestFeedback) {
                    $pendingFeedback++;
                } else {
                    $feedback = $file->latestFeedback;
                    $isUnread = is_null($feedback->teacher_read_at);
                    
                    if ($isUnread) {
                        $unreadFeedback++;
                    }
                    
                    // Add to recent feedbacks (limit to last 10 for performance)
                    if (count($recentFeedbacks) < 10) {
                        $recentFeedbacks[] = [
                            'id' => $feedback->id,
                            'file_name' => $file->file_name,
                            'work_item_name' => $teacherWork->workItem->name,
                            'subject_name' => $teacherWork->subject->name,
                            'feedback' => $feedback->feedback,
                            'status' => $feedback->status,
                            'reviewer_name' => $feedback->reviewer->name,
                            'reviewed_at' => $feedback->reviewed_at,
                            'is_unread' => $isUnread,
                        ];
                    }
                    
                    switch ($feedback->status) {
                        case 'approved':
                            $approvedFiles++;
                            break;
                        case 'needs_revision':
                            $needsRevisionFiles++;
                            break;
                        case 'pending':
                        default:
                            $pendingFeedback++;
                            break;
                    }
                }
            }
        }
        
        // Sort recent feedbacks by review date (newest first)
        usort($recentFeedbacks, function ($a, $b) {
            return strtotime($b['reviewed_at']) - strtotime($a['reviewed_at']);
        });
        
        return [
            'total_files' => $totalFiles,
            'pending_feedback' => $pendingFeedback,
            'approved_files' => $approvedFiles,
            'needs_revision_files' => $needsRevisionFiles,
            'unread_feedback' => $unreadFeedback,
            'has_new_feedback' => $unreadFeedback > 0,
            'recent_feedbacks' => $recentFeedbacks,
        ];
    }

    /**
     * Mark feedback as read by teacher
     */
    public function markFeedbackAsRead(int $feedbackId): bool
    {
        try {
            $feedback = \App\Models\WorkItemFeedback::find($feedbackId);
            if ($feedback && is_null($feedback->teacher_read_at)) {
                $feedback->teacher_read_at = now();
                $feedback->save();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to mark feedback as read: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Mark all feedback as read for a teacher
     */
    public function markAllFeedbackAsRead(Staff $teacher): bool
    {
        try {
            \App\Models\WorkItemFeedback::whereHas('teacherWorkFile.teacherSubjectWork', function ($query) use ($teacher) {
                $query->where('staff_id', $teacher->id);
            })
            ->whereNull('teacher_read_at')
            ->update(['teacher_read_at' => now()]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to mark all feedback as read: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Track file access (when file is viewed or downloaded)
     */
    public function trackFileAccess(TeacherWorkFile $workFile, string $action = 'view'): void
    {
        try {
            $workFile->increment('views');
            $workFile->update(['last_accessed' => now()]); // Uses application timezone (Asia/Jakarta)
            
            if ($action === 'download') {
                $workFile->increment('downloads');
            }
            
            Log::info("File access tracked", [
                'file_id' => $workFile->id,
                'file_name' => $workFile->file_name,
                'action' => $action,
                'total_views' => $workFile->views,
                'total_downloads' => $workFile->downloads,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to track file access: ' . $e->getMessage());
        }
    }

    /**
     * Delete work file from Google Drive
     */
    public function deleteWorkFile(TeacherWorkFile $workFile): bool
    {
        try {
            Log::info('Attempting to delete work file from Google Drive', [
                'file_id' => $workFile->id,
                'file_name' => $workFile->file_name,
                'file_url' => $workFile->file_url,
                'file_path' => $workFile->file_path
            ]);

            // Extract Google Drive file ID from URL
            $fileId = $this->extractGoogleDriveFileId($workFile->file_url);
            
            if ($fileId) {
                $client = $this->createAuthenticatedGoogleClient();
                if (!$client) {
                    Log::error('Failed to create Google Drive client for file deletion');
                    return false;
                }
                
                $service = new Drive($client);
                $service->files->delete($fileId);
                
                Log::info('Successfully deleted file from Google Drive', ['file_id' => $fileId]);
            } else {
                Log::warning('Could not extract Google Drive file ID from URL', ['url' => $workFile->file_url]);
            }
            
            // Delete database record
            $workFile->delete();
            Log::info('Work file record deleted from database');
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to delete work file: ' . $e->getMessage(), [
                'file_id' => $workFile->id,
                'error_trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
    
    /**
     * Create authenticated Google Client with enhanced error handling
     */
    private function createAuthenticatedGoogleClient(): ?Client
    {
        $clientId = config('services.google_drive.client_id');
        $clientSecret = config('services.google_drive.client_secret');
        
        if (!$clientId || !$clientSecret) {
            Log::error('Google Drive client credentials are not configured. Please check your .env file.');
            return null;
        }
        
        // Get active token from database
        $tokenRecord = GoogleDriveToken::getActiveToken();
        
        if (!$tokenRecord || !$tokenRecord->refresh_token) {
            Log::error('No active Google Drive token found. Please run: php artisan storage:setup-google-drive');
            return null;
        }
        
        // Get authenticated client from the token model
        $client = $tokenRecord->getAuthenticatedClient();
        
        if (!$client) {
            Log::warning('Initial token authentication failed, attempting recovery...');
            
            // Attempt token recovery
            $recoverySuccess = $tokenRecord->attemptTokenRecovery();
            
            if ($recoverySuccess) {
                Log::info('Token recovery successful, retrying client creation');
                $client = $tokenRecord->getAuthenticatedClient();
            }
            
            if (!$client) {
                if (GoogleDriveToken::needsSetup()) {
                    Log::error('Google Drive requires re-authentication. Please run: php artisan storage:setup-google-drive');
                } else {
                    Log::error('Failed to create authenticated Google Drive client despite recovery attempt');
                }
                return null;
            }
        }
        
        return $client;
    }
    
    /**
     * Get or create subject folder
     */
    private function getOrCreateSubjectFolder(Drive $service, Subject $subject): string
    {
        $parentFolderId = config('filesystems.disks.google_drive.folder_id');
        $folderName = $subject->name . " (" . $subject->code . ")";
        
        return $this->getOrCreateFolder($service, $folderName, $parentFolderId);
    }
    
    /**
     * Get or create teacher folder within subject folder
     */
    private function getOrCreateTeacherFolder(Drive $service, Staff $teacher, string $parentFolderId): string
    {
        $folderName = $teacher->name;
        
        return $this->getOrCreateFolder($service, $folderName, $parentFolderId);
    }
    
    /**
     * Create work item folders
     */
    private function createWorkItemFolders(Drive $service, string $parentFolderId): array
    {
        $workItems = WorkItem::all();
        $folders = [];
        
        foreach ($workItems as $workItem) {
            $folderId = $this->getOrCreateFolder($service, $workItem->name, $parentFolderId);
            $folders[$workItem->id] = [
                'work_item_id' => $workItem->id,
                'folder_id' => $folderId,
                'folder_name' => $workItem->name,
            ];
        }
        
        return $folders;
    }
    
    /**
     * Generic method to get or create folder
     */
    private function getOrCreateFolder(Drive $service, string $folderName, ?string $parentFolderId = null): string
    {
        // Search for existing folder
        $query = "name='{$folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false";
        if ($parentFolderId) {
            $query .= " and '{$parentFolderId}' in parents";
        }
        
        $results = $service->files->listFiles([
            'q' => $query,
            'fields' => 'files(id, name)'
        ]);
        
        $files = $results->getFiles();
        
        // If folder exists, return its ID
        if (!empty($files)) {
            return $files[0]->getId();
        }
        
        // Create new folder
        $folderMetadata = new DriveFile();
        $folderMetadata->setName($folderName);
        $folderMetadata->setMimeType('application/vnd.google-apps.folder');
        
        if ($parentFolderId) {
            $folderMetadata->setParents([$parentFolderId]);
        }
        
        $folder = $service->files->create($folderMetadata, [
            'fields' => 'id'
        ]);
        
        Log::info("Created folder '{$folderName}' with ID: " . $folder->getId());
        
        return $folder->getId();
    }
    
    /**
     * Save teacher subject work folders to database
     */
    private function saveTeacherSubjectWorkFolders(Staff $teacher, Subject $subject, array $workItemFolders): void
    {
        foreach ($workItemFolders as $workItemData) {
            TeacherSubjectWork::updateOrCreate(
                [
                    'staff_id' => $teacher->id,
                    'subject_id' => $subject->id,
                    'work_item_id' => $workItemData['work_item_id'],
                ],
                [
                    'folder_name' => $workItemData['folder_name'],
                    'gdrive_folder_id' => $workItemData['folder_id'],
                ]
            );
        }
    }
    
    /**
     * Extract Google Drive file ID from URL
     */
    private function extractGoogleDriveFileId(string $url): ?string
    {
        // Handle URLs like: https://drive.google.com/file/d/FILE_ID/view
        if (preg_match('/\/file\/d\/([a-zA-Z0-9_-]+)\//', $url, $matches)) {
            return $matches[1];
        }
        
        // Handle URLs like: https://drive.google.com/uc?id=FILE_ID
        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}