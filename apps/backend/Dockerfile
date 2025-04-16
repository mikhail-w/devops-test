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
RUN apk add --no-cache libpq netcat-openbsd

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Copy project
COPY . .

# Create media directory
RUN mkdir -p /app/media

# Create health check endpoint
RUN echo 'from django.http import HttpResponse\nfrom django.urls import path\n\ndef health(request):\n    return HttpResponse("ok")\n\nurlpatterns = [path("health/", health)]' > health_check/urls.py

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run gunicorn server
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"] 