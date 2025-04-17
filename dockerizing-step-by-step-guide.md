# Dockerizing Your Django Backend: Step-by-Step Guide

## Prerequisites
- Docker and Docker Compose installed
- Your Django project with the current structure

## Step 1: Create Docker Configuration Files

### 1. Dockerfile for Backend
Create `apps/backend/Dockerfile`:
```dockerfile
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

### 2. Entrypoint Script
Create `apps/backend/entrypoint.sh`:
```bash
#!/bin/sh

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start server
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

## Step 3: Configure Environment Variables

Create `.env` file in the root directory:
```bash
# Django Settings
DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=bonsai_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Frontend Settings
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
```

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