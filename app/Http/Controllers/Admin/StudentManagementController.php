<?php

namespace App\Http\Controllers\Admin;

use App\Services\PhotoHandler;
use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Staff;
use App\Models\Extracurricular;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentManagementController extends Controller
{
    public function __construct(
        private PhotoHandler $photoHandler
    ) {}

    /**
     * Display a listing of students.
     */
    public function index(Request $request): Response
    {
        $query = Student::with('homeroomTeacher')->latest();

        // Prepare filters
        $filters = [
            'search' => $request->get('search', ''),
            'gender' => $request->get('gender', ''),
            'class' => $request->get('class', ''),
            'status' => $request->get('status', ''),
        ];

        // Search functionality (case-insensitive)
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(nisn) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(class) LIKE ?', ["%{$search}%"]);
            });
        }

        // Gender filter
        if (!empty($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        // Class filter
        if (!empty($filters['class'])) {
            $query->where('class', $filters['class']);
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $students = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(): Response
    {
        $staff = Staff::select('id', 'name', 'position', 'homeroom_class')
                    ->whereRaw('LOWER(position) LIKE ?', ['%guru%'])
                    ->orderBy('name')
                    ->get();

        // Get available classes from master data with homeroom teacher info
        $availableClasses = SchoolClass::query()
                    ->with('homeroomTeacher:id,name,position,homeroom_class')
                    ->orderBy('grade_level')
                    ->orderBy('class_section')
                    ->get(['id', 'name', 'grade_level', 'class_section', 'capacity'])
                    ->map(function ($class) {
                        return [
                            'id' => $class->id,
                            'name' => $class->name,
                            'grade_level' => $class->grade_level,
                            'class_section' => $class->class_section,
                            'capacity' => $class->capacity,
                            'current_students' => Student::where('class', $class->name)->count(),
                            'available_slots' => $class->capacity - Student::where('class', $class->name)->count(),
                            'is_full' => Student::where('class', $class->name)->count() >= $class->capacity,
                            'homeroom_teacher' => $class->homeroomTeacher ? [
                                'id' => $class->homeroomTeacher->id,
                                'name' => $class->homeroomTeacher->name,
                                'position' => $class->homeroomTeacher->position,
                            ] : null,
                        ];
                    });

        // Get all extracurriculars
        $extracurriculars = Extracurricular::select('id', 'name', 'description')
                                ->orderBy('name')
                                ->get();

        return Inertia::render('admin/students/create', [
            'staff' => $staff,
            'availableClasses' => $availableClasses,
            'extracurriculars' => $extracurriculars,
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nisn' => 'required|string|unique:students,nisn',
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date',
            'class' => 'required|string|max:50',
            'homeroom_teacher_id' => 'nullable|exists:staff,id',
            'entry_year' => 'required|integer|min:1900|max:' . (date('Y') + 10),
            'graduation_year' => 'nullable|integer|min:' . date('Y') . '|max:' . (date('Y') + 10),
            'status' => 'required|in:active,graduated,transferred,dropped',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
            'extracurricular_ids' => 'nullable|array',
            'extracurricular_ids.*' => 'exists:extracurriculars,id',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $validated['photo'] = $this->photoHandler->storeStudent(
                $request->file('photo')
            );
        }

        // Extract extracurricular IDs for separate handling
        $extracurricularIds = $validated['extracurricular_ids'] ?? [];
        unset($validated['extracurricular_ids']);

        $student = Student::create($validated);

        // Sync extracurricular activities
        if (!empty($extracurricularIds)) {
            $student->extracurriculars()->sync($extracurricularIds);
        }

        return redirect()->route('admin.students.index')
                       ->with('success', 'Student created successfully.');
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): Response
    {
        $student->load(['homeroomTeacher', 'extracurriculars']);

        return Inertia::render('admin/students/show', [
            'student' => $student,
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(Student $student): Response
    {
        $student->load(['homeroomTeacher', 'extracurriculars']);
        
        $staff = Staff::select('id', 'name', 'position', 'homeroom_class')
                    ->whereRaw('LOWER(position) LIKE ?', ['%guru%'])
                    ->orderBy('name')
                    ->get();

        // Get available classes from master data with homeroom teacher info
        $availableClasses = SchoolClass::query()
                    ->with('homeroomTeacher:id,name,position,homeroom_class')
                    ->withCount('students')
                    ->orderBy('grade_level')
                    ->orderBy('class_section')
                    ->get(['id', 'name', 'grade_level', 'class_section', 'capacity'])
                    ->map(function ($class) {
                        return [
                            'id' => $class->id,
                            'name' => $class->name,
                            'grade_level' => $class->grade_level,
                            'class_section' => $class->class_section,
                            'capacity' => $class->capacity,
                            'current_students' => $class->students_count,
                            'available_slots' => $class->capacity - $class->students_count,
                            'is_full' => $class->students_count >= $class->capacity,
                            'homeroom_teacher' => $class->homeroomTeacher ? [
                                'id' => $class->homeroomTeacher->id,
                                'name' => $class->homeroomTeacher->name,
                                'position' => $class->homeroomTeacher->position,
                            ] : null,
                        ];
                    });

        // Get all extracurriculars
        $extracurriculars = Extracurricular::select('id', 'name', 'description')
                                ->orderBy('name')
                                ->get();

        // Format the birth_date for the HTML input
        $studentData = $student->toArray();
        if ($student->birth_date) {
            $studentData['birth_date'] = $student->birth_date->format('Y-m-d');
        }

        return Inertia::render('admin/students/edit', [
            'student' => $studentData,
            'staff' => $staff,
            'availableClasses' => $availableClasses,
            'extracurriculars' => $extracurriculars,
        ]);
    }

    /**
     * Update the specified student in storage.
     */
    public function update(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'nisn' => ['required', 'string', Rule::unique('students')->ignore($student->id)],
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date',
            'class' => 'required|string|max:50',
            'homeroom_teacher_id' => 'nullable|exists:staff,id',
            'entry_year' => 'required|integer|min:1900|max:' . (date('Y') + 10),
            'graduation_year' => 'nullable|integer|min:' . date('Y') . '|max:' . (date('Y') + 10),
            'status' => 'required|in:active,graduated,transferred,dropped',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string',
            'delete_photo' => 'nullable|boolean',
            'extracurricular_ids' => 'nullable|array',
            'extracurricular_ids.*' => 'exists:extracurriculars,id',
        ]);

        // Handle photo deletion or upload
        if ($request->boolean('delete_photo')) {
            // Delete existing photo from Google Drive
            if ($student->photo) {
                $this->photoHandler->deletePhoto($student->photo, 'students');
            }
            $validated['photo'] = null;
        } elseif ($request->hasFile('photo')) {
            // Upload new photo and delete old one
            $validated['photo'] = $this->photoHandler->updateStudent(
                $request->file('photo'),
                $student->photo
            );
        } else {
            // No photo changes - remove photo from validated data to prevent overwriting
            unset($validated['photo']);
        }

        // Extract extracurricular IDs for separate handling
        $extracurricularIds = $validated['extracurricular_ids'] ?? [];
        unset($validated['extracurricular_ids']);

        // Remove delete_photo from validated data as it's not a database field
        unset($validated['delete_photo']);

        $student->update($validated);

        // Sync extracurricular activities
        $student->extracurriculars()->sync($extracurricularIds);

        return redirect()->route('admin.students.index')
                       ->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy(Student $student): RedirectResponse
    {
        try {
            // Delete associated photo
            if ($student->photo) {
                $this->photoHandler->deletePhoto($student->photo, 'students');
            }

            $studentName = $student->name;
            $student->delete();

            return redirect()->route('admin.students.index')
                           ->with('success', "Student '{$studentName}' has been deleted successfully.");

        } catch (\Exception $e) {
            Log::error('Error deleting student: ' . $e->getMessage(), [
                'student_id' => $student->id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.students.index')
                           ->with('error', 'Failed to delete student. Please try again.');
        }
    }


    /**
     * Remove multiple students from storage.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:students,id'
        ]);

        try {
            $students = Student::whereIn('id', $request->ids)->get();
            $count = $students->count();

            foreach ($students as $student) {
                // Delete associated photo
                if ($student->photo) {
                    $this->photoHandler->deletePhoto($student->photo, 'students');
                }
            }

            Student::whereIn('id', $request->ids)->delete();

            return redirect()->route('admin.students.index')
                           ->with('success', "{$count} students have been deleted successfully.");

        } catch (\Exception $e) {
            Log::error('Error bulk deleting students: ' . $e->getMessage(), [
                'student_ids' => $request->ids,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.students.index')
                           ->with('error', 'Failed to delete students. Please try again.');
        }
    }
}