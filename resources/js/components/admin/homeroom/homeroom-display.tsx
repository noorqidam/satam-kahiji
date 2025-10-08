import { HomeroomTable } from '@/components/admin/homeroom/homeroom-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Teacher {
    id: number;
    name: string;
    position: string;
    division: string;
    homeroom_class: string | null;
    homeroom_students_count: number;
    user_email: string | null;
}

interface ClassStat {
    class: string;
    student_count: number;
    assigned_teacher: Teacher | null;
    has_teacher: boolean;
}

interface HomeroomDisplayProps {
    classStats: ClassStat[];
    view: 'card' | 'table';
    onRemoveAssignment: (teacherId: number, teacherName: string, className: string) => void;
}

export function HomeroomDisplay({ classStats, view, onRemoveAssignment }: HomeroomDisplayProps) {
    const { t } = useTranslation();
    
    if (view === 'table') {
        return <HomeroomTable classStats={classStats} onRemoveAssignment={onRemoveAssignment} />;
    }

    // Card view (original implementation)
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classStats.map((classStat) => (
                <Card key={classStat.class}>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">{classStat.class}</h3>
                                <Badge variant={classStat.has_teacher ? 'default' : 'destructive'}>
                                    {classStat.has_teacher ? t('homeroom_management.table.status.assigned') : t('homeroom_management.table.status.unassigned')}
                                </Badge>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>{t('homeroom_management.table.columns.students')}: {classStat.student_count}</p>
                                {classStat.assigned_teacher ? (
                                    <p>{t('homeroom_management.table.teacher_label')}: {classStat.assigned_teacher.name}</p>
                                ) : (
                                    <p className="text-red-600">{t('homeroom_management.table.no_teacher_assigned')}</p>
                                )}
                            </div>

                            {classStat.assigned_teacher && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            onRemoveAssignment(classStat.assigned_teacher!.id, classStat.assigned_teacher!.name, classStat.class)
                                        }
                                        className="flex-1"
                                    >
                                        <Trash2 className="mr-1 h-3 w-3" />
                                        {t('homeroom_management.table.remove')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
