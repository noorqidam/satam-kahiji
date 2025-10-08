<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Services\SubjectService;
use App\Services\SubjectTransformer;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectManagementController extends Controller
{
    public function __construct(
        private SubjectService $subjectService,
        private SubjectTransformer $subjectTransformer
    ) {}
    /**
     * Display a listing of subjects.
     */
    public function index(Request $request): Response
    {
        $filters = ['search' => $request->get('search')];
        
        $subjects = $this->subjectService->getPaginatedSubjects($filters);
        $transformedSubjects = $this->subjectTransformer->transformPaginated($subjects);

        return Inertia::render('admin/subjects/index', [
            'subjects' => $transformedSubjects,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new subject.
     */
    public function create(): Response
    {
        return Inertia::render('admin/subjects/create');
    }

    /**
     * Store a newly created subject.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'nullable|string|max:20|unique:subjects,code',
            ]);

            $this->subjectService->createSubject($validated);

            return redirect()->route('admin.subjects.index')
                ->with('success', 'Subject created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create subject: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified subject.
     */
    public function show(Subject $subject): Response
    {
        $subjectWithStaff = $this->subjectService->getSubjectById($subject->id);
        $transformedSubject = $this->subjectTransformer->transformForShow($subjectWithStaff);
        $availableStaff = $this->subjectService->getStaffForAssignment();
        $transformedAvailableStaff = $this->subjectTransformer->transformStaffForAssignment($availableStaff);

        return Inertia::render('admin/subjects/show', [
            'subject' => $transformedSubject,
            'availableStaff' => $transformedAvailableStaff,
        ]);
    }

    /**
     * Show the form for editing the specified subject.
     */
    public function edit(Subject $subject): Response
    {
        $subjectWithStaff = $this->subjectService->getSubjectById($subject->id);
        $transformedSubject = $this->subjectTransformer->transformForEdit($subjectWithStaff);
        $availableStaff = $this->subjectService->getEligibleStaff();
        $transformedAvailableStaff = $this->subjectTransformer->transformStaffForAssignment($availableStaff);

        return Inertia::render('admin/subjects/edit', [
            'subject' => $transformedSubject,
            'availableStaff' => $transformedAvailableStaff,
        ]);
    }

    /**
     * Update the specified subject.
     */
    public function update(Request $request, Subject $subject): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => ['nullable', 'string', 'max:20', Rule::unique('subjects')->ignore($subject->id)],
            ]);

            $this->subjectService->updateSubject($subject, $validated);

            return redirect()->route('admin.subjects.index')
                ->with('success', 'Subject updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update subject: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        try {
            $this->subjectService->deleteSubject($subject);

            return redirect()->route('admin.subjects.index')
                ->with('success', 'Subject deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete subject: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete subjects.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        try {
            $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'exists:subjects,id',
            ]);

            $result = $this->subjectService->bulkDeleteSubjects($request->ids);
            $response = $this->subjectTransformer->transformBulkDeleteResponse($result);

            return redirect()->route('admin.subjects.index')
                ->with('success', $response['message']);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete subjects: ' . $e->getMessage());
        }
    }

    /**
     * Assign staff to subject.
     */
    public function assignStaff(Request $request, Subject $subject): RedirectResponse
    {
        try {
            $request->validate([
                'staff_ids' => 'required|array',
                'staff_ids.*' => 'exists:staff,id',
            ]);

            $this->subjectService->assignStaff($subject, $request->staff_ids);

            return redirect()->back()
                ->with('success', 'Teachers assigned to subject successfully.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to assign staff: ' . $e->getMessage());
        }
    }

    /**
     * Remove staff from subject.
     */
    public function removeStaff(Request $request, Subject $subject): RedirectResponse
    {
        try {
            $request->validate([
                'staff_id' => 'required|exists:staff,id',
            ]);

            $this->subjectService->removeStaff($subject, $request->staff_id);

            return redirect()->back()
                ->with('success', 'Staff removed from subject successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to remove staff: ' . $e->getMessage());
        }
    }
}