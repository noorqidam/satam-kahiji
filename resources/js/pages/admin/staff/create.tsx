import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Staff Management', href: '/admin/staff' },
    { title: 'Create Staff', href: '/admin/staff/create' },
];

export default function CreateStaff() {
    const { form, handleSubmit } = useStaffCreate();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Staff Member" />

            <div className="space-y-6 px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.staff.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">Create Staff Member</h1>
                        <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">Add a new staff member to the system</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-6 lg:flex-row">
                                <div className="lg:w-2/3">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            required
                                            placeholder="Enter full name"
                                        />
                                        <InputError message={form.errors.name} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center lg:w-1/3">
                                    <div className="mb-4 text-center">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile Photo</h3>
                                    </div>
                                    <AvatarDropzone onFileSelect={(file) => form.setData('photo', file)} size="xl" maxSize={10 * 1024 * 1024} />
                                    <InputError message={form.errors.photo} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position *</Label>
                                <Input
                                    id="position"
                                    type="text"
                                    value={form.data.position}
                                    onChange={(e) => form.setData('position', e.target.value)}
                                    required
                                    placeholder="e.g., Mathematics Teacher"
                                />
                                <InputError message={form.errors.position} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        required
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={form.errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="+62 123 4567 8900"
                                    />
                                    <InputError message={form.errors.phone} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division">Division *</Label>
                                <Select value={form.data.division} onValueChange={(value) => form.setData('division', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Division" />
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
                                <Label htmlFor="bio">Biography</Label>
                                <RichTextEditor
                                    value={form.data.bio}
                                    onChange={(content) => form.setData('bio', content)}
                                    placeholder="Enter staff member's biography, achievements, background..."
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
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Staff Member
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
