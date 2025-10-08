<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get paginated users with filters.
     */
    public function getPaginatedUsers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->userRepository->getPaginatedUsers($filters, $perPage);
    }

    /**
     * Create a new user and send email verification.
     */
    public function createUser(array $data): User
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
            'email_verified_at' => null, // Require email verification
        ];

        $user = $this->userRepository->create($userData);

        // Trigger email verification
        event(new Registered($user));

        return $user;
    }

    /**
     * Update an existing user.
     */
    public function updateUser(User $user, array $data): bool
    {
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
        ];

        // Only update password if provided
        if (!empty($data['password'])) {
            $userData['password'] = Hash::make($data['password']);
        }

        return $this->userRepository->update($user, $userData);
    }

    /**
     * Delete a single user with validation.
     */
    public function deleteUser(User $user, int $currentUserId): bool
    {
        if (!$this->userRepository->canDelete($user, $currentUserId)) {
            throw new \InvalidArgumentException('Cannot delete your own account.');
        }

        return $this->userRepository->delete($user);
    }

    /**
     * Bulk delete users with validation.
     */
    public function bulkDeleteUsers(array $userIds, int $currentUserId): array
    {
        // Filter out current user ID
        $filteredIds = $this->userRepository->filterExcludingCurrentUser($userIds, $currentUserId);

        if (empty($filteredIds)) {
            throw new \InvalidArgumentException('No valid users selected for deletion.');
        }

        // Get users to check if they exist
        $users = $this->userRepository->findByIds($filteredIds);
        
        if ($users->count() !== count($filteredIds)) {
            throw new \InvalidArgumentException('Some selected users do not exist.');
        }

        $deletedCount = $this->userRepository->bulkDelete($filteredIds);

        return [
            'deleted_count' => $deletedCount,
            'requested_count' => count($userIds),
            'filtered_count' => count($filteredIds),
        ];
    }

    /**
     * Get available user roles.
     */
    public function getAvailableRoles(): array
    {
        return [
            'super_admin' => 'Super Admin',
            'headmaster' => 'Headmaster',
            'deputy_headmaster' => 'Deputy Headmaster',
            'teacher' => 'Teacher',
        ];
    }
}