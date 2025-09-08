#!/bin/bash
# Docker MySQL Setup Script for edu_web_dev (Linux/macOS)

echo "===================================="
echo "  edu_web_dev MySQL Docker Setup"
echo "===================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker is not running or not installed!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "Docker is running..."

# Build and start MySQL container
echo ""
echo "Building MySQL container..."
docker-compose up -d mysql

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start MySQL container!"
    exit 1
fi

echo ""
echo "MySQL container started successfully!"
echo ""
echo "Connection Details:"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  Database: edu_db_dev"
echo "  Username: root"
echo "  Password: #BvOBV0332325650"
echo ""
echo "phpMyAdmin is available at: http://localhost:8080"
echo ""

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
sleep 10

# Test database connection
echo "Testing database connection..."
docker exec edu_mysql_db mysql -u root -p#BvOBV0332325650 -e "SELECT 'Database connection successful!' as message;"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MySQL is ready! You can now start your application with: npm start"
else
    echo ""
    echo "⚠️  MySQL container is starting but may not be fully ready yet."
    echo "   Wait a few more seconds and try: npm start"
fi

echo ""
echo "Useful Docker commands:"
echo "  docker-compose logs mysql     - View MySQL logs"
echo "  docker-compose stop mysql     - Stop MySQL container"
echo "  docker-compose restart mysql  - Restart MySQL container"
echo "  docker-compose down           - Stop and remove all containers"