# =============================================================================
# CORE
# =============================================================================

output "aws_region" {
  description = "AWS region resources were deployed into"
  value       = var.aws_region
}

# =============================================================================
# NETWORKING
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

# =============================================================================
# EKS
# =============================================================================

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint URL"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_version" {
  description = "Kubernetes version for the EKS cluster (e.g. 1.35)"
  value       = module.eks.cluster_version
}

# =============================================================================
# ECR
# =============================================================================

output "ecr_repository_url" {
  description = "ECR repository URL for pushing Docker images"
  value       = module.ecr.repository_url
}

# =============================================================================
# S3/CloudFront
# =============================================================================

output "cloudfront_distribution_url" {
  description = "Raw CloudFront hostname (use frontend_url for the public-facing URL)"
  value       = module.s3_cloudfront.distribution_url
}

output "frontend_bucket_name" {
  description = "S3 bucket name for React static assets served via CloudFront"
  value       = module.s3_cloudfront.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.s3_cloudfront.distribution_id
}

# =============================================================================
# ACM
# =============================================================================

output "acm_certificate_arn" {
  description = "ACM certificate ARN covering the frontend and backend subdomains — used by CloudFront and ALB"
  value       = module.acm.certificate_arn
}

# =============================================================================
# Route53
# =============================================================================

output "frontend_url" {
  description = "Public frontend URL"
  value       = module.route53.frontend_url
}

output "hosted_zone_id" {
  description = "Hosted Zone ID"
  value       = module.route53.hosted_zone_id
}

# =============================================================================
# IAM
# =============================================================================

output "github_actions_role_arn" {
  description = "IAM role ARN assumed by GitHub Actions via OIDC"
  value       = module.iam.github_actions_role_arn
}

output "alb_controller_role_arn" {
  description = "IAM role ARN for the AWS Load Balancer Controller — used by the deploy pipeline Helm install"
  value       = module.eks-addon.alb_controller_role_arn
}
