# Build stage
FROM python:3.9-alpine AS builder

# Install build dependencies
RUN apk add --no-cache postgresql-dev gcc python3-dev musl-dev

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Second stage
FROM python:3.9-alpine

# Install runtime dependencies
RUN apk add --no-cache libpq

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Set work directory
WORKDIR /app

# Copy project
COPY . .

# Create media directory
RUN mkdir -p /app/media

# Expose port
EXPOSE 8000

# Create health check endpoint
RUN echo 'from django.http import HttpResponse\nfrom django.urls import path\n\ndef health(request):\n    return HttpResponse("ok")\n\nurlpatterns = [path("health/", health)]' > health_check/urls.py

# Run migrations and collect static files
RUN python manage.py collectstatic --noinput

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"] 