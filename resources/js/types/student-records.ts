export interface StudentPositiveNote {
    id: number;
    note: string;
    category?: string;
    staff_name: string;
    created_at: string;
}

export interface StudentDisciplinaryRecord {
    id: number;
    incident_description: string;
    action_taken: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    incident_date: string;
    staff_name: string;
    created_at: string;
}

export interface StudentExtracurricularHistory {
    id: number;
    extracurricular_name: string;
    academic_year: string;
    role?: string;
    start_date: string;
    end_date?: string;
    performance_notes?: string;
}

export interface StudentDocument {
    id: number;
    title: string;
    category_name: string;
    uploaded_at: string;
    file_path: string;
    file_name: string;
    mime_type: string;
    file_size?: number;
}

export interface StudentRecords {
    positive_notes: StudentPositiveNote[];
    disciplinary_records: StudentDisciplinaryRecord[];
    extracurricular_history: StudentExtracurricularHistory[];
    documents: StudentDocument[];
}

export interface StudentRecordOptions {
    extracurriculars: Array<{ id: number; name: string }>;
}

export interface StudentRecordsProps {
    student: {
        id: number;
        name: string;
        nisn: string;
        class: string;
        photo?: string;
    };
    records: StudentRecords;
    options: StudentRecordOptions;
    teacher: {
        id: number;
        name: string;
        position: string;
    };
    userRole: string;
}

// Form interfaces for creating/editing records
export interface PositiveNoteForm {
    [key: string]: unknown;
    note: string;
    category?: string;
}

export interface DisciplinaryRecordForm {
    [key: string]: unknown;
    incident_description: string;
    action_taken: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    incident_date: string;
}

export interface ExtracurricularHistoryForm {
    [key: string]: unknown;
    extracurricular_id: number;
    academic_year: string;
    role?: string;
    start_date: string;
    end_date?: string;
    performance_notes?: string;
}

export interface DocumentForm {
    [key: string]: unknown;
    title: string;
    document_category_id?: number;
    file: File | null;
    description?: string;
}
