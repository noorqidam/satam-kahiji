<?php

namespace App\Services;

use App\Models\Gallery;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class GalleryDriveService
{
    private $disk;
    
    public function __construct()
    {
        $this->disk = Storage::disk('google_drive');
    }

    /**
     * Create or get the main Galleries folder
     */
    public function getOrCreateGalleriesFolder(): string
    {
        $folderPath = 'Galleries';
        
        if (!$this->disk->exists($folderPath)) {
            $this->disk->makeDirectory($folderPath);
        }
        
        return $this->getFolderId($folderPath);
    }

    /**
     * Create a folder for a specific gallery
     */
    public function createGalleryFolder(Gallery $gallery): string
    {
        // Ensure main Galleries folder exists
        $this->getOrCreateGalleriesFolder();
        
        // Create folder using just gallery title
        $folderName = $this->sanitizeFolderName($gallery->title);
        $folderPath = "Galleries/{$folderName}";
        
        if (!$this->disk->exists($folderPath)) {
            $this->disk->makeDirectory($folderPath);
        }
        
        return $this->getFolderId($folderPath);
    }

    /**
     * Upload a file to a gallery's folder
     */
    public function uploadToGallery(Gallery $gallery, UploadedFile $file, ?string $customName = null): array
    {
        // Ensure gallery has a Google Drive folder
        if (!$gallery->google_drive_folder_id) {
            $folderId = $this->createGalleryFolder($gallery);
            $gallery->update(['google_drive_folder_id' => $folderId]);
        }

        // Generate unique filename
        $fileName = $customName ?: $this->generateUniqueFileName($file);
        $folderName = $this->getGalleryFolderName($gallery);
        $filePath = "Galleries/{$folderName}/{$fileName}";

        // Upload file
        $this->disk->putFileAs("Galleries/{$folderName}", $file, $fileName);
        
        // Get file metadata
        $fileId = $this->getFileId($filePath);
        $publicUrl = $this->getPublicUrl($filePath);

        $result = [
            'file_id' => $fileId,
            'file_path' => $publicUrl,
            'file_name' => $fileName,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => $this->getFileType($file->getMimeType()),
        ];

        // Add thumbnail URL for images
        if ($this->getFileType($file->getMimeType()) === 'image') {
            $result['thumbnail_url'] = $this->getThumbnailUrl($publicUrl);
            // For better image display, also provide a direct download URL
            $result['direct_url'] = $this->getDirectDownloadUrl($publicUrl);
        }

        return $result;
    }

    /**
     * List files in a gallery's folder
     */
    public function getGalleryFiles(Gallery $gallery): array
    {
        if (!$gallery->google_drive_folder_id) {
            return [];
        }

        $folderName = $this->getGalleryFolderName($gallery);
        $folderPath = "Galleries/{$folderName}";

        if (!$this->disk->exists($folderPath)) {
            return [];
        }

        $files = $this->disk->files($folderPath);
        $fileList = [];

        foreach ($files as $filePath) {
            $fileName = basename($filePath);
            $fileId = $this->getFileId($filePath);
            $publicUrl = $this->getPublicUrl($filePath);
            
            // Get file metadata (this would need to be enhanced with actual Google Drive API calls)
            $fileList[] = [
                'file_id' => $fileId,
                'file_path' => $publicUrl,
                'file_name' => $fileName,
                'type' => $this->getFileTypeFromPath($fileName),
                'thumbnail' => $this->getThumbnailUrl($publicUrl),
            ];
        }

        return $fileList;
    }

    /**
     * Delete a file from gallery folder
     */
    public function deleteFromGallery(Gallery $gallery, string $fileName): bool
    {
        $folderName = $this->getGalleryFolderName($gallery);
        $filePath = "Galleries/{$folderName}/{$fileName}";

        if ($this->disk->exists($filePath)) {
            return $this->disk->delete($filePath);
        }

        return false;
    }

    /**
     * Delete entire gallery folder
     */
    public function deleteGalleryFolder(Gallery $gallery): bool
    {
        if (!$gallery->google_drive_folder_id) {
            return true; // Already doesn't exist
        }

        $folderName = $this->getGalleryFolderName($gallery);
        $folderPath = "Galleries/{$folderName}";

        if ($this->disk->exists($folderPath)) {
            return $this->disk->deleteDirectory($folderPath);
        }

        return true;
    }

    /**
     * Get gallery folder name
     */
    private function getGalleryFolderName(Gallery $gallery): string
    {
        return $this->sanitizeFolderName($gallery->title);
    }

    /**
     * Sanitize folder name for Google Drive
     */
    private function sanitizeFolderName(string $name): string
    {
        // Remove or replace characters that might cause issues in Google Drive folder names
        $sanitized = preg_replace('/["\*:<>?\|\/\\]/', '', $name); // Remove invalid chars
        $sanitized = preg_replace('/\s+/', ' ', $sanitized); // Normalize spaces
        return trim($sanitized);
    }

    /**
     * Generate unique filename
     */
    private function generateUniqueFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $baseName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $baseName = Str::slug($baseName);
        
        return $baseName . '-' . time() . '.' . $extension;
    }

    /**
     * Get file type from mime type
     */
    private function getFileType(string $mimeType): string
    {
        if (strpos($mimeType, 'image/') === 0) {
            return 'image';
        } elseif (strpos($mimeType, 'video/') === 0) {
            return 'video';
        }
        return 'other';
    }

    /**
     * Get file type from file path
     */
    private function getFileTypeFromPath(string $fileName): string
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
        $videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'];
        
        if (in_array($extension, $imageExtensions)) {
            return 'image';
        } elseif (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        
        return 'other';
    }

    /**
     * Get folder ID from path (this would need actual implementation with Google Drive API)
     */
    private function getFolderId(string $path): string
    {
        // This is a simplified version - in reality, you'd use the Google Drive adapter
        // to get the actual folder ID
        return 'folder_' . md5($path);
    }

    /**
     * Get file ID from path (this would need actual implementation with Google Drive API)
     */
    private function getFileId(string $path): string
    {
        // This is a simplified version - in reality, you'd use the Google Drive adapter
        // to get the actual file ID
        return 'file_' . md5($path);
    }

    /**
     * Get public URL for a file path - optimized for display
     */
    private function getPublicUrl(string $path): string
    {
        // Get file ID and generate optimized URL for display
        $fileId = $this->getFileId($path);
        $cleanFileId = str_replace('file_', '', $fileId);
        
        // Use lh3.googleusercontent.com format for better display performance
        return "https://lh3.googleusercontent.com/d/" . $cleanFileId;
    }
    
    /**
     * Get Google Drive view URL for a file
     */
    public function getViewUrl(string $fileId): string
    {
        return "https://drive.google.com/file/d/" . $fileId . "/view";
    }
    
    /**
     * Get optimized display URL for a file
     */
    public function getDisplayUrl(string $fileId): string
    {
        return "https://lh3.googleusercontent.com/d/" . $fileId;
    }

    /**
     * Get thumbnail URL for Google Drive file - optimized for display
     */
    private function getThumbnailUrl(string $publicUrl): string
    {
        // Extract file ID from the optimized lh3 URL or standard Google Drive URL
        if (preg_match('/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9\-_]+)/', $publicUrl, $matches)) {
            $fileId = $matches[1];
            // Use lh3 format with size parameter for better thumbnail quality
            return "https://lh3.googleusercontent.com/d/{$fileId}=w600-h400-c";
        } elseif (preg_match('/\/d\/([a-zA-Z0-9\-_]+)/', $publicUrl, $matches)) {
            $fileId = $matches[1];
            // Use lh3 format with size parameter for better thumbnail quality
            return "https://lh3.googleusercontent.com/d/{$fileId}=w600-h400-c";
        }
        
        return $publicUrl;
    }
    
    /**
     * Get optimized thumbnail URL for a file ID
     */
    public function getThumbnailUrlFromId(string $fileId, int $width = 600, int $height = 400): string
    {
        return "https://lh3.googleusercontent.com/d/{$fileId}=w{$width}-h{$height}-c";
    }

    /**
     * Get direct download URL for Google Drive file (for better image display)
     */
    private function getDirectDownloadUrl(string $publicUrl): string
    {
        // Extract file ID from Google Drive URL and create direct download URL
        if (preg_match('/\/d\/([a-zA-Z0-9\-_]+)/', $publicUrl, $matches)) {
            $fileId = $matches[1];
            return "https://drive.google.com/uc?id={$fileId}&export=download";
        }
        
        return $publicUrl;
    }
}