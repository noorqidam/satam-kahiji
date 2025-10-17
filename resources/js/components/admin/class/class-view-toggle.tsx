import { Grid3X3, List } from 'lucide-react';

interface ClassViewToggleProps {
    view: 'card' | 'table';
    onViewChange: (view: 'card' | 'table') => void;
}

export function ClassViewToggle({ view, onViewChange }: ClassViewToggleProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onViewChange('card')}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md ${
                    view === 'card'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                }`}
                title="Card View"
            >
                <Grid3X3 className="h-4 w-4" />
            </button>
            <button
                onClick={() => onViewChange('table')}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md ${
                    view === 'table'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                }`}
                title="Table View"
            >
                <List className="h-4 w-4" />
            </button>
        </div>
    );
}
