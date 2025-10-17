import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';


import InputError from '@/components/input-error';
import RichTextEditor from '@/components/rich-text-editor';
import AvatarDropzone from '@/components/ui/avatar-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STAFF_DIVISIONS } from '@/constants/divisions';
import { useStaffCreate } from '@/hooks/useStaffCreate';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

export default function CreateStaff() {
    const { t } = useTranslation();
    const { form, handleSubmit } = useStaffCreate();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('staff_management.create.breadcrumbs.admin_dashboard'), href: '/admin/dashboard' },
        { title: t('staff_management.create.breadcrumbs.staff_management'), href: '/admin/staff' },
        { title: t('staff_management.create.breadcrumbs.create_staff'), href: '/admin/staff/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('staff_management.create.page_title')} />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.staff.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('staff_management.create.page_title')}</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">{t('staff_management.create.page_description')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('staff_management.create.sections.basic_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-6 lg:flex-row">
                                <div className="lg:w-2/3">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('staff_management.create.fields.full_name')} *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            required
                                            placeholder={t('staff_management.create.placeholders.enter_full_name')}
                                        />
                                        <InputError message={form.errors.name} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center lg:w-1/3">
                                    <div className="mb-4 text-center">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('staff_management.create.fields.profile_photo')}</h3>
                                    </div>
                                    <AvatarDropzone onFileSelect={(file) => form.setData('photo', file)} size="xl" maxSize={10 * 1024 * 1024} />
                                    <InputError message={form.errors.photo} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">{t('staff_management.create.fields.position')} *</Label>
                                <Input
                                    id="position"
                                    type="text"
                                    value={form.data.position}
                                    onChange={(e) => form.setData('position', e.target.value)}
                                    required
                                    placeholder={t('staff_management.create.placeholders.position_example')}
                                />
                                <InputError message={form.errors.position} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('staff_management.create.fields.email_address')} *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                        placeholder={t('staff_management.create.placeholders.email_example')}
                                    />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('staff_management.create.fields.phone_number')}</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder={t('staff_management.create.placeholders.phone_example')}
                                    />
                                    <InputError message={form.errors.phone} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division">{t('staff_management.create.fields.division')} *</Label>
                                <Select value={form.data.division} onValueChange={(value) => form.setData('division', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('staff_management.create.placeholders.select_division')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STAFF_DIVISIONS).map(([key, value]) => (
                                            <SelectItem key={key} value={value as string}>
                                                {value as string}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.division} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">{t('staff_management.create.fields.biography')}</Label>
                                <RichTextEditor
                                    value={form.data.bio}
                                    onChange={(content) => form.setData('bio', content)}
                                    placeholder={t('staff_management.create.placeholders.biography_placeholder')}
                                    height={250}
                                />
                                <InputError message={form.errors.bio} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 border-t pt-6">
                                <Link href={route('admin.staff.index')}>
                                    <Button type="button" variant="ghost">
                                        {t('staff_management.create.actions.cancel')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('staff_management.create.actions.create_staff_member')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
