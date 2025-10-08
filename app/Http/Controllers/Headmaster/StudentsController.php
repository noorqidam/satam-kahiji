<?php

namespace App\Http\Controllers\Headmaster;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentsController extends Controller
{
    /**
     * Display a listing of students (view-only for headmasters).
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

        return Inertia::render('headmaster/students/index', [
            'students' => $students,
            'filters' => $filters,
            'userRole' => 'headmaster', // Pass role to frontend for permission checks
        ]);
    }

    /**
     * Display a specific student's details (view-only for headmasters).
     */
    public function show(Student $student): Response
    {
        // Load comprehensive student data similar to teacher view
        $student->load([
            'homeroomTeacher',
            'extracurriculars' => function ($query) {
                $query->withPivot('created_at', 'updated_at');
            }, // Load current extracurricular activities from student_extracurricular table
            'positiveNotes' => function ($query) {
                $query->orderBy('date', 'desc');
            },
            'disciplinaryRecords' => function ($query) {
                $query->orderBy('date', 'desc');
            },
            'extracurricularHistory' => function ($query) {
                $query->orderBy('start_date', 'desc');
            },
            'documents' => function ($query) {
                $query->orderBy('upload_date', 'desc');
            },
            'achievements' => function ($query) {
                $query->orderBy('date_achieved', 'desc');
            }
        ]);

        // Get extracurricular activities (already loaded above)
        $extracurriculars = $student->extracurriculars;

        // Academic data for compatibility with frontend component
        $academicData = [
            'extracurriculars' => $extracurriculars
        ];

        return Inertia::render('headmaster/students/show', [
            'student' => $student,
            'academicData' => $academicData,
            'userRole' => 'headmaster',
            'extracurriculars' => $extracurriculars,
        ]);
    }
}