# Dockerizing Your Django Backend: Step-by-Step Guide

## Prerequisites

- Docker and Docker Compose installed
- Your Django project with the current structure

## Step 1: Create Docker Configuration Files

### 1. Dockerfile for Backend

Create `apps/backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim AS builder

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

### 2. Entrypoint Script

Create `apps/backend/entrypoint.sh`:

```bash
#!/bin/bash

# Function to check if postgres is up and ready
function postgres_ready(){
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(
        dbname="${DB_NAME}",
        user="${DB_USER}",
        password="${DB_PASSWORD}",
        host="${DB_HOST}",
        port="${DB_PORT}"
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

echo "Waiting for PostgreSQL to be ready..."
# Wait for postgres to be ready
until postgres_ready; do
  sleep 2
done
echo "PostgreSQL is ready!"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if environment variables are set
if [ -n "${DJANGO_SUPERUSER_USERNAME}" ] && [ -n "${DJANGO_SUPERUSER_EMAIL}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD}" ]; then
    echo "Creating superuser..."
    python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
try:
    # Remove any existing superusers
    User.objects.filter(is_superuser=True).delete()

    # Create new superuser with correct format
    User.objects.create_superuser(
        username='admin',
        email='admin@mail.com',
        password='adminpassword'
    )
    print('Superuser created successfully')
except Exception as e:
    print(f'Error creating superuser: {e}')
"
fi

# Load initial data if needed
if [ "${LOAD_INITIAL_DATA}" = "True" ]; then
    echo "Loading initial data..."
    if [ -f "users.json" ]; then python manage.py loaddata users.json; fi
    if [ -f "products.json" ]; then python manage.py loaddata products.json; fi
    if [ -f "reviews.json" ]; then python manage.py loaddata reviews.json; fi
    if [ -f "posts.json" ]; then python manage.py loaddata posts.json; fi
    if [ -f "comments.json" ]; then python manage.py loaddata comments.json; fi
fi

# Create health check module and view
mkdir -p health_check
echo "from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def health_view(request):
    return HttpResponse('OK', status=200)" > health_check/__init__.py

# Add health check URL pattern to urls.py if it doesn't exist
if ! grep -q "health_check" "backend/urls.py"; then
    # Create a backup of the original file
    cp backend/urls.py backend/urls.py.bak

    # Add import for health_check
    sed -i "s/from django.conf.urls.static import static/from django.conf.urls.static import static\nfrom health_check import health_view/" backend/urls.py

    # Add health check URL pattern
    sed -i "s/\]$/    path('health\/', health_view, name='health'),\n]/" backend/urls.py

    echo "Added health check endpoint to urls.py"
fi

# Execute the command passed to the entrypoint
exec "$@"
```

### 3. Dockerfile for Frontend

Create `apps/frontend/Dockerfile`:

```dockerfile
FROM node:16-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
```

## Step 2: Create Docker Compose Configuration

Create `docker-compose.yml` in the root directory:

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
      - '8000:8000'
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
      - '3000:3000'
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
      - '5432:5432'
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

## Step 3: Configure Environment Variables

Create `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DB_NAME=bonsai_store
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Django Configuration
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Admin User Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@mail.com
ADMIN_PASSWORD=admin

# API Configuration
API_URL=http://localhost:8000/api

# Email Configuration (optional, required for password reset functionality)
EMAIL_HOST=smtp.mail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@mail.com
EMAIL_HOST_PASSWORD=your_email_password
EMAIL_USE_TLS=True

# Frontend Configuration
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key

# AWS Configuration (required for production deployment)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=your_region

# EKS Configuration (required for Kubernetes deployment)
EKS_CLUSTER_NAME=bonsai-cluster
EKS_NODE_GROUP_NAME=bonsai-node-group

# RDS Configuration (required for production database)
RDS_INSTANCE_CLASS=db.t3.micro
RDS_ALLOCATED_STORAGE=20
RDS_MULTI_AZ=false
```

Important Notes:

1. Replace all placeholder values (like 'your-secret-key-here') with actual
   secure values
2. For development, you can use simpler values for database credentials
3. Email configuration is optional but required for password reset functionality
4. API keys should be kept secure and not committed to version control
5. AWS configuration is only needed for production deployment
6. Make sure to add .env to your .gitignore file to prevent committing sensitive
   information

## Step 4: Build and Start the Services

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

## Step 5: Initialize the Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## Step 6: Access Your Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin
- API Documentation: http://localhost:8000/api/docs

## Step 7: Development Workflow

### Making Changes

- Backend changes are automatically reflected due to volume mounting
- Frontend changes are automatically reflected due to volume mounting
- Database changes require migrations:

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**

   - Ensure ports 3000, 8000, and 5432 are not in use
   - Check with: `netstat -tuln | grep <port>`

2. **Database Connection Issues**

   - Verify database credentials in `.env`
   - Check database logs: `docker-compose logs db`

3. **Container Startup Issues**
   - Check container logs: `docker-compose logs <service>`
   - Verify environment variables: `docker-compose config`

### Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec backend python manage.py <command>
docker-compose exec frontend npm <command>

# Rebuild specific service
docker-compose build <service>

# Restart specific service
docker-compose restart <service>

# Clean up
docker-compose down -v
docker system prune -a
```
