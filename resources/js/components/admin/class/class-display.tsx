import { ClassCard } from '@/components/admin/class/class-card';
import { ClassTable } from '@/components/admin/class/class-table';
import type { SchoolClass } from '@/types/class';

interface ClassDisplayProps {
    gradeClasses: SchoolClass[];
    selectedClasses: number[];
    gradeLevel: string;
    view: 'card' | 'table';
    onToggleSelection: (classId: number) => void;
    onToggleGradeSelection: (gradeClassIds: number[]) => void;
    onDelete: (classId: number, className: string) => void;
}

export function ClassDisplay({
    gradeClasses,
    selectedClasses,
    view,
    onToggleSelection,
    onDelete,
}: Omit<ClassDisplayProps, 'gradeLevel' | 'onToggleGradeSelection'>) {
    if (view === 'table') {
        return <ClassTable gradeClasses={gradeClasses} selectedClasses={selectedClasses} onToggleSelection={onToggleSelection} onDelete={onDelete} />;
    }

    // Card view - wrap in container to match table styling
    return (
        <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
                {gradeClasses.map((schoolClass) => (
                    <ClassCard
                        key={schoolClass.id}
                        schoolClass={schoolClass}
                        isSelected={selectedClasses.includes(schoolClass.id)}
                        onToggleSelection={onToggleSelection}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
