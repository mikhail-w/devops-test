# 🌿 Bonsai App - Complete Docker Setup Guide

Welcome to the comprehensive guide for setting up and testing the Bonsai application using Docker! This guide will walk you through Dockerizing both the **backend (Django)** and **frontend (React)** components, connecting them with **Docker Compose**, and optionally pushing your images to **AWS ECR** for deployment.

## 📋 Table of Contents

- [Overview](#-high-level-overview)
- [Prerequisites](#-prerequisites)
- [Phase 1: Dockerize the Backend](#-phase-1-dockerize-the-backend)
- [Phase 2: Dockerize the Frontend](#-phase-2-dockerize-the-frontend)
- [Phase 3: Docker Compose Setup](#-phase-3-docker-compose-setup)
- [Database Initialization](#-database-initialization)
- [Secrets and Environment Variables Management](#-secrets-and-environment-variables-management)
- [Testing and Troubleshooting](#-testing-and-troubleshooting)
- [Phase 4: AWS ECR Integration](#-phase-4-aws-ecr-integration)
- [Phase 5: CI/CD with GitHub Actions](#-phase-5-cicd-with-github-actions)
- [Production Considerations](#-production-considerations)

---

## 🗺️ High-Level Overview

We'll complete this setup in **5 phases**:

1. **Dockerize the Backend** - Create a Django container
2. **Dockerize the Frontend** - Create a React container
3. **Connect with Docker Compose** - Orchestrate all services
4. **AWS ECR Integration** - Push images to cloud registry (optional)
5. **CI/CD Setup** - Automate builds with GitHub Actions (optional)

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed:

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git
- Node.js (for local development)
- Python (for local development)
- AWS CLI (only for ECR integration)

---

## 📦 Phase 1: Dockerize the Backend (`feature/docker-backend`)

### Step 1: Create a `Dockerfile` in `/apps/backend`

Create a file named `Dockerfile` in your backend directory with the following content:

```Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    curl \
    netcat-traditional \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Create media and static directories
RUN mkdir -p /app/media /app/staticfiles

# Make entrypoint script executable
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Run entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

This Dockerfile is optimized for production use with the following features:

1. **Base Image**:
   - Uses `python:3.11-slim` for a smaller footprint
   - Includes only essential system packages

2. **Environment Setup**:
   - Sets Python environment variables for better performance
   - Creates necessary directories for media and static files
   - Installs system dependencies with cleanup

3. **Dependencies**:
   - Installs Python packages from requirements.txt
   - Upgrades pip before installing dependencies
   - Includes PostgreSQL client for database operations

4. **Application Setup**:
   - Copies the entire project into the container
   - Makes the entrypoint script executable
   - Sets up the default command to run the Django development server

### Step 2: Create a `.dockerignore` file

In the same directory, create a `.dockerignore` to exclude unnecessary files:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
.env
.venv
venv/
ENV/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Git
.git
.gitignore

# Docker
Dockerfile
.dockerignore

# Local development
*.log
local_settings.py
db.sqlite3
media/
static/

# Test coverage
.coverage
htmlcov/
.pytest_cache/

# Documentation
docs/
*.md
LICENSE

# Temporary files
*.tmp
*.bak
*.swp
*~
```

### Step 3: Create an Entrypoint Script

Create a file named `entrypoint.sh` in your backend directory:

```bash
#!/bin/sh

# Wait for the database to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL is ready!"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Load fixtures in the correct order
echo "Loading fixtures..."
python manage.py loaddata users.json
python manage.py loaddata products.json
python manage.py loaddata posts.json
python manage.py loaddata reviews.json
python manage.py loaddata comments.json

# Create superuser if it doesn't exist
echo "Creating superuser if it doesn't exist..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='${ADMIN_USERNAME:-admin}').exists():
    User.objects.create_superuser(
        '${ADMIN_USERNAME:-admin}', 
        '${ADMIN_EMAIL:-admin@mail.com}', 
        '${ADMIN_PASSWORD:-admin}'
    )
"

# Start the application
echo "Starting the application..."
exec "$@"
```

Make the script executable:

```bash
chmod +x apps/backend/entrypoint.sh
```

### Step 4: Test the Backend Container

Build and run the backend container to ensure it works correctly:

```bash
cd apps/backend
docker build -t bonsai-backend .
docker run -p 8000:8000 bonsai-backend
```

### Step 5: Configure Media File Handling

The application now includes an improved media file handling system with the following features:

1. **Environment Variables**:
   - `VITE_MEDIA_URL`: Base URL for media files (defaults to `${VITE_API_BASE_URL}/media/`)
   - `VITE_API_BASE_URL`: Base URL for the API
   - `VITE_S3_PATH`: S3 bucket path for production

2. **Media File Structure**:
   ```
   /app/media/
   └── posts/
       └── images/
           └── [uploaded_images]
   ```

3. **Image Handling Components**:
   - `S3ImageHandler.jsx`: Handles image display in the frontend
   - `urlUtils.js`: Provides utilities for cleaning and formatting media URLs
   - `imageUtils.js`: Contains helper functions for image path manipulation

4. **Media URL Configuration**:
   - Development: Uses local Django media server
   - Production: Uses S3/CloudFront
   - Supports both relative and absolute URLs
   - Handles path cleaning and normalization

5. **Debugging Tools**:
   - `debugImagePath()` function for troubleshooting image paths
   - Environment variable logging for media configuration

To ensure proper media file handling:

1. Create the media directory in your Dockerfile:
   ```dockerfile
   RUN mkdir -p /app/media/posts/images
   ```

2. Mount the media volume in docker-compose.yml:
   ```yaml
   volumes:
     - ./apps/backend:/app
     - media_volume:/app/media
   ```

3. Set appropriate environment variables:
   ```env
   VITE_MEDIA_URL=http://localhost:8000/media/
   VITE_API_BASE_URL=http://localhost:8000
   VITE_S3_PATH=https://your-s3-bucket.s3.amazonaws.com
   ```

Visit http://localhost:8000 in your browser to verify the backend is running.

---

## 🌿 Phase 2: Dockerize the Frontend (`feature/docker-frontend`)

### Step 1: Create a `Dockerfile` in `/apps/frontend`

Create a file named `Dockerfile` in your frontend directory:

```Dockerfile
# Build stage
FROM node:18-alpine AS builder

# Set work directory
WORKDIR /app

# Install necessary dependencies for crypto
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies and Terser
RUN npm install && npm install -D terser

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Second stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

This Dockerfile uses a multi-stage build approach with the following features:

1. **Build Stage**:
   - Uses `node:18-alpine` as the base image
   - Installs necessary build dependencies including Python, make, and g++
   - Installs npm dependencies and Terser for code minification
   - Builds the React application

2. **Production Stage**:
   - Uses `nginx:alpine` as the base image
   - Copies only the built files from the builder stage
   - Sets up Nginx to serve the static files
   - Configures the container to run Nginx in the foreground

### Step 2: Create a `.dockerignore` file

In the frontend directory, create a `.dockerignore`:

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Testing
coverage/
.nyc_output/

# Production build
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# Git
.git
.gitignore

# Docker
Dockerfile
.dockerignore

# Logs
logs/
*.log

# Cache
.cache/
.npm/
.eslintcache

# Documentation
docs/
*.md
LICENSE

# Temporary files
*.tmp
*.bak
*.swp
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

### Step 3: Create Nginx Configuration

Create a file named `nginx.conf` in your frontend directory:

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /health {
        access_log off;
        return 200 'ok';
    }

    # Proxy API requests to the backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 4: Test the Frontend Container

Build and run the frontend container:

```bash
cd apps/frontend
docker build -t bonsai-frontend .
docker run -p 3000:80 bonsai-frontend
```

Visit http://localhost:3000 to verify that the React app is being served correctly.

---

## 🔗 Phase 3: Docker Compose Setup

### Step 1: Create `docker-compose.yml` in the root directory

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    container_name: bonsai-backend
    restart: unless-stopped
    volumes:
      - ./apps/backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    env_file:
      - .env
    ports:
      - "8000:8000"
    depends_on:
      - db
    networks:
      - bonsai_network
    command: >
      sh -c "python manage.py wait_for_db &&
             python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    container_name: bonsai-frontend
    restart: unless-stopped
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - bonsai_network
    command: sh -c "npm start"

  db:
    image: postgres:13-alpine
    container_name: bonsai-db
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    env_file:
      - .env
    ports:
      - "5432:5432"
    networks:
      - bonsai_network

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  bonsai_network:
    driver: bridge
```

### Step 2: Create `.env` file in the root directory

```bash
# Django Settings
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=bonsai_store
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Frontend Settings
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
```

### Step 3: Build and Start the Services

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Initialize the Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin
- API Documentation: http://localhost:8000/api/docs

---

## 🗄️ Database Initialization

The database initialization is now handled automatically by the entrypoint script in the backend container. This script:

1. Waits for the PostgreSQL database to be ready
2. Applies database migrations
3. Loads fixtures in the correct order:
   - users.json
   - products.json
   - posts.json
   - reviews.json
   - comments.json
4. Creates a Django superuser if it doesn't exist

This automated approach ensures that your database is properly initialized every time the containers start, making the process more reliable and repeatable.

### Verifying Database Setup

To verify that your database has been properly initialized:

```bash
# Connect to the database container
docker compose exec db psql -U postgres -d bonsai

# List all tables
\dt

# Count records in key tables
SELECT COUNT(*) FROM auth_user;
SELECT COUNT(*) FROM products_product;
SELECT COUNT(*) FROM blog_post;
SELECT COUNT(*) FROM products_review;
SELECT COUNT(*) FROM blog_comment;

# Exit PostgreSQL
\q
```

---

## 🔐 Secrets and Environment Variables Management

Properly managing secrets and environment variables is crucial for security and configuration flexibility. Here's how to handle them in your Docker setup:

### Local Development

#### Step 1: Create Environment Files

1. **Create a `.env.example` file** in your project root with placeholder values:

```bash
# Database Configuration
DB_NAME=bonsai_store
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=db
DB_PORT=5432

# Django Configuration
DEBUG=True
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=your_region

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
```

2. **Create your actual `.env` file** (this should be in `.gitignore`):

```bash
# Copy the example file and replace with real values
cp .env.example .env
```

#### Step 2: Update Docker Compose Configuration

Modify your `docker-compose.yml` to use environment variables:

```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./apps/backend
      dockerfile: Dockerfile
    env_file: .env
    environment:
      - DB_NAME=bonsai_store
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_HOST=db
      - DB_PORT=5432
      - DJANGO_SUPERUSER_USERNAME=admin
      - DJANGO_SUPERUSER_EMAIL=admin@mail.com
      - DJANGO_SUPERUSER_PASSWORD=adminpassword
      - DJANGO_DEBUG=True
      - DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,*
      - LOAD_INITIAL_DATA=True
    volumes:
      - ./apps/backend:/app
      - ./apps/backend/media:/app/media
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  db:
    image: postgres:13-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=bonsai_store
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  media_volume:
  static_volume:
```

#### Step 3: Update the Entrypoint Script

Modify your `entrypoint.sh` to use environment variables for the superuser creation:

```bash
#!/bin/sh

# Wait for the database to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL is ready!"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Load fixtures in the correct order
echo "Loading fixtures..."
python manage.py loaddata users.json
python manage.py loaddata products.json
python manage.py loaddata posts.json
python manage.py loaddata reviews.json
python manage.py loaddata comments.json

# Create superuser if it doesn't exist
echo "Creating superuser if it doesn't exist..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='${ADMIN_USERNAME:-admin}').exists():
    User.objects.create_superuser(
        '${ADMIN_USERNAME:-admin}', 
        '${ADMIN_EMAIL:-admin@mail.com}', 
        '${ADMIN_PASSWORD:-admin}'
    )
"

# Start the application
echo "Starting the application..."
exec "$@"
```

### Production Deployment

For production environments, you should use more secure methods to handle secrets:

#### Option 1: Docker Secrets (for Swarm Mode)

If using Docker Swarm, you can use Docker Secrets:

```bash
# Create secrets
echo "your_secret_password" | docker secret create db_password -
echo "your_secret_key" | docker secret create django_secret_key -

# Use in docker-compose.prod.yml
version: '3.8'

services:
  backend:
    secrets:
      - db_password
      - django_secret_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - SECRET_KEY_FILE=/run/secrets/django_secret_key

secrets:
  db_password:
    external: true
  django_secret_key:
    external: true
```

#### Option 2: AWS Secrets Manager or Parameter Store

For AWS deployments, use AWS Secrets Manager:

1. Store your secrets in AWS Secrets Manager
2. Use IAM roles to allow your ECS/EKS tasks to access these secrets
3. Update your application to fetch secrets from AWS Secrets Manager

Example code for fetching secrets in Django:

```python
import boto3
import json

def get_secret(secret_name):
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name='us-east-1'
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except Exception as e:
        raise e
    else:
        if 'SecretString' in get_secret_value_response:
            secret = json.loads(get_secret_value_response['SecretString'])
            return secret
```

#### Option 3: Environment Variables in CI/CD

When using GitHub Actions or other CI/CD tools:

1. Store secrets in the CI/CD platform's secret management
2. Pass them as environment variables during deployment

Example GitHub Actions workflow:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          SECRET_KEY: ${{ secrets.SECRET_KEY }}
        run: |
          # Your deployment commands here
```

### Best Practices for Secrets Management

1. **Never commit secrets to version control**
   - Always use `.gitignore` to exclude `.env` files
   - Use placeholder values in example files

2. **Use different secrets for different environments**
   - Development
   - Staging
   - Production

3. **Rotate secrets regularly**
   - Set up a schedule for rotating passwords and keys
   - Use tools like AWS Secrets Manager's rotation features

4. **Limit access to secrets**
   - Use principle of least privilege
   - Implement role-based access control

5. **Monitor secret usage**
   - Set up alerts for unusual access patterns
   - Log all secret access attempts

6. **Use secure methods to transmit secrets**
   - Always use HTTPS/TLS
   - Avoid passing secrets in URLs or logs

7. **Consider using a secrets management service**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault

## 🧪 Testing and Troubleshooting

### Common Commands

```bash
# View all running containers
docker compose ps

# View logs from all services
docker compose logs

# View logs from a specific service
docker compose logs backend

# Stream logs in real-time
docker compose logs -f

# Restart a single service
docker compose restart backend

# Run a command in a running container
docker compose exec backend python manage.py createsuperuser
```

### Troubleshooting Tips

1. **Database Connection Issues**:
   - Check if the database service is running: `docker compose ps`
   - Verify the connection string in the backend settings
   - Make sure database volume is created properly

2. **Frontend Hot-Reload Not Working**:
   - Ensure volumes are mapped correctly in docker-compose.yml
   - Check that Docker is allowed sufficient resources

3. **Backend API Not Accessible**:
   - Verify CORS settings in the Django backend
   - Check network configuration in docker-compose.yml

4. **Fixture Loading Issues**:
   - Ensure fixtures are in the correct location (usually in a `fixtures` directory)
   - Check that the fixture files are properly formatted JSON
   - Verify that the model dependencies are loaded in the correct order
   - If a fixture fails, check the error message for specific issues
   - For automated loading, check the entrypoint script logs

---

## ☁️ Phase 4: AWS ECR Integration (`feature/aws-ecr`)

Once your Docker setup works locally, you can push images to AWS ECR for deployment.

### Step 1: Set Up AWS CLI

Install and configure AWS CLI:

```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure
```

### Step 2: Authenticate with ECR

```bash
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-region>.amazonaws.com
```

### Step 3: Create ECR Repositories

```bash
aws ecr create-repository --repository-name bonsai-backend
aws ecr create-repository --repository-name bonsai-frontend
```

### Step 4: Tag and Push Images

```bash
# Build images
docker compose build

# Tag images
docker tag bonsai-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/bonsai-backend:latest
docker tag bonsai-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/bonsai-frontend:latest

# Push images
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/bonsai-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/bonsai-frontend:latest
```

---

## 🤖 Phase 5: CI/CD with GitHub Actions (`feature/github-actions-cicd`)

### Create GitHub Actions Workflow

Create a file at `.github/workflows/deploy-ecr.yml`:

```yaml
name: Build and Push to ECR

on:
  push:
    branches: [main]

jobs:
  push-to-ecr:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Log in to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and Push Backend Image
        run: |
          docker build -t bonsai-backend ./apps/backend
          docker tag bonsai-backend:latest ${{ steps.login-ecr.outputs.registry }}/bonsai-backend:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/bonsai-backend:latest

      - name: Build and Push Frontend Image
        run: |
          docker build -t bonsai-frontend ./apps/frontend
          docker tag bonsai-frontend:latest ${{ steps.login-ecr.outputs.registry }}/bonsai-frontend:latest
          docker push ${{ steps.login-ecr.outputs.registry }}/bonsai-frontend:latest
```

### Add GitHub Secrets

In your GitHub repository settings, add these secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 🚀 Production Considerations

### Security Enhancements

1. **Use Environment Variables**: 
   - Replace hardcoded credentials with environment variables
   - Use `.env` files (added to `.gitignore`) for local development
   - Use secrets management for production

2. **Multi-stage Builds**:
   - Minimize image size by using multi-stage builds
   - Remove build tools from final images

3. **Container Scanning**:
   - Implement vulnerability scanning for container images

### Performance Optimizations

1. **Caching Strategies**:
   - Configure volume caching for faster builds
   - Use appropriate cache policies in Nginx

2. **Resource Limits**:
   - Set CPU and memory limits in production compose files

### Example Production Docker Compose

Create a `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: ${ECR_REGISTRY}/bonsai-backend:latest
    restart: always
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=your-domain.com
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  frontend:
    image: ${ECR_REGISTRY}/bonsai-frontend:latest
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M

  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 📁 Recommended Project Structure

```
bonsai/
├── .github/
│   └── workflows/
│       └── deploy-ecr.yml
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── entrypoint.sh
│   │   ├── manage.py
│   │   ├── fixtures/
│   │   │   ├── users.json
│   │   │   ├── products.json
│   │   │   ├── posts.json
│   │   │   ├── reviews.json
│   │   │   └── comments.json
│   │   └── ...
│   └── frontend/
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       ├── .dockerignore
│       ├── nginx.conf
│       └── ...
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## 📚 Additional Resources

- [Official Docker Documentation](https://docs.docker.com/)
- [Django with Docker Compose Guide](https://docs.docker.com/samples/django/)
- [React with Docker Guide](https://mherman.org/blog/dockerizing-a-react-app/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Django Fixtures Documentation](https://docs.djangoproject.com/en/3.9/howto/initial-data/)

---

## ✅ Next Steps

After validating your Docker setup locally:

1. Merge your work into `main` via PR
2. Move on to `feature/docker-compose-prod` or Kubernetes setup!
3. Configure CI/CD pipelines with GitHub Actions

Happy coding! 🌱 