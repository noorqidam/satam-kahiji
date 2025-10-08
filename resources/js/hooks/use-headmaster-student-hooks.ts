import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export function useHeadmasterStudentFilters(initialSearch: string = '', initialGender: string = '', initialStatus: string = '') {
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
        if (gender && gender !== 'all') {
            params.gender = gender;
        }
        if (status && status !== 'all') {
            params.status = status;
        }
        setIsLoading(true);
        router.get(route('headmaster.students.index'), params, {
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
        setGenderFilter('all');
        setStatusFilter('all');
        router.get(route('headmaster.students.index'));
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
            const filterValue = value || 'all';
            setGenderFilter(filterValue);
            updateFilters(searchTerm, filterValue, statusFilter);
        },
        [updateFilters, searchTerm, statusFilter],
    );

    const handleStatusFilterChange = useCallback(
        (value: string | undefined) => {
            const filterValue = value || 'all';
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

export function useHeadmasterStudentDataRefresh() {
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
