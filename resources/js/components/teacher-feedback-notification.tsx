import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTeacherFeedback } from '@/hooks/use-teacher-feedback';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Bell, CheckCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function TeacherFeedbackNotification() {
    const { auth } = usePage<SharedData>().props;
    const feedbackCounts = useTeacherFeedback();
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    const { toast } = useToast();

    // Only show for teachers
    if (auth.user?.role !== 'teacher') {
        return null;
    }

    const { totalFiles, pendingFeedback, approvedFiles, needsRevisionFiles, unreadFeedback, recentFeedbacks } = feedbackCounts;

    // Don't show if no files uploaded yet
    if (totalFiles === 0) {
        return null;
    }

    const needsAttention = needsRevisionFiles > 0;

    // Mark feedback as read when clicking on it (only if unread)
    const handleFeedbackClick = async (feedbackId: number, isUnread: boolean) => {
        // Don't do anything if already read
        if (!isUnread) {
            return;
        }

        try {
            await fetch(route('work-items.feedback.mark-read', feedbackId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            // Reload to update counts
            router.reload({ only: ['feedbackSummary'] });
        } catch (error) {
            console.error('Failed to mark feedback as read:', error);
        }
    };

    // Mark all feedback as read
    const handleMarkAllAsRead = () => {
        router.post(route('work-items.feedback.mark-all-read'), {}, {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'All feedback marked as read',
                    variant: 'success',
                });
                router.reload({ only: ['feedbackSummary'] });
                setIsOpen(false);
            },
            onError: (errors) => {
                console.error('Failed to mark all feedback as read:', errors);
                toast({
                    title: 'Error',
                    description: 'Failed to mark all feedback as read. Please try again.',
                    variant: 'destructive',
                });
            }
        });
    };

    // Get status icon and color for feedback
    const getFeedbackStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-3 w-3 text-green-600" />;
            case 'needs_revision':
                return <AlertCircle className="h-3 w-3 text-red-600" />;
            case 'pending':
            default:
                return <Clock className="h-3 w-3 text-blue-600" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return t('teacher_notifications.status.approved');
            case 'needs_revision':
                return t('teacher_notifications.status.needs_revision');
            case 'pending':
            default:
                return t('teacher_notifications.status.pending_review');
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return t('teacher_notifications.time.yesterday');
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`relative w-full justify-start px-2 text-left font-normal hover:bg-sidebar-accent ${
                        needsAttention ? 'text-destructive' : ''
                    }`}
                >
                    <div className="relative mr-2">
                        <Bell className="h-4 w-4" />
                        {unreadFeedback > 0 && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"></div>}
                    </div>
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center justify-between">
                            <span className="truncate text-sm">
                                {unreadFeedback > 0
                                    ? `${unreadFeedback} ${unreadFeedback > 1 ? t('teacher_notifications.bell_button.new_notifications') : t('teacher_notifications.bell_button.new_notification')}`
                                    : t('teacher_notifications.bell_button.notifications')}
                            </span>
                            {unreadFeedback > 0 && (
                                <Badge variant="destructive" className="ml-2 h-4 w-4 flex-shrink-0 rounded-full p-0 text-xs">
                                    {unreadFeedback > 9 ? '9+' : unreadFeedback}
                                </Badge>
                            )}
                        </div>
                        {unreadFeedback > 0 && needsRevisionFiles > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {needsRevisionFiles}{' '}
                                {needsRevisionFiles > 1
                                    ? t('teacher_notifications.bell_button.need_revision')
                                    : t('teacher_notifications.bell_button.needs_revision')}
                            </p>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={`${isMobile ? 'w-[calc(100vw-2rem)] max-w-sm' : 'w-[28rem]'} max-h-[80vh]`}
                align={isMobile ? 'center' : 'start'}
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={isMobile ? 8 : 12}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium">{t('teacher_notifications.popup.title')}</h3>
                            <p className="text-xs text-muted-foreground">
                                {unreadFeedback > 0
                                    ? `${unreadFeedback} ${t('teacher_notifications.popup.unread')}`
                                    : t('teacher_notifications.popup.all_up_to_date')}
                            </p>
                        </div>
                        {unreadFeedback > 0 && (
                            <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAllAsRead}>
                                {t('teacher_notifications.popup.mark_all_read')}
                            </Button>
                        )}
                    </div>
                    <div className={`space-y-4 ${isMobile ? 'p-3' : 'p-4'}`}>
                        {/* Summary Stats */}
                        <div className={`grid gap-2 text-xs ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                            <div className="flex items-center justify-between rounded-md bg-green-50 p-2 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="font-medium">{t('teacher_notifications.status.approved')}</span>
                                </div>
                                <span className="font-medium">{approvedFiles}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-blue-50 p-2 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">{t('teacher_notifications.status.pending')}</span>
                                </div>
                                <span className="font-medium">{pendingFeedback}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-red-50 p-2 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" />
                                    <span className="font-medium">{t('teacher_notifications.status.revision')}</span>
                                </div>
                                <span className="font-medium">{needsRevisionFiles}</span>
                            </div>
                        </div>

                        <div className="border-t" />

                        {/* Recent Feedback List */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">{t('teacher_notifications.sections.recent_notifications')}</h4>
                            <ScrollArea className={isMobile ? 'h-48' : 'h-64'}>
                                {recentFeedbacks.length > 0 ? (
                                    <div className={`space-y-2 ${isMobile ? 'pr-2' : ''}`}>
                                        {recentFeedbacks.map((feedback) => (
                                            <div
                                                key={feedback.id}
                                                className={`rounded-lg border p-3 text-xs transition-colors ${
                                                    feedback.is_unread
                                                        ? 'cursor-pointer border-blue-200 bg-blue-50/50 hover:bg-blue-100/50'
                                                        : 'cursor-default bg-gray-50/50 opacity-75'
                                                }`}
                                                onClick={() => handleFeedbackClick(feedback.id, feedback.is_unread)}
                                            >
                                                <div className="mb-2 flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-1 flex items-center gap-1">
                                                            {getFeedbackStatusIcon(feedback.status)}
                                                            <span
                                                                className={`text-xs font-medium ${
                                                                    feedback.is_unread ? 'text-blue-800' : 'text-foreground'
                                                                }`}
                                                            >
                                                                {getStatusText(feedback.status)}
                                                            </span>
                                                            {feedback.is_unread && (
                                                                <Badge variant="destructive" className="ml-1 h-3 w-3 rounded-full p-0 text-xs">
                                                                    •
                                                                </Badge>
                                                            )}
                                                            {isMobile && (
                                                                <span className="ml-auto text-xs text-muted-foreground">
                                                                    {formatDate(feedback.reviewed_at)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-1 text-xs font-medium break-words text-foreground">{feedback.file_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {isMobile
                                                                ? `${feedback.work_item_name} • ${feedback.subject_name}`
                                                                : `${feedback.work_item_name} - ${feedback.subject_name}`}
                                                        </p>
                                                    </div>
                                                    {!isMobile && (
                                                        <div className="text-right">
                                                            <span className="text-xs whitespace-nowrap text-muted-foreground">
                                                                {formatDate(feedback.reviewed_at)}
                                                            </span>
                                                            {!feedback.is_unread && (
                                                                <div className="mt-1 text-xs text-muted-foreground">
                                                                    {t('teacher_notifications.feedback.read')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="mb-1 text-xs leading-relaxed break-words text-muted-foreground">
                                                            {feedback.feedback.length > (isMobile ? 80 : 100)
                                                                ? `${feedback.feedback.substring(0, isMobile ? 80 : 100)}...`
                                                                : feedback.feedback}
                                                        </p>
                                                        <div
                                                            className={`flex items-center ${isMobile ? 'justify-between' : 'justify-start'} text-xs`}
                                                        >
                                                            <span className="text-muted-foreground">— {feedback.reviewer_name}</span>
                                                            {isMobile && !feedback.is_unread && (
                                                                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground">
                                                                    {t('teacher_notifications.feedback.read')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center text-muted-foreground ${isMobile ? 'py-6' : 'py-8'}`}>
                                        <MessageSquare className={`mx-auto mb-2 opacity-50 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                                        <p className={isMobile ? 'text-xs' : 'text-sm'}>{t('teacher_notifications.empty_state.no_notifications')}</p>
                                        <p className="text-xs opacity-75">{t('teacher_notifications.empty_state.no_notifications_desc')}</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        <Button asChild className="w-full" size="sm">
                            <Link href="/teacher/work-items" className="flex items-center justify-center gap-2">
                                <ExternalLink className="h-3 w-3" />
                                <span>{t('teacher_notifications.sections.view_all_work_items')}</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
