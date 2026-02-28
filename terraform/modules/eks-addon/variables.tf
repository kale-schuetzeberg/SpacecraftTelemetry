variable "eks_oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider"
  type        = string
}

variable "eks_oidc_provider_url" {
  description = "Issuer URL of the EKS OIDC provider"
  type        = string
}

variable "eks_cluster_name" {
  description = "Name of the EKS Cluster"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
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
