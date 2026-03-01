output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint URL"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_version" {
  description = "Kubernetes version for the EKS cluster (e.g. 1.35)"
  value       = aws_eks_cluster.main.version
}

output "oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider — used in IAM role trust policies for IRSA"
  value       = aws_iam_openid_connect_provider.main.arn
}

output "oidc_provider_url" {
  description = "Issuer URL of the EKS OIDC provider — used as the condition variable in IAM trust policies"
  value       = aws_iam_openid_connect_provider.main.url
}