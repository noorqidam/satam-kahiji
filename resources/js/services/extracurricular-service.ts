import { ExtracurricularFormData, ExtracurricularSearchParams, ExtracurricularWithPhoto, ExtracurricularWithStats } from '@/types/extracurricular';
import { router } from '@inertiajs/react';

export interface ExtracurricularServiceOptions {
    onSuccess?: (message?: string) => void;
    onError?: (errors?: Record<string, string> | undefined) => void;
    onFinish?: () => void;
}

class ExtracurricularService {
    create(data: ExtracurricularFormData, options: ExtracurricularServiceOptions = {}) {
        const formData = this.prepareFormData(data);

        router.post(route('admin.extracurriculars.store'), formData, {
            forceFormData: true,
            onSuccess: () => options.onSuccess?.('Extracurricular activity created successfully.'),
            onError: options.onError,
            onFinish: options.onFinish,
        });
    }

    update(extracurricular: ExtracurricularWithPhoto, data: ExtracurricularFormData, options: ExtracurricularServiceOptions = {}) {
        const formData = this.prepareFormData(data);

        router.post(route('admin.extracurriculars.update-post', extracurricular.id), formData, {
            forceFormData: true,
            onSuccess: () => options.onSuccess?.('Extracurricular activity updated successfully.'),
            onError: options.onError,
            onFinish: options.onFinish,
        });
    }

    delete(extracurricular: ExtracurricularWithStats, options: ExtracurricularServiceOptions = {}) {
        router.delete(route('admin.extracurriculars.destroy', extracurricular.id), {
            onSuccess: () => options.onSuccess?.(`${extracurricular.name} has been deleted successfully.`),
            onError: () => options.onError?.({ general: 'Failed to delete extracurricular activity.' }),
            onFinish: options.onFinish,
        });
    }

    bulkDelete(ids: number[], options: ExtracurricularServiceOptions = {}) {
        router.delete(route('admin.extracurriculars.bulk-destroy'), {
            data: { ids },
            onSuccess: () => options.onSuccess?.(`${ids.length} extracurricular activities deleted successfully.`),
            onError: () => options.onError?.({ general: 'Failed to delete extracurricular activities.' }),
            onFinish: options.onFinish,
        });
    }

    search(params: ExtracurricularSearchParams, options: ExtracurricularServiceOptions = {}) {
        const cleanParams = this.prepareSearchParams(params);

        router.get(route('admin.extracurriculars.index'), cleanParams, {
            preserveState: true,
            onFinish: options.onFinish,
        });
    }

    assignStudents(extracurricular: ExtracurricularWithStats, studentIds: number[], options: ExtracurricularServiceOptions = {}) {
        router.post(
            route('admin.extracurriculars.assign-students', extracurricular.id),
            {
                student_ids: studentIds,
            },
            {
                onSuccess: () => options.onSuccess?.('Students assigned successfully.'),
                onError: options.onError,
                onFinish: options.onFinish,
            },
        );
    }

    removeStudent(extracurricular: ExtracurricularWithStats, studentId: number, options: ExtracurricularServiceOptions = {}) {
        router.post(
            route('admin.extracurriculars.remove-student', extracurricular.id),
            {
                student_id: studentId,
            },
            {
                onSuccess: () => options.onSuccess?.('Student removed successfully.'),
                onError: options.onError,
                onFinish: options.onFinish,
            },
        );
    }

    private prepareFormData(data: ExtracurricularFormData) {
        const formData: Record<string, string | File> = {
            name: data.name,
            description: data.description || '',
        };

        if (data.photo) {
            formData.photo = data.photo;
        }

        if (data.remove_photo) {
            formData.remove_photo = 'true';
        }

        return formData;
    }

    private prepareSearchParams(params: ExtracurricularSearchParams): Record<string, string> {
        const cleanParams: Record<string, string> = {};

        if (params.search?.trim()) {
            cleanParams.search = params.search.trim();
        }
        if (params.page) {
            cleanParams.page = params.page.toString();
        }
        if (params.per_page) {
            cleanParams.per_page = params.per_page.toString();
        }

        return cleanParams;
    }
}

export const extracurricularService = new ExtracurricularService();
