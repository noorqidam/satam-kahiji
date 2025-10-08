// Central Teacher types following SOLID principles
// Single Responsibility: Each interface has one clear purpose
// Open/Closed: Extensible without modification

export interface TeacherUser {
    id: number;
    name: string;
    email: string;
}

export interface TeacherSubject {
    id: number;
    name: string;
    code: string;
}

export interface TeacherSubjectNullable {
    id: number;
    name: string;
    code: string | null;
}

export interface WorkItemBase {
    id: number;
    name: string;
    is_required: boolean;
}

export interface FeedbackReviewer {
    id: number;
    name: string;
}

export interface WorkFileFeedback {
    id: number;
    feedback: string;
    status: 'pending' | 'approved' | 'needs_revision';
    reviewed_at: string;
    reviewer: FeedbackReviewer;
}

export interface WorkFile {
    id: number;
    file_name: string;
    file_url: string;
    uploaded_at: string;
    file_size?: number;
    subject?: TeacherSubject;
    category?: string;
    latest_feedback?: WorkFileFeedback;
}

export interface WorkFileWithFeedbackArray {
    id: number;
    file_name: string;
    file_url: string;
    uploaded_at: string;
    feedback: WorkFileFeedback[];
}

export interface TeacherSubjectWork {
    id: number;
    work_item: WorkItemBase;
    subject: TeacherSubject;
    files: WorkFile[];
}

export interface TeacherSubjectWorkWithFeedbackArray {
    id: number;
    work_item: WorkItemBase;
    subject: TeacherSubject;
    files: WorkFileWithFeedbackArray[];
}

// Base Teacher interface - Single Responsibility
export interface BaseTeacher {
    id: number;
    subjects: TeacherSubject[];
}

// Teacher with User relationship (used in headmaster pages)
export interface TeacherWithUser extends BaseTeacher {
    user: TeacherUser;
    teacher_subject_works: TeacherSubjectWork[];
}

// Teacher with User relationship for detail pages (with feedback array)
export interface TeacherWithUserDetail extends BaseTeacher {
    user: TeacherUser;
    teacher_subject_works: TeacherSubjectWorkWithFeedbackArray[];
}

// Teacher with direct properties (used in admin tables)
export interface TeacherWithDirectProps {
    id: number;
    name: string;
    email: string;
    position: string;
    division: string;
    photo: string | null;
    subjects?: TeacherSubjectNullable[];
    teacher_subject_works?: TeacherSubjectWork[];
}

// Union type for flexibility - Open/Closed Principle
export type Teacher = TeacherWithUser | TeacherWithDirectProps;

// Type guards for type safety - Interface Segregation
export function isTeacherWithUser(teacher: Teacher): teacher is TeacherWithUser {
    return 'user' in teacher;
}

export function isTeacherWithDirectProps(teacher: Teacher): teacher is TeacherWithDirectProps {
    return 'name' in teacher && 'email' in teacher && !('user' in teacher);
}

// Helper functions - Single Responsibility
export function getTeacherName(teacher: Teacher): string {
    return isTeacherWithUser(teacher) ? teacher.user.name : teacher.name;
}

export function getTeacherEmail(teacher: Teacher): string {
    return isTeacherWithUser(teacher) ? teacher.user.email : teacher.email;
}

export function getTeacherSubjects(teacher: Teacher): (TeacherSubject | TeacherSubjectNullable)[] {
    return teacher.subjects || [];
}
