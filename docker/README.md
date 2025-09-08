# MySQL Docker Setup for edu_web_dev

This directory contains Docker configuration files to run MySQL database for the edu_web_dev application.

## Quick Start

### Windows Users
```bash
# Start MySQL with automatic setup
.\start-mysql.bat

# Or use npm script
npm run docker:setup
```

### Linux/macOS Users
```bash
# Make script executable
chmod +x start-mysql.sh

# Start MySQL with automatic setup
./start-mysql.sh
```

### Manual Docker Commands
```bash
# Start MySQL container
docker-compose up -d mysql

# Start with phpMyAdmin (optional)
docker-compose up -d

# View logs
docker-compose logs -f mysql

# Stop containers
docker-compose stop

# Remove containers and volumes
docker-compose down -v
```

## Services Included

### 1. MySQL Database
- **Container**: `edu_mysql_db`
- **Port**: `3306`
- **Database**: `edu_db_dev` 
- **Root Password**: `#BvOBV0332325650`
- **Additional User**: `eduuser` / `edupass123`
- **Health Check**: Automatic MySQL health monitoring

### 2. phpMyAdmin (Optional)
- **Container**: `edu_phpmyadmin`
- **Port**: `8080`
- **URL**: http://localhost:8080
- **Login**: `root` / `#BvOBV0332325650`

## Configuration Files

### `Dockerfile.mysql`
Custom MySQL image with:
- Pre-configured database and users
- Custom configuration file
- Health checks
- Initialization scripts

### `docker-compose.yml` 
Complete orchestration including:
- MySQL service with volume persistence
- phpMyAdmin web interface
- Network configuration
- Health check dependencies

### `docker/mysql.cnf`
MySQL configuration optimized for development:
- Character set: UTF-8MB4
- Connection limits
- Performance tuning
- Logging configuration

### `docker/init-db.sql`
Database initialization script:
- User privilege setup
- Initial database structure
- Test data (optional)

## Environment Variables

The application supports the following environment variables:

```env
# Database Configuration
DB_NAME=edu_db_dev
DB_USER=root
DB_PASSWORD=#BvOBV0332325650
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# Application Configuration  
NODE_ENV=development
PORT=3000
```

## Connection Details

### From Application
The application will automatically connect using environment variables defined in `.env`:

```javascript
// src/config/db/index.js automatically loads these
DB_HOST=localhost       // Docker maps to localhost:3306
DB_NAME=edu_db_dev      // Database name
DB_USER=root            // Database user
DB_PASSWORD=...         // Database password
```

### From External Tools
Connect to MySQL using any MySQL client:

```
Host: localhost
Port: 3306
Database: edu_db_dev
Username: root
Password: #BvOBV0332325650
```

## Data Persistence

MySQL data is persisted in a Docker named volume `mysql_data`. This means:
- ✅ Data survives container restarts
- ✅ Data survives `docker-compose stop`
- ❌ Data is lost with `docker-compose down -v`

## Troubleshooting

### Container Won't Start
```bash
# Check Docker status
docker info

# View container logs
docker-compose logs mysql

# Check port conflicts
netstat -an | grep 3306
```

### Connection Refused
```bash
# Wait for MySQL to fully initialize (30-60 seconds)
docker-compose logs -f mysql

# Test connection
docker exec edu_mysql_db mysql -u root -p#BvOBV0332325650 -e "SELECT 1"
```

### Reset Database
```bash
# Stop and remove everything
docker-compose down -v

# Restart fresh
docker-compose up -d mysql
```

## Production Notes

For production deployment:
1. Use Docker secrets for passwords
2. Configure SSL/TLS encryption
3. Set up backup strategies
4. Use external volume mounts
5. Configure firewall rules

## npm Scripts Available

- `npm run docker:mysql:start` - Start MySQL container
- `npm run docker:mysql:stop` - Stop MySQL container  
- `npm run docker:mysql:logs` - View MySQL logs
- `npm run docker:down` - Stop all containers
- `npm run docker:setup` - Full setup with health checks