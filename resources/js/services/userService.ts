import type { BulkDeleteRequest, CreateUserForm, EditUserForm, User, UserFilters } from '@/types/user';
import { router } from '@inertiajs/react';

export class UserService {
    static updateFilters(filters: UserFilters): void {
        const params: Record<string, string> = {};

        if (filters.search.trim()) {
            params.search = filters.search.trim();
        }

        if (filters.roles.length > 0) {
            params.roles = filters.roles.join(',');
        }

        router.get(route('admin.users.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    static createUser(data: CreateUserForm): Promise<void> {
        return new Promise((resolve, reject) => {
            router.post(route('admin.users.store'), data, {
                onSuccess: () => resolve(),
                onError: () => reject(new Error('Failed to create user')),
            });
        });
    }

    static updateUser(user: User, data: EditUserForm): Promise<void> {
        return new Promise((resolve, reject) => {
            router.put(route('admin.users.update', user.id), data, {
                onSuccess: () => resolve(),
                onError: () => reject(new Error('Failed to update user')),
            });
        });
    }

    static deleteUser(user: User): Promise<void> {
        return new Promise((resolve, reject) => {
            router.delete(route('admin.users.destroy', user.id), {
                onSuccess: () => resolve(),
                onError: (errors) => {
                    console.error('Delete user failed:', errors);
                    reject(new Error('Failed to delete user and related records'));
                },
            });
        });
    }

    static bulkDeleteUsers(userIds: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const requestData: BulkDeleteRequest = { user_ids: userIds };

            router.delete(route('admin.users.bulk-destroy'), {
                data: requestData,
                onSuccess: () => resolve(),
                onError: () => reject(new Error('Failed to delete users')),
            });
        });
    }
}
