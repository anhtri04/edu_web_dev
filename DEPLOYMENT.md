# EDU Web Management System - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the EDU Web Management System, which consists of a React.js frontend and Express.js backend with MySQL/SQLite database support.

## System Requirements

### Minimum Requirements
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **Database**: MySQL 8.0+ or SQLite 3.x
- **Memory**: 2GB RAM
- **Storage**: 5GB free space
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

### Production Requirements
- **Node.js**: Version 18.x LTS (recommended)
- **npm**: Version 9.x or higher
- **Database**: MySQL 8.0+ (recommended for production)
- **Memory**: 4GB RAM (recommended)
- **Storage**: 10GB free space
- **Process Manager**: PM2 (recommended for production)

## Quick Start

### Option 1: Automated Deployment (Recommended)

**For Windows:**
```cmd
deploy.bat
```

**For macOS/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

1. **Install Dependencies:**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build:prod
   cd ..
   ```

3. **Configure Environment:**
   - Copy `.env.example` to `.env` and configure your settings
   - Update database connection settings

4. **Run Migrations:**
   ```bash
   npm run migrate
   ```

5. **Start Server:**
   ```bash
   npm start
   ```

## Configuration

### Backend Configuration (.env)

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=edu_web_dev
DB_DIALECT=mysql

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:4173

# Security
CORS_ORIGIN=http://localhost:4173
ENABLE_HTTPS=false
```

### Frontend Configuration (.env.production)

The frontend configuration is already created in `frontend/.env.production`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=EDU Web Management System
VITE_ENVIRONMENT=production
# ... (other configuration options)
```

## Database Setup

### MySQL Setup (Recommended for Production)

1. **Install MySQL 8.0+**
2. **Create Database:**
   ```sql
   CREATE DATABASE edu_web_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'edu_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON edu_web_dev.* TO 'edu_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update .env file** with your database credentials

### SQLite Setup (Development/Testing)

For development or testing, you can use SQLite by updating your `.env`:
```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

## Production Deployment

### Using PM2 (Recommended)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2:**
   ```bash
   npm run prod
   ```

3. **PM2 Management Commands:**
   ```bash
   pm2 status                 # Check status
   pm2 logs edu-web-api      # View logs
   pm2 restart edu-web-api   # Restart app
   pm2 stop edu-web-api      # Stop app
   pm2 delete edu-web-api    # Remove app
   ```

### Traditional Deployment

```bash
NODE_ENV=production npm start
```

## Architecture Overview

### Frontend (React.js)
- **Framework**: React 18.x with JSX
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context + TanStack Query
- **HTTP Client**: Axios

### Backend (Express.js)
- **Framework**: Express.js 5.x
- **Database ORM**: Sequelize
- **Authentication**: Session-based
- **File Upload**: Multer + Cloudinary
- **CORS**: Configured for production

### Database Schema
- **Users**: Students, Teachers, Admins
- **Academic**: Classes, Courses, Exams, Grades
- **Features**: Notifications, Calendar Events, File Management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Student API
- `GET /api/student/dashboard` - Student dashboard data
- `GET /api/student/grades` - Student grades
- `GET /api/student/courses` - Enrolled courses
- `GET /api/student/exams` - Upcoming exams

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### File Management
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### Health Check
- `GET /api/health` - Application health status
- `GET /api/status` - System status details

## Security Considerations

### Production Security
- Session secrets are configured
- CORS is properly configured
- Security headers are set
- HTTPS enforcement (when enabled)
- SQL injection protection via Sequelize ORM
- File upload restrictions and validation

### Authentication
- Session-based authentication
- Password hashing with bcrypt
- Role-based access control (Student, Teacher, Admin)
- Protected API routes

## Monitoring and Maintenance

### Health Checks
- Backend health: `GET /api/health`
- System status: `GET /api/status`

### Logging
- Application logs via console
- PM2 logs for process management
- Request logging via Morgan middleware

### Performance
- Frontend code splitting with Vite
- Database connection pooling
- Static file serving optimization
- CORS caching

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify database credentials in `.env`
   - Ensure database server is running
   - Check firewall settings

2. **CORS Errors**
   - Verify `FRONTEND_URL` in `.env`
   - Check CORS configuration in `src/index.js`

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper file permissions

4. **Session Issues**
   - Verify `SESSION_SECRET` is set
   - Check session configuration
   - Clear browser cookies

### Debug Mode

To run in debug mode:
```bash
npm run dev
```

For frontend development:
```bash
cd frontend
npm run dev
```

## Deployment Scripts

### Available Scripts

**Backend (root directory):**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prod` - Start with PM2
- `npm run migrate` - Run database migrations
- `npm run deploy` - Full deployment with frontend build

**Frontend (frontend directory):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build with production environment
- `npm run preview` - Preview production build
- `npm run test` - Run tests

### Deployment Commands Reference

```bash
# Full deployment
./deploy.sh

# Individual steps
./deploy.sh deps     # Install dependencies only
./deploy.sh build    # Build frontend only
./deploy.sh migrate  # Run migrations only
./deploy.sh start    # Start server only
./deploy.sh health   # Health check only
```

## Support and Maintenance

### Regular Maintenance Tasks
1. **Update Dependencies**: Regularly update npm packages
2. **Database Backup**: Regular database backups
3. **Log Rotation**: Manage log file sizes
4. **Security Updates**: Keep Node.js and dependencies updated
5. **Performance Monitoring**: Monitor resource usage

### Getting Help
- Check the application health endpoint: `/api/health`
- Review application logs
- Verify environment configuration
- Ensure all dependencies are installed

---

## Quick Reference

### Production Checklist
- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] Dependencies installed
- [ ] Frontend built for production
- [ ] Database migrations run
- [ ] Server started successfully
- [ ] Health check passes
- [ ] CORS configured correctly
- [ ] Security headers enabled
- [ ] Session secret configured
- [ ] File upload configured (if using Cloudinary)

### URLs
- **Backend API**: http://localhost:3000
- **Frontend**: Served via backend static files
- **Health Check**: http://localhost:3000/api/health
- **API Documentation**: Available via code comments

For additional support or questions, refer to the codebase documentation or contact the development team.