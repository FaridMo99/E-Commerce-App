resource "aws_security_group" "ecs_main_only" {
  name   = "rds-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id] # ONLY allow ECS
  }
}

resource "aws_db_instance" "main" {
  allocated_storage    = 20
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  db_name              = "portfolio_db"
  username             = "dbadmin"
  #password             = var.db_password
  vpc_security_group_ids = [aws_security_group.ecs_main_only.id]
  skip_final_snapshot  = true
}