# =============================================================================
# CORE
# =============================================================================

variable "aws_region" {
  description = "AWS region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "spacecraft-telemetry"
}

variable "environment" {
  description = "Deployment environment (dev or prod)"
  type        = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod"
  }
}

# =============================================================================
# NETWORKING
# =============================================================================

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "nat_gateway_count" {
  description = "The number of NAT Gateways to deploy"
  type        = number
  default     = 1
}

# =============================================================================
# EKS
# =============================================================================

variable "eks_kubernetes_version" {
  description = "Kubernetes version for the EKS cluster (e.g. 1.35)"
  type        = string
  default     = "1.35"

  validation {
    condition     = can(regex("^\\d+\\.\\d+$", var.eks_kubernetes_version))
    error_message = "EKS version must be a valid format - majorVersion.minorVersion"
  }
}

variable "eks_node_instance_type" {
  description = "EC2 instance type for EKS worker nodes (e.g. t3.small)"
  type        = string
  default     = "t3.small"
}

variable "eks_node_min" {
  description = "The minimum number of EC2 instances EKS will maintain"
  type        = number
  default     = 1
}

variable "eks_node_max" {
  description = "The maximum number of EC2 instances EKS will scale to"
  type        = number
  default     = 2
}

variable "eks_node_desired" {
  description = "Desired number of EKS worker nodes at steady state"
  type        = number
  default     = 1
}

# =============================================================================
# ECR
# =============================================================================

# N/A

# =============================================================================
# S3/CloudFront
# =============================================================================

variable "frontend_bucket_name" {
  description = "S3 bucket name for React static assets served via CloudFront"
  type        = string
}

# =============================================================================
# Monitoring
# =============================================================================

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 7

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653], var.cloudwatch_log_retention_days)
    error_message = "cloudwatch_log_retention_days must be a valid CloudWatch retention period. Valid values: 1, 3, 5, 7, 14, 30, ..."
  }
}
