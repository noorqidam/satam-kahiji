import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { File, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

// Configure axios for CSRF
const axiosInstance = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
});

// Function to get fresh CSRF token
const getFreshCsrfToken = async (): Promise<string | null> => {
    try {
        // Use a plain axios instance without interceptors to avoid infinite loops
        const plainAxios = axios.create();

        // Try to get a fresh token from our dedicated endpoint
        const response = await plainAxios.get('/admin/work-items/csrf-token', {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            withCredentials: true,
        });

        const freshToken = response.data.csrf_token;

        if (freshToken) {
            // Update the current page's CSRF token
            const currentTokenElement = document.querySelector('meta[name="csrf-token"]');
            if (currentTokenElement) {
                currentTokenElement.setAttribute('content', freshToken);
            }
            console.log('CSRF token refreshed successfully:', freshToken.substring(0, 10) + '...');
            return freshToken;
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        if (error instanceof AxiosError && error.response) {
            console.error('CSRF refresh error details:', error.response.status, error.response.data);
        }
    }

    return null;
};

// Add CSRF token to all requests
axiosInstance.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url} with CSRF token:`, token.substring(0, 10) + '...');
    } else {
        console.warn('No CSRF token found in meta tag for request:', config.url);
    }
    return config;
});

// Add response interceptor to handle 419 errors
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 419 error and haven't already retried
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('Got 419 error, attempting to refresh CSRF token...');

            // Try to get a fresh CSRF token
            const freshToken = await getFreshCsrfToken();
            if (freshToken) {
                // Update the original request with the fresh token
                originalRequest.headers['X-CSRF-TOKEN'] = freshToken;
                // Retry the original request
                return axiosInstance(originalRequest);
            }
        }

        return Promise.reject(error);
    },
);

interface WorkItemFileUploadProps {
    subjectId: number;
    workItemId: number;
    teacherId: number;
    onUploadSuccess: () => void;
}

export function WorkItemFileUpload({ subjectId, workItemId, teacherId, onUploadSuccess }: WorkItemFileUploadProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: 'Error',
                    description: 'File size must be less than 10MB.',
                    variant: 'destructive',
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // First, get the correct teacher_subject_work_id
            const idResponse = await axiosInstance.get('/admin/work-items/lookup-teacher-subject-work-id', {
                params: {
                    teacher_id: teacherId,
                    subject_id: subjectId,
                    work_item_id: workItemId,
                },
            });

            const teacherSubjectWorkId = idResponse.data.teacher_subject_work_id;

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('teacher_subject_work_id', teacherSubjectWorkId.toString());

            const response = await axiosInstance.post('/admin/work-items/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setUploadProgress(progress);
                    }
                },
            });

            // Upload success
            console.log('Upload success:', response.data);
            toast({
                title: 'Success',
                description: 'File uploaded successfully.',
                variant: 'success',
            });
            setSelectedFile(null);
            onUploadSuccess();
        } catch (error) {
            console.error('Upload failed:', error);
            let errorMessage = 'Failed to upload file.';
            let toastTitle = 'Upload Error';

            if (error instanceof AxiosError) {
                console.error('AxiosError details:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                });

                if (error.response) {
                    // Server responded with error status
                    const status = error.response.status;
                    const data = error.response.data;

                    console.log('Error response data:', data);

                    if (status === 419) {
                        errorMessage = 'Session expired. Please refresh the page and try again.';
                        toastTitle = 'Session Expired';
                    } else if (data && typeof data === 'object' && (data.error || data.message)) {
                        errorMessage = data.error || data.message;

                        // Special handling for Google Drive errors
                        if (errorMessage.includes('Google Drive') || errorMessage.includes('authenticated')) {
                            toastTitle = 'Google Drive Error';
                        }
                    } else if (status === 413) {
                        errorMessage = 'File too large. Please choose a smaller file.';
                        toastTitle = 'File Too Large';
                    } else if (status === 422) {
                        errorMessage = 'Invalid file or request. Please check your file and try again.';
                        toastTitle = 'Validation Error';
                    } else {
                        errorMessage = `Upload failed with status ${status}`;
                    }
                } else if (error.request) {
                    // Network error
                    errorMessage = 'Network error. Please check your connection and try again.';
                    toastTitle = 'Network Error';
                } else {
                    errorMessage = error.message || 'Failed to upload file.';
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.log('Showing toast with:', { title: toastTitle, description: errorMessage });

            toast({
                title: toastTitle,
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-3">
            {!selectedFile ? (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                    />
                    <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-3 w-3" />
                        Upload File
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-2">
                        <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="max-w-32 truncate text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{Math.round(selectedFile.size / 1024)} KB</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearSelection} disabled={uploading}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>

                    {uploading && (
                        <div className="space-y-1">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-center text-xs text-gray-500">Uploading... {uploadProgress}%</p>
                        </div>
                    )}

                    <Button size="sm" className="w-full" onClick={handleUpload} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload to Drive'}
                    </Button>
                </div>
            )}
        </div>
    );
}
