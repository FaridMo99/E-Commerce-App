locals {
  repos = ["shoppi-backend", "shoppi-frontend", "shoppi-nginx"]
}

resource "aws_ecr_repository" "main" {
  for_each             = toset(local.repos)
  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
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

# Github policy
resource "aws_iam_role_policy" "github_ecr_push" {
  name = "shoppi-github-ecr-push-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["ecr:GetAuthorizationToken"]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Effect   = "Allow"
        Resource = [for repo in aws_ecr_repository.main : repo.arn]
      }
    ]
  })
}

# make sure images are in total <=500MB
# has to be same region as apps to stay free so eu-central-1