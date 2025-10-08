<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Google Drive Token Management Scheduler
Schedule::command('google-drive:refresh-tokens')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground()
    ->onFailure(function () {
        logger()->error('Google Drive token refresh scheduled task failed');
    });

Schedule::command('google-drive:monitor-tokens --notify')
    ->everyFourHours()
    ->withoutOverlapping()
    ->runInBackground()
    ->onFailure(function () {
        logger()->error('Google Drive token monitoring scheduled task failed');
    });
