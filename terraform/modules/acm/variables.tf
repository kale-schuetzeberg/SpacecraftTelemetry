variable "domain_name" {
  description = "Root domain name for ACM certificate"
  type        = string
}

variable "frontend_subdomain" {
  description = "Fully-qualified frontend domain name for ACM certificate"
  type        = string
}

variable "backend_subdomain" {
  description = "Fully-qualified backend domain name for ACM certificate"
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