locals {
  ecr_repository_name = "${var.project_name}-${var.environment}"
}

resource "aws_ecr_repository" "main" {
  name                 = local.ecr_repository_name
  image_tag_mutability = "IMMUTABLE"
  force_delete         = var.force_delete
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    Name = local.ecr_repository_name
  }
}