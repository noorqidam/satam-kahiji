import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Award, BookOpen, FileText, MessageSquare, Plus, Shield, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DisciplinaryRecordForm, PositiveNoteForm, StudentRecordsProps } from '@/types/student-records';

export default function StudentRecords({ student, records }: StudentRecordsProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'notes' | 'disciplinary' | 'extracurricular' | 'documents' | 'certificates'>('notes');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [positiveNoteForm, setPositiveNoteForm] = useState<PositiveNoteForm>({ note: '', category: '' });
    const [disciplinaryForm, setDisciplinaryForm] = useState<DisciplinaryRecordForm>({
        incident_description: '',
        action_taken: '',
        severity: 'low',
        incident_date: new Date().toISOString().split('T')[0],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
        { title: 'My Students', href: '/teacher/students' },
        { title: student.name, href: `/teacher/students/${student.id}` },
        { title: 'Records', href: `/teacher/students/${student.id}/records` },
    ];

    const handleSubmitPositiveNote = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);

            router.post(route('teacher.students.positive-notes.store', student.id), JSON.parse(JSON.stringify(positiveNoteForm)), {
                onSuccess: () => {
                    toast({ title: 'Success', description: 'Positive note added successfully', variant: 'success' });
                    setPositiveNoteForm({ note: '', category: '' });
                },
                onError: () => {
                    toast({ title: 'Error', description: 'Failed to add positive note', variant: 'destructive' });
                },
                onFinish: () => setIsSubmitting(false),
            });
        },
        [positiveNoteForm, student.id, toast],
    );

    const handleSubmitDisciplinary = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);

            router.post(route('teacher.students.disciplinary-records.store', student.id), JSON.parse(JSON.stringify(disciplinaryForm)), {
                onSuccess: () => {
                    toast({ title: 'Success', description: 'Disciplinary record added successfully', variant: 'success' });
                    setDisciplinaryForm({
                        incident_description: '',
                        action_taken: '',
                        severity: 'low',
                        incident_date: new Date().toISOString().split('T')[0],
                    });
                },
                onError: () => {
                    toast({ title: 'Error', description: 'Failed to add disciplinary record', variant: 'destructive' });
                },
                onFinish: () => setIsSubmitting(false),
            });
        },
        [disciplinaryForm, student.id, toast],
    );

    const handleDeleteRecord = useCallback(
        (type: string, id: number) => {
            if (!confirm('Are you sure you want to delete this record?')) return;

            let routeName = '';
            switch (type) {
                case 'positive-note':
                    routeName = 'teacher.students.positive-notes.destroy';
                    break;
                case 'disciplinary':
                    routeName = 'teacher.students.disciplinary-records.destroy';
                    break;
                case 'document':
                    routeName = 'teacher.students.documents.destroy';
                    break;
                case 'extracurricular':
                    routeName = 'teacher.students.extracurricular-history.destroy';
                    break;
            }

            router.delete(route(routeName, [student.id, id]), {
                onSuccess: () => {
                    toast({ title: 'Success', description: 'Record deleted successfully', variant: 'success' });
                },
                onError: () => {
                    toast({ title: 'Error', description: 'Failed to delete record', variant: 'destructive' });
                },
            });
        },
        [student.id, toast],
    );

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${student.name} - Records`} />

            <div className="space-y-6 px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('teacher.students.show', student.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Student
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            {student.photo && <img src={student.photo} alt={student.name} className="h-12 w-12 rounded-full object-cover" />}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{student.name}</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    NISN: {student.nisn} • Class: {student.class}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { key: 'notes', label: 'Positive Notes', icon: MessageSquare, count: records.positive_notes.length },
                            { key: 'disciplinary', label: 'Disciplinary Records', icon: Shield, count: records.disciplinary_records.length },
                            {
                                key: 'extracurricular',
                                label: 'Extracurricular History',
                                icon: BookOpen,
                                count: records.extracurricular_history.length,
                            },
                            { key: 'documents', label: 'Documents', icon: FileText, count: records.documents.length },
                            { key: 'certificates', label: 'Certificates', icon: Award, count: 0 },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as 'notes' | 'disciplinary' | 'extracurricular' | 'documents' | 'certificates')}
                                className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'border-primary text-primary dark:border-primary dark:text-primary'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                <Badge variant="secondary" className="ml-1">
                                    {tab.count}
                                </Badge>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Positive Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Add Positive Note</span>
                                        <MessageSquare className="h-5 w-5" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitPositiveNote} className="space-y-4">
                                        <div>
                                            <Label htmlFor="note">Note</Label>
                                            <Textarea
                                                id="note"
                                                value={positiveNoteForm.note}
                                                onChange={(e) => setPositiveNoteForm((prev) => ({ ...prev, note: e.target.value }))}
                                                placeholder="Enter positive note about the student..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Category (Optional)</Label>
                                            <Input
                                                id="category"
                                                value={positiveNoteForm.category}
                                                onChange={(e) => setPositiveNoteForm((prev) => ({ ...prev, category: e.target.value }))}
                                                placeholder="e.g., Academic Excellence, Leadership, Teamwork"
                                            />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Note
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                {records.positive_notes.map((note) => (
                                    <Card key={note.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-gray-900 dark:text-gray-100">{note.note}</p>
                                                    {note.category && (
                                                        <Badge variant="outline" className="mt-2">
                                                            {note.category}
                                                        </Badge>
                                                    )}
                                                    <p className="mt-2 text-sm text-gray-500">
                                                        By {note.staff_name} • {note.created_at}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord('positive-note', note.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {records.positive_notes.length === 0 && (
                                    <Card>
                                        <CardContent className="pt-6 text-center text-gray-500">No positive notes recorded yet.</CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Disciplinary Records Tab */}
                    {activeTab === 'disciplinary' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Add Disciplinary Record</span>
                                        <Shield className="h-5 w-5" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitDisciplinary} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="incident_date">Incident Date</Label>
                                                <Input
                                                    id="incident_date"
                                                    type="date"
                                                    value={disciplinaryForm.incident_date}
                                                    onChange={(e) => setDisciplinaryForm((prev) => ({ ...prev, incident_date: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="severity">Severity</Label>
                                                <Select
                                                    value={disciplinaryForm.severity}
                                                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') =>
                                                        setDisciplinaryForm((prev) => ({ ...prev, severity: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="critical">Critical</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="incident_description">Incident Description</Label>
                                            <Textarea
                                                id="incident_description"
                                                value={disciplinaryForm.incident_description}
                                                onChange={(e) => setDisciplinaryForm((prev) => ({ ...prev, incident_description: e.target.value }))}
                                                placeholder="Describe what happened..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="action_taken">Action Taken</Label>
                                            <Textarea
                                                id="action_taken"
                                                value={disciplinaryForm.action_taken}
                                                onChange={(e) => setDisciplinaryForm((prev) => ({ ...prev, action_taken: e.target.value }))}
                                                placeholder="Describe the action taken..."
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={isSubmitting}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Record
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                {records.disciplinary_records.map((record) => (
                                    <Card key={record.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center space-x-2">
                                                        <Badge className={getSeverityColor(record.severity)}>{record.severity.toUpperCase()}</Badge>
                                                        <span className="text-sm text-gray-500">{record.incident_date}</span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Incident Description</h4>
                                                    <p className="mb-3 text-gray-700 dark:text-gray-300">{record.incident_description}</p>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Action Taken</h4>
                                                    <p className="mb-3 text-gray-700 dark:text-gray-300">{record.action_taken}</p>
                                                    <p className="text-sm text-gray-500">
                                                        By {record.staff_name} • {record.created_at}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord('disciplinary', record.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {records.disciplinary_records.length === 0 && (
                                    <Card>
                                        <CardContent className="pt-6 text-center text-gray-500">No disciplinary records found. Great!</CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Other tabs would continue here with similar patterns... */}
                </div>
            </div>
        </AppLayout>
    );
}
