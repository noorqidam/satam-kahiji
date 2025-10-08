// Import required types
import type { Staff } from './staff';
import type { Subject } from './subject';

export interface WorkItem {
    id: number;
    name: string;
    is_required: boolean;
    created_by_role: 'headmaster' | 'teacher' | 'super_admin';
    created_at: string;
    updated_at: string;
}

export interface TeacherSubjectWork {
    id: number;
    staff_id: number;
    subject_id: number;
    work_item_id: number;
    folder_name: string;
    gdrive_folder_id: string | null;
    created_at: string;
    updated_at: string;
    staff?: Staff;
    subject?: Subject;
    work_item?: WorkItem;
    files?: TeacherWorkFile[];
}

export interface TeacherWorkFile {
    id: number;
    teacher_subject_work_id: number;
    file_name: string;
    file_url: string;
    file_path?: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at: string;
    last_accessed?: string;
    views?: number;
    downloads?: number;
    created_at: string;
    updated_at: string;
    teacher_subject_work?: TeacherSubjectWork;
    latest_feedback?: {
        id: number;
        feedback: string;
        status: 'pending' | 'approved' | 'needs_revision';
        reviewed_at: string;
        teacher_read_at: string | null;
        reviewer: {
            id: number;
            name: string;
        };
    };
}

export interface WorkItemProgress {
    subject: Subject;
    total_work_items: number;
    completed_work_items: number;
    completion_percentage: number;
    work_items: WorkItemData[];
}

export interface WorkItemData {
    work_item: WorkItem;
    has_folder: boolean;
    files_count: number;
    files: TeacherWorkFile[];
    folder_url: string | null;
}

export interface WorkItemStats {
    total_teachers: number;
    total_work_items: number;
    total_expected_submissions: number;
    completed_submissions: number;
    overall_completion_rate: number;
    work_item_stats: WorkItemStatDetail[];
}

export interface WorkItemStatDetail {
    work_item: string;
    completion_count: number;
    total_teachers: number;
    completion_rate: number;
}

export interface WorkItemFormData {
    name: string;
    is_required: boolean;
}

export interface WorkItemIndexProps {
    workItems: WorkItem[];
    teachers?: Staff[];
    stats?: WorkItemStats;
    userRole: string;
}

export interface FeedbackItem {
    id: number;
    file_name: string;
    work_item_name: string;
    subject_name: string;
    feedback: string;
    status: 'pending' | 'approved' | 'needs_revision';
    reviewer_name: string;
    reviewed_at: string;
    is_unread: boolean;
}

export interface FeedbackSummary {
    total_files: number;
    pending_feedback: number;
    approved_files: number;
    needs_revision_files: number;
    unread_feedback: number;
    has_new_feedback: boolean;
    recent_feedbacks: FeedbackItem[];
}

export interface TeacherWorkDashboardProps {
    progress: WorkItemProgress[];
    teacher: Staff;
    userRole: string;
    feedbackSummary: FeedbackSummary;
}

export interface WorkItemManageProps {
    workItems: WorkItem[];
}
