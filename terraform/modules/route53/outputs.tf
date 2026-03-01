output "frontend_url" {
  description = "Public frontend URL"
  value       = "https://${aws_route53_record.main.name}"
}

output "hosted_zone_id" {
  description = "Hosted Zone ID"
  value       = aws_route53_record.main.zone_id
}
