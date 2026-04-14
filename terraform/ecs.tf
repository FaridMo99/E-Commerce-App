resource "aws_ecs_cluster" "main" {
  name = "shoppi-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/shoppi"
  retention_in_days = 1
}

# ecs ami
data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/recommended/image_id"
}

# ecs launch template
resource "aws_launch_template" "ecs_nodes" {
  name_prefix   = "shoppi-node-"
  image_id      = data.aws_ssm_parameter.ecs_ami.value
  instance_type = "t3.micro"

  # The IAM Profile that allows the EC2 to talk to ECS
  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_node_profile.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ecs_sg.id]
  }

  user_data = base64encode(<<-EOF
      #!/bin/bash
      echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config

      sleep 30

      TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
      INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)

      for i in {1..5}; do
        aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id ${aws_eip.shoppi_static_ip.id} --region ${var.aws_region} --allow-reassociation && break || sleep 10
      done
    EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

# ecs auto-scaling-group
resource "aws_autoscaling_group" "ecs" {
  name                = "shoppi-asg"
  vpc_zone_identifier = [aws_subnet.public.id]
  launch_template {
    id      = aws_launch_template.ecs_nodes.id
    version = "$Latest"
  }

  desired_capacity          = 1
  min_size                  = 1
  max_size                  = 1
  health_check_grace_period = 300
  health_check_type         = "EC2"

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}

# ecs connector
resource "aws_ecs_capacity_provider" "main" {
  name = "shoppi-capacity-provider"

  auto_scaling_group_provider {
    auto_scaling_group_arn         = aws_autoscaling_group.ecs.arn
    managed_termination_protection = "DISABLED"
    managed_scaling {
      status          = "ENABLED"
      target_capacity = 100
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.main.name]

  default_capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.main.name
    weight            = 1
  }
}

# ecs task definition
resource "aws_ecs_task_definition" "shoppi_stack" {
  family                   = "shoppi-monolith"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  cpu    = "512"
  memory = "814"


  container_definitions = jsonencode([
    # backend
    {
      name      = "backend"
      image     = "${aws_ecr_repository.main["shoppi-backend"].repository_url}:latest"
      essential = true
      memory    = 300
      portMappings = [{ containerPort = 3001, hostPort = 3001 }]
      environment = [
        { name = "AWS_REGION",   value = var.aws_region},
        { name = "S3_BUCKET_NAME", value = aws_s3_bucket.main.id}]
      secrets = concat(
        [for k in nonsensitive(keys(var.backend_vars)) : { name = k, valueFrom = aws_ssm_parameter.backend_vars[k].arn }],
        [
          { name = "DATABASE_URL", valueFrom = aws_ssm_parameter.database_url.arn },
          { name = "REDIS_URL",    valueFrom = aws_ssm_parameter.redis_url.arn },
        ]
      )
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.ecs.name
          "awslogs-region" = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    },

    # frontend
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.main["shoppi-frontend"].repository_url}:latest"
      essential = true
      memory    = 450
      portMappings = [{ containerPort = 3000, hostPort = 3000 }]
      secrets = concat([for k in nonsensitive(keys(var.frontend_vars)) : { name = k, valueFrom = aws_ssm_parameter.frontend_vars[k].arn }])
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.ecs.name
          "awslogs-region" = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    },

    # nginx
    {
      name      = "nginx"
      image     = "${aws_ecr_repository.main["shoppi-nginx"].repository_url}:latest"
      essential = true
      memory    = 64
      portMappings = [{ containerPort = 80, hostPort = 80 }, { containerPort = 443, hostPort = 443 }]
      secrets = concat([for k in nonsensitive(keys(var.nginx_private_vars)) : { name = k, valueFrom = aws_ssm_parameter.nginx_private_vars[k].arn }])
      environment = concat(
        [{ name  = "ENV", value = var.general_env_vars["environment"] }],
        [for k, v in aws_ssm_parameter.nginx_public_vars : { name = k, value = v.value }]
      )
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group" = aws_cloudwatch_log_group.ecs.name
          "awslogs-region" = var.aws_region
          "awslogs-stream-prefix" = "nginx"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "main" {
  name            = "shoppi-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.shoppi_stack.arn
  desired_count   = 1

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.main.name
    weight            = 1
  }

  network_configuration {
    subnets         = [aws_subnet.public.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }
}