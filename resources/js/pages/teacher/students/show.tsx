import { Head, Link } from '@inertiajs/react';
import { Activity, Car, Edit, Heart, Phone, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StudentRecordsTabs } from '@/components/teacher/students/comprehensive-student-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Teacher {
    id: number;
    name: string;
    position: string;
}

interface Extracurricular {
    id: number;
    name: string;
    description: string;
}

interface Student {
    id: number;
    nisn: string;
    name: string;
    gender: 'male' | 'female';
    birth_date: string;
    birthplace: string;
    religion: string;
    class: string;
    entry_year: number;
    graduation_year: number | null;
    status: 'active' | 'graduated' | 'transferred' | 'dropped';
    photo: string;
    notes: string | null;
    homeroom_teacher: Teacher;
    // Enhanced personal information
    parent_name: string;
    parent_phone: string;
    parent_email: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    // Transportation information
    transportation_method: string;
    distance_from_home_km: number;
    travel_time_minutes: number;
    pickup_location: string;
    transportation_notes: string;
    // Health information
    allergies: string;
    medical_conditions: string;
    dietary_restrictions: string;
    blood_type: string;
    emergency_medical_info: string;
    // Student records
    positive_notes?: Array<{
        id: number;
        note: string;
        category?: string;
        date: string;
        staff_name: string;
        created_at: string;
    }>;
    disciplinary_records?: Array<{
        id: number;
        incident_type: string;
        incident_description: string;
        action_taken?: string;
        severity: 'minor' | 'moderate' | 'serious';
        incident_date: string;
        staff_name: string;
        created_at: string;
    }>;
    extracurricular_history?: Array<{
        id: number;
        extracurricular_name: string;
        academic_year: string;
        role?: string;
        start_date: string;
        end_date?: string;
        performance_notes?: string;
    }>;
    documents?: Array<{
        id: number;
        title: string;
        file_name: string;
        category_name: string;
        status: 'pending' | 'approved' | 'rejected';
        uploaded_at: string;
        file_path: string;
        file_size?: number;
        mime_type: string;
    }>;
    achievement_certificates?: Array<{
        id: number;
        certificate_number: string;
        template_name: string;
        achievement_description: string;
        issue_date: string;
        issued_by: string;
        file_url?: string;
    }>;
    achievements?: Array<{
        id: number;
        achievement_type: string;
        achievement_name: string;
        description?: string;
        date_achieved: string;
        level: string;
        score_value?: number;
        issuing_organization?: string;
        created_at: string;
    }>;
}

interface AcademicData {
    extracurriculars: Extracurricular[];
}

interface TeacherStudentShowProps {
    student: Student;
    academicData: AcademicData;
    teacher: Teacher;
    userRole: string;
    extracurriculars: Array<{
        id: number;
        name: string;
        description?: string;
    }>;
    recordOptions?: {
        certificate_templates: Array<{ id: number; name: string; template_type: string }>;
        achievement_types?: Record<string, string>;
        achievement_levels?: Record<string, string>;
    };
}

export default function TeacherStudentShow({ student, academicData, recordOptions }: TeacherStudentShowProps) {
    const { t } = useTranslation('common');
    const [imageError, setImageError] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('student_show.breadcrumbs.teacher_dashboard'), href: '/teacher/dashboard' },
        { title: t('student_show.breadcrumbs.my_students'), href: '/teacher/students' },
        { title: student.name, href: '#' },
    ];

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const shouldShowDefaultAvatar = (photo: string | null) => {
        if (!photo || photo.trim() === '') {
            return true;
        }
        return imageError;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'graduated':
                return 'secondary';
            case 'transferred':
                return 'outline';
            case 'dropped':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${student.name} - Student Detail`} />

            <div className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 dark:border-gray-700">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">{student.name}</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                NISN: {student.nisn} • Class: {student.class}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('teacher.students.edit', student.id)}>
                                <Button>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('student_show.actions.edit_student_records')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Student Overview */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Student Info Card */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4" />
                                    {t('student_show.sections.student_profile')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    {shouldShowDefaultAvatar(student.photo) ? (
                                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                            <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                                        </div>
                                    ) : (
                                        <img
                                            src={student.photo}
                                            alt={student.name}
                                            className="mx-auto h-24 w-24 rounded-full object-cover"
                                            onError={handleImageError}
                                        />
                                    )}
                                    <h3 className="mt-2 font-medium">{student.name}</h3>
                                    <Badge variant={getStatusBadgeVariant(student.status)} className="mt-1">
                                        {t(`student_show.status.${student.status}`)}
                                    </Badge>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.nisn')}:</span>
                                        <span className="font-medium">{student.nisn}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.gender')}:</span>
                                        <span className="font-medium">{t(`student_show.gender.${student.gender}`)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.date_of_birth')}:</span>
                                        <span className="font-medium">{formatDate(student.birth_date)}</span>
                                    </div>
                                    {student.birthplace && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.birth_place')}:</span>
                                            <span className="font-medium">{student.birthplace}</span>
                                        </div>
                                    )}
                                    {student.religion && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.religion')}:</span>
                                            <span className="font-medium">{student.religion}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.class')}:</span>
                                        <span className="font-medium">{student.class}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.entry_year')}:</span>
                                        <span className="font-medium">{student.entry_year}</span>
                                    </div>
                                    {student.graduation_year && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.graduation')}:</span>
                                            <span className="font-medium">{student.graduation_year}</span>
                                        </div>
                                    )}
                                </div>

                                {student.notes && (
                                    <div className="border-t pt-3">
                                        <h4 className="mb-2 text-sm font-medium">{t('student_show.fields.notes')}:</h4>
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400"
                                            dangerouslySetInnerHTML={{ __html: student.notes }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comprehensive Information Cards */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Contact Information */}
                        {(student.parent_name ||
                            student.parent_phone ||
                            student.parent_email ||
                            student.address ||
                            student.emergency_contact_name) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Phone className="h-4 w-4" />
                                        {t('student_show.sections.contact_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {student.parent_name && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.parent_guardian')}:</span>
                                                <span className="font-medium">{student.parent_name}</span>
                                            </div>
                                        )}
                                        {student.parent_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.parent_phone')}:</span>
                                                <span className="font-medium">{student.parent_phone}</span>
                                            </div>
                                        )}
                                        {student.parent_email && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.parent_email')}:</span>
                                                <span className="font-medium">{student.parent_email}</span>
                                            </div>
                                        )}
                                        {student.emergency_contact_name && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('student_show.fields.emergency_contact')}:
                                                </span>
                                                <span className="font-medium">{student.emergency_contact_name}</span>
                                            </div>
                                        )}
                                        {student.emergency_contact_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.emergency_phone')}:</span>
                                                <span className="font-medium">{student.emergency_contact_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    {student.address && (
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.address')}:</span>
                                                <span className="text-right font-medium">{student.address}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Transportation Information */}
                        {(student.transportation_method || student.distance_from_home_km || student.pickup_location) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Car className="h-4 w-4" />
                                        {t('student_show.sections.transportation_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {student.transportation_method && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.method')}:</span>
                                                <span className="font-medium">
                                                    {t(`student_show.transportation.${student.transportation_method}`)}
                                                </span>
                                            </div>
                                        )}
                                        {student.distance_from_home_km && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.distance')}:</span>
                                                <span className="font-medium">
                                                    {student.distance_from_home_km} {t('student_show.messages.km')}
                                                </span>
                                            </div>
                                        )}
                                        {student.travel_time_minutes && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.travel_time')}:</span>
                                                <span className="font-medium">
                                                    {student.travel_time_minutes} {t('student_show.messages.minutes')}
                                                </span>
                                            </div>
                                        )}
                                        {student.pickup_location && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.pickup_location')}:</span>
                                                <span className="font-medium">{student.pickup_location}</span>
                                            </div>
                                        )}
                                    </div>
                                    {student.transportation_notes && (
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('student_show.fields.transportation_notes')}:
                                                </span>
                                                <span className="text-right font-medium">{student.transportation_notes}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Health Information */}
                        {(student.blood_type || student.allergies || student.medical_conditions || student.dietary_restrictions) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Heart className="h-4 w-4" />
                                        {t('student_show.sections.health_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {student.blood_type && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.blood_type')}:</span>
                                                <span className="font-medium">{student.blood_type}</span>
                                            </div>
                                        )}
                                        {student.allergies && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.allergies')}:</span>
                                                <span className="text-right font-medium">{student.allergies}</span>
                                            </div>
                                        )}
                                        {student.medical_conditions && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('student_show.fields.medical_conditions')}:
                                                </span>
                                                <span className="text-right font-medium">{student.medical_conditions}</span>
                                            </div>
                                        )}
                                        {student.dietary_restrictions && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('student_show.fields.dietary_restrictions')}:
                                                </span>
                                                <span className="text-right font-medium">{student.dietary_restrictions}</span>
                                            </div>
                                        )}
                                    </div>
                                    {student.emergency_medical_info && (
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{t('student_show.fields.emergency_info')}:</span>
                                                <span className="text-right font-medium">{student.emergency_medical_info}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Academic Overview */}
                        <div className="grid gap-4 sm:grid-cols-1">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {t('student_show.fields.extracurriculars')}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {academicData.extracurriculars.length}
                                            </p>
                                        </div>
                                        <Activity className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Extracurricular Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="h-4 w-4" />
                                    {t('student_show.sections.extracurricular_activities')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {academicData.extracurriculars.length > 0 ? (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {academicData.extracurriculars.map((activity) => (
                                            <div key={activity.id} className="rounded-lg border p-4">
                                                <h4 className="mb-2 font-medium">{activity.name}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {t('student_show.fields.extracurriculars')}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {t('student_show.messages.no_extracurriculars')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Student Records Management */}
                {recordOptions && <StudentRecordsTabs student={student} recordOptions={recordOptions} isEdit={false} />}
            </div>
        </AppLayout>
    );
}
