resource "aws_db_subnet_group" "main" {
  name       = "shoppi-rds-subnets"
  subnet_ids = [aws_subnet.public.id,aws_subnet.public_b.id] 
}

resource "aws_db_instance" "main" {
  allocated_storage    = 20
  max_allocated_storage  = 20
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  db_name                = aws_ssm_parameter.db_vars["db_name"].value
  username               = aws_ssm_parameter.db_vars["username"].value
  password               = aws_ssm_parameter.db_vars["password"].value
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = false
  multi_az               = false
  storage_type           = "gp2"
  skip_final_snapshot  = true # otherwise not free
}