import { Search, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SubjectFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onClearFilters: () => void;
    selectedCount: number;
    onBulkDelete: () => void;
}

export function SubjectFilters({ searchTerm, onSearchChange, onClearFilters, selectedCount, onBulkDelete }: SubjectFiltersProps) {
    return (
        <>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <CardTitle>All Subjects</CardTitle>
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by name or code"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 sm:w-64"
                        />
                    </div>
                </div>
            </div>

            {(searchTerm || selectedCount > 0) && (
                <div className="mt-4 flex flex-col space-y-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Search: "{searchTerm}"
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                        {selectedCount > 0 && (
                            <Button variant="destructive" size="sm" onClick={onBulkDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected ({selectedCount})
                            </Button>
                        )}
                        {searchTerm && (
                            <Button variant="outline" size="sm" onClick={onClearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
