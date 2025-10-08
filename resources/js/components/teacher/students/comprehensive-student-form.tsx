import { router } from '@inertiajs/react';
import { Eye, FileText, MessageSquare, Plus, Trash2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { DocumentDropzone } from '@/components/ui/document-dropzone';
import { FileIcon } from '@/components/ui/file-icon';
import { FilePreviewDialog } from '@/components/ui/file-preview-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface StudentRecord {
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
        category_name: string;
        uploaded_at: string;
        file_path: string;
        file_name: string;
        mime_type: string;
        file_size?: number;
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

interface Student {
    id: number;
    name: string;
    nisn: string;
    class: string;
}

interface RecordOptions {
    certificate_templates?: Array<{ id: number; name: string; template_type: string }>;
    achievement_types?: Record<string, string>;
    achievement_levels?: Record<string, string>;
}

interface StudentRecordsTabsProps {
    student: Student & StudentRecord;
    recordOptions: RecordOptions;
    isEdit?: boolean;
}

export function StudentRecordsTabs({ student, recordOptions, isEdit = false }: StudentRecordsTabsProps) {
    const { t } = useTranslation('common');
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states for new records
    const [newPositiveNote, setNewPositiveNote] = useState({
        note: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [newDisciplinaryRecord, setNewDisciplinaryRecord] = useState({
        incident_type: '',
        incident_description: '',
        action_taken: '',
        severity: 'minor' as const,
        incident_date: new Date().toISOString().split('T')[0],
    });
    const [newDocument, setNewDocument] = useState({
        title: '',
        document_type: 'other',
        file: null as File | null,
        description: '',
    });
    const [newAchievement, setNewAchievement] = useState({
        achievement_type: '',
        achievement_name: '',
        description: '',
        date_achieved: new Date().toISOString().split('T')[0],
        criteria_met: '',
        level: 'school',
        score_value: '',
        issuing_organization: '',
    });

    // State for file preview dialog
    const [previewFile, setPreviewFile] = useState<{
        id: number;
        file_name: string;
        file_url: string;
        file_size?: number;
        created_at: string;
    } | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // State for delete confirmation dialog
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        type: string;
        id: number;
        itemName: string;
        itemType: string;
    }>({
        isOpen: false,
        type: '',
        id: 0,
        itemName: '',
        itemType: '',
    });

    // Helper function to get file extension
    const getFileExtension = (fileName: string): string => {
        return fileName.split('.').pop()?.toLowerCase() || '';
    };

    // Handle file preview
    const handlePreviewFile = (document: any) => {
        setPreviewFile({
            id: document.id,
            file_name: document.file_name || document.title || 'Unknown file',
            file_url: document.file_path, // Use the direct file path/URL
            file_size: document.file_size,
            created_at: document.uploaded_at || document.created_at,
        });
        setIsPreviewOpen(true);
    };

    const handleSubmitRecord = useCallback(
        async (type: string, data: any) => {
            if (!isEdit) {
                toast({
                    title: t('common.info'),
                    description: t('student_records.messages.save_student_first'),
                    variant: 'default',
                });
                return;
            }

            setIsSubmitting(true);

            let routeName = '';
            let submitData: any = data;

            switch (type) {
                case 'positive-note':
                    routeName = 'teacher.students.positive-notes.store';
                    break;
                case 'disciplinary':
                    routeName = 'teacher.students.disciplinary-records.store';
                    break;
                case 'document':
                    routeName = 'teacher.students.documents.store';
                    const formData = new FormData();
                    Object.entries(data).forEach(([key, value]) => {
                        if (key === 'file' && value instanceof File) {
                            formData.append(key, value);
                        } else if (value) {
                            formData.append(key, value.toString());
                        }
                    });
                    submitData = formData;
                    break;
                case 'achievement':
                    routeName = 'teacher.students.achievements.store';
                    break;
            }

            const options: any = {
                onSuccess: (page: any) => {
                    // Debug: Log the page response to see what we get
                    console.log('Success response:', page);
                    console.log('Flash messages:', page.props?.flash);
                    console.log('Student data:', page.props?.student);

                    // Show success message from server or default
                    const successMessage = page.props?.flash?.success || t('student_records.messages.record_added_successfully');
                    toast({
                        title: t('common.success'),
                        description: successMessage,
                        variant: 'success',
                    });

                    // Reset form
                    switch (type) {
                        case 'positive-note':
                            setNewPositiveNote({
                                note: '',
                                category: '',
                                date: new Date().toISOString().split('T')[0],
                            });
                            break;
                        case 'disciplinary':
                            setNewDisciplinaryRecord({
                                incident_type: '',
                                incident_description: '',
                                action_taken: '',
                                severity: 'minor',
                                incident_date: new Date().toISOString().split('T')[0],
                            });
                            break;
                        case 'document':
                            setNewDocument({
                                title: '',
                                document_type: 'other',
                                file: null,
                                description: '',
                            });
                            break;
                        case 'achievement':
                            setNewAchievement({
                                achievement_type: '',
                                achievement_name: '',
                                description: '',
                                date_achieved: new Date().toISOString().split('T')[0],
                                criteria_met: '',
                                level: 'school',
                                score_value: '',
                                issuing_organization: '',
                            });
                            break;
                    }

                    // For document uploads, reload the entire page to ensure updated data shows
                    if (type === 'document') {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        // For other record types, use the standard reload
                        setTimeout(() => {
                            router.reload({ only: ['student'] });
                        }, 100);
                    }
                },
                onError: (errors: any) => {
                    // Debug: Log the error response
                    console.log('Error response:', errors);

                    // Show specific error message if available
                    const errorMessage = errors?.file || errors?.message || t('student_records.messages.failed_to_add_record');
                    toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
                },
                onFinish: () => setIsSubmitting(false),
            };

            if (type === 'document') {
                options.forceFormData = true;
            }

            router.post(route(routeName, student.id), submitData, options);
        },
        [isEdit, student.id, toast],
    );

    // Show delete confirmation dialog
    const handleDeleteRecord = useCallback((type: string, id: number, itemName: string = '') => {
        let itemType = '';
        switch (type) {
            case 'positive-note':
                itemType = t('student_records.notes.positive_note');
                break;
            case 'disciplinary':
                itemType = t('student_records.notes.disciplinary_record');
                break;
            case 'extracurricular':
                itemType = t('student_records.activities.extracurricular_history');
                break;
            case 'document':
                itemType = t('student_records.documents.document');
                break;
        }

        setDeleteDialog({
            isOpen: true,
            type,
            id,
            itemName,
            itemType,
        });
    }, []);

    // Perform actual deletion
    const confirmDeleteRecord = useCallback(() => {
        const { type, id } = deleteDialog;

        let routeName = '';
        switch (type) {
            case 'positive-note':
                routeName = 'teacher.students.positive-notes.destroy';
                break;
            case 'disciplinary':
                routeName = 'teacher.students.disciplinary-records.destroy';
                break;
            case 'extracurricular':
                routeName = 'teacher.students.extracurricular-history.destroy';
                break;
            case 'document':
                routeName = 'teacher.students.documents.destroy';
                break;
        }

        router.delete(route(routeName, [student.id, id]), {
            onSuccess: () => {
                toast({ title: t('common.success'), description: t('student_records.messages.record_deleted_successfully'), variant: 'success' });
            },
            onError: () => {
                toast({ title: t('common.error'), description: t('student_records.messages.failed_to_delete_record'), variant: 'destructive' });
            },
        });
    }, [deleteDialog, student.id, toast]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'minor':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'serious':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        {t('student_records.tabs.notes')} & {t('student_records.tabs.activities')} &{' '}
                        {t('student_records.tabs.documents_achievements')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="notes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="notes" className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('student_records.tabs.notes')}</span>
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('student_records.tabs.documents_achievements')}</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Notes Tab - Combined Positive Notes & Disciplinary Records */}
                        <TabsContent value="notes" className="space-y-4">
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Positive Notes Section */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-green-700 dark:text-green-400">{t('student_records.notes.positive_notes')}</h4>
                                    {isEdit && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">{t('student_records.notes.add_positive_note')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label htmlFor="positive-date">{t('student_records.notes.date')}</Label>
                                                        <Input
                                                            id="positive-date"
                                                            type="date"
                                                            value={newPositiveNote.date}
                                                            onChange={(e) => setNewPositiveNote((prev) => ({ ...prev, date: e.target.value }))}
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="positive-category">{t('student_records.notes.category')} (Optional)</Label>
                                                        <Input
                                                            id="positive-category"
                                                            value={newPositiveNote.category}
                                                            onChange={(e) => setNewPositiveNote((prev) => ({ ...prev, category: e.target.value }))}
                                                            placeholder={t('student_records.notes.category_placeholder')}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="positive-note">{t('student_records.notes.note')}</Label>
                                                    <Textarea
                                                        id="positive-note"
                                                        value={newPositiveNote.note}
                                                        onChange={(e) => setNewPositiveNote((prev) => ({ ...prev, note: e.target.value }))}
                                                        placeholder={t('student_records.notes.note_placeholder')}
                                                        rows={3}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => handleSubmitRecord('positive-note', newPositiveNote)}
                                                    disabled={!newPositiveNote.note || isSubmitting}
                                                    size="sm"
                                                >
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    {t('student_records.common.add')} {t('student_records.notes.note')}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="space-y-3">
                                        {student.positive_notes?.map((note) => (
                                            <Card key={note.id} className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm">{note.note}</p>
                                                        {note.category && (
                                                            <Badge variant="outline" className="mt-1 text-xs">
                                                                {note.category}
                                                            </Badge>
                                                        )}
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            {note.date} • By {note.staff_name} • {note.created_at}
                                                        </p>
                                                    </div>
                                                    {isEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteRecord('positive-note', note.id, note.note)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        )) || (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('student_records.notes.no_positive_notes')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Disciplinary Records Section */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-red-700 dark:text-red-400">{t('student_records.notes.disciplinary_records')}</h4>
                                    {isEdit && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">{t('student_records.notes.add_disciplinary_record')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <Label htmlFor="incident-date">{t('student_records.notes.incident_date')}</Label>
                                                        <Input
                                                            id="incident-date"
                                                            type="date"
                                                            value={newDisciplinaryRecord.incident_date}
                                                            onChange={(e) =>
                                                                setNewDisciplinaryRecord((prev) => ({ ...prev, incident_date: e.target.value }))
                                                            }
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="incident-type">{t('student_records.notes.incident_type')}</Label>
                                                        <Input
                                                            id="incident-type"
                                                            value={newDisciplinaryRecord.incident_type}
                                                            onChange={(e) =>
                                                                setNewDisciplinaryRecord((prev) => ({ ...prev, incident_type: e.target.value }))
                                                            }
                                                            placeholder={t('student_records.notes.incident_type_placeholder')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="severity">{t('student_records.notes.severity')}</Label>
                                                        <Select
                                                            value={newDisciplinaryRecord.severity}
                                                            onValueChange={(value: any) =>
                                                                setNewDisciplinaryRecord((prev) => ({ ...prev, severity: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="minor">{t('student_records.notes.minor')}</SelectItem>
                                                                <SelectItem value="moderate">{t('student_records.notes.moderate')}</SelectItem>
                                                                <SelectItem value="serious">{t('student_records.notes.serious')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="incident-description">{t('student_records.notes.incident_description')}</Label>
                                                    <Textarea
                                                        id="incident-description"
                                                        value={newDisciplinaryRecord.incident_description}
                                                        onChange={(e) =>
                                                            setNewDisciplinaryRecord((prev) => ({ ...prev, incident_description: e.target.value }))
                                                        }
                                                        placeholder={t('student_records.notes.incident_description_placeholder')}
                                                        rows={3}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="action-taken">{t('student_records.notes.action_taken')} (Optional)</Label>
                                                    <Textarea
                                                        id="action-taken"
                                                        value={newDisciplinaryRecord.action_taken}
                                                        onChange={(e) =>
                                                            setNewDisciplinaryRecord((prev) => ({ ...prev, action_taken: e.target.value }))
                                                        }
                                                        placeholder={t('student_records.notes.action_taken_placeholder')}
                                                        rows={2}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => handleSubmitRecord('disciplinary', newDisciplinaryRecord)}
                                                    disabled={
                                                        !newDisciplinaryRecord.incident_type ||
                                                        !newDisciplinaryRecord.incident_description ||
                                                        isSubmitting
                                                    }
                                                    size="sm"
                                                >
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    {t('student_records.common.add')} {t('student_records.notes.disciplinary_records')}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="space-y-3">
                                        {student.disciplinary_records?.map((record) => (
                                            <Card key={record.id} className="p-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <Badge className={getSeverityColor(record.severity)}>
                                                                {record.severity.toUpperCase()}
                                                            </Badge>
                                                            <Badge variant="outline">{record.incident_type}</Badge>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{record.incident_date}</span>
                                                        </div>
                                                        <h5 className="text-sm font-medium">{t('student_records.notes.incident_description')}</h5>
                                                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{record.incident_description}</p>
                                                        {record.action_taken && (
                                                            <>
                                                                <h5 className="text-sm font-medium">{t('student_records.notes.action_taken')}</h5>
                                                                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{record.action_taken}</p>
                                                            </>
                                                        )}
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            By {record.staff_name} • {record.created_at}
                                                        </p>
                                                    </div>
                                                    {isEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteRecord('disciplinary', record.id, record.incident_type)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        )) || (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t('student_records.notes.no_disciplinary_records')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Documents & Achievements Tab - Documents, Certificates, and Achievements */}
                        <TabsContent value="documents" className="space-y-4">
                            <div className="space-y-6">
                                {/* Documents Section */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-blue-700 dark:text-blue-400">{t('student_records.documents.documents')}</h4>
                                    {isEdit && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">{t('student_records.documents.add_document')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <Label htmlFor="doc-title">{t('student_records.documents.title')}</Label>
                                                        <Input
                                                            id="doc-title"
                                                            value={newDocument.title}
                                                            onChange={(e) => setNewDocument((prev) => ({ ...prev, title: e.target.value }))}
                                                            placeholder={t('student_records.documents.title_placeholder')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="doc-type">{t('student_records.documents.document_type')}</Label>
                                                        <Select
                                                            value={newDocument.document_type}
                                                            onValueChange={(value) => setNewDocument((prev) => ({ ...prev, document_type: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('student_records.common.select_option')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="sick_note">
                                                                    {t('student_records.documents.document_types.sick_note')}
                                                                </SelectItem>
                                                                <SelectItem value="excuse_letter">
                                                                    {t('student_records.documents.document_types.excuse_letter')}
                                                                </SelectItem>
                                                                <SelectItem value="medical_certificate">
                                                                    {t('student_records.documents.document_types.medical_certificate')}
                                                                </SelectItem>
                                                                <SelectItem value="permission_slip">
                                                                    {t('student_records.documents.document_types.permission_slip')}
                                                                </SelectItem>
                                                                <SelectItem value="report">
                                                                    {t('student_records.documents.document_types.report')}
                                                                </SelectItem>
                                                                <SelectItem value="transcript">
                                                                    {t('student_records.documents.document_types.transcript')}
                                                                </SelectItem>
                                                                <SelectItem value="other">
                                                                    {t('student_records.documents.document_types.other')}
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="doc-file">{t('student_records.documents.file')}</Label>
                                                    <DocumentDropzone
                                                        onFileSelect={(file) =>
                                                            setNewDocument((prev) => ({
                                                                ...prev,
                                                                file,
                                                            }))
                                                        }
                                                        accept={{
                                                            'application/pdf': ['.pdf'],
                                                            'application/msword': ['.doc'],
                                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                                            'image/*': ['.jpeg', '.jpg', '.png'],
                                                        }}
                                                        maxSize={10 * 1024 * 1024} // 10MB
                                                        placeholder={t('student_records.documents.dropzone_placeholder')}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="doc-description">{t('student_records.documents.description')} (Optional)</Label>
                                                    <Textarea
                                                        id="doc-description"
                                                        value={newDocument.description}
                                                        onChange={(e) => setNewDocument((prev) => ({ ...prev, description: e.target.value }))}
                                                        placeholder={t('student_records.documents.description_placeholder')}
                                                        rows={2}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => handleSubmitRecord('document', newDocument)}
                                                    disabled={!newDocument.title || !newDocument.document_type || !newDocument.file || isSubmitting}
                                                    size="sm"
                                                >
                                                    <Upload className="mr-1 h-4 w-4" />
                                                    {t('student_records.documents.upload_file')}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="space-y-3">
                                        {student.documents?.map((document) => (
                                            <Card
                                                key={document.id}
                                                className="cursor-pointer p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                onClick={() => handlePreviewFile(document)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-1 gap-3">
                                                        <div className="flex-shrink-0">
                                                            <FileIcon fileName={document.file_name || document.title} className="h-8 w-8" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <h5 className="truncate text-sm font-medium">{document.title}</h5>
                                                                <Badge variant="outline" className="text-xs uppercase">
                                                                    {getFileExtension(document.file_name || document.title)}
                                                                </Badge>
                                                            </div>
                                                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                                                {t('student_records.documents.uploaded')}: {document.uploaded_at}
                                                                {document.file_size && ` • ${(document.file_size / 1024 / 1024).toFixed(1)} MB`}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePreviewFile(document);
                                                                    }}
                                                                >
                                                                    <Eye className="mr-1 h-3 w-3" />
                                                                    {t('student_records.documents.view')}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(
                                                                            route('teacher.students.documents.download', [student.id, document.id]),
                                                                            '_blank',
                                                                        );
                                                                    }}
                                                                >
                                                                    {t('student_records.documents.download')}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteRecord('document', document.id, document.title);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        )) || (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('student_records.documents.no_documents')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Achievements Section */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-purple-700 dark:text-purple-400">
                                        {t('student_records.documents.achievements')}
                                    </h4>
                                    {isEdit && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">{t('student_records.documents.add_achievement')}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label htmlFor="achievement-type">{t('student_records.documents.achievement_type')} *</Label>
                                                        <Select
                                                            value={newAchievement.achievement_type}
                                                            onValueChange={(value) =>
                                                                setNewAchievement((prev) => ({ ...prev, achievement_type: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('student_records.common.select_option')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {recordOptions.achievement_types &&
                                                                    Object.entries(recordOptions.achievement_types).map(([key]) => (
                                                                        <SelectItem key={key} value={key}>
                                                                            {t(`student_records.documents.achievement_types.${key}`)}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="achievement-level">{t('student_records.documents.level')} *</Label>
                                                        <Select
                                                            value={newAchievement.level}
                                                            onValueChange={(value) => setNewAchievement((prev) => ({ ...prev, level: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('student_records.common.select_option')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {recordOptions.achievement_levels &&
                                                                    Object.entries(recordOptions.achievement_levels).map(([key]) => (
                                                                        <SelectItem key={key} value={key}>
                                                                            {t(`student_records.documents.achievement_levels.${key}`)}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="achievement-name">{t('student_records.documents.achievement_name')} *</Label>
                                                    <Input
                                                        id="achievement-name"
                                                        value={newAchievement.achievement_name}
                                                        onChange={(e) => setNewAchievement((prev) => ({ ...prev, achievement_name: e.target.value }))}
                                                        placeholder={t('student_records.documents.achievement_name_placeholder')}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label htmlFor="achievement-date">{t('student_records.documents.date_achieved')} *</Label>
                                                        <Input
                                                            id="achievement-date"
                                                            type="date"
                                                            value={newAchievement.date_achieved}
                                                            onChange={(e) =>
                                                                setNewAchievement((prev) => ({ ...prev, date_achieved: e.target.value }))
                                                            }
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="achievement-score">{t('student_records.documents.score_value')}</Label>
                                                        <Input
                                                            id="achievement-score"
                                                            type="number"
                                                            step="0.01"
                                                            value={newAchievement.score_value}
                                                            onChange={(e) => setNewAchievement((prev) => ({ ...prev, score_value: e.target.value }))}
                                                            placeholder={t('student_records.documents.score_placeholder')}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="achievement-organization">
                                                        {t('student_records.documents.issuing_organization')}
                                                    </Label>
                                                    <Input
                                                        id="achievement-organization"
                                                        value={newAchievement.issuing_organization}
                                                        onChange={(e) =>
                                                            setNewAchievement((prev) => ({ ...prev, issuing_organization: e.target.value }))
                                                        }
                                                        placeholder={t('student_records.documents.issuing_organization_placeholder')}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="achievement-description">{t('student_records.documents.description')}</Label>
                                                    <Textarea
                                                        id="achievement-description"
                                                        value={newAchievement.description}
                                                        onChange={(e) => setNewAchievement((prev) => ({ ...prev, description: e.target.value }))}
                                                        placeholder={t('student_records.documents.description_placeholder')}
                                                        rows={3}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="achievement-criteria">{t('student_records.documents.criteria_met')}</Label>
                                                    <Textarea
                                                        id="achievement-criteria"
                                                        value={newAchievement.criteria_met}
                                                        onChange={(e) => setNewAchievement((prev) => ({ ...prev, criteria_met: e.target.value }))}
                                                        placeholder={t('student_records.documents.criteria_met_placeholder')}
                                                        rows={2}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => handleSubmitRecord('achievement', newAchievement)}
                                                    disabled={
                                                        isSubmitting ||
                                                        !newAchievement.achievement_type ||
                                                        !newAchievement.achievement_name ||
                                                        !newAchievement.date_achieved
                                                    }
                                                    className="w-full"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    {t('student_records.documents.add_achievement')}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="space-y-3">
                                        <h4 className="font-medium">{t('student_records.documents.achievements')}</h4>
                                        {student.achievements && student.achievements.length > 0 ? (
                                            student.achievements.map((achievement) => {
                                                const getTypeDisplayName = (type: string) => {
                                                    return t(`student_records.documents.achievement_types.${type}`) || type;
                                                };

                                                const getLevelDisplayName = (level: string) => {
                                                    return t(`student_records.documents.achievement_levels.${level}`) || level;
                                                };

                                                return (
                                                    <Card key={achievement.id} className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <h5 className="font-medium">{achievement.achievement_name}</h5>
                                                                    <Badge variant="outline">{getLevelDisplayName(achievement.level)}</Badge>
                                                                </div>
                                                                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <strong>{t('student_records.documents.type')}:</strong>{' '}
                                                                    {getTypeDisplayName(achievement.achievement_type)}
                                                                </p>
                                                                {achievement.description && (
                                                                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        <strong>{t('student_records.documents.description')}:</strong>{' '}
                                                                        {achievement.description}
                                                                    </p>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                    <p>
                                                                        <strong>{t('student_records.documents.date')}:</strong>{' '}
                                                                        {new Date(achievement.date_achieved).toLocaleDateString()}
                                                                    </p>
                                                                    {achievement.score_value && (
                                                                        <p>
                                                                            <strong>{t('student_records.documents.score')}:</strong>{' '}
                                                                            {achievement.score_value}
                                                                        </p>
                                                                    )}
                                                                    {achievement.issuing_organization && (
                                                                        <p>
                                                                            <strong>{t('student_records.documents.organization')}:</strong>{' '}
                                                                            {achievement.issuing_organization}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isEdit && (
                                                                <div className="ml-2 flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setDeleteDialog({
                                                                                isOpen: true,
                                                                                type: 'achievements',
                                                                                id: achievement.id,
                                                                                itemName: achievement.achievement_name,
                                                                                itemType: 'achievement',
                                                                            })
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t('student_records.documents.no_achievements')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* File Preview Dialog */}
            {previewFile && (
                <FilePreviewDialog
                    file={previewFile}
                    isOpen={isPreviewOpen}
                    onClose={() => {
                        setIsPreviewOpen(false);
                        setPreviewFile(null);
                    }}
                    allowDownload={true}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, isOpen: open }))}
                itemName={deleteDialog.itemName}
                itemType={deleteDialog.itemType}
                onConfirm={confirmDeleteRecord}
            />
        </>
    );
}
