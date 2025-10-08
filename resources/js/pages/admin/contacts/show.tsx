// Single Responsibility: Display detailed contact information
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteDialog } from '@/components/ui/DeleteDialog';
import { Label } from '@/components/ui/label';
import { useContactService } from '@/hooks/useContactService';
import AppLayout from '@/layouts/app-layout';
import type { Contact } from '@/types/contact';
import { formatContactDate, generateContactBreadcrumbs } from '@/utils/contact';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, Contact as ContactIcon, Edit, Mail, MapPin, MessageCircle, Phone, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ContactShow({ contact }: { contact: Contact }) {
    const [mounted, setMounted] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Use service hook following DIP
    const contactService = useContactService();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use utility function following SRP
    const breadcrumbs = generateContactBreadcrumbs('show', contact);

    const handleDelete = () => {
        contactService.deleteContact(contact, () => {
            setIsDeleteDialogOpen(false);
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${contact.name} - Contact Details`} />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                {/* Enhanced Hero Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 shadow-2xl">
                    {/* Background Pattern */}
                    <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:20px_20px]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-600/50 to-teal-800/50" />

                    {/* Floating Orbs */}
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-6">
                                <div className="group relative">
                                    <div className="absolute -inset-1 rounded-xl bg-white/20 opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-sm">
                                        <ContactIcon
                                            className={`h-10 w-10 text-white transition-all duration-300 ${mounted ? 'scale-100 rotate-0' : 'scale-50 rotate-45'}`}
                                        />
                                    </div>
                                </div>
                                <div className="text-white">
                                    <h1 className="mb-2 text-3xl font-bold lg:text-4xl">{contact.name}</h1>
                                    <p className="text-lg text-emerald-100">Contact details and message information</p>
                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Created {new Date(contact.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span>Email Available</span>
                                        </div>
                                        {contact.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>Phone Available</span>
                                            </div>
                                        )}
                                        {contact.updated_at !== contact.created_at && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>Updated {new Date(contact.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link href={route('admin.contacts.edit', contact.id)}>
                                    <Button
                                        size="lg"
                                        className="bg-white text-emerald-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90"
                                    >
                                        <Edit className="mr-2 h-5 w-5" />
                                        Edit Contact
                                    </Button>
                                </Link>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={contactService.processing}
                                    className="border-red-300/50 bg-red-500/10 text-red-100 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-red-500/20 disabled:hover:scale-100"
                                >
                                    {contactService.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                                            <span>Deleting...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Trash2 className="mr-2 h-5 w-5" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Single Card Layout */}
                <Card className="group relative overflow-hidden border shadow-md transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Contact Information Section */}
                            <div className="space-y-8 lg:col-span-2">
                                {/* Basic Info */}
                                <div>
                                    <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        <User className="h-6 w-6 text-emerald-600" />
                                        Contact Information
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                Full Name
                                            </Label>
                                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{contact.name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                Email Address
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                                <a
                                                    href={`mailto:${contact.email}`}
                                                    className="font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    {contact.email}
                                                </a>
                                            </div>
                                        </div>

                                        {contact.phone && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                    Phone Number
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-green-600" />
                                                    <a
                                                        href={`tel:${contact.phone}`}
                                                        className="font-medium text-green-700 transition-colors hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                    >
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {contact.address && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                    Address
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-purple-600" />
                                                    <p className="font-medium text-purple-700 dark:text-purple-400">{contact.address}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                Date Created
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                <p className="font-medium text-gray-700 dark:text-gray-300">
                                                    {formatContactDate(contact.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {contact.updated_at !== contact.created_at && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                                    Last Updated
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-600" />
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                                        {formatContactDate(contact.updated_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message Section */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                                    <MessageCircle className="h-5 w-5 text-purple-600" />
                                    Message
                                </h3>
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                    <div className="max-h-80 overflow-y-auto">
                                        <p className="leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{contact.message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog - Using reusable component */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Contact"
                description={`Are you sure you want to delete the contact from ${contact.name}? This action cannot be undone and will permanently remove the contact and their message.`}
                onConfirm={handleDelete}
                isLoading={contactService.processing}
                confirmButtonText="Delete Contact"
            />
        </AppLayout>
    );
}
