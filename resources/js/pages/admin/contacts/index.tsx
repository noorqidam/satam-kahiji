// Single Responsibility: Display and manage contact information listing
import { ContactCard } from '@/components/contact/ContactCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteDialog } from '@/components/ui/DeleteDialog';
import { useContactService } from '@/hooks/useContactService';
import AppLayout from '@/layouts/app-layout';
import type { Contact } from '@/types/contact';
import { generateContactBreadcrumbs } from '@/utils/contact';
import { Head, Link } from '@inertiajs/react';
import { Building2, Contact as ContactIcon, Edit, Mail, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    contact: Contact | null;
}

export default function ContactsIndex({ contact }: Props) {
    const [mounted, setMounted] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    // Use service hook following DIP
    const contactService = useContactService();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use utility function following SRP
    const breadcrumbs = generateContactBreadcrumbs('index');

    // Handle delete action following SRP
    const openDeleteDialog = (contactToDelete: Contact) => {
        setContactToDelete(contactToDelete);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!contactToDelete) return;

        contactService.deleteContact(contactToDelete, () => {
            setContactToDelete(null);
            setIsDeleteDialogOpen(false);
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Contact Information" />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                {/* Enhanced Hero Header - Responsive */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-4 shadow-2xl sm:rounded-2xl sm:p-6 lg:p-8">
                    {/* Background Pattern */}
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-600/50 to-teal-800/50" />

                    {/* Floating Orbs - Hidden on mobile for performance */}
                    <div className="absolute -top-24 -right-24 hidden h-48 w-48 rounded-full bg-white/10 blur-3xl sm:block" />
                    <div className="absolute -bottom-24 -left-24 hidden h-48 w-48 rounded-full bg-white/5 blur-3xl sm:block" />

                    <div className="relative">
                        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3 sm:items-center sm:gap-6">
                                <div className="group relative flex-shrink-0">
                                    <div className="absolute -inset-1 rounded-xl bg-white/20 opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm sm:h-20 sm:w-20">
                                        <Building2
                                            className={`h-6 w-6 text-white transition-all duration-300 sm:h-10 sm:w-10 ${mounted ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}
                                        />
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h1 className="mb-1 text-lg font-bold sm:mb-2 sm:text-3xl lg:text-4xl">
                                        <span className="block sm:hidden">School Contact</span>
                                        <span className="hidden sm:block">School Contact Information</span>
                                    </h1>
                                    <div className="text-xs text-emerald-100 sm:hidden">
                                        <p className="mb-1">Manage school contact details for the landing page</p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                                                {contact ? 'Active' : 'Not Set'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-base text-emerald-100 lg:text-lg">Manage school contact details for the landing page</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-emerald-200">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                                                <span>Status: {contact ? 'Active' : 'Not Configured'}</span>
                                            </div>
                                            {contact && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>Contact Available</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                {contact ? (
                                    <Link href={route('admin.contacts.edit', contact.id)}>
                                        <Button
                                            size="sm"
                                            className="sm:size-lg w-full bg-white text-emerald-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 sm:w-auto"
                                        >
                                            <Edit className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            Edit Contact
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={route('admin.contacts.create')}>
                                        <Button
                                            size="sm"
                                            className="sm:size-lg w-full bg-white text-emerald-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 sm:w-auto"
                                        >
                                            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                            Set Up Contact
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Live Status Indicator - Responsive */}
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 lg:mt-8">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 animate-pulse rounded-full ${contact ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                <span className="text-sm font-medium text-white/90">{contact ? 'Contact Configured' : 'Setup Required'}</span>
                            </div>
                            <div className="hidden h-6 w-px bg-white/20 sm:block" />
                            <div className="text-xs text-white/80 sm:text-sm">
                                {contact ? `Last updated: ${new Date(contact.updated_at).toLocaleDateString()}` : 'No contact information set'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Display */}
                <div className="space-y-6">
                    {!contact ? (
                        <Card className="group hover:shadow-3xl relative overflow-hidden border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/80 to-white shadow-xl transition-all duration-500 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="relative mb-6">
                                    <div className="absolute -inset-4 rounded-full bg-emerald-200/50 opacity-20 blur-xl dark:bg-emerald-800/50" />
                                    <div className="relative rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 p-6 dark:from-emerald-900/50 dark:to-teal-900/50">
                                        <ContactIcon className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">No Contact Information</h3>
                                <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
                                    Set up your school's contact information to display on the landing page and enable visitors to reach out.
                                </p>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link href={route('admin.contacts.create')}>
                                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700">
                                            <Plus className="mr-2 h-5 w-5" />
                                            Set Up Contact Information
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Contact Information Card */}
                            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                                {/* Main Contact Info */}
                                <div className="xl:col-span-2">
                                    <ContactCard contact={contact} onDelete={openDeleteDialog} />
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    {/* Status Card */}
                                    <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-lg dark:bg-gray-800/90">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                Contact Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(contact.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(contact.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog - Using reusable component */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Contact Information"
                description="Are you sure you want to delete the school contact information? This will remove the contact details from the landing page and cannot be undone."
                onConfirm={handleDelete}
                isLoading={contactService.processing}
                confirmButtonText="Delete Contact"
            />
        </AppLayout>
    );
}
