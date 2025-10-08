import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/constants/roles';
import type { useUserOperations } from '@/hooks/useUserOperations';
import { LoaderCircle, Trash2 } from 'lucide-react';

interface UserDialogsProps {
    operations: ReturnType<typeof useUserOperations>;
    roleLabels: Record<UserRole, string>;
    roleColors: Record<UserRole, string>;
    availableRoles: UserRole[];
    selectedUsers: number[];
    onBulkDelete: (userIds: number[]) => Promise<void>;
    onClearSelection: () => void;
}

export function UserDialogs({ operations, roleLabels, roleColors, availableRoles, selectedUsers, onBulkDelete, onClearSelection }: UserDialogsProps) {
    const {
        isLoading,
        showCreateDialog,
        showBulkDeleteConfirm,
        userToDelete,
        showUserDialog,
        editUserDialog,
        createForm,
        editForm,
        handleCreateUser,
        handleUpdateUser,
        handleDeleteUser,
        setShowCreateDialog,
        setShowBulkDeleteConfirm,
        setUserToDelete,
        setShowUserDialog,
        setEditUserDialog,
    } = operations;

    return (
        <>
            {/* Create User Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">Full Name</Label>
                                <Input
                                    id="create-name"
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    disabled={createForm.processing}
                                />
                                <InputError message={createForm.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-email">Email Address</Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    required
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    disabled={createForm.processing}
                                />
                                <InputError message={createForm.errors.email} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={createForm.data.role}
                                onValueChange={(value: UserRole) => createForm.setData('role', value)}
                                disabled={createForm.processing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {roleLabels[role]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.role} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-password">Password</Label>
                                <Input
                                    id="create-password"
                                    type="password"
                                    required
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    disabled={createForm.processing}
                                />
                                <InputError message={createForm.errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-password-confirmation">Confirm Password</Label>
                                <Input
                                    id="create-password-confirmation"
                                    type="password"
                                    required
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                    disabled={createForm.processing}
                                />
                                <InputError message={createForm.errors.password_confirmation} />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowCreateDialog(false)} disabled={createForm.processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Create User
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={!!editUserDialog} onOpenChange={() => setEditUserDialog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit User: {editUserDialog?.name}</DialogTitle>
                    </DialogHeader>
                    {editUserDialog && (
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        type="text"
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        disabled={editForm.processing}
                                        onFocus={(e) => {
                                            // Clear selection on focus to prevent text appearing "blocked"
                                            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                                        }}
                                    />
                                    <InputError message={editForm.errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email Address</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        disabled={editForm.processing}
                                        onFocus={(e) => {
                                            // Clear selection on focus to prevent text appearing "blocked"
                                            e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                                        }}
                                    />
                                    <InputError message={editForm.errors.email} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                    value={editForm.data.role}
                                    onValueChange={(value: UserRole) => editForm.setData('role', value)}
                                    disabled={editForm.processing}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {roleLabels[role]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.role} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-password">New Password (optional)</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        disabled={editForm.processing}
                                    />
                                    <InputError message={editForm.errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-password-confirmation">Confirm New Password</Label>
                                    <Input
                                        id="edit-password-confirmation"
                                        type="password"
                                        value={editForm.data.password_confirmation}
                                        onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                        disabled={editForm.processing}
                                    />
                                    <InputError message={editForm.errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditUserDialog(null)} disabled={editForm.processing}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Update User
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* View User Dialog */}
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

            {/* Delete User Dialog */}
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
                                <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Dialog */}
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
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    try {
                                        await onBulkDelete(selectedUsers);
                                        onClearSelection();
                                    } catch {
                                        // Error handling is done in the hook
                                    }
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
