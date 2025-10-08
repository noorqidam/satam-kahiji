import { useToast } from '@/hooks/use-toast';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Eye, LoaderCircle, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Pagination, type PaginationData } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

type EditUserForm = {
    name: string;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
};

type CreateUserForm = {
    name: string;
    email: string;
    role: string;
    password: string;
    password_confirmation: string;
};

interface UsersIndexProps {
    users: PaginationData & {
        data: User[];
    };
    filters?: {
        search: string;
        roles: string[];
    };
}

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    headmaster: 'Kepala Sekolah',
    deputy_headmaster: 'Wakil Kepala Sekolah',
    teacher: 'Guru',
};

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    headmaster: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    deputy_headmaster: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    teacher: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function UsersIndex({ users, filters = { search: '', roles: [] } }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedRoles, setSelectedRoles] = useState<string[]>(filters?.roles || []);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showUserDialog, setShowUserDialog] = useState<User | null>(null);
    const [editUserDialog, setEditUserDialog] = useState<User | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { toast } = useToast();

    // Edit user form
    const editForm = useForm<EditUserForm>({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });

    // Create user form
    const createForm = useForm<CreateUserForm>({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });

    const availableRoles = Object.keys(roleLabels);

    const updateFilters = (search: string, roles: string[]) => {
        console.log('updateFilters called with:', { search, roles });

        const params: Record<string, string> = {};

        if (search.trim()) {
            params.search = search.trim();
            console.log('Adding search param:', search.trim());
        }

        if (roles.length > 0) {
            params.roles = roles.join(',');
            console.log('Adding roles param:', roles.join(','));
        }

        console.log('Final params being sent:', params);
        setIsLoading(true);
        router.get('/admin/users', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setIsLoading(false),
            onError: (errors) => {
                console.error('Filter request failed:', errors);
                setIsLoading(false);
            },
        });
    };

    const debouncedUpdateFilters = (search: string, roles: string[]) => {
        console.log('debouncedUpdateFilters called with:', { search, roles });

        if (debounceTimer) {
            clearTimeout(debounceTimer);
            console.log('Cleared previous timer');
        }

        const newTimer = setTimeout(() => {
            console.log('Timer fired, calling updateFilters with:', { search, roles });
            updateFilters(search, roles);
        }, 300);

        console.log('Set new timer');
        setDebounceTimer(newTimer);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRoles([]);
        setIsLoading(true);
        router.get(
            '/admin/users',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleSelectUser = (userId: number) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.data.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.data.map((user) => user.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) return;
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = () => {
        setIsLoading(true);
        router.delete('/admin/users/bulk', {
            data: { user_ids: selectedUsers },
            onSuccess: () => {
                setSelectedUsers([]);
                setShowBulkDeleteConfirm(false);
                toast({
                    title: 'Success',
                    description: `Successfully deleted ${selectedUsers.length} user(s).`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete users. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDeleteUser = () => {
        if (!userToDelete) return;

        setIsLoading(true);
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => {
                setUserToDelete(null);
                toast({
                    title: 'Success',
                    description: `Successfully deleted user ${userToDelete.name}.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete user. Please try again.',
                    variant: 'destructive',
                });
            },
            onFinish: () => setIsLoading(false),
        });
    };

    const handleEditUser = (user: User) => {
        setEditUserDialog(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
    };

    const submitEditUser: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editUserDialog) return;

        editForm.put(`/admin/users/${editUserDialog.id}`, {
            onSuccess: () => {
                setEditUserDialog(null);
                editForm.reset();
                toast({
                    title: 'Success',
                    description: `User ${editForm.data.name} has been updated successfully.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to update user. Please check the form and try again.',
                    variant: 'destructive',
                });
            },
        });
    };

    const submitCreateUser: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post('/admin/users', {
            onSuccess: () => {
                setShowCreateDialog(false);
                createForm.reset();
                toast({
                    title: 'Success',
                    description: `User ${createForm.data.name} has been created successfully.`,
                    variant: 'success',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to create user. Please check the form and try again.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">User Management</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Manage system users and their roles</p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Add New User</span>
                        <span className="sm:hidden">Add User</span>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <CardTitle>All Users ({users.total})</CardTitle>
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name or email"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const newSearchTerm = e.target.value;
                                            setSearchTerm(newSearchTerm);
                                            debouncedUpdateFilters(newSearchTerm, selectedRoles);
                                        }}
                                        className="w-full pl-10 sm:w-64"
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <MultiSelectDropdown
                                        options={availableRoles}
                                        selected={selectedRoles}
                                        onSelectionChange={(newRoles) => {
                                            setSelectedRoles(newRoles);
                                            debouncedUpdateFilters(searchTerm, newRoles);
                                        }}
                                        placeholder="Filter by roles"
                                        getLabel={(role) => roleLabels[role]}
                                    />
                                </div>
                            </div>
                        </div>

                        {(searchTerm || selectedRoles.length > 0 || selectedUsers.length > 0) && (
                            <div className="mt-4 flex flex-col space-y-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div className="flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                    {selectedRoles.map((role) => (
                                        <span
                                            key={role}
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role]}`}
                                        >
                                            {roleLabels[role]}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                    {selectedUsers.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isLoading}>
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            <span className="hidden sm:inline">Delete Selected ({selectedUsers.length})</span>
                                            <span className="sm:hidden">Delete ({selectedUsers.length})</span>
                                        </Button>
                                    )}
                                    {(searchTerm || selectedRoles.length > 0) && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <X className="mr-1 h-3 w-3" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`overflow-x-auto ${isLoading ? 'opacity-50' : ''}`}>
                            <table className="min-w-full table-auto">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-gray-100 bg-gray-50 dark:bg-gray-800">
                                        <th className="w-12 px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                                            <Checkbox
                                                checked={selectedUsers.length === users.data.length && users.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                                className="border-gray-300 data-[state=checked]:bg-gray-500 data-[state=checked]:text-white"
                                            />
                                        </th>
                                        <th className="min-w-[120px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                                            Name
                                        </th>
                                        <th className="hidden min-w-[150px] px-2 py-3 text-left font-medium text-gray-400 sm:table-cell sm:px-4 dark:text-gray-400">
                                            Email
                                        </th>
                                        <th className="min-w-[100px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                                            Role
                                        </th>
                                        <th className="hidden min-w-[100px] px-2 py-3 text-left font-medium text-gray-400 sm:px-4 md:table-cell dark:text-gray-400">
                                            Created
                                        </th>
                                        <th className="min-w-[120px] px-2 py-3 text-right font-medium text-gray-400 sm:px-4 dark:text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className={`border-b border-gray-100 dark:border-gray-800 ${
                                                index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                                            }`}
                                        >
                                            <td className="px-2 py-3 sm:px-4">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={() => handleSelectUser(user.id)}
                                                />
                                            </td>
                                            <td className="px-2 py-3 font-medium text-gray-900 sm:px-4 dark:text-gray-100">
                                                <div>
                                                    <div>{user.name}</div>
                                                    <div className="text-sm text-gray-500 sm:hidden dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="hidden px-2 py-3 text-gray-600 sm:table-cell sm:px-4 dark:text-gray-400">{user.email}</td>
                                            <td className="px-2 py-3 sm:px-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role]}`}
                                                >
                                                    {roleLabels[user.role]}
                                                </span>
                                            </td>
                                            <td className="hidden px-2 py-3 text-gray-600 sm:px-4 md:table-cell dark:text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-2 py-3 sm:px-4">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button variant="ghost" size="sm" onClick={() => setShowUserDialog(user)} disabled={isLoading}>
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} disabled={isLoading}>
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.data.length === 0 && (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm || selectedRoles.length > 0 ? 'No users match the current filters.' : 'No users found.'}
                                </p>
                            </div>
                        )}

                        {users.data.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <Pagination data={users} />
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
                                <DialogTitle>Delete Users</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete <strong>{selectedUsers.length}</strong> selected user
                            {selectedUsers.length !== 1 ? 's' : ''}? This action cannot be undone.
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

            {/* Individual Delete Confirmation Dialog */}
            <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <DialogTitle>Delete User</DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    {userToDelete && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be
                                undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button variant="ghost" onClick={() => setUserToDelete(null)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={confirmDeleteUser} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Show User Dialog */}
            <Dialog open={!!showUserDialog} onOpenChange={() => setShowUserDialog(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                    </DialogHeader>
                    {showUserDialog && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{showUserDialog.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{showUserDialog.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                                <div className="mt-1">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[showUserDialog.role]}`}
                                    >
                                        {roleLabels[showUserDialog.role]}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{new Date(showUserDialog.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={!!editUserDialog} onOpenChange={() => setEditUserDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit User: {editUserDialog?.name}</DialogTitle>
                    </DialogHeader>
                    {editUserDialog && (
                        <form onSubmit={submitEditUser} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        type="text"
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        disabled={editForm.processing}
                                        placeholder="Enter full name"
                                    />
                                    <InputError message={editForm.errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email Address</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        disabled={editForm.processing}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={editForm.errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                        value={editForm.data.role}
                                        onValueChange={(value) => editForm.setData('role', value)}
                                        disabled={editForm.processing}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select user role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                            <SelectItem value="headmaster">Kepala Sekolah</SelectItem>
                                            <SelectItem value="deputy_headmaster">Wakil Kepala Sekolah</SelectItem>
                                            <SelectItem value="teacher">Guru</SelectItem>
                                            <SelectItem value="humas">Humas</SelectItem>
                                            <SelectItem value="tu">Tata Usaha</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={editForm.errors.role} />
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="mb-3 text-lg font-medium">Change Password (Optional)</h3>
                                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                        Leave password fields empty to keep the current password.
                                    </p>

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-password">New Password</Label>
                                            <Input
                                                id="edit-password"
                                                type="password"
                                                value={editForm.data.password}
                                                onChange={(e) => editForm.setData('password', e.target.value)}
                                                disabled={editForm.processing}
                                                placeholder="Leave empty to keep current password"
                                            />
                                            <InputError message={editForm.errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-password-confirmation">Confirm New Password</Label>
                                            <Input
                                                id="edit-password-confirmation"
                                                type="password"
                                                value={editForm.data.password_confirmation}
                                                onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                                disabled={editForm.processing}
                                                placeholder="Confirm new password"
                                            />
                                            <InputError message={editForm.errors.password_confirmation} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditUserDialog(null)} disabled={editForm.processing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing}>
                                        {editForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Update User
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreateUser} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Full Name</Label>
                                <Input
                                    id="create-name"
                                    type="text"
                                    required
                                    autoFocus
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    disabled={createForm.processing}
                                    placeholder="Enter full name"
                                />
                                <InputError message={createForm.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-email">Email Address</Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    required
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    disabled={createForm.processing}
                                    placeholder="email@example.com"
                                />
                                <InputError message={createForm.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="create-role">Role</Label>
                                <Select
                                    value={createForm.data.role}
                                    onValueChange={(value) => createForm.setData('role', value)}
                                    disabled={createForm.processing}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="headmaster">Kepala Sekolah</SelectItem>
                                        <SelectItem value="deputy_headmaster">Wakil Kepala Sekolah</SelectItem>
                                        <SelectItem value="teacher">Guru</SelectItem>
                                        <SelectItem value="humas">Humas</SelectItem>
                                        <SelectItem value="tu">Tata Usaha</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.role} />
                            </div>

                            {/* Password Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="create-password">Password</Label>
                                <Input
                                    id="create-password"
                                    type="password"
                                    required
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    disabled={createForm.processing}
                                    placeholder="Enter password"
                                />
                                <InputError message={createForm.errors.password} />
                            </div>

                            {/* Password Confirmation Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="create-password-confirmation">Confirm Password</Label>
                                <Input
                                    id="create-password-confirmation"
                                    type="password"
                                    required
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                    disabled={createForm.processing}
                                    placeholder="Confirm password"
                                />
                                <InputError message={createForm.errors.password_confirmation} />
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <h3 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">Email Verification</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    A verification email will be sent to the user's email address. They must verify their email before accessing the
                                    system.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} disabled={createForm.processing}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create User
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
