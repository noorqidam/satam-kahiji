import { useToast } from '@/hooks/use-toast';
import type { Staff, StaffForm, UpdateStaffFormData } from '@/types/staff';
import { router, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

interface UseStaffEditProps {
    staff: Staff;
    filters?: {
        subjects_search?: string;
    };
}

export function useStaffEdit({ staff, filters = {} }: UseStaffEditProps) {
    const { toast } = useToast();

    const form = useForm<StaffForm>({
        name: staff.name || '',
        position: staff.position || '',
        division: staff.division || undefined,
        email: staff.email || '',
        phone: staff.phone || '',
        bio: staff.bio || '',
        photo: null,
    });

    const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>(staff.subjects?.map((subject) => subject.id) || []);
    const [isAssigningSubjects, setIsAssigningSubjects] = useState(false);
    const [subjectsSearch, setSubjectsSearch] = useState(filters.subjects_search || '');
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const hasUserAccount = staff.user_id !== null && staff.user !== undefined;

    // Keep selectedSubjects in sync with staff.subjects
    useEffect(() => {
        setSelectedSubjects(staff.subjects?.map((subject) => subject.id) || []);
    }, [staff.subjects]);

    const handlePhotoSelect = useCallback(
        (file: File | null) => {
            form.setData('photo', file);

            // If removing a photo (file is null) and we're editing with an existing photo
            if (!file && staff.photo) {
                setIsPhotoRemoved(true);
            } else {
                setIsPhotoRemoved(false);
            }
        },
        [form, staff.photo],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            const formData: UpdateStaffFormData = {
                _method: 'PUT',
                bio: form.data.bio,
                photo: form.data.photo,
                remove_photo: isPhotoRemoved,
            };

            if (!hasUserAccount) {
                formData.name = form.data.name;
                formData.position = form.data.position;
                formData.division = form.data.division;
                formData.email = form.data.email;
            }

            formData.phone = form.data.phone;

            router.post(route('admin.staff.update', staff.id), JSON.parse(JSON.stringify(formData)), {
                forceFormData: true,
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Staff member updated successfully.',
                        variant: 'success',
                    });
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to update staff member.';
                    toast({
                        title: 'Error',
                        description: errorMessage,
                        variant: 'destructive',
                    });
                },
            });
        },
        [form, staff.id, hasUserAccount, isPhotoRemoved, toast],
    );

    const handleSubjectSelection = useCallback((subjectId: number, checked: boolean) => {
        setSelectedSubjects((prev) => {
            if (checked) {
                return [...prev, subjectId];
            } else {
                return prev.filter((id) => id !== subjectId);
            }
        });
    }, []);

    const assignSubjects = useCallback(() => {
        setIsAssigningSubjects(true);
        router.post(
            route('admin.staff.assign-subjects', staff.id),
            {
                subject_ids: selectedSubjects,
            },
            {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Subject assignments updated successfully.',
                        variant: 'success',
                    });
                    window.dispatchEvent(new CustomEvent('subject-staff-updated'));
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to update subject assignments.',
                        variant: 'destructive',
                    });
                },
                onFinish: () => setIsAssigningSubjects(false),
            },
        );
    }, [staff.id, selectedSubjects, toast]);

    const removeSubject = useCallback(
        (subjectId: number) => {
            router.delete(route('admin.staff.remove-subject', staff.id), {
                data: { subject_id: subjectId },
                onSuccess: () => {
                    // Update local state to uncheck the checkbox
                    setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId));
                    toast({
                        title: 'Success',
                        description: 'Subject removed successfully.',
                        variant: 'success',
                    });
                    window.dispatchEvent(new CustomEvent('subject-staff-updated'));
                },
                onError: () => {
                    toast({
                        title: 'Error',
                        description: 'Failed to remove subject.',
                        variant: 'destructive',
                    });
                },
            });
        },
        [staff.id, toast],
    );

    const updateSubjectsFilters = useCallback(
        (search: string) => {
            const params: Record<string, string> = {};

            if (search.trim()) {
                params.subjects_search = search.trim();
            }

            router.get(route('admin.staff.edit', staff.id), params, {
                preserveState: true,
                replace: true,
            });
        },
        [staff.id],
    );

    const debouncedUpdateSubjectsFilters = useCallback(
        (search: string) => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            const timer = setTimeout(() => updateSubjectsFilters(search), 300);
            setDebounceTimer(timer);
        },
        [debounceTimer, updateSubjectsFilters],
    );

    const handleSubjectsSearchChange = useCallback(
        (newSearch: string) => {
            setSubjectsSearch(newSearch);
            debouncedUpdateSubjectsFilters(newSearch);
        },
        [debouncedUpdateSubjectsFilters],
    );

    return {
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
    };
}
