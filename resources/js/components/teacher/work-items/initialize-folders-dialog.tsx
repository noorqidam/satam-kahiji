import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { FolderPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FlashMessages {
    success?: string;
    error?: string;
}

interface InertiaPageProps {
    flash?: FlashMessages;
    [key: string]: unknown;
}

interface InitializeFoldersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacherId: number;
    subjectId: number | null;
    onSuccess: () => void;
}

export function InitializeFoldersDialog({ open, onOpenChange, teacherId, subjectId, onSuccess }: InitializeFoldersDialogProps) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [initializing, setInitializing] = useState(false);

    const handleInitialize = () => {
        if (!subjectId) return;

        setInitializing(true);

        router.post(
            '/admin/work-items/initialize-folders',
            {
                teacher_id: teacherId,
                subject_id: subjectId,
            },
            {
                onSuccess: (page: { props: InertiaPageProps }) => {
                    setInitializing(false);
                    const flash = page.props.flash;

                    // Show success message if available
                    if (flash?.success) {
                        toast({
                            title: t('teacher_work_items.initialize_folders_dialog.messages.success'),
                            description: flash.success,
                            variant: 'success',
                        });
                    } else {
                        // Fallback success message
                        toast({
                            title: t('teacher_work_items.initialize_folders_dialog.messages.success'),
                            description: t('teacher_work_items.initialize_folders_dialog.messages.success_description'),
                            variant: 'success',
                        });
                    }

                    // Always close dialog and call success callback on successful response
                    onSuccess();
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setInitializing(false);
                    const errorMessage = errors.error || t('teacher_work_items.initialize_folders_dialog.messages.error_description');
                    toast({
                        title: t('teacher_work_items.initialize_folders_dialog.messages.error'),
                        description: errorMessage as string,
                        variant: 'destructive',
                    });
                },
                onFinish: () => {
                    setInitializing(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5" />
                        {t('teacher_work_items.initialize_folders_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('teacher_work_items.initialize_folders_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                            {t('teacher_work_items.initialize_folders_dialog.folder_structure.title')}
                        </h4>
                        <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <p>📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.subject_name')}</p>
                            <p className="ml-4">📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.teacher_name')}</p>
                            <p className="ml-8">📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.prota')}</p>
                            <p className="ml-8">📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.prosem')}</p>
                            <p className="ml-8">📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.module')}</p>
                            <p className="ml-8">📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.attendance_list')}</p>
                            <p className="ml-8">📁 {t('teacher_work_items.initialize_folders_dialog.folder_structure.agenda')}</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                        <h4 className="mb-2 font-medium text-yellow-900 dark:text-yellow-100">
                            {t('teacher_work_items.initialize_folders_dialog.important_notes.title')}
                        </h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                            <li>{t('teacher_work_items.initialize_folders_dialog.important_notes.drive_creation')}</li>
                            <li>{t('teacher_work_items.initialize_folders_dialog.important_notes.full_access')}</li>
                            <li>{t('teacher_work_items.initialize_folders_dialog.important_notes.admin_access')}</li>
                            <li>{t('teacher_work_items.initialize_folders_dialog.important_notes.once_per_subject')}</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={initializing}>
                            {t('teacher_work_items.initialize_folders_dialog.buttons.cancel')}
                        </Button>
                        <Button onClick={handleInitialize} disabled={initializing || !subjectId}>
                            {initializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initializing 
                                ? t('teacher_work_items.initialize_folders_dialog.buttons.initializing')
                                : t('teacher_work_items.initialize_folders_dialog.buttons.initialize')
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
