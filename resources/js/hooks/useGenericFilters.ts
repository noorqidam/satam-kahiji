// Generic filter hook following SOLID principles
// Single Responsibility: Handle filter state and operations
// Open/Closed: Extensible for different entity types
// Dependency Inversion: Depends on filter abstractions

import type { BaseFilterState, BulkOperationState, FilterHookReturn } from '@/types/common';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseGenericFiltersConfig {
    routeName: string;
    debounceMs?: number;
    defaultPerPage?: number;
}

export function useGenericFilters<T extends BaseFilterState>(initialFilters: T, config: UseGenericFiltersConfig): FilterHookReturn<T> {
    const { routeName, debounceMs = 500, defaultPerPage = 10 } = config;

    // Filter state management
    const [filters, setFilters] = useState<T>({
        ...initialFilters,
        per_page: initialFilters.per_page || defaultPerPage,
    });

    // Bulk operations state
    const [bulkOperations, setBulkOperations] = useState<BulkOperationState>({
        selectedItems: [],
        isAllSelected: false,
        operation: null,
        isProcessing: false,
    });

    // Debounced search to prevent excessive API calls
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    const debouncedSearchCallback = useDebouncedCallback((searchValue: string) => {
        setDebouncedSearch(searchValue);
    }, debounceMs);

    // Update debounced search when search filter changes
    useEffect(() => {
        debouncedSearchCallback(filters.search);
    }, [filters.search, debouncedSearchCallback]);

    // Navigate with filters when debounced search changes
    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            return; // Wait for debounce
        }

        const filterParams = Object.entries(filters).reduce(
            (acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            },
            {} as Record<string, any>,
        );

        router.get(route(routeName), filterParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, filters, routeName]);

    // Update individual filter
    const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // Reset all filters to initial state
    const resetFilters = useCallback(() => {
        setFilters({
            ...initialFilters,
            per_page: defaultPerPage,
        });
        setBulkOperations({
            selectedItems: [],
            isAllSelected: false,
            operation: null,
            isProcessing: false,
        });
    }, [initialFilters, defaultPerPage]);

    // Update bulk operation state
    const updateBulkOperation = useCallback(<K extends keyof BulkOperationState>(key: K, value: BulkOperationState[K]) => {
        setBulkOperations((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // Memoized return value to prevent unnecessary re-renders
    const returnValue = useMemo(
        (): FilterHookReturn<T> => ({
            filters,
            updateFilter,
            resetFilters,
            bulkOperations,
            updateBulkOperation,
            debouncedSearch,
        }),
        [filters, updateFilter, resetFilters, bulkOperations, updateBulkOperation, debouncedSearch],
    );

    return returnValue;
}

// Specialized hooks for specific entities
export function useUserFilters(initialFilters: any) {
    return useGenericFilters(initialFilters, {
        routeName: 'admin.users.index',
        debounceMs: 500,
        defaultPerPage: 10,
    });
}

export function useStaffFilters(initialFilters: any) {
    return useGenericFilters(initialFilters, {
        routeName: 'admin.staff.index',
        debounceMs: 500,
        defaultPerPage: 10,
    });
}

export function useStudentFilters(initialFilters: any) {
    return useGenericFilters(initialFilters, {
        routeName: 'admin.students.index',
        debounceMs: 500,
        defaultPerPage: 10,
    });
}

export function useContactFilters(initialFilters: any) {
    return useGenericFilters(initialFilters, {
        routeName: 'admin.contacts.index',
        debounceMs: 500,
        defaultPerPage: 10,
    });
}
