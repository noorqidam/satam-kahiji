<?php

namespace Tests\Feature;

use App\Models\Facility;
use App\Models\User;
use Tests\TestCase;

class FacilityManagementTest extends TestCase
{
    // RefreshDatabase conflicts with custom SQLite setup in TestCase
    // CI environment runs fresh migrations which is sufficient

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create([
            'role' => 'super_admin',
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_access_facilities_index()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.facilities.index'));
        
        $response->assertStatus(200);
    }

    public function test_admin_can_access_facilities_create_form()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.facilities.create'));
        
        $response->assertStatus(200);
    }

    public function test_admin_can_create_facility_without_photo()
    {
        $facilityData = [
            'name' => 'Test Library',
            'description' => 'A modern library with digital resources',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.facilities.store'), $facilityData);
        
        // Debug output for CI
        if (app()->environment('testing')) {
            $location = $response->headers->get('Location');
            $expectedLocation = route('admin.facilities.index');
            
            if ($location !== $expectedLocation) {
                $this->fail("Redirect mismatch. Expected: {$expectedLocation}, Got: {$location}. Session: " . json_encode(session()->all()));
            }
        }
        
        $response->assertStatus(302); // Web controller redirects on success
        $response->assertRedirect(route('admin.facilities.index'));
        $response->assertSessionHas('success', 'Facility created successfully.');
        
        $this->assertDatabaseHas('facilities', [
            'name' => 'Test Library',
            'description' => 'A modern library with digital resources',
        ]);
    }

    public function test_admin_can_view_facility()
    {
        $facility = Facility::factory()->create([
            'name' => 'Test Facility',
            'description' => 'Test Description',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.facilities.show', $facility));
        
        $response->assertStatus(200);
    }

    public function test_admin_can_edit_facility()
    {
        $facility = Facility::factory()->create();

        $response = $this->actingAs($this->admin)->get(route('admin.facilities.edit', $facility));
        
        $response->assertStatus(200);
    }

    public function test_admin_can_update_facility()
    {
        $facility = Facility::factory()->create([
            'name' => 'Old Name',
            'description' => 'Old Description',
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'description' => 'Updated Description',
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.facilities.update', $facility), $updateData);
        
        $response->assertStatus(302); // Web controller redirects on success
        $response->assertRedirect(route('admin.facilities.index'));
        $response->assertSessionHas('success', 'Facility updated successfully.');
        
        $this->assertDatabaseHas('facilities', [
            'id' => $facility->id,
            'name' => 'Updated Name',
            'description' => 'Updated Description',
        ]);
    }

    public function test_admin_can_delete_facility()
    {
        $facility = Facility::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.facilities.destroy', $facility));
        
        $response->assertStatus(302); // Web controller redirects on success
        $response->assertRedirect(route('admin.facilities.index'));
        $response->assertSessionHas('success', 'Facility deleted successfully.');
        
        $this->assertDatabaseMissing('facilities', [
            'id' => $facility->id,
        ]);
    }

    public function test_facility_creation_requires_name_and_description()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.facilities.store'), []);
        
        $response->assertStatus(302); // Web controller redirects on validation error
        $response->assertSessionHasErrors(['name', 'description']);
    }

    public function test_non_admin_cannot_access_facilities()
    {
        $teacher = User::factory()->create([
            'role' => 'teacher',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($teacher)->get(route('admin.facilities.index'));
        
        $response->assertStatus(403);
    }
}