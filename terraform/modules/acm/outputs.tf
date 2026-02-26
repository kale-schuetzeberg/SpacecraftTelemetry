output "certificate_arn" {
  description = "ACM certificate ARN for spacecraft.nodenavi.com and spacecraft-api.nodenavi.com"
  value       = aws_acm_certificate_validation.main.certificate_arn
}
