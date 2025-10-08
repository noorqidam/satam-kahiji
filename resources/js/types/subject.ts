import { type PaginationData } from '@/components/ui/pagination';
import { type Staff } from '@/types/staff';

export interface Subject {
    id: number;
    name: string;
    code: string | null;
    staff_count: number;
    created_at: string;
    staff?: Staff[];
}

export interface SubjectForm {
    name: string;
    code: string;
    [key: string]: any;
}

export interface SubjectIndexProps {
    subjects: PaginationData & {
        data: Subject[];
    };
    filters?: {
        search: string;
    };
}

export interface SubjectEditProps {
    subject: Subject;
    availableStaff: Staff[];
}

export interface SubjectShowProps {
    subject: Subject;
    availableStaff: Staff[];
}
