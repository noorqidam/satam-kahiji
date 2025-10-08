<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AssignStudentsToExtracurricularRequest;
use App\Http\Requests\Admin\BulkDeleteExtracurricularRequest;
use App\Http\Requests\Admin\ExtracurricularIndexRequest;
use App\Http\Requests\Admin\RemoveStudentFromExtracurricularRequest;
use App\Http\Requests\Admin\StoreExtracurricularRequest;
use App\Http\Requests\Admin\UpdateExtracurricularRequest;
use App\Models\Extracurricular;
use App\Services\ExtracurricularService;
use App\Services\ExtracurricularTransformer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ExtracurricularController extends Controller
{
    public function __construct(
        private ExtracurricularService $extracurricularService,
        private ExtracurricularTransformer $extracurricularTransformer
    ) {}

    public function index(ExtracurricularIndexRequest $request)
    {
        $filters = $request->getFilters();

        $extracurriculars = $this->extracurricularService->getPaginatedExtracurriculars($filters);
        $transformedExtracurriculars = $this->extracurricularTransformer->transformPaginated($extracurriculars);

        return Inertia::render('admin/extracurriculars/index', [
            'extracurriculars' => $transformedExtracurriculars,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/extracurriculars/create');
    }

    public function store(StoreExtracurricularRequest $request)
    {
        $validated = $request->validated();
        
        $data = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ];

        $photo = $request->hasFile('photo') ? $request->file('photo') : null;

        $this->extracurricularService->createExtracurricular($data, $photo);

        return redirect()->route('admin.extracurriculars.index')
                        ->with('success', 'Extracurricular activity created successfully.');
    }

    public function show(Extracurricular $extracurricular)
    {
        $extracurricularWithStudents = $this->extracurricularService->getExtracurricularById($extracurricular->id);
        $transformedExtracurricular = $this->extracurricularTransformer->transformForShow($extracurricularWithStudents);

        return Inertia::render('admin/extracurriculars/show', [
            'extracurricular' => $transformedExtracurricular,
        ]);
    }

    public function edit(Extracurricular $extracurricular)
    {
        $transformedExtracurricular = $this->extracurricularTransformer->transformForEdit($extracurricular);

        return Inertia::render('admin/extracurriculars/edit', [
            'extracurricular' => $transformedExtracurricular,
        ]);
    }

    public function update(UpdateExtracurricularRequest $request, Extracurricular $extracurricular)
    {
        $data = $request->getProcessedData();
        $photo = $request->getPhotoFile();
        $removePhoto = $request->shouldRemovePhoto();

        $this->extracurricularService->updateExtracurricular($extracurricular, $data, $photo, $removePhoto);

        return redirect()->route('admin.extracurriculars.index')
                        ->with('success', 'Extracurricular activity updated successfully.');
    }

    public function destroy(Extracurricular $extracurricular)
    {
        $this->extracurricularService->deleteExtracurricular($extracurricular);

        return redirect()->route('admin.extracurriculars.index')
                        ->with('success', 'Extracurricular activity deleted successfully.');
    }

    public function bulkDestroy(BulkDeleteExtracurricularRequest $request)
    {
        $validated = $request->validated();
        
        $result = $this->extracurricularService->bulkDeleteExtracurriculars($validated['ids']);

        return redirect()->route('admin.extracurriculars.index')
                        ->with('success', $result['deleted'] . ' extracurricular activities deleted successfully.');
    }

    public function assignStudents(AssignStudentsToExtracurricularRequest $request, Extracurricular $extracurricular)
    {
        $validated = $request->validated();
        
        $this->extracurricularService->assignStudents($extracurricular, $validated['student_ids']);

        return redirect()->back()
                        ->with('success', 'Students assigned successfully.');
    }

    public function removeStudent(RemoveStudentFromExtracurricularRequest $request, Extracurricular $extracurricular)
    {
        $validated = $request->validated();
        
        $this->extracurricularService->removeStudent($extracurricular, $validated['student_id']);

        return redirect()->back()
                        ->with('success', 'Student removed successfully.');
    }

    public function servePhoto($path)
    {
        $decodedPath = base64_decode($path);
        
        try {
            // Try Google Drive first
            if (Storage::disk('google_drive')->exists($decodedPath)) {
                $file = Storage::disk('google_drive')->get($decodedPath);
                
                // Determine MIME type from file extension
                $extension = pathinfo($decodedPath, PATHINFO_EXTENSION);
                $mimeType = match(strtolower($extension)) {
                    'jpg', 'jpeg' => 'image/jpeg',
                    'png' => 'image/png',
                    'gif' => 'image/gif',
                    'svg' => 'image/svg+xml',
                    'webp' => 'image/webp',
                    default => 'application/octet-stream'
                };
                
                return response($file, 200)->header('Content-Type', $mimeType);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to serve photo from Google Drive: ' . $e->getMessage());
        }

        // Fall back to local storage
        $localPath = 'extracurriculars/' . basename($decodedPath);
        if (Storage::disk('public')->exists($localPath)) {
            return response()->file(Storage::disk('public')->path($localPath));
        }

        return abort(404, 'Photo not found');
    }

}