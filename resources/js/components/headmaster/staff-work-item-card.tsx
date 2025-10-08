import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeacherWithUser } from '@/types/teacher';
import { Link } from '@inertiajs/react';
import { Eye, MessageSquare, User } from 'lucide-react';

interface StaffWorkItemCardProps {
    teacher: TeacherWithUser;
    selectedWorkItem?: number | null;
    getStatusBadge: (status: string) => React.JSX.Element;
}

export function StaffWorkItemCard({ teacher, selectedWorkItem, getStatusBadge }: StaffWorkItemCardProps) {
    // Filter work items based on selected work item
    const filteredWorks = selectedWorkItem
        ? teacher.teacher_subject_works.filter((work) => work.work_item.id === selectedWorkItem)
        : teacher.teacher_subject_works;

    // Calculate statistics for this teacher
    const totalFiles = filteredWorks.reduce((sum, work) => sum + work.files.length, 0);
    const filesWithFeedback = filteredWorks.reduce((sum, work) => sum + work.files.filter((file) => file.latest_feedback).length, 0);
    const approvedFiles = filteredWorks.reduce(
        (sum, work) => sum + work.files.filter((file) => file.latest_feedback?.status === 'approved').length,
        0,
    );
    const needsRevisionFiles = filteredWorks.reduce(
        (sum, work) => sum + work.files.filter((file) => file.latest_feedback?.status === 'needs_revision').length,
        0,
    );

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <div>
                        <p className="font-semibold">{teacher.user.name}</p>
                        <p className="text-sm font-normal text-gray-500">{teacher.user.email}</p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Subjects */}
                <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                        <Badge key={subject.id} variant="outline" className="text-xs">
                            {subject.code}
                        </Badge>
                    ))}
                </div>
                <h4 className="mb-2 text-sm font-medium">Subjects: {teacher.subjects.map((subject) => subject.name).join(', ')}</h4>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{totalFiles}</p>
                        <p className="text-gray-500">Files Uploaded</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{approvedFiles}</p>
                        <p className="text-gray-500">Approved</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{filesWithFeedback - approvedFiles - needsRevisionFiles}</p>
                        <p className="text-gray-500">Pending</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{needsRevisionFiles}</p>
                        <p className="text-gray-500">Needs Revision</p>
                    </div>
                </div>

                {/* Recent Work Items */}
                <div>
                    <h4 className="mb-2 text-sm font-medium">Recent Submissions:</h4>
                    <div className="max-h-32 space-y-2 overflow-y-auto">
                        {filteredWorks.slice(0, 3).map((work) => (
                            <div key={work.id} className="text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{work.work_item.name}</span>
                                    <span className="text-gray-500">({work.files.length} files)</span>
                                </div>
                                <div className="mt-1 flex items-center gap-1">
                                    <span className="text-gray-500">{work.subject.name}</span>
                                    {work.files.length > 0 && work.files[0].latest_feedback && getStatusBadge(work.files[0].latest_feedback.status)}
                                </div>
                            </div>
                        ))}
                        {filteredWorks.length > 3 && <p className="text-xs text-gray-500">+{filteredWorks.length - 3} more work items</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                        <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                            <Eye className="mr-1 h-4 w-4" />
                            View Details
                        </Link>
                    </Button>
                    {totalFiles > 0 && (
                        <Button asChild size="sm" variant="outline" className="flex-1">
                            <Link href={route('headmaster.staff-overview.show', teacher.id)}>
                                <MessageSquare className="mr-1 h-4 w-4" />
                                Provide Feedback
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
