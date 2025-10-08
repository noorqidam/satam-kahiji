<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // In PostgreSQL, we need to recreate the table to change column order
        // This approach handles foreign key constraints properly
        
        DB::statement('
            CREATE TABLE students_new (
                id bigserial PRIMARY KEY,
                homeroom_teacher_id bigint NULL REFERENCES staff(id) ON DELETE SET NULL,
                nisn varchar(255) NOT NULL UNIQUE,
                name varchar(255) NOT NULL,
                gender varchar(255) NOT NULL CHECK (gender IN (\'male\', \'female\')),
                birth_date date NOT NULL,
                class varchar(255) NOT NULL,
                entry_year integer NOT NULL,
                graduation_year integer NULL,
                status varchar(255) NOT NULL DEFAULT \'active\' CHECK (status IN (\'active\', \'graduated\')),
                photo varchar(255) NULL,
                notes text NULL,
                created_at timestamp NULL,
                updated_at timestamp NULL
            )
        ');
        
        // Copy data
        DB::statement('
            INSERT INTO students_new (id, homeroom_teacher_id, nisn, name, gender, birth_date, class, entry_year, graduation_year, status, photo, notes, created_at, updated_at) 
            SELECT id, homeroom_teacher_id, nisn, name, gender, birth_date, class, entry_year, graduation_year, status, photo, notes, created_at, updated_at 
            FROM students
        ');
        
        // Drop old table and rename new one
        DB::statement('DROP TABLE students CASCADE');
        DB::statement('ALTER TABLE students_new RENAME TO students');
        
        // Recreate foreign key constraints that were dropped
        DB::statement('ALTER TABLE student_grades ADD CONSTRAINT student_grades_student_id_foreign FOREIGN KEY (student_id) REFERENCES students(id)');
        DB::statement('ALTER TABLE student_extracurricular ADD CONSTRAINT student_extracurricular_student_id_foreign FOREIGN KEY (student_id) REFERENCES students(id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Store existing data
        DB::statement('CREATE TEMPORARY TABLE students_backup AS SELECT * FROM students');
        
        // Drop the table
        Schema::dropIfExists('students');
        
        // Recreate table with original column order
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nisn')->unique();
            $table->string('name');
            $table->enum('gender', ['male', 'female']);
            $table->date('birth_date');
            $table->string('class');
            $table->year('entry_year');
            $table->year('graduation_year')->nullable();
            $table->enum('status', ['active', 'graduated'])->default('active');
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreignId('homeroom_teacher_id')
                  ->nullable()
                  ->constrained('staff')
                  ->nullOnDelete();
        });
        
        // Restore data
        DB::statement('INSERT INTO students (id, nisn, name, gender, birth_date, class, entry_year, graduation_year, status, photo, notes, created_at, updated_at, homeroom_teacher_id) 
                      SELECT id, nisn, name, gender, birth_date, class, entry_year, graduation_year, status, photo, notes, created_at, updated_at, homeroom_teacher_id 
                      FROM students_backup');
        
        // Drop temporary table
        DB::statement('DROP TABLE students_backup');
    }
};
