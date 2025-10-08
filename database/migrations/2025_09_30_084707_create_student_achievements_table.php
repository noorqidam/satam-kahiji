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
        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->enum('achievement_type', [
                'academic_excellence',
                'perfect_attendance', 
                'sports_achievement',
                'arts_achievement',
                'leadership',
                'community_service',
                'character_award',
                'improvement',
                'participation',
                'graduation',
                'custom'
            ])->comment('Type of achievement');
            $table->string('achievement_name')->comment('Name of the achievement');
            $table->text('description')->nullable()->comment('Detailed description of the achievement');
            $table->date('date_achieved')->comment('Date when the achievement was earned');
            $table->text('criteria_met')->nullable()->comment('Criteria or requirements that were met');
            $table->enum('level', ['school', 'district', 'regional', 'national', 'international'])
                  ->default('school')->comment('Level or scope of the achievement');
            $table->decimal('score_value', 8, 2)->nullable()->comment('Numeric value if applicable (e.g., GPA, score)');
            $table->string('issuing_organization')->nullable()->comment('Organization that issued the achievement');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')
                  ->comment('Staff member who verified this achievement');
            $table->timestamp('verified_at')->nullable()->comment('When the achievement was verified');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending')
                  ->comment('Status of the achievement verification');
            $table->text('verification_notes')->nullable()->comment('Notes from the verifier');
            $table->json('metadata')->nullable()->comment('Additional structured data');
            $table->timestamps();

            // Indexes
            $table->index(['student_id', 'achievement_type']);
            $table->index(['student_id', 'date_achieved']);
            $table->index(['student_id', 'status']);
            $table->index('verified_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_achievements');
    }
};