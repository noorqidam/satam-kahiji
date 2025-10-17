import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Calendar, Edit, Eye, FileText, Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

interface PostsPageProps {
    posts: PaginationData & { data: Post[] };
    filters: {
        category?: string;
        search?: string;
        status?: string;
    };
    [key: string]: unknown;
}

export default function PostsIndex() {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const { posts, filters } = usePage<PostsPageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('posts_management.breadcrumbs.admin_dashboard'), href: route('admin.dashboard') },
        { title: t('posts_management.breadcrumbs.posts_news'), href: route('admin.posts.index') },
    ];
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);

    const updateFilters = useCallback(() => {
        const params: Record<string, string> = {};

        if (searchTerm.trim()) {
            params.search = searchTerm.trim();
        }
        if (selectedCategory !== 'all') {
            params.category = selectedCategory;
        }
        if (selectedStatus !== 'all') {
            params.status = selectedStatus;
        }

        router.get(route('admin.posts.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [searchTerm, selectedCategory, selectedStatus]);

    // Real-time search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateFilters();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory, selectedStatus, updateFilters]);

    const handleTogglePublish = async (post: Post) => {
        setToggleLoading(post.id);

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
                    description: data.message || t('posts_management.messages.update_success'),
                    variant: 'success',
                });

                // Refresh the page to show updated data
                router.reload({ only: ['posts'] });
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
            setToggleLoading(null);
        }
    };

    const handleDelete = (post: Post) => {
        setPostToDelete(post);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            router.delete(route('admin.posts.destroy', postToDelete.id), {
                preserveState: true,
                preserveScroll: true,
            });
            setPostToDelete(null);
        }
    };

    const getCategoryBadgeVariant = (category: string) => {
        return category === 'news' ? 'default' : 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('posts_management.page_title')} />

            <div className="w-full max-w-none space-y-3 px-4 sm:px-8">
                {/* Header */}
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:rounded-xl sm:p-6 dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2 text-center sm:text-left">
                            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
                                {t('posts_management.header.title')}
                            </h1>
                            <p className="text-sm text-muted-foreground sm:text-base lg:text-lg">
                                {t('posts_management.header.description')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-start sm:gap-4 sm:text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span>{posts.data.filter((post) => post.is_published).length} {t('posts_management.stats.published')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                    <span>{posts.data.filter((post) => !post.is_published).length} {t('posts_management.stats.drafts')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span>{posts.total} {t('posts_management.stats.total_posts')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                            <Link href={route('admin.posts.create')} className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl sm:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                    <span className="xs:inline hidden">{t('posts_management.actions.create_new_post')}</span>
                                    <span className="xs:hidden">{t('posts_management.actions.create_post')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">
                    <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-xl text-gray-900 dark:text-white">{t('posts_management.filters.title')}</CardTitle>
                        </div>
                        <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                            {t('posts_management.filters.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Real-time Search and Filters - Single Row */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
                            {/* Search Input */}
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={t('posts_management.filters.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 border-gray-200 pl-10 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 lg:flex-shrink-0">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-11 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:w-[180px] dark:border-gray-700">
                                        <SelectValue placeholder={t('posts_management.filters.all_categories')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('posts_management.filters.all_categories')}</SelectItem>
                                        <SelectItem value="news">📰 {t('posts_management.categories.news')}</SelectItem>
                                        <SelectItem value="announcements">📢 {t('posts_management.categories.announcements')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="h-11 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:w-[150px] dark:border-gray-700">
                                        <SelectValue placeholder={t('posts_management.filters.all_status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('posts_management.filters.all_status')}</SelectItem>
                                        <SelectItem value="published">✅ {t('posts_management.status.published')}</SelectItem>
                                        <SelectItem value="draft">📝 {t('posts_management.status.draft')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Posts Table */}
                {posts.data.length === 0 ? (
                    <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg dark:from-gray-900 dark:to-gray-800">
                        <CardContent className="py-20">
                            <div className="text-center">
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                                    <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">{t('posts_management.empty_state.title')}</h3>
                                <p className="mx-auto mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
                                    {t('posts_management.empty_state.description')}
                                </p>
                                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                    <Link href={route('admin.posts.create')}>
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            {t('posts_management.actions.create_first_post')}
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="lg" className="border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <FileText className="mr-2 h-4 w-4" />
                                        {t('posts_management.actions.learn_best_practices')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-3 w-full shadow-sm">
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="border-b">
                                        <TableHead className="w-16 sm:w-20">{t('posts_management.table.columns.image')}</TableHead>
                                        <TableHead className="min-w-[200px]">{t('posts_management.table.columns.title_content')}</TableHead>
                                        <TableHead className="hidden w-28 sm:table-cell">{t('posts_management.table.columns.category')}</TableHead>
                                        <TableHead className="w-20 sm:w-24">{t('posts_management.table.columns.published')}</TableHead>
                                        <TableHead className="hidden w-32 md:table-cell">{t('posts_management.table.columns.created_at')}</TableHead>
                                        <TableHead className="hidden w-32 lg:table-cell">{t('posts_management.table.columns.published_date')}</TableHead>
                                        <TableHead className="w-24 text-right sm:w-36">{t('posts_management.table.columns.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.data.map((post) => (
                                        <TableRow
                                            key={post.id}
                                            className="group border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 dark:border-gray-800 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10"
                                        >
                                            {/* Image */}
                                            <TableCell className="py-4">
                                                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shadow-md transition-shadow duration-200 group-hover:shadow-lg sm:h-16 sm:w-16 sm:rounded-xl dark:from-gray-700 dark:to-gray-800">
                                                    {post.image ? (
                                                        <>
                                                            <img
                                                                src={post.image}
                                                                alt={post.title}
                                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 rounded-lg bg-black/0 transition-colors duration-200 group-hover:bg-black/10 sm:rounded-xl"></div>
                                                        </>
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-500 sm:h-7 sm:w-7" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Title & Content */}
                                            <TableCell className="py-4">
                                                <div className="space-y-1 sm:space-y-2">
                                                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 sm:line-clamp-2 sm:text-base lg:text-lg dark:text-white dark:group-hover:text-blue-400">
                                                        {post.title}
                                                    </h3>
                                                    {post.excerpt && (
                                                        <p className="line-clamp-1 hidden text-xs leading-relaxed text-gray-600 sm:line-clamp-2 sm:block sm:text-sm dark:text-gray-400">
                                                            {post.excerpt}
                                                        </p>
                                                    )}
                                                    <div className="hidden items-center gap-1 text-xs text-gray-500 sm:flex">
                                                        <span>{post.content.replace(/<[^>]*>/g, '').length} {t('posts_management.table.content_stats.characters')}</span>
                                                        <span>•</span>
                                                        <span>~{Math.ceil(post.content.replace(/<[^>]*>/g, '').length / 1000)} {t('posts_management.table.content_stats.min_read')}</span>
                                                    </div>
                                                    {/* Mobile: Show category and status inline */}
                                                    <div className="mt-1 flex items-center gap-2 sm:hidden">
                                                        <Badge variant={getCategoryBadgeVariant(post.category)} className="px-2 py-0.5 text-xs">
                                                            {post.category === 'news' ? '📰' : '📢'}
                                                        </Badge>
                                                        <Badge
                                                            className={
                                                                post.is_published
                                                                    ? 'bg-green-100 px-2 py-0.5 text-xs text-green-800'
                                                                    : 'bg-gray-100 px-2 py-0.5 text-xs text-gray-600'
                                                            }
                                                        >
                                                            {post.is_published ? '✅' : '📝'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell className="hidden py-4 sm:table-cell">
                                                <Badge
                                                    variant={getCategoryBadgeVariant(post.category)}
                                                    className="px-2 py-1 text-xs font-medium capitalize shadow-sm transition-shadow duration-200 hover:shadow-md sm:px-3"
                                                >
                                                    {post.category === 'news' ? `📰 ${t('posts_management.categories.news')}` : `📢 ${t('posts_management.categories.announcements')}`}
                                                </Badge>
                                            </TableCell>

                                            {/* Status Toggle */}
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={post.is_published}
                                                        onCheckedChange={() => handleTogglePublish(post)}
                                                        disabled={toggleLoading === post.id}
                                                        className="data-[state=checked]:bg-green-500"
                                                    />
                                                    <span className="hidden text-xs text-muted-foreground sm:inline">
                                                        {toggleLoading === post.id ? t('posts_management.status.updating') : post.is_published ? t('posts_management.status.published') : t('posts_management.status.draft')}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Created At */}
                                            <TableCell className="hidden py-4 md:table-cell">
                                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium whitespace-nowrap text-gray-900 sm:text-sm dark:text-white">
                                                            {new Date(post.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                        <span className="text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                            {new Date(post.created_at).toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Published */}
                                            <TableCell className="hidden py-4 lg:table-cell">
                                                {post.is_published ? (
                                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium whitespace-nowrap text-green-700 sm:text-sm dark:text-green-400">
                                                                {t('posts_management.status.published')}
                                                            </span>
                                                            <span className="text-xs whitespace-nowrap text-green-600 dark:text-green-500">
                                                                {new Date(post.updated_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                            <span className="text-xs whitespace-nowrap text-green-500 dark:text-green-400">
                                                                {new Date(post.updated_at).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="italic">{t('posts_management.status.not_published')}</span>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Desktop Actions */}
                                                    <div className="hidden items-center gap-1 opacity-100 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
                                                        <Link href={route('admin.posts.show', post.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title={t('posts_management.actions.view_post')}
                                                                className="h-8 w-8 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl dark:hover:from-blue-950 dark:hover:to-indigo-950"
                                                            >
                                                                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.posts.edit', post.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title={t('posts_management.actions.edit_post')}
                                                                className="h-8 w-8 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl dark:hover:from-orange-950 dark:hover:to-amber-950"
                                                            >
                                                                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(post)}
                                                            title={t('posts_management.actions.delete_post')}
                                                            className="h-8 w-8 rounded-lg text-gray-500 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 hover:shadow-md sm:h-10 sm:w-10 sm:rounded-xl dark:hover:from-red-950 dark:hover:to-pink-950"
                                                        >
                                                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Button>
                                                    </div>

                                                    {/* Mobile Actions - Dropdown */}
                                                    <div className="flex items-center gap-1 sm:hidden">
                                                        <Link href={route('admin.posts.show', post.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.posts.edit', post.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(post)}
                                                            className="h-8 w-8 rounded-lg text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('posts_management.pagination.showing')} <span className="font-medium text-gray-900 dark:text-white">{posts.from}</span> {t('posts_management.pagination.to')}{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">{posts.to}</span> {t('posts_management.pagination.of')}{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">{posts.total}</span> {t('posts_management.pagination.results')}
                                </div>
                                <Pagination data={posts} />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                itemName={postToDelete?.title}
                itemType="post"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
