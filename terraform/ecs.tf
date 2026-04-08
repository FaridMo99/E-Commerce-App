resource "aws_security_group" "ecs_sg" {
  name        = "ecs-app-sg"
  description = "Allow HTTPS inbound"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # Required to pull Docker images from ECR
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_cluster" "main" {
  name = "portfolio-cluster"
}