# Dockerizing Your Django Backend: Step-by-Step Guide

## Prerequisites
- Docker and Docker Compose installed
- Your Django project with the current structure

## Step 1: Create Docker Configuration Files

### 1. Dockerfile for Backend
Create `apps/backend/Dockerfile` with the configuration provided.

### 2. Entrypoint Script
Create `apps/backend/entrypoint.sh` and make it executable:
```bash
chmod +x apps/backend/entrypoint.sh
```

### 3. .dockerignore File
Create `apps/backend/.dockerignore` to exclude unnecessary files.

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Modify the `.env` file to match your requirements:
   - Set a secure `DJANGO_SECRET_KEY`
   - Configure database settings
   - Set OpenAI API key if you're using the chatbot functionality
   - Configure AWS S3 if you're using it for storage

## Step 3: Start the Docker Containers

1. Build and start the containers:
```bash
docker-compose build
docker-compose up -d
```

2. Check if all services are running properly:
```bash
docker-compose ps
```

3. Check the logs to ensure everything started correctly:
```bash
docker-compose logs -f backend
```

## Step 4: Initialize the Database

The entrypoint script automatically:
- Runs migrations
- Collects static files
- Creates a superuser (if credentials are provided in the env file)
- Loads initial data (if `LOAD_INITIAL_DATA=True`)

You can manually run these commands if needed:
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Load fixture data
docker-compose exec backend python manage.py loaddata users.json products.json reviews.json
```

## Step 5: Access Your Application

- Django backend: http://localhost:8000/
- Django admin: http://localhost:8000/admin/
- Frontend: http://localhost:3000/

## Step 6: Working with Docker

### Running Management Commands
```bash
# Create new app
docker-compose exec backend python manage.py startapp new_app

# Make migrations
docker-compose exec backend python manage.py makemigrations

# Django shell
docker-compose exec backend python manage.py shell
```

### Database Operations
```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres -d bonsai_store

# Backup Database
docker-compose exec db pg_dump -U postgres bonsai_store > backup_$(date +%Y-%m-%d).sql

# Restore Database
cat backup_file.sql | docker-compose exec -T db psql -U postgres bonsai_store
```

### Stopping and Restarting
```bash
# Stop containers
docker-compose down

# Start containers
docker-compose up -d

# Restart a specific service
docker-compose restart backend
```

## Step 7: Production Deployment Considerations

For production deployment, consider the following adjustments:

1. Update environment variables:
   - Set `DJANGO_DEBUG=False`
   - Use strong, unique passwords
   - Set proper `DJANGO_ALLOWED_HOSTS`

2. Configure Gunicorn as the WSGI server instead of Django's development server:
   - Change the CMD in the Dockerfile to:
     ```
     CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
     ```

3. Consider adding Nginx as a reverse proxy

4. Set up SSL certificates for secure connections

5. Implement proper logging and monitoring

6. Configure automated database backups

## Troubleshooting

### Container Won't Start
Check the logs:
```bash
docker-compose logs backend
```

### Database Connection Issues
1. Verify environment variables in `.env`
2. Make sure the database container is running: 
```bash
docker-compose ps db
```
3. Check database logs:
```bash
docker-compose logs db
```

### Static or Media Files Not Loading
1. Verify volume mounts in `docker-compose.yml`
2. Check Django settings for proper static and media configurations
3. Ensure `collectstatic` ran successfully