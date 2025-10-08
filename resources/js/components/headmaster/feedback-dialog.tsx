import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/http-client';

interface FeedbackData {
    id: number;
    feedback: string;
    status: 'pending' | 'approved' | 'needs_revision';
    reviewed_at: string;
    reviewer: {
        id: number;
        name: string;
    };
}

interface FileData {
    id: number;
    file_name: string;
    file_url: string;
    uploaded_at: string;
    feedback: FeedbackData[];
}

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: FileData | null;
    onSuccess?: () => void;
}

export function FeedbackDialog({ open, onOpenChange, file, onSuccess }: FeedbackDialogProps) {
    const { t } = useTranslation();
    const [feedbackText, setFeedbackText] = useState('');
    const [status, setStatus] = useState<'pending' | 'approved' | 'needs_revision'>('pending');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const latestFeedback = file?.feedback?.[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !feedbackText.trim()) {
            toast({
                title: t('feedback_dialog.messages.error_title'),
                description: t('feedback_dialog.messages.feedback_required'),
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await httpClient.post(route('headmaster.feedback.store'), {
                teacher_work_file_id: file.id,
                feedback: feedbackText.trim(),
                status: status,
            });

            toast({
                title: t('feedback_dialog.messages.success_title'),
                description: t('feedback_dialog.messages.feedback_success'),
            });

            // Reset form
            setFeedbackText('');
            setStatus('pending');

            // Reload the page data
            router.reload({ only: ['teacher'] });

            // Call success callback
            onSuccess?.();
        } catch (error: unknown) {
            console.error('Error providing feedback:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to provide feedback';
            toast({
                title: t('feedback_dialog.messages.error_title'),
                description: errorMessage || t('feedback_dialog.messages.feedback_error'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!isSubmitting) {
            onOpenChange(newOpen);
            if (!newOpen) {
                setFeedbackText('');
                setStatus('pending');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t('feedback_dialog.status.approved')}
                    </Badge>
                );
            case 'needs_revision':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {t('feedback_dialog.status.needs_revision')}
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        {t('feedback_dialog.status.pending')}
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!file) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {t('feedback_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>{t('feedback_dialog.description')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* File Information */}
                    <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
                        <h4 className="mb-2 font-medium">{t('feedback_dialog.file_details.title')}</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">{t('feedback_dialog.file_details.file_name')}:</span> {file.file_name}
                            </div>
                            <div>
                                <span className="font-medium">{t('feedback_dialog.file_details.uploaded')}:</span> {formatDate(file.uploaded_at)}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => window.open(file.file_url, '_blank')}>
                                    {t('feedback_dialog.file_details.view_file')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Feedback */}
                    {latestFeedback && (
                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-medium">{t('feedback_dialog.previous_feedback.title')}</h4>
                                {getStatusBadge(latestFeedback.status)}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{latestFeedback.feedback}</p>
                                <p className="text-xs text-gray-500">
                                    {t('feedback_dialog.previous_feedback.by')} {latestFeedback.reviewer.name} {t('feedback_dialog.previous_feedback.on')} {formatDate(latestFeedback.reviewed_at)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Feedback Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback">{latestFeedback ? t('feedback_dialog.form.update_feedback_label') : t('feedback_dialog.form.feedback_label')}</Label>
                            <Textarea
                                id="feedback"
                                placeholder={t('feedback_dialog.form.feedback_placeholder')}
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">{t('feedback_dialog.form.status_label')}</Label>
                            <Select value={status} onValueChange={(value: 'pending' | 'approved' | 'needs_revision') => setStatus(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('feedback_dialog.form.status_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {t('feedback_dialog.status.pending')}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            {t('feedback_dialog.status.approved')}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="needs_revision">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {t('feedback_dialog.status.needs_revision')}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                                {t('feedback_dialog.actions.cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !feedbackText.trim()}>
                                {isSubmitting ? t('feedback_dialog.actions.submitting') : latestFeedback ? t('feedback_dialog.actions.update') : t('feedback_dialog.actions.submit')}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
