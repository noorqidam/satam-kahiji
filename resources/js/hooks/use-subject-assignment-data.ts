import { type PaginationData } from '@/components/ui/pagination';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

interface Staff {
    id: number;
    name: string;
    position: string;
    division: string;
    subjects: { id: number }[];
}

interface Subject {
    id: number;
    name: string;
    code: string | null;
    staff_count: number;
}

export interface SubjectAssignmentData {
    staff: PaginationData & { data: Staff[] };
    subjects: PaginationData & { data: Subject[] };
}

export function useSubjectAssignmentData(data: SubjectAssignmentData) {
    // Only listen for external events, don't auto-refresh on mount
    useEffect(() => {
        const handleSubjectAssignmentChange = () => {
            // Refresh when assignments are updated from other pages
            router.reload();
        };

        window.addEventListener('subject-staff-updated', handleSubjectAssignmentChange);

        return () => {
            window.removeEventListener('subject-staff-updated', handleSubjectAssignmentChange);
        };
    }, []);

    return data;
}
