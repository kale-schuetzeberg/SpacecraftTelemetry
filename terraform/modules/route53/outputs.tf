output "frontend_url" {
  description = "Public frontend URL"
  value       = "https://${aws_route53_record.main.name}"
}
