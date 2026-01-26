#!/bin/bash

# Right to Read - EC2 Deployment Script

echo "Starting deployment process..."

# 1. Pull latest changes
echo "Pulling latest changes from git..."
git pull origin main

# 2. Rebuild and restart containers
echo "Rebuilding and restarting containers..."
# Use --build to ensure image is rebuilt with new code
docker-compose up -d --build

# 3. Cleanup unused images
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment complete! Application should be running on port 80."