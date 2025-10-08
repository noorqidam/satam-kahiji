import { LoaderCircle, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type Staff } from '@/types/staff';

interface StaffAssignmentEditCardProps {
    assignedStaff: Staff[];
    availableStaff: Staff[];
    selectedStaff: number[];
    isAssigning: boolean;
    onStaffSelection: (staffId: number, checked: boolean) => void;
    onUpdateAssignments: () => void;
    onRemoveStaff: (staffId: number) => void;
}

export function StaffAssignmentEditCard({
    assignedStaff,
    availableStaff,
    selectedStaff,
    isAssigning,
    onStaffSelection,
    onUpdateAssignments,
    onRemoveStaff,
}: StaffAssignmentEditCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Teacher Assignments ({assignedStaff.length})
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={onUpdateAssignments} disabled={isAssigning}>
                        {isAssigning && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Assignments
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Currently Assigned Staff */}
                {assignedStaff.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Currently Assigned</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {assignedStaff.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{staff.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{staff.position}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveStaff(staff.id)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Staff for Assignment */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Available Staff</h4>
                    {availableStaff.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {availableStaff.map((staff) => {
                                const isSelected = selectedStaff.includes(staff.id);
                                return (
                                    <div
                                        key={staff.id}
                                        className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                    >
                                        <Checkbox
                                            id={`staff-${staff.id}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => onStaffSelection(staff.id, checked as boolean)}
                                        />
                                        <Label htmlFor={`staff-${staff.id}`} className="flex-1 cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{staff.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{staff.position}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{staff.division}</p>
                                            </div>
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No staff members available for assignment.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
