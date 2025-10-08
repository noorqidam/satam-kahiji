<?php

namespace App\Console\Commands;

use App\Models\GoogleDriveToken;
use Illuminate\Console\Command;

class CheckGoogleDriveStatus extends Command
{
    protected $signature = 'storage:check-google-drive-status';
    protected $description = 'Check the status of Google Drive authentication and token';

    public function handle()
    {
        $this->info('🔍 Checking Google Drive Authentication Status...');
        $this->newLine();

        // Check configuration
        $clientId = config('services.google_drive.client_id');
        $clientSecret = config('services.google_drive.client_secret');
        $folderId = config('services.google_drive.folder_id');

        if (!$clientId || !$clientSecret) {
            $this->error('❌ Google Drive credentials not configured in .env file');
            $this->line('   Please set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET');
            return 1;
        }

        $this->info('✅ Google Drive credentials configured');
        $this->line("   Client ID: {$clientId}");
        $this->line("   Folder ID: " . ($folderId ?: 'Not set'));
        $this->newLine();

        // Check token
        $token = GoogleDriveToken::getActiveToken();

        if (!$token) {
            $this->error('❌ No active Google Drive token found');
            $this->line('   Run: php artisan storage:setup-google-drive');
            return 1;
        }

        $this->info("✅ Active token found (ID: {$token->id})");
        $this->line("   Created: {$token->created_at}");
        $this->line("   Expires: {$token->expires_at}");
        $this->line("   Is expired: " . ($token->isExpired() ? 'YES' : 'NO'));
        $this->newLine();

        if (!$token->refresh_token) {
            $this->error('❌ No refresh token available');
            $this->line('   Run: php artisan storage:setup-google-drive');
            return 1;
        }

        $this->info('✅ Refresh token available');
        $this->newLine();

        // Test token refresh
        $this->info('🔄 Testing token refresh...');
        $freshToken = $token->getFreshAccessToken();

        if ($freshToken) {
            $this->info('✅ Token refresh successful!');
            $this->line("   New token length: " . strlen($freshToken));
            
            // Test Google Drive connection
            $this->info('🔗 Testing Google Drive connection...');
            $client = $token->getAuthenticatedClient();
            
            if ($client) {
                $this->info('✅ Google Drive connection successful!');
                $this->newLine();
                $this->info('🎉 Google Drive is properly configured and working');
                return 0;
            } else {
                $this->error('❌ Failed to create Google Drive client');
            }
        } else {
            $this->error('❌ Token refresh failed');
            
            if (GoogleDriveToken::needsSetup()) {
                $this->line('   The refresh token has expired or been revoked');
                $this->line('   Run: php artisan storage:setup-google-drive');
            }
        }

        $this->newLine();
        $this->warn('⚠️  Google Drive authentication needs to be re-established');
        $this->line('   Run: php artisan storage:setup-google-drive');
        
        return 1;
    }
}