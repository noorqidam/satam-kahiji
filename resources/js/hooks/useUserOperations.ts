import { ROLES } from '@/constants/roles';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services/userService';
import type { CreateUserForm, EditUserForm, User } from '@/types/user';
import { useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';

export function useUserOperations() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showUserDialog, setShowUserDialog] = useState<User | null>(null);
    const [editUserDialog, setEditUserDialog] = useState<User | null>(null);

    // Forms
    const createForm = useForm<CreateUserForm>({
        name: '',
        email: '',
        role: ROLES.TEACHER, // Default role
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm<EditUserForm>({
        name: '',
        email: '',
        role: ROLES.TEACHER, // Default role
        password: '',
        password_confirmation: '',
    });

    const handleCreateUser = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (createForm.processing) return;

            try {
                setIsLoading(true);
                await UserService.createUser(createForm.data);

                toast({
                    title: 'Success',
                    description: 'User created successfully.',
                    variant: 'success',
                });

                createForm.reset();
                setShowCreateDialog(false);
            } catch {
                toast({
                    title: 'Error',
                    description: 'Failed to create user. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        },
        [createForm, toast],
    );

    const handleEditUser = useCallback(
        (user: User) => {
            editForm.setData({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '',
                password_confirmation: '',
            });
            setEditUserDialog(user);
        },
        [editForm],
    );

    const handleUpdateUser = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!editUserDialog || editForm.processing) return;

            try {
                setIsLoading(true);
                await UserService.updateUser(editUserDialog, editForm.data);

                toast({
                    title: 'Success',
                    description: 'User updated successfully.',
                    variant: 'success',
                });

                setEditUserDialog(null);
            } catch {
                toast({
                    title: 'Error',
                    description: 'Failed to update user. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        },
        [editUserDialog, editForm, toast],
    );

    const handleDeleteUser = useCallback(async () => {
        if (!userToDelete) return;

        try {
            setIsLoading(true);
            await UserService.deleteUser(userToDelete);

            toast({
                title: 'Success',
                description: `${userToDelete.name} has been deleted successfully. All related staff records, position history, and assignments have also been removed.`,
                variant: 'success',
            });

            setUserToDelete(null);
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete user and related records. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [userToDelete, toast]);

    const handleBulkDelete = useCallback(
        async (userIds: number[]) => {
            try {
                setIsLoading(true);
                await UserService.bulkDeleteUsers(userIds);

                toast({
                    title: 'Success',
                    description: `${userIds.length} users have been deleted successfully. All related staff records, position history, and assignments have also been removed.`,
                    variant: 'success',
                });

                setShowBulkDeleteConfirm(false);
            } catch {
                toast({
                    title: 'Error',
                    description: 'Failed to delete users and related records. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        },
        [toast],
    );

    return {
        // States
        isLoading,
        showCreateDialog,
        showBulkDeleteConfirm,
        userToDelete,
        showUserDialog,
        editUserDialog,

        // Forms
        createForm,
        editForm,

        // Handlers
        handleCreateUser,
        handleEditUser,
        handleUpdateUser,
        handleDeleteUser,
        handleBulkDelete,

        // State setters
        setShowCreateDialog,
        setShowBulkDeleteConfirm,
        setUserToDelete,
        setShowUserDialog,
        setEditUserDialog,
    };
}
