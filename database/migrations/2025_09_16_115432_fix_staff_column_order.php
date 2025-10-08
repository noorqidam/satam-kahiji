<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to recreate the table with proper column order
        DB::statement('
            CREATE TABLE staff_new (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NULL,
                name VARCHAR(255) NOT NULL,
                position VARCHAR(255) NOT NULL,
                division VARCHAR(255) NOT NULL,
                photo VARCHAR(255) NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(255) NULL,
                homeroom_class VARCHAR(255) NULL,
                slug VARCHAR(255) NULL,
                bio TEXT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL
            )
        ');

        // Copy data from old table to new table
        DB::statement('
            INSERT INTO staff_new (id, user_id, name, position, division, photo, email, phone, homeroom_class, slug, bio, created_at, updated_at)
            SELECT id, user_id, name, position, division, photo, email, phone, homeroom_class, slug, bio, created_at, updated_at 
            FROM staff
        ');

        // Update sequence to correct value
        DB::statement('SELECT setval(\'staff_new_id_seq\', (SELECT MAX(id) FROM staff_new))');

        // Drop old table and rename new one
        DB::statement('DROP TABLE staff CASCADE');
        DB::statement('ALTER TABLE staff_new RENAME TO staff');
        DB::statement('ALTER SEQUENCE staff_new_id_seq RENAME TO staff_id_seq');

        // Recreate indexes and constraints
        DB::statement('ALTER TABLE staff ADD CONSTRAINT staff_email_unique UNIQUE (email)');
        DB::statement('ALTER TABLE staff ADD CONSTRAINT staff_homeroom_class_unique UNIQUE (homeroom_class)');
        DB::statement('ALTER TABLE staff ADD CONSTRAINT staff_slug_unique UNIQUE (slug)');
        DB::statement('CREATE INDEX staff_homeroom_class_index ON staff (homeroom_class)');
        DB::statement('CREATE INDEX staff_slug_index ON staff (slug)');

        // Recreate foreign key to users table
        DB::statement('ALTER TABLE staff ADD CONSTRAINT staff_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');

        // Recreate foreign keys from other tables to staff
        DB::statement('ALTER TABLE position_history ADD CONSTRAINT position_history_staff_id_foreign FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE subject_staff ADD CONSTRAINT subject_staff_staff_id_foreign FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE student_grades ADD CONSTRAINT student_grades_staff_id_foreign FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE teacher_subject_work ADD CONSTRAINT teacher_subject_work_staff_id_foreign FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE students ADD CONSTRAINT students_new_homeroom_teacher_id_fkey FOREIGN KEY (homeroom_teacher_id) REFERENCES staff(id) ON DELETE SET NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed due to the complex table restructuring
        throw new Exception('This migration cannot be automatically reversed. Manual intervention required.');
    }
};