// Single Responsibility: Handle all contact-related API operations
import { useToast } from '@/hooks/use-toast';
import type { Contact, ContactFormData, ContactServiceOperations } from '@/types/contact';
import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Custom hook for contact service operations
 * Follows SRP by handling only contact-related API operations
 * Follows DIP by abstracting away direct router dependencies
 */
export function useContactService(): ContactServiceOperations {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const { toast } = useToast();

    const createContact = (data: ContactFormData, onSuccess?: () => void) => {
        setProcessing(true);
        setError(undefined);

        router.post(route('admin.contacts.store'), data, {
            onSuccess: () => {
                setProcessing(false);
                toast({
                    title: 'Success',
                    description: 'Contact created successfully',
                    variant: 'success',
                });
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                setProcessing(false);
                setError(errors?.message || 'Failed to create contact');
                toast({
                    title: 'Error',
                    description: errors?.message || 'Failed to create contact',
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const updateContact = (contactId: number, data: ContactFormData, onSuccess?: () => void) => {
        setProcessing(true);
        setError(undefined);

        router.put(route('admin.contacts.update', contactId), data, {
            onSuccess: () => {
                setProcessing(false);
                toast({
                    title: 'Success',
                    description: 'Contact updated successfully',
                    variant: 'success',
                });
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                setProcessing(false);
                setError(errors?.message || 'Failed to update contact');
                toast({
                    title: 'Error',
                    description: errors?.message || 'Failed to update contact',
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const deleteContact = (contact: Contact, onSuccess?: () => void) => {
        setProcessing(true);
        setError(undefined);

        router.delete(route('admin.contacts.destroy', contact.id), {
            onSuccess: () => {
                setProcessing(false);
                toast({
                    title: 'Success',
                    description: 'Contact deleted successfully',
                    variant: 'success',
                });
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                setProcessing(false);
                setError(errors?.message || 'Failed to delete contact');
                toast({
                    title: 'Error',
                    description: errors?.message || 'Failed to delete contact',
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return {
        createContact,
        updateContact,
        deleteContact,
        processing,
        error,
    };
}
