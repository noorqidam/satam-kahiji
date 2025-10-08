<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkDeleteClassRequest;
use App\Http\Requests\Admin\GetClassesRequest;
use App\Http\Requests\Admin\StoreClassRequest;
use App\Http\Requests\Admin\UpdateClassRequest;
use App\Models\SchoolClass;
use App\Services\ClassService;
use App\Services\ClassTransformer;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClassManagementController extends Controller
{
    public function __construct(
        private ClassService $classService,
        private ClassTransformer $classTransformer
    ) {}
    /**
     * Display a listing of classes
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        $classes = $this->classService->getAllClasses();
        $transformedClasses = $this->classTransformer->transformForIndex($classes);
        $stats = $this->classService->getClassStatistics();
        $classesByGrade = $this->classService->groupClassesByGrade($transformedClasses);

        return Inertia::render('admin/classes/index', [
            'classes' => $transformedClasses,
            'classesByGrade' => $classesByGrade,
            'stats' => $stats,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show the form for creating a new class
     */
    public function create(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('admin/classes/create', [
            'userRole' => $user->role,
        ]);
    }

    /**
     * Store a newly created class
     */
    public function store(StoreClassRequest $request)
    {
        $validated = $request->validated();

        $class = $this->classService->createClass($validated);

        return redirect()->route('admin.classes.index')
            ->with('success', 'Class ' . $class->name . ' created successfully');
    }

    /**
     * Display the specified class
     */
    public function show(SchoolClass $class): Response
    {
        $user = Auth::user();
        
        $classWithRelations = $this->classService->getClassById($class->id);
        $transformedClass = $this->classTransformer->transformForShow($classWithRelations);
        $transformedStudents = $this->classTransformer->transformStudentsForShow($classWithRelations->students);

        return Inertia::render('admin/classes/show', [
            'class' => $transformedClass,
            'students' => $transformedStudents,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show the form for editing the specified class
     */
    public function edit(SchoolClass $class): Response
    {
        $user = Auth::user();
        
        $transformedClass = $this->classTransformer->transformForEdit($class);

        return Inertia::render('admin/classes/edit', [
            'class' => $transformedClass,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Update the specified class
     */
    public function update(UpdateClassRequest $request, SchoolClass $class)
    {
        $validated = $request->validated();

        $this->classService->updateClass($class, $validated);

        return redirect()->route('admin.classes.index')
            ->with('success', 'Class updated successfully');
    }

    /**
     * Remove the specified class
     */
    public function destroy(SchoolClass $class)
    {
        try {
            $className = $class->name;
            $this->classService->deleteClass($class);

            return redirect()->route('admin.classes.index')
                ->with('success', 'Class ' . $className . ' deleted successfully');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Bulk delete classes
     */
    public function bulkDestroy(BulkDeleteClassRequest $request)
    {
        $validated = $request->validated();

        $result = $this->classService->bulkDeleteClasses($validated['ids']);
        
        $message = "Deleted {$result['deleted']} class(es)";
        if (!empty($result['errors'])) {
            $message .= '. Errors: ' . implode(', ', $result['errors']);
        }

        return redirect()->route('admin.classes.index')->with('success', $message);
    }

    /**
     * Get classes for API use
     */
    public function getClasses(GetClassesRequest $request)
    {
        $validated = $request->validated();
        $gradeLevel = $validated['grade_level'] ?? null;
        $classes = $this->classService->getClassesByGrade($gradeLevel);
        $transformedClasses = $this->classTransformer->transformForApi($classes);

        return response()->json(['classes' => $transformedClasses]);
    }
}