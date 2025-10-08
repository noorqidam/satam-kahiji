<?php

namespace App\Console\Commands;

use App\Models\GoogleDriveToken;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Exception;

class MonitorGoogleDriveTokens extends Command
{
    protected $signature = 'google-drive:monitor-tokens {--notify}';
    protected $description = 'Monitor Google Drive token health and send alerts if needed';

    public function handle(): int
    {
        try {
            $token = GoogleDriveToken::getActiveToken();
            
            if (!$token) {
                $message = 'CRITICAL: No active Google Drive token found!';
                $this->error($message);
                
                if ($this->option('notify')) {
                    $this->sendAlert($message);
                }
                
                return 1;
            }

            // Check token expiry status
            $expiresAt = $token->expires_at;
            if (!$expiresAt) {
                $message = 'WARNING: Token has no expiration date set';
                $this->warn($message);
                
                if ($this->option('notify')) {
                    $this->sendAlert($message);
                }
                
                return 0;
            }

            $now = now();
            $hoursUntilExpiry = $now->diffInHours($expiresAt, false);

            if ($hoursUntilExpiry < 0) {
                $message = "CRITICAL: Token expired " . abs($hoursUntilExpiry) . " hours ago!";
                $this->error($message);
                
                if ($this->option('notify')) {
                    $this->sendAlert($message);
                }
                
                return 1;
                
            } elseif ($hoursUntilExpiry < 6) {
                $message = "WARNING: Token expires in {$hoursUntilExpiry} hours";
                $this->warn($message);
                
                if ($this->option('notify')) {
                    $this->sendAlert($message);
                }
                
            } elseif ($hoursUntilExpiry < 24) {
                $this->info("Token expires in {$hoursUntilExpiry} hours (within 24h window)");
                
            } else {
                $this->info("Token is healthy, expires in " . round($hoursUntilExpiry, 1) . " hours");
            }

            // Test token validity by attempting refresh
            try {
                $freshToken = $token->getFreshAccessToken();
                if ($freshToken) {
                    $this->info('Token refresh test: SUCCESS');
                } else {
                    $message = 'CRITICAL: Token refresh test FAILED - token may be invalid';
                    $this->error($message);
                    
                    if ($this->option('notify')) {
                        $this->sendAlert($message);
                    }
                    
                    return 1;
                }
            } catch (Exception $e) {
                $message = "CRITICAL: Token refresh failed: " . $e->getMessage();
                $this->error($message);
                
                if ($this->option('notify')) {
                    $this->sendAlert($message);
                }
                
                return 1;
            }

            $this->line("Token Details:");
            $this->line("- Service: {$token->service_name}");
            $this->line("- Expires: {$expiresAt}");
            $this->line("- Active: " . ($token->is_active ? 'Yes' : 'No'));
            $this->line("- Updated: {$token->updated_at}");

            return 0;
            
        } catch (Exception $e) {
            $message = "Error monitoring tokens: " . $e->getMessage();
            $this->error($message);
            
            if ($this->option('notify')) {
                $this->sendAlert($message);
            }
            
            return 1;
        }
    }

    private function sendAlert(string $message): void
    {
        try {
            // Log the alert
            logger()->critical('Google Drive Token Alert', ['message' => $message]);
            
            // You can implement email notifications here
            // Mail::raw($message, function ($mail) {
            //     $mail->to(config('app.admin_email'))
            //          ->subject('Google Drive Token Alert');
            // });
            
            $this->info('Alert logged (email notifications can be configured)');
            
        } catch (Exception $e) {
            $this->error('Failed to send alert: ' . $e->getMessage());
        }
    }
}