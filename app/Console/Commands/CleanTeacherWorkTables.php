<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TeacherSubjectWork;
use App\Models\TeacherWorkFile;
use App\Models\GoogleDriveToken;
use Google\Client;
use Google\Service\Drive;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanTeacherWorkTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'work-items:clean-tables {--dry-run : Show what would be deleted without making changes} {--keep-files : Keep Google Drive files, only clean database tables} {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up teacher_subject_work and teacher_work_files tables and associated Google Drive files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $keepFiles = $this->option('keep-files');
        
        $this->info('Cleaning teacher work tables and Google Drive files...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE: No changes will be made');
        }
        
        if ($keepFiles) {
            $this->info('KEEP FILES MODE: Google Drive files will be preserved');
        }
        
        try {
            $this->displayCurrentData();
            
            if (!$this->confirmCleanup($dryRun)) {
                $this->info('Cleanup cancelled');
                return Command::SUCCESS;
            }
            
            $deletedFiles = 0;
            $deletedFolders = 0;
            $deletedRecords = 0;
            
            if (!$keepFiles) {
                // Clean up Google Drive files and folders first
                [$deletedFiles, $deletedFolders] = $this->cleanupGoogleDriveItems($dryRun);
            }
            
            // Clean up database tables
            $deletedRecords = $this->cleanupDatabaseTables($dryRun);
            
            $this->displaySummary($dryRun, $deletedFiles, $deletedFolders, $deletedRecords, $keepFiles);
            
        } catch (\Exception $e) {
            $this->error('Failed to clean tables: ' . $e->getMessage());
            Log::error('CleanTeacherWorkTables failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
        
        return Command::SUCCESS;
    }
    
    private function displayCurrentData()
    {
        $workRecords = TeacherSubjectWork::count();
        $fileRecords = TeacherWorkFile::count();
        
        $this->info("Current data in tables:");
        $this->line("  teacher_subject_work: {$workRecords} records");
        $this->line("  teacher_work_files: {$fileRecords} records");
        $this->newLine();
        
        if ($fileRecords > 0) {
            $this->info("Files that will be affected:");
            TeacherWorkFile::all()->each(function ($file, $index) {
                $this->line("  " . ($index + 1) . ". {$file->file_name}");
            });
            $this->newLine();
        }
        
        if ($workRecords > 0) {
            $this->info("Google Drive folders that will be affected:");
            TeacherSubjectWork::whereNotNull('gdrive_folder_id')->each(function ($work, $index) {
                $this->line("  " . ($index + 1) . ". {$work->folder_name} (ID: {$work->gdrive_folder_id})");
            });
            $this->newLine();
        }
    }
    
    private function confirmCleanup($dryRun): bool
    {
        if ($dryRun || $this->option('force')) {
            return true;
        }
        
        $this->warn('⚠️  WARNING: This will permanently delete all data and files!');
        $this->warn('This action cannot be undone.');
        $this->newLine();
        
        return $this->confirm('Are you sure you want to proceed with the cleanup?');
    }
    
    private function cleanupGoogleDriveItems($dryRun): array
    {
        $this->info('Cleaning up Google Drive files and folders...');
        
        $client = $this->createAuthenticatedGoogleClient();
        $service = new Drive($client);
        
        $deletedFiles = 0;
        $deletedFolders = 0;
        
        // Clean up files first
        $files = TeacherWorkFile::all();
        foreach ($files as $file) {
            try {
                $fileId = $this->extractGoogleDriveFileId($file->file_url);
                if ($fileId) {
                    $this->line("  Deleting file: {$file->file_name}");
                    if (!$dryRun) {
                        $service->files->delete($fileId);
                    }
                    $deletedFiles++;
                }
            } catch (\Exception $e) {
                $this->warn("  Failed to delete file {$file->file_name}: " . $e->getMessage());
            }
        }
        
        // Clean up folders
        $folders = TeacherSubjectWork::whereNotNull('gdrive_folder_id')->get();
        foreach ($folders as $work) {
            try {
                $this->line("  Deleting folder: {$work->folder_name}");
                if (!$dryRun) {
                    $service->files->delete($work->gdrive_folder_id);
                }
                $deletedFolders++;
            } catch (\Exception $e) {
                $this->warn("  Failed to delete folder {$work->folder_name}: " . $e->getMessage());
            }
        }
        
        return [$deletedFiles, $deletedFolders];
    }
    
    private function cleanupDatabaseTables($dryRun): int
    {
        $this->info('Cleaning up database tables...');
        
        $deletedRecords = 0;
        
        if (!$dryRun) {
            DB::beginTransaction();
            try {
                // Delete files first (due to foreign key constraints)
                $fileCount = TeacherWorkFile::count();
                TeacherWorkFile::truncate();
                $this->line("  Deleted {$fileCount} records from teacher_work_files");
                
                // Delete teacher subject work records
                $workCount = TeacherSubjectWork::count();
                TeacherSubjectWork::truncate();
                $this->line("  Deleted {$workCount} records from teacher_subject_work");
                
                $deletedRecords = $fileCount + $workCount;
                
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } else {
            $fileCount = TeacherWorkFile::count();
            $workCount = TeacherSubjectWork::count();
            $deletedRecords = $fileCount + $workCount;
            
            $this->line("  Would delete {$fileCount} records from teacher_work_files");
            $this->line("  Would delete {$workCount} records from teacher_subject_work");
        }
        
        return $deletedRecords;
    }
    
    private function displaySummary($dryRun, $deletedFiles, $deletedFolders, $deletedRecords, $keepFiles)
    {
        $this->newLine();
        
        if ($dryRun) {
            $this->info('DRY RUN SUMMARY:');
            if (!$keepFiles) {
                $this->line("  Would delete {$deletedFiles} Google Drive files");
                $this->line("  Would delete {$deletedFolders} Google Drive folders");
            }
            $this->line("  Would delete {$deletedRecords} database records");
        } else {
            $this->info('CLEANUP COMPLETED:');
            if (!$keepFiles) {
                $this->line("  Deleted {$deletedFiles} Google Drive files");
                $this->line("  Deleted {$deletedFolders} Google Drive folders");
            }
            $this->line("  Deleted {$deletedRecords} database records");
            $this->info('✅ All tables are now clean!');
        }
    }
    
    private function extractGoogleDriveFileId(string $url): ?string
    {
        // Extract file ID from Google Drive URL
        // Format: https://drive.google.com/file/d/{FILE_ID}/view
        if (preg_match('/\/file\/d\/([a-zA-Z0-9\-_]+)\//', $url, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
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
}
