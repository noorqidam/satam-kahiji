import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import type { UserRole } from '@/constants/roles';
import type { UserFilters as UserFiltersType } from '@/types/user';
import { Search, Trash2, X } from 'lucide-react';

interface UserFiltersProps {
    filters: UserFiltersType;
    searchValue: string;
    isLoading: boolean;
    availableRoles: UserRole[];
    roleLabels: Record<UserRole, string>;
    roleColors: Record<UserRole, string>;
    selectedUsers: number[];
    onSearchChange: (search: string) => void;
    onRolesChange: (roles: UserRole[]) => void;
    onClearFilters: () => void;
    onBulkDelete: () => void;
}

export function UserFilters({
    filters,
    searchValue,
    isLoading,
    availableRoles,
    roleLabels,
    roleColors,
    selectedUsers,
    onSearchChange,
    onRolesChange,
    onClearFilters,
    onBulkDelete,
}: UserFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 sm:w-64"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <MultiSelectDropdown
                        options={availableRoles}
                        selected={filters.roles}
                        onSelectionChange={onRolesChange}
                        placeholder="Filter by roles"
                        getLabel={(role) => roleLabels[role]}
                    />
                </div>
            </div>

            {(filters.search || filters.roles.length > 0 || selectedUsers.length > 0) && (
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        {filters.search && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Search: "{filters.search}"
                            </span>
                        )}
                        {filters.roles.map((role) => (
                            <span
                                key={role}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role]}`}
                            >
                                {roleLabels[role]}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                        {selectedUsers.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isLoading}>
                                <Trash2 className="mr-1 h-3 w-3" />
                                <span className="hidden sm:inline">Delete Selected ({selectedUsers.length})</span>
                                <span className="sm:hidden">Delete ({selectedUsers.length})</span>
                            </Button>
                        )}
                        {(filters.search || filters.roles.length > 0) && (
                            <Button variant="ghost" size="sm" onClick={onClearFilters}>
                                <X className="mr-1 h-3 w-3" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
