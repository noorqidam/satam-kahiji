import { Link } from '@inertiajs/react';
import { Plus, Search, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onClearFilters: () => void;
    selectedStudents: number[];
    onBulkDelete: () => void;
    isLoading: boolean;
    genderFilter: string;
    onGenderFilterChange: (value: string | undefined) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string | undefined) => void;
}

export function StudentFilters({
    searchTerm,
    onSearchChange,
    onClearFilters,
    selectedStudents,
    onBulkDelete,
    isLoading,
    genderFilter,
    onGenderFilterChange,
    statusFilter,
    onStatusFilterChange,
}: StudentFiltersProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search students"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                    {searchTerm && (
                        <Button variant="ghost" size="sm" onClick={onClearFilters} className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="min-w-[140px]">
                    <Select value={genderFilter || undefined} onValueChange={onGenderFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="All genders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-w-[140px]">
                    <Select value={statusFilter || undefined} onValueChange={onStatusFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="All status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="graduated">Graduated</SelectItem>
                            <SelectItem value="transferred">Transferred</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {selectedStudents.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={onBulkDelete} disabled={isLoading} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedStudents.length})
                    </Button>
                )}

                <Link href={route('admin.students.create')}>
                    <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Student
                    </Button>
                </Link>
            </div>
        </div>
    );
}
