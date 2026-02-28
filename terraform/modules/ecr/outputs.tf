output "repository_url" {
  description = "ECR repository URL for pushing Docker images"
  value       = aws_ecr_repository.main.repository_url
}

output "repository_name" {
  description = "ECR repository Name"
  value       = aws_ecr_repository.main.name
}
