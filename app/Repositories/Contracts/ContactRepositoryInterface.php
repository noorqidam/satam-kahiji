<?php

namespace App\Repositories\Contracts;

use App\Models\Contact;

interface ContactRepositoryInterface
{
    /**
     * Get the first contact record.
     */
    public function getFirst(): ?Contact;

    /**
     * Create a new contact.
     */
    public function create(array $data): Contact;

    /**
     * Update an existing contact.
     */
    public function update(Contact $contact, array $data): bool;

    /**
     * Delete a contact.
     */
    public function delete(Contact $contact): bool;

    /**
     * Check if contact already exists.
     */
    public function exists(): bool;

    /**
     * Get public contact information (selective fields).
     */
    public function getPublicContact(): ?Contact;
}