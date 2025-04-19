# Bonsai DevOps Project

This project implements a complete DevOps infrastructure for a web application using modern cloud-native technologies. It includes a Django backend, React frontend, and Kubernetes-based deployment.

## Project Structure

```
devops-test/
├── .github/              # GitHub workflows and configurations
├── apps/                 # Application code
│   ├── backend/         # Django backend application
│   └── frontend/        # React frontend application
├── docs/                # Project documentation
├── infra/               # Infrastructure configuration
│   ├── dockerfiles/     # Docker build configurations
│   ├── k8s/             # Kubernetes manifests
│   └── terraform/       # Infrastructure as Code
├── .env                 # Environment variables (not in version control)
├── .gitignore          # Git ignore rules
├── docker-compose.yml   # Docker Compose configuration
├── LICENSE             # License file
└── README.md           # This file
```

## Local Development Setup

### Prerequisites

- Docker and Docker Compose installed
- Git
- Node.js (for frontend development)
- Python 3.8+ (for backend development)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/mikhail-w/devops-test
cd devops-test
```

2. Create environment file at the project root:
```bash
# Make sure you're in the project root directory (devops-test/)
touch .env
```

Configure your `.env` file with the following variables (all environment variables must be set in a single `.env` file at the project root):
```bash
# Environment Configuration
ENVIRONMENT=development
DOMAIN_NAME=localhost

# Database Configuration
DB_NAME=bonsai_store
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_HOST=db
DB_PORT=5432

# AWS RDS Configuration (Production)
AWS_RDS_HOST=<your-rds-endpoint>
AWS_RDS_PORT=5432
AWS_RDS_DB_NAME=<your-rds-db-name>
AWS_RDS_USER=<your-rds-user>
AWS_RDS_PASSWORD=<your-rds-password>

# Backend Configuration
DEBUG=True
SECRET_KEY=<your-django-secret-key>
ALLOWED_HOSTS=localhost,127.0.0.1,backend,*.amazonaws.com,${DOMAIN_NAME}
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend,https://${DOMAIN_NAME}
LOAD_INITIAL_DATA=True

# Admin Credentials
DJANGO_SUPERUSER_USERNAME=<your-admin-username>
DJANGO_SUPERUSER_EMAIL=<your-admin-email>
DJANGO_SUPERUSER_PASSWORD=<your-admin-password>

# API Configuration
API_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=${VITE_API_BASE_URL}/api
VITE_MEDIA_URL=${VITE_API_BASE_URL}/media
VITE_STATIC_URL=${VITE_API_BASE_URL}/static

# AWS S3 Configuration (Production)
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_STORAGE_BUCKET_NAME=<your-bucket-name>
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=${AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com

# Frontend Configuration - API Keys
VITE_WEATHER_API_KEY=<your-weather-api-key>
VITE_PAYPAL_CLIENT_ID=<your-paypal-client-id>
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
VITE_GOOGLE_CLOUD_VISION_API_KEY=<your-google-cloud-vision-api-key>

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_BLOG=true

# Authentication
VITE_AUTH_TOKEN_KEY=bonsai_auth_token
VITE_REFRESH_TOKEN_KEY=bonsai_refresh_token
```



### Running with Docker Compose

1. Build and start the containers:
```bash
docker-compose up --build
```

2. The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Interface: http://localhost:8000/admin

### Stopping the Application

```bash
docker-compose down
```


The project uses a single `.env`