import { router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

interface AssignmentFilters {
    staff_search?: string;
    subject_search?: string;
}

export function useAssignmentFilters(initialFilters: AssignmentFilters = {}) {
    const [staffSearch, setStaffSearch] = useState(initialFilters.staff_search || '');
    const [subjectSearch, setSubjectSearch] = useState(initialFilters.subject_search || '');
    
    // Use refs to always access current values without dependencies
    const staffSearchRef = useRef(staffSearch);
    const subjectSearchRef = useRef(subjectSearch);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Update refs when state changes
    staffSearchRef.current = staffSearch;
    subjectSearchRef.current = subjectSearch;

    const updateFilters = useCallback((staffSearchTerm: string, subjectSearchTerm: string) => {
        const params: Record<string, string> = {};

        if (staffSearchTerm.trim()) {
            params.staff_search = staffSearchTerm.trim();
        }

        if (subjectSearchTerm.trim()) {
            params.subject_search = subjectSearchTerm.trim();
        }

        router.get('/admin/subject-assignments', params, {
            preserveState: true,
            replace: true,
        });
    }, []);

    const debouncedUpdateFilters = useCallback(
        (staffSearchTerm: string, subjectSearchTerm: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(() => updateFilters(staffSearchTerm, subjectSearchTerm), 300);
        },
        [updateFilters],
    );

    const handleStaffSearchChange = useCallback(
        (value: string) => {
            setStaffSearch(value);
            debouncedUpdateFilters(value, subjectSearchRef.current);
        },
        [debouncedUpdateFilters],
    );

    const handleSubjectSearchChange = useCallback(
        (value: string) => {
            setSubjectSearch(value);
            debouncedUpdateFilters(staffSearchRef.current, value);
        },
        [debouncedUpdateFilters],
    );

    return {
        staffSearch,
        subjectSearch,
        handleStaffSearchChange,
        handleSubjectSearchChange,
    };
}
