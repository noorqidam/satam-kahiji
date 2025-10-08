<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkUpdateSubjectAssignmentRequest;
use App\Http\Requests\Admin\SubjectAssignmentIndexRequest;
use App\Services\SubjectAssignmentService;
use App\Services\SubjectAssignmentTransformer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubjectAssignmentController extends Controller
{
    public function __construct(
        private SubjectAssignmentService $assignmentService,
        private SubjectAssignmentTransformer $assignmentTransformer
    ) {}
    /**
     * Display the subject-staff assignment matrix.
     */
    public function index(SubjectAssignmentIndexRequest $request): Response
    {
        $filters = $request->getFilters();

        $overview = $this->assignmentService->getAssignmentOverview($filters);
        
        $transformedStaff = $this->assignmentTransformer->transformStaffPaginated($overview['staff']);
        $transformedSubjects = $this->assignmentTransformer->transformSubjectsPaginated($overview['subjects']);

        return Inertia::render('admin/subject-assignments/index', [
            'staff' => $transformedStaff,
            'subjects' => $transformedSubjects,
            'filters' => $request->getFilterData(),
        ]);
    }

    /**
     * Bulk update all subject-staff assignments.
     */
    public function bulkUpdate(BulkUpdateSubjectAssignmentRequest $request): RedirectResponse
    {
        try {
            $assignments = $request->getAssignments();
            $metadata = $request->getAssignmentMetadata();
            $statistics = $request->getAssignmentStatistics();

            $result = $this->assignmentService->bulkUpdateAssignments($assignments);
            $transformedResult = $this->assignmentTransformer->transformBulkUpdateResponse($result);
            $message = $this->assignmentService->generateAssignmentSummary($result);
            
            $changedCount = $result['changed'] ?? 0;

            if ($transformedResult['has_errors']) {
                \Illuminate\Support\Facades\Log::warning('Bulk assignment completed with errors', [
                    'user_id' => $request->user()->id,
                    'errors_count' => count($transformedResult['errors']),
                    'changed_count' => $changedCount,
                ]);
                
                return redirect()->back()
                    ->with('warning', $message)
                    ->with('assignment_errors', $transformedResult['errors']);
            }

            \Illuminate\Support\Facades\Log::info('Bulk assignment completed', [
                'user_id' => $request->user()->id,
                'processed_count' => $result['processed'] ?? 0,
                'changed_count' => $changedCount,
            ]);

            // Show different toast based on whether changes were made
            if ($changedCount === 0) {
                return redirect()->back()->with('info', $message);
            }

            return redirect()->back()->with('success', $message);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->validator)
                ->with('error', 'Validation failed. Please check your data.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update assignments: ' . $e->getMessage());
        }
    }
}