#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Updating package index..."
sudo apt-get update

echo "Installing backend dependencies (Java 17 and Maven) for Ubuntu 24.04..."
sudo apt-get install -y openjdk-17-jdk maven

echo "Building the Spring Boot application (skipping tests for deployment)..."
# Run Maven package. Assuming the script is run from the webapp directory containing pom.xml.
cd "$(dirname "$0")"
mvn clean package -DskipTests

echo "Finding the generated JAR file..."
JAR_FILE=$(find target -maxdepth 1 -name "*.jar" | grep -v "-plain" | grep -v "original" | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "Error: No JAR file found in the target/ directory!"
    exit 1
fi

echo "Configuring systemd service to run the application in the background..."

# Get absolute paths
JAR_ABS_PATH=$(realpath "$JAR_FILE")
APP_DIR=$(pwd)

# Create systemd service file
cat <<EOF | sudo tee /etc/systemd/system/insure-backend.service > /dev/null
[Unit]
Description=UndaWriter Insure Backend Service
After=network.target

[Service]
User=root
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/java -jar $JAR_ABS_PATH --server.address=0.0.0.0
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd, enabling and starting the service..."
sudo systemctl daemon-reload
sudo systemctl enable insure-backend.service
sudo systemctl restart insure-backend.service

echo "================================================================"
echo "Deployment successful! The backend is now running as a background service."
echo "To check the status: sudo systemctl status insure-backend.service"
echo "To view live logs: sudo journalctl -u insure-backend.service -f"
echo "================================================================"
