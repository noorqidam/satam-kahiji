import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserRole } from '@/constants/roles';
import type { User } from '@/types/user';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface UserTableRowProps {
    user: User;
    isSelected: boolean;
    roleLabels: Record<UserRole, string>;
    roleColors: Record<UserRole, string>;
    onSelect: (userId: number) => void;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    isLoading: boolean;
}

export function UserTableRow({ user, isSelected, roleLabels, roleColors, onSelect, onView, onEdit, onDelete, isLoading }: UserTableRowProps) {
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
            <td className="px-2 py-3 sm:px-4">
                <Checkbox checked={isSelected} onCheckedChange={() => onSelect(user.id)} disabled={isLoading} />
            </td>
            <td className="px-2 py-3 font-medium text-gray-900 sm:px-4 dark:text-gray-100">
                <div>
                    <div>{user.name}</div>
                    <div className="text-sm text-gray-500 sm:hidden dark:text-gray-400">{user.email}</div>
                </div>
            </td>
            <td className="hidden px-2 py-3 text-gray-600 sm:table-cell sm:px-4 dark:text-gray-400">{user.email}</td>
            <td className="px-2 py-3 sm:px-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                </span>
            </td>
            <td className="hidden px-2 py-3 text-gray-600 sm:px-4 md:table-cell dark:text-gray-400">
                {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="px-2 py-3 sm:px-4">
                <div className="flex items-center justify-end space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(user)} disabled={isLoading}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)} disabled={isLoading}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(user)} disabled={isLoading}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            </td>
        </tr>
    );
}
