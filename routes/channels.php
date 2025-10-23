<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Public channel for content updates - no authentication required
Broadcast::channel('content-updates', function () {
    return true; // Anyone can listen to public content updates
});

// Admin channel for admin-only notifications
Broadcast::channel('admin-updates', function ($user) {
    return $user && $user->is_admin; // Only admins can listen
});