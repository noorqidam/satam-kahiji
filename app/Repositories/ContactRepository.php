<?php

namespace App\Repositories;

use App\Models\Contact;
use App\Repositories\Contracts\ContactRepositoryInterface;

class ContactRepository implements ContactRepositoryInterface
{
    public function __construct(
        private Contact $model
    ) {}

    /**
     * Get the first contact record.
     */
    public function getFirst(): ?Contact
    {
        return $this->model->first();
    }

    /**
     * Create a new contact.
     */
    public function create(array $data): Contact
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing contact.
     */
    public function update(Contact $contact, array $data): bool
    {
        return $contact->update($data);
    }

    /**
     * Delete a contact.
     */
    public function delete(Contact $contact): bool
    {
        return $contact->delete();
    }

    /**
     * Check if contact already exists.
     */
    public function exists(): bool
    {
        return $this->model->exists();
    }

    /**
     * Get public contact information (selective fields).
     */
    public function getPublicContact(): ?Contact
    {
        return $this->model->select([
            'name',
            'email', 
            'phone',
            'address',
            'website',
            'social_media'
        ])->first();
    }
}