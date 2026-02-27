output "distribution_url" {
  description = "CloudFront distribution URL for the frontend"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "bucket_name" {
  description = "S3 bucket name for React static assets served via CloudFront"
  value       = aws_s3_bucket.main.bucket
}
