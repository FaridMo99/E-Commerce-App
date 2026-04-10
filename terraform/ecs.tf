resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/shoppi"
  retention_in_days = 2
}

resource "aws_ecs_task_definition" "shoppi_stack" {
  family                   = "shoppi-monolith"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  cpu    = "1024"
  memory = "800"

  container_definitions = jsonencode([
    # backend
    {
      name      = "backend"
      image     = "${aws_ecr_repository.main["shoppi-backend"].repository_url}:latest"
      essential = true
      memory    = 256
      portMappings = [{ containerPort = 3001, hostPort = 3001 }]
      environment = [{ name  = "ENV", value = var.general_env_vars["environment"]},]
      secrets = concat(
        [for k, v in aws_ssm_parameter.backend_vars : { name = k, valueFrom = v.arn }],
        [
          { name = "DATABASE_URL", valueFrom = aws_ssm_parameter.database_url.arn },
          { name = "REDIS_URL",    valueFrom = aws_ssm_parameter.redis_url.arn },
          { name = "AWS_REGION",   valueFrom = var.aws_region},
          { name = "S3_BUCKET_NAME", valueFrom = aws_s3_bucket.main.id}
        ]
      )
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.ecs.name
          "awslogs-region" = "eu-central-1"
          "awslogs-stream-prefix" = "backend"
        }
      }
    },

    # frontend
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.main["shoppi-frontend"].repository_url}:latest"
      essential = true
      memory    = 256
      portMappings = [{ containerPort = 3000, hostPort = 3000 }]
      environment = [{ name  = "ENV", value = var.general_env_vars["environment"]},]
      secrets = concat([for k, v in aws_ssm_parameter.frontend_vars : { name = k, valueFrom = v.arn }])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.ecs.name
          "awslogs-region" = "eu-central-1"
          "awslogs-stream-prefix" = "frontend"
        }
      }
    },

    # nginx
    {
      name      = "nginx"
      image     = "${aws_ecr_repository.main["shoppi-nginx"].repository_url}:latest"
      essential = true
      memory    = 128
      portMappings = [{ containerPort = 80, hostPort = 80 }, { containerPort = 443, hostPort = 443 }]
      environment = [{ name  = "ENV", value = var.general_env_vars["environment"]},]
      secrets = concat([for k, v in aws_ssm_parameter.nginx_vars : { name = k, valueFrom = v.arn }])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.ecs.name
          "awslogs-region" = "eu-central-1"
          "awslogs-stream-prefix" = "nginx"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "main" {
  name = "shoppi-app"
}

# steps
# check because of launch templates and ami what to do

# give domain name (get ip of ec2/give public ip)