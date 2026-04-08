output "vpc_id" {
  value = aws_vpc.main.id
}

output "ecs_ip" {
  value = aws_ecs_cluster.main.ecs_ip
}