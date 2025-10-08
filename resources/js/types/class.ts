export interface Teacher {
    id: number;
    name: string;
    position: string;
}

export interface SchoolClass {
    id: number;
    name: string;
    grade_level: string;
    class_section: string;
    description: string | null;
    capacity: number;
    student_count: number;
    available_capacity: number;
    is_full: boolean;
    homeroom_teacher: Teacher | null;
}

export interface ClassStats {
    total_classes: number;
    active_classes: number;
    classes_with_teachers: number;
    total_capacity: number;
    total_students: number;
}

export interface ClassFormData {
    grade_level: string;
    class_section: string;
    description: string;
    capacity: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface Student {
    id: number;
    nisn: string;
    name: string;
    gender: string;
    status: string;
    entry_year: number;
    graduation_year: number | null;
    average_grade: number;
    photo: string;
}
