// Staff Overview utility functions following SOLID principles
// Single Responsibility: Each function has one clear purpose

import type { ProgressCalculator, TeacherWithProgress } from '@/types/staff-overview';
import type { TeacherWithUser } from '@/types/teacher';

/**
 * Calculate progress statistics for a teacher
 * Single Responsibility: Only calculates progress metrics
 */
export const calculateTeacherProgress: ProgressCalculator = (teacher, workItems) => {
    const works = teacher.teacher_subject_works || [];
    const requiredWorkItems = workItems.filter((item) => item.is_required);

    // Get unique work items this teacher has submitted files for
    const submittedWorkItemIds = new Set(works.filter((work) => work.files.length > 0).map((work) => work.work_item.id));

    // Count how many required work items have been submitted
    const completedWorkItems = requiredWorkItems.filter((item) => submittedWorkItemIds.has(item.id)).length;

    const progressPercentage = requiredWorkItems.length > 0 ? Math.round((completedWorkItems / requiredWorkItems.length) * 100) : 0;

    // Calculate file statistics
    const totalFiles = works.reduce((sum, work) => sum + work.files.length, 0);
    const approvedFiles = works.reduce((sum, work) => sum + work.files.filter((file) => file.latest_feedback?.status === 'approved').length, 0);
    const pendingFiles = works.reduce(
        (sum, work) => sum + work.files.filter((file) => !file.latest_feedback || file.latest_feedback.status === 'pending').length,
        0,
    );
    const needsRevisionFiles = works.reduce(
        (sum, work) => sum + work.files.filter((file) => file.latest_feedback?.status === 'needs_revision').length,
        0,
    );

    return {
        totalFiles,
        approvedFiles,
        pendingFiles,
        needsRevisionFiles,
        completedWorkItems,
        totalWorkItems: requiredWorkItems.length,
        progressPercentage,
    };
};

/**
 * Transform teachers array to include progress calculations
 * Open/Closed Principle: Extensible for different progress calculations
 */
export const enrichTeachersWithProgress = (
    teachers: TeacherWithUser[],
    workItems: Array<{ id: number; name: string; is_required: boolean }>,
): TeacherWithProgress[] => {
    return teachers.map((teacher) => ({
        ...teacher,
        progress: calculateTeacherProgress(teacher, workItems),
    }));
};

/**
 * Filter teachers based on work item selection
 * Single Responsibility: Only handles work item filtering
 */
export const filterTeachersByWorkItem = (teachers: TeacherWithProgress[], selectedWorkItem: number | null): TeacherWithProgress[] => {
    if (!selectedWorkItem) return teachers;

    return teachers.filter((teacher) => teacher.teacher_subject_works.some((work) => work.work_item.id === selectedWorkItem));
};

/**
 * Filter teachers based on feedback status
 * Single Responsibility: Only handles feedback filtering
 */
export const filterTeachersByFeedback = (
    teachers: TeacherWithProgress[],
    feedbackFilter: 'all' | 'pending' | 'approved' | 'needs_revision',
): TeacherWithProgress[] => {
    if (feedbackFilter === 'all') return teachers;

    return teachers.filter((teacher) =>
        teacher.teacher_subject_works.some((work) => work.files.some((file) => file.latest_feedback?.status === feedbackFilter)),
    );
};

/**
 * Apply all filters to teachers array
 * Dependency Inversion: Depends on filter functions, not implementations
 */
export const applyAllFilters = (
    teachers: TeacherWithProgress[],
    selectedWorkItem: number | null,
    feedbackFilter: 'all' | 'pending' | 'approved' | 'needs_revision',
): TeacherWithProgress[] => {
    let filtered = teachers;
    filtered = filterTeachersByWorkItem(filtered, selectedWorkItem);
    filtered = filterTeachersByFeedback(filtered, feedbackFilter);
    return filtered;
};

/**
 * Sort teachers by different criteria
 * Open/Closed Principle: Easy to add new sorting methods
 */
export const sortTeachers = (
    teachers: TeacherWithProgress[],
    sortBy: 'name' | 'progress' | 'files' | 'status' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
): TeacherWithProgress[] => {
    const sorted = [...teachers].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'name':
                comparison = a.user.name.localeCompare(b.user.name);
                break;
            case 'progress':
                comparison = a.progress.progressPercentage - b.progress.progressPercentage;
                break;
            case 'files':
                comparison = a.progress.totalFiles - b.progress.totalFiles;
                break;
            case 'status': {
                // Sort by overall completion (approved files vs total files)
                const aCompletion = a.progress.totalFiles > 0 ? a.progress.approvedFiles / a.progress.totalFiles : 0;
                const bCompletion = b.progress.totalFiles > 0 ? b.progress.approvedFiles / b.progress.totalFiles : 0;
                comparison = aCompletion - bCompletion;
                break;
            }
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
};

/**
 * Get summary statistics for filtered teachers
 * Single Responsibility: Only calculates summary stats
 */
export const getFilteredStats = (teachers: TeacherWithProgress[]) => {
    if (teachers.length === 0) {
        return {
            totalTeachers: 0,
            averageProgress: 0,
            totalFiles: 0,
            totalApprovedFiles: 0,
            totalPendingFiles: 0,
            totalRevisionFiles: 0,
        };
    }

    const totalFiles = teachers.reduce((sum, teacher) => sum + teacher.progress.totalFiles, 0);
    const totalApprovedFiles = teachers.reduce((sum, teacher) => sum + teacher.progress.approvedFiles, 0);
    const totalPendingFiles = teachers.reduce((sum, teacher) => sum + teacher.progress.pendingFiles, 0);
    const totalRevisionFiles = teachers.reduce((sum, teacher) => sum + teacher.progress.needsRevisionFiles, 0);
    const averageProgress = teachers.reduce((sum, teacher) => sum + teacher.progress.progressPercentage, 0) / teachers.length;

    return {
        totalTeachers: teachers.length,
        averageProgress: Math.round(averageProgress),
        totalFiles,
        totalApprovedFiles,
        totalPendingFiles,
        totalRevisionFiles,
    };
};
