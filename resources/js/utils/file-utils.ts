// Single Responsibility: File utility operations
export interface FileUtils {
    getFileExtension(fileName: string | undefined | null): string;
    formatDate(dateString: string): string;
}

// Single Responsibility: Date formatting
export interface DateFormatter {
    format(dateString: string): string;
}

// Open/Closed Principle: Extensible date formatter
export class LocaleDateFormatter implements DateFormatter {
    format(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}

// Indonesian WIB date and time formatter
export class IndonesianWIBFormatter implements DateFormatter {
    format(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta', // WIB timezone
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true, // Enable AM/PM format
        });
    }
}

// Single Responsibility: File extension extraction
export interface FileExtensionExtractor {
    extract(fileName: string | undefined | null): string;
}

export class DefaultFileExtensionExtractor implements FileExtensionExtractor {
    extract(fileName: string | undefined | null): string {
        if (!fileName) return 'FILE';
        const extension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
        return extension;
    }
}

// Composite pattern: Combines file utilities
export class DefaultFileUtils implements FileUtils {
    constructor(
        private extensionExtractor: FileExtensionExtractor,
        private dateFormatter: DateFormatter,
    ) {}

    getFileExtension(fileName: string | undefined | null): string {
        return this.extensionExtractor.extract(fileName);
    }

    formatDate(dateString: string): string {
        return this.dateFormatter.format(dateString);
    }
}

// Factory for creating file utilities
export const createFileUtils = (): FileUtils => {
    const extensionExtractor = new DefaultFileExtensionExtractor();
    const dateFormatter = new IndonesianWIBFormatter();
    return new DefaultFileUtils(extensionExtractor, dateFormatter);
};
