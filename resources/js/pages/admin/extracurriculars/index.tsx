import { useToast } from '@/hooks/use-toast';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, Trophy, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
    const { t } = useTranslation('common');
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [selectedExtracurriculars, setSelectedExtracurriculars] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [extracurricularToDelete, setExtracurricularToDelete] = useState<Extracurricular | null>(null);
    const [showExtracurricularDialog, setShowExtracurricularDialog] = useState<Extracurricular | null>(null);
    const { toast } = useToast();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('extracurricular_management.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('extracurricular_management.breadcrumbs.extracurricular_management'), href: '/admin/extracurriculars' },
    ];

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

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

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
                    title: t('extracurricular_management.success'),
                    description: t('extracurricular_management.messages.delete_success', { name: extracurricularToDelete.name }),
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: t('extracurricular_management.error'),
                    description: t('extracurricular_management.messages.delete_error'),
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
                    title: t('extracurricular_management.success'),
                    description: t('extracurricular_management.messages.bulk_delete_success', { count: selectedExtracurriculars.length }),
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: t('extracurricular_management.error'),
                    description: t('extracurricular_management.messages.bulk_delete_error'),
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
            <Head title={t('extracurricular_management.page_title')} />

            <div className="space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 lg:items-center">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl dark:text-gray-100">
                            {t('extracurricular_management.page_title')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-400">
                            {t('extracurricular_management.page_description')}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Link href={route('admin.extracurriculars.create')}>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">{t('extracurricular_management.add_activity')}</span>
                                <span className="sm:hidden">{t('extracurricular_management.add_activity_short')}</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                                    <span>{t('extracurricular_management.all_activities')}</span>
                                    <span className="text-sm font-normal text-gray-500">({extracurriculars.total})</span>
                                </CardTitle>
                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                    <div className="relative w-full sm:w-auto">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder={t('extracurricular_management.search_placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => {
                                                const newSearchTerm = e.target.value;
                                                setSearchTerm(newSearchTerm);
                                                debouncedUpdateFilters(newSearchTerm);
                                            }}
                                            className="w-full pl-10 sm:w-80"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(searchTerm || selectedExtracurriculars.length > 0) && (
                            <div className="mt-3 border-t pt-3 sm:mt-4 sm:pt-4">
                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="flex flex-wrap gap-2">
                                        {searchTerm && (
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                {t('extracurricular_management.filters.search_label', { term: searchTerm })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="xs:flex-row xs:space-y-0 xs:space-x-2 flex flex-col space-y-2 sm:flex-row sm:items-center">
                                        {selectedExtracurriculars.length > 0 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setShowBulkDeleteConfirm(true)}
                                                disabled={isLoading}
                                                className="xs:w-auto w-full"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {t('extracurricular_management.filters.delete_selected', {
                                                        count: selectedExtracurriculars.length,
                                                    })}
                                                </span>
                                                <span className="sm:hidden">Hapus ({selectedExtracurriculars.length})</span>
                                            </Button>
                                        )}
                                        {searchTerm && (
                                            <Button variant="outline" size="sm" onClick={clearFilters} className="xs:w-auto w-full">
                                                <X className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">{t('extracurricular_management.filters.clear_filters')}</span>
                                                <span className="sm:hidden">Hapus Filter</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {extracurriculars.data.length > 0 ? (
                            <>
                                {/* Mobile Card Layout */}
                                <div className="block lg:hidden">
                                    <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                                        <Checkbox
                                            checked={
                                                selectedExtracurriculars.length === extracurriculars.data.length && extracurriculars.data.length > 0
                                            }
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Pilih semua</span>
                                    </div>
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {extracurriculars.data.map((extracurricular) => (
                                            <div key={extracurricular.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <div className="space-y-3">
                                                    {/* Top row with checkbox, image, content and actions */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex min-w-0 flex-1 items-start space-x-3">
                                                            <Checkbox
                                                                checked={selectedExtracurriculars.includes(extracurricular.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handleSelectExtracurricular(extracurricular.id, checked as boolean)
                                                                }
                                                                className="mt-1"
                                                            />
                                                            <div className="flex min-w-0 flex-1 items-start space-x-3">
                                                                {extracurricular.photo_url ? (
                                                                    <img
                                                                        src={extracurricular.photo_url}
                                                                        alt={extracurricular.name}
                                                                        className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                                                                        <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1">
                                                                    <h3 className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                                        {extracurricular.name}
                                                                    </h3>
                                                                    {extracurricular.description && (
                                                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            {extracurricular.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-2 flex items-center space-x-1">
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
                                                    </div>

                                                    {/* Bottom row with student count and date aligned */}
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center space-x-2 text-gray-500">
                                                            <Users className="h-4 w-4 flex-shrink-0" />
                                                            <span className="font-medium">{extracurricular.students_count} siswa</span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(extracurricular.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop Table Layout */}
                                <div className="hidden lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead>
                                                <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                                    <th className="px-6 py-3">
                                                        <Checkbox
                                                            checked={
                                                                selectedExtracurriculars.length === extracurriculars.data.length &&
                                                                extracurriculars.data.length > 0
                                                            }
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {t('extracurricular_management.table.activity')}
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {t('extracurricular_management.table.description')}
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {t('extracurricular_management.table.students')}
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {t('extracurricular_management.table.created')}
                                                    </th>
                                                    <th className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                        {t('extracurricular_management.table.actions')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {extracurriculars.data.map((extracurricular) => (
                                                    <tr
                                                        key={extracurricular.id}
                                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <Checkbox
                                                                checked={selectedExtracurriculars.includes(extracurricular.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handleSelectExtracurricular(extracurricular.id, checked as boolean)
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {extracurricular.photo_url ? (
                                                                    <img
                                                                        src={extracurricular.photo_url}
                                                                        alt={extracurricular.name}
                                                                        className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                                                                        <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                                    </div>
                                                                )}
                                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {extracurricular.name}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="max-w-xs truncate text-gray-600 dark:text-gray-400">
                                                                {extracurricular.description || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-start gap-2">
                                                                <Users className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {extracurricular.students_count}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                                            {new Date(extracurricular.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
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
                                </div>
                                {extracurriculars.last_page > 1 && (
                                    <div className="mt-4 border-t border-gray-200 px-4 py-3 lg:mt-6 lg:px-6 dark:border-gray-700">
                                        <Pagination data={extracurriculars} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-8 sm:py-12">
                                <Trophy className="h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                                <h3 className="mt-4 text-center text-base font-medium text-gray-900 sm:text-lg dark:text-gray-100">
                                    {t('extracurricular_management.empty_state.no_activities')}
                                </h3>
                                <p className="mt-2 max-w-md text-center text-sm text-gray-600 sm:text-base dark:text-gray-400">
                                    {searchTerm
                                        ? t('extracurricular_management.empty_state.try_adjusting')
                                        : t('extracurricular_management.empty_state.get_started')}
                                </p>
                                {!searchTerm && (
                                    <Link href={route('admin.extracurriculars.create')} className="mt-4 w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto">
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('extracurricular_management.empty_state.add_activity')}
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
                <DialogContent className="mx-2 max-h-[85vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:mx-4 sm:w-auto sm:max-w-2xl md:mx-auto">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>{t('extracurricular_management.dialogs.delete_activities.title')}</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="sr-only">Confirmation dialog to delete multiple extracurricular activities</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p
                            className="text-sm text-gray-500 dark:text-gray-400"
                            dangerouslySetInnerHTML={{
                                __html: t('extracurricular_management.dialogs.delete_activities.message', { count: selectedExtracurriculars.length }),
                            }}
                        />
                        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
                            <Button variant="ghost" onClick={() => setShowBulkDeleteConfirm(false)} disabled={isLoading} className="w-full sm:w-auto">
                                {t('extracurricular_management.dialogs.delete_activities.cancel')}
                            </Button>
                            <Button variant="destructive" onClick={confirmBulkDelete} disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading
                                    ? t('extracurricular_management.dialogs.delete_activities.deleting')
                                    : t('extracurricular_management.dialogs.delete_activities.delete')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Dialog */}
            <Dialog open={!!extracurricularToDelete} onOpenChange={() => setExtracurricularToDelete(null)}>
                <DialogContent className="mx-2 max-h-[85vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:mx-4 sm:w-auto sm:max-w-2xl md:mx-auto">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>{t('extracurricular_management.dialogs.delete_activity.title')}</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="sr-only">Confirmation dialog to delete a single extracurricular activity</DialogDescription>
                    </DialogHeader>
                    {extracurricularToDelete && (
                        <div className="space-y-4">
                            <p
                                className="text-sm text-gray-500 dark:text-gray-400"
                                dangerouslySetInnerHTML={{
                                    __html: t('extracurricular_management.dialogs.delete_activity.message', { name: extracurricularToDelete.name }),
                                }}
                            />
                            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setExtracurricularToDelete(null)}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {t('extracurricular_management.dialogs.delete_activity.cancel')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={confirmDeleteExtracurricular}
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading
                                        ? t('extracurricular_management.dialogs.delete_activity.deleting')
                                        : t('extracurricular_management.dialogs.delete_activity.delete')}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Activity Details Dialog */}
            <Dialog open={!!showExtracurricularDialog} onOpenChange={() => setShowExtracurricularDialog(null)}>
                <DialogContent className="mx-3 max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-[320px] overflow-y-auto sm:mx-4 sm:w-auto sm:max-w-lg md:mx-auto md:max-w-2xl lg:max-w-3xl">
                    <DialogHeader className="pb-4 sm:pb-6">
                        <DialogTitle className="text-base leading-tight font-semibold sm:text-xl md:text-2xl">
                            {t('extracurricular_management.dialogs.activity_details.title', { name: showExtracurricularDialog?.name })}
                        </DialogTitle>
                        <DialogDescription className="sr-only">Detailed information about the selected extracurricular activity</DialogDescription>
                    </DialogHeader>
                    {showExtracurricularDialog && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col space-y-6 sm:flex-row sm:items-start sm:gap-8 sm:space-y-0 md:gap-12 lg:gap-16">
                                <div className="flex w-full justify-center sm:w-auto sm:min-w-[140px] md:min-w-[180px] lg:min-w-[200px]">
                                    {showExtracurricularDialog.photo_url ? (
                                        <img
                                            src={showExtracurricularDialog.photo_url}
                                            alt={showExtracurricularDialog.name}
                                            className="h-24 w-24 flex-shrink-0 rounded-xl object-cover sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 dark:bg-orange-900">
                                            <Trophy className="h-12 w-12 text-orange-600 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 dark:text-orange-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl dark:text-gray-100">
                                        {showExtracurricularDialog.name}
                                    </h3>
                                    {showExtracurricularDialog.description && (
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg dark:text-gray-400">
                                            {showExtracurricularDialog.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 md:gap-8">
                                <div className="rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm dark:border-blue-700/30 dark:bg-gray-800 dark:from-blue-900/20 dark:to-blue-800/20">
                                    <label className="mb-2 block text-xs font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                                        {t('extracurricular_management.dialogs.activity_details.participating_students')}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800">
                                            <Users className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                                        </div>
                                        <span className="text-base font-bold text-gray-900 sm:text-lg dark:text-gray-100">
                                            {t('extracurricular_management.dialogs.activity_details.students_count', {
                                                count: showExtracurricularDialog.students_count,
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm dark:border-green-700/30 dark:bg-gray-800 dark:from-green-900/20 dark:to-green-800/20">
                                    <label className="mb-2 block text-xs font-semibold tracking-wide text-green-600 uppercase dark:text-green-400">
                                        {t('extracurricular_management.dialogs.activity_details.created')}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-800">
                                            <svg
                                                className="h-4 w-4 text-green-600 dark:text-green-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-base font-bold text-gray-900 sm:text-lg dark:text-gray-100">
                                            {new Date(showExtracurricularDialog.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
