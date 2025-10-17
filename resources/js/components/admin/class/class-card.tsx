import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SchoolClass } from '@/types/class';

interface ClassCardProps {
    schoolClass: SchoolClass;
    isSelected: boolean;
    onToggleSelection: (classId: number) => void;
    onDelete: (classId: number, className: string) => void;
}

export const ClassCard = memo(function ClassCard({ schoolClass, isSelected, onToggleSelection, onDelete }: ClassCardProps) {
    const { t } = useTranslation();
    return (
        <Card>
            <CardContent className="p-3 sm:p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelection(schoolClass.id)}
                                className="flex-shrink-0 rounded"
                            />
                            <h3 className="truncate text-base font-medium sm:text-lg">{schoolClass.name}</h3>
                        </div>
                        <div className="flex flex-col gap-1 sm:flex-row">
                            {schoolClass.is_full && (
                                <Badge variant="destructive" className="text-xs">
                                    {t('classes_management.table.full')}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                        <p>
                            {t('classes_management.table.capacity')}: {schoolClass.student_count}/{schoolClass.capacity}
                        </p>
                        <p>{t('classes_management.table.available')}: {schoolClass.available_capacity} {t('classes_management.table.slots')}</p>
                        {schoolClass.homeroom_teacher ? (
                            <p className="truncate">{t('classes_management.table.teacher')}: {schoolClass.homeroom_teacher.name}</p>
                        ) : (
                            <p className="text-orange-600">{t('classes_management.table.no_teacher_assigned')}</p>
                        )}
                        {schoolClass.description && <p className="line-clamp-2 text-xs italic">{schoolClass.description}</p>}
                    </div>

                    <div className="flex gap-1">
                        <Link href={route('admin.classes.show', schoolClass.id)} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full px-2 text-xs">
                                <Eye className="mr-1 h-3 w-3" />
                                <span className="hidden xs:inline">{t('classes_management.table.view')}</span>
                            </Button>
                        </Link>
                        <Link href={route('admin.classes.edit', schoolClass.id)} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full px-2 text-xs">
                                <Edit className="mr-1 h-3 w-3" />
                                <span className="hidden xs:inline">{t('classes_management.table.edit')}</span>
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(schoolClass.id, schoolClass.name)}
                            className="flex-1 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Trash2 className="mr-1 h-3 w-3" />
                            <span className="hidden xs:inline">{t('classes_management.table.delete')}</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
