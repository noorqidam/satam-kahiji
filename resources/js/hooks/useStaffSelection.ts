import type { Staff } from '@/types/staff';
import { useCallback, useState } from 'react';

interface UseStaffSelectionProps {
    staff: Staff[];
}

export function useStaffSelection({ staff }: UseStaffSelectionProps) {
    const [selectedStaff, setSelectedStaff] = useState<number[]>([]);

    // Only staff members without user accounts can be deleted
    const deletableStaff = staff.filter((member) => !member.user);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedStaff(deletableStaff.map((member) => member.id));
            } else {
                setSelectedStaff([]);
            }
        },
        [deletableStaff],
    );

    const handleSelectStaff = useCallback((staffId: number, checked: boolean) => {
        if (checked) {
            setSelectedStaff((prev) => [...prev, staffId]);
        } else {
            setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedStaff([]);
    }, []);

    const isAllSelected = selectedStaff.length === deletableStaff.length && deletableStaff.length > 0;
    const isPartiallySelected = selectedStaff.length > 0 && selectedStaff.length < deletableStaff.length;

    return {
        selectedStaff,
        deletableStaff,
        handleSelectAll,
        handleSelectStaff,
        clearSelection,
        isAllSelected,
        isPartiallySelected,
    };
}
