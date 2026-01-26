#!/bin/bash

# Right to Read - EC2 Deployment Script

echo "Starting deployment process..."

# 1. Pull latest changes
echo "Pulling latest changes from git..."
git pull

# 2. Build the Docker image manually (no docker-compose needed)
echo "Building Docker image (this includes npm install)..."
docker build -t right-to-read-frontend:latest .

if [ $? -ne 0 ]; then
    echo "Docker build failed! Aborting deployment."
    exit 1
fi

# 3. Stop and remove the old container
echo "Stopping old container..."
docker stop right-to-read-frontend 2>/dev/null || true
docker rm right-to-read-frontend 2>/dev/null || true

# 4. Run the new container
echo "Starting new container..."
docker run -d \
  --name right-to-read-frontend \
  --restart always \
  -p 80:80 \
  right-to-read-frontend:latest

# 5. Cleanup
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment complete! Application should be running on port 80."