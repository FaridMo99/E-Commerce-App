output "vpc_id" {
  value = aws_vpc.main.id
}

output "ecs_ip" {
  value = aws_ecs_cluster.main.ecs_ip
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}