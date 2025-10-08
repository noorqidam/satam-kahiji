import { useToast } from '@/hooks/use-toast';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, Trophy, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Extracurricular Management', href: '/admin/extracurriculars' },
];

interface Extracurricular {
    id: number;
    name: string;
    description?: string;
    photo?: string;
    photo_url?: string;
    students_count: number;
    created_at: string;
}

interface ExtracurricularIndexProps {
    extracurriculars: PaginationData & {
        data: Extracurricular[];
    };
    filters?: {
        search: string;
    };
}

export default function ExtracurricularIndex({ extracurriculars, filters = { search: '' } }: ExtracurricularIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [selectedExtracurriculars, setSelectedExtracurriculars] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [extracurricularToDelete, setExtracurricularToDelete] = useState<Extracurricular | null>(null);
    const [showExtracurricularDialog, setShowExtracurricularDialog] = useState<Extracurricular | null>(null);
    const { toast } = useToast();

    // Refresh data when page becomes visible (user returns from other pages)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Refresh the current page data when returning to this page
                router.reload({ only: ['extracurriculars'] });
            }
        };

        const handleFocus = () => {
            // Refresh data when window regains focus
            router.reload({ only: ['extracurriculars'] });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const updateFilters = (search: string) => {
        const params: Record<string, string> = {};

        if (search.trim()) {
            params.search = search.trim();
        }

        setIsLoading(true);
        router.get(route('admin.extracurriculars.index'), params, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const debouncedUpdateFilters = (search: string) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => updateFilters(search), 300);
        setDebounceTimer(timer);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedExtracurriculars(extracurriculars.data.map((extracurricular) => extracurricular.id));
        } else {
            setSelectedExtracurriculars([]);
        }
    };

    const handleSelectExtracurricular = (extracurricularId: number, checked: boolean) => {
        if (checked) {
            setSelectedExtracurriculars([...selectedExtracurriculars, extracurricularId]);
        } else {
            setSelectedExtracurriculars(selectedExtracurriculars.filter((id) => id !== extracurricularId));
        }
    };

    const confirmDeleteExtracurricular = () => {
        if (!extracurricularToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.extracurriculars.destroy', extracurricularToDelete.id), {
            onSuccess: () => {
                setExtracurricularToDelete(null);
                toast({
                    title: 'Success',
                    description: `${extracurricularToDelete.name} has been deleted successfully.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete extracurricular activity. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const confirmBulkDelete = () => {
        setIsLoading(true);
        router.delete(route('admin.extracurriculars.bulk-destroy'), {
            data: { ids: selectedExtracurriculars },
            onSuccess: () => {
                setSelectedExtracurriculars([]);
                setShowBulkDeleteConfirm(false);
                toast({
                    title: 'Success',
                    description: `${selectedExtracurriculars.length} extracurricular activities have been deleted successfully.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete extracurricular activities. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        router.get(route('admin.extracurriculars.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Extracurricular Management" />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Extracurricular Management</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                            Manage extracurricular activities and student assignments
                        </p>
                    </div>
                    <Link href={route('admin.extracurriculars.create')}>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Add New Activity</span>
                            <span className="sm:hidden">Add Activity</span>
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <CardTitle>All Activities ({extracurriculars.total})</CardTitle>
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name or description"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const newSearchTerm = e.target.value;
                                            setSearchTerm(newSearchTerm);
                                            debouncedUpdateFilters(newSearchTerm);
                                        }}
                                        className="w-full pl-10 sm:w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        {(searchTerm || selectedExtracurriculars.length > 0) && (
                            <div className="mt-4 flex flex-col space-y-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div className="flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                    {selectedExtracurriculars.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteConfirm(true)} disabled={isLoading}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Selected ({selectedExtracurriculars.length})
                                        </Button>
                                    )}
                                    {searchTerm && (
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {extracurriculars.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                                <th className="pr-4 pb-3">
                                                    <Checkbox
                                                        checked={
                                                            selectedExtracurriculars.length === extracurriculars.data.length &&
                                                            extracurriculars.data.length > 0
                                                        }
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Activity</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Description</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Students</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Created</th>
                                                <th className="pb-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {extracurriculars.data.map((extracurricular) => (
                                                <tr
                                                    key={extracurricular.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                                                >
                                                    <td className="py-4 pr-4">
                                                        <Checkbox
                                                            checked={selectedExtracurriculars.includes(extracurricular.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleSelectExtracurricular(extracurricular.id, checked as boolean)
                                                            }
                                                        />
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            {extracurricular.photo_url ? (
                                                                <img
                                                                    src={extracurricular.photo_url}
                                                                    alt={extracurricular.name}
                                                                    className="h-10 w-10 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                                                                    <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                                </div>
                                                            )}
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{extracurricular.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                                                            {extracurricular.description || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4 text-gray-500" />
                                                            <span className="text-gray-900 dark:text-gray-100">{extracurricular.students_count}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">
                                                        {new Date(extracurricular.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setShowExtracurricularDialog(extracurricular)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Link href={route('admin.extracurriculars.edit', extracurricular.id)}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setExtracurricularToDelete(extracurricular)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {extracurriculars.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination data={extracurriculars} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Trophy className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No activities found</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {searchTerm ? 'Try adjusting your search.' : 'Get started by adding a new extracurricular activity.'}
                                </p>
                                {!searchTerm && (
                                    <Link href={route('admin.extracurriculars.create')} className="mt-4">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Activity
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>Delete Activities</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete <strong>{selectedExtracurriculars.length}</strong> activities? This action cannot be
                            undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="ghost" onClick={() => setShowBulkDeleteConfirm(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmBulkDelete} disabled={isLoading}>
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Dialog */}
            <Dialog open={!!extracurricularToDelete} onOpenChange={() => setExtracurricularToDelete(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>Delete Activity</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    {extracurricularToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete <strong>{extracurricularToDelete.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button variant="ghost" onClick={() => setExtracurricularToDelete(null)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDeleteExtracurricular} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Activity Details Dialog */}
            <Dialog open={!!showExtracurricularDialog} onOpenChange={() => setShowExtracurricularDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Activity Details: {showExtracurricularDialog?.name}</DialogTitle>
                    </DialogHeader>
                    {showExtracurricularDialog && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                {showExtracurricularDialog.photo_url ? (
                                    <img
                                        src={showExtracurricularDialog.photo_url}
                                        alt={showExtracurricularDialog.name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                                        <Trophy className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{showExtracurricularDialog.name}</h3>
                                    {showExtracurricularDialog.description && (
                                        <p className="text-gray-600 dark:text-gray-400">{showExtracurricularDialog.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Participating Students</label>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">
                                            {showExtracurricularDialog.students_count} students
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                        {new Date(showExtracurricularDialog.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
