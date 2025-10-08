<?php

namespace App\Console\Commands;

use Google\Client;
use Illuminate\Console\Command;
use App\Models\GoogleDriveToken;

class SetupGoogleDrive extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:setup-google-drive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup Google Drive authentication for file storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Google Drive Storage Setup');
        $this->line('');

        // Check if credentials are already configured
        $clientId = config('services.google_drive.client_id');
        $clientSecret = config('services.google_drive.client_secret');
        $redirectUri = config('services.google_drive.redirect_uri');

        if (!$clientId || !$clientSecret || !$redirectUri) {
            $this->error('Google Drive credentials not configured in .env file');
            $this->line('Please add the following to your .env file:');
            $this->line('');
            $this->line('GOOGLE_DRIVE_CLIENT_ID=your_client_id');
            $this->line('GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret');
            $this->line('GOOGLE_DRIVE_REDIRECT_URI=http://localhost:8000/auth/google/callback');
            $this->line('GOOGLE_DRIVE_FOLDER_ID=optional_folder_id');
            $this->line('');
            $this->info('Get these credentials from: https://console.developers.google.com/');
            return 1;
        }

        $this->info('Credentials found. Generating authorization URL...');
        
        try {
            $client = new Client();
            $client->setClientId($clientId);
            $client->setClientSecret($clientSecret);
            $client->setRedirectUri($redirectUri);
            $client->setScopes(['https://www.googleapis.com/auth/drive.file']);
            $client->setAccessType('offline');
            $client->setApprovalPrompt('force');

            $authUrl = $client->createAuthUrl();

            $this->line('');
            $this->info('Visit this URL to authorize the application:');
            $this->line($authUrl);
            $this->line('');

            $authCode = $this->ask('Enter the authorization code from Google');

            if (!$authCode) {
                $this->error('Authorization code is required');
                return 1;
            }

            $token = $client->fetchAccessTokenWithAuthCode($authCode);

            if (isset($token['error'])) {
                $this->error('Error: ' . $token['error_description']);
                return 1;
            }

            if (isset($token['refresh_token'])) {
                // Save token to database
                $tokenRecord = GoogleDriveToken::createOrUpdateToken($token);
                
                $this->line('');
                $this->info('✅ Success! Google Drive token saved to database.');
                $this->info('Token ID: ' . $tokenRecord->id);
                $this->info('Expires: ' . ($tokenRecord->expires_at ? $tokenRecord->expires_at->format('Y-m-d H:i:s') : 'No expiration'));
                $this->line('');
                $this->info('🎉 Google Drive storage is now configured and ready to use!');
                $this->line('');
                $this->comment('Note: The refresh token is now managed automatically.');
                $this->comment('You can remove GOOGLE_DRIVE_REFRESH_TOKEN from your .env file.');
                return 0;
            } else {
                $this->error('No refresh token received. Please revoke access and try again.');
                $this->line('Revoke access at: https://myaccount.google.com/permissions');
                return 1;
            }

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }
}