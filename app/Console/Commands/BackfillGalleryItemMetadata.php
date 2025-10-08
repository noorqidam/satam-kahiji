<?php

namespace App\Console\Commands;

use App\Models\GalleryItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackfillGalleryItemMetadata extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gallery:backfill-metadata {--force : Force update even if metadata exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill metadata for existing gallery items that are missing it';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        
        $this->info('Starting gallery item metadata backfill...');

        // Get items that need metadata
        $query = GalleryItem::whereNotNull('file_path');
        
        if (!$force) {
            $query->where(function($q) {
                $q->whereNull('metadata')
                  ->orWhereRaw('metadata::text = ?', ['{}'])
                  ->orWhereRaw('metadata::text = ?', ['[]'])
                  ->orWhereRaw('metadata::text = ?', ['null']);
            });
        }
        
        $items = $query->get();
        
        if ($items->isEmpty()) {
            $this->info('No gallery items need metadata backfill.');
            return 0;
        }

        $this->info("Found {$items->count()} items that need metadata.");

        $progressBar = $this->output->createProgressBar($items->count());
        $progressBar->start();

        $successCount = 0;
        $failureCount = 0;

        foreach ($items as $item) {
            try {
                $metadata = $this->generateMetadataFromItem($item);
                
                $item->update(['metadata' => $metadata]);
                $successCount++;
                
            } catch (\Exception $e) {
                $this->error("\nFailed to generate metadata for item {$item->id}: " . $e->getMessage());
                Log::error("Metadata backfill failed for gallery item {$item->id}: " . $e->getMessage());
                $failureCount++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        
        $this->newLine(2);
        $this->info("Metadata backfill completed!");
        $this->info("✅ Success: {$successCount} items");
        if ($failureCount > 0) {
            $this->error("❌ Failed: {$failureCount} items");
        }

        return 0;
    }

    /**
     * Generate metadata for a gallery item
     */
    private function generateMetadataFromItem(GalleryItem $item): array
    {
        $metadata = [
            'mime_type' => $item->mime_type,
            'source' => 'backfill_command',
            'generated_at' => now()->toISOString(),
        ];

        // Extract file extension from MIME type
        if ($item->mime_type) {
            $extension = match($item->mime_type) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                'video/mp4' => 'mp4',
                'video/quicktime' => 'mov',
                'video/x-msvideo' => 'avi',
                default => null
            };
            
            if ($extension) {
                $metadata['extension'] = $extension;
            }
        }

        // Mark as Google Drive storage
        if (str_contains($item->file_path, 'googleusercontent.com') || str_contains($item->file_path, 'drive.google.com')) {
            $metadata['storage'] = 'google_drive';
            
            // Try to extract dimensions for images
            if ($item->mime_type && str_starts_with($item->mime_type, 'image/')) {
                try {
                    // Convert Google Drive URL to a format that getimagesize can work with
                    $imageUrl = $this->convertGoogleDriveUrlForAnalysis($item->file_path);
                    
                    $imageInfo = @getimagesize($imageUrl);
                    if ($imageInfo !== false) {
                        $metadata['width'] = $imageInfo[0];
                        $metadata['height'] = $imageInfo[1];
                        $metadata['dimensions'] = "{$imageInfo[0]}x{$imageInfo[1]}";
                        $metadata['aspect_ratio'] = round($imageInfo[0] / $imageInfo[1], 2);
                    }
                } catch (\Exception $e) {
                    // If we can't analyze the image, that's okay
                    $this->warn("Could not extract dimensions for item {$item->id}: " . $e->getMessage());
                }
            }
        }

        $metadata['note'] = 'Metadata generated via backfill command';

        return $metadata;
    }

    /**
     * Convert Google Drive URL to a format suitable for image analysis
     */
    private function convertGoogleDriveUrlForAnalysis(string $url): string
    {
        // If it's already an lh3 URL, try to make it accessible
        if (str_contains($url, 'lh3.googleusercontent.com')) {
            return $url;
        }
        
        // If it's a drive.google.com URL, try to convert it
        if (preg_match('/drive\.google\.com\/file\/d\/([a-zA-Z0-9\-_]+)/', $url, $matches)) {
            $fileId = $matches[1];
            return "https://lh3.googleusercontent.com/d/{$fileId}";
        }
        
        return $url;
    }
}
