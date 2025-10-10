export interface PaginationData<T = unknown> {
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

export type FormDataValue = string | number | boolean | File | null | undefined | number[] | string[];

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: 'success' | 'error';
}

export interface BaseFilterState {
    search: string;
    per_page: number;
    sort_field?: string;
    sort_direction?: 'asc' | 'desc';
}

export interface BulkOperationState {
    selectedItems: number[];
    isAllSelected: boolean;
    operation: string | null;
    isProcessing: boolean;
}

export interface FormErrors {
    [key: string]: string[];
}

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

export interface TableActionProps<T = unknown> {
    item: T;
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    customActions?: Array<{
        label: string;
        icon: React.ComponentType<Record<string, unknown>>;
        onClick: (item: T) => void;
        variant?: 'default' | 'destructive' | 'outline';
    }>;
}

export interface FilterHookReturn<T extends BaseFilterState> {
    filters: T;
    updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
    resetFilters: () => void;
    bulkOperations: BulkOperationState;
    updateBulkOperation: <K extends keyof BulkOperationState>(key: K, value: BulkOperationState[K]) => void;
    debouncedSearch: string;
}

export interface BaseService<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
    getAll: (filters?: Record<string, unknown>) => Promise<PaginationData<T>>;
    getById: (id: number) => Promise<T>;
    create: (data: CreateData) => Promise<T>;
    update: (id: number, data: UpdateData) => Promise<T>;
    delete: (id: number) => Promise<void>;
    bulkDelete?: (ids: number[]) => Promise<void>;
}

export interface SearchFilterProps<T extends BaseFilterState> {
    filters: T;
    onFilterChange: <K extends keyof T>(key: K, value: T[K]) => void;
    onResetFilters: () => void;
    placeholder?: string;
    additionalFilters?: React.ReactNode;
}

export interface StatusBadgeProps {
    status: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    colorMap?: Record<string, string>;
}

export interface BaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export interface FormFieldProps {
    label: string;
    name: string;
    required?: boolean;
    error?: string;
    description?: string;
    icon?: React.ComponentType<Record<string, unknown>>;
}

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
