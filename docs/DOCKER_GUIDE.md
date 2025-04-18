# 🌿 Bonsai App - Docker Setup Guide

Welcome to the comprehensive guide for setting up the Bonsai application using Docker! This guide will walk you through Dockerizing both the **backend (Django)** and **frontend (React)** components, connecting them with **Docker Compose**, and configuring Nginx for production deployment.

## 📋 Table of Contents

- [Overview](#-high-level-overview)
- [Prerequisites](#-prerequisites)
- [Phase 1: Dockerize the Backend](#-phase-1-dockerize-the-backend)
- [Phase 2: Dockerize the Frontend](#-phase-2-dockerize-the-frontend)
- [Phase 3: Docker Compose Setup](#-phase-3-docker-compose-setup)
- [Phase 4: Nginx Configuration](#-phase-4-nginx-configuration)
- [Testing and Troubleshooting](#-testing-and-troubleshooting)

---



## 🗺️ High-Level Overview

We'll complete this setup in **4 phases**:

1. **Dockerize the Backend** - Create a Django container
2. **Dockerize the Frontend** - Create a React container
3. **Connect with Docker Compose** - Orchestrate all services
4. **Configure Nginx** - Set up reverse proxy and SSL

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed:

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git
- Node.js (for local development)
- Python (for local development)

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


## 📦 Phase 1: Dockerize the Backend

### Step 1: Create a `Dockerfile` in `/apps/backend`

```Dockerfile
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

### Step 2: Create a `.dockerignore` file

```gitignore
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

# Keep fixtures directory
!fixtures/
!fixtures/*.json
```

### Step 3: Create an Entrypoint Script

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
    if [ -f "fixtures/users.json" ]; then python manage.py loaddata fixtures/users.json; fi
    if [ -f "fixtures/products.json" ]; then python manage.py loaddata fixtures/products.json; fi
    if [ -f "fixtures/reviews.json" ]; then python manage.py loaddata fixtures/reviews.json; fi
    if [ -f "fixtures/posts.json" ]; then python manage.py loaddata fixtures/posts.json; fi
    if [ -f "fixtures/comments.json" ]; then python manage.py loaddata fixtures/comments.json; fi
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
    cp backend/urls.py backend/urls.py.bak
    sed -i "s/from django.conf.urls.static import static/from django.conf.urls.static import static\nfrom health_check import health_view/" backend/urls.py
    sed -i "s/\]$/    path('health\/', health_view, name='health'),\n]/" backend/urls.py
    echo "Added health check endpoint to urls.py"
fi

# Execute the command passed to the entrypoint
exec "$@"
```

---

## 🌿 Phase 2: Dockerize the Frontend

### Step 1: Create a `Dockerfile` in `/apps/frontend`

```Dockerfile
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

### Step 2: Create Nginx Configuration

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
    env_file: .env
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
      - VITE_API_URL=${VITE_API_URL}
      - VITE_API_URL_PUBLIC=http://localhost:8000
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

### Step 2: Create `.env.example` file

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
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend

# Admin User Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password_here

# API Configuration
API_URL=http://localhost:8000/api
VITE_API_URL=http://localhost:8000/

# Frontend Configuration
VITE_API_URL_PUBLIC=http://localhost:8000
VITE_WEATHER_API_KEY=your_weather_api_key_here
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key_here
```

-
---

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

4. **Nginx Issues**:
   - Check Nginx configuration syntax: `nginx -t`
   - Verify SSL certificate paths
   - Check Nginx error logs: `docker compose logs nginx`

---

## 📚 Additional Resources

- [Official Docker Documentation](https://docs.docker.com/)
- [Django with Docker Compose Guide](https://docs.docker.com/samples/django/)
- [React with Docker Guide](https://mherman.org/blog/dockerizing-a-react-app/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Next Steps

After validating your Docker setup locally:

1. Test the application thoroughly
2. Configure SSL certificates
3. Set up monitoring and logging
4. Implement CI/CD pipeline

Happy coding! 🌱 