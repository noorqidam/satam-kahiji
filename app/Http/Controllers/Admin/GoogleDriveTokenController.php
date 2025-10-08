<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoogleDriveToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Exception;

class GoogleDriveTokenController extends Controller
{
    public function dashboard()
    {
        try {
            $token = GoogleDriveToken::getActiveToken();
            
            $tokenData = null;
            $status = 'no_token';
            $statusMessage = 'No Google Drive token found';
            $canRefresh = false;
            $timeUntilExpiry = null;
            $lastRefresh = null;
            
            if ($token) {
                $now = now();
                $expiresAt = $token->expires_at;
                
                // Calculate time until expiry
                if ($expiresAt) {
                    $hoursUntilExpiry = $now->diffInHours($expiresAt, false);
                    
                    if ($hoursUntilExpiry < 0) {
                        $status = 'expired';
                        $statusMessage = 'Token expired ' . abs($hoursUntilExpiry) . ' hours ago';
                        $timeUntilExpiry = $hoursUntilExpiry;
                    } elseif ($hoursUntilExpiry < 1) {
                        $status = 'critical';
                        $statusMessage = 'Token expires in ' . round($hoursUntilExpiry * 60) . ' minutes';
                        $timeUntilExpiry = $hoursUntilExpiry;
                    } elseif ($hoursUntilExpiry < 6) {
                        $status = 'warning';
                        $statusMessage = 'Token expires in ' . round($hoursUntilExpiry, 1) . ' hours';
                        $timeUntilExpiry = $hoursUntilExpiry;
                    } elseif ($hoursUntilExpiry < 24) {
                        $status = 'info';
                        $statusMessage = 'Token expires in ' . round($hoursUntilExpiry, 1) . ' hours';
                        $timeUntilExpiry = $hoursUntilExpiry;
                    } else {
                        $status = 'healthy';
                        $statusMessage = 'Token is healthy';
                        $timeUntilExpiry = $hoursUntilExpiry;
                    }
                } else {
                    $status = 'unknown';
                    $statusMessage = 'Token expiry date unknown';
                }
                
                // Test if token can be refreshed
                try {
                    $freshToken = $token->getFreshAccessToken();
                    $canRefresh = !empty($freshToken);
                } catch (Exception $e) {
                    $canRefresh = false;
                    if ($status === 'healthy') {
                        $status = 'error';
                        $statusMessage = 'Token refresh failed: ' . $e->getMessage();
                    }
                }
                
                $tokenData = [
                    'service_name' => $token->service_name,
                    'expires_at' => $token->expires_at?->format('Y-m-d H:i:s'),
                    'expires_at_human' => $token->expires_at?->diffForHumans(),
                    'is_active' => $token->is_active,
                    'created_at' => $token->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $token->updated_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $token->created_at->diffForHumans(),
                    'updated_at_human' => $token->updated_at->diffForHumans(),
                    'access_token_preview' => $token->access_token ? substr($token->access_token, 0, 20) . '...' : null,
                    'access_token_full' => $token->access_token, // For editing purposes
                    'refresh_token_full' => $token->refresh_token, // For editing purposes
                    'has_refresh_token' => !empty($token->refresh_token),
                    'token_data_keys' => $token->token_data ? array_keys($token->token_data) : [],
                ];
                
                $lastRefresh = $token->updated_at->diffForHumans();
            }
            
            // Get system configuration
            $config = [
                'filesystem_default' => config('filesystems.default'),
                'google_drive_configured' => !empty(config('filesystems.disks.google_drive.client_id')) 
                    && !empty(config('filesystems.disks.google_drive.client_secret')),
                'client_id_preview' => config('filesystems.disks.google_drive.client_id') 
                    ? substr(config('filesystems.disks.google_drive.client_id'), 0, 20) . '...' 
                    : null,
                'folder_id' => config('filesystems.disks.google_drive.folder_id'),
            ];
            
            return Inertia::render('admin/google-drive/dashboard', [
                'token' => $tokenData,
                'status' => $status,
                'statusMessage' => $statusMessage,
                'canRefresh' => $canRefresh,
                'timeUntilExpiry' => $timeUntilExpiry,
                'lastRefresh' => $lastRefresh,
                'config' => $config,
            ]);
            
        } catch (Exception $e) {
            return Inertia::render('admin/google-drive/dashboard', [
                'token' => null,
                'status' => 'error',
                'statusMessage' => 'Error loading token data: ' . $e->getMessage(),
                'canRefresh' => false,
                'timeUntilExpiry' => null,
                'lastRefresh' => null,
                'config' => [
                    'filesystem_default' => config('filesystems.default'),
                    'google_drive_configured' => false,
                    'client_id_preview' => null,
                    'folder_id' => null,
                ],
            ]);
        }
    }
    
    public function refreshToken(Request $request)
    {
        // Validate the request
        $request->validate([
            'action' => 'required|string|in:refresh_token',
        ]);
        
        try {
            $token = GoogleDriveToken::getActiveToken();
            
            if (!$token) {
                return back()->with('error', 'No active Google Drive token found. Please run setup first.');
            }
            
            // Log the refresh attempt
            logger()->info('Manual Google Drive token refresh initiated', [
                'user_id' => Auth::id(),
                'token_expires_at' => $token->expires_at,
            ]);
            
            $freshToken = $token->getFreshAccessToken();
            
            if ($freshToken) {
                logger()->info('Google Drive token refreshed successfully', [
                    'user_id' => Auth::id(),
                    'new_expires_at' => $token->fresh()->expires_at,
                ]);
                
                return back()->with('success', 'Google Drive token refreshed successfully! New expiration: ' . $token->fresh()->expires_at->format('Y-m-d H:i:s'));
            } else {
                logger()->error('Failed to refresh Google Drive token', [
                    'user_id' => Auth::id(),
                    'token_id' => $token?->id,
                ]);
                
                return back()->with('error', 'Failed to refresh Google Drive token. Please check your configuration.');
            }
            
        } catch (Exception $e) {
            logger()->error('Error refreshing Google Drive token', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->with('error', 'Error refreshing token: ' . $e->getMessage());
        }
    }
    
    public function testConnection(Request $request)
    {
        // Validate the request
        $request->validate([
            'action' => 'required|string|in:test_connection',
        ]);
        
        try {
            $token = GoogleDriveToken::getActiveToken();
            
            if (!$token) {
                return back()->with('error', 'No active Google Drive token found.');
            }
            
            // Log the test attempt
            logger()->info('Google Drive connection test initiated', [
                'user_id' => Auth::id(),
                'token_expires_at' => $token->expires_at,
            ]);
            
            // Test token by attempting to refresh it
            $freshToken = $token->getFreshAccessToken();
            
            if (!$freshToken) {
                logger()->error('Google Drive connection test failed - no fresh token', [
                    'user_id' => Auth::id(),
                    'token_id' => $token?->id,
                ]);
                
                return back()->with('error', 'Token test failed - unable to get fresh access token.');
            }
            
            // Test Google Drive service
            $client = new \Google\Client();
            $client->setAccessToken($freshToken);
            $service = new \Google\Service\Drive($client);
            
            // Try to get the user's Drive info (simple API call)
            $about = $service->about->get(['fields' => 'user,storageQuota']);
            
            if ($about && $about->getUser()) {
                $user = $about->getUser();
                $storageQuota = $about->getStorageQuota();
                
                logger()->info('Google Drive connection test successful', [
                    'user_id' => Auth::id(),
                    'google_user' => $user->getEmailAddress(),
                    'storage_limit' => $storageQuota ? $storageQuota->getLimit() : 'unlimited',
                ]);
                
                $message = 'Google Drive connection test successful! Connected as: ' . $user->getEmailAddress();
                
                if ($storageQuota && $storageQuota->getUsage() && $storageQuota->getLimit()) {
                    $usagePercent = round(($storageQuota->getUsage() / $storageQuota->getLimit()) * 100, 1);
                    $message .= ' | Storage: ' . $usagePercent . '% used';
                }
                
                return back()->with('success', $message);
            } else {
                logger()->error('Google Drive API test failed - no user data', [
                    'user_id' => Auth::id(),
                ]);
                
                return back()->with('error', 'Google Drive API test failed - no user data returned.');
            }
            
        } catch (Exception $e) {
            logger()->error('Google Drive connection test failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->with('error', 'Google Drive connection test failed: ' . $e->getMessage());
        }
    }

    public function updateToken(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string|min:10',
            'refresh_token' => 'required|string|min:10',
        ]);

        try {
            $token = GoogleDriveToken::getActiveToken();

            if (!$token) {
                // Create new token if none exists
                $token = new GoogleDriveToken([
                    'service_name' => 'google_drive',
                    'is_active' => true,
                ]);
            }

            // Update token data (both tokens are required)
            $token->access_token = $request->access_token;
            $token->refresh_token = $request->refresh_token;
            
            // Automatically set expiry to 1 hour from now (Google default)
            $token->expires_at = now()->addHour();
            
            // Always set as active when manually updating tokens
            $token->is_active = true;

            $token->save();

            logger()->info('Google Drive token updated manually', [
                'user_id' => Auth::id(),
                'token_id' => $token?->id,
                'updated_fields' => array_keys($request->only(['access_token', 'refresh_token', 'expires_at', 'is_active'])),
            ]);

            return back()->with('success', 'Google Drive token updated successfully!');

        } catch (Exception $e) {
            logger()->error('Error updating Google Drive token', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Error updating token: ' . $e->getMessage());
        }
    }
}