import { Head } from '@inertiajs/react';
import { Activity, Calendar, Car, GraduationCap, Heart, Phone, School, User, UserCheck } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type BaseExtracurricular } from '@/types/extracurricular';
import { type Student } from '@/types/student';
import { type TeacherWithDirectProps } from '@/types/teacher';

// Extended Student interface for detailed show page with student records
interface StudentWithRecords extends Student {
    // Override homeroom_teacher to use the more detailed type
    homeroom_teacher: TeacherWithDirectProps;
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
        description: string;
        action_taken?: string;
        severity: 'minor' | 'moderate' | 'serious';
        date: string;
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
    extracurriculars: BaseExtracurricular[];
}

interface HeadmasterStudentShowProps {
    student: StudentWithRecords;
    academicData: AcademicData;
    userRole: string;
    extracurriculars: BaseExtracurricular[];
}

export default function HeadmasterStudentShow({ student, academicData }: HeadmasterStudentShowProps) {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('headmaster_students.breadcrumbs.headmaster_dashboard'), href: '/headmaster/dashboard' },
        { title: t('headmaster_students.breadcrumbs.students_overview'), href: '/headmaster/students' },
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

    const getAchievementTypeTranslation = (achievementType: string) => {
        const key = achievementType.toLowerCase().trim();
        const translationKey = `headmaster_student_show.achievement_types.${key}`;
        const translated = t(translationKey);

        // If translation returns the key itself, it means translation not found
        if (translated === translationKey) {
            // Fallback to proper capitalization
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
        return translated;
    };

    const getAchievementLevelTranslation = (achievementLevel: string) => {
        const key = achievementLevel.toLowerCase().trim();
        const translationKey = `headmaster_student_show.achievement_levels.${key}`;
        const translated = t(translationKey);

        // If translation returns the key itself, it means translation not found
        if (translated === translationKey) {
            // Fallback to proper capitalization
            return key.charAt(0).toUpperCase() + key.slice(1);
        }
        return translated;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${student.name} - ${t('headmaster_student_show.page_title')}`} />

            <div className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6 dark:border-gray-700">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
                                <GraduationCap className="h-6 w-6" />
                                {student.name}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                NISN: {student.nisn} • {t('headmaster_student_show.class')}: {student.class}
                            </p>
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
                                    {t('headmaster_student_show.sections.student_profile')}
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
                                            src={student.photo || ''}
                                            alt={student.name}
                                            className="mx-auto h-24 w-24 rounded-full object-cover"
                                            onError={handleImageError}
                                        />
                                    )}
                                    <h3 className="mt-2 font-medium">{student.name}</h3>
                                    <Badge variant={getStatusBadgeVariant(student.status)} className="mt-1">
                                        {t(`headmaster_students.status.${student.status}`)}
                                    </Badge>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('headmaster_student_show.fields.nisn')}:</span>
                                        <span className="font-medium">{student.nisn}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('headmaster_student_show.fields.gender')}:</span>
                                        <span className="font-medium">{t(`headmaster_students.gender.${student.gender}`)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('headmaster_student_show.fields.date_of_birth')}:</span>
                                        <span className="font-medium">{formatDate(student.birth_date)}</span>
                                    </div>
                                    {student.birthplace && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {t('headmaster_student_show.fields.birth_place')}:
                                            </span>
                                            <span className="font-medium">{student.birthplace}</span>
                                        </div>
                                    )}
                                    {student.religion && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">{t('headmaster_student_show.fields.religion')}:</span>
                                            <span className="font-medium">{student.religion}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('headmaster_student_show.fields.class')}:</span>
                                        <span className="font-medium">{student.class}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">{t('headmaster_student_show.fields.entry_year')}:</span>
                                        <span className="font-medium">{student.entry_year}</span>
                                    </div>
                                    {student.graduation_year && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {t('headmaster_student_show.fields.graduation')}:
                                            </span>
                                            <span className="font-medium">{student.graduation_year}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {t('headmaster_student_show.fields.homeroom_teacher')}:
                                        </span>
                                        <span className="font-medium">
                                            {student.homeroom_teacher?.name || t('headmaster_students.table.not_assigned')}
                                        </span>
                                    </div>
                                </div>

                                {student.notes && (
                                    <div className="border-t pt-3">
                                        <h4 className="mb-2 text-sm font-medium">{t('headmaster_student_show.fields.notes')}:</h4>
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
                                        {t('headmaster_student_show.sections.contact_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {student.parent_name && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.parent_guardian')}:
                                                </span>
                                                <span className="font-medium">{student.parent_name}</span>
                                            </div>
                                        )}
                                        {student.parent_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.parent_phone')}:
                                                </span>
                                                <span className="font-medium">{student.parent_phone}</span>
                                            </div>
                                        )}
                                        {student.parent_email && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.parent_email')}:
                                                </span>
                                                <span className="font-medium">{student.parent_email}</span>
                                            </div>
                                        )}
                                        {student.emergency_contact_name && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.emergency_contact')}:
                                                </span>
                                                <span className="font-medium">{student.emergency_contact_name}</span>
                                            </div>
                                        )}
                                        {student.emergency_contact_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.emergency_phone')}:
                                                </span>
                                                <span className="font-medium">{student.emergency_contact_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    {student.address && (
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.address')}:
                                                </span>
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
                                        {t('headmaster_student_show.sections.transportation_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {student.transportation_method && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.method')}:
                                                </span>
                                                <span className="font-medium">
                                                    {t(`headmaster_student_show.transportation.${student.transportation_method}`)}
                                                </span>
                                            </div>
                                        )}
                                        {student.distance_from_home_km && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.distance')}:
                                                </span>
                                                <span className="font-medium">
                                                    {student.distance_from_home_km} {t('headmaster_student_show.messages.km')}
                                                </span>
                                            </div>
                                        )}
                                        {student.travel_time_minutes && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.travel_time')}:
                                                </span>
                                                <span className="font-medium">
                                                    {student.travel_time_minutes} {t('headmaster_student_show.messages.minutes')}
                                                </span>
                                            </div>
                                        )}
                                        {student.pickup_location && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.pickup_location')}:
                                                </span>
                                                <span className="font-medium">{student.pickup_location}</span>
                                            </div>
                                        )}
                                    </div>
                                    {student.transportation_notes && (
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.transportation_notes')}:
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
                                        {t('headmaster_student_show.sections.health_information')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {student.blood_type && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.blood_type')}:
                                                </span>
                                                <span className="font-medium">{student.blood_type}</span>
                                            </div>
                                        )}
                                        {student.allergies && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.allergies')}:
                                                </span>
                                                <span className="text-right font-medium">{student.allergies}</span>
                                            </div>
                                        )}
                                        {student.medical_conditions && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.medical_conditions')}:
                                                </span>
                                                <span className="text-right font-medium">{student.medical_conditions}</span>
                                            </div>
                                        )}
                                        {student.dietary_restrictions && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.dietary_restrictions')}:
                                                </span>
                                                <span className="text-right font-medium">{student.dietary_restrictions}</span>
                                            </div>
                                        )}
                                    </div>
                                    {student.emergency_medical_info && (
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {t('headmaster_student_show.fields.emergency_info')}:
                                                </span>
                                                <span className="text-right font-medium">{student.emergency_medical_info}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Extracurricular Activities and Achievements (2-column layout) */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Extracurricular Activities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4" />
                                {t('headmaster_student_show.sections.extracurricular_activities')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {academicData.extracurriculars.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {academicData.extracurriculars.map((activity) => (
                                        <Badge key={activity.id} variant="secondary">
                                            {activity.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {t('headmaster_student_show.records.no_current_extracurriculars')}
                                    </h3>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <School className="h-4 w-4" />
                                {t('headmaster_student_show.records.achievements')} ({student.achievements?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {student.achievements && student.achievements.length > 0 ? (
                                <div className="space-y-4">
                                    {student.achievements.map((achievement) => (
                                        <div key={achievement.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {achievement.achievement_name}
                                                        </h4>
                                                        <Badge variant="default">{getAchievementLevelTranslation(achievement.level)}</Badge>
                                                        <Badge variant="secondary">
                                                            {getAchievementTypeTranslation(achievement.achievement_type)}
                                                        </Badge>
                                                    </div>
                                                    {achievement.description && (
                                                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{achievement.description}</p>
                                                    )}
                                                    {achievement.score_value && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">{t('headmaster_student_show.fields.score')}:</span>{' '}
                                                            {achievement.score_value}
                                                        </p>
                                                    )}
                                                    {achievement.issuing_organization && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">{t('headmaster_student_show.fields.issued_by')}:</span>{' '}
                                                            {achievement.issuing_organization}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-4 text-right">
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        {formatDate(achievement.date_achieved)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <School className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {t('headmaster_student_show.records.no_achievements')}
                                    </h3>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Student Records (2-column grid layout) */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column - Positive Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserCheck className="h-4 w-4" />
                                {t('headmaster_student_show.records.positive_notes')} ({student.positive_notes?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {student.positive_notes && student.positive_notes.length > 0 ? (
                                <div className="space-y-4">
                                    {student.positive_notes.map((note) => (
                                        <div key={note.id} className="border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{note.note}</p>
                                                    {note.category && (
                                                        <Badge variant="secondary" className="mt-2">
                                                            {note.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="ml-4 text-right">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{note.staff_name}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(note.date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {t('headmaster_student_show.records.no_positive_notes')}
                                    </h3>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column - Disciplinary Records */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4" />
                                {t('headmaster_student_show.records.disciplinary_records')} ({student.disciplinary_records?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {student.disciplinary_records && student.disciplinary_records.length > 0 ? (
                                <div className="space-y-4">
                                    {student.disciplinary_records.map((record) => (
                                        <div key={record.id} className="border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-900/20">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {record.incident_type}
                                                        </h4>
                                                        <Badge
                                                            variant={
                                                                record.severity === 'serious'
                                                                    ? 'destructive'
                                                                    : record.severity === 'moderate'
                                                                      ? 'default'
                                                                      : 'secondary'
                                                            }
                                                        >
                                                            {t(`headmaster_student_show.severity.${record.severity}`)}
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{record.description}</p>
                                                    {record.action_taken && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="font-medium">{t('headmaster_student_show.fields.action_taken')}:</span>{' '}
                                                            {record.action_taken}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-4 text-right">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{record.staff_name}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(record.date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {t('headmaster_student_show.records.no_disciplinary_records')}
                                    </h3>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
