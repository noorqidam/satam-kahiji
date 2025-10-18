<?php

namespace App\Repositories;

use App\Models\Staff;
use App\Models\TeacherSubjectWork;
use App\Models\GoogleDriveToken;
use App\Repositories\Contracts\StaffRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Google\Client;
use Google\Service\Drive;

class StaffRepository implements StaffRepositoryInterface
{
    public function __construct(
        private Staff $model
    ) {}

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with('user')->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage)->withQueryString();
    }

    public function findWithRelations(int $id): ?Staff
    {
        return $this->model
            ->with(['user', 'subjects'])
            ->find($id);
    }

    public function create(array $data): Staff
    {
        return $this->model->create($data);
    }

    public function update(Staff $staff, array $data): bool
    {
        return $staff->update($data);
    }

    public function delete(Staff $staff): bool
    {
        return $staff->delete();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function findByIds(array $ids): EloquentCollection
    {
        return $this->model->whereIn('id', $ids)->get();
    }

    public function getUniqueDivisions(): Collection
    {
        return $this->model
            ->distinct()
            ->pluck('division')
            ->filter()
            ->sort()
            ->values();
    }

    public function syncSubjects(Staff $staff, array $subjectIds): void
    {
        // Get current subject IDs before sync
        $currentSubjectIds = $staff->subjects()->pluck('subjects.id')->toArray();
        
        // Perform the sync
        $staff->subjects()->sync($subjectIds);
        
        // Clean up teacher_subject_work records for removed subjects
        $removedSubjectIds = array_diff($currentSubjectIds, $subjectIds);
        if (!empty($removedSubjectIds)) {
            $this->cleanupTeacherSubjectWork($staff->id, $removedSubjectIds);
        }
        
        Log::info('Subject sync completed', [
            'staff_id' => $staff->id,
            'previous_subjects' => $currentSubjectIds,
            'new_subjects' => $subjectIds,
            'removed_subjects' => $removedSubjectIds,
        ]);
    }

    public function detachSubject(Staff $staff, int $subjectId): void
    {
        $staff->subjects()->detach($subjectId);
        
        // Clean up teacher_subject_work records for this specific subject
        $this->cleanupTeacherSubjectWork($staff->id, [$subjectId]);
        
        Log::info('Subject detached and teacher_subject_work cleaned up', [
            'staff_id' => $staff->id,
            'subject_id' => $subjectId,
        ]);
    }

    public function isTeacherInAcademicDivision(Staff $staff): bool
    {
        $isTeacher = str_contains(strtolower($staff->position), 'teacher') || 
                    str_contains(strtolower($staff->position), 'guru');
        $isAcademic = strtolower($staff->division) === 'akademik';
        
        return $isTeacher && $isAcademic;
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        // Search functionality (case-insensitive)
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(position) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(division) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(phone) LIKE ?', ["%{$search}%"]);
            });
        }

        // Multiple divisions filter
        if (!empty($filters['divisions'])) {
            $divisions = is_string($filters['divisions']) 
                ? explode(',', $filters['divisions']) 
                : $filters['divisions'];
            
            $query->whereIn('division', $divisions);
        }
    }

    /**
     * Clean up teacher_subject_work records when subjects are removed from a teacher
     */
    private function cleanupTeacherSubjectWork(int $staffId, array $subjectIds): void
    {
        if (empty($subjectIds)) {
            return;
        }

        // Get all teacher_subject_work records that will be deleted
        $recordsToDelete = TeacherSubjectWork::where('staff_id', $staffId)
            ->whereIn('subject_id', $subjectIds)
            ->with(['files', 'subject', 'workItem'])
            ->get();

        if ($recordsToDelete->isEmpty()) {
            Log::info('No teacher_subject_work records found for cleanup', [
                'staff_id' => $staffId,
                'subject_ids' => $subjectIds,
            ]);
            return;
        }

        $deletedRecords = [];
        $deletedFiles = [];

        // Clean up Google Drive files and folders first
        try {
            $this->cleanupGoogleDriveResources($recordsToDelete);
        } catch (\Exception $e) {
            Log::warning('Failed to cleanup Google Drive resources: ' . $e->getMessage(), [
                'staff_id' => $staffId,
                'subject_ids' => $subjectIds,
            ]);
        }

        foreach ($recordsToDelete as $record) {
            // Log files that will be deleted
            foreach ($record->files as $file) {
                $deletedFiles[] = [
                    'file_name' => $file->file_name,
                    'file_url' => $file->file_url,
                    'subject' => $record->subject->name ?? 'Unknown',
                    'work_item' => $record->workItem->name ?? 'Unknown',
                ];
            }

            $deletedRecords[] = [
                'id' => $record->id,
                'subject' => $record->subject->name ?? 'Unknown',
                'work_item' => $record->workItem->name ?? 'Unknown',
                'folder_name' => $record->folder_name,
                'gdrive_folder_id' => $record->gdrive_folder_id,
                'files_count' => $record->files->count(),
            ];
        }

        // Delete the records (this will cascade delete associated files due to foreign key constraints)
        TeacherSubjectWork::where('staff_id', $staffId)
            ->whereIn('subject_id', $subjectIds)
            ->delete();

        Log::info('Teacher subject work records cleaned up', [
            'staff_id' => $staffId,
            'subject_ids' => $subjectIds,
            'deleted_records' => $deletedRecords,
            'deleted_files' => $deletedFiles,
            'total_records_deleted' => count($deletedRecords),
            'total_files_deleted' => count($deletedFiles),
        ]);
    }

    /**
     * Clean up Google Drive files and folders for teacher subject work records
     */
    private function cleanupGoogleDriveResources($recordsToDelete): void
    {
        $client = $this->createAuthenticatedGoogleClient();
        if (!$client) {
            Log::warning('Cannot cleanup Google Drive resources: No authenticated client available', [
                'records_count' => $recordsToDelete->count(),
                'suggestion' => 'Database cleanup will continue, but Google Drive resources may remain'
            ]);
            return;
        }

        $service = new Drive($client);
        $successfulCleanups = 0;
        $failedCleanups = 0;

        foreach ($recordsToDelete as $record) {
            $recordSuccess = true;
            
            try {
                // Delete all files in the folder first
                foreach ($record->files as $file) {
                    $fileId = $this->extractGoogleDriveFileId($file->file_url);
                    if ($fileId) {
                        try {
                            // Check if file exists before attempting delete
                            $service->files->get($fileId);
                            $service->files->delete($fileId);
                            Log::info("Successfully deleted Google Drive file: {$file->file_name}", [
                                'file_id' => $fileId,
                                'file_name' => $file->file_name,
                                'staff_id' => $record->staff_id,
                                'subject_id' => $record->subject_id,
                            ]);
                        } catch (\Google\Service\Exception $e) {
                            if ($e->getCode() === 404) {
                                Log::info("Google Drive file already deleted or not found: {$file->file_name}", [
                                    'file_id' => $fileId,
                                    'file_name' => $file->file_name,
                                ]);
                            } else {
                                Log::warning("Failed to delete Google Drive file {$file->file_name}: " . $e->getMessage(), [
                                    'file_id' => $fileId,
                                    'file_name' => $file->file_name,
                                    'error_code' => $e->getCode(),
                                ]);
                                $recordSuccess = false;
                            }
                        } catch (\Exception $e) {
                            Log::warning("Unexpected error deleting Google Drive file {$file->file_name}: " . $e->getMessage(), [
                                'file_id' => $fileId,
                                'file_name' => $file->file_name,
                                'error_type' => get_class($e),
                            ]);
                            $recordSuccess = false;
                        }
                    } else {
                        Log::warning("Could not extract file ID from URL for file: {$file->file_name}", [
                            'file_url' => $file->file_url,
                            'file_name' => $file->file_name,
                        ]);
                    }
                }

                // Delete the folder if it exists
                if ($record->gdrive_folder_id) {
                    try {
                        // Check if folder exists before attempting delete
                        $service->files->get($record->gdrive_folder_id);
                        $service->files->delete($record->gdrive_folder_id);
                        Log::info("Successfully deleted Google Drive folder: {$record->folder_name}", [
                            'folder_id' => $record->gdrive_folder_id,
                            'folder_name' => $record->folder_name,
                            'staff_id' => $record->staff_id,
                            'subject_id' => $record->subject_id,
                        ]);
                    } catch (\Google\Service\Exception $e) {
                        if ($e->getCode() === 404) {
                            Log::info("Google Drive folder already deleted or not found: {$record->folder_name}", [
                                'folder_id' => $record->gdrive_folder_id,
                                'folder_name' => $record->folder_name,
                            ]);
                        } else {
                            Log::warning("Failed to delete Google Drive folder {$record->folder_name}: " . $e->getMessage(), [
                                'folder_id' => $record->gdrive_folder_id,
                                'folder_name' => $record->folder_name,
                                'error_code' => $e->getCode(),
                            ]);
                            $recordSuccess = false;
                        }
                    } catch (\Exception $e) {
                        Log::warning("Unexpected error deleting Google Drive folder {$record->folder_name}: " . $e->getMessage(), [
                            'folder_id' => $record->gdrive_folder_id,
                            'folder_name' => $record->folder_name,
                            'error_type' => get_class($e),
                        ]);
                        $recordSuccess = false;
                    }
                } else {
                    Log::info("No Google Drive folder ID found for record {$record->id}, skipping folder deletion", [
                        'record_id' => $record->id,
                        'folder_name' => $record->folder_name,
                    ]);
                }

            } catch (\Exception $e) {
                Log::error("Critical error cleaning up Google Drive for record {$record->id}: " . $e->getMessage(), [
                    'record_id' => $record->id,
                    'staff_id' => $record->staff_id,
                    'subject_id' => $record->subject_id,
                    'error_type' => get_class($e),
                    'stack_trace' => $e->getTraceAsString(),
                ]);
                $recordSuccess = false;
            }

            if ($recordSuccess) {
                $successfulCleanups++;
            } else {
                $failedCleanups++;
            }
        }

        Log::info('Google Drive cleanup summary', [
            'total_records' => $recordsToDelete->count(),
            'successful_cleanups' => $successfulCleanups,
            'failed_cleanups' => $failedCleanups,
            'success_rate' => $recordsToDelete->count() > 0 ? round(($successfulCleanups / $recordsToDelete->count()) * 100, 2) . '%' : '0%',
        ]);
    }

    /**
     * Create authenticated Google Client
     */
    private function createAuthenticatedGoogleClient(): ?Client
    {
        try {
            $tokenRecord = GoogleDriveToken::getActiveToken();
            
            if (!$tokenRecord) {
                Log::warning('No Google Drive token record found in database', [
                    'suggestion' => 'Run Google Drive setup to configure authentication'
                ]);
                return null;
            }
            
            if (!$tokenRecord->refresh_token) {
                Log::warning('Google Drive token record exists but missing refresh token', [
                    'token_id' => $tokenRecord->id,
                    'suggestion' => 'Re-authenticate Google Drive to get new refresh token'
                ]);
                return null;
            }
            
            $client = $tokenRecord->getAuthenticatedClient();
            
            if (!$client) {
                Log::warning('Failed to create authenticated client from token record', [
                    'token_id' => $tokenRecord->id,
                    'suggestion' => 'Token may be expired or invalid, try re-authentication'
                ]);
                return null;
            }
            
            // Test the client by making a simple API call
            try {
                $service = new Drive($client);
                $service->about->get(['fields' => 'user']);
                Log::debug('Google Drive client successfully authenticated and tested');
            } catch (\Exception $e) {
                Log::warning('Google Drive client authentication test failed: ' . $e->getMessage(), [
                    'error_type' => get_class($e),
                    'suggestion' => 'Client may have expired credentials'
                ]);
                return null;
            }
            
            return $client;
            
        } catch (\Exception $e) {
            Log::error('Critical error creating authenticated Google Drive client: ' . $e->getMessage(), [
                'error_type' => get_class($e),
                'stack_trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Clean up all teacher work resources for a staff member before deletion
     */
    public function cleanupStaffWorkResources(Staff $staff): void
    {
        // Get all subject IDs that this staff member is associated with in teacher_subject_work
        $subjectIds = TeacherSubjectWork::where('staff_id', $staff->id)
            ->pluck('subject_id')
            ->unique()
            ->toArray();

        if (!empty($subjectIds)) {
            Log::info('Cleaning up all work resources for staff deletion', [
                'staff_id' => $staff->id,
                'staff_name' => $staff->name,
                'subject_ids' => $subjectIds,
                'reason' => 'staff_deletion'
            ]);

            // Use the existing cleanup method for all subjects
            $this->cleanupTeacherSubjectWork($staff->id, $subjectIds);
        } else {
            Log::info('No teacher work resources to clean up for staff deletion', [
                'staff_id' => $staff->id,
                'staff_name' => $staff->name,
            ]);
        }
    }

    /**
     * Extract Google Drive file ID from URL
     */
    private function extractGoogleDriveFileId(string $url): ?string
    {
        if (preg_match('/\/file\/d\/([a-zA-Z0-9\-_]+)\//', $url, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}