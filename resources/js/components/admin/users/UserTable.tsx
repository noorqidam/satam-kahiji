import { Checkbox } from '@/components/ui/checkbox';
import type { UserRole } from '@/constants/roles';
import type { User as UserType } from '@/types/user';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserTableRow } from './UserTableRow';

// Import i18n to ensure it's initialized

interface UserTableProps {
    users: UserType[];
    selectedUsers: number[];
    isAllSelected: boolean;
    roleLabels: Record<UserRole, string>;
    roleColors: Record<UserRole, string>;
    onSelectAll: (checked: boolean) => void;
    onSelectUser: (userId: number) => void;
    onViewUser: (user: UserType) => void;
    onEditUser: (user: UserType) => void;
    onDeleteUser: (user: UserType) => void;
    isLoading: boolean;
}

export function UserTable({
    users,
    selectedUsers,
    isAllSelected,
    roleLabels,
    roleColors,
    onSelectAll,
    onSelectUser,
    onViewUser,
    onEditUser,
    onDeleteUser,
    isLoading,
}: UserTableProps) {
    const { t } = useTranslation();
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">{t('user_management.table.no_users_found')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('user_management.table.get_started')}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${isLoading ? 'opacity-50' : ''}`}>
            <table className="min-w-full table-auto">
                <thead className="sticky top-0 z-10">
                    <tr className="border-b border-gray-100 bg-gray-50 dark:bg-gray-800">
                        <th className="w-12 px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={onSelectAll}
                                disabled={isLoading}
                                className="border-gray-300 data-[state=checked]:bg-gray-500 data-[state=checked]:text-white"
                            />
                        </th>
                        <th className="min-w-[120px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                            {t('user_management.table.name')}
                        </th>
                        <th className="hidden min-w-[150px] px-2 py-3 text-left font-medium text-gray-400 sm:table-cell sm:px-4 dark:text-gray-400">
                            {t('user_management.table.email')}
                        </th>
                        <th className="min-w-[100px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                            {t('user_management.table.role')}
                        </th>
                        <th className="hidden min-w-[100px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 md:table-cell dark:text-gray-400">
                            {t('user_management.table.created')}
                        </th>
                        <th className="min-w-[120px] px-2 py-3 text-right font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                            {t('user_management.table.actions')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <UserTableRow
                            key={user.id}
                            user={user}
                            isSelected={selectedUsers.includes(user.id)}
                            roleLabels={roleLabels}
                            roleColors={roleColors}
                            onSelect={onSelectUser}
                            onView={onViewUser}
                            onEdit={onEditUser}
                            onDelete={onDeleteUser}
                            isLoading={isLoading}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
