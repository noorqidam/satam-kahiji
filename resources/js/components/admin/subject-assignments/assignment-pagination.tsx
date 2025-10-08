import { Pagination } from '@/components/ui/pagination';
import { type SubjectAssignmentData } from '@/hooks/use-subject-assignment-data';

interface AssignmentPaginationProps {
    data: SubjectAssignmentData;
}

export function AssignmentPagination({ data }: AssignmentPaginationProps) {
    return (
        <div className="mt-6 space-y-4">
            {data.staff.last_page > 1 && (
                <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Staff Pages</h4>
                    <Pagination data={data.staff} />
                </div>
            )}

            {data.subjects.last_page > 1 && (
                <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">Subject Pages</h4>
                    <Pagination data={data.subjects} />
                </div>
            )}
        </div>
    );
}
