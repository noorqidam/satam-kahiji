import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Staff, StaffDivision } from '@/types/staff';
import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import i18n to ensure it's initialized

interface StaffTableRowProps {
    staff: Staff;
    isSelected: boolean;
    isSelectable: boolean;
    divisionLabels: Record<StaffDivision, string>;
    divisionColors: Record<StaffDivision, string>;
    onSelect: (staffId: number, checked: boolean) => void;
    onView: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    isLoading: boolean;
}

export function StaffTableRow({
    staff,
    isSelected,
    isSelectable,
    divisionLabels,
    divisionColors,
    onSelect,
    onView,
    onDelete,
    isLoading,
}: StaffTableRowProps) {
    const { t } = useTranslation();
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
            <td className="py-4 pr-4">
                <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(staff.id, checked as boolean)} disabled={!isSelectable} />
            </td>
            <td className="py-4 pr-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    {staff.photo ? (
                        <img src={staff.photo_url || staff.photo} alt={staff.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </td>
            <td className="py-4 pr-4">
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{staff.name}</div>
                    {staff.user && <div className="text-sm text-gray-500 dark:text-gray-400">User: {staff.user.role.replace('_', ' ')}</div>}
                </div>
            </td>
            <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{staff.position}</td>
            <td className="py-4 pr-4">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        divisionColors[staff.division] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                >
                    {divisionLabels[staff.division] || staff.division}
                </span>
            </td>
            <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{staff.email}</td>
            <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{staff.phone || '-'}</td>
            <td className="py-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(staff)} className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">{t('staff_management.actions_sr.view')}</span>
                    </Button>
                    <Link href={route('admin.staff.edit', staff.id)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t('staff_management.actions_sr.edit')}</span>
                        </Button>
                    </Link>
                    {!staff.user && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(staff)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t('staff_management.actions_sr.delete')}</span>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}
