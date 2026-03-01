variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "frontend_bucket_name" {
  description = "Name of the frontend S3 bucket"
  type        = string
}

variable "domain_name" {
  description = "Root domain name used to look up the Route53 hosted zone"
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
