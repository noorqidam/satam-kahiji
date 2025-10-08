import type { BulkDeleteStaffRequest, CreateStaffForm, EditStaffForm, Staff, StaffFilters } from '@/types/staff';
import { router } from '@inertiajs/react';

export class StaffService {
    static updateFilters(filters: StaffFilters, options: { preserveState?: boolean; preserveScroll?: boolean } = {}): void {
        const params: Record<string, string> = {};

        if (filters.search.trim()) {
            params.search = filters.search.trim();
        }

        if (filters.divisions.length > 0) {
            params.divisions = filters.divisions.join(',');
        }

        // Default to preserving state for filtering, but allow override for fresh data
        const { preserveState = true, preserveScroll = true } = options;

        router.get(route('admin.staff.index'), params, {
            preserveState,
            preserveScroll,
        });
    }

    /**
     * Navigate to staff management with fresh data
     */
    static navigateToStaffManagement(filters?: StaffFilters): void {
        const params: Record<string, string> = {};

        if (filters?.search?.trim()) {
            params.search = filters.search.trim();
        }

        if (filters?.divisions && filters.divisions.length > 0) {
            params.divisions = filters.divisions.join(',');
        }

        // Force fresh data fetch by not preserving state
        router.get(route('admin.staff.index'), params, {
            preserveState: false,
            preserveScroll: false,
        });
    }

    static createStaff(data: CreateStaffForm): Promise<void> {
        return new Promise((resolve, reject) => {
            router.post(route('admin.staff.store'), data, {
                onSuccess: () => resolve(),
                onError: () => reject(new Error('Failed to create staff member')),
            });
        });
    }

    static updateStaff(staff: Staff, data: EditStaffForm): Promise<void> {
        return new Promise((resolve, reject) => {
            router.put(route('admin.staff.update', staff.id), data, {
                onSuccess: () => resolve(),
                onError: (errors) => {
                    console.error('Update staff failed:', errors);
                    reject(new Error('Failed to update staff member'));
                },
            });
        });
    }

    static deleteStaff(staff: Staff): Promise<void> {
        return new Promise((resolve, reject) => {
            router.delete(route('admin.staff.destroy', staff.id), {
                onSuccess: () => resolve(),
                onError: (errors) => {
                    console.error('Delete staff failed:', errors);
                    reject(new Error('Failed to delete staff member and related records'));
                },
            });
        });
    }

    static bulkDeleteStaff(staffIds: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const requestData: BulkDeleteStaffRequest = { staff_ids: staffIds };

            router.delete(route('admin.staff.bulk-destroy'), {
                data: requestData,
                onSuccess: () => resolve(),
                onError: () => reject(new Error('Failed to delete staff members')),
            });
        });
    }
}
