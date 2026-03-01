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

  # Terraform state — S3
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["arn:aws:s3:::spacecraft-telemetry-tfstate-${data.aws_caller_identity.current.account_id}/*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::spacecraft-telemetry-tfstate-${data.aws_caller_identity.current.account_id}"]
  }

  # Terraform state — DynamoDB lock table
  statement {
    effect    = "Allow"
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:DescribeTable"]
    resources = ["arn:aws:dynamodb:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:table/terraform-state-lock"]
  }

  # =============================================================================
  # TERRAFORM INFRASTRUCTURE MANAGEMENT
  # The actions below are required for Terraform to create, read, update, and
  # delete infrastructure resources. Describe/List/Get actions require * because
  # AWS does not support resource-level restrictions on read-only calls.
  # =============================================================================

  # EC2 / VPC
  statement {
    effect = "Allow"
    actions = [
      "ec2:DescribeAvailabilityZones", "ec2:DescribeVpcs", "ec2:DescribeVpcAttribute",
      "ec2:DescribeSubnets", "ec2:DescribeRouteTables", "ec2:DescribeInternetGateways",
      "ec2:DescribeNatGateways", "ec2:DescribeAddresses", "ec2:DescribeAddressesAttribute",
      "ec2:DescribeSecurityGroups", "ec2:DescribeTags",
      "ec2:CreateVpc", "ec2:DeleteVpc", "ec2:ModifyVpcAttribute",
      "ec2:CreateSubnet", "ec2:DeleteSubnet", "ec2:ModifySubnetAttribute",
      "ec2:CreateRouteTable", "ec2:DeleteRouteTable",
      "ec2:CreateRoute", "ec2:DeleteRoute",
      "ec2:AssociateRouteTable", "ec2:DisassociateRouteTable",
      "ec2:CreateInternetGateway", "ec2:DeleteInternetGateway",
      "ec2:AttachInternetGateway", "ec2:DetachInternetGateway",
      "ec2:CreateNatGateway", "ec2:DeleteNatGateway",
      "ec2:AllocateAddress", "ec2:ReleaseAddress",
      "ec2:CreateTags", "ec2:DeleteTags"
    ]
    resources = ["*"]
  }

  # IAM — roles, policies, and OIDC providers for EKS/IRSA
  statement {
    effect = "Allow"
    actions = [
      "iam:GetRole", "iam:CreateRole", "iam:DeleteRole", "iam:UpdateRole",
      "iam:TagRole", "iam:UntagRole", "iam:ListRoleTags",
      "iam:AttachRolePolicy", "iam:DetachRolePolicy", "iam:ListAttachedRolePolicies",
      "iam:PutRolePolicy", "iam:GetRolePolicy", "iam:DeleteRolePolicy", "iam:ListRolePolicies",
      "iam:PassRole", "iam:ListInstanceProfilesForRole",
      "iam:GetOpenIDConnectProvider", "iam:ListOpenIDConnectProviders",
      "iam:CreateOpenIDConnectProvider", "iam:DeleteOpenIDConnectProvider",
      "iam:TagOpenIDConnectProvider", "iam:UntagOpenIDConnectProvider"
    ]
    resources = ["*"]
  }

  # EKS — cluster, node groups, access entries
  statement {
    effect = "Allow"
    actions = [
      "eks:CreateCluster", "eks:DeleteCluster", "eks:UpdateClusterConfig", "eks:UpdateClusterVersion",
      "eks:DescribeCluster", "eks:ListClusters",
      "eks:CreateNodegroup", "eks:DeleteNodegroup", "eks:UpdateNodegroupConfig",
      "eks:UpdateNodegroupVersion", "eks:DescribeNodegroup", "eks:ListNodegroups",
      "eks:CreateAccessEntry", "eks:DeleteAccessEntry", "eks:DescribeAccessEntry",
      "eks:UpdateAccessEntry", "eks:ListAccessEntries",
      "eks:AssociateAccessPolicy", "eks:DisassociateAccessPolicy", "eks:ListAssociatedAccessPolicies",
      "eks:ListAccessPolicies",
      "eks:TagResource", "eks:UntagResource"
    ]
    resources = ["*"]
  }

  # ECR — repository management
  statement {
    effect = "Allow"
    actions = [
      "ecr:DescribeRepositories", "ecr:CreateRepository", "ecr:DeleteRepository",
      "ecr:GetRepositoryPolicy", "ecr:SetRepositoryPolicy", "ecr:DeleteRepositoryPolicy",
      "ecr:PutImageScanningConfiguration", "ecr:PutImageTagMutability",
      "ecr:ListTagsForResource", "ecr:TagResource", "ecr:UntagResource"
    ]
    resources = ["*"]
  }

  # ACM — certificate lifecycle
  statement {
    effect = "Allow"
    actions = [
      "acm:RequestCertificate", "acm:DeleteCertificate", "acm:DescribeCertificate",
      "acm:GetCertificate", "acm:ListCertificates",
      "acm:AddTagsToCertificate", "acm:ListTagsForCertificate", "acm:RemoveTagsFromCertificate"
    ]
    resources = ["*"]
  }

  # Route 53 — hosted zone reads (zone is a data source, records managed above)
  statement {
    effect    = "Allow"
    actions   = ["route53:ListHostedZones", "route53:GetHostedZone", "route53:ListResourceRecordSets", "route53:ListTagsForResource", "route53:ListTagsForResources"]
    resources = ["*"]
  }

  # S3 — frontend bucket management
  statement {
    effect = "Allow"
    actions = [
      "s3:CreateBucket", "s3:DeleteBucket", "s3:HeadBucket",
      "s3:GetBucketPolicy", "s3:PutBucketPolicy", "s3:DeleteBucketPolicy",
      "s3:GetBucketVersioning", "s3:PutBucketVersioning",
      "s3:GetBucketPublicAccessBlock", "s3:PutBucketPublicAccessBlock",
      "s3:GetEncryptionConfiguration", "s3:PutEncryptionConfiguration",
      "s3:GetBucketTagging", "s3:PutBucketTagging", "s3:DeleteBucketTagging",
      "s3:GetBucketAcl", "s3:PutBucketAcl",
      "s3:GetBucketCORS", "s3:GetBucketWebsite", "s3:GetBucketRequestPayment",
      "s3:GetBucketObjectLockConfiguration", "s3:GetLifecycleConfiguration",
      "s3:GetBucketLogging", "s3:GetBucketNotification", "s3:GetAccelerateConfiguration",
      "s3:GetReplicationConfiguration", "s3:ListAllMyBuckets"
    ]
    resources = ["*"]
  }

  # CloudFront — distribution and OAC management
  statement {
    effect = "Allow"
    actions = [
      "cloudfront:GetOriginAccessControl", "cloudfront:CreateOriginAccessControl",
      "cloudfront:DeleteOriginAccessControl", "cloudfront:UpdateOriginAccessControl",
      "cloudfront:ListOriginAccessControls",
      "cloudfront:GetDistribution", "cloudfront:GetDistributionConfig",
      "cloudfront:CreateDistribution", "cloudfront:DeleteDistribution", "cloudfront:UpdateDistribution",
      "cloudfront:ListDistributions",
      "cloudfront:TagResource", "cloudfront:UntagResource", "cloudfront:ListTagsForResource"
    ]
    resources = ["*"]
  }
}
