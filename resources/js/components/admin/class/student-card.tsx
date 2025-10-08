import { User } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import type { Student } from '@/types/class';
import { getStatusBadgeVariant } from '@/utils/class-utils';

interface StudentCardProps {
    student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const shouldShowDefaultAvatar = (photo: string | null) => {
        if (!photo || photo.trim() === '') {
            return true;
        }
        return imageError;
    };

    return (
        <div className="rounded-lg border border-gray-200 p-3 transition-shadow hover:shadow-sm dark:border-gray-700">
            <div className="flex items-start gap-2">
                {shouldShowDefaultAvatar(student.photo) ? (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                        <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                ) : (
                    <img
                        src={student.photo || ''}
                        alt={student.name}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        onError={handleImageError}
                    />
                )}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-medium">{student.name}</h3>
                            <p className="truncate text-xs text-gray-600 dark:text-gray-400">NISN: {student.nisn}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(student.status)} className="ml-1 px-1 py-0 text-xs">
                            {student.status}
                        </Badge>
                    </div>

                    <div className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                            <span>Gender:</span>
                            <span className="font-medium">{student.gender}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Entry:</span>
                            <span className="font-medium">{student.entry_year}</span>
                        </div>
                        {student.graduation_year && (
                            <div className="flex justify-between">
                                <span>Graduation:</span>
                                <span className="font-medium">{student.graduation_year}</span>
                            </div>
                        )}
                        {student.average_grade > 0 && (
                            <div className="flex justify-between">
                                <span>Avg. Grade:</span>
                                <span className="font-medium text-blue-600">{student.average_grade}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
