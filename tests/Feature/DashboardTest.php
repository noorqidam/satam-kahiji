<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/admin/dashboard')->assertRedirect('/admin/login');
});

test('authenticated super admin users can visit the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'super_admin']);
    $this->actingAs($user);

    $this->get('/admin/dashboard')->assertOk();
});