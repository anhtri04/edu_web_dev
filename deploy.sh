#!/bin/bash

# EDU Web Management System - Production Deployment Script
# This script builds and deploys both frontend and backend components

set -e  # Exit on any error

echo "🚀 Starting EDU Web Management System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All dependencies are available."
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed."
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed."
}

# Build frontend for production
build_frontend() {
    print_status "Building frontend for production..."
    cd frontend
    npm run build:prod
    cd ..
    print_success "Frontend build completed."
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    if [ -f "scripts/migrate.js" ]; then
        npm run migrate
        print_success "Database migrations completed."
    else
        print_warning "Migration script not found. Skipping migrations."
    fi
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    
    # Check if PM2 is available for production deployment
    if command -v pm2 &> /dev/null; then
        print_status "Using PM2 for process management..."
        npm run prod
        print_success "Backend server started with PM2."
    else
        print_warning "PM2 not available. Starting with regular node process..."
        npm start &
        print_success "Backend server started."
    fi
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for server to start
    sleep 5
    
    # Check if backend is responding
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Backend health check passed."
    else
        print_warning "Backend health check failed. Server might still be starting..."
    fi
    
    # Check if frontend files exist
    if [ -d "frontend/dist" ]; then
        print_success "Frontend build files are present."
    else
        print_error "Frontend build files not found."
        exit 1
    fi
}

# Main deployment process
main() {
    echo "======================================"
    echo "  EDU Web Management System Deploy   "
    echo "======================================"
    
    check_dependencies
    install_backend_deps
    install_frontend_deps
    build_frontend
    run_migrations
    start_backend
    health_check
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Application URLs:"
    echo "  Backend API: http://localhost:3000"
    echo "  Frontend: Served via backend static files"
    echo ""
    echo "To stop the application:"
    if command -v pm2 &> /dev/null; then
        echo "  pm2 stop edu-web-api"
        echo "  pm2 delete edu-web-api"
    else
        echo "  Use Ctrl+C to stop the process"
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    "deps")
        check_dependencies
        install_backend_deps
        install_frontend_deps
        ;;
    "build")
        build_frontend
        ;;
    "migrate")
        run_migrations
        ;;
    "start")
        start_backend
        ;;
    "health")
        health_check
        ;;
    "deploy"|"")
        main
        ;;
    *)
        echo "Usage: $0 [deps|build|migrate|start|health|deploy]"
        echo "  deps    - Install dependencies only"
        echo "  build   - Build frontend only"
        echo "  migrate - Run database migrations only"
        echo "  start   - Start backend server only"
        echo "  health  - Run health check only"
        echo "  deploy  - Full deployment (default)"
        exit 1
        ;;
esac