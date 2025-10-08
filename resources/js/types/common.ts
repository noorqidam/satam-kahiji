// Common type definitions to eliminate duplication across the application
// Following DRY principle and Single Responsibility Principle

/**
 * Generic pagination interface
 * Used across all paginated data responses
 */
export interface PaginationData<T = any> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Generic form data value type
 * Replaces scattered FormDataValue definitions
 */
export type FormDataValue = string | number | boolean | File | null | undefined | number[] | string[];

/**
 * Generic API response wrapper
 * Standardizes all API responses
 */
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: 'success' | 'error';
}

/**
 * Generic filter state interface
 * Abstracts common filtering patterns
 */
export interface BaseFilterState {
    search: string;
    per_page: number;
    sort_field?: string;
    sort_direction?: 'asc' | 'desc';
}

/**
 * Generic bulk operation interface
 * Standardizes bulk action handling
 */
export interface BulkOperationState {
    selectedItems: number[];
    isAllSelected: boolean;
    operation: string | null;
    isProcessing: boolean;
}

/**
 * Common form error interface
 * Replaces duplicate error handling types
 */
export interface FormErrors {
    [key: string]: string[];
}

/**
 * Generic confirmation dialog props
 * Unifies all confirmation dialog implementations
 */
export interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    isLoading?: boolean;
}

/**
 * Generic table action button props
 * Standardizes action button implementations
 */
export interface TableActionProps {
    item: any;
    onView?: (item: any) => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    customActions?: Array<{
        label: string;
        icon: React.ComponentType<any>;
        onClick: (item: any) => void;
        variant?: 'default' | 'destructive' | 'outline';
    }>;
}

/**
 * Generic filter hook return type
 * Abstracts filter hook implementations
 */
export interface FilterHookReturn<T extends BaseFilterState> {
    filters: T;
    updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
    resetFilters: () => void;
    bulkOperations: BulkOperationState;
    updateBulkOperation: <K extends keyof BulkOperationState>(key: K, value: BulkOperationState[K]) => void;
    debouncedSearch: string;
}

/**
 * Generic service interface
 * Defines common CRUD operations
 */
export interface BaseService<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
    getAll: (filters?: Record<string, any>) => Promise<PaginationData<T>>;
    getById: (id: number) => Promise<T>;
    create: (data: CreateData) => Promise<T>;
    update: (id: number, data: UpdateData) => Promise<T>;
    delete: (id: number) => Promise<void>;
    bulkDelete?: (ids: number[]) => Promise<void>;
}

/**
 * Generic search and filter props
 * Standardizes search/filter component interfaces
 */
export interface SearchFilterProps<T extends BaseFilterState> {
    filters: T;
    onFilterChange: <K extends keyof T>(key: K, value: T[K]) => void;
    onResetFilters: () => void;
    placeholder?: string;
    additionalFilters?: React.ReactNode;
}

/**
 * Generic status badge props
 * Unifies status display components
 */
export interface StatusBadgeProps {
    status: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    colorMap?: Record<string, string>;
}

/**
 * Generic modal props
 * Standardizes modal implementations
 */
export interface BaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

/**
 * Generic form field props
 * Abstracts common form field patterns
 */
export interface FormFieldProps {
    label: string;
    name: string;
    required?: boolean;
    error?: string;
    description?: string;
    icon?: React.ComponentType<any>;
}

/**
 * File upload types
 * Standardizes file handling
 */
export interface FileUploadProps {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    onUpload: (files: File[]) => void;
    onError?: (error: string) => void;
    preview?: boolean;
}

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    preview?: string;
}
