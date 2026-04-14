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
  value = "redis://${aws_elasticache_cluster.main.cache_nodes[0].address}:6379"
}
# db env vars
variable "db_vars" {
  type = map(string)
  sensitive = true
}

resource "aws_ssm_parameter" "db_vars" {
  for_each = nonsensitive(toset(keys(var.db_vars)))
  name        = "/shoppi/db/${each.key}"
  type        = "SecureString"
  value       = var.db_vars[each.key]
}

resource "aws_ssm_parameter" "database_url" {
  # has a built-in sensitive true
  name  = "/shoppi/backend/DATABASE_URL"
  type  = "SecureString"
  value = "postgresql://${var.db_vars["username"]}:${var.db_vars["password"]}@${aws_db_instance.main.endpoint}/${var.db_vars["db_name"]}"
}

# nginx env vars
variable "nginx_public_vars" {
  type = map(string)
  default = {
    FRONTEND_DOMAIN="shoppi.lat"
    BACKEND_DOMAIN="api.shoppi.lat"
    FRONTEND_DOCKER_BASE_URL="127.0.0.1"
    BACKEND_DOCKER_BASE_URL="127.0.0.1"
  }
}
resource "aws_ssm_parameter" "nginx_public_vars" {
  for_each = var.nginx_public_vars
  name        = "/shoppi/nginx/${each.key}"
  type        = "String"
  value       = each.value

  overwrite = true
}

variable "nginx_private_vars" {
  type = map(string)
  sensitive = true
}

resource "aws_ssm_parameter" "nginx_private_vars" {
  for_each = nonsensitive(toset(keys(var.nginx_private_vars)))
  name        = "/shoppi/nginx/${each.key}"
  type        = "SecureString"
  value       = var.nginx_private_vars[each.key]
}

# frontend env vars
variable "frontend_vars" {
  type = map(string)
  sensitive = true # marked sensitive for nextjs bff
}

resource "aws_ssm_parameter" "frontend_vars" {
  for_each = nonsensitive(toset(keys(var.frontend_vars)))
  name        = "/shoppi/frontend/${each.key}"
  type        = "String"
  value       = var.frontend_vars[each.key]
}

# backend env vars
variable "backend_vars" {
  type = map(string)
  sensitive = true
}
resource "aws_ssm_parameter" "backend_vars" {
  for_each = nonsensitive(toset(keys(var.backend_vars)))

  name        = "/shoppi/backend/${each.key}"
  type        = "SecureString"
  value       = var.backend_vars[each.key]
}