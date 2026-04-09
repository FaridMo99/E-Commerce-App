resource "aws_ecs_task_definition" "app" {
  family = "shoppi-task"

  container_definitions = jsonencode([
    {
      name  = "shoppi-container"
      image = "${aws_ecr_repository.main.repository_url}:latest"
      
      # DIRECT INJECTION (For Endpoints/URLs)
      environment = [
        { name = "DB_HOST",    value = aws_db_instance.main.address },
        { name = "REDIS_HOST", value = aws_elasticache_cluster.main.cache_nodes[0].address },
        { name = "S3_BUCKET",  value = aws_s3_bucket.main.id }
      ],

      # SECRET INJECTION (For Passwords/Keys)
      # AWS will fetch these from SSM and inject them as Env Vars
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_ssm_parameter.db_password.arn
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "main" {
  name = "shoppi-app"
}

# free ec2 mode instance
# uses the specific sg for it
# needs execution role and task role for s3,rds,elasticache
# needs to pull image from ecr
# needs env vars, check how to pull from ssm store