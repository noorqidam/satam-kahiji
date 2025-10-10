import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Staff, StaffDivision } from '@/types/staff';
import { Link } from '@inertiajs/react';
import { Plus, User } from 'lucide-react';
import { StaffTableRow } from './StaffTableRow';

interface StaffTableProps {
    staff: Staff[];
    selectedStaff: number[];
    deletableStaff: Staff[];
    isAllSelected: boolean;
    divisionLabels: Record<StaffDivision, string>;
    divisionColors: Record<StaffDivision, string>;
    onSelectAll: (checked: boolean) => void;
    onSelectStaff: (staffId: number, checked: boolean) => void;
    onViewStaff: (staff: Staff) => void;
    onDeleteStaff: (staff: Staff) => void;
    isLoading: boolean;
}

export function StaffTable({
    staff,
    selectedStaff,
    deletableStaff,
    isAllSelected,
    divisionLabels,
    divisionColors,
    onSelectAll,
    onSelectStaff,
    onViewStaff,
    onDeleteStaff,
    isLoading,
}: StaffTableProps) {
    if (staff.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No staff members found</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Get started by adding a new staff member.</p>
                <Link href={route('admin.staff.create')} className="mt-4">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff Member
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${isLoading ? 'opacity-50' : ''}`}>
            <table className="w-full table-auto">
                <thead>
                    <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                        <th className="pr-4 pb-3">
                            <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} disabled={deletableStaff.length === 0} />
                        </th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Photo</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Name</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Position</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Division</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Email</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Phone</th>
                        <th className="pb-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((member) => (
                        <StaffTableRow
                            key={member.id}
                            staff={member}
                            isSelected={selectedStaff.includes(member.id)}
                            isSelectable={!member.user}
                            divisionLabels={divisionLabels}
                            divisionColors={divisionColors}
                            onSelect={onSelectStaff}
                            onView={onViewStaff}
                            onDelete={onDeleteStaff}
                            isLoading={isLoading}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
