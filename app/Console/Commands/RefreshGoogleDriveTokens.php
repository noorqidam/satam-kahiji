<?php

namespace App\Console\Commands;

use App\Models\GoogleDriveToken;
use Illuminate\Console\Command;
use Exception;

class RefreshGoogleDriveTokens extends Command
{
    protected $signature = 'google-drive:refresh-tokens';
    protected $description = 'Proactively refresh Google Drive tokens before they expire';

    public function handle(): int
    {
        try {
            $token = GoogleDriveToken::getActiveToken();
            
            if (!$token) {
                $this->error('No active Google Drive token found. Run google-drive:setup first.');
                return 1;
            }

            // Refresh if token expires within 1 hour (proactive refresh)
            if ($token->expires_at && $token->expires_at->isBefore(now()->addHour())) {
                $this->info('Token expires soon, refreshing...');
                
                $freshToken = $token->getFreshAccessToken();
                
                if ($freshToken) {
                    $this->info('Token refreshed successfully');
                    $this->line("New expiry: {$token->fresh()->expires_at}");
                } else {
                    $this->error('Failed to refresh token - manual intervention required');
                    return 1;
                }
            } else {
                $this->info('Token is still valid');
                $this->line("Expires at: {$token->expires_at}");
            }

            return 0;
            
        } catch (Exception $e) {
            $this->error("Error refreshing token: {$e->getMessage()}");
            return 1;
        }
    }
}