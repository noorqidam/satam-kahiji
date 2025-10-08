import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface AssignmentFilters {
    staff_search?: string;
    subject_search?: string;
}

export function useAssignmentFilters(initialFilters: AssignmentFilters = {}) {
    const [staffSearch, setStaffSearch] = useState(initialFilters.staff_search || '');
    const [subjectSearch, setSubjectSearch] = useState(initialFilters.subject_search || '');
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const updateFilters = useCallback((staffSearchTerm: string, subjectSearchTerm: string) => {
        const params: Record<string, string> = {};

        if (staffSearchTerm.trim()) {
            params.staff_search = staffSearchTerm.trim();
        }

        if (subjectSearchTerm.trim()) {
            params.subject_search = subjectSearchTerm.trim();
        }

        router.get(route('admin.subject-assignments.index'), params, {
            preserveState: true,
            replace: true,
        });
    }, []);

    const debouncedUpdateFilters = useCallback(
        (staffSearchTerm: string, subjectSearchTerm: string) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const timer = setTimeout(() => updateFilters(staffSearchTerm, subjectSearchTerm), 300);
            setDebounceTimer(timer);
        },
        [debounceTimer, updateFilters],
    );

    const handleStaffSearchChange = useCallback(
        (value: string) => {
            setStaffSearch(value);
            debouncedUpdateFilters(value, subjectSearch);
        },
        [debouncedUpdateFilters, subjectSearch],
    );

    const handleSubjectSearchChange = useCallback(
        (value: string) => {
            setSubjectSearch(value);
            debouncedUpdateFilters(staffSearch, value);
        },
        [debouncedUpdateFilters, staffSearch],
    );

    return {
        staffSearch,
        subjectSearch,
        handleStaffSearchChange,
        handleSubjectSearchChange,
    };
}
