<?php

namespace App\Http\Middleware;

use App\Models\Contact;
use App\Models\Page;
use App\Models\Staff;
use App\Services\WorkItemService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get teacher feedback summary if user is a teacher
        $feedbackSummary = null;
        if ($request->user() && $request->user()->role === 'teacher') {
            $staff = Staff::where('user_id', $request->user()->id)->first();
            if ($staff) {
                $workItemService = app(WorkItemService::class);
                $feedbackSummary = $workItemService->getTeacherFeedbackSummary($staff);
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'feedbackSummary' => $feedbackSummary,
            'locale' => App::getLocale(),
            'dynamicPages' => Page::select('id', 'slug', 'title', 'created_at', 'updated_at')->orderBy('created_at', 'desc')->get(),
            'contact' => Contact::orderBy('created_at', 'desc')->first(),
        ];
    }
}
