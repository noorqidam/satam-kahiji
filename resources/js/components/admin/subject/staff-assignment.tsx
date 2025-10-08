import { LoaderCircle, Mail, User, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type Staff } from '@/types/staff';

interface AssignedStaffListProps {
    staff: Staff[];
    onRemove: (staffId: number) => void;
}

interface StaffSelectionPanelProps {
    availableStaff: Staff[];
    selectedStaff: number[];
    isAssigning: boolean;
    onStaffSelection: (staffId: number, checked: boolean) => void;
    onAssign: () => void;
    onCancel: () => void;
}

interface StaffAssignmentCardProps {
    assignedStaff: Staff[];
    availableStaff: Staff[];
    selectedStaff: number[];
    isAssigning: boolean;
    showAssignmentPanel: boolean;
    onStaffSelection: (staffId: number, checked: boolean) => void;
    onAssignStaff: () => void;
    onRemoveStaff: (staffId: number) => void;
    onToggleAssignmentPanel: () => void;
    onCancelAssignment: () => void;
}

export function AssignedStaffList({ staff, onRemove }: AssignedStaffListProps) {
    if (staff.length === 0) {
        return (
            <div className="py-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No staff assigned</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This subject doesn't have any staff members assigned yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Currently Assigned</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((staffMember) => (
                    <div
                        key={staffMember.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                {staffMember.photo ? (
                                    <img
                                        src={
                                            staffMember.photo.startsWith('http') ? staffMember.photo : `/storage/profile-photos/${staffMember.photo}`
                                        }
                                        alt={staffMember.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{staffMember.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{staffMember.position}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{staffMember.division}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={`mailto:${staffMember.email}`} className="text-gray-400 hover:text-gray-600">
                                <Mail className="h-4 w-4" />
                            </a>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(staffMember.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function StaffSelectionPanel({ availableStaff, selectedStaff, isAssigning, onStaffSelection, onAssign, onCancel }: StaffSelectionPanelProps) {
    return (
        <div className="border-t pt-4">
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Select Staff to Assign</h4>
            <div className="max-h-48 space-y-2 overflow-y-auto">
                {availableStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-3 rounded border border-gray-100 p-2 dark:border-gray-700">
                        <Checkbox
                            id={`assign-${staff.id}`}
                            checked={selectedStaff.includes(staff.id)}
                            onCheckedChange={(checked) => onStaffSelection(staff.id, checked as boolean)}
                        />
                        <Label htmlFor={`assign-${staff.id}`} className="flex-1 cursor-pointer">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{staff.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{staff.position}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{staff.division}</p>
                            </div>
                        </Label>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
                <Button size="sm" onClick={onAssign} disabled={isAssigning || selectedStaff.length === 0}>
                    {isAssigning ? 'Assigning...' : `Assign ${selectedStaff.length} Staff`}
                </Button>
            </div>
        </div>
    );
}

export function StaffAssignmentCard({
    assignedStaff,
    availableStaff,
    selectedStaff,
    isAssigning,
    showAssignmentPanel,
    onStaffSelection,
    onAssignStaff,
    onRemoveStaff,
    onToggleAssignmentPanel,
    onCancelAssignment,
}: StaffAssignmentCardProps) {
    const availableForAssignment = availableStaff.filter((staff) => !assignedStaff.some((assignedStaff) => assignedStaff.id === staff.id));
    const availableTeachers = availableForAssignment.filter((staff) => staff.position.toLowerCase().includes('teacher'));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Teacher Assignments ({assignedStaff.length})
                    </div>
                    {availableTeachers.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={onToggleAssignmentPanel}>
                            {isAssigning && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {showAssignmentPanel ? 'Cancel' : 'Assign Teachers'}
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <AssignedStaffList staff={assignedStaff} onRemove={onRemoveStaff} />

                {showAssignmentPanel && availableForAssignment.length > 0 && (
                    <StaffSelectionPanel
                        availableStaff={availableForAssignment}
                        selectedStaff={selectedStaff}
                        isAssigning={isAssigning}
                        onStaffSelection={onStaffSelection}
                        onAssign={onAssignStaff}
                        onCancel={onCancelAssignment}
                    />
                )}
            </CardContent>
        </Card>
    );
}
