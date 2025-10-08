/**
 * User Role Configuration
 *
 * Centralized role management following Single Responsibility Principle
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    HEADMASTER: 'headmaster',
    DEPUTY_HEADMASTER: 'deputy_headmaster',
    TEACHER: 'teacher',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const roleLabels: Record<UserRole, string> = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.HEADMASTER]: 'Kepala Sekolah',
    [ROLES.DEPUTY_HEADMASTER]: 'Wakil Kepala Sekolah',
    [ROLES.TEACHER]: 'Guru',
};

export const roleColors: Record<UserRole, string> = {
    [ROLES.SUPER_ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [ROLES.HEADMASTER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    [ROLES.DEPUTY_HEADMASTER]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    [ROLES.TEACHER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const availableRoles: UserRole[] = Object.values(ROLES);

/**
 * Role utility functions
 */
export const RoleUtils = {
    getLabel: (role: UserRole): string => roleLabels[role] || role,
    getColor: (role: UserRole): string => roleColors[role] || 'bg-gray-100 text-gray-800',
    isValidRole: (role: string): role is UserRole => availableRoles.includes(role as UserRole),
    getAllRoles: (): UserRole[] => availableRoles,
} as const;
