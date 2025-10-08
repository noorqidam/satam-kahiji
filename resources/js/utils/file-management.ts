export interface FileWithProgress {
    file: File;
    id: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

export const createFileWithProgress = (file: File): FileWithProgress => {
    return {
        file: file,
        id: `${file.name || 'unknown'}-${file.size || 0}-${Date.now()}`,
        progress: 0,
        status: 'pending',
    };
};

export const updateFileStatus = (
    files: FileWithProgress[],
    fileId: string,
    updates: Partial<Omit<FileWithProgress, 'file' | 'id'>>,
): FileWithProgress[] => {
    return files.map((f) => (f.id === fileId ? { ...f, ...updates } : f));
};

export const removeFile = (files: FileWithProgress[], fileId: string): FileWithProgress[] => {
    return files.filter((f) => f.id !== fileId);
};

export const getFileStatistics = (files: FileWithProgress[]) => {
    return {
        pending: files.filter((f) => f.status === 'pending').length,
        uploading: files.filter((f) => f.status === 'uploading').length,
        completed: files.filter((f) => f.status === 'completed').length,
        error: files.filter((f) => f.status === 'error').length,
        total: files.length,
    };
};

export const resetFailedFiles = (files: FileWithProgress[]): FileWithProgress[] => {
    return files.map((f) => (f.status === 'error' ? { ...f, status: 'pending' as const, error: undefined, progress: 0 } : f));
};
