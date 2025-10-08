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
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Save } from 'lucide-react';
import { useState } from 'react';
import * as v from 'valibot';

interface PostFormData {
    title: string;
    excerpt: string;
    content: string;
    category: 'news' | 'announcements' | '';
    image: File | null;
    created_at: string;
    is_published: boolean;
    [key: string]: string | number | boolean | File | null | undefined;
}

export default function CreatePost() {
    const { toast } = useToast();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Posts & News', href: route('admin.posts.index') },
        { title: 'Create Post', href: route('admin.posts.create') },
    ];

    // Removed publishNow state - using is_published in form data instead
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Helper function to get current Indonesian time (WIB - UTC+7)
    const getIndonesianDateTime = () => {
        const now = new Date();
        // Get Indonesian time using proper timezone handling
        const indonesianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        const year = indonesianTime.getFullYear();
        const month = String(indonesianTime.getMonth() + 1).padStart(2, '0');
        const day = String(indonesianTime.getDate()).padStart(2, '0');
        const hours = String(indonesianTime.getHours()).padStart(2, '0');
        const minutes = String(indonesianTime.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data, setData, post, processing, errors, clearErrors } = useForm<PostFormData>({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        image: null,
        created_at: getIndonesianDateTime(), // Default to current Indonesian datetime
        is_published: false, // Default to draft (not published)
    });

    const PostSchema = v.object({
        title: v.pipe(v.string(), v.trim(), v.minLength(1, 'Title is required')),
        excerpt: v.optional(v.string()),
        content: v.pipe(v.string(), v.trim(), v.minLength(1, 'Content is required')),
        category: v.pipe(v.string(), v.minLength(1, 'Category is required')),
        image: v.optional(v.any()),
        created_at: v.pipe(v.string(), v.trim(), v.minLength(1, 'Created date is required')),
        is_published: v.boolean(),
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
                        const path = issue.path.map((p: any) => p.key).join('.');
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
            clearErrors('image');
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
        formData.append('title', data.title);
        formData.append('excerpt', data.excerpt);
        formData.append('content', data.content);
        formData.append('category', data.category);
        formData.append('created_at', data.created_at);
        formData.append('is_published', data.is_published.toString());

        if (data.image) {
            formData.append('image', data.image);
        }

        router.post(route('admin.posts.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Post created successfully.',
                    variant: 'success',
                });
            },
            onError: (errors) => {
                toast({
                    title: 'Error',
                    description: 'Failed to create post. Please check the form for errors.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handlePreview = () => {
        // For now, we'll just show an alert. In a real implementation,
        // you might want to open a modal or new tab with a preview
        alert('Preview functionality would be implemented here');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />

            <div className="w-full max-w-none space-y-6 px-4 sm:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Create New Post</h1>
                            <p className="text-muted-foreground">Create a new post or news article for your website</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handlePreview}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Post Content</CardTitle>
                                    <CardDescription>Enter the main content for your post</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter post title..."
                                            className={errors.title || validationErrors.title ? 'border-destructive' : ''}
                                        />
                                        {(errors.title || validationErrors.title) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.title || validationErrors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={data.excerpt}
                                            onChange={(e) => setData('excerpt', e.target.value)}
                                            placeholder="Brief description or summary..."
                                            rows={3}
                                            className={errors.excerpt ? 'border-destructive' : ''}
                                        />
                                        {errors.excerpt && <p className="mt-1 text-sm text-destructive">{errors.excerpt}</p>}
                                        <p className="mt-1 text-xs text-muted-foreground">This will be displayed in post listings and previews</p>
                                    </div>

                                    <div>
                                        <Label htmlFor="content">Content</Label>
                                        <div className="mt-2">
                                            <RichTextEditor
                                                value={data.content}
                                                onChange={(content) => setData('content', content)}
                                                placeholder="Write your post content here..."
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
                                    <CardTitle>Featured Image</CardTitle>
                                    <CardDescription>Upload an image for your post (optional)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Dropzone
                                        onFileSelect={handleImageSelect}
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
                                    <CardTitle>Post Settings</CardTitle>
                                    <CardDescription>Configure post category and publishing options</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => setData('category', value as 'news' | 'announcements')}
                                        >
                                            <SelectTrigger className={errors.category || validationErrors.category ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="news">News</SelectItem>
                                                <SelectItem value="announcements">Announcements</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(errors.category || validationErrors.category) && (
                                            <p className="mt-1 text-sm text-destructive">{errors.category || validationErrors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="created_at">Created Date</Label>
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
                                        <p className="mt-1 text-xs text-muted-foreground">Set when this post was originally created</p>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Published</Label>
                                            <p className="text-xs text-muted-foreground">Make this post visible to the public</p>
                                        </div>
                                        <Switch checked={data.is_published} onCheckedChange={(checked) => setData('is_published', checked)} />
                                    </div>

                                    {!data.is_published && (
                                        <Alert>
                                            <AlertDescription>Post will be saved as draft and can be published later</AlertDescription>
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
                                            {processing ? 'Creating...' : 'Create Post'}
                                        </Button>

                                        <Link href={route('admin.posts.index')}>
                                            <Button variant="outline" className="w-full" type="button">
                                                Cancel
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
