output "alb_controller_role_arn" {
  description = "IAM role ARN assumed by EKS via OIDC"
  value       = aws_iam_role.alb_controller.arn
}