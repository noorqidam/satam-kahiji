import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Activity, ChevronLeft, ChevronRight, LogIn, LogOut, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'System Activity', href: '/admin/system-activity' },
];

interface SystemActivity {
    id: number;
    name: string;
    email: string;
    role: string;
    action: string;
    activity_type: string;
    ip_address: string;
    created_at: string;
}

interface SystemActivityPageProps {
    activities: SystemActivity[];
}

export default function SystemActivityPage({ activities }: SystemActivityPageProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const itemsPerPage = 10;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return activities.slice(startIndex, endIndex);
    }, [activities, currentPage]);

    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const showPagination = totalPages > 1;

    const [processing, setProcessing] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(paginatedData.map((activity) => activity.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
        }
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;

        const deletionCount = selectedIds.length;
        setProcessing(true);

        router.delete(route('admin.system-activity.bulk-destroy'), {
            data: {
                activity_ids: selectedIds,
            },
            onSuccess: () => {
                setSelectedIds([]);
                setShowDeleteDialog(false);
                setProcessing(false);
                // Refresh the page data to show updated list
                router.reload({ only: ['activities'] });
                toast({
                    title: 'Activities deleted successfully',
                    description: `Successfully deleted ${deletionCount} system activities.`,
                    variant: 'default',
                });
            },
            onError: (errors) => {
                setShowDeleteDialog(false);
                setProcessing(false);
                toast({
                    title: 'Failed to delete activities',
                    description: errors.message || 'An error occurred while deleting activities. Please try again.',
                    variant: 'destructive',
                });
            },
        });
    };

    const isAllSelected = paginatedData.length > 0 && selectedIds.length === paginatedData.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < paginatedData.length;
    const getActivityIcon = (activityType: string) => {
        switch (activityType) {
            case 'login':
                return <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />;
            case 'logout':
                return <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />;
            case 'registration':
                return <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
        }
    };

    const getActivityBgColor = (activityType: string) => {
        switch (activityType) {
            case 'login':
                return 'bg-green-100 dark:bg-green-900';
            case 'logout':
                return 'bg-red-100 dark:bg-red-900';
            case 'registration':
                return 'bg-blue-100 dark:bg-blue-900';
            default:
                return 'bg-gray-100 dark:bg-gray-900';
        }
    };

    const getActivityTypeLabel = (activityType: string) => {
        switch (activityType) {
            case 'login':
                return 'Login';
            case 'logout':
                return 'Logout';
            case 'registration':
                return 'Registration';
            default:
                return 'Activity';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Activity" />

            <div className="space-y-6 px-4 sm:px-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">System Activity</h1>
                    <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
                        Complete log of user activities including logins, logouts, and registrations
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span>All System Activities ({activities.length})</span>
                                {selectedIds.length > 0 && (
                                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={processing}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Selected ({selectedIds.length})
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete System Activities</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete {selectedIds.length} selected activities? This action cannot be
                                                    undone and will permanently remove the activity records from the system.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={processing}>
                                                    Cancel
                                                </Button>
                                                <Button variant="destructive" onClick={handleDeleteSelected} disabled={processing}>
                                                    {processing ? 'Deleting...' : `Delete ${selectedIds.length} Activities`}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            {showPagination && (
                                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, activities.length)} of{' '}
                                    {activities.length}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paginatedData.length > 0 ? (
                            <div className="space-y-4">
                                {/* Select All Checkbox */}
                                <div className="flex items-center gap-3 border-b pb-3">
                                    <Checkbox
                                        checked={isIndeterminate ? 'indeterminate' : isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        className="border-gray-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:border-gray-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                        {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {paginatedData.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                            <Checkbox
                                                checked={selectedIds.includes(activity.id)}
                                                onCheckedChange={(checked) => handleSelectItem(activity.id, checked as boolean)}
                                                className="border-gray-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:border-gray-600"
                                            />
                                            <div className="flex flex-1 items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${getActivityBgColor(activity.activity_type)}`}
                                                    >
                                                        {getActivityIcon(activity.activity_type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    activity.activity_type === 'login'
                                                                        ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                                                                        : activity.activity_type === 'logout'
                                                                          ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                                                                          : activity.activity_type === 'registration'
                                                                            ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                                                            : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                                                }`}
                                                            >
                                                                {getActivityTypeLabel(activity.activity_type)}
                                                            </span>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {activity.name} ({activity.role}) • {activity.ip_address}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">{activity.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        {new Date(activity.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {showPagination && (
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-gray-600 dark:text-gray-400">No system activities found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
