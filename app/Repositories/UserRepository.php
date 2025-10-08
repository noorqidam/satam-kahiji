<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(
        private User $model
    ) {}

    /**
     * Get paginated users with optional filters.
     */
    public function getPaginatedUsers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->model->select(['id', 'name', 'email', 'role', 'created_at']);

        $this->applyFilters($query, $filters);

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Append query parameters to pagination links
        $users->appends($filters);

        return $users;
    }

    /**
     * Create a new user.
     */
    public function create(array $data): User
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Delete multiple users by IDs.
     */
    public function bulkDelete(array $userIds): int
    {
        return $this->model->whereIn('id', $userIds)->delete();
    }

    /**
     * Find users by IDs.
     */
    public function findByIds(array $userIds): Collection
    {
        return $this->model->whereIn('id', $userIds)->get();
    }

    /**
     * Check if user can be deleted (not current user).
     */
    public function canDelete(User $user, int $currentUserId): bool
    {
        return $user->id !== $currentUserId;
    }

    /**
     * Filter user IDs excluding current user.
     */
    public function filterExcludingCurrentUser(array $userIds, int $currentUserId): array
    {
        return array_filter($userIds, fn($id) => $id != $currentUserId);
    }

    /**
     * Apply filters to the query.
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        // Search filter (case-insensitive)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(email) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        // Role filter
        if (!empty($filters['roles'])) {
            $roles = is_string($filters['roles']) 
                ? explode(',', $filters['roles']) 
                : $filters['roles'];
            
            $query->whereIn('role', $roles);
        }
    }
}