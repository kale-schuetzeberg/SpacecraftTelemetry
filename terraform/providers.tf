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
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.1.1"
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

# =============================================================================
# EKS CLUSTER DATA — used to configure the Helm provider
# aws_eks_cluster fetches the API endpoint and CA certificate
# aws_eks_cluster_auth fetches a short-lived token for authentication
# =============================================================================

data "aws_eks_cluster" "main" {
  name = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "main" {
  name = module.eks.cluster_name
}

# =============================================================================
# HELM PROVIDER — connects to the EKS cluster for installing charts
# =============================================================================

provider "helm" {
  kubernetes = {
    host                   = data.aws_eks_cluster.main.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.main.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}