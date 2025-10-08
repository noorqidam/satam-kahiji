import type { Student } from './student';

export interface TeacherStudent extends Student {
    average_grade: number;
    total_grades: number;
    extracurriculars_count: number;
}
