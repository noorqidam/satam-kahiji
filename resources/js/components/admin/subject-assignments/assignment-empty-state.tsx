import { type SubjectAssignmentData } from '@/hooks/use-subject-assignment-data';
import { Users } from 'lucide-react';

interface AssignmentEmptyStateProps {
    data: SubjectAssignmentData;
}

export function AssignmentEmptyState({ data }: AssignmentEmptyStateProps) {
    if (data.staff.data.length > 0 && data.subjects.data.length > 0) {
        return null;
    }

    return (
        <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                {data.staff.data.length === 0 ? 'No staff members found' : 'No subjects found'}
            </h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
                {data.staff.data.length === 0
                    ? 'Create staff members first to manage subject assignments.'
                    : 'Create subjects first to assign them to staff.'}
            </p>
        </div>
    );
}
