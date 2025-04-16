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
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mail.com', 'adminpassword')
"

# Start the application
echo "Starting the application..."
exec "$@"