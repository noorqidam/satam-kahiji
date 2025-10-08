<?php

namespace App\Filesystem;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use League\Flysystem\Config;
use League\Flysystem\FileAttributes;
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\PathPrefixer;
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToReadFile;
use League\Flysystem\UnableToWriteFile;
use League\Flysystem\UrlGeneration\PublicUrlGenerator;
use League\Flysystem\StorageAttributes;

class GoogleDriveAdapter implements FilesystemAdapter, PublicUrlGenerator
{
    private Drive $service;
    private PathPrefixer $prefixer;
    private ?string $folderId;

    public function __construct(
        private Client $client,
        string $folderId = null,
        string $pathPrefix = ''
    ) {
        $this->service = new Drive($client);
        $this->prefixer = new PathPrefixer($pathPrefix);
        $this->folderId = $folderId;
    }

    public function fileExists(string $path): bool
    {
        try {
            $fileId = $this->getFileIdByPath($path);
            return $fileId !== null;
        } catch (\Exception) {
            return false;
        }
    }

    public function directoryExists(string $path): bool
    {
        return true; // Google Drive doesn't have traditional directories
    }

    public function write(string $path, string $contents, Config $config): void
    {
        try {
            $fileName = basename($path);
            
            $driveFile = new DriveFile();
            $driveFile->setName($fileName);
            
            if ($this->folderId) {
                $driveFile->setParents([$this->folderId]);
            }
            
            $result = $this->service->files->create(
                $driveFile,
                [
                    'data' => $contents,
                    'mimeType' => $this->getMimeType($fileName),
                    'uploadType' => 'multipart'
                ]
            );
            
            // Make file publicly readable
            $permission = new Permission();
            $permission->setRole('reader');
            $permission->setType('anyone');
            $this->service->permissions->create($result->getId(), $permission);
            
            // Store the file ID mapping for later retrieval
            $this->storeFileIdMapping($path, $result->getId());
            
        } catch (\Exception $e) {
            throw UnableToWriteFile::atLocation($path, $e->getMessage(), $e);
        }
    }
    
    private function storeFileIdMapping(string $path, string $fileId): void
    {
        // Store mapping in cache for quick lookup
        cache()->put("gdrive_file_id:" . $path, $fileId, now()->addDays(30));
    }
    
    private function getFileIdFromCache(string $path): ?string
    {
        return cache()->get("gdrive_file_id:" . $path);
    }

    public function writeStream(string $path, $contents, Config $config): void
    {
        $this->write($path, stream_get_contents($contents), $config);
    }

    public function read(string $path): string
    {
        try {
            $fileId = $this->getFileIdByPath($path);
            if (!$fileId) {
                throw new \Exception('File not found');
            }
            
            return $this->service->files->get($fileId, ['alt' => 'media']);
        } catch (\Exception $e) {
            throw UnableToReadFile::fromLocation($path, $e->getMessage(), $e);
        }
    }

    public function readStream(string $path)
    {
        $content = $this->read($path);
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $content);
        rewind($stream);
        return $stream;
    }

    public function delete(string $path): void
    {
        try {
            $fileId = $this->getFileIdByPath($path);
            if ($fileId) {
                $this->service->files->delete($fileId);
            }
        } catch (\Exception $e) {
            throw UnableToDeleteFile::atLocation($path, $e->getMessage(), $e);
        }
    }

    public function deleteDirectory(string $path): void
    {
        // Google Drive doesn't have traditional directories
    }

    public function createDirectory(string $path, Config $config): void
    {
        // Google Drive doesn't require directory creation
    }

    public function setVisibility(string $path, string $visibility): void
    {
        // Files are automatically made public in write method
    }

    public function visibility(string $path): FileAttributes
    {
        return new FileAttributes($path, null, 'public');
    }

    public function mimeType(string $path): FileAttributes
    {
        $mimeType = $this->getMimeType(basename($path));
        return new FileAttributes($path, null, null, null, $mimeType);
    }

    public function lastModified(string $path): FileAttributes
    {
        try {
            $fileId = $this->getFileIdByPath($path);
            if (!$fileId) {
                throw new \Exception('File not found');
            }
            
            $file = $this->service->files->get($fileId, ['fields' => 'modifiedTime']);
            $timestamp = strtotime($file->getModifiedTime());
            
            return new FileAttributes($path, null, null, $timestamp);
        } catch (\Exception) {
            return new FileAttributes($path, null, null, null);
        }
    }

    public function fileSize(string $path): FileAttributes
    {
        try {
            $fileId = $this->getFileIdByPath($path);
            if (!$fileId) {
                throw new \Exception('File not found');
            }
            
            $file = $this->service->files->get($fileId, ['fields' => 'size']);
            $size = (int) $file->getSize();
            
            return new FileAttributes($path, $size);
        } catch (\Exception) {
            return new FileAttributes($path, null);
        }
    }

    public function listContents(string $path, bool $deep): iterable
    {
        // Implementation for listing contents if needed
        return [];
    }

    public function move(string $source, string $destination, Config $config): void
    {
        // Implementation for moving files if needed
    }

    public function copy(string $source, string $destination, Config $config): void
    {
        // Implementation for copying files if needed
    }

    public function publicUrl(string $path, Config $config): string
    {
        // First try to get from cache
        $fileId = $this->getFileIdFromCache($path);
        
        // If not in cache, try to find by path
        if (!$fileId) {
            $fileId = $this->getFileIdByPath($path);
        }
        
        if (!$fileId) {
            // If we can't get the file ID, assume the path is already a URL or file ID
            if (str_starts_with($path, 'http')) {
                return $path;
            }
            // Assume the basename is the file ID
            return "https://drive.google.com/uc?id=" . basename($path);
        }
        
        return "https://drive.google.com/uc?id=" . $fileId;
    }

    private function getFileIdByPath(string $path): ?string
    {
        $fileName = basename($path);
        
        $query = "name='{$fileName}'";
        if ($this->folderId) {
            $query .= " and '{$this->folderId}' in parents";
        }
        
        try {
            $results = $this->service->files->listFiles([
                'q' => $query,
                'fields' => 'files(id, name)'
            ]);
            
            $files = $results->getFiles();
            return $files ? $files[0]->getId() : null;
        } catch (\Exception) {
            return null;
        }
    }

    private function getMimeType(string $fileName): string
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        return match ($extension) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'pdf' => 'application/pdf',
            'txt' => 'text/plain',
            'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'xml' => 'application/xml',
            'zip' => 'application/zip',
            default => 'application/octet-stream',
        };
    }
}