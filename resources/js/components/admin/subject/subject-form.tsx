import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SubjectForm } from '@/types/subject';

interface SubjectFormProps {
    data: SubjectForm;
    setData: (field: keyof SubjectForm, value: string) => void;
    submit: FormEventHandler;
    processing: boolean;
    errors: Partial<Record<keyof SubjectForm, string>>;
    submitLabel: string;
    isEdit?: boolean;
}

interface PageHeaderProps {
    title: string;
    description: string;
}

export function SubjectFormCard({ data, setData, submit, processing, errors, submitLabel }: SubjectFormProps) {
    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Subject Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Subject Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="e.g., Mathematics, English Literature"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Subject Code</Label>
                            <Input
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="e.g., MATH101, ENG201"
                                maxLength={20}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">Optional unique identifier for the subject</p>
                            <InputError message={errors.code} />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t pt-6">
                        <Link href={route('admin.subjects.index')}>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {submitLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Link href={route('admin.subjects.index')}>
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{title}</h1>
                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
}
