import { Grid3X3, Table } from 'lucide-react';

interface SubjectViewToggleProps {
    view: 'card' | 'table';
    onViewChange: (view: 'card' | 'table') => void;
}

export function SubjectViewToggle({ view, onViewChange }: SubjectViewToggleProps) {
    return (
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
            <button
                onClick={() => onViewChange('card')}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none ${
                    view === 'card'
                        ? 'bg-white text-gray-900 shadow-sm hover:text-gray-900 hover:shadow-md dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`}
            >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
            </button>
            <button
                onClick={() => onViewChange('table')}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none ${
                    view === 'table'
                        ? 'bg-white text-gray-900 shadow-sm hover:text-gray-900 hover:shadow-md dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`}
            >
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
            </button>
        </div>
    );
}
