# Bonsai DevOps Project

This project implements a complete DevOps infrastructure for a web application using modern cloud-native technologies. It includes a Django backend, React frontend, and Kubernetes-based deployment on AWS EKS.

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers are lightweight, standalone, and executable packages that include everything needed to run a piece of software, including the code, runtime, system tools, libraries, and settings.

### Why Use Docker?

1. **Consistency**: Docker ensures that your application runs the same way across different environments (development, staging, production).
2. **Isolation**: Each container runs in its own isolated environment, preventing conflicts between applications.
3. **Portability**: Containers can run on any system that has Docker installed.
4. **Resource Efficiency**: Containers are lightweight and start quickly compared to virtual machines.
5. **Scalability**: Easy to scale applications horizontally by running multiple containers.

## What is DockerHub?

DockerHub is a cloud-based registry service that allows you to download Docker images, store your own images, and share them with others. It's like GitHub for Docker images.

### Why Use DockerHub?

1. **Image Distribution**: Easily share and distribute your Docker images.
2. **Version Control**: Tag and version your images for better management.
3. **Automation**: Integrate with CI/CD pipelines for automated builds and deployments.
4. **Collaboration**: Share images with team members and the Docker community.
5. **Security**: Scan images for vulnerabilities and manage access control.

## Project Structure

```
.
├── apps/
│   ├── backend/           # Django backend application
│   └── frontend/          # React frontend application
├── infra/
│   ├── k8s/              # Kubernetes manifests
│   │   ├── deployments/  # Deployment configurations
│   │   ├── services/     # Service configurations
│   │   └── ...          # Other K8s resources
│   └── terraform/        # Infrastructure as Code
│       ├── modules/      # Terraform modules
│       └── ...          # Terraform configurations
└── .github/workflows/    # CI/CD pipelines
```

## Docker in This Project

This project uses Docker for:
1. **Development Environment**: Local development using Docker Compose
2. **Production Deployment**: Containerized applications deployed to Kubernetes
3. **CI/CD Pipeline**: Automated builds and deployments
4. **Image Distribution**: Publishing images to DockerHub

## Dockerizing the Frontend

### Step 1: Create a Dockerfile

The frontend Dockerfile uses a multi-stage build process:

```dockerfile
# Build stage
FROM node:16-alpine AS builder

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Second stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Build and Test Locally

```bash
# Navigate to frontend directory
cd apps/frontend

# Build the image
docker build -t bonsai-frontend .

# Test locally
docker run -p 3000:80 bonsai-frontend
```

### Step 3: Publish to DockerHub

```bash
# Login to DockerHub
docker login

# Tag the image
docker tag bonsai-frontend your-dockerhub-username/bonsai-frontend:latest

# Push to DockerHub
docker push your-dockerhub-username/bonsai-frontend:latest
```

Or use the provided publish script:

```bash
# Edit the script to set your DockerHub username
nano publish.sh

# Make it executable
chmod +x publish.sh

# Run the script
./publish.sh
```

## Dockerizing the Backend

### Step 1: Create a Dockerfile

```dockerfile
# Use Python base image
FROM python:3.9-slim

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Step 2: Build and Test Locally

```bash
# Navigate to backend directory
cd apps/backend

# Build the image
docker build -t bonsai-backend .

# Test locally
docker run -p 8000:8000 bonsai-backend
```

### Step 3: Publish to DockerHub

```bash
# Tag the image
docker tag bonsai-backend your-dockerhub-username/bonsai-backend:latest

# Push to DockerHub
docker push your-dockerhub-username/bonsai-backend:latest
```

## Docker Compose in This Project

Docker Compose is used to define and run multi-container Docker applications. In this project, it's used for local development and testing.

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./apps/backend
      dockerfile: Dockerfile
    env_file: .env
    volumes:
      - ./apps/backend:/app
      - media_volume:/app/media
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
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
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  db:
    image: postgres:13-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    env_file: .env
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  media_volume:
```

### Using Docker Compose

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f frontend
```

## Development Workflow

1. **Local Development**:
   - Use Docker Compose for local development
   - Changes to code are reflected immediately due to volume mounts
   - Frontend runs on http://localhost:3000
   - Backend runs on http://localhost:8000

2. **Testing**:
   - Run tests in containers
   - Use Docker Compose for integration testing
   - CI/CD pipeline uses Docker for automated testing

3. **Deployment**:
   - Build and push Docker images to DockerHub
   - Kubernetes pulls images from DockerHub
   - Infrastructure is managed by Terraform

## Best Practices

1. **Image Size**:
   - Use multi-stage builds
   - Remove unnecessary files and dependencies
   - Use .dockerignore to exclude files

2. **Security**:
   - Use official base images
   - Run containers as non-root users
   - Scan images for vulnerabilities
   - Use secrets for sensitive data

3. **Performance**:
   - Use appropriate base images
   - Optimize layer caching
   - Use health checks
   - Configure resource limits

4. **Maintenance**:
   - Tag images with semantic versions
   - Keep base images updated
   - Document Docker configurations
   - Use automated builds

## Troubleshooting

1. **Common Issues**:
   - Container fails to start: Check logs with `docker logs`
   - Build failures: Check Dockerfile and build context
   - Network issues: Check Docker network configuration
   - Volume mounts: Check permissions and paths

2. **Debugging**:
   - Use `docker exec` to access container shell
   - Check container logs
   - Inspect container configuration
   - Use Docker Desktop for visual debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For support, please [create an issue](repository-issues-url) or contact the maintainers. 