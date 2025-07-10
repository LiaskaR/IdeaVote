#!/bin/bash

# Stop existing Node.js server
echo "Stopping Node.js server..."
pkill -f "tsx server/index.ts" || true
sleep 2

# Install Maven if not present
if ! command -v mvn &> /dev/null; then
    echo "Installing Maven..."
    apt-get update
    apt-get install -y maven
fi

# Set JAVA_HOME if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

# Build and run the Java Spring Boot application
echo "Building Java application..."
mvn clean compile spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx2g -Xms1g -XX:+UseG1GC"