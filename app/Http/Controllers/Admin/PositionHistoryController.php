<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkDeletePositionHistoryRequest;
use App\Http\Requests\Admin\StorePositionHistoryRequest;
use App\Http\Requests\Admin\UpdatePositionHistoryRequest;
use App\Models\PositionHistory;

class PositionHistoryController extends Controller
{
    /**
     * Store a newly created position history record.
     * Used for inline management within staff edit page.
     */
    public function store(StorePositionHistoryRequest $request)
    {
        $validated = $request->validated();

        PositionHistory::create($validated);

        // Check if request came from staff edit page
        $referer = request()->headers->get('referer');
        if ($referer && str_contains($referer, '/admin/staff/') && str_contains($referer, '/edit')) {
            return redirect()->back()->with('success', 'Position history created successfully.');
        }

        return redirect()->route('admin.staff.index')
            ->with('success', 'Position history created successfully.');
    }

    /**
     * Update the specified position history record.
     * Used for inline management within staff edit page.
     */
    public function update(UpdatePositionHistoryRequest $request, PositionHistory $positionHistory)
    {
        $validated = $request->validated();

        $positionHistory->update($validated);

        // Check if request came from staff edit page
        $referer = request()->headers->get('referer');
        if ($referer && str_contains($referer, '/admin/staff/') && str_contains($referer, '/edit')) {
            return redirect()->back()->with('success', 'Position history updated successfully.');
        }

        return redirect()->route('admin.staff.index')
            ->with('success', 'Position history updated successfully.');
    }

    /**
     * Remove the specified position history record.
     * Used for inline management within staff edit page.
     */
    public function destroy(PositionHistory $positionHistory)
    {
        $positionHistory->delete();

        // Check if request came from staff edit page
        $referer = request()->headers->get('referer');
        if ($referer && str_contains($referer, '/admin/staff/') && str_contains($referer, '/edit')) {
            return redirect()->back()->with('success', 'Position history deleted successfully.');
        }

        return redirect()->route('admin.staff.index')
            ->with('success', 'Position history deleted successfully.');
    }

    /**
     * Remove multiple position history records.
     * Used for bulk delete within staff edit page.
     */
    public function bulkDestroy(BulkDeletePositionHistoryRequest $request)
    {
        $validated = $request->validated();

        $deletedCount = PositionHistory::whereIn('id', $validated['ids'])->delete();

        // Check if request came from staff edit page
        $referer = request()->headers->get('referer');
        if ($referer && str_contains($referer, '/admin/staff/') && str_contains($referer, '/edit')) {
            return redirect()->back()->with('success', "{$deletedCount} position history records deleted successfully.");
        }

        return redirect()->route('admin.staff.index')
            ->with('success', "{$deletedCount} position history records deleted successfully.");
    }
}