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
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display homeroom students for the authenticated teacher
     */
    public function index(): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            abort(403, 'Staff record not found');
        }

        // Get homeroom students with their extracurriculars
        $students = $staff->homeroomStudents()
            ->with(['extracurriculars'])
            ->orderBy('name')
            ->get()
            ->map(function ($student) {

                return [
                    'id' => $student->id,
                    'nisn' => $student->nisn,
                    'name' => $student->name,
                    'gender' => $student->gender,
                    'birth_date' => $student->birth_date?->format('Y-m-d'),
                    'birthplace' => $student->birthplace,
                    'religion' => $student->religion,
                    'class' => $student->class,
                    'entry_year' => $student->entry_year,
                    'graduation_year' => $student->graduation_year,
                    'status' => $student->status,
                    'photo' => $student->photo && $student->photo !== 'default.jpg' ? (str_starts_with($student->photo, 'http') ? $student->photo : "/storage/{$student->photo}") : null,
                    'notes' => $student->notes,
                    // Enhanced personal information
                    'parent_name' => $student->parent_name,
                    'parent_phone' => $student->parent_phone,
                    'parent_email' => $student->parent_email,
                    'address' => $student->address,
                    'emergency_contact_name' => $student->emergency_contact_name,
                    'emergency_contact_phone' => $student->emergency_contact_phone,
                    // Transportation information
                    'transportation_method' => $student->transportation_method,
                    'distance_from_home_km' => $student->distance_from_home_km,
                    'travel_time_minutes' => $student->travel_time_minutes,
                    'pickup_location' => $student->pickup_location,
                    'transportation_notes' => $student->transportation_notes,
                    // Health information
                    'allergies' => $student->allergies,
                    'medical_conditions' => $student->medical_conditions,
                    'dietary_restrictions' => $student->dietary_restrictions,
                    'blood_type' => $student->blood_type,
                    'emergency_medical_info' => $student->emergency_medical_info,
                    // Academic information
                    'extracurriculars_count' => $student->extracurriculars->count(),
                ];
            });

        // Get class statistics
        $classStats = [
            'total_students' => $students->count(),
            'male_students' => $students->where('gender', 'male')->count(),
            'female_students' => $students->where('gender', 'female')->count(),
            'active_students' => $students->where('status', 'active')->count(),
        ];

        // Get unique classes for filtering
        $classes = $students->pluck('class')->unique()->sort()->values();

        return Inertia::render('teacher/students/index', [
            'students' => $students,
            'teacher' => $staff,
            'classStats' => $classStats,
            'classes' => $classes,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show the form for creating a new student
     */
    public function create(): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            abort(403, 'Staff record not found');
        }

        // Get all extracurriculars
        $extracurriculars = Extracurricular::select('id', 'name', 'description')
                                ->orderBy('name')
                                ->get();

        // Get available options for record forms

        // Teachers can only add students to their assigned homeroom class

        return Inertia::render('teacher/students/create', [
            'teacher' => $staff,
            'userRole' => $user->role,
            'assignedClass' => $staff->homeroom_class,
            'extracurriculars' => $extracurriculars,
            'recordOptions' => [
            ],
        ]);
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Teachers can only add students to their assigned homeroom class
        if (!$staff->homeroom_class) {
            return back()->withErrors(['error' => 'You must be assigned a homeroom class before you can add students. Please contact your administrator.']);
        }

        $validated = $request->validate([
            'nisn' => 'required|string|max:255|unique:students',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date|before:today',
            'birthplace' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:100',
            'class' => 'required|string|max:50',
            'entry_year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'graduation_year' => 'nullable|integer|min:' . date('Y') . '|max:' . (date('Y') + 10),
            'status' => 'required|in:active,graduated,transferred,dropped',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
            // Personal and family information
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            // Transportation information
            'transportation_method' => 'nullable|in:walking,bicycle,motorcycle,car,school_bus,public_transport,other',
            'distance_from_home_km' => 'nullable|numeric|min:0|max:999.99',
            'travel_time_minutes' => 'nullable|integer|min:0|max:999',
            'pickup_location' => 'nullable|string|max:255',
            'transportation_notes' => 'nullable|string',
            // Health information
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'dietary_restrictions' => 'nullable|string',
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'emergency_medical_info' => 'nullable|string',
            // Extracurricular activities
            'extracurricular_ids' => 'nullable|array',
            'extracurricular_ids.*' => 'exists:extracurriculars,id',
        ]);

        // Ensure the class matches teacher's assigned homeroom class
        if ($validated['class'] !== $staff->homeroom_class) {
            return back()->withErrors(['class' => 'You can only add students to your assigned homeroom class: ' . $staff->homeroom_class]);
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            try {
                $photo = $request->file('photo');
                $filename = time() . '_' . $photo->getClientOriginalName();
                
                // Use the configured storage driver
                if (config('filesystems.default') === 'google_drive') {
                    // Upload to Google Drive using PhotoHandler service
                    $photoHandler = app(\App\Services\PhotoHandler::class);
                    $photoUrl = $photoHandler->storeStudent($photo);
                    $validated['photo'] = $photoUrl;
                } else {
                    // Upload to local storage
                    $path = $photo->storeAs('student-photos', $filename, 'public');
                    $validated['photo'] = $path;
                }
            } catch (\Exception $e) {
                Log::error('Student photo upload failed: ' . $e->getMessage());
                return back()->withErrors(['photo' => 'Failed to upload photo. Please try again.']);
            }
        }

        // Set the teacher as homeroom teacher
        $validated['homeroom_teacher_id'] = $staff->id;

        // Extract extracurricular IDs for separate handling
        $extracurricularIds = $validated['extracurricular_ids'] ?? [];
        unset($validated['extracurricular_ids']);

        $student = Student::create($validated);

        // Sync extracurricular activities
        if (!empty($extracurricularIds)) {
            $student->extracurriculars()->sync($extracurricularIds);
        }

        return redirect()->route('teacher.students.index')->with('success', 'Student created successfully');
    }

    /**
     * Display the specified student
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
            abort(403, 'You can only view students in your homeroom class');
        }

        // Load student data with comprehensive relationships
        $student->load([
            'extracurriculars', 
            'homeroomTeacher',
            'positiveNotes.staff',
            'disciplinaryRecords.staff', 
            'extracurricularHistory.extracurricular',
            'achievements'
        ]);

        // Get detailed academic information
        $academicData = [
            'extracurriculars' => $student->extracurriculars,
        ];

        // Get comprehensive student records
        $studentRecords = [
            'positive_notes' => $student->positiveNotes()
                ->with('staff')
                ->latest()
                ->get()
                ->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'note' => $note->note,
                        'date' => $note->date->format('Y-m-d'),
                        'staff_name' => $note->staff->name,
                        'created_at' => $note->created_at->format('Y-m-d H:i'),
                        'category' => $note->category,
                    ];
                }),
            'disciplinary_records' => $student->disciplinaryRecords()
                ->with('staff')
                ->latest()
                ->get()
                ->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'incident_type' => $record->incident_type,
                        'incident_description' => $record->description, // Map from correct database field
                        'action_taken' => $record->action_taken,
                        'severity' => $record->severity,
                        'staff_name' => $record->staff->name,
                        'incident_date' => $record->date->format('Y-m-d'), // Map from correct database field
                        'created_at' => $record->created_at->format('Y-m-d H:i'),
                    ];
                }),
            'extracurricular_history' => $student->extracurricularHistory()
                ->with('extracurricular')
                ->orderBy('academic_year', 'desc')
                ->get()
                ->map(function ($history) {
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
            'documents' => $student->documents()
                ->latest()
                ->get()
                ->map(function ($document) {
                    return [
                        'id' => $document->id,
                        'title' => $document->title,
                        'uploaded_at' => $document->uploaded_at?->format('Y-m-d H:i') ?? $document->created_at->format('Y-m-d H:i'),
                        'file_path' => $document->file_path,
                        'file_name' => $document->file_name,
                        'mime_type' => $document->mime_type,
                        'file_size' => $document->file_size,
                    ];
                }),
            'achievements' => $student->achievements()
                ->latest()
                ->get()
                ->map(function ($achievement) {
                    return [
                        'id' => $achievement->id,
                        'achievement_type' => $achievement->achievement_type,
                        'achievement_name' => $achievement->achievement_name,
                        'description' => $achievement->description,
                        'date_achieved' => $achievement->date_achieved->format('Y-m-d'),
                        'level' => $achievement->level,
                        'score_value' => $achievement->score_value,
                        'issuing_organization' => $achievement->issuing_organization,
                        'created_at' => $achievement->created_at->format('Y-m-d H:i'),
                    ];
                }),
        ];

        return Inertia::render('teacher/students/show', [
            'student' => [
                'id' => $student->id,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'gender' => $student->gender,
                'birth_date' => $student->birth_date?->format('Y-m-d'),
                'birthplace' => $student->birthplace,
                'religion' => $student->religion,
                'class' => $student->class,
                'entry_year' => $student->entry_year,
                'graduation_year' => $student->graduation_year,
                'status' => $student->status,
                'photo' => $student->photo && $student->photo !== 'default.jpg' ? (str_starts_with($student->photo, 'http') ? $student->photo : "/storage/{$student->photo}") : null,
                'notes' => $student->notes,
                'homeroom_teacher' => $student->homeroomTeacher,
                // Enhanced personal information
                'parent_name' => $student->parent_name,
                'parent_phone' => $student->parent_phone,
                'parent_email' => $student->parent_email,
                'address' => $student->address,
                'emergency_contact_name' => $student->emergency_contact_name,
                'emergency_contact_phone' => $student->emergency_contact_phone,
                // Transportation information
                'transportation_method' => $student->transportation_method,
                'distance_from_home_km' => $student->distance_from_home_km,
                'travel_time_minutes' => $student->travel_time_minutes,
                'pickup_location' => $student->pickup_location,
                'transportation_notes' => $student->transportation_notes,
                // Health information
                'allergies' => $student->allergies,
                'medical_conditions' => $student->medical_conditions,
                'dietary_restrictions' => $student->dietary_restrictions,
                'blood_type' => $student->blood_type,
                'emergency_medical_info' => $student->emergency_medical_info,
                // Include student records for StudentRecordsTabs component
                'positive_notes' => $studentRecords['positive_notes'],
                'disciplinary_records' => $studentRecords['disciplinary_records'],
                'extracurricular_history' => $studentRecords['extracurricular_history'],
                'documents' => $studentRecords['documents'],
                'achievements' => $studentRecords['achievements'],
            ],
            'academicData' => $academicData,
            'studentRecords' => $studentRecords,
            'extracurriculars' => Extracurricular::select('id', 'name')->orderBy('name')->get(),
            'recordOptions' => [
                'achievement_types' => StudentAchievement::ACHIEVEMENT_TYPES,
                'achievement_levels' => StudentAchievement::LEVELS,
            ],
            'teacher' => $staff,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show the form for editing the specified student
     */
    public function edit(Student $student): Response
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            abort(403, 'Staff record not found');
        }

        // Verify this student belongs to this teacher's homeroom
        if ($student->homeroom_teacher_id !== $staff->id) {
            abort(403, 'You can only edit students in your homeroom class');
        }

        // Load all student data including records
        $student->load([
            'extracurriculars',
            'positiveNotes.staff',
            'disciplinaryRecords.staff', 
            'extracurricularHistory.extracurricular',
            'achievements'
        ]);

        // Get all extracurriculars
        $extracurriculars = Extracurricular::select('id', 'name', 'description')
                                ->orderBy('name')
                                ->get();

        // Get available options for record forms

        return Inertia::render('teacher/students/edit', [
            'student' => [
                'id' => $student->id,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'gender' => $student->gender,
                'birth_date' => $student->birth_date?->format('Y-m-d'),
                'birthplace' => $student->birthplace,
                'religion' => $student->religion,
                'class' => $student->class,
                'entry_year' => $student->entry_year,
                'graduation_year' => $student->graduation_year,
                'status' => $student->status,
                'photo' => $student->photo && $student->photo !== 'default.jpg' ? (str_starts_with($student->photo, 'http') ? $student->photo : "/storage/{$student->photo}") : null,
                'notes' => $student->notes,
                'extracurriculars' => $student->extracurriculars,
                // Enhanced personal information
                'parent_name' => $student->parent_name,
                'parent_phone' => $student->parent_phone,
                'parent_email' => $student->parent_email,
                'address' => $student->address,
                'emergency_contact_name' => $student->emergency_contact_name,
                'emergency_contact_phone' => $student->emergency_contact_phone,
                // Transportation information
                'transportation_method' => $student->transportation_method,
                'distance_from_home_km' => $student->distance_from_home_km,
                'travel_time_minutes' => $student->travel_time_minutes,
                'pickup_location' => $student->pickup_location,
                'transportation_notes' => $student->transportation_notes,
                // Health information
                'allergies' => $student->allergies,
                'medical_conditions' => $student->medical_conditions,
                'dietary_restrictions' => $student->dietary_restrictions,
                'blood_type' => $student->blood_type,
                'emergency_medical_info' => $student->emergency_medical_info,
                // Student records
                'positive_notes' => $student->positiveNotes->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'note' => $note->note,
                        'category' => $note->category,
                        'date' => $note->date->format('Y-m-d'),
                        'staff_name' => $note->staff->name,
                        'created_at' => $note->created_at->format('Y-m-d H:i'),
                    ];
                }),
                'disciplinary_records' => $student->disciplinaryRecords->map(function ($record) {
                    return [
                        'id' => $record->id,
                        'incident_type' => $record->incident_type,
                        'incident_description' => $record->description, // Map from correct database field
                        'action_taken' => $record->action_taken,
                        'severity' => $record->severity,
                        'incident_date' => $record->date->format('Y-m-d'), // Map from correct database field
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
                        'uploaded_at' => $document->uploaded_at?->format('Y-m-d H:i') ?? $document->created_at->format('Y-m-d H:i'),
                        'file_path' => $document->file_path,
                        'file_name' => $document->file_name,
                        'mime_type' => $document->mime_type,
                        'file_size' => $document->file_size,
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
                        'created_at' => $achievement->created_at->format('Y-m-d H:i'),
                    ];
                }),
            ],
            'extracurriculars' => $extracurriculars,
            'recordOptions' => [
                'achievement_types' => StudentAchievement::ACHIEVEMENT_TYPES,
                'achievement_levels' => StudentAchievement::LEVELS,
            ],
            'teacher' => $staff,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Update the specified student
     */
    public function update(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this student belongs to this teacher's homeroom
        if ($student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'You can only edit students in your homeroom class']);
        }

        $validated = $request->validate([
            'nisn' => ['required', 'string', 'max:255', Rule::unique('students')->ignore($student)],
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date|before:today',
            'birthplace' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:100',
            'class' => 'required|string|max:50',
            'entry_year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'graduation_year' => 'nullable|integer|min:' . date('Y') . '|max:' . (date('Y') + 10),
            'status' => 'required|in:active,graduated,transferred,dropped',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
            // Personal and family information
            'parent_name' => 'nullable|string|max:255',
            'parent_phone' => 'nullable|string|max:20',
            'parent_email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            // Transportation information
            'transportation_method' => 'nullable|in:walking,bicycle,motorcycle,car,school_bus,public_transport,other',
            'distance_from_home_km' => 'nullable|numeric|min:0|max:999.99',
            'travel_time_minutes' => 'nullable|integer|min:0|max:999',
            'pickup_location' => 'nullable|string|max:255',
            'transportation_notes' => 'nullable|string',
            // Health information
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'dietary_restrictions' => 'nullable|string',
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'emergency_medical_info' => 'nullable|string',
            // Extracurricular activities
            'extracurricular_ids' => 'nullable|array',
            'extracurricular_ids.*' => 'exists:extracurriculars,id',
            'delete_photo' => 'nullable|boolean',
        ]);

        // Handle photo deletion if requested
        if ($request->has('delete_photo') && $request->delete_photo) {
            try {
                // Delete old photo if it exists
                if ($student->photo) {
                    $photoHandler = app(\App\Services\PhotoHandler::class);
                    $photoHandler->deletePhoto($student->photo, 'students');
                }
                $validated['photo'] = null;
            } catch (\Exception $e) {
                Log::error('Student photo deletion failed: ' . $e->getMessage());
                // Continue with update even if deletion fails
            }
        }
        // Handle photo upload if provided
        else if ($request->hasFile('photo')) {
            try {
                $photo = $request->file('photo');
                
                // Delete old photo if it exists
                if ($student->photo) {
                    $photoHandler = app(\App\Services\PhotoHandler::class);
                    $photoHandler->deletePhoto($student->photo, 'students');
                }
                
                // Use the PhotoHandler service for consistent handling
                $photoHandler = app(\App\Services\PhotoHandler::class);
                $photoUrl = $photoHandler->storeStudent($photo);
                $validated['photo'] = $photoUrl;
            } catch (\Exception $e) {
                Log::error('Student photo upload failed: ' . $e->getMessage());
                return back()->withErrors(['photo' => 'Failed to upload photo. Please try again.']);
            }
        }

        // Extract extracurricular IDs for separate handling
        $extracurricularIds = $validated['extracurricular_ids'] ?? [];
        unset($validated['extracurricular_ids']);
        
        // Teachers cannot change class assignments - only headmaster can do this
        if ($validated['class'] !== $student->class) {
            return back()->withErrors(['class' => 'Class assignments can only be changed by the headmaster role. Contact administration for class transfers.']);
        }

        // Remove delete_photo from validated data as it's not a model attribute
        unset($validated['delete_photo']);

        $student->update($validated);

        // Sync extracurricular activities
        $student->extracurriculars()->sync($extracurricularIds);

        return redirect()->route('teacher.students.index')->with('success', 'Student updated successfully');
    }

    /**
     * Remove the specified student from homeroom (teachers can't delete students, only remove from their class)
     */
    public function destroy(Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return back()->withErrors(['error' => 'Staff record not found']);
        }

        // Verify this student belongs to this teacher's homeroom
        if ($student->homeroom_teacher_id !== $staff->id) {
            return back()->withErrors(['error' => 'You can only remove students from your homeroom class']);
        }

        // Remove from homeroom instead of deleting (teachers can't delete students)
        $student->update(['homeroom_teacher_id' => null]);

        return redirect()->route('teacher.students.index')->with('success', 'Student removed from your homeroom class');
    }

    /**
     * Get student academic summary for quick view
     */
    public function getAcademicSummary(Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $grades = $student->grades()->with('subject')->get();
        
        return response()->json([
            'overall_average' => round($grades->avg('score') ?? 0, 2),
            'total_grades' => $grades->count(),
            'subjects_count' => $grades->groupBy('subject_id')->count(),
            'recent_grades' => $grades->latest()->limit(3)->values(),
        ]);
    }

    /**
     * Add extracurricular history record
     */
    public function storeExtracurricularHistory(Request $request, Student $student)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'extracurricular_id' => 'required|exists:extracurriculars,id',
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'role' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'performance_notes' => 'nullable|string',
        ]);

        $history = $student->extracurricularHistory()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Extracurricular history added successfully',
            'history' => $history->load('extracurricular')
        ]);
    }

    /**
     * Update extracurricular history record
     */
    public function updateExtracurricularHistory(Request $request, Student $student, $historyId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $history = $student->extracurricularHistory()->findOrFail($historyId);

        $validated = $request->validate([
            'role' => 'nullable|string|max:100',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'performance_notes' => 'nullable|string',
        ]);

        $history->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Extracurricular history updated successfully',
            'history' => $history->load('extracurricular')
        ]);
    }

    /**
     * Delete extracurricular history record
     */
    public function destroyExtracurricularHistory(Student $student, $historyId)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff || $student->homeroom_teacher_id !== $staff->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $history = $student->extracurricularHistory()->findOrFail($historyId);
        $history->delete();

        return response()->json([
            'success' => true,
            'message' => 'Extracurricular history deleted successfully'
        ]);
    }
}