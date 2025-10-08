<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContactRequest;
use App\Http\Requests\Admin\UpdateContactRequest;
use App\Models\Contact;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(
        private ContactService $contactService
    ) {}
    /**
     * Display the contact information.
     */
    public function index(): Response
    {
        try {
            $contact = $this->contactService->getContact();
            
            return Inertia::render('admin/contacts/index', [
                'contact' => $contact,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load contact information', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return Inertia::render('admin/contacts/index', [
                'contact' => null,
            ])->with('error', 'Failed to load contact information.');
        }
    }

    /**
     * Show the form for creating school contact information.
     */
    public function create(): Response|RedirectResponse
    {
        try {
            $contact = $this->contactService->getExistingContactForEditing();
            if ($contact) {
                return redirect()->route('admin.contacts.edit', $contact->getKey())
                    ->with('info', 'School contact information already exists. Please update it instead.');
            }
            
            return Inertia::render('admin/contacts/form', [
                'contact' => null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load contact creation form', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to load contact form. Please try again.');
        }
    }

    /**
     * Store school contact information.
     */
    public function store(StoreContactRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            try {
                $existingContact = $this->contactService->getExistingContactForEditing();
                if ($existingContact) {
                    return redirect()->route('admin.contacts.edit', $existingContact->getKey())
                        ->with('info', 'School contact information already exists. Please update it instead.');
                }

                $validatedData = $request->validated();
                $this->contactService->createContact($validatedData, $request->user()->getKey());

                return redirect()->route('admin.contacts.index')
                    ->with('success', 'School contact information created successfully.');
            } catch (\InvalidArgumentException $e) {
                return back()
                    ->withInput()
                    ->with('info', $e->getMessage());
            } catch (\Exception $e) {
                Log::error('Failed to create school contact information', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $request->user()->getKey(),
                ]);

                return back()
                    ->withInput()
                    ->with('error', 'Failed to create school contact information. Please try again.');
            }
        });
    }

    /**
     * Display the specified contact information.
     */
    public function show(Contact $contact): Response|RedirectResponse
    {
        try {
            return Inertia::render('admin/contacts/show', [
                'contact' => $contact,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to display contact information', [
                'contact_id' => $contact->getKey(),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to display contact information.');
        }
    }

    /**
     * Show the form for editing school contact information.
     */
    public function edit(Contact $contact): Response|RedirectResponse
    {
        try {
            return Inertia::render('admin/contacts/form', [
                'contact' => $contact,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load contact edit form', [
                'contact_id' => $contact->getKey(),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);
            
            return redirect()->route('admin.contacts.index')
                ->with('error', 'Failed to load contact edit form. Please try again.');
        }
    }

    /**
     * Update school contact information.
     */
    public function update(UpdateContactRequest $request, Contact $contact): RedirectResponse
    {
        return DB::transaction(function () use ($request, $contact) {
            try {
                $validatedData = $request->validated();
                $this->contactService->updateContact($contact, $validatedData, $request->user()->getKey());

                return redirect()->route('admin.contacts.index')
                    ->with('success', 'School contact information updated successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to update school contact information', [
                    'contact_id' => $contact->getKey(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => $request->user()->getKey(),
                ]);

                return back()
                    ->withInput()
                    ->with('error', 'Failed to update school contact information. Please try again.');
            }
        });
    }

    /**
     * Remove school contact information.
     */
    public function destroy(Contact $contact): RedirectResponse
    {
        return DB::transaction(function () use ($contact) {
            try {
                $this->contactService->deleteContact($contact, Auth::id());

                return redirect()->route('admin.contacts.index')
                    ->with('success', 'School contact information deleted successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to delete school contact information', [
                    'contact_id' => $contact->getKey(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => Auth::id(),
                ]);

                return back()
                    ->with('error', 'Failed to delete school contact information. Please try again.');
            }
        });
    }

    /**
     * Get contact information for public display.
     */
    public function getPublicContact(): JsonResponse
    {
        try {
            $contact = $this->contactService->getPublicContact();
            
            return response()->json([
                'success' => true,
                'data' => $contact,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get public contact information', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve contact information.',
                'data' => null,
            ], 500);
        }
    }
}