<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Personal information
            $table->string('birthplace')->nullable()->after('birth_date');
            $table->string('religion', 100)->nullable()->after('birthplace');
            $table->string('parent_name')->nullable()->after('religion');
            $table->string('parent_phone', 20)->nullable()->after('parent_name');
            $table->string('parent_email')->nullable()->after('parent_phone');
            $table->text('address')->nullable()->after('parent_email');
            $table->string('emergency_contact_name')->nullable()->after('address');
            $table->string('emergency_contact_phone', 20)->nullable()->after('emergency_contact_name');
            
            // Transportation information
            $table->enum('transportation_method', [
                'walking', 'bicycle', 'motorcycle', 'car', 
                'school_bus', 'public_transport', 'other'
            ])->nullable()->after('emergency_contact_phone');
            $table->decimal('distance_from_home_km', 5, 2)->nullable()->after('transportation_method');
            $table->integer('travel_time_minutes')->nullable()->after('distance_from_home_km');
            $table->string('pickup_location')->nullable()->after('travel_time_minutes');
            $table->text('transportation_notes')->nullable()->after('pickup_location');
            
            // Health information
            $table->text('allergies')->nullable()->after('transportation_notes');
            $table->text('medical_conditions')->nullable()->after('allergies');
            $table->text('dietary_restrictions')->nullable()->after('medical_conditions');
            $table->enum('blood_type', [
                'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
            ])->nullable()->after('dietary_restrictions');
            $table->text('emergency_medical_info')->nullable()->after('blood_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'birthplace', 'religion', 'parent_name', 'parent_phone', 'parent_email',
                'address', 'emergency_contact_name', 'emergency_contact_phone',
                'transportation_method', 'distance_from_home_km', 'travel_time_minutes',
                'pickup_location', 'transportation_notes', 'allergies', 'medical_conditions',
                'dietary_restrictions', 'blood_type', 'emergency_medical_info'
            ]);
        });
    }
};
