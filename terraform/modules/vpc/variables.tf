variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "nat_gateway_count" {
  description = "The number of NAT Gateways to deploy"
  type        = number
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev or prod)"
  type        = string
}