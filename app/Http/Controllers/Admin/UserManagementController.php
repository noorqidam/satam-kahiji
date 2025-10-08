<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkDeleteUserRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->get('search', ''),
            'roles' => $request->get('roles', []),
        ];

        // Ensure roles is always an array
        if (is_string($filters['roles'])) {
            $filters['roles'] = explode(',', $filters['roles']);
        }

        $users = $this->userService->getPaginatedUsers($filters, 10);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }


    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        try {
            $this->userService->createUser($request->validated());

            return redirect()->route('admin.users.index')
                ->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        try {
            $this->userService->updateUser($user, $request->validated());

            return redirect()->route('admin.users.index')
                ->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        try {
            $this->userService->deleteUser($user, Auth::id());

            return redirect()->route('admin.users.index')
                ->with('success', 'User deleted successfully.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->route('admin.users.index')
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }

    /**
     * Remove multiple users from storage.
     */
    public function bulkDestroy(BulkDeleteUserRequest $request): RedirectResponse
    {
        try {
            $result = $this->userService->bulkDeleteUsers(
                $request->validated('user_ids'),
                Auth::id()
            );

            return redirect()->route('admin.users.index')
                ->with('success', "Successfully deleted {$result['deleted_count']} user(s).");
        } catch (\InvalidArgumentException $e) {
            return redirect()->route('admin.users.index')
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Failed to delete users: ' . $e->getMessage());
        }
    }
}
