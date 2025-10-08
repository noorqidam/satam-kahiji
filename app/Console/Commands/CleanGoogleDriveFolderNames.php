<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TeacherSubjectWork;
use App\Models\GoogleDriveToken;
use Google\Client;
use Google\Service\Drive;
use Illuminate\Support\Facades\Log;

class CleanGoogleDriveFolderNames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'work-items:clean-folder-names {--dry-run : Show what would be changed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up Google Drive folder names by removing "Subject:" and "Teacher:" prefixes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        $this->info('Cleaning up Google Drive folder names...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE: No changes will be made');
        }
        
        try {
            // Create authenticated Google Client
            $client = $this->createAuthenticatedGoogleClient();
            $service = new Drive($client);
            
            $processedFolders = [];
            $changesCount = 0;
            
            // Get all existing teacher subject work records
            $records = TeacherSubjectWork::with(['staff', 'subject'])->get();
            
            $this->info("Found {$records->count()} teacher work records");
            
            foreach ($records as $record) {
                if (!$record->gdrive_folder_id) {
                    $this->line("Skipping record {$record->id}: no folder ID");
                    continue;
                }
                
                $this->line("Processing record {$record->id} with folder ID: {$record->gdrive_folder_id}");
                
                try {
                    // Get the work item folder
                    $workItemFolder = $service->files->get($record->gdrive_folder_id);
                    $workItemFolderName = $workItemFolder->getName();
                    $workItemParentId = $workItemFolder->getParents()[0] ?? null;
                    
                    $this->line("  Work item folder: '{$workItemFolderName}'");
                    
                    if (!$workItemParentId) {
                        $this->line("  No parent folder found, skipping");
                        continue;
                    }
                    
                    $this->line("  Parent folder ID: {$workItemParentId}");
                    
                    // Check if we've already processed this teacher folder
                    if (in_array($workItemParentId, $processedFolders)) {
                        continue;
                    }
                    
                    // Get the teacher folder
                    $teacherFolder = $service->files->get($workItemParentId);
                    $teacherFolderName = $teacherFolder->getName();
                    $subjectParentId = $teacherFolder->getParents()[0] ?? null;
                    
                    $this->line("Found teacher folder: '{$teacherFolderName}'");
                    
                    // Clean teacher folder name
                    if (str_starts_with($teacherFolderName, 'Teacher: ')) {
                        $newTeacherName = str_replace('Teacher: ', '', $teacherFolderName);
                        $this->info("Teacher folder: '{$teacherFolderName}' -> '{$newTeacherName}'");
                        
                        if (!$dryRun) {
                            $teacherFolder->setName($newTeacherName);
                            $service->files->update($workItemParentId, $teacherFolder);
                        }
                        $changesCount++;
                    }
                    
                    $processedFolders[] = $workItemParentId;
                    
                    // Process subject folder if exists
                    if ($subjectParentId) {
                        $subjectFolder = $service->files->get($subjectParentId);
                        $subjectFolderName = $subjectFolder->getName();
                        
                        $this->line("Found subject folder: '{$subjectFolderName}'");
                        
                        // Clean subject folder name
                        if (str_starts_with($subjectFolderName, 'Subject: ')) {
                            $newSubjectName = str_replace('Subject: ', '', $subjectFolderName);
                            $this->info("Subject folder: '{$subjectFolderName}' -> '{$newSubjectName}'");
                            
                            if (!$dryRun) {
                                $subjectFolder->setName($newSubjectName);
                                $service->files->update($subjectParentId, $subjectFolder);
                            }
                            $changesCount++;
                        }
                    }
                    
                } catch (\Exception $e) {
                    $this->error("Error processing record {$record->id}: " . $e->getMessage());
                    continue;
                }
            }
            
            if ($changesCount === 0) {
                $this->info("No folders found with 'Subject:' or 'Teacher:' prefixes that need cleaning.");
                $this->line("This could mean:");
                $this->line("  - Folders were created after the naming fix was applied");
                $this->line("  - Folders don't follow the expected hierarchical structure");
                $this->line("  - All folder names are already clean");
            } else if ($dryRun) {
                $this->info("DRY RUN: Would have made {$changesCount} changes");
            } else {
                $this->info("Successfully cleaned up {$changesCount} folder names");
            }
            
        } catch (\Exception $e) {
            $this->error('Failed to clean folder names: ' . $e->getMessage());
            return Command::FAILURE;
        }
        
        return Command::SUCCESS;
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
}
