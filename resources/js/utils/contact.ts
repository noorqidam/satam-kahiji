// Single Responsibility: Contact-related utility functions
import type { BreadcrumbItem } from '@/types';
import type { Contact } from '@/types/contact';

/**
 * Generate breadcrumbs for contact pages
 * Follows SRP by handling only breadcrumb generation for contact pages
 * Follows OCP by accepting page type parameter for extensibility
 */
export function generateContactBreadcrumbs(page: 'index' | 'show' | 'create' | 'edit', contact?: Contact): BreadcrumbItem[] {
    const baseBreadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'School Contact Information', href: route('admin.contacts.index') },
    ];

    switch (page) {
        case 'index':
            return baseBreadcrumbs;

        case 'create':
            return [...baseBreadcrumbs, { title: 'Create Contact', href: route('admin.contacts.create') }];

        case 'show':
            if (!contact) {
                throw new Error('Contact is required for show breadcrumbs');
            }
            return [...baseBreadcrumbs, { title: contact.name, href: route('admin.contacts.show', contact.id) }];

        case 'edit':
            if (!contact) {
                throw new Error('Contact is required for edit breadcrumbs');
            }
            return [
                ...baseBreadcrumbs,
                { title: contact.name, href: route('admin.contacts.show', contact.id) },
                { title: 'Edit', href: route('admin.contacts.edit', contact.id) },
            ];

        default:
            return baseBreadcrumbs;
    }
}

/**
 * Format contact display name with fallback
 * Follows SRP by handling only name formatting logic
 */
export function formatContactName(contact: Contact): string {
    return contact.name || 'Unnamed Contact';
}

/**
 * Format contact creation/update dates for display
 * Follows SRP by handling only date formatting logic
 */
export function formatContactDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
