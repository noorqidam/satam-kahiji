import { STAFF_DIVISIONS, type StaffDivision } from '@/types/staff';

export { STAFF_DIVISIONS };

export const availableDivisions: StaffDivision[] = Object.values(STAFF_DIVISIONS);

export const divisionLabels: Record<StaffDivision, string> = {
    [STAFF_DIVISIONS.SYSTEM_ADMIN]: 'Administrasi Sistem',
    [STAFF_DIVISIONS.HEADMASTER]: 'Kepala Sekolah',
    [STAFF_DIVISIONS.DEPUTY_HEADMASTER]: 'Wakil Kepala Sekolah',
    [STAFF_DIVISIONS.ACADEMIC]: 'Akademik',
    [STAFF_DIVISIONS.PUBLIC_RELATIONS]: 'Hubungan Masyarakat',
    [STAFF_DIVISIONS.ADMINISTRATION]: 'Tata Usaha',
};

export const divisionColors: Record<StaffDivision, string> = {
    [STAFF_DIVISIONS.SYSTEM_ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [STAFF_DIVISIONS.HEADMASTER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    [STAFF_DIVISIONS.DEPUTY_HEADMASTER]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    [STAFF_DIVISIONS.ACADEMIC]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [STAFF_DIVISIONS.PUBLIC_RELATIONS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [STAFF_DIVISIONS.ADMINISTRATION]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export const getDivisionLabel = (division: StaffDivision): string => {
    return divisionLabels[division] || division;
};

export const getDivisionColor = (division: StaffDivision): string => {
    return divisionColors[division] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};
