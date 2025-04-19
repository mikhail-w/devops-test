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
├── .env.production      # Production environment template
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

2. Create environment file:
```bash
cp .env.production .env
```

3. Create Kubernetes secrets (for local development):
```bash
# Create a new file k8s/secret.yaml with the following content:
apiVersion: v1
kind: Secret
metadata:
  name: bonsai-secrets
  namespace: bonsai-store
type: Opaque
stringData:
  SECRET_KEY: "your-secret-key-here"
  DB_PASSWORD: "your-db-password"
  DJANGO_SUPERUSER_PASSWORD: "your-admin-password"
  VITE_WEATHER_API_KEY: "your-weather-api-key"
  VITE_PAYPAL_CLIENT_ID: "your-paypal-client-id"
  VITE_GOOGLE_MAPS_API_KEY: "your-google-maps-api-key"
  VITE_GOOGLE_CLOUD_VISION_API_KEY: "your-google-cloud-vision-api-key"
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



## Environment Variables

The project uses a single `.env` file in the root directory for all environment variables. This file is not committed to version control. You can create it by copying `.env.production`:

```bash
cp .env.production .env
```

The environment file contains variables for both backend and frontend, including:
- Database configuration
- Django settings
- API keys
- Feature flags
- Frontend configuration

