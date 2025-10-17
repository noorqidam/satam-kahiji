import RichTextEditor from '@/components/rich-text-editor';
import AvatarDropzone from '@/components/ui/avatar-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type StudentForm } from '@/types/student';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
    title: string;
    description: string;
}

interface AdminStudentFormCardProps {
    data: StudentForm;
    setData: (key: keyof StudentForm, value: StudentForm[keyof StudentForm]) => void;
    submit: FormEventHandler;
    processing: boolean;
    errors: Partial<Record<keyof StudentForm, string>>;
    submitLabel: string;
    isEdit?: boolean;
    currentPhotoUrl?: string;
    staff: Array<{
        id: number;
        name: string;
        position: string;
        homeroom_class?: string;
    }>;
    availableClasses?: Array<{
        id: number;
        name: string;
        grade_level: string;
        class_section: string;
        capacity: number;
        current_students: number;
        available_slots: number;
        is_full: boolean;
        homeroom_teacher?: {
            id: number;
            name: string;
            position: string;
        };
    }>;
    extracurriculars: Array<{
        id: number;
        name: string;
        description?: string;
    }>;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="border-b border-gray-200 pb-5 dark:border-gray-700">
            <h3 className="text-2xl leading-6 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    );
}

export function AdminStudentFormCard({
    data,
    setData,
    submit,
    processing,
    errors,
    submitLabel,
    isEdit = false,
    currentPhotoUrl,
    staff,
    availableClasses = [],
    extracurriculars,
}: AdminStudentFormCardProps) {
    const { t } = useTranslation();

    // Filter staff to get only homeroom teachers (assuming they have homeroom_class property)
    const homeroomTeachers = useMemo(() => {
        return staff.filter((s) => s.position.toLowerCase().includes('teacher') || s.position.toLowerCase().includes('guru'));
    }, [staff]);

    const handlePhotoChange = useCallback(
        (files: File[]) => {
            if (files.length > 0) {
                const file = files[0];
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    // You might want to show an error toast here
                    return;
                }
                setData('photo', file);
            }
        },
        [setData],
    );

    const handleExtracurricularChange = useCallback(
        (selectedIds: string[]) => {
            const numericIds = selectedIds.map((id) => parseInt(id, 10));
            setData('extracurricular_ids', numericIds);
        },
        [setData],
    );

    // Generate graduation years (current year + 1 to current year + 6 for junior high)
    const currentYear = new Date().getFullYear();
    const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Photo Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.photo')}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <AvatarDropzone
                        onFileSelect={(file) => file && handlePhotoChange([file])}
                        size="xl"
                        maxSize={2 * 1024 * 1024} // 2MB
                        accept={{
                            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                        }}
                        currentImageUrl={currentPhotoUrl}
                    />
                    {errors.photo && <p className="mt-2 text-center text-xs text-red-600">{errors.photo}</p>}
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.basic_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="nisn">{t('student_creation.fields.nisn')} *</Label>
                            <Input
                                id="nisn"
                                value={data.nisn}
                                onChange={(e) => setData('nisn', e.target.value)}
                                placeholder={t('student_creation.placeholders.nisn')}
                                required
                            />
                            {errors.nisn && <p className="mt-1 text-xs text-red-600">{errors.nisn}</p>}
                        </div>

                        <div>
                            <Label htmlFor="name">{t('student_creation.fields.name')} *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('student_creation.placeholders.name')}
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="gender">{t('student_creation.fields.gender')} *</Label>
                            <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.gender')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">{t('student_creation.options.gender.male')}</SelectItem>
                                    <SelectItem value="female">{t('student_creation.options.gender.female')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                        </div>

                        <div>
                            <Label htmlFor="birth_date">{t('student_creation.fields.birth_date')} *</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                required
                            />
                            {errors.birth_date && <p className="mt-1 text-xs text-red-600">{errors.birth_date}</p>}
                        </div>

                        <div>
                            <Label htmlFor="birthplace">{t('student_creation.fields.birthplace')}</Label>
                            <Input
                                id="birthplace"
                                value={data.birthplace}
                                onChange={(e) => setData('birthplace', e.target.value)}
                                placeholder={t('student_creation.placeholders.birthplace')}
                            />
                            {errors.birthplace && <p className="mt-1 text-xs text-red-600">{errors.birthplace}</p>}
                        </div>

                        <div>
                            <Label htmlFor="religion">{t('student_creation.fields.religion')}</Label>
                            <Input
                                id="religion"
                                value={data.religion}
                                onChange={(e) => setData('religion', e.target.value)}
                                placeholder={t('student_creation.placeholders.religion')}
                            />
                            {errors.religion && <p className="mt-1 text-xs text-red-600">{errors.religion}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Administrative Controls - ADMIN SPECIFIC */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.admin_controls')}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('student_creation.descriptions.admin_controls')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="class">{t('student_creation.fields.class')} *</Label>
                            <Select value={data.class} onValueChange={(value) => setData('class', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.select_class')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableClasses.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.name} disabled={cls.is_full}>
                                            <div className="flex w-full items-center justify-between">
                                                <span>
                                                    {cls.name} ({cls.grade_level}
                                                    {cls.class_section})
                                                </span>
                                                <span className={`ml-2 text-xs ${cls.is_full ? 'text-red-500' : 'text-green-600'}`}>
                                                    {cls.available_slots > 0
                                                        ? `${cls.available_slots} ${t('student_creation.labels.slots_available')}`
                                                        : t('student_creation.labels.class_full')}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.class && <p className="mt-1 text-xs text-red-600">{errors.class}</p>}
                        </div>

                        <div>
                            <Label htmlFor="homeroom_teacher_id">{t('student_creation.fields.homeroom_teacher')} *</Label>
                            <Select value={data.homeroom_teacher_id} onValueChange={(value) => setData('homeroom_teacher_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.select_teacher')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {homeroomTeachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            <div className="flex w-full items-center justify-between">
                                                <span>{teacher.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {teacher.homeroom_class
                                                        ? `${t('student_creation.labels.current_class')}: ${teacher.homeroom_class}`
                                                        : t('student_creation.labels.available')}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.homeroom_teacher_id && <p className="mt-1 text-xs text-red-600">{errors.homeroom_teacher_id}</p>}
                        </div>

                        <div>
                            <Label htmlFor="status">{t('student_creation.fields.status')} *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t('student_creation.options.status.active')}</SelectItem>
                                    <SelectItem value="graduated">{t('student_creation.options.status.graduated')}</SelectItem>
                                    <SelectItem value="transferred">{t('student_creation.options.status.transferred')}</SelectItem>
                                    <SelectItem value="dropped">{t('student_creation.options.status.dropped')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <Label htmlFor="entry_year">{t('student_creation.fields.entry_year')} *</Label>
                            <Input
                                id="entry_year"
                                type="number"
                                value={data.entry_year}
                                onChange={(e) => setData('entry_year', e.target.value)}
                                min="2000"
                                max={currentYear + 1}
                                required
                            />
                            {errors.entry_year && <p className="mt-1 text-xs text-red-600">{errors.entry_year}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.contact_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="parent_name">{t('student_creation.fields.parent_name')}</Label>
                            <Input
                                id="parent_name"
                                value={data.parent_name}
                                onChange={(e) => setData('parent_name', e.target.value)}
                                placeholder={t('student_creation.placeholders.parent_name')}
                            />
                            {errors.parent_name && <p className="mt-1 text-xs text-red-600">{errors.parent_name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="parent_phone">{t('student_creation.fields.parent_phone')}</Label>
                            <Input
                                id="parent_phone"
                                value={data.parent_phone}
                                onChange={(e) => setData('parent_phone', e.target.value)}
                                placeholder={t('student_creation.placeholders.parent_phone')}
                            />
                            {errors.parent_phone && <p className="mt-1 text-xs text-red-600">{errors.parent_phone}</p>}
                        </div>

                        <div>
                            <Label htmlFor="parent_email">{t('student_creation.fields.parent_email')}</Label>
                            <Input
                                id="parent_email"
                                type="email"
                                value={data.parent_email}
                                onChange={(e) => setData('parent_email', e.target.value)}
                                placeholder={t('student_creation.placeholders.parent_email')}
                            />
                            {errors.parent_email && <p className="mt-1 text-xs text-red-600">{errors.parent_email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="emergency_contact_name">{t('student_creation.fields.emergency_contact_name')}</Label>
                            <Input
                                id="emergency_contact_name"
                                value={data.emergency_contact_name}
                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                placeholder={t('student_creation.placeholders.emergency_contact_name')}
                            />
                            {errors.emergency_contact_name && <p className="mt-1 text-xs text-red-600">{errors.emergency_contact_name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="emergency_contact_phone">{t('student_creation.fields.emergency_contact_phone')}</Label>
                            <Input
                                id="emergency_contact_phone"
                                value={data.emergency_contact_phone}
                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                placeholder={t('student_creation.placeholders.emergency_contact_phone')}
                            />
                            {errors.emergency_contact_phone && <p className="mt-1 text-xs text-red-600">{errors.emergency_contact_phone}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="address">{t('student_creation.fields.address')}</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder={t('student_creation.placeholders.address')}
                        />
                        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Transportation Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.transportation_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="transportation_method">{t('student_creation.fields.transportation_method')}</Label>
                            <Select value={data.transportation_method} onValueChange={(value) => setData('transportation_method', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.transportation_method')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="walking">{t('student_creation.options.transportation.walking')}</SelectItem>
                                    <SelectItem value="bicycle">{t('student_creation.options.transportation.bicycle')}</SelectItem>
                                    <SelectItem value="motorcycle">{t('student_creation.options.transportation.motorcycle')}</SelectItem>
                                    <SelectItem value="car">{t('student_creation.options.transportation.car')}</SelectItem>
                                    <SelectItem value="school_bus">{t('student_creation.options.transportation.school_bus')}</SelectItem>
                                    <SelectItem value="public_transport">{t('student_creation.options.transportation.public_transport')}</SelectItem>
                                    <SelectItem value="other">{t('student_creation.options.transportation.other')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.transportation_method && <p className="mt-1 text-xs text-red-600">{errors.transportation_method}</p>}
                        </div>

                        <div>
                            <Label htmlFor="distance_from_home_km">{t('student_creation.fields.distance_from_home')}</Label>
                            <Input
                                id="distance_from_home_km"
                                type="number"
                                step="0.1"
                                value={data.distance_from_home_km}
                                onChange={(e) => setData('distance_from_home_km', e.target.value)}
                                placeholder={t('student_creation.placeholders.distance_from_home')}
                            />
                            {errors.distance_from_home_km && <p className="mt-1 text-xs text-red-600">{errors.distance_from_home_km}</p>}
                        </div>

                        <div>
                            <Label htmlFor="travel_time_minutes">{t('student_creation.fields.travel_time')}</Label>
                            <Input
                                id="travel_time_minutes"
                                type="number"
                                value={data.travel_time_minutes}
                                onChange={(e) => setData('travel_time_minutes', e.target.value)}
                                placeholder={t('student_creation.placeholders.travel_time')}
                            />
                            {errors.travel_time_minutes && <p className="mt-1 text-xs text-red-600">{errors.travel_time_minutes}</p>}
                        </div>

                        <div>
                            <Label htmlFor="pickup_location">{t('student_creation.fields.pickup_location')}</Label>
                            <Input
                                id="pickup_location"
                                value={data.pickup_location}
                                onChange={(e) => setData('pickup_location', e.target.value)}
                                placeholder={t('student_creation.placeholders.pickup_location')}
                            />
                            {errors.pickup_location && <p className="mt-1 text-xs text-red-600">{errors.pickup_location}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="transportation_notes">{t('student_creation.fields.transportation_notes')}</Label>
                        <Input
                            id="transportation_notes"
                            value={data.transportation_notes}
                            onChange={(e) => setData('transportation_notes', e.target.value)}
                            placeholder={t('student_creation.placeholders.transportation_notes')}
                        />
                        {errors.transportation_notes && <p className="mt-1 text-xs text-red-600">{errors.transportation_notes}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Health Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.health_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="blood_type">{t('student_creation.fields.blood_type')}</Label>
                            <Select value={data.blood_type} onValueChange={(value) => setData('blood_type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.blood_type')} />
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
                            <Label htmlFor="allergies">{t('student_creation.fields.allergies')}</Label>
                            <Input
                                id="allergies"
                                value={data.allergies}
                                onChange={(e) => setData('allergies', e.target.value)}
                                placeholder={t('student_creation.placeholders.allergies')}
                            />
                            {errors.allergies && <p className="mt-1 text-xs text-red-600">{errors.allergies}</p>}
                        </div>

                        <div>
                            <Label htmlFor="medical_conditions">{t('student_creation.fields.medical_conditions')}</Label>
                            <Input
                                id="medical_conditions"
                                value={data.medical_conditions}
                                onChange={(e) => setData('medical_conditions', e.target.value)}
                                placeholder={t('student_creation.placeholders.medical_conditions')}
                            />
                            {errors.medical_conditions && <p className="mt-1 text-xs text-red-600">{errors.medical_conditions}</p>}
                        </div>

                        <div>
                            <Label htmlFor="dietary_restrictions">{t('student_creation.fields.dietary_restrictions')}</Label>
                            <Input
                                id="dietary_restrictions"
                                value={data.dietary_restrictions}
                                onChange={(e) => setData('dietary_restrictions', e.target.value)}
                                placeholder={t('student_creation.placeholders.dietary_restrictions')}
                            />
                            {errors.dietary_restrictions && <p className="mt-1 text-xs text-red-600">{errors.dietary_restrictions}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="emergency_medical_info">{t('student_creation.fields.emergency_medical_info')}</Label>
                        <Input
                            id="emergency_medical_info"
                            value={data.emergency_medical_info}
                            onChange={(e) => setData('emergency_medical_info', e.target.value)}
                            placeholder={t('student_creation.placeholders.emergency_medical_info')}
                        />
                        {errors.emergency_medical_info && <p className="mt-1 text-xs text-red-600">{errors.emergency_medical_info}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('student_creation.sections.academic_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="class">{t('student_creation.fields.class')} *</Label>
                            <Select value={data.class} onValueChange={(value) => setData('class', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.select_class')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableClasses.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.name} disabled={cls.is_full && data.class !== cls.name}>
                                            <div className="flex w-full items-center justify-between">
                                                <span>{cls.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {cls.current_students}/{cls.capacity}
                                                    {cls.is_full && data.class !== cls.name && ' (Full)'}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.class && <p className="mt-1 text-xs text-red-600">{errors.class}</p>}
                        </div>

                        <div>
                            <Label htmlFor="status">{t('student_creation.fields.status')} *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t('student_creation.options.status.active')}</SelectItem>
                                    <SelectItem value="graduated">{t('student_creation.options.status.graduated')}</SelectItem>
                                    <SelectItem value="transferred">{t('student_creation.options.status.transferred')}</SelectItem>
                                    <SelectItem value="dropped">{t('student_creation.options.status.dropped')}</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <Label htmlFor="entry_year">{t('student_creation.fields.entry_year')} *</Label>
                            <Input
                                id="entry_year"
                                type="number"
                                value={data.entry_year}
                                onChange={(e) => setData('entry_year', e.target.value)}
                                min="2000"
                                max={currentYear + 1}
                                placeholder="Enter entry year"
                                required
                            />
                            {errors.entry_year && <p className="mt-1 text-xs text-red-600">{errors.entry_year}</p>}
                        </div>

                        <div>
                            <Label htmlFor="graduation_year">{t('student_creation.fields.graduation_year')}</Label>
                            <Select value={data.graduation_year} onValueChange={(value) => setData('graduation_year', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('student_creation.placeholders.graduation_year')} />
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
                        <Label htmlFor="extracurricular_ids">{t('student_creation.fields.extracurriculars')}</Label>
                        <MultiSelectDropdown
                            options={extracurriculars.map((ec) => ec.id.toString())}
                            selected={data.extracurricular_ids?.map((id) => id.toString()) || []}
                            onSelectionChange={handleExtracurricularChange}
                            placeholder={t('student_creation.placeholders.extracurriculars')}
                            getLabel={(id) => {
                                const extracurricular = extracurriculars.find((ec) => ec.id.toString() === id);
                                return extracurricular ? extracurricular.name : id;
                            }}
                        />
                        <p className="text-xs text-gray-500">{t('student_creation.help.extracurriculars')}</p>
                        {errors.extracurricular_ids && <p className="mt-1 text-xs text-red-600">{errors.extracurricular_ids}</p>}
                    </div>

                    <div>
                        <Label htmlFor="notes">{t('student_creation.fields.notes')}</Label>
                        <RichTextEditor
                            value={data.notes}
                            onChange={(content) => setData('notes', content)}
                            placeholder={t('student_creation.placeholders.notes')}
                            height={200}
                        />
                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="min-w-[150px]">
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {isEdit ? t('student_edit.actions.updating') : t('student_creation.actions.creating')}
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </form>
    );
}
