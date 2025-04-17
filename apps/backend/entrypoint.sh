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
    python manage.py createsuperuser --noinput || echo "Superuser already exists"
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