import type { UserRole } from '@/constants/roles';
import type { BaseFilterState, FormDataValue, FormErrors, PaginationData } from '@/types/common';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface CreateUserForm {
    name: string;
    email: string;
    role: UserRole;
    password: string;
    password_confirmation: string;
    [key: string]: FormDataValue;
}

export interface EditUserForm {
    name: string;
    email: string;
    role: UserRole;
    password: string;
    password_confirmation: string;
    [key: string]: FormDataValue;
}

export interface UserFilters extends BaseFilterState {
    roles: UserRole[];
}

// Use the generic pagination type
export type UsersResponse = PaginationData<User>;

// Use the generic form errors type
export type UserFormErrors = FormErrors;

export interface BulkDeleteRequest {
    user_ids: number[];
    [key: string]: FormDataValue;
}
