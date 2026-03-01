locals {
  frontend_subdomain = var.environment == "prod" ? "spacecraft.${var.domain_name}" : "${var.environment}.spacecraft.${var.domain_name}"
  backend_subdomain  = var.environment == "prod" ? "spacecraft-api.${var.domain_name}" : "${var.environment}.spacecraft-api.${var.domain_name}"
  eks_cluster_name   = "${var.project_name}-${var.environment}"
}

module "vpc" {
  source = "./modules/vpc"

  vpc_cidr          = var.vpc_cidr
  nat_gateway_count = var.nat_gateway_count
  project_name      = var.project_name
  environment       = var.environment
}

module "iam" {
  source = "./modules/iam"

  ecr_repository_name        = module.ecr.repository_name
  eks_cluster_name           = local.eks_cluster_name
  frontend_bucket_name       = module.s3_cloudfront.bucket_name
  cloudfront_distribution_id = module.s3_cloudfront.distribution_id
  route53_hosted_zone_id     = module.route53.hosted_zone_id
  project_name               = var.project_name
  environment                = var.environment
}

module "eks" {
  source = "./modules/eks"

  kubernetes_version      = var.eks_kubernetes_version
  node_instance_type      = var.eks_node_instance_type
  node_min                = var.eks_node_min
  node_max                = var.eks_node_max
  node_desired            = var.eks_node_desired
  private_subnet_ids      = module.vpc.private_subnet_ids
  cluster_role_arn        = module.iam.cluster_role_arn
  node_role_arn           = module.iam.node_role_arn
  github_actions_role_arn = module.iam.github_actions_role_arn
  eks_cluster_name        = local.eks_cluster_name
  project_name            = var.project_name
  environment             = var.environment
}

module "eks-addon" {
  source = "./modules/eks-addon"

  eks_oidc_provider_arn = module.eks.oidc_provider_arn
  eks_oidc_provider_url = module.eks.oidc_provider_url
  project_name          = var.project_name
  environment           = var.environment
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  force_delete = var.environment == "dev"
}

module "acm" {
  source = "./modules/acm"

  domain_name        = var.domain_name
  frontend_subdomain = local.frontend_subdomain
  backend_subdomain  = local.backend_subdomain
  project_name       = var.project_name
  environment        = var.environment
}

module "s3_cloudfront" {
  source = "./modules/s3-cloudfront"

  frontend_bucket_name = var.frontend_bucket_name
  certificate_arn      = module.acm.certificate_arn
  frontend_subdomain   = local.frontend_subdomain
  project_name         = var.project_name
  environment          = var.environment
}

# spacecraft-api.nodenavi.com -> ALB record is managed by the CI/CD pipeline
# (ALB is created by the Kubernetes Load Balancer Controller, not Terraform)
module "route53" {
  source = "./modules/route53"

  domain_name            = var.domain_name
  frontend_subdomain     = local.frontend_subdomain
  cloudfront_domain_name = module.s3_cloudfront.distribution_url
  project_name           = var.project_name
  environment            = var.environment
}
