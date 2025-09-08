@echo off
REM Docker MySQL Setup Script for edu_web_dev (Windows)

echo ====================================
echo  edu_web_dev MySQL Docker Setup
echo ====================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not installed!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running...

REM Build and start MySQL container
echo.
echo Building MySQL container...
docker-compose up -d mysql

REM Check if container started successfully
if %errorlevel% neq 0 (
    echo ERROR: Failed to start MySQL container!
    pause
    exit /b 1
)

echo.
echo MySQL container started successfully!
echo.
echo Connection Details:
echo   Host: localhost
echo   Port: 3306
echo   Database: edu_db_dev
echo   Username: root
echo   Password: #BvOBV0332325650
echo.
echo phpMyAdmin is available at: http://localhost:8080
echo.

REM Wait for MySQL to be ready
echo Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

REM Test database connection
echo Testing database connection...
docker exec edu_mysql_db mysql -u root -p#BvOBV0332325650 -e "SELECT 'Database connection successful!' as message;"

if %errorlevel% eq 0 (
    echo.
    echo ✅ MySQL is ready! You can now start your application with: npm start
) else (
    echo.
    echo ⚠️  MySQL container is starting but may not be fully ready yet.
    echo    Wait a few more seconds and try: npm start
)

echo.
echo Useful Docker commands:
echo   docker-compose logs mysql     - View MySQL logs
echo   docker-compose stop mysql     - Stop MySQL container
echo   docker-compose restart mysql  - Restart MySQL container
echo   docker-compose down           - Stop and remove all containers

pause