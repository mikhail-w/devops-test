#!/bin/bash

# =============================================================================
# Bonsai Frontend Docker Image Publisher
# =============================================================================
#
# This script automates the process of building, testing, and publishing
# the frontend Docker image to DockerHub. It performs the following steps:
#
# 1. Checks if Docker is running
# 2. Builds the Docker image
# 3. Tests the image locally by running it
# 4. Pushes the image to DockerHub
#
# Usage:
# 1. Edit the DOCKER_USERNAME variable below with your DockerHub username
# 2. Make the script executable: chmod +x publish.sh
# 3. Run the script: ./publish.sh
#
# Requirements:
# - Docker installed and running
# - DockerHub account
# - Logged in to DockerHub (run 'docker login' if not)
#
# =============================================================================

# Configuration
DOCKER_USERNAME="your-dockerhub-username"  # Replace with your DockerHub username
IMAGE_NAME="bonsai-frontend"
VERSION="latest"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting build and publish process...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Build the image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
fi

# Test the image locally
echo -e "${GREEN}Testing image locally...${NC}"
docker run -d -p 3000:80 --name test-container ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}

# Wait for container to start
sleep 5

# Check if container is running
if ! docker ps | grep -q test-container; then
    echo -e "${RED}Error: Container failed to start${NC}"
    docker rm test-container
    exit 1
fi

# Stop and remove test container
docker stop test-container
docker rm test-container

# Push to DockerHub
echo -e "${GREEN}Pushing to DockerHub...${NC}"
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}

# Check if push was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to push to DockerHub${NC}"
    exit 1
fi

echo -e "${GREEN}Successfully published ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} to DockerHub${NC}" 