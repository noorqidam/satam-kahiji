<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    /**
     * Get paginated users with optional filters.
     */
    public function getPaginatedUsers(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    /**
     * Create a new user.
     */
    public function create(array $data): User;

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): bool;

    /**
     * Delete a user.
     */
    public function delete(User $user): bool;

    /**
     * Delete multiple users by IDs.
     */
    public function bulkDelete(array $userIds): int;

    /**
     * Find users by IDs.
     */
    public function findByIds(array $userIds): Collection;

    /**
     * Check if user can be deleted (not current user).
     */
    public function canDelete(User $user, int $currentUserId): bool;

    /**
     * Filter user IDs excluding current user.
     */
    public function filterExcludingCurrentUser(array $userIds, int $currentUserId): array;
}