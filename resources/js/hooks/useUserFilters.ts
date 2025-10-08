import { UserService } from '@/services/userService';
import type { UserFilters } from '@/types/user';
import { useCallback, useRef, useState } from 'react';

interface UseUserFiltersProps {
    initialFilters: UserFilters;
}

export function useUserFilters({ initialFilters }: UseUserFiltersProps) {
    const [filters, setFilters] = useState<UserFilters>(initialFilters);
    const [searchValue, setSearchValue] = useState<string>(initialFilters.search);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilters = useCallback(
        (newFilters: Partial<UserFilters>) => {
            const updatedFilters = { ...filters, ...newFilters };
            setFilters(updatedFilters);

            setIsLoading(true);
            UserService.updateFilters(updatedFilters);

            // Reset loading after a short delay to show feedback
            setTimeout(() => setIsLoading(false), 300);
        },
        [filters],
    );

    const handleSearchChange = useCallback(
        (search: string) => {
            // Update local search value immediately (smooth typing, no re-renders)
            setSearchValue(search);

            // Clear previous timeout
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            // Debounce the server call
            debounceRef.current = setTimeout(() => {
                const updatedFilters = { ...filters, search };
                setFilters(updatedFilters);
                setIsLoading(true);
                UserService.updateFilters(updatedFilters);
                setTimeout(() => setIsLoading(false), 300);
            }, 300);
        },
        [filters],
    );

    const clearFilters = useCallback(() => {
        const clearedFilters: UserFilters = { search: '', roles: [] };
        setFilters(clearedFilters);
        setSearchValue('');
        UserService.updateFilters(clearedFilters);
    }, []);

    return {
        filters,
        searchValue,
        isLoading,
        updateFilters,
        handleSearchChange,
        clearFilters,
        setFilters,
    };
}
