import { StaffService } from '@/services/staffService';
import type { StaffFilters } from '@/types/staff';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseStaffFiltersProps {
    initialFilters: StaffFilters;
}

export function useStaffFilters({ initialFilters }: UseStaffFiltersProps) {
    const [filters, setFilters] = useState<StaffFilters>(initialFilters);
    const [searchValue, setSearchValue] = useState<string>(initialFilters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Mark as no longer initial load after first render
    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    const updateFilters = useCallback(
        (newFilters: Partial<StaffFilters>) => {
            const updatedFilters = { ...filters, ...newFilters };
            setFilters(updatedFilters);

            setIsLoading(true);
            // Use preserveState for filtering to maintain user experience
            StaffService.updateFilters(updatedFilters, { preserveState: true, preserveScroll: true });

            setTimeout(() => setIsLoading(false), 300);
        },
        [filters],
    );

    const handleSearchChange = useCallback(
        (search: string) => {
            setSearchValue(search);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                const updatedFilters = { ...filters, search };
                setFilters(updatedFilters);
                setIsLoading(true);
                // Use preserveState for search to maintain user experience
                StaffService.updateFilters(updatedFilters, { preserveState: true, preserveScroll: true });
                setTimeout(() => setIsLoading(false), 300);
            }, 300);
        },
        [filters],
    );

    const clearFilters = useCallback(() => {
        const clearedFilters: StaffFilters = { search: '', divisions: [] };
        setFilters(clearedFilters);
        setSearchValue('');
        // Force fresh data when clearing filters to ensure clean state
        StaffService.updateFilters(clearedFilters, { preserveState: false, preserveScroll: false });
    }, []);

    const refreshData = useCallback(() => {
        setIsLoading(true);
        // Force fresh data fetch without preserving state
        StaffService.updateFilters(filters, { preserveState: false, preserveScroll: false });
        setTimeout(() => setIsLoading(false), 300);
    }, [filters]);

    return {
        filters,
        searchValue,
        isLoading,
        isInitialLoad,
        updateFilters,
        handleSearchChange,
        clearFilters,
        refreshData,
        setFilters,
    };
}
