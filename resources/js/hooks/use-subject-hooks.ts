import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { type Subject } from '@/types/subject';

export function useSubjectFilters(initialSearch: string = '') {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const updateFilters = useCallback((search: string) => {
        const params: Record<string, string> = {};
        if (search.trim()) {
            params.search = search.trim();
        }
        setIsLoading(true);
        router.get(route('admin.subjects.index'), params, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    }, []);

    const debouncedUpdateFilters = useCallback(
        (search: string) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const timer = setTimeout(() => updateFilters(search), 300);
            setDebounceTimer(timer);
        },
        [debounceTimer, updateFilters],
    );

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        router.get(route('admin.subjects.index'));
    }, []);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            debouncedUpdateFilters(value);
        },
        [debouncedUpdateFilters],
    );

    return {
        searchTerm,
        setSearchTerm: handleSearchChange,
        clearFilters,
        isLoading,
    };
}

export function useSubjectSelection(subjects: Subject[]) {
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedSubjects(subjects.map((subject) => subject.id));
            } else {
                setSelectedSubjects([]);
            }
        },
        [subjects],
    );

    const handleSelectSubject = useCallback((subjectId: number, checked: boolean) => {
        if (checked) {
            setSelectedSubjects((prev) => [...prev, subjectId]);
        } else {
            setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedSubjects([]);
    }, []);

    return {
        selectedSubjects,
        handleSelectAll,
        handleSelectSubject,
        clearSelection,
    };
}

export function useSubjectActions() {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const deleteSubject = useCallback(
        (subject: Subject) => {
            setIsDeleting(true);
            router.delete(route('admin.subjects.destroy', subject.id), {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: `${subject.name} has been deleted successfully.`,
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete subject. Please try again.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsDeleting(false),
            });
        },
        [toast],
    );

    const bulkDelete = useCallback(
        (subjectIds: number[]) => {
            setIsDeleting(true);
            router.delete(route('admin.subjects.bulk-destroy'), {
                data: { ids: subjectIds },
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: `${subjectIds.length} subjects have been deleted successfully.`,
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete subjects. Please try again.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsDeleting(false),
            });
        },
        [toast],
    );

    return {
        deleteSubject,
        bulkDelete,
        isDeleting,
    };
}

export function useSubjectDataRefresh() {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                router.reload({ only: ['subjects'] });
            }
        };

        const handleFocus = () => {
            router.reload({ only: ['subjects'] });
        };

        const handleSubjectAssignmentChange = () => {
            router.reload({ only: ['subjects'] });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('subject-staff-updated', handleSubjectAssignmentChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('subject-staff-updated', handleSubjectAssignmentChange);
        };
    }, []);
}

export function useStaffAssignment(subject: Subject, initialSelectedStaff?: number[]) {
    const [selectedStaff, setSelectedStaff] = useState<number[]>(initialSelectedStaff || subject.staff?.map((staff) => staff.id) || []);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
    const { toast } = useToast();

    const handleStaffSelection = useCallback((staffId: number, checked: boolean) => {
        if (checked) {
            setSelectedStaff((prev) => [...prev, staffId]);
        } else {
            setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
        }
    }, []);

    const assignStaff = useCallback(() => {
        if (selectedStaff.length === 0) {
            toast({
                title: 'Error',
                description: 'Please select at least one staff member to assign.',
                variant: 'destructive',
            });
            return;
        }

        setIsAssigning(true);
        router.post(
            route('admin.subjects.assign-staff', subject.id),
            {
                staff_ids: [...new Set([...(subject.staff?.map((s) => s.id) || []), ...selectedStaff])],
            },
            {
                onSuccess: () => {
                    setSelectedStaff([]);
                    setShowAssignmentPanel(false);
                    toast({
                        title: 'Success',
                        description: 'Staff assigned successfully.',
                        variant: 'success',
                    });
                    window.dispatchEvent(new CustomEvent('subject-staff-updated'));
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to assign staff.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsAssigning(false),
            },
        );
    }, [selectedStaff, subject.id, subject.staff, toast]);

    const removeStaffMember = useCallback(
        (staffId: number) => {
            router.delete(route('admin.subjects.remove-staff', subject.id), {
                data: { staff_id: staffId },
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Staff member removed successfully.',
                        variant: 'success',
                    });
                    window.dispatchEvent(new CustomEvent('subject-staff-updated'));
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to remove staff member.',
                        variant: 'destructive',
                    });
                },
            });
        },
        [subject.id, toast],
    );

    const toggleAssignmentPanel = useCallback(() => {
        setShowAssignmentPanel((prev) => !prev);
    }, []);

    const cancelAssignment = useCallback(() => {
        setShowAssignmentPanel(false);
        setSelectedStaff([]);
    }, []);

    return {
        selectedStaff,
        isAssigning,
        showAssignmentPanel,
        handleStaffSelection,
        assignStaff,
        removeStaffMember,
        toggleAssignmentPanel,
        cancelAssignment,
    };
}

export function useStaffAssignmentEdit(subject: Subject) {
    const [selectedStaff, setSelectedStaff] = useState<number[]>(subject.staff?.map((staff) => staff.id) || []);
    const [isAssigning, setIsAssigning] = useState(false);
    const { toast } = useToast();

    const handleStaffSelection = useCallback((staffId: number, checked: boolean) => {
        if (checked) {
            setSelectedStaff((prev) => [...prev, staffId]);
        } else {
            setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
        }
    }, []);

    const updateAssignments = useCallback(() => {
        // Compare current selections with original assignments
        const currentStaffIds = subject.staff?.map((staff) => staff.id).sort() || [];
        const selectedStaffIds = [...selectedStaff].sort();

        // Check if there are any changes
        const hasChanges =
            currentStaffIds.length !== selectedStaffIds.length || !currentStaffIds.every((id, index) => id === selectedStaffIds[index]);

        if (!hasChanges) {
            toast({
                title: 'No Changes',
                description: 'No changes detected in staff assignments.',
                variant: 'default',
            });
            return;
        }

        setIsAssigning(true);
        router.post(
            route('admin.subjects.assign-staff', subject.id),
            {
                staff_ids: selectedStaff,
            },
            {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Staff assignments updated successfully.',
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to update staff assignments.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsAssigning(false),
            },
        );
    }, [selectedStaff, subject.id, subject.staff, toast]);

    const removeStaffMember = useCallback(
        (staffId: number) => {
            router.delete(route('admin.subjects.remove-staff', subject.id), {
                data: { staff_id: staffId },
                onSuccess: () => {
                    // Update local state to uncheck the checkbox
                    setSelectedStaff((prev) => prev.filter((id) => id !== staffId));
                    toast({
                        title: 'Success',
                        description: 'Staff member removed successfully.',
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to remove staff member.',
                        variant: 'destructive',
                    });
                },
            });
        },
        [subject.id, toast],
    );

    return {
        selectedStaff,
        isAssigning,
        handleStaffSelection,
        updateAssignments,
        removeStaffMember,
    };
}
