variable "ecr_repository_name" {
  description = "ECR repository Name"
  type        = string
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "frontend_bucket_name" {
  description = "Name of the frontend bucket"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for the frontend"
  type        = string
}

variable "route53_hosted_zone_id" {
  description = "Route53 hosted zone ID"
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
