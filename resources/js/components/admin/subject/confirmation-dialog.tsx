import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

export function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmationDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: message }} />
                </DialogHeader>
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
