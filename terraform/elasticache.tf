resource "aws_elasticache_cluster" "main" {
  cluster_id           = "portfolio-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  security_group_ids   = [aws_security_group.ecs_main_only.id]
}

