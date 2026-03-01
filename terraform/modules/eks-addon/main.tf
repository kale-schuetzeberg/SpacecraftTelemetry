# =============================================================================
# ALB CONTROLLER ROLE
# =============================================================================

resource "aws_iam_role" "alb_controller" {
  name               = "${var.project_name}-${var.environment}-alb-controller"
  assume_role_policy = data.aws_iam_policy_document.alb_controller_trust.json
  tags = {
    Name = "${var.project_name}-${var.environment}-alb-controller"
  }
}

data "aws_iam_policy_document" "alb_controller_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.eks_oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(var.eks_oidc_provider_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

resource "aws_iam_role_policy" "alb_controller" {
  name   = "${var.project_name}-${var.environment}-alb-controller"
  role   = aws_iam_role.alb_controller.name
  policy = file("${path.module}/alb-controller-policy.json")
}
