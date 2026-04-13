resource "aws_elasticache_subnet_group" "main" {
  name       = "shoppi-cache-subnets"
  subnet_ids = [aws_subnet.public.id]
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "shoppi-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  security_group_ids   = [aws_security_group.elasticache_sg.id]
  subnet_group_name = aws_elasticache_subnet_group.main.name
}