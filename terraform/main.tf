locals {
  # EKS
  cluster_name = "${var.project_name}-${var.environment}"
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

  project_name = var.project_name
  environment  = var.environment
}

module "eks" {
  source = "./modules/eks"

  eks_kubernetes_version = var.eks_kubernetes_version
  eks_node_instance_type = var.eks_node_instance_type
  eks_node_min           = var.eks_node_min
  eks_node_max           = var.eks_node_max
  eks_node_desired       = var.eks_node_desired
  cluster_name           = local.cluster_name
  subnet_ids             = module.vpc.private_subnet_ids
  cluster_role_arn       = module.iam.cluster_role_arn
  node_role_arn          = module.iam.node_role_arn
  project_name           = var.project_name
  environment            = var.environment
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "s3_cloudfront" {
  source = "./modules/s3-cloudfront"

  frontend_bucket_name = var.frontend_bucket_name
  project_name         = var.project_name
  environment          = var.environment
}