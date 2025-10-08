import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface MultiSelectDropdownProps<T extends string> {
    options: T[];
    selected: T[];
    onSelectionChange: (selected: T[]) => void;
    placeholder?: string;
    getLabel?: (value: T) => string;
}

export function MultiSelectDropdown<T extends string>({
    options,
    selected,
    onSelectionChange,
    placeholder = 'Select options...',
    getLabel = (value: T) => value,
}: MultiSelectDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: T, event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (selected.includes(option)) {
            const newSelected = selected.filter((item) => item !== option);
            onSelectionChange(newSelected);
        } else {
            const newSelected = [...selected, option];
            onSelectionChange(newSelected);
        }
    };

    const removeOption = (optionToRemove: T, event: React.MouseEvent) => {
        event.stopPropagation();
        const newSelected = selected.filter((item) => item !== optionToRemove);
        onSelectionChange(newSelected);
    };

    const renderSelectedBadges = () => {
        if (selected.length === 0) {
            return <span className="text-muted-foreground">{placeholder}</span>;
        }
        
        return (
            <div className="flex flex-wrap gap-1">
                {selected.map((option) => (
                    <Badge
                        key={option}
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 gap-1"
                    >
                        {getLabel(option)}
                        <span
                            onClick={(e) => removeOption(option, e)}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                        >
                            <X className="h-2.5 w-2.5" />
                        </span>
                    </Badge>
                ))}
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
                <div className="flex-1 min-w-0">
                    {renderSelectedBadges()}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    <div className="max-h-60 overflow-auto p-1">
                        {options.map((option) => (
                            <div
                                key={option}
                                className="relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <Checkbox 
                                    checked={selected.includes(option)} 
                                    onCheckedChange={() => toggleOption(option)}
                                    className="mr-2" 
                                />
                                <span 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleOption(option, e);
                                    }}
                                    className="flex-1"
                                >
                                    {getLabel(option)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}