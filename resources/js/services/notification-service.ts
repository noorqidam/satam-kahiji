// Single Responsibility: Notification interface
export interface NotificationService {
    showSuccess(message: string): void;
    showError(message: string): void;
}

// Interface Segregation: Toast configuration
export interface ToastConfig {
    title: string;
    description: string;
    variant: 'success' | 'destructive' | 'default';
}

// Dependency Inversion: Toast function type
export type ToastFunction = (config: ToastConfig) => void;

// Single Responsibility: Toast-based notification service
export class ToastNotificationService implements NotificationService {
    constructor(private toast: ToastFunction) {}

    showSuccess(message: string): void {
        this.toast({
            title: 'Success',
            description: message,
            variant: 'success',
        });
    }

    showError(message: string): void {
        this.toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
        });
    }
}

// Factory for creating notification service
export const createNotificationService = (toast: ToastFunction): NotificationService => {
    return new ToastNotificationService(toast);
};
