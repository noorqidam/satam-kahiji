import { Grid3X3, List } from 'lucide-react';

interface SubjectViewToggleProps {
    view: 'card' | 'table';
    onViewChange: (view: 'card' | 'table') => void;
}

export function SubjectViewToggle({ view, onViewChange }: SubjectViewToggleProps) {
    return (
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            <button
                onClick={() => onViewChange('card')}
                className={`flex items-center justify-center p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    view === 'card'
                        ? 'bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`}
                title="Card View"
            >
                <Grid3X3 className="h-4 w-4" />
            </button>
            <button
                onClick={() => onViewChange('table')}
                className={`flex items-center justify-center p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    view === 'table'
                        ? 'bg-gray-900 text-white shadow-sm dark:bg-gray-100 dark:text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`}
                title="Table View"
            >
                <List className="h-4 w-4" />
            </button>
        </div>
    );
}
