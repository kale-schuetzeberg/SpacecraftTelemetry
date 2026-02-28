variable "kubernetes_version" {
  description = "Kubernetes version for the EKS cluster (e.g. 1.35)"
  type        = string
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS worker nodes (e.g. t3.small)"
  type        = string
}

variable "node_min" {
  description = "The minimum number of EC2 instances EKS will maintain"
  type        = number
}

variable "node_max" {
  description = "The maximum number of EC2 instances EKS will scale to"
  type        = number
}

variable "node_desired" {
  description = "Desired number of EKS worker nodes at steady state"
  type        = number
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "cluster_role_arn" {
  description = "IAM role ARN for the EKS cluster control plane"
  type        = string
}

variable "node_role_arn" {
  description = "IAM role ARN for EKS worker nodes"
  type        = string
}

variable "eks_cluster_name" {
  description = "Name of the EKS Cluster"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev or prod)"
  type        = string
}
