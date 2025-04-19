# Bonsai Application DevOps Pipeline - Capstone Project

## Project Overview

This repository contains the implementation plan and resources for deploying the [Bonsai plant care tracking application](https://github.com/mikhail-w/bonsai) using DevOps best practices as part of the CodePlatoon DevOps Charlie Capstone project.

## Table of Contents

- [Repository Structure](#repository-structure)
- [Step 1: Project Setup](#step-1-project-setup-and-prerequisites)
- [Step 2: Infrastructure Provisioning](#step-2-infrastructure-provisioning-with-terraform)
- [Step 3: Dockerization](#step-3-dockerization)
- [Step 4: Docker Compose](#step-4-docker-compose-for-local-development)
- [Step 5: CI/CD Pipeline](#step-5-cicd-pipeline-with-github-actions)
- [Step 6: Kubernetes Configuration](#step-6-kubernetes-configuration)
- [Step 7: Monitoring and Backups](#step-7-pipeline-optimization-and-monitoring)
- [Step 8: Documentation](#step-8-documentation-and-diagrams)
- [Implementation Timeline](#implementation-workflow)
- [Key Considerations](#important-considerations)

## Repository Structure

### Development Approach: Monorepo Strategy

For this project, we'll use a **development monorepo with deployment polyrepo** strategy:

1. **Development Phase**: Work in a single monorepo structure for efficient development
2. **Submission Phase**: Split into three separate repositories to fulfill project requirements

The monorepo approach offers several advantages during development:
- Unified workflow for managing dependencies and related changes
- Simplified local development with Docker Compose
- Coordinated versioning across components
- Single source of truth for documentation

### Development Monorepo Structure

```
bonsai/
│
├── apps/
│   ├── frontend/       # React app
│   └── backend/        # Django app
│
├── infra/
│   ├── terraform/      # All .tf files (eks, rds, s3, vpc)
│   ├── k8s/            # YAML manifests for EKS deployment
│   └── dockerfiles/    # Multi-stage Dockerfiles
│
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       ├── backend-ci.yml
│       └── infra-deploy.yml
│
├── docker-compose.yml
└── README.md
```

### Final Submission Structure

For final submission, we'll split the monorepo into three separate repositories:

1. **bonsai-frontend**: 
   - Contains only the React frontend application
   - Has its own Dockerfile and CI/CD workflow

2. **bonsai-backend**:
   - Contains only the Django backend application
   - Has its own Dockerfile and CI/CD workflow

3. **bonsai-infrastructure**:
   - Contains Terraform code and Kubernetes manifests
   - Includes deployment workflows

Each repository will have its own CI/CD pipeline configured in GitHub Actions.

### Visual Representation

#### Development Monorepo Structure
```
bonsai/
│
├── apps/
│   ├── frontend/       ← React app
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── backend/        ← Django app
│       ├── bonsai/
│       ├── plants/
│       ├── users/
│       ├── manage.py
│       └── Dockerfile
│
├── infra/
│   ├── terraform/      ← All .tf files (eks, rds, s3, vpc)
│   │   ├── modules/
│   │   └── environments/
│   │
│   ├── k8s/            ← YAML manifests for EKS deployment
│   │   ├── deployments/
│   │   ├── services/
│   │   └── ingress.yaml
│   │
│   └── dockerfiles/    ← Multi-stage Dockerfiles
│       ├── frontend.Dockerfile
│       └── backend.Dockerfile
│
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       ├── backend-ci.yml
│       └── infra-deploy.yml
│
├── docker-compose.yml
└── README.md
```

#### Final Submission Structure (3 Separate Repositories)

**1. bonsai-frontend Repository:**
```
bonsai-frontend/
│
├── src/
├── public/
├── package.json
├── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── README.md
```

**2. bonsai-backend Repository:**
```
bonsai-backend/
│
├── bonsai/
├── plants/
├── users/
├── manage.py
├── requirements.txt
├── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── README.md
```

**3. bonsai-infrastructure Repository:**
```
bonsai-infrastructure/
│
├── terraform/
│   ├── modules/
│   │   ├── network/
│   │   ├── eks/
│   │   ├── rds/
│   │   └── s3_dynamodb/
│   │
│   └── environments/
│       └── production/
│
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── storage.yaml
│   ├── deployments/
│   ├── services/
│   └── ingress.yaml
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
└── README.md
```

### Repository Split Strategy

To facilitate the transition from the development monorepo to the final three repositories, consider these steps:

1. **Create a script to automate the split process:**
   ```bash
   #!/bin/bash
   
   # Create directories for the three repositories
   mkdir -p bonsai-frontend
   mkdir -p bonsai-backend
   mkdir -p bonsai-infrastructure
   
   # Copy frontend files
   cp -r apps/frontend/* bonsai-frontend/
   
   # Copy backend files
   cp -r apps/backend/* bonsai-backend/
   
   # Copy infrastructure files
   cp -r infra/terraform bonsai-infrastructure/
   cp -r infra/k8s bonsai-infrastructure/
   
   # Copy GitHub workflows
   mkdir -p bonsai-frontend/.github/workflows
   mkdir -p bonsai-backend/.github/workflows
   mkdir -p bonsai-infrastructure/.github/workflows
   
   cp .github/workflows/frontend-ci.yml bonsai-frontend/.github/workflows/ci.yml
   cp .github/workflows/backend-ci.yml bonsai-backend/.github/workflows/ci.yml
   cp .github/workflows/infra-deploy.yml bonsai-infrastructure/.github/workflows/deploy.yml
   
   # Copy README files
   cp README-frontend.md bonsai-frontend/README.md
   cp README-backend.md bonsai-backend/README.md
   cp README-infrastructure.md bonsai-infrastructure/README.md
   ```

2. **Create empty repositories on GitHub:**
   - Create three new repositories on GitHub: `bonsai-frontend`, `bonsai-backend`, and `bonsai-infrastructure`
   - Add team members as collaborators to all repositories

3. **Push the split code to their respective repositories:**
   ```bash
   # Initialize and push frontend repository
   cd bonsai-frontend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/bonsai-frontend.git
   git push -u origin main
   
   # Initialize and push backend repository
   cd ../bonsai-backend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/bonsai-backend.git
   git push -u origin main
   
   # Initialize and push infrastructure repository
   cd ../bonsai-infrastructure
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/bonsai-infrastructure.git
   git push -u origin main
   ```

## Step 1: Project Setup and Prerequisites

### Repository Setup

1. **Fork the Bonsai application**:
   ```bash
   # Clone the original repository
   git clone https://github.com/mikhail-w/bonsai.git
   
   # Create your own GitHub repository and push to it
   cd bonsai
   git remote set-url origin https://github.com/your-username/bonsai.git
   git push -u origin main
   ```

2. **Create infrastructure repository**:
   ```bash
   mkdir bonsai-infrastructure
   cd bonsai-infrastructure
   git init
   # Create .gitignore file
   echo ".terraform/
   *.tfstate
   *.tfstate.backup
   *.tfvars
   .terraform.lock.hcl" > .gitignore
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/bonsai-infrastructure.git
   git push -u origin main
   ```

3. **Create deployment repository**:
   ```bash
   mkdir bonsai-deployment
   cd bonsai-deployment
   git init
   # Create .gitignore file
   echo "*.env
   secrets/" > .gitignore
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/bonsai-deployment.git
   git push -u origin main
   ```

### Collaboration Setup

1. **Add team members**:
   - Go to Settings > Collaborators in each GitHub repository
   - Add each team member by their GitHub username

2. **Set up branch protection rules**:
   - Go to Settings > Branches > Add rule
   - Protect the main branch by requiring pull request reviews before merging

3. **Create GitHub Project board**:
   - Create a new project with columns: To Do, In Progress, Review, Done
   - Assign tasks to team members

### Secret Management

1. **Set up GitHub Secrets**:
   - Go to Settings > Secrets and variables > Actions
   - Add the following secrets:
     - AWS_ACCESS_KEY_ID
     - AWS_SECRET_ACCESS_KEY
     - DATABASE_URL
     - SECRET_KEY

2. **Create .env.example file**:
   ```
   # Database settings
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=example_password
   POSTGRES_DB=bonsai
   POSTGRES_HOST=db
   
   # Django settings
   DEBUG=True
   SECRET_KEY=your_secret_key_here
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

## Step 2: Infrastructure Provisioning with Terraform

### Create Terraform Module Structure

```
bonsai-infrastructure/
├── modules/
│   ├── network/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── eks/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ec2/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── s3_dynamodb/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars
├── .gitignore
└── README.md
```

### Set Up Remote State

1. **Create `modules/s3_dynamodb/main.tf`**:
```hcl
provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = var.state_bucket_name
  
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
```

2. **Configure backend in `environments/production/main.tf`**:
```hcl
terraform {
  backend "s3" {
    bucket         = "bonsai-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "bonsai-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

module "network" {
  source = "../../modules/network"
  # variables
}

module "eks" {
  source = "../../modules/eks"
  # variables
  depends_on = [module.network]
}

module "rds" {
  source = "../../modules/rds"
  # variables
  depends_on = [module.network]
}

module "ec2" {
  source = "../../modules/ec2"
  # variables
  depends_on = [module.network]
}
```

### Create Core Infrastructure Modules

1. **Network Module (`modules/network/main.tf`)**:
```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_subnet" "public" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${count.index}"
    "kubernetes.io/role/elb" = 1
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-${count.index}"
    "kubernetes.io/role/internal-elb" = 1
  }
}

# Internet Gateway, NAT Gateway, Route Tables, etc.
```

2. **EKS Module (`modules/eks/main.tf`)**:
```hcl
resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.eks_cluster.id]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-node-group"
  node_role_arn   = aws_iam_role.eks_node_group.arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.instance_types

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = var.max_nodes
    min_size     = var.min_nodes
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy
  ]
}

# IAM roles and security groups
```

3. **RDS Module (`modules/rds/main.tf`)**:
```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Allow database access from EKS cluster"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-db"
  allocated_storage      = var.allocated_storage
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = var.postgres_version
  instance_class         = var.instance_class
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = "default.postgres13"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  skip_final_snapshot    = true
  multi_az               = var.multi_az

  tags = {
    Name = "${var.project_name}-db"
  }
}
```

4. **EC2 Module (`modules/ec2/main.tf`)**:
```hcl
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "Allow SSH and outbound access"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

resource "aws_instance" "main" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.ec2.id]

  root_block_device {
    volume_size = var.root_volume_size
  }

  tags = {
    Name = "${var.project_name}-ec2"
  }
}
```

## Step 3: Dockerization

### Backend Dockerfile

The backend uses a multi-stage Dockerfile to optimize the build process and reduce the final image size:

```Dockerfile
# Build stage
FROM python:3.11-alpine AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    postgresql-client \
    curl \
    libffi-dev \
    bash \
    netcat-openbsd

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Create media and static directories
RUN mkdir -p /app/media /app/staticfiles

# Runtime stage
FROM python:3.11-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    netcat-openbsd \
    bash \
    curl

# Copy only necessary files from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

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

### Frontend Dockerfile

The frontend uses a multi-stage Dockerfile with Node.js for building and Nginx for serving the application:

```Dockerfile
# Build stage
FROM node:20-alpine AS builder

# Set work directory
WORKDIR /app

# Install necessary dependencies for crypto and build
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with specific versions for production
RUN npm ci --only=production && \
    npm install -D terser@latest

# Copy project files
COPY . .

# Build the project with production optimization
RUN npm run build && \
    # Clean up unnecessary files
    rm -rf node_modules && \
    rm -rf src && \
    rm -rf public && \
    rm -rf .next

# Second stage - Production
FROM nginx:alpine

# Add security headers and remove unnecessary files
RUN apk add --no-cache tzdata && \
    rm -rf /etc/nginx/conf.d/* && \
    rm -rf /usr/share/nginx/html/*

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make the env script executable
COPY env.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

# Handle www-data user/group properly (Alpine specific)
RUN grep -q "^www-data:" /etc/group || addgroup -g 82 www-data && \
    grep -q "^www-data:" /etc/passwd || adduser -D -H -u 1000 -s /bin/sh -G www-data www-data && \
    chown -R www-data:www-data /var/cache/nginx && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /etc/nginx/conf.d && \
    chown -R www-data:www-data /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R www-data:www-data /var/run/nginx.pid

# Switch to non-root user
USER www-data

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Step 4: Docker Compose for Local Development

The project uses Docker Compose for local development with the following configuration:

```yaml
services:
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    env_file: 
      - ./.env
    environment:
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DJANGO_SUPERUSER_USERNAME=${ADMIN_USERNAME}
      - DJANGO_SUPERUSER_EMAIL=${ADMIN_EMAIL}
      - DJANGO_SUPERUSER_PASSWORD=${ADMIN_PASSWORD}
      - DJANGO_DEBUG=${DEBUG}
      - DJANGO_ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - LOAD_INITIAL_DATA=True
      - API_BASE_URL=${API_BASE_URL}
    volumes:
      - ./apps/backend:/app
      - ./apps/backend/media:/app/media
      - static_volume:/app/staticfiles
    ports:
      - '8000:8000'
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network
    dns:
      - 8.8.8.8
      - 8.8.4.4
      - 1.1.1.1
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8000/health/']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    env_file: .env
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
      - VITE_API_URL=${VITE_API_URL}
      - VITE_MEDIA_URL=${VITE_MEDIA_URL}
      - VITE_WEATHER_API_KEY=${VITE_WEATHER_API_KEY}
      - VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}
      - VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}
      - VITE_GOOGLE_CLOUD_VISION_API_KEY=${VITE_GOOGLE_CLOUD_VISION_API_KEY}
    ports:
      - '3000:80'
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  db:
    image: postgres:13-alpine
    env_file: .env
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    networks:
      - app-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  media_volume:
  static_volume:
```

## Step 5: CI/CD Pipeline with GitHub Actions

### Backend and Frontend Build Workflow

Create `.github/workflows/docker-build.yml` in the Bonsai application repository:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push backend
        uses: docker/build-push-action@v2
        with:
          context: ./backend
          push: ${{ github.event_name != 'pull_request' }}
          tags: ghcr.io/${{ github.repository }}/backend:${{ github.sha }},ghcr.io/${{ github.repository }}/backend:latest
  
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push frontend
        uses: docker/build-push-action@v2
        with:
          context: ./frontend
          push: ${{ github.event_name != 'pull_request' }}
          tags: ghcr.io/${{ github.repository }}/frontend:${{ github.sha }},ghcr.io/${{ github.repository }}/frontend:latest
```

### Infrastructure Workflow

Create `.github/workflows/terraform.yml` in the infrastructure repository:

```yaml
name: Terraform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
        
      - name: Terraform Init
        run: terraform init
        working-directory: ./environments/production
        
      - name: Terraform Format
        run: terraform fmt -check
        working-directory: ./environments/production
        
      - name: Terraform Plan
        run: terraform plan
        working-directory: ./environments/production
        
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve
        working-directory: ./environments/production
```

### Deployment Workflow

Create `.github/workflows/deploy.yml` in the deployment repository:

```yaml
name: Deploy to Kubernetes

on:
  workflow_run:
    workflows: ["Build and Push Docker Images"]
    types:
      - completed
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name bonsai-cluster --region us-east-1
        
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/secrets.yaml
          kubectl apply -f k8s/configmap.yaml
          kubectl apply -f k8s/storage.yaml
          kubectl apply -f k8s/deployments/
          kubectl apply -f k8s/services/
          kubectl apply -f k8s/ingress.yaml
```

## Step 6: Kubernetes Configuration

Create the following files in the `bonsai-deployment/k8s/` directory:

### Namespace and Resource Quota

`namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: bonsai
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: bonsai-quota
  namespace: bonsai
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
```

### ConfigMap

`configmap.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bonsai-config
  namespace: bonsai
data:
  DEBUG: "False"
  ALLOWED_HOSTS: "bonsai.example.com,localhost"
  DATABASE_HOST: "your-rds-instance-endpoint.us-east-1.rds.amazonaws.com"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "bonsai"
```

### Secrets

`secrets.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: bonsai-secrets
  namespace: bonsai
type: Opaque
data:
  DATABASE_USER: <base64-encoded-value>
  DATABASE_PASSWORD: <base64-encoded-value>
  SECRET_KEY: <base64-encoded-value>
```

### Storage

`storage.yaml`:
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: bonsai-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
allowVolumeExpansion: true
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: bonsai-media-pvc
  namespace: bonsai
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: bonsai-storage
  resources:
    requests:
      storage: 5Gi
```

### Backend Deployment

`deployments/backend.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bonsai-backend
  namespace: bonsai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bonsai-backend
  template:
    metadata:
      labels:
        app: bonsai-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/yourusername/bonsai/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: bonsai-config
        - secretRef:
            name: bonsai-secrets
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "500m"
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 5
        volumeMounts:
        - name: media-volume
          mountPath: /app/media
      volumes:
      - name: media-volume
        persistentVolumeClaim:
          claimName: bonsai-media-pvc
```

### Frontend Deployment

`deployments/frontend.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bonsai-frontend
  namespace: bonsai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bonsai-frontend
  template:
    metadata:
      labels:
        app: bonsai-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/yourusername/bonsai/frontend:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: 512Mi
          requests:
            cpu: "250m"
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Services

`services/backend.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: bonsai-backend
  namespace: bonsai
spec:
  selector:
    app: bonsai-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

`services/frontend.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: bonsai-frontend
  namespace: bonsai
spec:
  selector:
    app: bonsai-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### Ingress

`ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bonsai-ingress
  namespace: bonsai
  annotations:
    kubernetes.io/ingress.class: "nginx"
spec:
  rules:
  - host: bonsai.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: bonsai-backend
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bonsai-frontend
            port:
              number: 80
```

## Step 7: Pipeline Optimization and Monitoring

### CloudWatch Monitoring

Add a CloudWatch module to your infrastructure code:

`modules/monitoring/main.tf`:
```hcl
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EKS", "cluster_failed_node_count", "ClusterName", aws_eks_cluster.main.name]
          ]
          period = 300
          stat   = "Maximum"
          region = var.aws_region
          title  = "EKS Failed Node Count"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.main.id]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS CPU Utilization"
        }
      }
    ]
  })
}

resource "aws_cloudwatch_metric_alarm" "node_cpu_alarm" {
  alarm_name          = "${var.project_name}-node-cpu-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 50
  alarm_description   = "This metric checks if EC2 CPU utilization exceeds 50%"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions = {
    InstanceId = aws_instance.main.id
  }
}

resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
```

### Automated Backup Workflow

Create an EventBridge rule for RDS snapshots in your Terraform code:

```hcl
resource "aws_cloudwatch_event_rule" "backup_rule" {
  name                = "${var.project_name}-backup-rule"
  description         = "Trigger RDS snapshot daily at midnight"
  schedule_expression = "cron(0 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "backup_target" {
  rule      = aws_cloudwatch_event_rule.backup_rule.name
  target_id = "TriggerLambdaForBackup"
  arn       = aws_lambda_function.backup_lambda.arn
}

resource "aws_lambda_function" "backup_lambda" {
  filename      = "backup_function.zip"
  function_name = "${var.project_name}-backup"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  timeout       = 60

  environment {
    variables = {
      DB_INSTANCE_ID = aws_db_instance.main.id
    }
  }
}
```

Create a Lambda function that triggers the RDS snapshot:

`backup_function.js`:
```javascript
const AWS = require('aws-sdk');
const rds = new AWS.RDS();

exports.handler = async (event) => {
  const dbInstanceId = process.env.DB_INSTANCE_ID;
  const snapshotId = `${dbInstanceId}-snapshot-${new Date().toISOString().replace(/[^0-9]/g, '')}`;
  
  const params = {
    DBInstanceIdentifier: dbInstanceId,
    DBSnapshotIdentifier: snapshotId
  };
  
  try {
    const result = await rds.createDBSnapshot(params).promise();
    console.log(`Created snapshot: ${snapshotId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Created snapshot: ${snapshotId}` })
    };
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create snapshot' })
    };
  }
};
```

### Backup Cleanup Workflow

Create a GitHub Action for backup cleanup:

`.github/workflows/backup-cleanup.yml`:
```yaml
name: Backup Cleanup

on:
  schedule:
    - cron: '0 3 * * *'  # Run at 3 AM UTC daily

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: List and cleanup old backups
        run: |
          # Get a list of all backups sorted by date
          BACKUPS=$(aws rds describe-db-snapshots --db-instance-identifier bonsai-db --query 'sort_by(DBSnapshots, &SnapshotCreateTime)[*].DBSnapshotIdentifier' --output text)
          
          # Count the total number of backups
          TOTAL=$(echo $BACKUPS | wc -w)
          
          # If we have more than 3 backups, delete the oldest ones
          if [ $TOTAL -gt 3 ]; then
            TO_DELETE=$(($TOTAL - 3))
            for i in $(echo $BACKUPS | tr ' ' '\n' | head -n $TO_DELETE); do
              echo "Deleting old snapshot: $i"
              aws rds delete-db-snapshot --db-snapshot-identifier $i
            done
          else
            echo "Only $TOTAL backups found, nothing to clean up"
          fi
```

### Autoscaling Configuration

Create Horizontal Pod Autoscaler in Kubernetes:

`k8s/autoscaling.yaml`:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bonsai-backend-hpa
  namespace: bonsai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bonsai-backend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

### Load Testing Script

Create a load testing script in the deployment repository:

`scripts/load-test.sh`:
```bash
#!/bin/bash

# Load testing script using Apache Bench
# This will send 10000 requests with 100 concurrent connections

# Install Apache Bench if not already installed
if ! command -v ab &> /dev/null; then
    echo "Apache Bench not found, installing..."
    sudo apt-get update
    sudo apt-get install -y apache2-utils
fi

# Define target URL
TARGET_URL="https://bonsai.example.com/api/plants/"

# Run the test
echo "Starting load test against $TARGET_URL"
echo "Sending 10000 requests with 100 concurrent connections"
ab -n 10000 -c 100 $TARGET_URL

echo "Load test complete"
```

## Step 8: Documentation and Diagrams

### System Architecture Diagram

Create a system architecture diagram using a tool like draw.io or Lucidchart that illustrates:
- AWS infrastructure components (VPC, EKS, RDS, etc.)
- Network flow
- Security groups and access controls
- Kubernetes components

### CI/CD Pipeline Diagram

Create a CI/CD pipeline diagram that illustrates:
- Source code repositories
- Build and test phases
- Deployment workflow
- Monitoring and alerting

### Implementation Guide

Write a comprehensive implementation guide that covers:
- Initial setup instructions
- Infrastructure provisioning process
- Application deployment steps
- Monitoring and maintenance procedures
- Troubleshooting common issues

## Implementation Workflow

### Week 1: Setup and Infrastructure

#### Day 1-2: Repository Setup and Initial Planning
- Fork and set up all repositories
- Create GitHub project board
- Define team roles and responsibilities
- Set up secret management

#### Day 3-5: Terraform Infrastructure
- Develop network module
- Create EKS and RDS modules
- Set up remote state management
- Provision initial infrastructure

### Week 2: Containerization and Local Development

#### Day 1-2: Dockerization
- Create and test backend Dockerfile
- Create and test frontend Dockerfile
- Configure multi-stage builds
- Test images locally

#### Day 3-5: Docker Compose and Local Testing
- Create Docker Compose configuration
- Set up local development environment
- Test application functionality
- Document development workflow

### Week 3: Kubernetes and CI/CD

#### Day 1-3: Kubernetes Configuration
- Create namespace and quota configurations
- Develop deployment and service manifests
- Configure storage and secrets
- Test deployments on Minikube

#### Day 4-5: CI/CD Pipeline
- Set up GitHub Actions workflows
- Configure build and push processes
- Create deployment workflow
- Test end-to-end pipeline

### Week 4: Monitoring, Scaling, and Documentation

#### Day 1-2: Monitoring and Backups
- Configure CloudWatch monitoring
- Set up automated backups
- Implement backup cleanup
- Test alerting system

#### Day 3-4: Auto-scaling and Load Testing
- Configure Horizontal Pod Autoscaler
- Create load testing scripts
- Test auto-scaling functionality
- Optimize resource usage

#### Day 5: Documentation and Presentation
- Complete system documentation
- Create architecture diagrams
- Prepare presentation
- Review and finalize project

## Important Considerations

### Security Best Practices

1. **Secrets Management**:
   - Never commit secrets or credentials to Git repositories
   - Use GitHub Secrets for CI/CD pipelines
   - Store sensitive information in Kubernetes Secrets or AWS Parameter Store
   - Rotate credentials regularly

2. **Network Security**:
   - Use private subnets for databases and internal services
   - Implement security groups with principle of least privilege
   - Enable VPC flow logs for network monitoring
   - Use NetworkPolicies in Kubernetes for pod-to-pod communication

3. **IAM and Access Control**:
   - Create IAM roles with minimal permissions
   - Use RBAC for Kubernetes access control
   - Implement MFA for AWS console access
   - Regularly audit access permissions

### Cost Optimization

1. **Resource Sizing**:
   - Use appropriate instance types for workloads
   - Implement auto-scaling to match demand
   - Set resource requests and limits in Kubernetes

2. **Storage Management**:
   - Configure lifecycle policies for S3 buckets
   - Use gp2 instead of io1/io2 for most workloads
   - Implement storage retention policies

3. **Scheduling and Cleanup**:
   - Consider using Spot Instances for non-critical workloads
   - Implement scheduled scaling for predictable workloads
   - Automate cleanup of test environments

### AWS Region Requirements

1. **Region Selection**:
   - Use us-east-1 as specified in the project requirements
   - Ensure all resources are provisioned in the same region
   - Be aware of service availability in the chosen region

2. **User Configuration**:
   - Use east1-user for all EKS deployments as required
   - Configure proper IAM permissions for this user
   - Document any region-specific considerations

### Kubernetes Considerations

1. **Testing Workflow**:
   - Test all manifests on Minikube before deploying to EKS
   - Use namespaces to isolate testing environments
   - Validate all configurations before applying to production

2. **Storage Configuration**:
   - Pay attention to volume permissions for Storage Classes
   - Test volume expansions before implementing in production
   - Document storage class requirements

3. **Database Migrations**:
   - Handle Django migrations carefully in containers
   - Consider using init containers for migrations
   - Implement proper health checks to prevent premature readiness

## Conclusion

By following this implementation plan, you'll be able to successfully deploy the Bonsai plant care tracking application using modern DevOps practices. The project will demonstrate your team's ability to implement infrastructure as code, containerization, Kubernetes orchestration, CI/CD pipelines, and monitoring solutions.

Remember to communicate regularly with your team, document your progress, and test thoroughly at each stage of the implementation.