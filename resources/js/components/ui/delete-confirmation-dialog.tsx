import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    itemName?: string;
    itemType?: string;
    onConfirm: () => void;
    isLoading?: boolean;
    cancelText?: string;
    deleteText?: string;
    deletingText?: string;
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    itemName,
    itemType = 'item',
    onConfirm,
    isLoading = false,
    cancelText,
    deleteText,
    deletingText,
}: DeleteConfirmationDialogProps) {
    const { t } = useTranslation();
    
    const defaultTitle = t('common.delete_confirmation.title', { itemType });
    const defaultDescription = itemName 
        ? t('common.delete_confirmation.description_with_name', { itemName })
        : t('common.delete_confirmation.description_without_name', { itemType });

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-red-900 dark:text-red-100">
                                {title || defaultTitle}
                            </DialogTitle>
                        </div>
                    </div>
                    <DialogDescription className="text-gray-600 dark:text-gray-400 pt-2">
                        {description || defaultDescription}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button 
                        variant="outline" 
                        disabled={isLoading} 
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelText || t('common.cancel')}
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleConfirm} 
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        {isLoading ? (deletingText || t('common.deleting')) : (deleteText || t('common.delete'))}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}