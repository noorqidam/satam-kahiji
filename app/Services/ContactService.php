<?php

namespace App\Services;

use App\Models\Contact;
use App\Repositories\Contracts\ContactRepositoryInterface;
use Illuminate\Support\Facades\Log;

class ContactService
{
    public function __construct(
        private ContactRepositoryInterface $contactRepository
    ) {}

    /**
     * Get the first contact record.
     */
    public function getContact(): ?Contact
    {
        return $this->contactRepository->getFirst();
    }

    /**
     * Create a new contact with business logic validation.
     */
    public function createContact(array $data, int $userId): Contact
    {
        if ($this->contactRepository->exists()) {
            throw new \InvalidArgumentException('Contact information already exists. Please update it instead.');
        }

        $contact = $this->contactRepository->create($data);

        Log::info('School contact information created', [
            'contact_id' => $contact->getKey(),
            'created_by' => $userId,
            'name' => $contact->name ?? 'N/A',
            'email' => $contact->email ?? 'N/A',
        ]);

        return $contact;
    }

    /**
     * Update existing contact with change tracking.
     */
    public function updateContact(Contact $contact, array $data, int $userId): bool
    {
        $oldData = $contact->getOriginal();
        $result = $this->contactRepository->update($contact, $data);
        
        if ($result) {
            $changes = $contact->getChanges();
            if (!empty($changes)) {
                Log::info('School contact information updated', [
                    'contact_id' => $contact->getKey(),
                    'updated_by' => $userId,
                    'changes' => $changes,
                    'old_values' => array_intersect_key($oldData, $changes),
                ]);
            }
        }

        return $result;
    }

    /**
     * Delete contact with audit logging.
     */
    public function deleteContact(Contact $contact, int $userId): bool
    {
        $contactData = $contact->toArray();
        $contactId = $contact->getKey();
        $result = $this->contactRepository->delete($contact);

        if ($result) {
            Log::warning('School contact information deleted', [
                'contact_id' => $contactId,
                'deleted_by' => $userId,
                'deleted_data' => [
                    'name' => $contactData['name'] ?? 'N/A',
                    'email' => $contactData['email'] ?? 'N/A',
                    'phone' => $contactData['phone'] ?? 'N/A',
                ],
            ]);
        }

        return $result;
    }

    /**
     * Get existing contact for editing, or return null if should create new.
     */
    public function getExistingContactForEditing(): ?Contact
    {
        return $this->contactRepository->getFirst();
    }

    /**
     * Check if contact already exists.
     */
    public function contactExists(): bool
    {
        return $this->contactRepository->exists();
    }

    /**
     * Get public contact information for API responses.
     */
    public function getPublicContact(): ?Contact
    {
        return $this->contactRepository->getPublicContact();
    }
}