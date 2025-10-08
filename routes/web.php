<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

// Landing page and public content
Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

// News and announcements
Route::get('/news', [\App\Http\Controllers\NewsController::class, 'index'])->name('news.index');
Route::get('/news/{slug}', [\App\Http\Controllers\NewsController::class, 'show'])->name('news.show');

// Gallery
Route::get('/gallery', [\App\Http\Controllers\GalleryController::class, 'index'])->name('gallery.index');
Route::get('/gallery/{slug}', [\App\Http\Controllers\GalleryController::class, 'show'])->name('gallery.show');

// Extracurricular
Route::get('/extracurricular', [\App\Http\Controllers\ExtracurricularController::class, 'index'])->name('extracurricular.index');

// Teachers
Route::get('/teachers', [\App\Http\Controllers\TeachersController::class, 'index'])->name('teachers.index');
Route::get('/teachers/{slug}', [\App\Http\Controllers\TeachersController::class, 'show'])->name('teachers.show');

// Principal
Route::get('/principal', [\App\Http\Controllers\PrincipalController::class, 'index'])->name('principal.index');

// Staff Management
Route::get('/staff-management', [\App\Http\Controllers\StaffManagementController::class, 'index'])->name('staff-management.index');

Route::get('/{slug}', [\App\Http\Controllers\PageController::class, 'show'])->name('page.show');

// Public API endpoints
Route::prefix('api')->name('api.')->group(function () {
    Route::get('/pages', function () {
        $pages = \App\Models\Page::select('slug', 'title', 'content', 'image')->get();
        return response()->json($pages);
    })->name('pages');
});

// =============================================================================
// AUTHENTICATED ROUTES
// =============================================================================

Route::middleware(['auth', 'verified'])->group(function () {

    // -------------------------------------------------------------------------
    // PHOTO SERVING ROUTES (Accessible to all authenticated users)
    // -------------------------------------------------------------------------
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('extracurriculars/photo/{path}', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'servePhoto'])
            ->name('extracurriculars.photo');
        Route::get('staff/photo/{path}', [\App\Http\Controllers\Admin\StaffManagementController::class, 'servePhoto'])
            ->name('staff.photo');
    });

    // -------------------------------------------------------------------------
    // WORK ITEMS SHARED OPERATIONS (Admin & Teacher Access)
    // -------------------------------------------------------------------------
    Route::prefix('admin/work-items')->name('admin.work-items.')->group(function () {
        // Folder management
        Route::post('initialize-folders', [\App\Http\Controllers\Admin\WorkItemController::class, 'initializeTeacherFolders'])
            ->name('initialize-folders');
        
        // File operations
        Route::post('upload-file', [\App\Http\Controllers\Admin\WorkItemController::class, 'uploadFile'])
            ->name('upload-file');
        Route::delete('files/{file}', [\App\Http\Controllers\Admin\WorkItemController::class, 'deleteFile'])
            ->name('delete-file');
        Route::post('file-metadata', [\App\Http\Controllers\Admin\WorkItemController::class, 'getFileMetadata'])
            ->name('file-metadata');
        
        // Lookup and system info
        Route::get('lookup-teacher-subject-work-id', [\App\Http\Controllers\Admin\WorkItemController::class, 'getTeacherSubjectWorkId'])
            ->name('lookup-teacher-subject-work-id');
        Route::get('teacher/{teacher}/progress', [\App\Http\Controllers\Admin\WorkItemController::class, 'getTeacherProgress'])
            ->name('teacher-progress');
        
        // System utilities
        Route::get('csrf-token', fn() => response()->json(['csrf_token' => csrf_token()]))
            ->name('csrf-token');
        Route::get('php-info', function () {
            return response()->json([
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
            ]);
        })->name('php-info');
    });

    // File tracking and feedback operations
    Route::prefix('work-items')->name('work-items.')->group(function () {
        // File access tracking
        Route::post('files/{file}/track-access', [\App\Http\Controllers\Admin\WorkItemController::class, 'trackFileAccess'])
            ->name('track-access');
        Route::get('files/{file}/view', [\App\Http\Controllers\Admin\WorkItemController::class, 'viewFile'])
            ->name('view-file');
        
        // Feedback management (for teachers)
        Route::post('feedback/{feedback}/mark-read', [\App\Http\Controllers\Admin\WorkItemController::class, 'markFeedbackAsRead'])
            ->name('feedback.mark-read');
        Route::post('feedback/mark-all-read', [\App\Http\Controllers\Admin\WorkItemController::class, 'markAllFeedbackAsRead'])
            ->name('feedback.mark-all-read');
    });

    // -------------------------------------------------------------------------
    // ADMIN ROUTES (Super Admin & Headmaster)
    // -------------------------------------------------------------------------
    Route::middleware('role:super_admin|headmaster')->prefix('admin')->name('admin.')->group(function () {
        
        // Dashboard
        Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])
            ->name('dashboard');

        // User Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\UserManagementController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
        });
        Route::resource('users', \App\Http\Controllers\Admin\UserManagementController::class)
            ->except(['create', 'show', 'edit']);

        // Staff Management
        Route::prefix('staff')->name('staff.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\StaffManagementController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
            Route::post('{staff}/assign-subjects', [\App\Http\Controllers\Admin\StaffManagementController::class, 'assignSubjects'])
                ->name('assign-subjects');
            Route::delete('{staff}/remove-subject', [\App\Http\Controllers\Admin\StaffManagementController::class, 'removeSubject'])
                ->name('remove-subject');
        });
        Route::resource('staff', \App\Http\Controllers\Admin\StaffManagementController::class);

        // Position History Management (inline with staff)
        Route::prefix('position-history')->name('position-history.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\PositionHistoryController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
            Route::post('/', [\App\Http\Controllers\Admin\PositionHistoryController::class, 'store'])
                ->name('store');
            Route::put('{positionHistory}', [\App\Http\Controllers\Admin\PositionHistoryController::class, 'update'])
                ->name('update');
            Route::delete('{positionHistory}', [\App\Http\Controllers\Admin\PositionHistoryController::class, 'destroy'])
                ->name('destroy');
        });

        // Subject Management
        Route::prefix('subjects')->name('subjects.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\SubjectManagementController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
            Route::post('{subject}/assign-staff', [\App\Http\Controllers\Admin\SubjectManagementController::class, 'assignStaff'])
                ->name('assign-staff');
            Route::delete('{subject}/remove-staff', [\App\Http\Controllers\Admin\SubjectManagementController::class, 'removeStaff'])
                ->name('remove-staff');
        });
        Route::resource('subjects', \App\Http\Controllers\Admin\SubjectManagementController::class);

        // Subject-Staff Assignment Management
        Route::prefix('subject-assignments')->name('subject-assignments.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\SubjectAssignmentController::class, 'index'])
                ->name('index');
            Route::post('bulk-update', [\App\Http\Controllers\Admin\SubjectAssignmentController::class, 'bulkUpdate'])
                ->name('bulk-update');
        });

        // Student Management
        Route::prefix('students')->name('students.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\StudentManagementController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
        });
        Route::resource('students', \App\Http\Controllers\Admin\StudentManagementController::class);

        // Class Management
        Route::prefix('classes')->name('classes.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\ClassManagementController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
            Route::get('get-classes', [\App\Http\Controllers\Admin\ClassManagementController::class, 'getClasses'])
                ->name('get-classes');
        });
        Route::resource('classes', \App\Http\Controllers\Admin\ClassManagementController::class);

        // Homeroom Management
        Route::prefix('homeroom')->name('homeroom.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\HomeroomManagementController::class, 'index'])
                ->name('index');
            Route::post('assign-class', [\App\Http\Controllers\Admin\HomeroomManagementController::class, 'assignClass'])
                ->name('assign-class');
            Route::delete('{staff}/remove-assignment', [\App\Http\Controllers\Admin\HomeroomManagementController::class, 'removeAssignment'])
                ->name('remove-assignment');
            Route::post('bulk-assign-students', [\App\Http\Controllers\Admin\HomeroomManagementController::class, 'bulkAssignStudents'])
                ->name('bulk-assign-students');
            Route::get('class-details', [\App\Http\Controllers\Admin\HomeroomManagementController::class, 'getClassDetails'])
                ->name('class-details');
            Route::get('available-teachers', [\App\Http\Controllers\Admin\HomeroomManagementController::class, 'getAvailableTeachers'])
                ->name('available-teachers');
        });

        // Extracurricular Management
        Route::prefix('extracurriculars')->name('extracurriculars.')->group(function () {
            Route::delete('bulk', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'bulkDestroy'])
                ->name('bulk-destroy');
            Route::post('{extracurricular}/assign-students', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'assignStudents'])
                ->name('assign-students');
            Route::delete('{extracurricular}/remove-student', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'removeStudent'])
                ->name('remove-student');
            // Custom update route for file uploads (must be before resource route)
            Route::post('{extracurricular}/update', [\App\Http\Controllers\Admin\ExtracurricularController::class, 'update'])
                ->name('update-post');
        });
        Route::resource('extracurriculars', \App\Http\Controllers\Admin\ExtracurricularController::class);

        // Work Items Management
        Route::prefix('work-items')->name('work-items.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\WorkItemController::class, 'index'])
                ->name('index');
            Route::get('manage', [\App\Http\Controllers\Admin\WorkItemController::class, 'manage'])
                ->name('manage');
            Route::post('/', [\App\Http\Controllers\Admin\WorkItemController::class, 'store'])
                ->name('store');
            Route::put('{workItem}', [\App\Http\Controllers\Admin\WorkItemController::class, 'update'])
                ->name('update');
            Route::delete('{workItem}', [\App\Http\Controllers\Admin\WorkItemController::class, 'destroy'])
                ->name('destroy');
            Route::get('stats', [\App\Http\Controllers\Admin\WorkItemController::class, 'getProgressStats'])
                ->name('stats');
        });

        // Content Management
        Route::prefix('posts')->name('posts.')->group(function () {
            Route::post('{post}/toggle-publish', [\App\Http\Controllers\Admin\PostController::class, 'togglePublish'])
                ->name('toggle-publish');
        });
        Route::resource('posts', \App\Http\Controllers\Admin\PostController::class);

        Route::resource('pages', \App\Http\Controllers\Admin\PageController::class);

        // Gallery Management
        Route::prefix('galleries')->name('galleries.')->group(function () {
            Route::post('{gallery}/toggle-publish', [\App\Http\Controllers\Admin\GalleryController::class, 'togglePublish'])
                ->name('toggle-publish');
            Route::post('reorder', [\App\Http\Controllers\Admin\GalleryController::class, 'reorder'])
                ->name('reorder');
            
            // File operations
            Route::get('{gallery}/files', [\App\Http\Controllers\Admin\GalleryController::class, 'getFiles'])
                ->name('files');
            Route::post('{gallery}/upload', [\App\Http\Controllers\Admin\GalleryController::class, 'uploadFile'])
                ->name('upload');
            Route::delete('{gallery}/files', [\App\Http\Controllers\Admin\GalleryController::class, 'deleteFile'])
                ->name('delete-file');
            Route::post('{gallery}/initialize-folder', [\App\Http\Controllers\Admin\GalleryController::class, 'initializeFolder'])
                ->name('initialize-folder');
            
            // Featured image operations
            Route::post('{gallery}/upload-featured-image', [\App\Http\Controllers\Admin\GalleryController::class, 'uploadFeaturedImage'])
                ->name('upload-featured-image');
            Route::delete('{gallery}/featured-image', [\App\Http\Controllers\Admin\GalleryController::class, 'removeFeaturedImage'])
                ->name('remove-featured-image');
            
            // Gallery item operations
            Route::post('upload-item-file', [\App\Http\Controllers\Admin\GalleryController::class, 'uploadItemFile'])
                ->name('upload-item-file');
            Route::delete('{gallery}/items/{item}', [\App\Http\Controllers\Admin\GalleryController::class, 'destroyItem'])
                ->name('items.destroy');
            Route::post('{gallery}/items/{item}/toggle-featured', [\App\Http\Controllers\Admin\GalleryController::class, 'toggleItemFeatured'])
                ->name('items.toggle-featured');
            Route::delete('{gallery}/items/{item}/clear-image', [\App\Http\Controllers\Admin\GalleryController::class, 'clearItemImage'])
                ->name('items.clear-image');
        });
        Route::resource('galleries', \App\Http\Controllers\Admin\GalleryController::class);

        // Facility & Contact Management
        Route::resource('facilities', \App\Http\Controllers\Admin\FacilityController::class);
        Route::resource('contacts', \App\Http\Controllers\Admin\ContactController::class);

        // System Monitoring
        Route::prefix('system-activity')->name('system-activity')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\SystemActivityController::class, 'index']);
            Route::delete('bulk', [\App\Http\Controllers\Admin\SystemActivityController::class, 'bulkDestroy'])
                ->name('.bulk-destroy');
        });

        // Google Drive Integration
        Route::prefix('google-drive')->name('google-drive.')->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Admin\GoogleDriveTokenController::class, 'dashboard'])
                ->name('dashboard');
            Route::post('refresh', [\App\Http\Controllers\Admin\GoogleDriveTokenController::class, 'refreshToken'])
                ->name('refresh');
            Route::post('test', [\App\Http\Controllers\Admin\GoogleDriveTokenController::class, 'testConnection'])
                ->name('test');
            Route::put('token', [\App\Http\Controllers\Admin\GoogleDriveTokenController::class, 'updateToken'])
                ->name('token.update');
        });
    });

    // -------------------------------------------------------------------------
    // ROLE-SPECIFIC DASHBOARDS
    // -------------------------------------------------------------------------
    
    // Super Admin Dashboard (handled above in admin routes)
    
    // Headmaster Routes
    Route::get('headmaster/dashboard', fn() => Inertia::render('headmaster/dashboard'))
        ->name('headmaster.dashboard')
        ->middleware('role:headmaster');

    Route::middleware('role:headmaster')->prefix('headmaster')->name('headmaster.')->group(function () {
        // Staff oversight
        Route::prefix('staff-overview')->name('staff-overview.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Headmaster\StaffOverviewController::class, 'index'])
                ->name('index');
            Route::get('{staff}', [\App\Http\Controllers\Headmaster\StaffOverviewController::class, 'show'])
                ->name('show');
        });
        
        // Feedback management
        Route::prefix('feedback')->name('feedback.')->group(function () {
            Route::post('/', [\App\Http\Controllers\Headmaster\StaffOverviewController::class, 'storeFeedback'])
                ->name('store');
            Route::get('{file}', [\App\Http\Controllers\Headmaster\StaffOverviewController::class, 'getFeedback'])
                ->name('get');
        });
        
        // Student oversight (view-only)
        Route::get('students', [\App\Http\Controllers\Headmaster\StudentsController::class, 'index'])
            ->name('students.index');
        Route::get('students/{student}', [\App\Http\Controllers\Headmaster\StudentsController::class, 'show'])
            ->name('students.show');
    });

    // Teacher Routes
    Route::get('teacher/dashboard', fn() => Inertia::render('teacher/dashboard'))
        ->name('teacher.dashboard')
        ->middleware('role:teacher');

    Route::middleware('role:teacher')->prefix('teacher')->name('teacher.')->group(function () {
        // Work Items (teacher-specific)
        Route::prefix('work-items')->name('work-items.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\WorkItemController::class, 'index'])
                ->name('index');
            Route::post('/', [\App\Http\Controllers\Admin\WorkItemController::class, 'storeTeacherWorkItem'])
                ->name('store');
            Route::delete('{workItem}', [\App\Http\Controllers\Admin\WorkItemController::class, 'destroyTeacherWorkItem'])
                ->name('destroy');
        });

        // Subject Management
        Route::prefix('subjects')->name('subjects.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Teacher\SubjectController::class, 'index'])
                ->name('index');
            Route::get('{subject}', [\App\Http\Controllers\Teacher\SubjectController::class, 'show'])
                ->name('show');
            Route::post('{subject}/initialize-folders', [\App\Http\Controllers\Teacher\SubjectController::class, 'initializeFolders'])
                ->name('initialize-folders');
        });

        // Student Management (for homeroom teachers)
        Route::prefix('students')->name('students.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Teacher\StudentController::class, 'index'])
                ->name('index');
            Route::get('create', [\App\Http\Controllers\Teacher\StudentController::class, 'create'])
                ->name('create');
            Route::post('/', [\App\Http\Controllers\Teacher\StudentController::class, 'store'])
                ->name('store');
            Route::get('{student}', [\App\Http\Controllers\Teacher\StudentController::class, 'show'])
                ->name('show');
            Route::get('{student}/edit', [\App\Http\Controllers\Teacher\StudentController::class, 'edit'])
                ->name('edit');
            Route::put('{student}', [\App\Http\Controllers\Teacher\StudentController::class, 'update'])
                ->name('update');
            Route::delete('{student}', [\App\Http\Controllers\Teacher\StudentController::class, 'destroy'])
                ->name('destroy');
            Route::get('{student}/academic-summary', [\App\Http\Controllers\Teacher\StudentController::class, 'getAcademicSummary'])
                ->name('academic-summary');
            
            // Extracurricular History Management
            Route::post('{student}/extracurricular-history', [\App\Http\Controllers\Teacher\StudentController::class, 'storeExtracurricularHistory'])
                ->name('extracurricular-history.store');
            Route::put('{student}/extracurricular-history/{history}', [\App\Http\Controllers\Teacher\StudentController::class, 'updateExtracurricularHistory'])
                ->name('extracurricular-history.update');
            Route::delete('{student}/extracurricular-history/{history}', [\App\Http\Controllers\Teacher\StudentController::class, 'destroyExtracurricularHistory'])
                ->name('extracurricular-history.destroy');
            
            // Comprehensive Student Records Management
            Route::get('{student}/records', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'show'])
                ->name('records');
            
            // Positive Notes
            Route::post('{student}/positive-notes', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'storePositiveNote'])
                ->name('positive-notes.store');
            Route::put('{student}/positive-notes/{note}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'updatePositiveNote'])
                ->name('positive-notes.update');
            Route::delete('{student}/positive-notes/{note}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'destroyPositiveNote'])
                ->name('positive-notes.destroy');
            
            // Disciplinary Records
            Route::post('{student}/disciplinary-records', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'storeDisciplinaryRecord'])
                ->name('disciplinary-records.store');
            Route::put('{student}/disciplinary-records/{record}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'updateDisciplinaryRecord'])
                ->name('disciplinary-records.update');
            Route::delete('{student}/disciplinary-records/{record}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'destroyDisciplinaryRecord'])
                ->name('disciplinary-records.destroy');
            
            // Document Management
            Route::post('{student}/documents', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'storeDocument'])
                ->name('documents.store');
            Route::delete('{student}/documents/{document}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'destroyDocument'])
                ->name('documents.destroy');
            Route::get('{student}/documents/{document}/download', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'downloadDocument'])
                ->name('documents.download');
            
            // Achievement Certificates
            
            // Student Achievements
            Route::post('{student}/achievements', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'storeAchievement'])
                ->name('achievements.store');
            Route::put('{student}/achievements/{achievement}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'updateAchievement'])
                ->name('achievements.update');
            Route::delete('{student}/achievements/{achievement}', [\App\Http\Controllers\Teacher\StudentRecordsController::class, 'destroyAchievement'])
                ->name('achievements.destroy');
            
            // Legacy Student Notes Management (keeping for backward compatibility)
            Route::get('{student}/notes', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'show'])
                ->name('notes');
            Route::post('{student}/legacy-positive-notes', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'storePositiveNote'])
                ->name('legacy-positive-notes.store');
            Route::post('{student}/legacy-disciplinary-records', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'storeDisciplinaryRecord'])
                ->name('legacy-disciplinary-records.store');
            Route::put('{student}/legacy-positive-notes/{note}', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'updatePositiveNote'])
                ->name('legacy-positive-notes.update');
            Route::put('{student}/legacy-disciplinary-records/{record}', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'updateDisciplinaryRecord'])
                ->name('legacy-disciplinary-records.update');
            Route::delete('{student}/legacy-positive-notes/{note}', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'destroyPositiveNote'])
                ->name('positive-notes.destroy');
            Route::delete('{student}/disciplinary-records/{record}', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'destroyDisciplinaryRecord'])
                ->name('disciplinary-records.destroy');
            Route::get('{student}/notes-summary', [\App\Http\Controllers\Teacher\StudentNotesController::class, 'getNoteSummary'])
                ->name('notes-summary');
        });

    });

    // Staff Dashboard (Deputy Headmaster)
    Route::get('staff/dashboard', fn() => Inertia::render('staff/dashboard'))
        ->name('staff.dashboard')
        ->middleware('role:deputy_headmaster');

});

// =============================================================================
// FALLBACK ROUTES
// =============================================================================

// Password reset fallback routes (redirect to admin routes)
Route::get('/reset-password/{token}', function ($token) {
    return redirect()->route('admin.password.reset', [
        'token' => $token, 
        'email' => request('email')
    ]);
})->name('password.reset');

Route::post('/reset-password', function (\Illuminate\Http\Request $request) {
    return app(\App\Http\Controllers\Auth\NewPasswordController::class)->store($request);
})->name('password.store');

// =============================================================================
// INCLUDE ADDITIONAL ROUTE FILES
// =============================================================================

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';