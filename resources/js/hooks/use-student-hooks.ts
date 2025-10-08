import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { type Student } from '@/types/student';

export function useStudentFilters(initialSearch: string = '', initialGender: string = '', initialStatus: string = '') {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [genderFilter, setGenderFilter] = useState(initialGender);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const updateFilters = useCallback((search: string, gender: string, status: string) => {
        const params: Record<string, string> = {};
        if (search.trim()) {
            params.search = search.trim();
        }
        if (gender) {
            params.gender = gender;
        }
        if (status) {
            params.status = status;
        }
        setIsLoading(true);
        router.get(route('admin.students.index'), params, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    }, []);

    const debouncedUpdateFilters = useCallback(
        (search: string, gender: string, status: string) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const timer = setTimeout(() => updateFilters(search, gender, status), 300);
            setDebounceTimer(timer);
        },
        [debounceTimer, updateFilters],
    );

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setGenderFilter('');
        setStatusFilter('');
        router.get(route('admin.students.index'));
    }, []);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            debouncedUpdateFilters(value, genderFilter, statusFilter);
        },
        [debouncedUpdateFilters, genderFilter, statusFilter],
    );

    const handleGenderFilterChange = useCallback(
        (value: string | undefined) => {
            const filterValue = value || '';
            setGenderFilter(filterValue);
            updateFilters(searchTerm, filterValue, statusFilter);
        },
        [updateFilters, searchTerm, statusFilter],
    );

    const handleStatusFilterChange = useCallback(
        (value: string | undefined) => {
            const filterValue = value || '';
            setStatusFilter(filterValue);
            updateFilters(searchTerm, genderFilter, filterValue);
        },
        [updateFilters, searchTerm, genderFilter],
    );

    return {
        searchTerm,
        genderFilter,
        statusFilter,
        setSearchTerm: handleSearchChange,
        setGenderFilter: handleGenderFilterChange,
        setStatusFilter: handleStatusFilterChange,
        clearFilters,
        isLoading,
    };
}

export function useStudentSelection(students: Student[]) {
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedStudents(students.map((student) => student.id));
            } else {
                setSelectedStudents([]);
            }
        },
        [students],
    );

    const handleSelectStudent = useCallback((studentId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudents((prev) => [...prev, studentId]);
        } else {
            setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
        }
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedStudents([]);
    }, []);

    return {
        selectedStudents,
        handleSelectAll,
        handleSelectStudent,
        clearSelection,
    };
}

export function useStudentActions() {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const deleteStudent = useCallback(
        (student: Student) => {
            setIsDeleting(true);
            router.delete(route('admin.students.destroy', student.id), {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: `${student.name} has been deleted successfully.`,
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete student. Please try again.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsDeleting(false),
            });
        },
        [toast],
    );

    const bulkDelete = useCallback(
        (studentIds: number[]) => {
            setIsDeleting(true);
            router.delete(route('admin.students.bulk-destroy'), {
                data: { ids: studentIds },
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: `${studentIds.length} students have been deleted successfully.`,
                        variant: 'success',
                    });
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete students. Please try again.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsDeleting(false),
            });
        },
        [toast],
    );

    return {
        deleteStudent,
        bulkDelete,
        isDeleting,
    };
}

export function useStudentDataRefresh() {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                router.reload({ only: ['students'] });
            }
        };

        const handleFocus = () => {
            router.reload({ only: ['students'] });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);
}
