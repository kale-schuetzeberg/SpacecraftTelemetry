# =============================================================================
# DATA SOURCES
# =============================================================================

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

# =============================================================================
# CLUSTER ROLE
# =============================================================================

data "aws_iam_policy_document" "cluster_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cluster" {
  name               = "${var.project_name}-${var.environment}-eks-cluster-role"
  assume_role_policy = data.aws_iam_policy_document.cluster_trust.json
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-cluster-role"
  }
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# =============================================================================
# NODE ROLE
# =============================================================================

data "aws_iam_policy_document" "node_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "node" {
  name               = "${var.project_name}-${var.environment}-eks-node-role"
  assume_role_policy = data.aws_iam_policy_document.node_trust.json
  tags = {
    Name = "${var.project_name}-${var.environment}-eks-node-role"
  }
}

resource "aws_iam_role_policy_attachment" "node_policy" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "node_cni_policy" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "node_ecr_policy" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# =============================================================================
# GITHUB ACTIONS ROLE
# =============================================================================
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.project_name}-${var.environment}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_actions_trust.json
  tags = {
    Name = "${var.project_name}-${var.environment}-github-actions"
  }
}

data "aws_iam_policy_document" "github_actions_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        var.environment == "prod"
        ? "repo:kale-schuetzeberg/SpacecraftTelemetry:ref:refs/heads/main"
        : "repo:kale-schuetzeberg/SpacecraftTelemetry:*"
      ]
    }
  }
}

resource "aws_iam_role_policy" "github_actions" {
  name   = "${var.project_name}-${var.environment}-github-actions"
  role   = aws_iam_role.github_actions.name
  policy = data.aws_iam_policy_document.github_actions_policy.json
}

data "aws_iam_policy_document" "github_actions_policy" {
  # ECR
  statement {
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    # arn:${Partition}:ecr:${Region}:${Account}:repository/${RepositoryName}
    effect    = "Allow"
    actions   = ["ecr:BatchCheckLayerAvailability", "ecr:InitiateLayerUpload", "ecr:UploadLayerPart", "ecr:CompleteLayerUpload", "ecr:PutImage"]
    resources = ["arn:aws:ecr:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:repository/${var.ecr_repository_name}"]
  }

  # EKS
  statement {
    # arn:${Partition}:eks:${Region}:${Account}:cluster/${ClusterName}
    effect    = "Allow"
    actions   = ["eks:DescribeCluster"]
    resources = ["arn:aws:eks:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:cluster/${var.eks_cluster_name}"]
  }

  # S3
  statement {
    # arn:${Partition}:s3:::${BucketName}
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["arn:aws:s3:::${var.frontend_bucket_name}/*"]
  }

  statement {
    # arn:${Partition}:s3:::${BucketName}
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.frontend_bucket_name}"]
  }

  # CloudFront
  statement {
    # arn:${Partition}:cloudfront::${Account}:distribution/${DistributionId}
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = ["arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${var.cloudfront_distribution_id}"]
  }

  # Route 53
  statement {
    # arn:${Partition}:route53:::hostedzone/${Id}
    effect    = "Allow"
    actions   = ["route53:ChangeResourceRecordSets"]
    resources = ["arn:aws:route53:::hostedzone/${var.route53_hosted_zone_id}"]
  }

  statement {
    # arn:${Partition}:route53:::change/${Id}
    effect    = "Allow"
    actions   = ["route53:GetChange"]
    resources = ["arn:aws:route53:::change/*"]
  }

  # ALB
  statement {
    effect    = "Allow"
    actions   = ["elasticloadbalancing:DescribeLoadBalancers"]
    resources = ["*"] # describe actions always require *
  }
}
