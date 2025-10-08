// Staff Overview types following SOLID principles
// Single Responsibility: Each interface has one clear purpose
// Open/Closed: Extensible without modification

import type { TeacherWithUser } from '@/types/teacher';

// Filter interfaces - Single Responsibility
export interface WorkItemFilter {
    selectedWorkItem: number | null;
    setSelectedWorkItem: (value: number | null) => void;
}

export interface FeedbackFilter {
    feedbackFilter: 'all' | 'pending' | 'approved' | 'needs_revision';
    setFeedbackFilter: (value: 'all' | 'pending' | 'approved' | 'needs_revision') => void;
}

// Progress calculation interface - Single Responsibility
export interface TeacherProgress {
    totalFiles: number;
    approvedFiles: number;
    pendingFiles: number;
    needsRevisionFiles: number;
    completedWorkItems: number;
    totalWorkItems: number;
    progressPercentage: number;
}

// Teacher with calculated progress - Open/Closed Principle
export interface TeacherWithProgress extends TeacherWithUser {
    progress: TeacherProgress;
}

// Table configuration interface - Interface Segregation
export interface StaffOverviewTableProps {
    teachers: TeacherWithProgress[];
    workItems: Array<{
        id: number;
        name: string;
        is_required: boolean;
    }>;
    selectedWorkItem: number | null;
    feedbackFilter: 'all' | 'pending' | 'approved' | 'needs_revision';
    getStatusBadge: (status: string) => React.JSX.Element;
}

// Search and filter interface - Single Responsibility
export interface StaffOverviewFilters {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    workItemFilter: WorkItemFilter;
    feedbackFilter: FeedbackFilter;
    clearFilters: () => void;
}

// Statistics interface - Single Responsibility
export interface StaffOverviewStats {
    total_teachers: number;
    total_files: number;
    total_approved_files: number;
    upload_completion_rate: number;
    feedback_completion_rate: number;
    approval_rate: number;
}

// Main props interface - Dependency Inversion
export interface StaffOverviewProps {
    teachers: TeacherWithUser[];
    workItems: Array<{
        id: number;
        name: string;
        is_required: boolean;
    }>;
    stats: StaffOverviewStats;
}

// Helper function types - Single Responsibility
export type ProgressCalculator = (teacher: TeacherWithUser, workItems: Array<{ id: number; name: string; is_required: boolean }>) => TeacherProgress;
export type TeacherFilter = (teachers: TeacherWithProgress[], filters: Partial<StaffOverviewFilters>) => TeacherWithProgress[];

// Status badge function type - Interface Segregation
export type StatusBadgeGenerator = (status: string) => React.JSX.Element;
