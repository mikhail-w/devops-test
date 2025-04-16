# Bonsai DevOps Project

This project implements a complete DevOps infrastructure for a web application using modern cloud-native technologies. It includes a Django backend, React frontend, and Kubernetes-based deployment on AWS EKS.

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

## Prerequisites

- Docker and Docker Compose
- Node.js (v16+)
- Python (3.9+)
- AWS CLI configured with appropriate credentials
- kubectl
- Terraform
- GitHub account (for container registry)

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd bonsai-devops
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your local configuration.

4. Start the development environment:
```bash
docker-compose up
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:8000
- PostgreSQL database at localhost:5432

## Infrastructure Components

### AWS Resources (Managed by Terraform)
- VPC with public and private subnets
- EKS cluster for Kubernetes
- RDS PostgreSQL instance
- Security groups and IAM roles
- EC2 instance for management tasks

### Kubernetes Resources
- Namespace: `bonsai`
- Deployments:
  - Frontend (React)
  - Backend (Django)
- Services:
  - Frontend service (port 80)
  - Backend service (port 8000)
- Ingress configuration
- Persistent volumes for media and static files
- ConfigMaps and Secrets for configuration

## Deployment Process

### 1. Infrastructure Setup

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

This will create all necessary AWS resources.

### 2. Configure kubectl

```bash
aws eks update-kubeconfig --name bonsai-cluster --region us-east-1
```

### 3. Deploy Kubernetes Resources

```bash
# Create namespace and resource quotas
kubectl apply -f infra/k8s/namespace.yaml

# Create storage resources
kubectl apply -f infra/k8s/storage.yaml

# Create ConfigMap and Secrets
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secrets.yaml

# Deploy applications
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress.yaml
```

## CI/CD Pipeline

The project includes three GitHub Actions workflows:

1. `backend-ci.yml`: Builds and tests the Django backend
2. `frontend-ci.yml`: Builds and tests the React frontend
3. `infra-deploy.yml`: Deploys infrastructure changes using Terraform

### How CI/CD Works

1. When code is pushed to the `main` branch:
   - Backend and frontend containers are built and pushed to GitHub Container Registry
   - Infrastructure changes are automatically applied through Terraform

2. Pull requests trigger:
   - Automated testing
   - Infrastructure plan review
   - Code review process

## Monitoring and Maintenance

### Health Checks
- Backend: `http://<domain>/api/health/`
- Frontend: `http://<domain>/health`

### Logs
```bash
# Backend logs
kubectl logs -f deployment/bonsai-backend -n bonsai

# Frontend logs
kubectl logs -f deployment/bonsai-frontend -n bonsai
```

### Scaling
```bash
# Scale backend
kubectl scale deployment bonsai-backend -n bonsai --replicas=3

# Scale frontend
kubectl scale deployment bonsai-frontend -n bonsai --replicas=3
```

## Security Considerations

1. Secrets Management:
   - Kubernetes secrets for sensitive data
   - AWS Secrets Manager for production credentials
   - Environment variables for local development

2. Network Security:
   - Private subnets for sensitive resources
   - Security groups with minimal required access
   - TLS/SSL encryption for all external access

3. Access Control:
   - IAM roles with least privilege
   - RBAC for Kubernetes resources
   - Network policies for pod communication

## Troubleshooting

1. Check pod status:
```bash
kubectl get pods -n bonsai
```

2. Describe pod for details:
```bash
kubectl describe pod <pod-name> -n bonsai
```

3. View pod logs:
```bash
kubectl logs <pod-name> -n bonsai
```

4. Common issues:
   - Database connectivity: Check RDS security groups
   - Image pull errors: Verify GitHub Container Registry access
   - Resource constraints: Check resource quotas and limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For support, please [create an issue](repository-issues-url) or contact the maintainers.
