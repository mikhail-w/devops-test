terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  backend "s3" {
    bucket         = "bonsai-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "bonsai-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC and Network Configuration
module "network" {
  source = "./modules/network"
  
  project_name = "bonsai"
  vpc_cidr     = "10.0.0.0/16"
  
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]
  availability_zones   = ["us-east-1a", "us-east-1b"]
}

# EKS Cluster Configuration
module "eks" {
  source = "./modules/eks"
  
  project_name = "bonsai"
  vpc_id       = module.network.vpc_id
  subnet_ids   = module.network.private_subnet_ids
  
  cluster_version = "1.24"
  instance_types  = ["t3.medium"]
  desired_nodes   = 2
  min_nodes       = 1
  max_nodes       = 3
}

# RDS Configuration
module "rds" {
  source = "./modules/rds"
  
  project_name = "bonsai"
  vpc_id       = module.network.vpc_id
  subnet_ids   = module.network.private_subnet_ids
  
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  multi_az           = false
  postgres_version   = "13.7"
  
  db_username = var.db_username
  db_password = var.db_password
}

# EC2 Configuration
module "ec2" {
  source = "./modules/ec2"
  
  project_name = "bonsai"
  vpc_id       = module.network.vpc_id
  subnet_id    = module.network.public_subnet_ids[0]
  
  instance_type = "t3.micro"
  ami_id        = "ami-0c7217cdaf317c4a7"  # Amazon Linux 2 AMI
  key_name      = var.key_name
} 