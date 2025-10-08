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
import { FormEventHandler, useCallback, useEffect, useMemo, useRef } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
}

interface StudentFormCardProps {
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

export function StudentFormCard({
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
}: StudentFormCardProps) {
    const hasInteracted = useRef(false);

    // Create lookup maps for automatic selection
    const classToTeacherMap = useMemo(() => {
        const map = new Map<string, number>();
        availableClasses.forEach((classItem) => {
            if (classItem.homeroom_teacher) {
                map.set(classItem.name, classItem.homeroom_teacher.id);
            }
        });
        return map;
    }, [availableClasses]);

    const teacherToClassMap = useMemo(() => {
        const map = new Map<number, string>();
        staff.forEach((teacher) => {
            if (teacher.homeroom_class) {
                map.set(teacher.id, teacher.homeroom_class);
            }
        });
        return map;
    }, [staff]);

    // Handle automatic teacher assignment when class changes
    useEffect(() => {
        if (data.class && classToTeacherMap.has(data.class)) {
            const assignedTeacherId = classToTeacherMap.get(data.class)!;
            if (data.homeroom_teacher_id !== assignedTeacherId.toString()) {
                setData('homeroom_teacher_id', assignedTeacherId.toString());
            }
        }
    }, [data.class, classToTeacherMap, setData]);

    // Handle automatic class assignment when teacher changes
    useEffect(() => {
        if (data.homeroom_teacher_id) {
            const teacherId = parseInt(data.homeroom_teacher_id);
            if (teacherToClassMap.has(teacherId)) {
                const assignedClass = teacherToClassMap.get(teacherId)!;
                if (data.class !== assignedClass) {
                    setData('class', assignedClass);
                }
            }
        }
    }, [data.homeroom_teacher_id, teacherToClassMap, setData]);

    const handlePhotoSelect = (file: File | null) => {
        // Mark that user has interacted with the photo field
        hasInteracted.current = true;

        setData('photo', file);

        // Logic for photo deletion:
        // Only mark for deletion if user explicitly clicked the delete button
        // This happens when file is null AND user has interacted with the component
        if (file === null && isEdit && currentPhotoUrl) {
            setData('delete_photo', true);
        } else if (file !== null) {
            // User selected a new photo - don't delete the old one, just replace it
            setData('delete_photo', false);
        }
    };

    const handleNotesChange = (content: string) => {
        setData('notes', content);
    };

    const handleExtracurricularChange = useCallback(
        (selected: string[]) => {
            setData(
                'extracurricular_ids',
                selected.map((id) => parseInt(id)),
            );
        },
        [setData],
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEdit ? 'Edit Student Information' : 'Create New Student'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                                placeholder="Enter student's full name"
                                required
                            />
                            {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nisn">NISN *</Label>
                            <Input
                                id="nisn"
                                type="text"
                                value={data.nisn}
                                onChange={(e) => setData('nisn', e.target.value)}
                                className={errors.nisn ? 'border-red-500' : ''}
                                placeholder="Enter NISN (National Student Identification Number)"
                                required
                            />
                            {errors.nisn && <p className="text-sm text-red-600 dark:text-red-400">{errors.nisn}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select value={data.gender || undefined} onValueChange={(value) => setData('gender', value)}>
                                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birth_date">Date of Birth *</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                                className={errors.birth_date ? 'border-red-500' : ''}
                                required
                            />
                            {errors.birth_date && <p className="text-sm text-red-600 dark:text-red-400">{errors.birth_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="class">Class *</Label>
                            {availableClasses.length > 0 ? (
                                <Select value={data.class || undefined} onValueChange={(value) => setData('class', value)}>
                                    <SelectTrigger className={errors.class ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableClasses.map((classItem) => (
                                            <SelectItem key={classItem.id} value={classItem.name} disabled={classItem.is_full}>
                                                <div className="flex w-full items-center justify-between">
                                                    <span>
                                                        {classItem.name} (Grade {classItem.grade_level})
                                                    </span>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        {classItem.current_students}/{classItem.capacity}
                                                        {classItem.is_full && ' - Full'}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="class"
                                    type="text"
                                    value={data.class}
                                    onChange={(e) => setData('class', e.target.value)}
                                    className={errors.class ? 'border-red-500' : ''}
                                    placeholder="Enter class (e.g., 7A, 8B, 9C)"
                                    required
                                />
                            )}
                            {availableClasses.length > 0 && (
                                <p className="text-xs text-gray-500">
                                    Select from predefined classes. Classes marked as "Full" have reached their capacity.
                                </p>
                            )}
                            {errors.class && <p className="text-sm text-red-600 dark:text-red-400">{errors.class}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="homeroom_teacher_id">Homeroom Teacher</Label>
                            <Select
                                value={data.homeroom_teacher_id || undefined}
                                onValueChange={(value) => setData('homeroom_teacher_id', value || '')}
                            >
                                <SelectTrigger className={errors.homeroom_teacher_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select homeroom teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name} - {teacher.position}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.homeroom_teacher_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.homeroom_teacher_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="entry_year">Entry Year *</Label>
                            <Input
                                id="entry_year"
                                type="number"
                                value={data.entry_year}
                                onChange={(e) => setData('entry_year', e.target.value)}
                                className={errors.entry_year ? 'border-red-500' : ''}
                                placeholder="Enter entry year (e.g., 2024)"
                                required
                            />
                            {errors.entry_year && <p className="text-sm text-red-600 dark:text-red-400">{errors.entry_year}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="graduation_year">Graduation Year</Label>
                            <Input
                                id="graduation_year"
                                type="number"
                                value={data.graduation_year}
                                onChange={(e) => setData('graduation_year', e.target.value)}
                                className={errors.graduation_year ? 'border-red-500' : ''}
                                placeholder="Enter graduation year (e.g., 2027)"
                            />
                            {errors.graduation_year && <p className="text-sm text-red-600 dark:text-red-400">{errors.graduation_year}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status || undefined} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
                        </div>
                        {/* Photo Upload */}
                        <div className="space-y-2">
                            <Label>Student Photo</Label>
                            <div className="flex justify-center">
                                <AvatarDropzone onFileSelect={handlePhotoSelect} currentImageUrl={currentPhotoUrl} size="xl" />
                            </div>
                            {errors.photo && <p className="text-center text-sm text-red-600 dark:text-red-400">{errors.photo}</p>}
                        </div>
                    </div>

                    {/* Extracurricular Activities */}
                    <div className="space-y-2">
                        <Label htmlFor="extracurricular_ids">Extracurricular Activities</Label>
                        <MultiSelectDropdown
                            options={extracurriculars.map((ec) => ec.id.toString())}
                            selected={data.extracurricular_ids.map((id) => id.toString())}
                            onSelectionChange={handleExtracurricularChange}
                            placeholder="Select extracurricular activities..."
                            getLabel={(id) => {
                                const extracurricular = extracurriculars.find((ec) => ec.id.toString() === id);
                                return extracurricular ? extracurricular.name : id;
                            }}
                        />
                        <p className="text-xs text-gray-500">Students can participate in multiple extracurricular activities.</p>
                        {errors.extracurricular_ids && <p className="text-sm text-red-600 dark:text-red-400">{errors.extracurricular_ids}</p>}
                    </div>

                    {/* Notes with Rich Text Editor */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <RichTextEditor
                            value={data.notes}
                            onChange={handleNotesChange}
                            placeholder="Enter any additional notes about the student..."
                            height={200}
                        />
                        {errors.notes && <p className="text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
