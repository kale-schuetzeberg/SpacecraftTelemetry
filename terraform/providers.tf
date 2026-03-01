# =============================================================================
# TERRAFORM VERSION & REQUIRED PROVIDERS
# =============================================================================

terraform {
  required_version = "~> 1.14"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.33"
    }
  }
}

# =============================================================================
# AWS PROVIDER — default region for all resources
# =============================================================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# =============================================================================
# AWS PROVIDER — us-east-1 alias
# ACM certificates used by CloudFront must be created in us-east-1 regardless
# of the primary region. Modules that create these resources use this provider.
# =============================================================================

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}