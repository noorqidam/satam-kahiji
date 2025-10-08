<?php

namespace App\Providers;

use App\Filesystem\GoogleDriveAdapter;
use App\Models\GoogleDriveToken;
use Google\Client;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use Exception;

class FilesystemServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Storage::extend('google_drive', function ($app, $config) {
            $client = new Client();
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            
            try {
                // Use database token instead of config
                $dbToken = GoogleDriveToken::getActiveToken();
                
                if ($dbToken) {
                    $freshToken = $dbToken->getFreshAccessToken();
                    if ($freshToken) {
                        $client->setAccessToken($freshToken);
                    }
                } elseif (isset($config['refresh_token'])) {
                    // Fallback to config-based token (for backward compatibility)
                    $client->refreshToken($config['refresh_token']);
                }
            } catch (Exception $e) {
                // Log error but continue with fallback
                logger()->error('Google Drive token error in FilesystemServiceProvider', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Try config fallback if database token fails
                if (isset($config['refresh_token'])) {
                    try {
                        $client->refreshToken($config['refresh_token']);
                    } catch (Exception $fallbackError) {
                        logger()->error('Google Drive config fallback also failed', [
                            'error' => $fallbackError->getMessage()
                        ]);
                    }
                }
            }

            $adapter = new GoogleDriveAdapter(
                $client,
                $config['folder_id'] ?? null
            );

            $filesystem = new Filesystem($adapter, $config);
            
            return new FilesystemAdapter(
                $filesystem,
                $adapter,
                $config
            );
        });
    }
}