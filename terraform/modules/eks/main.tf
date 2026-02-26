locals {
  cluster_name = "${var.project_name}-${var.environment}"
  group_name   = "${var.project_name}-${var.environment}-nodes"
}

resource "aws_eks_cluster" "main" {
  name     = local.cluster_name
  version  = var.kubernetes_version
  role_arn = var.cluster_role_arn
  vpc_config {
    subnet_ids = var.private_subnet_ids
  }

  tags = {
    Name = "${local.cluster_name}-cluster"
  }
}

resource "aws_eks_node_group" "main" {
  cluster_name    = local.cluster_name
  node_group_name = local.group_name
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.private_subnet_ids
  scaling_config {
    desired_size = var.node_desired
    max_size     = var.node_max
    min_size     = var.node_min
  }
  instance_types = [var.node_instance_type]

  tags = {
    Name = local.group_name
  }

  depends_on = [aws_eks_cluster.main]
}