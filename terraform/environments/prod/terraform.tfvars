domain_name                   = "nodenavi.com"
environment                   = "prod"
frontend_bucket_name          = "spacecraft-telemetry-frontend-prod" # TODO: Consider deriving this at runtime "${var.project_name}-frontend-${var.environment}
cloudwatch_log_retention_days = 30
