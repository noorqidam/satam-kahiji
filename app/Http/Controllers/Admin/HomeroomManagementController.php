<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Services\HomeroomService;
use App\Services\HomeroomTransformer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeroomManagementController extends Controller
{
    public function __construct(
        private HomeroomService $homeroomService,
        private HomeroomTransformer $homeroomTransformer
    ) {}
    /**
     * Display homeroom assignments overview
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        $overview = $this->homeroomService->getHomeroomOverview();
        $transformedTeachers = $this->homeroomTransformer->transformTeachersForIndex($overview['teachers']);

        return Inertia::render('admin/homeroom/index', [
            'teachers' => $transformedTeachers,
            'classStats' => $overview['class_stats'],
            'availableClasses' => $overview['available_classes'],
            'unassignedClasses' => $overview['unassigned_classes'],
            'userRole' => $user->role,
        ]);
    }

    /**
     * Assign homeroom class to teacher
     */
    public function assignClass(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'class' => 'required|string|max:50',
        ]);

        try {
            $result = $this->homeroomService->assignClassToTeacher($request->staff_id, $request->class);

            return redirect()->route('admin.homeroom.index')->with('success', 
                "Successfully assigned {$result['staff']->name} as homeroom teacher for class {$result['class_name']}. " .
                "Updated {$result['students_updated']} students."
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors([
                'staff_id' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove homeroom assignment from teacher
     */
    public function removeAssignment(Staff $staff)
    {
        try {
            $result = $this->homeroomService->removeTeacherAssignment($staff);

            return redirect()->route('admin.homeroom.index')->with('success', 
                "Removed homeroom assignment for {$result['staff']->name} from class {$result['class_name']}. " .
                "Updated {$result['students_updated']} students."
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Bulk assign students in a class to homeroom teacher
     */
    public function bulkAssignStudents(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'class' => 'required|string|max:50',
        ]);

        try {
            $result = $this->homeroomService->bulkAssignStudentsToHomeroom($request->staff_id, $request->class);
            $transformedResponse = $this->homeroomTransformer->transformBulkAssignResponse($result);

            return response()->json($transformedResponse);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Get class details with students
     */
    public function getClassDetails(Request $request)
    {
        $request->validate([
            'class' => 'required|string',
        ]);

        $classDetails = $this->homeroomService->getClassDetails($request->class);
        $transformedResponse = $this->homeroomTransformer->transformClassDetailsResponse($classDetails);

        return response()->json($transformedResponse);
    }

    /**
     * Get available teachers for homeroom assignment
     */
    public function getAvailableTeachers()
    {
        $teachers = $this->homeroomService->getAvailableTeachers();
        $transformedTeachers = $this->homeroomTransformer->transformAvailableTeachers($teachers);

        return response()->json(['teachers' => $transformedTeachers]);
    }
}