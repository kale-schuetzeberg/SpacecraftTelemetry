variable "domain_name" {
  description = "Root domain name for Route 53 hosted zone lookup"
  type        = string
}

variable "frontend_subdomain" {
  description = "Fully-qualified frontend domain name used as the DNS alias record"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution URL for the frontend"
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