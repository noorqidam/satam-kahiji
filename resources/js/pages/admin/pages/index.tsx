import { Head, Link } from '@inertiajs/react';
import { AlertCircle, Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string;
    image: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedPages {
    data: Page[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    total_pages: number;
    pages_with_images: number;
    pages_without_images: number;
    image_percentage: number;
}

interface Props {
    pages: PaginatedPages | Page[];
    filters?: {
        search: string;
        has_image: string;
        order: string;
    };
    stats?: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Page Management', href: '/admin/pages' },
];

export default function PagesIndex({ pages }: Props) {
    const { dialogState, openDialog, closeDialog, confirmDelete } = useDeleteDialog();

    // Handle both paginated and simple array data
    const pageData = Array.isArray(pages) ? pages : pages.data || [];

    // All pages are custom pages now - no predefined restrictions

    const handleDelete = (page: Page) => {
        openDialog('single', page.id, page.title);
    };

    const handleConfirmDelete = () => {
        if (dialogState.itemId) {
            confirmDelete(route('admin.pages.destroy', dialogState.itemId));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Page Management" />

            <div className="space-y-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 dark:border-blue-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-800">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">Page Management</h1>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Create and manage pages for your website</p>
                            </div>
                        </div>

                        <Link href={route('admin.pages.create')}>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="xs:inline hidden">Create </span>Page
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* All Pages */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                        All Pages ({pageData.length})
                    </h2>

                    {pageData.length === 0 ? (
                        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileText className="mb-4 h-12 w-12 text-gray-400" />
                                <p className="mb-4 text-center text-gray-500">No pages created yet</p>
                                <Link href={route('admin.pages.create')}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Page
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {pageData.map((page) => (
                                <Card key={page.id} className="flex flex-col border-2 border-gray-200 dark:border-gray-700">
                                    <CardHeader className="flex-shrink-0 pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <CardTitle className="min-w-0 flex-1 text-lg leading-tight">
                                                <span className="block truncate">{page.title}</span>
                                            </CardTitle>
                                            <Badge variant="outline" className="shrink-0 text-xs">
                                                /{page.slug}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex flex-1 flex-col">
                                        {page.image && (
                                            <div className="mb-3 flex-shrink-0">
                                                <img src={page.image || undefined} alt={page.title} className="h-32 w-full rounded-md object-cover" />
                                            </div>
                                        )}

                                        <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600 dark:text-gray-400">
                                            {page.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                        </p>

                                        <div className="mb-3 grid grid-cols-3 gap-2">
                                            <Link href={route('admin.pages.show', page.id)}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="ml-1 hidden sm:inline">View</span>
                                                </Button>
                                            </Link>

                                            <Link href={route('admin.pages.edit', page.id)}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit className="h-4 w-4" />
                                                    <span className="ml-1 hidden sm:inline">Edit</span>
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(page)}
                                                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="ml-1 hidden sm:inline">Delete</span>
                                            </Button>
                                        </div>

                                        <p className="flex-shrink-0 text-xs text-gray-500">
                                            Created:{' '}
                                            {new Date(page.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {dialogState.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Page</h3>
                        </div>
                        <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
                            Are you sure you want to delete{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">"{dialogState.itemName}"</span>? This action cannot be
                            undone and all page content will be permanently removed.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>
                                Delete Page
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
