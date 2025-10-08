<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Staff;
use App\Models\PositionHistory;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Create staff record for ALL users regardless of role
        // This ensures every user has a corresponding staff entry
        $this->createStaffRecord($user);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // If user has a staff record, update it when user data changes
        if ($user->staff) {
            $this->updateStaffRecord($user);
        } else {
            // If no staff record exists, create one
            $this->createStaffRecord($user);
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // When user is deleted, the staff record will be automatically set to null
        // due to the nullOnDelete() constraint in the migration
        // No additional action needed as the database handles this automatically
        
        // Log the deletion for audit purposes if needed
        Log::info("User deleted: {$user->name} (ID: {$user->id})");
    }

    /**
     * Create a staff record for the user
     */
    private function createStaffRecord(User $user): void
    {
        // Map role to position and division
        $positionMapping = [
            'super_admin' => ['position' => 'Super Administrator', 'division' => 'Administrasi Sistem'],
            'headmaster' => ['position' => 'Kepala Sekolah', 'division' => 'Kepala Sekolah'],
            'deputy_headmaster' => ['position' => 'Wakil Kepala Sekolah', 'division' => 'Wakil Kepala Sekolah'],
            'teacher' => ['position' => 'Guru', 'division' => 'Akademik'],
            'humas' => ['position' => 'Humas', 'division' => 'Hubungan Masyarakat'],
            'tu' => ['position' => 'Tata Usaha', 'division' => 'Administrasi'],
        ];

        $mapping = $positionMapping[$user->role] ?? ['position' => 'Staff', 'division' => 'Umum'];
        
        $staff = Staff::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'position' => $mapping['position'],
            'division' => $mapping['division'],
            'email' => $user->email,
            'phone' => null, // Will be filled later by user management
            'photo' => null, // Will be filled later by user management
            'bio' => null,   // Will be filled later by user management
        ]);

        // Create initial position history record
        $this->createPositionHistoryRecord($staff, $mapping['position']);
    }

    /**
     * Update the staff record when user data changes
     */
    private function updateStaffRecord(User $user): void
    {
        $staff = $user->staff;
        
        // Update fields that should stay in sync with user data
        $staff->update([
            'name' => $user->name,
            'email' => $user->email,
            // Note: position and division are not updated automatically
            // to preserve any manual changes made by administrators
        ]);
    }

    /**
     * Create a position history record for the staff member
     */
    private function createPositionHistoryRecord(Staff $staff, string $position): void
    {
        PositionHistory::create([
            'staff_id' => $staff->id,
            'title' => $position,
            'start_year' => now()->year,
            'end_year' => null, // Current position, so no end year
        ]);
    }
}