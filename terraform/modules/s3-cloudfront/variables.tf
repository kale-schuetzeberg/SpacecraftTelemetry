variable "frontend_bucket_name" {
  description = "S3 bucket name for React static assets served via CloudFront"
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