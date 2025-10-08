import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface ExtracurricularDescriptionFieldProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    maxLength?: number;
}

export function ExtracurricularDescriptionField({ value, onChange, error, maxLength = 1000 }: ExtracurricularDescriptionFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const characterCount = value.length;
    const remainingCharacters = maxLength - characterCount;
    const isNearLimit = remainingCharacters <= 100;
    const isOverLimit = remainingCharacters < 0;

    return (
        <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
                id="description"
                value={value}
                onChange={handleChange}
                placeholder="Enter a description for this extracurricular activity"
                className="min-h-[100px] resize-y"
                maxLength={maxLength}
            />

            <div className="flex items-center justify-between text-xs">
                <div>{error && <span className="text-red-600 dark:text-red-400">{error}</span>}</div>
                <div
                    className={` ${
                        isOverLimit
                            ? 'text-red-600 dark:text-red-400'
                            : isNearLimit
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-500 dark:text-gray-400'
                    } `}
                >
                    {characterCount}/{maxLength}
                </div>
            </div>
        </div>
    );
}
