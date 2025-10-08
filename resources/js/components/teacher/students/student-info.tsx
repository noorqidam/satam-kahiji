import type { Student } from '@/types/student';

interface StudentInfoProps {
    student: Student;
}

export const StudentInfo = ({ student }: StudentInfoProps) => (
    <div className="min-w-0">
        <div className="truncate font-medium">{student.name}</div>
        <div className="text-xs text-gray-500 sm:hidden">NISN: {student.nisn}</div>
        <div className="text-xs text-gray-500 capitalize md:hidden">{student.gender}</div>
    </div>
);
