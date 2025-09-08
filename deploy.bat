@echo off
REM EDU Web Management System - Windows Production Deployment Script
REM This script builds and deploys both frontend and backend components

setlocal enabledelayedexpansion

echo.
echo ======================================
echo   EDU Web Management System Deploy   
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed.

echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend dependencies installed.

echo [INFO] Building frontend for production...
cd frontend
call npm run build:prod
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend build completed.

echo [INFO] Running database migrations...
if exist "scripts\migrate.js" (
    call npm run migrate
    if %errorlevel% neq 0 (
        echo [WARNING] Database migration failed or not needed.
    ) else (
        echo [SUCCESS] Database migrations completed.
    )
) else (
    echo [WARNING] Migration script not found. Skipping migrations.
)

echo [INFO] Starting backend server...
echo [WARNING] Starting server in background. Use Ctrl+C to stop.
start /min cmd /c "npm start"
echo [SUCCESS] Backend server started.

echo.
echo [SUCCESS] Deployment completed successfully!
echo.
echo Application URLs:
echo   Backend API: http://localhost:3000
echo   Frontend: Served via backend static files
echo.
echo To stop the application, close the minimized command window or use Ctrl+C
echo.

pause