import { useCallback, useEffect, useMemo, useState } from 'react';
import { type SubjectAssignmentData } from './use-subject-assignment-data';

type AssignmentMatrix = Record<number, Record<number, boolean>>;

export function useAssignmentMatrix(data: SubjectAssignmentData) {
    // Create initial assignments based on data
    const initialAssignments = useMemo(() => {
        return createInitialAssignments(data);
    }, [data]);

    const [assignments, setAssignments] = useState<AssignmentMatrix>(initialAssignments);

    // Update assignments when data changes - using a key that changes when actual assignment data changes
    const dataKey = useMemo(() => {
        return JSON.stringify(
            data.staff.data.map((s) => ({
                id: s.id,
                subjects: s.subjects.map((sub) => sub.id).sort(),
            })),
        );
    }, [data.staff.data]);

    useEffect(() => {
        setAssignments(initialAssignments);
    }, [dataKey, initialAssignments]);

    const toggleAssignment = useCallback((staffId: number, subjectId: number) => {
        setAssignments((prev) => ({
            ...prev,
            [staffId]: {
                ...prev[staffId],
                [subjectId]: !prev[staffId][subjectId],
            },
        }));
    }, []);

    const getStaffAssignmentCount = useCallback(
        (staffId: number) => {
            return Object.values(assignments[staffId] || {}).filter(Boolean).length;
        },
        [assignments],
    );

    const getSubjectAssignmentCount = useCallback(
        (subjectId: number) => {
            return Object.values(assignments).filter((staffAssignments) => staffAssignments[subjectId]).length;
        },
        [assignments],
    );

    const hasChanges = useCallback(() => {
        return Object.keys(assignments).some((staffId) => {
            const staffIdNum = parseInt(staffId);
            return Object.keys(assignments[staffIdNum]).some((subjectId) => {
                const subjectIdNum = parseInt(subjectId);
                return assignments[staffIdNum][subjectIdNum] !== initialAssignments[staffIdNum]?.[subjectIdNum];
            });
        });
    }, [assignments, initialAssignments]);

    const getAssignmentsData = useCallback(() => {
        return Object.entries(assignments).map(([staffId, subjectAssignments]) => ({
            staff_id: parseInt(staffId),
            subject_ids: Object.entries(subjectAssignments)
                .filter(([, isAssigned]) => isAssigned)
                .map(([subjectId]) => parseInt(subjectId)),
        }));
    }, [assignments]);

    return {
        assignments,
        toggleAssignment,
        getStaffAssignmentCount,
        getSubjectAssignmentCount,
        hasChanges,
        getAssignmentsData,
    };
}

function createInitialAssignments(data: SubjectAssignmentData): AssignmentMatrix {
    const initialAssignments: AssignmentMatrix = {};

    data.staff.data.forEach((staffMember) => {
        initialAssignments[staffMember.id] = {};
        data.subjects.data.forEach((subject) => {
            initialAssignments[staffMember.id][subject.id] = staffMember.subjects.some((s) => s.id === subject.id);
        });
    });

    return initialAssignments;
}
