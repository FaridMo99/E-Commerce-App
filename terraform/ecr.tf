locals {
  repos = ["shoppi-backend", "shoppi-frontend", "shoppi-nginx"]
}

resource "aws_ecr_repository" "main" {
  for_each             = toset(local.repos)
  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "main_policy" {
  for_each   = toset(local.repos)
  repository = aws_ecr_repository.main[each.value].name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 3 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 3
      }
      action = { type = "expire" }
    }]
  })
}

# has to be same region as apps to stay free so eu-central-1