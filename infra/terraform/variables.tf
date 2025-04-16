variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bonsai"
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

variable "key_name" {
  description = "Name of the SSH key pair to use for EC2 instances"
  type        = string
}

variable "tags" {
  description = "Default tags for all resources"
  type        = map(string)
  default = {
    Project     = "bonsai"
    ManagedBy   = "terraform"
    Environment = "production"
  }
} 