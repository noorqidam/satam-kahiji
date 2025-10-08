// Single Responsibility: Reusable confirmation dialog for delete operations
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

/**
 * Reusable delete confirmation dialog props
 * Follows ISP by providing only the interface needed for delete operations
 */
interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

/**
 * Generic delete confirmation dialog component
 * Follows SRP by handling only delete confirmation UI
 * Follows OCP by accepting custom titles, descriptions, and button text
 * Follows ISP by having a focused interface for delete operations
 * Follows DIP by depending on abstractions (props) rather than concrete implementations
 */
export function DeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    isLoading = false,
    confirmButtonText = 'Delete',
    cancelButtonText = 'Cancel',
}: DeleteDialogProps) {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelButtonText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Deleting...
                            </div>
                        ) : (
                            confirmButtonText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}