output "vpc_id" {
  value = aws_vpc.main.id
}

output "ecs_elastic_public_ip" {
  value = aws_eip.shoppi_static_ip.public_ip
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}