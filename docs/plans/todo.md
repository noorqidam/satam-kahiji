I would like your help in building a PostgreSQL based Laravel database structure for an integrated school information system. Create:

1. All migrations
2. All Eloquent models
3. Initial seeders (if needed)

### System Specifications:

#### Authentication & Staff:

- `users`: name, email, password, role ENUM ('super_admin', 'headmaster', 'teacher', 'humas', 'tu', 'deputy_headmaster')
- `staff`: user_id (nullable), name, position, division, photo, email, phone, bio
- `position_history`: staff_id, title, start_year, end_year (nullable)

#### 🎓 Academics & Students:

- `students`: NISN, name, gender, birth_date, class, entry_year, graduation_year, status ENUM ('active', 'graduated'), photo, notes
- `subjects`: name, code (optional)
- `subject_staff`: pivot between teacher (staff) and subject
- `student_grades`: student_id, subject_id, staff_id (grader), semester, score
- `student_extracurricular`: pivot between students and extracurriculars

#### 🗂️ Teacher Work Tools:

- `work_items`: name, is_required (bool), created_by_role ENUM ('headmaster', 'teacher')
- `teacher_subject_work`: staff_id, subject_id, work_item_id, folder_name, gdrive_folder_id (nullable)
- `teacher_work_files`: teacher_subject_work_id, file_name, file_url, uploaded_at

#### 🌐 Landing Page Content:

- `pages`: slug, title, content, image (nullable)
- `posts`: user_id, title, slug, excerpt, content, category ENUM ('news', 'announcements'), image, published_at
- `galleries`: title, type ENUM ('image', 'video'), file_path
- `extracurriculars`: name, description, photo
- `facilities`: name, description, photo
- `contacts`: name, email, message

#### 💾 Additional requests:

- Use Laravel standard practices
- Use PostgreSQL data types
- Create all Laravel models with proper Eloquent relationships
- Include seeders for:
- 1 super_admin user
- 1 headmaster staff member
- 5 mandatory work tools (Prota, Prosem, Module, Attendance List, Agenda)

Emit one file per migration, one file per model, and one main seeder file, after the data structure and relationships steps are complete Provide controllers and user interfaces. Focus on data structures and relationships.

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you start working, check in with me and I will verify the plan.
4. Then, start working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid
   making any massive or complex changes. Every change should impact as little code as
   possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of your changes
   made and any other relevant information.

---

## Review: School Information System Database Implementation

### Summary
Successfully implemented a comprehensive PostgreSQL-based Laravel database structure for an integrated school information system. All components were completed following Laravel best practices with proper relationships and foreign key constraints.

### Database Architecture Implemented

#### Authentication & Staff Management (4 entities)
- **users**: Enhanced with role enum (super_admin, headmaster, teacher, humas, tu, deputy_headmaster)
- **staff**: User profiles with position, division, contact info, bio
- **position_history**: Career progression tracking with start/end years
- **Relationships**: User ↔ Staff (1:1), Staff ↔ PositionHistory (1:many)

#### Academic System (6 entities)
- **students**: NISN, class, entry/graduation years, status (active/graduated)
- **subjects**: Core subjects with optional codes
- **subject_staff**: Teacher-subject assignments (many-to-many)
- **student_grades**: Academic records with semester tracking
- **extracurriculars**: Activity programs
- **student_extracurricular**: Student activity participation (many-to-many)

#### Teacher Work Management (3 entities)
- **work_items**: Required work tools (Prota, Prosem, Module, etc.)
- **teacher_subject_work**: Work assignments with Google Drive integration
- **teacher_work_files**: File management and tracking

#### Content Management (5 entities)
- **pages**: Landing page content with slugs
- **posts**: News/announcements with categories
- **galleries**: Media management (image/video)
- **facilities**: School facility descriptions
- **contacts**: Contact form submissions

### Technical Implementation

#### Database Migrations (18 total)
- ✅ Updated existing users table with role enum
- ✅ Created 17 new timestamped migrations
- ✅ Proper foreign key constraints with cascade deletes
- ✅ PostgreSQL-optimized data types (enum, decimal, year, longText)
- ✅ Appropriate indexes for performance

#### Eloquent Models (15 total)
- ✅ Updated User model with relationships and role support
- ✅ Created 14 new models with proper relationships
- ✅ Implemented fillable properties and casts
- ✅ Added scopes and helper methods where appropriate
- ✅ Proper many-to-many pivot table configurations

#### Database Seeder
- ✅ Super admin user (admin@school.edu)
- ✅ Headmaster user with staff profile
- ✅ 5 mandatory work tools seeded as required

#### Testing & Validation
- ✅ All migrations run successfully with `php artisan migrate:fresh --seed`
- ✅ Fixed foreign key constraint issue in teacher_work_files table
- ✅ Verified all relationships and data integrity

### Files Created/Modified

**Migrations (18 files)**
- Modified: `0001_01_01_000000_create_users_table.php`
- Created: 17 new migration files (staff, students, subjects, etc.)

**Models (15 files)**
- Modified: `app/Models/User.php`
- Created: 14 new model files with full relationship definitions

**Seeders (1 file)**
- Modified: `database/seeders/DatabaseSeeder.php`

### Key Technical Decisions

1. **PostgreSQL Optimization**: Used proper data types (enum, year, decimal)
2. **Relationship Design**: Proper foreign key constraints with cascade deletes
3. **Table Naming**: Fixed Laravel pluralization issue for `teacher_subject_work`
4. **Data Integrity**: Unique constraints on pivot tables
5. **Performance**: Strategic indexes on frequently queried columns

### System Capabilities

The implemented system now supports:
- **Multi-role user management** with staff profiles
- **Complete academic tracking** (students, grades, subjects, extracurriculars)
- **Teacher work management** with file uploads and Google Drive integration
- **Content management** for school website (pages, posts, galleries, facilities)
- **Position history tracking** for staff career progression
- **Contact form management** and facility descriptions

### Next Steps Recommendations

1. Create controllers and API endpoints for each entity
2. Implement file upload handling for photos and documents
3. Add validation rules and form requests
4. Build user interface components for data management
5. Implement authentication middleware for role-based access

**Total Implementation**: 18 migrations + 15 models + comprehensive seeder + full testing ✅
