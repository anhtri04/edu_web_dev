-- Database initialization script for edu_web_dev
-- This script will run when the MySQL container starts for the first time

USE edu_db_dev;

-- Grant additional privileges to eduuser
GRANT ALL PRIVILEGES ON edu_db_dev.* TO 'eduuser'@'%';
GRANT ALL PRIVILEGES ON edu_db_dev.* TO 'eduuser'@'localhost';

-- Create additional user for application connection if needed
-- CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON edu_db_dev.* TO 'app_user'@'%';

-- Flush privileges to ensure all grants take effect
FLUSH PRIVILEGES;

-- Optional: Create some initial test data (uncomment if needed)
-- INSERT INTO students (name, email) VALUES ('Test Student', 'test@example.com');

-- Display confirmation message
SELECT 'Database edu_db_dev initialized successfully!' as message;