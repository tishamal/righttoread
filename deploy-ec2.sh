#!/bin/bash

# Right to Read - EC2 Deployment Script

echo "Starting deployment process..."

# 1. Pull latest changes
echo "Pulling latest changes from git..."
git pull

# 2. Rebuild and restart containers
echo "Rebuilding and restarting containers..."
# Try modern 'docker compose' first, fallback to legacy 'docker-compose'
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# 3. Cleanup unused images
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment complete! Application should be running on port 80."