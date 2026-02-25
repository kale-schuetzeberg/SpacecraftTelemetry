terraform {
  backend "s3" {
    bucket         = "spacecraft-telemetry-tfstate-571252911393"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}