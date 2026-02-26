output "certificate_arn" {
  description = "ACM certificate ARN covering the frontend and backend subdomains"
  value       = aws_acm_certificate_validation.main.certificate_arn
}
