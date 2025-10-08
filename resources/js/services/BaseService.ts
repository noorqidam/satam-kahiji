// Base service class following SOLID principles
// Single Responsibility: Handle common CRUD operations
// Open/Closed: Extensible for specific entity needs
// Liskov Substitution: Subclasses can replace base without breaking
// Dependency Inversion: Depends on router abstraction

import type { BaseService, PaginationData } from '@/types/common';
import { router } from '@inertiajs/react';

// Router interface for dependency inversion
interface RouterInterface {
    get: (url: string, data?: any, options?: any) => Promise<any>;
    post: (url: string, data?: any, options?: any) => Promise<any>;
    put: (url: string, data?: any, options?: any) => Promise<any>;
    patch: (url: string, data?: any, options?: any) => Promise<any>;
    delete: (url: string, data?: any, options?: any) => Promise<any>;
}

// Abstract base service class
export abstract class AbstractBaseService<T, CreateData = Partial<T>, UpdateData = Partial<T>> implements BaseService<T, CreateData, UpdateData> {
    protected abstract readonly routePrefix: string;
    protected readonly router: RouterInterface;

    constructor(routerInstance: RouterInterface = router) {
        this.router = routerInstance;
    }

    // Generate route names following Laravel convention
    protected getRouteName(action: 'index' | 'show' | 'store' | 'update' | 'destroy'): string {
        return `${this.routePrefix}.${action}`;
    }

    // Generic error handler
    protected handleError(error: any): never {
        console.error(`${this.routePrefix} service error:`, error);
        throw new Error(error.message || 'An unexpected error occurred');
    }

    // Get all items with optional filters
    async getAll(filters: Record<string, any> = {}): Promise<PaginationData<T>> {
        try {
            return new Promise((resolve, reject) => {
                this.router.get(route(this.getRouteName('index')), filters, {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: (page: any) => {
                        resolve(page.props.data || page.props);
                    },
                    onError: (errors: any) => {
                        reject(new Error('Failed to fetch data'));
                    },
                });
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // Get single item by ID
    async getById(id: number): Promise<T> {
        try {
            return new Promise((resolve, reject) => {
                this.router.get(
                    route(this.getRouteName('show'), id),
                    {},
                    {
                        onSuccess: (page: any) => {
                            resolve(page.props.item || page.props.data);
                        },
                        onError: (errors: any) => {
                            reject(new Error('Failed to fetch item'));
                        },
                    },
                );
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // Create new item
    async create(data: CreateData): Promise<T> {
        try {
            return new Promise((resolve, reject) => {
                this.router.post(route(this.getRouteName('store')), data, {
                    onSuccess: (page: any) => {
                        resolve(page.props.item || page.props.data);
                    },
                    onError: (errors: any) => {
                        reject(new Error('Failed to create item'));
                    },
                });
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // Update existing item
    async update(id: number, data: UpdateData): Promise<T> {
        try {
            return new Promise((resolve, reject) => {
                this.router.patch(route(this.getRouteName('update'), id), data, {
                    onSuccess: (page: any) => {
                        resolve(page.props.item || page.props.data);
                    },
                    onError: (errors: any) => {
                        reject(new Error('Failed to update item'));
                    },
                });
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // Delete item
    async delete(id: number): Promise<void> {
        try {
            return new Promise((resolve, reject) => {
                this.router.delete(
                    route(this.getRouteName('destroy'), id),
                    {},
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors: any) => {
                            reject(new Error('Failed to delete item'));
                        },
                    },
                );
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    // Bulk delete items (optional implementation)
    async bulkDelete(ids: number[]): Promise<void> {
        try {
            return new Promise((resolve, reject) => {
                this.router.delete(
                    route(`${this.routePrefix}.bulk-destroy`),
                    { ids },
                    {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors: any) => {
                            reject(new Error('Failed to delete items'));
                        },
                    },
                );
            });
        } catch (error) {
            this.handleError(error);
        }
    }
}

// Concrete service implementations for specific entities
export class UserService extends AbstractBaseService<any, any, any> {
    protected readonly routePrefix = 'admin.users';
}

export class StaffService extends AbstractBaseService<any, any, any> {
    protected readonly routePrefix = 'admin.staff';
}

export class StudentService extends AbstractBaseService<any, any, any> {
    protected readonly routePrefix = 'admin.students';
}

export class ContactService extends AbstractBaseService<any, any, any> {
    protected readonly routePrefix = 'admin.contacts';
}

// Service factory for dependency injection
export class ServiceFactory {
    private static instances: Map<string, any> = new Map();

    static getInstance<T extends AbstractBaseService<any>>(ServiceClass: new () => T): T {
        const className = ServiceClass.name;

        if (!this.instances.has(className)) {
            this.instances.set(className, new ServiceClass());
        }

        return this.instances.get(className);
    }

    // Convenience methods
    static getUserService(): UserService {
        return this.getInstance(UserService);
    }

    static getStaffService(): StaffService {
        return this.getInstance(StaffService);
    }

    static getStudentService(): StudentService {
        return this.getInstance(StudentService);
    }

    static getContactService(): ContactService {
        return this.getInstance(ContactService);
    }
}
