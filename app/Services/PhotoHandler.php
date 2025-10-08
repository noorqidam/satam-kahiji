<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\GoogleDriveToken;

class PhotoHandler
{
    /**
     * Create and authenticate Google Client using dynamic token system
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
     * Upload a photo to the profile-photos folder
     */
    public function store(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storeToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('profile-photos');
        return Storage::url($path);
    }

    /**
     * Upload an extracurricular photo to the Ekstrakurikuler Photos folder
     */
    public function storeExtracurricular(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storeExtracurricularToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('extracurriculars');
        return Storage::url($path);
    }

    /**
     * Upload a student photo to the Student Photos folder
     */
    public function storeStudent(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storeStudentToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('students');
        return Storage::url($path);
    }

    /**
     * Upload a post image to the Posts folder
     */
    public function storePost(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storePostToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('posts');
        return Storage::url($path);
    }

    /**
     * Upload a news image to the News folder
     */
    public function storeNews(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storeNewsToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('news');
        return Storage::url($path);
    }

    /**
     * Upload a page image to the Pages folder in Google Drive
     */
    public function storePage(UploadedFile $file): string
    {
        // Always use Google Drive for page images
        return $this->storePageToGoogleDrive($file);
    }

    /**
     * Upload a facility image to the Facilities folder
     */
    public function storeFacility(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storeFacilityToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('facilities');
        return Storage::url($path);
    }

    /**
     * Upload a student document to the Documents/Students Documents folder
     */
    public function storeStudentDocument(UploadedFile $file): string
    {
        // Always use Google Drive for student documents
        return $this->storeStudentDocumentToGoogleDrive($file);
    }
    
    /**
     * Store student photo directly to Google Drive in Student Photos folder
     */
    private function storeStudentToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            $service = new Drive($client);
            
            // Get or create "Student Photos" folder
            $studentPhotosFolderId = $this->getOrCreateStudentPhotosFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Student Photos folder as parent
            if ($studentPhotosFolderId) {
                $driveFile->setParents([$studentPhotosFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            // This format bypasses most CORS issues and loads faster
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for student photo: ' . $e->getMessage());
            $path = $file->store('students', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store extracurricular photo directly to Google Drive in Ekstrakurikuler Photos folder
     */
    private function storeExtracurricularToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            $service = new Drive($client);
            
            // Get or create "Ekstrakurikuler Photos" folder
            $ekstrakurikulerPhotosFolderId = $this->getOrCreateExtracurricularPhotosFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Ekstrakurikuler Photos folder as parent
            if ($ekstrakurikulerPhotosFolderId) {
                $driveFile->setParents([$ekstrakurikulerPhotosFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            // This format bypasses most CORS issues and loads faster
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for extracurricular photo: ' . $e->getMessage());
            $path = $file->store('extracurriculars', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store file directly to Google Drive in Staff Photos folder
     */
    private function storeToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            $service = new Drive($client);
            
            // Get or create "Staff Photos" folder
            $staffPhotosFolderId = $this->getOrCreateStaffPhotosFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Staff Photos folder as parent
            if ($staffPhotosFolderId) {
                $driveFile->setParents([$staffPhotosFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            // This format bypasses most CORS issues and loads faster
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed: ' . $e->getMessage());
            $path = $file->store('profile-photos', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Upload a gallery image to the Galleries folder (legacy method)
     */
    public function storeGallery(UploadedFile $file): string
    {
        // If using Google Drive, handle upload directly
        if (config('filesystems.default') === 'google_drive') {
            return $this->storeGalleryToGoogleDrive($file);
        }
        
        // For local storage
        $path = $file->store('galleries');
        return Storage::url($path);
    }

    /**
     * Upload a gallery item to specific gallery's items folder
     */
    public function storeGalleryItem(UploadedFile $file, string $galleryTitle, int $galleryId): string
    {
        // Always use Google Drive for gallery items with specific folder structure
        return $this->storeGalleryItemToGoogleDrive($file, $galleryTitle, $galleryId);
    }

    /**
     * Upload a gallery featured image to specific gallery folder
     */
    public function storeGalleryFeaturedImage(UploadedFile $file, string $galleryTitle, int $galleryId): string
    {
        // Always use Google Drive for gallery featured images
        return $this->storeGalleryFeaturedImageToGoogleDrive($file, $galleryTitle, $galleryId);
    }

    /**
     * Handle photo upload based on type
     */
    public function handlePhotoUpload(UploadedFile $file, string $type, ?array $context = null): string
    {
        return match ($type) {
            'students' => $this->storeStudent($file),
            'staff' => $this->store($file),
            'extracurriculars' => $this->storeExtracurricular($file),
            'posts' => $this->storePost($file),
            'news' => $this->storeNews($file),
            'pages' => $this->storePage($file),
            'facilities' => $this->storeFacility($file),
            'galleries' => $this->storeGallery($file),
            'gallery-item' => isset($context['gallery_title'], $context['gallery_id']) 
                ? $this->storeGalleryItem($file, $context['gallery_title'], $context['gallery_id'])
                : $this->storeGallery($file),
            'gallery-featured' => isset($context['gallery_title'], $context['gallery_id'])
                ? $this->storeGalleryFeaturedImage($file, $context['gallery_title'], $context['gallery_id'])
                : $this->storeGallery($file),
            'student-documents' => $this->storeStudentDocument($file),
            default => $this->store($file)
        };
    }

    /**
     * Update a photo, deleting the old one if it exists
     */
    public function update(UploadedFile $file, ?string $oldPhotoUrl = null, bool $deleteFromStorage = true): string
    {
        // Delete old photo if exists
        if ($oldPhotoUrl && $deleteFromStorage) {
            $this->delete($oldPhotoUrl);
        }

        // Store new photo
        return $this->store($file);
    }

    /**
     * Update a student photo, deleting the old one if it exists
     */
    public function updateStudent(UploadedFile $file, ?string $oldPhotoUrl = null, bool $deleteFromStorage = true): string
    {
        // Delete old photo if exists
        if ($oldPhotoUrl && $deleteFromStorage) {
            $this->deletePhoto($oldPhotoUrl, 'students');
        }

        // Store new photo
        return $this->storeStudent($file);
    }

    /**
     * Remove a photo (set to null) and optionally delete from storage
     */
    public function remove(?string $photoUrl, bool $deleteFromStorage = true): bool
    {
        if (!$photoUrl) {
            return true; // Nothing to remove
        }

        // Delete from storage if requested
        if ($deleteFromStorage) {
            return $this->delete($photoUrl);
        }

        return true; // Successfully "removed" (just from database)
    }

    /**
     * Delete a photo from storage with type specification
     */
    public function deletePhoto(?string $photoUrl, string $type): bool
    {
        if (!$photoUrl) {
            Log::warning('deletePhoto called with empty photoUrl');
            return false;
        }

        Log::info('deletePhoto called', [
            'url' => $photoUrl,
            'type' => $type,
            'is_google_drive' => (str_contains($photoUrl, 'drive.google.com') || str_contains($photoUrl, 'googleusercontent.com'))
        ]);

        // Handle Google Drive URLs
        if (str_contains($photoUrl, 'drive.google.com') || str_contains($photoUrl, 'googleusercontent.com')) {
            Log::info('Detected Google Drive URL, calling deleteFromGoogleDrive');
            $result = $this->deleteFromGoogleDrive($photoUrl);
            Log::info('deleteFromGoogleDrive result: ' . ($result ? 'success' : 'failed'));
            return $result;
        }

        // Extract path from URL if it's a full local URL, otherwise use as-is
        $photoPath = $this->extractPathByType($photoUrl, $type);
        
        Log::info('Extracted local path: ' . ($photoPath ?? 'null'));
        
        if ($photoPath) {
            $result = Storage::delete($photoPath);
            Log::info('Storage::delete result: ' . ($result ? 'success' : 'failed'));
            return $result;
        }

        Log::warning('Could not extract path from URL: ' . $photoUrl);
        return false;
    }

    /**
     * Delete entire gallery folder and all its contents
     */
    public function deleteGalleryFolder(string $galleryTitle, int $galleryId): bool
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                Log::error('Unable to authenticate with Google Drive for gallery folder deletion');
                return false;
            }
            
            $service = new Drive($client);
            
            // Get galleries folder
            $galleriesFolderId = $this->getOrCreateGalleriesFolder($service);
            if (!$galleriesFolderId) {
                Log::warning('Galleries folder not found, nothing to delete');
                return true; // Consider this successful since folder doesn't exist
            }
            
            // Find the specific gallery folder (use just gallery title as folder name)
            $galleryFolderName = $this->sanitizeGalleryFolderName($galleryTitle);
            
            $query = "name='{$galleryFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleriesFolderId}' in parents";
            
            $results = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            $files = $results->getFiles();
            
            if (empty($files)) {
                Log::info('Gallery folder not found', [
                    'gallery_title' => $galleryTitle,
                    'gallery_id' => $galleryId,
                    'folder_name' => $galleryFolderName,
                    'search_query' => $query
                ]);
                return false; // Return false so controller falls back to individual file deletion
            }
            
            $galleryFolderId = $files[0]->getId();
            
            // Delete the entire gallery folder (this will delete all contents recursively)
            $service->files->delete($galleryFolderId);
            
            Log::info('Successfully deleted gallery folder from Google Drive', [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'folder_name' => $galleryFolderName,
                'folder_id' => $galleryFolderId
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to delete gallery folder from Google Drive: ' . $e->getMessage(), [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId
            ]);
            return false;
        }
    }

    /**
     * Rename gallery folder when gallery title changes
     */
    public function renameGalleryFolder(string $oldTitle, string $newTitle, int $galleryId): bool
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                Log::error('Unable to authenticate with Google Drive for gallery folder rename');
                return false;
            }
            
            $service = new Drive($client);
            
            // Get galleries folder
            $galleriesFolderId = $this->getOrCreateGalleriesFolder($service);
            if (!$galleriesFolderId) {
                Log::warning('Galleries folder not found, cannot rename gallery folder');
                return false;
            }
            
            // Find the existing gallery folder using old title
            $oldFolderName = $this->sanitizeGalleryFolderName($oldTitle);
            $newFolderName = $this->sanitizeGalleryFolderName($newTitle);
            
            // If sanitized names are the same, no need to rename
            if ($oldFolderName === $newFolderName) {
                Log::info('Gallery folder names are the same after sanitization, no rename needed', [
                    'old_title' => $oldTitle,
                    'new_title' => $newTitle,
                    'sanitized_name' => $newFolderName
                ]);
                return true;
            }
            
            // First, try to find the folder using the old title
            $query = "name='{$oldFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleriesFolderId}' in parents";
            
            $results = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            $files = $results->getFiles();
            
            // If not found by old title, try to find by searching all folders and matching gallery ID or other criteria
            if (empty($files)) {
                Log::info('Folder not found by old title, searching all gallery folders', [
                    'old_title' => $oldTitle,
                    'old_folder_name' => $oldFolderName,
                    'gallery_id' => $galleryId
                ]);
                
                // Get all folders in Galleries and try to find the most likely match
                $allFoldersQuery = "mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleriesFolderId}' in parents";
                $allResults = $service->files->listFiles([
                    'q' => $allFoldersQuery,
                    'fields' => 'files(id, name)'
                ]);
                
                $allFolders = $allResults->getFiles();
                
                Log::info('All gallery folders found', [
                    'folder_count' => count($allFolders),
                    'folders' => array_map(fn($f) => ['id' => $f->getId(), 'name' => $f->getName()], $allFolders)
                ]);
                
                // For now, if there's only one folder, assume it's the one we want to rename
                // This handles the case where the folder was created with a different title
                if (count($allFolders) === 1) {
                    $files = $allFolders;
                    Log::info('Using single folder found as target for rename', [
                        'folder_name' => $allFolders[0]->getName(),
                        'folder_id' => $allFolders[0]->getId()
                    ]);
                } else {
                    Log::warning('Multiple or no folders found, cannot determine which to rename', [
                        'old_title' => $oldTitle,
                        'new_title' => $newTitle,
                        'gallery_id' => $galleryId,
                        'folder_count' => count($allFolders)
                    ]);
                    return false;
                }
            }
            
            $galleryFolderId = $files[0]->getId();
            
            // Check if a folder with the new name already exists
            $newNameQuery = "name='{$newFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleriesFolderId}' in parents";
            $newNameResults = $service->files->listFiles([
                'q' => $newNameQuery,
                'fields' => 'files(id, name)'
            ]);
            
            if (!empty($newNameResults->getFiles())) {
                Log::warning('A folder with the new name already exists', [
                    'old_title' => $oldTitle,
                    'new_title' => $newTitle,
                    'new_folder_name' => $newFolderName,
                    'gallery_id' => $galleryId
                ]);
                return false;
            }
            
            // Create DriveFile object with new name
            $fileMetadata = new DriveFile();
            $fileMetadata->setName($newFolderName);
            
            // Update the folder name
            $service->files->update($galleryFolderId, $fileMetadata);
            
            Log::info('Successfully renamed gallery folder in Google Drive', [
                'old_title' => $oldTitle,
                'new_title' => $newTitle,
                'gallery_id' => $galleryId,
                'old_folder_name' => $oldFolderName,
                'new_folder_name' => $newFolderName,
                'folder_id' => $galleryFolderId
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to rename gallery folder in Google Drive: ' . $e->getMessage(), [
                'old_title' => $oldTitle,
                'new_title' => $newTitle,
                'gallery_id' => $galleryId,
                'error_trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * List all gallery folders in Google Drive for debugging
     */
    public function listGalleryFolders(): array
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                Log::error('Unable to authenticate with Google Drive for listing folders');
                return [];
            }
            
            $service = new Drive($client);
            
            // Get galleries folder
            $galleriesFolderId = $this->getOrCreateGalleriesFolder($service);
            if (!$galleriesFolderId) {
                Log::warning('Galleries folder not found');
                return [];
            }
            
            // List all folders in the Galleries directory
            $query = "mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleriesFolderId}' in parents";
            
            $results = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name, createdTime, modifiedTime)'
            ]);
            
            $folders = [];
            foreach ($results->getFiles() as $file) {
                $folders[] = [
                    'id' => $file->getId(),
                    'name' => $file->getName(),
                    'created' => $file->getCreatedTime(),
                    'modified' => $file->getModifiedTime()
                ];
            }
            
            Log::info('Gallery folders in Google Drive', [
                'galleries_folder_id' => $galleriesFolderId,
                'folder_count' => count($folders),
                'folders' => $folders
            ]);
            
            return $folders;
            
        } catch (\Exception $e) {
            Log::error('Failed to list gallery folders: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Delete a photo from storage
     */
    public function delete(?string $photoUrl, bool $deleteFromStorage = true): bool
    {
        if (!$photoUrl) {
            return false;
        }

        // If deleteFromStorage is false, just return true (database-only deletion)
        if (!$deleteFromStorage) {
            return true;
        }

        // Handle Google Drive URLs
        if (str_contains($photoUrl, 'drive.google.com') || str_contains($photoUrl, 'googleusercontent.com')) {
            return $this->deleteFromGoogleDrive($photoUrl);
        }

        // Extract path from URL if it's a full local URL, otherwise use as-is
        $photoPath = $this->extractPath($photoUrl);
        
        if ($photoPath) {
            return Storage::delete($photoPath);
        }

        return false;
    }
    
    /**
     * Store post image directly to Google Drive in Posts folder
     */
    private function storePostToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create "Posts" folder
            $postsFolderId = $this->getOrCreatePostsFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Posts folder as parent
            if ($postsFolderId) {
                $driveFile->setParents([$postsFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for post image: ' . $e->getMessage());
            $path = $file->store('posts', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store news image directly to Google Drive in News folder
     */
    private function storeNewsToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            $service = new Drive($client);
            
            // Get or create "News" folder
            $newsFolderId = $this->getOrCreateNewsFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set News folder as parent
            if ($newsFolderId) {
                $driveFile->setParents([$newsFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for news image: ' . $e->getMessage());
            $path = $file->store('news', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store facility image directly to Google Drive in Facilities folder
     */
    private function storeFacilityToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create "Facilities" folder
            $facilitiesFolderId = $this->getOrCreateFacilitiesFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Facilities folder as parent
            if ($facilitiesFolderId) {
                $driveFile->setParents([$facilitiesFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for facility image: ' . $e->getMessage());
            $path = $file->store('facilities', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store page image directly to Google Drive in Pages folder
     */
    private function storePageToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create "Pages" folder
            $pagesFolderId = $this->getOrCreatePagesFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Pages folder as parent
            if ($pagesFolderId) {
                $driveFile->setParents([$pagesFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error but don't fall back to local storage for pages
            Log::error('Google Drive upload failed for page image: ' . $e->getMessage());
            throw new \RuntimeException('Failed to upload page image to Google Drive: ' . $e->getMessage());
        }
    }

    /**
     * Store student document directly to Google Drive in Documents/Students Documents folder
     */
    private function storeStudentDocumentToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create "Documents/Students Documents" folder
            $studentDocumentsFolderId = $this->getOrCreateStudentDocumentsFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Students Documents folder as parent
            if ($studentDocumentsFolderId) {
                $driveFile->setParents([$studentDocumentsFolderId]);
            }
            
            // Upload file
            $result = $service->files->create(
                $driveFile,
                [
                    'data' => file_get_contents($file->getPathname()),
                    'mimeType' => $file->getMimeType(),
                    'uploadType' => 'multipart'
                ]
            );
            
            // Make file publicly readable for download
            $permission = new Permission();
            $permission->setRole('reader');
            $permission->setType('anyone');
            $service->permissions->create($result->getId(), $permission);
            
            Log::info('Uploaded student document to Google Drive', [
                'file_name' => $fileName,
                'file_id' => $result->getId()
            ]);
            
            // Return the direct download URL for documents
            return "https://drive.google.com/uc?id=" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and throw exception for student documents (don't fall back to local)
            Log::error('Google Drive upload failed for student document: ' . $e->getMessage());
            throw new \RuntimeException('Failed to upload student document to Google Drive: ' . $e->getMessage());
        }
    }

    /**
     * Store gallery image directly to Google Drive in Galleries folder (legacy method)
     */
    private function storeGalleryToGoogleDrive(UploadedFile $file): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create "Galleries" folder
            $galleriesFolderId = $this->getOrCreateGalleriesFolder($service);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set Galleries folder as parent
            if ($galleriesFolderId) {
                $driveFile->setParents([$galleriesFolderId]);
            }
            
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
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for gallery image: ' . $e->getMessage());
            $path = $file->store('galleries', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store gallery item to specific gallery's items folder in Google Drive
     */
    private function storeGalleryItemToGoogleDrive(UploadedFile $file, string $galleryTitle, int $galleryId): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create gallery-specific items folder: Galleries/{Gallery Title}/items/
            $galleryItemsFolderId = $this->getOrCreateGalleryItemsFolder($service, $galleryTitle, $galleryId);
            
            // Generate unique filename
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set gallery items folder as parent
            if ($galleryItemsFolderId) {
                $driveFile->setParents([$galleryItemsFolderId]);
            }
            
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
            
            Log::info('Uploaded gallery item to Google Drive', [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'file_name' => $fileName,
                'file_id' => $result->getId()
            ]);
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log error and fall back to local storage
            Log::error('Google Drive upload failed for gallery item: ' . $e->getMessage(), [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'file_name' => $file->getClientOriginalName()
            ]);
            $path = $file->store('galleries', 'public');
            return Storage::url($path);
        }
    }

    /**
     * Store gallery featured image to specific gallery folder in Google Drive
     */
    private function storeGalleryFeaturedImageToGoogleDrive(UploadedFile $file, string $galleryTitle, int $galleryId): string
    {
        try {
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                throw new \RuntimeException('Unable to authenticate with Google Drive');
            }
            $service = new Drive($client);
            
            // Get or create gallery-specific folder: Galleries/{Gallery Title}/
            $galleryFolderId = $this->getOrCreateSpecificGalleryFolder($service, $galleryTitle, $galleryId);
            
            if (!$galleryFolderId) {
                throw new \RuntimeException('Failed to create or access gallery folder for featured image upload');
            }
            
            Log::info('Using gallery folder for featured image upload', [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'folder_id' => $galleryFolderId
            ]);
            
            // Generate unique filename for featured image
            $fileName = 'featured_' . time() . '_' . $file->getClientOriginalName();
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            // Set gallery folder as parent
            if ($galleryFolderId) {
                $driveFile->setParents([$galleryFolderId]);
            }
            
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
            
            Log::info('Uploaded gallery featured image to Google Drive', [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'file_name' => $fileName,
                'file_id' => $result->getId()
            ]);
            
            // Return the lh3.googleusercontent.com URL which is most reliable for image embedding
            return "https://lh3.googleusercontent.com/d/" . $result->getId();
            
        } catch (\Exception $e) {
            // Log detailed error information
            Log::error('Google Drive upload failed for gallery featured image', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize()
            ]);
            
            // Don't fall back to local storage for gallery images - throw the error
            throw new \RuntimeException('Failed to upload featured image to Google Drive: ' . $e->getMessage(), 0, $e);
        }
    }
    
    /**
     * Get or create Student Photos folder in Google Drive
     */
    private function getOrCreateStudentPhotosFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Student Photos" folder
            $query = "name='Student Photos' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Student Photos" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Student Photos');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Student Photos folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Student Photos folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Ekstrakurikuler Photos folder in Google Drive
     */
    public function getOrCreateExtracurricularPhotosFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Ekstrakurikuler Photos" folder
            $query = "name='Ekstrakurikuler Photos' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Ekstrakurikuler Photos" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Ekstrakurikuler Photos');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Ekstrakurikuler Photos folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Ekstrakurikuler Photos folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Staff Photos folder in Google Drive
     */
    private function getOrCreateStaffPhotosFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Staff Photos" folder
            $query = "name='Staff Photos' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Staff Photos" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Staff Photos');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Staff Photos folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Staff Photos folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Posts folder in Google Drive
     */
    private function getOrCreatePostsFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Posts" folder
            $query = "name='Posts' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Posts" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Posts');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Posts folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Posts folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create News folder in Google Drive
     */
    private function getOrCreateNewsFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "News" folder
            $query = "name='News' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "News" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('News');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created News folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create News folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Facilities folder in Google Drive
     */
    private function getOrCreateFacilitiesFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Facilities" folder
            $query = "name='Facilities' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Facilities" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Facilities');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Facilities folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Facilities folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Pages folder in Google Drive
     */
    private function getOrCreatePagesFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Pages" folder
            $query = "name='Pages' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Pages" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Pages');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Pages folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Pages folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Galleries folder in Google Drive
     */
    private function getOrCreateGalleriesFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Galleries" folder
            $query = "name='Galleries' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Galleries" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Galleries');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Galleries folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Galleries folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Documents/Students Documents folder structure in Google Drive
     */
    private function getOrCreateStudentDocumentsFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // First, get or create "Documents" folder
            $documentsFolderId = $this->getOrCreateDocumentsFolder($service);
            if (!$documentsFolderId) {
                throw new \RuntimeException('Could not create or access Documents folder');
            }
            
            // Then, get or create "Students Documents" folder inside Documents
            $query = "name='Students Documents' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{$documentsFolderId}' in parents";
            
            $results = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            $files = $results->getFiles();
            
            // If folder exists, return its ID
            if (!empty($files)) {
                return $files[0]->getId();
            }
            
            // Create new "Students Documents" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Students Documents');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            $folderMetadata->setParents([$documentsFolderId]);
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Students Documents folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Students Documents folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create Documents folder in Google Drive
     */
    private function getOrCreateDocumentsFolder(Drive $service): ?string
    {
        try {
            $parentFolderId = config('filesystems.disks.google_drive.folder_id');
            
            // Search for existing "Documents" folder
            $query = "name='Documents' and mimeType='application/vnd.google-apps.folder' and trashed=false";
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
            
            // Create new "Documents" folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('Documents');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            
            // Set parent folder if configured
            if ($parentFolderId) {
                $folderMetadata->setParents([$parentFolderId]);
            }
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created Documents folder in Google Drive with ID: ' . $folder->getId());
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create Documents folder: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get or create specific gallery folder: Galleries/{Gallery Title}/
     */
    private function getOrCreateSpecificGalleryFolder(Drive $service, string $galleryTitle, int $galleryId): ?string
    {
        try {
            // Get or create main Galleries folder first
            $galleriesFolderId = $this->getOrCreateGalleriesFolder($service);
            if (!$galleriesFolderId) {
                Log::error('Failed to get main Galleries folder ID');
                throw new \RuntimeException('Could not create or access Galleries folder');
            }
            
            Log::info('Got main Galleries folder', [
                'galleries_folder_id' => $galleriesFolderId,
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId
            ]);
            
            // Use gallery title as folder name (without ID)
            $galleryFolderName = $this->sanitizeGalleryFolderName($galleryTitle);
            
            // Search for existing gallery folder
            $query = "name='{$galleryFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleriesFolderId}' in parents";
            
            $results = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            $files = $results->getFiles();
            
            Log::info('Gallery folder search results', [
                'files_found' => count($files),
                'search_query' => $query
            ]);
            
            // If folder exists, return its ID
            if (!empty($files)) {
                Log::info('Found existing gallery folder', [
                    'folder_name' => $galleryFolderName,
                    'folder_id' => $files[0]->getId()
                ]);
                return $files[0]->getId();
            }
            
            Log::info('Gallery folder not found, creating new one', [
                'folder_name' => $galleryFolderName
            ]);
            
            // Create new gallery folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName($galleryFolderName);
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            $folderMetadata->setParents([$galleriesFolderId]);
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created gallery folder in Google Drive', [
                'folder_name' => $galleryFolderName,
                'folder_id' => $folder->getId(),
                'parent_id' => $galleriesFolderId
            ]);
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create gallery folder: ' . $e->getMessage(), [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId
            ]);
            return null;
        }
    }

    /**
     * Get or create gallery items folder: Galleries/{Gallery Title}/items/
     */
    private function getOrCreateGalleryItemsFolder(Drive $service, string $galleryTitle, int $galleryId): ?string
    {
        try {
            // Get or create gallery folder first
            $galleryFolderId = $this->getOrCreateSpecificGalleryFolder($service, $galleryTitle, $galleryId);
            if (!$galleryFolderId) {
                throw new \RuntimeException('Could not create or access gallery folder');
            }
            
            // Search for existing items folder
            $query = "name='items' and mimeType='application/vnd.google-apps.folder' and trashed=false and '{$galleryFolderId}' in parents";
            
            $results = $service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            $files = $results->getFiles();
            
            // If folder exists, return its ID
            if (!empty($files)) {
                return $files[0]->getId();
            }
            
            // Create new items folder
            $folderMetadata = new DriveFile();
            $folderMetadata->setName('items');
            $folderMetadata->setMimeType('application/vnd.google-apps.folder');
            $folderMetadata->setParents([$galleryFolderId]);
            
            $folder = $service->files->create($folderMetadata, [
                'fields' => 'id'
            ]);
            
            Log::info('Created gallery items folder in Google Drive', [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId,
                'items_folder_id' => $folder->getId(),
                'parent_id' => $galleryFolderId
            ]);
            
            return $folder->getId();
            
        } catch (\Exception $e) {
            Log::error('Failed to get or create gallery items folder: ' . $e->getMessage(), [
                'gallery_title' => $galleryTitle,
                'gallery_id' => $galleryId
            ]);
            return null;
        }
    }

    /**
     * Sanitize gallery folder name for Google Drive
     */
    private function sanitizeGalleryFolderName(string $name): string
    {
        // Remove or replace characters that might cause issues in Google Drive folder names
        $sanitized = preg_replace('/["\*:<>?\|\/\\\\]/', '', $name); // Remove invalid chars
        $sanitized = preg_replace('/\s+/', ' ', $sanitized); // Normalize spaces
        return trim($sanitized);
    }

    /**
     * Delete file from Google Drive
     */
    private function deleteFromGoogleDrive(string $photoUrl): bool
    {
        try {
            Log::info('Attempting to delete from Google Drive: ' . $photoUrl);
            
            $fileId = $this->extractGoogleDriveFileId($photoUrl);
            if (!$fileId) {
                Log::error('Could not extract file ID from Google Drive URL: ' . $photoUrl);
                return false;
            }
            
            Log::info('Extracted Google Drive file ID: ' . $fileId);
            
            $client = $this->createAuthenticatedGoogleClient();
            if (!$client) {
                Log::error('Failed to create authenticated Google Drive client for deletion');
                return false;
            }
            
            $service = new Drive($client);
            $service->files->delete($fileId);
            
            Log::info('Successfully deleted file from Google Drive: ' . $fileId);
            return true;
            
        } catch (\Exception $e) {
            Log::error('Google Drive delete failed for URL: ' . $photoUrl . ' - Error: ' . $e->getMessage());
            Log::error('Google Drive delete exception trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Extract the storage path from a photo URL with type specification
     */
    private function extractPathByType(string $photoUrl, string $type): ?string
    {
        $folder = match ($type) {
            'students' => 'students',
            'staff' => 'profile-photos',
            'extracurriculars' => 'extracurriculars',
            'posts' => 'posts',
            'news' => 'news',
            'pages' => 'pages',
            'facilities' => 'facilities',
            'galleries' => 'galleries',
            'gallery-item' => 'galleries', // gallery items go in galleries folder for local storage fallback
            'gallery-featured' => 'galleries', // gallery featured images go in galleries folder for local storage fallback
            'student-documents' => 'student-documents',
            default => 'profile-photos'
        };

        // If it's a full URL (Google Drive or other external storage)
        if (str_starts_with($photoUrl, 'http')) {
            // For Google Drive URLs, extract the file ID and construct path
            if (str_contains($photoUrl, 'drive.google.com')) {
                $fileId = $this->extractGoogleDriveFileId($photoUrl);
                return $fileId ? "{$folder}/{$fileId}" : null;
            }
            // For other external URLs, extract filename from URL
            return $folder . '/' . basename(parse_url($photoUrl, PHP_URL_PATH));
        }

        // If it's a local storage URL (/storage/...)
        if (str_starts_with($photoUrl, '/storage/')) {
            return str_replace('/storage/', '', $photoUrl);
        }

        // If it's already a path
        return str_starts_with($photoUrl, $folder . '/') ? $photoUrl : "{$folder}/{$photoUrl}";
    }

    /**
     * Extract the storage path from a photo URL
     */
    private function extractPath(string $photoUrl): ?string
    {
        // If it's a full URL (Google Drive or other external storage)
        if (str_starts_with($photoUrl, 'http')) {
            // For Google Drive URLs, extract the file ID and construct path
            if (str_contains($photoUrl, 'drive.google.com')) {
                $fileId = $this->extractGoogleDriveFileId($photoUrl);
                return $fileId ? "profile-photos/{$fileId}" : null;
            }
            // For other external URLs, extract filename from URL
            return 'profile-photos/' . basename(parse_url($photoUrl, PHP_URL_PATH));
        }

        // If it's a local storage URL (/storage/...)
        if (str_starts_with($photoUrl, '/storage/')) {
            return str_replace('/storage/', '', $photoUrl);
        }

        // If it's already a path
        return str_starts_with($photoUrl, 'profile-photos/') ? $photoUrl : "profile-photos/{$photoUrl}";
    }

    /**
     * Extract Google Drive file ID from URL
     */
    private function extractGoogleDriveFileId(string $url): ?string
    {
        // Handle URLs like: https://lh3.googleusercontent.com/d/FILE_ID
        if (preg_match('/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }

        // Handle URLs like: https://drive.google.com/uc?id=FILE_ID
        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }

        // Handle URLs like: https://drive.google.com/file/d/FILE_ID/view
        if (preg_match('/\/file\/d\/([a-zA-Z0-9_-]+)\//', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Check if a photo exists in storage
     */
    public function exists(?string $photoUrl): bool
    {
        if (!$photoUrl) {
            return false;
        }

        $photoPath = $this->extractPath($photoUrl);
        return $photoPath ? Storage::exists($photoPath) : false;
    }
}