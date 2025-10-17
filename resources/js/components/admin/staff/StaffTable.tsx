import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Staff, StaffDivision } from '@/types/staff';
import { Link } from '@inertiajs/react';
import { Plus, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StaffTableRow } from './StaffTableRow';

interface StaffTableProps {
    staff: Staff[];
    selectedStaff: number[];
    deletableStaff: Staff[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
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
    isPartiallySelected,
    divisionLabels,
    divisionColors,
    onSelectAll,
    onSelectStaff,
    onViewStaff,
    onDeleteStaff,
    isLoading,
}: StaffTableProps) {
    const { t } = useTranslation();
    if (staff.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.no_staff_found')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('staff_management.table.get_started')}</p>
                <Link href={route('admin.staff.create')} className="mt-4">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('staff_management.actions.add_staff_member')}
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
                            <Checkbox checked={isAllSelected || isPartiallySelected} onCheckedChange={onSelectAll} disabled={deletableStaff.length === 0} />
                        </th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.photo')}</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.name')}</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.position')}</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.division')}</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.email')}</th>
                        <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.phone')}</th>
                        <th className="pb-3 font-medium text-gray-900 dark:text-gray-100">{t('staff_management.table.actions')}</th>
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
