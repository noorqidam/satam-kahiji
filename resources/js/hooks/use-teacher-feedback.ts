import type { SharedData } from '@/types';
import type { FeedbackItem, FeedbackSummary } from '@/types/workItem';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

interface FeedbackCounts {
    totalFiles: number;
    pendingFeedback: number;
    approvedFiles: number;
    needsRevisionFiles: number;
    unreadFeedback: number;
    hasNewFeedback: boolean;
    recentFeedbacks: FeedbackItem[];
}

/**
 * Hook to get teacher feedback counts and notifications
 */
export function useTeacherFeedback(): FeedbackCounts {
    const { auth, feedbackSummary } = usePage<SharedData & { feedbackSummary?: FeedbackSummary }>().props;

    return useMemo(() => {
        // Only calculate for teachers
        if (auth.user?.role !== 'teacher') {
            return {
                totalFiles: 0,
                pendingFeedback: 0,
                approvedFiles: 0,
                needsRevisionFiles: 0,
                unreadFeedback: 0,
                hasNewFeedback: false,
                recentFeedbacks: [],
            };
        }

        // Use feedback summary from props if available
        if (feedbackSummary) {
            return {
                totalFiles: feedbackSummary.total_files,
                pendingFeedback: feedbackSummary.pending_feedback,
                approvedFiles: feedbackSummary.approved_files,
                needsRevisionFiles: feedbackSummary.needs_revision_files,
                unreadFeedback: feedbackSummary.unread_feedback,
                hasNewFeedback: feedbackSummary.has_new_feedback,
                recentFeedbacks: feedbackSummary.recent_feedbacks,
            };
        }

        // Default values if no feedback summary available
        return {
            totalFiles: 0,
            pendingFeedback: 0,
            approvedFiles: 0,
            needsRevisionFiles: 0,
            unreadFeedback: 0,
            hasNewFeedback: false,
            recentFeedbacks: [],
        };
    }, [auth.user?.role, feedbackSummary]);
}
