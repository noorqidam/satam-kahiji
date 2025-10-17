import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const { post } = usePage<ShowPostProps>().props;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('posts_management.breadcrumbs.admin_dashboard'), href: route('admin.dashboard') },
        { title: t('posts_management.breadcrumbs.posts_news'), href: route('admin.posts.index') },
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
                    title: t('posts_management.messages.success'),
                    description: data.message,
                    variant: 'success',
                });

                // Refresh the page to show updated data
                router.reload({ only: ['post'] });
            } else {
                throw new Error(data.message || t('posts_management.messages.update_error'));
            }
        } catch (error) {
            toast({
                title: t('posts_management.messages.error'),
                description: error instanceof Error ? error.message : t('posts_management.messages.update_error'),
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
                                {t('posts_management.forms.show.header.title')}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base lg:text-lg dark:text-gray-400">{t('posts_management.forms.show.header.description')}</p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                            <Button
                                variant={post.is_published ? 'destructive' : 'default'}
                                size="sm"
                                onClick={handleTogglePublish}
                                title={post.is_published ? t('posts_management.forms.show.actions.unpublish_post') : t('posts_management.forms.show.actions.publish_post')}
                                className="h-10 w-full shadow-md transition-all duration-200 hover:shadow-lg sm:w-auto"
                            >
                                {post.is_published ? (
                                    <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        <span className="xs:inline hidden">{t('posts_management.forms.show.actions.unpublish')}</span>
                                        <span className="xs:hidden">{t('posts_management.forms.show.actions.unpublish')}</span>
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        <span className="xs:inline hidden">{t('posts_management.forms.show.actions.publish_now')}</span>
                                        <span className="xs:hidden">{t('posts_management.forms.show.actions.publish')}</span>
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
                                    {t('posts_management.forms.show.actions.edit')}
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="h-10 w-full text-red-600 shadow-md transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-lg sm:w-auto"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('posts_management.forms.show.actions.delete')}
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
                                        {post.category === 'news' ? `📰 ${t('posts_management.categories.news')}` : `📢 ${t('posts_management.categories.announcements')}`}
                                    </Badge>
                                    <Badge
                                        className={
                                            post.is_published
                                                ? 'rounded-md bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 text-xs font-medium text-green-800 shadow-sm sm:px-3 sm:py-1.5 sm:text-sm'
                                                : 'rounded-md bg-gradient-to-r from-gray-100 to-slate-100 px-2 py-1 text-xs font-medium text-gray-600 shadow-sm sm:px-3 sm:py-1.5 sm:text-sm'
                                        }
                                    >
                                        {post.is_published ? `✅ ${t('posts_management.status.published')}` : `📝 ${t('posts_management.status.draft')}`}
                                    </Badge>
                                </div>

                                {/* Date Information */}
                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-400">
                                    <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                                        <Calendar className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {t('posts_management.forms.show.meta.created')}{' '}
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
                                                    {t('posts_management.forms.show.meta.published')}{' '}
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
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">{t('posts_management.forms.show.stats.characters')}</div>
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
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">{t('posts_management.forms.show.stats.words')}</div>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-3 text-center sm:p-4 dark:bg-purple-900/20">
                                <div className="text-lg font-bold text-purple-600 sm:text-xl lg:text-2xl">
                                    ~{Math.ceil(post.content.replace(/<[^>]*>/g, '').length / 1000)}
                                </div>
                                <div className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">{t('posts_management.forms.show.stats.min_read')}</div>
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
                                    <span className="font-medium text-gray-600 dark:text-gray-400">{t('posts_management.forms.show.meta.url_slug')}</span>
                                    <code className="rounded-md border bg-white px-2 py-1 font-mono text-xs break-all text-blue-600 dark:bg-gray-900 dark:text-blue-400">
                                        {post.slug}
                                    </code>
                                </div>
                                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm font-medium">{t('posts_management.forms.show.meta.last_updated')}</span>
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
