variable "frontend_bucket_name" {
  description = "S3 bucket name for React static assets served via CloudFront"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for the frontend subdomain"
  type        = string
}

variable "frontend_subdomain" {
  description = "Fully-qualified frontend domain used as the CloudFront alias"
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

variable "force_destroy" {
  description = "Force delete the S3 bucket even if it contains objects — set true for dev, false for prod"
  type        = bool
  default     = false
}
