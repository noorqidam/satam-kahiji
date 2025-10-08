import { httpClient } from '@/lib/http-client';
import { isValidFileType } from '@/utils/file-icons';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadServiceConfig {
    maxFileSize: number; // in MB
    onProgress?: (progress: UploadProgress) => void;
}

class UploadService {
    async getTeacherSubjectWorkId(teacherId: number, subjectId: number, workItemId: number): Promise<number> {
        const response = await (httpClient as any).instance.get('/admin/work-items/lookup-teacher-subject-work-id', {
            params: {
                teacher_id: teacherId,
                subject_id: subjectId,
                work_item_id: workItemId,
            },
        });
        return response.data.teacher_subject_work_id;
    }

    async uploadFile(file: File, teacherSubjectWorkId: number, config: UploadServiceConfig): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('teacher_subject_work_id', teacherSubjectWorkId.toString());

        const response = await (httpClient as any).instance.post('/admin/work-items/upload-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: any) => {
                if (progressEvent.total && config.onProgress) {
                    const progress: UploadProgress = {
                        loaded: progressEvent.loaded,
                        total: progressEvent.total,
                        percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
                    };
                    config.onProgress(progress);
                }
            },
        });

        return response.data;
    }

    validateFile(file: File, maxFileSize: number): string | null {
        if (!isValidFileType(file?.name)) {
            return 'File type not supported';
        }

        if (file?.size && file.size > maxFileSize * 1024 * 1024) {
            return `File size must be less than ${maxFileSize}MB`;
        }

        return null;
    }

    validateFiles(
        files: File[],
        existingFiles: File[],
        maxFiles: number,
        maxFileSize: number,
    ): {
        validFiles: File[];
        errors: string[];
    } {
        const validFiles: File[] = [];
        const errors: string[] = [];

        for (const file of files) {
            const fileName = file?.name || 'unknown';

            // Check if file already exists
            const exists = existingFiles.some((f) => f.name === fileName && f.size === (file?.size || 0));
            if (exists) {
                errors.push(`File "${fileName}" already added`);
                continue;
            }

            // Validate file
            const error = this.validateFile(file, maxFileSize);
            if (error) {
                errors.push(`${fileName}: ${error}`);
                continue;
            }

            // Check max files limit
            if (existingFiles.length + validFiles.length >= maxFiles) {
                errors.push(`Maximum ${maxFiles} files allowed`);
                break;
            }

            validFiles.push(file);
        }

        return { validFiles, errors };
    }
}

export const uploadService = new UploadService();
