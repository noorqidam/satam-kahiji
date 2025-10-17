import type { UserRole } from '@/constants/roles';
import type { TeacherSubjectWork } from '@/types/teacher';

export interface Staff {
    id: number;
    user_id: number | null;
    name: string;
    position: string;
    division: StaffDivision;
    email: string;
    phone: string | null;
    photo: string | null;
    photo_url?: string;
    bio: string | null;
    created_at: string;
    user?: StaffUser;
    positionHistory?: PositionHistory[];
    position_history?: PositionHistory[];
    subjects?: StaffSubject[];
    teacher_subject_works?: TeacherSubjectWork[];
}

export interface PositionHistory {
    id: number;
    title: string;
    start_year: number;
    end_year: number | null;
}

export interface StaffSubject {
    id: number;
    name: string;
    code: string | null;
}

export interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export const STAFF_DIVISIONS = {
    SYSTEM_ADMIN: 'Administrasi Sistem',
    HEADMASTER: 'Kepala Sekolah',
    DEPUTY_HEADMASTER: 'Wakil Kepala Sekolah',
    ACADEMIC: 'Akademik',
    PUBLIC_RELATIONS: 'Hubungan Masyarakat',
    ADMINISTRATION: 'Tata Usaha',
} as const;

export type StaffDivision = (typeof STAFF_DIVISIONS)[keyof typeof STAFF_DIVISIONS];

export interface StaffFilters {
    search: string;
    divisions: StaffDivision[];
}

export interface StaffsResponse {
    data: Staff[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

type FormDataValue = string | number | boolean | File | null | undefined | number[] | string[];

export interface CreateStaffForm {
    name: string;
    position: string;
    division: StaffDivision | string;
    email: string;
    phone: string;
    photo: File | null;
    bio: string;
    [key: string]: FormDataValue;
}

export interface EditStaffForm {
    name: string;
    position: string;
    division: StaffDivision;
    email: string;
    phone: string;
    photo: File | null;
    bio: string;
    [key: string]: FormDataValue;
}

export interface StaffFormErrors {
    name?: string;
    position?: string;
    division?: string;
    email?: string;
    phone?: string;
    photo?: string;
    bio?: string;
}

export interface BulkDeleteStaffRequest {
    staff_ids: number[];
    [key: string]: FormDataValue;
}

export interface StaffForm {
    name: string;
    position: string;
    division: string | undefined;
    email: string;
    phone: string;
    bio: string;
    photo: File | null;
    [key: string]: FormDataValue;
}

export interface UpdateStaffFormData {
    _method: 'PUT';
    bio: string;
    photo: File | null;
    remove_photo: boolean;
    name?: string;
    position?: string;
    division?: string;
    email?: string;
    phone?: string;
    [key: string]: FormDataValue;
}
