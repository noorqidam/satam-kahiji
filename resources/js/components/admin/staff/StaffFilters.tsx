import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import type { StaffDivision, StaffFilters as StaffFiltersType } from '@/types/staff';
import { Search, Trash2, X } from 'lucide-react';

interface StaffFiltersProps {
    filters: StaffFiltersType;
    searchValue: string;
    isLoading: boolean;
    availableDivisions: StaffDivision[];
    divisionLabels: Record<StaffDivision, string>;
    divisionColors: Record<StaffDivision, string>;
    selectedStaff: number[];
    onSearchChange: (search: string) => void;
    onDivisionsChange: (divisions: StaffDivision[]) => void;
    onClearFilters: () => void;
    onBulkDelete: () => void;
}

export function StaffFilters({
    filters,
    searchValue,
    isLoading,
    availableDivisions,
    divisionLabels,
    divisionColors,
    selectedStaff,
    onSearchChange,
    onDivisionsChange,
    onClearFilters,
    onBulkDelete,
}: StaffFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by name, position"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 sm:w-64"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <MultiSelectDropdown
                        options={availableDivisions}
                        selected={filters.divisions}
                        onSelectionChange={onDivisionsChange}
                        placeholder="Filter by divisions"
                        getLabel={(division) => divisionLabels[division]}
                    />
                </div>
            </div>

            {(filters.search || filters.divisions.length > 0 || selectedStaff.length > 0) && (
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        {filters.search && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Search: "{filters.search}"
                            </span>
                        )}
                        {filters.divisions.map((division) => (
                            <span
                                key={division}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${divisionColors[division]}`}
                            >
                                {divisionLabels[division]}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                        {selectedStaff.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isLoading}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedStaff.length})
                            </Button>
                        )}
                        {(filters.search || filters.divisions.length > 0) && (
                            <Button variant="outline" size="sm" onClick={onClearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
