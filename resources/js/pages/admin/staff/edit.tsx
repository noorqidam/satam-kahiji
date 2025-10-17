import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';


import { StaffSubjectAssignments } from '@/components/admin/staff/StaffSubjectAssignments';
import AvatarDropzone from '@/components/ui/avatar-dropzone';
import { useStaffEdit } from '@/hooks/useStaffEdit';

import InputError from '@/components/input-error';
import PositionHistoryManager from '@/components/position-history-manager';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type PaginationData } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { Staff } from '@/types/staff';

interface EditStaffProps {
    staff: Staff;
    availableSubjects?: PaginationData & {
        data: {
            id: number;
            name: string;
            code: string | null;
        }[];
    };
    filters?: {
        subjects_search?: string;
    };
}

export default function EditStaff({ staff, availableSubjects, filters = {} }: EditStaffProps) {
    const { t } = useTranslation();
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('staff_management.edit.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('staff_management.edit.breadcrumbs.staff_management'), href: '/admin/staff' },
        { title: `${t('staff_management.edit.breadcrumbs.edit_staff')} ${staff.name}`, href: `/admin/staff/${staff.id}/edit` },
    ];

    const {
        form,
        selectedSubjects,
        isAssigningSubjects,
        subjectsSearch,
        hasUserAccount,
        handlePhotoSelect,
        handleSubmit,
        handleSubjectSelection,
        assignSubjects,
        removeSubject,
        handleSubjectsSearchChange,
    } = useStaffEdit({ staff, filters });

    // Generate current photo URL similar to student form
    const currentPhotoUrl = staff.photo ? (staff.photo.startsWith('http') ? staff.photo : `/storage/profile-photos/${staff.photo}`) : undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('staff_management.edit.page_title')} ${staff.name}`} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.staff.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('staff_management.edit.page_title')}</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">{t('staff_management.edit.page_description', { name: staff.name })}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('staff_management.edit.sections.basic_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* User Account and Profile Photo Section */}
                            {staff.user ? (
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    <div className="lg:w-1/2">
                                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100">{t('staff_management.edit.sections.associated_user_account')}</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                {t('staff_management.edit.messages.user_account_details', { 
                                                    name: staff.user.name, 
                                                    email: staff.user.email, 
                                                    role: staff.user.role.replace('_', ' ') 
                                                })}
                                            </p>
                                            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                {t('staff_management.edit.messages.user_account_info')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Profile Photo Section */}
                                    <div className="flex flex-col items-center lg:w-1/2">
                                        <div className="mb-4 text-center">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('staff_management.edit.sections.profile_photo')}</h3>
                                        </div>
                                        <AvatarDropzone
                                            onFileSelect={handlePhotoSelect}
                                            currentImageUrl={currentPhotoUrl}
                                            size="xl"
                                            maxSize={10 * 1024 * 1024}
                                        />
                                        <InputError message={form.errors.photo} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Full Name and Profile Photo Section - Aligned */}
                                    <div className="flex flex-col gap-6 lg:flex-row">
                                        <div className="lg:w-2/3">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">{t('staff_management.edit.fields.full_name')} *</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={form.data.name}
                                                    onChange={(e) => form.setData('name', e.target.value)}
                                                    required
                                                    placeholder={t('staff_management.edit.placeholders.enter_full_name')}
                                                    disabled={hasUserAccount}
                                                />
                                                <InputError message={form.errors.name} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center lg:w-1/3">
                                            <div className="mb-4 text-center">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('staff_management.edit.sections.profile_photo')}</h3>
                                            </div>
                                            <AvatarDropzone
                                                onFileSelect={handlePhotoSelect}
                                                currentImageUrl={currentPhotoUrl}
                                                size="xl"
                                                maxSize={10 * 1024 * 1024}
                                            />
                                            <InputError message={form.errors.photo} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Form Fields - Only show if no user account exists */}
                            {!staff.user && (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="position">{t('staff_management.edit.fields.position')} *</Label>
                                            <Input
                                                id="position"
                                                type="text"
                                                value={form.data.position}
                                                onChange={(e) => form.setData('position', e.target.value)}
                                                required
                                                placeholder={t('staff_management.edit.placeholders.position_example')}
                                                disabled={hasUserAccount}
                                            />
                                            <InputError message={form.errors.position} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="division">{t('staff_management.edit.fields.division')} *</Label>
                                            <Select
                                                value={form.data.division}
                                                onValueChange={(value) => form.setData('division', value)}
                                                required
                                                disabled={hasUserAccount}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('staff_management.edit.placeholders.select_division')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Hubungan Masyarakat">Hubungan Masyarakat</SelectItem>
                                                    <SelectItem value="Tata Usaha">Tata Usaha</SelectItem>
                                                    <SelectItem value="Pramubhakti">Pramubhakti</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={form.errors.division} />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('staff_management.edit.fields.email_address')} *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(e) => form.setData('email', e.target.value)}
                                                required
                                                placeholder={t('staff_management.edit.placeholders.email_example')}
                                                disabled={hasUserAccount}
                                            />
                                            <InputError message={form.errors.email} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">{t('staff_management.edit.fields.phone_number')}</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={form.data.phone}
                                                onChange={(e) => form.setData('phone', e.target.value)}
                                                placeholder={t('staff_management.edit.placeholders.phone_example')}
                                            />
                                            <InputError message={form.errors.phone} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('staff_management.edit.fields.phone_number')}</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    placeholder={t('staff_management.edit.placeholders.phone_example')}
                                />
                                <InputError message={form.errors.phone} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">{t('staff_management.edit.fields.biography')}</Label>
                                <RichTextEditor
                                    value={form.data.bio}
                                    onChange={(content) => form.setData('bio', content)}
                                    placeholder={t('staff_management.edit.placeholders.biography_placeholder')}
                                    height={250}
                                />
                                <InputError message={form.errors.bio} />
                            </div>
                            <div className="flex items-center justify-end gap-4 border-t pt-6">
                                <Link href={route('admin.staff.index')}>
                                    <Button type="button" variant="ghost">
                                        {t('staff_management.edit.actions.cancel')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('staff_management.edit.actions.update_staff_member')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Position History Management */}
                    <PositionHistoryManager staff={staff} />

                    <StaffSubjectAssignments
                        staff={staff}
                        availableSubjects={availableSubjects}
                        selectedSubjects={selectedSubjects}
                        isAssigningSubjects={isAssigningSubjects}
                        subjectsSearch={subjectsSearch}
                        onSubjectSelection={handleSubjectSelection}
                        onAssignSubjects={assignSubjects}
                        onRemoveSubject={removeSubject}
                        onSubjectsSearchChange={handleSubjectsSearchChange}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
