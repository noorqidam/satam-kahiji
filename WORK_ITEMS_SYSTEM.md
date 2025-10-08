# Work Items Management System

## Overview

A comprehensive work items management system built for educational institutions to manage teacher work submissions including Prota (Annual Program), Prosem (Semester Program), Modules, Attendance Lists, and Agendas. The system integrates with Google Drive for organized file storage and provides role-based access control.

## Architecture

### Google Drive Folder Structure
```
📁 Subject: [Subject Name] ([Subject Code])
  📁 Teacher: [Teacher Name]
    📁 Prota (Annual Program)
    📁 Prosem (Semester Program)
    📁 Module
    📁 Attendance List
    📁 Agenda
```

### Database Schema

#### Core Tables
- **work_items**: Defines work item types (Prota, Prosem, etc.)
- **teacher_subject_work**: Links teachers, subjects, and work items with Google Drive folders
- **teacher_work_files**: Stores uploaded file references

#### Key Relationships
- `WorkItem` (1) ↔ (∞) `TeacherSubjectWork`
- `TeacherSubjectWork` (1) ↔ (∞) `TeacherWorkFile`
- `Staff` (1) ↔ (∞) `TeacherSubjectWork`
- `Subject` (1) ↔ (∞) `TeacherSubjectWork`

## Features

### Role-Based Permissions

#### Super Admin & Headmaster
- Create and manage mandatory work items
- View all teacher progress and statistics
- Access all Google Drive folders
- Generate completion reports
- Bulk operations on work items

#### Teachers
- View personal work progress dashboard
- Initialize Google Drive folders for subjects
- Upload files to work item folders
- Create optional work items
- Access only their own folders

### Core Functionality

#### 1. Work Item Management
- **CRUD Operations**: Create, read, update, delete work items
- **Required vs Optional**: Mandatory items (headmaster/admin) vs optional (teachers)
- **Default Items**: Prota, Prosem, Module, Attendance List, Agenda

#### 2. Google Drive Integration
- **Automatic Folder Creation**: Creates organized folder structure per teacher/subject
- **File Upload**: Direct upload to Google Drive with public sharing
- **Folder Permissions**: Proper access control and sharing
- **Fallback Support**: Local storage fallback if Google Drive fails

#### 3. Progress Tracking
- **Individual Progress**: Teacher-specific completion tracking
- **Subject-wise Progress**: Progress per subject taught
- **Overall Statistics**: School-wide completion rates
- **Visual Dashboards**: Progress bars, completion percentages

#### 4. File Management
- **Upload Interface**: Drag-and-drop file upload with progress
- **File Preview**: Direct links to Google Drive files
- **File Deletion**: Remove files from both database and Google Drive
- **File Validation**: Size limits and type restrictions

## Technical Implementation

### Backend Components

#### Services
- **WorkItemService**: Core business logic for work item operations
  - Google Drive folder creation and management
  - File upload/download operations
  - Progress calculation and statistics
  - Teacher work initialization

#### Controllers
- **WorkItemController**: HTTP request handling with role-based authorization
  - RESTful API endpoints
  - File upload/delete operations
  - Progress reporting
  - Folder initialization

#### Models
- **WorkItem**: Work item type definitions
- **TeacherSubjectWork**: Teacher-subject-work associations
- **TeacherWorkFile**: File metadata storage

### Frontend Components

#### Admin Interface
- **WorkItemsIndex**: Main admin dashboard with statistics
- **WorkItemManageDialog**: CRUD operations for work items
- **TeacherProgressTable**: Overview of all teacher progress
- **WorkItemStatsCards**: Statistical overview cards

#### Teacher Interface
- **TeacherWorkDashboard**: Personal work progress dashboard
- **WorkItemFileUpload**: File upload component
- **WorkItemFileList**: Manage uploaded files
- **InitializeFoldersDialog**: Set up Google Drive folders

### API Endpoints

#### Admin Routes
```php
GET    /admin/work-items                 # Dashboard
POST   /admin/work-items                 # Create work item
PUT    /admin/work-items/{id}            # Update work item
DELETE /admin/work-items/{id}            # Delete work item
GET    /admin/work-items/stats           # Statistics
```

#### Operations
```php
POST   /admin/work-items/initialize-folders    # Create Google Drive folders
POST   /admin/work-items/upload-file          # Upload file to Drive
DELETE /admin/work-items/files/{id}           # Delete file
GET    /admin/work-items/teacher/{id}/progress # Teacher progress
```

#### Teacher Routes
```php
GET /teacher/work-items    # Teacher dashboard
```

## Configuration

### Environment Variables
```env
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_REDIRECT_URI=your_redirect_uri
GOOGLE_DRIVE_FOLDER_ID=your_root_folder_id
FILESYSTEM_DISK=google_drive
```

### Google Drive Setup
1. Run `php artisan storage:setup-google-drive`
2. Complete OAuth2 authentication
3. Verify folder permissions

## Security Features

- **Role-based Access Control**: Enforced at both route and method levels
- **File Validation**: Size limits, type restrictions, malware scanning
- **Secure Upload**: Direct to Google Drive with proper permissions
- **Audit Trail**: Activity logging for all operations
- **Data Encryption**: Sensitive data encryption in transit and at rest

## Usage Workflow

### For Teachers
1. Navigate to "Work Items" in teacher dashboard
2. Click "Initialize Folders" for each subject
3. Upload required documents to respective folders
4. Monitor progress through dashboard
5. Add optional work items as needed

### For Administrators
1. Access "Work Items Management" in admin panel
2. Create mandatory work items for all teachers
3. Monitor overall progress and statistics
4. Generate reports for school administration
5. Access individual teacher folders when needed

## Performance Optimizations

- **Lazy Loading**: Progressive loading of progress data
- **Caching**: Google Drive API response caching
- **Batch Operations**: Bulk folder creation and file operations
- **Asynchronous Processing**: Background jobs for heavy operations
- **Database Indexing**: Optimized queries for large datasets

## Monitoring & Analytics

- **Progress Tracking**: Real-time completion rates
- **Usage Statistics**: File upload/download metrics
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: API response times and success rates
- **User Activity**: Access logs and usage patterns

## Future Enhancements

- **Version Control**: File versioning and history
- **Automated Reminders**: Deadline notifications
- **Template System**: Standard document templates
- **Integration APIs**: Third-party system integrations
- **Mobile App**: Dedicated mobile application
- **Advanced Reporting**: Custom report generation
- **Collaboration Tools**: Comment and review systems