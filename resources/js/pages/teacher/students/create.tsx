import { Head, Link, router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { FormEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import RichTextEditor from '@/components/rich-text-editor';
import AvatarDropzone from '@/components/ui/avatar-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    position: string;
}

interface TeacherStudentCreateProps {
    teacher: Teacher;
    userRole: string;
    assignedClass?: string;
    extracurriculars: Array<{
        id: number;
        name: string;
        description?: string;
    }>;
    recordOptions?: {
        certificate_templates: Array<{ id: number; name: string; template_type: string }>;
    };
}

interface FormData {
    nisn: string;
    name: string;
    gender: string;
    birth_date: string;
    birthplace: string;
    religion: string;
    class: string;
    entry_year: string;
    graduation_year: string;
    status: string;
    photo: File | null;
    notes: string;
    // Enhanced personal information
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    // Transportation information
    transportation_method: string;
    distance_from_home_km: string;
    travel_time_minutes: string;
    pickup_location: string;
    transportation_notes: string;
    // Health information
    allergies: string;
    medical_conditions: string;
    dietary_restrictions: string;
    blood_type: string;
    emergency_medical_info: string;
    extracurricular_ids: number[];
}

interface FormErrors {
    [key: string]: string;
}

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
    { title: t('student_form.breadcrumbs.teacher_dashboard'), href: '/teacher/dashboard' },
    { title: t('student_form.breadcrumbs.my_students'), href: '/teacher/students' },
    { title: t('student_form.breadcrumbs.add_student'), href: '/teacher/students/create' },
];

export default function TeacherStudentCreate({ assignedClass, extracurriculars }: TeacherStudentCreateProps) {
    const { t } = useTranslation(['common', 'student_form']);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        nisn: '',
        name: '',
        gender: '',
        birth_date: '',
        birthplace: '',
        religion: '',
        class: assignedClass || '',
        entry_year: new Date().getFullYear().toString(),
        graduation_year: '',
        status: 'active',
        photo: null,
        notes: '',
        // Enhanced personal information
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        // Transportation information
        transportation_method: '',
        distance_from_home_km: '',
        travel_time_minutes: '',
        pickup_location: '',
        transportation_notes: '',
        // Health information
        allergies: '',
        medical_conditions: '',
        dietary_restrictions: '',
        blood_type: '',
        emergency_medical_info: '',
        extracurricular_ids: [],
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const handleInputChange = useCallback((field: keyof FormData, value: string | number[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        setErrors((prev) => {
            if (prev[field]) {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
            return prev;
        });
    }, []);

    const handleExtracurricularChange = useCallback(
        (selectedIds: string[]) => {
            const numericIds = selectedIds.map((id) => parseInt(id, 10));
            handleInputChange('extracurricular_ids', numericIds);
        },
        [handleInputChange],
    );

    const handlePhotoChange = (file: File | null) => {
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    title: t('student_form.errors.file_too_large'),
                    description: t('student_form.errors.file_size_limit'),
                    variant: 'destructive',
                });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: t('student_form.errors.invalid_file_type'),
                    description: t('student_form.errors.image_only'),
                    variant: 'destructive',
                });
                return;
            }
        }

        setFormData((prev) => ({ ...prev, photo: file }));

        // Clear photo field error when a new file is selected
        if (file && errors.photo) {
            setErrors((prev) => ({ ...prev, photo: '' }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create FormData for file upload
        const submitData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'photo' && value instanceof File) {
                submitData.append(key, value);
            } else if (key === 'extracurricular_ids' && Array.isArray(value)) {
                value.forEach((id) => submitData.append('extracurricular_ids[]', id.toString()));
            } else if (value !== null && value !== '') {
                submitData.append(key, value.toString());
            }
        });

        router.post(route('teacher.students.store'), submitData, {
            forceFormData: true,
            onSuccess: () => {
                toast({
                    title: t('common.success'),
                    description: t('student_form.messages.create_success'),
                    variant: 'success',
                });
            },
            onError: (errors) => {
                setErrors(errors);
                toast({
                    title: t('common.error'),
                    description: t('student_form.errors.form_errors'),
                    variant: 'destructive',
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Generate graduation year options (current year + 1 to current year + 6)
    const currentYear = new Date().getFullYear();
    const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(t)}>
            <Head title={t('student_form.title.create')} />

            <div className="space-y-6 px-4 pb-3 sm:space-y-8 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 dark:border-gray-700">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{t('student_form.title.create')}</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('student_form.subtitle.create_new')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student_form.sections.student_photo')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <AvatarDropzone
                                onFileSelect={handlePhotoChange}
                                size="xl"
                                maxSize={2 * 1024 * 1024} // 2MB
                                accept={{
                                    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                                }}
                            />
                            {errors.photo && <p className="mt-2 text-center text-xs text-red-600">{errors.photo}</p>}
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student_form.sections.basic_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="nisn">{t('student_form.fields.nisn')} *</Label>
                                    <Input
                                        id="nisn"
                                        value={formData.nisn}
                                        onChange={(e) => handleInputChange('nisn', e.target.value)}
                                        placeholder={t('student_form.placeholders.nisn')}
                                        required
                                    />
                                    {errors.nisn && <p className="mt-1 text-xs text-red-600">{errors.nisn}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="name">{t('student_form.fields.full_name')} *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={t('student_form.placeholders.full_name')}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="birth_date">{t('student_form.fields.birth_date')} *</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                                        required
                                    />
                                    {errors.birth_date && <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="birthplace">{t('student_form.fields.birth_place')}</Label>
                                    <Input
                                        id="birthplace"
                                        value={formData.birthplace}
                                        onChange={(e) => handleInputChange('birthplace', e.target.value)}
                                        placeholder={t('student_form.placeholders.birth_place')}
                                    />
                                    {errors.birthplace && <p className="mt-1 text-xs text-red-600">{errors.birthplace}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="gender">{t('student_form.fields.gender')} *</Label>
                                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('student_form.placeholders.gender')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">{t('student_form.options.gender.male')}</SelectItem>
                                            <SelectItem value="female">{t('student_form.options.gender.female')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="religion">{t('student_form.fields.religion')}</Label>
                                    <Input
                                        id="religion"
                                        value={formData.religion}
                                        onChange={(e) => handleInputChange('religion', e.target.value)}
                                        placeholder={t('student_form.placeholders.religion')}
                                    />
                                    {errors.religion && <p className="mt-1 text-xs text-red-600">{errors.religion}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student_form.sections.contact_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="parent_name">{t('student_form.fields.parent_name')}</Label>
                                    <Input
                                        id="parent_name"
                                        value={formData.parent_name}
                                        onChange={(e) => handleInputChange('parent_name', e.target.value)}
                                        placeholder={t('student_form.placeholders.parent_name')}
                                    />
                                    {errors.parent_name && <p className="mt-1 text-xs text-red-600">{errors.parent_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="parent_phone">{t('student_form.fields.parent_phone')}</Label>
                                    <Input
                                        id="parent_phone"
                                        value={formData.parent_phone}
                                        onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                                        placeholder={t('student_form.placeholders.parent_phone')}
                                    />
                                    {errors.parent_phone && <p className="mt-1 text-xs text-red-600">{errors.parent_phone}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="parent_email">{t('student_form.fields.parent_email')}</Label>
                                    <Input
                                        id="parent_email"
                                        type="email"
                                        value={formData.parent_email}
                                        onChange={(e) => handleInputChange('parent_email', e.target.value)}
                                        placeholder={t('student_form.placeholders.parent_email')}
                                    />
                                    {errors.parent_email && <p className="mt-1 text-xs text-red-600">{errors.parent_email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact_name">{t('student_form.fields.emergency_contact_name')}</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                                        placeholder={t('student_form.placeholders.emergency_contact_name')}
                                    />
                                    {errors.emergency_contact_name && <p className="mt-1 text-xs text-red-600">{errors.emergency_contact_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="emergency_contact_phone">{t('student_form.fields.emergency_contact_phone')}</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        value={formData.emergency_contact_phone}
                                        onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                                        placeholder={t('student_form.placeholders.emergency_contact_phone')}
                                    />
                                    {errors.emergency_contact_phone && <p className="mt-1 text-xs text-red-600">{errors.emergency_contact_phone}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">{t('student_form.fields.address')}</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder={t('student_form.placeholders.address')}
                                />
                                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transportation Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student_form.sections.transportation_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="transportation_method">{t('student_form.fields.transportation_method')}</Label>
                                    <Select
                                        value={formData.transportation_method}
                                        onValueChange={(value) => handleInputChange('transportation_method', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('student_form.placeholders.transportation_method')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="walking">{t('student_form.options.transportation.walking')}</SelectItem>
                                            <SelectItem value="bicycle">{t('student_form.options.transportation.bicycle')}</SelectItem>
                                            <SelectItem value="motorcycle">{t('student_form.options.transportation.motorcycle')}</SelectItem>
                                            <SelectItem value="car">{t('student_form.options.transportation.car')}</SelectItem>
                                            <SelectItem value="school_bus">{t('student_form.options.transportation.school_bus')}</SelectItem>
                                            <SelectItem value="public_transport">
                                                {t('student_form.options.transportation.public_transport')}
                                            </SelectItem>
                                            <SelectItem value="other">{t('student_form.options.transportation.other')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.transportation_method && <p className="mt-1 text-xs text-red-600">{errors.transportation_method}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="distance_from_home_km">{t('student_form.fields.distance_from_home')}</Label>
                                    <Input
                                        id="distance_from_home_km"
                                        type="number"
                                        step="0.1"
                                        value={formData.distance_from_home_km}
                                        onChange={(e) => handleInputChange('distance_from_home_km', e.target.value)}
                                        placeholder={t('student_form.placeholders.distance_from_home')}
                                    />
                                    {errors.distance_from_home_km && <p className="mt-1 text-xs text-red-600">{errors.distance_from_home_km}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="travel_time_minutes">{t('student_form.fields.travel_time')}</Label>
                                    <Input
                                        id="travel_time_minutes"
                                        type="number"
                                        value={formData.travel_time_minutes}
                                        onChange={(e) => handleInputChange('travel_time_minutes', e.target.value)}
                                        placeholder={t('student_form.placeholders.travel_time')}
                                    />
                                    {errors.travel_time_minutes && <p className="mt-1 text-xs text-red-600">{errors.travel_time_minutes}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="pickup_location">{t('student_form.fields.pickup_location')}</Label>
                                    <Input
                                        id="pickup_location"
                                        value={formData.pickup_location}
                                        onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                                        placeholder={t('student_form.placeholders.pickup_location')}
                                    />
                                    {errors.pickup_location && <p className="mt-1 text-xs text-red-600">{errors.pickup_location}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="transportation_notes">{t('student_form.fields.transportation_notes')}</Label>
                                <Input
                                    id="transportation_notes"
                                    value={formData.transportation_notes}
                                    onChange={(e) => handleInputChange('transportation_notes', e.target.value)}
                                    placeholder={t('student_form.placeholders.transportation_notes')}
                                />
                                {errors.transportation_notes && <p className="mt-1 text-xs text-red-600">{errors.transportation_notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student_form.sections.health_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="blood_type">{t('student_form.fields.blood_type')}</Label>
                                    <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('student_form.placeholders.blood_type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.blood_type && <p className="mt-1 text-xs text-red-600">{errors.blood_type}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="allergies">{t('student_form.fields.allergies')}</Label>
                                    <Input
                                        id="allergies"
                                        value={formData.allergies}
                                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                                        placeholder={t('student_form.placeholders.allergies')}
                                    />
                                    {errors.allergies && <p className="mt-1 text-xs text-red-600">{errors.allergies}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="medical_conditions">{t('student_form.fields.medical_conditions')}</Label>
                                    <Input
                                        id="medical_conditions"
                                        value={formData.medical_conditions}
                                        onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                                        placeholder={t('student_form.placeholders.medical_conditions')}
                                    />
                                    {errors.medical_conditions && <p className="mt-1 text-xs text-red-600">{errors.medical_conditions}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="dietary_restrictions">{t('student_form.fields.dietary_restrictions')}</Label>
                                    <Input
                                        id="dietary_restrictions"
                                        value={formData.dietary_restrictions}
                                        onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                                        placeholder={t('student_form.placeholders.dietary_restrictions')}
                                    />
                                    {errors.dietary_restrictions && <p className="mt-1 text-xs text-red-600">{errors.dietary_restrictions}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="emergency_medical_info">{t('student_form.fields.emergency_medical_info')}</Label>
                                <Input
                                    id="emergency_medical_info"
                                    value={formData.emergency_medical_info}
                                    onChange={(e) => handleInputChange('emergency_medical_info', e.target.value)}
                                    placeholder={t('student_form.placeholders.emergency_medical_info')}
                                />
                                {errors.emergency_medical_info && <p className="mt-1 text-xs text-red-600">{errors.emergency_medical_info}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student_form.sections.academic_information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="class">{t('student_form.fields.class')} *</Label>
                                    <div className="space-y-2">
                                        <Input
                                            id="class"
                                            value={formData.class}
                                            readOnly
                                            className="cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                            placeholder={t('student_form.placeholders.class_assignment')}
                                            title={t('student_form.help.class_assignment')}
                                        />
                                        {assignedClass ? (
                                            <p className="text-xs text-blue-600">
                                                🏫 {t('student_form.messages.homeroom_assignment', { class: assignedClass })}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-amber-600">⚠️ {t('student_form.messages.no_homeroom_class')}</p>
                                        )}
                                        <p className="text-xs text-gray-500">{t('student_form.messages.class_management_info')}</p>
                                    </div>
                                    {errors.class && <p className="mt-1 text-xs text-red-600">{errors.class}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">{t('student_form.fields.status')} *</Label>
                                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('student_form.placeholders.status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">{t('student_form.options.status.active')}</SelectItem>
                                            <SelectItem value="graduated">{t('student_form.options.status.graduated')}</SelectItem>
                                            <SelectItem value="transferred">{t('student_form.options.status.transferred')}</SelectItem>
                                            <SelectItem value="dropped">{t('student_form.options.status.dropped')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="entry_year">{t('student_form.fields.entry_year')} *</Label>
                                    <Input
                                        id="entry_year"
                                        type="number"
                                        value={formData.entry_year}
                                        onChange={(e) => handleInputChange('entry_year', e.target.value)}
                                        min="2000"
                                        max={currentYear + 1}
                                        required
                                    />
                                    {errors.entry_year && <p className="mt-1 text-xs text-red-600">{errors.entry_year}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="graduation_year">{t('student_form.fields.graduation_year')}</Label>
                                    <Select value={formData.graduation_year} onValueChange={(value) => handleInputChange('graduation_year', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('student_form.placeholders.graduation_year')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {graduationYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.graduation_year && <p className="mt-1 text-xs text-red-600">{errors.graduation_year}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="extracurricular_ids">{t('student_form.fields.extracurricular_activities')}</Label>
                                <MultiSelectDropdown
                                    options={extracurriculars.map((ec) => ec.id.toString())}
                                    selected={formData.extracurricular_ids.map((id) => id.toString())}
                                    onSelectionChange={handleExtracurricularChange}
                                    placeholder={t('student_form.placeholders.extracurricular_activities')}
                                    getLabel={(id) => {
                                        const extracurricular = extracurriculars.find((ec) => ec.id.toString() === id);
                                        return extracurricular ? extracurricular.name : id;
                                    }}
                                />
                                <p className="text-xs text-gray-500">{t('student_form.help.extracurricular_activities')}</p>
                                {errors.extracurricular_ids && <p className="mt-1 text-xs text-red-600">{errors.extracurricular_ids}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">{t('student_form.fields.notes')}</Label>
                                <RichTextEditor
                                    value={formData.notes}
                                    onChange={(content) => handleInputChange('notes', content)}
                                    placeholder={t('student_form.placeholders.notes')}
                                    height={200}
                                />
                                {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href={route('teacher.students.index')}>
                            <Button type="button" variant="outline">
                                {t('common.cancel')}
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>{t('student_form.actions.saving')}</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('student_form.actions.create_student')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Student Records Management - Not available during student creation */}
            </div>
        </AppLayout>
    );
}
