domain_name                   = "nodenavi.com"
environment                   = "dev"
frontend_bucket_name          = "spacecraft-telemetry-frontend-dev" # TODO: Consider deriving this at runtime "${var.project_name}-frontend-${var.environment}"
cloudwatch_log_retention_days = 7                                   # default