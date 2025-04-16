variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the RDS instance"
  type        = list(string)
}

variable "eks_security_group_id" {
  description = "Security group ID of the EKS cluster"
  type        = string
}

variable "instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
}

variable "allocated_storage" {
  description = "Allocated storage for the RDS instance in GB"
  type        = number
}

variable "multi_az" {
  description = "Whether to enable Multi-AZ for the RDS instance"
  type        = bool
  default     = false
}

variable "postgres_version" {
  description = "PostgreSQL version to use"
  type        = string
}

variable "db_username" {
  description = "Username for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Default tags for all resources"
  type        = map(string)
  default     = {}
} 