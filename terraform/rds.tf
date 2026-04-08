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

# needs to be free
# maybe needs iam role to allow ecs to talk with it
# needs to pull the vars from ssm