<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Extracurricular;
use App\Models\StudentAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StudentRecordsController extends Controller
{
    /**
     * Get comprehensive student records for management
     */
    public function show(Student $student): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            abort(403, 'You can only manage records for students in your homeroom class');
        }

        // Load all required data
        $student->load([
            'positiveNotes.staff',
            'disciplinaryRecords.staff', 
            'extracurricularHistory.extracurricular',
            'achievements'
        ]);

        // Get available options for forms
        $extracurriculars = Extracurricular::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('teacher/students/records', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'class' => $student->class,
                'photo' => $student->photo && $student->photo !== 'default.jpg' ? (str_starts_with($student->photo, 'http') ? $student->photo : "/storage/{$student->photo}") : null,
            ],
            'records' => [
                'positive_notes' => $student->positiveNotes->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'note' => $note->note,
                        'category' => $note->category,
                        'staff_name' => $note->staff->name,
                        'created_at' => $note->created_at->format('Y-m-d H:i'),
                    ];
                }),
                'disciplinary_records' => $student->disciplinaryRecords->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'incident_description' => $record->description,
                        'action_taken' => $record->action_taken,
                        'severity' => $record->severity,
                        'incident_date' => $record->date->format('Y-m-d'),
                        'staff_name' => $record->staff->name,
                        'created_at' => $record->created_at->format('Y-m-d H:i'),
                    ];
                }),
                'extracurricular_history' => $student->extracurricularHistory->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'extracurricular_name' => $history->extracurricular->name,
                        'academic_year' => $history->academic_year,
                        'role' => $history->role,
                        'start_date' => $history->start_date->format('Y-m-d'),
                        'end_date' => $history->end_date?->format('Y-m-d'),
                        'performance_notes' => $history->performance_notes,
                    ];
                }),
                'documents' => $student->documents->map(function ($document) {
                    return [
                        'id' => $document->id,
                        'title' => $document->title,
                        'file_name' => $document->file_name,
                        'uploaded_at' => $document->uploaded_at?->format('Y-m-d H:i') ?? $document->created_at->format('Y-m-d H:i'),
                        'file_path' => $document->file_path,
                        'file_size' => $document->file_size,
                        'mime_type' => $document->mime_type,
                    ];
                }),
                'achievements' => $student->achievements->map(function ($achievement) {
                    return [
                        'id' => $achievement->id,
                        'achievement_type' => $achievement->achievement_type,
                        'achievement_name' => $achievement->achievement_name,
                        'description' => $achievement->description,
                        'date_achieved' => $achievement->date_achieved->format('Y-m-d'),
                        'level' => $achievement->level,
                        'score_value' => $achievement->score_value,
                        'issuing_organization' => $achievement->issuing_organization,
                        'status' => $achievement->status,
                        'verified_by' => $achievement->verifier?->name,
                        'verified_at' => $achievement->verified_at?->format('Y-m-d H:i'),
                        'verification_notes' => $achievement->verification_notes,
                        'created_at' => $achievement->created_at->format('Y-m-d H:i'),
                    ];
                }),
            ],
            'options' => [
                'extracurriculars' => $extracurriculars,
                'achievement_types' => StudentAchievement::ACHIEVEMENT_TYPES,
                'achievement_levels' => StudentAchievement::LEVELS,
            ],
            'teacher' => $staff,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Store positive note
     */
    public function storePositiveNote(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:1000',
            'category' => 'nullable|string|max:100',
            'date' => 'nullable|date|before_or_equal:today',
        ]);

        $validated['staff_id'] = $staff->id;
        
        // If no date provided, use today's date
        if (empty($validated['date'])) {
            $validated['date'] = now()->toDateString();
        }

        $note = $student->positiveNotes()->create($validated);

        return back()->with('success', 'Positive note added successfully');
    }

    /**
     * Store disciplinary record
     */
    public function storeDisciplinaryRecord(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $validated = $request->validate([
            'incident_type' => 'required|string|max:100',
            'incident_description' => 'required|string|max:1000',
            'action_taken' => 'nullable|string|max:500',
            'severity' => 'required|in:minor,moderate,serious',
            'incident_date' => 'required|date|before_or_equal:today',
        ]);

        // Map form fields to database fields
        $recordData = [
            'staff_id' => $staff->id,
            'incident_type' => $validated['incident_type'],
            'description' => $validated['incident_description'], // Map to correct field name
            'action_taken' => $validated['action_taken'],
            'severity' => $validated['severity'],
            'date' => $validated['incident_date'], // Map to correct field name
        ];

        $record = $student->disciplinaryRecords()->create($recordData);

        return back()->with('success', 'Disciplinary record added successfully');
    }

    /**
     * Store document
     */
    public function storeDocument(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_type' => 'required|in:sick_note,excuse_letter,medical_certificate,permission_slip,report,transcript,other',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
            'description' => 'nullable|string|max:500',
        ]);

        try {
            // Store file using PhotoHandler service to Google Drive
            $file = $request->file('file');
            $photoHandler = app(\App\Services\PhotoHandler::class);
            $filePath = $photoHandler->handlePhotoUpload($file, 'student-documents');

            $document = $student->documents()->create([
                'title' => $validated['title'],
                'document_category_id' => $validated['document_category_id'],
                'document_type' => $validated['document_type'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_by' => $staff->id,
                'uploaded_by_type' => 'staff',
                'upload_date' => now(),
                'description' => $validated['description'] ?? null,
            ]);

            Log::info('Document uploaded successfully', [
                'student_id' => $student->id,
                'document_id' => $document->id,
                'title' => $document->title,
                'file_path' => $filePath
            ]);

            return back()->with('success', 'Document uploaded successfully to Google Drive');

        } catch (\Exception $e) {
            Log::error('Document upload failed: ' . $e->getMessage());
            return back()->withErrors(['file' => 'Failed to upload document. Please try again.']);
        }
    }


    /**
     * Update positive note
     */
    public function updatePositiveNote(Request $request, Student $student, $noteId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $note = $student->positiveNotes()->findOrFail($noteId);

        $validated = $request->validate([
            'note' => 'required|string|max:1000',
            'category' => 'nullable|string|max:100',
        ]);

        $note->update($validated);

        return back()->with('success', 'Positive note updated successfully');
    }

    /**
     * Update disciplinary record
     */
    public function updateDisciplinaryRecord(Request $request, Student $student, $recordId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $record = $student->disciplinaryRecords()->findOrFail($recordId);

        $validated = $request->validate([
            'incident_type' => 'required|string|max:100',
            'incident_description' => 'required|string|max:1000',
            'action_taken' => 'nullable|string|max:500',
            'severity' => 'required|in:minor,moderate,serious',
            'incident_date' => 'required|date|before_or_equal:today',
        ]);

        // Map form fields to database fields
        $updateData = [
            'incident_type' => $validated['incident_type'],
            'description' => $validated['incident_description'], // Map to correct field name
            'action_taken' => $validated['action_taken'],
            'severity' => $validated['severity'],
            'date' => $validated['incident_date'], // Map to correct field name
        ];

        $record->update($updateData);

        return back()->with('success', 'Disciplinary record updated successfully');
    }

    /**
     * Delete positive note
     */
    public function destroyPositiveNote(Student $student, $noteId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $note = $student->positiveNotes()->findOrFail($noteId);
        $note->delete();

        return back()->with('success', 'Positive note deleted successfully');
    }

    /**
     * Delete disciplinary record
     */
    public function destroyDisciplinaryRecord(Student $student, $recordId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $record = $student->disciplinaryRecords()->findOrFail($recordId);
        $record->delete();

        return back()->with('success', 'Disciplinary record deleted successfully');
    }

    /**
     * Delete document
     */
    public function destroyDocument(Student $student, $documentId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $document = $student->documents()->findOrFail($documentId);
        
        try {
            // Delete file from storage
            if (str_starts_with($document->file_path, 'http')) {
                // For Google Drive files, use PhotoHandler to delete
                $photoHandler = app(\App\Services\PhotoHandler::class);
                $photoHandler->deletePhoto($document->file_path, 'student-documents');
            } else {
                // For local files (fallback)
                if (Storage::disk('public')->exists($document->file_path)) {
                    Storage::disk('public')->delete($document->file_path);
                }
            }
            
            $document->delete();
            
            return back()->with('success', 'Document deleted successfully');
        } catch (\Exception $e) {
            Log::error('Document deletion failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete document']);
        }
    }

    /**
     * Download document
     */
    public function downloadDocument(Student $student, $documentId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            abort(403, 'Unauthorized');
        }

        $document = $student->documents()->findOrFail($documentId);
        
        // Check if file is stored in Google Drive (URL format)
        if (str_starts_with($document->file_path, 'http')) {
            // For Google Drive files, redirect to the download URL
            return redirect($document->file_path);
        }
        
        // For local files (fallback)
        if (!Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($document->file_path, $document->title);
    }

    /**
     * Store student achievement
     */
    public function storeAchievement(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $validated = $request->validate([
            'achievement_type' => 'required|string|in:' . implode(',', array_keys(StudentAchievement::ACHIEVEMENT_TYPES)),
            'achievement_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'date_achieved' => 'required|date|before_or_equal:today',
            'criteria_met' => 'nullable|string|max:500',
            'level' => 'required|string|in:' . implode(',', array_keys(StudentAchievement::LEVELS)),
            'score_value' => 'nullable|numeric|min:0|max:999999.99',
            'issuing_organization' => 'nullable|string|max:255',
        ]);

        $achievement = $student->achievements()->create([
            'achievement_type' => $validated['achievement_type'],
            'achievement_name' => $validated['achievement_name'],
            'description' => $validated['description'],
            'date_achieved' => $validated['date_achieved'],
            'criteria_met' => $validated['criteria_met'],
            'level' => $validated['level'],
            'score_value' => $validated['score_value'],
            'issuing_organization' => $validated['issuing_organization'],
        ]);

        return back()->with('success', 'Achievement added successfully');
    }

    /**
     * Update student achievement
     */
    public function updateAchievement(Request $request, Student $student, $achievementId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $achievement = $student->achievements()->findOrFail($achievementId);

        // Only allow editing if achievement is pending or if teacher is the verifier
        if ($achievement->status === 'verified' && $achievement->verified_by !== $user->id) {
            return back()->withErrors(['error' => 'Cannot edit verified achievements']);
        }

        $validated = $request->validate([
            'achievement_type' => 'required|string|in:' . implode(',', array_keys(StudentAchievement::ACHIEVEMENT_TYPES)),
            'achievement_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'date_achieved' => 'required|date|before_or_equal:today',
            'criteria_met' => 'nullable|string|max:500',
            'level' => 'required|string|in:' . implode(',', array_keys(StudentAchievement::LEVELS)),
            'score_value' => 'nullable|numeric|min:0|max:999999.99',
            'issuing_organization' => 'nullable|string|max:255',
        ]);

        $achievement->update($validated);

        return back()->with('success', 'Achievement updated successfully');
    }

    /**
     * Delete student achievement
     */
    public function destroyAchievement(Student $student, $achievementId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'Unauthorized']);
        }

        $achievement = $student->achievements()->findOrFail($achievementId);

        // Only allow deletion if achievement is pending or if teacher is the verifier
        if ($achievement->status === 'verified' && $achievement->verified_by !== $user->id) {
            return back()->withErrors(['error' => 'Cannot delete verified achievements']);
        }

        $achievement->delete();

        return back()->with('success', 'Achievement deleted successfully');
    }

}