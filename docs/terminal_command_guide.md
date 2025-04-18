# 🖥️ Ubuntu Terminal Command Guide – Bonsai DevOps Project

A complete and navigable command reference for Docker, AWS ECR, Terraform,
Kubernetes, Minikube, and various development tools for Ubuntu Linux.

---

## 📚 Table of Contents

- [🖥️ Ubuntu Terminal Command Guide – Bonsai DevOps Project](#️-ubuntu-terminal-command-guide--bonsai-devops-project)
  - [📚 Table of Contents](#-table-of-contents)
  - [1. Docker Commands](#1-docker-commands)
  - [2. Docker Compose Commands](#2-docker-compose-commands)
  - [3. AWS CLI \& ECR Commands](#3-aws-cli--ecr-commands)
    - [Install and Configure](#install-and-configure)
    - [AWS Authentication](#aws-authentication)
    - [ECR](#ecr)
    - [IAM \& Info](#iam--info)
  - [4. Terraform Commands](#4-terraform-commands)
  - [5. Kubernetes Commands](#5-kubernetes-commands)
  - [6. Minikube Commands](#6-minikube-commands)
  - [7. GitHub Actions Preparation](#7-github-actions-preparation)
  - [8. General Git Commands](#8-general-git-commands)
  - [9. Project Management](#9-project-management)
  - [10. AWS EKS Commands](#10-aws-eks-commands)
  - [11. AWS RDS Commands](#11-aws-rds-commands)
  - [12. AWS CloudWatch \& Monitoring](#12-aws-cloudwatch--monitoring)
  - [13. Backup \& Automation Commands](#13-backup--automation-commands)
  - [14. Load Testing](#14-load-testing)
  - [15. Troubleshooting](#15-troubleshooting)
  - [16. Django Commands](#16-django-commands)
  - [17. PostgreSQL Database Commands](#17-postgresql-database-commands)
  - [18. React Frontend Commands](#18-react-frontend-commands)
  - [19. Full-Stack Development Commands](#19-full-stack-development-commands)
  - [20. Environment Management](#20-environment-management)
  - [21. Security and Performance Testing](#21-security-and-performance-testing)
  - [22. Kubernetes Manifests Commands](#22-kubernetes-manifests-commands)

---

## 1. Docker Commands

```bash
# Build Docker images
docker build -t bonsai-backend ./backend
docker build -t bonsai-frontend ./frontend

# Run Docker containers
docker run -p 8000:8000 bonsai-backend
docker run -p 3000:80 bonsai-frontend

# List running containers
docker ps
docker ps -a  # Show all containers (including stopped)

# Container management
docker stop <container_id>
docker start <container_id>
docker restart <container_id>
docker rm <container_id>  # Remove container
docker rmi <image_id>     # Remove image

# Tag and push images to ECR
docker tag bonsai-backend:latest <ecr-url>/bonsai-backend:latest
docker tag bonsai-frontend:latest <ecr-url>/bonsai-frontend:latest
docker push <ecr-url>/bonsai-backend:latest
docker push <ecr-url>/bonsai-frontend:latest

# Docker authentication
docker login
docker logout

# View logs
docker logs <container_id>
docker logs -f <container_id>  # Follow log output

# Inspect containers and images
docker inspect <container_id>
docker inspect <image_id>

# Execute commands in running containers
docker exec -it <container_id> /bin/sh
docker exec -it <container_id> bash

# Docker system commands
docker system prune  # Remove unused data
docker system df     # Show docker disk usage

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Comprehensive cleanup (containers, networks, images, build cache)
docker system prune

# Complete cleanup including volumes
docker system prune -a --volumes

# Stop all running containers
docker stop $(docker ps -aq)

# Remove all containers (both stopped and running)
docker rm $(docker ps -aq)

# Remove all Docker images
docker rmi $(docker images -q)

# Verify cleanup (check containers and images)
docker ps -a && echo "---" && docker images
```

---

## 2. Docker Compose Commands

```bash
# Stop everything and rebuild service
docker compose down && docker compose up --build -d

# Build and start services
docker compose up
docker compose up --build  # Rebuild images before starting containers
docker compose up -d       # Run in detached mode

# Stop services
docker compose down
docker compose down -v     # Stop and remove volumes

# Status and logs
docker compose ps          # List containers
docker compose logs -f     # Follow logs
docker compose logs <service_name>

# Manage specific services
docker compose start <service_name>
docker compose stop <service_name>
docker compose restart <service_name>

# Run a command in a service container
docker compose exec <service_name> <command>
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser

# Check configuration and errors
docker compose config      # Validate and view compose file
docker compose events      # Receive events from containers

# Scale services
docker compose up --scale backend=3

# Build specific services
docker compose build <service_name>
```

---

## 3. AWS CLI & ECR Commands

### Install and Configure

```bash
aws configure                      # Set region, keys, and output format
aws configure list                 # Show current config
aws configure set region us-east-1
aws configure set output json
aws configure --profile east1-user # Configure specific profile
```

### AWS Authentication

```bash
# Get temporary credentials
aws sts get-session-token

# Assume a role
aws sts assume-role --role-arn <role-arn> --role-session-name <session-name>

# Verify identity
aws sts get-caller-identity
```

### ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name bonsai-backend
aws ecr create-repository --repository-name bonsai-frontend

# List and describe repositories
aws ecr describe-repositories
aws ecr list-images --repository-name bonsai-backend

# Get repository policy
aws ecr get-repository-policy --repository-name bonsai-backend

# Delete repository
aws ecr delete-repository --repository-name <repo-name> --force

# Tag lifecycle policy
aws ecr put-lifecycle-policy --repository-name bonsai-backend --lifecycle-policy-text file://lifecycle-policy.json
```

### IAM & Info

```bash
aws sts get-caller-identity
aws iam list-users
aws iam list-roles
aws iam create-access-key --user-name east1-user
aws iam list-access-keys --user-name east1-user
aws iam delete-access-key --user-name east1-user --access-key-id <key-id>
```

---

## 4. Terraform Commands

```bash
# Initialization and setup
terraform init                     # Initialize a Terraform project
terraform init -upgrade            # Update providers to latest version

# Planning and applying
terraform plan                     # Show execution plan
terraform plan -var="image_tag=latest" -var="docker_username=your_dockerhub"
terraform plan -out=tfplan         # Save plan to file
terraform apply                    # Apply changes
terraform apply tfplan             # Apply specific plan file
terraform apply -auto-approve      # Apply without confirmation prompt

# State management
terraform state list               # List resources in state
terraform state show <resource>    # Show details of a resource
terraform state pull               # Download remote state to stdout
terraform state push               # Upload local state to remote
terraform state rm <resource>      # Remove resource from state

# Workspace management
terraform workspace list           # List workspaces
terraform workspace new <n>     # Create new workspace
terraform workspace select <n>  # Switch workspace
terraform workspace delete <n>  # Delete workspace

# Validation and formatting
terraform validate                 # Check syntax and consistency
terraform fmt                      # Format configuration files
terraform fmt -recursive           # Format all files in directory tree

# Output and cleanup
terraform output                   # Show output values
terraform output -json             # Output in JSON format
terraform destroy                  # Tear down infrastructure
terraform destroy -target=<resource> # Destroy specific resource

# Import existing resources
terraform import <resource_address> <id>

# Providers and modules
terraform providers                # List providers
terraform get                      # Download and update modules
```

---

## 5. Kubernetes Commands

```bash
# Context and configuration
kubectl config view                # View current kubeconfig
kubectl config get-contexts        # List contexts
kubectl config use-context minikube
kubectl config set-context --current --namespace=<namespace>

# Resource management
kubectl get pods -A                # Get pods from all namespaces
kubectl get all -n <namespace>     # Get all resources in namespace
kubectl get pods -o wide           # Detailed pod information
kubectl get pods --show-labels     # Show pod labels
kubectl get nodes                  # List cluster nodes
kubectl get services
kubectl get deployments
kubectl get namespaces
kubectl get configmaps
kubectl get secrets
kubectl get pv                     # Persistent volumes
kubectl get pvc                    # Persistent volume claims
kubectl get sc                     # Storage classes
kubectl get hpa                    # Horizontal Pod Autoscaler

# Detailed information
kubectl describe pod <pod-name>
kubectl describe node <node-name>
kubectl describe deployment <deployment-name>
kubectl logs <pod-name>
kubectl logs <pod-name> -c <container-name>  # Specific container
kubectl logs -f <pod-name>                   # Follow logs
kubectl exec -it <pod-name> -- /bin/sh
kubectl top pods                             # Show pod resource usage
kubectl top nodes                            # Show node resource usage

# Resource creation and modification
kubectl apply -f <file>.yaml
kubectl apply -f <directory>/                # Apply all YAML files in directory
kubectl create -f <file>.yaml
kubectl delete -f <file>.yaml
kubectl delete pod <pod-name>
kubectl edit deployment <deployment-name>    # Edit with default editor
kubectl scale deployment <n> --replicas=3 # Scale deployment
kubectl rollout status deployment <n>     # Check rollout status
kubectl rollout history deployment <n>    # View rollout history
kubectl rollout undo deployment <n>       # Rollback to previous version

# Port forwarding and networking
kubectl port-forward svc/<service-name> 8000:8000
kubectl port-forward pod/<pod-name> 8000:8000
kubectl expose deployment <n> --port=80 --target-port=8000

# Namespace operations
kubectl create namespace <n>
kubectl delete namespace <n>

# Resource quotas and limits
kubectl create quota <n> --hard=cpu=1,memory=1G,pods=10 -n <namespace>

# Config and secret management
kubectl create configmap <n> --from-file=<file>
kubectl create secret generic <n> --from-literal=key=value
```

---

## 6. Minikube Commands

```bash
# Cluster management
minikube start                    # Start the local cluster
minikube start --memory=4096 --cpus=2  # Start with specific resources
minikube start --driver=docker    # Use Docker driver
minikube status                   # Show cluster status
minikube dashboard                # Launch the UI
minikube pause                    # Pause cluster
minikube unpause                  # Unpause cluster
minikube stop                     # Stop the cluster
minikube delete                   # Delete the cluster

# Add-ons and services
minikube addons list              # List available add-ons
minikube addons enable <addon>    # Enable add-on
minikube addons disable <addon>   # Disable add-on
minikube service list             # List services
minikube service <service-name>   # Open a service in browser
minikube tunnel                   # Create route to services

# Debugging and logs
minikube logs                     # View logs
minikube ssh                      # SSH into minikube VM
minikube ip                       # Get cluster IP

# Images and Docker
minikube image load <image>       # Load local image into minikube
minikube image ls                 # List cached images
minikube docker-env               # Get Docker env variables
eval $(minikube docker-env)       # Configure shell to use minikube's Docker

# Configuration
kubectl config use-context minikube
```

---

## 7. GitHub Actions Preparation

Set the following secrets in your GitHub repository under **Settings > Secrets
and Variables > Actions**:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_TOKEN`
- `KUBECONFIG_DATA` (base64 encoded)
- `RDS_PASSWORD`

Create workflows:

```bash
# Create workflow directories
mkdir -p .github/workflows

# Create workflow files
touch .github/workflows/deploy-ecr.yml
touch .github/workflows/terraform-apply.yml
touch .github/workflows/k8s-deploy.yml
touch .github/workflows/db-backup.yml
```

Example GitHub Actions Commands (CLI):

```bash
# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install -y gh

# Login to GitHub
gh auth login

# Create a secret
gh secret set AWS_ACCESS_KEY_ID --body "your_key_here"

# List secrets
gh secret list

# View workflow runs
gh workflow list
gh run list

# Manually trigger a workflow
gh workflow run deploy-ecr.yml
```

---

## 8. General Git Commands

```bash
# Repository setup
git clone <repo-url>
git clone --branch <branch-name> <repo-url>  # Clone specific branch
cd <repo-name>

# Branch management
git checkout main
git pull
git checkout -b feature/your-feature-name
git branch -a                      # List all branches
git branch -d <branch-name>        # Delete a local branch
git push origin --delete <branch>  # Delete a remote branch
git fetch --prune                  # Remove references to deleted remote branches

# Working with changes
git status                         # View status of working directory
git add .                          # Stage all changes
git add <file>                     # Stage specific file
git commit -m "Your commit message"
git push --set-upstream origin feature/your-feature-name
git push -f                        # Force push (use with caution)

# History and differences
git log                            # View commit history
git log --oneline                  # Compact view of history
git diff                           # View unstaged changes
git diff --staged                  # View staged changes
git diff <commit1>..<commit2>      # Compare commits

# Stashing changes
git stash                          # Stash changes
git stash list                     # List stashes
git stash apply                    # Apply most recent stash
git stash pop                      # Apply and remove most recent stash
git stash drop                     # Delete most recent stash

# Collaboration
git fetch                          # Get latest changes without merging
git merge origin/main              # Merge remote main branch into current branch
git rebase main                    # Rebase current branch on main
git cherry-pick <commit>           # Apply specific commit to current branch

# Tagging
git tag -a v1.0.0 -m "Version 1.0.0"  # Create annotated tag
git push origin v1.0.0                # Push tag to remote
```

---

## 9. Project Management

```bash
# AWS CLI
sudo apt update
sudo apt install -y awscli
# Or for the latest version:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install -y unzip
unzip awscliv2.zip
sudo ./aws/install

# Terraform
sudo apt update
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update
sudo apt install -y terraform

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

# kubectl
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update
sudo apt install -y kubectl

# Docker
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER
# Log out and log back in to apply group changes

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Python & pip
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

# Node.js & npm (Using NodeSource repository for latest version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL client
sudo apt update
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-client-13

# Other useful tools
sudo apt update
sudo apt install -y jq watch

# k9s (Kubernetes CLI UI)
wget https://github.com/derailed/k9s/releases/download/v0.28.2/k9s_Linux_amd64.tar.gz
tar -xf k9s_Linux_amd64.tar.gz
sudo mv k9s /usr/local/bin/
rm k9s_Linux_amd64.tar.gz

# kubectx and kubens (kubectl context and namespace switching)
sudo git clone https://github.com/ahmetb/kubectx /opt/kubectx
sudo ln -s /opt/kubectx/kubectx /usr/local/bin/kubectx
sudo ln -s /opt/kubectx/kubens /usr/local/bin/kubens

# stern (multi-pod log tailing)
wget https://github.com/stern/stern/releases/download/v1.27.0/stern_1.27.0_linux_amd64.tar.gz
tar -xf stern_1.27.0_linux_amd64.tar.gz
sudo mv stern /usr/local/bin/
rm stern_1.27.0_linux_amd64.tar.gz LICENSE
```

---

## 10. AWS EKS Commands

```bash
# Install eksctl (EKS CLI)
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version

# Create EKS cluster
eksctl create cluster \
  --name bonsai-cluster \
  --region us-east-1 \
  --nodegroup-name bonsai-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 4

# Get EKS clusters
eksctl get cluster

# Delete EKS cluster
eksctl delete cluster --name bonsai-cluster --region us-east-1

# Update kubeconfig for EKS
aws eks update-kubeconfig --name bonsai-cluster --region us-east-1

# EKS authentication
aws eks get-token --cluster-name bonsai-cluster --region us-east-1

# Manage EKS nodegroups
eksctl create nodegroup \
  --cluster bonsai-cluster \
  --region us-east-1 \
  --name bonsai-nodes-extra \
  --node-type t3.medium \
  --nodes 2

eksctl delete nodegroup --cluster bonsai-cluster --name bonsai-nodes --region us-east-1

# List nodegroups
eksctl get nodegroup --cluster bonsai-cluster --region us-east-1

# Get EKS updates
eksctl get addon --cluster bonsai-cluster --region us-east-1
eksctl utils update-cluster-stack --name bonsai-cluster --region us-east-1

# Create IAM OIDC provider
eksctl utils associate-iam-oidc-provider --cluster bonsai-cluster --region us-east-1 --approve

# Create IAM service account for pods
eksctl create iamserviceaccount \
  --name aws-load-balancer-controller \
  --namespace kube-system \
  --cluster bonsai-cluster \
  --region us-east-1 \
  --attach-policy-arn arn:aws:iam::111122223333:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve
```

---

## 11. AWS RDS Commands

```bash
# Create RDS instance (CLI)
aws rds create-db-instance \
  --db-instance-identifier bonsai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 13.7 \
  --master-username admin \
  --master-user-password your_password \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --region us-east-1

# Describe RDS instances
aws rds describe-db-instances --db-instance-identifier bonsai-db

# List all DB instances
aws rds describe-db-instances --query "DBInstances[*].DBInstanceIdentifier"

# Create DB snapshot
aws rds create-db-snapshot \
  --db-snapshot-identifier bonsai-snapshot-$(date +%Y-%m-%d-%H-%M) \
  --db-instance-identifier bonsai-db

# List snapshots
aws rds describe-db-snapshots --db-instance-identifier bonsai-db

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier bonsai-db-restored \
  --db-snapshot-identifier bonsai-snapshot-2023-01-01

# Modify RDS instance
aws rds modify-db-instance \
  --db-instance-identifier bonsai-db \
  --backup-retention-period 14 \
  --apply-immediately

# Delete RDS instance
aws rds delete-db-instance \
  --db-instance-identifier bonsai-db \
  --skip-final-snapshot

# Connect to PostgreSQL RDS
psql -h bonsai-db.xxxxxxx.us-east-1.rds.amazonaws.com -U admin -d postgres

# Export DB to file
pg_dump -h bonsai-db.xxxxxxx.us-east-1.rds.amazonaws.com -U admin -d bonsai > backup.sql

# Import DB from file
psql -h bonsai-db.xxxxxxx.us-east-1.rds.amazonaws.com -U admin -d bonsai < backup.sql
```

---

## 12. AWS CloudWatch & Monitoring

```bash
# List CloudWatch metrics
aws cloudwatch list-metrics --namespace AWS/RDS

# Get specific metric statistics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=bonsai-db \
  --start-time 2023-01-01T00:00:00Z \
  --end-time 2023-01-02T00:00:00Z \
  --period 3600 \
  --statistics Maximum

# Create CloudWatch alarm
aws cloudwatch put-metric-alarm \
  --alarm-name bonsai-cpu-alarm \
  --alarm-description "Alarm when CPU exceeds 50%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:111122223333:bonsai-alerts

# List alarms
aws cloudwatch describe-alarms --alarm-names bonsai-cpu-alarm

# Delete alarm
aws cloudwatch delete-alarms --alarm-names bonsai-cpu-alarm

# Create SNS topic for notifications
aws sns create-topic --name bonsai-alerts

# Subscribe to topic (email)
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:111122223333:bonsai-alerts \
  --protocol email \
  --notification-endpoint your.email@example.com

# List log groups
aws logs describe-log-groups

# Create log group
aws logs create-log-group --log-group-name /aws/eks/bonsai-cluster/cluster

# Get log events
aws logs get-log-events \
  --log-group-name /aws/eks/bonsai-cluster/cluster \
  --log-stream-name stream_name

# Create dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "BonsaiDashboard" \
  --dashboard-body file://dashboard.json
```

---

## 13. Backup & Automation Commands

```bash
# Create EventBridge rule for daily RDS snapshots
aws events put-rule \
  --name daily-rds-snapshot \
  --schedule-expression "cron(0 0 * * ? *)" \
  --state ENABLED

# Add target to EventBridge rule
aws events put-targets \
  --rule daily-rds-snapshot \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:111122223333:function:CreateRDSSnapshot"

# Create Lambda function for automated backups
aws lambda create-function \
  --function-name CreateRDSSnapshot \
  --runtime python3.9 \
  --role arn:aws:iam::111122223333:role/lambda-rds-snapshot \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://lambda-backup.zip

# List all backups/snapshots
aws rds describe-db-snapshots \
  --snapshot-type automated \
  --db-instance-identifier bonsai-db

# Automation script to clean up old snapshots (shell)
# Save as cleanup-snapshots.sh
#!/bin/bash
# Get current date
current_date=$(date +%s)
# Get list of snapshots
snapshots=$(aws rds describe-db-snapshots \
  --snapshot-type manual \
  --db-instance-identifier bonsai-db \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output text)

# Keep only the 3 most recent snapshots
echo "$snapshots" | sort -k2 -r | tail -n +4 | while read -r id time; do
  echo "Deleting snapshot: $id"
  aws rds delete-db-snapshot --db-snapshot-identifier "$id"
done

# Run script with:
# chmod +x cleanup-snapshots.sh
# ./cleanup-snapshots.sh
```

---

## 14. Load Testing

```bash
# Install k6 (load testing tool)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update
sudo apt install -y k6

# Example k6 script for load testing
cat > load-test.js << EOF
import http from 'k6/http';
import { sleep } from 'k6';

export default function() {
  http.get('http://your-app-service-url/api/endpoint');
  sleep(1);
}
EOF

# Run load test
k6 run --vus 10 --duration 30s load-test.js

# Install Apache Bench (ab)
# Already included in most Linux/macOS

# Run Apache Bench test
ab -n 1000 -c 100 http://your-app-service-url/api/endpoint

# Install hey
wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
chmod +x hey_linux_amd64
sudo mv hey_linux_amd64 /usr/local/bin/hey

# Run hey test
hey -n 1000 -c 100 http://your-app-service-url/api/endpoint

# Monitor HPA during load test
kubectl get hpa -n bonsai-namespace --watch
```

---

## 15. Troubleshooting

```bash
# Docker troubleshooting
docker logs <container_id>
docker inspect <container_id>
docker stats                       # Monitor container resource usage

# Kubernetes troubleshooting
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous # Get logs from previous container
kubectl get pods -o yaml           # Get pod definition in YAML

# Node investigation
kubectl get nodes -o wide
kubectl describe node <node-name>
kubectl top node                   # CPU/memory usage

# Debug using temporary pods
kubectl run debug --rm -i --tty --image=busybox -- sh
kubectl debug pod/<pod-name> -it --image=busybox --target=<container-name>

# Run a debug pod in host namespace
kubectl run debug-host --rm -i --tty --overrides='{"spec":{"hostNetwork":true}}' --image=busybox -- sh

# Network troubleshooting
kubectl run curl --image=curlimages/curl -i --tty -- sh
kubectl exec -it <pod-name> -- curl -v <service-name>:80

# Service debugging
kubectl get endpoints <service-name>

# RDS connection testing
nc -zv bonsai-db.xxxxxxx.us-east-1.rds.amazonaws.com 5432

# Storage troubleshooting
kubectl get pv,pvc
kubectl describe pvc <pvc-name>
kubectl describe storageclass <sc-name>

# Check AWS status
aws health describe-events --region us-east-1
```

---

## 16. Django Commands

```bash
# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Django
pip install django

# Create a new Django project
django-admin startproject backend .

# Create a new app
python manage.py startapp api

# Database migrations
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations

# Create a superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000

# Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic --noinput

# Create fixtures
python manage.py dumpdata auth.user --indent 4 > users.json
python manage.py dumpdata products.product --indent 4 > products.json

# Load fixtures
python manage.py loaddata users.json
python manage.py loaddata products.json

# Test Django app
python manage.py test
python manage.py test api.tests.TestClass

# Check for issues
python manage.py check
python manage.py check --deploy  # Production deployment checks

# Create database connection checker (for Docker)
# Add to a file like wait_for_db.py
'''
import os
import time
import psycopg2

def wait_for_db():
    db_host = os.environ.get('DB_HOST', 'db')
    db_port = os.environ.get('DB_PORT', '5432')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'postgres')
    db_name = os.environ.get('DB_NAME', 'postgres')

    print("Waiting for database...")
    while True:
        try:
            conn = psycopg2.connect(
                dbname=db_name,
                user=db_user,
                password=db_password,
                host=db_host,
                port=db_port
            )
            conn.close()
            print("Database connection established!")
            break
        except psycopg2.OperationalError:
            print("Database not available yet, waiting...")
            time.sleep(1)

if __name__ == "__main__":
    wait_for_db()
'''
# Then run it with:
python wait_for_db.py

# Generate Django secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Django with gunicorn for production
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --access-logfile -
```

---

## 17. PostgreSQL Database Commands

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Connect to specific database
psql -h localhost -U postgres -d bonsai

# Connect to RDS instance
psql -h bonsai-db.xxxxxxx.us-east-1.rds.amazonaws.com -U admin -d bonsai

# Basic PostgreSQL commands (in psql prompt)
\l                # List all databases
\c bonsai         # Connect to 'bonsai' database
\dt               # List all tables
\dt+              # List all tables with descriptions
\d table_name     # Describe table
\du               # List all users/roles
\timing           # Toggle query execution time display
\q                # Quit

# Common psql queries
SELECT version();                        # PostgreSQL version
SELECT current_database();               # Current database
SELECT COUNT(*) FROM auth_user;          # Count users
SELECT datname FROM pg_database;         # List databases

# Database maintenance
VACUUM ANALYZE;                          # Analyze database
ANALYZE auth_user;                       # Analyze specific table
SELECT pg_size_pretty(pg_database_size('bonsai')); # DB size

# Check postgres status
systemctl status postgresql | cat

# Start postgres
sudo systemctl start postgresql

# Access postgres
sudo -u postgres psql

# Create database from command line
sudo -u postgres createdb bonsai
sudo -u postgres createuser bonsai_user

# Grant privileges
psql -U postgres -c "ALTER USER bonsai_user WITH PASSWORD 'new_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE bonsai TO bonsai_user;"

# Backup and restore
pg_dump -h localhost -U postgres -d bonsai > backup.sql
pg_dump -h localhost -U postgres -d bonsai -F c > backup.dump  # Compressed format
pg_restore -h localhost -U postgres -d bonsai backup.dump

# Backup specific tables
pg_dump -h localhost -U postgres -d bonsai -t auth_user -t products_product > tables_backup.sql

# Remote backups (to S3)
pg_dump -h localhost -U postgres -d bonsai | aws s3 cp - s3://bonsai-backups/bonsai-$(date +%Y-%m-%d).sql

# Restore from S3
aws s3 cp s3://bonsai-backups/bonsai-2023-01-01.sql - | psql -h localhost -U postgres -d bonsai

# Get table sizes
psql -U postgres -d bonsai -c "SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size FROM information_schema.tables WHERE table_schema = 'public' ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;"

# Kill all connections to database (for maintenance)
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='bonsai' AND pid <> pg_backend_pid();"

# Database and Table Management
psql -U postgres -c "DROP DATABASE IF EXISTS bonsai;"  # Delete database
psql -U postgres -c "DROP TABLE IF EXISTS users CASCADE;"  # Delete table with dependencies
psql -U postgres -c "TRUNCATE TABLE users CASCADE;"  # Clear table data but keep structure
psql -U postgres -c "ALTER TABLE users RENAME TO customers;"  # Rename table
psql -U postgres -c "ALTER TABLE users ADD COLUMN email VARCHAR(255);"  # Add column
psql -U postgres -c "ALTER TABLE users DROP COLUMN email;"  # Remove column
psql -U postgres -c "ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(100);"  # Change column type

# User and Role Management
psql -U postgres -c "CREATE ROLE bonsai_admin WITH LOGIN PASSWORD 'password';"  # Create role
psql -U postgres -c "ALTER ROLE bonsai_admin WITH SUPERUSER;"  # Grant superuser
psql -U postgres -c "DROP ROLE IF EXISTS bonsai_admin;"  # Delete role
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE bonsai TO bonsai_admin;"  # Grant database privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bonsai_admin;"  # Grant table privileges

# Schema Management
psql -U postgres -c "CREATE SCHEMA bonsai_schema;"  # Create schema
psql -U postgres -c "DROP SCHEMA IF EXISTS bonsai_schema CASCADE;"  # Delete schema
psql -U postgres -c "ALTER SCHEMA public RENAME TO bonsai_schema;"  # Rename schema
psql -U postgres -c "GRANT USAGE ON SCHEMA bonsai_schema TO bonsai_admin;"  # Grant schema usage

# Index Management
psql -U postgres -c "CREATE INDEX idx_users_email ON users(email);"  # Create index
psql -U postgres -c "DROP INDEX IF EXISTS idx_users_email;"  # Delete index
psql -U postgres -c "REINDEX TABLE users;"  # Rebuild index
psql -U postgres -c "CREATE UNIQUE INDEX idx_users_email ON users(email);"  # Create unique index

# Constraint Management
psql -U postgres -c "ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);"  # Add primary key
psql -U postgres -c "ALTER TABLE users ADD CONSTRAINT fk_users_group FOREIGN KEY (group_id) REFERENCES groups(id);"  # Add foreign key
psql -U postgres -c "ALTER TABLE users DROP CONSTRAINT pk_users;"  # Remove constraint
psql -U postgres -c "ALTER TABLE users ADD CONSTRAINT chk_age CHECK (age >= 0);"  # Add check constraint

# View Management
psql -U postgres -c "CREATE VIEW active_users AS SELECT * FROM users WHERE is_active = true;"  # Create view
psql -U postgres -c "DROP VIEW IF EXISTS active_users;"  # Delete view
psql -U postgres -c "ALTER VIEW active_users RENAME TO active_customers;"  # Rename view

# Transaction Management
psql -U postgres -c "BEGIN;"  # Start transaction
psql -U postgres -c "COMMIT;"  # Commit transaction
psql -U postgres -c "ROLLBACK;"  # Rollback transaction

# Performance Monitoring
psql -U postgres -c "SELECT * FROM pg_stat_activity;"  # View active connections
psql -U postgres -c "SELECT * FROM pg_stat_user_tables;"  # View table statistics
psql -U postgres -c "SELECT * FROM pg_stat_user_indexes;"  # View index statistics
psql -U postgres -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"  # Analyze query performance

# Database Maintenance
psql -U postgres -c "VACUUM FULL users;"  # Reclaim space and update statistics
psql -U postgres -c "REINDEX DATABASE bonsai;"  # Rebuild all indexes
psql -U postgres -c "ANALYZE users;"  # Update statistics for query planner
psql -U postgres -c "CHECKPOINT;"  # Force write of dirty buffers to disk

# Backup and Restore with Options
pg_dump -h localhost -U postgres -d bonsai --schema-only > schema.sql  # Backup schema only
pg_dump -h localhost -U postgres -d bonsai --data-only > data.sql  # Backup data only
pg_dump -h localhost -U postgres -d bonsai --exclude-table=users > backup.sql  # Exclude specific table
pg_dump -h localhost -U postgres -d bonsai --inserts > backup.sql  # Use INSERT statements
pg_dump -h localhost -U postgres -d bonsai --column-inserts > backup.sql  # Include column names in INSERTs

# Database Migration
psql -U postgres -c "CREATE DATABASE bonsai_new TEMPLATE bonsai;"  # Create new database from template
psql -U postgres -c "ALTER DATABASE bonsai RENAME TO bonsai_old;"  # Rename database
psql -U postgres -c "ALTER DATABASE bonsai_new RENAME TO bonsai;"  # Rename new database
```

---

## 18. React Frontend Commands

```bash
# Create a new React app
npx create-react-app frontend
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
npm test -- --coverage

# Install common dependencies
npm install axios         # HTTP client
npm install react-router-dom  # Routing
npm install @reduxjs/toolkit react-redux  # State management
npm install bootstrap     # UI framework
npm install formik yup    # Form handling & validation
npm install styled-components  # CSS-in-JS styling

# Create an optimized production build
npm run build

# Analyze bundle size
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'

# Serve production build locally
sudo npm install -g serve
serve -s build -l 3000

# Add environment variables to .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
echo "REACT_APP_DEBUG=true" >> .env

# Eject from create-react-app (use with caution)
npm run eject

# Configure proxy for local development
# Add to package.json:
# "proxy": "http://localhost:8000",

# Linting
npm run lint
npm run lint -- --fix

# Generate React component
mkdir -p src/components/Product
cat > src/components/Product/ProductCard.jsx << EOF
import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>${product.price}</p>
    </div>
  );
};

export default ProductCard;
EOF

# Create React context (for global state without Redux)
cat > src/context/AuthContext.js << EOF
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // API call would go here
      setUser({ username: credentials.username });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
EOF
```

---

## 19. Full-Stack Development Commands

```bash
# Set up both frontend and backend in one repo
mkdir -p bonsai-app/{backend,frontend}

# Initialize backend
cd bonsai-app/backend
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework django-cors-headers psycopg2-binary
django-admin startproject backend .

# Initialize frontend
cd ../frontend
npx create-react-app .

# Configure CORS in Django (in settings.py)
cat >> backend/settings.py << EOF
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
INSTALLED_APPS += ["corsheaders"]
MIDDLEWARE.insert(0, "corsheaders.middleware.CorsMiddleware")
EOF

# Create API endpoint in Django
mkdir -p api
cat > api/views.py << EOF
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
EOF

# Add API URL in Django
cat > api/urls.py << EOF
from django.urls import path
from .views import HealthCheckView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health_check'),
]
EOF

# Add API call in React
cat > frontend/src/api.js << EOF
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health/`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
EOF

# Run both services (two terminals)
# Terminal 1:
cd bonsai-app/backend
source venv/bin/activate
python manage.py runserver

# Terminal 2:
cd bonsai-app/frontend
npm start

# Create database setup script
cat > backend/setup_db.sh << EOF
#!/bin/bash
set -e

echo "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE bonsai_db;"
sudo -u postgres psql -c "CREATE USER bonsai_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "ALTER ROLE bonsai_user SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE bonsai_user SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE bonsai_user SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bonsai_db TO bonsai_user;"

echo "Database setup complete!"
EOF
chmod +x backend/setup_db.sh

# Create production deployment script
cat > deploy.sh << EOF
#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Collecting static files..."
cd backend
source venv/bin/activate
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Starting gunicorn..."
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --daemon

echo "Deployment complete!"
EOF
chmod +x deploy.sh
```

---

## 20. Environment Management

```bash
# Create .env file for Django
cat > backend/.env << EOF
DEBUG=True
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=bonsai_store
DB_USER=bonsai_user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
EOF

# Create .env file for React
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
EOF

# Install python-dotenv for Django
pip install python-dotenv

# Configure Django to use .env file (add to settings.py)
cat >> backend/settings.py << EOF
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}
EOF

# Create environment-specific files
cat > .env.development << EOF
DEBUG=True
SECRET_KEY=dev_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=bonsai_dev
DB_USER=bonsai_user
DB_PASSWORD=dev_password
DB_HOST=localhost
DB_PORT=5432
EOF

cat > .env.testing << EOF
DEBUG=True
SECRET_KEY=test_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=bonsai_test
DB_USER=bonsai_user
DB_PASSWORD=test_password
DB_HOST=localhost
DB_PORT=5432
EOF

cat > .env.production << EOF
DEBUG=False
SECRET_KEY=prod_secret_key_change_me
ALLOWED_HOSTS=yourapp.com,www.yourapp.com
DB_NAME=bonsai_prod
DB_USER=bonsai_user
DB_PASSWORD=prod_password_change_me
DB_HOST=your-db-instance.us-east-1.rds.amazonaws.com
DB_PORT=5432
EOF

# Copy environment file based on environment
cp .env.${ENVIRONMENT:-development} .env

# Create script to load environment variables
cat > load_env.sh << EOF
#!/bin/bash
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}')
fi
EOF
chmod +x load_env.sh

# Source environment variables
source load_env.sh
```

---

## 21. Security and Performance Testing

```bash
# Security checks for Django
pip install django-security
pip install bandit safety

# Run security checks
python manage.py check --deploy
bandit -r backend/

# Check for vulnerable dependencies
safety check

# Create production checklist
cat > production_checklist.md << EOF
# Production Deployment Checklist

## Django Settings
- [ ] Debug mode disabled
- [ ] Secret key changed and secured
- [ ] Allowed hosts properly configured
- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] Secure cookies enabled
- [ ] XSS protection enabled

## Database
- [ ] Strong password set
- [ ] Database backups configured
- [ ] Connection pooling configured

## Static Files
- [ ] Static files properly collected
- [ ] Static files served by Nginx or CDN

## Monitoring
- [ ] Logging configured
- [ ] Error tracking set up
- [ ] Performance monitoring configured

## Security
- [ ] Security headers configured
- [ ] Dependencies up to date
- [ ] Rate limiting implemented
- [ ] Password policies enforced
EOF

# Load testing with Apache Bench
sudo apt install apache2-utils
ab -n 1000 -c 100 http://localhost:8000/api/health/

# Django debug toolbar (for development)
pip install django-debug-toolbar
# Then add to INSTALLED_APPS and configure in settings.py

# Performance profiling
pip install django-silk
# Then add to INSTALLED_APPS and configure in settings.py

# Audit Django models
cat > audit_models.py << EOF
#!/usr/bin/env python
import os
import django
import sys

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.apps import apps

def audit_models():
    print("Model Audit Report")
    print("=================")
    for model in apps.get_models():
        fields = model._meta.fields
        print(f"\nModel: {model.__name__}")
        print(f"App: {model._meta.app_label}")
        print(f"Fields: {len(fields)}")
        print("Field Details:")
        for field in fields:
            print(f" - {field.name}: {field.__class__.__name__}")

if __name__ == "__main__":
    audit_models()
EOF
chmod +x audit_models.py
```

---

## 22. Kubernetes Manifests Commands

```bash
# Create namespace for application
cat > kubernetes/namespace.yaml << EOF
apiVersion: v1
kind: Namespace
metadata:
  name: bonsai-namespace
EOF

# Create resource quota
cat > kubernetes/resourcequota.yaml << EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: bonsai-quota
  namespace: bonsai-namespace
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
    pods: "20"
EOF

# Create ConfigMap for backend
cat > kubernetes/configmap.yaml << EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: bonsai-config
  namespace: bonsai-namespace
data:
  DEBUG: "False"
  ALLOWED_HOSTS: "*.example.com,localhost"
  DB_HOST: "bonsai-db.xxxxxxx.us-east-1.rds.amazonaws.com"
  DB_PORT: "5432"
  DB_NAME: "bonsai"
EOF

# Create Secret for database credentials
cat > kubernetes/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: bonsai-secrets
  namespace: bonsai-namespace
type: Opaque
data:
  db_user: $(echo -n "bonsai_user" | base64)
  db_password: $(echo -n "your_password_here" | base64)
  django_secret_key: $(echo -n "your_django_secret_key" | base64)
EOF

# Create backend deployment
cat > kubernetes/backend-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bonsai-backend
  namespace: bonsai-namespace
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
        image: <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/bonsai-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: bonsai-config
        - secretRef:
            name: bonsai-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 10
EOF

# Create backend service
cat > kubernetes/backend-service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: bonsai-backend
  namespace: bonsai-namespace
spec:
  selector:
    app: bonsai-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
EOF

# Create frontend deployment
cat > kubernetes/frontend-deployment.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bonsai-frontend
  namespace: bonsai-namespace
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
        image: <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/bonsai-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
EOF

# Create frontend service
cat > kubernetes/frontend-service.yaml << EOF
apiVersion: v1
kind: Service
metadata:
  name: bonsai-frontend
  namespace: bonsai-namespace
spec:
  selector:
    app: bonsai-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
EOF

# Create storage class
cat > kubernetes/storage-class.yaml << EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: bonsai-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  fsType: ext4
allowVolumeExpansion: true
EOF

# Create persistent volume claim
cat > kubernetes/persistent-volume-claim.yaml << EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: bonsai-media-pvc
  namespace: bonsai-namespace
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: bonsai-storage
  resources:
    requests:
      storage: 5Gi
EOF

# Create horizontal pod autoscaler
cat > kubernetes/hpa.yaml << EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bonsai-backend-hpa
  namespace: bonsai-namespace
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bonsai-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF

# Apply all Kubernetes configurations
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/resourcequota.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/storage-class.yaml
kubectl apply -f kubernetes/persistent-volume-claim.yaml
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
kubectl apply -f kubernetes/hpa.yaml
```

---

This command guide is your reference for day-to-day development and deployment
of the Bonsai Plant Care App. 🌱
