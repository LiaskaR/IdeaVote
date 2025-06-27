-- Create database for the main application
CREATE DATABASE ideahub;

-- Create user for the main application
CREATE USER ideahub WITH PASSWORD 'ideahub123';
GRANT ALL PRIVILEGES ON DATABASE ideahub TO ideahub;