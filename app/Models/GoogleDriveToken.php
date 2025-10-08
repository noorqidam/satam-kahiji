<?php

namespace App\Models;

use Google\Client;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * @property int $id
 * @property string $service_name
 * @property string|null $access_token
 * @property string|null $refresh_token
 * @property \Carbon\Carbon|null $expires_at
 * @property array|null $token_data
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class GoogleDriveToken extends Model
{
    protected $fillable = [
        'service_name',
        'access_token',
        'refresh_token',
        'expires_at',
        'token_data',
        'is_active'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'token_data' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Get the active Google Drive token
     */
    public static function getActiveToken(): ?GoogleDriveToken
    {
        return self::where('service_name', 'google_drive')
                   ->where('is_active', true)
                   ->first();
    }

    /**
     * Create or update Google Drive token
     */
    public static function createOrUpdateToken(array $tokenData): GoogleDriveToken
    {
        $expiresAt = isset($tokenData['expires_in']) 
            ? Carbon::now()->addSeconds($tokenData['expires_in']) 
            : null;

        return self::updateOrCreate(
            ['service_name' => 'google_drive'],
            [
                'access_token' => $tokenData['access_token'] ?? null,
                'refresh_token' => $tokenData['refresh_token'] ?? self::getActiveToken()?->refresh_token,
                'expires_at' => $expiresAt,
                'token_data' => $tokenData,
                'is_active' => true
            ]
        );
    }

    /**
     * Check if token is expired or will expire soon
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }

        // Consider expired if it expires within the next 5 minutes
        return $this->expires_at->subMinutes(5)->isPast();
    }

    /**
     * Get fresh access token, refreshing if necessary
     */
    public function getFreshAccessToken(): ?string
    {
        if (!$this->isExpired() && $this->access_token) {
            return $this->access_token;
        }

        if (!$this->refresh_token) {
            Log::error('No refresh token available for Google Drive');
            return null;
        }

        // Use database lock to prevent concurrent token refresh
        $lockKey = 'google_drive_token_refresh_' . $this->id;
        
        return \Illuminate\Support\Facades\Cache::lock($lockKey, 30)->block(5, function () {
            // Re-check if token was refreshed by another process while waiting for lock
            $this->refresh();
            if (!$this->isExpired() && $this->access_token) {
                return $this->access_token;
            }

            try {
                Log::info('Attempting to refresh Google Drive token', [
                    'token_id' => $this->id,
                    'expires_at' => $this->expires_at,
                    'refresh_token_length' => strlen($this->refresh_token ?? '')
                ]);

                $client = new Client();
                $client->setClientId(config('services.google_drive.client_id'));
                $client->setClientSecret(config('services.google_drive.client_secret'));
                
                // Validate configuration
                if (!config('services.google_drive.client_id') || !config('services.google_drive.client_secret')) {
                    Log::error('Google Drive client credentials not configured');
                    return null;
                }

                if (!$this->refresh_token) {
                    Log::error('No refresh token available for Google Drive token refresh');
                    return null;
                }
                
                // Use the refresh token to get a new access token
                $client->refreshToken($this->refresh_token);
                $newToken = $client->getAccessToken();

                Log::info('Google Drive token refresh response received', [
                    'has_access_token' => isset($newToken['access_token']),
                    'has_expires_in' => isset($newToken['expires_in']),
                    'has_refresh_token' => isset($newToken['refresh_token']),
                    'token_type' => $newToken['token_type'] ?? null
                ]);

                if ($newToken && isset($newToken['access_token'])) {
                    $updateData = [
                        'access_token' => $newToken['access_token'],
                        'expires_at' => isset($newToken['expires_in']) 
                            ? Carbon::now()->addSeconds($newToken['expires_in'])
                            : Carbon::now()->addHour(), // Default to 1 hour if not specified
                        'token_data' => $newToken
                    ];

                    // Update refresh token if a new one was provided
                    if (isset($newToken['refresh_token'])) {
                        $updateData['refresh_token'] = $newToken['refresh_token'];
                        Log::info('New refresh token received and will be updated');
                    }

                    // Update the stored token
                    $this->update($updateData);

                    Log::info('Google Drive token successfully refreshed', [
                        'new_expires_at' => $updateData['expires_at'],
                        'access_token_length' => strlen($newToken['access_token'])
                    ]);

                    return $newToken['access_token'];
                }

                Log::error('Failed to refresh Google Drive token - invalid response', [
                    'response' => $newToken,
                    'refresh_token_prefix' => substr($this->refresh_token, 0, 20) . '...'
                ]);
                return null;

            } catch (\Google\Service\Exception $e) {
                $responseBody = $e->getMessage();
                Log::error('Google API error during token refresh', [
                    'error' => $responseBody,
                    'code' => $e->getCode(),
                    'refresh_token_prefix' => substr($this->refresh_token, 0, 20) . '...'
                ]);

                // If refresh token is invalid/expired, mark token as inactive
                if (strpos($responseBody, 'invalid_grant') !== false || 
                    strpos($responseBody, 'Token has been expired or revoked') !== false) {
                    Log::warning('Google Drive refresh token is invalid or expired, marking token as inactive');
                    $this->update(['is_active' => false]);
                }

                return null;
            } catch (\Exception $e) {
                Log::error('Unexpected error refreshing Google Drive token', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return null;
            }
        });
    }

    /**
     * Attempt to recover from token refresh failure by checking if setup is needed
     */
    public function attemptTokenRecovery(): bool
    {
        if (!$this->refresh_token) {
            Log::warning('No refresh token available, cannot recover. Setup required.');
            return false;
        }

        // Try one more time with detailed logging
        $freshToken = $this->getFreshAccessToken();
        
        if ($freshToken) {
            Log::info('Token recovery successful');
            return true;
        }

        Log::error('Token recovery failed - refresh token may be permanently invalid');
        return false;
    }

    /**
     * Check if token needs setup (no active token or refresh failed)
     */
    public static function needsSetup(): bool
    {
        $token = self::getActiveToken();
        
        if (!$token) {
            return true;
        }

        if (!$token->refresh_token) {
            return true;
        }

        // Try to get fresh token - if it fails, setup is needed
        $freshToken = $token->getFreshAccessToken();
        return !$freshToken;
    }

    /**
     * Get authenticated Google Client
     */
    public function getAuthenticatedClient(): ?Client
    {
        $accessToken = $this->getFreshAccessToken();
        
        if (!$accessToken) {
            return null;
        }

        try {
            $client = new Client();
            $client->setClientId(config('services.google_drive.client_id'));
            $client->setClientSecret(config('services.google_drive.client_secret'));
            $client->setAccessToken([
                'access_token' => $accessToken,
                'refresh_token' => $this->refresh_token,
                'expires_in' => $this->expires_at ? $this->expires_at->diffInSeconds(now()) : 3600
            ]);

            return $client;

        } catch (\Exception $e) {
            Log::error('Error creating authenticated Google Client: ' . $e->getMessage());
            return null;
        }
    }
}
