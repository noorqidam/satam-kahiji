import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserRole } from '@/constants/roles';
import type { User as UserType } from '@/types/user';
import { Link } from '@inertiajs/react';
import { Plus, User } from 'lucide-react';
import { UserTableRow } from './UserTableRow';

interface UserTableProps {
    users: UserType[];
    selectedUsers: number[];
    isAllSelected: boolean;
    isPartiallySelected: boolean;
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
    isPartiallySelected,
    roleLabels,
    roleColors,
    onSelectAll,
    onSelectUser,
    onViewUser,
    onEditUser,
    onDeleteUser,
    isLoading,
}: UserTableProps) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No users found</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Get started by adding a new user.</p>
                <Link href={route('admin.users.create')} className="mt-4">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </Link>
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
                        <th className="min-w-[120px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">Name</th>
                        <th className="hidden min-w-[150px] px-2 py-3 text-left font-medium text-gray-400 sm:table-cell sm:px-4 dark:text-gray-400">
                            Email
                        </th>
                        <th className="min-w-[100px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">Role</th>
                        <th className="hidden min-w-[100px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 md:table-cell dark:text-gray-400">
                            Created
                        </th>
                        <th className="min-w-[120px] px-2 py-3 text-right font-medium text-gray-400 sm:px-4 dark:text-gray-400">Actions</th>
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
