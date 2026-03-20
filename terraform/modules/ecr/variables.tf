variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev or prod)"
  type        = string
}

variable "force_delete" {
  description = "Force delete the ECR repository even if it contains images — set true for dev, false for prod"
  type        = bool
  default     = false
}