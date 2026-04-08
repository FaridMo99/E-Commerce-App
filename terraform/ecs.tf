resource "aws_ecs_service" "main" {
  name = "shoppi-app"
  
}

# free ec2 mode instance
# uses the specific sg for it
# needs execution role and task role for s3,rds,elasticache
# needs to pull image from ecr
# needs env vars, check how to pull from ssm store
