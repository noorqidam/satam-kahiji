import { Head, Link } from '@inertiajs/react';
import { Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';

// Clean components following SRP
import { StaffDialogs } from '@/components/admin/staff/StaffDialogs';
import { StaffFilters } from '@/components/admin/staff/StaffFilters';
import { StaffTable } from '@/components/admin/staff/StaffTable';

// Custom hooks for business logic
import { useStaffFilters } from '@/hooks/useStaffFilters';
import { useStaffOperations } from '@/hooks/useStaffOperations';
import { useStaffSelection } from '@/hooks/useStaffSelection';

// Types
import type { PaginationData } from '@/components/ui/pagination';
import type { BreadcrumbItem } from '@/types';
import type { Staff, StaffDivision, StaffFilters as StaffFiltersType } from '@/types/staff';

// Constants
import { availableDivisions, divisionColors, divisionLabels } from '@/constants/divisions';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Staff Management', href: '/admin/staff' },
];

interface StaffIndexProps {
    staff: PaginationData & {
        data: Staff[];
    };
    filters?: StaffFiltersType;
}

export default function StaffIndex({ staff, filters = { search: '', divisions: [] } }: StaffIndexProps) {
    // Business logic hooks
    const filterHook = useStaffFilters({ initialFilters: filters });
    const selectionHook = useStaffSelection({ staff: staff.data });
    const operationsHook = useStaffOperations();

    // Event handlers - clean delegation to appropriate hooks
    const handleDivisionsChange = (divisions: StaffDivision[]) => {
        filterHook.updateFilters({ divisions });
    };

    const handleBulkDelete = () => {
        operationsHook.setShowBulkDeleteConfirm(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />

            <div className="space-y-6 px-4 sm:px-6">
                {/* Header Section */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Staff Management</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Manage staff members and their information</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={filterHook.refreshData} disabled={filterHook.isLoading} className="w-full sm:w-auto">
                            <RefreshCw className={`mr-2 h-4 w-4 ${filterHook.isLoading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                        <Link href={route('admin.staff.create')}>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Add New Staff</span>
                                <span className="sm:hidden">Add Staff</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <CardTitle>All Staff ({staff.total})</CardTitle>

                            {/* Filter Component */}
                            <StaffFilters
                                filters={filterHook.filters}
                                searchValue={filterHook.searchValue}
                                isLoading={filterHook.isLoading}
                                availableDivisions={availableDivisions}
                                divisionLabels={divisionLabels}
                                divisionColors={divisionColors}
                                selectedStaff={selectionHook.selectedStaff}
                                onSearchChange={filterHook.handleSearchChange}
                                onDivisionsChange={handleDivisionsChange}
                                onClearFilters={filterHook.clearFilters}
                                onBulkDelete={handleBulkDelete}
                            />
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Table Component */}
                        <StaffTable
                            staff={staff.data}
                            selectedStaff={selectionHook.selectedStaff}
                            deletableStaff={selectionHook.deletableStaff}
                            isAllSelected={selectionHook.isAllSelected}
                            isPartiallySelected={selectionHook.isPartiallySelected}
                            divisionLabels={divisionLabels}
                            divisionColors={divisionColors}
                            onSelectAll={selectionHook.handleSelectAll}
                            onSelectStaff={selectionHook.handleSelectStaff}
                            onViewStaff={operationsHook.setShowStaffDialog}
                            onDeleteStaff={operationsHook.setStaffToDelete}
                            isLoading={operationsHook.isLoading}
                        />

                        {staff.data.length === 0 && (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filterHook.filters.search || filterHook.filters.divisions.length > 0
                                        ? 'No staff members match the current filters.'
                                        : 'No staff members found.'}
                                </p>
                            </div>
                        )}

                        {staff.data.length > 0 && staff.last_page > 1 && (
                            <div className="mt-6">
                                <Pagination data={staff} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Components */}
            <StaffDialogs
                operations={operationsHook}
                divisionLabels={divisionLabels}
                divisionColors={divisionColors}
                selectedStaff={selectionHook.selectedStaff}
                onBulkDelete={operationsHook.handleBulkDelete}
                onClearSelection={selectionHook.clearSelection}
            />
        </AppLayout>
    );
}
