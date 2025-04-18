# 🌿 Bonsai App - Complete Docker Setup Guide

Welcome to the comprehensive guide for setting up and running the Bonsai application using Docker! This guide reflects the current state of the project and will walk you through setting up both the **backend (Django)** and **frontend (React/Vite)** components, connecting them with **Docker Compose**, and managing environment variables.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Docker Compose Configuration](#-docker-compose-configuration)
- [Application Access](#-application-access)
- [Common Commands](#-common-commands)
- [Troubleshooting](#-troubleshooting)

## 🛠️ Prerequisites

Ensure you have the following installed:
- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git
- Node.js (for local development)
- Python (for local development)

## 📁 Project Structure

```
bonsai/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── apps/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── entrypoint.sh
│   │   ├── requirements.txt
│   │   ├── manage.py
│   │   ├── media/
│   │   ├── staticfiles/
│   │   └── ...
│   └── frontend/
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── nginx.conf
│       ├── env.sh
│       ├── package.json
│       ├── vite.config.js
│       └── ...
├── docker-compose.yml
├── .env
├── .env.example
└── README.md
```

## 🔐 Environment Setup

Create a `.env` file in the project root with the following structure:

```bash
# ===== DATABASE CONFIGURATION =====
DB_NAME=bonsai_store
DB_USER=postgres
DB_PASSWORD=your_db_password_here
DB_HOST=db
DB_PORT=5432

# ===== BACKEND CONFIGURATION =====
# Django settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend
LOAD_INITIAL_DATA=True

# Admin credentials
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your_admin_password_here

# ===== API CONFIGURATION =====
API_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=${VITE_API_BASE_URL}/api
VITE_MEDIA_URL=${VITE_API_BASE_URL}/media
VITE_STATIC_URL=${VITE_API_BASE_URL}/static

# ===== FRONTEND CONFIGURATION =====
# Third-party API keys
VITE_WEATHER_API_KEY=your_weather_api_key_here
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here

# Feature flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_BLOG=true

# Authentication
VITE_AUTH_TOKEN_KEY=bonsai_auth_token
VITE_REFRESH_TOKEN_KEY=bonsai_refresh_token
```

## 📦 Backend Setup

### Backend Dockerfile

Create `apps/backend/Dockerfile`:

```dockerfile
# Build stage
FROM python:3.11-alpine AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    postgresql-client \
    curl \
    libffi-dev \
    bash \
    netcat-openbsd

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Create media and static directories
RUN mkdir -p /app/media /app/staticfiles

# Runtime stage
FROM python:3.11-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    netcat-openbsd \
    bash \
    curl

# Copy only necessary files from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

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

### Backend Entrypoint Script

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
    python manage.py shell << END
from django.contrib.auth import get_user_model
from django.db import IntegrityError
User = get_user_model()

try:
    if not User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}').exists():
        user = User.objects.create_superuser(
            username='${DJANGO_SUPERUSER_USERNAME}',
            email='${DJANGO_SUPERUSER_EMAIL}',
            password='${DJANGO_SUPERUSER_PASSWORD}'
        )
        print('Superuser created successfully')
    else:
        # Update existing superuser password
        user = User.objects.get(username='${DJANGO_SUPERUSER_USERNAME}')
        user.set_password('${DJANGO_SUPERUSER_PASSWORD}')
        user.email = '${DJANGO_SUPERUSER_EMAIL}'
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print('Superuser updated successfully')
except IntegrityError as e:
    print(f'Error: Could not create superuser - {str(e)}')
except Exception as e:
    print(f'Error: Unexpected error creating superuser - {str(e)}')
END
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

## 🌿 Frontend Setup

### Frontend Dockerfile

Create `apps/frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Set work directory
WORKDIR /app

# Install necessary dependencies for crypto and build
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with specific versions for production
RUN npm ci --only=production && \
    npm install -D terser@latest

# Copy project files
COPY . .

# Build the project with production optimization
RUN npm run build && \
    # Clean up unnecessary files
    rm -rf node_modules && \
    rm -rf src && \
    rm -rf public && \
    rm -rf .next

# Second stage - Production
FROM nginx:alpine

# Add security headers and remove unnecessary files
RUN apk add --no-cache tzdata && \
    rm -rf /etc/nginx/conf.d/* && \
    rm -rf /usr/share/nginx/html/*

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make the env script executable
COPY env.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

# Handle www-data user/group properly (Alpine specific)
RUN grep -q "^www-data:" /etc/group || addgroup -g 82 www-data && \
    grep -q "^www-data:" /etc/passwd || adduser -D -H -u 1000 -s /bin/sh -G www-data www-data && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /etc/nginx/conf.d && \
    chown -R www-data:www-data /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R www-data:www-data /var/run/nginx.pid

# Switch to non-root user
USER www-data

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Frontend Nginx Configuration

Create `apps/frontend/nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React routing and root requests
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Additional CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }

    # Proxy API requests to the backend
    location /api/ {
        # Use the service name from docker-compose
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
        
        # Add CORS headers
        add_header Access-Control-Allow-Origin '*' always;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE, PATCH' always;
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header Access-Control-Expose-Headers 'Content-Length,Content-Range' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin '*';
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE, PATCH';
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # Proxy media files to backend
    location /media/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90s;
    }

    # Cache static assets
    location /static/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'healthy\n';
    }

    # Handle static image files
    location ~* \.(jpg|jpeg|png|gif|ico)$ {
        root /usr/share/nginx/html;
        try_files $uri $uri/ =404;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "public, max-age=86400";
        expires 1d;
    }
}
```

### Frontend Environment Script

Create `apps/frontend/env.sh`:

```bash
#!/bin/sh

# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment 
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js

# Add environment variables
echo "  VITE_API_BASE_URL: \"${VITE_API_BASE_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_MEDIA_URL: \"${VITE_MEDIA_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_WEATHER_API_KEY: \"${VITE_WEATHER_API_KEY}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_PAYPAL_CLIENT_ID: \"${VITE_PAYPAL_CLIENT_ID}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_GOOGLE_MAPS_API_KEY: \"${VITE_GOOGLE_MAPS_API_KEY}\"," >> /usr/share/nginx/html/env-config.js
echo "  VITE_GOOGLE_CLOUD_VISION_API_KEY: \"${VITE_GOOGLE_CLOUD_VISION_API_KEY}\"," >> /usr/share/nginx/html/env-config.js

# Close the object
echo "}" >> /usr/share/nginx/html/env-config.js
```

## 🔗 Docker Compose Configuration

Create `docker-compose.yml` in the project root:

```yaml
services:
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    env_file: 
      - ./.env
    environment:
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DJANGO_SUPERUSER_USERNAME=${ADMIN_USERNAME}
      - DJANGO_SUPERUSER_EMAIL=${ADMIN_EMAIL}
      - DJANGO_SUPERUSER_PASSWORD=${ADMIN_PASSWORD}
      - DJANGO_DEBUG=${DEBUG}
      - DJANGO_ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - LOAD_INITIAL_DATA=True
      - API_BASE_URL=${API_BASE_URL}
    volumes:
      - ./apps/backend:/app
      - ./apps/backend/media:/app/media
      - static_volume:/app/staticfiles
    ports:
      - '8000:8000'
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network
    dns:
      - 8.8.8.8
      - 8.8.4.4
      - 1.1.1.1
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8000/health/']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    env_file: .env
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
      - VITE_API_URL=${VITE_API_URL}
      - VITE_MEDIA_URL=${VITE_MEDIA_URL}
      - VITE_WEATHER_API_KEY=${VITE_WEATHER_API_KEY}
      - VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}
      - VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
      - VITE_GOOGLE_CLOUD_VISION_API_KEY=${VITE_GOOGLE_CLOUD_VISION_API_KEY}
    ports:
      - '3000:80'
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  db:
    image: postgres:13-alpine
    env_file: .env
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    networks:
      - app-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
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


## 🛠️ Common Commands

Here are the most commonly used Docker commands for this project:

```bash
# Build and start all services
docker-compose up --build

# Start all services in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Stop all services and remove volumes
docker-compose down -v

# Rebuild and restart all services
docker-compose down && docker-compose up --build

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# Execute commands in running containers
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec db psql -U postgres -d bonsai_store

# Check container status
docker-compose ps

# View container resource usage
docker stats

# List all Docker images
docker images
docker images -a  # Show all images including intermediate layers
docker images --no-trunc  # Show full image IDs
docker images --format "{{.ID}}: {{.Repository}}:{{.Tag}}"  # Custom format
docker images --filter "dangling=true"  # Show only dangling images

# List running containers
docker ps
docker ps -a  # Show all containers including stopped ones
docker ps -q  # Show only container IDs
docker ps --format "{{.ID}}: {{.Names}} - {{.Status}}"  # Custom format
docker ps --filter "status=running"  # Show only running containers
docker ps --filter "name=backend"  # Filter by name
docker ps --filter "ancestor=python:3.11-alpine"  # Filter by base image

# List Docker volumes
docker volume ls
docker volume ls --filter "dangling=true"  # Show only unused volumes

# List Docker networks
docker network ls
docker network inspect app-network  # Show detailed network info

# Clean up Docker system
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Remove all unused objects (containers, images, volumes, networks)
docker system prune

# Remove all unused objects including dangling images
docker system prune -a

# Force remove all containers (including running ones)
docker rm -f $(docker ps -aq)

# Force remove all images
docker rmi -f $(docker images -aq)

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend

# Scale services
docker-compose up -d --scale backend=2
docker-compose up -d --scale frontend=3

# View detailed container information
docker inspect <container_id>

# View container resource usage in real-time
docker stats <container_id>

# Copy files from container to host
docker cp <container_id>:<container_path> <host_path>

# Copy files from host to container
docker cp <host_path> <container_id>:<container_path>

# View container logs with timestamps
docker-compose logs -f --timestamps

# View container logs from specific time
docker-compose logs -f --since "2024-01-01"

# View container logs with specific number of lines
docker-compose logs -f --tail=100

# Execute interactive shell in container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db psql -U postgres

# View container environment variables
docker-compose exec backend env
docker-compose exec frontend env

# View container processes
docker-compose exec backend ps aux
docker-compose exec frontend ps aux

# View container network configuration
docker-compose exec backend ip addr
docker-compose exec frontend ip addr

# View container disk usage
docker-compose exec backend df -h
docker-compose exec frontend df -h
```

## 🌐 Application Access

After starting the containers, you can access the application through the following endpoints:

### Frontend Application
- Main Application: http://localhost:3000

### Backend Services
- Admin Console: http://localhost:8000/admin
  - Default admin credentials (if using example .env):
    - Username: admin
    - Email: admin@example.com
    - Password: your_admin_password_here
- API Root: http://localhost:8000/api
- API Documentation: http://localhost:8000/api/docs

### Health Checks

The application includes health check endpoints for all services:

- Frontend: http://localhost:3000/health
- Backend: http://localhost:8000/health/
- Database: Automatically checked via Docker health checks

You can monitor the health status using:
```bash
docker-compose ps
```

### Development Tools
- Database (PostgreSQL):
  - Host: localhost
  - Port: 5432
  - Database: bonsai_store
  - Username: postgres
  - Password: (as specified in .env)

Note: Make sure to replace any default credentials with secure values in production.

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   ```bash
   # Check if database is running
   docker-compose ps
   
   # Check database logs
   docker-compose logs db
   
   # Try restarting the database
   docker-compose restart db
   ```

2. **Frontend Not Loading**
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Rebuild frontend container
   docker-compose up -d --build frontend
   ```

3. **Backend API Issues**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Check if migrations are applied
   docker-compose exec backend python manage.py showmigrations
   
   # Apply migrations manually
   docker-compose exec backend python manage.py migrate
   ```

4. **Environment Variables Not Loading**
   ```bash
   # Check if .env file is present
   ls -la .env
   
   # Verify environment variables in container
   docker-compose exec frontend env
   docker-compose exec backend env
   ```

5. **Permission Issues**
   ```bash
   # Fix media directory permissions
   sudo chown -R $USER:$USER apps/backend/media
   
   # Fix static files permissions
   sudo chown -R $USER:$USER apps/backend/staticfiles
   ```

## 🔐 Security Notes

1. Never commit the `.env` file to version control
2. Always use strong passwords in production
3. Replace all API keys with your own secure keys
4. Consider using Docker secrets in production
5. Keep all packages and dependencies updated

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Nginx Documentation](https://nginx.org/en/docs/)