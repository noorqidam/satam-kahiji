import { useToast } from '@/hooks/use-toast';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, User, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Staff Management', href: '/admin/staff' },
];

interface Staff {
    id: number;
    user_id: number | null;
    name: string;
    position: string;
    division: string;
    email: string;
    phone: string | null;
    photo: string | null;
    photo_url?: string;
    bio: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

interface StaffIndexProps {
    staff: PaginationData & {
        data: Staff[];
    };
    divisions: string[];
    filters?: {
        search: string;
        divisions: string[];
    };
}

const divisionLabels: Record<string, string> = {
    'Administrasi Sistem': 'Administrasi Sistem',
    'Kepala Sekolah': 'Kepala Sekolah',
    'Wakil Kepala Sekolah': 'Wakil Kepala Sekolah',
    Akademik: 'Akademik',
    'Hubungan Masyarakat': 'Hubungan Masyarakat',
    'Tata Usaha': 'Tata Usaha',
};

const divisionColors: Record<string, string> = {
    'Administrasi Sistem': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Kepala Sekolah': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Wakil Kepala Sekolah': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    Akademik: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Hubungan Masyarakat': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Tata Usaha': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function StaffIndex({ staff, divisions, filters = { search: '', divisions: [] } }: StaffIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedDivisions, setSelectedDivisions] = useState<string[]>(filters?.divisions || []);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
    const [showStaffDialog, setShowStaffDialog] = useState<Staff | null>(null);
    const { toast } = useToast();

    const updateFilters = (search: string, divisions: string[]) => {
        const params: Record<string, string> = {};

        if (search.trim()) {
            params.search = search.trim();
        }

        if (divisions.length > 0) {
            params.divisions = divisions.join(',');
        }

        setIsLoading(true);
        router.get(route('admin.staff.index'), params, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const debouncedUpdateFilters = (search: string, divisions: string[]) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => updateFilters(search, divisions), 300);
        setDebounceTimer(timer);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            // Only select staff members that don't have user accounts
            setSelectedStaff(staff.data.filter((member) => !member.user).map((member) => member.id));
        } else {
            setSelectedStaff([]);
        }
    };

    // Get staff members that can be deleted (no user account)
    const deletableStaff = staff.data.filter((member) => !member.user);

    const handleSelectStaff = (staffId: number, checked: boolean) => {
        if (checked) {
            setSelectedStaff([...selectedStaff, staffId]);
        } else {
            setSelectedStaff(selectedStaff.filter((id) => id !== staffId));
        }
    };

    const confirmDeleteStaff = () => {
        if (!staffToDelete) return;

        setIsLoading(true);
        router.delete(route('admin.staff.destroy', staffToDelete.id), {
            onSuccess: () => {
                setStaffToDelete(null);
                toast({
                    title: 'Success',
                    description: `${staffToDelete.name} has been deleted successfully.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete staff member. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const confirmBulkDelete = () => {
        setIsLoading(true);
        router.delete(route('admin.staff.bulk-destroy'), {
            data: { ids: selectedStaff },
            onSuccess: () => {
                setSelectedStaff([]);
                setShowBulkDeleteConfirm(false);
                toast({
                    title: 'Success',
                    description: `${selectedStaff.length} staff members have been deleted successfully.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete staff members. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDivisions([]);
        router.get(route('admin.staff.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Staff Management</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Manage staff members and their information</p>
                    </div>
                    <Link href={route('admin.staff.create')}>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Add New Staff</span>
                            <span className="sm:hidden">Add Staff</span>
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <CardTitle>All Staff ({staff.total})</CardTitle>
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name, position"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const newSearchTerm = e.target.value;
                                            setSearchTerm(newSearchTerm);
                                            debouncedUpdateFilters(newSearchTerm, selectedDivisions);
                                        }}
                                        className="w-full pl-10 sm:w-64"
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <MultiSelectDropdown
                                        options={divisions}
                                        selected={selectedDivisions}
                                        onSelectionChange={(newDivisions) => {
                                            setSelectedDivisions(newDivisions);
                                            updateFilters(searchTerm, newDivisions);
                                        }}
                                        placeholder="Filter by divisions"
                                        getLabel={(division) => divisionLabels[division] || division}
                                    />
                                </div>
                            </div>
                        </div>

                        {(searchTerm || selectedDivisions.length > 0 || selectedStaff.length > 0) && (
                            <div className="mt-4 flex flex-col space-y-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div className="flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                    {selectedDivisions.map((division) => (
                                        <span
                                            key={division}
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                divisionColors[division] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                            }`}
                                        >
                                            {divisionLabels[division] || division}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                    {selectedStaff.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteConfirm(true)} disabled={isLoading}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Selected ({selectedStaff.length})
                                        </Button>
                                    )}
                                    {(searchTerm || selectedDivisions.length > 0) && (
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
                        {staff.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                                <th className="pr-4 pb-3">
                                                    <Checkbox
                                                        checked={selectedStaff.length === deletableStaff.length && deletableStaff.length > 0}
                                                        onCheckedChange={handleSelectAll}
                                                        disabled={deletableStaff.length === 0}
                                                    />
                                                </th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Photo</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Name</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Position</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Division</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Email</th>
                                                <th className="pr-4 pb-3 font-medium text-gray-900 dark:text-gray-100">Phone</th>
                                                <th className="pb-3 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staff.data.map((member) => (
                                                <tr
                                                    key={member.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                                                >
                                                    <td className="py-4 pr-4">
                                                        <Checkbox
                                                            checked={selectedStaff.includes(member.id)}
                                                            onCheckedChange={(checked) => handleSelectStaff(member.id, checked as boolean)}
                                                            disabled={!!member.user}
                                                        />
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                                            {member.photo ? (
                                                                <img
                                                                    src={member.photo_url || member.photo}
                                                                    alt={member.name}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="h-5 w-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                                                            {member.user && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    User: {member.user.role.replace('_', ' ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{member.position}</td>
                                                    <td className="py-4 pr-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                divisionColors[member.division] ||
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            {divisionLabels[member.division] || member.division}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{member.email}</td>
                                                    <td className="py-4 pr-4 text-gray-900 dark:text-gray-100">{member.phone || '-'}</td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setShowStaffDialog(member)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Link href={route('admin.staff.edit', member.id)}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {!member.user && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setStaffToDelete(member)}
                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {staff.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination data={staff} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <User className="h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No staff members found</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {searchTerm || selectedDivisions.length > 0
                                        ? 'Try adjusting your search or filters.'
                                        : 'Get started by adding a new staff member.'}
                                </p>
                                {!searchTerm && selectedDivisions.length === 0 && (
                                    <Link href={route('admin.staff.create')} className="mt-4">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Staff Member
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
                                <DialogTitle>Delete Staff Members</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete <strong>{selectedStaff.length}</strong> staff members? This action cannot be undone.
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
            <Dialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>Delete Staff Member</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    {staffToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete <strong>{staffToDelete.name}</strong> ({staffToDelete.email})? This action cannot be
                                undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button variant="ghost" onClick={() => setStaffToDelete(null)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDeleteStaff} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Staff Details Dialog */}
            <Dialog open={!!showStaffDialog} onOpenChange={() => setShowStaffDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Staff Details: {showStaffDialog?.name}</DialogTitle>
                    </DialogHeader>
                    {showStaffDialog && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                    {showStaffDialog.photo ? (
                                        <img
                                            src={showStaffDialog.photo_url || showStaffDialog.photo}
                                            alt={showStaffDialog.name}
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-10 w-10 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{showStaffDialog.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{showStaffDialog.position}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">{showStaffDialog.division}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{showStaffDialog.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{showStaffDialog.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            {showStaffDialog.bio && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Biography</label>
                                    <div
                                        className="prose dark:prose-invert mt-1 max-w-none text-sm text-gray-900 dark:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: showStaffDialog.bio }}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(showStaffDialog.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
