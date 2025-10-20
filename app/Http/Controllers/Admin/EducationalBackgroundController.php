<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationalBackground;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class EducationalBackgroundController extends Controller
{
    /**
     * Store a newly created educational background record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'graduation_year' => 'required|integer|min:1900|max:2100',
            'description' => 'nullable|string|max:1000',
        ]);

        // Verify the staff exists
        $staff = Staff::findOrFail($validated['staff_id']);

        try {
            EducationalBackground::create($validated);

            return redirect()->back()->with('success', true);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to add educational background.']);
        }
    }

    /**
     * Update the specified educational background record.
     */
    public function update(Request $request, EducationalBackground $educationalBackground): RedirectResponse
    {
        $validated = $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'graduation_year' => 'required|integer|min:1900|max:2100',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $educationalBackground->update($validated);

            return redirect()->back()->with('success', true);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to update educational background.']);
        }
    }

    /**
     * Remove the specified educational background record.
     */
    public function destroy(EducationalBackground $educationalBackground): RedirectResponse
    {
        try {
            $educationalBackground->delete();

            return redirect()->back()->with('success', true);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to delete educational background.']);
        }
    }

    /**
     * Remove multiple educational background records.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:educational_backgrounds,id',
        ]);

        try {
            $deletedCount = EducationalBackground::whereIn('id', $validated['ids'])->delete();

            return redirect()->back()->with('success', true);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to delete educational background records.']);
        }
    }
}