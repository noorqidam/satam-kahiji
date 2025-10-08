import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, FileText, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Dropzone from '@/components/ui/dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { ContentSchema, generateSlug, SlugSchema, TitleSchema, validateField, validateForm, type ValidationErrors } from '@/schemas/page-validation';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Page Management', href: '/admin/pages' },
    { title: 'Create Page', href: '/admin/pages/create' },
];

export default function CreatePage() {
    const { toast } = useToast();
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [fieldStates, setFieldStates] = useState({
        title: { isValid: false, isDirty: false },
        slug: { isValid: false, isDirty: false },
        content: { isValid: false, isDirty: false },
    });

    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        title: '',
        content: '',
        image: null as File | null,
    });

    const handleTitleChange = (title: string) => {
        setData('title', title);

        // Auto-generate slug from title
        const slug = generateSlug(title);
        setData('slug', slug);

        // Validate title field
        const titleResult = validateField(TitleSchema, title);
        const slugResult = validateField(SlugSchema, slug);

        setValidationErrors((prev) => ({
            ...prev,
            title: titleResult.error || '',
            slug: slugResult.error || '',
        }));

        setFieldStates((prev) => ({
            ...prev,
            title: { isValid: titleResult.success, isDirty: true },
            slug: { isValid: slugResult.success, isDirty: true },
        }));
    };

    const handleContentChange = (content: string) => {
        setData('content', content);

        // Validate content field
        const result = validateField(ContentSchema, content);

        setValidationErrors((prev) => ({
            ...prev,
            content: result.error || '',
        }));

        setFieldStates((prev) => ({
            ...prev,
            content: { isValid: result.success, isDirty: true },
        }));
    };

    // Validate form before submission
    useEffect(() => {
        if (fieldStates.title.isDirty || fieldStates.content.isDirty) {
            const result = validateForm(data, false);
            if (result.errors) {
                setValidationErrors(result.errors);
            }
        }
    }, [data, fieldStates]);

    const handleImageSelect = (file: File | null) => {
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                // 2MB limit
                toast({
                    title: 'Error',
                    description: 'Image must be smaller than 2MB',
                    variant: 'destructive',
                });
                return;
            }
        }
        setData('image', file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('slug', data.slug);
        formData.append('title', data.title);
        formData.append('content', data.content);
        if (data.image) {
            formData.append('image', data.image);
        }

        post(route('admin.pages.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Page created successfully',
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Please check the form for errors',
                    variant: 'destructive',
                });
            },
        });
    };

    const handleCancel = () => {
        router.visit(route('admin.pages.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Page" />

            <div className="space-y-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 dark:border-blue-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">Create New Page</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add a new page for your website</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="border-2 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle>Page Information</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Page Title *</Label>
                                <div className="relative">
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="Enter page title"
                                        className={`pr-10 ${
                                            fieldStates.title.isDirty
                                                ? fieldStates.title.isValid
                                                    ? 'border-green-500 focus:border-green-600'
                                                    : 'border-red-500 focus:border-red-600'
                                                : validationErrors.title || errors.title
                                                  ? 'border-red-500'
                                                  : ''
                                        }`}
                                    />
                                    {fieldStates.title.isDirty && (
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            {fieldStates.title.isValid ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {(validationErrors.title || errors.title) && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        {validationErrors.title || errors.title}
                                    </p>
                                )}
                                {fieldStates.title.isDirty && fieldStates.title.isValid && !validationErrors.title && (
                                    <p className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        Title looks good!
                                    </p>
                                )}
                            </div>

                            {/* Slug - Auto-generated */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug (Auto-generated)</Label>
                                <div className="flex items-center">
                                    <span className="mr-1 text-sm text-gray-500">/</span>
                                    <div className="relative">
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            placeholder="page-url-slug"
                                            className={`bg-gray-50 pr-10 dark:bg-gray-800 ${
                                                fieldStates.slug.isDirty
                                                    ? fieldStates.slug.isValid
                                                        ? 'border-green-500'
                                                        : 'border-red-500'
                                                    : validationErrors.slug || errors.slug
                                                      ? 'border-red-500'
                                                      : ''
                                            }`}
                                            disabled
                                            readOnly
                                        />
                                        {fieldStates.slug.isDirty && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                {fieldStates.slug.isValid ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Automatically generated from the page title</p>
                                {(validationErrors.slug || errors.slug) && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        {validationErrors.slug || errors.slug}
                                    </p>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Content *</Label>
                                <div
                                    className={`relative ${
                                        fieldStates.content.isDirty
                                            ? fieldStates.content.isValid
                                                ? 'rounded-lg border-2 border-green-500'
                                                : 'rounded-lg border-2 border-red-500'
                                            : validationErrors.content || errors.content
                                              ? 'rounded-lg border-2 border-red-500'
                                              : ''
                                    }`}
                                >
                                    <RichTextEditor
                                        value={data.content}
                                        onChange={handleContentChange}
                                        placeholder="Enter page content..."
                                        height={400}
                                    />
                                    {fieldStates.content.isDirty && (
                                        <div className="absolute top-2 right-2 z-10">
                                            {fieldStates.content.isValid ? (
                                                <CheckCircle className="h-5 w-5 rounded-full bg-white text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 rounded-full bg-white text-red-500" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">Use the rich text editor to format your content</p>
                                {(validationErrors.content || errors.content) && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        {validationErrors.content || errors.content}
                                    </p>
                                )}
                                {fieldStates.content.isDirty && fieldStates.content.isValid && !validationErrors.content && (
                                    <p className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        Content looks good!
                                    </p>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Featured Image (Optional)</Label>
                                <Dropzone
                                    onFileSelect={handleImageSelect}
                                    maxSize={2 * 1024 * 1024} // 2MB limit
                                />
                                {errors.image && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.image}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
                        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Creating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Create Page
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
