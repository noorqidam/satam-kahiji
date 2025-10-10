import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Edit, Eye, FileText, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

interface ShowPostProps {
    post: Post;
    [key: string]: unknown;
}

export default function ShowPost() {
    const { toast } = useToast();
    const { post } = usePage<ShowPostProps>().props;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Posts & News', href: route('admin.posts.index') },
        { title: post.title, href: route('admin.posts.show', post.id) },
    ];

    const handleTogglePublish = async () => {
        try {
            const response = await fetch(route('admin.posts.toggle-publish', post.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    is_published: !post.is_published,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: data.message,
                    variant: 'success',
                });

                // Refresh the page to show updated data
                router.reload({ only: ['post'] });
            } else {
                throw new Error(data.message || 'Failed to update post');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update post status',
                variant: 'destructive',
            });
        } finally {
            // Toggle completed
        }
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        router.delete(route('admin.posts.destroy', post.id));
    };

    const getCategoryBadgeVariant = (category: string) => {
        return category === 'news' ? 'default' : 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={post.title} />

            <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:rounded-xl sm:p-6 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-3xl">
                                Post Details
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base lg:text-lg dark:text-gray-400">Preview and manage your content</p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                            <Button
                                variant={post.is_published ? 'destructive' : 'default'}
                                size="sm"
                                onClick={handleTogglePublish}
                                title={post.is_published ? 'Unpublish Post' : 'Publish Post'}
                                className="h-10 w-full shadow-md transition-all duration-200 hover:shadow-lg sm:w-auto"
                            >
                                {post.is_published ? (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        <span className="xs:inline hidden">Unpublish</span>
                                        <span className="xs:hidden">Unpublish</span>
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        <span className="xs:inline hidden">Publish Now</span>
                                        <span className="xs:hidden">Publish</span>
                                    </>
                                )}
                            </Button>

                            <Link href={route('admin.posts.edit', post.id)} className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 w-full shadow-md transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-lg sm:w-auto"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="h-10 w-full text-red-600 shadow-md transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-lg sm:w-auto"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <Card className="overflow-hidden border-0 bg-white/90 shadow-lg backdrop-blur-sm sm:shadow-xl dark:bg-gray-900/90">
                    <CardHeader className="space-y-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:space-y-6 sm:p-6 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
                        {/* Meta Information */}
                        <div className="space-y-4">
                            {/* Badges and Date Information */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    <Badge
                                        variant={getCategoryBadgeVariant(post.category)}
                                        className="rounded-md px-2 py-1 text-xs font-medium capitalize shadow-sm sm:px-3 sm:py-1.5 sm:text-sm"
                                    >
                                        {post.category === 'news' ? '📰 News' : '📢 Announcements'}
                                    </Badge>
                                    <Badge
                                        className={
                                            post.is_published
                                                ? 'rounded-md bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 text-xs font-medium text-green-800 shadow-sm sm:px-3 sm:py-1.5 sm:text-sm'
                                                : 'rounded-md bg-gradient-to-r from-gray-100 to-slate-100 px-2 py-1 text-xs font-medium text-gray-600 shadow-sm sm:px-3 sm:py-1.5 sm:text-sm'
                                        }
                                    >
                                        {post.is_published ? '✅ Published' : '📝 Draft'}
                                    </Badge>
                                </div>

                                {/* Date Information */}
                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-400">
                                    <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                                        <Calendar className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                Created:{' '}
                                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {new Date(post.created_at).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {post.is_published && (
                                        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 shadow-sm dark:bg-green-900/20">
                                            <div className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-green-500"></div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium text-green-700 dark:text-green-400">
                                                    Published:{' '}
                                                    {new Date(post.updated_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-500">
                                                    {new Date(post.updated_at).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <CardTitle className="text-xl leading-tight font-bold break-words text-gray-900 sm:text-2xl lg:text-3xl xl:text-4xl dark:text-white">
                            {post.title}
                        </CardTitle>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 sm:p-4 dark:bg-blue-900/20">
                                <p className="text-sm leading-relaxed text-gray-700 italic sm:text-base lg:text-lg dark:text-gray-300">
                                    {post.excerpt}
                                </p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8">
                        {/* Featured Image */}
                        {post.image && (
                            <div className="w-full">
                                <div className="relative overflow-hidden rounded-lg shadow-lg sm:rounded-xl">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full object-contain transition-transform duration-300 hover:scale-105 sm:h-64 sm:object-cover lg:h-auto"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            </div>
                        )}

                        {/* Content Stats */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className="rounded-lg bg-blue-50 p-3 text-center sm:p-4 dark:bg-blue-900/20">
                                <div className="text-lg font-bold text-blue-600 sm:text-xl lg:text-2xl">
                                    {post.content.replace(/<[^>]*>/g, '').length}
                                </div>
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Characters</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3 text-center sm:p-4 dark:bg-green-900/20">
                                <div className="text-lg font-bold text-green-600 sm:text-xl lg:text-2xl">
                                    {
                                        post.content
                                            .replace(/<[^>]*>/g, '')
                                            .split(' ')
                                            .filter((word) => word.length > 0).length
                                    }
                                </div>
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Words</div>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-3 text-center sm:p-4 dark:bg-purple-900/20">
                                <div className="text-lg font-bold text-purple-600 sm:text-xl lg:text-2xl">
                                    ~{Math.ceil(post.content.replace(/<[^>]*>/g, '').length / 1000)}
                                </div>
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Min Read</div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="prose prose-sm sm:prose-base lg:prose-lg prose-gray dark:prose-invert max-w-none">
                            <div
                                className="overflow-x-auto rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 sm:p-6 sm:text-base lg:text-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>

                        {/* Footer Information */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">URL Slug:</span>
                                    <code className="rounded-md border bg-white px-2 py-1 font-mono text-xs break-all text-blue-600 dark:bg-gray-900 dark:text-blue-400">
                                        {post.slug}
                                    </code>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm font-medium">Last updated:</span>
                                        <div className="mt-1 space-y-0.5 text-xs">
                                            <div className="font-medium">
                                                {new Date(post.updated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div>
                                                {new Date(post.updated_at).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Cards */}
                <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 sm:gap-4 sm:pb-6 lg:grid-cols-3">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md transition-shadow duration-200 hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-800">
                                            <Eye className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Public View</h3>
                                    </div>
                                    <p className="text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-400">
                                        {post.is_published ? 'View how this post appears to visitors' : 'Post needs to be published first'}
                                    </p>
                                </div>
                                <Button
                                    variant={post.is_published ? 'default' : 'secondary'}
                                    size="sm"
                                    disabled={!post.is_published}
                                    className="w-full flex-shrink-0 shadow-md transition-all duration-200 hover:shadow-lg sm:w-auto"
                                >
                                    <span className="text-xs sm:text-sm">{post.is_published ? 'View Live' : 'Not Available'}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md transition-shadow duration-200 hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:h-10 sm:w-10 dark:bg-green-800">
                                            <Calendar className="h-4 w-4 text-green-600 sm:h-5 sm:w-5 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Schedule</h3>
                                    </div>
                                    <p className="text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-400">
                                        Schedule this post for future publication
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex-shrink-0 shadow-md transition-all duration-200 hover:shadow-lg sm:w-auto"
                                >
                                    <span className="text-xs sm:text-sm">Schedule</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md transition-shadow duration-200 hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl dark:from-purple-900/20 dark:to-pink-900/20">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 sm:h-10 sm:w-10 dark:bg-purple-800">
                                            <FileText className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Duplicate</h3>
                                    </div>
                                    <p className="text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-400">
                                        Create a copy of this post as template
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex-shrink-0 shadow-md transition-all duration-200 hover:shadow-lg sm:w-auto"
                                >
                                    <span className="text-xs sm:text-sm">Duplicate</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                itemName={post.title}
                itemType="post"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
