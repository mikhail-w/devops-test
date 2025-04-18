# Dockerizing Your Django Backend: Step-by-Step Guide

## Prerequisites
- Docker and Docker Compose installed
- Your Django project with the current structure

## Step 1: Create Docker Configuration Files

### 1. Dockerfile for Backend
Create `apps/backend/Dockerfile`:
```dockerfile
# Build stage
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

# Runtime stage
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    netcat-traditional \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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

### 2. Dockerfile for Frontend
Create `apps/frontend/Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

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

# Create a non-root user
RUN adduser -D -H -u 1000 -s /bin/sh www-data && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R www-data:www-data /var/run/nginx.pid

# Switch to non-root user
USER www-data

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
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
      - "8000:8000"
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
      - "host.docker.internal:host-gateway"
      - "api.quotable.io:3.33.148.61"
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
    env_file: .env
    environment:
      - VITE_API_URL=http://backend:8000
      - VITE_API_URL_PUBLIC=http://localhost:8000
      - VITE_WEATHER_API_KEY=${VITE_WEATHER_API_KEY}
      - VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}
      - VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
      - VITE_GOOGLE_CLOUD_VISION_API_KEY=${VITE_GOOGLE_CLOUD_VISION_API_KEY}
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network
    dns:
      - 8.8.8.8
      - 8.8.4.4
      - 1.1.1.1
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
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

## Step 3: Environment Configuration

### 1. Root Directory Configuration
Create a `.env.example` file in your project root (and add `.env` to your .gitignore):

```env
# Database Configuration
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_HOST=db
DB_PORT=5432

# Django Configuration
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Admin User Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

# Frontend Configuration
VITE_API_URL=http://backend:8000
VITE_API_URL_PUBLIC=http://localhost:8000
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key

# Optional Configurations
# Email Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
EMAIL_USE_TLS=True

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=your_region
```

### 2. Backend Environment Configuration
Create `apps/backend/.env.example`:

```env
# Django Configuration
DJANGO_SECRET_KEY=your-secret-key-for-development
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Database Configuration (for Django and PostgreSQL container)
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=your_db_name
DB_HOST=db
DB_PORT=5432

# Security Settings
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY

# Load Initial Data
LOAD_INITIAL_DATA=True

# Superuser Creation
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your_secure_admin_password

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend

# Optional Configurations
# OpenAI Configuration (if using AI features)
OPENAI_API_KEY=your_openai_api_key

# AWS S3 Configuration (if using S3 for storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=your_region
AWS_S3_CUSTOM_DOMAIN=your_cloudfront_domain
```

### 3. Frontend Environment Configuration
Create `apps/frontend/.env.example`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_VERSION=v1

# Environment
VITE_NODE_ENV=development
VITE_DEBUG=true

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_BLOG=true

# Authentication
VITE_AUTH_TOKEN_KEY=bonsai_auth_token
VITE_REFRESH_TOKEN_KEY=bonsai_refresh_token

# CORS Configuration
VITE_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Media Configuration
VITE_MEDIA_URL=http://localhost:8000/media/
VITE_STATIC_URL=http://localhost:8000/static/

# Analytics (Optional)
VITE_ENABLE_ANALYTICS=false
VITE_ANALYTICS_ID=your_analytics_id

# Error Reporting (Optional)
VITE_ENABLE_ERROR_REPORTING=false
VITE_ERROR_REPORTING_DSN=your_error_reporting_dsn

# Environment Configuration
VITE_ENV=development
VITE_S3_PATH=http://localhost:8000

# External Services Configuration
VITE_WEATHER_API_KEY=your_weather_api_key

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Plant ID API Key
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key
```

### Environment Files Setup Instructions

1. Copy each `.env.example` file to create corresponding `.env` files:
   ```bash
   # Root directory
   cp .env.example .env
   
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   
   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   ```

2. Update each `.env` file with your actual values

3. Add all `.env` files to `.gitignore`:
   ```gitignore
   # Environment files
   .env
   apps/backend/.env
   apps/frontend/.env
   ```

## Security Best Practices

1. Environment Variables:
   - NEVER commit `.env` files to version control
   - Always use `.env.example` with dummy values as a template
   - Use strong, unique passwords in production
   - Keep API keys secure and rotate them regularly

2. Docker Security:
   - Use multi-stage builds to minimize image size
   - Run containers as non-root users when possible
   - Keep base images updated
   - Scan images for vulnerabilities
   - Use specific version tags instead of 'latest'

3. Application Security:
   - Set DEBUG=False in production
   - Use secure CORS settings
   - Enable appropriate security headers
   - Implement rate limiting
   - Use HTTPS in production

4. Database Security:
   - Use strong passwords
   - Limit database access to necessary services
   - Regular backups
   - Keep PostgreSQL updated

## Usage Instructions

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Build and start services:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. Monitor logs:
   ```bash
   docker-compose logs -f
   ```

4. Access services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

5. Stop services:
   ```bash
   docker-compose down
   ```

## Troubleshooting

1. Container Health Checks:
   ```bash
   docker-compose ps
   ```

2. View Service Logs:
   ```bash
   docker-compose logs -f [service_name]
   ```

3. Common Issues:
   - Port conflicts: Check if ports 3000, 8000, or 5432 are in use
   - Database connection: Verify DB_HOST and credentials
   - Volume permissions: Check directory permissions 