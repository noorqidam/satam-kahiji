import RichTextEditor from '@/components/rich-text-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Dropzone from '@/components/ui/dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

interface User {
    id: number;
    name: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    category: 'news' | 'announcements';
    image: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    user: User;
}

interface PostFormData {
    title: string;
    excerpt: string;
    content: string;
    category: 'news' | 'announcements';
    image: File | null;
    created_at: string;
    is_published: boolean;
    remove_image: boolean;
    [key: string]: string | number | boolean | File | null | undefined;
}

interface EditPostProps {
    post: Post;
    [key: string]: unknown;
}

export default function EditPost() {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const { post } = usePage<EditPostProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('posts_management.breadcrumbs.admin_dashboard'), href: route('admin.dashboard') },
        { title: t('posts_management.breadcrumbs.posts_news'), href: route('admin.posts.index') },
        { title: t('posts_management.forms.edit.breadcrumbs.edit_post'), href: route('admin.posts.edit', post.id) },
    ];
    // Removed isPublished state - using form data instead
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Helper function to convert UTC time to Indonesian time (WIB - UTC+7)
    const convertToIndonesianTime = (utcDateString: string) => {
        const utcDate = new Date(utcDateString);
        // Get Indonesian time using proper timezone handling
        const indonesianTime = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        const year = indonesianTime.getFullYear();
        const month = String(indonesianTime.getMonth() + 1).padStart(2, '0');
        const day = String(indonesianTime.getDate()).padStart(2, '0');
        const hours = String(indonesianTime.getHours()).padStart(2, '0');
        const minutes = String(indonesianTime.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data, setData, processing, errors, clearErrors } = useForm<PostFormData>({
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        category: post.category,
        image: null,
        created_at: convertToIndonesianTime(post.created_at), // Convert to Indonesian time format
        is_published: post.is_published,
        remove_image: false,
    });

    const PostSchema = v.object({
        title: v.pipe(v.string(), v.trim(), v.minLength(1, t('posts_management.forms.fields.title.required_error'))),
        excerpt: v.optional(v.string()),
        content: v.pipe(v.string(), v.trim(), v.minLength(1, t('posts_management.forms.fields.content.required_error'))),
        category: v.pipe(v.string(), v.minLength(1, t('posts_management.forms.fields.category.required_error'))),
        image: v.optional(v.any()),
        created_at: v.pipe(v.string(), v.trim(), v.minLength(1, t('posts_management.forms.fields.created_at.required_error'))),
        is_published: v.boolean(),
        remove_image: v.optional(v.boolean()),
    });

    const validateForm = () => {
        try {
            v.parse(PostSchema, data);
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof v.ValiError) {
                const newErrors: Record<string, string> = {};
                for (const issue of error.issues) {
                    if (issue.path) {
                        const path = issue.path.map((p: { key: string }) => p.key).join('.');
                        newErrors[path] = issue.message;
                    }
                }
                setValidationErrors(newErrors);
            }
            return false;
        }
    };

    const handleImageSelect = (file: File | null) => {
        setData('image', file);
        if (file) {
            setData('remove_image', false);
            clearErrors('image');
        } else {
            setData('remove_image', true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous validation errors
        setValidationErrors({});

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', data.title);
        formData.append('excerpt', data.excerpt);
        formData.append('content', data.content);
        formData.append('category', data.category);
        formData.append('created_at', data.created_at);
        formData.append('is_published', data.is_published.toString());

        if (data.image) {
            formData.append('image', data.image);
        }

        if (data.remove_image) {
            formData.append('remove_image', '1');
        }

        router.post(route('admin.posts.update', post.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: t('posts_management.messages.success'),
                    description: t('posts_management.forms.edit.success_message'),
                    variant: 'success',
                });
            },
            onError: (errors) => {
                toast({
                    title: t('posts_management.messages.error'),
                    description: `${errors} ${t('posts_management.forms.edit.error_message')}`,
                    variant: 'destructive',
                });
            },
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('posts_management.forms.edit.page_title')}: ${post.title}`} />

            <div className="w-full max-w-none space-y-6 px-4 sm:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{t('posts_management.forms.edit.header.title')}</h1>
                            <p className="text-muted-foreground">{t('posts_management.forms.edit.header.description')}</p>
                        </div>
                    </div>

                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('posts_management.forms.sections.post_content.title')}</CardTitle>
                                    <CardDescription>{t('posts_management.forms.sections.post_content.edit_description')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">{t('posts_management.forms.fields.title.label')}</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder={t('posts_management.forms.fields.title.placeholder')}
                                            className={errors.title || validationErrors.title ? 'border-destructive' : ''}
                                        />
                                        {(errors.title || validationErrors.title) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.title || validationErrors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="excerpt">{t('posts_management.forms.fields.excerpt.label')}</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            placeholder={t('posts_management.forms.fields.excerpt.placeholder')}
                                            rows={3}
                                            className={errors.excerpt || validationErrors.excerpt ? 'border-destructive' : ''}
                                        />
                                        {(errors.excerpt || validationErrors.excerpt) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.excerpt || validationErrors.excerpt}</p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">{t('posts_management.forms.fields.excerpt.help_text')}</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="content">{t('posts_management.forms.fields.content.label')}</Label>
                                        <div className="mt-2">
                                            <RichTextEditor
                                                value={data.content}
                                                onChange={(content) => setData('content', content)}
                                                placeholder={t('posts_management.forms.fields.content.placeholder')}
                                                height={400}
                                            />
                                        </div>
                                        {(errors.content || validationErrors.content) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.content || validationErrors.content}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Featured Image */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('posts_management.forms.sections.featured_image.title')}</CardTitle>
                                    <CardDescription>{t('posts_management.forms.sections.featured_image.edit_description')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Dropzone
                                        onFileSelect={handleImageSelect}
                                        currentImageUrl={post.image}
                                        maxSize={5 * 1024 * 1024} // 5MB
                                        accept={{
                                            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                                        }}
                                    />
                                    {errors.image && (
                                        <Alert variant="destructive" className="mt-2">
                                            <AlertDescription>{errors.image}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Post Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('posts_management.forms.sections.post_settings.title')}</CardTitle>
                                    <CardDescription>{t('posts_management.forms.sections.post_settings.description')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="category">{t('posts_management.forms.fields.category.label')}</Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => setData('category', value as 'news' | 'announcements')}
                                        >
                                            <SelectTrigger className={errors.category || validationErrors.category ? 'border-destructive' : ''}>
                                                <SelectValue placeholder={t('posts_management.forms.fields.category.placeholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="news">{t('posts_management.categories.news')}</SelectItem>
                                                <SelectItem value="announcements">{t('posts_management.categories.announcements')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(errors.category || validationErrors.category) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.category || validationErrors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="created_at">{t('posts_management.forms.fields.created_at.label')}</Label>
                                        <Input
                                            id="created_at"
                                            type="datetime-local"
                                            value={data.created_at}
                                            onChange={(e) => setData('created_at', e.target.value)}
                                            className={errors.created_at || validationErrors.created_at ? 'border-destructive' : ''}
                                        />
                                        {(errors.created_at || validationErrors.created_at) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.created_at || validationErrors.created_at}</p>
                                        )}
                                        <p className="mt-1 text-xs text-muted-foreground">{t('posts_management.forms.fields.created_at.help_text')}</p>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('posts_management.forms.fields.published.label')}</Label>
                                            <p className="text-xs text-muted-foreground">{t('posts_management.forms.fields.published.edit_help_text')}</p>
                                        </div>
                                        <Switch checked={data.is_published} onCheckedChange={(checked) => setData('is_published', checked)} />
                                    </div>

                                    {!data.is_published && (
                                        <Alert>
                                            <AlertDescription>{t('posts_management.forms.fields.published.draft_alert_edit')}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col gap-2">
                                        <Button type="submit" className="w-full" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? t('posts_management.forms.edit.actions.saving') : t('posts_management.forms.edit.actions.save_changes')}
                                        </Button>

                                        <Link href={route('admin.posts.index')}>
                                            <Button variant="outline" className="w-full" type="button">
                                                {t('posts_management.forms.edit.actions.cancel')}
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
