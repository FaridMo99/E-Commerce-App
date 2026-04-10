# general env vars
variable "general_env_vars" {
  type = map(string)
  default = {
    environment= "production"
  }
}
resource "aws_ssm_parameter" "environment" {
  for_each = var.general_env_vars
  name        = "/shoppi/general/${each.key}"
  type        = "String"
  value       = each.value
}

# redis env vars
resource "aws_ssm_parameter" "redis_url" {
  name  = "/shoppi/backend/REDIS_URL"
  type  = "SecureString"
  value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379"
}
# db env vars
variable "db_vars" {
  type = map(string)
  sensitive = true
}

resource "aws_ssm_parameter" "db_vars" {
  for_each = var.db_vars
  name        = "/shoppi/db/${each.key}"
  type        = "SecureString"
  value       = each.value
}

resource "aws_ssm_parameter" "database_url" {
  # has a built-in sensitive true
  name  = "/shoppi/backend/DATABASE_URL"
  type  = "SecureString"
  value = "postgresql://${var.db_vars["username"]}:${var.db_vars["password"]}@${aws_db_instance.main.endpoint}/${var.db_vars["db_name"]}"
}

# nginx env vars
variable "nginx_vars" {
  type = map(string)
  default = {
    frontend-domain-name="shoppi.lat"
    backend-domain-name="api.shoppi.lat"
  }
}
resource "aws_ssm_parameter" "nginx_vars" {
  for_each = var.nginx_vars
  name        = "/shoppi/nginx/${each.key}"
  type        = "String"
  value       = each.value
}

# frontend env vars
variable "frontend_vars" {
  type = map(string)
  sensitive = true # marked sensitive for nextjs bff
}
resource "aws_ssm_parameter" "frontend_vars" {
  for_each = var.frontend_vars
  name        = "/shoppi/frontend/${each.key}"
  type        = "String"
  value       = each.value
}

# backend env vars
variable "backend_vars" {
  type = map(string)
  sensitive = true
}
resource "aws_ssm_parameter" "backend_vars" {
  for_each = var.backend_vars
  name        = "/shoppi/backend/${each.key}"
  type        = "SecureString"
  value       = each.value
}