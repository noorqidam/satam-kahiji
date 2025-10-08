import type { User } from '@/types/user';
import { useCallback, useState } from 'react';

interface UseUserSelectionProps {
    users: User[];
}

export function useUserSelection({ users }: UseUserSelectionProps) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedUsers(users.map((user) => user.id));
            } else {
                setSelectedUsers([]);
            }
        },
        [users],
    );

    const handleSelectUser = useCallback((userId: number) => {
        setSelectedUsers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    const isAllSelected = selectedUsers.length === users.length && users.length > 0;
    const isPartiallySelected = selectedUsers.length > 0 && selectedUsers.length < users.length;

    return {
        selectedUsers,
        handleSelectAll,
        handleSelectUser,
        clearSelection,
        isAllSelected,
        isPartiallySelected,
    };
}
