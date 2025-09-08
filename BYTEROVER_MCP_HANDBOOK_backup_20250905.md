# BYTEROVER_MCP_HANDBOOK

*AI Agent Navigation Guide for edu_web_dev*
*Generated: 2025-09-05*

## Layer 1: System Overview

### Purpose
**edu_web_dev** is a comprehensive school management web application designed to centralize educational operations. It manages courses, exams, grades, and user authentication for educational institutions including students, teachers, and administrators.

### Technology Stack
**Backend Framework**: Express.js v5.1.0 (Node.js)
**Frontend**: React.js with Vite (in `/frontend` directory)
**Database ORM**: Sequelize v6.37.7 (MySQL/SQLite support)
**Authentication**: bcrypt v5.1.1 + express-session
**File Storage**: Cloudinary v2.6.0 integration
**Styling**: TailwindCSS v4.1.4 + SASS v1.86.3
**Testing**: Jest v29.7.0 + Supertest v6.3.3
**Development**: nodemon v3.1.9

### Architecture Pattern
**MVC (Model-View-Controller)** monolithic architecture with:
- **Models**: Database entities (Student, Teacher, Course, Exam, etc.)
- **Views**: React components (frontend) + Handlebars templates (legacy)
- **Controllers**: Business logic handlers in `/src/app/controllers/`
- **Routes**: RESTful API routing in `/src/routes/`
- **Middleware**: Authentication, file upload, logging

### Key Technical Decisions
- **Hybrid Frontend**: React frontend + Express backend (API-first approach)
- **Multi-Database**: MySQL (production) + SQLite (development/testing)
- **File Handling**: Cloudinary for cloud storage + local multer for uploads
- **Authentication Strategy**: Session-based with role separation (student/teacher/admin)
- **Cross-Platform**: Windows/Linux deployment support with proper scripts

## Layer 2: Module Map

### Core Modules

#### Authentication & Authorization (`/src/app/controllers/AuthController.js`)
**Responsibility**: User login, signup, session management, role-based access
**Key Features**: Student/Teacher/Admin login, password hashing, session handling
**Dependencies**: bcrypt, express-session, authConfig middleware

#### Course Management (`/src/app/controllers/CourseController.js`)
**Responsibility**: Course CRUD operations, enrollment, course dashboards
**Key Features**: Course creation, student enrollment, teacher assignment
**Dependencies**: Cloudinary (images), multer (file uploads), Course model

#### Examination System (`/src/app/controllers/ExamController.js`)
**Responsibility**: Exam scheduling, submissions, grading workflow
**Key Features**: Exam creation, material uploads, submission handling
**Dependencies**: multer (file handling), Exam/Submission models

#### Grade Management (`/src/app/controllers/GradeController.js`)
**Responsibility**: Grade calculation, reporting, progress tracking
**Key Features**: Grade entry, statistical analysis, progress reports
**Dependencies**: Grading model, Student/Teacher associations

#### User Management (`/src/app/controllers/StudentController.js`, `TeacherController.js`, `AdminController.js`)
**Responsibility**: Role-specific dashboards, profile management, user operations
**Key Features**: Personalized dashboards, bulk operations, user statistics
**Dependencies**: User models, authentication middleware

### Data Layer (`/src/app/models/`)
**Core Entities**: Student, Teacher, Class, Course, Exam, Submission, Grading, Enrollment
**Database Config**: `/src/config/db/index.js` (Sequelize setup)
**Relationships**: Complex associations between users, courses, and academic records

### Integration Layer (`/src/routes/`)
**API Routes**: RESTful endpoints under `/api/*`
**Page Routes**: Authentication, dashboard, course management routes
**File Routes**: Upload/download handling with security
**Admin Routes**: Administrative operations with proper authorization

## Layer 3: Integration Guide

### API Endpoints Structure

#### Authentication Endpoints
- `POST /login` - Student/general login
- `POST /login/teacher` - Teacher-specific login  
- `POST /signup` - New user registration
- `GET /logout` - Session termination

#### Course Management API
- `GET /api/course/` - List courses (authenticated)
- `POST /api/course/` - Enroll in course
- `GET /api/course/:slug` - Course details
- `POST /teacher/course/add-course` - Create course (teacher only)

#### Student API (`/api/student/:student_id/*`)
- `GET /dashboard` - Student dashboard data
- `GET /courses` - Enrolled courses
- `GET /grades` - Academic performance
- `GET /calendar` - Academic events
- `GET /files` - Student files

#### Administrative API (`/api/admin/*`)
- `GET /dashboard` - System overview
- `GET /students`, `GET /teachers` - User management
- `POST /notifications/bulk` - System announcements
- `GET /stats` - System statistics

### Configuration Files
- **Database**: `/src/config/db/index.js` (Sequelize + multi-DB)
- **Cloudinary**: `/src/config/cloudinary.js` (media storage)
- **Environment**: `.env` + `.env.production` (deployment configs)
- **Middleware**: `/src/middleware/authConfig.js` (authentication rules)

### External Dependencies
- **Cloudinary**: Media storage and processing
- **MySQL/SQLite**: Primary data persistence
- **Session Store**: In-memory (development) or Redis (production recommended)

### Integration Patterns
- **Middleware Pipeline**: auth → file upload → business logic → response
- **Error Handling**: Centralized error responses with proper HTTP codes
- **File Upload Flow**: multer → local storage → Cloudinary → database record

## Layer 4: Extension Points

### Design Patterns Used
- **Factory Pattern**: Model creation and database initialization
- **Middleware Pattern**: Request preprocessing chain (auth, validation, upload)
- **Repository Pattern**: Data access abstraction through Sequelize models
- **MVC Pattern**: Clear separation of concerns across application layers

### Extension Areas
- **Authentication**: Currently session-based, extendable to JWT/OAuth2
- **File Storage**: Cloudinary integration, can extend to AWS S3/Google Cloud
- **Database**: Sequelize abstraction allows easy database engine switching
- **Frontend**: React components ready for UI library integration (Material-UI, etc.)
- **API**: RESTful structure ready for GraphQL or OpenAPI documentation

### Customization Points
- **Role Management**: `/src/middleware/authConfig.js` - add custom roles
- **File Types**: `/src/middleware/multerConfig.js` - configure allowed uploads  
- **Database Schema**: `/src/app/models/` - extend or modify entity relationships
- **Routes**: `/src/routes/` - add new API endpoints or modify existing ones
- **Frontend Components**: `/frontend/src/components/` - extend React UI

### Recent Changes & Evolution
- **React Migration**: Moving from Handlebars to React frontend
- **API Expansion**: New notification, calendar, and file management systems
- **Admin Panel**: Enhanced administrative capabilities
- **Testing Infrastructure**: Jest test suite implementation
- **Deployment**: Cross-platform deployment scripts (Windows/Linux)

### Performance Optimization Opportunities
- **Caching**: Redis integration for session storage and query caching
- **Database**: Query optimization and indexing strategies
- **File Handling**: CDN integration and lazy loading
- **API**: Rate limiting and request throttling implementation

---

*This handbook provides AI agents with structured navigation paths through the edu_web_dev codebase. Each layer builds upon the previous, enabling efficient code analysis, feature development, and system maintenance.*