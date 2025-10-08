import { Checkbox } from '@/components/ui/checkbox';
import { type SubjectAssignmentData } from '@/hooks/use-subject-assignment-data';
import { BookOpen, Users } from 'lucide-react';

interface AssignmentMatrixTableProps {
    data: SubjectAssignmentData;
    assignments: Record<number, Record<number, boolean>>;
    onToggleAssignment: (staffId: number, subjectId: number) => void;
    getStaffAssignmentCount: (staffId: number) => number;
    getSubjectAssignmentCount: (subjectId: number) => number;
}

export function AssignmentMatrixTable({
    data,
    assignments,
    onToggleAssignment,
    getStaffAssignmentCount,
    getSubjectAssignmentCount,
}: AssignmentMatrixTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="sticky left-0 bg-white p-3 text-left dark:bg-gray-900">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">Staff</span>
                            </div>
                        </th>
                        {data.subjects.data.map((subject) => (
                            <th key={subject.id} className="min-w-[120px] p-3 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            <span className="text-xs font-medium">{subject.name}</span>
                                        </div>
                                        {subject.code && <span className="text-xs text-gray-500">{subject.code}</span>}
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                            ({getSubjectAssignmentCount(subject.id)} assigned)
                                        </span>
                                    </div>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.staff.data.map((staffMember) => (
                        <tr key={staffMember.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="sticky left-0 bg-white p-3 dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{staffMember.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{staffMember.position}</div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                            {getStaffAssignmentCount(staffMember.id)} subjects
                                        </div>
                                    </div>
                                </div>
                            </td>
                            {data.subjects.data.map((subject) => (
                                <td key={subject.id} className="p-3 text-center">
                                    <div className="flex justify-center">
                                        <Checkbox
                                            checked={assignments[staffMember.id]?.[subject.id] || false}
                                            onCheckedChange={() => onToggleAssignment(staffMember.id, subject.id)}
                                        />
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
