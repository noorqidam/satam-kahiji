import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddWorkItemDialogProps {
    onSuccess?: () => void;
}

export function AddWorkItemDialog({ onSuccess }: AddWorkItemDialogProps) {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
    }>({
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('teacher.work-items.store'), {
            onSuccess: (page) => {
                // Check for flash message from Laravel
                const flash = page.props.flash as any;
                if (flash?.success) {
                    toast({
                        title: t('teacher_work_items.add_dialog.messages.success'),
                        description: flash.success as string,
                        variant: 'success',
                    });
                }
                reset();
                setOpen(false);
                onSuccess?.();
            },
            onError: (errors) => {
                // Handle validation errors
                if (errors.name) {
                    // Validation error will be shown by form, no need for toast
                    return;
                }

                // Handle other errors (like permission errors)
                const errorMessage = errors.error || t('teacher_work_items.add_dialog.messages.create_failed');
                toast({
                    title: t('teacher_work_items.add_dialog.messages.error'),
                    description: errorMessage as string,
                    variant: 'destructive',
                });
            },
        });
    };

    const handleClose = () => {
        reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('teacher_work_items.add_dialog.trigger_button')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-blue-600" />
                        {t('teacher_work_items.add_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>{t('teacher_work_items.add_dialog.description')}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('teacher_work_items.add_dialog.form.name_label')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={t('teacher_work_items.add_dialog.form.name_placeholder')}
                            required
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">{t('teacher_work_items.add_dialog.form.note_title')}</h4>
                        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <li>{t('teacher_work_items.add_dialog.form.note_items.optional')}</li>
                            <li>{t('teacher_work_items.add_dialog.form.note_items.upload')}</li>
                            <li>{t('teacher_work_items.add_dialog.form.note_items.access')}</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            {t('teacher_work_items.add_dialog.buttons.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? t('teacher_work_items.add_dialog.buttons.creating') : t('teacher_work_items.add_dialog.buttons.create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
