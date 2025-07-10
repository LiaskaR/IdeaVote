#!/bin/bash

# Install Maven if not present
if ! command -v mvn &> /dev/null; then
    echo "Installing Maven..."
    apt-get update
    apt-get install -y maven
fi

# Build and run the Java Spring Boot application
echo "Building Java application..."
mvn clean compile

echo "Starting Java Spring Boot server on port 5000..."
mvn spring-boot:run