variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
}

variable "instance_types" {
  description = "List of instance types to use for the node group"
  type        = list(string)
}

variable "desired_nodes" {
  description = "Desired number of nodes in the node group"
  type        = number
}

variable "min_nodes" {
  description = "Minimum number of nodes in the node group"
  type        = number
}

variable "max_nodes" {
  description = "Maximum number of nodes in the node group"
  type        = number
}

variable "tags" {
  description = "Default tags for all resources"
  type        = map(string)
  default     = {}
} 