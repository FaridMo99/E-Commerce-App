resource "aws_ssm_parameter" "db_password" {
  name        = "/prod/db/password"
  description = "Encrypted DB Password"
  type        = "SecureString"
  value       = "CHANGE_ME_IN_CONSOLE" # Best practice: don't store real secrets in code
}
