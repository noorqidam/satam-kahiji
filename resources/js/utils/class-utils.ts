export const GRADE_LEVELS = [
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
] as const;

export const CLASS_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

export const getGradeDisplayName = (gradeLevel: string): string => {
    const gradeNames = {
        '7': 'Grade 7',
        '8': 'Grade 8',
        '9': 'Grade 9',
    } as const;
    return gradeNames[gradeLevel as keyof typeof gradeNames] || `Grade ${gradeLevel}`;
};

export const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
        case 'active':
            return 'default';
        case 'graduated':
            return 'secondary';
        case 'transferred':
            return 'outline';
        case 'dropped':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export const generateClassName = (gradeLevel: string, classSection: string): string => {
    return gradeLevel && classSection ? gradeLevel + classSection : '';
};
