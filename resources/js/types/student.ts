import { type PaginationData } from '@/components/ui/pagination';

export interface Student {
    id: number;
    nisn: string;
    name: string;
    gender: 'male' | 'female';
    birth_date: string;
    birthplace?: string | null;
    religion?: string | null;
    class: string;
    homeroom_teacher_id: number | null;
    entry_year: number;
    graduation_year: number | null;
    status: 'active' | 'graduated' | 'transferred' | 'dropped';
    photo: string | null;
    notes: string | null;
    // Enhanced personal information
    parent_name?: string | null;
    parent_phone?: string | null;
    parent_email?: string | null;
    address?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    // Transportation information
    transportation_method?: 'walking' | 'bicycle' | 'motorcycle' | 'car' | 'school_bus' | 'public_transport' | 'other' | null;
    distance_from_home_km?: number | null;
    travel_time_minutes?: number | null;
    pickup_location?: string | null;
    transportation_notes?: string | null;
    // Health information
    allergies?: string | null;
    medical_conditions?: string | null;
    dietary_restrictions?: string | null;
    blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
    emergency_medical_info?: string | null;
    created_at: string;
    updated_at: string;
    homeroom_teacher?: {
        id: number;
        name: string;
        position: string;
    };
    extracurriculars?: Array<{
        id: number;
        name: string;
        description?: string;
        photo?: string;
    }>;
}

export interface StudentForm {
    nisn: string;
    name: string;
    gender: 'male' | 'female' | '';
    birth_date: string;
    birthplace: string;
    religion: string;
    class: string;
    homeroom_teacher_id: string;
    entry_year: string;
    graduation_year: string;
    status: 'active' | 'graduated' | 'transferred' | 'dropped';
    photo: File | null;
    notes: string;
    // Enhanced personal information
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    // Transportation information
    transportation_method: 'walking' | 'bicycle' | 'motorcycle' | 'car' | 'school_bus' | 'public_transport' | 'other' | '';
    distance_from_home_km: string;
    travel_time_minutes: string;
    pickup_location: string;
    transportation_notes: string;
    // Health information
    allergies: string;
    medical_conditions: string;
    dietary_restrictions: string;
    blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
    emergency_medical_info: string;
    extracurricular_ids: number[];
    delete_photo?: boolean;
    _method?: string;
    [key: string]: string | number | File | boolean | null | undefined | number[];
}

export interface StudentIndexProps {
    students: PaginationData & {
        data: Student[];
    };
    filters?: {
        search: string;
        gender?: string;
        class?: string;
        status?: string;
    };
}

export interface StudentCreateProps {
    staff: Array<{
        id: number;
        name: string;
        position: string;
    }>;
    availableClasses?: Array<{
        id: number;
        name: string;
        grade_level: string;
        class_section: string;
        capacity: number;
        current_students: number;
        available_slots: number;
        is_full: boolean;
    }>;
    extracurriculars: Array<{
        id: number;
        name: string;
        description?: string;
    }>;
    recordOptions?: {
        achievement_types: Record<string, string>;
        achievement_levels: Record<string, string>;
    };
}

export interface StudentEditProps {
    student: Student;
    staff: Array<{
        id: number;
        name: string;
        position: string;
    }>;
    availableClasses: Array<{
        id: number;
        name: string;
        grade_level: string;
        class_section: string;
        capacity: number;
        current_students: number;
        available_slots: number;
        is_full: boolean;
    }>;
    extracurriculars: Array<{
        id: number;
        name: string;
        description?: string;
    }>;
    recordOptions?: {
        achievement_types: Record<string, string>;
        achievement_levels: Record<string, string>;
    };
}

export interface StudentShowProps {
    student: Student;
}
