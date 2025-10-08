// Single Responsibility: Define all contact-related types and interfaces

/**
 * Core contact entity interface
 */
export interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Form data interface for creating/updating contacts
 */
export interface ContactFormData {
    name: string;
    email: string;
    message: string;
    phone: string;
    address: string;
    [key: string]: string | number | boolean | File | null | undefined | any;
}

/**
 * Contact card display props interface
 */
export interface ContactCardProps {
    contact: Contact;
    onDelete?: (contact: Contact) => void;
    onEdit?: (contact: Contact) => void;
    showActions?: boolean;
}

/**
 * Contact service hook interface for API operations
 */
export interface ContactServiceOperations {
    createContact: (data: ContactFormData, onSuccess?: () => void) => void;
    updateContact: (contactId: number, data: ContactFormData, onSuccess?: () => void) => void;
    deleteContact: (contact: Contact, onSuccess?: () => void) => void;
    processing: boolean;
    error?: string;
}

/**
 * Contact validation hook interface
 */
export interface ContactValidationHook {
    validateForm: (data: ContactFormData) => boolean;
    validationErrors: Record<string, string>;
    clearValidationErrors: () => void;
    getValidationSchema: () => any;
}
