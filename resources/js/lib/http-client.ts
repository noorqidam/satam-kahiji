import axios, { AxiosInstance } from 'axios';

// Single Responsibility: Handle CSRF token operations
interface CsrfTokenManager {
    getFreshToken(): Promise<string | null>;
    updateMetaTag(token: string): void;
    getInitialToken(): string | null;
}

class DefaultCsrfTokenManager implements CsrfTokenManager {
    async getFreshToken(): Promise<string | null> {
        try {
            const plainAxios = axios.create();
            const response = await plainAxios.get('/admin/work-items/csrf-token', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.data && response.data.csrf_token) {
                this.updateMetaTag(response.data.csrf_token);
                return response.data.csrf_token;
            }
            return null;
        } catch (error) {
            console.error('Failed to get fresh CSRF token:', error);
            return null;
        }
    }

    updateMetaTag(token: string): void {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            metaTag.setAttribute('content', token);
        }
    }

    getInitialToken(): string | null {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
    }
}

// Single Responsibility: Handle HTTP client configuration
interface HttpClientConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

// Open/Closed Principle: Extensible HTTP client interface
interface HttpClient {
    get<T = any>(url: string): Promise<T>;
    post<T = any>(url: string, data?: any): Promise<T>;
    put<T = any>(url: string, data?: any): Promise<T>;
    delete<T = any>(url: string): Promise<T>;
}

// Single Responsibility: Create and configure Axios instance
class AxiosHttpClient implements HttpClient {
    public instance: AxiosInstance;
    private csrfManager: CsrfTokenManager;

    constructor(config: HttpClientConfig = {}, csrfManager: CsrfTokenManager) {
        this.csrfManager = csrfManager;
        this.instance = this.createInstance(config);
        this.setupInterceptors();
        this.setInitialCsrfToken();
    }

    private createInstance(config: HttpClientConfig): AxiosInstance {
        return axios.create({
            baseURL: config.baseURL || '/',
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...config.headers,
            },
        });
    }

    private setupInterceptors(): void {
        // Response interceptor for CSRF token refresh
        this.instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 419 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    console.log('CSRF token expired, attempting to refresh...');
                    const freshToken = await this.csrfManager.getFreshToken();

                    if (freshToken) {
                        this.instance.defaults.headers.common['X-CSRF-TOKEN'] = freshToken;
                        originalRequest.headers['X-CSRF-TOKEN'] = freshToken;

                        console.log('CSRF token refreshed, retrying request...');
                        return this.instance(originalRequest);
                    }
                }

                return Promise.reject(error);
            },
        );
    }

    private setInitialCsrfToken(): void {
        const token = this.csrfManager.getInitialToken();
        if (token) {
            this.instance.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }
    }

    async get<T = any>(url: string): Promise<T> {
        const response = await this.instance.get(url);
        return response.data;
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.instance.post(url, data);
        return response.data;
    }

    async put<T = any>(url: string, data?: any): Promise<T> {
        const response = await this.instance.put(url, data);
        return response.data;
    }

    async delete<T = any>(url: string): Promise<T> {
        const response = await this.instance.delete(url);
        return response.data;
    }
}

// Dependency Inversion: Factory for creating HTTP client
export const createHttpClient = (config?: HttpClientConfig): HttpClient => {
    const csrfManager = new DefaultCsrfTokenManager();
    return new AxiosHttpClient(config, csrfManager);
};

// Global HTTP client instance - Singleton pattern
export const httpClient = createHttpClient();

// Export for backward compatibility with existing axios usage
export const axiosInstance = (httpClient as AxiosHttpClient).instance;
