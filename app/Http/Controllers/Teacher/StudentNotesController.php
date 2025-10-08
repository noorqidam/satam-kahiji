<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Student;
use App\Models\StudentPositiveNote;
use App\Models\StudentDisciplinaryRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentNotesController extends Controller
{
    /**
     * Display notes for a specific student
     */
    public function show(Student $student): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            abort(403, 'Staff record not found');
        }

        // Verify this student belongs to this teacher's homeroom
        if ($student->homeroom_teacher_id !== $staff->id) {
            abort(403, 'You can only view notes for students in your homeroom class');
        }

        // Load student with notes
        $student->load([
            'positiveNotes' => function ($query) {
                $query->with('staff')->orderBy('date', 'desc');
            },
            'disciplinaryRecords' => function ($query) {
                $query->with('staff')->orderBy('date', 'desc');
            }
        ]);

        return Inertia::render('teacher/students/notes', [
            'student' => [
                'id' => $student->id,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'class' => $student->class,
                'photo' => $student->photo && $student->photo !== 'default.jpg' ? (str_starts_with($student->photo, 'http') ? $student->photo : "/storage/{$student->photo}") : null,
            ],
            'positiveNotes' => $student->positiveNotes,
            'disciplinaryRecords' => $student->disciplinaryRecords,
            'teacher' => $staff,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Store a new positive note for a student
     */
    public function storePositiveNote(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this student belongs to this teacher's homeroom
        if ($student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'You can only add notes for students in your homeroom class']);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:1000',
            'category' => 'nullable|string|max:100',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $validated['student_id'] = $student->id;
        $validated['staff_id'] = $staff->id;

        StudentPositiveNote::create($validated);

        return back()->with('success', 'Positive note added successfully');
    }

    /**
     * Store a new disciplinary record for a student
     */
    public function storeDisciplinaryRecord(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this student belongs to this teacher's homeroom
        if ($student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'You can only add disciplinary records for students in your homeroom class']);
        }

        $validated = $request->validate([
            'incident_type' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'action_taken' => 'nullable|string|max:1000',
            'severity' => 'required|in:minor,moderate,serious',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $validated['student_id'] = $student->id;
        $validated['staff_id'] = $staff->id;

        StudentDisciplinaryRecord::create($validated);

        return back()->with('success', 'Disciplinary record added successfully');
    }

    /**
     * Update a positive note
     */
    public function updatePositiveNote(Request $request, Student $student, StudentPositiveNote $note)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this note belongs to this teacher and student
        if ($note->staff_id !== $staff->id || $note->student_id !== $student->id) {
            return back()->withErrors(['error' => 'You can only edit your own notes']);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:1000',
            'category' => 'nullable|string|max:100',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $note->update($validated);

        return back()->with('success', 'Positive note updated successfully');
    }

    /**
     * Update a disciplinary record
     */
    public function updateDisciplinaryRecord(Request $request, Student $student, StudentDisciplinaryRecord $record)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this record belongs to this teacher and student
        if ($record->staff_id !== $staff->id || $record->student_id !== $student->id) {
            return back()->withErrors(['error' => 'You can only edit your own disciplinary records']);
        }

        $validated = $request->validate([
            'incident_type' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'action_taken' => 'nullable|string|max:1000',
            'severity' => 'required|in:minor,moderate,serious',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $record->update($validated);

        return back()->with('success', 'Disciplinary record updated successfully');
    }

    /**
     * Delete a positive note
     */
    public function destroyPositiveNote(Student $student, StudentPositiveNote $note)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this note belongs to this teacher and student
        if ($note->staff_id !== $staff->id || $note->student_id !== $student->id) {
            return back()->withErrors(['error' => 'You can only delete your own notes']);
        }

        $note->delete();

        return back()->with('success', 'Positive note deleted successfully');
    }

    /**
     * Delete a disciplinary record
     */
    public function destroyDisciplinaryRecord(Student $student, StudentDisciplinaryRecord $record)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this record belongs to this teacher and student
        if ($record->staff_id !== $staff->id || $record->student_id !== $student->id) {
            return back()->withErrors(['error' => 'You can only delete your own disciplinary records']);
        }

        $record->delete();

        return back()->with('success', 'Disciplinary record deleted successfully');
    }

    /**
     * Get notes summary for a student (for dashboard widgets)
     */
    public function getNoteSummary(Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $positiveCount = $student->positiveNotes()->count();
        $disciplinaryCount = $student->disciplinaryRecords()->count();
        $recentNotes = $student->positiveNotes()
            ->with('staff')
            ->latest('date')
            ->limit(3)
            ->get();

        return response()->json([
            'positive_notes_count' => $positiveCount,
            'disciplinary_records_count' => $disciplinaryCount,
            'recent_positive_notes' => $recentNotes,
            'behavior_score' => $this->calculateBehaviorScore($positiveCount, $disciplinaryCount),
        ]);
    }

    /**
     * Calculate a simple behavior score based on notes
     */
    private function calculateBehaviorScore(int $positiveCount, int $disciplinaryCount): int
    {
        // Simple scoring: positive notes add points, disciplinary records subtract
        $score = ($positiveCount * 10) - ($disciplinaryCount * 5);
        
        // Ensure score is between 0 and 100
        return max(0, min(100, $score + 50)); // Base score of 50
    }
}