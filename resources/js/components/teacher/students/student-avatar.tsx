import { User } from 'lucide-react';
import { useCallback } from 'react';

import type { Student } from '@/types/student';

interface StudentAvatarProps {
    student: Student;
    shouldShowDefaultAvatar: (photo: string | null) => boolean;
    onImageError: (photo: string) => void;
}

export const StudentAvatar = ({ student, shouldShowDefaultAvatar, onImageError }: StudentAvatarProps) => {
    const handleImageError = useCallback(() => {
        if (student.photo) {
            onImageError(student.photo);
        }
    }, [student.photo, onImageError]);

    return shouldShowDefaultAvatar(student.photo) ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
    ) : (
        <img src={student.photo || ''} alt={student.name} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" onError={handleImageError} />
    );
};
