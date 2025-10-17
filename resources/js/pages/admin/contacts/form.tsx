// Single Responsibility: Contact form for creating and editing contacts
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContactService } from '@/hooks/useContactService';
import { useContactValidation } from '@/hooks/useContactValidation';
import AppLayout from '@/layouts/app-layout';
import type { Contact, ContactFormData } from '@/types/contact';
import { formatContactDate, generateContactBreadcrumbs } from '@/utils/contact';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Contact as ContactIcon, Eye, Mail, MapPin, MessageCircle, Phone, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ContactForm({ contact }: { contact?: Contact }) {
    const { t } = useTranslation();
    const isEditing = !!contact;
    const [mounted, setMounted] = useState(false);

    // Use service and validation hooks following SRP
    const contactService = useContactService();
    const contactValidation = useContactValidation();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use utility function following SRP
    const breadcrumbs = generateContactBreadcrumbs(isEditing ? 'edit' : 'create', contact, t);

    const { data, setData, errors } = useForm<ContactFormData>({
        name: contact?.name || '',
        email: contact?.email || '',
        message: contact?.message || '',
        phone: contact?.phone || '',
        address: contact?.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Use validation hook following SRP
        if (!contactValidation.validateForm(data)) {
            return;
        }

        // Use service hook following SRP
        if (isEditing) {
            contactService.updateContact(contact!.id, data);
        } else {
            contactService.createContact(data);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `${t('contact_management.form.edit_title')} - ${contact?.name}` : t('contact_management.form.create_title')} />

            <div
                className={`w-full max-w-none space-y-6 px-4 pb-3 transition-all duration-500 sm:px-6 lg:px-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                {/* Simplified Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="hover:shadow-3xl gap-0 rounded-xl py-0 shadow-2xl transition-all duration-300">
                        <CardHeader className="rounded-t-xl bg-emerald-600 px-6 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                                        <ContactIcon className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">
                                            {isEditing ? t('contact_management.form.edit_title') : t('contact_management.form.create_title')}
                                        </CardTitle>
                                        <CardDescription className="text-emerald-100">
                                            {isEditing
                                                ? t('contact_management.form.edit_description')
                                                : t('contact_management.form.create_description')}
                                        </CardDescription>
                                    </div>
                                </div>

                                {isEditing && (
                                    <Link href={route('admin.contacts.show', contact!.id)}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('contact_management.actions.view_details')}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>

                        <div className="space-y-8 p-8">
                            {/* Basic Information Section */}
                            <div className="space-y-6">
                                <div className="border-l-4 border-emerald-500 pl-4">
                                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{t('contact_management.form.sections.contact_info')}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact_management.form.sections.contact_info_description')}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-emerald-600" />
                                            <Label htmlFor="name" className="text-base font-semibold text-gray-900 dark:text-white">
                                                {t('contact_management.form.fields.contact_name')}
                                            </Label>
                                            <span className="text-red-500">*</span>
                                            {data.name && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={t('contact_management.form.fields.placeholders.name')}
                                            className={`h-12 text-base transition-all duration-300 focus:ring-2 ${
                                                errors.name || contactValidation.validationErrors.name
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : data.name
                                                      ? 'border-green-500 focus:ring-green-500'
                                                      : 'border-gray-300 focus:border-transparent focus:ring-emerald-500'
                                            } rounded-lg`}
                                        />
                                        {(errors.name || contactValidation.validationErrors.name) && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">{errors.name || contactValidation.validationErrors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-emerald-600" />
                                            <Label htmlFor="email" className="text-base font-semibold text-gray-900 dark:text-white">
                                                {t('contact_management.form.fields.email_address')}
                                            </Label>
                                            <span className="text-red-500">*</span>
                                            {data.email && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder={t('contact_management.form.fields.placeholders.email')}
                                            className={`h-12 text-base transition-all duration-300 focus:ring-2 ${
                                                errors.email || contactValidation.validationErrors.email
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : data.email
                                                      ? 'border-green-500 focus:ring-green-500'
                                                      : 'border-gray-300 focus:border-transparent focus:ring-emerald-500'
                                            } rounded-lg`}
                                        />
                                        {(errors.email || contactValidation.validationErrors.email) && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">{errors.email || contactValidation.validationErrors.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-emerald-600" />
                                            <Label htmlFor="phone" className="text-base font-semibold text-gray-900 dark:text-white">
                                                {t('contact_management.form.fields.phone_number')}
                                            </Label>
                                            {data.phone && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder={t('contact_management.form.fields.placeholders.phone')}
                                            className={`h-12 text-base transition-all duration-300 focus:ring-2 ${
                                                errors.phone || contactValidation.validationErrors.phone
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : data.phone
                                                      ? 'border-green-500 focus:ring-green-500'
                                                      : 'border-gray-300 focus:border-transparent focus:ring-emerald-500'
                                            } rounded-lg`}
                                        />
                                        {(errors.phone || contactValidation.validationErrors.phone) && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">{errors.phone || contactValidation.validationErrors.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                            <Label htmlFor="address" className="text-base font-semibold text-gray-900 dark:text-white">
                                                {t('contact_management.form.fields.address')}
                                            </Label>
                                            {data.address && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder={t('contact_management.form.fields.placeholders.address')}
                                            className={`h-12 text-base transition-all duration-300 focus:ring-2 ${
                                                errors.address || contactValidation.validationErrors.address
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : data.address
                                                      ? 'border-green-500 focus:ring-green-500'
                                                      : 'border-gray-300 focus:border-transparent focus:ring-emerald-500'
                                            } rounded-lg`}
                                        />
                                        {(errors.address || contactValidation.validationErrors.address) && (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">{errors.address || contactValidation.validationErrors.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                                        <Label htmlFor="message" className="text-base font-semibold text-gray-900 dark:text-white">
                                            {t('contact_management.form.fields.message')}
                                        </Label>
                                        <span className="text-red-500">*</span>
                                        {data.message && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    </div>
                                    <Textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder={t('contact_management.form.fields.placeholders.message')}
                                        rows={6}
                                        className={`text-base transition-all duration-300 focus:ring-2 ${
                                            errors.message || contactValidation.validationErrors.message
                                                ? 'border-red-500 focus:ring-red-500'
                                                : data.message
                                                  ? 'border-green-500 focus:ring-green-500'
                                                  : 'border-gray-300 focus:border-transparent focus:ring-emerald-500'
                                        } resize-none rounded-lg`}
                                    />
                                    {(errors.message || contactValidation.validationErrors.message) && (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm">{errors.message || contactValidation.validationErrors.message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Information for Editing */}
                            {isEditing && (
                                <div className="space-y-6">
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{t('contact_management.form.sections.contact_details')}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact_management.form.sections.contact_details_description')}</p>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
                                                <Label className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t('contact_management.form.fields.created')}</Label>
                                                <p className="mt-1 text-base font-medium text-blue-900 dark:text-blue-100">
                                                    {formatContactDate(contact!.created_at)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/20">
                                                <Label className="text-sm font-semibold text-green-800 dark:text-green-200">{t('contact_management.form.fields.last_updated')}</Label>
                                                <p className="mt-1 text-base font-medium text-green-900 dark:text-green-100">
                                                    {formatContactDate(contact!.updated_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions Section */}
                            <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:justify-between">
                                <Link href={route('admin.contacts.index')}>
                                    <Button
                                        variant="outline"
                                        className="w-full text-base font-semibold transition-all duration-300 hover:scale-105 sm:w-auto"
                                        type="button"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        {t('contact_management.actions.cancel_return')}
                                    </Button>
                                </Link>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:hover:scale-100 sm:w-auto"
                                    disabled={contactService.processing}
                                >
                                    {contactService.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            <span>{t('contact_management.actions.processing')}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            <span>{isEditing ? t('contact_management.actions.update_contact') : t('contact_management.actions.create_contact')}</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
