import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { FolderPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface InitializeFoldersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacherId: number;
    subjectId: number | null;
    onSuccess: () => void;
}

export function InitializeFoldersDialog({ open, onOpenChange, teacherId, subjectId, onSuccess }: InitializeFoldersDialogProps) {
    const { toast } = useToast();
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
                onSuccess: (page) => {
                    setInitializing(false);
                    const flash = page.props.flash as any;

                    // Show success message if available
                    if (flash?.success) {
                        toast({
                            title: 'Success',
                            description: flash.success as string,
                            variant: 'success',
                        });
                    } else {
                        // Fallback success message
                        toast({
                            title: 'Success',
                            description: 'Work folders initialized successfully',
                            variant: 'success',
                        });
                    }

                    // Always close dialog and call success callback on successful response
                    onSuccess();
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setInitializing(false);
                    const errorMessage = errors.error || 'Failed to initialize folders';
                    toast({
                        title: 'Error',
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
                        Initialize Work Folders
                    </DialogTitle>
                    <DialogDescription>
                        This will create a complete folder structure in Google Drive for organizing your work items.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">Folder Structure</h4>
                        <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <p>📁 [Subject Name]</p>
                            <p className="ml-4">📁 [Your Name]</p>
                            <p className="ml-8">📁 Prota (Annual Program)</p>
                            <p className="ml-8">📁 Prosem (Semester Program)</p>
                            <p className="ml-8">📁 Module</p>
                            <p className="ml-8">📁 Attendance List</p>
                            <p className="ml-8">📁 Agenda</p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                        <h4 className="mb-2 font-medium text-yellow-900 dark:text-yellow-100">Important Notes</h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                            <li>Folders will be created in your organization's Google Drive</li>
                            <li>You'll have full access to upload and manage files</li>
                            <li>Administrators can monitor progress and access folders</li>
                            <li>This action only needs to be done once per subject</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={initializing}>
                            Cancel
                        </Button>
                        <Button onClick={handleInitialize} disabled={initializing || !subjectId}>
                            {initializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initializing ? 'Creating Folders...' : 'Initialize Folders'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
