// Refactored UserFilters component using SOLID principles and DRY approach
// Single Responsibility: Handle user-specific filtering only
// Open/Closed: Extensible through composition with GenericFilters
// Dependency Inversion: Depends on generic filter abstractions

import { GenericFilters } from '@/components/common/GenericFilters';
import { Button } from '@/components/ui/button';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import type { UserRole } from '@/constants/roles';
import type { UserFilters as UserFiltersType } from '@/types/user';
import { Trash2 } from 'lucide-react';

interface UserFiltersProps {
    filters: UserFiltersType;
    isLoading: boolean;
    availableRoles: UserRole[];
    roleLabels: Record<UserRole, string>;
    roleColors: Record<UserRole, string>;
    selectedUsers: number[];
    onFilterChange: <K extends keyof UserFiltersType>(key: K, value: UserFiltersType[K]) => void;
    onResetFilters: () => void;
    onBulkDelete: () => void;
}

export function UserFiltersRefactored({
    filters,
    isLoading,
    availableRoles,
    roleLabels,
    roleColors,
    selectedUsers,
    onFilterChange,
    onResetFilters,
    onBulkDelete,
}: UserFiltersProps) {
    // User-specific additional filters
    const additionalFilters = (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Role Filter */}
            <div className="w-full sm:w-48">
                <MultiSelectDropdown
                    options={availableRoles}
                    selected={filters.roles}
                    onSelectionChange={(roles) => onFilterChange('roles', roles)}
                    placeholder="Filter by roles"
                    getLabel={(role) => roleLabels[role]}
                />
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isLoading} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete Selected ({selectedUsers.length})</span>
                        <span className="sm:hidden">Delete ({selectedUsers.length})</span>
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <GenericFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            placeholder="Search users by name, email..."
            additionalFilters={additionalFilters}
        />
    );
}

// Alternative approach using the EntityFilters component
export function UserFiltersAlternative({
    filters,
    isLoading,
    availableRoles,
    roleLabels,
    roleColors,
    selectedUsers,
    onFilterChange,
    onResetFilters,
    onBulkDelete,
}: UserFiltersProps) {
    return (
        <div className="space-y-4">
            {/* Use the generic EntityFilters */}
            <GenericFilters
                filters={filters}
                onFilterChange={onFilterChange}
                onResetFilters={onResetFilters}
                placeholder="Search users by name, email..."
            />

            {/* User-specific filters and actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {/* Role chips with custom styling */}
                    {filters.roles.map((role) => (
                        <div key={role} className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${roleColors[role]}`}>
                            <span>{roleLabels[role]}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    const newRoles = filters.roles.filter((r) => r !== role);
                                    onFilterChange('roles', newRoles);
                                }}
                                className="ml-1 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <MultiSelectDropdown
                        options={availableRoles}
                        selected={filters.roles}
                        onSelectionChange={(roles) => onFilterChange('roles', roles)}
                        placeholder="Add role filter"
                        getLabel={(role) => roleLabels[role]}
                    />

                    {selectedUsers.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isLoading}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected ({selectedUsers.length})
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
