import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';

// Clean components following SRP
import { UserDialogs } from '@/components/admin/users/UserDialogs';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UserTable } from '@/components/admin/users/UserTable';

// Custom hooks for business logic
import { useUserFilters } from '@/hooks/useUserFilters';
import { useUserOperations } from '@/hooks/useUserOperations';
import { useUserSelection } from '@/hooks/useUserSelection';

// Types
import type { PaginationData } from '@/components/ui/pagination';
import type { UserRole } from '@/constants/roles';
import type { BreadcrumbItem } from '@/types';
import type { User, UserFilters as UserFiltersType } from '@/types/user';

// Constants
import { availableRoles, roleColors, roleLabels } from '@/constants/roles';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

interface UsersIndexProps {
    users: PaginationData & {
        data: User[];
    };
    filters?: UserFiltersType;
}

/**
 * Clean User Management Component
 *
 * Follows SOLID principles:
 * - Single Responsibility: Only handles composition and data flow
 * - Open/Closed: Extensible through props and hooks
 * - Liskov Substitution: Components are interchangeable
 * - Interface Segregation: Focused, minimal interfaces
 * - Dependency Inversion: Depends on abstractions (hooks, services)
 */
export default function UsersIndex({ users, filters = { search: '', roles: [] } }: UsersIndexProps) {
    // Business logic hooks
    const filterHook = useUserFilters({ initialFilters: filters });
    const selectionHook = useUserSelection({ users: users.data });
    const operationsHook = useUserOperations();

    // Event handlers - clean delegation to appropriate hooks

    const handleRolesChange = (roles: UserRole[]) => {
        filterHook.updateFilters({ roles });
    };

    const handleBulkDelete = () => {
        operationsHook.setShowBulkDeleteConfirm(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 px-4 sm:px-6">
                {/* Header Section */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">User Management</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Manage system users and their roles</p>
                    </div>
                    <Button onClick={() => operationsHook.setShowCreateDialog(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Add New User</span>
                        <span className="sm:hidden">Add User</span>
                    </Button>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <CardTitle>All Users ({users.total})</CardTitle>

                            {/* Filter Component */}
                            <UserFilters
                                filters={filterHook.filters}
                                searchValue={filterHook.searchValue}
                                isLoading={filterHook.isLoading}
                                availableRoles={availableRoles}
                                roleLabels={roleLabels}
                                roleColors={roleColors}
                                selectedUsers={selectionHook.selectedUsers}
                                onSearchChange={filterHook.handleSearchChange}
                                onRolesChange={handleRolesChange}
                                onClearFilters={filterHook.clearFilters}
                                onBulkDelete={handleBulkDelete}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Table Component */}
                        <UserTable
                            users={users.data}
                            selectedUsers={selectionHook.selectedUsers}
                            isAllSelected={selectionHook.isAllSelected}
                            isPartiallySelected={selectionHook.isPartiallySelected}
                            roleLabels={roleLabels}
                            roleColors={roleColors}
                            onSelectAll={selectionHook.handleSelectAll}
                            onSelectUser={selectionHook.handleSelectUser}
                            onViewUser={operationsHook.setShowUserDialog}
                            onEditUser={operationsHook.handleEditUser}
                            onDeleteUser={operationsHook.setUserToDelete}
                            isLoading={operationsHook.isLoading}
                        />

                        {users.data.length === 0 && (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filterHook.filters.search || filterHook.filters.roles.length > 0
                                        ? 'No users match the current filters.'
                                        : 'No users found.'}
                                </p>
                            </div>
                        )}

                        {users.data.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <Pagination data={users} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Components */}
            <UserDialogs
                operations={operationsHook}
                roleLabels={roleLabels}
                roleColors={roleColors}
                availableRoles={availableRoles}
                selectedUsers={selectionHook.selectedUsers}
                onBulkDelete={operationsHook.handleBulkDelete}
                onClearSelection={selectionHook.clearSelection}
            />
        </AppLayout>
    );
}
