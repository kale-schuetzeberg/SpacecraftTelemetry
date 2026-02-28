locals {
  group_name = "${var.project_name}-${var.environment}-nodes"
}

resource "aws_eks_cluster" "main" {
  name     = var.eks_cluster_name
  version  = var.kubernetes_version
  role_arn = var.cluster_role_arn

  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
  }

  upgrade_policy {
    support_type = "STANDARD"
  }

  vpc_config {
    subnet_ids = var.private_subnet_ids
  }

  tags = {
    Name = var.eks_cluster_name
  }
}

resource "aws_eks_node_group" "main" {
  cluster_name    = var.eks_cluster_name
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

# =============================================================================
# GITHUB ACTIONS EKS ACCESS
# =============================================================================

resource "aws_eks_access_entry" "github_actions" {
  cluster_name  = aws_eks_cluster.main.name
  principal_arn = var.github_actions_role_arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "github_actions" {
  cluster_name  = aws_eks_cluster.main.name
  principal_arn = var.github_actions_role_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}

# =============================================================================
# EKS OIDC PROVIDER — allows pods to assume IAM roles (IRSA)
# =============================================================================

data "tls_certificate" "main" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "main" {
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.main.certificates[0].sha1_fingerprint]
  tags = {
    Name = "${var.project_name}-${var.environment}-oidc-eks"
  }
}
