import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXTRACURRICULAR_CATEGORIES, PREDEFINED_ACTIVITIES } from '@/types/extracurricular';
import { extracurricularUtils } from '@/utils/extracurricular-utils';
import React, { useCallback, useMemo, useState } from 'react';

interface ExtracurricularNameSelectorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    isEditing?: boolean;
    originalName?: string;
}

type NameInputType = 'predefined' | 'custom';

export function ExtracurricularNameSelector({ value, onChange, error, isEditing = false, originalName }: ExtracurricularNameSelectorProps) {
    const [nameType, setNameType] = useState<NameInputType>(() => {
        if (isEditing && originalName) {
            return extracurricularUtils.isPredefinedActivity(originalName) ? 'predefined' : 'custom';
        }
        return 'predefined';
    });

    const [customName, setCustomName] = useState(() => {
        if (isEditing && originalName && !extracurricularUtils.isPredefinedActivity(originalName)) {
            return originalName;
        }
        return '';
    });

    const activitiesByCategory = useMemo(() => {
        return Object.entries(PREDEFINED_ACTIVITIES).map(([categoryKey, activities]) => ({
            category: EXTRACURRICULAR_CATEGORIES[categoryKey as keyof typeof EXTRACURRICULAR_CATEGORIES],
            activities,
        }));
    }, []);

    const handleNameTypeChange = useCallback(
        (type: NameInputType) => {
            setNameType(type);

            if (type === 'predefined') {
                setCustomName('');
                if (isEditing && originalName && extracurricularUtils.isPredefinedActivity(originalName)) {
                    onChange(originalName);
                } else {
                    onChange('');
                }
            } else {
                onChange('');
                if (isEditing && originalName) {
                    setCustomName(originalName);
                    onChange(originalName);
                }
            }
        },
        [onChange, isEditing, originalName],
    );

    const handlePredefinedChange = useCallback(
        (selectedValue: string) => {
            onChange(selectedValue);
        },
        [onChange],
    );

    const handleCustomChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setCustomName(newValue);
            onChange(newValue);
        },
        [onChange],
    );

    const getCurrentPredefinedValue = () => {
        if (nameType === 'predefined' && extracurricularUtils.isPredefinedActivity(value)) {
            return value;
        }
        return '';
    };

    return (
        <div className="space-y-4">
            <Label htmlFor="name-type">Activity Name</Label>

            <div className="mb-4 flex gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="nameType"
                        value="predefined"
                        checked={nameType === 'predefined'}
                        onChange={(e) => handleNameTypeChange(e.target.value as NameInputType)}
                        className="text-blue-600"
                    />
                    <span className="text-sm">Choose from list</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="nameType"
                        value="custom"
                        checked={nameType === 'custom'}
                        onChange={(e) => handleNameTypeChange(e.target.value as NameInputType)}
                        className="text-blue-600"
                    />
                    <span className="text-sm">Enter custom name</span>
                </label>
            </div>

            {nameType === 'predefined' && (
                <Select value={getCurrentPredefinedValue()} onValueChange={handlePredefinedChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an extracurricular activity" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        {activitiesByCategory.map(({ category, activities }) => (
                            <div key={category}>
                                <div className="bg-gray-50 px-2 py-1.5 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    {category}
                                </div>
                                {activities.map((activity) => (
                                    <SelectItem key={activity} value={activity} className="pl-4">
                                        {activity}
                                    </SelectItem>
                                ))}
                            </div>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {nameType === 'custom' && (
                <Input
                    id="custom-name"
                    type="text"
                    value={customName}
                    onChange={handleCustomChange}
                    placeholder="Enter custom extracurricular activity name"
                    className="w-full"
                />
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
